import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

// =====================================================================
// r275 — گاردِ بانک‌های واژگان جزوهٔ یازدهم (ادامهٔ مأموریت «استخراج جزوه‌ها»)
// درس ۱/۲/۳ × ۴۰ تست (ص۱۹-۲۰، ۵۷-۵۸، ۹۱-۹۲) — کلید در سرصفحهٔ ترجمهٔ خود جزوه
// («.Nگزینه (X)»)؛ توضیحات گرامر با «-Nگزینه» جدا شده‌اند (نقطهٔ اجباری پارسر).
// رسیدِ بازچینی: ۱ مورد درس ۱ + ۱۶ مورد درس ۳ در translationRestorations.
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
interface BankLesson {
  lesson: number;
  title: string;
  count: number;
  translationRestorations?: { count: number; note: string; questions: number[] };
  questions: BankQuestion[];
}
interface Bank {
  grade: number;
  lessons: BankLesson[];
}

const bank: Bank = JSON.parse(
  readFileSync(path.join(process.cwd(), "public/jozve/tests-g11.json"), "utf8")
);

const FA = /[\u0600-\u06FF]/;
const BLANK = /-{5,}/;

const l1 = bank.lessons.find((l) => l.lesson === 1)!;
const l2 = bank.lessons.find((l) => l.lesson === 2)!;
const l3 = bank.lessons.find((l) => l.lesson === 3)!;

describe("jozve test bank g11 (r275 extraction receipt)", () => {
  it("bank shape: three 40-test lessons intact — extended by r278's supplementary lessons 4/5", () => {
    expect(bank.grade).toBe(11);
    // r278 دو بانک تکمیلی (۲۲+۲۰) افزود؛ سه بانک اصلی ۴۰تستی باید دست‌نخورده بمانند
    expect(bank.lessons.map((l) => l.lesson)).toEqual([1, 2, 3, 4, 5]);
    for (const l of [l1, l2, l3]) {
      expect(l.count, `lesson ${l.lesson}`).toBe(40);
      expect(l.questions, `lesson ${l.lesson}`).toHaveLength(40);
      expect(l.questions.map((q) => q.n)).toEqual(Array.from({ length: 40 }, (_, i) => i + 1));
      expect(l.questions.every((q) => q.id.startsWith(`g11-l${l.lesson}-`))).toBe(true);
    }
  });

  it("every question: 4 unique options, valid answer, blanked stem, English purity", () => {
    for (const l of [l1, l2, l3]) {
      for (const q of l.questions) {
        expect(q.options, q.id).toHaveLength(4);
        expect(new Set(q.options).size, q.id).toBe(4);
        expect(q.answer, q.id).toBeGreaterThanOrEqual(0);
        expect(q.answer, q.id).toBeLessThanOrEqual(3);
        expect(BLANK.test(q.question), `blank in ${q.id}: ${q.question}`).toBe(true);
        expect(FA.test(q.question), `Persian leaked in stem of ${q.id}`).toBe(false);
        for (const o of q.options) expect(FA.test(o), `Persian leaked in option of ${q.id}`).toBe(false);
      }
    }
  });

  it("translations: every question carries the jozve's own Persian translation (pure Persian)", () => {
    for (const l of [l1, l2, l3]) {
      const withTr = l.questions.filter((q) => q.translation && q.translation.trim().length > 4);
      expect(withTr, `lesson ${l.lesson}`).toHaveLength(40);
      for (const q of withTr) {
        expect(FA.test(q.translation!), `Persian translation of ${q.id}`).toBe(true);
        expect(/[A-Za-z]{3,}/.test(q.translation!), `Latin leaked in translation of ${q.id}`).toBe(false);
      }
    }
  });

  it("restoration receipt: lesson 1 has 1, lesson 3 has 16 re-assembled translations", () => {
    expect(l1.translationRestorations?.count).toBe(1);
    expect(l1.translationRestorations?.questions).toEqual([1]);
    expect(l2.translationRestorations).toBeUndefined();
    expect(l3.translationRestorations?.count).toBe(16);
    expect(l3.translationRestorations?.questions).toEqual([20, 21, 22, 23, 25, 26, 27, 28, 29, 30, 31, 33, 34, 36, 37, 40]);
    expect(l3.translationRestorations?.note.length).toBeGreaterThan(30);
    expect(l3.questions.find((q) => q.n === 25)?.translation).toContain("منظومهٔ شمسی");
    expect(l1.questions.find((q) => q.n === 1)?.translation).toContain("اسکیت‌باز");
  });

  it("no cross-question pollution survived: restored scopes hold their own content only", () => {
    // Q26 درس ۳ نباید دمِ Q27 (افسردگی) را داشته باشد
    const q26 = l3.questions.find((q) => q.n === 26)!.translation!;
    expect(q26).not.toContain("افسردگی");
    // Q22 درس ۳ نباید دمِ Q23 (توانایی‌هایش) را داشته باشد
    const q22 = l3.questions.find((q) => q.n === 22)!.translation!;
    expect(q22).not.toContain("توانایی");
    // Q28 درس ۳ نباید تکهٔ جابه‌جاشدهٔ خودِ قبل از سرصفحه را دوباره داشته باشد
    const q28 = l3.questions.find((q) => q.n === 28)!.translation!;
    expect(q28).toContain("روحی");
    // سرصفحه‌های گرامر («-Nگزینه») هرگز به‌عنوان کلید واژگان نیفتاده‌اند
    for (const l of [l1, l2, l3]) {
      expect(l.questions.every((q) => q.answer >= 0 && q.answer <= 3)).toBe(true);
    }
  });

  it("semantic spot checks against stems and the jozve's own header keys", () => {
    const opt = (l: BankLesson, n: number) => {
      const q = l.questions.find((x) => x.n === n)!;
      return q.options[q.answer].toLowerCase();
    };
    // درس ۱
    expect(opt(l1, 1)).toBe("ability");
    expect(opt(l1, 7)).toBe("access");
    expect(opt(l1, 15)).toBe("continent");
    expect(opt(l1, 40)).toBe("exist");
    // درس ۲
    expect(opt(l2, 1)).toBe("emotional");
    expect(opt(l2, 7)).toBe("effect");
    // درس ۳
    expect(opt(l3, 25)).toBe("unique");
    expect(opt(l3, 37)).toBe("tile");
  });

  it("manifest lock: GRADE_TESTS in jozve-view must list grade 11's three 40-test lessons", () => {
    const src = readFileSync(
      path.join(process.cwd(), "src/components/study/jozve/jozve-view.tsx"),
      "utf8"
    );
    expect(src).toContain("11: {");
    expect(src).toContain('lesson: 1, title: "درس اول", count: 40');
    expect(src).toContain('lesson: 2, title: "درس دوم", count: 40');
    expect(src).toContain('lesson: 3, title: "درس سوم", count: 40');
  });
});
