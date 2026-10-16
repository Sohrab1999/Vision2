import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

type TQuestion = {
  id: string;
  n: number;
  category: string;
  question: string;
  options: string[];
  answer: number;
};
type TLesson = { lesson: number; title: string; level: string; count: number; questions: TQuestion[] };
type TBank = {
  grade: number;
  family: string;
  source: {
    booklet: string;
    extractedRound: number;
    tags?: {
      pages: string;
      topic: string;
      familyA: { questions: number; pages: string; level: string; keyType: string; spotLocks: Record<string, string>; notes: string };
      familyB: {
        questions: number; pages: string; level: string; keyType: string;
        konkur98: Record<string, string>; statementList: number[]; blankless: number[];
        spotLocks: Record<string, string>;
      };
      printedQuirks: { q: string; field: string; note: string }[];
      translations: string;
      discovery: string;
      extractedRound: number;
    };
  };
  lessons: TLesson[];
};

const bank: TBank = JSON.parse(
  readFileSync(path.join(process.cwd(), "public/jozve/grammar-g12-topic.json"), "utf8")
);

const FA = /[\u0600-\u06FF]/;
const BLANK = "---------------";

const l8 = bank.lessons.find((l) => l.lesson === 8)!;
const l9 = bank.lessons.find((l) => l.lesson === 9)!;
const fresh = [...l8.questions, ...l9.questions];

