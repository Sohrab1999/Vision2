import { describe, expect, it } from "vitest";
import fs from "node:fs";

// r353 — گاردِ «۳۶۰ تست واژگان درس ۱ تا ۴» بخش ۳ (سؤال ۲۴۱-۳۶۰ از ۳۶۰ — ص۱۸۹-۱۹۴، کلیدِ همان جدولِ ص۳۰۱)
// سومین و آخرینِ عضوِ گروهِ سی‌ودومِ کارتِ دهم / بانکِ ۱۰۰ — ۱۲۰ MCQ بدونِ ترجمهٔ چاپی («ترجمه» ×۰).
// داوری‌های رندر (۱۲۰۰dpi):
// صفر سؤالِ چندران در این محدوده (برخلافِ پنج‌تاییِ r352) — سنز: ۱۲۰ ران/۲۴۷۳ تیره، spanِ ۱۶-۲۴؛
// لبهٔ «آخرین سؤالِ کلِ آزمون»: گزینهٔ d سؤال Q360 در لایه جعبهٔ «Note:» خالیِ پاصفحهٔ ص۱۹۴ را می‌بلعید
// (lookahead بدونِ سؤالِ بعدی) — برش با لنگرِ Note؛ خودِ جعبهٔ خالیِ خط‌چین (الگوی r334/r338) به داده راه نیافت؛
// Q359/Q360: گزینه‌ها در لایه عمودی ولی در چاپ هم‌ردیف — options رندرِ Q360: price/agents/hosts/sites؛
// چاپ‌غلطِ stemِ Q308 «tom's new house» (tِ کوچک — عینِ چاپ)؛ کلیدِ چاپیِ Q243 «collect» (b) حاکم؛
// گریدِ کلید: بازتولیدِ برنامه‌ایِ حرف-اول از ص۳۰۱ + AGREE ۳۶۰/۳۶۰ با رکوردِ r351 (سومین استخراجِ مستقل).

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
    vocab360c?: {
      exam: string; header: string; keyPages: string; keyVerification: string;
      extractedRound: string; pattern: string; printQuirks: string[];
    };
    vocab360a?: { extractedRound: string };
    vocab360b?: { extractedRound: string };
  };
};

const bank: TBank = JSON.parse(
  fs.readFileSync("public/jozve/tests-g10.json", "utf8"),
) as unknown as TBank;

const B = bank.lessons.find((l) => l.lesson === 100)!;

// گریدِ کلیدِ چاپیِ جدولِ ص۳۰۱ (سؤال ۲۴۱-۳۶۰) — رونویسیِ گریدِ بازتولیدِ برنامه‌ایِ راند
const PRINT_KEY = (
  "c d b d c c b a a b " + "c b c c b c c b c c " + "b a c a c c a b a c " + "a a a d c b b c c b " +
  "a b a c a d c d a d " + "d c c a d b a c b d " + "c a d b a b b d b d " + "c d b c c d a a a c " +
  "b a a b b a d a b a " + "b a c b d d d a c b " + "c c d b a a c c c d " + "c d c a c c d b b d"
).split(" ");

const STEMS_LOCK: [number, string][] = [
  [241, "A: “In which ------------------- can we visit the ancient pyramids?” B: “I think Africa.”"],
  [242, "A: “What’s your advice about the nature?” B: “Never ------------------- wildlife.”"],
  [243, "Red blood cells ---------------------- carbon dioxide from body parts."],
  [249, "I work in a company that --------------------- children's books."],
  [265, "A: “What’s your favorite hobby?” B: “Going to the ---------------- and looking at the flowers.”"],
  [266, "If anyone has a better --------------------, let's hear it."],
  [300, "Everybody should be careful about his behavior in a ------------------ country."],
  [308, "I wanted to take my friend's ---------------------- to take pictures of tom's new house."],
  [351, "The film was so --------------------- that I left the cinema in the middle of it."],
  [352, "The Great Wall of China is one of the seven -------------------- of the world."],
  [359, "A: “Where the Milad Tower is ---------------------?” B: “In Tehran.”"],
  [360, "Did you know that Hamadan has many interesting historical --------------------?"],
];
const OPTION_LOCKS: [number, number, string][] = [
  [241, 2, "continent"], // کلید — رندرِ Q241
  [243, 1, "collect"], // کلیدِ چاپِ حاکم («carry» معنایی بود)
  [300, 0, "proper"], // رندرِ Q300
  [300, 3, "foreign"], // کلید
  [351, 2, "boring"], // کلید
  [352, 3, "wonders"], // کلید
  [359, 1, "located"], // رندرِ Q359 (گزینه‌های عمودیِ لایه)
  [360, 0, "price"], // رندرِ Q360 (آخرین سؤالِ آزمون)
  [360, 3, "sites"], // کلید — رندر
];

