// r330 — قفلهایِ داوریِ خانوادهٔ نبرد: سطوحی که فقط با بازیِ واقعی باز
//   میشوند (spell/rush زنده و تمامشد + duel-doneِ دوکلاینتی) — پیشنهادِ
//   ②③ِ راندهایِ ۳۲۸–۳۲۹ که دو راند معلق مانده بود. پروبِ dbg در ۱۱ مرحله
//   (روشن + تاریکِ درجا) پساترمیم = صفرِ کامل؛ basis-صفر هم suspects=[].
//   کشفِ راند: تلهٔ توکنِ جوهر رویِ استاپِ گرادیان — to-orange-700 در تاریک
//   به #fdba74 بازمیگشت (سفید = ۱٫۶۹ زنده؛ CTAهایِ آزمون/کنکورِ از-قبل!)
//   و از-sky-700 به #7dd3fc (۱٫۹) — بازپینِ تاریکِ from/to درمان کرد.
//   درسِ r327 رعایت شده: کامنتها توکنِ ممنوعه را نقل نمیکنند.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = join(__dirname, "..");
const read = (p: string) => readFileSync(join(root, p), "utf8");
const css = read("src/app/globals.css");
const spell = read("src/components/study/duel/spell-rush-view.tsx");
const rush = read("src/components/study/duel/rush-view.tsx");
const podium = read("src/components/study/shared/podium.tsx");
const dot = read("src/components/study/profile/new-badge-dot.tsx");
const quiz = read("src/components/study/quiz/quiz-result.tsx");
const myWordsReview = read("src/components/study/practice/my-words-review.tsx");
const review = read("src/components/study/practice/review-view.tsx");

