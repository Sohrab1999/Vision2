import { describe, expect, it } from "vitest";
import fs from "node:fs";

// r350 — گاردِ «۱۰۰ تست گرامر و نگارش درس ۱ تا ۴ - پایه دهم» متوسط/کنکوری (ص۱۷۲-۱۷۶، کلیدِ جدولیِ ص۳۰۰)
// سی‌ویکمین گروهِ کارتِ دهم / بانکِ ۹۷ — ۱۰۰ MCQ بدونِ ترجمهٔ چاپی (صفحاتِ سؤال فاقدِ ستونِ ترجمه).
// داوری‌های رندر (۹۰۰-۱۲۰۰dpi، ۱۲ برش):
// جلدِ ص۱۷۱ «Grammar Tests / Vision 1 / (Lesson: 1-4)» + «سطح تستها: متوسط و استاندارد» — ولی سربرگِ
// خودِ آزمون «سطح تستها "متوسط" و "کنکوری"» (متوسط سبزِ نقل‌قولی، کنکوری سرخ) — رندر حاکم؛
// کلید = جدولِ ۱۰×۱۰ با ارقامِ لاتین و حروفِ سرخ — گریدِ ۱۰۰/۱۰۰ با regex چندالگویی، صفر واگرایی؛
// «سؤاالت» لایه = پانزدهمین تجزیهٔ لیگاتور (r349)؛
// نویزهای لایه: Q14 خطِ نویزِ «a»، Q93 «a(» پرانتزِ باز، Q96 حروفِ سربارِ «B»/«D» — همگی رندر = چاپِ تمیز؛
// چاپ‌غلط‌ها/کوئیرک‌های عینِ چاپ: Q28 «by his own's»، Q34 «Swimming»، Q42 نقطه‌پایان، Q44 «My Father a
// good manager.»، Q49 «tomorrow. but»، Q64 «Marry»/«NO,»، Q97 «since 1363»، Q88 گزینه‌های عینِ چاپ.

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
    gram14?: {
      exam: string; header: string; keyPages: string; keyVerification: string;
      extractedRound: string; pattern: string; printQuirks: string[];
    };
  };
};

const bank: TBank = JSON.parse(
  fs.readFileSync("public/jozve/tests-g10.json", "utf8"),
) as unknown as TBank;

const B = bank.lessons.find((l) => l.lesson === 97)!;

// گریدِ کلیدِ چاپیِ جدولیِ ص۳۰۰ (رونویسیِ regex — ۱۰۰ حرف)
const PRINT_KEY = (
  "b c b a d a b c a b " + "d b c a b d c c d b " + "b d c b a c c a b b " + "c d d d c c b d a c " +
  "b b c c a b b c b b " + "a a b b c b a c a b " + "d b c b c d d b d d " + "b b d c a d a c d d " +
  "b b a c b a b b b b " + "c a c d a c b a b b"
).split(" ");

const STEMS_QUIRK: [number, string][] = [
  [1, "He ------------------ in the garden, but I’m not sure"],
  [28, "by his own’s"],
  [34, "Do you like Swimming?"],
  [42, "countries in the world."],
  [44, "My Father a good manager."],
  [49, "tomorrow. but I’m not quite sure"],
  [64, "an e-mail to Marry"],
  [64, "NO, I forgot"],
  [88, "in a (n) ------------------ house in a ------------------- village."],
  [97, "since 1363"],
  [99, "Mark has three -----------, ----------- boy and two girls. ---------- boy is 7 years old"],
];
const OPTION_LOCKS: [number, number, string][] = [
  [14, 0, "on"], [14, 3, "to"],
  [88, 1, "old wooden / lovely small old"],
  [93, 0, "were leaving"], [93, 2, "left"],
  [96, 0, "Look at the picture on the wall."],
  [96, 2, "Most students have lunch on school."],
  [99, 1, "children / a / The"],
];

