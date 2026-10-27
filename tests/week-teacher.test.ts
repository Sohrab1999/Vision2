// ------------------------------------------------------------------
// Task 119 «معلمِ هفته» — pure contract for the AI weekly review:
//   ① weekTeacherStats: the digest → aggregate reduction is honest
//     (duels/think/bestDay keep their nulls; quickWeek is presence)
//   ② hasWeekVerdict: the ONE gate — empty week never judged
//   ③ weekFingerprint: deterministic, field-sensitive, null-normalized
//   ④ fallbackWeekReview: real counts, real trend, real strongest/
//     weakest — every PRACTICE entry reachable, an empty week never
//     fabricated, and NEVER a stray CJK character (the corruption
//     class this file shipped with once)
// ------------------------------------------------------------------

import { describe, it, expect } from "vitest";
import {
  fallbackWeekReview,
  hasWeekVerdict,
  weekFingerprint,
  weekTeacherStats,
  type WeekTeacherStats,
} from "@/lib/week-teacher";
import { computeWeeklyDigest } from "@/lib/weekly-digest";
import type { DuelRecord } from "@/lib/duel-history";

const key = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
};

const day = (n: number, c: Partial<{ reviews: number; quizzes: number; words: number; dictation: number; rush: number }> = {}) => ({
  day: key(n),
  reviews: 0,
  quizzes: 0,
  words: 0,
  dictation: 0,
  rush: 0,
  stories: 0,
  ...c,
});

const duel = (ago: number, over: Partial<DuelRecord> = {}): DuelRecord =>
  ({
    id: `qa-${ago}-${Math.random().toString(36).slice(2, 7)}`,
    day: key(ago),
    outcome: "win",
    reason: "finished",
    opponent: "حریف",
    opponentColor: "rose",
    myScore: 1100,
    oppScore: 800,
    myCorrect: 9,
    oppCorrect: 7,
    answered: 10,
    total: 10,
    durationSec: 80,
    ...over,
  }) as DuelRecord;

