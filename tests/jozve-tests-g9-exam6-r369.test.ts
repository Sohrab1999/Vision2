/**
 * r369 — گاردِ «سؤالات امتحانی درس ششم» نهم (pdf-p95-97) — ۶ بانک/۲۱ آیتم از ۱۰ سکشن
 *
 * این خانواده هم بازآراییِ خودِ مکالمه/تمرین‌های درس ششم است — هیچ پاسخنامهٔ چاپی در جزوه نیست و
 * کلیدها استنتاجیِ مستندند: مکالمهٔ verbatim درس (لایه p90-91 با تبادلِ چاپیِ قیدِ زمان)، جفت‌های
 * verbatim تمرینِ ۲ درس (p92)، photo dictionary درس (p90)، واژگانِ سلامتی و آسیب (p89) و
 * گرامرِ خودِ درس (ضمایر مفعولی — p94).
 * مستثنی‌ها: س۱/س۹/س۱۰ تصویری، س۸ آهنگی، س۴ق۱ دوکلیدی — در رسید مستند.
 * با این راند کارتِ نهم شش‌درسِ امتحانی کامل شد (گروه دهم کارت).
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

const rec = g9.source.g9exam6 as {
  extractedRound: string; section: string; examPages: string; keyPages: string;
  sectionsTotal: number; sectionsExtracted: number; sectionsSkipped: number; items: number;
  bankCounts: number[]; wordBank: string[]; extraWords: string[]; keyPolicy: string;
  derivedKeys: Record<string, string[]>; skippedSections: string[];
  printQuirkCount: number; printQuirks: string[]; lessonLexicon: Record<string, string>;
  typedNote: string;
};

describe("r369 — رسیدِ g9exam6", () => {
  it("receipt: round/sections/items/bankCounts/wordBank", () => {
    expect(rec.extractedRound).toBe("r369");
    expect(rec.section).toContain("درس ششم");
    expect(rec.sectionsTotal).toBe(10);
    expect(rec.sectionsExtracted).toBe(6);
    expect(rec.sectionsSkipped).toBe(4);
    expect(rec.items).toBe(21);
    expect(rec.bankCounts).toEqual([8, 2, 1, 4, 3, 3]);
    expect(rec.wordBank).toEqual(["broke", "did", "stay", "twisted", "participated", "advice", "do", "learn", "stayed"]);
    expect(rec.extraWords).toEqual(["stay"]);
    expect(rec.keyPages).toContain("پاسخنامهٔ چاپی");
    expect(rec.examPages).toContain("p98"); // مرزِ پایینی: خانوادهٔ واژگانِ r362
    expect(rec.examPages).toContain("شش‌درسِ امتحانی");
  });

  it("receipt: کلیدهای استنتاجیِ مکالمه‌محور + مستثنی‌ها", () => {
    expect(Object.keys(rec.derivedKeys).sort()).toEqual(["S2", "S3", "S4", "S5", "S6", "S7"]);
    expect(rec.derivedKeys.S2).toHaveLength(8);
    expect(rec.derivedKeys.S5).toHaveLength(4);
    expect(rec.derivedKeys.S4).toHaveLength(1); // فقط ق۲ — ق۱ دوکلیدی مستثنی
    // لنگرهای مکالمه/تمرین/عبارت در دلِ دلایل
    expect(rec.derivedKeys.S2[0]).toContain("I don’t like school trips");
    expect(rec.derivedKeys.S2[4]).toContain("participated in Helal-e-Ahmar");
    expect(rec.derivedKeys.S5[1]).toContain("Because they drove fast");
    expect(rec.derivedKeys.S7[2]).toContain("found");
    // پنج بندِ مستثنی: سه سکشنِ تصویری + آهنگی + دوکلیدیِ س۴ق۱
    expect(rec.skippedSections).toHaveLength(5);
    expect(rec.skippedSections.filter((s) => s.startsWith("س۱") || s.startsWith("س۹") || s.startsWith("س۱۰"))).toHaveLength(3);
    expect(rec.skippedSections.some((s) => s.includes("افتان و خیزان"))).toBe(true);
    expect(rec.skippedSections.some((s) => s.includes("دوکلیدی"))).toBe(true);
    expect(Object.keys(rec.lessonLexicon).length).toBeGreaterThanOrEqual(6);
    expect(rec.lessonLexicon["grammar"]).toContain("Object Pronouns");
    expect(rec.typedNote).toContain("تک‌گزینه‌ای");
  });
});

describe("r369 — شکلِ شش بانکِ امتحانی درس ششم", () => {
  it("counts: [8,2,1,4,3,3] — id یکتا در کلِ فایل (۲۶۹)", () => {
    expect([45, 46, 47, 48, 49, 50].map((n) => L(n).count)).toEqual([8, 2, 1, 4, 3, 3]);
    const ids = g9.lessons.flatMap((b) => b.questions.map((x) => x.id));
    expect(ids).toHaveLength(269);
    expect(new Set(ids).size).toBe(269);
  });

  it("س۲ بانک واژه: هشت بلنک با کلیدِ مکالمه‌محور — داربست هم‌بانکِ چاپی", () => {
    const bank = rec.wordBank;
    expect([1, 2, 3, 4, 5, 6, 7, 8].map((n) => q(45, n).accepted?.[0]))
      .toEqual(["do", "broke", "twisted", "stayed", "participated", "learn", "did", "advice"]);
    for (const x of L(45).questions) {
      expect(x.kind).toBe("typed");
      expect(x.options).toHaveLength(2);
      expect(x.options[0]).toBe(x.accepted?.[0]);
      expect(bank).toContain(x.options[0]); // کلید از بانکِ چاپی
      expect(bank).toContain(x.options[1]); // داربست هم از بانکِ چاپی
    }
    // تبادلِ قیدِ زمانِ چاپی نسبت به درس — verbatim در ساقه‌ها
    expect(q(45, 2).question).toContain("Last winter I fell"); // درس: Last summer (p90:042)
    expect(q(45, 3).question).toContain("my ankle last summer"); // درس: last winter (p90:051)
    // سطرِ آخرِ B دو بلنک دارد — دو آیتمِ did/advice (الگوی r368)
    expect(q(45, 7).question).toBe("B: Yes, I -------.");
    expect(q(45, 8).question).toBe("I can give you some ------- if you like.");
    // اضافیِ چاپیِ «stay» هیچ‌گاه کلید نیست (داربستِ تلهٔ زمانیِ ق۴ روادار است)
    for (const x of L(45).questions) expect(x.accepted?.[0]).not.toBe("stay");
    expect(q(45, 4).options).toEqual(["stayed", "stay"]);
    expect(q(45, 4).question).toContain("home for 10 days");
  });

  it("س۳ ناهماهنگ: my (غیرِ ضمیرِ مفعولی) / health (غیرِ فعلِ آسیب)", () => {
    expect(q(46, 1).options).toEqual(["her", "my", "them", "him"]);
    expect(q(46, 1).answer).toBe(1);
    expect(q(46, 1).keyWhy).toContain("Object Pronouns");
    expect(q(46, 2).options).toEqual(["cut", "hurt", "break", "health"]);
    expect(q(46, 2).answer).toBe(3);
  });

  it("س۴ مرتب‌کردن: فقط ق۲ — چینشِ یکتا با acceptedِ قیدِ مکانِ آغازین؛ ق۱ دوکلیدی وارد نشده", () => {
    expect(q(47, 1).question).toBe("saw, the, in, him, they, park.");
    expect(q(47, 1).accepted).toEqual(["They saw him in the park.", "In the park they saw him.", "In the park, they saw him."]);
    expect(q(47, 1).options[1]).toBe(q(47, 1).question); // داربست: ردیفِ چاپی
    // ق۱ دوکلیدی («learnt, last, English, summer, I. year.») نباید در هیچ بانکی باشد
    const stems = g9.lessons.flatMap((b) => b.questions.map((x) => x.question)).join("\n");
    expect(stems).not.toContain("learnt, last, English");
  });

  it("س۵ وصل‌کردنی: پنج گزینهٔ مشترکِ چاپی a-e + کلیدِ جفت‌های verbatim/نوعِ پرسش", () => {
    const opts = ["I took care of my father last year.", "She hit it in the park.", "Yes, she did.",
      "Because they drove fast.", "My sister."];
    for (let n = 1; n <= 4; n++) expect(q(48, n).options).toEqual(opts);
    expect([1, 2, 3, 4].map((n) => q(48, n).answer)).toEqual([1, 3, 4, 0]);
    // c اضافی است — هیچ کلیدی روی اندیس ۲ نیست
    for (let n = 1; n <= 4; n++) expect(q(48, n).answer).not.toBe(2);
    // جفتِ verbatimِ تمرینِ ۲ درس (p92)
    expect(q(48, 2).keyWhy).toContain("p92");
  });

  it("س۶ پرانتز: سه‌گزینه‌ایِ چاپی — us/When/because", () => {
    expect(q(49, 1).options).toEqual(["them", "us", "our"]);
    expect(q(49, 1).answer).toBe(1);
    expect(q(49, 2).options).toEqual(["When", "Where", "How"]);
    expect(q(49, 2).answer).toBe(0);
    expect(q(49, 3).options).toEqual(["hurry up", "yeah", "because"]);
    expect(q(49, 3).answer).toBe(2);
    expect(q(49, 2).question).toContain("He burnt his hand last Monday"); // burntِ بریتانیاییِ چاپ
  });

  it("س۷ گزینهٔ صحیح: them/have/found — گزینه‌های چاپیِ verbatim", () => {
    expect(q(50, 1).options).toEqual(["them", "us", "its", "it"]);
    expect(q(50, 1).answer).toBe(0);
    expect(q(50, 2).options).toEqual(["has", "had", "have", "her"]);
    expect(q(50, 2).answer).toBe(2);
    expect(q(50, 3).options).toEqual(["finded", "founded", "found", "did found"]);
    expect(q(50, 3).answer).toBe(2);
  });

  it("مستثنی‌ها وارد بانک‌های تازه نشده‌اند (scoped به بانک‌های ۴۵-۵۰)", () => {
    const stems = [45, 46, 47, 48, 49, 50].flatMap((bn) => L(bn).questions.map((x) => x.question)).join("\n");
    expect(stems).not.toContain("Do you have your lunch at school"); // س۸ آهنگی
    expect(stems).not.toContain("Mr. Hamidi");                       // س۹ تصویری
    expect(stems).not.toContain("learnt, last, English");            // س۴ق۱ دوکلیدی
    expect(stems).not.toContain("fajr");                             // خانوادهٔ واژگانِ p98 هم بیرون است
  });

  it("خلوصِ لاتین: بانک‌های ۴۵-۵۰ هیچ نویسهٔ فارسی ندارند", () => {
    for (const bn of [45, 46, 47, 48, 49, 50])
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
