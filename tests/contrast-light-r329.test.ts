// r329 — قفلهایِ سویپِ روشنِ کنتراست (پیشنهادهایِ ①②③ِ r328 اجرا شد).
//   هر مقدار با رزولورِ بوم زنده سنجیده شده (scripts/qa-r329-light-sweep.sh +
//   r328-fails-dbg.js) و بعد قفل میشود — هم در ریاضیِ WCAG، هم متنی در منبع.
//   کشفِ راند: دو خانوادهٔ «جوهرِ -۷۰۰ رویِ تینتِ -۵۰» در واقع قربانیِ
//   opacity بودند (srs opacity-80 · report opacity-75 — ضربِ جوهر، درسِ
//   spine راند ۳۲۸)؛ در آلفایِ کامل همان جوهرها ≥۴٫۷ زندهسنجیدهاند.
//   درسِ r327 رعایت شده: کامنتها توکنِ ممنوعه را نقل نمیکنند.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = join(__dirname, "..");
const read = (p: string) => readFileSync(join(root, p), "utf8");
const css = read("src/app/globals.css");
const srs = read("src/components/study/practice/srs-panel.tsx");
const reportCard = read("src/components/study/reports/report-card.tsx");
const weekly = read("src/components/study/reports/weekly-report.tsx");
const leaderboard = read("src/components/study/duel/leaderboard.tsx");
const danger = read("src/components/study/practice/danger-words.tsx");
const skillStats = read("src/lib/skill-stats.ts");
const wordDay = read("src/components/study/lesson/word-of-day.tsx");
const badges = read("src/components/study/practice/badges.tsx");
const homeToday = read("src/components/study/home/home-today.tsx");
const myWords = read("src/components/study/practice/my-words.tsx");
const spell = read("src/components/study/duel/spell-rush-view.tsx");
const dictionary = read("src/components/study/lesson/dictionary-view.tsx");
const dictation = read("src/components/study/lesson/dictation-tab.tsx");
const flashcards = read("src/components/study/lesson/flashcards.tsx");
const bookshelf = read("src/components/study/home/home-bookshelf.tsx");

// ——— ریاضیِ WCAG رویِ جفتهایِ زندهسنجیدهشده ———
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
const over = (ink: string, bg: string, a: number) =>
  hex(ink).map((v, i) => Math.round(v * a + hex(bg)[i] * (1 - a)));
const rgbHex = (c: number[]) => "#" + c.map((v) => v.toString(16).padStart(2, "0")).join("");
const ratioA = (ink: string, bg: string, a: number) => ratio(rgbHex(over(ink, bg, a)), bg);

