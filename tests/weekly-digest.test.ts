// Task-37 «هفته‌نامهٔ پیشرفت» — weekly digest contract.
import { describe, it, expect } from "vitest";
import {
  computeWeeklyDigest,
  statOfDay,
  dayKeyBefore,
  faWeekday,
  faDayLabel,
  DigestInput,
} from "@/lib/weekly-digest";
import { faNum } from "@/lib/study-theme";

const T = "2026-10-14"; // a Wednesday — fixed "today" for deterministic tests

const day = (dayKey: string, over: Partial<{ reviews: number; quizzes: number; words: number; dictation: number; rush: number }> = {}) => ({
  day: dayKey,
  reviews: over.reviews ?? 0,
  quizzes: over.quizzes ?? 0,
  words: over.words ?? 0,
  dictation: over.dictation ?? 0,
  rush: over.rush ?? 0,
});

const input = (over: Partial<DigestInput> = {}): DigestInput => ({
  dayHistory: {},
  history: {},
  goalMetDays: [],
  ...over,
});

describe("dayKeyBefore / labels", () => {
  it("steps back across month boundaries", () => {
    expect(dayKeyBefore("2026-03-01", 1)).toBe("2026-02-28");
    expect(dayKeyBefore("2026-01-01", 7)).toBe("2025-12-25");
    expect(dayKeyBefore(T, 0)).toBe(T);
  });

  it("labels Persian weekdays and short day/month", () => {
    expect(faWeekday("2026-10-14")).toBe("چهارشنبه");
    expect(faWeekday("not-a-day")).toBe("");
    expect(faDayLabel("2026-10-03")).toBe("۳/۱۰");
  });
});

describe("statOfDay", () => {
  it("prefers dayHistory, falls back to legacy history, then zeros", () => {
    const inp = input({
      dayHistory: { [T]: { day: T, reviews: 5, quizzes: 1, words: 2, dictation: 0, rush: 1 } },
      history: { [T]: { reviews: 99, quizzes: 99 } }, // must be ignored when dayHistory has the day
    });
    expect(statOfDay(T, inp)).toEqual(day(T, { reviews: 5, quizzes: 1, words: 2, rush: 1 }));
    const legacyDay = "2026-10-01";
    expect(statOfDay(legacyDay, input({ history: { [legacyDay]: { reviews: 3, quizzes: 4 } } }))).toEqual(
      day(legacyDay, { reviews: 3, quizzes: 4 })
    );
    expect(statOfDay("2020-01-01", input())).toEqual(day("2020-01-01"));
  });
});

describe("computeWeeklyDigest — windows", () => {
  it("treats today-6..today as this week and today-13..today-7 as last week", () => {
    const inp = input({
      dayHistory: {
        [dayKeyBefore(T, 0)]: { day: "", reviews: 10, quizzes: 0, words: 0, dictation: 0, rush: 0 },
        [dayKeyBefore(T, 6)]: { day: "", reviews: 1, quizzes: 0, words: 0, dictation: 0, rush: 0 },
        [dayKeyBefore(T, 7)]: { day: "", reviews: 50, quizzes: 0, words: 0, dictation: 0, rush: 0 },
        [dayKeyBefore(T, 13)]: { day: "", reviews: 7, quizzes: 0, words: 0, dictation: 0, rush: 0 },
        [dayKeyBefore(T, 14)]: { day: "", reviews: 999, quizzes: 0, words: 0, dictation: 0, rush: 0 }, // outside window
      },
    });
    const d = computeWeeklyDigest(inp, T);
    expect(d.thisWeek.reviews).toBe(11); // 10 + 1
    expect(d.lastWeek.reviews).toBe(57); // 50 + 7
    expect(d.perDay).toHaveLength(14);
    expect(d.perDay[13].day).toBe(T);
    expect(d.perDay[13].inThisWeek).toBe(true);
    expect(d.perDay[0].inThisWeek).toBe(false);
  });
});

describe("computeWeeklyDigest — totals and deltas", () => {
  it("sums every counter and derives diffs with percent", () => {
    const inp = input({
      dayHistory: {
        [dayKeyBefore(T, 1)]: { day: "", reviews: 8, quizzes: 2, words: 3, dictation: 1, rush: 1 },
        [dayKeyBefore(T, 10)]: { day: "", reviews: 4, quizzes: 1, words: 1, dictation: 0, rush: 1 },
      },
    });
    const d = computeWeeklyDigest(inp, T);
    expect(d.thisWeek).toMatchObject({ reviews: 8, quizzes: 2, words: 3, dictation: 1, rush: 1, activities: 15, activeDays: 1 });
    expect(d.lastWeek).toMatchObject({ reviews: 4, quizzes: 1, words: 1, dictation: 0, rush: 1, activities: 7 });
    const reviews = d.deltas.find((x) => x.field === "reviews")!;
    expect(reviews).toMatchObject({ current: 8, previous: 4, diff: 4, percent: 100 });
    const dictation = d.deltas.find((x) => x.field === "dictation")!;
    expect(dictation.percent).toBeNull(); // previous = 0 → percent undefined, diff still 1
    expect(dictation.diff).toBe(1);
  });

  it("counts active days and goal days inside each window only", () => {
    const inp = input({
      dayHistory: {
        [dayKeyBefore(T, 0)]: { day: "", reviews: 2, quizzes: 0, words: 0, dictation: 0, rush: 0 },
        [dayKeyBefore(T, 2)]: { day: "", reviews: 2, quizzes: 0, words: 0, dictation: 0, rush: 0 },
        [dayKeyBefore(T, 8)]: { day: "", reviews: 2, quizzes: 0, words: 0, dictation: 0, rush: 0 },
      },
      goalMetDays: [dayKeyBefore(T, 0), dayKeyBefore(T, 2), dayKeyBefore(T, 8)],
    });
    const d = computeWeeklyDigest(inp, T);
    expect(d.thisWeek.activeDays).toBe(2);
    expect(d.thisWeek.goalDays).toBe(2); // day-8 belongs to last week
    expect(d.lastWeek.goalDays).toBe(1);
  });

  it("picks the strongest day of this week as bestDay", () => {
    const inp = input({
      dayHistory: {
        [dayKeyBefore(T, 1)]: { day: "", reviews: 3, quizzes: 0, words: 0, dictation: 0, rush: 0 },
        [dayKeyBefore(T, 3)]: { day: "", reviews: 1, quizzes: 4, words: 2, dictation: 0, rush: 2 }, // 9 → best
        [dayKeyBefore(T, 9)]: { day: "", reviews: 50, quizzes: 0, words: 0, dictation: 0, rush: 0 }, // last week, ignored
      },
    });
    expect(computeWeeklyDigest(inp, T).bestDay).toEqual({ day: dayKeyBefore(T, 3), total: 9 });
  });

  it("flags an entirely empty 14-day window", () => {
    const d = computeWeeklyDigest(input(), T);
    expect(d.empty).toBe(true);
    expect(d.highlights).toHaveLength(0);
    expect(d.bestDay).toBeNull();
  });
});

