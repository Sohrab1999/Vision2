// r333 — قفلهایِ سویپِ زندهٔ «دایرهٔ واژگانِ درس» (پیشنهادِ ②ِ r332):
//   فهرستِ واژگان + فلشکارتِ برگرداندهشده + دیالوگِ کاربرد + دسکتاپِ ۱۲۸۰.
//   یافتهٔ راند: پشتِ فلشکارت هرگز زندهسنجیده نشده بود — استاپِ روشنِ
//   گرادیانِ خانواده زیرِ جوهرِ سفید ۲٫۰۵ (متنِ ۱۴px) و ۲٫۴۷ (عنوانِ
//   بزرگ) و چیپهایِ سفیدِ ۱۵٪ ۲٫۲ می‌دادند (هر دو تم — گرادیانِ
//   بیتغیرِ تم). درمان: gradientDeep = زوجهایِ زندهسنجیدهٔ آواتارِ
//   r326 (سفید ≥ 4.5 رویِ هر دو استاپ) + حجابِ تیرهٔ چیپها بهجای
//   تینتِ سفید + حذفِ آلفایِ ۸۰٪ پژواکِ انگلیسی (درسِ ضربِ آلفایِ r329).
//   یافتهٔ دوم: چیپِ «درس X» دیالوگِ کاربرد در تاریک ۴٫۰۷ بود —
//   نگاشتِ .dark .text-stone-600 (#a8a29b) رویِ سطحِ نگاشتِ
//   bg-stone-700 (#44403c) غلبه میکند و dark:text-stone-300 را
//   بلعیده میشود؛ درمان: تیره‌سازیِ سطح به bg-stone-800 در تاریک.
//   درسِ r327 رعایت شده: کامنتها توکنِ ممنوعهٔ کامل را نقل نمیکنند.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { lessonTheme } from "@/lib/study-theme";

const root = join(__dirname, "..");
const read = (p: string) => readFileSync(join(root, p), "utf8");
const flashcards = read("src/components/study/lesson/flashcards.tsx");
const dialog = read("src/components/study/lesson/word-usage-dialog.tsx");

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
const WHITE = hex("#ffffff");
const BLACK = hex("#000000");

/** استاپِ روشنِ گرادیانِ پشتِ کارت — از پروبِ زندهٔ r333 (#00bc7d، بازتولیدِ ریاضی) */
const EMERALD_500_LIVE = hex("#00bc7d");

