// @vitest-environment jsdom
// r286 — قراردادِ محیطِ بی‌کانواس برایِ کارتِ کارنامهٔ رسمی: downloadOfficialImage
// در jsdom (getContext=null) باید false بدهد و هیچ استثنایی پرتاب نکند —
// همان قراردادِ خانوادهٔ کارت‌ها. هم بی‌نشان و هم نشان‌دار.
import { describe, it, expect } from "vitest";
import { downloadOfficialImage, buildOfficialBlob } from "@/lib/result-image";

describe("downloadOfficialImage — بی‌کانواس (r286)", () => {
  const base = {
    knownCount: 12,
    totalVocabulary: 477,
    avgPercent: 78,
    monthTotal: 34,
    bestStreak: 6,
    streak: 2,
    learnerCode: "ABCD1234",
    userName: "پرنیان ف",
  };

  it("falseِ صادق بدونِ انفجار — بی‌نشان", async () => {
    const ok = await downloadOfficialImage({ ...base, badges: [] });
    expect(ok).toBe(false);
  });

  it("falseِ صادق بدونِ انفجار — با نشانهای باز", async () => {
    const ok = await downloadOfficialImage({
      ...base,
      badges: [
        { title: "اولین قدم", tier: "bronze" },
        { title: "اولین دیده‌شدن", tier: "bronze" },
      ],
    });
    expect(ok).toBe(false);
  });

  // r306 — فیلدِ اختیاریِ storiesMonth (سطرِ ماه‌نامه روی کارتِ رسمی) هم از
  // همان گاردِ بی‌کانواس میگذرد — هر افزودهٔ اختیاریِ کارت این‌جا قفل میشود
  it("falseِ صادق با storiesMonth (r306) — بی‌انفجار", async () => {
    const ok = await downloadOfficialImage({
      ...base,
      storiesMonth: { total: 6, activeDays: 5, bestCount: 2 },
      badges: [],
    });
    expect(ok).toBe(false);
  });

  // r307 — دروازهٔ دومِ کارتِ رسمی: buildOfficialBlob در بی‌کانواس nullِ صادق
  it("blobِ nullِ صادق از buildOfficialBlob (r307) — بی‌انفجار", async () => {
    const blob = await buildOfficialBlob({
      ...base,
      storiesMonth: { total: 6, activeDays: 5, bestCount: 2 },
      badges: [],
    });
    expect(blob).toBe(null);
  });

  // r309 — نوارِ ۱۴روزه روی کارتِ رسمی: قراردادِ کاملِ ۱۴تایی هم از گاردِ
  // بی‌کانواس میگذرد — falseِ صادق، بدونِ انفجار (نقاشِ مشترکِ drawWeekStrip14)
  it("falseِ صادق با weekPerDayِ کاملِ ۱۴تایی (r309) — بی‌انفجار", async () => {
    const weekPerDay = Array.from({ length: 14 }, (_, i) => ({
      total: i >= 7 ? (i % 3) + 1 : i % 2,
      inThisWeek: i >= 7,
    }));
    const ok = await downloadOfficialImage({
      ...base,
      weekPerDay,
      storiesMonth: { total: 6, activeDays: 5, bestCount: 2 },
      badges: [
        { title: "اولین قدم", tier: "bronze" },
        { title: "زنجیرهٔ هفتگی", tier: "silver" },
      ],
    });
    expect(ok).toBe(false);
  });

  // r309 — آرایهٔ ناقص (کوتاهتر از ۱۴): نوار کشیده نمیشود و کارت نمی‌شکند —
  // گاردِ طولِ ۱۴ همان گاردِ کارتِ هفته‌نامه است
  it("falseِ صادق با weekPerDayِ ناقص — نوارِ خاموش، بی‌انفجار", async () => {
    const ok = await downloadOfficialImage({
      ...base,
      weekPerDay: [{ total: 3, inThisWeek: true }],
      badges: [],
    });
    expect(ok).toBe(false);
  });
});
