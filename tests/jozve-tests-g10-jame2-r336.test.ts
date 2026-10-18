import { describe, expect, it } from "vitest";
import fs from "node:fs";

// r336 — گاردِ «آزمون جامع تشریحی درس دوم» جزوهٔ دهم (ص۱۰۵-۱۰۷، کلیدِ چاپیِ ص۲۷۲-۲۷۳)
// چهاردهمین گروه / هفت بانکِ سی‌ودوم تا سی‌وهشتم — ۵۸ آیتمِ مخلوط (الگوی r331):
// S1+S2+S3 تایپی ۱۶ / S4+S5+S6 چهارگزینه‌ای ۱۲ / S7+S8 تایپی ۵ / S9+S10 تایپی ۷ /
// S11 آهنگِ خیزان ۴ / S12 کلوزِ یوزپلنگ ۶ / S13 درک مطلبِ منظومهٔ شمسی ۸ (۴ تایپی + ۴ T-F).
// کلید چاپی ۵۸/۵۸ صفر واگرایی. داوری‌های رندر: سربرگ‌های «تشریحی» (ششمین «تسی یچ» لایه)،
// «خیزان» (لایه «ر ن/خیان»)، «پرانتز» (لایه «پر ن/انی»)، «heavens» واژهٔ اضافیِ بانک ۹تایی،
// کلیدِ دوواریانتهٔ S9-1/3 (هر دو واریانتِ چاپی در accepted — نخستین‌بار)، کلیدِ اسلش‌دارِ S8-1.

type TQ = {
  id: string; n: number; category: string; question: string; options: string[];
  answer: number; kind?: string; accepted?: string[]; placeholder?: string;
};
type TL = { lesson: number; title: string; level: string; count: number; questions: TQ[] };
type TBank = {
  grade: number;
  lessons: TL[];
  source: {
    file: string; exam: string; keyPages: string; keyVerification: string;
    extractedRound: string; pattern: string; translations: string;
    jame2?: {
      exam: string; header: string; keyPages: string; keyVerification: string;
      extractedRound: string; pattern: string; printQuirks: string[];
    };
  };
};

const bank: TBank = JSON.parse(
  fs.readFileSync("public/jozve/tests-g10.json", "utf8"),
) as unknown as TBank;

const L32 = bank.lessons.find((l) => l.lesson === 32)!;
const L33 = bank.lessons.find((l) => l.lesson === 33)!;
const L34 = bank.lessons.find((l) => l.lesson === 34)!;
const L35 = bank.lessons.find((l) => l.lesson === 35)!;
const L36 = bank.lessons.find((l) => l.lesson === 36)!;
const L37 = bank.lessons.find((l) => l.lesson === 37)!;
const L38 = bank.lessons.find((l) => l.lesson === 38)!;

const BANK2 = "wonder / expensive / compare / interested / heavens / suitable / happened / microscope / healthy";

// کلیدهای چاپی ص۲۷۲-۲۷۳
const K32 = ["observatory", "happiest", "thousand", "information", "suitable", "compare", "happened", "healthy", "interested", "microscope", "wonder", "expensive", "shark", "telescope", "blood", "planet"];
const K33 = ["Oxygen", "moon", "boring", "funny", "near", "collect", "extra", "healthy", "a longer", "much better", "oldest / youngest", "She was wearing a red new silk dress."];
const K34 = ["What is the cheapest way of travelling in China?", "I am more interested in music than sport.", "more expensive than / the most expensive", "than", "the farthest"];
const K35 = ["No, my father is older than my mother.", "No, tigers are as dangerous as lions.", "No, Asia is bigger than Europe.", "careful", "worse", "the biggest", "the most expensive"];
const K37 = ["land", "few", "slowly", "runs", "before", "defend"];
const K38_TYPED = ["Mercury", "Neptune", "Saturn", "Mars"];
const K38_TF = [1, 0, 0, 1]; // false/true/true/false (اندیس: True=0)