describe("computeWeeklyDigest — highlights", () => {
  it("celebrates growth with a Persian percent", () => {
    const inp = input({
      dayHistory: {
        [dayKeyBefore(T, 0)]: { day: "", reviews: 6, quizzes: 2, words: 2, dictation: 0, rush: 0 },
        [dayKeyBefore(T, 7)]: { day: "", reviews: 2, quizzes: 1, words: 0, dictation: 0, rush: 0 },
      },
    });
    const d = computeWeeklyDigest(inp, T);
    // activities 10 vs 3 → +7, 233%
    expect(d.highlights.some((h) => h.includes("۷ فعالیت بیشتر") && h.includes("۲۳۳٪"))).toBe(true);
    expect(d.highlights.some((h) => h.includes("واژهٔ جدید"))).toBe(true);
  });

  it("encourages when activity dropped", () => {
    const inp = input({
      dayHistory: {
        [dayKeyBefore(T, 0)]: { day: "", reviews: 1, quizzes: 0, words: 0, dictation: 0, rush: 0 },
        [dayKeyBefore(T, 7)]: { day: "", reviews: 9, quizzes: 0, words: 0, dictation: 0, rush: 0 },
      },
    });
    expect(computeWeeklyDigest(inp, T).highlights.some((h) => h.includes("۸ فعالیت کمتر"))).toBe(true);
  });

  it("greets a first active week without previous data", () => {
    const inp = input({
      dayHistory: { [dayKeyBefore(T, 0)]: { day: "", reviews: 4, quizzes: 0, words: 0, dictation: 0, rush: 0 } },
    });
    expect(computeWeeklyDigest(inp, T).highlights.some((h) => h.includes("شروع پرانرژی"))).toBe(true);
  });
});

// ------------------------------------------------------------------
// Task 103 — «نبردهای هفته» — duelWeeklyStats + خطِ هایلایتِ نبرد
// ------------------------------------------------------------------
import { duelWeeklyStats } from "@/lib/weekly-digest";
import { DUEL_HISTORY_CAP, type DuelRecord } from "@/lib/duel-history";

const rec = (over: Partial<DuelRecord>): DuelRecord => ({
  id: "d" + Math.random().toString(36).slice(2, 8),
  day: dayKeyBefore(T, 0),
  outcome: "win",
  reason: "finished",
  opponent: "سینا",
  opponentColor: "rose",
  myScore: 1000,
  oppScore: 800,
  myCorrect: 9,
  oppCorrect: 7,
  answered: 10,
  total: 10,
  durationSec: 80,
  ...over,
});

describe("duelWeeklyStats — پنجرهٔ ۷روزه (Task 103)", () => {
  it("بدونِ دفترچه/خالی → null — نه صفرِ ساختگی", () => {
    expect(duelWeeklyStats(undefined, T)).toBeNull();
    expect(duelWeeklyStats([], T)).toBeNull();
  });

  it("مرزِ پنجره: امروز و روزِ ششم داخل؛ هفتم «هفتهٔ پیش»؛ چهاردهمِ دور هم پیش", () => {
    const d = duelWeeklyStats(
      [
        rec({ id: "a", day: dayKeyBefore(T, 0) }),
        rec({ id: "b", day: dayKeyBefore(T, 6), outcome: "loss" }),
        rec({ id: "c", day: dayKeyBefore(T, 7), outcome: "tie" }),
        rec({ id: "e", day: dayKeyBefore(T, 13), outcome: "win" }),
        rec({ id: "f", day: dayKeyBefore(T, 20) }), // بیرونِ پنجرهٔ ۱۴روزه — نادیده
      ],
      T
    )!;
    expect(d.thisWeek).toBe(2);
    expect(d.lastWeek).toBe(2);
    expect(d.win).toBe(1);
    expect(d.loss).toBe(1);
    expect(d.tie).toBe(0);
    expect(d.winRate).toBe(50);
  });

  it("بهترین امتیازِ فقطِ همین هفته — NaN حساب نمی‌شود", () => {
    const d = duelWeeklyStats(
      [
        rec({ id: "a", day: dayKeyBefore(T, 0), myScore: 1200 }),
        rec({ id: "b", day: dayKeyBefore(T, 1), myScore: 900 }),
        rec({ id: "c", day: dayKeyBefore(T, 8), myScore: 9999 }), // هفتهٔ پیش
        rec({ id: "d", day: dayKeyBefore(T, 2), myScore: Number.NaN }),
      ],
      T
    )!;
    expect(d.best).toBe(1200);
  });

  it("پر شدنِ سقفِ دفترچه با نبردهای همین هفته → truncated (شمارشِ حداقلی)", () => {
    const full = Array.from({ length: DUEL_HISTORY_CAP }, (_, i) =>
      rec({ id: "x" + i, day: dayKeyBefore(T, i % 7) })
    );
    const d = duelWeeklyStats(full, T)!;
    expect(d.thisWeek).toBe(DUEL_HISTORY_CAP);
    expect(d.truncated).toBe(true);
    // همان تعداد ولی پخش‌شده در دو هفته → قطعی، نه حداقلی
    const split = Array.from({ length: DUEL_HISTORY_CAP }, (_, i) =>
      rec({ id: "y" + i, day: dayKeyBefore(T, i < 10 ? 0 : 10) })
    );
    expect(duelWeeklyStats(split, T)!.truncated).toBe(false);
  });

  it("رکوردِ خراب (روزِ نامعتبر یا نتیجهٔ ناشناخته) کلاً کنار می‌رود", () => {
    const d = duelWeeklyStats(
      [
        rec({ id: "a", day: "not-a-day" }),
        rec({ id: "b", outcome: "bogus" as unknown as DuelRecord["outcome"] }),
        rec({ id: "c", day: dayKeyBefore(T, 0), myScore: 700 }),
      ],
      T
    )!;
    expect(d.thisWeek).toBe(1);
    expect(d.win).toBe(1);
  });

  it("خلوص: ورودی را تغییر نمی‌دهد و قطعی است", () => {
    const rs = [rec({ id: "a" }), rec({ id: "b", outcome: "loss" as const })];
    const snapshot = JSON.stringify(rs);
    const first = duelWeeklyStats(rs, T)!;
    const second = duelWeeklyStats(rs, T)!;
    expect(JSON.stringify(rs)).toBe(snapshot);
    expect(first).toEqual(second);
  });

  it("بی‌نبردِ این هفته ولی دفترچهٔ پُر → این هفته صفرِ صادق با truncated=false", () => {
    const d = duelWeeklyStats([rec({ id: "a", day: dayKeyBefore(T, 10) })], T)!;
    expect(d.thisWeek).toBe(0);
    expect(d.lastWeek).toBe(1);
    expect(d.winRate).toBe(0);
    expect(d.best).toBe(0);
    expect(d.truncated).toBe(false);
  });
});

