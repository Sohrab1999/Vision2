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
    passive?: {
      pages: string;
      topic: string;
      part1: { questions: number; pages: string; level: string; keyType: string; spotLocks: Record<string, string> };
      part2: { questions: number; pages: string; level: string; keyType: string; spotLocks: Record<string, string> };
      gridIdentityReceipt: string;
      translations: string;
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

const l10 = bank.lessons.find((l) => l.lesson === 10)!;
const l11 = bank.lessons.find((l) => l.lesson === 11)!;
const fresh = [...l10.questions, ...l11.questions];

describe("jozve topic grammar bank g12 — passive/active duo (r284 extraction receipt)", () => {
  it("bank shape: eleven lessons, duo added as exactly 20/40 with continuous printed numbering", () => {
    expect(bank.lessons.map((l) => l.lesson)).toEqual(Array.from({ length: 284 }, (_, i) => i + 1)); // r285-r286 بانک‌های ۱۲-۱۴، r287 هفت بانک تشریحی و r288 بخش‌های ۸/۹ را افزودند؛ r289-r291 آزمون‌های جامع درس اول تا سوم (۲۴-۵۸) و r292-r305 آزمون‌های نهایی دی ۹۷، خرداد ۹۸، شهریور ۹۸، دی ۹۸، خرداد ۹۹ (دو واریانتِ رشته‌ای)، شهریور ۹۹ (چاپِ جزوه + چاپِ رسمیِ سراسری + ویژهٔ ناشنوایان)، دی ۹۹، خرداد ۱۴۰۰ (دو واریانتِ رشته‌ای)، شهریور ۱۴۰۰ و دی ۱۴۰۰ (۵۹-۲۸۴) را افزودند
    // درس‌های r280-r283 دست‌نخورده
    const counts = [27, 61, 30, 50, 20, 20, 40, 20, 15];
    counts.forEach((c, i) => expect(bank.lessons[i].questions).toHaveLength(c));
    expect(l10.count).toBe(20);
    expect(l11.count).toBe(40);
    expect(l10.questions.map((q) => q.n)).toEqual(Array.from({ length: 20 }, (_, i) => i + 1));
    expect(l11.questions.map((q) => q.n)).toEqual(Array.from({ length: 40 }, (_, i) => i + 1));
    expect(l10.questions.every((q) => q.id === `g12-pass1-${q.n}`)).toBe(true);
    expect(l11.questions.every((q) => q.id === `g12-pass2-${q.n}`)).toBe(true);
    expect(l10.level).toBe("آموزشی");
    expect(l11.level).toBe("کنکوری");
    expect(bank.source.passive?.extractedRound).toBe(284);
    expect(bank.source.passive?.part1.questions).toBe(20);
    expect(bank.source.passive?.part2.questions).toBe(40);
  });

  it("every new question: four unique English options, valid answer, canonical blank, clean spacing", () => {
    for (const q of fresh) {
      expect(q.options, `${q.id} options`).toHaveLength(4);
      expect(new Set(q.options).size, `${q.id} unique options`).toBe(4);
      expect(q.answer, `${q.id} answer range`).toBeGreaterThanOrEqual(0);
      expect(q.answer, `${q.id} answer range`).toBeLessThanOrEqual(3);
      expect(FA.test(q.question), `${q.id} stem purity`).toBe(false);
      for (const o of q.options) expect(FA.test(o), `${q.id} option purity`).toBe(false);
      expect(q.question, `${q.id} double space`).not.toContain("  ");
      for (const o of q.options) expect(o, `${q.id} option spacing`).not.toContain("  ");
      expect(q.question, `${q.id} canonical blank`).toContain(BLANK);
      expect(q.question, `${q.id} no glued blank`).not.toMatch(/[A-Za-z]---------------/);
    }
  });

  it("explanatory-key fidelity part 1: full 20-key lock from p185-186 (explanatory section)", () => {
    const full = ["d","c","b","c","c","d","a","b","c","d","d","d","a","b","d","c","d","a","a","c"];
    full.forEach((k, i) => expect(l10.questions[i].answer, `P1-Q${i + 1}`).toBe("abcd".indexOf(k)));
    // قفل‌های متنِ گزینه — منطق مجهول/معلوم
    expect(l10.questions[0].options[l10.questions[0].answer]).toBe("are bought"); // مجهول حال ساده
    expect(l10.questions[1].options[l10.questions[1].answer]).toBe("was cleaned"); // مفرد
    expect(l10.questions[7].options[l10.questions[7].answer]).toBe("happened"); // معلوم! happen مجهول نمی‌گیرد
    expect(l10.questions[11].options[l10.questions[11].answer]).toBe("was offered"); // my sister مفرد
    expect(l10.questions[16].options[l10.questions[16].answer]).toBe("was taught"); // مجهول گذشته
    expect(l10.questions[19].options[l10.questions[19].answer]).toBe("has been delayed"); // for five hours
    expect(bank.source.passive?.part1.spotLocks["8"]).toBe("b");
    expect(bank.source.passive?.part1.spotLocks["13"]).toBe("a");
  });

  it("grid fidelity part 2: full 40-key lock from the printed column grid (p187 top)", () => {
    const full = ["d","c","b","d","c","a","b","c","b","b","d","d","c","c","c","d","b","d","a","a",
                  "b","c","b","b","a","b","b","c","a","b","c","d","a","b","d","d","a","c","a","a"];
    full.forEach((k, i) => expect(l11.questions[i].answer, `P2-Q${i + 1}`).toBe("abcd".indexOf(k)));
    // قفل‌های متنِ گزینه — تله‌های معلوم/مجهولِ کنکوری
    expect(l11.questions[2].options[l11.questions[2].answer]).toBe("was being made"); // زمان پیوسته
    expect(l11.questions[5].options[l11.questions[5].answer]).toBe("be sent"); // should + مجهول
    expect(l11.questions[8].options[l11.questions[8].answer]).toBe("have not been washed"); // ترتیب not
    expect(l11.questions[11].options[l11.questions[11].answer]).toBe("has been paid"); // مبلغ مفرد
    expect(l11.questions[21].options[l11.questions[21].answer]).toBe("had stolen"); // معلوم! he had stolen
    expect(l11.questions[23].options[l11.questions[23].answer]).toBe("hasn’t seen"); // معلوم! family hasn't seen him
    expect(l11.questions[30].options[l11.questions[30].answer]).toBe("asked"); // معلوم! I asked him
    expect(l11.questions[34].options[l11.questions[34].answer]).toBe("had worked"); // before he became
    expect(l11.questions[36].options[l11.questions[36].answer]).toBe("haven’t decided"); // معلوم! but also I haven't
    expect(l11.questions[39].options[l11.questions[39].answer]).toBe("be produced"); // going to be
    expect(bank.source.passive?.part2.spotLocks["24"]).toBe("b");
    expect(bank.source.passive?.part2.spotLocks["35"]).toBe("d");
  });

  it("grid identity receipt: c13/sec1 100-grid caption proven wrong (6/20 and 6/40 agreement)", () => {
    const receipt = bank.source.passive?.gridIdentityReceipt;
    if (!receipt) throw new Error("passive.gridIdentityReceipt missing");
    expect(receipt).toContain("c13/sec1");
    expect(receipt).toContain("نادرست");
    expect(receipt).toContain("r280");
    // رسید باید اعدادِ توافقِ ثبت‌شده را داشته باشد (ارقامِ آمیختهٔ فارسی/ASCII مانند r279)
    expect(receipt).toMatch(/6\/(۲۰|20)/);
    expect(receipt).toMatch(/6\/(۴۰|40)/);
  });

  it("honest absence of translations with reason (OCR-damaged explanatory Persian)", () => {
    for (const q of fresh) expect(q, `${q.id} no translation field`).not.toHaveProperty("translation");
    const tr = bank.source.passive?.translations;
    if (!tr) throw new Error("passive.translations missing");
    expect(tr).toContain("r281");
    expect(tr).toContain("OCR");
  });

  it("family-wide uniqueness: 1441 ids after r289, no stem collision with lesson 6 (p150 passive bank)", () => {
    const all = bank.lessons.flatMap((l) => l.questions.map((q) => q.id));
    expect(new Set(all).size).toBe(all.length);
    expect(all).toHaveLength(1441); // r285-r288 و r289 پنجاه‌ونه تست آزمون جامع را افزودند
    const l6Stems = new Set(bank.lessons.find((l) => l.lesson === 6)!.questions.map((q) => q.question));
    for (const q of fresh) expect(l6Stems.has(q.question), `${q.id} stem collision`).toBe(false);
  });
});
