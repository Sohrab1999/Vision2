import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

// =====================================================================
// r278 — گاردِ بانک‌های واژگان تکمیلی جزوهٔ یازدهم (ادامهٔ «استخراج جزوه‌ها»)
// درس ۴: ۲۲ تست ص۲۱ (بخش دوم، سطح کنکوری) — درس ۵: ۲۰ تست ص۹۳ (استاندارد/کنکوری)
// کلید از گرید چاپی «پاسخنامه کلیدی» خودِ جزوه می‌آید (c12/sec0 و c14/sec0)؛
// ترجمه برای این دو بخش در جزوه چاپ نشده — پس بانک هم ترجمه ندارد.
// رسیدِ استخراج: scripts/jozve-g11-supplementary-r278.py
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
  questions: BankQuestion[];
}
interface Bank {
  grade: number;
  source: { file: string; lessons: { lesson: number; questionPages: string; key: string }[] };
  lessons: BankLesson[];
}

const bank: Bank = JSON.parse(
  readFileSync(path.join(process.cwd(), "public/jozve/tests-g11.json"), "utf8")
);

const FA = /[\u0600-\u06FF]/;
const BLANK_OK = /(?:^|\s)-{5,}(?=$|[\s,.!?;:])/;
const LETTER_INDEX: Record<string, number> = { a: 0, b: 1, c: 2, d: 3 };

// گرید کلید چاپی — عیناً از صفحات پاسخنامهٔ خود جزوه رونویسی شده (r278 receipt)
const KEY_L4 = "a a d a c b c c c d c b c b d b a a b c c a".split(" ");
const KEY_L5 = "b c c b b d b b a b b a d b c d b d d b".split(" ");

const l4 = bank.lessons.find((l) => l.lesson === 4)!;
const l5 = bank.lessons.find((l) => l.lesson === 5)!;

describe("jozve supplementary g11 (r278 extraction receipt)", () => {
  it("bank shape: grade 11 now has five lessons — 40/40/40/22/20", () => {
    expect(bank.grade).toBe(11);
    expect(bank.lessons.map((l) => l.lesson)).toEqual([
      1, 2, 3, 4, 5,
      // r308 — ۱۸ بانکِ «آزمون جامع ۳۶۰ واژگان» (درس ۶..۲۳) الحاق شد؛ بانکِ ۱۲ (درس ۱۷) ۲۱تستی است
    ...Array.from({ length: 18 }, (_, i) => i + 6),
      // r309 — واژگان کنکوری درس دوم (ص۵۹) با شناسهٔ ۲۴ الحاق شد
    24,
    ]);
    expect(l4.count).toBe(22);
    expect(l4.questions).toHaveLength(22);
    expect(l5.count).toBe(20);
    expect(l5.questions).toHaveLength(20);
    expect(l4.questions.map((q) => q.n)).toEqual(Array.from({ length: 22 }, (_, i) => i + 1));
    expect(l5.questions.map((q) => q.n)).toEqual(Array.from({ length: 20 }, (_, i) => i + 1));
  });

  it("ids: g11-l4-1..22 and g11-l5-1..20, unique across the whole bank", () => {
    for (const [les, size] of [
      [l4, 22],
      [l5, 20],
    ] as const) {
      expect(les.questions.map((q) => q.id)).toEqual(
        Array.from({ length: size }, (_, i) => `g11-l${les.lesson}-${i + 1}`)
      );
    }
    const all = bank.lessons.flatMap((l) => l.questions.map((q) => q.id));
    expect(new Set(all).size).toBe(all.length);
    expect(all).toHaveLength(40 + 40 + 40 + 22 + 20 + 20 + 361); // +۳۶۱: جامع ۳۶۰ (r308) — با دو «۲۲۸» چاپی؛ +۲۰: واژگان کنکوری درس دوم (r309)
  });

  it("every supplementary question: 4 unique options, valid answer, healthy blank, English purity", () => {
    for (const les of [l4, l5]) {
      for (const q of les.questions) {
        expect(q.options, q.id).toHaveLength(4);
        expect(new Set(q.options).size, q.id).toBe(4);
        expect(q.answer, q.id).toBeGreaterThanOrEqual(0);
        expect(q.answer, q.id).toBeLessThanOrEqual(3);
        expect(BLANK_OK.test(q.question), `${q.id} «${q.question}»`).toBe(true);
        expect(FA.test(q.question), q.id).toBe(false);
        expect(FA.test(q.options.join(" ")), q.id).toBe(false);
        expect(q.category, q.id).toBe("vocab");
        q.options.forEach((o) => expect(o.length, `${q.id} opt`).toBeGreaterThan(0));
      }
    }
  });

  it("printed key-grid fidelity: every answer matches the booklet's own پاسخنامه کلیدی", () => {
    l4.questions.forEach((q, i) => expect(q.answer, q.id).toBe(LETTER_INDEX[KEY_L4[i]]));
    l5.questions.forEach((q, i) => expect(q.answer, q.id).toBe(LETTER_INDEX[KEY_L5[i]]));
  });

  it("no translations in the supplementary banks — the booklet printed none for these sections", () => {
    for (const les of [l4, l5]) {
      for (const q of les.questions) {
        expect(q.translation, q.id).toBeUndefined();
        expect("translation" in q, q.id).toBe(false);
      }
    }
  });

  it("content spot-locks: parser mapping (letter→index) double-locked by known questions", () => {
    // L4 Q1 «ability» = گزینهٔ a → ایندکس ۰
    expect(l4.questions[0].question).toContain("to think and speak");
    expect(l4.questions[0].options).toEqual(["ability", "activity", "research", "memory"]);
    expect(l4.questions[0].answer).toBe(0);
    // L4 Q22 «ability to reach the World Cup Finals» = گزینهٔ a
    expect(l4.questions[21].question).toContain("World Cup Finals");
    expect(l4.questions[21].options[0]).toBe("ability");
    expect(l4.questions[21].answer).toBe(0);
    // L5 Q1 «decorative pot» = گزینهٔ b → ایندکس ۱
    expect(l5.questions[0].question).toContain("trip to Isfahan");
    expect(l5.questions[0].options).toEqual(["satisfied", "decorative", "available", "harmful"]);
    expect(l5.questions[0].answer).toBe(1);
    // L5 Q15 «antonym of decreased» = increased = گزینهٔ c → ایندکس ۲
    expect(l5.questions[14].question).toContain("antonym of decreased");
    expect(l5.questions[14].options).toEqual(["started", "preferred", "increased", "woven"]);
    expect(l5.questions[14].answer).toBe(2);
  });

  it("source receipt: the two new lessons declare their question pages and printed-grid key", () => {
    const src = bank.source.lessons;
    const s4 = src.find((s) => s.lesson === 4)!;
    const s5 = src.find((s) => s.lesson === 5)!;
    expect(s4.questionPages).toBe("21");
    expect(s4.key).toContain("پاسخنامه کلیدی 22تست واژگان درس اول");
    expect(s5.questionPages).toBe("93");
    expect(s5.key).toContain("پاسخنامه کلیدی 20تست واژگان درس سوم");
    // بانک‌های قدیمی دست‌نخورده مانده‌اند
    expect(src.find((s) => s.lesson === 1)!.key).toContain("سرصفحهٔ ترجمهٔ خود جزوه");
  });
});
