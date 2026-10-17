import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

// =====================================================================
// r281 — گاردِ بانک «مرور زمان‌ها» جزوهٔ دوازدهم (درس ۳ و ۴ خانوادهٔ موضوعی r280)
// بخش اول: ۳۰ تست ص۱۴۲-۱۴۳ (سطح متوسط) — کلید توضیحی «-Nگزینه (X)» ص۲۲۰-۲۲۳
// بخش دوم: ۵۰ تست ص۱۴۳-۱۴۵ (سطح استاندارد) — کلید گرید چاپی c15/sec23
// نکته‌های وفاداری: PDF بعد از «38» نقطه ندارد؛ خود جزوه Q14 بخش اول را در
// بخش دوم هم چاپ کرده (Q38). ترجمه‌ها: بخش اول OCR به‌هم‌ریخته، بخش دوم غایب.
// =====================================================================

interface TQuestion {
  id: string;
  n: number;
  category: string;
  question: string;
  options: string[];
  answer: number;
  translation?: string;
}
interface TLesson {
  lesson: number;
  title: string;
  level: string;
  count: number;
  questions: TQuestion[];
}
interface TBank {
  grade: number;
  family: string;
  source: {
    extractedRound: number;
    tenses?: {
      pages: string;
      part1: { questions: number; pages: string; keyType: string; translations: string };
      part2: { questions: number; pages: string; keyType: string; translations: string };
      spotLocks: { part1: Record<string, string>; part2: Record<string, string> };
      printedDuplicate: { part1: number; part2: number; note: string };
      extractedRound: number;
    };
  };
  lessons: TLesson[];
}

const bank: TBank = JSON.parse(
  readFileSync(path.join(process.cwd(), "public/jozve/grammar-g12-topic.json"), "utf8")
);

const FA = /[\u0600-\u06FF]/;
const BLANK = "---------------";

const l1 = bank.lessons.find((l) => l.lesson === 1)!;
const l2 = bank.lessons.find((l) => l.lesson === 2)!;
const l3 = bank.lessons.find((l) => l.lesson === 3)!;
const l4 = bank.lessons.find((l) => l.lesson === 4)!;
const fresh = [...l3.questions, ...l4.questions];

