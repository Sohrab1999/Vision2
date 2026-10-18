import { describe, expect, it } from "vitest";
import fs from "node:fs";

// r352 — گاردِ «۳۶۰ تست واژگان درس ۱ تا ۴» بخش ۲ (سؤال ۱۲۱-۲۴۰ از ۳۶۰ — ص۱۸۳-۱۸۸، کلیدِ همان جدولِ ص۳۰۱)
// سی‌وسومین گروهِ کارتِ دهم / بانکِ ۹۹ — ۱۲۰ MCQ بدونِ ترجمهٔ چاپی («ترجمه» ×۰ در ص۱۸۳-۱۸۸).
// داوری‌های رندر (۱۲۰۰dpi):
// چاپ‌خطایِ گزینه‌نامهٔ Q174 — گزینهٔ چهارم در خودِ چاپ «b) suitably» (حرفِ b تکرار + محتوای تکراریِ a)؛
// پنج دورانِ چندگانهٔ لایه = یک خطِ پیوسته → ادغام: Q143=۲۱/Q146=۱۶/Q152=۱۹/Q158=۲۱/Q213=۱۸؛
// چاپ‌غلط‌های stem: Q152 «different idea» / Q213 «It's not health» / Q221 «to became»؛
// آپستروفِ مستقیمِ لایه در Q144/Q179/Q202 («London's/world's/she's») — عینِ لایه؛
// گریدِ کلید: بازتولیدِ برنامه‌ایِ حرف-اول از ص۳۰۱ + AGREE ۳۶۰/۳۶۰ با رکوردِ r351.

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
    vocab360b?: {
      exam: string; header: string; keyPages: string; keyVerification: string;
      extractedRound: string; pattern: string; printQuirks: string[];
    };
    vocab360a?: { extractedRound: string };
  };
};

const bank: TBank = JSON.parse(
  fs.readFileSync("public/jozve/tests-g10.json", "utf8"),
) as unknown as TBank;

const B = bank.lessons.find((l) => l.lesson === 99)!;

// گریدِ کلیدِ چاپیِ جدولیِ ص۳۰۱ (سؤال ۱۲۱-۲۴۰) — رونویسیِ گریدِ بازتولیدِ برنامه‌ایِ راند
const PRINT_KEY = (
  "a a b b b d d a b b " + "d b b c d c b b d d " + "a d b b a a c c c d " + "b b a b c c b b d b " +
  "d c c c d c b d d c " + "a d b c a b b c c b " + "b c d d d b b b c c " + "d d b c c a b b d b " +
  "c a d d d c d d a a " + "b b d b a c b b d c " + "a b b d b c c c a c " + "a b d b b a b d d d"
).split(" ");

const STEMS_LOCK: [number, string][] = [
  [121, "You know that ------------------- tourists travel abroad."],
  [143, "visit Iran’s ---------------------."],
  [146, "go to holy ---------------- in Mashhad."],
  [158, "He could speak five ---------------------."],
  [174, "Tell me --------------------, Kate, what do you think of John?"],
  [175, "He never -------------------- the animals in the jungle."],
  [213, "You should ------------------ your meals yourself."],
  [221, "It’s important to became --------------------- with your destination before your trip."],
  [240, "You’re breaking the ------------------- if you touch the ball with your hands."],
];
const OPTION_LOCKS: [number, number, string][] = [
  [174, 0, "suitably"], // گزینهٔ a
  [174, 2, "honestly"], // کلید
  [174, 3, "suitably"], // گزینهٔ چهارم — تکرارِ verbatim (چاپ: حرفِ «b)»)
  [175, 0, "hunts"],
  [213, 3, "prepare"],
  [220, 2, "translate"],
  [224, 1, "quitted"], // شکلِ چاپیِ جزوه
  [240, 2, "shelfs"], // شکلِ چاپیِ جزوه
];