describe("jozve tests-g10 jame2 (r336 آزمون جامع تشریحی درس دوم — pp105-107, key pp272-273)", () => {
  it("jame2 receipt complete: header, key pages, round, pattern, quirks", () => {
    expect(bank.source.jame2).toBeTruthy();
    const s = bank.source.jame2!;
    expect(s.exam).toContain("جامع تشریحی درس دوم");
    expect(s.header).toContain("۲۷۲");
    expect(s.keyPages).toBe("272-273");
    expect(s.keyVerification).toContain("58/58");
    expect(s.extractedRound).toBe("r336");
    expect(s.pattern).toContain("r331");
    expect(s.printQuirks.length).toBeGreaterThanOrEqual(10);
    expect(s.printQuirks.some((q) => q.includes("تسی یچ"))).toBe(true);
    expect(s.printQuirks.some((q) => q.includes("خیزان"))).toBe(true);
    expect(s.printQuirks.some((q) => q.includes("heavens"))).toBe(true);
    expect(s.printQuirks.some((q) => q.includes("پرانتز"))).toBe(true);
    expect(s.printQuirks.some((q) => q.includes("بوکان"))).toBe(true);
  });

  it("seven banks: shapes 16/12/5/7/4/6/8, kinds and categories per r331 pattern", () => {
    expect(L32.count).toBe(16);
    expect(L33.count).toBe(12);
    expect(L34.count).toBe(5);
    expect(L35.count).toBe(7);
    expect(L36.count).toBe(4);
    expect(L37.count).toBe(6);
    expect(L38.count).toBe(8);
    // bank 32: all typed vocab with [bank:] on S2 items only (indices 4-11)
    L32.questions.forEach((q) => {
      expect(q.kind, q.id).toBe("typed");
      expect(q.category, q.id).toBe("vocab");
      expect(q.options, q.id).toHaveLength(4);
      expect(new Set(q.options).size, q.id).toBe(4);
      expect(q.options[0], q.id).toBe(q.accepted![0]);
    });
    L32.questions.slice(4, 12).forEach((q) => expect(q.question, q.id).toContain(`[bank: ${BANK2}]`));
    L32.questions.slice(0, 4).concat(L32.questions.slice(12)).forEach((q) => expect(q.question, q.id).not.toContain("[bank:"));
    // bank 33: plain MCQ
    L33.questions.forEach((q) => {
      expect(q.kind, q.id).toBeUndefined();
      expect(q.options, q.id).toHaveLength(4);
      expect(new Set(q.options).size, q.id).toBe(4);
    });
    // banks 34/35: typed grammar
    [...L34.questions, ...L35.questions].forEach((q) => {
      expect(q.kind, q.id).toBe("typed");
      expect(q.category, q.id).toBe("grammar");
      expect(new Set(q.options).size, q.id).toBe(4);
    });
    // bank 36: intonation 2-option MCQ
    L36.questions.forEach((q) => {
      expect(q.options, q.id).toEqual(["falling", "rising"]);
      expect(q.question, q.id).toContain("آهنگ کدام جمله خیزان است؟");
    });
    // bank 37: cloze MCQ with ---(N)--- markers
    L37.questions.forEach((q, i) => expect(q.question, q.id).toContain(`---(${i + 1})---`));
    // bank 38: 4 typed + 4 T-F
    L38.questions.slice(0, 4).forEach((q) => expect(q.kind, q.id).toBe("typed"));
    L38.questions.slice(4).forEach((q) => {
      expect(q.kind, q.id).toBeUndefined();
      expect(q.options, q.id).toEqual(["True", "False"]);
    });
  });

  it("all 58 keys locked to print (words/indices) — zero divergence", () => {
    L32.questions.forEach((q, i) => {
      expect(q.options[0], `S1-3 item${i + 1}`).toBe(K32[i]);
      expect(q.accepted![0], `S1-3 item${i + 1} accepted`).toBe(K32[i]);
    });
    const K33_IDX = [2, 1, 2, 3, 2, 1, 3, 3, 1, 1, 0, 3];
    L33.questions.forEach((q, i) => {
      expect(q.options[q.answer], `S4-6 item${i + 1}`).toBe(K33[i]);
      expect(q.answer, `S4-6 item${i + 1} idx`).toBe(K33_IDX[i]);
    });
    L34.questions.forEach((q, i) => expect(q.accepted![0], `S7-8 item${i + 1}`).toBe(K34[i]));
    L35.questions.forEach((q, i) => expect(q.accepted![0], `S9-10 item${i + 1}`).toBe(K35[i]));
    // S9 two printed variants locked in accepted
    expect(L35.questions[0].accepted).toEqual(["No, my father is older than my mother.", "No, my mother is younger than my father."]);
    expect(L35.questions[2].accepted).toEqual(["No, Asia is bigger than Europe.", "No, Europe is smaller than Asia."]);
    const K36 = [1, 0, 1, 0]; // rising/falling/rising/falling — کلیدِ دوگانهٔ چاپیِ ۱و۳
    L36.questions.forEach((q, i) => expect(q.answer, `S11 item${i + 1}`).toBe(K36[i]));
    L37.questions.forEach((q, i) => expect(q.options[q.answer], `S12 item${i + 1}`).toBe(K37[i]));
    L38.questions.slice(0, 4).forEach((q, i) => expect(q.accepted![0], `S13 typed${i + 1}`).toBe(K38_TYPED[i]));
    L38.questions.slice(4).forEach((q, i) => expect(q.answer, `S13 TF${i + 1}`).toBe(K38_TF[i]));
  });

  it("stems verbatim: S1 missing-letter forms, S2 sentences, S8 double-blank, S12 cloze markers, S13 questions", () => {
    expect(L32.questions[0].question).toBe("An obs__rvat__ry is a building from which scientists can watch the planets and the stars.");
    expect(L32.questions[10].question).toContain("If you didn’t study, no -------------------------- you failed the test. [bank:");
    expect(L32.questions[12].question).toBe("A s _ _ _ _ is a big fish that lives in the sea and is very dangerous.");
    expect(L33.questions[11].question).toBe("Which sentence is wrong?");
    expect(L33.questions[11].options[3]).toBe("She was wearing a red new silk dress.");
    expect(L34.questions[0].question).toBe("the cheapest / in China / is / what / of travelling / way?");
    expect(L34.questions[2].question).toBe("Gold is expensive. Gold is ----------------- silver. Gold is ----------------- metal of the world.");
    expect(L34.questions[2].accepted).toEqual(["more expensive than / the most expensive"]);
    expect(L35.questions[1].question).toBe("Are tigers more dangerous than lions? (as)");
    expect(L37.questions[3].question).toContain("it ---(4)--- after it very quickly");
    expect(L38.questions[4].question).toBe("Mars is a red planet because it isn’t rocky and cold.");
    expect(L38.questions[7].question).toBe("The Sun is a planet because the other objects are pulled into orbit around it.");
  });

  it("no duplicate ids across the whole family (774)", () => {
    const ids = bank.lessons.flatMap((l) => l.questions.map((q) => q.id));
    expect(ids.length).toBe(774);
    expect(new Set(ids).size).toBe(774);
  });
});
