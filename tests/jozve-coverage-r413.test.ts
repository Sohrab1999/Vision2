import { describe, expect, it } from "vitest";
import { jozveCoverage, jozveCoverageHasAny } from "@/lib/jozve-coverage";
import type { QuizResult } from "@/lib/study-types";

// ------------------------------------------------------------------
// پیمان‌های r413 — «پوشش شش جزوه» در کارنامهٔ من: خوانشِ خالصِ نقشهٔ
// نتایج — بانکِ متمایزِ دیده‌شده ÷ BOOK_BANK_COUNTS؛ کلیدهایِ گرامر
// سشن می‌شوند اما در شمارندهٔ بانکِ تست نمی‌روند.
// ------------------------------------------------------------------

const R = (percent: number): QuizResult => ({
  percent,
  correct: Math.round(percent / 10),
  total: 10,
  at: "2026-10-20T10:00:00.000Z",
});

describe("jozveCoverage — شکل و قرارداد", () => {
  it("با نقشهٔ خالی، هر شش پایه صفر اما با total پین‌شده برمی‌گردد", () => {
    const rows = jozveCoverage({});
    expect(rows.map((r) => r.grade)).toEqual([7, 8, 9, 10, 11, 12]);
    expect(rows.map((r) => r.total)).toEqual([20, 19, 50, 100, 108, 144]);
    for (const r of rows) {
      expect(r.attempted).toBe(0);
      expect(r.percent).toBe(0);
      expect(r.sessions).toBe(0);
      expect(r.bestPercent).toBe(0);
    }
  });

  it("کلیدِ بانکِ تست → attempted و percent درست", () => {
    const rows = jozveCoverage({ "jozve-g10-l5": R(80), "jozve-g10-l1": R(60) });
    const g10 = rows.find((r) => r.grade === 10)!;
    expect(g10.attempted).toBe(2);
    expect(g10.total).toBe(100);
    expect(g10.percent).toBe(2);
    expect(g10.sessions).toBe(2);
    expect(g10.bestPercent).toBe(80);
  });

  it("همان بانک دوباره ثبت شود — متمایز می‌ماند (کلیدِ تکراری در Record وجود ندارد، بانکِ دیگر می‌آید)", () => {
    const rows = jozveCoverage({ "jozve-g7-l3": R(50), "jozve-g7-l3x": R(90) });
    const g7 = rows.find((r) => r.grade === 7)!;
    // l3x بانکِ ۳ نیست — الگوی سخت تنها l3 را می‌شمارد
    expect(g7.attempted).toBe(1);
    expect(g7.sessions).toBe(2);
  });

  it("کلیدهایِ گرامر سشن می‌شوند اما بانکِ تست نه", () => {
    const rows = jozveCoverage({
      "jozve-g11-gram-l3": R(70),
      "jozve-g11-tgram-l2": R(85),
      "jozve-g11-kgram-l7": R(90),
    });
    const g11 = rows.find((r) => r.grade === 11)!;
    expect(g11.sessions).toBe(3);
    expect(g11.attempted).toBe(0);
    expect(g11.percent).toBe(0);
    expect(g11.bestPercent).toBe(90);
  });

  it("پایه‌هایِ بیرون از ۷..۱۲ و کلیدهایِ غیرِ jozve نادیده گرفته می‌شوند", () => {
    const rows = jozveCoverage({
      "jozve-g6-l1": R(100),
      "jozve-g13-l1": R(100),
      "exam": R(100),
      "1:vocab": R(100),
      "rush": R(100),
    });
    expect(jozveCoverageHasAny(rows)).toBe(false);
    for (const r of rows) expect(r.sessions).toBe(0);
  });

  it("سرریزِ فرضیِ بانک — درصد به ۱۰۰ کپ می‌شود", () => {
    const results: Record<string, QuizResult> = {};
    for (let i = 1; i <= 25; i++) results[`jozve-g7-l${i}`] = R(60);
    const g7 = jozveCoverage(results).find((r) => r.grade === 7)!;
    expect(g7.attempted).toBe(25);
    expect(g7.percent).toBe(100); // 25/20 → کپ
  });

  it("bestPercent بزرگ‌ترینِ درصدهایِ همان کتاب است", () => {
    const rows = jozveCoverage({
      "jozve-g12-l1": R(40),
      "jozve-g12-gram-l1": R(95),
      "jozve-g12-l2": R(75),
    });
    const g12 = rows.find((r) => r.grade === 12)!;
    expect(g12.bestPercent).toBe(95);
    expect(g12.attempted).toBe(2);
    expect(g12.sessions).toBe(3);
  });
});

describe("jozveCoverageHasAny — دروازهٔ حالتِ خالی", () => {
  it("بدونِ هیچ سشنِ jozve → false", () => {
    expect(jozveCoverageHasAny(jozveCoverage({}))).toBe(false);
    expect(jozveCoverageHasAny(jozveCoverage({ exam: R(80) }))).toBe(false);
  });

  it("با دست‌کم یک سشنِ jozve (حتی گرامر) → true", () => {
    expect(jozveCoverageHasAny(jozveCoverage({ "jozve-g9-gram-l1": R(60) }))).toBe(true);
  });
});