describe("r329 — چرا آلفا/جوهر عوض شد (ریاضیِ زنده)", () => {
  it("ضربِ جوهر: سفیدِ ۸۵٪ رویِ گرادیانِ نشان زیرِ ۴٫۵ می‌ماند — کامل بالایِ ۴٫۹", () => {
    // زنده: ۴٫۰۴/۴٫۰۷ با /۸۵ · ۴٫۷۴/۵٫۰۳ کامل (روشن و تاریک)
    expect(ratioA("#ffffff", "#bb4d00", 0.85)).toBeLessThan(4.5);
    expect(ratioA("#ffffff", "#a65f00", 0.85)).toBeLessThan(4.5);
    expect(ratio("#ffffff", "#bb4d00")).toBeGreaterThanOrEqual(4.9);
    expect(ratio("#ffffff", "#a65f00")).toBeGreaterThanOrEqual(4.5);
  });
  it("رز: -۶۰۰ رویِ تینت‌های خانواده مردود — -۷۰۰/-۸۰۰ زنده ≥ ۵٫۵", () => {
    // زنده: ۴٫۱۲/۴٫۳۸ رویِ rose-50 و ۳٫۷۷ رویِ rose-100 با -۶۰۰
    expect(ratio("#e11d48", "#fff1f2")).toBeLessThan(4.5);
    expect(ratio("#e11d48", "#ffe4e6")).toBeLessThan(4.5);
    expect(ratio("#be123c", "#fff1f2")).toBeGreaterThanOrEqual(5.0);
    expect(ratio("#9f1239", "#ffe4e6")).toBeGreaterThanOrEqual(5.5);
  });
  it("کهربا: -۶۰۰ رویِ سفید = ۳٫۲ (زنده — زبانهٔ نمرات) — -۸۰۰ ≥ ۶٫۵", () => {
    // آلفایِ ۸۵٪ رویِ نشان: بلوکِ نخست. جوهرِ کاملِ سفید رویِ گرادیانِ کهربا زنده = ۵٫۰۳
    expect(ratio("#d97706", "#ffffff")).toBeLessThan(4.5);
    expect(ratio("#92400e", "#ffffff")).toBeGreaterThanOrEqual(6.5);
    expect(ratio("#92400e", "#fffbeb")).toBeGreaterThanOrEqual(6.5);
  });
  it("آسمان: -۶۰۰ رویِ سفید = ۴٫۰ (زنده) — -۷۰۰ ≥ ۵٫۳ رویِ سفید و sky-50", () => {
    expect(ratio("#0284c7", "#ffffff")).toBeLessThan(4.5);
    expect(ratio("#0369a1", "#ffffff")).toBeGreaterThanOrEqual(5.3);
    expect(ratio("#0369a1", "#f0f9ff")).toBeGreaterThanOrEqual(5.3);
  });
  it("باندِ هفتگیِ تاریک: سفید رویِ #0d9488 = ۳٫۵۴ (زنده) — رویِ #0f766e ≥ ۴٫۷", () => {
    expect(ratio("#ffffff", "#0d9488")).toBeLessThan(4.5);
    expect(ratio("#ffffff", "#0f766e")).toBeGreaterThanOrEqual(4.7);
  });
  it("سکویِ کهرباییِ تاریک: سفیدِ ۹۰٪ رویِ ازِ #b45309 = ۴٫۳۹ (زنده) — ازِ نو ≥ ۵", () => {
    expect(ratioA("#ffffff", "#b45309", 0.9)).toBeLessThan(4.5);
    expect(ratioA("#ffffff", "#92400e", 0.9)).toBeGreaterThanOrEqual(4.9);
  });
  it("زمرد/فیروزهایِ -۸۰۰ رویِ ظرفِ روشن ≥ ۶٫۵ (کاشیهایِ دلتا)", () => {
    expect(ratio("#065f46", "#fefefe")).toBeGreaterThanOrEqual(6.5);
    expect(ratio("#115e59", "#fefefe")).toBeGreaterThanOrEqual(6.5);
  });
});

