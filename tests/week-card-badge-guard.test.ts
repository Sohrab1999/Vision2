// ------------------------------------------------------------------
// Task 134 — نگهبانِ منبعِ کارتِ PNGِ هفته‌نامه: حلقه/درصد/برچسب/نشان
// از قراردادِ weekGoalMeta می‌آیند، نه ریاضیِ محلی. برچسبِ خامِ قبلی
// (faNum(opts.goalDays) از …) تنها لایه‌ای بود که ورودیِ >۷ را
// «۱۰ از ۷ روزِ هدف» ادعا می‌کرد — نقضِ صداقتِ ۱۳۲؛ همین‌جا قفل شد.
// مهرِ زمردی فقط زیرِ if (meta.badge) رسم می‌شود (نگهبانِ خودِ قرارداد).
// الگو: duel-display-name.test.ts (نگهبانِ منبعِ ۱۳۱).
// ------------------------------------------------------------------
import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

describe("week-card PNG source contract — meta is the single source (Task 134)", () => {
  const src = readFileSync(resolve(process.cwd(), "src/lib/result-image.ts"), "utf8");

  it("downloadWeeklyImage computes the ring from weekGoalMeta(opts.goalDays)", () => {
    expect(src).toContain("const meta = weekGoalMeta(opts.goalDays);");
  });

  it("the label is meta.label — the raw unclamped claim is gone", () => {
    expect(src).toContain("ctx.fillText(meta.label, cx, cy + 38);");
    expect(src).not.toContain("${faNum(opts.goalDays)} از ${faNum(7)} روزِ هدف");
    // هیچ ریاضیِ محلیِ درصدی باقی نمانده باشد (تک‌مالکیت)
    expect(src).not.toContain("Math.min(7, opts.goalDays)");
  });

  it("the emerald seal + named claim render only under if (meta.badge)", () => {
    expect(src).toContain("if (meta.badge) {");
    expect(src).toContain('ctx.fillText(meta.badge, cx, cy + 70);');
    expect(src).toContain('ctx.fillStyle = "#059669"; // emerald-600 — همان توکنِ نشانِ UI');
  });

  it("the weekly-report live ring hosts the same badge language (Task 132 twin)", () => {
    const report = readFileSync(
      resolve(process.cwd(), "src/components/study/reports/weekly-report.tsx"),
      "utf8"
    );
    expect(report).toContain("weekGoal.badge && (");
    expect(report).toContain('d="M2.5 6.2 5 8.7 9.5 3.8"');
  });
});
