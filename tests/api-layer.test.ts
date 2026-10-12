// Roadmap Step 5 (audit §10 R-3) — tests for the withApi composition
// root and the migrated route shells: one error shape, body caps,
// zod validation, rate limiting, and the sync/explain route contracts.

import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";
import type { NextRequest } from "next/server";
import { withApi, firstIssueMessage } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { statsSchema, ttsSchema, syncSchema, explainSchema } from "@/lib/api/validate";
import { z } from "zod";

// ---- hermetic routes: the prisma handle and analytics sink are mocked ----
vi.mock("@/lib/db", () => ({
  db: {
    learnerSync: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
    explainCache: { findUnique: vi.fn(), upsert: vi.fn() },
    learnerProfile: { findUnique: vi.fn() },
  },
}));
vi.mock("@/lib/analytics-server", () => ({ trackEventServer: vi.fn() }));

import { db } from "@/lib/db";
import { GET as syncGet, POST as syncPost } from "@/app/api/sync/route";
import { POST as explainPost } from "@/app/api/explain/route";
import { POST as statsPost } from "@/app/api/stats/route";

interface MockedDb {
  learnerSync: { findUnique: Mock; create: Mock; update: Mock };
  explainCache: { findUnique: Mock; upsert: Mock };
  learnerProfile: { findUnique: Mock };
}
const mockDb = db as unknown as MockedDb;

/** minimal NextRequest stand-in — only what withApi + routes touch */
function getReq(url: string, ip = "10.50.0.1"): NextRequest {
  return {
    method: "GET",
    headers: { get: (n: string) => (n.toLowerCase() === "x-forwarded-for" ? ip : null) },
    nextUrl: new URL(url),
    text: async () => "",
  } as unknown as NextRequest;
}

function postReq(body: unknown, opts: { cl?: string | null } = {}): NextRequest {
  const text = typeof body === "string" ? body : JSON.stringify(body);
  return {
    method: "POST",
    headers: {
      get: (n: string) =>
        n.toLowerCase() === "content-length" ? (opts.cl === undefined ? String(text.length) : opts.cl) : null,
    },
    nextUrl: new URL("http://local/api/test"),
    text: async () => text,
  } as unknown as NextRequest;
}

async function jsonOf(res: Response): Promise<Record<string, unknown>> {
  return (await res.json()) as Record<string, unknown>;
}

beforeEach(() => {
  vi.clearAllMocks();
});

