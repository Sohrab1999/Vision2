import { describe, expect, it } from "vitest";
import { jozveCoverage } from "@/lib/jozve-coverage";
import type { QuizResult } from "@/lib/study-types";

// ------------------------------------------------------------------
// پیمان‌های r416 — nextRun: طولِ دویدنِ پشت‌سرهمِ بانک‌هایِ
// پوشیده‌نشده از nextBank (شاملِ خودش). مصرف‌کننده چیپِ «K بانکِ
// پیاپی» در کارنامه است — گیتِ نمایش (percent > 0) آنجاست.
// ------------------------------------------------------------------

const R = (percent: number): QuizResult => ({
  percent,
  correct: Math.round(percent / 10),
  total: 10,
  at: "2026-10-20T10:00:00.000Z",
});

const rowOf = (grade: number, results: Record<string, QuizResult>) =>
  jozveCoverage(results).find((r) => r.grade === grade)!;

describe("jozveCoverage — nextRun (r416)", () => {
  it("بانک‌های {1,5}: nextBank=۲ و دویِ ۳ (۲و۳و۴ باز، ۵ پوشیده)", () => {
    const g10 = rowOf(10, { "jozve-g10-l1": R(80), "jozve-g10-l5": R(60) });
    expect(g10.nextBank).toBe(2);
    expect(g10.nextRun).toBe(3);
  });

  it("یادگیرندهٔ تازه: دویِ کامل = total (هفتم: ۲۰، دهم: ۱۰۰)", () => {
    expect(rowOf(7, {}).nextRun).toBe(20);
    expect(rowOf(10, {}).nextRun).toBe(100);
  });

  it("فقط سشنِ گرامر: بانکی شروع نشده — دویِ کل (۱۰۸)", () => {
    const g11 = rowOf(11, { "jozve-g11-gram-l1": R(70) });
    expect(g11.nextBank).toBe(1);
    expect(g11.nextRun).toBe(108);
  });

  it("پوششِ کامل: nextBank=null و nextRun=۰", () => {
    const results: Record<string, QuizResult> = {};
    for (let m = 1; m <= 20; m++) results[`jozve-g7-l${m}`] = R(60);
    const g7 = rowOf(7, results);
    expect(g7.nextBank).toBeNull();
    expect(g7.nextRun).toBe(0);
  });

  it("بانک‌های پشت‌سرهمِ ۱..۱۰ در دهم: nextBank=۱۱ با دویِ ۹۰", () => {
    const results: Record<string, QuizResult> = {};
    for (let m = 1; m <= 10; m++) results[`jozve-g10-l${m}`] = R(60);
    const g10 = rowOf(10, results);
    expect(g10.nextBank).toBe(11);
    expect(g10.nextRun).toBe(90);
  });

  it("دویِ کوتاهِ ته‌سند: {99} در هفتمِ ۲۰تایی — دوی از ۱ تا ۲۰ منهایِ هیچ… ۲۰ (۹۹ خارجِ بازه پوشش نمی‌گیرد)", () => {
    const g7 = rowOf(7, { "jozve-g7-l99": R(60) });
    expect(g7.nextBank).toBe(1);
    expect(g7.nextRun).toBe(20); // ۹۹ خارجِ ۱..۲۰ — در دویِ دیده نمی‌شود
  });

  it("دویِ منقطع در میانه: {1,2,4} در هفتم — nextBank=۳ با دویِ ۱", () => {
    const g7 = rowOf(7, { "jozve-g7-l1": R(60), "jozve-g7-l2": R(60), "jozve-g7-l4": R(60) });
    expect(g7.nextBank).toBe(3);
    expect(g7.nextRun).toBe(1);
  });
});
