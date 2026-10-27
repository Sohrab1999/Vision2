import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

// =====================================================================
// r277 — گاردِ بانک‌های «کنکوری/دستگرمی» گرامر جزوهٔ یازدهم
// درس ۱ = ۲۰ تست (ص۳۴-۳۵، کلید ص۱۸۰) / درس ۲ = ۲۰ تست (ص۶۹، کلید ص۱۸۸)
// درس ۳ = ۳۰ تست (ص۱۰۳-۱۰۴، کلید ص۱۹۸) — کلید از بلوک‌های توضیحی
// «N - گزینه (X)» خود جزوه و این‌بار با ترجمهٔ فارسی خودِ جزوه.
// رسیدِ بازچینی: L1=[18]، L3=[20,26,29] (واژه‌چینیِ لایهٔ متنی به‌هم‌ریخته).
// =====================================================================

interface KQuestion {
  id: string;
  n: number;
  category: string;
  question: string;
  options: string[];
  answer: number;
  translation: string;
}
interface KLesson {
  lesson: number;
  title: string;
  count: number;
  translationRestorations?: { count: number; note: string; questions: number[] };
  questions: KQuestion[];
}
interface KBank {
  grade: number;
  source: { file: string; banks: { lesson: number; questionPages: string; keyPages: string; key: string }[] };
  lessons: KLesson[];
}

const bank: KBank = JSON.parse(
  readFileSync(path.join(process.cwd(), "public/jozve/grammar-g11-konkur.json"), "utf8")
);

const FA = /[\u0600-\u06FF]/;
const LATIN = /[A-Za-z]{3,}/;

const l1 = bank.lessons.find((l) => l.lesson === 1)!;
const l2 = bank.lessons.find((l) => l.lesson === 2)!;
const l3 = bank.lessons.find((l) => l.lesson === 3)!;

describe("jozve konkur grammar bank g11 (r277 extraction receipt)", () => {
  it("bank shape: grade 11, three konkur lessons of exactly 20/20/30 questions", () => {
    expect(bank.grade).toBe(11);
    expect(bank.lessons.map((l) => l.lesson)).toEqual([1, 2, 3]);
    expect(l1.count).toBe(20);
    expect(l2.count).toBe(20);
    expect(l3.count).toBe(30);
    for (const [l, n] of [
      [l1, 20],
      [l2, 20],
      [l3, 30],
    ] as [KLesson, number][]) {
      expect(l.questions, `lesson ${l.lesson}`).toHaveLength(n);
      expect(l.questions.map((q) => q.n)).toEqual(Array.from({ length: n }, (_, i) => i + 1));
      expect(l.questions.every((q) => q.id.startsWith(`g11-kgram-l${l.lesson}-`))).toBe(true);
    }
    expect(bank.source.banks).toHaveLength(3);
    expect(bank.source.banks[0].keyPages).toBe("180-182");
    expect(bank.source.banks[1].keyPages).toBe("188-190");
    expect(bank.source.banks[2].keyPages).toBe("198-203");
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

  it("unlike the جمع‌بندی banks, EVERY question carries the jozve's own Persian translation — pure Persian", () => {
    for (const l of [l1, l2, l3]) {
      for (const q of l.questions) {
        expect(typeof q.translation, q.id).toBe("string");
        expect(q.translation.length, q.id).toBeGreaterThan(8);
        expect(LATIN.test(q.translation), `${q.id}: ${q.translation.slice(0, 60)}`).toBe(false);
      }
    }
  });

  it("key grid sanity: all four letters appear per lesson + printed first-row locks", () => {
    for (const l of [l1, l2, l3]) {
      const letters = new Set(l.questions.map((q) => "abcd"[q.answer]));
      expect(letters.size, `lesson ${l.lesson}`).toBe(4);
    }
    // ص۱۸۰: ۱→c، ۲→b | ص۱۸۸: ۱→c، ۲→d | ص۱۹۸: ۱→b، ۲→b
    expect("abcd"[l1.questions[0].answer]).toBe("c");
    expect("abcd"[l1.questions[1].answer]).toBe("b");
    expect("abcd"[l2.questions[0].answer]).toBe("c");
    expect("abcd"[l2.questions[1].answer]).toBe("d");
    expect("abcd"[l3.questions[0].answer]).toBe("b");
    expect("abcd"[l3.questions[1].answer]).toBe("b");
  });

  it("translationRestorations receipt: L1=[18], L3=[20,26,29] — honest word-order re-weaving", () => {
    expect(l1.translationRestorations?.questions).toEqual([18]);
    expect(l2.translationRestorations).toBeUndefined();
    expect(l3.translationRestorations?.questions).toEqual([20, 26, 29]);
    // نقطه‌های معناییِ بازچینی‌شده
    const q26 = l3.questions.find((q) => q.n === 26)!;
    expect(q26.translation).toContain("بیابان وسیع");
    expect(q26.translation).toContain("چکار می‌کنی");
  });

  it("semantic spot locks: known broken-token families healed (خییل/بزب/ش کت/میی د)", () => {
    const all = [l1, l2, l3].flatMap((l) => l.questions);
    for (const q of all) {
      for (const bad of ["خییل", "بزب", "ش کت", "میی د", "آساب", "عیل ", "کیم", "غذابی", "بین ون", "میر ود"]) {
        expect(q.translation.includes(bad), `${q.id} contains ${bad}`).toBe(false);
      }
    }
    // ترجمهٔ L2 Q1 با نقل‌قولِ داخلیِ «رامان» در Q3 سالم ماند
    const q3 = l2.questions.find((q) => q.n === 3)!;
    expect(q3.translation).toContain("رامان");
    expect(q3.translation).toContain("اسپرت");
  });

  it("ids are globally unique across the 70-question bank", () => {
    const ids = bank.lessons.flatMap((l) => l.questions.map((q) => q.id));
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toHaveLength(70);
  });
});
