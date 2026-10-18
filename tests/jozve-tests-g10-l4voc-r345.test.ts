import { describe, expect, it } from "vitest";
import fs from "node:fs";

// r345 — گاردِ «آزمون تشریحی واژگان درس چهارم» جزوهٔ دهم (ص۱۴۸-۱۵۰، کلیدِ چهار گریدِ چاپیِ ص۲۸۷):
// ① بانکِ ۷۷ «جای خالی از بانک واژه» (ص۱۴۸) — ۱۶ تایپی از دو بانکِ ۹کلمه‌ایِ چاپ (اضافه‌ها: embassy/journey)؛
//    جای‌خالیِ چسبیده به واژه در Q5/Q9/Q11 عینِ چاپ؛ Q3 «in all over the world» عینِ چاپ.
// ② بانکِ ۷۸ «کلمه با حرف اول» (ص۱۴۸) — ۸ تایپی؛ زیرخطِ چاپ در Q2 کوتاه (t+6 در برابرِ traveler هشت‌حرفی —
//    رندر ۳۰۰۰dpi؛ عینِ r323-Q7/r338)؛ بقیهٔ ۷ آیتم دقیقاً هم‌طولِ کلید.
// ③ بانکِ ۷۹ «تعریف‌ها، بنویسید» (ص۱۴۹) — ۸ تایپی؛ اضافهٔ بانک: traveler.
// ④ بانکِ ۸۰ «تست چهارگزینه‌ای» (ص۱۴۹-۱۵۰) — ۲۵ MCQ؛ Q10 جای‌خالیِ کوتاهِ ۲۱تیره‌ایِ چاپ (نرمال‌شده به
//    تیرهٔ استانداردِ خانواده — قاعدهٔ r338-MCQ14)؛ Q18 دیالوگِ A/B با گپِ سه‌فاصله‌ایِ چاپ؛
//    Q16 گزینهٔ d دوسخت‌واژه‌ایِ «more popular».
// داوری‌های رندر ۶۰۰-۳۰۰۰dpi: سربرگ «آزمون تشریحی واژگان درس چهارم» (لایه «تسی یچ» — نهمین تجزیه)؛
// سربرگِ کلید «(آزمون: صفحه ۱۴۸ تا ۱۵۰)» ارقامِ فارسیِ «تا» (لایه لاتین 148/150)؛ سبکِ گریدِ
// سکشن‌۱-۳ «1. holidays» با فاصله vs سکشن‌۴ «1.illness» بدونِ فاصله؛ جعبهٔ «Note:» خالیِ خط‌چینِ بنفش؛
// تیره‌شماری: بخش ۱ = ۱۶×۲۶ (۳ شکسته: Q3/Q9/Q14)، بخش ۳ = ۸×۲۴، بخش ۴ = ۲۳×۳۱ + Q2(۱۱+۲۰) + Q10×۲۱.
// کلید: ۵۷/۵۷ با پیش‌پرکردنِ معنایی هم‌رأی — صفر واگرایی.

