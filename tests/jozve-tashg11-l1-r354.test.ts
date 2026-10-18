import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

// =====================================================================
// r354 — گاردِ «آزمون تشریحی گرامر درس اول» جزوهٔ جامع یازدهم
// ص۲۹-۳۱، کلیدِ واژه‌محورِ چاپیِ ص۱۷۹ — شش سکشن = شش بانک (l37..l42):
// much/many (۱۰ تایپی) / a little-a few (۱۰ تایپی) / بهترین گزینه (۲۰ MCQ) /
// پرانتزی (۸ تایپی) / واحدهای شمارش (۱۰ تایپی) / جمله‌سازی (۱۰ تایپی) — ۶۸ آیتم
// =====================================================================

interface BankQuestion {
  id: string;
  n: number;
  category: string;
  question: string;
  options: string[];
  answer: number;
  kind?: "mcq" | "typed";
  accepted?: string[];
  placeholder?: string;
  translation?: string;
}
interface BankLesson {
  lesson: number;
  title: string;
  level?: string;
  count: number;
  questions: BankQuestion[];
}
interface Bank {
  grade: number;
  source: Record<string, {
    extractedRound?: string;
    printQuirks?: string[];
    [k: string]: unknown;
  }>;
  lessons: BankLesson[];
}

const bank: Bank = JSON.parse(
  readFileSync(path.join(process.cwd(), "public/jozve/tests-g11.json"), "utf8")
);

const norm = (s: string) => s.replace(/\s+/g, " ").trim();
const FA = /[\u0600-\u06FF]/;

const byLesson = (n: number) => bank.lessons.find((l) => l.lesson === n)!;
const l37 = byLesson(37);
const l38 = byLesson(38);
const l39 = byLesson(39);
const l40 = byLesson(40);
const l41 = byLesson(41);
const l42 = byLesson(42);

describe("r354 — receipt: source.g11l1gtash", () => {
  it("receipt exists with extractedRound=r354 and 8 printQuirks", () => {
    const rec = bank.source.g11l1gtash;
    expect(rec).toBeTruthy();
    expect(rec!.extractedRound).toBe("r354");
    expect(rec!.printQuirks).toHaveLength(8);
  });
});

describe("r354 — bank shapes (l37..l42)", () => {
  it("titles, levels, counts", () => {
    expect(l37.title).toBe("تشریحی گرامر — جاهای خالی با much یا many (ص۲۹)");
    expect(l38.title).toBe("تشریحی گرامر — جاهای خالی با a little یا a few (ص۲۹)");
    expect(l39.title).toBe("تشریحی گرامر — تست چهارگزینه‌ای (ص۲۹-۳۰)");
    expect(l40.title).toBe("تشریحی گرامر — گزینهٔ صحیح داخل پرانتز (ص۳۰)");
    expect(l41.title).toBe("تشریحی گرامر — انتخاب واژهٔ صحیح (واحدهای شمارش) (ص۳۱)");
    expect(l42.title).toBe("تشریحی گرامر — جمله‌سازی با کلمات داده شده (ص۳۱)");
    expect(l37.level).toBe("تشریحی — تایپی");
    expect(l39.level).toBe("تشریحی — چهارگزینه‌ای");
    expect(l42.level).toBe("تشریحی — جمله‌سازی");
    expect([l37.count, l38.count, l39.count, l40.count, l41.count, l42.count]).toEqual([10, 10, 20, 8, 10, 10]);
  });

  it("ids: g11-l37..l42-N unique across the whole bank — total 839 items in 55 banks", () => {
    for (const [les, size] of [[l37, 10], [l38, 10], [l39, 20], [l40, 8], [l41, 10], [l42, 10]] as const) {
      expect(les.questions.map((q) => q.id), `l${les.lesson}`).toEqual(
        Array.from({ length: size }, (_, i) => `g11-l${les.lesson}-${i + 1}`)
      );
    }
    const all = bank.lessons.flatMap((l) => l.questions.map((q) => q.id));
    expect(new Set(all).size).toBe(all.length);
    expect(all).toHaveLength(714 + 68 + 57 + 54); // ۷۱۴ (تا r312) + ۶۸ (r354) + ۵۷ (r355 — جامع تشریحی د۱) + ۵۴ (r356 — تشریحی گرامر د۲)
    expect(bank.lessons).toHaveLength(59);
  });

  it("file shape: last twenty-three banks are l37..l59 in order (r356 appended l56..l59)", () => {
    const tail = bank.lessons.slice(-23).map((l) => l.lesson);
    expect(tail).toEqual([37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59]);
  });
});

