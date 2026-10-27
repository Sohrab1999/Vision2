// @vitest-environment node
// ------------------------------------------------------------------
// Task 117 «معلمِ کارنامه» — hermetic /api/exam-review route contract:
//   ① zod: ids/answers trimmed + bounded, length mismatch rejected
//   ② body cap: oversized JSON rejected before parse (withApi)
//   ③ all-or-nothing resolution: one unknown id → honest Persian 400
//   ④ cache hit: same session fingerprint serves the same review, free
//   ⑤ AI path: mocked SDK → strict parse → cached row created → "ai"
//   ⑥ AI unavailable → honest fallback from the REAL digest
//   ⑦ garbage generation is never cached — fallback instead
// ------------------------------------------------------------------

import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";
import type { NextRequest } from "next/server";

const { trackServer, askCompletion } = vi.hoisted(() => ({
  trackServer: vi.fn(),
  askCompletion: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    reviewCache: { findUnique: vi.fn(), upsert: vi.fn() },
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

// hermetic question world — the real banks stay out of the test.
// r403 — the route now reads the WIDE index (teacher-bank.server), so the
// world is pinned into BOTH modules: explain-source.findQuestion (client-safe
// slice) and teacher-bank.server.findQuestionAny (the route's lookup).
const world = vi.hoisted(() => {
  const w = new Map();
  for (const q of [
    { id: "l1:q1", category: "vocab", question: "She ___ to school every day.", options: ["go", "goes", "going", "gone"], answer: 1 },
    { id: "l1:q2", category: "grammar", question: "They ___ football now.", options: ["play", "plays", "are playing", "played"], answer: 2 },
    { id: "l2:q1", category: "vocab-konkuri", question: "The opposite of «arrive» is ___.", options: ["leave", "stay", "come", "wait"], answer: 0 },
  ]) w.set(q.id, q);
  return w;
});

vi.mock("@/lib/teacher-bank.server", () => ({
  findQuestionAny: (id: string) => world.get(id),
}));

import { db } from "@/lib/db";
import { POST } from "@/app/api/exam-review/route";
import { reviewSchema } from "@/lib/api/validate";

interface MockedDb {
  reviewCache: { findUnique: Mock; upsert: Mock };
}
const mockDb = db as unknown as MockedDb;

function postReq(body: unknown, opts: { cl?: string | null } = {}): NextRequest {
  const text = typeof body === "string" ? body : JSON.stringify(body);
  return {
    method: "POST",
    headers: {
      get: (n: string) => {
        const k = n.toLowerCase();
        if (k === "x-forwarded-for") return "10.70.0.1";
        if (k === "content-type") return "application/json";
        if (k === "content-length") return opts.cl !== undefined ? opts.cl : String(text.length);
        return null;
      },
    },
    nextUrl: new URL("http://localhost/api/exam-review"),
    text: async () => text,
  } as unknown as NextRequest;
}

const IDS = ["l1:q1", "l1:q2", "l2:q1"];
const ANS = [1, 0, null]; // 1 correct (q1), 1 wrong (q2), 1 unanswered

const AI_REVIEW =
  "در این جلسه ۱ از ۳ سؤال درست بود و مسیرِ رشدت روشن است.\n" +
  "نقطهٔ قوت: در «واژگان» پاسخِ درستِ تنها سؤالت را گرفتی — دقتِ خوبی است.\n" +
  "تمرینِ پیشنهادی: گرامرِ زمانِ حالِ استمراری را از درس اول مرور کن و به سؤالِ بی‌پاسخ برگرد.";

beforeEach(() => {
  vi.clearAllMocks();
  mockDb.reviewCache.findUnique.mockReset();
  mockDb.reviewCache.upsert.mockReset();
  askCompletion.mockReset();
});

describe("review schema", () => {
  it("trims ids and enforces the 1..40 window + equal lengths", () => {
    const out = reviewSchema.parse({ ids: ["  l1:q1  "], answers: [null] });
    expect(out.ids[0]).toBe("l1:q1");
    expect(reviewSchema.safeParse({ ids: [], answers: [] }).success).toBe(false);
    expect(reviewSchema.safeParse({ ids: IDS, answers: [1] }).success).toBe(false);
    expect(
      reviewSchema.safeParse({ ids: Array.from({ length: 41 }, (_, i) => `q${i}`), answers: Array.from({ length: 41 }, () => null) }).success
    ).toBe(false);
  });

  it("rejects junk answers with the Persian message", () => {
    const bad = reviewSchema.safeParse({ ids: ["l1:q1"], answers: [1.5] });
    expect(bad.success).toBe(false);
    if (!bad.success) {
      expect(bad.error.issues[0].message).toContain("نامعتبر");
    }
  });
});

describe("POST /api/exam-review", () => {
  it("rejects oversized bodies before parsing", async () => {
    const res = await POST(postReq("x".repeat(2048), { cl: "99999" }));
    expect(res.status).toBe(413);
  });

  it("answers 400 honestly when one id is outside the bundled banks", async () => {
    const res = await POST(postReq({ ids: [...IDS, "9:ghost"], answers: [...ANS, null] }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("بانکِ وب‌کتاب");
    expect(askCompletion).not.toHaveBeenCalled();
  });

  it("serves the cached review for the same session pattern — free and identical", async () => {
    mockDb.reviewCache.findUnique.mockResolvedValue({
      key: "l1:q1:1|l1:q2:0|l2:q1:-",
      intro: "Cached verdict.",
      strength: "Cached strength.",
      advice: "Cached advice.",
      source: "ai",
      createdAt: new Date(),
    });
    const res = await POST(postReq({ ids: [...IDS].reverse(), answers: [null, 0, 1] })); // order-insensitive
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.cached).toBe(true);
    expect(body.intro).toBe("Cached verdict.");
    expect(body.source).toBe("ai");
    expect(mockDb.reviewCache.upsert).not.toHaveBeenCalled();
    expect(askCompletion).not.toHaveBeenCalled();
    expect(trackServer).toHaveBeenCalledWith("exam_review_served");
  });

  it("generates via the SDK, parses the three sections and stores once", async () => {
    mockDb.reviewCache.findUnique.mockResolvedValue(null);
    askCompletion.mockResolvedValue({ choices: [{ message: { content: AI_REVIEW } }] });
    mockDb.reviewCache.upsert.mockResolvedValue({});
    const res = await POST(postReq({ ids: IDS, answers: ANS }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.source).toBe("ai");
    expect(body.cached).toBe(false);
    expect(body.intro).toContain("۱ از ۳");
    expect(body.strength).not.toContain("نقطهٔ قوت:"); // marker consumed
    expect(body.advice).toContain("گرامر");
    expect(mockDb.reviewCache.upsert).toHaveBeenCalledTimes(1);
    expect(mockDb.reviewCache.upsert.mock.calls[0][0].create.source).toBe("ai");
    expect(trackServer).toHaveBeenCalledWith("exam_review_generated");
  });

  it("serves the honest fallback built from the REAL digest when the AI is down", async () => {
    mockDb.reviewCache.findUnique.mockResolvedValue(null);
    askCompletion.mockRejectedValue(new Error("sdk down"));
    mockDb.reviewCache.upsert.mockResolvedValue({});
    const res = await POST(postReq({ ids: IDS, answers: ANS }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.source).toBe("fallback");
    expect(body.intro).toContain("۱ از ۳"); // server-computed truth
    expect(body.intro).toContain("۱ سؤال بی‌پاسخ ماند");
    expect(mockDb.reviewCache.upsert.mock.calls[0][0].create.source).toBe("fallback");
    expect(trackServer).toHaveBeenCalledWith("exam_review_fallback");
  });

  it("never caches a garbage generation — falls back instead", async () => {
    mockDb.reviewCache.findUnique.mockResolvedValue(null);
    askCompletion.mockResolvedValue({ choices: [{ message: { content: "بی‌ساختارِ کوتاه." } }] });
    mockDb.reviewCache.upsert.mockResolvedValue({});
    const res = await POST(postReq({ ids: IDS, answers: ANS }));
    const body = await res.json();
    expect(body.source).toBe("fallback");
  });
});