describe("r333 — پشتِ فلشکارت: gradientDeep = زوجهایِ آواتارِ سنجیدهشده", () => {
  it("هر یازده خانواده جفتِ عمیقِ سنجیدهشده دارند — استاپِ روشنِ -۶۰۰/-۷۰۰/-۹۰۰ زیرِ سفید ≥ ۴٫۵", () => {
    // جفت از/به هر خانواده (همان زوجهایِ avatarClasses که r326 زندهسنجید)
    const lightStops: Record<string, string> = {
      emerald: "#047857", // از-emerald-700
      amber: "#b45309", // از-amber-700
      rose: "#e11d48", // از-rose-600 — کمترینِ خانواده (۴٫۶۶)
      violet: "#7c3aed", // از-violet-600
      sky: "#0c4a6e", // از-sky-900
      orange: "#9a3412", // از-orange-900
      indigo: "#4f46e5", // از-indigo-600
      fuchsia: "#a21caf", // از-fuchsia-700
      pink: "#be185d", // از-pink-700
      blue: "#1d4ed8", // از-blue-700
      purple: "#7e22ce", // از-purple-700
      teal: "#0f766e", // از-teal-700 — دوازدهمین خانواده (فراموشیِ نوبتِ اول؛ tsc گرفت)
    };
    for (const [fam, stop] of Object.entries(lightStops)) {
      expect(ratio("#ffffff", stop), `${fam} سفید روی استاپ روشن`).toBeGreaterThanOrEqual(4.5);
      expect(lessonTheme[fam].gradientDeep, fam).toMatch(/^from-/);
    }
  });
  it("استاپِ کهنهِ ۵۰۰ زیرِ سفید واقعاً مردود بود — بازتولیدِ ۲٫۰۵ِ زنده", () => {
    expect(ratioArr(WHITE, hex("#10b981"))).toBeLessThan(3);
    expect(ratioArr(WHITE, EMERALD_500_LIVE)).toBeLessThan(2.6);
  });
  it("قراردادِ منبع: پشتِ کارت gradientDeep میخواند نه gradient — و پشتِ کارت با بلوکِ دقیق قفل است", () => {
    // کامل‌بودنِ نقشه: هر خانوادهٔ موجود جفتِ عمیق دارد (تلهٔ دوازدهمینِ فراموششده)
    expect(Object.keys(lessonTheme)).toHaveLength(12);
    for (const t of Object.values(lessonTheme)) expect(t.gradientDeep).toMatch(/^from-/);
    expect(flashcards).toMatch(/flip-face back[^\n]*\$\{t\.gradientDeep\}/);
    expect(flashcards).not.toMatch(/flip-face back[^\n]*\$\{t\.gradient\}/);
    // سایتهای دیگرِ gradient (جلدها/نوارها با جوهرِ غیرسفید) دستنخورده
    expect(flashcards).not.toMatch(/gradientDeep[^"]*"\s*\+\s*`\}/);
  });
});

describe("r333 — چیپهایِ پشتِ کارت: حجابِ تیره بهجایِ تینتِ سفید", () => {
  it("چیپِ جفت/کاربرد: سفیدِ کامل رویِ حجابِ ۲۰٪-سیاه رویِ استاپِ ۷۰۰ ≥ ۴٫۵", () => {
    const em700 = hex("#047857");
    const veil = blend(BLACK, 0.2, em700); // bg-black/20 روی استاپ
    expect(ratioArr(WHITE, veil)).toBeGreaterThanOrEqual(4.5);
    // حالتِ قبلی: سفید روی تینتِ ۱۵٪-سفیدِ استاپِ روشن = مردودِ زندهٔ ۲٫۲
    const oldVeil = blend(WHITE, 0.15, EMERALD_500_LIVE);
    expect(ratioArr(WHITE, oldVeil)).toBeLessThan(4.5);
  });
  it("چیپِ +N: جوهرِ ۹۰٪ رویِ همان حجاب ≥ ۴٫۵ — و آلفایِ ۸۵٪ کهنه زیرِ استاپِ روشن مردود", () => {
    const em700 = hex("#047857");
    const veil = blend(BLACK, 0.2, em700);
    const ink = blend(WHITE, 0.9, veil); // text-white/90 روی حجاب
    expect(ratioArr(ink, veil)).toBeGreaterThanOrEqual(4.5);
  });
  it("پژواکِ انگلیسیِ پشتِ کارت دیگر آلفا ندارد — ضربِ آلفایِ r329 دیگر اینجا تکرار نمیشود", () => {
    // سفیدِ ۸۰٪ روی استاپِ ۷۰۰ = ۳٫۷۸ مردود؛ سفیدِ کامل = ۵٫۴۸
    const em700 = hex("#047857");
    expect(ratioArr(blend(WHITE, 0.8, em700), em700)).toBeLessThan(4.5);
    expect(ratioArr(WHITE, em700)).toBeGreaterThanOrEqual(4.5);
    expect(flashcards).not.toMatch(/en-text text-sm opacity-80/);
  });
  it("قفلِ منبعِ حجاب: هر سه چیپِ پشتِ کارت bg-black/20 — نه تینتِ سفید", () => {
    expect(flashcards.match(/flip-pair-chip[^\n]*bg-black\/20/g)?.length).toBe(2);
    expect(flashcards).toMatch(/rounded-md bg-black\/20 px-1\.5 py-0\.5 text-\[10\.5px\] font-bold text-white\/90/);
    expect(flashcards).not.toMatch(/bg-white\/15/);
  });
});

describe("r333 — چیپِ «درس X» دیالوگِ کاربرد در تاریک", () => {
  it("زندگیِ قبل: جوهرِ نگاشتِ ۶۰۰ (#a8a29b) رویِ سطحِ نگاشتِ ۷۰۰ (#44403c) = ۴٫۰۷ مردود", () => {
    expect(ratio("#a8a29b", "#44403c")).toBeLessThan(4.5);
    expect(ratio("#a8a29b", "#44403c")).toBeGreaterThanOrEqual(3.9);
  });
  it("زندگیِ بعد: همان جوهرِ نگاشتی رویِ سطحِ ۸۰۰ (#292524) ≥ ۵", () => {
    expect(ratio("#a8a29b", "#292524")).toBeGreaterThanOrEqual(5);
  });
  it("قفلِ منبع: چیپِ درسِ دیالوگ در تاریک رویِ ۸۰۰ نشسته — بلوکِ دقیقِ ۳۶۹", () => {
    expect(dialog).toMatch(
      /ms-auto inline-flex items-center rounded-md border border-stone-200 bg-stone-100 px-1\.5 py-0\.5 text-\[10px\] font-black text-stone-600 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-300/,
    );
  });
});
