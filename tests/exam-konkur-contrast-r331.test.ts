// r331 — قفلهایِ سویپِ زندهٔ سطوحِ آزمون/کنکور «در حینِ پاسخگویی» + خانوادهٔ
//   بقایایِ آلفا/رز. چهارده مرحلهٔ dbg پساترمیم (روشن + تاریکِ درجا — الگویِ
//   r330) = صفرِ کامل؛ basis-صفر هم suspects=[] در چهار نما.
//   کشفهایِ راند: ① پاراگرافِ هیروِ کنکور با آلفایِ ۰٫۹ رویِ استاپِ میانیِ
//   نارنجی = ۴٫۳۹ زنده (روشن) — ارتقایِ آلفا به کامل = ۵٫۰۳؛ تاریک از قبل
//   سالم بود (بازنویسیِ گرادیانِ هیرو در تاریک). ② جوهرِ ✗ِ بازخوردِ
//   immediate رویِ stone-50 = ۴٫۳۳ زنده (محاسبهٔ دستیِ مرزی ۴٫۵۰ گمراهگر
//   بود — درسِ r330: سنجشِ زنده حرفِ آخر). ③ چیپِ رزِ نمایِ نتیجه که فقط
//   با wrongIds>0 سوار میشود — در نماهایِ r330 غایب بود. ④ CTAِ تمرینِ
//   هوشمند از توکنِ نرمِ تایلها میخورد درحالیکه توکنِ عمیقِ CTA موجود است —
//   همترازسازیِ نقش، نه تغییرِ برند. ⑤ شمارندههایِ چیپ با آلفایِ ۰٫۷/۰٫۷۵
//   = ۳٫۴۲/۳٫۴۵ زنده (خانوادهٔ مستندِ r329 — درمان: حذفِ آلفا).
//   درسِ r327 رعایت شده: کامنتها الگوهایِ ممنوعِ قدیمی را کامل نقل نمیکنند.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = join(__dirname, "..");
const read = (p: string) => readFileSync(join(root, p), "utf8");
const css = read("src/app/globals.css");
const konkur = read("src/components/study/exam/konkur-view.tsx");
const quizEngine = read("src/components/study/quiz/quiz-engine.tsx");
const listen = read("src/components/study/practice/listen-view.tsx");
const quizResult = read("src/components/study/quiz/quiz-result.tsx");
const smart = read("src/components/study/practice/smart-practice-view.tsx");
const grammar = read("src/components/study/grammar/grammar-lesson-flow.tsx");
const dictation = read("src/components/study/lesson/dictation-tab.tsx");
const vocab = read("src/components/study/lesson/vocab-tab.tsx");
const library = read("src/components/study/library/library-view.tsx");

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
/** جوهرِ آلفادار رویِ زمینهٔ مات — همان ترکیبی که پروبِ زنده انجام میدهد */
const alphaRatio = (inkHex: string, a: number, bgHex: string) => {
  const ink = hex(inkHex), bg = hex(bgHex);
  const eff = [0, 1, 2].map((i) => Math.round(ink[i] * a + bg[i] * (1 - a)));
  const effHex =
    "#" + eff.map((v) => v.toString(16).padStart(2, "0")).join("");
  return ratio(effHex, bgHex);
};

