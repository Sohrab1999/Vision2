// Task 304 «ماه‌نامهٔ خواندن» — آزمونِ قراردادِ خالصِ نگاهِ ۳۰روزه.
// کلیدِ روز ثابت است («2026-10-22») و همهٔ کلیدهای دیگر با dayKeyBefore
// از همان ساخته میشوند — آزمونِ مرزی بدونِ هیچ Dateِ زنده، هم‌قراردادِ
// آزمونِ library-streak r301.
import { describe, expect, it } from "vitest";
import { monthReads, MONTH_WINDOW } from "@/lib/library-month";
import { dayKeyBefore } from "@/lib/weekly-digest";
import type { DayHistoryMap, DayStat } from "@/state/types";

const TODAY = "2026-10-22";
const key = (n: number) => dayKeyBefore(TODAY, n);

function day(n: number, stories: number): DayStat {
  return { day: key(n), reviews: 0, quizzes: 0, words: 0, dictation: 0, rush: 0, stories };
}

function hist(...ds: DayStat[]): DayHistoryMap {
  return Object.fromEntries(ds.map((d) => [d.day, d]));
}

describe("monthReads — پنجرهٔ ۳۰روزه", () => {
  it("پنجره همیشه ۳۰ خانه دارد: کهنه = ۲۹ روزِ پیش، نو = امروز", () => {
    const r = monthReads({}, TODAY);
    expect(r.perDay).toHaveLength(MONTH_WINDOW);
    expect(r.perDay[0].day).toBe(key(29));
    expect(r.perDay[29].day).toBe(TODAY);
    expect(r.empty).toBe(true);
    expect(r.total).toBe(0);
    expect(r.activeDays).toBe(0);
    expect(r.best).toBeNull();
  });

  it("مرزِ پنجره: ۲۹ روزِ پیش حساب میشود، ۳۰ روزِ پیش نه (سقفِ صادق)", () => {
    const r = monthReads(hist(day(29, 2), day(30, 5)), TODAY);
    expect(r.total).toBe(2);
    expect(r.activeDays).toBe(1);
    expect(r.perDay[0].count).toBe(2);
  });

  it("مجموع و روزهای فعال: ۳ داستان در ۲ روز", () => {
    const r = monthReads(hist(day(0, 2), day(1, 1), day(2, 0)), TODAY);
    expect(r.total).toBe(3);
    expect(r.activeDays).toBe(2);
    expect(r.empty).toBe(false);
  });

  it("هر اتمام حتی بازخوانی میشمارد (روحِ r299): ۴ بار در یک روز = ۴ داستان", () => {
    const r = monthReads(hist(day(0, 4)), TODAY);
    expect(r.total).toBe(4);
    expect(r.activeDays).toBe(1);
  });
});

describe("monthReads — پرکارترین روز", () => {
  it("بیشینه درست برمیگردد", () => {
    const r = monthReads(hist(day(0, 1), day(5, 3), day(10, 2)), TODAY);
    expect(r.best).toEqual({ day: key(5), count: 3 });
  });

  it("تساوی = روزِ کهنه‌تر (اولینِ بیشینه در پیمایشِ کهنه→امروز)", () => {
    const r = monthReads(hist(day(2, 2), day(9, 2)), TODAY);
    expect(r.best).toEqual({ day: key(9), count: 2 });
  });
});

describe("monthReads — گاردهایِ دادهٔ خام", () => {
  it("ورودیِ ناقصِ بدونِ فیلدِ stories صفرِ صادق است (هرگز نمیترکاند)", () => {
    const raw = { [key(0)]: { day: key(0), reviews: 2, quizzes: 0 } } as unknown as DayHistoryMap;
    const r = monthReads(raw, TODAY);
    expect(r.empty).toBe(true);
    expect(r.perDay).toHaveLength(30);
  });

  it("کلیدِ بیگانهٔ دور (سالِ قبل) از پنجره بیرون است و اثری ندارد", () => {
    const far: DayStat = { day: "2025-01-01", reviews: 0, quizzes: 0, words: 0, dictation: 0, rush: 0, stories: 7 };
    const r = monthReads(hist(far, day(1, 1)), TODAY);
    expect(r.total).toBe(1);
    expect(r.perDay.find((d) => d.day === "2025-01-01")).toBeUndefined();
  });
});
