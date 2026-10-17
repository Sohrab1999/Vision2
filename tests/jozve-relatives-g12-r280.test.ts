import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

// =====================================================================
// r280 — گاردِ بانک موضوعی «ضمایر موصولی و حذف آنها» جزوهٔ دوازدهم
// ۸۸ تست چاپی ص۸۸-۹۱ (شماره‌گذاری پیوستهٔ خود جزوه: 1..88) با کلید
// گرید چاپی «پاسخنامه 88تست گرامر ضمایر موصولی (صفحه 88 تا 91)»
// (g12.json c14/sec26). دو سطح مطابق سرصفحهٔ جزوه:
//   درس ۱ = ۱..۲۷ (متوسط و کنکوری) / درس ۲ = ۲۸..۸۸ (حذف ضمایر — نظام قدیم)
// ترجمهٔ فارسی برای این خانواده در جزوه چاپ نشده (غیبتِ صادقانه).
// خطاهای چاپی خود جزوه (وفاداری): Q33 گزینهٔ d «which wining»، Q78 «scape».
// =====================================================================

interface RQuestion {
  id: string;
  n: number;
  category: string;
  question: string;
  options: string[];
  answer: number;
  translation?: string;
}
interface RLesson {
  lesson: number;
  title: string;
  level: string;
  count: number;
  questions: RQuestion[];
}
interface RBank {
  grade: number;
  family: string;
  source: {
    booklet: string;
    test: string;
    pages: string;
    keyGrid: string;
    extractedRound: number;
    levels: Record<string, string>;
    translations: string;
    stats: { questions: number; keys: number; lesson1: number; lesson2: number };
    errata: { q: number; field: string; printed: string; note: string }[];
    spotLocks: Record<string, string>;
  };
  lessons: RLesson[];
}

const bank: RBank = JSON.parse(
  readFileSync(path.join(process.cwd(), "public/jozve/grammar-g12-topic.json"), "utf8")
);

const FA = /[\u0600-\u06FF]/;
const BLANK = "---------------";

const l1 = bank.lessons.find((l) => l.lesson === 1)!;
const l2 = bank.lessons.find((l) => l.lesson === 2)!;
const all = [...l1.questions, ...l2.questions];

