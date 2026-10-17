import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

// =====================================================================
// r310 — گاردِ دو بانکِ باقی‌ماندهٔ خانوادهٔ «ضمایر موصولی» جزوهٔ دوازدهم
// درس ۳۲۵ = ۲۰ تست دستگرمی (ص۸۶، کلید توضیحی ص۲۰۳-۲۰۴)
// درس ۳۲۶ = ۱۱ تست حذف/زبان تخصیص (ص۸۷، کلید توضیحی ص۲۰۵-۲۰۶)
// کلید = «N - ( گزینهX)» چاپی خود جزوه — سه داوری:
//   Pass A (لایهٔ pdfplumberِ آینه‌ایِ RTL) / Pass B (لایهٔ g12.txt) / رونویسیِ چشمی (SECOND).
// l1/l2 (ص۸۸-۹۱) دست‌نخورده — خانوادهٔ ضمایر موصولی اکنون ص۸۶ تا ص۹۱ را کامل پوشش می‌دهد.
// صداقت: ترجمه‌های چاپی به دلیل آشفتگیِ لایهٔ RTL موکول شدند (source.relDrill).
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
  level: string;
  count: number;
  questions: GQuestion[];
}
interface GBank {
  grade?: number;
  source: {
    booklet?: string;
    relDrill?: {
      family: string;
      round: string;
      arbitration: { passA: string; passB: string; third: string };
      deferredTranslations?: string;
      duplicateHunt?: string;
    };
  };
  lessons: GLesson[];
}

const bank: GBank = JSON.parse(
  readFileSync(path.join(process.cwd(), "public/jozve/grammar-g12-topic.json"), "utf8")
);

const FA = /[\u0600-\u06FF]/;
const letter = (q: GQuestion) => "abcd"[q.answer];

const l325 = bank.lessons.find((l) => l.lesson === 325)!;
const l326 = bank.lessons.find((l) => l.lesson === 326)!;
const newLessons = [l325, l326];

// رونویسیِ دستیِ چاپِ چهار صفحهٔ کلید (رندر pdftoppm — داوریِ سومِ مستقل از دو Pass)
const SECOND: Record<number, Record<number, string>> = {
  325: {
    1: "d", 2: "b", 3: "b", 4: "a", 5: "a", 6: "c", 7: "a", 8: "d", 9: "b", 10: "c",
    11: "a", 12: "d", 13: "a", 14: "b", 15: "c", 16: "b", 17: "d", 18: "a", 19: "a", 20: "d",
  },
  326: {
    1: "b", 2: "b", 3: "a", 4: "b", 5: "c", 6: "c", 7: "b", 8: "b", 9: "c", 10: "a", 11: "b",
  },
};

