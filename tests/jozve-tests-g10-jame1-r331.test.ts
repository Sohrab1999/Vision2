import { describe, expect, it } from "vitest";
import fs from "node:fs";

// r331 — گاردِ «آزمون جامع تشریحی درس اول» جزوهٔ دهم (ص۶۸-۷۱، کلید چاپی ص۲۵۲-۲۵۳)
// نهمین گروه / بانک‌های ۱۸-۲۴ (۷ بانک / ۶۷ آیتم) — جامعِ ترکیبیِ چهارده‌بخشی:
// تایپی (کلمات ناقص/بانک واژه/تعریف/جمله‌سازی/سؤال‌سازیِ زیرخط‌دار/تصویر/شکل افعال) +
// MCQ (متفاوت/چهارگزینه‌ای/آهنگ افتان/دسته‌بندی/کلوز/T-F). کلید چاپی ۶۷/۶۷ صفر واگرایی.
// داوری‌ها: سربرگِ رندر حاکم «تشریحی» (لایه «تسی یچ» نویز)، z+۸ خط‌تیره = zookeeper،
// زیرخط‌های S8 (tomorrow/They/play football/will visit Qom)، S11 کلید دوتایی (۱ و ۳)،
// S13 ردیف‌های بولدِ ناهماهنگ، S14-1 «A few» کلید false.

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
    extractedRound: string; pattern: string;
    jame1?: {
      exam: string; header: string; keyPages: string; keyVerification: string;
      extractedRound: string; pattern: string; transformations: string; printQuirks: string[];
    };
  };
};

const bank: TBank = JSON.parse(
  fs.readFileSync("public/jozve/tests-g10.json", "utf8"),
) as unknown as TBank;

// —— کلیدهای چاپیِ ص۲۵۲-۲۵۳ (حرف‌به‌حرف از رندر)
// L19 — S4 متفاوت (duck/hurt/road/danger) + S5 (put/tourist/high/instead) + S6 (will/am going to/will/am going to)
const K19 = [0, 2, 2, 1, 1, 2, 0, 1, 3, 2, 0, 3];
// L22 — S11 آهنگ افتان (falling/rising/falling/rising از کلید چاپی ۱ و ۳) + S12 (idea/animal/place/thing/idea/person/place/person/animal/thing)
const K22 = [0, 1, 0, 1, 4, 1, 2, 3, 4, 0, 2, 0, 1, 3];
// L23 — کلوز استرالیا: world/home/arrived/food/hunting/land
const K23 = [2, 0, 1, 1, 3, 2];
// L24 — T/F: false/true/false/false
const K24_TF = [1, 0, 1, 1];

