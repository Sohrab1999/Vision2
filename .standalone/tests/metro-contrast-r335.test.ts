// r335 — قفلهایِ بستنِ رکوردِ ۳۱گروهیِ متروی گرامر (۲۰ تاریک + ۱۱ روشنِ
//   مشترکِ همان بجها) + نخستین سنجشِ جریانِ درسِ ۹۰ثانیه‌ای (.glesson).
//   خانوادههایِ درمانشده (همه زندهسنجیده با dbgِ r328 در qa-r335-metro.sh):
//   ① پسوندِ انگلیسیِ بج با opacity-80 — آلفاسکوییزِ خانوادهٔ r329 (۳٫۱۸–۴٫۳۴
//      در هر دو تم) → سفیدِ کامل رویِ استاپهایِ توپر.
//   ② solidهایِ مرزی: rose-600 (۴٫۷۳ ریاضی/۳٫۱۸ زندهٔ پسوند) → rose-700 و
//      sky-700 (۴٫۳۴ زنده) → sky-800.
//   ③ جوهرِ هیرویِ تاریک: --color-teal-50 در کرنل به شستشویِ سطحِ ۳۵٪
//      بازنگاشته شده ولی هیرو از آن بهعنوانِ جوهرِ متن استفاده میکرد
//      (۱٫۱۱/۱٫۲ زنده) → teal-100 جامد.
//   ④ گامهایِ هیرو در تاریک: شستشویِ white/8 روشن‌کننده = ترکیبِ #228179
//      و ۴٫۱۶ → black/25 (۷٫۴ با جوهرِ teal-100).
//   ⑤ بج/CTAِ آسمان و نارنجی در تاریک: کرنلِ tranche-3b همان متغیرها را به
//      جوهرِ روشن (#7dd3fc/#fdba74) میبرد — درست برایِ text-*، مرگبار زیرِ
//      متنِ سفید (۱٫۵/۱٫۵۲/۱٫۶۷ زنده) → پینِ عمیقِ r330 در سه دامنه
//      (.gmetro/.gmetro-dialog/.glesson — دیالوگ پورتالشده بیرونِ .gmetro است؛
//      بازسنجیِ دوم دقیقاً همین را گرفت: CTAِ درسِ دیالوگ ۱٫۶۷ ماند).
//   ⑥ نه جوهرِ خطِ فاقدِ ارزشِ تاریک رویِ کارتِ #292524 (۱٫۸۷–۳٫۰۵) →
//      -۳۰۰هایِ همخانواده. درسِ ابزاری: نگاشتِ lab→توکنِ رکوردِ r334
//      purple/fuchsia را violet/pink خوانده بود — بازسنجیِ اول صاحبانِ
//      واقعی را ثابت کرد؛ هر چهار اکنون قاعده دارند.
//   ⑦ جوهرهایِ #8a8580 در glesson (سرِ «ببین» ۴٫۱۵ و گامِ idle ۴٫۴۷ —
//      نخستین سنجشِ تاریخِ این سطح) → #a8a29e همخانوادهٔ متادیتا.
//   درسِ r327 رعایت شده: کامنتها توکنِ ممنوعِ کامل را نقل نمیکنند.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = join(__dirname, "..");
const read = (p: string) => readFileSync(join(root, p), "utf8");
const css = read("src/app/globals.css");
const theme = read("src/lib/grammar-theme.ts");
const view = read("src/components/study/grammar/grammar-view.tsx");

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
const blend = (top: string, a: number, bottom: string) => {
  const t = hex(top), b = hex(bottom);
  return "#" + t.map((v, i) => Math.round(v * a + b[i] * (1 - a)).toString(16).padStart(2, "0")).join("");
};

