/**
 * r364 — گاردِ «سؤالات امتحانی درس اول» نهم (ص۳۱-۳۳) — ۷ بانک/۲۹ آیتم از ۱۵ سکشن
 *
 * هیچ پاسخنامهٔ چاپی در جزوه برای این خانواده نیست — کلیدها استنتاجیِ مستندند:
 * ساختاری (س۶/س۱۱)، لغت‌نامه‌محور (س۲/س۷/س۹)، توافقِ ضمیر/نوعِ پرسش (س۱۴).
 * ۸ سکشنِ تصویری/آهنگی/تولیدِ آزاد/ابهامِ دوکلیدی مستثنی و در رسید مستند شدند.
 */
import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

type Q = {
  id: string; n: number; category: string; question: string; options: string[];
  answer: number; kind?: string; accepted?: string[]; placeholder?: string; translation?: string;
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

const rec = g9.source.g9exam1 as {
  extractedRound: string; section: string; examPages: string; keyPages: string;
  sectionsTotal: number; sectionsExtracted: number; sectionsSkipped: number; items: number;
  bankCounts: number[]; keyPolicy: string;
  derivedKeys: Record<string, string[]>;
  skippedSections: string[]; printQuirkCount: number; printQuirks: string[];
  lessonLexicon: Record<string, string>; typedNote: string;
};

describe("r364 — رسیدِ g9exam1", () => {
  it("receipt: round/sections/items/bankCounts", () => {
    expect(rec.extractedRound).toBe("r364");
    expect(rec.section).toContain("درس اول");
    expect(rec.sectionsTotal).toBe(15);
    expect(rec.sectionsExtracted).toBe(7);
    expect(rec.sectionsSkipped).toBe(8);
    expect(rec.items).toBe(29);
    expect(rec.bankCounts).toEqual([4, 2, 4, 3, 7, 5, 4]);
  });

  it("receipt: کلیدهای استنتاجی با دلیل + ۸ سکشنِ مستثنی + واژنامهٔ درس", () => {
    expect(Object.keys(rec.derivedKeys).sort()).toEqual(["S14", "S7", "S9"]);
    expect(rec.derivedKeys.S9).toHaveLength(7);
    expect(rec.derivedKeys.S14).toHaveLength(4);
    expect(rec.skippedSections).toHaveLength(5); // پنج ردیف: س۱، س۳+س۱۲، س۵+س۱۵، س۸، س۱۰
    expect(rec.skippedSections.some((s) => s.includes("س۸"))).toBe(true);
    expect(rec.skippedSections.some((s) => s.includes("س۱۰"))).toBe(true);
    expect(Object.keys(rec.lessonLexicon)).toHaveLength(27);
    expect(rec.lessonLexicon["Cruel"]).toBe("بی‌رحم");
    expect(rec.keyPages).toContain("پاسخنامهٔ چاپی");
  });

  it("بانک‌های امتحانی: گزینه‌ها لاتین‌محض — ساقه‌ها فقط با برچسبِ چاپیِ س۴ فارسی دارند", () => {
    for (const bn of [9, 10, 11, 12, 13, 14, 15])
      for (const x of L(bn).questions) {
        for (const o of x.options) expect(o, x.id).not.toMatch(/[\u0600-\u06FF]/);
        if (x.accepted) for (const a of x.accepted) expect(a, x.id).not.toMatch(/[\u0600-\u06FF]/);
        if (bn !== 10) expect(x.question, x.id).not.toMatch(/[\u0600-\u06FF]/);
      }
  });
});

describe("r364 — شکلِ هفت بانکِ امتحانی", () => {
  it("counts: [4,2,4,3,7,5,4] — id یکتا در کلِ فایل (۱۴۱)", () => {
    expect([9, 10, 11, 12, 13, 14, 15].map((n) => L(n).count)).toEqual([4, 2, 4, 3, 7, 5, 4]);
    const ids = g9.lessons.flatMap((b) => b.questions.map((x) => x.id));
    expect(ids).toHaveLength(141);
    expect(new Set(ids).size).toBe(141);
  });

  it("س۲ متضاد: کلیدها از واژنامهٔ درس — lazy سه‌واریانتی، Happy دوگانه", () => {
    expect(q(9, 1).question).toBe("Kind: -------");
    expect(q(9, 1).accepted).toEqual(["cruel"]);
    expect(q(9, 2).accepted).toEqual(["hard working", "hardworking", "hard-working"]);
    expect(q(9, 3).accepted).toEqual(["upset", "sad"]);
    expect(q(9, 4).accepted).toEqual(["quiet"]);
    for (const x of L(9).questions) {
      expect(x.kind).toBe("typed");
      expect(x.options.length).toBe(2);          // قفلِ تک‌گزینه‌ایِ ممنوعِ r363
      expect(x.options[0]).toBe(x.accepted?.[0]);
    }
  });

  it("س۴ سوالی/منفی: تبدیلِ نحویِ یکتا با برچسبِ چاپی", () => {
    expect(q(10, 1).question).toBe("Mina is hard working. (سوالی : -------)");
    expect(q(10, 1).accepted).toEqual(["Is Mina hard working?"]);
    expect(q(10, 2).question).toBe("Mina is hard working. (منفی: -------)");
    expect(q(10, 2).accepted).toEqual(["Mina is not hard working.", "Mina isn’t hard working."]);
  });

  it("س۶ there is/are: کلیدِ ساختاری is/is/are/are + چاپ‌غلطِ deask", () => {
    expect(q(11, 1).question).toContain("------- some pens on the deask.");
    expect(q(11, 1).options).toEqual(["There is", "There are"]);
    expect([1, 2, 3, 4].map((n) => q(11, n).accepted?.[0])).toEqual([
      "There are", "There is", "There is", "There are",
    ]);
    expect([1, 2, 3, 4].map((n) => q(11, n).answer)).toEqual([1, 0, 0, 1]);
  });

  it("س۷ گزینه صحیح: گزینه‌های چاپی verbatim + کلیدهای استنتاجی", () => {
    expect(q(12, 1).question).toBe("My sister is ------- she is not quiet.");
    expect(q(12, 1).options).toEqual(["neat", "talkative", "kind", "pleasant"]);
    expect(q(12, 1).answer).toBe(1);
    expect(q(12, 2).question).toBe("Sina is ------- Everybody likes him.");
    expect(q(12, 2).answer).toBe(3);
    expect(q(12, 3).options).toEqual(["a", "some", "an", "6"]);
    expect(q(12, 3).answer).toBe(2);
  });

  it("س۹ ناهماهنگ: هفت سطر با جداکنندهٔ چاپی — س۹-۵ چهار واژه", () => {
    expect(q(13, 1).question).toBe("serious – help – quiet – neat");
    expect(q(13, 1).answer).toBe(1);
    expect(q(13, 5).options).toEqual(["office", "library", "company", "homework"]);
    expect(q(13, 5).answer).toBe(3);
    expect([1, 2, 3, 4, 5, 6, 7].map((n) => q(13, n).answer)).toEqual([1, 2, 1, 3, 3, 0, 2]);
  });

  it("س۱۱ am/is/are: کلیدِ ساختاری + ق۵ جمله‌آغازین «Is»", () => {
    expect(q(14, 5).question).toBe("------- Zahra careless?");
    expect(q(14, 5).accepted).toEqual(["Is"]);
    expect(q(14, 5).options).toEqual(["am", "is", "are"]);
    expect([1, 2, 3, 4, 5].map((n) => q(14, n).accepted?.[0])).toEqual(["are", "is", "am", "are", "Is"]);
  });

  it("س۱۴ وصل‌شدنی: پنج گزینهٔ چاپیِ مشترک + کلیدِ توافقِ ضمیر", () => {
    const opts = ["Yes, he is.", "She is a careful girl.", "I`m brave.", "No, she isn`t.", "No, we are not."];
    expect(q(15, 1).question).toBe("Are you angry? ( ------- )");
    expect(q(15, 1).options).toEqual(opts);
    expect([1, 2, 3, 4].map((n) => q(15, n).answer)).toEqual([4, 0, 2, 1]);
    expect(q(15, 4).question).toBe("What is your sister like? ( ------- )");
  });

  it("قفلِ سراسریِ r363 ادامه دارد: هیچ تایپیِ تک‌گزینه‌ای در g9", () => {
    const bad = g9.lessons.flatMap((b) => b.questions)
      .filter((x) => x.kind === "typed" && x.options.length < 2);
    expect(bad.map((x) => x.id)).toEqual([]);
  });
});
