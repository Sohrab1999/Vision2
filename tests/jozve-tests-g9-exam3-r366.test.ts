/**
 * r366 — گاردِ «سؤالات امتحانی درس سوم» نهم (ص۶۱-۶۳) — ۶ بانک/۲۸ آیتم از ۸ بلوکِ چاپی
 *
 * هیچ پاسخنامهٔ چاپی در جزوه برای این خانواده نیست — کلیدها استنتاجیِ مستندند:
 * عبارت‌محور (س۷ق۱/ق۲ — photo dictionary خودِ درس: hold a ceremony* / Islamic-Iranian
 * culture*)، مکالمه‌محور (س۵ق۲ — «We normally visit our relatives in Norooz.»)،
 * توافقِ نهاد و فعل (س۳/س۴)، منفی‌سازی/وارونگیِ یکتا (س۲)، منطقِ ملکی (س۷ق۴/ق۵)،
 * توافقِ پاسخ و فاعل (س۷ق۶)، تنها جملهٔ سالم (س۷ق۸).
 * مستثنی‌ها: س۱ تصویری، س۶ آهنگی، س۷ق۳ دوکلیدی، س۷ق۷ بی‌گزینهٔ معتبر — در رسید مستند.
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

const rec = g9.source.g9exam3 as {
  extractedRound: string; section: string; examPages: string; keyPages: string;
  sectionsTotal: number; sectionsExtracted: number; sectionsSkipped: number; items: number;
  bankCounts: number[]; wordBank: string[]; extraWord: string; keyPolicy: string;
  derivedKeys: Record<string, string[]>; skippedSections: string[];
  printQuirkCount: number; printQuirks: string[]; lessonLexicon: Record<string, string>;
  typedNote: string;
};

describe("r366 — رسیدِ g9exam3", () => {
  it("receipt: round/sections/items/bankCounts/wordBank", () => {
    expect(rec.extractedRound).toBe("r366");
    expect(rec.section).toContain("درس سوم");
    expect(rec.sectionsTotal).toBe(8);
    expect(rec.sectionsExtracted).toBe(6);
    expect(rec.sectionsSkipped).toBe(2);
    expect(rec.items).toBe(28);
    expect(rec.bankCounts).toEqual([4, 6, 6, 2, 4, 6]);
    expect(rec.wordBank).toEqual(["relatives", "swim", "meal", "sing", "wears"]);
    expect(rec.extraWord).toBe("sing");
    expect(rec.keyPages).toContain("پاسخنامهٔ چاپی");
  });

  it("receipt: کلیدهای استنتاجی با دلیل + مستثنی‌ها + لنگرهای درس سوم", () => {
    expect(Object.keys(rec.derivedKeys).sort()).toEqual(["S2", "S3", "S4", "S4b", "S5", "S7"]);
    expect(rec.derivedKeys.S2).toHaveLength(4);
    expect(rec.derivedKeys.S7).toHaveLength(6);
    // لنگرهای photo dictionary/مکالمه در دلِ دلایل
    expect(rec.derivedKeys.S7[0]).toContain("hold a ceremony*");
    expect(rec.derivedKeys.S7[1]).toContain("Islamic-Iranian culture*");
    expect(rec.derivedKeys.S5[1]).toContain("We normally visit our relatives in Norooz");
    // دو سکشنِ کاملِ مستثنی + دو آیتمِ مستثنیِ درون‌سکشن
    expect(rec.skippedSections).toHaveLength(4);
    expect(rec.skippedSections.some((s) => s.includes("تصویری"))).toBe(true);
    expect(rec.skippedSections.some((s) => s.includes("افتان یا خیزان"))).toBe(true);
    expect(rec.skippedSections.some((s) => s.includes("دوکلیدی"))).toBe(true);
    expect(rec.skippedSections.some((s) => s.includes("is held"))).toBe(true);
    // لنگرهای ۹ عبارتی/مکالمه‌ایِ درس سوم در واژنامه قفل شده‌اند
    expect(Object.keys(rec.lessonLexicon).length).toBeGreaterThanOrEqual(16);
    expect(rec.lessonLexicon["hold a ceremony"]).toContain("photo dictionary");
    expect(rec.lessonLexicon["visit our relatives"]).toContain("verbatim");
    expect(rec.typedNote).toContain("تک‌گزینه‌ای");
  });
});

describe("r366 — شکلِ شش بانکِ امتحانی درس سوم", () => {
  it("counts: [4,6,6,2,4,6] — id یکتا در کلِ فایل (۲۱۷)", () => {
    expect([23, 24, 25, 26, 27, 28].map((n) => L(n).count)).toEqual([4, 6, 6, 2, 4, 6]);
    const ids = g9.lessons.flatMap((b) => b.questions.map((x) => x.id));
    expect(ids).toHaveLength(248);
    expect(new Set(ids).size).toBe(248);
  });

  it("س۲ سوالی و منفی: وارونگی/منفی‌سازیِ یکتا + داربستِ جملهٔ ساده", () => {
    expect(q(23, 1).question).toBe("The cat drinks its milk. (Question: -------)");
    expect(q(23, 1).accepted).toEqual(["Does the cat drink its milk?"]);
    expect(q(23, 2).accepted).toEqual(["The cat doesn’t drink its milk.", "The cat does not drink its milk."]);
    expect(q(23, 3).accepted).toEqual(["Do they listen to their teacher?"]);
    expect(q(23, 4).accepted).toEqual(["They don’t listen to their teacher.", "They do not listen to their teacher."]);
    for (const x of L(23).questions) {
      expect(x.kind).toBe("typed");
      expect(x.options).toHaveLength(2);
      expect(x.options[0]).toBe(x.accepted?.[0]);
      expect(x.options[1]).toMatch(/^(The cat drinks its milk|They listen to their teacher)$/); // داربست: جملهٔ سادهٔ خودِ ساقه
    }
  });

  it("س۳ فعلِ مناسب: جفتِ درون‌پرانتزِ چاپی + کلیدِ توافقِ نهاد و فعل", () => {
    const pairs = [
      ["Do", "Does"], ["watch", "watches"], ["works", "work"],
      ["eat", "eats"], ["don't stay", "doesn't stay"], ["Does", "Do"],
    ];
    [1, 2, 3, 4, 5, 6].forEach((n, i) => {
      expect(q(24, n).options).toEqual(pairs[i]);
      expect(q(24, n).accepted).toEqual([pairs[i][0]]);
      expect(q(24, n).kind).toBe("typed");
    });
    expect(q(24, 5).question).toContain("Nature Day");
    expect(q(24, 6).question).toContain("poems of Khayyam");
  });

  it("س۴ متنِ رهین: شش جای خالیِ توافق‌محور + چاپ‌غلطِ verbatim", () => {
    expect(q(25, 1).question).toBe("We ------- (go – goes – going) to my grandfather's house on Fridays.");
    expect(q(25, 2).accepted).toEqual(["us"]); // مفعولِ gives
    expect(q(25, 4).question).toContain("a big a cake"); // چاپ‌غلطِ verbatim
    expect(q(25, 5).question).toContain("the boys -------"); // آغازِ lowercaseِ چاپی
    expect([1, 2, 3, 4, 5, 6].map((n) => q(25, n).accepted?.[0])).toEqual(
      ["go", "us", "cooks", "make", "set", "clear"],
    );
  });

  it("س۴ب شکلِ صحیح: پرانتزِ چاپی داربست + واریانتِ does not", () => {
    expect(q(26, 1).question).toBe("Mr. Ahmadi goes to work by bus. He ------- his car. (not drive)");
    expect(q(26, 1).options).toEqual(["doesn’t drive", "not drive"]);
    expect(q(26, 1).accepted).toEqual(["doesn’t drive", "does not drive"]);
    expect(q(26, 2).accepted).toEqual(["waters"]);
  });

  it("س۵ بانک واژهٔ نوروز: کلید و داربست هر دو از بانکِ چاپیِ پنج‌واژه‌ای", () => {
    const bank = rec.wordBank;
    for (const x of L(27).questions) {
      expect(x.kind).toBe("typed");
      expect(x.options).toHaveLength(2);
      expect(bank).toContain(x.options[0]);
      expect(bank).toContain(x.options[1]);
    }
    expect([1, 2, 3, 4].map((n) => q(27, n).accepted?.[0])).toEqual(["meal", "relatives", "wears", "swim"]);
    // واژهٔ اضافیِ چاپ (sing) فقط نقشِ داربست دارد
    expect(q(27, 1).options[1]).toBe("sing");
  });

  it("س۷ گزینهٔ صحیح: گزینه‌های چاپیِ verbatim + کلیدهای لنگردار/ساختاری", () => {
    expect(q(28, 1).options).toEqual(["sing", "gets", "hold", "wear"]);
    expect(q(28, 1).answer).toBe(2); // hold a ceremony*
    expect(q(28, 2).options).toEqual(["parade", "holiday", "revolution", "culture"]);
    expect(q(28, 2).answer).toBe(3); // Islamic-Iranian culture*
    expect(q(28, 3).answer).toBe(3); // his (Ali)
    expect(q(28, 4).options).toEqual(["her", "his", "it", "its"]);
    expect(q(28, 4).answer).toBe(3); // its
    expect(q(28, 5).options).toEqual([
      "Does Samaneh make lunch?", "Does your uncle make lunch?",
      "Does your aunt bake a cake?", "Does she bake a cake?",
    ]);
    expect(q(28, 5).answer).toBe(1); // uncle → he
    expect(q(28, 6).answer).toBe(1); // تنها جملهٔ سالم
    expect([1, 2, 3, 4, 5, 6].map((n) => q(28, n).answer)).toEqual([2, 3, 3, 3, 1, 1]);
  });

  it("مستثنی‌ها وارد بانک نشده‌اند: Fitr-Eid و Fajr و افتان/خیزان غایب‌اند (scoped به بانک‌های ۲۳-۲۸ — درسِ r367: فایل-wide سقوط می‌کند؛ Fajrِ درس پنجمِ r368 مشروع است)", () => {
    const stems = [23, 24, 25, 26, 27, 28].flatMap((bn) => L(bn).questions.map((x) => x.question)).join("\n");
    expect(stems).not.toContain("Fitr-Eid");
    expect(stems).not.toContain("Fajr");
    expect(stems).not.toContain("rainy weather"); // س۶ِ آهنگی
  });

  it("خلوصِ لاتین: بانک‌های ۲۳-۲۸ هیچ نویسهٔ فارسی ندارند (برچسب‌های س۲ انگلیسی‌اند)", () => {
    for (const bn of [23, 24, 25, 26, 27, 28])
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
