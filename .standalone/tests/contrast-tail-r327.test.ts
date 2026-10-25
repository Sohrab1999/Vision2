import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * r327 — «بستنِ دُمِ سویپِ بیگانه»: قفلهایِ ترمیمهایِ کنتراست.
 *
 * زمینه: راندِ بیگانهٔ r326 (کامیتِ d049d21 — بدونِ worklog) سویپِ کنتراستِ
 * خانوادگیِ r325 را به خانه/گزارشها/پاپاَورِ نشانها برد و ستونها/نشانها/
 * چیپها/CTA را ترمیم کرد — ولی اجرایِ دوبارهٔ سویپِ خودش نشان داد دُمِ
 * سویپ بسته نشده: ۳۱–۳۲ گروهِ سخت در هر مرحله باقی بود. راستیآزماییِ
 * مسئولانه (الگویِ r318) این باقیماندهها را با رزولورِ بومِ r325 سنجید:
 *
 *   نشانها: چیپِ bg-white/20 رویِ استاپِ طلایی ۱٫۴۵ · عنوانِ سفید رویِ
 *     طلایی/برنز ۱٫۵۷/۱٫۷۲ — و جوهرِ تیرهٔ ink/dimِ همان راند در تاریک
 *     میمُرد (کرنلِ globals:559 از-کهربایِ ۴۰۰ را به #b45309 بازمیگرداند →
 *     جوهرِ تیره رویِ استاپِ بالا ۲٫۹۶ — هیچ تک‌جوهری رویِ هر دو استاپِ
 *     بازنگشته سالم نمیماند) → درمان: تعمیمِ درمانِ نقره به هر سه رتبه
 *     (جفتهایِ عمیق ۷۰۰) + حذفِ ink/dimِ مرده + چیپِ bg-black/20
 *   سکوها: رتبهٔ سفید/۹۰ رویِ استاپِ روشن ۱٫۲۲–۱٫۳۹ (فقط روشن؛ تاریک
 *     سکوها را خودِ کرنل تیره میکند) → جوهرِ سنگیِ #44403c (کلاسِ arbitrary
 *     از بازنگشتِ هستهِ متن مصون) + dark:text-white/90
 *   CTAها: «شروع چالش» ۲٫۱۳ · «بخوان و جواب بزن» ۲٫۴۷ (از-۵۰۰ نقشهٔ تمِ
 *     داستان) → جفتهایِ ۷۰۰
 *   چیپها: «تمرین هدفمند» bg-amber-500 ۲٫۱۳ · شمارندههایِ واژهٔ خطرناک
 *     ۲٫۸۹ → ۷۰۰
 *   چیپِ «۵ واژه» در تاریک ۱٫۵۸ (کرنلِ متنِ rose-600 → #fda4af رویِ
 *     bg-rose-100ِ بازنگشته) → dark:bg-rose-950/60
 *   چیپِ بنفشِ درس در تاریک ۱٫۹۶ — باگِ خودِ ترمیمِ بیگانه:
 *     dark:text-violet-300 توکنِ --color-violet-300 را میخورد که در تاریک
 *     به rgba(130,100,190,.55) سنجاق است (تنها -۳۰۰ با پینِ توکن —
 *     globals:243) → dark:text-[#c4b5fd] (literalِ مصون از بازنگشت)
 *   کاشیهایِ کارنامه: چهار جوهرِ -۶۰۰ رویِ -۵۰ (زمرد ۲٫۵۲ · کهربا ۲٫۳۱ ·
 *     نارنجی ۲٫۶ · رز ۴٫۱۲ — کاشیِ رز در سویپ پرچم نشده بود و پروبِ
 *     نامزدها گرفت) → همه -۷۰۰
 *
 * سنجشِ زندهٔ پسااصلاح (رزولورِ بومِ 1×1 — همان r325):
 *   برنز ۵٫۰۳/۵٫۲۲ · طلا ۴٫۹۳/۵٫۰۳ · چیپِ عمیق ۷٫۰۷ · زمرد ۵٫۳۶/۹٫۶۳ ·
 *   بنفش ۵٫۸۹/۷٫۰۷ · سکوها ≥۵٫۸ رویِ هر چهار استاپِ روشن · کاشیها
 *   ۵٫۰۹/۴٫۸۵/۴٫۹۲ · چیپِ بنفشِ تاریک ۹٫۴۹ · چیپِ رزِ تاریک ۹٫۴۵
 */

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");

/** WCAG نسبتِ کنتراست — جفتهای hexِ سنجیدهشده با رزولورِ بومِ زنده */
const lum = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  const f = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f((n >> 16) & 255) + 0.7152 * f((n >> 8) & 255) + 0.0722 * f(n & 255);
};
const ratio = (a: string, b: string) => {
  const [hi, lo] = lum(a) > lum(b) ? [lum(a), lum(b)] : [lum(b), lum(a)];
  return Math.round(((hi + 0.05) / (lo + 0.05)) * 100) / 100;
};