describe("jozve g12 relative-clause drill/reduction banks (r310 extraction receipt)", () => {
  it("bank shape: lessons 325/326 of exactly 20/11 questions with semantic id prefixes", () => {
    expect(l325.count).toBe(20);
    expect(l326.count).toBe(11);
    expect(l325.questions.map((q) => q.n)).toEqual(Array.from({ length: 20 }, (_, i) => i + 1));
    expect(l326.questions.map((q) => q.n)).toEqual(Array.from({ length: 11 }, (_, i) => i + 1));
    expect(l325.questions.every((q) => q.id.startsWith("g12-reldrill-"))).toBe(true);
    expect(l326.questions.every((q) => q.id.startsWith("g12-relreduce-"))).toBe(true);
    expect(l325.level).toContain("دستگرمی");
    expect(l326.level).toContain("دشوار");
  });

  it("every new question: category grammar, 4 unique non-empty options, valid answer, English-pure stem+options, sane blank", () => {
    for (const l of newLessons) {
      for (const q of l.questions) {
        expect(q.category, q.id).toBe("grammar");
        expect(q.options, q.id).toHaveLength(4);
        expect(new Set(q.options).size, q.id).toBe(4);
        expect(q.options.every((o) => o.trim().length > 0), q.id).toBe(true);
        expect(q.answer, q.id).toBeGreaterThanOrEqual(0);
        expect(q.answer, q.id).toBeLessThanOrEqual(3);
        expect(FA.test(q.question), q.id).toBe(false);
        for (const o of q.options) expect(FA.test(o), `${q.id} opt`).toBe(false);
        expect(q.question, q.id).toMatch(/(?:^|\s)-{5,}(?=$|[\s,.!?;:'”"])/);
      }
    }
  });

  it("keys are print-faithful: every answer matches the SECOND visual transcript of the four key pages", () => {
    for (const l of newLessons) {
      const grid = SECOND[l.lesson];
      for (const q of l.questions) {
        expect(letter(q), `${l.lesson}/Q${q.n}`).toBe(grid[q.n]);
      }
    }
    // توزیعِ حروفِ چاپی (قفلِ ساختاری — درس ۳۲۶ بدونِ d است و این عینِ چاپ است)
    const dist = (l: GLesson) => {
      const d: Record<string, number> = { a: 0, b: 0, c: 0, d: 0 };
      for (const q of l.questions) d[letter(q)] += 1;
      return d;
    };
    expect(dist(l325)).toEqual({ a: 7, b: 5, c: 3, d: 5 });
    expect(dist(l326)).toEqual({ a: 2, b: 6, c: 3, d: 0 });
  });

  it("semantic arbitration: keys pin the exact option the jozve's own explanation names", () => {
    const q = (l: GLesson, n: number) => l.questions.find((x) => x.n === n)!;
    // درس ۳۲۵ — شرحِ خودِ جزوه
    expect(q(l325, 1).options[q(l325, 1).answer]).toBe("whom"); // مرجعِ انسان + نقش مفعولی
    expect(q(l325, 5).options[q(l325, 5).answer]).toBe("whose"); // رابطهٔ مالکیت (The student --- parents)
    // درس ۳۲۶ — مفعول‌حذفی / شکل سوم فعل و فعل ing
    expect(q(l326, 1).options[q(l326, 1).answer]).toBe("examining");
    expect(q(l326, 2).options[q(l326, 2).answer]).toBe("published");
    expect(q(l326, 3).options[q(l326, 3).answer]).toBe("taught");
    expect(q(l326, 7).options[q(l326, 7).answer]).toBe("surrounding");
    expect(q(l326, 10).options[q(l326, 10).answer]).toBe("conducted");
  });

  it("family coverage: the relative-clause family now spans p86..p91 with l1/l2 untouched", () => {
    const l1 = bank.lessons.find((l) => l.lesson === 1)!;
    const l2 = bank.lessons.find((l) => l.lesson === 2)!;
    expect(l1.questions).toHaveLength(27);
    expect(l2.questions).toHaveLength(61);
    expect(l1.questions[0].id).toBe("g12-rel-1");
    // بدونِ هم‌پوشانیِ ساقه با l1/l2 (ص۸۶/۸۷ متنِ تازه است)
    const oldSet = new Set([...l1.questions, ...l2.questions].map((q) => q.question));
    for (const l of newLessons) {
      for (const q of l.questions) expect(oldSet.has(q.question), q.id).toBe(false);
    }
  });

  it("honest absence: no translation field on the 31 new items — printed translations deferred (RTL layer scrambled)", () => {
    for (const l of newLessons) {
      for (const q of l.questions) expect(q.translation, q.id).toBeUndefined();
    }
    const receipt = bank.source.relDrill!;
    expect(receipt.family).toBe("relative-clauses-drill-and-reduction-g12");
    expect(receipt.round).toBe("r310");
    expect(receipt.deferredTranslations).toContain("موکول");
    expect(receipt.arbitration.third).toContain("pdftoppm");
    expect(receipt.duplicateHunt).toContain("r277");
  });

  it("ids are globally unique across the 1587-question topic bank", () => {
    const ids = bank.lessons.flatMap((l) => l.questions.map((q) => q.id));
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toHaveLength(1587);
  });

  it("UI manifest: the two new buttons sit before l1/l2 in GRADE_GRAMMAR_TOPIC (booklet order p86/p87 < p88)", () => {
    const tsx = readFileSync(
      path.join(process.cwd(), "src/components/study/jozve/jozve-view.tsx"),
      "utf8"
    );
    const block = tsx.slice(
      tsx.indexOf("GRADE_GRAMMAR_TOPIC"),
      tsx.indexOf("const topicCache")
    );
    const order = [...block.matchAll(/lesson: (\d+), title: "([^"]+)", count: (\d+)/g)].map(
      ([, les, title, count]) => ({ lesson: Number(les), title, count: Number(count) })
    );
    expect(order.slice(0, 4).map((o) => o.lesson)).toEqual([325, 326, 1, 2]);
    expect(order[0].title).toContain("دستگرمی");
    expect(order[1].title).toContain("زبان تخصیص");
    expect(order[0].count).toBe(20);
    expect(order[1].count).toBe(11);
  });
});
