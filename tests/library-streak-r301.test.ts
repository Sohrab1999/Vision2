// Task 301 «استریکِ کتابخوانی» — آزمونِ قراردادِ خالصِ زنجیرهٔ خواندن.
// کلیدِ روز ثابت است («2026-10-22») و همهٔ کلیدهای دیگر با dayKeyBefore
// از همان ساخته میشوند — آزمونِ مرزی بدونِ هیچ Dateِ زنده، هم‌قراردادِ
// آزمونِ library-progress r297 و library-filter r300.
import { describe, expect, it } from "vitest";
import { storyStreak } from "@/lib/library-streak";
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

describe("storyStreak — زنجیرهٔ جاری", () => {
  it("امروز + دیروز + پریروز = ۳ روز پیوسته (امروز خوانده)", () => {
    const r = storyStreak(hist(day(0, 1), day(1, 2), day(2, 1)), TODAY);
    expect(r.current).toBe(3);
    expect(r.readToday).toBe(true);
  });

  it("امروز خالی ولی دیروز و پریروز = زنجیرهٔ زنده از دیروز (قراردادِ streakِ اصلی)", () => {
    const r = storyStreak(hist(day(1, 1), day(2, 1)), TODAY);
    expect(r.current).toBe(2);
    expect(r.readToday).toBe(false);
  });

  it("فقطِ امروز = ۱", () => {
    const r = storyStreak(hist(day(0, 2)), TODAY);
    expect(r.current).toBe(1);
    expect(r.readToday).toBe(true);
  });

  it("فقطِ دیروز = ۱ (زنده، منتظرِ امروز)", () => {
    const r = storyStreak(hist(day(1, 3)), TODAY);
    expect(r.current).toBe(1);
    expect(r.readToday).toBe(false);
  });

  it("شکافِ دیروز زنجیره را میبُرد — حتی اگر پریروز پر باشد", () => {
    const r = storyStreak(hist(day(0, 1), day(2, 1), day(3, 1)), TODAY);
    expect(r.current).toBe(1); // امروز بله؛ دیروز نه — به عقب نمیرسد
    expect(r.readToday).toBe(true);
  });

  it("امروز و دیروز هر دو خالی = صفرِ صادق", () => {
    const r = storyStreak(hist(day(2, 1), day(3, 1)), TODAY);
    expect(r.current).toBe(0);
    expect(r.readToday).toBe(false);
  });

  it("dayHistory خالی = صفرِ صادق (هرگز نمیترکاند)", () => {
    const r = storyStreak({}, TODAY);
    expect(r.current).toBe(0);
    expect(r.readToday).toBe(false);
    expect(r.longest).toBe(0);
  });

  it("storiesِ صفرِ همانِ خالی است — روزِ ثبت‌شده ولی بی‌داستان نمی‌شمارد", () => {
    const r = storyStreak(hist(day(0, 0), day(1, 0), day(2, 1)), TODAY);
    expect(r.current).toBe(0);
    expect(r.longest).toBe(1);
  });
});

describe("storyStreak — رکوردِ بلندترین زنجیره در پنجره", () => {
  it("شکافِ میانی رکورد را نمیبُرد: ۲ روز + شکاف + ۳ روز = رکورد ۳", () => {
    const r = storyStreak(hist(day(0, 1), day(1, 1), day(3, 1), day(4, 1), day(5, 1)), TODAY);
    expect(r.longest).toBe(3);
    expect(r.current).toBe(2);
  });

  it("مجاورتِ دقیقِ یک‌روزه شرطِ پیوستگی است — کلیدِ دوروزه دور نمی‌چسبد", () => {
    const r = storyStreak(hist(day(0, 1), day(2, 1)), TODAY);
    expect(r.longest).toBe(1);
  });

  it("کلیدِ بیگانهٔ دور (سالِ قبل) نه زنجیره را میبُرد نه به آن میچسبد", () => {
    const far: DayStat = {
      day: "2025-01-01",
      reviews: 0,
      quizzes: 0,
      words: 0,
      dictation: 0,
      rush: 0,
      stories: 2,
    };
    const r = storyStreak(hist(day(0, 1), day(1, 1), far), TODAY);
    expect(r.current).toBe(2);
    expect(r.longest).toBe(2);
  });

  it("امروزِ خالی، رکورد را از دیروز می‌سازد ولی readToday صادق میماند", () => {
    const r = storyStreak(hist(day(1, 1), day(2, 1), day(3, 1)), TODAY);
    expect(r.longest).toBe(3);
    expect(r.readToday).toBe(false);
  });
});

describe("storyStreak — گاردهایِ دادهٔ خام", () => {
  it("ورودیِ ناقصِ بدونِ فیلدِ stories صفرِ صادق است (هرگز نمیترکاند)", () => {
    const raw = { [key(0)]: { day: key(0), reviews: 2, quizzes: 0 } } as unknown as DayHistoryMap;
    const r = storyStreak(raw, TODAY);
    expect(r.current).toBe(0);
    expect(r.readToday).toBe(false);
  });

  it("ترکیبِ روحِ r299: بازخوانیِ همان روز چند بار، زنجیره را چندروزه نمیکند", () => {
    const r = storyStreak(hist(day(0, 4), day(1, 1)), TODAY);
    expect(r.current).toBe(2); // امروز ۴ بار هم فقط «امروز» است
  });
});
