import { describe, expect, it } from "vitest";
import fs from "node:fs";

// r344 — گاردِ دو بلوکِ باقی‌ماندهٔ ص۱۲۷-۱۳۰ جزوهٔ دهم:
// ① بانکِ ۷۵ «تستهای ضمیر انعکاسی و تاکیدی در کنکورهای سال ۱۳۹۸ تا ۱۴۰۰» (ص۱۲۸) — ۴ MCQ با برچسبِ آبیِ
//    کنکورِ درون‌ساقه + کلیدِ توضیح‌دارِ چاپیِ همان صفحه («پاسخنامه تشریحی ۴ تست بالا:» — جعبهٔ زرد)؛
//    گریدِ ۳/۱/۳/۳ — 4/4 صفر واگرایی؛ بدونِ ترجمهٔ چاپی (غیبتِ صادقانه).
// ② بانکِ ۷۶ «تمرین "افعال حالتی و کنشی"» (ص۱۳۰) — ۱۰ دونگزینه‌ایِ «زیر گزینه صحیح خط بکشید» با
//    Answer Keyِ جدولیِ ۲×۵ِ همان صفحه — 10/10 هم‌رأی — نخستین بانکِ دونگزینه‌ایِ کارتِ دهم.
// داوری‌های رندر ۶۰۰-۳۰۰۰dpi: «تاکیدی» بی‌همزهٔ سربرگ در برابرِ «تأکیدی» همزه‌دار؛ «تسی یچ» = هشتمین
// تجزیهٔ «تشریحی»؛ «باال» لایه = «بالا» چاپ (لا-لیگاتور)؛ «حتمأ» = «حتماً» (تنوین)؛ «f sel her» = «herself»؛
// نکاتِ سرخِ فاصله‌دارِ «(رد گزینه ۱ و۴.)» در برابرِ چسبیدهٔ «(رد گزینه۲).» (نقطهٔ درون/بیرونِ پرانتز)؛
// تیره‌ها: ۲۱/۲۱/۲۰/۲۱ (شمارشِ لایه حاکم — r338).

type TQ = {
  id: string; n: number; category: string; question: string; options: string[];
  answer: number; translation?: string;
};
type TL = { lesson: number; title: string; level: string; count: number; questions: TQ[] };
type TBank = {
  grade: number;
  lessons: TL[];
  source: {
    file: string;
    refl1?: {
      exam: string; header: string; keyPages: string; keyVerification: string;
      extractedRound: string; pattern: string; printQuirks: string[];
    };
    verb1?: {
      exam: string; header: string; keyPages: string; keyVerification: string;
      extractedRound: string; pattern: string; printQuirks: string[];
    };
  };
};

const bank: TBank = JSON.parse(
  fs.readFileSync("public/jozve/tests-g10.json", "utf8"),
) as unknown as TBank;

const norm = (s: string) =>
  s.toLowerCase().replaceAll("’", "'").split(/\s+/).filter(Boolean).join(" ");

// کلیدِ چاپیِ ص۱۲۸ «پاسخنامه تشریحی ۴ تست بالا:» — گریدِ یک-مبنای ۳/۱/۳/۳ → صفر-مبنا:
const REFL_GRID = [2, 0, 2, 2];
const REFL_KEY_WORDS = ["themselves", "and I", "herself", "themselves"];
// برچسب‌های آبیِ کنکور (رندرِ ۱۸۰۰dpi حاکم — لایه «نکنکور/تجرب/هین/اندگ» = نویز)
const REFL_TAGS = ["(کنکور خارج تجربی ۱۴۰۰)", "(کنکور ریاضی ۹۹)", "(کنکور هنر ۹۹)", "(کنکور هنر با اندکی تغییر ۹۸)"];

const B75 = bank.lessons.find((l) => l.lesson === 75)!;
const B76 = bank.lessons.find((l) => l.lesson === 76)!;