describe("r354 — typed banks (l37/l38/l40/l41/l42)", () => {
  it("kind=typed, accepted[0]=options[answer], placeholder, category=grammar, English purity", () => {
    for (const les of [l37, l38, l40, l41, l42]) {
      for (const q of les.questions) {
        expect(q.kind, q.id).toBe("typed");
        expect(q.accepted, q.id).toHaveLength(1);
        expect(norm(q.accepted![0]), q.id).toBe(norm(q.options[q.answer]));
        expect(q.placeholder, q.id).toBeTypeOf("string");
        expect(q.placeholder!.length, q.id).toBeGreaterThan(10);
        expect(q.category, q.id).toBe("grammar");
        expect(FA.test(q.question), q.id).toBe(false);
        expect(FA.test(q.options.join(" ")), q.id).toBe(false);
      }
    }
  });

  it("l37/l38 fill-pool lock: options are exactly the printed pair, answer inside pool", () => {
    for (const q of l37.questions) {
      expect(q.options, q.id).toEqual(["much", "many"]);
      expect(["much", "many"]).toContain(q.accepted![0]);
    }
    for (const q of l38.questions) {
      expect(q.options, q.id).toEqual(["a little", "a few"]);
      expect(["a little", "a few"]).toContain(q.accepted![0]);
    }
  });

  it("l40/l41 parenthetical lock: accepted must be one of the printed candidates in the stem", () => {
    for (const [les] of [[l40], [l41]] as const) {
      for (const q of les.questions) {
        const m = q.question.match(/\(([^()]+)\)/);
        expect(m, q.id).toBeTruthy();
        const cands = m![1].split("/").map((c) => norm(c));
        expect(cands, q.id).toContain(norm(q.accepted![0]));
      }
    }
  });

  it("l42 sentence-building lock: options[0]=accepted[0], three distinct distractors from same section", () => {
    const answers = l42.questions.map((q) => q.accepted![0]);
    for (const q of l42.questions) {
      expect(q.answer, q.id).toBe(0);
      expect(norm(q.options[0]), q.id).toBe(norm(q.accepted![0]));
      expect(new Set(q.options).size, q.id).toBe(4);
      for (let i = 1; i < 4; i++) expect(answers, q.id).toContain(q.options[i]);
    }
  });

  it("key spot locks (chapi-179 grid)", () => {
    expect(norm(l37.questions[0].accepted![0])).toBe("many");
    expect(norm(l37.questions[6].accepted![0])).toBe("much");
    expect(norm(l38.questions[7].accepted![0])).toBe("a little");
    expect(norm(l40.questions[0].accepted![0])).toBe("knowledge is");
    expect(norm(l41.questions[3].accepted![0])).toBe("bars");
    expect(norm(l42.questions[0].accepted![0])).toBe("How much information do they need?");
    expect(norm(l42.questions[9].accepted![0])).toBe("He knows little about Chinese culture.");
  });
});

describe("r354 — MCQ bank l39 (20 items)", () => {
  it("shape: 4 options, no kind field, answer in range, English purity", () => {
    for (const q of l39.questions) {
      expect(q.kind, q.id).toBeUndefined();
      expect(q.options, q.id).toHaveLength(4);
      expect(q.answer, q.id).toBeGreaterThanOrEqual(0);
      expect(q.answer, q.id).toBeLessThanOrEqual(3);
      expect(q.category, q.id).toBe("grammar");
      expect(FA.test(q.question), q.id).toBe(false);
      expect(FA.test(q.options.join(" ")), q.id).toBe(false);
    }
  });

  it("print quirks kept verbatim: Q16 «we need buy some», Q9 broken dash-run before period", () => {
    expect(l39.questions[15].question).toBe("There --------------- -------------- sugar in the kitchen, we need buy some.");
    expect(l39.questions[8].question.endsWith("--.")).toBe(true);
  });

  it("key spot locks (word→letter unique mapping)", () => {
    expect(l39.questions[0].answer).toBe(3); // much
    expect(l39.questions[1].answer).toBe(1); // a lot of
    expect(l39.questions[11].answer).toBe(3); // a lot (≠ a lot of)
    expect(l39.questions[12].answer).toBe(0); // A little (حرفِ بزرگِ چاپ)
    expect(l39.questions[15].answer).toBe(2); // isn't much
    expect(l39.questions[18].answer).toBe(0); // plenty of
  });
});
