import { describe, expect, it } from "vitest";
import fs from "node:fs";

// r333 — گاردِ «آزمون تشریحی گرامر درس دوم» (انواع صفات) جزوهٔ دهم (ص۹۷-۹۸، کلید چاپی ص۲۶۴)
// یازدهمین گروه / بیست‌وششم تا بیست‌ونهمین بانکِ درس‌محورِ پایهٔ دهم — ۴ بانک/۴۴ آیتم (الگوی r329).
// کلید چاپی ۴۴/۴۴ صفر واگرایی. داوری‌های ۲۲۰۰-۲۶۰۰dpi: سربرگ «تشریحی» (لایه «تسی یچ» — سومین تکرار)،
// S3-Q1 لایه دو جمله را جابه‌جا داده بود (چاپ: I am 20… My brother is 25)، S4-Q2 گزینه‌های a/b جابه‌جا
// در لایه (چاپ a=hotter / hottest → کلید a)، S4-Q7 «as» اول در لایه غایب، Q6 «20th» بالانویس،
// کلیدهای than-دار Q7/14/15 برخلاف Q1/4/8/11/12، Q13 کلید «louder» بدون than.

type TQ = {
  id: string; n: number; category: string; question: string; options: string[];
  answer: number; translation?: string; kind?: string; accepted?: string[]; placeholder?: string;
};
type TL = { lesson: number; title: string; level: string; count: number; questions: TQ[] };
type TBank = {
  grade: number;
  lessons: TL[];
  source: {
    file: string; exam: string; keyPages: string; keyVerification: string;
    extractedRound: string; pattern: string; translations: string;
    gram4?: {
      exam: string; header: string; keyPages: string; keyVerification: string;
      extractedRound: string; pattern: string; printQuirks: string[];
    };
  };
};

const bank: TBank = JSON.parse(
  fs.readFileSync("public/jozve/tests-g10.json", "utf8"),
) as unknown as TBank;

const D39 = "-".repeat(39);
const D18 = "-".repeat(18);
const D17 = "-".repeat(17);

// —— کلیدِ چاپیِ ص۲۶۴
const S1_KEYS = [
  "heavier", "better", "the most interesting", "faster", "more difficult", "worse",
  "younger than", "smaller", "the largest", "easier", "wider", "sunnier",
  "louder", "farther than", "bigger than",
];
const S1_BASES = [
  "heavy", "good", "interesting", "fast", "difficult", "bad", "young",
  "small", "large", "easy", "wide", "sunny", "loud", "far", "big",
];
const S2_KEYS = [
  "This scarf is more beautiful than the one in the window.",
  "Winter is the coldest season of the year.",
  "He was the best friend I had for years.",
  "She walks faster than her brother.",
  "Are the gloves cheaper than the shirt?",
  "What is the longest river in the world?",
  "They are not going to the worst hotel.",
];
const S3_KEYS = [
  "younger than / older", "more / than", "the tallest", "the farthest",
  "bigger than / smaller", "the smallest / the closest", "the largest",
  "as old as", "tall", "the hottest",
];
const S4_IDX = [1, 0, 2, 1, 2, 3, 2, 3, 2, 0, 3, 2];
const S4_WORDS = [
  "higher than", "hotter / hottest", "better", "more polite", "more", "the most intelligent",
  "dangerous", "the most", "the best", "strangest", "worse", "the slowest",
];

const L26 = bank.lessons.find((l) => l.lesson === 26)!;
const L27 = bank.lessons.find((l) => l.lesson === 27)!;
const L28 = bank.lessons.find((l) => l.lesson === 28)!;
const L29 = bank.lessons.find((l) => l.lesson === 29)!;