const STATS: WeekTeacherStats = {
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

describe("weekTeacherStats — the digest reduction", () => {
  it("maps the real week honestly, duel nulls stay null", () => {
    const digest = computeWeeklyDigest(
      {
        dayHistory: { [key(0)]: day(0, { reviews: 12, quizzes: 2, words: 5, dictation: 1, rush: 3 }), [key(1)]: day(1, { reviews: 8 }), [key(9)]: day(9, { reviews: 30, quizzes: 1 }) },
        goalMetDays: [key(0), key(1)],
        duelHistory: [],
      },
      key(0)
    );
    const s = weekTeacherStats(digest, 2);
    expect(s.activities).toBe(31); // 23 (today) + 8 (yesterday)
    expect(s.reviews).toBe(20); // 12 + 8 inside the 7-day window
    expect(s.quizzes).toBe(2);
    expect(s.words).toBe(5);
    expect(s.dictation).toBe(1);
    expect(s.rush).toBe(3);
    expect(s.activeDays).toBe(2);
    expect(s.goalDays).toBe(2);
    expect(s.prevActivities).toBe(31); // day(9) lives in last week
    expect(s.bestDay).toBe(23); // today carries the busiest total
    expect(s.duels).toBeNull(); // no ledger → honest null, never a fake 0
    expect(s.duelWins).toBe(0);
    expect(s.duelBest).toBe(0);
    expect(s.thinkAvgMs).toBeNull();
    expect(s.quickWeek).toBe(false);
    expect(s.streak).toBe(2);
  });

  it("reads the duel ledger when it exists — wins, best, weighted think", () => {
    const digest = computeWeeklyDigest(
      {
        dayHistory: { [key(0)]: day(0, { reviews: 3 }) },
        duelHistory: [
          duel(0, { myScore: 1100, outcome: "win", myCorrect: 9, think: { avgMs: 1000, minMs: 600, maxMs: 1400, seen: 5, total: 10 } }),
          duel(1, { myScore: 1200, outcome: "loss", myCorrect: 8, think: { avgMs: 1000, minMs: 700, maxMs: 1300, seen: 10, total: 10 } }),
          duel(2, { myScore: 900, outcome: "tie", myCorrect: 8, think: { avgMs: 1000, minMs: 800, maxMs: 1200, seen: 3, total: 10 } }),
        ],
      },
      key(0)
    );
    const s = weekTeacherStats(digest, 0);
    expect(s.duels).toBe(3);
    expect(s.duelWins).toBe(1);
    expect(s.duelBest).toBe(1200);
    expect(s.thinkAvgMs).toBe(1000); // weighted across 5+10+3 = 18 samples
    expect(s.quickWeek).toBe(true); // presence flag — the week passes the r113 gate
  });
});

describe("hasWeekVerdict — the one gate", () => {
  it("an empty week is never judged; a duel-only week is", () => {
    expect(hasWeekVerdict({ activities: 0, duels: null })).toBe(false);
    expect(hasWeekVerdict({ activities: 0, duels: 0 })).toBe(false);
    expect(hasWeekVerdict({ activities: 1, duels: null })).toBe(true);
    expect(hasWeekVerdict({ activities: 0, duels: 1 })).toBe(true); // Task 103: the duel line is independent
  });
});

describe("weekFingerprint — the cache contract", () => {
  it("is deterministic and prefixed", () => {
    expect(weekFingerprint(STATS)).toBe(weekFingerprint(STATS));
    expect(weekFingerprint(STATS).startsWith("week-v1:")).toBe(true);
  });

  it("changes with every field that would change the verdict", () => {
    const base = weekFingerprint(STATS);
    for (const f of ["activities", "reviews", "goalDays", "prevActivities", "duelBest", "thinkAvgMs", "streak", "quickWeek"] as const) {
      const alt = { ...STATS, [f]: f === "quickWeek" ? false : (STATS[f] ?? 0) + 1 };
      expect(weekFingerprint(alt)).not.toBe(base);
    }
  });

  it("normalizes nulls distinctly from zero", () => {
    expect(weekFingerprint({ ...STATS, duels: null })).not.toBe(weekFingerprint({ ...STATS, duels: 0 }));
    expect(weekFingerprint({ ...STATS, bestDay: null })).not.toBe(weekFingerprint({ ...STATS, bestDay: 0 }));
  });
});

describe("fallbackWeekReview — the honest offline teacher", () => {
  const CJK = /[\u4e00-\u9fff\u3400-\u4dbf]/;

  it("never judges an empty week — the honest refusal", () => {
    const r = fallbackWeekReview({ ...STATS, activities: 0, reviews: 0, quizzes: 0, words: 0, dictation: 0, rush: 0, duels: null, duelWins: 0 });
    expect(r.intro).toContain("هفته‌ای برای داوری نیست");
    expect(r.intro).not.toMatch(CJK);
  });

  it("judges a duel-only week through the duel line", () => {
    const r = fallbackWeekReview({ ...STATS, activities: 0, reviews: 0, quizzes: 0, words: 0, dictation: 0, rush: 0, duels: 3, duelWins: 2 });
    expect(r.intro).toContain("۳ نبرد");
    expect(r.strength).toContain("نبردها");
    expect(r.intro).not.toMatch(CJK);
  });

  it("reads all four trend faces with real numbers", () => {
    const first = fallbackWeekReview({ ...STATS, prevActivities: 0 });
    expect(first.intro).toContain("آغازِ واقعیِ مسیر");
    const up = fallbackWeekReview(STATS); // 23 - 18 = +5
    expect(up.intro).toContain("۵ فعالیت بیشتر");
    const down = fallbackWeekReview({ ...STATS, prevActivities: 30 });
    expect(down.intro).toContain("۷ فعالیت کمتر");
    const same = fallbackWeekReview({ ...STATS, prevActivities: 23 });
    expect(same.intro).toContain("ثبات");
  });

  it("celebrates a perfect 7/7 goal week — and keeps the advice about rhythm", () => {
    const r = fallbackWeekReview({ ...STATS, goalDays: 7 });
    expect(r.strength).toContain("هر ۷ روز");
    expect(r.advice).toContain("همین ریتم");
  });

  it("praises the strongest real dimension", () => {
    const r = fallbackWeekReview(STATS); // reviews = 12 is the max
    expect(r.strength).toContain("مرور لغت");
    expect(r.strength).toContain("۱۲ بار");
  });

  it("targets the unique zero dimension with its own practice line", () => {
    const cases: { label: string; want: string; s: WeekTeacherStats }[] = [
      { label: "آزمون", want: "آزمونِ کوتاه", s: { ...STATS, quizzes: 0 } },
      { label: "واژهٔ نو", want: "واژهٔ تازه", s: { ...STATS, words: 0 } },
      { label: "دیکته", want: "دیکتهٔ کوتاه", s: { ...STATS, dictation: 0 } },
      { label: "چالشِ برق‌آسا", want: "چالشِ برق‌آسا", s: { ...STATS, rush: 0 } },
    ];
    for (const c of cases) {
      const r = fallbackWeekReview(c.s);
      expect(r.advice).toContain(c.want);
      expect(r.advice).not.toMatch(CJK);
    }
    // مرور لغت as the weakest NON-zero dimension → the "keep your strength" advice names its practice
    const r = fallbackWeekReview({ ...STATS, reviews: 1, activities: 12 });
    expect(r.advice).toContain("فلش‌کارت‌ها");
    expect(r.advice).not.toMatch(CJK);
    // نبردهای واژگانی zero: duels=0 (ledger exists but empty)
    const rd = fallbackWeekReview({ ...STATS, duels: 0, duelWins: 0 });
    expect(rd.advice).toContain("نبرد واژگانی");
    expect(rd.advice).not.toMatch(CJK);
  });

  it("is deterministic for the same stats", () => {
    expect(fallbackWeekReview(STATS)).toEqual(fallbackWeekReview(STATS));
  });

  it("never leaks a CJK character anywhere (the corruption guard)", () => {
    const shapes: WeekTeacherStats[] = [
      STATS,
      { ...STATS, activities: 0, duels: 2, duelWins: 1 },
      { ...STATS, goalDays: 7 },
      { ...STATS, goalDays: 0, prevActivities: 0 },
      { ...STATS, activities: 1, reviews: 0, quizzes: 0, words: 0, dictation: 0, rush: 1, duels: 0 },
    ];
    for (const s of shapes) {
      const r = fallbackWeekReview(s);
      expect(r.intro).not.toMatch(CJK);
      expect(r.strength).not.toMatch(CJK);
      expect(r.advice).not.toMatch(CJK);
    }
  });
});
