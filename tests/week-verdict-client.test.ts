// ------------------------------------------------------------------
// Task 124 — قراردادِ خالصِ درخواستِ داوریِ هفته (week-verdict-client).
// قفل می‌شود:
//   ① هرگز throw نمی‌کند — همهٔ شکست‌ها null می‌آیند (شبکه، !ok، بدنِ
//      خراب، فیلدِ ناقص) و تصمیمِ بازگشتِ صادق با فراخوان است
//   ② سه‌گانهٔ intro/strength/advice باید کامل و غیرخالی باشد — یک
//      فیلدِ کم، کلِ پاسخ را باطل می‌کند (هرگز نیم‌داوری رندر نمی‌شود)
//   ③ source فقط با اعلانِ صریحِ «fallback» آفلاین می‌شود — سکوتِ
//      سرور یعنی ai؛ هرگز برعکس نمی‌شود (چیپِ منبع هرگز دروغ نمی‌گوید)
//   ④ cached فقط با trueِ صریح — تولیدِ تازه هرگز «آماده» دیده نمی‌شود
//   ⑤ بدنهٔ POST دقیقاً آمارِ تجمیعی است (هرگز dayHistoryِ خام)
// ------------------------------------------------------------------

import { describe, it, expect, vi } from "vitest";
import { requestWeekVerdict, type WeekVerdictResult } from "@/lib/week-verdict-client";
import type { WeekTeacherStats } from "@/lib/week-teacher";

const stats: WeekTeacherStats = {
  activities: 12,
  reviews: 5,
  quizzes: 3,
  words: 2,
  dictation: 1,
  rush: 1,
  activeDays: 4,
  goalDays: 3,
  prevActivities: 9,
  bestDay: 6,
  duels: 2,
  duelWins: 1,
  duelBest: 800,
  thinkAvgMs: 1400,
  quickWeek: false,
  streak: 6,
};

const okReview = { intro: "مقدمهٔ داوری", strength: "نقطهٔ قوت", advice: "تمرینِ پیشنهادی" };

function okRes(body: unknown): Response {
  return new Response(JSON.stringify(body), { status: 200, headers: { "Content-Type": "application/json" } });
}

describe("week-verdict-client — قراردادِ درخواستِ داوری (Task 124)", () => {
  it("پاسخِ سالم → سه‌گانهٔ کامل + source=ai + cached=false", async () => {
    const doFetch = vi.fn(async () => okRes({ ...okReview }));
    const r = await requestWeekVerdict(stats, doFetch as unknown as typeof fetch);
    expect(r).not.toBeNull();
    expect(r!.review).toEqual(okReview);
    expect(r!.source).toBe("ai");
    expect(r!.cached).toBe(false);
    // بدنهٔ POST فقط آمارِ تجمیعی — همان شکلِ WeekTeacherStats
    const call = (doFetch as ReturnType<typeof vi.fn>).mock.calls[0] as unknown as [string, RequestInit];
    expect(call[0]).toBe("/api/week-review");
    expect(JSON.parse(String(call[1].body))).toEqual(stats);
  });

  it("source=fallbackِ صریحِ سرور حفظ می‌شود — چیپِ آفلاین صادق می‌ماند", async () => {
    const doFetch = vi.fn(async () => okRes({ ...okReview, source: "fallback" }));
    const r = await requestWeekVerdict(stats, doFetch as unknown as typeof fetch);
    expect(r!.source).toBe("fallback");
  });

  it("cached=trueِ صریح حفظ می‌شود — خواندنِ ارزان از کش شناخته می‌شود", async () => {
    const doFetch = vi.fn(async () => okRes({ ...okReview, cached: true }));
    const r = await requestWeekVerdict(stats, doFetch as unknown as typeof fetch);
    expect(r!.cached).toBe(true);
  });

  it("!ok → null — حتی با بدنهٔ کامل", async () => {
    const doFetch = vi.fn(async () => new Response(JSON.stringify({ error: "سهمیه پر شد" }), { status: 429 }));
    const r = await requestWeekVerdict(stats, doFetch as unknown as typeof fetch);
    expect(r).toBeNull();
  });

  it("فیلدِ کم (بی advice) → null — هرگز نیم‌داوری نمی‌آید", async () => {
    const doFetch = vi.fn(async () => okRes({ intro: "مقدمه", strength: "قوت" }));
    const r = await requestWeekVerdict(stats, doFetch as unknown as typeof fetch);
    expect(r).toBeNull();
  });

  it("رشتهٔ خالی در یکی از سه‌گانه → null", async () => {
    const doFetch = vi.fn(async () => okRes({ ...okReview, intro: "" }));
    const r = await requestWeekVerdict(stats, doFetch as unknown as typeof fetch);
    expect(r).toBeNull();
  });

  it("بدنهٔ JSONِ خراب → null (نه throw)", async () => {
    const doFetch = vi.fn(async () => new Response("{بده", { status: 200 }));
    const r = await requestWeekVerdict(stats, doFetch as unknown as typeof fetch);
    expect(r).toBeNull();
  });

  it("بدنهٔ null (کلیدِ بی‌مقدار) → null", async () => {
    const doFetch = vi.fn(async () => okRes(null));
    const r = await requestWeekVerdict(stats, doFetch as unknown as typeof fetch);
    expect(r).toBeNull();
  });

  it("شبکهِ ردشده → null — هرگز throw نمی‌کند", async () => {
    const doFetch = vi.fn(async () => {
      throw new Error("offline");
    });
    const r: WeekVerdictResult | null = await requestWeekVerdict(stats, doFetch as unknown as typeof fetch);
    expect(r).toBeNull();
  });
});