describe("jozve topic grammar bank g12 — tenses (r281 extraction receipt)", () => {
  it("bank shape: four lessons, tenses added as exactly 30/50 with continuous printed numbering", () => {
    expect(bank.lessons.map((l) => l.lesson)).toEqual(Array.from({ length: 36 }, (_, i) => i + 1)); // r282-r286 بانک‌های ۵..۱۴، r287 هفت بانک تشریحی (۱۵-۲۱) و r288 بخش‌های ۸/۹ (۲۲-۲۳) را افزودند؛ r289 آزمون جامع (۲۴-۳۶) را افزود
    // درس‌های r280 دست‌نخورده
    expect(l1.questions).toHaveLength(27);
    expect(l2.questions).toHaveLength(61);
    expect(l3.count).toBe(30);
    expect(l4.count).toBe(50);
    expect(l3.questions.map((q) => q.n)).toEqual(Array.from({ length: 30 }, (_, i) => i + 1));
    expect(l4.questions.map((q) => q.n)).toEqual(Array.from({ length: 50 }, (_, i) => i + 1));
    expect(l3.questions.every((q) => q.id === `g12-tense1-${q.n}`)).toBe(true);
    expect(l4.questions.every((q) => q.id === `g12-tense2-${q.n}`)).toBe(true);
    expect(bank.source.extractedRound).toBe(280); // پروانهٔ فایل از r280
    expect(bank.source.tenses?.extractedRound).toBe(281);
    expect(bank.source.tenses?.part1.questions).toBe(30);
    expect(bank.source.tenses?.part2.questions).toBe(50);
  });

  it("every new question: four unique English options, valid answer, canonical blank, clean spacing", () => {
    for (const q of fresh) {
      expect(q.options, `${q.id} options`).toHaveLength(4);
      expect(new Set(q.options).size, `${q.id} unique options`).toBe(4);
      expect(q.answer, `${q.id} answer in 0..3`).toBeGreaterThanOrEqual(0);
      expect(q.answer, `${q.id} answer in 0..3`).toBeLessThanOrEqual(3);
      expect(q.category).toBe("grammar");
      expect(FA.test(q.question), `${q.id} stem english`).toBe(false);
      for (const o of q.options) {
        expect(FA.test(o), `${q.id} option "${o}" english`).toBe(false);
      }
      expect(q.question, `${q.id} has blank`).toContain(BLANK);
      expect(q.question, `${q.id} no glued blank`).not.toMatch(/[^\s]-{15}/);
      expect(q.question, `${q.id} no long raw run`).not.toMatch(/-{16,}/);
      expect(q.question, `${q.id} no double space`).not.toMatch(/\s{2,}/);
      expect(q.options.join("|"), `${q.id} options clean`).not.toMatch(/\s{2,}/);
    }
    // ساقه‌های دوخالیِ شناخته‌شدهٔ این خانواده (P1: 1,10 / P2: 22,25,44,45,47,48)
    const twoBlanks = fresh.filter((q) => q.question.split(BLANK).length - 1 === 2);
    expect(twoBlanks.length).toBeGreaterThanOrEqual(6);
  });

  it("key fidelity: explanation keys (part1) and printed grid (part2) locked on spot rows", () => {
    // قفل‌های معنایی بخش اول — کلید توضیحی خود جزوه
    const p1: [number, string, RegExp][] = [
      [1, "c", /three days ago/],
      [4, "a", /I completely forgot/],
      [8, "d", /an offer for a job in London/],
      [17, "b", /He is a rich man/],
      [30, "a", /most expensive sport car/],
    ];
    for (const [n, letter, stemRe] of p1) {
      const q = l3.questions.find((x) => x.n === n)!;
      expect(q.question, `P1-Q${n} stem`).toMatch(stemRe);
      expect("abcd"[q.answer], `P1-Q${n} letter`).toBe(letter);
    }
    // قفل‌های معنایی بخش دوم — گرید چاپی (سطرهای ابتدایی/میانی/انتهایی)
    const p2: [number, string, RegExp][] = [
      [4, "b", /Alex was very tired/],
      [8, "c", /she [\s\S]*in Isfahan before/],
      [10, "b", /haven't been to Sweden/],
      [33, "d", /completely dry/],
      [50, "c", /most boring film/],
    ];
    for (const [n, letter, stemRe] of p2) {
      const q = l4.questions.find((x) => x.n === n)!;
      expect(q.question, `P2-Q${n} stem`).toMatch(stemRe);
      expect("abcd"[q.answer], `P2-Q${n} letter`).toBe(letter);
    }
    // رسیدِ spotLocks با خود بانک هم‌خوان است
    for (const [n, letter] of Object.entries(bank.source.tenses!.spotLocks.part1)) {
      expect("abcd"[l3.questions.find((x) => x.n === Number(n))!.answer], `spot P1-Q${n}`).toBe(letter);
    }
    for (const [n, letter] of Object.entries(bank.source.tenses!.spotLocks.part2)) {
      expect("abcd"[l4.questions.find((x) => x.n === Number(n))!.answer], `spot P2-Q${n}`).toBe(letter);
    }
  });

  it("printed duplicate kept faithfully: part1 Q14 == part2 Q38 with the same grid-consistent answer", () => {
    const q14 = l3.questions.find((x) => x.n === 14)!;
    const q38 = l4.questions.find((x) => x.n === 38)!;
    expect(q38.question).toBe(q14.question);
    expect(q38.options).toEqual(q14.options);
    expect("abcd"[q38.answer]).toBe("abcd"[q14.answer]);
    expect(q38.options[q38.answer]).toBe("had not gone");
    expect(bank.source.tenses?.printedDuplicate).toEqual({
      part1: 14,
      part2: 38,
      note: expect.stringContaining("وفادار"),
    });
  });

  it("honest absence: no translation field anywhere in the tense lessons, with recorded reasons", () => {
    expect(bank.source.tenses!.part1.translations).toContain("ثبت نشد");
    expect(bank.source.tenses!.part2.translations).toContain("چاپ نشده");
    for (const q of fresh) {
      expect(q.translation, `${q.id} no translation`).toBeUndefined();
    }
  });

  it("ID uniqueness across the whole topic bank (r280 + r281 = 168 questions)", () => {
    const all = [...l1.questions, ...l2.questions, ...fresh];
    expect(all).toHaveLength(168);
    expect(new Set(all.map((q) => q.id)).size).toBe(168);
  });

  it("level split matches the booklet headers: lesson3 متوسط، lesson4 استاندارد", () => {
    expect(l3.title).toContain("متوسط");
    expect(l4.title).toContain("استاندارد");
    expect(l3.level).toBe("متوسط");
    expect(l4.level).toBe("استاندارد");
    // P2-Q38 ساقه‌اش بعد از «38» بی‌نقطه بود — سلامتش یعنی شماره‌یابِ انتظاری کار کرده
    const q38 = l4.questions.find((x) => x.n === 38)!;
    expect(q38.question).toMatch(/^They were upset because I/);
  });
});