describe("jozve tests-g10 gram4 (r333 آزمون تشریحی گرامر درس دوم — pp97-98, key p264)", () => {
  it("gram4 receipt complete: header, key pages, round, pattern, quirks", () => {
    expect(bank.source.gram4).toBeTruthy();
    const s = bank.source.gram4!;
    expect(s.exam).toContain("تشریحی گرامر درس دوم");
    expect(s.header).toContain("۲۶۴");
    expect(s.keyPages).toBe("264");
    expect(s.keyVerification).toContain("44/44");
    expect(s.extractedRound).toBe("r333");
    expect(s.pattern).toContain("r329");
    expect(s.printQuirks.length).toBeGreaterThanOrEqual(15);
    expect(s.printQuirks.some((q) => q.includes("تسی یچ"))).toBe(true);
    expect(s.printQuirks.some((q) => q.includes("younger than / older"))).toBe(true);
    expect(s.printQuirks.some((q) => q.includes("hotter / hottest"))).toBe(true);
    expect(s.printQuirks.some((q) => q.includes("Tigers are as"))).toBe(true);
  });

  it("bank shapes: 15/7/10/12, typed kinds with placeholders, MCQ clean, categories grammar", () => {
    expect(L26.count).toBe(15);
    expect(L27.count).toBe(7);
    expect(L28.count).toBe(10);
    expect(L29.count).toBe(12);
    L26.questions.concat(L27.questions, L28.questions).forEach((q) => {
      expect(q.kind, q.id).toBe("typed");
      expect(q.accepted, q.id).toBeTruthy();
      expect(q.placeholder, q.id).toBeTruthy();
      expect(q.options?.[0], q.id).toBe(q.accepted?.[0]); // options[0]=کلید چاپ (الگوی r329)
      expect(q.category, q.id).toBe("grammar");
    });
    L29.questions.forEach((q) => {
      expect(q.kind, q.id).toBeUndefined();
      expect(q.accepted, q.id).toBeUndefined();
      expect(q.options, q.id).toHaveLength(4);
      expect(new Set(q.options).size, q.id).toBe(4);
      expect(q.category, q.id).toBe("grammar");
    });
  });

  it("S1: 15 keys locked to the printed grid p264 + stems verbatim with 39-dash blanks and (adj)", () => {
    L26.questions.forEach((q, i) => {
      expect(q.accepted, `S1-Q${i + 1}`).toEqual([S1_KEYS[i]]);
      expect(q.question).toContain(`(${S1_BASES[i]})`);
      expect(q.question).toContain(D39);
    });
    expect(L26.questions[0].question).toBe(
      `Rain in the wet season is ${D39} (heavy) than during the rest of the year.`,
    );
    expect(L26.questions[2].question).toBe(
      `Kish island is ${D39} (interesting) island I have ever visited.`,
    );
    expect(L26.questions[6].question).toBe(
      `Ali is 8 and Reza is 10. Ali is ${D39} (young) Reza.`,
    );
    expect(L26.questions[12].question).toBe(
      `Speak ${D39} (loud), I can’t hear you.`,
    );
  });

  it("S2: 7 word-banks verbatim + full-sentence keys (r329-l14 pattern)", () => {
    const BANKS = [
      "beautiful / is / than / more / this scarf / in the window / the one.",
      "year / season / winter / coldest / of / the / the / is.",
      "was / for years / the best / had / he / I / friend.",
      "walks / brother / she / her / faster / than.",
      "are / the shirt / than / cheaper / the gloves ?",
      "river / the / in / what / world / longest / is / the?",
      "hotel / are / worst / they / going to / the / not.",
    ];
    L27.questions.forEach((q, i) => {
      expect(q.question, `S2-Q${i + 1}`).toBe(BANKS[i]);
      expect(q.accepted, `S2-Q${i + 1}`).toEqual([S2_KEYS[i]]);
      expect(q.options, `S2-Q${i + 1}`).toContain(S2_KEYS[i]);
      expect(new Set(q.options!).size, `S2-Q${i + 1}`).toBe(4);
    });
  });

  it("S3: 10 double-blank stems verbatim + slash-form keys locked to printed grid", () => {
    L28.questions.forEach((q, i) => {
      expect(q.accepted, `S3-Q${i + 1}`).toEqual([S3_KEYS[i]]);
      expect(q.question).toMatch(/-{10,}/);
    });
    expect(L28.questions[0].question).toBe(
      `I am 20 years old. My brother is 25 years old. I am ${D17} him. He is ${D17} than me.`,
    );
    expect(L28.questions[1].question).toBe(
      `We have a poor family. They have a rich family. They have ${D18} money ${D18} us.`,
    );
    expect(L28.questions[4].question).toBe(
      `A village is very small. A town is ${D18} a village, but ${D18} than a city.`,
    );
    expect(L28.questions[7].accepted).toEqual(["as old as"]);
    expect(L28.questions[8].accepted).toEqual(["tall"]);
  });

  it("S4: 12 MCQ keys locked to print (index + word), option-order fix Q2 = a", () => {
    L29.questions.forEach((q, i) => {
      expect(q.answer, `S4-Q${i + 1} idx`).toBe(S4_IDX[i]);
      expect(q.options[q.answer], `S4-Q${i + 1} word`).toBe(S4_WORDS[i]);
    });
    expect(L29.questions[0].question).toContain("the Statue of Liberty.");
    expect(L29.questions[1].question).toContain("but summer is the");
    expect(L29.questions[1].options[0]).toBe("hotter / hottest");
    expect(L29.questions[5].question).toContain("20th century.");
    expect(L29.questions[6].question).toBe(`Tigers are as ${D18} as lions.`);
    expect(L29.questions[10].options).toEqual(["worse than", "bad", "worst", "worse"]);
  });

  it("print quirks visible in data: S3-Q1 چاپِ حاکم, S4-Q2 the-stem, Q13 louder, as-old-as, 20th", () => {
    expect(L28.questions[0].question).toContain("I am 20 years old. My brother is 25 years old.");
    expect(L29.questions[1].question).toContain("summer is the");
    expect(L26.questions[12].accepted).toEqual(["louder"]);
    expect(L26.questions[6].accepted).toEqual(["younger than"]);
    expect(L26.questions[13].accepted).toEqual(["farther than"]);
    expect(L26.questions[14].accepted).toEqual(["bigger than"]);
    expect(L28.questions[7].question).toContain("My parents are 60 years old.");
  });

  it("ids unique across the whole 482-item family (r333 gram4 appended)", () => {
    const ids = bank.lessons.flatMap((l) => l.questions.map((q) => q.id));
    expect(new Set(ids).size).toBe(1466);
  });
});
