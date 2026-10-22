// ------------------------------------------------------------------
// r309/r310 — قفلِ منبعِ نوارِ ۱۴روزه (الگویِ r284 برایِ باندِ نشانها):
//   ① نقاشِ drawWeekStrip14 دقیقاً یک‌بار در lib تعریف میشود —
//     هیچ کارتی نوارِ خودش را نمیکشد
//   ② دو فراخوانِ رسمی: هفته‌نامه (ستونِ چیپ، ۹۰/۳۰۰) و کارنامهٔ
//     رسمی (تمام-عرضِ ۹۴۰ زیرِ KPIها) — هندسهها مکتوب
//   ③ گرادیانِ این‌هفته فقط داخلِ نقاشِ واحد ساخته میشود
//   ④ کارتِ رسمی تغذیه میشود (weekPerDay در officialImageOpts)
//   ⑤ ارتفاعِ کارتِ رسمی (۸۵۴ِ r310) و باندِ جابجاشده (۶۳۸) قفلند
//   ⑥ r310 — سطرِ مقایسهٔ دوهفته‌ای داخلِ نقاش است (نه در فراخوان) —
//     و weekStripSums منبعِ یگانهٔ هر دو جمع است؛ واحدِ مستقیم دارد
// ------------------------------------------------------------------
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { weekStripSums } from "@/lib/result-image";

const lib = () => readFileSync(join(process.cwd(), "src/lib/result-image.ts"), "utf8");
const official = () =>
  readFileSync(join(process.cwd(), "src/components/study/reports/official-report.tsx"), "utf8");

describe("نوارِ ۱۴روزه — نقاشِ واحدِ drawWeekStrip14 (r309 + r310)", () => {
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
    // r309 — سطرِ درونخطیِ «این هفته» در فراخوانِ هفته‌نامه هم حذف شد (r310:
    // نقاش میرسد) — دوبار‌نقشی ممنوع
    expect(src).not.toContain("faNum(sum7)");
  });

  it("sطرِ مقایسهٔ دوهفته‌ای داخلِ نقاش است — هفتهٔ پیشِ سنگی، این هفتهٔ زمردی", () => {
    const src = lib();
    // r310 — هر دو جمع از weekStripSums میآیند نه از reduceِ پراکنده
    expect(src).toContain("const sums = weekStripSums(weekPerDay);");
    expect(src).toContain("هفتهٔ پیش: ${faNum(sums.prev)}");
    expect(src).toContain("· این هفته: ${faNum(sums.current)} فعالیت");
    // داخلِ بدنهٔ نقاش دیگر reduceِ مستقیمِ نیمهها نیست (تا شروعِ weekStripSums)
    const body = src.slice(
      src.indexOf("function drawWeekStrip14"),
      src.indexOf("export function weekStripSums")
    );
    expect(body).not.toContain(".reduce(");
  });

  it("کارتِ رسمی تغذیه میشود — همان lastNDaysِ KPI با inThisWeekِ صریح", () => {
    const src = official();
    expect(src).toContain("weekPerDay:");
    expect(src).toContain("month.slice(-14).map((d, i) => ({ total: d.total, inThisWeek: i >= 7 }))");
  });

  it("ارتفاعِ تازهٔ کارتِ رسمی (۸۵۴) و باندِ جابجاشده (۶۳۸) قفلند", () => {
    const src = lib();
    expect(src).toContain("canvas.height = 854; // r310");
    expect(src).not.toContain("canvas.height = 832");
    expect(src).toContain("drawBadgeBand(ctx, { badges: opts.badges, family, x: 70, y: 638, w: W - 140 })");
  });

  // r310 — واحدِ مستقیمِ weekStripSums: منبعِ یگانهٔ جمعِ دو نیمه
  it("weekStripSums — دو نیمهٔ ۷تایی را جدا جمع میکند", () => {
    const wpd = Array.from({ length: 14 }, (_, i) => ({ total: i + 1 })); // ۱..۱۴
    const s = weekStripSums(wpd);
    expect(s.prev).toBe(1 + 2 + 3 + 4 + 5 + 6 + 7); // ۲۸
    expect(s.current).toBe(8 + 9 + 10 + 11 + 12 + 13 + 14); // ۷۷
  });

  it("weekStripSums — صفرِ صادق و هم‌قرارداد با feedِ واقعی (۱۳ صفر + امروزِ ۱۰)", () => {
    const fed = [...Array(13).fill(0).map((n) => ({ total: n })), { total: 10 }];
    const s = weekStripSums(fed);
    expect(s.prev).toBe(0);
    expect(s.current).toBe(10);
    // آرایهٔ خالی هم نمیشکند (گاردِ طولِ ۱۴ بالادست است — این تابع محض است)
    expect(weekStripSums([])).toEqual({ prev: 0, current: 0 });
  });
});
