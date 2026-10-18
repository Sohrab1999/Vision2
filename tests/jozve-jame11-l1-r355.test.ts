import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

// =====================================================================
// r355 — گاردِ «آزمون جامع تشریحی درس اول» جزوهٔ جامع یازدهم
// ص۴۰-۴۲، کلیدِ چاپیِ ص۱۸۳ — سیزده سکشن = سیزده بانک (l43..l55):
// کلمات ناقص (۴ تایپی) / کلمات داده‌شده (۸ تایپی، بانکِ ۹واژه‌ای) / حروفِ ناقص (۴ تایپی) /
// چهارگزینه‌ای (۴ MCQ) / گزینهٔ متفاوت (۴ تایپی) / وصل کردن (۴ تایپی) / چهارگزینه‌ای (۴ MCQ) /
// جمله‌سازی (۲ تایپی) / اجزای جمله S/V/O/AI (۴ تایپی) / تصاویر و پرانتز (۳ تایپی) /
// پرانتزی (۴ تایپی) / کلوزِ قاره‌ها (۶ MCQ) / درک مطلب (۲ تایپی + ۴ T/F) — ۵۷ آیتم
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
const l43 = byLesson(43);
const l44 = byLesson(44);
const l45 = byLesson(45);
const l46 = byLesson(46);
const l47 = byLesson(47);
const l48 = byLesson(48);
const l49 = byLesson(49);
const l50 = byLesson(50);
const l51 = byLesson(51);
const l52 = byLesson(52);
const l53 = byLesson(53);
const l54 = byLesson(54);
const l55 = byLesson(55);

describe("r355 — receipt: source.g11l1jame", () => {
  it("receipt exists with extractedRound=r355 and 10 printQuirks", () => {
    const rec = bank.source.g11l1jame;
    expect(rec).toBeTruthy();
    expect(rec!.extractedRound).toBe("r355");
    expect(rec!.printQuirks).toHaveLength(10);
  });
});

describe("r355 — bank shapes (l43..l55)", () => {
  it("titles, levels, counts (۱۳ سکشنِ چاپی)", () => {
    expect(l43.title).toBe("تشریحی جامع — کلمات ناقص (ص۴۰)");
    expect(l44.title).toBe("تشریحی جامع — کلمات داده‌شده (ص۴۰)");
    expect(l45.title).toBe("تشریحی جامع — کلمهٔ مناسب با حروف ناقص (ص۴۰)");
    expect(l46.title).toBe("تشریحی جامع — تست چهارگزینه‌ای (ص۴۰)");
    expect(l47.title).toBe("تشریحی جامع — گزینهٔ متفاوت (ص۴۰)");
    expect(l48.title).toBe("تشریحی جامع — وصل کردن تعریف‌ها (ص۴۰)");
    expect(l49.title).toBe("تشریحی جامع — تست چهارگزینه‌ای (ص۴۱)");
    expect(l50.title).toBe("تشریحی جامع — جمله‌سازی (ص۴۱)");
    expect(l51.title).toBe("تشریحی جامع — اجزای جمله (فاعل/فعل/مفعول/قید) (ص۴۱)");
    expect(l52.title).toBe("تشریحی جامع — تصاویر و پرانتز (ص۴۱)");
    expect(l53.title).toBe("تشریحی جامع — خط زیر گزینهٔ صحیح (ص۴۱)");
    expect(l54.title).toBe("تشریحی جامع — کلوز قاره‌ها (ص۴۲)");
    expect(l55.title).toBe("تشریحی جامع — درک مطلب زبان اشاره (ص۴۲)");
    expect(l43.level).toBe("تشریحی — تایپی");
    expect(l46.level).toBe("تشریحی — چهارگزینه‌ای");
    expect(l50.level).toBe("تشریحی — جمله‌سازی");
    expect(l55.level).toBe("تشریحی — درست/نادرست و تایپی");
    expect([l43.count, l44.count, l45.count, l46.count, l47.count, l48.count, l49.count, l50.count, l51.count, l52.count, l53.count, l54.count, l55.count]).toEqual([4, 8, 4, 4, 4, 4, 4, 2, 4, 3, 4, 6, 6]);
  });

  it("ids: g11-l43..l55-N unique across the whole bank — total 1019 items in 78 banks", () => {
    const sizes = [4, 8, 4, 4, 4, 4, 4, 2, 4, 3, 4, 6, 6];
    for (const les of [l43, l44, l45, l46, l47, l48, l49, l50, l51, l52, l53, l54, l55]) {
      const size = sizes[les.lesson - 43];
      expect(les.questions.map((q) => q.id), `l${les.lesson}`).toEqual(
        Array.from({ length: size }, (_, i) => `g11-l${les.lesson}-${i + 1}`)
      );
    }
    const all = bank.lessons.flatMap((l) => l.questions.map((q) => q.id));
    expect(new Set(all).size).toBe(all.length);
    expect(all).toHaveLength(782 + 57 + 54 + 65 + 61); // ۷۸۲ (تا r354) + ۵۷ (r355) + ۵۴ (r356) + ۶۵ (r357) + ۶۱ (r358 — تشریحی گرامر د۳)
    expect(bank.lessons).toHaveLength(78);
  });

  it("file shape: last thirty-six banks are l43..l78 in order (r357 appended l60..l73، r358 appended l74..l78)", () => {
    const tail = bank.lessons.slice(-36).map((l) => l.lesson);
    expect(tail).toEqual([43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78]);
  });
});

