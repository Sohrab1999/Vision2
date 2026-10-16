import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

// =====================================================================
// r273 — گاردِ بانک تست واژگان جزوهٔ دوازدهم (ادامهٔ استخراج به درخواست کاربر)
// قرارداد: هر چیزی که کارت «آزمون واژگان این جزوه» ادعا می‌کند باید با
// خودِ داده در public/jozve/tests-g12.json و مانیفست GRADE_TESTS یکی باشد.
// مثل lesson-meta.test.ts — اعداد کهنه نباید بی‌صدا کهنه بمانند.
// =====================================================================

interface BankQuestion {
  id: string;
  n: number;
  category: string;
  question: string;
  options: string[];
  answer: number;
  translation?: string;
}
interface Bank {
  grade: number;
  answerArbitration?: { q: number; letter: string; why: string }[];
  lessons: { lesson: number; title: string; count: number; questions: BankQuestion[] }[];
}

const bank: Bank = JSON.parse(
  readFileSync(path.join(process.cwd(), "public/jozve/tests-g12.json"), "utf8")
);

const FA = /[\u0600-\u06FF]/;
const BLANK = /-{5,}/;

describe("jozve test bank g12-l1 (r273 extraction receipt)", () => {
  it("bank shape: grade 12, one lesson, exactly 100 questions", () => {
    expect(bank.grade).toBe(12);
    expect(bank.lessons).toHaveLength(1);
    const l = bank.lessons[0];
    expect(l.lesson).toBe(1);
    expect(l.count).toBe(100);
    expect(l.questions).toHaveLength(100);
    expect(l.questions.map((q) => q.n)).toEqual(Array.from({ length: 100 }, (_, i) => i + 1));
  });

  it("every question: 4 unique options, valid answer, blanked stem, English purity", () => {
    for (const q of bank.lessons[0].questions) {
      expect(q.options, q.id).toHaveLength(4);
      expect(new Set(q.options).size, q.id).toBe(4);
      expect(q.answer, q.id).toBeGreaterThanOrEqual(0);
      expect(q.answer, q.id).toBeLessThanOrEqual(3);
      expect(BLANK.test(q.question), `blank in ${q.id}: ${q.question}`).toBe(true);
      expect(FA.test(q.question), `Persian leaked in stem of ${q.id}`).toBe(false);
      for (const o of q.options) expect(FA.test(o), `Persian leaked in option of ${q.id}`).toBe(false);
    }
  });

  it("translations: 99/100 with the jozve's own honest absence at Q75", () => {
    const withTr = bank.lessons[0].questions.filter((q) => q.translation && q.translation.trim().length > 4);
    expect(withTr).toHaveLength(99);
    const q75 = bank.lessons[0].questions.find((q) => q.n === 75);
    expect(q75?.translation).toBeUndefined();
  });

  it("arbitration receipt: the two jozve-key errata are locked (Q74→b, Q79→a) with reasons", () => {
    const arb = bank.answerArbitration ?? [];
    expect(arb.map((a) => [a.q, a.letter])).toEqual([
      [74, "b"],
      [79, "a"],
    ]);
    for (const a of arb) expect(a.why.length).toBeGreaterThan(20);
    const q74 = bank.lessons[0].questions.find((q) => q.n === 74)!;
    const q79 = bank.lessons[0].questions.find((q) => q.n === 79)!;
    expect(q74.options[q74.answer]).toBe("protect");
    expect(q79.options[q79.answer]).toBe("responsibility");
  });

  it("semantic spot checks against the jozve's own translations", () => {
    const opt = (n: number) => {
      const q = bank.lessons[0].questions.find((x) => x.n === n)!;
      return q.options[q.answer].toLowerCase();
    };
    expect(opt(1)).toBe("attempt");
    expect(opt(11)).toBe("donate");
    expect(opt(25)).toBe("spare");
    expect(opt(100)).toBe("make");
  });

  it("manifest lock: GRADE_TESTS in jozve-view must mirror the real bank", async () => {
    const src = readFileSync(
      path.join(process.cwd(), "src/components/study/jozve/jozve-view.tsx"),
      "utf8"
    );
    expect(src).toContain('12: { lessons: [{ lesson: 1, title: "درس اول", count: 100 }] }');
    expect(src).toContain("trackMistakes={false}"); // بانک خطای سه درس دست‌نخورده می‌ماند
  });
});
