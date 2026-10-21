// ------------------------------------------------------------------
// راند ۲۹۷ «کتاب‌خانه همه‌جا» — قراردادِ خالصِ پیشرفتِ کتاب‌خانه.
// سه سطحِ عرضه (کارتِ «ادامهٔ خواندن»، چیپِ نمودار فعالیت، نوارِ
// هفته‌نامه) از همین دو تابع می‌خوانند — این آزمون مرزهایشان را با
// کلیدِ روزِ ثابت قفل می‌کند (هم‌الگوی freeze-badge.test).
//   ① libraryProgress — شمارش/درصد/داستانِ بعدی/کامل‌شدن
//   ② storiesReadSince — پنجرهٔ روزیِ رشته‌ای + گاردِ کلیدِ بیگانه + تازگی
// ------------------------------------------------------------------

import { describe, it, expect } from "vitest";
import { libraryProgress, storiesReadSince } from "@/lib/library-progress";
import { HILL_TOTAL_STORIES, storyById } from "@/data/hill-stories";

const T = "2026-10-22"; // پنج‌شنبه — کلیدِ ثابت برای همهٔ مرزها
const dAgo = (n: number): string => {
  const [y, m, d] = T.split("-").map(Number);
  const dt = new Date(y!, (m ?? 1) - 1, d!);
  dt.setDate(dt.getDate() - n);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
};

describe("libraryProgress — قراردادِ «ادامهٔ خواندن»", () => {
  it("کتاب‌خانهٔ خالی → صفرِ کامل و داستانِ بعدی = s1-1", () => {
    const p = libraryProgress({});
    expect(p.doneCount).toBe(0);
    expect(p.total).toBe(51);
    expect(p.total).toBe(HILL_TOTAL_STORIES);
    expect(p.percent).toBe(0);
    expect(p.complete).toBe(false);
    expect(p.nextStory?.id).toBe("s1-1");
  });

  it("دو داستانِ خوانده‌شده → بعدی = s1-3 و درصدِ رُندِ پایین", () => {
    const p = libraryProgress({
      "s1-1": { score: 6, total: 6, day: "2026-10-20" },
      "s1-2": { score: 5, total: 6, day: "2026-10-21" },
    });
    expect(p.doneCount).toBe(2);
    // 2/51 = 3.92% → floor = 3
    expect(p.percent).toBe(3);
    expect(p.nextStory?.id).toBe("s1-3");
    expect(p.complete).toBe(false);
  });

  it("پرش از ترتیبِ شماره: خواندنِ s2-1 بدونِ کتابِ اول → بعدی همان s1-1 است", () => {
    const p = libraryProgress({ "s2-1": { score: 4, total: 6, day: "2026-10-21" } });
    expect(p.doneCount).toBe(1);
    expect(p.nextStory?.id).toBe("s1-1");
  });

  it("داستانِ تمام‌شدهٔ وسطِ کتاب → بعدی از همان‌جا ادامه می‌دهد", () => {
    const p = libraryProgress({
      "s1-1": { score: 6, total: 6, day: "2026-10-01" },
      "s1-2": { score: 6, total: 6, day: "2026-10-02" },
      "s1-3": { score: 3, total: 6, day: "2026-10-03" },
    });
    expect(p.nextStory?.id).toBe("s1-4");
  });

  it("هر ۵۱ داستان → complete و nextStory = null (کارتِ جشن)", () => {
    const done: Record<string, { score: number; total: number; day: string }> = {};
    for (const s of ["s1-1", "s1-27", "s2-1", "s2-12", "s3-1", "s3-12", "s1-13", "s2-5", "s3-6"]) {
      done[s] = { score: 6, total: 6, day: "2026-10-01" };
    }
    // فقط نمونه نیست — باید «همهٔ ۵۱» پر شوند
    const p0 = libraryProgress(done);
    expect(p0.complete).toBe(false); // 9 از 51
    for (let i = 1; i <= 27; i++) done[`s1-${i}`] = { score: 6, total: 6, day: T };
    for (let i = 1; i <= 12; i++) done[`s2-${i}`] = { score: 5, total: 6, day: T };
    for (let i = 1; i <= 12; i++) done[`s3-${i}`] = { score: 4, total: 6, day: T };
    const p = libraryProgress(done);
    expect(p.doneCount).toBe(51);
    expect(p.complete).toBe(true);
    expect(p.nextStory).toBeNull();
    expect(p.percent).toBe(100);
  });

  it("کلیدِ بیگانه در done شمارش نمی‌شود (گاردِ دوم پس از sanitize)", () => {
    const p = libraryProgress({
      "s1-1": { score: 6, total: 6, day: T },
      "hack-x": { score: 6, total: 6, day: T },
    } as Record<string, { score: number; total: number; day: string }>);
    expect(p.doneCount).toBe(1);
  });
});

describe("storiesReadSince — پنجرهٔ ۷روزهٔ هفته‌نامه/نمودار", () => {
  const done: Record<string, { score: number; total: number; day: string }> = {
    "s1-1": { score: 6, total: 6, day: T }, // امروز
    "s1-2": { score: 5, total: 6, day: dAgo(2) }, // داخلِ پنجرهٔ ۷روزه
    "s1-3": { score: 4, total: 6, day: dAgo(6) }, // مرزِ پایین (شامل)
    "s1-4": { score: 3, total: 6, day: dAgo(7) }, // بیرونِ پنجره
    "s2-1": { score: 6, total: 6, day: dAgo(20) }, // خیلی قدیمی
    "s3-9": { score: 2, total: 6, day: "2026-09-01" }, // ماهِ قبل
  };

  it("پنجرهٔ ۷روزه: مرزِ پایین شامل است — ۳ داستان با تازگیِ نزولی", () => {
    const w = storiesReadSince(done, dAgo(6), T);
    expect(w.count).toBe(3);
    expect(w.ids).toEqual(["s1-1", "s1-2", "s1-3"]);
  });

  it("پنجرهٔ ۳۰روزه: مرزِ پایین شامل است — ۵ داستان", () => {
    const w = storiesReadSince(done, dAgo(29), T);
    expect(w.count).toBe(5);
    expect(w.ids).toEqual(["s1-1", "s1-2", "s1-3", "s1-4", "s2-1"]);
  });

  it("کتاب‌خانهٔ خالی → صفر، بی‌خطا", () => {
    expect(storiesReadSince({}, dAgo(6), T)).toEqual({ count: 0, ids: [] });
  });

  it("کلیدِ بیگانه و رکوردِ بی‌روز حساب نمی‌شود", () => {
    const dirty = {
      "s1-5": { score: 6, total: 6, day: T },
      "hack-y": { score: 6, total: 6, day: T },
      "s1-6": { score: 6, total: 6, day: "" },
    } as Record<string, { score: number; total: number; day: string }>;
    const w = storiesReadSince(dirty, dAgo(6), T);
    expect(w.count).toBe(1);
    expect(w.ids).toEqual(["s1-5"]);
  });

  it("شناسه‌های برگشتی داستان‌های واقعیِ داده‌اند (گردش با storyById)", () => {
    const w = storiesReadSince(done, dAgo(6), T);
    for (const id of w.ids) expect(storyById(id)).toBeDefined();
  });
});
