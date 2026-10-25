// تسک ۱۷۲ — قراردادِ کنتراست: نگهبانِ سطحِ منبع برایِ پیمایشِ کنتراستِ WCAG.
// هر پین نتیجهٔ آدیتِ زندهٔ DOM (۹ ویو، harnessِ contrast-discover-r172) است —
// اگر این تست‌ها سبزند، تعمیراتِ کنتراست رویِ درخت حاضرند؛ تستِ مستقل از
// css-hygiene است تا پس از بازیابیِ مخزن (reset به origin/main) با همان
// scripts/contrast-fixes-r172.py دوباره برقرار شود.

import { readFileSync, readdirSync } from "fs";
import { join, relative } from "path";
import { describe, it, expect } from "vitest";

const ROOT = process.cwd();

const read = (rel: string): string => readFileSync(join(ROOT, rel), "utf8");

function walkTx(dir: string, acc: string[] = []): string[] {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walkTx(p, acc);
    else if (e.name.endsWith(".tsx")) acc.push(p);
  }
  return acc;
}

const ALL_TSX = walkTx(join(ROOT, "src"));
const rel = (p: string) => relative(ROOT, p);

describe("قراردادِ کنتراست (r172) — مهاجرتِ متنِ کم‌رنگ", () => {
  it("هیچ text-stone-400 در TSX نمانده (مهاجرتِ ۱۷۱ رخدادی به text-stone-500 کامل است)", () => {
    const offenders = ALL_TSX.filter((f) => /\btext-stone-400\b/.test(readFileSync(f, "utf8")));
    expect(offenders.map(rel), "این فایل‌ها هنوز متنِ ۲٫۴۲:۱ دارند — مهاجرت ناقص است").toEqual([]);
  });

  it("@theme: stone-500 روشن یکی پله تیره شد (oklch ۵۲٪ ≈ ۵٫۵:۱ روی سفید)", () => {
    const css = read("src/app/globals.css");
    expect(css).toContain("--color-stone-500: oklch(52% 0.013 58.071);");
  });

  it("کرنلِ .dark: stockِ stone-500 (۵۵٫۳٪) بازگردانده شده — overrideِ ۵۲٪ فقط روشن است", () => {
    const css = read("src/app/globals.css");
    const darkIdx = css.search(/^\.dark \{/m);
    expect(darkIdx, "بلوکِ .dark پیدا نشد").toBeGreaterThanOrEqual(0);
    const darkBlock = css.slice(darkIdx, darkIdx + 2000);
    expect(darkBlock).toContain("--color-stone-500: oklch(55.3% 0.013 58.071);");
  });
});

describe("قراردادِ کنتراست (r172) — پین‌هایِ هیرو و CTA", () => {
  it("هیروی konkur: گرادیانِ خانوادهٔ ۷۰۰ + کاشی‌هایِ KPI با اسکریمِ تیره", () => {
    const s = read("src/components/study/exam/konkur-view.tsx");
    expect(s).toContain("from-red-700 via-orange-700 to-amber-700");
    expect(s).toContain("from-amber-700 to-orange-700");
    expect(s).toContain("bg-black/25");
  });

  it("هیروی duel: انتهایِ rose-600 + چیپ‌هایِ اسکریمِ تیره + کفِ متنِ /۹۰+", () => {
    // r190: the raw gradient utilities became the .arcade-hero recipe (plan
    // P3 Route A) — the rose-600 END is now pinned at token level
    // (--color-arcade-end: #e11d48) by tests/arcade-dialect.test.ts; this
    // test keeps the r172 intent: the hero consumes the recipe, keeps the
    // dark scrim chips, and never regresses to rose-500 or white scrims.
    const s = read("src/components/study/duel/duel-setup.tsx");
    expect(s).toContain("duel-hero arcade-hero");
    expect(s).not.toContain("bg-gradient-to-bl");
    expect(s).toContain("bg-black/25");
    expect(s).not.toContain("to-rose-500");
    expect(s).not.toMatch(/bg-white\/1[05]\b/);
  });

  it("نوارِ گزارش: باندِ emerald-800/700/teal-700", () => {
    const s = read("src/components/study/reports/report-card.tsx");
    expect(s).toContain("from-emerald-800 via-emerald-700 to-teal-700");
  });

  it("مترو: heroِ تیره‌تر + stepهایِ اسکریم‌دار", () => {
    const s = read("src/components/study/grammar/grammar-view.tsx");
    expect(s).toContain("from-teal-700 via-teal-800 to-emerald-900");
    expect(s).toContain("bg-black/20");
    expect(s).not.toContain("text-teal-100");
  });

  it("آزمون: badge و CTAیِ کهرباییِ ۷۰۰ + CTAیِ زمردیِ ۷۰۰", () => {
    const s = read("src/components/study/exam/exam-view.tsx");
    expect(s).toContain("from-amber-700 to-orange-700");
    expect(s).toContain("bg-emerald-700 py-3.5");
  });

  it("CTAهایِ درسِ خانه: emerald-700 (سطرهایِ ۳٫۶۵:۱ِ آدیت — «شروع فلش‌کارت‌ها/تست‌های درس اول/مرور هوشمند»)", () => {
    expect(read("src/components/study/home/home-today.tsx")).toContain(
      "rounded-xl bg-emerald-700 px-4 py-2.5 text-[13px] font-bold",
    );
    expect(read("src/components/study/home/home-starter.tsx")).toContain(
      "rounded-lg bg-emerald-700 px-3 py-2 text-[12px] font-bold",
    );
  });

  it("CTAیِ شنیداری: گرادیانِ cyan/teal-700 (سطرِ ۳٫۶۵:۱یِ آدیت)", () => {
    const s = read("src/components/study/home/home-banners.tsx");
    expect(s).toContain("from-cyan-700 to-teal-700");
    expect(s).not.toContain("from-cyan-600 to-teal-600");
  });

  it("قاعدهٔ «رویِ گرمِ توپُر، متنِ تیره»: چیپ‌هایِ نارنجی/کهربایی stone-900 دارند نه سفید", () => {
    expect(read("src/components/study/home/home-banners.tsx")).toContain(
      "bg-orange-500 px-2 py-0.5 text-[10px] font-black text-stone-900",
    );
    expect(read("src/components/study/practice/my-words.tsx")).toContain(
      'bg-amber-500 text-stone-900',
    );
  });
});
