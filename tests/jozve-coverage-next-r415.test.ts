import { describe, expect, it } from "vitest";
import { jozveCoverage } from "@/lib/jozve-coverage";
import { bankLessonOrdinalByIndex } from "@/lib/books";
import type { QuizResult } from "@/lib/study-types";

// ------------------------------------------------------------------
// پیمان‌های r415 — «ادامه از بانک M»: (الف) nextBank در jozveCoverage —
// کوچک‌ترین اندیسِ بانکِ پوشیده‌نشده (۱..total)؛ کلیدِ `jozve-gN-lM`
 // اندیسِ بانک است، نه شمارهٔ درس. (ب) bankLessonOrdinalByIndex در
// books.ts — نگاشتِ اندیسِ بانک → ordinalِ درس از «عنوانِ» بانک
// (بانک ۳ِ هفتم «امتحانی درس دوم» است — دو شمارنده یکی نیستند).
// ------------------------------------------------------------------

const R = (percent: number): QuizResult => ({
  percent,
  correct: Math.round(percent / 10),
  total: 10,
  at: "2026-10-20T10:00:00.000Z",
});

const rowOf = (grade: number, results: Record<string, QuizResult>) =>
  jozveCoverage(results).find((r) => r.grade === grade)!;

describe("jozveCoverage — nextBank (r415)", () => {
  it("یادگیرندهٔ تازه: nextBank = ۱ در همهٔ پایه‌ها (دعوت به بانک اول)", () => {
    const rows = jozveCoverage({});
    for (const r of rows) {
      expect(r.nextBank).toBe(1);
    }
  });

  it("بانک‌های {1,5} دیده‌شده → nextBank = ۲ (اولینِ پوشیده‌نشده)", () => {
    const g10 = rowOf(10, { "jozve-g10-l1": R(80), "jozve-g10-l5": R(60) });
    expect(g10.attempted).toBe(2);
    expect(g10.nextBank).toBe(2);
  });

  it("فقط سشنِ گرامر (بدونِ بانکِ تست) → nextBank = ۱ و attempted = ۰", () => {
    const g11 = rowOf(11, { "jozve-g11-gram-l3": R(70) });
    expect(g11.attempted).toBe(0);
    expect(g11.sessions).toBe(1);
    expect(g11.nextBank).toBe(1);
  });

  it("بانکِ بیرون از بازه (l21 در پایهٔ هفتمِ ۲۰تایی) nextBank را جعل نمی‌کند", () => {
    const g7 = rowOf(7, { "jozve-g7-l21": R(90) });
    expect(g7.attempted).toBe(1); // شمرده می‌شود اما...
    expect(g7.nextBank).toBe(1); // ...بانکِ ۱ همچنان پوشیده‌نشده است
  });

  it("پوششِ کاملِ ۲۰ بانکِ هفتم → nextBank = null (ادامه‌ای نیست)", () => {
    const results: Record<string, QuizResult> = {};
    for (let m = 1; m <= 20; m++) results[`jozve-g7-l${m}`] = R(60);
    const g7 = rowOf(7, results);
    expect(g7.attempted).toBe(20);
    expect(g7.percent).toBe(100);
    expect(g7.nextBank).toBeNull();
  });
});

describe("bankLessonOrdinalByIndex — نگاشتِ بانک → درس (r415)", () => {
  // قراردادِ واقعیِ data: بانکِ ۳ِ هفتم «امتحانی درس دوم» است
  const fakeTests = {
    lessons: [
      { lesson: 1, title: "امتحانی درس اول — شکل کوچک و بزرگ حروف (س۱، ص۵۰)", count: 5 },
      { lesson: 3, title: "امتحانی درس دوم — نام‌سازی از حروفِ داده‌شده (س۲، ص۵۶)", count: 7 },
      { lesson: 6, title: "تشریحی — جای خالی از بانک واژه (ص۴۹)", count: 4 },
    ],
  };

  it("بانکِ درس‌دار → ordinalِ «عنوان»، نه فیلدِ lesson (۳ → درس دوم = ۲)", () => {
    expect(bankLessonOrdinalByIndex(fakeTests, 3)).toBe(2);
  });

  it("بانکِ بی‌درس (تشریحی/نهایی‌ها) → null", () => {
    expect(bankLessonOrdinalByIndex(fakeTests, 6)).toBeNull();
  });

  it("اندیسِ ناموجود → null؛ tests تهی → null", () => {
    expect(bankLessonOrdinalByIndex(fakeTests, 99)).toBeNull();
    expect(bankLessonOrdinalByIndex(null, 1)).toBeNull();
  });
});