describe("jozve tests-g10 v360c (r353 — ۳۶۰ تست واژگان درس ۱ تا ۴، بخش ۳ — Q241-360, key p301)", () => {
  it("vocab360c receipt complete — family closed (a + b + c)", () => {
    expect(bank.source.vocab360c).toBeTruthy();
    const s = bank.source.vocab360c!;
    expect(s.exam).toContain("ص۱۸۹-۱۹۴");
    expect(s.exam).toContain("بخش ۳");
    expect(s.header).toContain("۳۰۱");
    expect(s.header).toContain("۲۴۱-۳۶۰");
    expect(s.keyPages).toBe("301");
    expect(s.keyVerification).toContain("360/360");
    expect(s.extractedRound).toBe("r353");
    expect(s.pattern).toContain("r352");
    expect(s.printQuirks.length).toBeGreaterThanOrEqual(8);
    expect(s.printQuirks.join(" ")).toContain("Note:"); // لبهٔ آخرین سؤال
    expect(s.printQuirks.join(" ")).toContain("360/360 AGREE"); // مقایسه با رکوردِ r351
    expect(s.printQuirks.join(" ")).toContain("tom's new house"); // چاپ‌غلطِ verbatim
    // بخش‌های ۱ و ۲ (r351/r352) همچنان سرِ جای خودشان‌اند — خانواده کامل
    expect(bank.source.vocab360a?.extractedRound).toBe("r351");
    expect(bank.source.vocab360b?.extractedRound).toBe("r352");
  });

  it("bank shape: 120 MCQ, category vocab, unique ids g10-l100-241..360, no translations, Latin purity", () => {
    expect(B.title).toBe("آموزشی/متوسط — ۳۶۰ تست واژگان درس ۱ تا ۴ — بخش ۳ از ۳ (ص۱۸۹-۱۹۴)");
    expect(B.level).toBe("آموزشی/متوسط — چهارگزینه‌ای");
    expect(B.count).toBe(120);
    expect(B.questions).toHaveLength(120);
    B.questions.forEach((q, i) => {
      expect(q.n).toBe(i + 241);
      expect(q.id).toBe(`g10-l100-${i + 241}`);
      expect(q.category).toBe("vocab");
      expect(q.options).toHaveLength(4);
      expect(q.options.every((o) => o.length > 0)).toBe(true);
      expect(q.answer).toBeGreaterThanOrEqual(0);
      expect(q.answer).toBeLessThanOrEqual(3);
      expect(q.translation).toBeUndefined(); // چاپ ترجمه ندارد — عینِ جزوه
      const body = q.question + q.options.join(" ");
      expect(/[آ-ی]/.test(body)).toBe(false); // خلوصِ لاتین
      expect(q.question).toMatch(/-{6,}/); // هر سؤال جای‌خالی دارد
    });
  });

  it("print key grid locked: 120 letters match data answers (جدولِ ص۳۰۱ — سؤال ۲۴۱-۳۶۰)", () => {
    expect(PRINT_KEY).toHaveLength(120);
    B.questions.forEach((q, i) => {
      expect("abcd"[q.answer]).toBe(PRINT_KEY[i]);
    });
    // تکیه‌گاه‌های معنایی
    expect(B.questions[0].answer).toBe(2); // Q241 continent
    expect(B.questions[1].answer).toBe(3); // Q242 destroy
    expect(B.questions[3].answer).toBe(3); // Q244 against
    expect(B.questions[23].answer).toBe(0); // Q264 arrive
    expect(B.questions[24].answer).toBe(2); // Q265 nature
    expect(B.questions[25].answer).toBe(2); // Q266 suggestion
    expect(B.questions[59].answer).toBe(3); // Q300 foreign
    expect(B.questions[110].answer).toBe(2); // Q351 boring
    expect(B.questions[111].answer).toBe(3); // Q352 wonders
    expect(B.questions[119].answer).toBe(3); // Q360 sites
  });

  it("verbatim quirks: zero multi-run (census 120 runs / 2473 dashes, span 16-24), Q308 lowercase print-error, straight apostrophes", () => {
    for (const [n, frag] of STEMS_LOCK) {
      expect(B.questions[n - 241].question).toContain(frag);
    }
    for (const [n, oi, frag] of OPTION_LOCKS) {
      expect(B.questions[n - 241].options[oi]).toBe(frag);
    }
    // سنزِ کامل: صفر سؤالِ چندران — هر سؤال دقیقاً یک ران
    const runs = B.questions.reduce(
      (s, q) => s + [...q.question.matchAll(/-{6,}/g)].length, 0);
    const total = B.questions.reduce(
      (s, q) => s + [...q.question.matchAll(/-{6,}/g)].reduce((a, m) => a + m[0].length, 0), 0);
    expect(runs).toBe(120);
    expect(total).toBe(2473);
    const lens = B.questions.flatMap((q) => [...q.question.matchAll(/-{6,}/g)].map((m) => m[0].length));
    expect(Math.min(...lens)).toBeGreaterThanOrEqual(16);
    expect(Math.max(...lens)).toBeLessThanOrEqual(24);
    // چاپ‌غلطِ عینِ چاپ — Q308 با tِ کوچک
    expect(B.questions[308 - 241].question).toContain("tom's new house");
    expect(B.questions[308 - 241].question).not.toContain("Tom's");
    // آپستروفِ مستقیمِ لایه در چهار سؤال — عینِ لایه
    for (const n of [249, 266, 308, 355]) {
      expect(B.questions[n - 241].question).toContain("'");
    }
    // کلیدِ چاپیِ Q243 — حاکم (هرگز تغییر نمی‌کند)
    expect(B.questions[243 - 241].answer).toBe(1);
  });

  it("file shape after r353: 100 banks, 1706 items, unique ids, tail vector — family closed", () => {
    expect(bank.lessons).toHaveLength(100);
    const counts = bank.lessons.map((l) => l.count);
    expect(counts.reduce((a, b) => a + b, 0)).toBe(1706);
    const ids = bank.lessons.flatMap((l) => l.questions.map((q) => q.id));
    expect(new Set(ids).size).toBe(1706);
    // وکتورِ دنباله: بانکِ ۱۰۰ با ۱۲۰؛ ۹۹ و ۹۸ با ۱۲۰؛ گرامرِ ۱-۴ (r350) با ۱۰۰ در -4..-3
    const tail = bank.lessons.slice(6).map((l) => l.count);
    expect(tail.length).toBe(94);
    expect(tail.slice(-1)).toEqual([120]); // بخشِ ۳ — این راند
    expect(tail.slice(-2, -1)).toEqual([120]); // بخشِ ۲ — r352
    expect(tail.slice(-3, -2)).toEqual([120]); // بخشِ ۱ — r351
    expect(tail.slice(-4, -3)).toEqual([100]); // گرامرِ ۱-۴ — r350
    expect(tail.slice(-12, -4)).toEqual([16, 12, 13, 2, 4, 6, 6, 57]); // جامعِ چهارم + استانداردِ گرامرِ چهارم
  });
});