describe("خطِ هایلایتِ نبرد در computeWeeklyDigest (Task 103)", () => {
  it("با نبردِ این هفته، خطِ فارسی با ارقامِ فارسی و برشِ نتیجه‌ها می‌آید", () => {
    const d = computeWeeklyDigest(
      input({
        dayHistory: { [T]: { day: T, reviews: 3, quizzes: 0, words: 0, dictation: 0, rush: 0 } },
        duelHistory: [
          rec({ id: "a", day: dayKeyBefore(T, 0), outcome: "win" }),
          rec({ id: "b", day: dayKeyBefore(T, 1), outcome: "win" }),
          rec({ id: "c", day: dayKeyBefore(T, 2), outcome: "loss" }),
          rec({ id: "e", day: dayKeyBefore(T, 3), outcome: "tie" }),
        ],
      }),
      T
    );
    expect(d.duels).toMatchObject({ thisWeek: 4, win: 2, loss: 1, tie: 1, winRate: 50 });
    expect(d.highlights.some((h) => h.includes("۴ نبرد واژگانی این هفته — ۲ برد، ۱ باخت، ۱ مساوی"))).toBe(true);
  });

  it("بدونِ دفترچه یا بی‌نبردِ این هفته → بدونِ خطِ نبرد", () => {
    const d0 = computeWeeklyDigest(input(), T);
    expect(d0.duels).toBeNull();
    expect(d0.highlights.every((h) => !h.includes("نبرد"))).toBe(true);
    const d1 = computeWeeklyDigest(
      input({ duelHistory: [rec({ id: "a", day: dayKeyBefore(T, 10) })] }),
      T
    );
    expect(d1.duels!.thisWeek).toBe(0);
    expect(d1.highlights.every((h) => !h.includes("نبرد واژگانی"))).toBe(true);
  });

  it("دودل‌بازِ بی‌مرور هم خط می‌گیرد — نبرد مستقل از فعالیتِ مطالعاتی است", () => {
    const d = computeWeeklyDigest(
      input({ duelHistory: [rec({ id: "a", day: dayKeyBefore(T, 0) })] }),
      T
    );
    expect(d.empty).toBe(true); // فعالیتِ مطالعاتیِ ۱۴روزه صفر
    expect(d.highlights.some((h) => h.includes("۱ نبرد واژگانی این هفته"))).toBe(true);
  });
});

// ------------------------------------------------------------------
// Task 109 — «فکرِ هفته» — تجمیعِ وزن‌دارِ آمارِ فکرِ نبردهای همین هفته.
// قفل‌ها: ① بی‌رکوردِ فکردار → null (نه صفرِ ساختگی) ② میانگینِ وزن‌دار
// بر seen ③ سریع‌ترین = کمینهٔ minMs ④ فکرِ هفتهٔ پیش هرگز نمی‌شمارد
// ⑤ thinkِ خرابِ هر شکل نادیده اما رکورد در شمارشِ نبرد می‌ماند
// ⑥ پوششِ ناقص (seen<total) جمع می‌شود ⑦ خلوص/قطعیت
// ------------------------------------------------------------------
import { saneThink } from "@/lib/duel-history";
import type { ThinkStats } from "@/lib/duel-think";

const think = (over: Partial<ThinkStats>): ThinkStats => ({
  avgMs: 800,
  minMs: 200,
  maxMs: 1500,
  seen: 4,
  total: 10,
  ...over,
});

describe("saneThink — اعتبارسنجِ مشترکِ فیلدِ think (Task 109)", () => {
  it("شکلِ سالم رد می‌شود و کپیِ فشرده می‌دهد — نه همان شیء", () => {
    const t = think({});
    const out = saneThink(t);
    expect(out).toEqual(t);
    expect(out).not.toBe(t);
  });

  it("خرابِ هر شکل → null: شیءِ خالی، آرایه، NaN، منفی، seen=۰، seen>total، min>avg، total>۹۹۹", () => {
    expect(saneThink(undefined)).toBeNull();
    expect(saneThink(null)).toBeNull();
    expect(saneThink({})).toBeNull();
    expect(saneThink([think({})])).toBeNull();
    expect(saneThink(think({ avgMs: Number.NaN }))).toBeNull();
    expect(saneThink(think({ minMs: -1 }))).toBeNull();
    expect(saneThink(think({ avgMs: Number.POSITIVE_INFINITY }))).toBeNull();
    expect(saneThink(think({ seen: 0 }))).toBeNull();
    expect(saneThink(think({ seen: 4.5 }))).toBeNull();
    expect(saneThink(think({ seen: 11 }))).toBeNull(); // seen > total
    expect(saneThink(think({ minMs: 900 }))).toBeNull(); // min > avg
    expect(saneThink(think({ maxMs: 700 }))).toBeNull(); // avg > max
    expect(saneThink(think({ total: 1000 }))).toBeNull();
    expect(saneThink(think({ total: 10.5 }))).toBeNull();
  });

  it("مرزهایِ دقیق: seen=۱ و total=seen و total=۹۹۹ سالم‌اند؛ min=avg=max هم", () => {
    expect(saneThink(think({ seen: 1, total: 1 }))).not.toBeNull();
    expect(saneThink(think({ total: 999, seen: 999 }))).not.toBeNull();
    expect(saneThink(think({ minMs: 800, maxMs: 800 }))).not.toBeNull();
  });
});