// ------------------------------------------------------------------
// withApi — the composition root itself
// ------------------------------------------------------------------
describe("withApi — size cap, parse, validation, errors", () => {
  it("rejects an oversized Content-Length at the header, before reading the body", async () => {
    const handler = vi.fn(async () => new Response("ok"));
    const route = withApi({ key: "wl-cap", bodyCap: 100, schema: z.object({ a: z.string() }) }, handler);
    const res = await route(postReq({ a: "x" }, { cl: "999999" }));
    expect(res.status).toBe(413);
    const body = await jsonOf(res);
    expect(body.code).toBe("payload_too_large");
    expect(body.ok).toBe(false);
    expect(handler).not.toHaveBeenCalled();
  });

  it("rejects an oversize chunked body that hides its length (no Content-Length)", async () => {
    const route = withApi({ key: "wl-cap2", bodyCap: 10, schema: z.object({ a: z.string() }) }, async () => new Response("ok"));
    const res = await route(postReq({ a: "x".repeat(500) }, { cl: null }));
    expect(res.status).toBe(413);
    expect((await jsonOf(res)).code).toBe("payload_too_large");
  });

  it("answers non-JSON bodies with the one invalid_json shape", async () => {
    const route = withApi({ key: "wl-json", schema: z.object({ a: z.string() }) }, async () => new Response("ok"));
    const res = await route(postReq("this is not json", { cl: "16" }));
    expect(res.status).toBe(400);
    expect((await jsonOf(res)).code).toBe("invalid_json");
  });

  it("turns zod failures into validation_failed with the schema's Persian message", async () => {
    const schema = z.object({ n: z.number().int().min(0).refine(() => true) }).refine(() => true);
    const route = withApi({ key: "wl-zod", schema }, async () => new Response("ok"));
    const res = await route(postReq({ n: -2 }));
    expect(res.status).toBe(400);
    const body = await jsonOf(res);
    expect(body.code).toBe("validation_failed");
    expect(typeof body.error).toBe("string");
    expect(String(body.error).length).toBeGreaterThan(3);
  });

  it("enforces the rate limit with 429 + Retry-After in the one shape", async () => {
    const route = withApi({ key: "wl-rate", limit: { max: 2 } }, async () => new Response("ok"));
    await route(getReq("http://local/x", "10.60.0.7"));
    await route(getReq("http://local/x", "10.60.0.7"));
    const res = await route(getReq("http://local/x", "10.60.0.7"));
    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBeTruthy();
    expect((await jsonOf(res)).code).toBe("rate_limited");
    // a different ip is untouched
    const other = await route(getReq("http://local/x", "10.60.0.8"));
    expect(other.status).toBe(200);
  });

  it("passes thrown ApiErrors through untouched", async () => {
    const route = withApi({ key: "wl-apierr" }, async () => {
      throw ApiError.notFound("پیدا نشد.");
    });
    const res = await route(getReq("http://local/x"));
    expect(res.status).toBe(404);
    const body = await jsonOf(res);
    expect(body.code).toBe("not_found");
    expect(body.error).toBe("پیدا نشد.");
  });

  it("wraps unexpected failures into a logged 500 server_error", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      const route = withApi({ key: "wl-boom" }, async () => {
        throw new TypeError("boom");
      });
      const res = await route(getReq("http://local/x"));
      expect(res.status).toBe(500);
      expect((await jsonOf(res)).code).toBe("server_error");
      expect(spy).toHaveBeenCalled();
    } finally {
      spy.mockRestore();
    }
  });

  it("delivers typed query params to GET handlers", async () => {
    const route = withApi({ key: "wl-query", query: z.object({ code: z.string().max(4) }) }, async ({ parsed }) => {
      return new Response(JSON.stringify({ got: parsed.code }), { status: 200 });
    });
    const res = await route(getReq("http://local/x?code=AB"));
    expect(res.status).toBe(200);
    expect((await jsonOf(res)).got).toBe("AB");
    const bad = await route(getReq("http://local/x?code=TOOLONG"));
    expect(bad.status).toBe(400);
    expect((await jsonOf(bad)).code).toBe("validation_failed");
  });
});

// ------------------------------------------------------------------
// schema contracts (the wire policy in one place)
// ------------------------------------------------------------------
describe("route schemas — garbage is rejected, real clients pass", () => {
  it("stats: negative / float lesson and non-integer totals fail; lesson 0 (rush/duel) passes", () => {
    expect(statsSchema.safeParse({ userId: "u1", lesson: -3, category: "vocab", total: 10, correct: 5 }).success).toBe(false);
    expect(statsSchema.safeParse({ userId: "u1", lesson: 1.5, category: "vocab", total: 10, correct: 5 }).success).toBe(false);
    expect(statsSchema.safeParse({ userId: "u1", lesson: 0, category: "vocab", total: 10.5, correct: 5 }).success).toBe(false);
    expect(statsSchema.safeParse({ userId: "u1", lesson: 2, category: "vocab", total: 10, correct: 12 }).success).toBe(false);
    const ok = statsSchema.parse({ userId: "u1", lesson: 0, category: "rush", total: 10, correct: 7, score: 120 });
    expect(ok.score).toBe(120);
    expect(statsSchema.safeParse({ userId: "u1", lesson: 0, category: "rush", total: 10, correct: 7, score: -1 }).success).toBe(false);
  });

  it("tts: speed defaults to 0.95 and out-of-range values are rejected", () => {
    expect(ttsSchema.parse({ text: "hello" }).speed).toBe(0.95);
    expect(ttsSchema.safeParse({ text: "hello", speed: 3 }).success).toBe(false);
  });

  it("sync: userId 6..64 and a plain-object data envelope", () => {
    expect(syncSchema.safeParse({ userId: "abc", data: { known: {} } }).success).toBe(false); // too short
    expect(syncSchema.safeParse({ userId: "tester-1", data: "nope" }).success).toBe(false); // not an object
    expect(syncSchema.safeParse({ userId: "tester-1", data: { known: {}, results: {} } }).success).toBe(true);
  });

  it("explain: id is trimmed and bounded", () => {
    expect(explainSchema.parse({ id: "  l1-v1  " }).id).toBe("l1-v1");
    expect(explainSchema.safeParse({ id: "" }).success).toBe(false);
  });

  it("firstIssueMessage surfaces the first issue's Persian message", () => {
    const res = statsSchema.safeParse({ userId: "u1", lesson: -3, category: "vocab", total: 10, correct: 5 });
    expect(firstIssueMessage(res)).toContain("درس");
  });
});

