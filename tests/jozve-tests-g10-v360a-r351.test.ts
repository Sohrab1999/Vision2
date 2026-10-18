import { describe, expect, it } from "vitest";
import fs from "node:fs";

// r351 — گاردِ «۳۶۰ تست واژگان درس ۱ تا ۴» بخش ۱ (سؤال ۱-۱۲۰ از ۳۶۰ — ص۱۷۸-۱۸۳، کلیدِ جدولیِ ص۳۰۱)
// سی‌ودومین گروهِ کارتِ دهم / بانکِ ۹۸ — ۱۲۰ MCQ بدونِ ترجمهٔ چاپی («ترجمه» ×۰ در ص۱۷۸-۱۹۴).
// داوری‌های رندر (۹۰۰-۱۲۰۰dpi، ۵ برش):
// سربرگ «۳۶۰ تست آموزشی واژگان "درس ۱ تا ۴ - پایه دهم"» + «سطح تستها: "آموزشی" و "متوسط"» (آموزشی سرخِ
// نقل‌قولی، متوسط مشکی؛ لایه «ی آموزیس» = تجزیهٔ «آموزشی»)؛ کلید = جدولِ یک‌صفحه‌ایِ ۳۶۰ جفت (۳۶۰/۳۶۰ یکتا)؛
// کوئیرکِ فرمت: خودِ چاپ بینِ Q39 و Q40 از «a.» به «a)» می‌پیچد؛
// Q24 ران‌های [۷،۱۰،۳،۱] لایه = ۲۱ تیرهٔ یکپارچه + نقطهٔ چسبیده (ادغامِ r349-Q2)؛
// چاپ‌غلطِ Q40-c «planed» (گزینهٔ انحرافی؛ کلیدِ a «hurt»).
// بستنِ رگرسیونِ بازِ r283/r320: گریدِ «عبارات الحاق ص۴۴» (انتهای ص۱۸۷ دوازدهم) با دادهٔ اپ 20/20 AGREE
// (رندر ۱۱۰۰dpi) + گریدِ مجاورِ معلوم/مجهولِ r284 هم 40/40 AGREE — رسیدِ tagsR283Regression.

type TQ = {
  id: string; n: number; category: string; question: string; options: string[];
  answer: number; translation?: string;
};
type TL = { lesson: number; title: string; level: string; count: number; questions: TQ[] };
type TBank = {
  grade: number;
  lessons: TL[];
  source: {
    file: string; exam: string; keyPages: string; keyVerification: string;
    extractedRound: string; pattern: string;
    vocab360a?: {
      exam: string; header: string; keyPages: string; keyVerification: string;
      extractedRound: string; pattern: string; printQuirks: string[];
    };
    tagsR283Regression?: { regression: string; exam: string; verification: string; closedRound: string };
  };
};

const bank: TBank = JSON.parse(
  fs.readFileSync("public/jozve/tests-g10.json", "utf8"),
) as unknown as TBank;

const B = bank.lessons.find((l) => l.lesson === 98)!;

// گریدِ کلیدِ چاپیِ جدولیِ ص۳۰۱ (سؤال ۱-۱۲۰) — رونویسیِ regex
const PRINT_KEY = (
  "a d a c c d b b d c " + "c a a b c c d b b d " + "d b b d b b d a d c " + "d a d b d a a c c a " +
  "c b c a c b a a b d " + "c c a d b b d b c c " + "d d c d d c b a c a " + "c b a b d b a c d c " +
  "a c c b d a b b d d " + "b c a d b b b a b b " + "b b c d c c a a b a " + "c c d c b c c c d d"
).split(" ");

const STEMS_LOCK: [number, string][] = [
  [1, "We didn’t have enough money for a movie, so we went to the park"],
  [2, "weight when they stop smoking"],
  [24, "Isfahan has many interesting historical ---------------------."],
  [25, "the pretty little baby sleeping in the"],
  [40, "I played football yesterday and I"],
  [119, "Human knowledge ------------------ with scientist’s hard work."],
  [120, "Plasma is a ----------------- and yellow liquid that carries red and white cells"],
];
const OPTION_LOCKS: [number, number, string][] = [
  [1, 0, "instead"],
  [2, 3, "gain"],
  [24, 3, "sites"],
  [25, 1, "cradle"],
  [40, 2, "planed"], // چاپ‌غلطِ عینِ چاپ
  [40, 0, "hurt"], // کلید
];

