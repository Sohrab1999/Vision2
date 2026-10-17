import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

// =====================================================================
// r274 — گاردِ بانک‌های درس ۲ و ۳ جزوهٔ دوازدهم (ادامهٔ مستقیم r273)
// درس ۲: ص۷۴-۷۸ + کلید c14/sec1 + ترجمهٔ c14/sec0 (بازیابی ۴ سرصفحهٔ جابه‌جا)
// درس ۳: ص۱۳۲-۱۳۶ + کلید c15/sec1 + ترجمهٔ c15/sec0 (بازچینی ۴۲ ترجمه از
//         قطعات جابه‌جاشدهٔ لایهٔ متنی — رسید در translationRestorations)
// قرارداد: هر ادعایی که کارت «آزمون واژگان این جزوه» می‌کند باید با خودِ
// داده در public/jozve/tests-g12.json و مانیفست GRADE_TESTS یکی باشد.
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
interface BankSource {
  file: string;
  questionPages: string;
  keyGrid: string;
  translationsWashed?: {
    round: string;
    pages: string;
    section: string;
    method: string;
    items: number;
    supersedes: string;
    printQuirks: string[];
  };
}
interface BankLesson {
  lesson: number;
  title: string;
  count: number;
  translationRestorations?: { count: number; note: string; questions: number[] };
  source?: BankSource;
  questions: BankQuestion[];
}
interface Bank {
  grade: number;
  lessons: BankLesson[];
}

const bank: Bank = JSON.parse(
  readFileSync(path.join(process.cwd(), "public/jozve/tests-g12.json"), "utf8")
);

const FA = /[\u0600-\u06FF]/;
const BLANK = /-{5,}/;

const l2 = bank.lessons.find((l) => l.lesson === 2)!;
const l3 = bank.lessons.find((l) => l.lesson === 3)!;

describe("jozve test bank g12-l2/l3 (r274 extraction receipt)", () => {
  it("both lessons: 100 questions, 1..100, contiguous", () => {
    for (const l of [l2, l3]) {
      expect(l.count).toBe(100);
      expect(l.questions).toHaveLength(100);
      expect(l.questions.map((q) => q.n)).toEqual(Array.from({ length: 100 }, (_, i) => i + 1));
      expect(l.questions.every((q) => q.id.startsWith(`g12-l${l.lesson}-`))).toBe(true);
    }
  });

  it("every question: 4 unique options, valid answer, blanked stem, English purity", () => {
    for (const l of [l2, l3]) {
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

  it("translations: every question carries the jozve's own Persian translation", () => {
    for (const l of [l2, l3]) {
      const withTr = l.questions.filter((q) => q.translation && q.translation.trim().length > 4);
      expect(withTr, `lesson ${l.lesson}`).toHaveLength(100);
      for (const q of withTr) {
        expect(FA.test(q.translation!), `Persian translation of ${q.id}`).toBe(true);
        // خلوص فارسی: فقط اسم‌خاص iGoogle/NPR لاتین مجازند (Q65 درس ۳)
        const clean = q.translation!.replace(/iGoogle|NPR|W\.H\.O/g, "");
        expect(/[A-Za-z]{3,}/.test(clean), `Latin leaked in translation of ${q.id}`).toBe(false);
      }
    }
  });

  it("receipts: lesson 2 keeps r274 restorations, lesson 3 superseded by r316 print-verbatim wash", () => {
    expect(l2.translationRestorations?.count).toBe(4);
    expect(l2.translationRestorations?.questions).toEqual([4, 5, 14, 15]);
    // r316: تمام ۱۰۰ ترجمهٔ l3 چاپ‌محور بازنویسی شد — رسیدِ بازچینیِ r274 جای خود را به translationsWashed داد
    expect((l3 as unknown as { translationRestorations?: unknown }).translationRestorations).toBeUndefined();
    expect(l3.source?.translationsWashed?.round).toBe("r316");
    expect(l3.source?.translationsWashed?.items).toBe(100);
    // چاپِ جزوه حاکم است: Q65 «هنرهای الکتریکی» (تحت‌اللفظی Electronic Arts) — نه بازسازیِ معنایی r274
    expect(l3.questions.find((q) => q.n === 65)?.translation).toContain("هنرهای الکتریکی");
    expect(l3.questions.find((q) => q.n === 65)?.translation).not.toContain("الکترونیک آرتس");
    expect(l3.questions.find((q) => q.n === 43)?.translation).toContain("۲۵ درصد");
    expect(l2.questions.find((q) => q.n === 5)?.translation).toContain("W.H.O");
  });

  it("no cross-question pollution survived: restored scopes hold their own content only", () => {
    // Q22 درس ۳ نباید ترجمهٔ Q28 (چشمان/جراحی) را در خود داشته باشد
    const q22 = l3.questions.find((q) => q.n === 22)!.translation!;
    expect(q22).not.toContain("جراحی");
    // Q24 درس ۳ نباید دمِ Q25 (رنگ روشن) را داشته باشد
    const q24 = l3.questions.find((q) => q.n === 24)!.translation!;
    expect(q24).not.toContain("رنگ روشن");
    // Q37 درس ۳ نباید دمِ Q38 (شیر گاو) را داشته باشد
    const q37 = l3.questions.find((q) => q.n === 37)!.translation!;
    expect(q37).not.toContain("شیر گاو");
    // Q14 درس ۲ نباید دمِ Q15 (قالب‌های سازنده) را داشته باشد
    const q14 = l2.questions.find((q) => q.n === 14)!.translation!;
    expect(q14).not.toContain("قالب");
  });

  it("semantic spot checks against stems and the jozve's own keys", () => {
    const opt = (l: BankLesson, n: number) => {
      const q = l.questions.find((x) => x.n === n)!;
      return q.options[q.answer].toLowerCase();
    };
    // درس ۲
    expect(opt(l2, 1)).toBe("recommended");
    expect(opt(l2, 5)).toBe("is the abbreviation of");
    expect(opt(l2, 10)).toBe("supposed");
    expect(opt(l2, 100)).toBe("immediate");
    // درس ۳
    expect(opt(l3, 1)).toBe("replaced");
    expect(opt(l3, 5)).toBe("global");
    expect(opt(l3, 10)).toBe("cooperation");
    expect(opt(l3, 18)).toBe("source");
    expect(opt(l3, 50)).toBe("remind");
    expect(opt(l3, 100)).toBe("required");
  });
});
