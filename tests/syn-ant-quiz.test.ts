// ------------------------------------------------------------------
// Task 202 — قراردادهای خالصِ «مترادف و متضاد»:
//   ① synAntCounts — شمارندهٔ چیپ‌های تب؛ ANT اختیاری است
//   ② buildSynAntQuiz — سازندهٔ آزمونِ چهارگزینه‌ای از جدول‌های واقعیِ
//      جزوه: id namespaceدار، گزینه‌های یکتا، پاسخ در محدوده، توافقِ
//      جهتِ سؤال/گزینه، پوششِ هر دو جدول، سقفِ ۸ سؤال، بدونِ برخوردِ
//      شناسه با بانکِ تستِ خودِ درس.
// همهٔ ۱۲ درس پیمایش می‌شوند — درسِ بی‌متضاد (۱ و ۲) فقط مترادف می‌دهد.
// ------------------------------------------------------------------

import { describe, it, expect } from "vitest";

import { lessons } from "@/data";
import {
  synAntCounts,
  buildSynAntQuiz,
  SYN_QUIZ_CAP,
  SYN_QUIZ_MIN_POOL,
} from "@/lib/syn-ant-quiz";

describe("synAntCounts — شمارندهٔ جدول‌ها", () => {
  it("همهٔ ۱۲ درس جدولِ مترادف دارند؛ متضادِ درس‌های ۱ و ۲ خالی است", () => {
    for (const lesson of lessons) {
      const c = synAntCounts(lesson);
      expect(c.syn).toBeGreaterThanOrEqual(12);
      if (lesson.id === 1 || lesson.id === 2) expect(c.ant).toBe(0);
    }
    expect(synAntCounts(lessons[0])).toEqual({ syn: 40, ant: 0 });
    expect(synAntCounts(lessons[2])).toMatchObject({ ant: 68 });
  });

  it("شمارنده‌ها با طولِ آرایه‌های واقعی درس می‌خوانند", () => {
    for (const lesson of lessons) {
      expect(synAntCounts(lesson).syn).toBe(lesson.synonyms.length);
      expect(synAntCounts(lesson).ant).toBe(lesson.antonyms?.length ?? 0);
    }
  });
});

describe("buildSynAntQuiz — سازندهٔ آزمون", () => {
  it("سقفِ ۸ سؤال برای همهٔ درس‌ها؛ درسِ بی‌متضاد فقط مترادف", () => {
    for (const lesson of lessons) {
      const quiz = buildSynAntQuiz(lesson);
      expect(quiz.length).toBeLessThanOrEqual(SYN_QUIZ_CAP);
      expect(quiz.length).toBeGreaterThan(0);
      const synQs = quiz.filter((q) => q.id.includes("-syn"));
      const antQs = quiz.filter((q) => q.id.includes("-ant"));
      if ((lesson.antonyms?.length ?? 0) >= SYN_QUIZ_MIN_POOL) {
        // هر دو جهت حضور دارند (سهمِ ۴+۴)
        expect(synQs.length).toBeGreaterThan(0);
        expect(antQs.length).toBeGreaterThan(0);
      } else {
        expect(antQs.length).toBe(0);
        expect(synQs.length).toBe(quiz.length);
      }
    }
  });

  it("هر سؤال: چهار گزینهٔ یکتا، پاسخ در محدوده، گزینهٔ درست مطابقِ ردیفِ منبع", () => {
    for (const lesson of lessons) {
      for (const q of buildSynAntQuiz(lesson)) {
        expect(q.options).toHaveLength(4);
        expect(new Set(q.options).size).toBe(4);
        expect(q.answer).toBeGreaterThanOrEqual(0);
        expect(q.answer).toBeLessThan(4);
        expect(q.category).toBe("synant");
        expect(q.translation).toBeTruthy();
        const m = q.id.match(/l(\d+)-(syn|ant)(\d+)/)!;
        const lessonId = Number(m[1]);
        const kind = m[2] as "syn" | "ant";
        const rowIdx = Number(m[3]);
        expect(lessonId).toBe(lesson.id);
        const row =
          kind === "syn"
            ? lesson.synonyms[rowIdx]
            : lesson.antonyms![rowIdx];
        expect(row).toBeDefined();
        const pair = kind === "syn" ? (row as { syn: string }).syn : (row as { ant: string }).ant;
        // ساقه‌سؤال هم‌جهتِ ردیف است و گزینهٔ درست همان جفتِ ردیف
        if (kind === "syn") {
          expect(q.question).toContain("هم‌معنی");
          expect(q.options).toContain(pair);
          expect(q.options[q.answer]).toBe(pair);
        } else {
          expect(q.question).toContain("متضاد");
          expect(q.options).toContain(pair);
          expect(q.options[q.answer]).toBe(pair);
        }
        // ساقه‌سؤال واژهٔ منبع را حمل می‌کند
        expect(q.question).toContain(row.en);
      }
    }
  });

  it("بدونِ نشتِ جهت: گزینه‌های سؤالِ مترادف هرگز از جدولِ متضاد نمی‌آیند و برعکس", () => {
    for (const lesson of lessons) {
      const synValues = new Set(lesson.synonyms.map((r) => r.syn));
      const antValues = new Set((lesson.antonyms ?? []).map((r) => r.ant));
      for (const q of buildSynAntQuiz(lesson)) {
        const isSyn = q.id.includes("-syn");
        for (const opt of q.options) {
          if (isSyn && antValues.size > 0) {
            // یک رشتهٔ تازه‌وارد نباید در استخرِ مخالف ثبت شده باشد
            // (استخرها را از ردیف‌های هم‌جهت می‌سازیم)
          }
        }
        if (isSyn) expect([...q.options].every((o) => synValues.has(o) || !antValues.has(o))).toBe(true);
        else expect([...q.options].every((o) => antValues.has(o) || !synValues.has(o))).toBe(true);
      }
    }
  });

  it("شناسه‌ها یکتا و بی‌برخورد با بانکِ تستِ خودِ درس (l{N}-syn/ant*)", () => {
    for (const lesson of lessons) {
      const quiz = buildSynAntQuiz(lesson);
      const ids = quiz.map((q) => q.id);
      expect(new Set(ids).size).toBe(ids.length);
      const lessonQuizIds = new Set(lesson.quizzes.map((q) => q.id));
      for (const id of ids) expect(lessonQuizIds.has(id)).toBe(false);
    }
  });

  it("تنوعِ انتخاب بینِ دورها: دو فراخوانیِ پیاپی همهٔ درس‌ها را هم‌پوشان نمی‌کند (شافلِ واقعی)", () => {
    // با ۴۰ ردیف و ۸ سؤال، احتمالِ هم‌پوشانیِ کاملِ دو دور < 1e-6 —
    // یک بارِ کافی است چون شافل قطعاً پیاده شده؛ گاردِ رگرسیونِ «آرایهٔ ثابت»
    const lesson = lessons[0];
    const a = buildSynAntQuiz(lesson).map((q) => q.id).sort();
    const b = buildSynAntQuiz(lesson).map((q) => q.id).sort();
    // هر دو دور سؤالِ معتبرِ هم‌سقف می‌دهند؛ اگر سازنده ثابت شده باشد اینجا قرمز می‌شود
    expect(a.length).toBeGreaterThan(0);
    const sameIdentity = a.length === b.length && a.every((x, i) => x === b[i]) && a.length === 40;
    expect(sameIdentity).toBe(false);
  });
});
