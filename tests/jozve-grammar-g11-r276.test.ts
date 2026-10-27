import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

// =====================================================================
// r276 — گاردِ بانک‌های «جمع‌بندی گرامر و نگارش» جزوهٔ یازدهم
// درس ۱ = ۶۰ تست (ص۳۶-۳۹) / درس ۲ = ۷۰ تست (ص۷۰-۷۳) / درس ۳ = ۷۰ تست (ص۱۰۵-۱۰۸)
// کلید = شبکهٔ چاپی خود جزوه (c12/sec12، c13/sec14، c14/sec29 — «پاسخنامه کلیدی»).
// صداقت: ترجمهٔ فارسی برای تست‌های گرامر در جزوه چاپ نشده — فیلد translation غایب.
// ساقه‌های بدون جاخالی = خانوادهٔ «کدام جمله درست است» (ثبت در stemsWithoutBlank).
// =====================================================================

interface GQuestion {
  id: string;
  n: number;
  category: string;
  question: string;
  options: string[];
  answer: number;
  translation?: string;
}
interface GLesson {
  lesson: number;
  title: string;
  count: number;
  stemsWithoutBlank?: number[];
  questions: GQuestion[];
}
interface GBank {
  grade: number;
  source: { file: string; banks: { lesson: number; questionPages: string; key: string; translations: string }[] };
  lessons: GLesson[];
}

const bank: GBank = JSON.parse(
  readFileSync(path.join(process.cwd(), "public/jozve/grammar-g11.json"), "utf8")
);

const FA = /[\u0600-\u06FF]/;

const l1 = bank.lessons.find((l) => l.lesson === 1)!;
const l2 = bank.lessons.find((l) => l.lesson === 2)!;
const l3 = bank.lessons.find((l) => l.lesson === 3)!;

describe("jozve grammar bank g11 (r276 extraction receipt)", () => {
  it("bank shape: grade 11, three جمع‌بندی lessons of exactly 60/70/70 questions", () => {
    expect(bank.grade).toBe(11);
    expect(bank.lessons.map((l) => l.lesson)).toEqual([1, 2, 3]);
    expect(l1.count).toBe(60);
    expect(l2.count).toBe(70);
    expect(l3.count).toBe(70);
    for (const [l, n] of [
      [l1, 60],
      [l2, 70],
      [l3, 70],
    ] as [GLesson, number][]) {
      expect(l.questions, `lesson ${l.lesson}`).toHaveLength(n);
      expect(l.questions.map((q) => q.n)).toEqual(Array.from({ length: n }, (_, i) => i + 1));
      expect(l.questions.every((q) => q.id.startsWith(`g11-gram-l${l.lesson}-`))).toBe(true);
    }
  });

  it("every question: category grammar, 4 unique options, valid answer, English-pure stem+options", () => {
    for (const l of [l1, l2, l3]) {
      for (const q of l.questions) {
        expect(q.category, q.id).toBe("grammar");
        expect(q.options, q.id).toHaveLength(4);
        expect(new Set(q.options).size, q.id).toBe(4);
        expect(q.answer, q.id).toBeGreaterThanOrEqual(0);
        expect(q.answer, q.id).toBeLessThanOrEqual(3);
        expect(FA.test(q.question), q.id).toBe(false);
        for (const o of q.options) expect(FA.test(o), `${q.id} opt`).toBe(false);
        expect(q.question.length, q.id).toBeGreaterThan(10);
      }
    }
  });

  it("honest absence: no translation field anywhere — grammar keys are letter-only grids in the jozve", () => {
    for (const l of [l1, l2, l3]) {
      for (const q of l.questions) {
        expect(q.translation, q.id).toBeUndefined();
      }
    }
    expect(bank.source.banks).toHaveLength(3);
    for (const b of bank.source.banks) {
      expect(b.translations).toContain("غیبتِ صادقانه");
    }
  });

  it("key grid sanity: all four letters a-d appear in every lesson (no degenerate grid)", () => {
    for (const l of [l1, l2, l3]) {
      const letters = new Set(l.questions.map((q) => "abcd"[q.answer]));
      expect(letters.size, `lesson ${l.lesson}`).toBe(4);
    }
    // نسخهٔ چاپی شبکهٔ درس ۱ را دیدیم: ۱a، ۲a، ۳d، ۴b، ۵c، ۶c …
    expect("abcd"[l1.questions[0].answer]).toBe("a");
    expect("abcd"[l1.questions[2].answer]).toBe("d");
    expect("abcd"[l1.questions[5].answer]).toBe("c");
    // درس ۲: ۱c، ۲a، ۳c — درس ۳: ۱b، ۲c، ۳b
    expect("abcd"[l2.questions[0].answer]).toBe("c");
    expect("abcd"[l2.questions[1].answer]).toBe("a");
    expect("abcd"[l3.questions[0].answer]).toBe("b");
    expect("abcd"[l3.questions[1].answer]).toBe("c");
  });

  it("Q67 of lesson 2 survived the dotless-option print (`a  is broking` → recovered)", () => {
    const q67 = l2.questions.find((q) => q.n === 67)!;
    expect(q67.options[0]).toBe("is broking");
    expect(q67.options).toContain("broke");
    expect(q67.answer).toBe(1); // شبکهٔ چاپی: b (broke)
  });

  it("the no-blank stems are exactly the «which sentence is correct» family — registered honestly", () => {
    expect(l1.stemsWithoutBlank).toEqual([16, 28, 42, 50, 54, 60]);
    for (const n of l1.stemsWithoutBlank ?? []) {
      const q = l1.questions.find((x) => x.n === n)!;
      expect(q.question.toLowerCase()).toContain("grammatically");
    }
    expect(l2.stemsWithoutBlank).toEqual([38]);
  });

  it("ids are globally unique across the 200-question bank", () => {
    const ids = bank.lessons.flatMap((l) => l.questions.map((q) => q.id));
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toHaveLength(200);
  });
});
