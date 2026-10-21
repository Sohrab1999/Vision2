// @vitest-environment jsdom
// r286 — قراردادِ محیطِ بی‌کانواس برایِ کارتِ کارنامهٔ رسمی: downloadOfficialImage
// در jsdom (getContext=null) باید false بدهد و هیچ استثنایی پرتاب نکند —
// همان قراردادِ خانوادهٔ کارت‌ها. هم بی‌نشان و هم نشان‌دار.
import { describe, it, expect } from "vitest";
import { downloadOfficialImage } from "@/lib/result-image";

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
});