describe("r327 — قفلهایِ ترمیمِ دُمِ سویپِ کنتراست", () => {
  it("ریاضیِ WCAG جفتهایِ سنجیدهشدهٔ زنده را بالایِ ۴٫۵ نگه میدارد", () => {
    // مقادیرِ hex = خروجیِ رزولورِ بوم در همین container (sRGBِ گامتا-کلیپشده)
    expect(ratio("#ffffff", "#bb4d00")).toBeGreaterThanOrEqual(4.5); // amber-700 — 5.03
    expect(ratio("#ffffff", "#ca3500")).toBeGreaterThanOrEqual(4.5); // orange-700 — 5.22
    expect(ratio("#ffffff", "#a65f00")).toBeGreaterThanOrEqual(4.5); // yellow-700 — 4.93
    expect(ratio("#ffffff", "#007a55")).toBeGreaterThanOrEqual(4.5); // emerald-700 — 5.36
    expect(ratio("#ffffff", "#004f3b")).toBeGreaterThanOrEqual(4.5); // emerald-900 — 9.63
    expect(ratio("#ffffff", "#7f22fe")).toBeGreaterThanOrEqual(4.5); // violet-600 — 5.89
    expect(ratio("#ffffff", "#8200db")).toBeGreaterThanOrEqual(4.5); // purple-700 — 7.07
    expect(ratio("#ffffff", "#431407")).toBeGreaterThanOrEqual(4.5); // orange-950 (تهِ امنِ تاریک)
    expect(ratio("#ffffff", "#904207")).toBeGreaterThanOrEqual(4.5); // chip black/20 رویِ برنز — 7.07
    // کاشیهایِ کارنامه: جوهرِ -۷۰۰ رویِ زمینهٔ -۵۰
    expect(ratio("#007a55", "#ecfdf5")).toBeGreaterThanOrEqual(4.5); // 5.09
    expect(ratio("#bb4d00", "#fffbeb")).toBeGreaterThanOrEqual(4.5); // 4.85
    expect(ratio("#ca3500", "#fff7ed")).toBeGreaterThanOrEqual(4.5); // 4.92
    // چیپهایِ تاریک: جوهرِ روشن رویِ ۹۵۰/۶۰ رویِ صفحهٔ #0c0a09
    expect(ratio("#c4b5fd", "#200e40")).toBeGreaterThanOrEqual(4.5); // 9.49
    expect(ratio("#fda4af", "#320713")).toBeGreaterThanOrEqual(4.5); // 9.45
    // سکوها: جوهرِ سنگی رویِ استاپهایِ روشن (کهربا/فوشیا/سنگ/نارنجی)
    expect(ratio("#44403c", "#ffd230")).toBeGreaterThanOrEqual(4.5); // 7.1
    expect(ratio("#44403c", "#f4a8ff")).toBeGreaterThanOrEqual(4.5); // 5.82
    expect(ratio("#44403c", "#e7e5e4")).toBeGreaterThanOrEqual(4.5); // 8.18
    expect(ratio("#44403c", "#ffd6a7")).toBeGreaterThanOrEqual(4.5); // 7.55
  });

  it("نشانها: هر سه رتبه جفتِ عمیق دارند و ink/dimِ ناقصِ r326 بازنشسته شده", () => {
    const src = read("src/lib/achievements.ts");
    expect(src).toContain('grad: "from-amber-700 to-orange-950"');
    expect(src).toContain('grad: "from-yellow-700 to-amber-700"');
    expect(src).toContain('grad: "from-slate-600 to-slate-800"');
    expect(src).not.toContain("from-amber-400 to-orange-600");
    expect(src).not.toContain("from-yellow-400 to-amber-600");
    expect(src).not.toMatch(/ink\?:/); // امضایِ نوعِ ink/dimِ ناقص
    expect(src).not.toContain("text-amber-950");
    expect(src).not.toContain("text-yellow-950");
  });

  it("کارتِ نشان: چیپِ رتبه bg-black/20 است نه bg-white/20ِ روشنکننده", () => {
    const src = read("src/components/study/practice/badges.tsx");
    expect(src).toContain("rounded-full bg-black/20 px-2 py-0.5 text-[10px] font-bold text-white");
    expect(src).not.toContain("rounded-full bg-white/20");
    // آیکونِ کارت رویِ گرادیانِ عمیق سفید میماند (آیکون از قانونِ کنتراست مستثناست)
    expect(src).toContain('isUnlocked ? "bg-white/20 text-white" : "bg-stone-100 text-stone-500"');
  });

  it("سکوها: هر سه واریانت رتبهٔ arbitraryِ تیره + بازگردانیِ سفید در تاریک دارند", () => {
    const src = read("src/components/study/shared/podium.tsx");
    const hits = src.match(/rankCls: "[^"]+"/g) ?? [];
    expect(hits).toHaveLength(3);
    for (const h of hits) {
      // r330 — #44403c رویِ استاپِ آخرِ سکوهایِ سنگ/نارنجی مردود بود
      // (۳٫۹۷/۴٫۳۲ زنده با بوم)؛ سنگِ ۹۰۰ (#1c1917) رویِ هر شش استاپِ روشن ≥۶٫۸
      expect(h).toContain("text-[#1c1917]");
      expect(h).toContain("dark:text-white/90");
      // هیچ رتبهای جوهرِ برهنهٔ سفید/۹۰ ندارد (فقط نسخهٔ dark: مجاز است)
      expect(h).not.toMatch(/(?<!dark:)text-white\/90/);
    }
    expect(src).not.toContain('rankCls: "text-lg font-black text-white/90"');
  });

  it("CTAها و چیپها: جفتهایِ ۷۰۰/۹۵۰ جای ۵۰۰/۴۰۰ را گرفتهاند", () => {
    // تلهٔ توکنِ r327: to-orange-700/800 در تاریک به #fdba74 بازمیگردد
    // (globals:201) — r330 برایِ استاپِ گرادیانیِ همان سایه بازپینِ تاریک گذاشت
    // (.dark .to-orange-700 → #c2410c = ۵٫۱۸ زنده) ولی این پنج فایل رویِ
    // جفتِ عمیقترِ ۹۵۰ میمانند (قراردادِ ثبتشده؛ جوهرِ متنِ -۷۰۰ جدا و سالم)
    expect(read("src/app/globals.css")).toContain("--color-orange-700: #fdba74");
    expect(read("src/app/globals.css")).toContain(
      ".dark .to-orange-700 { --tw-gradient-to: #c2410c; }",
    );
    expect(read("src/app/globals.css")).toContain(
      ".dark .from-sky-700 { --tw-gradient-from: #0369a1; }",
    );
    const swept = [
      "src/components/study/home/home-banners.tsx",
      "src/components/study/home/home-continue-reading.tsx",
      "src/components/study/library/library-view.tsx",
      "src/components/study/practice/danger-words.tsx",
      "src/lib/achievements.ts",
    ];
    for (const p of swept) expect(read(p)).not.toMatch(/to-orange-7|to-orange-8/);
    expect(read("src/components/study/home/home-banners.tsx")).toContain(
      "bg-gradient-to-l from-amber-700 to-orange-950",
    );
    const cr = read("src/components/study/home/home-continue-reading.tsx");
    expect(cr).toContain('grad: "from-emerald-700 to-emerald-900"');
    expect(cr).toContain('grad: "from-amber-700 to-orange-950"');
    expect(cr).toContain('grad: "from-violet-600 to-purple-700"');
    const lv = read("src/components/study/library/library-view.tsx");
    expect(lv).toContain('grad: "from-emerald-700 to-emerald-900"');
    expect(lv).toContain('grad: "from-amber-700 to-orange-950"');
    expect(lv).toContain('grad: "from-violet-600 to-purple-700"');
    expect(read("src/components/study/practice/skill-panel.tsx")).toContain(
      "rounded-lg bg-amber-700 px-3 py-1.5",
    );
    const dw = read("src/components/study/practice/danger-words.tsx");
    expect(dw).toContain('hot ? "bg-gradient-to-br from-rose-700 to-orange-950"');
    expect(dw).toContain(': "bg-gradient-to-br from-amber-700 to-orange-950"');
    // کاشیِ آیکونِ سرپنل از قانونِ کنتراست مستثناست (SVG بی‌متن) و عمداً میماند
    expect(dw).not.toMatch(/hot \? "bg-gradient-to-br from-rose-500/);
    expect(dw).not.toContain('"bg-gradient-to-br from-amber-400 to-orange-500"');
  });

  it("چیپهایِ تاریک: رز زمینهٔ تیره گرفت و بنفش از تلهٔ توکنِ violet-300 بیرون آمد", () => {
    const dw = read("src/components/study/practice/danger-words.tsx");
    // r329: the light-side ink deepened to the tone band (-800 rides the same
    // dark kernel value #fda4af) — the dark tinted background contract holds
    expect(dw).toContain("text-rose-800 dark:bg-rose-950/60");
    const st = read("src/lib/study-theme.ts");
    expect(st).toContain("dark:bg-violet-950/60 dark:text-[#c4b5fd]");
    // تلهٔ توکن: هیچ مصرفی نمیتواند dark:text-violet-300 بخورد — توکنِ
    // --color-violet-300 در تاریک به rgba(130,100,190,.55) سنجاق است
    const app = read("src/app/globals.css");
    expect(app).toContain("--color-violet-300: rgba(130, 100, 190, 0.55)");
    // خودِ نگاشتِ chipBg دیگر توکنِ تله را نمیخورد (کامنتها آزادند)
    expect(st).not.toMatch(/chipBg: "[^"]*dark:text-violet-300/);
  });

  it("کاشیهایِ کارنامه: هر چهار جوهر -۷۰۰ شد (رزِ ۴٫۱۲یِ پرچمخورده هم)", () => {
    const src = read("src/components/study/reports/report-card.tsx");
    expect(src).toContain("text-emerald-700 bg-emerald-50 border-emerald-200");
    expect(src).toContain("text-amber-700 bg-amber-50 border-amber-200");
    expect(src).toContain("text-orange-700 bg-orange-50 border-orange-200");
    expect(src).toContain("text-rose-700 bg-rose-50 border-rose-200");
    expect(src).not.toContain("text-emerald-600 bg-emerald-50");
    expect(src).not.toContain("text-rose-600 bg-rose-50");
  });
});