type TQ = {
  id: string; n: number; category: string; kind?: string; question: string; options: string[];
  answer: number; accepted?: string[]; placeholder?: string; translation?: string;
};
type TL = { lesson: number; title: string; level: string; count: number; questions: TQ[] };
type TBank = {
  grade: number;
  lessons: TL[];
  source: {
    file: string;
    tashrihi4?: {
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

// کلیدِ چاپیِ ص۲۸۷ — بخش ۱ (۱۶) از دو گریدِ ۴×۴:
const B1_KEYS = [
  "holidays", "anything", "international", "historical", "quietly", "illness", "attractions", "behavior",
  "junk", "destination", "means", "range", "located", "generously", "pilgrims", "souvenir",
];
// بخش ۲ (۸) — گریدِ ۴×۲ (Q2 زیرخطِ کوتاه — کلیدِ گرید حاکم):
const B2_KEYS = ["international", "traveler", "louder", "airport", "sunrise", "sunset", "pyramids", "fall"];
// بخش ۳ (۸) — گریدِ ۴×۲ (اضافهٔ بانک: traveler):
const B3_KEYS = ["rule", "continent", "price", "prefer", "journey", "domestic", "range", "local"];
// بخش ۴ (۲۵) — گریدِ ۳×۸+۱ با سبکِ «1.illness» بدونِ فاصله:
const B4_KEYS = [
  "illness", "junk", "station", "experience", "similar", "holy", "desert", "popular",
  "international", "ancient", "respect", "exactly", "continent", "suggestion", "surfing", "healthier",
  "patient", "probably", "transportation", "desert", "health", "ancient", "cultures", "vacation", "probable",
];

const B77 = bank.lessons.find((l) => l.lesson === 77)!;
const B78 = bank.lessons.find((l) => l.lesson === 78)!;
const B79 = bank.lessons.find((l) => l.lesson === 79)!;
const B80 = bank.lessons.find((l) => l.lesson === 80)!;

describe("jozve tests-g10 tashrihi4 receipt (r345 آزمون تشریحی واژگان درس چهارم — pp148-150, key p287)", () => {
  it("tashrihi4 receipt complete: header, key page, round, pattern, quirks", () => {
    expect(bank.source.tashrihi4).toBeTruthy();
    const s = bank.source.tashrihi4!;
    expect(s.exam).toContain("ص۱۴۸");
    expect(s.header).toContain("تشریحی واژگان درس چهارم");
    expect(s.header).toContain("تسی یچ"); // نهمین تجزیهٔ «تشریحی»
    expect(s.keyPages).toBe("287");
    expect(s.keyVerification).toContain("۵۷/۵۷");
    expect(s.keyVerification).toContain("۱۴۸ تا ۱۵۰"); // ارقامِ فارسی با واصفِ «تا»
    expect(s.extractedRound).toBe("r345");
    expect(s.printQuirks.length).toBeGreaterThanOrEqual(9);
    expect(s.printQuirks.some((q) => q.includes("in my ear"))).toBe(true); // جای‌خالیِ چسبیده
    expect(s.printQuirks.some((q) => q.includes("all over the world"))).toBe(true); // Q3 عینِ چاپ
    expect(s.printQuirks.some((q) => q.includes("traveler"))).toBe(true); // زیرخطِ کوتاهِ Q2 + اضافهٔ بانکِ ۳
    expect(s.printQuirks.some((q) => q.includes("۲۱تیره‌ای"))).toBe(true); // MCQ-Q10 کوتاه
    expect(s.printQuirks.some((q) => q.includes("دیالوگ"))).toBe(true); // Q18 گپِ A/B
    expect(s.printQuirks.some((q) => q.includes("Telegram"))).toBe(true); // غیبتِ پاصفحه
    expect(s.printQuirks.some((q) => q.includes("Note:"))).toBe(true); // جعبهٔ خالی
    expect(s.printQuirks.some((q) => q.includes("embassy"))).toBe(true); // اضافهٔ زیربانکِ ۱
  });
});

describe("jozve tests-g10 l4voc bank 77 (r345 جای خالی از بانک واژه — p148)", () => {
  it("bank 77 shape: 16 typed fill-ins with printed bank tag, ids g10-l77-N", () => {
    expect(B77.count).toBe(16);
    expect(B77.level).toContain("تایپی");
    expect(B77.title).toContain("ص۱۴۸");
    B77.questions.forEach((q, i) => {
      expect(q.id, q.id).toBe(`g10-l77-${i + 1}`);
      expect(q.n, q.id).toBe(i + 1);
      expect(q.category, q.id).toBe("vocab");
      expect(q.kind, q.id).toBe("typed");
      expect(q.translation, q.id).toBeUndefined();
      expect(q.question, q.id).toContain("[bank: ");
      expect(q.accepted, q.id).toEqual([B1_KEYS[i]]); // کلیدِ گریدِ ص۲۸۷
      expect(q.placeholder, q.id).toContain("fill in the blank");
    });
    // بانکِ ۹کلمه‌ایِ چاپ در ساقه‌ها: زیربانکِ ۱ برای Q1-8، زیربانکِ ۲ برای Q9-16
    const BANK_A = "illness / international / behavior / quietly / attractions / embassy / historical / holidays / anything";
    const BANK_B = "pilgrims / range / junk / souvenir / means / journey / located / generously / destination";
    B77.questions.slice(0, 8).forEach((q) => expect(q.question).toContain(`[bank: ${BANK_A}]`));
    B77.questions.slice(8).forEach((q) => expect(q.question).toContain(`[bank: ${BANK_B}]`));
    // واژه‌های اضافه (embassy / journey) در هیچ accepted نیستند اما در بانکِ چاپ می‌مانند
    const accepteds = B77.questions.flatMap((q) => q.accepted!);
    expect(accepteds).not.toContain("embassy");
    expect(accepteds).not.toContain("journey");
  });

  it("bank 77 stems verbatim: attached blanks Q5/Q9/Q11 + Q3 print-grammar quirk", () => {
    // جای‌خالیِ چسبیده به واژهٔ بعدی — عینِ چاپ (رندر ۶۰۰dpi)
    expect(B77.questions[4].question).toContain("he spoke very ------------------in my ear.");
    expect(B77.questions[8].question).toContain("Why is your child eating ------------------food? It’s not good for his health.");
    expect(B77.questions[10].question).toContain("by different ------------------of travel.");
    // Q3 — «in all over the world» عینِ چاپ
    expect(B77.questions[2].question).toContain("English is the ------------------ language in all over the world.");
    // جای‌خالیِ استانداردِ ۱۸تیرهٔ خانواده در همهٔ ساقه‌ها
    B77.questions.forEach((q) => {
      const runs = [...q.question.matchAll(/-{6,}/g)].map((m) => m[0].length);
      expect(runs, q.id).toEqual([18]);
    });
    // آپاستروفِ تایپوگرافیک
    expect(B77.questions[6].question).toContain("Iran’s ------------------.");
  });

  it("bank 77 typed options = printed bank rotated by n (r338 convention)", () => {
    const A = ["illness", "international", "behavior", "quietly", "attractions", "embassy", "historical", "holidays", "anything"];
    const rot = (seq: string[], k: number) => seq.map((_, i) => seq[(i + k) % seq.length]);
    B77.questions.slice(0, 8).forEach((q, i) => expect(q.options, q.id).toEqual(rot(A, i + 1)));
  });
});

describe("jozve tests-g10 l4voc bank 78 (r345 کلمه با حرف اول — p148)", () => {
  it("bank 78 shape: 8 typed first-letter items, ids g10-l78-N, keys from grid p287", () => {
    expect(B78.count).toBe(8);
    expect(B78.level).toContain("تایپی");
    expect(B78.title).toContain("ص۱۴۸");
    B78.questions.forEach((q, i) => {
      expect(q.id, q.id).toBe(`g10-l78-${i + 1}`);
      expect(q.n, q.id).toBe(i + 1);
      expect(q.category, q.id).toBe("vocab");
      expect(q.kind, q.id).toBe("typed");
      expect(q.accepted, q.id).toEqual([B2_KEYS[i]]);
      // حرفِ اولِ پرانتز = حرفِ اولِ کلید
      const first = q.question.split("(")[1][0];
      expect(first, q.id).toBe(B2_KEYS[i][0]);
    });
  });

  it("bank 78 hint tracks: Q2 short track verbatim (t+6 vs traveler=8), others exact", () => {
    // Q2 — زیرخطِ کوتاهِ خودِ چاپ (رندر ۳۰۰۰dpi) — عینِ r323-Q7/r338
    expect(B78.questions[1].question).toBe("A person who visits a place on holiday is a (t _ _ _ _ _ _) .");
    expect(B78.questions[1].question.split("(")[1].split("_").length - 1).toBe(6);
    expect(B78.questions[1].accepted).toEqual(["traveler"]); // کلیدِ گریدِ ص۲۸۷ حاکم
    // بقیهٔ ۷ آیتم دقیقاً هم‌طولِ کلید + نقطه‌گذاریِ عینِ چاپ
    const exact = (stem: string, word: string) => stem.split("(")[1].split("_").length - 1 === word.length - 1;
    B78.questions.forEach((q, i) => {
      if (i === 1) return;
      expect(exact(q.question, B2_KEYS[i]), q.id).toBe(true);
    });
    // Q1 نقطهٔ چسبیده به business. — Q2-Q7 نقطهٔ فاصله‌دار «) .» — Q8 نقطهٔ چسبیده «(f _ _ _).»
    expect(B78.questions[0].question).toContain("(i _ _ _ _ _ _ _ _ _ _ _ _) business.");
    expect(B78.questions[4].question).toContain("(s _ _ _ _ _ _) .");
    expect(B78.questions[7].question).toBe("The part of the year between summer and winter is called (f _ _ _).");
  });
});

describe("jozve tests-g10 l4voc bank 79 (r345 تعریف‌ها، بنویسید — p149)", () => {
  it("bank 79 shape: 8 typed definitions, 9-word printed bank rotated, extra traveler", () => {
    expect(B79.count).toBe(8);
    expect(B79.level).toContain("تایپی");
    expect(B79.title).toContain("ص۱۴۹");
    const DEF = ["range", "domestic", "traveler", "continent", "price", "rule", "journey", "local", "prefer"];
    const rot = (seq: string[], k: number) => seq.map((_, i) => seq[(i + k) % seq.length]);
    B79.questions.forEach((q, i) => {
      expect(q.id, q.id).toBe(`g10-l79-${i + 1}`);
      expect(q.category, q.id).toBe("vocab");
      expect(q.kind, q.id).toBe("typed");
      expect(q.options, q.id).toEqual(rot(DEF, i)); // چرخشِ ۰-مبنا (r338)
      expect(q.accepted, q.id).toEqual([B3_KEYS[i]]);
      expect(q.question.endsWith(":"), q.id).toBe(true); // تعریف‌ها با دونقطهٔ چاپ
    });
    const accepteds = B79.questions.flatMap((q) => q.accepted!);
    expect(accepteds).not.toContain("traveler"); // اضافهٔ بانک
  });

  it("bank 79 definitions verbatim from the print", () => {
    expect(B79.questions[0].question).toBe("Something that tells you what you must or must not do:");
    expect(B79.questions[1].question).toBe("One of the seven big pieces of land in the world:");
    expect(B79.questions[7].question).toBe("Of a place near you:");
  });
});

describe("jozve tests-g10 l4voc bank 80 (r345 تست چهارگزینه‌ای — pp149-150)", () => {
  it("bank 80 shape: 25 MCQ, ids g10-l80-N, keys locked to grid p287 (index + word)", () => {
    expect(B80.count).toBe(25);
    expect(B80.level).toContain("چهارگزینه‌ای");
    expect(B80.title).toContain("ص۱۴۹-۱۵۰");
    B80.questions.forEach((q, i) => {
      expect(q.id, q.id).toBe(`g10-l80-${i + 1}`);
      expect(q.n, q.id).toBe(i + 1);
      expect(q.category, q.id).toBe("vocab");
      expect(q.options, q.id).toHaveLength(4);
      expect(q.translation, q.id).toBeUndefined(); // بدونِ ترجمهٔ چاپی (خانوادهٔ تشریحی)
      expect(norm(q.options[q.answer]), q.id).toBe(norm(B4_KEYS[i]));
    });
  });

  it("bank 80 option order verbatim from the print", () => {
    expect(B80.questions[0].options).toEqual(["souvenir", "destination", "entertainment", "illness"]);
    expect(B80.questions[15].options).toEqual(["obligation", "healthier", "similar", "more popular"]);
    expect(B80.questions[19].options).toEqual(["booklet", "embassy", "desert", "pyramid"]);
    expect(B80.questions[24].options).toEqual(["obligation", "probable", "popular", "comfortable"]);
  });

  it("bank 80 stems verbatim: Q10 normalized short blank, Q18 A/B dialogue, apostrophes", () => {
    // Q10 — جای‌خالیِ کوتاهِ ۲۱تیره‌ایِ چاپ، نرمال‌شده به تیرهٔ استانداردِ خانواده (r338-MCQ14)
    expect(B80.questions[9].question).toBe("Since ------------------ times, people have dreamed of leaving our planet and knowing about other worlds.");
    // Q18 — دیالوگ با گپِ سه‌فاصله‌ایِ چاپ
    expect(B80.questions[17].question).toBe("A: What are you going to do?   B: I don’t know. I ------------------ won’t go anywhere.");
    // Q16 — گزینهٔ d دوسخت‌واژه‌ای «more popular» (عینِ چاپ)
    expect(B80.questions[15].options[3]).toBe("more popular");
    // آپاستروفِ تایپوگرافیک
    expect(B80.questions[0].question).toContain("couldn’t come to the meeting");
    expect(B80.questions[13].question).toContain("I’d like to hear your");
    // جای‌خالیِ استانداردِ ۱۸تیره در همهٔ ۲۵ ساقه
    B80.questions.forEach((q) => {
      const runs = [...q.question.matchAll(/-{6,}/g)].map((m) => m[0].length);
      expect(runs, q.id).toEqual([18]);
    });
  });
});

describe("jozve tests-g10 file shape after r345", () => {
  it("file shape: 81 banks, 1062 items, unique ids", () => {
    expect(bank.grade).toBe(10);
    expect(bank.lessons).toHaveLength(81);
    expect(bank.lessons.reduce((s: number, l: { count: number }) => s + l.count, 0)).toBe(1062);
    const ids = bank.lessons.flatMap((l: TL) => l.questions.map((q: TQ) => q.id));
    expect(ids.length).toBe(1062);
    expect(new Set(ids).size).toBe(1062);
    expect(ids).toContain("g10-l77-1");
    expect(ids).toContain("g10-l77-16");
    expect(ids).toContain("g10-l78-8");
    expect(ids).toContain("g10-l79-8");
    expect(ids).toContain("g10-l80-1");
    expect(ids).toContain("g10-l80-25");
  });
});