describe("jozve tests-g10 refl1 (r344 ضمیر انعکاسی کنکور ۹۸-۱۴۰۰ — p128, key same page)", () => {
  it("refl1 receipt complete: header, key page, round, pattern, quirks", () => {
    expect(bank.source.refl1).toBeTruthy();
    const s = bank.source.refl1!;
    expect(s.exam).toContain("ص۱۲۸");
    expect(s.header).toContain("۱۳۹۸ تا ۱۴۰۰"); // ارقامِ فارسی با واصفِ «تا»
    expect(s.keyPages).toBe("128");
    expect(s.keyVerification).toContain("4/4");
    expect(s.extractedRound).toBe("r344");
    expect(s.printQuirks.length).toBeGreaterThanOrEqual(9);
    expect(s.printQuirks.some((q) => q.includes("تاکیدی"))).toBe(true); // بی‌همزهٔ سربرگ در برابرِ تأکیدی
    expect(s.printQuirks.some((q) => q.includes("تسی یچ"))).toBe(true); // هشتمین تجزیهٔ «تشریحی»
    expect(s.printQuirks.some((q) => q.includes("بالا"))).toBe(true); // «باال» لایه = «بالا» چاپ
    expect(s.printQuirks.some((q) => q.includes("رد گزینه۲"))).toBe(true); // نکتهٔ چسبیدهٔ سرخ
    expect(s.printQuirks.some((q) => q.includes("حتماً"))).toBe(true); // «حتمأ» لایه
    expect(s.printQuirks.some((q) => q.includes("herself"))).toBe(true); // «f sel her» لایه
    expect(s.printQuirks.some((q) => q.includes("Gerald and I ourselves"))).toBe(true); // دیاگرامِ کلیدِ ۲
    expect(s.printQuirks.some((q) => q.includes("کنکور خارج تجربی ۱۴۰۰"))).toBe(true); // برچسب‌های آبی
    expect(s.printQuirks.some((q) => q.includes("غیبتِ صادقانه"))).toBe(true); // بدونِ ترجمهٔ چاپی
  });

  it("bank 75 shape: 4 konkur MCQ, ids g10-l75-N, verbatim tags, dash runs 21/21/20/21", () => {
    expect(B75.count).toBe(4);
    expect(B75.level).toContain("کنکوری");
    expect(B75.title).toContain("ص۱۲۸");
    B75.questions.forEach((q, i) => {
      expect(q.id, q.id).toBe(`g10-l75-${i + 1}`);
      expect(q.n, q.id).toBe(i + 1);
      expect(q.category, q.id).toBe("grammar");
      expect(q.options.length, q.id).toBe(4);
      expect(q.translation, q.id).toBeUndefined(); // غیبتِ صادقانهٔ ترجمهٔ چاپی
      expect(q.question, q.id).toContain(REFL_TAGS[i]); // برچسبِ آبیِ درون‌ساقه
    });
    const runs = (s: string) => [...s.matchAll(/-{6,}/g)].map((m) => m[0].length);
    expect(runs(B75.questions[0].question)).toEqual([21]);
    expect(runs(B75.questions[1].question)).toEqual([21]);
    expect(runs(B75.questions[2].question)).toEqual([20]);
    expect(runs(B75.questions[3].question)).toEqual([21]);
    // آپاستروفِ تایپوگرافیکِ doesn’t (Q3)
    expect(B75.questions[2].question).toContain("doesn’t listen to the teacher");
  });

  it("bank 75 keys locked to the printed grid p128: index + option-word, verbatim option order", () => {
    B75.questions.forEach((q, i) => {
      expect(q.answer, `B75-Q${i + 1} grid letter`).toBe(REFL_GRID[i]);
      expect(norm(q.options[q.answer]), `B75-Q${i + 1} word`).toBe(norm(REFL_KEY_WORDS[i]));
    });
    // ترتیبِ عینِ چاپِ گزینه‌ها
    expect(B75.questions[0].options).toEqual(["they", "them", "themselves", "who they"]);
    expect(B75.questions[1].options).toEqual(["and I", "or myself", "and I themselves", "himself and myself"]);
    expect(B75.questions[2].options).toEqual(["it", "those", "herself", "themselves"]);
    expect(B75.questions[3].options).toEqual(["ourselves", "they", "themselves", "were those"]);
  });

  it("bank 75 stems verbatim from the print", () => {
    expect(B75.questions[0].question).toContain("We spent a week in Istanbul, and then a month in a village. The villagers --------------------- were very welcoming.");
    expect(B75.questions[1].question).toContain("Gerald --------------------- forgot to lock the door the night our restaurant was robbed.");
    expect(B75.questions[2].question).toContain("she prevents -------------------- and others from learning.");
    expect(B75.questions[3].question).toContain("A: Did anyone help them do the project? B: No, those college students, Ted and Tom, --------------------- did the project.");
  });
});

