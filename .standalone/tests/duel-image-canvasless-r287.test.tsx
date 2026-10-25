// @vitest-environment jsdom
// r287 — قراردادِ محیطِ بی‌کانواس برایِ کارتِ نبرد: downloadDuelDoneImage و
// buildDuelDoneBlob در jsdom (getContext=null) باید null/false بدهند و هیچ
// استثنایی پرتاب نکنند — همان قراردادِ خانوادهٔ کارت‌ها (r286). هم بی‌نشان و
// هم نشان‌دار؛ badges اکنون فیلدِ الزامیِ قرارداد است (سرشماریِ زمان‌کامپایل).
import { describe, it, expect } from "vitest";
import { downloadDuelDoneImage, buildDuelDoneBlob } from "@/lib/result-image";

const base = {
  outcome: "win" as const,
  forfeit: false,
  myName: "پرنیان ف",
  oppName: "آرتین ر",
  myScore: 999,
  oppScore: 1150,
  myCorrect: 8,
  oppCorrect: 9,
  total: 10,
  durationSec: 95,
  base: 800,
  bonus: 199,
  receipt: false,
};

describe("کارتِ نبرد — بی‌کانواس (r287)", () => {
  it("falseِ صادق بدونِ انفجار — بی‌نشان", async () => {
    const ok = await downloadDuelDoneImage({ ...base, badges: [] });
    expect(ok).toBe(false);
    const blob = await buildDuelDoneBlob({ ...base, badges: [] });
    expect(blob).toBeNull();
  });

  it("falseِ صادق بدونِ انفجار — با نشانهای باز", async () => {
    const ok = await downloadDuelDoneImage({
      ...base,
      badges: [
        { title: "اولین قدم", tier: "bronze" },
        { title: "اولین دیده‌شدن", tier: "bronze" },
        { title: "شکارچیِ رقیب", tier: "silver" },
      ],
    });
    expect(ok).toBe(false);
    const blob = await buildDuelDoneBlob({
      ...base,
      badges: [{ title: "شکارچیِ رقیب", tier: "silver" }],
    });
    expect(blob).toBeNull();
  });
});