describe("duelWeeklyStats — فکرِ هفته (Task 109)", () => {
  it("بی‌رکوردِ فکردار → thinkِ null ولی شمارشِ نبردها سرِ پا", () => {
    const d = duelWeeklyStats(
      [rec({ id: "a", day: dayKeyBefore(T, 0) }), rec({ id: "b", day: dayKeyBefore(T, 1) })],
      T
    )!;
    expect(d.thisWeek).toBe(2);
    expect(d.think).toBeNull();
  });

  it("تلفیقِ وزن‌دار: (۸۰۰·۴ + ۱۲۰۰·۲) ÷ ۶ = ۹۳۳ · سریع‌ترین = کمینهٔ minMs · seen/total جمعی", () => {
    const d = duelWeeklyStats(
      [
        rec({ id: "a", day: dayKeyBefore(T, 0), think: think({ avgMs: 800, minMs: 200, seen: 4, total: 10 }) }),
        rec({ id: "b", day: dayKeyBefore(T, 2), think: think({ avgMs: 1200, minMs: 300, seen: 2, total: 10 }) }),
      ],
      T
    )!;
    expect(d.think).toEqual({ avgMs: 933, fastestMs: 200, seen: 6, total: 20 });
  });

  it("فکرِ هفتهٔ پیش (روزِ هفتم و دهم) هرگز نمی‌شمارد", () => {
    const d = duelWeeklyStats(
      [
        rec({ id: "old7", day: dayKeyBefore(T, 7), think: think({ avgMs: 100, minMs: 50, seen: 10, total: 10 }) }),
        rec({ id: "old10", day: dayKeyBefore(T, 10), think: think({ avgMs: 100, minMs: 50, seen: 10, total: 10 }) }),
      ],
      T
    )!;
    expect(d.lastWeek).toBe(2);
    expect(d.thisWeek).toBe(0);
    expect(d.think).toBeNull();
  });

  it("thinkِ خرابِ هر شکل نادیده می‌آید ولی رکورد در شمارشِ نبرد می‌ماند", () => {
    const d = duelWeeklyStats(
      [
        rec({ id: "a", day: dayKeyBefore(T, 0), think: think({ avgMs: Number.NaN }) }),
        rec({ id: "b", day: dayKeyBefore(T, 1), think: { avgMs: 800 } as unknown as ThinkStats }), // ناقص
        rec({ id: "c", day: dayKeyBefore(T, 2), think: think({ seen: 0 }) }),
        rec({ id: "ok", day: dayKeyBefore(T, 3), think: think({ avgMs: 500, minMs: 100, seen: 3, total: 10 }) }),
      ],
      T
    )!;
    expect(d.thisWeek).toBe(4);
    expect(d.think).toEqual({ avgMs: 500, fastestMs: 100, seen: 3, total: 10 });
  });

  it("پوششِ ناقصِ یک نبرد: seen<total جمع می‌شود تا چیپِ «N از M» صادق بماند", () => {
    const d = duelWeeklyStats(
      [rec({ id: "a", day: dayKeyBefore(T, 0), think: think({ seen: 4, total: 10 }) })],
      T
    )!;
    expect(d.think!.seen).toBe(4);
    expect(d.think!.total).toBe(10);
  });

  it("خلوص و قطعیت: ورودی دست‌نخورده، دو بارِ پشت‌هم برابر", () => {
    const rs = [
      rec({ id: "a", day: dayKeyBefore(T, 0), think: think({}) }),
      rec({ id: "b", day: dayKeyBefore(T, 1), outcome: "loss" as const, think: think({ avgMs: 1100, minMs: 400, maxMs: 2000, seen: 2, total: 5 }) }),
    ];
    const snapshot = JSON.stringify(rs);
    const first = duelWeeklyStats(rs, T)!;
    const second = duelWeeklyStats(rs, T)!;
    expect(JSON.stringify(rs)).toBe(snapshot);
    expect(first).toEqual(second);
  });

  it("computeWeeklyDigest تلفیق را به بلوکِ duels می‌رساند (سیم‌کشیِ کامل)", () => {
    const d = computeWeeklyDigest(
      input({
        duelHistory: [rec({ id: "a", day: dayKeyBefore(T, 0), think: think({ avgMs: 649, minMs: 100, seen: 5, total: 5 }) })],
      }),
      T
    );
    expect(d.duels!.think).toEqual({ avgMs: 649, fastestMs: 100, seen: 5, total: 5 });
  });
});

// ------------------------------------------------------------------
// Task 113 — «هفتهٔ چابک در هفته‌نامه» — پروفایلِ پنجرهٔ خودِ دایجست.
// قفل‌ها: ① بی‌رکورد در پنجره → null (نه صفرِ ساختگی) ② پروفایلِ کامل با
// پنجرهٔ [T−6..T] ③ مرزهای دقیقِ همان گیت‌های ۱۱۰ (≤۱۵۰۰ms، ≥۰٫۸، ≥۳فکردار،
// ≥۹seen، ≥۱۵پاسخ) ④ پنجره‌سازی: کیفیتِ هفتهٔ پیش هرگز نمی‌شمارد — ششمین
// روز داخل و هفتمین بیرون ⑤ فورفیتِ بی‌پاسخ در duels هست ولی در answered نه
// ⑥ thinkِ خراب فکردار نمی‌شود ⑦ خلوص/قطعیت ⑧ سیم‌کشیِ duelWeeklyStats +
// computeWeeklyDigest
// ------------------------------------------------------------------
import { duelWeekQuickProfile, DUEL_QUICK_WEEK } from "@/lib/weekly-digest";