describe("jozve topic grammar bank g12 — relatives (r280 extraction receipt)", () => {
  it("bank shape: grade 12, relatives as lessons 1-2 of the four-lesson topic bank (r281 added 3-4), 27/61 with continuous printed numbering 1..88", () => {
    expect(bank.grade).toBe(12);
    expect(bank.family).toBe("grammar-topic");
    expect(bank.source.extractedRound).toBe(280);
    // r281 — درس‌های ۳/۴ (مرور زمان‌ها) به همان فایل الحاق شدند؛ درس‌های ضمایر دست‌نخورده‌اند
    expect(bank.lessons.map((l) => l.lesson)).toEqual(Array.from({ length: 36 }, (_, i) => i + 1)); // r281-r286 بانک‌های ۳..۱۴، r287 هفت بانک تشریحی (۱۵-۲۱) و r288 بخش‌های ۸/۹ (۲۲-۲۳) را افزودند؛ r289 آزمون جامع (۲۴-۳۶) را افزود
    expect(l1.count).toBe(27);
    expect(l2.count).toBe(61);
    expect(l1.questions.map((q) => q.n)).toEqual(Array.from({ length: 27 }, (_, i) => i + 1));
    expect(l2.questions.map((q) => q.n)).toEqual(Array.from({ length: 61 }, (_, i) => i + 28));
    // شماره‌گذاری چاپی پیوسته — همان شمارهٔ خود جزوه در شناسه
    expect(all.map((q) => q.n)).toEqual(Array.from({ length: 88 }, (_, i) => i + 1));
    expect(all.every((q) => q.id === `g12-rel-${q.n}`)).toBe(true);
    expect(bank.source.stats).toEqual({ questions: 88, keys: 88, lesson1: 27, lesson2: 61 });
    expect(bank.source.levels["1-27"]).toContain("متوسط");
    expect(bank.source.levels["28-88"]).toContain("نظام قدیم");
  });

  it("every question: four unique English options, valid grid answer, canonical blank, English purity", () => {
    for (const q of all) {
      expect(q.options, `Q${q.n} options`).toHaveLength(4);
      expect(new Set(q.options).size, `Q${q.n} unique options`).toBe(4);
      expect(q.answer, `Q${q.n} answer in 0..3`).toBeGreaterThanOrEqual(0);
      expect(q.answer, `Q${q.n} answer in 0..3`).toBeLessThanOrEqual(3);
      expect(q.category).toBe("grammar");
      // خلوص انگلیسی — هیچ نشت فارسی در ساقه/گزینه‌ها
      expect(FA.test(q.question), `Q${q.n} stem english`).toBe(false);
      for (const o of q.options) {
        expect(FA.test(o), `Q${q.n} option "${o}" english`).toBe(false);
      }
      // خالی کانونی — همهٔ خالی‌ها دقیقاً ۱۵خط و بدون چسبیدگی
      expect(q.question, `Q${q.n} has blank`).toContain(BLANK);
      expect(q.question, `Q${q.n} no glued blank`).not.toMatch(/[^\s]-{15}/);
      expect(q.question, `Q${q.n} no long raw run`).not.toMatch(/-{16,}/);
      expect(q.question, `Q${q.n} no double space`).not.toMatch(/\s{2,}/);
      expect(q.options.join("|"), `Q${q.n} options clean`).not.toMatch(/\s{2,}/);
    }
    // حداقل یک سؤال دوخالی (Q61/Q84 — خانوادهٔ شناخته‌شده) و کل سؤال‌ها ≥۱ خالی
    const twoBlanks = all.filter((q) => q.question.split(BLANK).length - 1 === 2);
    expect(twoBlanks.map((q) => q.n).sort((a, b) => a - b)).toEqual([61, 84]);
  });

  it("grid fidelity: printed key grid locked on first/last rows and spot-checked semantics", () => {
    // گرید چاپی جزوه — سطرهای ابتدایی و انتهایی، وفادار به c14/sec26
    const gridFirst = { 1: "c", 2: "c", 3: "a", 4: "a", 5: "a" };
    const gridLast = { 84: "d", 85: "b", 86: "b", 87: "d", 88: "b" };
    for (const [n, letter] of Object.entries({ ...gridFirst, ...gridLast })) {
      const q = all.find((x) => x.n === Number(n))!;
      expect("abcd"[q.answer], `Q${n} grid letter`).toBe(letter);
    }
    // قفل‌های معنایی — بازبینی انسانی روی نمونه‌ها
    const semantic: [number, string, RegExp][] = [
      [1, "c", /Thomas Edison/],
      [22, "a", /paint houses for a living/],
      [23, "d", /elderly man/],
      [24, "b", /your mother lent you/],
      [25, "a", /robber stole a car/],
      [41, "c", /only a few/],
      [49, "c", /books .*by this writer/],
      [87, "d", /woman .*last night was interesting/],
      [88, "b", /student .*to class late missed the quiz/],
    ];
    for (const [n, letter, stemRe] of semantic) {
      const q = all.find((x) => x.n === n)!;
      expect(q.question, `Q${n} stem`).toMatch(stemRe);
      expect("abcd"[q.answer], `Q${n} semantic letter`).toBe(letter);
    }
    // رسیدِ spotLocks در source با خود گرید هم‌خوان است
    for (const [n, letter] of Object.entries(bank.source.spotLocks)) {
      const q = all.find((x) => x.n === Number(n))!;
      expect("abcd"[q.answer], `spotLock Q${n}`).toBe(letter);
    }
  });

  it("printed errata kept faithfully and recorded in source", () => {
    const errata = bank.source.errata;
    expect(errata.map((e) => e.q).sort((a, b) => a - b)).toEqual([33, 78]);
    const q33 = all.find((x) => x.n === 33)!;
    expect(q33.options[3]).toBe("which wining"); // غلط چاپی خود جزوه — دست نخورده
    const q78 = all.find((x) => x.n === 78)!;
    expect(q78.question).toContain("scape from the Island"); // غلط چاپی خود جزوه — دست نخورده
    // ولی کلیدِ گرید برای هر دو سالم است
    expect("abcd"[q33.answer]).toBe("b");
  });

  it("honest absence: no translation field anywhere in this family", () => {
    expect(bank.source.translations).toContain("چاپ نشده");
    for (const q of all) {
      expect(q.translation, `Q${q.n} no translation`).toBeUndefined();
    }
  });

  it("ID uniqueness across the relatives family (scoped — full-bank check lives in r281 guard)", () => {
    expect(all).toHaveLength(88);
    expect(new Set(all.map((q) => q.id)).size).toBe(88);
  });

  it("level split matches the booklet's own header: 1-27 medium, 28-88 deletion/old-system", () => {
    expect(l1.title).toContain("متوسط و کنکوری");
    expect(l2.title).toContain("نظام قدیم");
    expect(l1.questions.every((q) => q.n <= 27)).toBe(true);
    expect(l2.questions.every((q) => q.n >= 28)).toBe(true);
    // Q28 اولین تست «حذف» است — شکل کوتاهِ ing (گرید: d=sitting؛ «who sits» با «was wearing» نمی‌سازد)
    const q28 = l2.questions[0];
    expect(q28.question).toMatch(/The man/);
    expect("abcd"[q28.answer]).toBe("d");
    expect(q28.options[3]).toBe("sitting");
  });
});
