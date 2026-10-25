/**
 * tests/popover-contrast-r338.test.ts — r338: نخستین داوریِ زندهٔ دو پاپ‌آورِ هدر
 * (SettingsPopover + ProfilePopover) با دادهٔ پُر در دسکتاپِ ۱۲۸۰.
 *
 * یافته‌ها (همه زندهثبتشده با r338-popover-dbg.js + کنترلِ منفی):
 *   ① چیپهایِ زمردی۱۰۰ پروفایل (چیپِ scopeِ «افعال بی‌قاعده» + بجِ «جدید»
 *      همگامسازی) در تاریک سطحِ روشن میماندند — جوهرِ #6ee7b7 رویِ
 *      #d0fae5 = ۱٫۳۴. درمان: شستشویِ wrapper-scoped (کرنلِ توکنِ
 *      --color-emerald-100 ممنوع — home-hero آن را جوهرِ روشنِ عمدی
 *      تاریک مصرف میکند؛ درسِ «توکنِ ممنوع» r334).
 *   ② جوهرهایِ text-emerald-700/70 (آلفاسکوییزِ r329): «سطح ۲ از ۳»
 *      (hintِ رزومه) و «(۳۶ واژه)» (پشتیبان خودکار) در روشن ۳٫۰۲ و در
 *      تاریک ۲٫۰۹ (کلاسِ /70 قاعدهٔ تاریکِ .text-emerald-700 را نمیگیرد).
 *      درمان: text-emerald-800 توپر (۳جا). جوهرِ سوم («آخرین
 *      همگام‌سازی») هم از همان خانواده است — پیشگیرانه درمان شد.
 *   ③ در ۳۹۰ با رکوردِ «ادامهٔ مطالعه» فعال، کلاسترِ هدر ۵۱px سرریز
 *      میگرفت و تریگرِ پروفایل تا x=-35 نیمهبیرون میرفت (۹px لمسپذیر).
 *      درمان: کلاستر overflow-x-auto (nav داخل میماند — خروجِ nav در
 *      دسکتاپ برچسبهایِ ≈۳۹۵pxاش را با چیپها رقابت میداد؛ برگشتخورده).
 *
 * درسِ ابزاریِ راند (بلوکِ E قفل میکند): کپیِ sed-ناحیه‌ای طبقه‌بند
 *   حلقهٔ داوری را بلعید و «صفرِ» بیحلقه تولید کرد (probed=46, fails=0
 *   رویِ مردودِ زندهٔ ۱٫۳۴!) — از این راند هر سویپ کنترلِ منفی دارد.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(__dirname, "..");
const css = readFileSync(join(ROOT, "src/app/globals.css"), "utf8");
const profileSrc = readFileSync(join(ROOT, "src/components/study/profile/profile-popover.tsx"), "utf8");
const headerSrc = readFileSync(join(ROOT, "src/components/study/shell/header.tsx"), "utf8");
const dbgSrc = readFileSync(join(ROOT, "scripts/r338-popover-dbg.js"), "utf8");
const sweepSrc = readFileSync(join(ROOT, "scripts/qa-r338-popover-sweep.sh"), "utf8");

// ——— ریاضیِ sRGB (همان کرنلِ راندهای r333-r337) ———
const hex = (h: string): [number, number, number] => {
  const s = h.replace("#", "");
  return [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)];
};
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

const EMERALD_100: [number, number, number] = hex("#d1fae5");
const EMERALD_700_DARK: [number, number, number] = hex("#6ee7b7"); // .dark .text-emerald-700
const POPOVER_DARK: [number, number, number] = hex("#171717"); // --popover تاریک (lab(7.78) ≈ 171717)

describe("r338 — پاپ‌آورهای هدر: شستشوی زمردی۱۰۰ + آلفاگیری جوهرها + کلاسترِ اسکرولی", () => {
  it("بلوک ① — مردودِ زندهٔ ۱٫۳۴ بازتولید و درمانِ wrapper-scoped قفل میشود", () => {
    // بازتولید: چیپ در تاریک سطحِ روشن نگه میداشت
    expect(ratio(EMERALD_700_DARK, EMERALD_100)).toBe(1.34);

    // قفلِ منبع: قاعدهٔ compound با هر دو سلکتور در باندِ تاریک
    expect(css).toMatch(
      /\.dark \[data-radix-popper-content-wrapper\] \.bg-emerald-100,\s*\n\.dark \[data-radix-popper-content-wrapper\] \.hover\\:bg-emerald-100:hover \{\s*\n\s*background-color: rgba\(6, 55, 40, 0\.55\);/,
    );

    // ریاضیِ درمان: شستشوی rgba(6,55,40,.55) رویِ سطحِ پاپ‌آورِ تاریک
    const wash: [number, number, number] = [6, 55, 40];
    const surface = over(wash, POPOVER_DARK, 0.55);
    const cr = ratio(EMERALD_700_DARK, surface);
    expect(cr).toBeGreaterThanOrEqual(4.5); // ≈ 9.9 — حاشیهٔ آسوده

    // کرنلِ توکن ممنوع میماند: --color-emerald-100 در بلوکِ .dark تعریف نمیشود
    const darkBlock = css.slice(css.indexOf(".dark {"), css.indexOf("}", css.indexOf(".dark {")));
    expect(darkBlock).not.toContain("--color-emerald-100");
  });

  it("بلوک ② — آلفاسکوییزِ text-emerald-700/70 صفر و جوهرِ ۸۰۰ توپر قفل است", () => {
    // مکانیزمِ آلفاسکوییز (r329): جوهرِ آلفادار رویِ سطحِ روشن زیرِ ۴٫۵ سقوط
    // میکند — زندهثبتشده: ۳٫۰۲ روشن / ۲٫۰۹ تاریک (تبدیلِ oklch→sRGB دستی
    // دقیق نیست؛ داوریِ آستانه قفل میشود نه عددِ وسط).
    const emerald700: [number, number, number] = hex("#059669");
    const lightCard: [number, number, number] = hex("#f2fef8"); // سطحِ زندهثبتشده
    const squeezed = over(emerald700, lightCard, 0.7);
    expect(ratio(squeezed, lightCard)).toBeLessThan(4.5);

    // درمانِ روشن: emerald-800 توپر رویِ همان سطح
    const emerald800: [number, number, number] = hex("#065f46");
    expect(ratio(emerald800, lightCard)).toBeGreaterThanOrEqual(4.5); // ≈ 7.4

    // منبع: هیچ /70 باقیمانده؛ هر سه جا ۸۰۰ توپر
    expect(profileSrc).not.toContain("text-emerald-700/70");
    expect(profileSrc.match(/text-emerald-800/g)?.length).toBeGreaterThanOrEqual(3);
  });

  it("بلوک ③ — کلاسترِ هدر اسکرولِ افقی دارد و nav داخلش میماند (درسِ برگشت)", () => {
    // قفلِ منبع: کلاستر overflow-x-auto + nice-scroll (الگویِ nav)
    expect(headerSrc).toMatch(/className="flex min-w-0 items-center gap-1 overflow-x-auto nice-scroll"/);

    // nav باید داخلِ کلاستر بماند — خروجش در دسکتاپ چیپها را به ناحیهٔ
    // اسکرولشده میراند (زندهثبتشده و برگشتخورده در همین راند)
    const afterProfile = headerSrc.slice(headerSrc.indexOf("<ProfilePopover />"));
    const clusterClose = afterProfile.indexOf("</div>");
    const navOpen = afterProfile.indexOf("<nav");
    expect(navOpen).toBeGreaterThan(-1);
    expect(navOpen).toBeLessThan(clusterClose);

    // سندِ بودجهٔ موبایل: سرریزِ زندهٔ ۵۱px (۳۹۰ + due/goal/freeze/resume پُر)
    // — قبل از درمان تریگرِ پروفایل x=-35 با ۹px لمسپذیر بود.
  });

  it("بلوک E — سلاحِ راند: طبقه‌بندِ حلقه‌دار + سویپِ کنترلمنفیدار قفل میشوند", () => {
    // درسِ «صفرِ بیحلقه»: dbgِ پاپ‌آور باید حلقهٔ داوریِ کامل را داشته باشد
    expect(dbgSrc).toContain("for (const el of els)");
    expect(dbgSrc).toContain("groups.set");
    expect(dbgSrc).toContain("[data-radix-popper-content-wrapper]");

    // سویپ: گاردِ seed + کنترلِ منفی + اسکرولِ کلاسترِ ۳۹۰
    expect(sweepSrc).toContain("SEED-GUARD-FAIL");
    expect(sweepSrc).toContain("NEGCTL-FAIL");
    expect(sweepSrc).toContain("negctl");
    expect(sweepSrc).toContain("scroll-cluster");
  });
});