// ------------------------------------------------------------------
// sync route — GET contract + POST snapshot upsert
// ------------------------------------------------------------------
describe("/api/sync route", () => {
  it("GET rejects a malformed code before touching the DB", async () => {
    const res = await syncGet(getReq("http://local/api/sync?code=1O/0"));
    expect(res.status).toBe(400);
    expect((await jsonOf(res)).code).toBe("bad_request");
    expect(mockDb.learnerSync.findUnique).not.toHaveBeenCalled();
  });

  it("GET answers 404 not_found for a well-formed unknown code", async () => {
    mockDb.learnerSync.findUnique.mockResolvedValue(null);
    const res = await syncGet(getReq("http://local/api/sync?code=K7QM-34XP"));
    expect(res.status).toBe(404);
    expect((await jsonOf(res)).code).toBe("not_found");
    expect(mockDb.learnerSync.findUnique).toHaveBeenCalledWith({ where: { code: "K7QM-34XP" } });
  });

  it("POST stores the sanitized snapshot and returns the generated code", async () => {
    mockDb.learnerSync.findUnique.mockResolvedValue(null);
    mockDb.learnerSync.create.mockResolvedValue({
      code: "K7QM-34XP",
      userId: "tester-1",
      data: "{}",
      updatedAt: new Date("2026-01-01T00:00:00Z"),
    });
    const res = await syncPost(postReq({ userId: "tester-1", data: { known: {}, results: {} } }));
    expect(res.status).toBe(200);
    const body = await jsonOf(res);
    expect(body.code).toBe("K7QM-34XP");
    const created = mockDb.learnerSync.create.mock.calls[0][0] as { data: { data: string } };
    expect(created.data.data).toContain("known");
  });

  it("POST rejects a snapshot without the known/results envelope", async () => {
    const res = await syncPost(postReq({ userId: "tester-1", data: { junk: true } }));
    expect(res.status).toBe(400);
    expect((await jsonOf(res)).code).toBe("bad_request");
    expect(mockDb.learnerSync.create).not.toHaveBeenCalled();
  });
});

// ------------------------------------------------------------------
// explain route — server-side question resolution + free cached reads
// ------------------------------------------------------------------
describe("/api/explain route", () => {
  it("POST rejects unknown ids with 404 before any DB or LLM work", async () => {
    const res = await explainPost(postReq({ id: "does-not-exist" }));
    expect(res.status).toBe(404);
    expect((await jsonOf(res)).code).toBe("not_found");
    expect(mockDb.explainCache.findUnique).not.toHaveBeenCalled();
  });

  it("POST serves the cached explanation for free (no generation quota spent)", async () => {
    mockDb.explainCache.findUnique.mockResolvedValue({
      key: "l1-v1",
      explanation: "توضیح ذخیره‌شده",
      source: "ai",
    });
    const res = await explainPost(postReq({ id: "l1-v1" }));
    expect(res.status).toBe(200);
    const body = await jsonOf(res);
    expect(body.cached).toBe(true);
    expect(body.explanation).toBe("توضیح ذخیره‌شده");
  });
});

// ------------------------------------------------------------------
// stats route — validation happens before any auth/DB work
// ------------------------------------------------------------------
describe("/api/stats route", () => {
  it("POST rejects a negative lesson without touching the DB", async () => {
    const res = await statsPost(
      postReq({ userId: "u1", secret: "s", lesson: -3, category: "vocab", total: 10, correct: 5 })
    );
    expect(res.status).toBe(400);
    expect((await jsonOf(res)).code).toBe("validation_failed");
    expect(mockDb.learnerProfile.findUnique).not.toHaveBeenCalled();
  });

  it("POST rejects correct > total without touching the DB", async () => {
    const res = await statsPost(
      postReq({ userId: "u1", secret: "s", lesson: 1, category: "vocab", total: 10, correct: 11 })
    );
    expect(res.status).toBe(400);
    expect((await jsonOf(res)).code).toBe("validation_failed");
    expect(mockDb.learnerProfile.findUnique).not.toHaveBeenCalled();
  });
});
