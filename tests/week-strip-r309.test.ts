// ------------------------------------------------------------------
// r309 — قفلِ منبعِ نوارِ ۱۴روزه (الگویِ r284 برایِ باندِ نشانها):
//   ① نقاشِ drawWeekStrip14 دقیقاً یک‌بار در lib تعریف میشود —
//     هیچ کارتی نوارِ خودش را نمیکشد
//   ② دو فراخوانِ رسمی: هفته‌نامه (ستونِ چیپ، ۹۰/۳۰۰) و کارنامهٔ
//     رسمی (تمام-عرضِ ۹۴۰ زیرِ KPIها) — هندسهها مکتوب
//   ③ گرادیانِ این‌هفته فقط داخلِ نقاشِ واحد ساخته میشود
//   ④ کارتِ رسمی تغذیه میشود (weekPerDay در officialImageOpts)
//   ⑤ ارتفاعِ تازهٔ کارتِ رسمی (۸۳۲) و سطرِ «این هفته»ی هفته‌نامه قفلند
// ------------------------------------------------------------------
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const lib = () => readFileSync(join(process.cwd(), "src/lib/result-image.ts"), "utf8");
const official = () =>
  readFileSync(join(process.cwd(), "src/components/study/reports/official-report.tsx"), "utf8");

describe("نوارِ ۱۴روزه — نقاشِ واحدِ drawWeekStrip14 (r309)", () => {
  it("تعریفِ نقاش فقط یک‌بار در lib؛ دو فراخوانِ رسمی با هندسههای مکتوب", () => {
    const src = lib();
    expect(src.match(/function drawWeekStrip14/g)?.length).toBe(1);
    // هفته‌نامه: ستونِ چیپها — همان هندسهٔ r308
    expect(src).toContain(
      "drawWeekStrip14(ctx, { weekPerDay: opts.weekPerDay, family, x: 90, y: 572, bandW: 300 })"
    );
    // کارتِ رسمی: تمام-عرض زیرِ KPIها
    expect(src).toContain(
      "drawWeekStrip14(ctx, { weekPerDay: opts.weekPerDay, family, x: 70, y: 576, bandW: W - 140 })"
    );
  });

  it("گرادیانِ این‌هفته و حلقهٔ امروز فقط داخلِ نقاشِ واحد — هیچ نسخهٔ موازی", () => {
    const src = lib();
    // گرادیانِ teal→emerald→lime دقیقاً یک‌بار ساخته میشود (داخلِ نقاش)
    expect(src.match(/createLinearGradient\(0, baseline, 0, baseline - 44\)/g)?.length).toBe(1);
    // نسخهٔ درونخطیِ قدیمیِ r308 دیگر وجود ندارد
    expect(src).not.toContain("const baseline = 572;");
  });

  it("کارتِ رسمی تغذیه میشود — همان lastNDaysِ KPI با inThisWeekِ صریح", () => {
    const src = official();
    expect(src).toContain("weekPerDay:");
    expect(src).toContain("month.slice(-14).map((d, i) => ({ total: d.total, inThisWeek: i >= 7 }))");
  });

  it("ارتفاعِ تازهٔ کارتِ رسمی (۸۳۲) و باندِ جابجاشده (۶۱۶) قفلند", () => {
    const src = lib();
    expect(src).toContain("canvas.height = 832; // r309");
    expect(src).toContain("drawBadgeBand(ctx, { badges: opts.badges, family, x: 70, y: 616, w: W - 140 })");
    // سطرِ «این هفته»ی هفته‌نامه — جمعِ ۷روزِ آخر از همان آرایهٔ نوار
    expect(src).toContain("این هفته: ${faNum(sum7)} فعالیت");
  });
});