describe("r355 — typed banks (l43/l44/l45/l47/l48/l50/l51/l52/l53)", () => {
  it("kind=typed, accepted[0]=options[answer], placeholder, English purity", () => {
    for (const les of [l43, l44, l45, l47, l48, l50, l51, l52, l53]) {
      for (const q of les.questions) {
        expect(q.kind, q.id).toBe("typed");
        expect(q.accepted, q.id).toHaveLength(1);
        expect(norm(q.accepted![0]), q.id).toBe(norm(q.options[q.answer]));
        expect(q.placeholder, q.id).toBeTypeOf("string");
        expect(q.placeholder!.length, q.id).toBeGreaterThan(10);
        expect(FA.test(q.question), q.id).toBe(false);
        expect(FA.test(q.options.join(" ")), q.id).toBe(false);
      }
    }
  });

  it("l43/l45 incomplete-word lock: key completes the printed skeleton (expl__n__tion → explanation)", () => {
    const complete = (tok: string) => {
      const parts = tok.split("__");
      return new RegExp("^" + parts.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join(".") + "$");
    };
    for (const q of l43.questions) {
      const tok = q.question.split(/\s+/).find((t) => t.includes("__"))!;
      expect(complete(tok.replace(/[.,?;:]$/, "")).test(q.accepted![0]), q.id).toBe(true);
    }
    for (const q of l45.questions) {
      const m = q.question.match(/([A-Za-z])((?:\s*_\s*)+)/)!;
      const first = m[1];
      const slots = (m[2].match(/_/g) || []).length;
      expect(q.accepted![0].length, q.id).toBe(1 + slots);
      expect(q.accepted![0][0], q.id).toBe(first);
    }
  });

  it("l44 word-bank lock: [bank: …] in stem with 9 printed words, «range» is the extra one", () => {
    const BANK = ["despite", "society", "region", "native", "make up", "range", "access", "ability", "popular"];
    for (const q of l44.questions) {
      const m = q.question.match(/\[bank: ([^\]]+)\]/);
      expect(m, q.id).toBeTruthy();
      expect(m![1].split(" / "), q.id).toEqual(BANK);
      expect(BANK, q.id).toContain(q.accepted![0]);
    }
    const used = l44.questions.map((q) => q.accepted![0]);
    expect(new Set(used).size, "هر واژه حداکثر یک بار").toBe(used.length);
    expect(BANK.filter((w) => !used.includes(w)), "واژهٔ اضافیِ چاپ").toEqual(["range"]);
  });

  it("l44 Q4 broken dash-run merged into one 28-dash blank with printed trailing period", () => {
    expect(l44.questions[3].question).toBe(
      "Those who clean the streets have a great role in our ---------------------------- . [bank: despite / society / region / native / make up / range / access / ability / popular]"
    );
  });

  it("l47 odd-one-out lock: options are the four printed items, accepted is one of them", () => {
    for (const q of l47.questions) {
      expect(q.options, q.id).toHaveLength(4);
      expect(q.options, q.id).toContain(q.accepted![0]);
      expect(norm(q.options[q.answer]), q.id).toBe(norm(q.accepted![0]));
      expect(new Set(q.options).size, q.id).toBe(4);
    }
  });

  it("l48 matching lock: pool of four printed words in stem, accepted within pool, all four used", () => {
    const POOL = ["specific", "vary", "foreigner", "society"];
    for (const q of l48.questions) {
      const m = q.question.match(/\[bank: ([^\]]+)\]/);
      expect(m, q.id).toBeTruthy();
      expect(m![1].split(" / "), q.id).toEqual(POOL);
      expect(POOL, q.id).toContain(q.accepted![0]);
    }
    expect(new Set(l48.questions.map((q) => q.accepted![0])).size).toBe(4);
  });

  it("l50 sentence-building lock: two items, options = [own answer, sibling answer]", () => {
    const answers = l50.questions.map((q) => q.accepted![0]);
    for (const q of l50.questions) {
      expect(q.answer, q.id).toBe(0);
      expect(norm(q.options[0]), q.id).toBe(norm(q.accepted![0]));
      expect(answers, q.id).toContain(q.options[1]);
    }
  });

  it("l51 parts-of-speech lock: accepted is the printed S/V/O/AI labeling; Q3 keeps «Last night» in final AI slot (verbatim key)", () => {
    for (const q of l51.questions) {
      expect(q.accepted![0], q.id).toMatch(/^S: .+ \| V: .+ \| O: .+ \| AI: .+/);
    }
    expect(l51.questions[2].question).toBe("Last night, my sister made cookies at home.");
    expect(l51.questions[2].accepted![0]).toBe("S: my sister | V: made | O: cookies | AI: at home | AI: last night");
  });

  it("l52 picture-cue lock: parenthetical (loaf/cup/slice) at stem end, plural-unit keys", () => {
    expect(l52.questions.map((q) => q.accepted![0])).toEqual(["loaves of bread", "cups of coffee", "slices of pizza"]);
    for (const q of l52.questions) {
      expect(q.question, q.id).toMatch(/\((loaf|cup|slice)\)$/);
    }
  });

  it("l53 parenthetical lock: accepted must be one of the two printed candidates", () => {
    for (const q of l53.questions) {
      const m = q.question.match(/\(([^()]+)\)/);
      expect(m, q.id).toBeTruthy();
      const cands = m![1].split("/").map((c) => norm(c));
      expect(cands, q.id).toContain(norm(q.accepted![0]));
    }
  });

  it("key spot locks (chapi-183 grid)", () => {
    expect(norm(l43.questions[0].accepted![0])).toBe("explanation");
    expect(norm(l43.questions[2].accepted![0])).toBe("loaves");
    expect(norm(l44.questions[0].accepted![0])).toBe("popular");
    expect(norm(l44.questions[7].accepted![0])).toBe("despite");
    expect(norm(l45.questions[1].accepted![0])).toBe("percent");
    expect(norm(l47.questions[0].accepted![0])).toBe("a little");
    expect(norm(l47.questions[1].accepted![0])).toBe("Africa");
    expect(norm(l48.questions[0].accepted![0])).toBe("foreigner");
    expect(norm(l50.questions[0].accepted![0])).toBe("How many students are there in the class?");
    expect(norm(l52.questions[0].accepted![0])).toBe("loaves of bread");
    expect(norm(l53.questions[2].accepted![0])).toBe("a lot");
    expect(norm(l53.questions[3].accepted![0])).toBe("a lot of");
  });
});

