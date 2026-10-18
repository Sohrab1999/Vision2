import { describe, expect, it } from "vitest";
import fs from "node:fs";

// r337 — گاردِ «آزمون نیمسال اول ۹۸-۹۹ — بوکان» جزوهٔ دهم (ص۱۰۸-۱۱۱؛ ص۱۱۲ برگهٔ Noteٔ خالی)
// پانزدهمین گروه / چهارده بانکِ سی‌ونه تا پنجاه‌ودو — ۷۲ آیتم (۷۶ اسلات) — نخستین آزمونِ بی‌کلیدِ چاپیِ
// این خانواده: خودکلیدیِ کاملِ ۷۲/۷۲ با دو گذرِ مستقل (پیش‌پرکردنِ معنایی + داوریِ گرامریِ مستقل) —
// الگویِ r300-r307. شکل‌ها: A تایپی ۸ / B MCQ ۶ / C حرفِ اول ۶ / D اسلش‌دار ۳ / E آهنگ ۴ /
// F واژگان ۶ / G وصل ۶ (۷ گزینه) / H تصویر ۱ / I تایپی ۴ / J گرامر ۶ / K جمله‌سازی ۲ /
// L دیالوگِ بانک‌دار ۸ / M کلوز ۶ / N مخلوط ۶ (۲ تایپی + ۲ MCQ + ۲ T-F).
// داوری‌های رندر: «fallowing» (سربرگ H)، Q21 «four-----» چسبیده، Q49 «as-----» چسبیده،
// Q71 بدونِ «a»، Q70-c «find» بدون s، em-dashِ بانک L، توکن‌های پایانیِ K.

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
    nimsal?: {
      exam: string; header: string; keyPages: string; keyVerification: string;
      selfKeying: string; extractedRound: string; pattern: string; printQuirks: string[];
    };
  };
};

const bank: TBank = JSON.parse(
  fs.readFileSync("public/jozve/tests-g10.json", "utf8"),
) as unknown as TBank;

const L = (n: number) => bank.lessons.find((l) => l.lesson === n)!;
const L39 = L(39), L40 = L(40), L41 = L(41), L42 = L(42), L43 = L(43), L44 = L(44),
  L45 = L(45), L46 = L(46), L47 = L(47), L48 = L(48), L49 = L(49), L50 = L(50),
  L51 = L(51), L52 = L(52);

const BANK_A = "future - famous - moon - hunters - breakfast - collects - instead - carry - microscope";
const BANK_L = "plains - protect - alive - cheetahs - destroy - endangered - visit - die out - increasing";

// کلیدهای خودکلیدی‌شده (دو گذرِ مستقل — صفر واگرایی)
const K39 = ["breakfast", "carry", "collects", "famous", "moon", "hunters", "instead", "microscope"];
const K40 = ["boring", "moon", "Sun", "lakes", "sheep", "live"];
const K41 = ["planet", "observatory", "brain", "attack", "animals", "defend"];
const K42 = ["bag / boxes", "wolves / lions", "trees / city"];
const K43_IDX = [0, 0, 1, 0]; // falling/falling/rising/falling
const K44 = ["dangerous", "plan", "drops", "donate", "Firefighters", "attention"];
const K45 = ["good for your body", "to go and get somebody or something", "things that are true or that really happened",
  "not many; a small number of things or people", "in place of someone or something else", "the time after now"];
const K47 = ["the most beautiful", "cook", "are going to / visit", "the farthest"];
const K48 = ["zebras", "to give", "largest", "the most dangerous", "deep as", "the worst"];
const K49 = ["Is his brother the best student in the class?", "They are going to save some money in the bank."];
const K50 = ["visit", "endangered", "cheetahs", "alive", "increasing", "protect", "die out", "plains"];
const K51 = ["nations", "problems", "oxygen", "move", "light", "age"];
const K52_TYPED = ["To find food for their chicks.", "To find a safe place for the mothers to lay eggs."];
const K52_MCQ = ["chicks", "comes out"];
const K52_TF = [1, 0]; // false/true