describe("r331 — جفتهایِ زندهسنجیدهشده (بومِ ۱×۱)", () => {
  it("هیروِ کنکور: سفیدِ کامل رویِ بدترینِ استاپِ میانی ≥ ۴٫۹ — آلفایِ ۰٫۹ مردود", () => {
    // زنده: کامل = ۵٫۰۳ · با آلفا = ۴٫۳۹ (روشن؛ تاریک گرادیانِ جدا دارد)
    expect(ratio("#ffffff", "#bb4d00")).toBeGreaterThanOrEqual(4.9);
    expect(alphaRatio("#ffffff", 0.9, "#bb4d00")).toBeLessThan(4.5);
  });
  it("بازخوردِ immediate: جوهرِ رزِ ۷۰۰ رویِ stone-50 ≥ ۵٫۵ — جوهرِ ۶۰۰ = ۴٫۳۳ زنده مردود", () => {
    // زنده: ۷۰۰ → گذراند (بازسنجیِ دوتمی) · ۶۰۰ → ۴٫۳۳
    expect(ratio("#be123c", "#fafaf9")).toBeGreaterThanOrEqual(5.5);
    expect(ratio("#e11d48", "#fafaf9")).toBeLessThan(4.5);
  });
  it("چیپِ نتیجه: رزِ ۷۰۰ رویِ rose-50 ≥ ۵٫۵ — ۶۰۰ رویِ همان تینت = ۴٫۲۸ مردود", () => {
    expect(ratio("#be123c", "#fff1f2")).toBeGreaterThanOrEqual(5.5);
    expect(ratio("#e11d48", "#fff1f2")).toBeLessThan(4.5);
  });
  it("CTAِ تمرینِ هوشمند: سفید رویِ جفتِ عمیقِ آرکید ≥ ۴٫۷ — استاپِ نرمِ ۵۰۰ مردود", () => {
    // زنده: from نرم = ۴٫۲۳ · عمیق = ۵٫۷۰ · to (از قبل درست) = ۴٫۷۱
    expect(ratio("#ffffff", "#7c3aed")).toBeGreaterThanOrEqual(5.5);
    expect(ratio("#ffffff", "#c026d3")).toBeGreaterThanOrEqual(4.5);
    expect(ratio("#ffffff", "#8b5cf6")).toBeLessThan(4.5);
  });
  it("آلفایِ شمارندهٔ چیپ: ۰٫۷ سفید رویِ زمردِ ۷۰۰ و ۰٫۷ سنگ رویِ سنگِ ۱۰۰ هر دو مردود — کاملِ همانها میگذرند", () => {
    // زنده: ۳٫۴۵ و ۳٫۴۲ — درمانِ r329 (حذفِ آلفا)
    expect(alphaRatio("#ffffff", 0.7, "#047857")).toBeLessThan(4.5);
    expect(ratio("#ffffff", "#047857")).toBeGreaterThanOrEqual(5.0);
    expect(alphaRatio("#57534e", 0.7, "#f5f5f4")).toBeLessThan(4.5);
    expect(ratio("#57534e", "#f5f5f4")).toBeGreaterThanOrEqual(6.5);
  });
  it("چیپهایِ کتابخانه: ۰٫۷۵ رویِ teal-700 و سنگِ ۵۰۰ رویِ stone-50 هر دو مردود بودند", () => {
    expect(alphaRatio("#ffffff", 0.75, "#0f766e")).toBeLessThanOrEqual(4.5);
    expect(ratio("#ffffff", "#0f766e")).toBeGreaterThanOrEqual(4.5);
    expect(alphaRatio("#78716c", 0.75, "#fafaf9")).toBeLessThan(4.5);
    expect(ratio("#78716c", "#fafaf9")).toBeGreaterThanOrEqual(4.5);
  });
  it("آیکنهایِ ModeCard (غیرمتنِ ۳:۱) — سنجیده، سالم، قفلشده", () => {
    // زنده/عددی: کهربا ۳٫۰۷ · رز ۴٫۲۸ · زمرد ۳٫۵۸ — همه ≥ ۳
    expect(ratio("#d97706", "#fffbeb")).toBeGreaterThanOrEqual(3.0);
    expect(ratio("#e11d48", "#fff1f2")).toBeGreaterThanOrEqual(3.0);
    expect(ratio("#059669", "#ecfdf5")).toBeGreaterThanOrEqual(3.0);
  });
});

describe("r331 — قفلهایِ منبع (نُه نقطهٔ درمان)", () => {
  it("هیروِ کنکور: پاراگرافِ سفیدِ کامل — بدونِ آلفا", () => {
    expect(konkur).toContain('mt-1 text-[13px] font-bold leading-6 text-white">');
    expect(konkur).not.toContain('leading-6 text-white/90">');
  });
  it("بازخوردهایِ immediate (کوییز + شنیدن): جوهرِ خطا = رزِ ۷۰۰ در هر دو", () => {
    expect(quizEngine).toContain('selected === q.answer ? "text-emerald-700" : "text-rose-700"');
    expect(listen).toContain('selected === item.answer ? "text-emerald-700" : "text-rose-700"');
  });
  it("چیپِ مرورِ اشتباهاتِ نتیجه: رزِ ۷۰۰ رویِ تینتِ رز", () => {
    expect(quizResult).toContain("bg-rose-50 px-3 py-1 text-[12px] font-bold text-rose-700");
  });
  it("تمرینِ هوشمند: چیپِ درصدِ ضعیف = رزِ ۷۰۰ · CTA با جفتِ عمیقِ آرکید", () => {
    expect(smart).toContain("text-[10px] font-black text-rose-700");
    expect(smart).toContain("from-arcade-from to-arcade-to");
    expect(smart).not.toContain("from-arcade-from-soft to-arcade-to");
  });
  it("دستورِ درس: عنوانِ «غلط کلاسیک» و واژهٔ خطخورده = رزِ ۷۰۰", () => {
    expect(grammar).toContain("glesson-mistake-title mb-1.5 flex items-center gap-1 text-[11px] font-black text-rose-700");
    expect(grammar).toContain("glesson-wrong text-rose-700 line-through");
  });
  it("دیکته: حروفِ غلط و «you typed» = رزِ ۷۰۰", () => {
    expect(dictation).toContain("border-rose-300 bg-white text-rose-700 line-through");
    expect(dictation).toContain('text-[12px] text-rose-700" dir="ltr"');
  });
  it("شمارندههایِ چیپ: واژگان و کتابخانه بیآلفا", () => {
    expect(vocab).toContain("{label} <span>({count})</span>");
    expect(vocab).not.toContain('<span className="opacity-70">');
    expect(library).not.toContain("font-bold opacity-75");
  });
  it("تاریکِ امن: جوهرِ رزِ ۷۰۰ همان نگاشتِ تاریکِ ۶۰۰ را دارد + هیروِ تاریکِ مستقل پابرجا", () => {
    expect(css).toContain(".dark .text-rose-700 { color: #fda4af; }");
    expect(css).toContain(".dark .konkur-hero");
  });
});