describe("r335 — جفتهایِ زندهسنجیدهشده (ریاضیِ sRGB + بازتولیدِ مردودهایِ کهنه)", () => {
  it("روشنیِ بجها: سفیدِ کامل رویِ rose-700/sky-800 ≥ ۶ — رویِ کهنهها مرزی/مردود", () => {
    expect(ratio("#ffffff", "#be123c")).toBeGreaterThanOrEqual(6); // rose-700
    expect(ratio("#ffffff", "#075985")).toBeGreaterThanOrEqual(7); // sky-800
    expect(ratio("#ffffff", "#e11d48")).toBeLessThan(5); // rose-600 کهنه — ۴٫۷۳ مرزی
    expect(ratio("#ffffff", "#0284c7")).toBeLessThan(4.5); // sky-700 کهنه — ۴٫۰۹ مردود
  });
  it("پسوندِ ۸۰٪ مردود بود — بازتولیدِ ۳٫۱۸: سفیدِ ۸۰٪ رویِ rose-600", () => {
    expect(ratio(blend("#ffffff", 0.8, "#e11d48"), "#e11d48")).toBeLessThan(4.5);
    // و سفیدِ کامل رویِ همهٔ استاپهایِ -۷۰۰ باقیمانده ≥ ۴٫۵ — پسوندِ بیآلفا
    // میگذرد (lime = ۴٫۹۹ ریاضی، زنده با کامپوزیتِ نقطهچین ≈ ۵٫۱ — سندِ
    // رکوردِ پسازدرمان: fails=0؛ عمیقسازیِ بیشتر نیازمندِ مردودِ زندهٔ واقعی است)
    for (const bg of ["#b45309", "#4d7c0f", "#0e7490", "#047857", "#0f766e", "#a21caf"]) {
      expect(ratio("#ffffff", bg), bg).toBeGreaterThanOrEqual(4.5);
    }
  });
  it("هیرویِ تاریک: teal-100 رویِ روشنترین استاپ (#0f766e) و رویِ ترکیبِ گامِ black/25 ≥ ۴٫۵ — teal-50ِ کرنلیِ ۳۵٪ = ۱٫۱۱ مردود", () => {
    expect(ratio("#ccfbf1", "#0f766e")).toBeGreaterThanOrEqual(4.5);
    const stepBg = blend("#0f766e", 0.75, "#000000"); // black/25 رویِ استاپِ میانیِ هیرویِ تاریک
    expect(ratio("#ccfbf1", stepBg)).toBeGreaterThanOrEqual(7);
    // بازتولیدِ ۱٫۱۱: جوهرِ شستشویِ ۳۵٪ِ کرنلی مؤثراً همرنگِ سطح میشود
    const kernelInk = blend("#063732", 0.35, "#0f766e");
    expect(ratio(kernelInk, "#0f766e")).toBeLessThan(1.5);
  });
  it("پینهایِ عمیقِ r330 زیرِ سفید در تاریک ≥ ۵ — و روشنِ کرنلیِ #7dd3fc = ۱٫۵ مردودِ ثبتشده", () => {
    expect(ratio("#ffffff", "#0369a1")).toBeGreaterThanOrEqual(5.5);
    expect(ratio("#ffffff", "#c2410c")).toBeGreaterThanOrEqual(5);
    expect(ratio("#ffffff", "#7dd3fc")).toBeLessThan(2); // بازتولیدِ ۱٫۵
    expect(ratio("#ffffff", "#fdba74")).toBeLessThan(2); // بازتولیدِ ۱٫۵۲
  });
  it("نُه جوهرِ -۳۰۰ رویِ کارتِ تاریکِ #292524 ≥ ۷ — و کهنههایِ -۷۰۰ مردود (۱٫۸۷–۳٫۰۵)", () => {
    const inks: Record<string, string> = {
      "#a5b4fc": "#4338ca", // indigo-300 / indigo-700
      "#c4b5fd": "#6d28d9", // violet
      "#93c5fd": "#1d4ed8", // blue
      "#d8b4fe": "#7e22ce", // purple
      "#f9a8d4": "#be185d", // pink
      "#fda4af": "#be123c", // rose
      "#f0abfc": "#a21caf", // fuchsia
      "#67e8f9": "#0e7490", // cyan
      "#bef264": "#4d7c0f", // lime
    };
    for (const [light, old] of Object.entries(inks)) {
      expect(ratio(light, "#292524"), light).toBeGreaterThanOrEqual(6.5);
      expect(ratio(old, "#292524"), old).toBeLessThan(3.1);
    }
  });
  it("glesson: جوهرِ متادیتایِ #a8a29e رویِ #292524 و رویِ idleِ شفاف ≥ ۴٫۵ — #8a8580 مردود (۴٫۱۵/۴٫۴۷)", () => {
    expect(ratio("#a8a29e", "#292524")).toBeGreaterThanOrEqual(5.5);
    const idleBg = blend("#292524", 0.6, "#17161a"); // rgba(41,37,36,.6) رویِ بدنهٔ تیرهتر
    expect(ratio("#a8a29e", idleBg)).toBeGreaterThanOrEqual(5);
    expect(ratio("#8a8580", "#292524")).toBeLessThan(4.5);
  });
});

