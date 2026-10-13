// @vitest-environment node
// ------------------------------------------------------------------
// Task 119 «معلمِ هفته» — hermetic /api/week-review route contract:
//   ① zod: bounded ints, the two consistency refines, nulls allowed
//   ② body cap: oversized JSON rejected before parse (withApi)
//   ③ the verdict gate: an empty week → honest Persian 400, no SDK
//   ④ cache hit: same week fingerprint serves the same verdict, free
//   ⑤ AI path: mocked SDK → strict parse → cached row created → "ai"
//   ⑥ AI unavailable → honest fallback from the REAL stats
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
    weekReviewCache: { findUnique: vi.fn(), upsert: vi.fn() },
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

import { db } from "@/lib/db";
import { POST } from "@/app/api/week-review/route";
import { weekReviewSchema } from "@/lib/api/validate";

interface MockedDb {
  weekReviewCache: { findUnique: Mock; upsert: Mock };
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
    nextUrl: new URL("http://localhost/api/week-review"),
    text: async () => text,
  } as unknown as NextRequest;
}

/** a real week: 23 activities = 12+2+5+1+3, 4 duels, trend up */
const WEEK = {
  activities: 23,
  reviews: 12,
  quizzes: 2,
  words: 5,
  dictation: 1,
  rush: 3,
  activeDays: 4,
  goalDays: 3,
  prevActivities: 18,
  bestDay: 12,
  duels: 4,
  duelWins: 3,
  duelBest: 1150,
  thinkAvgMs: 1200,
  quickWeek: true,
  streak: 6,
};

const AI_REVIEW =
  "هفتهٔ پرکار بودی و مسیرت رو به جلو است.\n" +
  "نقطهٔ قوت: «مرور لغت» ستونِ هفته‌ات بود — ۱۲ دور، بیشترین سهم کارنامه.\n" +
  "تمرینِ پیشنهادی: هفتهٔ بعد یک دیکتهٔ کوتاه به روزهایت اضافه کن تا گوشِ زبان هم تمرین شود.";

beforeEach(() => {
  vi.clearAllMocks();
  mockDb.weekReviewCache.findUnique.mockReset();
  mockDb.weekReviewCache.upsert.mockReset();
  askCompletion.mockReset();
});

describe("weekReviewSchema", () => {
  it("accepts the honest week shape and trims nothing (numbers stay numbers)", () => {
    expect(weekReviewSchema.parse(WEEK)).toEqual(WEEK);
  });

  it("rejects junk with the Persian message", () => {
    expect(weekReviewSchema.safeParse({ ...WEEK, activities: -1 }).success).toBe(false);
    expect(weekReviewSchema.safeParse({ ...WEEK, reviews: 1.5 }).success).toBe(false);
    expect(weekReviewSchema.safeParse({ ...WEEK, activeDays: 8 }).success).toBe(false);
    expect(weekReviewSchema.safeParse({ ...WEEK, streak: 3651 }).success).toBe(false);
    const bad = weekReviewSchema.safeParse({ ...WEEK, quickWeek: "yes" });
    expect(bad.success).toBe(false);
    if (!bad.success) expect(bad.error.issues[0].message).toContain("نامعتبر");
  });

  it("enforces internal consistency — the envelope cannot flatter the teacher", () => {
    // activities ≠ the five counters' sum
    const r1 = weekReviewSchema.safeParse({ ...WEEK, activities: 100 });
    expect(r1.success).toBe(false);
    if (!r1.success) expect(r1.error.issues[0].message).toContain("هم‌خوان نیست");
    // more wins than duels
    const r2 = weekReviewSchema.safeParse({ ...WEEK, duelWins: 9 });
    expect(r2.success).toBe(false);
    // no ledger → wins are not checked against a null
    expect(weekReviewSchema.safeParse({ ...WEEK, duels: null, duelWins: 3 }).success).toBe(true);
  });
});

