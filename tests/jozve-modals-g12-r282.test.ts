import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

// =====================================================================
// r282 — گاردِ سه بانکِ کلید-گرید sec23 جزوهٔ دوازدهم (درس ۵/۶/۷ خانوادهٔ موضوعی)
// درس ۵: «کاربردهای افعال ناقص» ۲۰ تست ص۱۴۹ (متوسط) — گرید c15/sec23
// درس ۶: «معلوم و مجهول» ۲۰ تست ص۱۵۰ (کنکوری) — گرید c15/sec23
// درس ۷: «افعال ناقص زمان گذشته (تخصصی)» ۴۰ تست ص۱۵۱-۱۵۲ — گرید c15/sec23
// وفاداری‌ها: ردیف‌های «6a» بی‌فاصلهٔ گرید C با تحمل فاصله خوانده شدند؛
// خالی چندتکهٔ C-Q2 ادغام شد؛ دوخالیِ واقعی فقط B-Q9؛ override رسیددار C-Q10.
// ترجمه برای هر سه خانواده در جزوه چاپ نشده (غیبت صادقانه).
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
    modals?: {
      pages: string;
      familyA: { questions: number; pages: string; level: string; keyType: string };
      familyB: { questions: number; pages: string; level: string; keyType: string };
      familyC: { questions: number; pages: string; level: string; keyType: string };
      spotLocks: { A: Record<string, string>; B: Record<string, string>; C: Record<string, string> };
      answerRepairs: { family: string; n: number; grid: string; applied: string; reason: string }[];
      doubleBlanks: { A: number[]; B: number[]; C: number[] };
      translations: string;
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
const l5 = bank.lessons.find((l) => l.lesson === 5)!;
const l6 = bank.lessons.find((l) => l.lesson === 6)!;
const l7 = bank.lessons.find((l) => l.lesson === 7)!;
const fresh = [...l5.questions, ...l6.questions, ...l7.questions];

describe("jozve topic grammar bank g12 — modals/passive trio (r282 extraction receipt)", () => {
  it("bank shape: seven lessons, trio added as exactly 20/20/40 with continuous printed numbering", () => {
    expect(bank.lessons.map((l) => l.lesson)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]); // r285 درس ۱۲ تایپی «بنویسید» را افزود
    // درس‌های r280/r281 دست‌نخورده
    expect(l1.questions).toHaveLength(27);
    expect(l2.questions).toHaveLength(61);
    expect(l5.count).toBe(20);
    expect(l6.count).toBe(20);
    expect(l7.count).toBe(40);
    expect(l5.questions.map((q) => q.n)).toEqual(Array.from({ length: 20 }, (_, i) => i + 1));
    expect(l6.questions.map((q) => q.n)).toEqual(Array.from({ length: 20 }, (_, i) => i + 1));
    expect(l7.questions.map((q) => q.n)).toEqual(Array.from({ length: 40 }, (_, i) => i + 1));
    expect(l5.questions.every((q) => q.id === `g12-modal1-${q.n}`)).toBe(true);
    expect(l6.questions.every((q) => q.id === `g12-passive-${q.n}`)).toBe(true);
    expect(l7.questions.every((q) => q.id === `g12-modal2-${q.n}`)).toBe(true);
    expect(bank.source.extractedRound).toBe(280); // پروانهٔ فایل از r280
    expect(bank.source.modals?.extractedRound).toBe(282);
    expect(bank.source.modals?.familyA.questions).toBe(20);
    expect(bank.source.modals?.familyB.questions).toBe(20);
    expect(bank.source.modals?.familyC.questions).toBe(40);
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
  });

  it("double-blank registry: only B-Q9 carries two real blanks; every other stem has exactly one", () => {
    for (const q of fresh) {
      const blanks = q.question.split(BLANK).length - 1;
      if (q.id === "g12-passive-9") {
        expect(blanks, `${q.id} two blanks`).toBe(2);
      } else {
        expect(blanks, `${q.id} single blank`).toBe(1);
      }
    }
    expect(bank.source.modals?.doubleBlanks).toEqual({ A: [], B: [9], C: [] });
  });

  it("grid fidelity: first/last row letters of all three printed grids + spot locks", () => {
    // گرید A (ص۱۴۹): سطر اول «1 d 6 b 11 b 16 b»، سطر آخر «5 c 10 d 15 d 20 b»
    const gridA: [number, string][] = [
      [1, "d"], [6, "b"], [11, "b"], [16, "b"], [5, "c"], [10, "d"], [15, "d"], [20, "b"],
    ];
    for (const [n, letter] of gridA) {
      expect("abcd"[l5.questions.find((x) => x.n === n)!.answer], `A-Q${n}`).toBe(letter);
    }
    // گرید B (ص۱۵۰): سطر اول «1 c 6 b 11 b 16 c»، سطر آخر «5 c 10 b 15 c 20 a»
    const gridB: [number, string][] = [
      [1, "c"], [6, "b"], [11, "b"], [16, "c"], [5, "c"], [10, "b"], [15, "c"], [20, "a"],
    ];
    for (const [n, letter] of gridB) {
      expect("abcd"[l6.questions.find((x) => x.n === n)!.answer], `B-Q${n}`).toBe(letter);
    }
    // گرید C (ص۱۵۱-۱۵۲): سطر اول «1 c 6a 11 b 16 b 21 a 26 b 31 b 36 c»
    // (شامل ردیف بی‌فاصلهٔ «6a») و سطر آخر «5 b 10→c (override) 15 a 20 d 25 b 30 c 35 b 40 d»
    const gridC: [number, string][] = [
      [1, "c"], [6, "a"], [11, "b"], [16, "b"], [21, "a"], [26, "b"], [31, "b"], [36, "c"],
      [5, "b"], [15, "a"], [20, "d"], [25, "b"], [30, "c"], [35, "b"], [40, "d"],
    ];
    for (const [n, letter] of gridC) {
      expect("abcd"[l7.questions.find((x) => x.n === n)!.answer], `C-Q${n}`).toBe(letter);
    }
    // رسیدِ spotLocks با خود بانک هم‌خوان است
    for (const [fam, les] of [["A", l5], ["B", l6], ["C", l7]] as const) {
      for (const [n, letter] of Object.entries(bank.source.modals!.spotLocks[fam])) {
        expect("abcd"[les.questions.find((x) => x.n === Number(n))!.answer], `spot ${fam}-Q${n}`).toBe(letter);
      }
    }
  });

  it("answer override receipt: C-Q10 grid said b, applied c (must have been painted) with recorded reason", () => {
    const q10 = l7.questions.find((x) => x.n === 10)!;
    expect(q10.question).toMatch(/What a beautiful painting/);
    expect(q10.options[2]).toBe("must have been painted");
    expect("abcd"[q10.answer]).toBe("c");
    const repairs = bank.source.modals!.answerRepairs;
    expect(repairs).toHaveLength(1);
    expect(repairs[0]).toMatchObject({ family: "C", n: 10, grid: "b", applied: "c" });
    expect(repairs[0].reason).toContain("داوری");
  });

  it("honest absence: no translation field anywhere in the trio, with the recorded reason", () => {
    expect(bank.source.modals!.translations).toContain("چاپ نشده");
    for (const q of fresh) {
      expect(q.translation, `${q.id} no translation`).toBeUndefined();
    }
  });

  it("ID uniqueness across the whole topic bank (r280+r281+r282 = 248) + level split per booklet headers", () => {
    const l3 = bank.lessons.find((l) => l.lesson === 3)!;
    const l4 = bank.lessons.find((l) => l.lesson === 4)!;
    const all = [...l1.questions, ...l2.questions, ...l3.questions, ...l4.questions, ...fresh];
    expect(all).toHaveLength(248);
    expect(new Set(all.map((q) => q.id)).size).toBe(248);
    expect(l5.level).toBe("متوسط");
    expect(l6.level).toBe("کنکوری");
    expect(l7.level).toBe("استاندارد و کنکوری");
    // خالیِ چندتکهٔ C-Q2 به خالیِ واحد ادغام شد — سلامتش یعنی ادغام‌گر r282 کار کرده
    const c2 = l7.questions.find((x) => x.n === 2)!;
    expect(c2.question).toMatch(/^You have to prepare yourself/);
    expect(c2.question).toContain(BLANK);
    expect(c2.question).not.toMatch(/-{3,}\s+-{3,}/);
  });
});
