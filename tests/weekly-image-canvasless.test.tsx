// @vitest-environment jsdom
// Task 104 — قراردادِ محیطِ بی‌کانواس: downloadWeeklyImage در jsdom (getContext=null)
// باید false بدهد و هیچ استثنایی پرتاب نکند — همان قراردادِ خانوادهٔ کارت‌ها.
// r285 — فیلدِ الزامیِ badges: هم بی‌نشان ([]) و هم نشان‌دار باید falseِ صادق
// بدهند — ساختِ کارت هرگز به‌خاطرِ نوارِ نشانها نمی‌شکند.
import { describe, it, expect } from "vitest";
import { downloadWeeklyImage } from "@/lib/result-image";

describe("downloadWeeklyImage — بی‌کانواس (Task 104 + r285)", () => {
  it("falseِ صادق بدونِ انفجار — بی‌نشان", async () => {
    const ok = await downloadWeeklyImage({
      activities: 15,
      reviews: 8,
      quizzes: 2,
      words: 5,
      dictation: 0,
      rush: 0,
      goalDays: 2,
      streak: 4,
      bestDay: { label: "۱۴/۱۰", total: 8 },
      badges: [],
    });
    expect(ok).toBe(false);
  });

  it("falseِ صادق بدونِ انفجار — با نشانهای باز (نوارِ نشانها روی بوم)", async () => {
    const ok = await downloadWeeklyImage({
      activities: 15,
      reviews: 8,
      quizzes: 2,
      words: 5,
      dictation: 0,
      rush: 0,
      goalDays: 2,
      streak: 4,
      bestDay: { label: "۱۴/۱۰", total: 8 },
      badges: [
        { title: "اولین قدم", tier: "bronze" },
        { title: "اولین دیده‌شدن", tier: "bronze" },
      ],
    });
    expect(ok).toBe(false);
  });

  // r303 — فیلدِ اختیاریِ storiesStreak باید از همان گاردِ بی‌کانواس بگذرد
  // (falseِ صادق، بدونِ انفجار) — هر افزودهٔ اختیاریِ کارتِ PNG همین‌جا قفل میشود
  it("falseِ صادق با storiesStreak (r303) — بی‌انفجار", async () => {
    const ok = await downloadWeeklyImage({
      activities: 15,
      reviews: 8,
      quizzes: 2,
      words: 5,
      dictation: 0,
      rush: 0,
      goalDays: 2,
      streak: 4,
      bestDay: { label: "۱۴/۱۰", total: 8 },
      storiesWeek: 3,
      storiesStreak: { current: 2, longest: 4 },
      badges: [],
    });
    expect(ok).toBe(false);
  });

  // r305 — فیلدِ اختیاریِ storiesMonth (سطرِ ماه‌نامه) هم از همان گارد میگذرد؛
  // کارتِ بلندترِ ۷۷۶px هم نباید در بی‌کانواس بترکد
  it("falseِ صادق با storiesMonth (r305) — بی‌انفجار", async () => {
    const ok = await downloadWeeklyImage({
      activities: 15,
      reviews: 8,
      quizzes: 2,
      words: 5,
      dictation: 0,
      rush: 0,
      goalDays: 2,
      streak: 4,
      bestDay: { label: "۱۴/۱۰", total: 8 },
      storiesWeek: 3,
      storiesStreak: { current: 2, longest: 4 },
      storiesMonth: { total: 6, activeDays: 5, bestCount: 2 },
      badges: [],
    });
    expect(ok).toBe(false);
  });
});