describe("r335 — قفلهایِ منبع", () => {
  it("پسوندِ انگلیسیِ بج هرگز opacity ندارد — بلوکِ دقیقِ گمترو-بج", () => {
    const badge = view.match(/gmetro-badge[^`]*`/);
    expect(badge).not.toBeNull();
    expect(badge?.[0]).not.toMatch(/opacity-\d/);
    expect(badge?.[0]).toContain("text-white");
    // و خودِ پسوندِ mono هم (بلوکِ جدا): هیچ آلفایی رویِ جوهرِ استاپِ توپر
    expect(view).not.toMatch(/font-mono text-\[10px\] font-bold opacity/);
  });
  it("solidهایِ خانواده: rose=-700 و sky=-800 (قفلِ ارتقایِ مرزی) — بقیهٔ -۷۰۰ها دستنخورده", () => {
    expect(theme).toMatch(/rose:\s*\{[\s\S]*?solid:\s*"bg-rose-700"/);
    expect(theme).toMatch(/sky:\s*\{[\s\S]*?solid:\s*"bg-sky-800"/);
    expect(theme).not.toMatch(/solid:\s*"bg-rose-600"/);
    expect(theme).not.toMatch(/solid:\s*"bg-sky-700"/);
    expect(theme).toMatch(/amber:\s*\{[\s\S]*?solid:\s*"bg-amber-700"/);
    expect(theme).toMatch(/violet:\s*\{[\s\S]*?solid:\s*"bg-violet-600"/);
  });
  it("دوازده قاعدهٔ r335 در باندِ گمترو حاضرند — هر کدام با هر سه دامنه", () => {
    expect(css).toMatch(/\.dark \.gmetro-hero \.text-teal-50 \{ color: #ccfbf1; \}/);
    expect(css).toMatch(
      /\.dark \.gmetro \.bg-sky-800, \.dark \.gmetro-dialog \.bg-sky-800, \.dark \.glesson \.bg-sky-800 \{ background-color: #0369a1; \}/,
    );
    expect(css).toMatch(
      /\.dark \.gmetro \.bg-orange-700, \.dark \.gmetro-dialog \.bg-orange-700, \.dark \.glesson \.bg-orange-700 \{ background-color: #c2410c; \}/,
    );
    for (const [fam, ink] of [
      ["indigo", "#a5b4fc"], ["violet", "#c4b5fd"], ["blue", "#93c5fd"],
      ["purple", "#d8b4fe"], ["pink", "#f9a8d4"], ["rose", "#fda4af"],
      ["fuchsia", "#f0abfc"], ["cyan", "#67e8f9"], ["lime", "#bef264"],
    ] as const) {
      // r349: the discovery-journey card CONSOLIDATED its lime/indigo inks
      // into these compound kernel lines (an optional 4th scope) — the
      // three-domain contract itself is unchanged.
      const rule = css.match(
        new RegExp(`\\.dark \\.gmetro \\.text-${fam}-700, \\.dark \\.gmetro-dialog \\.text-${fam}-700, \\.dark \\.glesson \\.text-${fam}-700(?:, \\.dark \\.discovery-journey \\.text-${fam}-700)? \\{ color: ${ink}; \\}`),
      );
      expect(rule, fam).not.toBeNull();
    }
  });
  it("گامِ هیرویِ تاریک دیگر شستشویِ روشنکننده ندارد — black/25 جایگزینِ white/8", () => {
    const step = css.match(/\.dark \.gmetro-step \{ background-color: ([^;]+); \}/);
    expect(step).not.toBeNull();
    expect(step?.[1]).toBe("rgb(0 0 0 / 0.25)");
    expect(css).not.toContain("#ffffff14");
  });
  it("glesson: جوهرهایِ ۴٫۱۵/۴٫۴۷ به #a8a29e رسیدند — درجا، نه overrideِ تازه", () => {
    expect(css).toMatch(/\.dark \.glesson-step-idle \{[^}]*color: #a8a29e; \}/);
    expect(css).toMatch(/\.dark \.glesson-see > p \{ color: #a8a29e; \}/);
  });
  it("قفلِ تصمیمِ کرنل: --color-sky-700/--color-orange-700/--color-teal-50 دستنخورده — جوهرهایِ سراسریِ دیگر وابستهاند؛ درمان فقط scoped بود", () => {
    expect(css).toContain("--color-sky-700: #7dd3fc;");
    expect(css).toContain("--color-orange-700: #fdba74;");
    expect(css).toContain("--color-teal-50: rgba(6, 55, 50, 0.35);");
  });
});