describe("duelWeekQuickProfile — هفتهٔ چابکِ دایجست (Task 113)", () => {
  // هفتهٔ واجدِ مرجع: Σ avgMs·seen = ۸۰۰·۵+۱۰۰۰·۳+۱۲۰۰·۲ = ۹۴۰۰ بر ۱۰ → ۹۴۰ms
  const qualifying = () => [
    rec({ id: "a", day: dayKeyBefore(T, 0), think: think({ avgMs: 800, minMs: 200, maxMs: 1500, seen: 5, total: 10 }) }),
    rec({ id: "b", day: dayKeyBefore(T, 1), think: think({ avgMs: 1000, minMs: 400, maxMs: 2000, seen: 3, total: 10 }) }),
    rec({ id: "c", day: dayKeyBefore(T, 2), think: think({ avgMs: 1200, minMs: 500, maxMs: 2500, seen: 2, total: 10 }) }),
  ];

  it("بی‌دفترچه/آرایهٔ خالی → null (بلوکِ UI غایب، نه صفرِ ساختگی)", () => {
    expect(duelWeekQuickProfile(undefined, T)).toBeNull();
    expect(duelWeekQuickProfile([], T)).toBeNull();
  });

  it("هفتهٔ واجد → پروفایلِ کامل با پنجرهٔ [T−6..T] و تلفیقِ وزن‌دارِ ۹۴۰ms", () => {
    const p = duelWeekQuickProfile(qualifying(), T)!;
    expect(p).not.toBeNull();
    expect(p).toMatchObject({
      startDay: dayKeyBefore(T, 6),
      endDay: T,
      duels: 3,
      thinkful: 3,
      avgMs: 940,
      seen: 10,
      answered: 30,
      correct: 27,
      rate: 0.9,
    });
  });

  it("مرزِ میانگین با DUEL_QUICK_WEEK.silverMs: دقیقاً ۱۵۰۰ گذر، ۱۵۰۱ رد", () => {
    const at = (avg: number) =>
      [5, 3, 2].map((seen, i) =>
        rec({
          id: "r" + i,
          day: dayKeyBefore(T, i),
          think: think({ avgMs: avg, minMs: avg, maxMs: avg, seen, total: 10 }),
        })
      );
    expect(duelWeekQuickProfile(at(DUEL_QUICK_WEEK.silverMs), T)).not.toBeNull();
    expect(duelWeekQuickProfile(at(DUEL_QUICK_WEEK.silverMs + 1), T)).toBeNull();
  });

  it("مرزِ نرخ: دقیقاً ۰٫۸ (۲۴ از ۳۰) گذر، ۰٫۷ رد", () => {
    // ۲۴/۳۰ = ۰٫۸ — سه رکوردِ ۸درست
    expect(
      duelWeekQuickProfile(
        qualifying().map((r, i) => rec({ ...r, id: "e" + i, myCorrect: 8 })),
        T
      )
    ).not.toBeNull();
    expect(
      duelWeekQuickProfile(
        qualifying().map((r, i) => rec({ ...r, id: "f" + i, myCorrect: 7 })),
        T
      )
    ).toBeNull();
  });

  it("کف‌ها: ۲فکردار رد (با seen=۹ کامل) · ۳فکردارِ seen=۸ رد · answered=۱۴ رد", () => {
    // minThinkful: دو فکردار با جمعِ seen=۹ — فقط شمارِ فکردار کم است
    expect(
      duelWeekQuickProfile([
        rec({ id: "a", day: dayKeyBefore(T, 0), think: think({ avgMs: 800, minMs: 200, maxMs: 1500, seen: 6, total: 10 }) }),
        rec({ id: "b", day: dayKeyBefore(T, 1), think: think({ avgMs: 1000, minMs: 400, maxMs: 2000, seen: 3, total: 10 }) }),
        rec({ id: "c", day: dayKeyBefore(T, 2) }), // بی‌think ولی پُرپاسخ
      ], T)
    ).toBeNull();
    // minSeen: سه فکردار با جمعِ seen=۸
    expect(
      duelWeekQuickProfile([
        rec({ id: "a", day: dayKeyBefore(T, 0), think: think({ avgMs: 800, minMs: 200, maxMs: 1500, seen: 4, total: 10 }) }),
        rec({ id: "b", day: dayKeyBefore(T, 1), think: think({ avgMs: 800, minMs: 200, maxMs: 1500, seen: 2, total: 10 }) }),
        rec({ id: "c", day: dayKeyBefore(T, 2), think: think({ avgMs: 1200, minMs: 500, maxMs: 2500, seen: 2, total: 10 }) }),
      ], T)
    ).toBeNull();
    // minAnswered: فورفیتِ بی‌پاسخ جمعِ answered را به ۱۴ می‌رساند
    expect(
      duelWeekQuickProfile([
        rec({ id: "a", day: dayKeyBefore(T, 0), answered: 10, think: think({ avgMs: 800, minMs: 200, maxMs: 1500, seen: 5, total: 10 }) }),
        rec({ id: "b", day: dayKeyBefore(T, 1), answered: 4, myCorrect: 4, think: think({ avgMs: 1000, minMs: 400, maxMs: 2000, seen: 3, total: 10 }) }),
        rec({ id: "c", day: dayKeyBefore(T, 2), answered: 0, myCorrect: 0, think: think({ avgMs: 1200, minMs: 500, maxMs: 2500, seen: 2, total: 10 }) }),
      ], T)
    ).toBeNull();
  });

  it("پنجره‌سازی: کیفیتِ واجد در روزهای ۷/۸/۹ هرگز برای این هفته نمی‌شمارد — ششمین روز داخل است", () => {
    const at = (ago: number) =>
      qualifying().map((r, i) => rec({ ...r, id: "w" + i + ago, day: dayKeyBefore(T, ago + i) }));
    // هفتهٔ پیشِ کاملِ واجد → null
    expect(duelWeekQuickProfile(at(7), T)).toBeNull();
    // ششم/پنجم/چهارم — همه داخلِ [T−6..T] → واجد
    expect(duelWeekQuickProfile(at(4), T)).not.toBeNull();
  });

  it("فورفیتِ بی‌پاسخ در duels می‌شمارد ولی در answered/correct نه", () => {
    const p = duelWeekQuickProfile([
      ...qualifying(),
      rec({ id: "ff", day: dayKeyBefore(T, 3), answered: 0, myCorrect: 0 }),
    ], T)!;
    expect(p.duels).toBe(4);
    expect(p.answered).toBe(30);
    expect(p.correct).toBe(27);
  });

  it("thinkِ خراب فکردار نمی‌شود — رکورد در duels می‌ماند ولی گیتِ ۳فکردار رد می‌شود", () => {
    const p = duelWeekQuickProfile([
      rec({ id: "a", day: dayKeyBefore(T, 0), think: think({ avgMs: 800, minMs: 200, maxMs: 1500, seen: 5, total: 10 }) }),
      rec({ id: "b", day: dayKeyBefore(T, 1), think: think({ avgMs: 1000, minMs: 400, maxMs: 2000, seen: 3, total: 10 }) }),
      rec({ id: "c", day: dayKeyBefore(T, 2), think: think({ seen: 0 }) }), // ناسالم
    ], T);
    expect(p).toBeNull();
  });

  it("خلوص و قطعیت: ورودی دست‌نخورده، دو بارِ پشت‌هم برابر", () => {
    const rs = qualifying();
    const snapshot = JSON.stringify(rs);
    const first = duelWeekQuickProfile(rs, T);
    const second = duelWeekQuickProfile(rs, T);
    expect(JSON.stringify(rs)).toBe(snapshot);
    expect(first).toEqual(second);
  });

  it("سیم‌کشی: duelWeeklyStats.quickWeek هم‌قراردادِ duelWeekQuickProfile است و با think هم‌زمان زنده", () => {
    const rs = qualifying();
    const d = duelWeeklyStats(rs, T)!;
    expect(d.quickWeek).toEqual(duelWeekQuickProfile(rs, T));
    expect(d.quickWeek!.avgMs).toBe(940);
    expect(d.think).not.toBeNull();
    // و از راهِ computeWeeklyDigest به بلوکِ duels می‌رسد
    const digest = computeWeeklyDigest(input({ duelHistory: rs }), T);
    expect(digest.duels!.quickWeek!.avgMs).toBe(940);
  });

  it("بی‌نبردِ این هفته ولی هفتهٔ واجد در گذشته → quickWeek null (پنجره‌سازیِ سخت‌گیر)", () => {
    const d = duelWeeklyStats([
      rec({ id: "a", day: dayKeyBefore(T, 8), think: think({ avgMs: 800, minMs: 200, maxMs: 1500, seen: 9, total: 10 }) }),
      rec({ id: "b", day: dayKeyBefore(T, 9), think: think({ avgMs: 800, minMs: 200, maxMs: 1500, seen: 9, total: 10 }) }),
      rec({ id: "c", day: dayKeyBefore(T, 10), think: think({ avgMs: 800, minMs: 200, maxMs: 1500, seen: 9, total: 10 }) }),
    ], T)!;
    expect(d.thisWeek).toBe(0);
    expect(d.lastWeek).toBe(3);
    expect(d.quickWeek).toBeNull();
  });
});

