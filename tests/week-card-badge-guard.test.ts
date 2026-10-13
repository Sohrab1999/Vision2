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

// ------------------------------------------------------------------
// Task 136 — نگهبانِ منبعِ کارتِ معلمِ هفته: چهارمین لایهٔ مصرفیِ badgeِ
// ۱۳۲. درصد/برچسب از weekGoalMeta می‌آیند؛ برچسبِ خامِ قبلی
// (faNum(opts.stats.goalDays) از ۷ روز) آخرین بازماندهٔ ادعایِ
// clamp‌نشده بود — همین‌جا قفل شد. مهر و ادعای نام‌دار فقط زیرِ
// if (meta.badge) — و ادعا دقیقاً در هر دو کارتِ هفته رسم می‌شود.
// ------------------------------------------------------------------
describe("week-teacher PNG source contract — the 4th badge layer (Task 136)", () => {
  const src = readFileSync(resolve(process.cwd(), "src/lib/result-image.ts"), "utf8");

  it("weekCardCanvas computes the ring from weekGoalMeta(opts.stats.goalDays)", () => {
    expect(src).toContain("const meta = weekGoalMeta(opts.stats.goalDays);");
  });

  it("the teacher label is clamped — the last raw claim is gone", () => {
    expect(src).toContain("هدفِ ${faNum(WEEK_GOAL_DAYS - meta.remaining)} از ۷ روز");
    expect(src).not.toContain("${faNum(opts.stats.goalDays)} از ۷ روز");
  });

  it("the named claim renders in BOTH week PNGs (weekly + teacher)", () => {
    expect(src.split("ctx.fillText(meta.badge, cx, cy + 70);").length - 1).toBe(2);
  });
});

// ------------------------------------------------------------------
// Task 138 — پنجمین لایهٔ مصرفیِ badgeِ ۱۳۲: کاغذِ A4 (official-report).
// عددِ «X از ۷ روزِ هدف کامل» حالا از meta.label می‌آید (پسوندِ «کامل»
// گویشِ کاغذ است) و نشانِ زمردی با همان tickِ دوقلویِ ۱۳۲ فقط زیرِ
// weekGoal.badge رندر می‌شود — و متنِ هم‌رسانیِ کارتِ معلم هم از
// قرارداد می‌خواند: آخرین دو برچسبِ خامِ مخزن در همین نوبت صفر شدند.
// ------------------------------------------------------------------
describe("A4 paper + share-text join the goal contract — the 5th badge layer (Task 138)", () => {
  const paper = readFileSync(
    resolve(process.cwd(), "src/components/study/reports/official-report.tsx"),
    "utf8"
  );
  const paperCss = readFileSync(
    resolve(process.cwd(), "src/components/study/reports/official-report.css"),
    "utf8"
  );
  const teacher = readFileSync(
    resolve(process.cwd(), "src/components/study/reports/week-teacher.tsx"),
    "utf8"
  );

  it("the A4 paper reads the goal number from weekGoalMeta — the raw claim is gone", () => {
    expect(paper).toContain("const weekGoal = useMemo(() => weekGoalMeta(weekStats?.goalDays ?? 0), [weekStats]);");
    expect(paper).toContain("({weekGoal.label} کامل)");
    // الگویِ خامِ قبلی — faNum(weekStats?.goalDays ?? 0) از ۷ روزِ هدف کامل
    expect(paper).not.toContain("faNum(weekStats?.goalDays ?? 0)} از ۷ روزِ هدف کامل");
  });

  it("the emerald seal renders only under weekGoal.badge — twin tick of 132", () => {
    expect(paper).toContain("{weekGoal.badge && (");
    expect(paper).toContain('className="or-goal-seal mr-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 align-middle text-[9px] font-black"');
    expect(paper).toContain('d="M2.5 6.2 5 8.7 9.5 3.8"');
    // ادعای نام‌دار رویِ کاغذ متن است (کانواس نیست — هیچ aria-گم‌شدنی در کار نیست)
    expect(paper).toContain("{weekGoal.badge}\n                    </span>");
  });

  it("the or-goal-seal painter is the same emerald-600 token, paper-family convention", () => {
    expect(paperCss).toContain(".or-goal-seal { background-color: #059669; color: #ffffff; }");
  });

  it("the teacher-card share text reads meta.label — the last raw label in the repo is gone", () => {
    expect(teacher).toContain("const shareGoal = weekGoalMeta(stats.goalDays);");
    expect(teacher).toContain("${shareGoal.label} کامل");
    expect(teacher).not.toContain("${faNum(stats.goalDays)} از ۷ روزِ هدف کامل");
  });

  it("the twin tick path now speaks in all three DOM layers (chip, live ring, paper)", () => {
    const chip = readFileSync(resolve(process.cwd(), "src/components/study/practice/week-chip.tsx"), "utf8");
    const ring = readFileSync(resolve(process.cwd(), "src/components/study/reports/weekly-report.tsx"), "utf8");
    for (const layer of [chip, ring, paper]) {
      expect(layer).toContain('d="M2.5 6.2 5 8.7 9.5 3.8"');
    }
  });
});
