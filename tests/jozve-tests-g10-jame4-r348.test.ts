import { describe, expect, it } from "vitest";
import fs from "node:fs";

// r348 — گاردِ «آزمون جامع تشریحی درس چهارم» جزوهٔ دهم (ص۱۶۴-۱۶۶، کلیدِ چاپیِ ص۲۹۳-۲۹۴)
// هفتمین گروهِ جامع / هفت بانکِ ۸۹-۹۵ (الگوی r342 — بانک به ازای خانوادهٔ سکشن) — ۵۹ آیتم برای ۶۰ جایِ کلیدِ چاپی
// (S9-Q1 دوجای‌خالیِ «speak / hear»). داوری‌های رندرِ ۱۲۰۰dpi + get_drawings:
// سربرگِ هشتمین «تسی یچ» + «(پاسخنامه صفحه: ۲۹۳ - ۲۹۴)» ارقامِ فارسی با دونقطه (الگوی r347)؛
// سربرگِ کلید «(آزمون: صفحه ۱۶۴ تا ۱۶۶)» با «تا» (الگوی jame3)؛
// S10 کلیدِ زیرخطِ سرخِ دوبخشی: هر دو عبارتِ اسمیِ هر سطر سرخِ ضخیمِ زیرخط‌دار است
// («The newspaper» + «the magazine» / «New York» + «Los Angeles») — سؤالِ «کدام کلمات» جمع است —
// دومین کلیدِ رنگ‌نشانه‌ایِ این خانواده بعد از r342-S11؛
// S2 این بار واژهٔ اضافهٔ واقعی دارد (choice) — برخلافِ jame3 که ۸/۸ بود؛
// S6-Q4 «23th August 1998» چاپ‌غلطِ ترتیبی عینِ چاپ؛ S6-Q3 «c. on/ at» بدونِ فاصله؛
// S7-Q2 «you» دوبار در گروهِ کلمات (۹ واژه برای ۸ واژهٔ کلید)؛ کلیدِ S8 واژهٔ غلطِ سرخِ زیرخط‌دار + پرانتزِ سرخ؛
// کلیدِ S12-Q2 «On» سرکوته — یگانه سرکوتهٔ سکشن.

type TQ = {
  id: string; n: number; category: string; question: string; options: string[];
  answer: number; kind?: string; accepted?: string[]; placeholder?: string;
};
type TL = { lesson: number; title: string; level: string; count: number; questions: TQ[] };
type TBank = {
  grade: number;
  lessons: TL[];
  source: {
    file: string; exam: string; sections?: unknown; keyPages: string; keyVerification: string;
    extractedRound: string; pattern: string;
    jame3?: unknown;
    jame4?: {
      exam: string; header: string; keyPages: string; keyVerification: string;
      extractedRound: string; pattern: string; printQuirks: string[];
    };
  };
};

const bank: TBank = JSON.parse(
  fs.readFileSync("public/jozve/tests-g10.json", "utf8"),
) as unknown as TBank;

// نرمال‌سازیِ موتورِ تایپی (typed-answer.ts): کوچک‌سازی + آپاستروف + اسلش→فاصله + فروپاشیِ فاصله
const norm = (s: string) =>
  s.toLowerCase().replaceAll("’", "'").replaceAll("/", " ")
    .split(/\s+/).filter(Boolean).join(" ");

// کلیدهای چاپیِ ص۲۹۳-۲۹۴ (رونویسیِ رندر)
const KEYS_89 = [
  "familiar", "website", "safely", "billion",
  "behavior", "seem", "local", "attractive", "suitably", "cultures", "respect", "comfortably",
  "pilgrim", "agent", "paradise", "Domestic",
];
const KEYS_90 = ["Egypt", "tourist", "real", "Beijing", "image", "culture", "passport", "traditional", "can’t", "should", "on / in front of", "at / on / in"];
const KEYS_91 = [
  "You must be careful with this knife.", "You should always watch the ball when you play tennis.",
  "patiently", "speak", "well", "in", "of", "come",
  "speak / hear", "early", "help", "badly", "politely",
];
const KEYS_92 = ["The newspaper / the magazine", "New York / Los Angeles"];
const KEYS_93 = ["c", "d", "b", "a"]; // حروفِ کلیدِ چاپی برای range/domestic/international/prefer
const KEYS_94 = ["at", "On", "in", "at", "at", "in"];
const KEYS_95 = [0, 1, 1, 0, 1, 1]; // true/false/false/true/false/false