// ------------------------------------------------------------------
// Task 142 — «زنجیرهٔ مأموریت‌ها در هفته‌نامه» — خطِ پایداری با عددِ
// واقعی. تک‌منبع: questStreakMeta (همان قراردادِ چیپِ پنلِ مأموریت‌ها —
// ۱۴۰). قفل‌ها: ①عددِ زنجیره و دلتایِ هفته از قرارداد می‌آید ②خطِ دوم
// است (پس از فعالیت، پیش از هدف/واژه) ③تک‌روز و فعالیتِ غیرِ ۵/۵ هیچ
// خطی نمی‌سازند (حضورِ صادقانه) ④فقطِ historyِ قدیمی هم زنجیره ندارد.
// ------------------------------------------------------------------
describe("computeWeeklyDigest — زنجیرهٔ مأموریت‌ها در های‌لایت‌ها (Task 142)", () => {
  const perfect = { reviews: 10, words: 5, quizzes: 3, dictation: 1, rush: 1 };
  const streakLine = (streak: number, links: number) =>
    `زنجیرهٔ مأموریت‌ها به ${faNum(streak)} روز رسید — ${faNum(links)} حلقه در همین هفته`;

  it("زنجیرهٔ ۳روزه با عضویتِ امروز → خط با عددِ واقعی و دلتایِ کامل", () => {
    const inp = input({
      dayHistory: {
        [dayKeyBefore(T, 0)]: day(dayKeyBefore(T, 0), perfect),
        [dayKeyBefore(T, 1)]: day(dayKeyBefore(T, 1), perfect),
        [dayKeyBefore(T, 2)]: day(dayKeyBefore(T, 2), perfect),
      },
    });
    const d = computeWeeklyDigest(inp, T);
    expect(d.highlights).toContain(streakLine(3, 3));
  });

  it("خطِ دوم است — پس از خطِ فعالیت، پیش از هدف و واژه (تصمیمِ جایگاه)", () => {
    const inp = input({
      dayHistory: {
        [dayKeyBefore(T, 0)]: day(dayKeyBefore(T, 0), perfect),
        [dayKeyBefore(T, 1)]: day(dayKeyBefore(T, 1), perfect),
      },
      goalMetDays: [dayKeyBefore(T, 0)],
    });
    const d = computeWeeklyDigest(inp, T);
    expect(d.highlights[0]).toContain("فعالیت");
    expect(d.highlights[1]).toBe(streakLine(2, 2));
    expect(d.highlights[2]).toContain("روزِ هدفِ روزانه کامل شد");
    expect(d.highlights[3]).toContain("واژهٔ جدید");
  });

  it("زنجیرهٔ بلندتر از هفته → دلتا کمتر از طولِ زنجیره (۹ روزه، ۷ حلقه)", () => {
    const dh: DigestInput["dayHistory"] = {};
    for (let i = 0; i <= 8; i += 1) {
      const key = dayKeyBefore(T, i);
      dh[key] = day(key, perfect);
    }
    const d = computeWeeklyDigest(input({ dayHistory: dh }), T);
    expect(d.highlights).toContain(streakLine(9, 7));
  });

  it("امروزِ ناقص با زنجیرهٔ زنده از دیروز → خط برقرار است (۲ حلقه)", () => {
    const inp = input({
      dayHistory: {
        [dayKeyBefore(T, 0)]: day(dayKeyBefore(T, 0), { reviews: 3 }), // ناقص — زنجیره را نمی‌شکند
        [dayKeyBefore(T, 1)]: day(dayKeyBefore(T, 1), perfect),
        [dayKeyBefore(T, 2)]: day(dayKeyBefore(T, 2), perfect),
      },
    });
    const d = computeWeeklyDigest(inp, T);
    expect(d.highlights).toContain(streakLine(2, 2));
  });

  it("تک‌روزِ کامل → هیچ خطِ زنجیره‌ای نیست (جشنِ تک‌روز با نوارِ پاداش است)", () => {
    const inp = input({ dayHistory: { [dayKeyBefore(T, 0)]: day(dayKeyBefore(T, 0), perfect) } });
    const d = computeWeeklyDigest(inp, T);
    expect(d.highlights.every((h) => !h.includes("زنجیرهٔ مأموریت‌ها"))).toBe(true);
  });

  it("فعالیتِ لختِ غیرِ ۵/۵ → هیچ خطِ زنجیره‌ای نیست (فقطِ پنج‌گانه عضو می‌شود)", () => {
    const inp = input({
      dayHistory: {
        [dayKeyBefore(T, 0)]: day(dayKeyBefore(T, 0), { reviews: 50, quizzes: 9, words: 9 }),
        [dayKeyBefore(T, 1)]: day(dayKeyBefore(T, 1), { reviews: 50, quizzes: 9, words: 9 }),
      },
    });
    const d = computeWeeklyDigest(inp, T);
    expect(d.highlights.every((h) => !h.includes("زنجیرهٔ مأموریت‌ها"))).toBe(true);
  });

  it("فقطِ historyِ قدیمی (بدونِ dayHistory) → خطِ زنجیره غایب، فعالیت حاضر", () => {
    const legacyDay = dayKeyBefore(T, 0);
    const inp = input({ dayHistory: {}, history: { [legacyDay]: { reviews: 5, quizzes: 2 } } });
    const d = computeWeeklyDigest(inp, T);
    expect(d.highlights.length).toBeGreaterThan(0);
    expect(d.highlights.every((h) => !h.includes("زنجیرهٔ مأموریت‌ها"))).toBe(true);
  });
});

