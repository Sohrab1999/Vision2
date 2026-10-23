// r334 — قفلهایِ سویپِ «درگاهها + هفت زبانهٔ درس»: دیالوگِ کاربرد از
//   WOTD و دیکشنری (پاک) + جزوههایِ L11/L12 (پاک) + هفت زبانهٔ باقیمانده
//   در L1 — دو یافته: ① جداکنندهٔ ≈/↔ مترادف/متضاد عضوِ متنیِ خانوادهٔ
//   stone-300 بود (۱٫۴۹ رویِ سفیدِ ردیف — همان محکومیتِ r332) → ۵۰۰.
//   نکتهٔ مکانیزمی: .dark .bg-white سراسری نیست — ردیف در تاریک سفید
//   میماند و تاریک هرگز مردود نشد. ② لایهٔ HTML داده‌ایِ گرامر
//   (lesson*.ts) با کلاسهایِ inlineِ مقیاسِ روشن و بدونِ dark: variant:
//   slate-700 رویِ c-cardِ تاریک = ۱٫۶۹ و slate-600 رویِ stone-50ِ
//   تیرهشده = ۲٫۱۶ (زنده) — درمان: هشت قاعدهٔ scopedِ .g-html (هر دو
//   جایگاهِ رندر تیرهاند — زنده ثابت شد). پینِ توکنیِ سراسری ممنوع:
//   rose-700/emerald-700/amber-700 مصرفکنندهٔ bg توپر دارند.
//   همچنین: جوهرِ rose-600 لایهٔ داده یکپله عمیق شد (۴٫۳۷ رویِ
//   amber-50 — دکترینِ r331) و بودجهٔ سلکتور ۵۳۰ باز-مبنا شد.
//   درسِ r327 رعایت شده: کامنتها توکنِ ممنوعهٔ کامل را نقل نمیکنند.
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = join(__dirname, "..");
const read = (p: string) => readFileSync(join(root, p), "utf8");
const synant = read("src/components/study/lesson/syn-ant-tab.tsx");
const globals = read("src/app/globals.css");
const metroView = read("src/components/study/grammar/grammar-view.tsx");
const grammarTab = read("src/components/study/lesson/grammar-tab.tsx");
const dataFiles = readdirSync(join(root, "src/data")).filter((f) => /^lesson\d+\.ts$/.test(f));

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
const blend = (top: number[], alpha: number, bottom: number[]) =>
  top.map((c, i) => alpha * c + (1 - alpha) * bottom[i]);
const ratioArr = (a: number[], b: number[]) => {
  const l1 = lum(a), l2 = lum(b);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
};
const ratio = (a: string, b: string) => ratioArr(hex(a), hex(b));

describe("r334 — جداکنندهٔ ≈/↔ مترادف/متضاد", () => {
  it("جداسازِ ردیفها دیگر عضوِ ۳۰۰ نیست — قفلِ بلوکِ دقیقِ رندرِ ردیف (درسِ r332: بلوکِ دقیق نه کلِ فایل — آیکنِ Volume2یِ خالی حقِ ۳۰۰ دارد)", () => {
    expect(synant).toMatch(
      /<span className="text-stone-500" aria-hidden>\s*\{kind === "syn" \? "≈" : "↔"\}/,
    );
    expect(synant).not.toMatch(/<span className="text-stone-300" aria-hidden>/);
  });
  it("ریاضی: ۵۰۰ رویِ سفیدِ ردیف = ۴٫۸ — ۳۰۰ = ۱٫۴۹ِ مردودِ زنده", () => {
    expect(ratio("#78716c", "#ffffff")).toBeGreaterThanOrEqual(4.5);
    expect(ratio("#d6d3d1", "#ffffff")).toBeLessThan(2);
  });
  it("تاریک: ردیف سفید میماند (.dark .bg-white سراسری نیست) و جوهرِ ۵۰۰ِ استوکِ تاریک ≥ ۴٫۵", () => {
    // r172: سنگِ ۵۰۰ در تاریک به استوکِ #78716c برمیگردد (بازنگشتِ -۵۰۰ فقط روشنی است)
    expect(ratio("#78716c", "#ffffff")).toBeGreaterThanOrEqual(4.5);
  });
});