describe("r329 — قفلهایِ منبع: حذفِ آلفاها و جوهرهایِ عمیق", () => {
  it("srs-panel: برچسبِ چیپ بی‌آلفا و رزِ خانواده -۷۰۰", () => {
    expect(srs).not.toContain("font-bold opacity-80");
    expect(srs).toContain('cls: "bg-rose-50 text-rose-700"');
    expect(srs).toContain("bg-rose-50 px-2 py-0.5 text-[10px] font-black text-rose-700");
    expect(srs).toContain('<span className="text-rose-700">{faNum(dueTotal)}');
  });
  it("report-card: برچسبِ رکوردها بی‌آلفا", () => {
    expect(reportCard).not.toContain("font-bold opacity-75");
    expect(reportCard).toContain('<div className="text-[10px] font-bold">{r.label}</div>');
  });
  it("badges: توضیحِ نشانِ بازِ کاملِ سفید — نه آلفایِ ۸۵٪", () => {
    expect(badges).not.toContain("text-white/85");
    expect(badges).toContain('isUnlocked ? "text-white" : "text-stone-500"');
  });
  it("weekly: کاشیهایِ دلتا -۸۰۰ و دفترِ یخ -۷۰۰", () => {
    expect(weekly).toContain('cls: "text-amber-800"');
    expect(weekly).toContain('cls: "text-emerald-800"');
    expect(weekly).toContain('cls: "text-teal-800"');
    expect(weekly).not.toContain('cls: "text-amber-600"');
    expect(weekly).toContain('gold ? "text-amber-800" : "text-emerald-700"');
    expect(weekly).toContain("text-sky-700");
    expect(weekly).not.toContain("text-sky-600");
  });
  it("leaderboard: زبانهٔ نمرات کهربایِ -۸۰۰", () => {
    expect(leaderboard).toContain('tabBtn("exams", "نمرات آزمون", Trophy, "text-amber-800")');
    expect(leaderboard).not.toContain('"text-amber-600")');
  });
  it("danger-words + skill-stats + bookshelf + flashcards + my-words: رز/کهربای عمیق", () => {
    expect(danger).toContain('hot ? "text-rose-700" : "text-amber-800"');
    expect(danger).toContain("bg-rose-50 px-1.5 py-0.5 text-[10px] font-bold text-rose-700");
    expect(danger).toContain("bg-rose-100 px-2 py-0.5 text-[10px] font-black text-rose-800");
    expect(skillStats).toContain('cls: "bg-rose-100 text-rose-800"');
    expect(bookshelf).toContain("bg-rose-50 px-2 py-1 font-bold text-rose-700");
    expect(flashcards).toContain("bg-rose-50 px-5 py-2.5 text-sm font-bold text-rose-700");
    expect(myWords).toContain("bg-rose-50 text-rose-700 hover:bg-rose-100");
  });
  it("word-of-day: جوهرهای -۸۰۰ رویِ گرادیانِ واژهٔ امروز", () => {
    expect(wordDay).toContain("text-[12px] font-black text-emerald-800");
    expect(wordDay).toContain("text-[12px] font-bold text-teal-800");
  });
  it("خانوادهٔ آسمان: today/my-words/spell/dictionary/dictation -۷۰۰", () => {
    expect(homeToday).toContain('text-[10.5px] font-bold text-sky-700');
    expect(myWords).toContain('text-lg font-black text-sky-700');
    expect(myWords).not.toContain("text-sky-600/80");
    expect(spell).toContain("bg-sky-100 text-sky-700");
    expect(spell).toContain('"text-rose-600" : "text-sky-700"');
    expect(dictionary).toContain("bg-sky-50 text-sky-700");
    expect(dictation).toContain("border-sky-200 bg-white text-sky-700");
  });
});

describe("r329 — قفلهایِ کرنل (globals.css)", () => {
  it("باندِ هفتگیِ تاریک رویِ استاپِ عمیق — و ازِ کهربایِ سکو عمیق‌تر", () => {
    expect(css).toContain("linear-gradient(to left, #065f46, #047857, #0f766e)");
    expect(css).not.toContain("linear-gradient(to left, #065f46, #047857, #0d9488)");
    expect(css).toContain(".dark .from-amber-400,.dark .from-amber-300 { --tw-gradient-from: #92400e; }");
    expect(css).not.toContain("--tw-gradient-from: #b45309");
  });
  it("رزِ -۸۰۰ به باندِ جوهرِ رزِ تاریک پیوست و دوقلویِ word-day -۸۰۰ هم", () => {
    expect(css).toContain(".dark .text-rose-800 { color: #fda4af; }");
    expect(css).toContain(".dark .word-day .text-emerald-700,.dark .word-day .text-emerald-800 { color: #34d399; }");
  });
  it("c-chip-freeze رویِ آسمانِ ۷۰۰ — مقدارِ کهنهٔ آسمانِ ۶۰۰ نمانده", () => {
    expect(css).toContain("color: lab(41.6013 -9.10804 -42.5647); /* sky-700 */");
    expect(css).not.toContain("color: lab(51.7754 -11.4712 -49.8349); /* sky-600 */");
  });
});
