/**
 * r368 — گاردِ «سؤالات امتحانی درس پنجم» نهم (pdf-p85-87) — ۹ بانک/۳۱ آیتم از ۱۱ سکشن + دنبالهٔ بی‌شمارهٔ دیکته
 *
 * این خانواده بازآراییِ خودِ مکالمه/تمرین‌های درس پنجم است — هیچ پاسخنامهٔ چاپی در جزوه نیست و
 * کلیدها استنتاجیِ مستندند: مکالمهٔ verbatim درس (لایه p78-79)، جفت‌های verbatim تمرین‌های درس
 * (p79-80)، photo dictionary درس (p78) و ساختارِ دستوریِ یکتا (did/weren't/What).
 * مستثنی‌ها: س۱/س۱۰ تصویری، س۶ آهنگی (افتان/خیزان)، س۹ تولیدِ آزاد — در رسید مستند.
 * س۱۱ نخستین درکِ مطلبِ کارتِ نهم است (True/False + پاسخِ متن با تبدیلِ ضمیر I→she).
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

const rec = g9.source.g9exam5 as {
  extractedRound: string; section: string; examPages: string; keyPages: string;
  sectionsTotal: number; sectionsExtracted: number; sectionsSkipped: number; items: number;
  bankCounts: number[]; wordBank: string[]; extraWords: string[]; keyPolicy: string;
  derivedKeys: Record<string, string[]>; skippedSections: string[];
  printQuirkCount: number; printQuirks: string[]; lessonLexicon: Record<string, string>;
  typedNote: string;
};

describe("r368 — رسیدِ g9exam5", () => {
  it("receipt: round/sections/items/bankCounts/wordBank", () => {
    expect(rec.extractedRound).toBe("r368");
    expect(rec.section).toContain("درس پنجم");
    expect(rec.sectionsTotal).toBe(11);
    expect(rec.sectionsExtracted).toBe(7);
    expect(rec.sectionsSkipped).toBe(4);
    expect(rec.items).toBe(31);
    expect(rec.bankCounts).toEqual([10, 4, 2, 3, 3, 2, 2, 2, 3]);
    expect(rec.wordBank).toEqual(["watched", "wonderful", "did", "weekend", "text", "interested", "watch", "didn’t", "surf", "attended", "address"]);
    expect(rec.extraWords).toEqual(["watched"]);
    expect(rec.keyPages).toContain("پاسخنامهٔ چاپی");
    expect(rec.examPages).toContain("p88");
  });

  it("receipt: کلیدهای استنتاجیِ مکالمه‌محور + مستثنی‌ها", () => {
    expect(Object.keys(rec.derivedKeys).sort()).toEqual(["S11-QA", "S11-TF", "S2", "S3", "S4", "S5", "S7", "S8", "SDictation"]);
    expect(rec.derivedKeys.S2).toHaveLength(10);
    expect(rec.derivedKeys.S3).toHaveLength(4);
    expect(rec.derivedKeys.SDictation).toHaveLength(3);
    // لنگرهای مکالمه/تمرین/عبارت در دلِ دلایل
    expect(rec.derivedKeys.S2[0]).toContain("Did you enjoy your weekend?");
    expect(rec.derivedKeys.S2[9]).toContain("I just texted it.");
    expect(rec.derivedKeys.S3[1]).toContain("Did Amir work with his computer?");
    expect(rec.derivedKeys["S11-TF"][0]).toContain("Last weekend");
    // چهار سکشنِ مستثنی: دو تصویری + آهنگی + تولیدِ آزاد
    expect(rec.skippedSections).toHaveLength(4);
    expect(rec.skippedSections.filter((s) => s.includes("تصویری"))).toHaveLength(2);
    expect(rec.skippedSections.some((s) => s.includes("افتان یا خیزان"))).toBe(true);
    expect(rec.skippedSections.some((s) => s.includes("تولیدِ آزاد"))).toBe(true);
    expect(Object.keys(rec.lessonLexicon).length).toBeGreaterThanOrEqual(14);
    expect(rec.lessonLexicon["interview somebody"]).toContain("photo dictionary");
    expect(rec.typedNote).toContain("تک‌گزینه‌ای");
  });
});

describe("r368 — شکلِ نه بانکِ امتحانی درس پنجم", () => {
  it("counts: [10,4,2,3,3,2,2,2,3] — id یکتا در کلِ فایل (۲۴۸)", () => {
    expect([36, 37, 38, 39, 40, 41, 42, 43, 44].map((n) => L(n).count)).toEqual([10, 4, 2, 3, 3, 2, 2, 2, 3]);
    const ids = g9.lessons.flatMap((b) => b.questions.map((x) => x.id));
    expect(ids).toHaveLength(248);
    expect(new Set(ids).size).toBe(248);
  });

  it("س۲ بانک واژه: ده بلنک با کلیدِ مکالمه‌محور — داربست هم‌بانکِ چاپی", () => {
    const bank = rec.wordBank;
    expect([1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => q(36, n).accepted?.[0]))
      .toEqual(["weekend", "wonderful", "did", "attended", "interested", "watch", "didn’t", "surf", "address", "text"]);
    for (const x of L(36).questions) {
      expect(x.kind).toBe("typed");
      expect(x.options).toHaveLength(2);
      expect(x.options[0]).toBe(x.accepted?.[0]);
      expect(bank).toContain(x.options[0]); // کلید از بانکِ چاپی
      expect(bank).toContain(x.options[1]); // داربست هم از بانکِ چاپی
    }
    // سطرِ چهارمِ B دو بلنک دارد — دو آیتمِ surf/address
    expect(q(36, 8).question).toBe("B: You can ------- its website.");
    expect(q(36, 9).question).toBe("I can give you the website -------.");
    expect(q(36, 7).accepted).toEqual(["didn’t", "did not"]); // بازشدنِ مخفف روادار
    expect(q(36, 10).question).toContain("You can ------- It."); // «It» بزرگِ چاپی verbatim
    // اضافیِ چاپیِ «watched» هیچ‌گاه کلید نیست
    for (const x of L(36).questions) expect(x.accepted?.[0]).not.toBe("watched");
  });

  it("س۳ وصل‌کردنی: پنج گزینهٔ مشترکِ چاپی a-e + کلیدِ جفت‌های verbatim/نوعِ پرسش", () => {
    const opts = ["No, he worked with his mobile.", "They downloaded it last week.", "He searched the Internet.", "My brother.", "She connected at school."];
    for (let n = 1; n <= 4; n++) expect(q(37, n).options).toEqual(opts);
    expect([1, 2, 3, 4].map((n) => q(37, n).answer)).toEqual([3, 0, 4, 1]);
    // c اضافی است — هیچ کلیدی روی اندیس ۲ نیست
    for (let n = 1; n <= 4; n++) expect(q(37, n).answer).not.toBe(2);
    expect(q(37, 1).question).toContain("Who watch the cartoon"); // افتادِ -edِ چاپ verbatim
  });

  it("س۴ ناهماهنگ: cinema/fruit خارجِ خانواده", () => {
    expect(q(38, 1).options).toEqual(["amazing", "wonderful", "fantastic", "cinema"]);
    expect(q(38, 1).answer).toBe(3);
    expect(q(38, 2).options).toEqual(["Internet", "connect", "fruit", "download"]);
    expect(q(38, 2).answer).toBe(2);
  });

  it("س۵ مرتب‌کردن: ق۱ جملهٔ verbatim مکالمه + ق۳ دو شکلِ accepted (چاپ‌خطای «a»)", () => {
    expect(q(39, 1).question).toBe("are, things, many, there, interesting, there.");
    expect(q(39, 1).accepted).toEqual(["There are many interesting things there."]);
    expect(q(39, 2).accepted).toEqual(["We did not watch a quiz show yesterday.", "Yesterday we did not watch a quiz show."]);
    expect(q(39, 3).accepted).toEqual(["You can watch a football match on TV tonight.", "You can watch football match on TV tonight."]);
    for (const x of L(39).questions) expect(x.options[1]).toBe(x.question); // داربست: ردیفِ چاپی
  });

  it("س۷ گزینهٔ صحیح: were/What/wasn’t — گزینه‌های چاپیِ verbatim", () => {
    expect(q(40, 1).options).toEqual(["was not", "didn’t", "were", "didn’t were"]);
    expect(q(40, 1).answer).toBe(2);
    expect(q(40, 2).options).toEqual(["Where", "What", "When", "Who"]);
    expect(q(40, 2).answer).toBe(1);
    expect(q(40, 3).options).toEqual(["am", "am not", "wasn’t", "were"]);
    expect(q(40, 3).answer).toBe(2);
  });

  it("س۸ پرانتز: سه‌گزینه‌ایِ چاپی — weren’t/attended", () => {
    expect(q(41, 1).options).toEqual(["aren’t", "were", "weren’t"]);
    expect(q(41, 1).answer).toBe(2);
    expect(q(41, 2).options).toEqual(["Attend", "attended", "attends"]);
    expect(q(41, 2).answer).toBe(1);
  });

  it("س۱۱ درست/غلط: نخستین درکِ مطلبِ کارتِ نهم — هر دو False با متنِ verbatim", () => {
    for (const n of [1, 2]) {
      expect(q(42, n).options).toEqual(["True", "False"]);
      expect(q(42, n).answer).toBe(1);
    }
    expect(q(42, 1).question).toContain("last Saturday");
    expect(q(42, 2).question).toContain("grandfather");
  });

  it("س۱۱ پاسخِ متن: تبدیلِ ضمیرِ I→she — accepted ترکیب‌ساز (ویرگول × انقباض)", () => {
    expect(q(43, 1).question).toBe("Was Parisa happy at first?");
    expect(q(43, 1).accepted).toEqual(["No, she wasn’t.", "No she wasn’t.", "No, she was not.", "No she was not."]);
    expect(q(43, 2).accepted).toEqual([
      "She cleaned her room and called her grandmother.",
      "She cleaned her room and she called her grandmother.",
      "She called her grandmother and cleaned her room.",
    ]);
    for (const x of L(43).questions) {
      expect(x.kind).toBe("typed");
      expect(x.options).toHaveLength(2);
      expect(x.options[0]).toBe(x.accepted?.[0]);
    }
  });

  it("دیکتهٔ ناقص (دنبالهٔ بی‌شمارهٔ س۱۱): photo dictionary — داربستِ هم‌خانواده", () => {
    expect(q(44, 1).question).toBe("_nterview someb_dy");
    expect(q(44, 1).accepted).toEqual(["interview somebody"]);
    expect(q(44, 2).question).toBe("Upd_te a blog");
    expect(q(44, 2).accepted).toEqual(["update a blog"]);
    expect(q(44, 3).question).toBe("use technol_gy");
    expect(q(44, 3).accepted).toEqual(["use technology"]);
    for (const x of L(44).questions) {
      expect(x.kind).toBe("typed");
      expect(x.options).toHaveLength(2);
      expect(x.options[0]).toBe(x.accepted?.[0]);
      expect(x.placeholder).toBe("complete the words…");
    }
  });

  it("مستثنی‌ها وارد بانک‌های تازه نشده‌اند (scoped به بانک‌های ۳۶-۴۴)", () => {
    const stems = [36, 37, 38, 39, 40, 41, 42, 43, 44].flatMap((bn) => L(bn).questions.map((x) => x.question)).join("\n");
    expect(stems).not.toContain("That’s brilliant");           // س۶ آهنگی
    expect(stems).not.toContain("Did you receive an email");   // س۹ تولیدِ آزاد
    expect(stems).not.toContain("What a beautiful flower");    // س۶ آهنگی
  });

  it("خلوصِ لاتین: بانک‌های ۳۶-۴۴ هیچ نویسهٔ فارسی ندارند", () => {
    for (const bn of [36, 37, 38, 39, 40, 41, 42, 43, 44])
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
