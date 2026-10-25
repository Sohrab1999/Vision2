// r328 — قفلهایِ بستنِ دنبالهٔ O2 (کارنامهٔ رسمی در تاریک + خانوادههایِ
//   مرزیِ ②ِ r327). هر مقدار با رزولورِ بوم زنده سنجیده شده
//   (scripts/r328-palette-probe.js) و بعد قفل میشود — همVisual در
//   ریاضیِ WCAG، هم متنی در منبعِ CSS/TSX.
//   درسِ r327 رعایت شده: کامنتها توکنِ ممنوعه را نقل نمیکنند.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = join(__dirname, "..");
const read = (p: string) => readFileSync(join(root, p), "utf8");
const css = read("src/app/globals.css");
const report = read("src/components/study/reports/official-report.tsx");
const constants = read("src/components/study/home/home-constants.ts");
const bookshelf = read("src/components/study/home/home-bookshelf.tsx");
const hero = read("src/components/study/home/home-hero.tsx");
const weekly = read("src/components/study/practice/weekly-chart.tsx");
const srs = read("src/components/study/practice/srs-panel.tsx");

// ——— ریاضیِ WCAG رویِ جفتهایِ زندهسنجیدهشده (درسِ r325/r327) ———
const lin = (v: number) => {
  const s = v / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
};
const lum = ([r, g, b]: [number, number, number]) =>
  0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const hex = (h: string): [number, number, number] => [
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
const rgbHex = (c: number[]) =>
  "#" + c.map((v) => v.toString(16).padStart(2, "0")).join("");

describe("r328 — پینهایِ کاغذِ همیشهروشن (۰-۳-۰ بر قواعدِ کرنل)", () => {
  it("شش پینِ کلاسِ درونِ official-report با مقادیرِ روشنِ چاپی", () => {
    expect(css).toContain(
      ".dark .official-report .text-emerald-700 { color: #047857; }",
    );
    expect(css).toContain(
      ".dark .official-report .text-stone-600 { color: #57534e; }",
    );
    expect(css).toContain(
      ".dark .official-report .text-stone-500 { color: #78716c; }",
    );
    expect(css).toContain(
      ".dark .official-report .bg-stone-50 { background-color: #fafaf9; }",
    );
    expect(css).toContain(
      ".dark .official-report .border-stone-100 { border-color: #f5f5f4; }",
    );
    expect(css).toContain(
      ".dark .official-report .border-emerald-300 { border-color: #6ee7b7; }",
    );
  });

  it("زنده: جوهرِ زمردیِ ۷۰۰ رویِ کاغذ و دکمهٔ چاپ ≥ ۵٫۲", () => {
    expect(ratio("#047857", "#ffffff")).toBeGreaterThanOrEqual(5.4);
    expect(ratio("#047857", "#ecfdf5")).toBeGreaterThanOrEqual(5.1);
  });
  it("زنده: جوهرِ ۵۰۰ پینشده رویِ سفید و ظرفِ نمودار ≥ ۴٫۵ — و ۶۰۰ رویِ زبرا ≥ ۶٫۵", () => {
    expect(ratio("#78716c", "#ffffff")).toBeGreaterThanOrEqual(4.7);
    expect(ratio("#78716c", "#fafaf9")).toBeGreaterThanOrEqual(4.5);
    expect(ratio("#57534e", "#f5f5f4")).toBeGreaterThanOrEqual(6.5);
    expect(ratio("#57534e", "#ffffff")).toBeGreaterThanOrEqual(7.5);
  });
});

describe("r328 — کرنلِ stone-500 تاریک + گروهِ مرجعِ word-day", () => {
  it("kernel روشنتر شد: #9c958c — و خطِ کهنهٔ گروهِ مرجعِ word-day نمانده", () => {
    expect(css).toContain(".dark .text-stone-500 { color: #9c958c; }");
    expect(css).not.toContain(
      ".dark .word-day .text-stone-500,.dark .badge-popover .text-stone-500,.dark .shortcuts-dialog .text-stone-500 { color: #8a8580; }",
    );
    expect(css).toContain(
      ".dark .word-day .text-stone-500,.dark .badge-popover .text-stone-500,.dark .shortcuts-dialog .text-stone-500 { color: #9c958c; }",
    );
  });
  it("زنده: کرنلِ نو رویِ بدترین تینتهایِ خانواده ≥ ۵٫۰ (خانوادهٔ مرزیِ ~۱۰۰تاییِ r327)", () => {
    for (const tint of ["#292524", "#28241f", "#231f1b", "#2a2113", "#132328", "#14231d", "#102c2a"]) {
      expect(ratio("#9c958c", tint)).toBeGreaterThanOrEqual(5.0);
    }
  });
});

describe("r328 — سربرگِ باند و پانویسِ کاغذ", () => {
  it("استاپِ آخرِ باند teal-۷۰۰ است و teal-۶۰۰یِ کهنه نمانده", () => {
    expect(css).toMatch(/\.or-band \{ background-image: linear-gradient\(115deg, #064e3b 0%, #047857 55%, #0f766e 100%\)/);
    expect(css).not.toContain("#0d9488 100%");
  });
  it("or-foot جوهرِ خوانا دارد (کهنهِ ۲٫۵۲یِ هر-دو-تم حذف شد)", () => {
    expect(css).toContain(".or-foot { color: #78716c; }");
    expect(css).not.toContain(".or-foot { color: #a8a29e; }");
  });
  it("خطوطِ فرعیِ باند opacity-95 (۸۵یِ کهنه رویِ استاپِ نو ۴٫۴۲ می‌داد)", () => {
    expect(report).not.toContain("opacity-85");
    expect(report).toContain("text-[11px] font-bold opacity-95");
    expect(report).toContain("text-[11.5px] font-bold opacity-95");
  });
  it("زنده: سفیدِ کامل و ۹۵٪ رویِ استاپِ نو ≥ ۴٫۹ — قرصِ تاریخ با black/15 ≥ ۶٫۵", () => {
    expect(ratio("#ffffff", "#0f766e")).toBeGreaterThanOrEqual(5.3);
    const eff95 = rgbHex(over("#ffffff", "#0f766e", 0.95));
    expect(ratio(eff95, "#0f766e")).toBeGreaterThanOrEqual(4.9);
    const pill = rgbHex(over("#000000", "#0f766e", 0.15));
    expect(ratio("#ffffff", pill)).toBeGreaterThanOrEqual(6.5);
  });
});

describe("r328 — سلولهایِ صادقانهٔ «—» و زیرعنوانِ لاتین (قراردادِ ۱۷۲ amended)", () => {
  it("lessonStatusNode و سلولهایِ خالی stone-۶۰۰اند؛ opacity زیرعنوانِ لاتین ۸۰ است", () => {
    expect(report).toContain('return <span className="font-bold text-stone-600">—</span>;');
    expect(report).toContain('"text-stone-600"');
    expect(report).not.toContain("opacity-70");
    expect(report).toContain("opacity-80");
  });
  it("قرصِ تاریخِ باند black/15 است (white/15 سطحش را روشن میکرد — درسِ نشانهایِ r327)", () => {
    expect(report).toContain("rounded-full bg-black/15 px-2.5 py-1 text-[10px] font-black");
    expect(report).not.toContain("bg-white/15");
  });
  it("زنده: زیرعنوانِ لاتینِ ۸۰٪ رویِ سفید و زبرا ≥ ۵٫۳", () => {
    const effW = rgbHex(over("#44403c", "#ffffff", 0.8));
    const effZ = rgbHex(over("#44403c", "#f5f5f4", 0.8));
    expect(ratio(effW, "#ffffff")).toBeGreaterThanOrEqual(5.6);
    expect(ratio(effZ, "#f5f5f4")).toBeGreaterThanOrEqual(5.3);
  });
});

describe("r328 — عصبهایِ کتابخانه و جلد و CTAها", () => {
  it("spine رز از ۶۰۰ به ۷۰۰ عمیق شد (سفیدِ عنوان با آلفا فقط ۳٫۸۲ می‌داد)", () => {
    expect(constants).toContain('rose: "bg-gradient-to-b from-rose-700 to-rose-950"');
    expect(constants).not.toContain("from-rose-600");
  });
  it("عنوانِ راستهرُوِ spine دیگر آلفایِ ۹۰٪ ندارد (کلاسِ دقیقِ span قفل میشود؛ hover:opacity-90یِ کارتِ درس بی tether نیست)", () => {
    expect(bookshelf).toContain(
      '<span className="mt-1 max-w-full truncate px-1 text-[10px]">',
    );
  });
  it("زنده: سفید رویِ استاپِ رزِ نو ≥ ۶ و رویِ کهرباییِ موجود ≥ ۵", () => {
    expect(ratio("#ffffff", "#c70036")).toBeGreaterThanOrEqual(5.9);
    expect(ratio("#ffffff", "#bb4d00")).toBeGreaterThanOrEqual(4.9);
  });
  it("زیرعنوانهایِ جلد emerald-۱۰۰یِ کامل‌اند و قرصِ روخوانی black/15", () => {
    expect(hero).not.toContain("text-emerald-200/80");
    expect(hero).not.toContain("text-emerald-200/90");
    expect(hero).toContain("tracking-widest text-emerald-100");
    expect(hero).toContain("rounded-full bg-black/15 px-3 py-1");
  });
  it("CTAِ مرورِ هوشمند جفتِ ۷۰۰/۷۰۰ دارد و تبِ هفتگی در تاریک سالم است", () => {
    expect(srs).toContain("from-teal-700 to-emerald-700");
    expect(weekly).toContain("dark:bg-cyan-950 dark:text-cyan-300 dark:ring-cyan-800");
  });
  it("زنده: emerald-۱۰۰ رویِ استاپهایِ جلد و سفید رویِ جفتِ ۷۰۰/۷۰۰", () => {
    expect(ratio("#d1fae5", "#047857")).toBeGreaterThanOrEqual(4.8);
    expect(ratio("#d1fae5", "#064e3b")).toBeGreaterThanOrEqual(8.5);
    expect(ratio("#ffffff", "#00786f")).toBeGreaterThanOrEqual(5.3);
    expect(ratio("#ffffff", "#007a55")).toBeGreaterThanOrEqual(5.3);
  });
});

describe("r328 — ممنوعِ سراسری (سولیدهایِ آفتابیِ زیرِ متنِ سفید)", () => {
  const scan = (p: string) => readFileSync(join(root, p), "utf8");
  const files = [
    "src/components/study/home/home-constants.ts",
    "src/components/study/home/home-hero.tsx",
    "src/components/study/practice/srs-panel.tsx",
    "src/components/study/practice/goal-chip.tsx",
    "src/components/study/shell/pwa-layer.tsx",
    "src/components/study/shell/onboarding.tsx",
    "src/components/study/exam/konkur-view.tsx",
    "src/components/study/practice/listen-view.tsx",
    "src/data/lesson1.ts",
    "src/lib/study-theme.ts",
  ];
  it("هیچ سولیدِ کهنه‌ای در فایلهایِ مصرفکنندهٔ سفید نمیماند (گاردِ آلفا: / و رقم مجازند)", () => {
    for (const f of files) {
      const src = scan(f);
      expect(src, f).not.toMatch(/bg-emerald-600(?![/\d])/);
      expect(src, f).not.toMatch(/bg-rose-500(?![/\d])/);
      expect(src, f).not.toMatch(/bg-teal-600(?![/\d])/);
    }
  });
});