describe("jozve tests-g10 (r331 آزمون جامع تشریحی درس اول — pp68-71, key pp252-253)", () => {
  it("receipt jame1: exam/header/keyPages 252-253/keyVerification 67/67/round/pattern/transformations/16 quirks", () => {
    const r = bank.source.jame1!;
    expect(r.exam).toBe("آزمون جامع تشریحی درس اول (آزمون: ص۶۸ تا ۷۱)");
    expect(r.header).toContain("۱۴ بخش");
    expect(r.header).toContain("۶۷ آیتم در ۷ بانک");
    expect(r.keyPages).toBe("252-253");
    expect(r.keyVerification).toContain("67/67");
    expect(r.keyVerification).toContain("zero divergence");
    expect(r.extractedRound).toBe("r331");
    expect(r.pattern).toContain("r318");
    expect(r.transformations).toContain("per-sentence");
    expect(r.transformations).toContain("per-word");
    expect(r.printQuirks).toHaveLength(16);
    expect(r.printQuirks.some((q) => q.includes("تشریحی") && q.includes("تسی یچ"))).toBe(true);
    expect(r.printQuirks.some((q) => q.includes("A few"))).toBe(true);
  });

  it("file shape: 29 banks (r333 gram4 appended), new counts [16,12,6,7,14,6,6], levels and titles", () => {
    expect(bank.lessons).toHaveLength(98);
    expect(bank.lessons.slice(17, 24).map((l) => l.lesson)).toEqual([18, 19, 20, 21, 22, 23, 24]);
    expect(bank.lessons.slice(17, 24).map((l) => l.count)).toEqual([16, 12, 6, 7, 14, 6, 6]);
    expect(bank.lessons[17].title).toContain("کلمات ناقص، بانک واژه و تعریف‌ها (ص۶۸)");
    expect(bank.lessons[17].level).toBe("تشریحی — تایپی");
    expect(bank.lessons[18].level).toBe("تشریحی — چهارگزینه‌ای");
    expect(bank.lessons[19].title).toContain("سؤال‌سازی با زیرخط (ص۶۹)");
    expect(bank.lessons[20].title).toContain("پاسخ با تصویر و شکل افعال (ص۷۰)");
    expect(bank.lessons[21].title).toContain("آهنگ افتان و دسته‌بندی واژگان (ص۷۰)");
    expect(bank.lessons[22].title).toContain("کلوز — استرالیا (ص۷۱)");
    expect(bank.lessons[23].title).toContain("درک مطلب — دلفین (ص۷۱)");
    expect(bank.lessons[23].level).toBe("تشریحی — درست/نادرست و تایپی");
    expect(bank.lessons.reduce((s, l) => s + l.count, 0)).toBe(1466);
  });

  it("MCQ keys locked to print: L19 (12) + L22 (14) + L23 (6) + L24 T/F (4) = 36 indices", () => {
    const L = (n: number) => bank.lessons.find((l) => l.lesson === n)!;
    L(19).questions.forEach((q, i) => expect(q.answer, q.id).toBe(K19[i]));
    L(22).questions.forEach((q, i) => expect(q.answer, q.id).toBe(K22[i]));
    L(23).questions.forEach((q, i) => expect(q.answer, q.id).toBe(K23[i]));
    L(24).questions.slice(0, 4).forEach((q, i) => {
      expect(q.answer, q.id).toBe(K24_TF[i]);
      expect(q.options).toEqual(["True", "False"]);
    });
    // گزینه‌های سرنوشت‌ساز
    expect(L(19).questions[8].options).toEqual(["are going to", "will to", "are going", "will"]);
    expect(L(22).questions[4].options).toEqual(["person", "animal", "place", "thing", "idea"]);
    expect(L(23).questions[1].options).toEqual(["home", "land", "place", "plain"]);
    // MCQها kind ندارند و ترجمهٔ چاپی ندارند (این آزمون ترجمه چاپی ندارد)
    [19, 22, 23].forEach((n) => L(n).questions.forEach((q) => expect(q.kind).toBeUndefined()));
  });

  it("typed keys locked to print: 31 accepted verbatim (L18 16 + L20 6 + L21 7 + L24 2)", () => {
    const L = (n: number) => bank.lessons.find((l) => l.lesson === n)!;
    const acc = (n: number) => L(n).questions.map((q) => q.accepted);
    // S1 کلمات ناقص + S2 بانک واژه + S3 تعریف
    expect(acc(18)).toEqual([
      ["museum"], ["destroying"], ["endangered"], ["attention"],
      ["injured"], ["hurt"], ["killed"], ["save"], ["divided"], ["take care"], ["increasing"], ["hunt"],
      ["tiger"], ["zookeeper"], ["future"], ["died"],
    ]);
    // S7 جمله‌سازی + S8 سؤال‌سازی
    expect(acc(20)).toEqual([
      ["I will probably be home late tonight."],
      ["We are going to travel by train next week."],
      ["When is your father going to buy a new car?"],
      ["Who will go to a restaurant tonight?"],
      ["What are the children going to do next week?"],
      ["Where will the students visit next summer?"],
    ]);
    // S9 تصویر (سومی دو واریانت We/You از کلید چاپ «We (You)») + S10 شکل افعال
    expect(acc(21)).toEqual([
      ["He is going to help the injured bird."],
      ["They are putting out the fire."],
      ["We must take care of cheetahs.", "You must take care of cheetahs."],
      ["increases"], ["to rain"], ["visit"], ["rain"],
    ]);
    // S14 تایپی
    expect(acc(24).slice(4)).toEqual([
      ["A dolphin’s nose is on top of his head."],
      ["Yes, they are among clever animals."],
    ]);
    // همهٔ تایپی‌ها: answer=0، placeholder، options[0] = کلید چاپ (الگوی r329)
    [18, 20, 21].forEach((n) =>
      L(n).questions.forEach((q) => {
        expect(q.kind, q.id).toBe("typed");
        expect(q.answer, q.id).toBe(0);
        expect(q.placeholder, q.id).toBeTruthy();
        expect(q.accepted!.length, q.id).toBeGreaterThan(0);
      }),
    );
    L(24).questions.slice(4).forEach((q) => {
      expect(q.kind, q.id).toBe("typed");
      expect(q.answer, q.id).toBe(0);
      expect(q.placeholder, q.id).toBeTruthy();
      expect(q.accepted!.length, q.id).toBeGreaterThan(0);
    });
    expect(L(21).questions[2].options[0]).toBe("We (You) must take care of cheetahs.");
  });

  it("critical stems verbatim: S1 patterns, bank suffix, S8 underlines, S11 per-sentence, S13 blank markers, S14 statements", () => {
    const L = (n: number) => bank.lessons.find((l) => l.lesson === n)!;
    expect(L(18).questions[0].question).toBe("Mr. Azadi works in a m__s__um.");
    expect(L(18).questions[4].question).toBe(
      "My friend had an accident last night. He was --------------- badly. [bank: increasing / divided / killed / hunt / protecting / take care / hurt / injured / save]",
    );
    expect(L(18).questions[13].question).toContain("z _ _ _ _ _ _ _ _");
    expect(L(20).questions[2].question).toBe(
      "My father is going to buy a new car tomorrow. (underlined: tomorrow)",
    );
    expect(L(20).questions[5].question).toBe(
      "The students will visit Qom next summer. (underlined: will visit Qom)",
    );
    expect(L(21).questions[0].question).toBe("( help / injured ) — What is he going to do?");
    expect(L(21).questions[6].question).toBe(
      "There’s no need to take an umbrella with you. It won’t --------------- (rain).",
    );
    expect(L(22).questions[0].question).toBe(
      "آهنگ کدام جمله افتان است؟ (۱) — What are you going to do to save nature?",
    );
    expect(L(23).questions[0].question).toBe(
      "Australia is a country and is the sixth biggest country in the ---(1)---.",
    );
    expect(L(23).questions[2].question).toContain("50000 years ago");
    expect(L(24).questions[0].question).toBe("A few dolphins live in salt water oceans.");
    expect(L(24).questions[4].question).toBe("Where is a dolphin’s nose?");
  });

  it("ids unique across the whole 482-item family (r333 gram4 appended)", () => {
    const ids = bank.lessons.flatMap((l) => l.questions.map((q) => q.id));
    expect(ids.length).toBe(1466);
    expect(new Set(ids).size).toBe(1466);
    expect(ids.filter((id) => id.startsWith("g10-l18-"))).toHaveLength(16);
    expect(ids.filter((id) => id.startsWith("g10-l24-"))).toHaveLength(6);
  });
});