describe("jozve tests-g10 verb1 (r344 تمرین افعال حالتی و کنشی — p130, inline answer key)", () => {
  it("verb1 receipt complete: header, key page, round, pattern, quirks", () => {
    expect(bank.source.verb1).toBeTruthy();
    const s = bank.source.verb1!;
    expect(s.exam).toContain("ص۱۳۰");
    expect(s.header).toContain("زیر گزینه صحیح خط بکشید");
    expect(s.header).toContain("حالتی"); // «حالتی» با ی — ناسازگاری با سربرگِ بخشِ ص۱۲۹
    expect(s.keyPages).toBe("130");
    expect(s.keyVerification).toContain("10/10");
    expect(s.extractedRound).toBe("r344");
    expect(s.printQuirks.length).toBeGreaterThanOrEqual(5);
    expect(s.printQuirks.some((q) => q.includes("دونگزینه‌ای"))).toBe(true); // نخستین بانکِ دونگزینه‌ای
    expect(s.printQuirks.some((q) => q.includes("تزئینی"))).toBe(true); // رنگِ سرمه‌ای/سرخ — کلیدِ جدولی حاکم
    expect(s.printQuirks.some((q) => q.includes("Answer Key"))).toBe(true);
    expect(s.printQuirks.some((q) => q.includes("15"))).toBe(true); // رقمِ لاتینِ عینِ چاپ
  });

  it("bank 76 shape: 10 two-option MCQ with inline-paren stems, ids g10-l76-N", () => {
    expect(B76.count).toBe(10);
    expect(B76.level).toContain("دونگزینه‌ای");
    expect(B76.title).toContain("ص۱۳۰");
    B76.questions.forEach((q, i) => {
      expect(q.id, q.id).toBe(`g10-l76-${i + 1}`);
      expect(q.n, q.id).toBe(i + 1);
      expect(q.category, q.id).toBe("grammar");
      expect(q.options.length, q.id).toBe(2); // نخستین بانکِ دونگزینه‌ایِ کارتِ دهم
      expect(q.translation, q.id).toBeUndefined();
      // پرانتزِ عینِ چاپ درونِ ساقه + نگاشتِ یک‌به‌یک به گزینه‌ها
      expect(q.question, q.id).toContain(`(${q.options[0]} / ${q.options[1]})`);
    });
  });

  it("bank 76 keys locked to the printed Answer Key table: index + option-word", () => {
    const KEY_WORDS = ["seems", "am having", "love", "tastes", "is studying", "don’t you remember", "watched", "need", "likes", "were cooking"];
    const GRID = [0, 1, 0, 0, 1, 0, 1, 0, 1, 0];
    B76.questions.forEach((q, i) => {
      expect(q.answer, `B76-Q${i + 1} grid`).toBe(GRID[i]);
      expect(norm(q.options[q.answer]), `B76-Q${i + 1} word`).toBe(norm(KEY_WORDS[i]));
    });
    // ترتیبِ عینِ چاپِ جفت‌گزینه‌ها
    expect(B76.questions[5].options).toEqual(["don’t you remember", "aren’t you remembering"]);
    expect(B76.questions[9].options).toEqual(["were cooking", "cooked"]);
    // رقمِ لاتینِ عینِ چاپ + آپاستروف‌های تایپوگرافیک
    expect(B76.questions[9].question).toContain("we had 15 people coming for lunch");
    expect(B76.questions[0].question).toContain("don’t know him");
    expect(B76.questions[5].question).toContain("aren’t you remembering");
  });

  it("bank 76 stems verbatim from the print", () => {
    expect(B76.questions[0].question).toBe("I don’t know him but he (seems / is seeming) like such a nice boy.");
    expect(B76.questions[6].question).toBe("I had dinner and (was watching / watched) TV for a couple of hours.");
    expect(B76.questions[8].question).toBe("He (is liking / likes) to spend his evenings in front of the television.");
  });
});

describe("jozve tests-g10 file shape after r344", () => {
  it("file shape: 88 banks, 1130 items, unique ids", () => {
    expect(bank.grade).toBe(10);
    expect(bank.lessons).toHaveLength(88);
    expect(bank.lessons.reduce((s: number, l: { count: number }) => s + l.count, 0)).toBe(1130);
    const ids = bank.lessons.flatMap((l: TL) => l.questions.map((q: TQ) => q.id));
    expect(ids.length).toBe(1130);
    expect(new Set(ids).size).toBe(1130);
    expect(ids).toContain("g10-l75-1");
    expect(ids).toContain("g10-l75-4");
    expect(ids).toContain("g10-l76-1");
    expect(ids).toContain("g10-l76-10");
  });
});