describe("r355 — MCQ banks (l46/l49/l54) + mixed l55", () => {
  it("shape: 4 options, no kind field, answer in range, English purity", () => {
    for (const les of [l46, l49, l54]) {
      for (const q of les.questions) {
        expect(q.kind, q.id).toBeUndefined();
        expect(q.options, q.id).toHaveLength(4);
        expect(q.answer, q.id).toBeGreaterThanOrEqual(0);
        expect(q.answer, q.id).toBeLessThanOrEqual(3);
        expect(FA.test(q.question), q.id).toBe(false);
        expect(FA.test(q.options.join(" ")), q.id).toBe(false);
      }
    }
  });

  it("print quirk kept verbatim: l46 Q2 stem ends with printed period (not question mark)", () => {
    expect(l46.questions[1].question).toBe("Does life ---------------------------- on other planets.");
    expect(l46.questions[1].options[3]).toBe("exist");
  });

  it("l54 cloze lock: numbered blank ---(N)--- in stem, six distinct blanks", () => {
    for (const [i, q] of l54.questions.entries()) {
      expect(q.question, q.id).toContain(`---(${i + 1})---`);
    }
    expect(new Set(l54.questions.map((q) => q.question)).size).toBe(6);
  });

  it("l55 mixed: two typed Q&A with printed keys + four True/False (false/false/true/true)", () => {
    expect(l55.questions[0].kind).toBe("typed");
    expect(l55.questions[1].kind).toBe("typed");
    expect(norm(l55.questions[0].accepted![0])).toBe("Deaf people learn a sign language from their family or other deaf people.");
    expect(norm(l55.questions[1].accepted![0])).toBe("Deaf people often use sign languages.");
    for (const q of l55.questions.slice(2)) {
      expect(q.kind, q.id).toBeUndefined();
      expect(q.options, q.id).toEqual(["True", "False"]);
      expect(FA.test(q.question), q.id).toBe(false);
      expect(q.question, q.id).not.toContain("(True or False)");
    }
    expect(l55.questions.slice(2).map((q) => q.answer)).toEqual([1, 1, 0, 0]);
  });

  it("key spot locks (MCQ)", () => {
    expect(l46.questions.map((q) => q.answer)).toEqual([2, 3, 0, 2]); // popular/exist/despite/mental
    expect(l49.questions.map((q) => q.answer)).toEqual([3, 1, 2, 0]); // many/much/much bread/many
    expect(l54.questions.map((q) => q.answer)).toEqual([2, 1, 2, 3, 0, 0]); // joined/continents/seven/region/described/part
  });
});