describe("jozve tests-g10 v360a (r351 — ۳۶۰ تست واژگان درس ۱ تا ۴، بخش ۱ — Q1-120, key p301)", () => {
  it("vocab360a receipt complete + tags r283 regression CLOSED-GREEN", () => {
    expect(bank.source.vocab360a).toBeTruthy();
    const s = bank.source.vocab360a!;
    expect(s.exam).toContain("ص۱۷۸-۱۸۳");
    expect(s.exam).toContain("بخش ۱");
    expect(s.header).toContain("آموزشی");
    expect(s.header).toContain("متوسط");
    expect(s.header).toContain("۳۰۱");
    expect(s.keyPages).toBe("301");
    expect(s.keyVerification).toContain("360/360");
    expect(s.extractedRound).toBe("r351");
    expect(s.pattern).toContain("r350");
    expect(s.printQuirks.length).toBeGreaterThanOrEqual(7);
    expect(s.printQuirks.join(" ")).toContain("planed");
    expect(s.printQuirks.join(" ")).toContain("a) b) c) d)"); // پیچشِ فرمتِ چاپ
    // رگرسیونِ بازِ r283 — رسماً بسته شد
    expect(bank.source.tagsR283Regression).toBeTruthy();
    const t = bank.source.tagsR283Regression!;
    expect(t.closedRound).toBe("r351");
    expect(t.verification).toContain("20/20 AGREE");
    expect(t.verification).toContain("40/40 AGREE");
  });

  it("bank shape: 120 MCQ, category vocab, unique ids g10-l98-1..120, no translations, Latin purity", () => {
    expect(B.title).toBe("آموزشی/متوسط — ۳۶۰ تست واژگان درس ۱ تا ۴ — بخش ۱ از ۳ (ص۱۷۸-۱۸۳)");
    expect(B.level).toBe("آموزشی/متوسط — چهارگزینه‌ای");
    expect(B.count).toBe(120);
    expect(B.questions).toHaveLength(120);
    B.questions.forEach((q, i) => {
      expect(q.n).toBe(i + 1);
      expect(q.id).toBe(`g10-l98-${i + 1}`);
      expect(q.category).toBe("vocab");
      expect(q.options).toHaveLength(4);
      expect(q.answer).toBeGreaterThanOrEqual(0);
      expect(q.answer).toBeLessThanOrEqual(3);
      expect(q.translation).toBeUndefined(); // چاپ ترجمه ندارد — عینِ جزوه
      const body = q.question + q.options.join(" ");
      expect(/[آ-ی]/.test(body)).toBe(false); // خلوصِ لاتین
      expect(q.question).toMatch(/-{6,}/); // هر سؤال جای‌خالی دارد
    });
  });

  it("print key grid locked: 120 letters match data answers (جدولِ ص۳۰۱)", () => {
    expect(PRINT_KEY).toHaveLength(120);
    B.questions.forEach((q, i) => {
      expect("abcd"[q.answer]).toBe(PRINT_KEY[i]);
    });
    // تکیه‌گاه‌های معناییِ رندرشده
    expect(B.questions[0].answer).toBe(0); // Q1 instead
    expect(B.questions[1].answer).toBe(3); // Q2 gain weight
    expect(B.questions[23].answer).toBe(3); // Q24 historical sites
    expect(B.questions[24].answer).toBe(1); // Q25 cradle
    expect(B.questions[39].answer).toBe(0); // Q40 hurt my foot
  });

  it("verbatim quirks: Q24 merged 21 dashes, Q40 planed, dots/parens switch documented", () => {
    for (const [n, frag] of STEMS_LOCK) {
      expect(B.questions[n - 1].question).toContain(frag);
    }
    for (const [n, oi, frag] of OPTION_LOCKS) {
      expect(B.questions[n - 1].options[oi]).toBe(frag);
    }
    // Q24 — ادغامِ ران‌های [۷،۱۰،۳،۱] → ۲۱ تیرهٔ یکپارچه
    expect(B.questions[23].question).not.toMatch(/-\s+-/); // رانِ بریده نمانده
    // سنزِ تیره‌ها: ۱۲۴ رانِ ≥۶ / ۲۳۱۵ تیره
    const runs = B.questions.reduce(
      (s, q) => s + [...q.question.matchAll(/-{6,}/g)].length, 0);
    const total = B.questions.reduce(
      (s, q) => s + [...q.question.matchAll(/-{6,}/g)].reduce((a, m) => a + m[0].length, 0), 0);
    expect(runs).toBe(124);
    expect(total).toBe(2315);
  });

  it("file shape after r351: 98 banks, 1466 items, unique ids, tail vector", () => {
    expect(bank.lessons).toHaveLength(98);
    const counts = bank.lessons.map((l) => l.count);
    expect(counts.reduce((a, b) => a + b, 0)).toBe(1466);
    const ids = bank.lessons.flatMap((l) => l.questions.map((q) => q.id));
    expect(new Set(ids).size).toBe(1466);
    // وکتورِ دنباله: بانکِ ۹۸ با ۱۲۰؛ بانکِ ۹۷ با ۱۰۰؛ جامعِ چهارم در -10..-3
    const tail = bank.lessons.slice(6).map((l) => l.count);
    expect(tail.length).toBe(92);
    expect(tail.slice(-1)).toEqual([120]);
    expect(tail.slice(-2, -1)).toEqual([100]); // گرامرِ ۱-۴ — r350
    expect(tail.slice(-10, -2)).toEqual([16, 12, 13, 2, 4, 6, 6, 57]); // جامعِ چهارم + استانداردِ گرامرِ چهارم
  });
});