describe("jozve tests-g10 nimsal (r337 آزمون نیمسال اول ۹۸-۹۹ بوکان — pp108-111, self-keyed)", () => {
  it("nimsal receipt complete: official header, no printed key, self-keying, round, pattern, quirks", () => {
    expect(bank.source.nimsal).toBeTruthy();
    const s = bank.source.nimsal!;
    expect(s.exam).toContain("بوکان");
    expect(s.exam).toContain("۹۸-۹۹");
    expect(s.header).toContain("۷۰ دقیقه");
    expect(s.header).toContain("A - N");
    expect(s.header).toContain("پاسخنامه ندارد");
    expect(s.keyPages).toBe("—");
    expect(s.keyVerification).toContain("۷۲/۷۲");
    expect(s.keyVerification).toContain("r300-r307");
    expect(s.selfKeying).toContain("future");
    expect(s.selfKeying).toContain("destroy");
    expect(s.selfKeying).toContain("خیزان");
    expect(s.extractedRound).toBe("r337");
    expect(s.pattern).toContain("r331");
    expect(s.pattern).toContain("r300-r307");
    expect(s.printQuirks.length).toBeGreaterThanOrEqual(10);
    expect(s.printQuirks.some((q) => q.includes("fallowing"))).toBe(true);
    expect(s.printQuirks.some((q) => q.includes("em-dash"))).toBe(true);
    expect(s.printQuirks.some((q) => q.includes("40 نمره"))).toBe(true);
  });

  it("fourteen banks: shapes 8/6/6/3/4/6/6/1/4/6/2/8/6/6, kinds and categories per family pattern", () => {
    const shapes = [L39, L40, L41, L42, L43, L44, L45, L46, L47, L48, L49, L50, L51, L52].map((l) => l.count);
    expect(shapes).toEqual([8, 6, 6, 3, 4, 6, 6, 1, 4, 6, 2, 8, 6, 6]);
    // bank 39: typed vocab with [bank:] on all 8
    L39.questions.forEach((q) => {
      expect(q.kind, q.id).toBe("typed");
      expect(q.category, q.id).toBe("vocab");
      expect(q.options, q.id).toHaveLength(4);
      expect(new Set(q.options).size, q.id).toBe(4);
      expect(q.options[0], q.id).toBe(q.accepted![0]);
      expect(q.question, q.id).toContain(`[bank: ${BANK_A}]`);
    });
    // bank 40: plain MCQ vocab
    L40.questions.forEach((q) => {
      expect(q.kind, q.id).toBeUndefined();
      expect(q.category, q.id).toBe("vocab");
      expect(q.options, q.id).toHaveLength(4);
      expect(new Set(q.options).size, q.id).toBe(4);
    });
    // bank 41: first-letter typed vocab
    L41.questions.forEach((q) => {
      expect(q.kind, q.id).toBe("typed");
      expect(q.category, q.id).toBe("vocab");
      expect(q.placeholder, q.id).toContain("first letter is given");
    });
    // bank 42: double-blank slash typed grammar
    L42.questions.forEach((q) => {
      expect(q.kind, q.id).toBe("typed");
      expect(q.category, q.id).toBe("grammar");
      expect(q.accepted![0], q.id).toContain(" / ");
      expect(q.placeholder, q.id).toContain("both blanks");
    });
    // bank 43: intonation 2-option MCQ grammar
    L43.questions.forEach((q) => {
      expect(q.options, q.id).toEqual(["falling", "rising"]);
      expect(q.category, q.id).toBe("grammar");
      expect(q.question, q.id).toContain("لحن صدای جملهٔ زیر را مشخص کنید");
    });
    // bank 45: matching MCQ with SEVEN options each
    L45.questions.forEach((q) => {
      expect(q.options, q.id).toHaveLength(7);
      expect(new Set(q.options).size, q.id).toBe(7);
      expect(q.question, q.id).toContain("ستون A");
    });
    // bank 46: single picture typed
    expect(L46.questions).toHaveLength(1);
    expect(L46.questions[0].question, L46.questions[0].id).toContain("picture: two children playing football");
    expect(L46.questions[0].accepted!.length, L46.questions[0].id).toBe(4);
    // bank 50: dialogue typed vocab with [bank:] on all 8
    L50.questions.forEach((q) => {
      expect(q.kind, q.id).toBe("typed");
      expect(q.category, q.id).toBe("vocab");
      expect(q.question, q.id).toContain(`[bank: ${BANK_L}]`);
    });
    // bank 52: mixed 2 typed + 2 MCQ + 2 T-F
    L52.questions.slice(0, 2).forEach((q) => {
      expect(q.kind, q.id).toBe("typed");
      expect(q.accepted!.length, q.id).toBeGreaterThanOrEqual(4);
    });
    L52.questions.slice(2, 4).forEach((q) => {
      expect(q.kind, q.id).toBeUndefined();
      expect(q.options, q.id).toHaveLength(4);
    });
    L52.questions.slice(4).forEach((q) => {
      expect(q.kind, q.id).toBeUndefined();
      expect(q.options, q.id).toEqual(["True", "False"]);
    });
  });

  it("all 72 self-keyed answers locked (words/indices) — two independent passes, zero divergence", () => {
    L39.questions.forEach((q, i) => {
      expect(q.accepted![0], `A item${i + 1}`).toBe(K39[i]);
      expect(q.options[0], `A item${i + 1}`).toBe(K39[i]);
    });
    const K40_IDX = [0, 3, 3, 1, 0, 3];
    L40.questions.forEach((q, i) => {
      expect(q.options[q.answer], `B item${i + 1}`).toBe(K40[i]);
      expect(q.answer, `B item${i + 1} idx`).toBe(K40_IDX[i]);
    });
    L41.questions.forEach((q, i) => expect(q.accepted![0], `C item${i + 1}`).toBe(K41[i]));
    L42.questions.forEach((q, i) => expect(q.accepted![0], `D item${i + 1}`).toBe(K42[i]));
    L43.questions.forEach((q, i) => expect(q.answer, `E item${i + 1}`).toBe(K43_IDX[i]));
    const K44_IDX = [1, 3, 3, 3, 1, 0];
    L44.questions.forEach((q, i) => {
      expect(q.options[q.answer], `F item${i + 1}`).toBe(K44[i]);
      expect(q.answer, `F item${i + 1} idx`).toBe(K44_IDX[i]);
    });
    L45.questions.forEach((q, i) => expect(q.options[q.answer], `G item${i + 1}`).toBe(K45[i]));
    L47.questions.forEach((q, i) => expect(q.accepted![0], `I item${i + 1}`).toBe(K47[i]));
    expect(L47.questions[3].accepted).toEqual(["the farthest", "the furthest"]);
    const K48_IDX = [3, 1, 3, 2, 2, 0];
    L48.questions.forEach((q, i) => {
      expect(q.options[q.answer], `J item${i + 1}`).toBe(K48[i]);
      expect(q.answer, `J item${i + 1} idx`).toBe(K48_IDX[i]);
    });
    L49.questions.forEach((q, i) => expect(q.accepted![0], `K item${i + 1}`).toBe(K49[i]));
    L50.questions.forEach((q, i) => expect(q.accepted![0], `L item${i + 1}`).toBe(K50[i]));
    L51.questions.forEach((q, i) => expect(q.options[q.answer], `M item${i + 1}`).toBe(K51[i]));
    L52.questions.slice(0, 2).forEach((q, i) => expect(q.accepted![0], `N typed${i + 1}`).toBe(K52_TYPED[i]));
    L52.questions.slice(2, 4).forEach((q, i) => expect(q.options[q.answer], `N mcq${i + 1}`).toBe(K52_MCQ[i]));
    L52.questions.slice(4).forEach((q, i) => expect(q.answer, `N TF${i + 1}`).toBe(K52_TF[i]));
  });

  it("stems verbatim: joined dashes Q21/Q49, K tokens, L dialogue, M cloze markers, N questions", () => {
    expect(L42.questions[0].question).toBe("I saw a -------------- ( bag ) and four-------------- ( box ) on the table.");
    expect(L48.questions[4].question).toBe("This part of the river is as----------------- that part.");
    expect(L52.questions[4].question).toBe("Penguins walk to find safe place just to take care of their chicks.");
    expect(L52.questions[3].options[2]).toBe("find a safe place");
    expect(L49.questions[0].question).toBe("the best / the class / his brother / in / student / is / ?");
    expect(L49.questions[1].question).toBe("in the bank / are / some money / save / they / going to / .");
    expect(L50.questions[0].question).toContain("---(53)--- a Museum of Nature and Wildlife on the weekend");
    expect(L50.questions[7].question).toContain("like Moghan");
    expect(L51.questions[0].question).toContain("In the future people from different ---(61)--- such as Asia");
    expect(L52.questions[2].question).toContain("The underlined word “them” in line six refers to");
    expect(L46.questions[0].placeholder).toBe("answer using the picture cues…");
    expect(L47.questions[2].question).toBe("Where -------- the tourists ------------------ next Friday? (be going to / to visit)");
  });

  it("no duplicate ids across the whole family (774)", () => {
    const ids = bank.lessons.flatMap((l) => l.questions.map((q) => q.id));
    expect(ids.length).toBe(774);
    expect(new Set(ids).size).toBe(774);
  });
});
