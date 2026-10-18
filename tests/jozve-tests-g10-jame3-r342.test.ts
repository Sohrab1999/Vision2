import { describe, expect, it } from "vitest";
import fs from "node:fs";

// r342 — گاردِ «آزمون جامع تشریحی درس سوم» جزوهٔ دهم (ص۱۳۵-۱۳۷، کلیدِ چاپیِ ص۲۸۱-۲۸۲)
// بیستمین گروه / هفت بانکِ ۶۷-۷۳ (الگوی r336 — بانک به ازای خانوادهٔ سکشن) — ۵۷ آیتم برای ۵۸ کلیدِ چاپی
// (S13 جای‌های ۵و۶ هم‌جمله → یک آیتمِ اسلش‌دارِ r337-D). داوری‌های رندر ۶۰۰-۱۲۰۰dpi:
// سربرگِ هفتمین «تسی یچ» با ارقامِ فارسیِ «۲۸۱ و ۲۸۲» (واصفِ «و» — یگانه در خانواده)؛
// دستورِ S2 «(یک کلمه اضافه می باشد)» اما بانک دقیقاً ۸واژه/۸جای‌خالی و کلید هر ۸ را مصرف می‌کند —
// ناسازگاریِ درونیِ چاپ (برخلافِ r336 با «heavens» اضافیِ واقعی)؛
// S6-Q3 گزینه‌های لایه به‌هم‌ریخته («. m yself c») — رندر: a. yourself / b. herself / c. myself / d. himself؛
// S11 کلیدِ رنگ‌نشانه‌ای: واژهٔ قرمزِ درونِ دیالوگِ تکرارشده (Q1 «No, I was.» با I قرمز /
// Q2 «No, my pencil is red.» با red قرمز) — نخستین کلیدِ رنگ‌نشانه‌ایِ این خانواده؛
// S1-Q2 «up» بیرونِ پرانتز اما کلیدِ چاپیِ «grow up / personality» — accepted دو شکل دارد؛
// S13 عینِ چاپ: «stay up to dated» و «the most powerful kinds on earth»؛ نشانگرِ ---(4)---ِ بین‌خطی پیوسته شد.

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
    extractedRound: string; pattern: string;
    jame3?: {
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

// کلیدهای چاپیِ ص۲۸۱-۲۸۲ (رونویسیِ رندر)
const KEYS_67 = [
  "scientists", "grow up / personality", "develop", "tries",
  "sense", "invented", "ashamed", "energetic", "weak", "possible", "strongly", "thousands",
  "weak", "translator", "solve", "novel",
];
const KEYS_68 = [
  "holy", "cradle", "inventor", "emotion",
  "success", "facts", "build", "quitted",
  "took", "was working", "herself", "don’t know",
];
const KEYS_69 = [
  "He cut himself on the broken glass.", "Lisa saw the accident when she was going to school.",
  "were", "was", "themselves", "itself",
  "myself bought it", "himself bought it", "herself washed them",
];
const KEYS_70 = ["saw/were reading", "hurt/was working", "was watching", "took/wasn’t looking", "wanted"];
const KEYS_71 = ["I", "red"];
const KEYS_72 = ["translator", "reciting", "hard", "published", "first", "passed"];
const KEYS_73 = ["develop", "success", "useful", "power", "strong/fast", "action", "skills"];

const B67 = bank.lessons.find((l) => l.lesson === 67)!;
const B68 = bank.lessons.find((l) => l.lesson === 68)!;
const B69 = bank.lessons.find((l) => l.lesson === 69)!;
const B70 = bank.lessons.find((l) => l.lesson === 70)!;
const B71 = bank.lessons.find((l) => l.lesson === 71)!;
const B72 = bank.lessons.find((l) => l.lesson === 72)!;
const B73 = bank.lessons.find((l) => l.lesson === 73)!;

describe("jozve tests-g10 jame3 (r342 آزمون جامع تشریحی درس سوم — pp135-137, key pp281-282)", () => {
  it("jame3 receipt complete: header, key pages, round, pattern, quirks", () => {
    expect(bank.source.jame3).toBeTruthy();
    const s = bank.source.jame3!;
    expect(s.exam).toContain("ص۱۳۵-۱۳۷");
    expect(s.header).toContain("۲۸۱ و ۲۸۲"); // ارقامِ فارسی با واصفِ «و» — یگانه در خانواده
    expect(s.header).toContain("۱۳۵ تا ۱۳۷");
    expect(s.header).toContain("تسی یچ"); // هفتمین تحریفِ لایه — رندر حاکم
    expect(s.header).toContain("۵۷ آیتم برای ۵۸");
    expect(s.header).toContain("۲۰ نمره");
    expect(s.keyPages).toBe("281-282");
    expect(s.keyVerification).toContain("۵۸/۵۸");
    expect(s.keyVerification).toContain("رنگِ قرمز"); // کلیدِ رنگ‌نشانه‌ایِ S11
    expect(s.keyVerification).toContain("grow up / personality");
    expect(s.extractedRound).toBe("r342");
    expect(s.pattern).toContain("r336");
    expect(s.printQuirks.length).toBeGreaterThanOrEqual(10);
    expect(s.printQuirks.some((q) => q.includes("یک کلمه اضافه"))).toBe(true); // ناسازگاریِ S2
    expect(s.printQuirks.some((q) => q.includes("heavens"))).toBe(true); // قرینهٔ r336
    expect(s.printQuirks.some((q) => q.includes("myself"))).toBe(true); // ترتیبِ گزینه‌های S6-Q3
    expect(s.printQuirks.some((q) => q.includes("stay up to dated"))).toBe(true);
    expect(s.printQuirks.some((q) => q.includes("kinds on earth"))).toBe(true);
  });

  it("seven banks shape: 16/12/9/5/2/6/7, kinds/categories/placeholders, [bank:] only on S2/S12/S13", () => {
    const all = [B67, B68, B69, B70, B71, B72, B73];
    expect(all.map((l) => l.count)).toEqual([16, 12, 9, 5, 2, 6, 7]);
    all.forEach((l) => expect(l.level).toContain("تشریحی"));
    // بانک ۶۷: ۱۶ تایپیِ vocab با [bank:] فقط روی Q5-12 (S2)
    B67.questions.forEach((q, i) => {
      expect(q.kind, q.id).toBe("typed");
      expect(q.category, q.id).toBe("vocab");
      expect(q.placeholder, q.id).toBeTruthy();
      if (i >= 4 && i <= 11) {
        expect(q.question, q.id).toContain("[bank: ashamed / strongly / possible / thousands / weak / sense / energetic / invented]");
      } else {
        expect(q.question, q.id).not.toContain("[bank:");
      }
    });
    // بانک ۶۸: ۱۲ MCQ (S4/S5 واژگان، S6 گرامر) — بدونِ kind
    B68.questions.forEach((q, i) => {
      expect(q.kind, q.id).toBeUndefined();
      expect(q.category, q.id).toBe(i < 8 ? "vocab" : "grammar");
      expect(q.options.length, q.id).toBe(4);
      expect(q.question, q.id).not.toContain("[bank:");
    });
    // بانک‌های ۶۹/۷۰/۷۱: تایپیِ grammar
    [B69, B70, B71].forEach((l) => {
      l.questions.forEach((q) => {
        expect(q.kind, q.id).toBe("typed");
        expect(q.category, q.id).toBe("grammar");
        expect(q.placeholder, q.id).toBeTruthy();
        expect(q.question, q.id).not.toContain("[bank:");
      });
    });
    // بانک‌های ۷۲/۷۳: کلوزِ تایپیِ vocab با [bank:]
    B72.questions.forEach((q) => {
      expect(q.kind, q.id).toBe("typed");
      expect(q.category, q.id).toBe("vocab");
      expect(q.question, q.id).toContain("[bank: hard / reciting / passed / published / translator / first]");
    });
    B73.questions.forEach((q) => {
      expect(q.kind, q.id).toBe("typed");
      expect(q.category, q.id).toBe("vocab");
      expect(q.question, q.id).toContain("[bank: strong / success / skills / power / action / develop / fast / useful]");
    });
  });

  it("typed keys locked to the printed grid pp281-282 (slash-spacing normalized)", () => {
    // بانک ۶۷ (۱۶ تایپی)
    B67.questions.forEach((q, i) => {
      expect(norm(q.accepted![0]), `B67-Q${i + 1}`).toBe(norm(KEYS_67[i]));
      expect(q.options[0], `B67-Q${i + 1} verbatim print key`).toBe(q.accepted![0]);
    });
    // S1-Q2: accepted دو شکل — کلیدِ چاپی + محتوای تیره («up» بیرونِ پرانتز)
    expect(B67.questions[1].accepted).toEqual(["grow up / personality", "grow / personality"]);
    // بانک ۶۹ (۹ تایپی)
    B69.questions.forEach((q, i) => {
      expect(norm(q.accepted![0]), `B69-Q${i + 1}`).toBe(norm(KEYS_69[i]));
    });
    // بانک ۷۰ (۵ تایپی — اسلش‌های چاپیِ چسبیده با فاصلهٔ یکنواخت بازسازی شد)
    B70.questions.forEach((q, i) => {
      expect(norm(q.accepted![0]), `B70-Q${i + 1}`).toBe(norm(KEYS_70[i]));
    });
    expect(B70.questions[0].accepted![0]).toBe("saw / were reading");
    expect(B70.questions[3].accepted![0]).toBe("took / wasn’t looking");
    // بانک ۷۱ (۲ تایپی — کلیدِ رنگ‌نشانه‌ای)
    B71.questions.forEach((q, i) => {
      expect(norm(q.accepted![0]), `B71-Q${i + 1}`).toBe(norm(KEYS_71[i]));
    });
    // بانک ۷۲ (۶ تایپی)
    B72.questions.forEach((q, i) => {
      expect(norm(q.accepted![0]), `B72-Q${i + 1}`).toBe(norm(KEYS_72[i]));
    });
    // بانک ۷۳ (۷ تایپی — Q5 دو کلیدِ چاپیِ ۵و۶ را می‌پوشاند)
    B73.questions.forEach((q, i) => {
      expect(norm(q.accepted![0]), `B73-Q${i + 1}`).toBe(norm(KEYS_73[i]));
    });
    expect(B73.questions[4].accepted![0]).toBe("strong / fast");
  });

  it("MCQ keys locked to the printed grid: odd-one-out + vocab + grammar word-index mapping", () => {
    B68.questions.forEach((q, i) => {
      expect(norm(q.options[q.answer]), `B68-Q${i + 1}`).toBe(norm(KEYS_68[i]));
    });
    // ترتیبِ عینِ چاپِ گزینه‌ها (لایهٔ S6-Q3 به‌هم‌ریخته بود — رندر حاکم)
    expect(B68.questions[0].options).toEqual(["winter", "summer", "holy", "fall"]);
    expect(B68.questions[10].options).toEqual(["yourself", "herself", "myself", "himself"]);
    expect(B68.questions[11].options).toEqual(["am not knowing", "wasn’t knowing", "knows", "don’t know"]);
    // سربرگِ چهارگزینه‌ایِ متعلقِ متفاوت با ارقامِ فارسیِ (۱) تا (۴)
    ["۱", "۲", "۳", "۴"].forEach((fa, i) =>
      expect(B68.questions[i].question).toContain(`متفاوت است؟ (${fa})`)
    );
  });

  it("stems verbatim from the print: incomplete parens, hint letters, dashes, markers, S11 dialogues, cloze quirks", () => {
    // S1 پرانتزهای ناقصِ عینِ چاپ (بولدِ چاپ)
    expect(B67.questions[0].question).toBe("Some (s__ient__sts) become very famous and rich.");
    expect(B67.questions[1].question).toBe("When children (gr__w) up their (person__lity) changes.");
    expect(B67.questions[2].question).toBe("This book can (d__v__lop) your speaking well.");
    expect(B67.questions[3].question).toBe("My sister (t__i__s) hard to learn English.");
    // S3 حروفِ راهنما با فاصله
    expect(B67.questions[12].question).toBe("My brother has the flu and feels (w _ _ _).");
    expect(B67.questions[13].question).toBe("A person who translates is a (t _ _ _ _ _ _ _ _).");
    expect(B67.questions[14].question).toBe("If you want to find an answer to a problem, you must (s _ _ _ _) it.");
    expect(B67.questions[15].question).toBe("A book that tells a story about people and things that are not real is a (n _ _ _ _).");
    // S2 آپاستروف‌های تایپوگرافیک
    expect(B67.questions[7].question).toContain("He’s very");
    expect(B67.questions[9].question).toContain("today’s technology");
    // S9 پیشوندهای ساقه + کلیدِ محتوای تیره
    expect(B69.questions[6].question).toContain("Nobody, I");
    expect(B69.questions[7].question).toContain("No, he");
    expect(B69.questions[8].question).toContain("No, my mother");
    // S10 پرانتزهای فعل + (not/look) با اسلشِ درونِ پرانتزِ عینِ چاپ
    expect(B70.questions[0].question).toContain("(see)");
    expect(B70.questions[3].question).toContain("(not/look)");
    // S11 دیالوگ‌های عینِ چاپ (بدونِ نشانه‌گذاری — پاسخ در کلید فقط قرمز بود)
    expect(B71.questions[0].question).toBe("A: Was your brother washing the dishes? — B: No, I was.");
    expect(B71.questions[1].question).toBe("A: Is it your pencil? — B: No, my pencil is red.");
    // S12 نشانگرها + 2001/2008
    expect(B72.questions[0].question).toContain("writer, ---(1)--- and university professor");
    expect(B72.questions[3].question).toContain("in Persian and English in 2001");
    expect(B72.questions[5].question).toContain("away in 2008 in Tehran");
    // S13 کوئیرک‌های عینِ چاپ + نشانگرِ پیوستهٔ ---(4)---
    expect(B73.questions[1].question).toContain("stay up to dated");
    expect(B73.questions[4].question).toContain("the most powerful kinds on earth");
    expect(B73.questions[4].question).toContain("as ---(5)--- as tigers");
    expect(B73.questions[4].question).toContain("as ---(6)--- as horses");
    expect(B73.questions[3].question).toContain("with the ---(4)--- of knowledge");
  });

  it("file shape: 73 banks, 905 items, unique ids", () => {
    expect(bank.grade).toBe(10);
    expect(bank.lessons).toHaveLength(88);
    expect(bank.lessons.reduce((s: number, l: { count: number }) => s + l.count, 0)).toBe(1130);
    const ids = bank.lessons.flatMap((l: TL) => l.questions.map((q: TQ) => q.id));
    expect(ids.length).toBe(1130);
    expect(new Set(ids).size).toBe(1130);
    // هفت آیتمِ جدید با الگویِ idِ خانواده
    ["g10-l67-1", "g10-l68-12", "g10-l69-9", "g10-l70-5", "g10-l71-2", "g10-l72-6", "g10-l73-7"].forEach((id) =>
      expect(ids).toContain(id)
    );
  });
});