describe("jozve tests-g10 v360b (r352 — ۳۶۰ تست واژگان درس ۱ تا ۴، بخش ۲ — Q121-240, key p301)", () => {
  it("vocab360b receipt complete", () => {
    expect(bank.source.vocab360b).toBeTruthy();
    const s = bank.source.vocab360b!;
    expect(s.exam).toContain("ص۱۸۳-۱۸۸");
    expect(s.exam).toContain("بخش ۲");
    expect(s.header).toContain("۳۰۱");
    expect(s.header).toContain("۱۲۱-۲۴۰");
    expect(s.keyPages).toBe("301");
    expect(s.keyVerification).toContain("360/360");
    expect(s.extractedRound).toBe("r352");
    expect(s.pattern).toContain("r351");
    expect(s.printQuirks.length).toBeGreaterThanOrEqual(7);
    expect(s.printQuirks.join(" ")).toContain("b) suitably"); // چاپ‌خطایِ Q174
    expect(s.printQuirks.join(" ")).toContain("360/360 AGREE"); // مقایسه با رکوردِ r351
    // بخشِ ۱ (r351) همچنان سرِ جای خودش است
    expect(bank.source.vocab360a?.extractedRound).toBe("r351");
  });

  it("bank shape: 120 MCQ, category vocab, unique ids g10-l99-121..240, no translations, Latin purity", () => {
    expect(B.title).toBe("آموزشی/متوسط — ۳۶۰ تست واژگان درس ۱ تا ۴ — بخش ۲ از ۳ (ص۱۸۳-۱۸۸)");
    expect(B.level).toBe("آموزشی/متوسط — چهارگزینه‌ای");
    expect(B.count).toBe(120);
    expect(B.questions).toHaveLength(120);
    B.questions.forEach((q, i) => {
      expect(q.n).toBe(i + 121);
      expect(q.id).toBe(`g10-l99-${i + 121}`);
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

  it("print key grid locked: 120 letters match data answers (جدولِ ص۳۰۱ — سؤال ۱۲۱-۲۴۰)", () => {
    expect(PRINT_KEY).toHaveLength(120);
    B.questions.forEach((q, i) => {
      expect("abcd"[q.answer]).toBe(PRINT_KEY[i]);
    });
    // تکیه‌گاه‌های معنایی
    expect(B.questions[0].answer).toBe(0); // Q121 international tourists
    expect(B.questions[12].answer).toBe(1); // Q133 injured
    expect(B.questions[22].answer).toBe(1); // Q143 attractions
    expect(B.questions[25].answer).toBe(0); // Q146 shrines
    expect(B.questions[31].answer).toBe(1); // Q152 respect
    expect(B.questions[37].answer).toBe(1); // Q158 languages
    expect(B.questions[53].answer).toBe(2); // Q174 honestly
    expect(B.questions[54].answer).toBe(0); // Q175 hunts
    expect(B.questions[92].answer).toBe(3); // Q213 prepare
    expect(B.questions[99].answer).toBe(2); // Q220 translate
    expect(B.questions[100].answer).toBe(0); // Q221 familiar
    expect(B.questions[119].answer).toBe(3); // Q240 rule
  });

  it("verbatim quirks: Q174 duplicate option, five merged dash runs, three stem print-errors, straight apostrophes", () => {
    for (const [n, frag] of STEMS_LOCK) {
      expect(B.questions[n - 121].question).toContain(frag);
    }
    for (const [n, oi, frag] of OPTION_LOCKS) {
      expect(B.questions[n - 121].options[oi]).toBe(frag);
    }
    // ادغام‌ها با طولِ دقیق (رندرِ ۱۲۰۰dpi: یک خطِ پیوسته)
    const mergedExpect: [number, number][] = [[143, 21], [146, 16], [152, 19], [158, 21], [213, 18]];
    for (const [n, len] of mergedExpect) {
      const runs = B.questions[n - 121].question.match(/-{6,}/g) ?? [];
      expect(runs).toHaveLength(1);
      expect(runs[0]).toHaveLength(len);
    }
    // بعدِ ادغام هیچ سؤالی بیش از یک ران ندارد — سنزِ کامل: ۱۲۰ ران/۲۴۳۲ تیره
    const runs = B.questions.reduce(
      (s, q) => s + [...q.question.matchAll(/-{6,}/g)].length, 0);
    const total = B.questions.reduce(
      (s, q) => s + [...q.question.matchAll(/-{6,}/g)].reduce((a, m) => a + m[0].length, 0), 0);
    expect(runs).toBe(120);
    expect(total).toBe(2432);
    // چاپ‌غلط‌های stem — عینِ چاپ
    expect(B.questions[152 - 121].question).toContain("different idea,");
    expect(B.questions[213 - 121].question).toContain("It’s not health to eat");
    expect(B.questions[221 - 121].question).toContain("important to became");
    // آپستروفِ مستقیمِ لایه در سه سؤال — عینِ لایه
    for (const n of [144, 179, 202]) {
      expect(B.questions[n - 121].question).toContain("'");
    }
  });

  it("file shape after r352: 100 banks, 1706 items, unique ids, tail vector", () => {
    expect(bank.lessons).toHaveLength(100);
    const counts = bank.lessons.map((l) => l.count);
    expect(counts.reduce((a, b) => a + b, 0)).toBe(1706);
    const ids = bank.lessons.flatMap((l) => l.questions.map((q) => q.id));
    expect(new Set(ids).size).toBe(1706);
    // وکتورِ دنباله: بانکِ ۹۹ با ۱۲۰؛ بانکِ ۹۸ با ۱۲۰؛ گرامرِ ۱-۴ (r350) با ۱۰۰ در -3..-2
    const tail = bank.lessons.slice(6).map((l) => l.count);
    expect(tail.length).toBe(94);
    expect(tail.slice(-2, -1)).toEqual([120]); // بخشِ ۲ — این راند
    expect(tail.slice(-3, -2)).toEqual([120]); // بخشِ ۱ — r351
    expect(tail.slice(-4, -3)).toEqual([100]); // گرامرِ ۱-۴ — r350
    expect(tail.slice(-12, -4)).toEqual([16, 12, 13, 2, 4, 6, 6, 57]); // جامعِ چهارم + استانداردِ گرامرِ چهارم
  });
});
