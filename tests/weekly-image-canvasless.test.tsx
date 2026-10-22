// @vitest-environment jsdom
// Task 104 — قراردادِ محیطِ بی‌کانواس: downloadWeeklyImage در jsdom (getContext=null)
// باید false بدهد و هیچ استثنایی پرتاب نکند — همان قراردادِ خانوادهٔ کارت‌ها.
// r285 — فیلدِ الزامیِ badges: هم بی‌نشان ([]) و هم نشان‌دار باید falseِ صادق
// بدهند — ساختِ کارت هرگز به‌خاطرِ نوارِ نشانها نمی‌شکند.
import { describe, it, expect } from "vitest";
import { downloadWeeklyImage, buildWeeklyBlob } from "@/lib/result-image";

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

  // r306 — دروازهٔ دوم (هم‌رسانیِ بومی): buildWeeklyBlob در بی‌کانواس nullِ
  // صادق بدهد — بدونِ انفجار؛ سازندهٔ blob هم همان قراردادِ خانواده را دارد
  it("blobِ nullِ صادق از buildWeeklyBlob (r306) — بی‌انفجار", async () => {
    const blob = await buildWeeklyBlob({
      activities: 15,
      reviews: 8,
      quizzes: 2,
      words: 5,
      dictation: 0,
      rush: 0,
      goalDays: 2,
      streak: 4,
      storiesMonth: { total: 6, activeDays: 5, bestCount: 2 },
      badges: [],
    });
    expect(blob).toBe(null);
  });

  // r307 — نوارِ ۳۰خانه‌ای (storiesMonthPerDay) هم از همان گارد میگذرد؛
  // آرایهٔ ۳۰تاییِ کامل و کوتاهِ ناقص هر دو بی‌انفجار
  it("falseِ صادق با storiesMonthPerDay (r307) — بی‌انفجار", async () => {
    const ok = await downloadWeeklyImage({
      activities: 15,
      reviews: 8,
      quizzes: 2,
      words: 5,
      dictation: 0,
      rush: 0,
      goalDays: 2,
      streak: 4,
      storiesMonth: { total: 6, activeDays: 5, bestCount: 2 },
      storiesMonthPerDay: [0, 1, 2, 3, 0], // طولِ ناقص — گاردِ length===30 می‌گذردش
      badges: [],
    });
    expect(ok).toBe(false);
  });

  // r308 — نوارِ ۱۴روزهٔ هفته (weekPerDay): آرایهٔ کاملِ ۱۴تایی روی بومِ
  // ۹۲۰px و کوتاهِ ناقص هر دو از گاردِ بی‌کانواس میگذرند — یا نوارِ کامل یا هیچ
  it("falseِ صادق با weekPerDay کامل (r308) — بی‌انفجار", async () => {
    const ok = await downloadWeeklyImage({
      activities: 15,
      reviews: 8,
      quizzes: 2,
      words: 5,
      dictation: 0,
      rush: 0,
      goalDays: 2,
      streak: 4,
      weekPerDay: [
        { total: 2, inThisWeek: false },
        { total: 0, inThisWeek: false },
        { total: 5, inThisWeek: false },
        { total: 1, inThisWeek: false },
        { total: 0, inThisWeek: false },
        { total: 3, inThisWeek: false },
        { total: 4, inThisWeek: false },
        { total: 6, inThisWeek: true },
        { total: 0, inThisWeek: true },
        { total: 2, inThisWeek: true },
        { total: 8, inThisWeek: true },
        { total: 1, inThisWeek: true },
        { total: 0, inThisWeek: true },
        { total: 3, inThisWeek: true },
      ],
      storiesMonth: { total: 6, activeDays: 5, bestCount: 2 },
      storiesMonthPerDay: Array.from({ length: 30 }, (_, i) => (i % 4 === 0 ? 2 : 0)),
      badges: [],
    });
    expect(ok).toBe(false);
  });

  it("falseِ صادق با weekPerDay ناقص (r308) — گاردِ length===14", async () => {
    const ok = await downloadWeeklyImage({
      activities: 15,
      reviews: 8,
      quizzes: 2,
      words: 5,
      dictation: 0,
      rush: 0,
      goalDays: 2,
      streak: 4,
      weekPerDay: [{ total: 2, inThisWeek: false }, { total: 5, inThisWeek: true }],
      badges: [],
    });
    expect(ok).toBe(false);
  });

  it("blobِ nullِ صادق با weekPerDay (r308) — دروازهٔ هم‌رسانی هم بی‌انفجار", async () => {
    const blob = await buildWeeklyBlob({
      activities: 15,
      reviews: 8,
      quizzes: 2,
      words: 5,
      dictation: 0,
      rush: 0,
      goalDays: 2,
      streak: 4,
      weekPerDay: Array.from({ length: 14 }, (_, i) => ({
        total: i % 3,
        inThisWeek: i >= 7,
      })),
      badges: [],
    });
    expect(blob).toBe(null);
  });
});