const lin = (v: number) => {
  const s = v / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
};
const lum = ([r, g, b]: number[]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const hex = (h: string): number[] => [
  parseInt(h.slice(1, 3), 16),
  parseInt(h.slice(3, 5), 16),
  parseInt(h.slice(5, 7), 16),
];
const ratio = (a: string, b: string) => {
  const l1 = lum(hex(a)), l2 = lum(hex(b));
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
};

describe("r330 — جفتهایِ زندهسنجیدهشده (بومِ ۱×۱)", () => {
  it("سفید رویِ جفتهایِ نو: کهربا/نارنجیِ ۷۰۰ و آسمان/فیروزهایِ ۷۰۰ ≥ ۵٫۱۸", () => {
    // زنده: ۵٫۰۳ · ۵٫۲۲ · ۵٫۸۶ · ۵٫۲۸ — و مردودهایِ کهنه: ۲٫۱۳ (ازِ ۵۰۰) و ۲٫۷۱
    expect(ratio("#ffffff", "#bb4d00")).toBeGreaterThanOrEqual(4.9);
    expect(ratio("#ffffff", "#c2410c")).toBeGreaterThanOrEqual(5.1);
    expect(ratio("#ffffff", "#0369a1")).toBeGreaterThanOrEqual(5.3);
    expect(ratio("#ffffff", "#0e7490")).toBeGreaterThanOrEqual(5.1);
    expect(ratio("#ffffff", "#fe9a00")).toBeLessThan(3.0); // کهربایِ خامِ کهنه
  });
  it("جوهرهایِ HUD و کمبو: نارنجیِ -۷۰۰ رویِ سفید = ۵٫۲۲ · سنگِ -۵۰۰ رویِ stone-50 = ۵٫۳", () => {
    // زنده: تایمرِ -۶۰۰ = ۳٫۵۸ · کمبویِ غیرفعالِ سنگِ ۳۰۰ = ۱٫۴۳
    expect(ratio("#c2410c", "#ffffff")).toBeGreaterThanOrEqual(5.1);
    expect(ratio("#78716c", "#fafaf9")).toBeGreaterThanOrEqual(4.5); // sRGB؛ توکنِ v4 (lab) زنده ۵٫۳
    expect(ratio("#d6d3d1", "#fafaf9")).toBeLessThan(2.0); // جوهرِ کهنهٔ کمبو
  });
  it("سکو: جوهرِ سنگِ ۹۰۰ رویِ استاپهایِ روشنِ همهٔ واریانتها ≥ ۶٫۵", () => {
    // زنده: #44403c رویِ استاپِ آخرِ سنگ/نارنجی = ۳٫۹۷/۴٫۳۲ — مردود
    expect(ratio("#44403c", "#a6a09b")).toBeLessThan(4.5);
    expect(ratio("#1c1917", "#a6a09b")).toBeGreaterThanOrEqual(6.5);
    expect(ratio("#1c1917", "#ff8904")).toBeGreaterThanOrEqual(6.5);
    expect(ratio("#1c1917", "#fe9a00")).toBeGreaterThanOrEqual(6.5);
  });
  it("نقطهٔ نشان: کهربایِ -۷۰۰ زیرِ شمارنده = ۵٫۰۳ — پینگِ پشتیبانِ بی‌متن", () => {
    // زنده: -۵۰۰یِ کهنه = ۱٫۵۲ · وسطِ پولسِ رویِ خودِ عدد = ۲٫۴–۳٫۳
    expect(ratio("#ffffff", "#bb4d00")).toBeGreaterThanOrEqual(4.9);
    expect(dot).not.toContain("animate-pulse");
    expect(dot).toContain("animate-ping");
    expect(dot).toContain('bg-amber-700/60');
    expect(dot).toContain('<span className="relative">');
  });
});

describe("r330 — قفلهایِ منبع", () => {
  it("CTAهایِ کهربا/نارنجیِ خانوادهٔ نبرد رویِ جفتِ ۷۰۰/۷۰۰ — نه ازِ ۵۰۰", () => {
    for (const [name, src] of [["rush", rush], ["spell", spell], ["my-words-review", myWordsReview], ["review", review]] as const) {
      expect(src, name).not.toContain("from-amber-500 to-orange-600");
      expect(src, name).toContain("from-amber-700 to-orange-700");
    }
  });
  it("CTAهایِ آسمان/فیروزهایِ املابازی رویِ جفتِ ۷۰۰/۷۰۰", () => {
    expect(spell).not.toContain("from-sky-500 to-cyan-600");
    expect((spell.match(/from-sky-700 to-cyan-700/g) ?? []).length).toBe(5);
  });
  it("چیپهایِ رزِ نمایِ تمامشد به -۷۰۰ — هم راش هم املابازی", () => {
    expect(rush).toContain("bg-rose-50 px-3 py-1 text-rose-700");
    expect(spell).toContain("bg-rose-50 px-3 py-1 text-rose-700");
    expect(rush).not.toContain("bg-rose-50 px-3 py-1 text-rose-600");
    expect(spell).not.toContain("bg-rose-50 px-3 py-1 text-rose-600");
  });
  it("سرفصلهایِ نتیجهٔ آزمون به -۷۰۰ (خانوادهٔ چهارگانه)", () => {
    expect(quiz).toContain('head: "text-amber-700"');
    expect(quiz).toContain('head: "text-emerald-700"');
    expect(quiz).toContain('head: "text-orange-700"');
    expect(quiz).toContain('head: "text-violet-700"');
    expect(quiz).not.toContain('head: "text-amber-600"');
  });
  it("سکوها و HUD: نارنجیِ -۷۰۰ در رتبهٔ سکویِ نارنجی و رتبهٔ سنگِ ۹۰۰", () => {
    expect(podium).toContain('metricCls: "flex items-center gap-1 text-[12px] font-black text-orange-700"');
    const hits = podium.match(/rankCls: "[^"]+"/g) ?? [];
    expect(hits).toHaveLength(3);
    for (const h of hits) expect(h).toContain("text-[#1c1917]");
  });
});

describe("r330 — بازپینهایِ تاریک (تلهٔ توکنِ جوهر رویِ استاپ)", () => {
  it("ازِ آسمانِ ۷۰۰ و بهِ نارنجیِ ۷۰۰ در تاریک به مقدارِ روشنِ چاپی بازپین شدهاند", () => {
    expect(css).toContain(".dark .from-sky-700 { --tw-gradient-from: #0369a1; }");
    expect(css).toContain(".dark .to-orange-700 { --tw-gradient-to: #c2410c; }");
  });
  it("توکنهایِ جوهرِ تاریک دستنخورده — بازپین فقط رویِ from/to است", () => {
    // متنِ text-orange-700/text-sky-700 در تاریک همچنان جوهرِ روشنِ خانواده را میگیرد
    expect(css).toContain("--color-orange-700: #fdba74");
    expect(css).toContain("--color-sky-700: #7dd3fc");
  });
});