// ------------------------------------------------------------------
// Task 144 — «روزهایِ هدف در هفته‌نامه» — خطِ هدف دلتایِ صادق می‌گیرد.
// lastWeek.goalDays از همان sumTotals می‌آید (هم‌پنجرهٔ خودِ دایجست) و
// تا امروز محاسبه می‌شد ولی هیچ‌جا گفته نمی‌شد. قفل‌ها: ①سه شکلِ
// مقایسه (بیشتر/کمتر/هم‌قدم) فقط با پایهٔ حقیقی ②هفتهٔ پیشِ صفر
// «بی‌پایه» است نه «افت» — گویشِ لختِ پیشین می‌ماند ③هفتهٔ جاریِ صفر
// هیچ خطِ هدفی ندارد ④جایگاهِ خطِ هدف در بودجهٔ highlights ثابت است.
// ------------------------------------------------------------------
describe("computeWeeklyDigest — روزهایِ هدف در های‌لایت‌ها (Task 144)", () => {
  const act = { reviews: 10, quizzes: 3 };
  const goalLine = (n: number) => `${faNum(n)} روزِ هدفِ روزانه کامل شد`;

  it("۳ این هفته / ۱ هفتهٔ پیش → «— ۲ روز بیشتر از هفتهٔ پیش»", () => {
    const inp = input({
      dayHistory: {
        [dayKeyBefore(T, 0)]: day(dayKeyBefore(T, 0), act),
        [dayKeyBefore(T, 7)]: day(dayKeyBefore(T, 7), act),
      },
      goalMetDays: [dayKeyBefore(T, 0), dayKeyBefore(T, 1), dayKeyBefore(T, 2), dayKeyBefore(T, 7)],
    });
    const d = computeWeeklyDigest(inp, T);
    expect(d.highlights).toContain(`${goalLine(3)} — ${faNum(2)} روز بیشتر از هفتهٔ پیش`);
  });

  it("۱ این هفته / ۳ هفتهٔ پیش → «— ۲ روز کمتر از هفتهٔ پیش»", () => {
    const inp = input({
      dayHistory: {
        [dayKeyBefore(T, 0)]: day(dayKeyBefore(T, 0), act),
        [dayKeyBefore(T, 7)]: day(dayKeyBefore(T, 7), act),
      },
      goalMetDays: [dayKeyBefore(T, 0), dayKeyBefore(T, 7), dayKeyBefore(T, 8), dayKeyBefore(T, 9)],
    });
    const d = computeWeeklyDigest(inp, T);
    expect(d.highlights).toContain(`${goalLine(1)} — ${faNum(2)} روز کمتر از هفتهٔ پیش`);
  });

  it("۲/۲ → «— هم‌قدم با هفتهٔ پیش» (هم‌زبانیِ خطِ فعالیت)", () => {
    const inp = input({
      dayHistory: {
        [dayKeyBefore(T, 0)]: day(dayKeyBefore(T, 0), act),
        [dayKeyBefore(T, 7)]: day(dayKeyBefore(T, 7), act),
      },
      goalMetDays: [dayKeyBefore(T, 0), dayKeyBefore(T, 1), dayKeyBefore(T, 7), dayKeyBefore(T, 8)],
    });
    const d = computeWeeklyDigest(inp, T);
    expect(d.highlights).toContain(`${goalLine(2)} — هم‌قدم با هفتهٔ پیش`);
  });

  it("هفتهٔ پیشِ صفر → گویشِ لخت — «بی‌پایه» است نه «افت» (هیچ پسوندِ مقایسه)", () => {
    const inp = input({
      dayHistory: { [dayKeyBefore(T, 0)]: day(dayKeyBefore(T, 0), act) },
      goalMetDays: [dayKeyBefore(T, 0), dayKeyBefore(T, 1), dayKeyBefore(T, 2)],
    });
    const d = computeWeeklyDigest(inp, T);
    expect(d.highlights).toContain(goalLine(3));
    expect(
      d.highlights.every(
        (h) => !h.includes("بیشتر از هفتهٔ پیش") && !h.includes("کمتر از هفتهٔ پیش") && !h.includes("هم‌قدم با هفتهٔ پیش —")
      )
    ).toBe(true);
  });

  it("هفتهٔ جاریِ صفر (هر ۴ روزِ هدف در هفتهٔ پیش) → هیچ خطِ هدفی نیست", () => {
    const inp = input({
      dayHistory: { [dayKeyBefore(T, 7)]: day(dayKeyBefore(T, 7), act) },
      goalMetDays: [dayKeyBefore(T, 7), dayKeyBefore(T, 8), dayKeyBefore(T, 9), dayKeyBefore(T, 10)],
    });
    const d = computeWeeklyDigest(inp, T);
    expect(d.highlights.every((h) => !h.includes("روزِ هدفِ روزانه"))).toBe(true);
  });

  it("جایگاه: [فعالیت، زنجیره، هدفِ مقایسه‌دار، واژه] — سطرِ هدف سرِ جایش", () => {
    const perfect = { reviews: 10, words: 5, quizzes: 3, dictation: 1, rush: 1 };
    const inp = input({
      dayHistory: {
        [dayKeyBefore(T, 0)]: day(dayKeyBefore(T, 0), perfect),
        [dayKeyBefore(T, 1)]: day(dayKeyBefore(T, 1), perfect),
        [dayKeyBefore(T, 7)]: day(dayKeyBefore(T, 7), act),
      },
      goalMetDays: [dayKeyBefore(T, 0), dayKeyBefore(T, 1), dayKeyBefore(T, 2), dayKeyBefore(T, 7)],
    });
    const d = computeWeeklyDigest(inp, T);
    expect(d.highlights[0]).toContain("فعالیت");
    expect(d.highlights[1]).toContain("زنجیرهٔ مأموریت‌ها");
    expect(d.highlights[2]).toBe(`${goalLine(3)} — ${faNum(2)} روز بیشتر از هفتهٔ پیش`);
    expect(d.highlights[3]).toContain("واژهٔ جدید");
  });
});