describe("jozve tests-g10 l14 (r350 — ۱۰۰ تست گرامر و نگارش درس ۱ تا ۴ — pp172-176, key p300)", () => {
  it("gram14 receipt complete: header, key page, round, pattern, quirks", () => {
    expect(bank.source.gram14).toBeTruthy();
    const s = bank.source.gram14!;
    expect(s.exam).toContain("ص۱۷۲-۱۷۶");
    expect(s.exam).toContain("۱ تا ۴");
    expect(s.header).toContain("متوسط");
    expect(s.header).toContain("کنکوری");
    expect(s.header).toContain("۳۰۰");
    expect(s.keyPages).toBe("300");
    expect(s.keyVerification).toContain("100/100");
    expect(s.keyVerification).toContain("zero divergence");
    expect(s.extractedRound).toBe("r350");
    expect(s.pattern).toContain("r349");
    expect(s.printQuirks.length).toBeGreaterThanOrEqual(11);
    expect(s.printQuirks.join(" ")).toContain("سؤاالت"); // پانزدهمین تجزیهٔ لیگاتور — سربرگِ کلید
    expect(s.printQuirks.join(" ")).toContain("by his own’s");
    expect(s.printQuirks.join(" ")).toContain("Marry");
  });

  it("bank shape: 100 MCQ, category grammar, unique ids g10-l97-1..100, no translations (چاپ ترجمه ندارد)", () => {
    expect(B.title).toBe("متوسط/کنکوری — ۱۰۰ تست گرامر و نگارش درس ۱ تا ۴ (ص۱۷۲-۱۷۶)");
    expect(B.level).toBe("متوسط/کنکوری — چهارگزینه‌ای");
    expect(B.count).toBe(100);
    expect(B.questions).toHaveLength(100);
    B.questions.forEach((q, i) => {
      expect(q.n).toBe(i + 1);
      expect(q.id).toBe(`g10-l97-${i + 1}`);
      expect(q.category).toBe("grammar");
      expect(q.options).toHaveLength(4);
      expect(q.answer).toBeGreaterThanOrEqual(0);
      expect(q.answer).toBeLessThanOrEqual(3);
      expect(q.translation).toBeUndefined(); // بدونِ ترجمهٔ چاپی — عینِ جزوه
      // خلوصِ لاتین — این آزمون هیچ متنِ فارسی ندارد
      const body = q.question + q.options.join(" ");
      expect(/[آ-ی]/.test(body)).toBe(false);
    });
    // همهٔ سؤال‌ها به‌جز Q81/Q96 (جمله‌های چهارگزینه‌ای بدونِ خط‌چین) جای‌خالیِ ۶+ تیره دارند
    B.questions.forEach((q) => {
      if (q.n !== 81 && q.n !== 96) expect(q.question).toMatch(/-{6,}/);
    });
    expect(B.questions[80].question).toContain("WRONG");
    expect(B.questions[95].question).toContain("WRONG");
  });

  it("print key grid locked: 100 letters match data answers in order (جدولِ ۱۰×۱۰ ص۳۰۰)", () => {
    expect(PRINT_KEY).toHaveLength(100);
    B.questions.forEach((q, i) => {
      expect("abcd"[q.answer]).toBe(PRINT_KEY[i]);
    });
    // تکیه‌گاه‌های نمونهٔ رندرشده / پیش‌پرکرده
    expect(B.questions[0].answer).toBe(1); // Q1 may be («but I’m not sure»)
    expect(B.questions[14].answer).toBe(1); // Q15 need («right now»)
    expect(B.questions[80].answer).toBe(1); // Q81 at London (جملهٔ غلطِ b)
    expect(B.questions[87].answer).toBe(1); // Q88 lovely small old (ترتیبِ صفتِ درست)
    expect(B.questions[92].answer).toBe(2); // Q93 left («when the train left»)
    expect(B.questions[95].answer).toBe(2); // Q96 on school (جملهٔ غلطِ c)
  });

  it("verbatim stems with print quirks: own's / Father / Marry / Swimming / since 1363", () => {
    for (const [n, frag] of STEMS_QUIRK) {
      expect(B.questions[n - 1].question).toContain(frag);
    }
    expect(B.questions[27].question).not.toContain("on his own"); // چاپ‌غلطِ عینِ چاپ
    expect(B.questions[63].question).not.toContain("Mary,"); // املای چاپ Marry است
    for (const [n, oi, frag] of OPTION_LOCKS) {
      expect(B.questions[n - 1].options[oi]).toBe(frag);
    }
    // سنزِ تیره‌ها: ۱۵۰ رانِ ≥۶ / ۲۳۹۱ تیره (بدونِ هیچ بریدگیِ بین‌خطی — عینِ لایه)
    const runs = B.questions.reduce(
      (s, q) => s + [...q.question.matchAll(/-{6,}/g)].length, 0);
    const total = B.questions.reduce(
      (s, q) => s + [...q.question.matchAll(/-{6,}/g)].reduce((a, m) => a + m[0].length, 0), 0);
    expect(runs).toBe(150);
    expect(total).toBe(2391);
  });

  it("layer-noise arbitrations: Q14 stray-a dropped, Q93 a( fixed, Q96 trailing B/D dropped", () => {
    // Q14 — گزینه‌های واقعیِ on/in/with/to (خطِ نویزِ «a» حذف شد)
    expect(B.questions[13].options).toEqual(["on", "in", "with", "to"]);
    expect(B.questions[13].question).not.toMatch(/a\s+a\)/);
    // Q93 — «a(» چاپ → گزینهٔ a همان were leaving
    expect(B.questions[92].options[0]).toBe("were leaving");
    expect(B.questions[92].question).toContain("exactly when the train");
    // Q96 — گزینه‌های تمیز بدونِ «B»/«D» سربار
    expect(B.questions[95].options[0]).not.toMatch(/B$/);
    expect(B.questions[95].options[2]).not.toMatch(/D$/);
    expect(B.questions[95].options[3]).toBe("What are you doing on Saturday?");
    // Q97 — رقمِ لاتینِ ۱۳۶۳ (نه فارسی)
    expect(B.questions[96].question).toContain("since 1363");
    expect(B.questions[96].question).not.toMatch(/۱۳۶۳/);
  });

  it("file shape after r350: 99 banks, 1586 items, unique ids, tail vector", () => {
    expect(bank.lessons).toHaveLength(99);
    const counts = bank.lessons.map((l) => l.count);
    expect(counts.reduce((a, b) => a + b, 0)).toBe(1586);
    const ids = bank.lessons.flatMap((l) => l.questions.map((q) => q.id));
    expect(new Set(ids).size).toBe(1586);
    // وکتورِ دنباله: بانکِ ۹۷ با ۱۰۰؛ هفت‌تاییِ پیش از آن = جامعِ چهارم (r348)
    const tail = bank.lessons.slice(6).map((l) => l.count);
    expect(tail.length).toBe(93);
    expect(tail.slice(-3, -2)).toEqual([100]);
    expect(tail.slice(-4, -3)).toEqual([57]); // استانداردِ گرامرِ چهارم — r349
    expect(tail.slice(-11, -4)).toEqual([16, 12, 13, 2, 4, 6, 6]); // جامعِ چهارم — r348
  });
});
