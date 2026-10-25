// r332 — قفلهایِ سویپِ زندهٔ کتابخانه/جزوه «در حینِ مطالعه». یازده مرحلهٔ
//   dbg (فهرست + StoryReader + پاسخگوییِ درست/غلط + جستوجو/صافیِ فعال +
//   جزوهٔ L1 + دسکتاپِ ۱۲۸۰) یک گروهِ مردودِ یگانه داشت: جداکنندهٔ «|»
//   واژهنامهٔ StoryReader با جوهرِ stone-300 = ۱٫۴۹ رویِ سفیدِ چیپ و
//   ۲٫۲۹ در تاریک (#57534c رویِ #1c1917 — چون .dark .bg-white چیپ را
//   به #1c1917 میبرد). درمان: stone-500 (۴٫۸ روشن؛ تاریکِ #9c958c = ۵٫۹۱).
//   کشفِ ابزاریِ راند: personaهایِ قدیمی فقط state.history را میکاشتند و
//   dayHistory خالی میماند — چیپِ استریک هرگز در QA بیدار نشده بود؛
//   r332-persona (کتابخوان) هر دو را تزریق میکند.
//   درسِ r327 رعایت شده: کامنتها توکنِ ممنوعهٔ کامل را نقل نمیکنند.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = join(__dirname, "..");
const read = (p: string) => readFileSync(join(root, p), "utf8");
const css = read("src/app/globals.css");
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

describe("r332 — جفتهایِ زندهسنجیدهشده (بومِ ۱×۱)", () => {
  it("جداکنندهٔ واژهنامه: جوهرِ ۵۰۰ رویِ سفیدِ چیپ ≥ ۴٫۵ — جوهرِ ۳۰۰ = ۱٫۴۹ زنده مردود", () => {
    // زنده: ۴٫۷۴ (پروبِ بوم) · ریاضی: ۴٫۸ (گردِ سRGB) — هر دو ≥ ۴٫۵
    expect(ratio("#78716c", "#ffffff")).toBeGreaterThanOrEqual(4.5);
    expect(ratio("#d6d3d1", "#ffffff")).toBeLessThan(4.5);
  });
  it("تاریک: نگاشتِ ۵۰۰ (#9c958c) رویِ سطحِ تاریکِ چیپ ≥ ۵٫۵ — نگاشتِ ۳۰۰ = ۲٫۲۹ مردود", () => {
    // .dark .bg-white چیپ را به #1c1917 میبرد؛ .dark .text-stone-500 → #9c958c
    expect(ratio("#9c958c", "#1c1917")).toBeGreaterThanOrEqual(5.5);
    expect(ratio("#57534c", "#1c1917")).toBeLessThan(4.5);
  });
  it("همسایههایِ چیپ دستنخورده و سالم — جوهرِ ۸۰۰/۶۰۰ رویِ سفید", () => {
    expect(ratio("#292524", "#ffffff")).toBeGreaterThanOrEqual(10);
    expect(ratio("#57534e", "#ffffff")).toBeGreaterThanOrEqual(6.5);
  });
});

describe("r332 — قفلهایِ منبع", () => {
  it("جداکنندهٔ متنِ «|» واژهنامه از توکنِ ۵۰۰ میخورد — نه توکنِ ممنوعِ ۳۰۰", () => {
    // بلوکِ دقیق: spanِ aria-hidden با «|» — تنها عضوِ متنیِ خانوادهٔ ۳۰۰
    // (بقیهٔ اعضایِ ۳۰۰ این فایل آیکنِ SVGاند — غیرمتنِ ۳:۱، پابرجا)
    const sep = library.match(/aria-hidden className="text-stone-(\d+)">\s*\|/);
    expect(sep).not.toBeNull();
    expect(sep?.[1]).toBe("500");
  });
  it("شخصیتِ کتابخوان: هر دو تزریقِ libraryDone و dayHistory را دارد", () => {
    const persona = read("scripts/r332-persona.js");
    expect(persona).toContain("st.libraryDone");
    expect(persona).toContain("st.dayHistory");
  });
});

describe("r332 — قفلهایِ نگاشتِ تاریک (globals.css)", () => {
  it("نگاشتِ ۵۰۰ در تاریک سند است — همان چیزی که درمان را تاریکامن میکند", () => {
    expect(css).toContain(".dark .text-stone-500 { color: #9c958c; }");
  });
  it("سطحِ تاریکِ چیپِ bg-white و نگاشتِ ۳۰۰ (محکومکنندهٔ جوهرِ کهنه) سند بمانند", () => {
    expect(css).toContain(".dark .bg-white { background-color: #1c1917; }");
    expect(css).toContain(".dark .text-stone-300 { color: #57534c; }");
  });
});