describe("POST /api/week-review", () => {
  it("rejects oversized bodies before parsing", async () => {
    const res = await POST(postReq("x".repeat(2048), { cl: "99999" }));
    expect(res.status).toBe(413);
  });

  it("answers 400 honestly for an empty week — the teacher judges nothing", async () => {
    const empty = {
      activities: 0, reviews: 0, quizzes: 0, words: 0, dictation: 0, rush: 0,
      activeDays: 0, goalDays: 0, prevActivities: 0, bestDay: null,
      duels: null, duelWins: 0, duelBest: 0, thinkAvgMs: null, quickWeek: false, streak: 0,
    };
    const res = await POST(postReq(empty));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("هفتهٔ خالی");
    expect(askCompletion).not.toHaveBeenCalled();
    expect(mockDb.weekReviewCache.upsert).not.toHaveBeenCalled();
  });

  it("serves the cached verdict for the same week shape — free and identical", async () => {
    mockDb.weekReviewCache.findUnique.mockResolvedValue({
      key: "week-v1:activities=23",
      intro: "Cached verdict.",
      strength: "Cached strength.",
      advice: "Cached advice.",
      source: "ai",
      createdAt: new Date(),
    });
    const res = await POST(postReq(WEEK));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.cached).toBe(true);
    expect(body.intro).toBe("Cached verdict.");
    expect(body.source).toBe("ai");
    expect(mockDb.weekReviewCache.upsert).not.toHaveBeenCalled();
    expect(askCompletion).not.toHaveBeenCalled();
    expect(trackServer).toHaveBeenCalledWith("week_review_served");
  });

  it("generates via the SDK, parses the three sections and stores once", async () => {
    mockDb.weekReviewCache.findUnique.mockResolvedValue(null);
    askCompletion.mockResolvedValue({ choices: [{ message: { content: AI_REVIEW } }] });
    mockDb.weekReviewCache.upsert.mockResolvedValue({});
    const res = await POST(postReq(WEEK));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.source).toBe("ai");
    expect(body.cached).toBe(false);
    expect(body.intro).toContain("هفتهٔ پرکار");
    expect(body.strength).not.toContain("نقطهٔ قوت:"); // marker consumed
    expect(body.advice).toContain("دیکتهٔ کوتاه");
    expect(mockDb.weekReviewCache.upsert).toHaveBeenCalledTimes(1);
    expect(mockDb.weekReviewCache.upsert.mock.calls[0][0].create.source).toBe("ai");
    // the prompt carries ONLY the validated aggregates (raw numerals, no raw storage)
    const prompt = String(askCompletion.mock.calls[0][0].messages[1].content);
    expect(prompt).toContain("23");
    expect(prompt).toContain("مرور لغت");
    expect(prompt).not.toContain("dayHistory");
    expect(trackServer).toHaveBeenCalledWith("week_review_generated");
  });

  it("serves the honest fallback built from the REAL stats when the AI is down", async () => {
    mockDb.weekReviewCache.findUnique.mockResolvedValue(null);
    askCompletion.mockRejectedValue(new Error("sdk down"));
    mockDb.weekReviewCache.upsert.mockResolvedValue({});
    const res = await POST(postReq(WEEK));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.source).toBe("fallback");
    expect(body.intro).toContain("۲۳ فعالیت"); // real counts, Persian digits
    expect(body.intro).toContain("۵ فعالیت بیشتر"); // server-derived trend
    expect(mockDb.weekReviewCache.upsert.mock.calls[0][0].create.source).toBe("fallback");
    expect(trackServer).toHaveBeenCalledWith("week_review_fallback");
  });

  it("never caches a garbage generation — falls back instead", async () => {
    mockDb.weekReviewCache.findUnique.mockResolvedValue(null);
    askCompletion.mockResolvedValue({ choices: [{ message: { content: "بی‌ساختارِ کوتاه." } }] });
    mockDb.weekReviewCache.upsert.mockResolvedValue({});
    const res = await POST(postReq(WEEK));
    const body = await res.json();
    expect(body.source).toBe("fallback");
  });
});