describe("jozve topic grammar bank g12 — tag questions duo (r283 extraction receipt)", () => {
  it("bank shape: nine lessons, duo added as exactly 20/15 with continuous printed numbering", () => {
    expect(bank.lessons.map((l) => l.lesson)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]); // r285 درس ۱۲ تایپی «بنویسید» را افزود
    // درس‌های r280-r282 دست‌نخورده
    const counts = [27, 61, 30, 50, 20, 20, 40];
    counts.forEach((c, i) => expect(bank.lessons[i].questions).toHaveLength(c));
    expect(l8.count).toBe(20);
    expect(l9.count).toBe(15);
    expect(l8.questions.map((q) => q.n)).toEqual(Array.from({ length: 20 }, (_, i) => i + 1));
    expect(l9.questions.map((q) => q.n)).toEqual(Array.from({ length: 15 }, (_, i) => i + 1));
    expect(l8.questions.every((q) => q.id === `g12-tag1-${q.n}`)).toBe(true);
    expect(l9.questions.every((q) => q.id === `g12-tag2-${q.n}`)).toBe(true);
    expect(l8.level).toBe("دستگرمی");
    expect(l9.level).toBe("کنکوری");
    expect(bank.source.tags?.extractedRound).toBe(283);
    expect(bank.source.tags?.familyA.questions).toBe(20);
    expect(bank.source.tags?.familyB.questions).toBe(15);
  });

  it("every new question: four unique English options, valid answer, canonical blank (registry blankless B9/B12), clean spacing", () => {
    for (const q of fresh) {
      expect(q.options, `${q.id} options`).toHaveLength(4);
      expect(new Set(q.options).size, `${q.id} unique options`).toBe(4);
      expect(q.answer, `${q.id} answer range`).toBeGreaterThanOrEqual(0);
      expect(q.answer, `${q.id} answer range`).toBeLessThanOrEqual(3);
      expect(FA.test(q.question), `${q.id} stem purity`).toBe(false);
      for (const o of q.options) expect(FA.test(o), `${q.id} option purity`).toBe(false);
      expect(q.question, `${q.id} double space`).not.toContain("  ");
      for (const o of q.options) expect(o, `${q.id} option spacing`).not.toContain("  ");
      const blankless = q.id.startsWith("g12-tag2-") && [9, 12].includes(q.n);
      if (blankless) {
        expect(q.question, `${q.id} blankless registry`).not.toContain(BLANK);
      } else {
        expect(q.question, `${q.id} canonical blank`).toContain(BLANK);
        // خالی کانونی: بدون چسبیدگی به حروف
        expect(q.question, `${q.id} no glued blank`).not.toMatch(/[A-Za-z]---------------/);
      }
    }
  });

  it("grid fidelity bank A: full 20-key lock from the printed column grid (p187 bottom)", () => {
    // وفاداری کامل به گرید ستونی «پاسخنامه 20 تست آموزش گرامر عبارات الحاق (صفحه 44)»
    const full = ["d","d","c","a","a","c","b","b","b","d","c","b","b","d","d","c","b","a","a","d"];
    full.forEach((k, i) => expect(l8.questions[i].answer, `A-Q${i + 1}`).toBe("abcd".indexOf(k)));
    // قفل‌های متنِ گزینه برای سطرهای نخستین/آخرین گرید + تله‌های معنایی
    expect(l8.questions[0].options[l8.questions[0].answer]).toBe("will you"); // منفی imperative → will you
    expect(l8.questions[1].options[l8.questions[1].answer]).toBe("is it");
    expect(l8.questions[6].options[l8.questions[6].answer]).toBe("aren’t I"); // I'm → aren't I
    expect(l8.questions[9].options[l8.questions[9].answer]).toBe("is she"); // think+منفی زیرین → tag مثبت زیرین
    expect(l8.questions[13].options[l8.questions[13].answer]).toBe("shouldn’t they");
    expect(l8.questions[17].options[l8.questions[17].answer]).toBe("didn’t"); // تگ ناقص چاپی «--- he?»
    expect(l8.questions[18].options[l8.questions[18].answer]).toBe("isn’t it"); // meeting's = is
    expect(l8.questions[19].options[l8.questions[19].answer]).toBe("won’t you");
    expect(bank.source.tags?.familyA.spotLocks["7"]).toBe("b");
    expect(bank.source.tags?.familyA.spotLocks["18"]).toBe("a");
  });

  it("explanatory fidelity bank B: full 15-key lock + konkur-98 provenance + statement-list shape", () => {
    const full = ["d","c","b","d","d","c","d","a","a","a","b","b","c","d","b"];
    full.forEach((k, i) => expect(l9.questions[i].answer, `B-Q${i + 1}`).toBe("abcd".indexOf(k)));
    // قفل‌های متنِ گزینه — منطق tag: جملهٔ پایه/جوابِ شرط
    expect(l9.questions[0].options[l9.questions[0].answer]).toBe("doesn’t she"); // کنکور ۹۸ — جملهٔ پایه
    expect(l9.questions[1].options[l9.questions[1].answer]).toBe("must it"); // فاعل explanation
    expect(l9.questions[2].options[l9.questions[2].answer]).toBe("isn’t it"); // کنکور ۹۸
    expect(l9.questions[5].options[l9.questions[5].answer]).toBe("shall we"); // Let's
    expect(l9.questions[6].options[l9.questions[6].answer]).toBe("ordered"); // گذشته ساده با didn't she
    expect(l9.questions[7].options[l9.questions[7].answer]).toBe("did you"); // think+never → tag مثبت زیرین
    expect(l9.questions[12].options[l9.questions[12].answer]).toBe("wouldn’t they"); // جوابِ شرط
    expect(l9.questions[13].options[l9.questions[13].answer]).toBe("don’t you"); // have to → do
    expect(l9.questions[14].options[l9.questions[14].answer]).toBe("can we"); // none → tag مثبت زیرین
    // سؤال‌های فهرست-گزاره‌ای و بی‌خالیِ ثبت‌شده
    expect(bank.source.tags?.familyB.statementList).toEqual([4, 9, 12]);
    expect(bank.source.tags?.familyB.blankless).toEqual([9, 12]);
    for (const n of [4, 9, 12]) {
      const q = l9.questions[n - 1];
      expect(q.question.startsWith("Which of the"), `B-Q${n} statement stem`).toBe(true);
    }
    // سابقهٔ کنکور ۹۸ در رسید
    const k98 = bank.source.tags?.familyB.konkur98;
    if (!k98) throw new Error("tags.familyB.konkur98 missing");
    expect(Object.keys(k98).sort()).toEqual(["1", "3"]);
    expect(k98["1"]).toContain("98");
    expect(k98["3"]).toContain("98");
  });

  it("printed quirks preserved faithfully with receipts", () => {
    const quirks = bank.source.tags?.printedQuirks;
    if (!quirks) throw new Error("tags.printedQuirks missing");
    expect(quirks.map((x) => x.q)).toEqual(["A9", "A11", "B7", "B12"]);
    expect(l8.questions[8].question).toContain("future.,"); // نقطه+ویرگول چاپی
    expect(l8.questions[10].question).toContain("100 ℃"); // نماد سلسیوس چاپی
    expect(l8.questions[17].question).toMatch(/--------------- he\?$/); // تگ ناقص چاپی
    expect(l9.questions[6].options[2]).toBe("hasn’t order"); // غلط چاپی خود جزوه
    expect(l9.questions[11].options[2]).toContain("have good job"); // بدون حرف تعریف — چاپی
  });

  it("honest absence of translations with reason (OCR-damaged explanatory Persian)", () => {
    for (const q of fresh) expect(q, `${q.id} no translation field`).not.toHaveProperty("translation");
    const tr = bank.source.tags?.translations;
    if (!tr) throw new Error("tags.translations missing");
    expect(tr).toContain("r281");
    expect(tr).toContain("OCR");
  });

  it("family-wide uniqueness: 365 ids after r285, old lessons untouched, discovery receipt for p187 40-key grid", () => {
    const all = bank.lessons.flatMap((l) => l.questions.map((q) => q.id));
    expect(new Set(all).size).toBe(all.length);
    expect(all).toHaveLength(365); // r284 شصت تست مجهول + r285 بیست‌ودو تست تایپی «بنویسید» را افزودند
    expect(bank.source.tags?.discovery).toContain("معلوم و مجهول");
    expect(bank.source.tags?.discovery).toContain("37");
  });
});
