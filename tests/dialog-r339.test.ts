/**
 * tests/dialog-r339.test.ts — r339: نخستین داوریِ زندهٔ دو دیالوگِ ثالث
 * (ShortcutGuide + CommandPalette) با دادهٔ پُر در دسکتاپِ ۱۲۸۰ — پیشنهادِ ③ِ r338.
 *
 * یافته‌ها (همه زندهثبتشده با r339-dialog-dbg.js — دامنهٔ DialogContentِ
 * data-state=open، چون این دو Dialogِ رادیکس‌اند نه Popover):
 *   ① جداکنندههایِ «/» و «+» راهنما و «·» فرمانیاب با text-stone-300:
 *      روشن #d6d3d1 رویِ #ffffff = ۱٫۴۹ (ن=۷+۱) · تاریک #57534c (قاعدهٔ
 *      سراسریِ ۴۳۱) رویِ #292524 = ۱٫۹۸. درمان: text-stone-500 — روشن با
 *      توکنِ oklch (زنده: rgb(111,103,98) = ۵٫۵۵)، تاریکِ راهنما با قاعدهٔ
 *      اسکوپشدهٔ #9c958c رویِ #292524 = ۵٫۱۲ و تاریکِ فرمانیاب با کرنلِ
 *      .dark → --color-stone-500 (همان #9c958c) رویِ #1c1917 = ۵٫۹۱.
 *      صفرِ قاعدهٔ جدید: هیچ CSSِ تازه‌ای لازم نشد — کلاسِ درست + کرنل.
 *   ② چیپِ «Enter ↵» ردیفِ فعالِ فرمانیاب: text-emerald-700 رویِ
 *      compositeِ bg-emerald-600/10 (رویِ ردیفِ فعالِ bg-stone-200/70 +
 *      گرادیانهایِ صفحه) = زنده ۴٫۰۹. درمان: text-emerald-800 — روشن
 *      ۵٫۸۶ رویِ #d6e4de (کامپوزیتِ ثبتشدهٔ طبقه‌بند)، تاریک #6ee7b7 رویِ
 *      کامپوزیتِ تاریک = ۱۰٫۲۸. جوهرِ emerald-700ِ door.lead راهنما
 *      سالم میماند (۵٫۴۸ مستندِ r328 رویِ سفید — زنده هم صفر).
 *   ③ hoverِ درهایِ راهنما در هر دو تم سالم است — ولی «سنجشِ زنده»
 *      ناممکن ثابت شد: matchMedia('(hover: hover)')=false در هدلسِ
 *      agent-browser → تمامِ hover-variantهایِ Tailwind (زیرِ
 *      @media(hover:hover)) در این ابزار کلاً غیرفعالاند. حکمِ hover =
 *      تحلیلِ آبشاریِ مستند (قواعدِ unlayeredِ تاریک بر hover-variantِ
 *      لایهشده چیره‌اند) + مرزِ ابزاریِ ثبتشده — نه ادعایِ زنده.
 *
 * درسِ ابزاریِ راند (بلوکِ ④ قفل میکند): negctlِ «fails>=1» کافی نبود —
 *   مردودِ واقعیِ صحنه چک را میگذراند و کاشتهشدهی ۱٫۳۴ هرگز کاشته نشده
 *   بود (سلکتورِ بینقطه). negctlِ r339 جوهرِ کاشتهشده
 *   (rgb(110,231,183)) را خودش در failsList میخواهد.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(__dirname, "..");
const css = readFileSync(join(ROOT, "src/app/globals.css"), "utf8");
const guideSrc = readFileSync(join(ROOT, "src/components/study/shell/shortcut-guide.tsx"), "utf8");
const paletteSrc = readFileSync(join(ROOT, "src/components/study/shell/command-palette.tsx"), "utf8");
const dbgSrc = readFileSync(join(ROOT, "scripts/r339-dialog-dbg.js"), "utf8");
const sweepSrc = readFileSync(join(ROOT, "scripts/qa-r339-dialog-sweep.sh"), "utf8");

// ——— ریاضیِ sRGB (همان کرنلِ راندهای r333-r338) ———
const hex = (h: string): [number, number, number] => {
  const s = h.replace("#", "");
  return [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)];
};
const rgb = (r: number, g: number, b: number): [number, number, number] => [r, g, b];
const lum = ([r, g, b]: [number, number, number]): number => {
  const f = (v: number) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const ratio = (a: [number, number, number], b: [number, number, number]): number => {
  const l1 = lum(a);
  const l2 = lum(b);
  const hi = Math.max(l1, l2);
  const lo = Math.min(l1, l2);
  return Math.round(((hi + 0.05) / (lo + 0.05)) * 100) / 100;
};
const over = (ink: [number, number, number], bg: [number, number, number], a: number): [number, number, number] =>
  [0, 1, 2].map((i) => Math.round(ink[i] * a + bg[i] * (1 - a))) as [number, number, number];

// ——— ثابتهایِ زندهثبتشدهٔ راند ———
const STONE_300_LIGHT: [number, number, number] = hex("#d6d3d1"); // inkِ پیشِ درمان در روشن
const STONE_300_DARK: [number, number, number] = hex("#57534c"); // .dark .text-stone-300 (قاعدهٔ ۴۳۱)
const WHITE: [number, number, number] = hex("#ffffff");
const GUIDE_ROW_DARK: [number, number, number] = hex("#292524"); // .dark .shortcuts-dialog .bg-white
const PALETTE_DARK: [number, number, number] = hex("#1c1917"); // .dark .command-palette
const STONE_500_KERNEL_DARK: [number, number, number] = hex("#9c958c"); // زنده: rgb(156,149,140)
const STONE_500_OKLCH_LIGHT: [number, number, number] = rgb(111, 103, 98); // زنده: oklch(52%)
const EMERALD_700: [number, number, number] = hex("#047857"); // ≈ live lab(44.5,-41,11)
const EMERALD_800: [number, number, number] = hex("#065f46"); // ≈ زنده: rgb(0,96,69)
const EMERALD_600: [number, number, number] = rgb(0, 147, 98); // زنده: oklch emerald-600
const CHIP_SURFACE_LIGHT: [number, number, number] = hex("#d6e4de"); // کامپوزیتِ ثبتشدهٔ طبقه‌بند
const EMERALD_700_DARK: [number, number, number] = hex("#6ee7b7"); // .dark .text-emerald-800

describe("r339 — دو دیالوگ ثالث: جداکنندههای stone-300 + چیپ Enter + مرزِ hover هدلس", () => {
  it("بلوک ① — هر سه مردودِ زنده بازتولید میشوند (۱٫۴۹ · ۱٫۹۸ · ۴٫۰۹)", () => {
    // جداکنندهها — روشن: stone-300 رویِ ردیفِ سفید
    expect(ratio(STONE_300_LIGHT, WHITE)).toBe(1.49);
    // تاریک: قاعدهٔ سراسریِ stone-300 رویِ ردیفِ تاریکشدهٔ راهنما
    expect(ratio(STONE_300_DARK, GUIDE_ROW_DARK)).toBe(1.98);
    // چیپِ Enter — روشن: emerald-700 رویِ کامپوزیتِ ثبتشده (طبقه‌بند ۴٫۰۹ زنده)
    const crChip = ratio(EMERALD_700, CHIP_SURFACE_LIGHT);
    expect(crChip).toBeLessThan(4.5); // ۴٫۱۸ — با گرادیانهایِ صفحه زنده ۴٫۰۹ شد
    // و در تاریک همین چیپ سالم بود (نمایدنیِ ناقصِ دوتمی — الگویِ r336)
    const darkChipSurface = over(EMERALD_600, PALETTE_DARK, 0.1);
    expect(ratio(EMERALD_700_DARK, darkChipSurface)).toBeGreaterThanOrEqual(4.5);
  });

  it("بلوک ② — ریاضیِ درمان: همه جفتهایِ پس از درمان ≥۴٫۵", () => {
    // جداکننده — روشن: توکنِ oklchِ stone-500 رویِ سفید
    expect(ratio(STONE_500_OKLCH_LIGHT, WHITE)).toBeGreaterThanOrEqual(4.5); // ۵٫۵۵ زنده
    // تاریکِ فرمانیاب: کرنلِ .dark → --color-stone-500 رویِ #1c1917
    expect(ratio(STONE_500_KERNEL_DARK, PALETTE_DARK)).toBeGreaterThanOrEqual(4.5); // ۵٫۹۱
    // تاریکِ راهنما: قاعدهٔ اسکوپشدهٔ همان مقدار رویِ ردیفِ #292524
    expect(ratio(STONE_500_KERNEL_DARK, GUIDE_ROW_DARK)).toBeGreaterThanOrEqual(4.5); // ۵٫۱۲
    // چیپ — روشن: emerald-800 رویِ کامپوزیتِ همان سطح
    expect(ratio(EMERALD_800, CHIP_SURFACE_LIGHT)).toBeGreaterThanOrEqual(4.5); // ۵٫۸۶
    // چیپ — تاریک: #6ee7b7 رویِ کامپوزیتِ تاریکِ emerald-600/10
    const darkChipSurface = over(EMERALD_600, PALETTE_DARK, 0.1);
    expect(ratio(EMERALD_700_DARK, darkChipSurface)).toBeGreaterThanOrEqual(7); // ۱۰٫۲۸ — حاشیهٔ آسوده
  });

  it("بلوک ③ — قفلهایِ منبع: کلاسهایِ درمان + کرنلِ بدونِ قاعدهٔ تازه", () => {
    // راهنما: هر دو جداکننده (/ و +) stone-500 شدند و stone-300 برگشتناپذیر است
    expect(guideSrc.match(/text-\[10px\] text-stone-500/g)?.length).toBe(2);
    expect(guideSrc).not.toContain("text-[10px] text-stone-300");
    // فرمانیاب: جداکنندهٔ · و چیپِ Enter
    expect(paletteSrc).toContain('<span className="mx-1 text-stone-500">·</span>');
    expect(paletteSrc).not.toContain("text-stone-300");
    expect(paletteSrc).toContain(
      "bg-emerald-600/10 px-1.5 py-0.5 text-[10px] font-black text-emerald-800",
    );
    expect(paletteSrc).not.toContain("text-emerald-700"); // door.leadِ راهنماست که emerald-700 سالم دارد
    // صفرِ قاعدهٔ جدید — درمان فقط با کلاس: کرنلِ تاریکِ stone-500 و emerald-50 دستنخورده
    const darkBlock = css.slice(css.indexOf(".dark {"), css.indexOf("}", css.indexOf(".dark {")));
    expect(darkBlock).toContain("--color-stone-500: oklch(55.3%"); // تاریکِ فرمانیاب را کرنل سرو میکند
    expect(darkBlock).toContain("--color-emerald-50: rgba(6, 55, 40, 0.35)"); // بخشِ حلقه از توکن تاریک میگیرد
    // قاعدهٔ اسکوپشدهٔ راهنما (موجودِ راندهای پیشین) همان مقدار کرنل را میبرد
    expect(css).toMatch(
      /\.dark \.word-day \.text-stone-500,\.dark \.badge-popover \.text-stone-500,\.dark \.shortcuts-dialog \.text-stone-500 \{ color: #9c958c; \}/,
    );
  });

  it("بلوک ④ — قفلهایِ ابزار: negctlِ دقیق + دامنهٔ نقطهدار + حلقهٔ داوری", () => {
    // negctlِ تقویتشده: جوهرِ کاشتهشده باید خودش در failsList دیده شود
    // (درسِ راند: چکِ fails>=1 را مردودِ واقعیِ صحنه میگذراند)
    expect(sweepSrc).toContain("110, 231, 183");
    expect(sweepSrc).toContain("NEGCTL-FAIL");
    // درسِ سلکتورِ بینقطه: «OPEN-FAIL» دروغ — فراخوانیها با نقطه‌اند
    expect(sweepSrc).toContain('open_ev "open-shortcuts" ".shortcuts-dialog"');
    expect(sweepSrc).toContain('open_ev "open-command-palette" ".command-palette"');
    expect(sweepSrc).toContain('negctl ".shortcuts-dialog"');
    expect(sweepSrc).toContain('negctl ".command-palette"');
    // دامنهٔ dbg: DialogContentِ data-state=open — نه popper-wrapper
    expect(dbgSrc).toContain('.shortcuts-dialog, .command-palette');
    expect(dbgSrc).toContain('getAttribute("data-state") === "open"');
    expect(dbgSrc).not.toContain("data-radix-popper-content-wrapper");
    // حلقهٔ داوری سالم منتقل شده (درسِ r338 — ضدِ «صفرِ بیحلقه»)
    expect(dbgSrc).toContain("const groups = new Map()");
    expect(dbgSrc).toContain("if (worst.cr < need && g.samples.length < 3)");
    expect(dbgSrc).toContain("failsList");
  });

  it("بلوک ⑤ — مرزِ ابزاریِ hover ثبتشده + گاردهایِ میراثی", () => {
    // hover:hover=false در هدلس — هیچ hover-variantی با agent-browser سنجیدنی نیست
    expect(sweepSrc).toContain("hover:hover=false");
    // طبقه‌بندِ راند از خانوادهٔ r338: معافیتِ disabled و آستانهٔ large متن
    expect(dbgSrc).toContain('button[disabled], [aria-disabled="true"], fieldset[disabled]');
    expect(dbgSrc).toContain("const need = large ? 3 : 4.5;");
  });
});
