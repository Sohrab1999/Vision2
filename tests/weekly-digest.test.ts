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