const B89 = bank.lessons.find((l) => l.lesson === 89)!;
const B90 = bank.lessons.find((l) => l.lesson === 90)!;
const B91 = bank.lessons.find((l) => l.lesson === 91)!;
const B92 = bank.lessons.find((l) => l.lesson === 92)!;
const B93 = bank.lessons.find((l) => l.lesson === 93)!;
const B94 = bank.lessons.find((l) => l.lesson === 94)!;
const B95 = bank.lessons.find((l) => l.lesson === 95)!;

describe("jozve tests-g10 jame4 (r348 آزمون جامع تشریحی درس چهارم — pp164-166, key pp293-294)", () => {
  it("jame4 receipt complete: header, key pages, round, pattern, quirks", () => {
    expect(bank.source.jame4).toBeTruthy();
    const s = bank.source.jame4!;
    expect(s.exam).toContain("ص۱۶۴-۱۶۶");
    expect(s.header).toContain("۲۹۳ - ۲۹۴"); // ارقامِ فارسی با دونقطه — الگوی r347
    expect(s.header).toContain("۱۶۴ تا ۱۶۶"); // سربرگِ کلید با «تا» — الگوی jame3
    expect(s.header).toContain("تسی یچ"); // هشتمین تحریفِ لایه — رندر حاکم
    expect(s.header).toContain("۵۹ آیتم برای ۶۰");
    expect(s.header).toContain("۲۰ نمره");
    expect(s.keyPages).toBe("293-294");
    expect(s.keyVerification).toContain("۵۹/۵۹");
    expect(s.keyVerification).toContain("زیرخطِ سرخِ دوبخشی"); // کلیدِ S10
    expect(s.keyVerification).toContain("On");
    expect(s.extractedRound).toBe("r348");
    expect(s.pattern).toContain("r342");
    expect(s.printQuirks.length).toBeGreaterThanOrEqual(14);
    expect(s.printQuirks.some((q) => q.includes("23th"))).toBe(true);
    expect(s.printQuirks.some((q) => q.includes("on/ at"))).toBe(true); // فاصلهٔ ناهمگونِ خودِ چاپ
    expect(s.printQuirks.some((q) => q.includes("choice"))).toBe(true); // واژهٔ اضافهٔ واقعی
    expect(s.printQuirks.some((q) => q.includes("you» را دوبار"))).toBe(true); // S7-Q2
    expect(s.printQuirks.some((q) => q.includes("true or false"))).toBe(true); // حذفِ برچسب به الگوی بانک ۲۴
  });

  it("seven banks shape: 16/12/13/2/4/6/6, kinds/categories/placeholders, [bank:] only on S2", () => {
    const all = [B89, B90, B91, B92, B93, B94, B95];
    expect(all.map((l) => l.count)).toEqual([16, 12, 13, 2, 4, 6, 6]);
    all.forEach((l) => expect(l.level).toContain("تشریحی"));
    // بانک ۸۹: ۱۶ تایپیِ vocab با [bank:] فقط روی Q5-12 (S2)
    B89.questions.forEach((q, i) => {
      expect(q.kind, q.id).toBe("typed");
      expect(q.category, q.id).toBe("vocab");
      expect(q.placeholder, q.id).toBeTruthy();
      if (i >= 4 && i <= 11) {
        expect(q.question, q.id).toContain("[bank: comfortably / seem / suitably / respect / choice / attractive / cultures / behavior / local]");
      } else {
        expect(q.question, q.id).not.toContain("[bank:");
      }
    });
    // بانک ۹۰: ۱۲ MCQ (S4/S5 واژگان، S6 گرامر) — بدونِ kind
    B90.questions.forEach((q, i) => {
      expect(q.kind, q.id).toBeUndefined();
      expect(q.category, q.id).toBe(i < 8 ? "vocab" : "grammar");
      expect(q.options.length, q.id).toBe(4);
      expect(q.question, q.id).not.toContain("[bank:");
    });
    // بانک‌های ۹۱/۹۲/۹۴: تایپیِ grammar
    [B91, B92, B94].forEach((l) => {
      l.questions.forEach((q) => {
        expect(q.kind, q.id).toBe("typed");
        expect(q.category, q.id).toBe("grammar");
        expect(q.placeholder, q.id).toBeTruthy();
      });
    });
    // بانک ۹۳: چهارگزینه‌ایِ وصلِ تعریف — هر ۴ آیتم با آرایهٔ تعاریفِ عینِ چاپ
    B93.questions.forEach((q) => {
      expect(q.kind, q.id).toBeUndefined();
      expect(q.category, q.id).toBe("vocab");
      expect(q.options, q.id).toEqual([
        "like one thing or person better than another",
        "between different countries",
        "different things of the same kind",
        "relating to one country",
      ]);
    });
    // بانک ۹۵: دونگزینه‌ایِ True/False — به الگوی بانک ۲۴
    B95.questions.forEach((q) => {
      expect(q.kind, q.id).toBeUndefined();
      expect(q.category, q.id).toBe("vocab");
      expect(q.options, q.id).toEqual(["True", "False"]);
    });
  });

  it("typed keys locked to the printed grid pp293-294 (slash-spacing normalized)", () => {
    // بانک ۸۹ (۱۶ تایپی)
    B89.questions.forEach((q, i) => {
      expect(norm(q.accepted![0]), `B89-Q${i + 1}`).toBe(norm(KEYS_89[i]));
      expect(q.options[0], `B89-Q${i + 1} verbatim print key`).toBe(q.accepted![0]);
    });
    // کلیدِ حرفِ اولِ Q16 سرکوته‌دارِ چاپ: «Domestic» — آغازِ جمله
    expect(B89.questions[15].accepted![0]).toBe("Domestic");
    // بانک ۹۱ (۱۳ تایپی — جمله‌سازی/اصلاح/شکل)
    B91.questions.forEach((q, i) => {
      expect(norm(q.accepted![0]), `B91-Q${i + 1}`).toBe(norm(KEYS_91[i]));
    });
    // Q9 دوجای‌خالی با کلیدِ چاپیِ «speak / hear»
    expect(B91.questions[8].accepted![0]).toBe("speak / hear");
    // بانک ۹۲ (۲ تایپی — کلیدِ زیرخطِ سرخِ دوبخشی: هر دو عبارتِ اسمی)
    B92.questions.forEach((q, i) => {
      expect(norm(q.accepted![0]), `B92-Q${i + 1}`).toBe(norm(KEYS_92[i]));
    });
    expect(B92.questions[0].accepted![0]).toBe("The newspaper / the magazine");
    expect(B92.questions[1].accepted![0]).toBe("New York / Los Angeles");
    // بانک ۹۴ (۶ تایپی — «On» سرکوته‌دارِ چاپ عینِ کلید)
    B94.questions.forEach((q, i) => {
      expect(norm(q.accepted![0]), `B94-Q${i + 1}`).toBe(norm(KEYS_94[i]));
    });
    expect(B94.questions[1].accepted![0]).toBe("On");
  });

  it("MCQ keys locked to the printed grid: odd-one-out + vocab + grammar + matching + true/false", () => {
    // بانک ۹۰: نگاشتِ واژه‌ای
    const WORDS_90 = ["Egypt", "tourist", "real", "Beijing", "image", "culture", "passport", "traditional", "can’t", "should", "on / in front of", "at / on / in"];
    B90.questions.forEach((q, i) => {
      expect(norm(q.options[q.answer]), `B90-Q${i + 1}`).toBe(norm(WORDS_90[i]));
    });
    // ترتیبِ عینِ چاپِ گزینه‌ها (S6-Q3 با «on/ at» بدونِ فاصله)
    expect(B90.questions[10].options).toEqual(["at / on", "in / next to", "on/ at", "on / in front of"]);
    expect(B90.questions[11].options).toEqual(["at / on / in", "in / on / at", "at / in / on", "on / at / in"]);
    // سربرگِ متفاوت با ارقامِ فارسیِ (۱) تا (۴)
    ["۱", "۲", "۳", "۴"].forEach((fa, i) =>
      expect(B90.questions[i].question).toContain(`متفاوت است؟ (${fa})`)
    );
    // بانک ۹۳: نگاشتِ حرفِ کلیدِ چاپی به اندیسِ تعریف (a=0,b=1,c=2,d=3)
    const LETTER_IDX: Record<string, number> = { a: 0, b: 1, c: 2, d: 3 };
    B93.questions.forEach((q, i) => {
      expect(q.answer, `B93-Q${i + 1}`).toBe(LETTER_IDX[KEYS_93[i]]);
    });
    // بانک ۹۵: شش true/false
    B95.questions.forEach((q, i) => {
      expect(q.answer, `B95-Q${i + 1}`).toBe(KEYS_95[i]);
    });
  });

  it("stems verbatim from the print: parens, hint letters, dash runs, markers, S10 dialogues, cloze passage", () => {
    // S1 پرانتزهای ناقصِ عینِ چاپ (سرمه‌ای/سبز در رندر)
    expect(B89.questions[0].question).toBe("We should become (fam__li__r) with our destination before our trip.");
    expect(B89.questions[3].question).toBe("Around one (b__lli__n) people live in India.");
    // S2 تیره‌های ۲۶تایی + آپاستروفِ تایپوگرافیک
    expect(B89.questions[5].question).toContain("but he didn’t -------------------------- to notice.");
    // S3 حروفِ راهنما با فاصله
    expect(B89.questions[12].question).toBe("A person who travels to a holy place for religious reasons is a p _ _ _ _ _ _.");
    expect(B89.questions[15].question).toBe("D _ _ _ _ _ _ _ flights are cheaper than international flights.");
    // S5 تیره‌های ۲۹تایی
    expect(B90.questions[4].question).toContain(`the ${"-".repeat(29)} of our city`);
    // S6 تیره‌ها: ۲۹ / ۲۳ / ۲۰+۱۹ / ۲۰+۲۰+۲۰ و «23th» عینِ چاپ
    expect(B90.questions[8].question).toContain(`We ${"-".repeat(29)} take them inside.`);
    expect(B90.questions[9].question).toContain(`You ${"-".repeat(23)} do your homework`);
    expect(B90.questions[10].question).toContain(`sitting ${"-".repeat(20)} the floor ${"-".repeat(19)} the TV`);
    expect(B90.questions[11].question).toContain(`Friday 23th August 1998.`);
    expect((B90.questions[11].question.match(/-{20}/g) ?? []).length).toBe(3);
    // S7 گروهِ کلمات با «you» دوبار
    expect(B91.questions[0].question).toBe("careful / this / be / you / knife / must / with.");
    expect(B91.questions[1].question).toBe("should / you / you / the ball / when / watch / play / always / tennis.");
    // S8 پرانتزِ ۲۵تیرهٔ خالی
    expect(B91.questions[2].question).toBe(`They are waiting patient for the bus. (${"-".repeat(25)})`);
    expect(B91.questions[7].question).toContain(`My friend may not comes to see me on Friday. (${"-".repeat(25)})`);
    // S9 پرانتزِ فعل + دوجای‌خالیِ Q9
    expect(B91.questions[8].question).toBe(`Can you ${"-".repeat(25)} (speak) a little louder? We can’t ${"-".repeat(25)} (hear) you.`);
    expect(B91.questions[12].question).toContain("(polite).");
    // S10 دیالوگ‌های عینِ چاپ (بدونِ نشانه‌گذاری — پاسخ زیرخطِ سرخِ کلید است)
    expect(B92.questions[0].question).toBe("Which one should I read? The newspaper or the magazine?");
    expect(B92.questions[1].question).toBe("Is the Statue of Liberty in New York or Los Angeles?");
    // S12 نشانگرهای (---N---) + جملهٔ مشترکِ ۲-۴
    expect(B94.questions[0].question).toBe("I work (---1---) night on weekends.");
    expect(B94.questions[1].question).toBe(B94.questions[2].question);
    expect(B94.questions[2].question).toBe(B94.questions[3].question);
    expect(B94.questions[3].question).toContain("(---2---) Thursdays and Fridays");
    expect(B94.questions[3].question).toContain("(---3---) the evening, usually (---4---) 8:45 or 8:50.");
    expect(B94.questions[4].question).toContain("start work (---5---) midnight.");
    expect(B94.questions[5].question).toContain("Early (---6---) the morning, usually around 5:00 A.M.");
    // S13 پیشوندِ کشور + جمله‌های عینِ چاپ
    expect(B95.questions[0].question).toBe("In the United States: Some young adults share apartments with roommates.");
    expect(B95.questions[3].question).toBe("In Hong Kong: Few young people live alone.");
    expect(B95.questions[5].question).toBe("In Hong Kong: Most young married couples have enough money to live in their own apartments.");
  });

  it("file shape: 96 banks, 1246 items, unique ids", () => {
    expect(bank.grade).toBe(10);
    expect(bank.lessons).toHaveLength(96);
    expect(bank.lessons.reduce((s: number, l: { count: number }) => s + l.count, 0)).toBe(1246);
    const ids = bank.lessons.flatMap((l: TL) => l.questions.map((q: TQ) => q.id));
    expect(ids.length).toBe(1246);
    expect(new Set(ids).size).toBe(1246);
    // هفت آیتمِ جدید با الگویِ idِ خانواده
    ["g10-l89-1", "g10-l90-12", "g10-l91-13", "g10-l92-2", "g10-l93-4", "g10-l94-6", "g10-l95-6"].forEach((id) =>
      expect(ids).toContain(id)
    );
  });
});
