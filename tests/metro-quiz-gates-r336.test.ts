// r336 — قفلهایِ سویپِ زندهٔ درگاههایِ آزمونیِ مترو (آزمونکِ ایستگاه +
//   آزمونِ شناختِ خط — QuizEngine از این دو درگاه در حینِ پاسخگویی برایِ
//   نخستینبار با دستِ واقعی پاسخ داده شد: ۱۰ بازخوردِ ✓/✗ زنده — ۲ درست
//   و ۸ غلط — و دو نمایِ نتیجه در دو تم: همه صفر) + کشفِ یگانهٔ راند:
//   چیپِ «شعلهٔ زنجیرهٔ» هدر (c-chip-flame) تنها عضوِ خانوادهٔ c-chip با
//   بازنگاشتِ ناقصِ تاریک بود — background-imageِ روشن (amber-50→orange-50)
//   مانده بود و جوهرِ amber-400 رویِ آن ۱٫۵۷ (دسکتاپِ ۱۲۸۰؛ در موبایل
//   hidden و با شخصیتهایِ بیدایهیستوری streak=0 بود چیپ اصلاً رندر
//   نمیشد — درسِ r332 در قالبِ یک کوریِ زندهٔ تازه).
//   درسِ r327 رعایت شده: کامنتها توکنِ ممنوعِ کامل را نقل نمیکنند.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = join(__dirname, "..");
const read = (p: string) => readFileSync(join(root, p), "utf8");
const css = read("src/app/globals.css");
const header = read("src/components/study/shell/header.tsx");
const grammarView = read("src/components/study/grammar/grammar-view.tsx");

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
const over = (top: number[], a: number, bottom: number[]) =>
  "#" + top.map((v, i) => Math.round(v * a + bottom[i] * (1 - a)).toString(16).padStart(2, "0")).join("");

describe("r336 — جفتِ زندهسنجیدهشده: جوهرِ amber-400 رویِ شستشوهایِ تاریکِ شعله ≥ ۴٫۵ (بازتولیدِ ۱٫۵۷)", () => {
  it("هر دو استاپِ شستشو رویِ بدنهٔ #1c1917 زیرِ amber-400 میگذرند — سطحِ روشنِ مانده مردود بود", () => {
    const page = hex("#1c1917");
    const stopA = over(hex("#45300c"), 0.35, page); // amber-50 تاریکِ کرنل
    const stopB = over(hex("#582c0e"), 0.4, page); // orange-50 تاریکِ کرنل
    expect(ratio("#fbbf24", stopA)).toBeGreaterThanOrEqual(4.5);
    expect(ratio("#fbbf24", stopB)).toBeGreaterThanOrEqual(4.5);
    // بازتولیدِ مردودِ کهنه: amber-400 رویِ amber-50ِ روشن = ۱٫۵۷
    expect(ratio("#fbbf24", "#fffbeb")).toBeLessThan(2);
  });
});

describe("r336 — قفلهایِ منبع", () => {
  it("c-chip-flame در تاریک background-image را بازمیگرداند — عینِ نگاشتهایِ کرنلِ amber-50/orange-50", () => {
    const dark = css.match(/\.dark \.c-chip-flame \{[\s\S]*?\}/);
    expect(dark).not.toBeNull();
    expect(dark?.[0]).toContain(
      "background-image: linear-gradient(to left, rgba(69, 48, 12, 0.35), rgba(88, 44, 14, 0.4))",
    );
    expect(dark?.[0]).toContain("color: rgb(251, 191, 36)");
  });
  it("کاملبودنِ خانوادهٔ c-chip: هر پنج عضو در تاریک سطح را بازمیگردانند — هیچ عضوی دوباره ناقص نمیماند", () => {
    for (const fam of ["goal", "freeze", "due", "duel", "flame"]) {
      const rule = css.match(new RegExp(`\\.dark \\.c-chip-${fam} \\{[\\s\\S]*?\\}`));
      expect(rule, fam).not.toBeNull();
      expect(rule?.[0]).toMatch(/background-(color|image):/);
      expect(rule?.[0]).toMatch(/color:/);
    }
  });
  it("چیپِ شعله فقط از sm نمایان است — سندِ کوریِ موبایلیِ QAهایِ گذشته", () => {
    const chip = header.match(/className="[^"]*c-chip-flame[^"]*"/);
    expect(chip).not.toBeNull();
    expect(chip?.[0]).toContain("hidden");
    expect(chip?.[0]).toContain("sm:inline-flex");
  });
  it("قراردادِ درگاههایِ آزمونیِ مترو: QuizEngine با immediate + resumeDoor + mistakesOf سیمکشی میشود", () => {
    const call = grammarView.match(/<QuizEngine[\s\S]*?\/>/);
    expect(call).not.toBeNull();
    expect(call?.[0]).toContain("immediate");
    expect(call?.[0]).toContain("resumeDoor");
    expect(call?.[0]).toContain("mistakesOf");
    expect(call?.[0]).toContain('category="grammar"');
  });
});
