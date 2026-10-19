/**
 * r365 — گاردِ «سؤالات امتحانی درس دوم» نهم (ص۴۷-۵۰) — ۷ بانک/۲۴ آیتم از ۱۱ سکشن
 *
 * هیچ پاسخنامهٔ چاپی در جزوه برای این خانواده نیست — کلیدها استنتاجیِ مستندند:
 * مکالمه‌محور (س۲ — جملهٔ موازیِ verbatim مکالمهٔ خودِ درس)، عبارت‌محور (س۳/س۸ —
 * photo dictionary خودِ درس)، توافقِ ضمیر/نوعِ پرسش (س۴)، ساختاری (س۶/س۷/س۸ق۱).
 * ۴ سکشنِ تصویری/دوکلیدی/ترجمهٔ فارسی مستثنی و در رسید مستند شدند.
 */
import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

type Q = {
  id: string; n: number; category: string; question: string; options: string[];
  answer: number; kind?: string; accepted?: string[]; placeholder?: string; keyWhy?: string;
};
type Bank = { lesson: number; title: string; level?: string; count: number; questions: Q[] };
type Doc = { grade: number; title: string; lessons: Bank[]; source: Record<string, Record<string, unknown>> };

const g9 = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "public/jozve/tests-g9.json"), "utf-8"),
) as Doc;

const L = (n: number) => {
  const b = g9.lessons.find((x) => x.lesson === n);
  expect(b, `bank g9-l${n} missing`).toBeDefined();
  return b as Bank;
};
const q = (bn: number, n: number) => L(bn).questions[n - 1];

const rec = g9.source.g9exam2 as {
  extractedRound: string; section: string; examPages: string; keyPages: string;
  sectionsTotal: number; sectionsExtracted: number; sectionsSkipped: number; items: number;
  bankCounts: number[]; wordBank: string[]; extraWord: string; keyPolicy: string;
  derivedKeys: Record<string, string[]>; skippedSections: string[];
  printQuirkCount: number; printQuirks: string[]; lessonLexicon: Record<string, string>;
  typedNote: string;
};

describe("r365 — رسیدِ g9exam2", () => {
  it("receipt: round/sections/items/bankCounts/wordBank", () => {
    expect(rec.extractedRound).toBe("r365");
    expect(rec.section).toContain("درس دوم");
    expect(rec.sectionsTotal).toBe(11);
    expect(rec.sectionsExtracted).toBe(7);
    expect(rec.sectionsSkipped).toBe(4);
    expect(rec.items).toBe(24);
    expect(rec.bankCounts).toEqual([8, 2, 4, 2, 3, 3, 2]);
    expect(rec.wordBank).toEqual(["Standing", "book", "reservation", "enjoy", "visiting", "help", "wife", "staying", "key"]);
    expect(rec.extraWord).toBe("book");
    expect(rec.keyPages).toContain("پاسخنامهٔ چاپی");
  });

  it("receipt: کلیدهای استنتاجی با دلیل + ۴ سکشن/بخشِ مستثنی + واژنامهٔ درس", () => {
    expect(Object.keys(rec.derivedKeys).sort()).toEqual(["S2", "S3", "S4", "S5", "S6", "S7", "S8"]);
    expect(rec.derivedKeys.S2).toHaveLength(8);
    expect(rec.derivedKeys.S6).toHaveLength(3);
    // هر ۸ کلیدِ س۲ به مکالمهٔ درس لنگر خورده‌اند
    for (const w of rec.derivedKeys.S2) expect(w).toContain("لایه");
    expect(rec.skippedSections).toHaveLength(5); // س۱، س۶سطر۲/۳، س۹، س۱۰، س۱۱
    expect(rec.skippedSections.some((s) => s.includes("س۹"))).toBe(true);
    expect(rec.skippedSections.some((s) => s.includes("س۱۰"))).toBe(true);
    expect(rec.skippedSections.some((s) => s.includes("تصویری"))).toBe(true);
    expect(Object.keys(rec.lessonLexicon).length).toBeGreaterThanOrEqual(20);
    expect(rec.lessonLexicon["reservation"]).toContain("رزرو");
    expect(rec.lessonLexicon["book"]).toContain("رزرو کردن");
    expect(rec.typedNote).toContain("تک‌گزینه‌ای");
  });
});

