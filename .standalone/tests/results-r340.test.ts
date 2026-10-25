/**
 * tests/results-r340.test.ts — r340: نخستین داوریِ زندهٔ نمایهایِ نتیجهٔ
 * آزمون (واژگان + شبیهساز کنکور + پایانترمِ گواهیدار) در دسکتاپِ ۱۲۸۰ —
 * پیشنهادِ ③ِ r339. r331 لندینگ/پاسخگویی/مرورِ درجا را بسته بود؛ نمایِ
 * done هرگز دیده نشده بود.
 *
 * یافتهها (زندهثبتشده با r328-fails-dbg.js + negctlِ دقیقِ r339):
 *   ① سفیدِ زیرِ استاپِ روشنِ گرادیانها — هر دو تم:
 *      چیپِ عنوانِ گواهی از-emerald-400: ۱٫۹۴ · CTAِ اشتراک از-amber-500:
 *      ۲٫۱۳ (زنده). هر چهار خانوادهٔ CERT_ACCENTS (amber/emerald/orange/
 *      violet) همین مکانیزم را داشتند — درمانِ خانوادگیِ پیشگیرانه (r334):
 *      استاپهایِ عمیقِ ≥۴٫۵ با سفید.
 *   ② تلهٔ کرنلِ دوم — from-amber-800 در تاریک به #fcd34d بازنگاشت میشود
 *      (توکنِ جوهرِ تاریکِ کرنل) → سفید رویش ۱٫۴۴ (زنده، تاریک). درمان به
 *      سبکِ پینِ r330: مقدارِ دلخواهِ from-[#92400e] — ایمن به کرنل
 *      (۷٫۰۹). قفلِ بلوکِ ④ بازگشتِ توکنِ مسموم را ممنوع میکند.
 *   ③ دایرهٔ ✓ فهرستِ مرور bg-emerald-500 بود درحالیکه ✗ِ خواهرش از r331
 *      rose-700 است — همخوانیِ خانوادگی: emerald-700 (۵٫۴۹ با سفید).
 *
 * درسهایِ رانندگی (بلوکِ ⑤ قفل میکند): آزمون پیشفرضِ زماندار است
 *   (۴۵ث/سؤال — اتوسابمیت وسطِ رانندگی؛ prefillِ flag=0) · «شبیه‌ساز» و
 *   «پایان‌ترم» ZWNJ دارند و الگویِ خودِ اسکریپت هم میتواند ZWNJ پنهان
 *   داشته باشد (استریپِ دوطرفه + fallbackِ کلاسی) · پنلِ پایانترم زیرِ
 *   mode==='final' است — اول ModeCard.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(__dirname, "..");
const resultSrc = readFileSync(join(ROOT, "src/components/study/quiz/quiz-result.tsx"), "utf8");
const css = readFileSync(join(ROOT, "src/app/globals.css"), "utf8");
const sweepSrc = readFileSync(join(ROOT, "scripts/qa-r340-results-1280.sh"), "utf8");
const finalSrc = readFileSync(join(ROOT, "scripts/qa-r340-final-only.sh"), "utf8");

// ——— ریاضیِ sRGB (همان کرنلِ راندهای r333-r339) ———
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

const WHITE: [number, number, number] = hex("#ffffff");
// استاپهایِ زندهثبتشدهٔ پیشِ درمان (خروجیِ طبقه‌بند)
const EMERALD_400_LIVE: [number, number, number] = rgb(0, 212, 146); // #00d492
const AMBER_500_LIVE: [number, number, number] = hex("#fe9a00");
const KERNEL_AMBER_800_DARK: [number, number, number] = hex("#fcd34d"); // توکنِ مسمومِ تاریک
// استاپهایِ عمیقِ پسِ درمان
const EMERALD_700: [number, number, number] = hex("#047857");
const EMERALD_800: [number, number, number] = hex("#065f46");
const ORANGE_700: [number, number, number] = hex("#c2410c"); // پینِ r330/r335
const ORANGE_800: [number, number, number] = hex("#9a3412");
const VIOLET_600: [number, number, number] = hex("#7c3aed");
const VIOLET_700: [number, number, number] = hex("#6d28d9");
const AMBER_800_PIN: [number, number, number] = hex("#92400e");

describe("r340 — نمایهای نتیجه: استاپهای عمیق زیرِ سفید + تلهٔ کرنلِ amber-800", () => {
  it("بلوک ① — هر سه مردودِ زنده بازتولید میشوند (۱٫۹۴ · ۲٫۱۳ · ۱٫۴۴)", () => {
    expect(ratio(WHITE, EMERALD_400_LIVE)).toBe(1.94);
    // زنده ۲٫۱۳ ثبت شد (گردکردنِ lab) — همینجا ۲٫۱۴ از hexِ استوک
    const crAmber = ratio(WHITE, AMBER_500_LIVE);
    expect(crAmber).toBeGreaterThan(2.0);
    expect(crAmber).toBeLessThan(2.3);
    expect(ratio(WHITE, KERNEL_AMBER_800_DARK)).toBe(1.44);
  });

  it("بلوک ② — همهٔ استاپهایِ عمیقِ درمان ≥۴٫۵ با سفید", () => {
    expect(ratio(WHITE, EMERALD_700)).toBe(5.48);
    expect(ratio(WHITE, EMERALD_800)).toBe(7.68);
    expect(ratio(WHITE, ORANGE_700)).toBe(5.18); // پینِ مستندِ r335
    expect(ratio(WHITE, ORANGE_800)).toBe(7.31);
    expect(ratio(WHITE, VIOLET_600)).toBe(5.7);
    expect(ratio(WHITE, VIOLET_700)).toBe(7.1);
    expect(ratio(WHITE, AMBER_800_PIN)).toBe(7.09); // پینِ دلخواه — ایمن به کرنل
  });

  it("بلوک ③ — قفلهایِ منبع: چهار خانوادهٔ pill + CTA + دایرهٔ همخوان", () => {
    expect(resultSrc).toContain('pill: "from-[#92400e] to-orange-700"'); // amber
    expect(resultSrc).toContain('pill: "from-emerald-700 to-emerald-800"');
    expect(resultSrc).toContain('pill: "from-orange-700 to-orange-800"');
    expect(resultSrc).toContain('pill: "from-violet-600 to-violet-700"');
    // استاپهایِ روشنِ ۴۰۰/۵۰۰ زیرِ سفید فقط درِ pill/CTA بازنمیگردند
    // (استثنای موجه: میلههایِ h-1.5ِ گواهی در خطِ ۲۴۵ — بدونِ متن، غیرقابلِ قضاوتِ WCAG-text)
    expect(resultSrc).not.toMatch(/pill: "from-[a-z]+-[45]/);
    expect(resultSrc).not.toContain("from-amber-500 to-orange-600");
    // CTAِ اشتراک: پینِ دلخواه + orange-700 (زنده: بدونِ بازنگاشتِ کرنل)
    expect(resultSrc).toContain(
      "bg-gradient-to-l from-[#92400e] to-orange-700 px-4 py-2.5 text-sm font-bold text-white",
    );
    expect(resultSrc).not.toContain("from-amber-500 to-orange-600");
    // دایرههایِ ✓/✗ فهرستِ مرور — خواهرانِ همعمق (rose-700 از r331)
    expect(resultSrc).toContain('ok ? "bg-emerald-700" : "bg-rose-700"');
    expect(resultSrc).not.toContain("bg-emerald-500");
  });

  it("بلوک ④ — تلهٔ کرنل: amber-800 مسموم است و از-now-باید پینِ دلخواه بماند", () => {
    // سندِ مسمومیت: کرنلِ تاریک amber-800 را جوهرِ #fcd34d میبرد
    const darkBlock = css.slice(css.indexOf(".dark {"), css.indexOf("}", css.indexOf(".dark {")));
    expect(darkBlock).toContain("--color-amber-800: #fcd34d");
    expect(darkBlock).toContain("--color-amber-900: #fcd34d");
    // بازگشتِ from-amber-800 به این فایل ممنوع — زیرِ سفید در تاریک ۱٫۴۴ میشود
    expect(resultSrc).not.toContain("from-amber-800");
  });

  it("بلوک ⑤ — قفلهایِ رانندگی: بیزمان + ZWNJِ دوطرفه + ModeCardِ پایانترم", () => {
    // درسِ اتوسابمیت: prefillِ بیزمان پیش از هر شروع
    expect(sweepSrc).toContain("vision2-exam-timed-prefill");
    expect(sweepSrc).toContain("vision2-konkur-timed-prefill");
    // درسِ ZWNJ: استریپِ دوطرفه + fallbackِ کلاسیِ یکتا
    expect(finalSrc).toContain('replace(/\\\\u200c/g,\'\')');
    expect(finalSrc).toContain('from-amber-700');
    // درسِ ModeCard: پنلِ پایانترم زیرِ mode===final — اول کارت
    expect(finalSrc).toContain("پایان ترم");
    // شرطِ پایانِ حلقه: نتیجه یا گواهی (نه فقط متن)
    expect(finalSrc).toContain("certificate-card");
  });
});