// Task 148 — «امضایِ دفترچه» — آمارِ کلِ دفترچهٔ نگه‌داشته (سقفِ ۱۵) از همان
// duelLedgerStatsِ پنلِ نبرد (تک‌منبع — صفرِ حسابِ موازی)؛ هفته‌نامه بالاخره
// دربارهٔ «کارنامه» هم حرف می‌زند نه فقط پنجرهٔ ۷روزه. داورگواه زیرمجموعهٔ
// صادقِ ۹۶ است؛ صفرش در UI ساکت می‌ماند.
describe("duelWeeklyStats — امضایِ دفترچه (Task 148)", () => {
  it("۱. چهار عضوِ امضا از کلِ دفترچه: total/win/best/verified — نه فقط پنجره", () => {
    const sig = "a".repeat(64);
    const d = duelWeeklyStats(
      [
        rec({ id: "a", day: dayKeyBefore(T, 0), outcome: "win", myScore: 1200 }),
        rec({ id: "b", day: dayKeyBefore(T, 1), outcome: "win", myScore: 900 }),
        rec({ id: "c", day: dayKeyBefore(T, 2), outcome: "loss", myScore: 500 }),
        rec({ id: "d", day: dayKeyBefore(T, 9), outcome: "tie", receiptSig: sig }),
      ],
      T,
    )!;
    expect(d.ledger).toEqual({ total: 4, win: 2, best: 1200, verified: 1 });
    // پنجره جدا می‌ماند: امروز/دیروز/پریروز در هفته؛ day-9 در پنجرهٔ هفتهٔ پیش (۸..۱۴)
    expect(d.thisWeek).toBe(3);
    expect(d.lastWeek).toBe(1);
  });

  it("۲. باختِ خالص: بردِ صفر و بهترینِ صفر — صادق، نه پنهان", () => {
    const d = duelWeeklyStats(
      [rec({ id: "x", day: dayKeyBefore(T, 0), outcome: "loss", myScore: 0 })],
      T,
    )!;
    expect(d.ledger).toEqual({ total: 1, win: 0, best: 0, verified: 0 });
  });

  it("۳. هفتهٔ آرام با دفترچهٔ قدیمی: بلوک حاضر می‌ماند و امضای دفترچه حرف می‌زند", () => {
    const d = duelWeeklyStats(
      [rec({ id: "old", day: dayKeyBefore(T, 10), outcome: "win", myScore: 640 })],
      T,
    )!;
    expect(d.thisWeek).toBe(0);
    expect(d.ledger).toEqual({ total: 1, win: 1, best: 640, verified: 0 });
  });

  it("۴. داورگواه زیرمجموعهٔ صادق: فقط رسیدِ همدار می‌شمارد (شکل‌سنجی مالِ sanitize است)", () => {
    const d = duelWeeklyStats(
      [
        rec({ id: "a", receiptSig: "b".repeat(64) }),
        rec({ id: "b" }),
        rec({ id: "c" }),
      ],
      T,
    )!;
    expect(d.ledger.total).toBe(3);
    expect(d.ledger.verified).toBe(1);
  });
});