describe("r365 — شکلِ هفت بانکِ امتحانی درس دوم", () => {
  it("counts: [8,2,4,2,3,3,2] — id یکتا در کلِ فایل (۱۹۳)", () => {
    expect([16, 17, 18, 19, 20, 21, 22].map((n) => L(n).count)).toEqual([8, 2, 4, 2, 3, 3, 2]);
    const ids = g9.lessons.flatMap((b) => b.questions.map((x) => x.id));
    expect(ids).toHaveLength(193);
    expect(new Set(ids).size).toBe(193);
  });

  it("س۲ بانک‌واژهٔ هتل: هر داربست از واژه‌های خودِ بانک چاپی + کلیدهای مکالمه‌محور", () => {
    const bank = rec.wordBank.map((w) => w.toLowerCase()); // چاپِ «Standing» بزرگ است؛ تایپِ یادگیرنده کوچک
    for (const x of L(16).questions) {
      expect(x.kind).toBe("typed");
      expect(x.options).toHaveLength(2);           // قفلِ تک‌گزینه‌ایِ ممنوعِ r363
      expect(x.options[0]).toBe(x.accepted?.[0]);  // کلید در سرِ گزینه‌ها
      for (const o of x.options) expect(bank).toContain(o.toLowerCase()); // داربست هم از بانکِ چاپی
      expect(x.keyWhy).toContain("لایه");
    }
    expect(q(16, 1).accepted).toEqual(["help"]);
    expect(q(16, 2).accepted).toEqual(["reservation"]);
    expect(q(16, 2).options).toEqual(["reservation", "book"]); // تلهٔ واژهٔ اضافی
    expect(q(16, 3).options).toEqual(["staying", "standing"]); // جفتِ آوایی
    expect(q(16, 6).question).toBe("B: she’s ------- by the table.");
    expect(q(16, 7).accepted).toEqual(["key"]);
    expect(q(16, 8).accepted).toEqual(["enjoy"]);
  });

  it("س۳ فعلِ مناسب: داربست = شکلِ سادهٔ فعل (خطای کلاسیکِ استمراری)", () => {
    expect(q(17, 1).question).toBe("He ------- the reservation form.");
    expect(q(17, 1).accepted).toEqual(["is filling out", "is filling"]);
    expect(q(17, 1).options).toEqual(["is filling out", "fill out"]);
    expect(q(17, 2).question).toBe("I ------- the time table.");
    expect(q(17, 2).accepted).toEqual(["am checking"]);
    expect(q(17, 2).options).toEqual(["am checking", "check"]);
  });

  it("س۴ وصل‌کردنی: پنج گزینهٔ چاپیِ مشترک + کلیدِ توافقِ ضمیر/نوعِ پرسش", () => {
    const opts = ["Paul.", "No, he is working with the computer.", "Yes, she is.", "He’s checking the map.", "No, they are boarding the plane."];
    expect(q(18, 1).question).toBe("Is Kate reading a guide book? ( ------- )");
    expect(q(18, 1).options).toEqual(opts);
    expect([1, 2, 3, 4].map((n) => q(18, n).answer)).toEqual([2, 3, 4, 0]);
    expect(q(18, 4).question).toBe("Who is speaking to the teacher now? ( ------- )");
  });

  it("س۵ ناهماهنگ: person/غیرِperson + of-ساختِ شخص", () => {
    expect(q(19, 1).options).toEqual(["shopkeeper", "tourist", "check in", "teacher"]);
    expect(q(19, 1).answer).toBe(2);
    expect(q(19, 2).options).toEqual(["the wheels of the car", "the shirt of the Jack", "the legs of the chair", "the door of the class"]);
    expect(q(19, 2).answer).toBe(1);
  });

  it("س۶ شکلِ فشرده/سوالی/منفی: تبدیلِ نحویِ یکتا با برچسبِ چاپیِ انگلیسی", () => {
    expect(q(20, 1).question).toBe("They are speaking Arabic. (Contracted form: -------)");
    expect(q(20, 1).accepted).toEqual(["They’re speaking Arabic"]);
    expect(q(20, 2).accepted).toEqual(["Are they speaking Arabic?"]);
    expect(q(20, 3).accepted).toEqual(["They are not speaking Arabic.", "They aren’t speaking Arabic.", "They’re not speaking Arabic."]);
    for (const x of L(20).questions) expect(x.options[1]).toBe("They are speaking Arabic"); // داربست: جملهٔ ساده
  });

  it("س۷ مرتب‌کردن: تنها یک چینشِ دستوری + داربستِ ردیفِ به‌هم‌ریخته", () => {
    expect(q(21, 1).question).toBe("am, into, going, gift, I, the, shop.");
    expect(q(21, 1).accepted).toEqual(["I am going into the gift shop."]);
    expect(q(21, 2).accepted).toEqual(["Is Mohammad searching for a hotel in Mashhad?"]);
    expect(q(21, 3).accepted).toEqual(["Is it a beautiful country?"]);
    for (const x of L(21).questions) {
      expect(x.kind).toBe("typed");
      expect(x.options).toHaveLength(2);
      expect(x.options[0]).toBe(x.accepted?.[0]);
    }
  });

  it("س۸ گزینهٔ صحیح: کلیدِ ساختاری (is buying) + هم‌نشینیِ check the passport", () => {
    expect(q(22, 1).options).toEqual(["buy", "is buy", "buying", "is buying"]);
    expect(q(22, 1).answer).toBe(3);
    expect(q(22, 2).options).toEqual(["is praying", "is checking", "is playing", "is landing"]);
    expect(q(22, 2).answer).toBe(1);
  });

  it("خلوصِ لاتین: بانک‌های ۱۶-۲۲ هیچ نویسهٔ فارسی ندارند (برچسب‌های چاپیِ س۴/س۶ انگلیسی‌اند)", () => {
    for (const bn of [16, 17, 18, 19, 20, 21, 22])
      for (const x of L(bn).questions) {
        expect(x.question, x.id).not.toMatch(/[\u0600-\u06FF]/);
        for (const o of x.options) expect(o, x.id).not.toMatch(/[\u0600-\u06FF]/);
        if (x.accepted) for (const a of x.accepted) expect(a, x.id).not.toMatch(/[\u0600-\u06FF]/);
        if (x.placeholder) expect(x.placeholder, x.id).not.toMatch(/[\u0600-\u06FF]/);
      }
  });

  it("قفلِ سراسریِ r363 ادامه دارد: هیچ تایپیِ تک‌گزینه‌ای در g9", () => {
    const bad = g9.lessons.flatMap((b) => b.questions)
      .filter((x) => x.kind === "typed" && x.options.length < 2);
    expect(bad.map((x) => x.id)).toEqual([]);
  });
});