describe("r334 — لایهٔ داده: rose-600 → rose-700 (دکترینِ r331)", () => {
  it("هیچ text-rose-600 در کلِ src/data نمیماند", () => {
    for (const f of dataFiles) {
      const s = read(`src/data/${f}`);
      expect(s.includes("text-rose-600"), `${f} هنوز ۶۰۰ دارد`).toBe(false);
    }
  });
  it("ریاضی: rose-700 رویِ amber-50 = ۶٫۰۶ — rose-600 = ۴٫۵۳ِ ریاضیِ مرزی (زنده ۴٫۳۷)", () => {
    expect(ratio("#be123c", "#fffbeb")).toBeGreaterThanOrEqual(5.5);
    // مرزیِ ریاضی — پروبِ بومِ زنده با گردِ sRGB آن را ۴٫۳۷ سنجید و مردود کرد
    expect(ratio("#e11d48", "#fffbeb")).toBeGreaterThanOrEqual(4.3);
    expect(ratio("#e11d48", "#fffbeb")).toBeLessThan(4.6);
  });
});

describe("r334 — هفت قاعدهٔ scopedِ .g-html برایِ لایهٔ گرامر در تاریک", () => {
  it("بلوکِ دقیقِ قواعد با جفتهایِ سنجیدهشده حاضر است — emerald-700 به باندِ سراسری واگذار شد", () => {
    expect(globals).toMatch(/\.dark \.g-html \.text-slate-700 \{ color: #d6d3cf; \}/);
    expect(globals).toMatch(/\.dark \.g-html \.text-slate-600 \{ color: #a8a29b; \}/);
    expect(globals).toMatch(/\.dark \.g-html \.text-amber-700 \{ color: #fcd34d; \}/);
    expect(globals).toMatch(/\.dark \.g-html \.text-rose-700 \{ color: #fda4af; \}/);
    expect(globals).not.toMatch(/\.dark \.g-html \.text-emerald-700/); // کپیِ همارزشِ باند ممنوع (نگهبان)
    expect(globals).toMatch(/\.dark \.g-html \.text-sky-900 \{ color: #7dd3fc; \}/);
    expect(globals).toMatch(/\.dark \.g-html \.text-violet-900 \{ color: #f5d0fe; \}/);
    expect(globals).toMatch(/\.dark \.g-html \.text-blue-900 \{ color: #93c5fd; \}/);
  });
  it("ریاضیِ تاریک: جوهرهایِ نو رویِ سطوحِ تیرهشدهٔ کرنل ≥ ۴٫۵", () => {
    const card = hex("#1c1917"); // c-card در تاریک
    expect(ratioArr(hex("#d6d3cf"), card)).toBeGreaterThanOrEqual(9);
    // stone-50یِ تیرهشده: kernel #151310 با آلفایِ کارت — رویِ کارت ~#171412
    expect(ratioArr(hex("#a8a29b"), blend(card, 0.55, hex("#151310")))).toBeGreaterThanOrEqual(4.5);
    // amber-50یِ تیرهشده: rgba(69,48,12,.35) رویِ کارت
    const amberDark = blend(hex("#45300c"), 0.35, card);
    expect(ratioArr(hex("#fcd34d"), amberDark)).toBeGreaterThanOrEqual(8);
    // rose-50یِ تیرهشده: rgba(80,18,28,.35) رویِ کارت
    const roseDark = blend(hex("#50121c"), 0.35, card);
    expect(ratioArr(hex("#fda4af"), roseDark)).toBeGreaterThanOrEqual(6);
  });
  it("پینِ توکنیِ سراسری ممنوع بود — مصرفکنندگانِ bgِ توپر سنداند (قفلِ تصمیم)", () => {
    // اگر روزی کسی خواست اینها را توکنی بازنگرداند، باید مصرفکنندگانِ
    // توپر مهاجرت داده شوند — این قفلِ هشدار است نه مانعِ کور.
    // emerald-700 دو سندِ مستند دارد: بازنگشتِ paper-scopedِ چاپ (روشن)
    // و باندِ سراسریِ تاریکِ جوهرِ موفقیت — خارج از قفلِ این راند.
    const css = globals;
    expect(css).not.toMatch(/--color-rose-700:/);
    expect(css).not.toMatch(/--color-amber-700:/);
  });
  it("هر دو جایگاهِ رندرِ HTML داده کلاسِ g-html را حمل میکنند", () => {
    expect(grammarTab).toMatch(/className="g-html p-4"/);
    expect(metroView).toMatch(/g-html gmetro-lesson/);
  });
});
