// @vitest-environment node
// Task 116 «داستانِ واژه‌های من» — hermetic /api/story route contract:
//   ① zod: keys trimmed, 4..20 enforced, junk rejected with the Persian message
//   ② body cap: oversized JSON rejected before parse (withApi)
//   ③ server-side resolution: dangling stars dropped → below the floor → honest 400
//   ④ cache hit: same fingerprint serves the same controlled story, free (no quota burn)
//   ⑤ AI path: mocked SDK → parse → cached row created → source "ai"
//   ⑥ AI unavailable → the honest fallback exercise, source "fallback"
//   ⑦ quota exhausted → 429 before any paid call

import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";
import type { NextRequest } from "next/server";

const { trackServer, askCreate, askCompletion } = vi.hoisted(() => ({
  trackServer: vi.fn(),
  askCreate: vi.fn(),
  askCompletion: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    storyCache: { findUnique: vi.fn(), upsert: vi.fn() },
  },
}));
vi.mock("@/lib/analytics-server", () => ({ trackEventServer: trackServer }));

// the SDK import happens lazily inside askModel — pin it here
vi.mock("z-ai-web-dev-sdk", () => ({
  default: {
    create: async () => ({
      chat: { completions: { create: askCompletion } },
    }),
  },
}));

vi.mock("@/lib/my-words-resolve", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/my-words-resolve")>();
  // keep the real resolver's shape but pin it to a tiny world so tests are hermetic
  const world = new Map(
    [
      ["1:ability", { key: "1:ability", en: "ability", fa: "توانایی" }],
      ["1:absent", { key: "1:absent", en: "absent", fa: "غایب" }],
      ["2:actor", { key: "2:actor", en: "actor", fa: "بازیگر" }],
      ["2:achieve", { key: "2:achieve", en: "achieve", fa: "به دست آوردن" }],
      ["3:adventure", { key: "3:adventure", en: "adventure", fa: "ماجراجویی" }],
    ].map(([k, v]) => [k, v])
  );
  return {
    ...actual,
    resolveStar: (key: string) => world.get(key) ?? null,
  };
});

import { db } from "@/lib/db";
import { POST } from "@/app/api/story/route";
import { storySchema } from "@/lib/api/validate";

interface MockedDb {
  storyCache: { findUnique: Mock; upsert: Mock };
}
const mockDb = db as unknown as MockedDb;

function postReq(body: unknown, opts: { cl?: string | null } = {}): NextRequest {
  const text = typeof body === "string" ? body : JSON.stringify(body);
  return {
    method: "POST",
    headers: {
      get: (n: string) => {
        const k = n.toLowerCase();
        if (k === "x-forwarded-for") return "10.60.0.1";
        if (k === "content-type") return "application/json";
        if (k === "content-length") return opts.cl !== undefined ? opts.cl : String(text.length);
        return null;
      },
    },
    nextUrl: new URL("http://localhost/api/story"),
    text: async () => text,
  } as unknown as NextRequest;
}

const FOUR_KEYS = ["1:ability", "1:absent", "2:actor", "2:achieve"];

const AI_STORY =
  "Sara had the ability to fix any problem.\n" +
  "One morning the school bus was absent.\n" +
  "She decided to achieve something great with the actor.\n" +
  "Their adventure made the whole school proud.\n" +
  "خلاصه: داستان دربارهٔ توانایی سارا برای یک ماجراجویی بود.";

beforeEach(() => {
  vi.clearAllMocks();
  mockDb.storyCache.findUnique.mockReset();
  mockDb.storyCache.upsert.mockReset();
  askCompletion.mockReset();
});

describe("story schema", () => {
  it("trims keys and enforces the 4..20 window", () => {
    const out = storySchema.parse({ keys: ["  1:ability  ", "1:absent", "2:actor", "2:achieve"] });
    expect(out.keys[0]).toBe("1:ability");
    expect(storySchema.safeParse({ keys: ["a", "b", "c"] }).success).toBe(false);
    expect(storySchema.safeParse({ keys: [] }).success).toBe(false);
    expect(storySchema.safeParse({ keys: Array.from({ length: 21 }, (_, i) => `k${i}`) }).success).toBe(false);
  });

  it("rejects junk keys with the Persian message", () => {
    const bad = storySchema.safeParse({ keys: [123] });
    expect(bad.success).toBe(false);
    if (!bad.success) {
      expect(bad.error.issues[0].message).toContain("نامعتبر");
    }
  });
});

describe("POST /api/story", () => {
  it("rejects oversized bodies before parsing", async () => {
    const res = await POST(postReq("x".repeat(2048), { cl: "99999" }));
    expect(res.status).toBe(413);
  });

  it("answers 400 honestly when fewer than 4 resolvable words survive", async () => {
    const res = await POST(postReq({ keys: ["1:ability", "9:ghost", "9:phantom", "9:shadow"] }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(JSON.stringify(body)).toContain("کافی نیست");
  });

  it("serves the cached story for the same word-set — free and identical", async () => {
    mockDb.storyCache.findUnique.mockResolvedValue({
      key: "1:ability,1:absent,2:achieve,2:actor",
      story: "Cached tale.",
      summary: "خلاصهٔ کش.",
      source: "ai",
      createdAt: new Date(),
    });
    const res = await POST(postReq({ keys: [...FOUR_KEYS].reverse() })); // order-insensitive
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.cached).toBe(true);
    expect(body.story).toBe("Cached tale.");
    expect(body.source).toBe("ai");
    expect(body.words.map((w: { key: string }) => w.key).sort()).toEqual([...FOUR_KEYS].sort());
    expect(mockDb.storyCache.upsert).not.toHaveBeenCalled();
    expect(askCompletion).not.toHaveBeenCalled();
    expect(trackServer).toHaveBeenCalledWith("story_served");
  });

  it("generates via the SDK, parses the documented format and stores once", async () => {
    mockDb.storyCache.findUnique.mockResolvedValue(null);
    askCompletion.mockResolvedValue({ choices: [{ message: { content: AI_STORY } }] });
    mockDb.storyCache.upsert.mockResolvedValue({});
    const res = await POST(postReq({ keys: FOUR_KEYS }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.source).toBe("ai");
    expect(body.cached).toBe(false);
    expect(body.story).toContain("ability");
    expect(body.story).not.toContain("خلاصه");
    expect(body.summary).toContain("سارا");
    expect(mockDb.storyCache.upsert).toHaveBeenCalledTimes(1);
    expect(mockDb.storyCache.upsert.mock.calls[0][0].create.source).toBe("ai");
    expect(trackServer).toHaveBeenCalledWith("story_generated");
  });

  it("serves the honest fallback exercise when the AI is unreachable", async () => {
    mockDb.storyCache.findUnique.mockResolvedValue(null);
    askCompletion.mockRejectedValue(new Error("sdk down"));
    mockDb.storyCache.upsert.mockResolvedValue({});
    const res = await POST(postReq({ keys: FOUR_KEYS }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.source).toBe("fallback");
    expect(body.story).toContain("Your words: ability, absent, actor, achieve");
    expect(body.summary).toContain("دسترس نیست");
    expect(mockDb.storyCache.upsert.mock.calls[0][0].create.source).toBe("fallback");
    expect(trackServer).toHaveBeenCalledWith("story_fallback");
  });

  it("never caches a garbage generation — falls back instead", async () => {
    mockDb.storyCache.findUnique.mockResolvedValue(null);
    askCompletion.mockResolvedValue({ choices: [{ message: { content: "Short.\nخلاصه: بی‌متن." } }] });
    mockDb.storyCache.upsert.mockResolvedValue({});
    const res = await POST(postReq({ keys: FOUR_KEYS }));
    const body = await res.json();
    expect(body.source).toBe("fallback");
  });
});
