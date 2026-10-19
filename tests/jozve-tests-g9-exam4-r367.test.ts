/**
 * r367 — گاردِ «سؤالات امتحانی درس چهارم» نهم (ص۷۳-۷۵) — ۷ بانک/۲۴ آیتم از ۱۱ سکشن
 *
 * هیچ پاسخنامهٔ چاپی در جزوه برای این خانواده نیست — کلیدها استنتاجیِ مستندند:
 * photo dictionary خودِ درس چهارم (س۵/س۹/س۱۱ — عبارت‌های ستاره‌دار ص۶۵-۶۶)، مکالمهٔ
 * verbatim درس («It's just round the corner.»)، نوعِ پاسخِ B (س۷)، جایگاهِ قیدِ تکرار
 * (س۸)، آینه‌سازیِ ساختاریِ پرسش/پاسخ (س۱۰ — نخستین MCQ هفت‌گزینه‌ایِ کارت).
 * مستثنی‌ها: س۱/س۲ تصویری، س۳ آهنگی، س۴ «چهار اشتباه» با خطای چهارمِ نایکتا — در رسید مستند.
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

const rec = g9.source.g9exam4 as {
  extractedRound: string; section: string; examPages: string; keyPages: string;
  sectionsTotal: number; sectionsExtracted: number; sectionsSkipped: number; items: number;
  bankCounts: number[]; wordBank: string[]; extraWords: string[]; keyPolicy: string;
  derivedKeys: Record<string, string[]>; skippedSections: string[];
  printQuirkCount: number; printQuirks: string[]; lessonLexicon: Record<string, string>;
  typedNote: string;
};

describe("r367 — رسیدِ g9exam4", () => {
  it("receipt: round/sections/items/bankCounts/wordBank", () => {
    expect(rec.extractedRound).toBe("r367");
    expect(rec.section).toContain("درس چهارم");
    expect(rec.sectionsTotal).toBe(11);
    expect(rec.sectionsExtracted).toBe(7);
    expect(rec.sectionsSkipped).toBe(4);
    expect(rec.items).toBe(24);
    expect(rec.bankCounts).toEqual([3, 2, 3, 2, 4, 6, 4]);
    expect(rec.wordBank).toEqual(["Where", "How", "When", "Who", "Why"]);
    expect(rec.extraWords).toEqual(["How", "When"]); // دو اضافی به‌رغمِ «یک کلمه اضافی» چاپی
    expect(rec.keyPages).toContain("پاسخنامهٔ چاپی");
  });

  it("receipt: کلیدهای استنتاجی با لنگرِ photo dictionary + مستثنی‌ها", () => {
    expect(Object.keys(rec.derivedKeys).sort()).toEqual(["S10", "S11", "S5", "S6", "S7", "S8", "S9"]);
    expect(rec.derivedKeys.S9).toHaveLength(4);
    expect(rec.derivedKeys.S10).toHaveLength(6);
    // لنگرهای photo dictionary در دلِ دلایل
    expect(rec.derivedKeys.S9[0]).toContain("ask the information desk*");
    expect(rec.derivedKeys.S9[2]).toContain("take out money from an ATM*");
    expect(rec.derivedKeys.S11[1]).toContain("just round the corner");
    // چهار سکشنِ مستثنی
    expect(rec.skippedSections).toHaveLength(4);
    expect(rec.skippedSections.filter((s) => s.includes("تصویری"))).toHaveLength(2);
    expect(rec.skippedSections.some((s) => s.includes("آهنگی"))).toBe(true);
    expect(rec.skippedSections.some((s) => s.includes("چهار اشتباه"))).toBe(true);
    expect(Object.keys(rec.lessonLexicon).length).toBeGreaterThanOrEqual(14);
    expect(rec.lessonLexicon["open an account"]).toContain("photo dictionary");
    expect(rec.typedNote).toContain("تک‌گزینه‌ای");
  });
});

describe("r367 — شکلِ هفت بانکِ امتحانی درس چهارم", () => {
  it("counts: [3,2,3,2,4,6,4] — id یکتا در کلِ فایل (۲۱۷)", () => {
    expect([29, 30, 31, 32, 33, 34, 35].map((n) => L(n).count)).toEqual([3, 2, 3, 2, 4, 6, 4]);
    const ids = g9.lessons.flatMap((b) => b.questions.map((x) => x.id));
    expect(ids).toHaveLength(217);
    expect(new Set(ids).size).toBe(217);
  });

  it("س۵ دیکتهٔ ناقص: کلید از photo dictionary + داربستِ چرخشیِ هم‌بانک", () => {
    expect(q(29, 1).question).toBe("R_charge the e t_cket");
    expect(q(29, 1).accepted).toEqual(["Recharge the e-ticket", "Recharge the e ticket"]);
    expect(q(29, 1).options[1]).toBe("information desk"); // داربست: هم‌بانک
    expect(q(29, 2).accepted).toEqual(["information desk"]);
    expect(q(29, 3).accepted).toEqual(["help charity"]);
    for (const x of L(29).questions) {
      expect(x.kind).toBe("typed");
      expect(x.options).toHaveLength(2);
      expect(x.options[0]).toBe(x.accepted?.[0]);
    }
  });

  it("س۶ مرتب‌کردن: تنها یک چینشِ دستوری + داربستِ ردیفِ به‌هم‌ریخته", () => {
    expect(q(30, 1).question).toBe("work / every / voluntary / do / we / weekend");
    expect(q(30, 1).accepted).toEqual(["We do voluntary work every weekend."]);
    expect(q(30, 2).accepted).toEqual(["They always keep the city clean."]);
    for (const x of L(30).questions) expect(x.options[1]).toBe(x.question); // داربست: ردیفِ چاپی
  });

  it("س۷ پرسش‌واژه‌ها: کلید با نوعِ پاسخِ B — داربست از بانکِ چاپیِ پنج‌واژه‌ای", () => {
    const bank = rec.wordBank;
    expect([1, 2, 3].map((n) => q(31, n).accepted?.[0])).toEqual(["Why", "Who", "Where"]);
    for (const x of L(31).questions) {
      expect(bank).toContain(x.options[0]);
      expect(bank).toContain(x.options[1]);
    }
    expect(q(31, 1).question).toContain("does take bus? B: because"); // افتادِ فاعلِ چاپ verbatim
  });

  it("س۸ بازنویسی: قیدِ تکرار پیش از فعلِ اصلی — داربستِ جملهٔ ساده", () => {
    expect(q(32, 1).question).toBe("They come late. (never)");
    expect(q(32, 1).accepted).toEqual(["They never come late."]);
    expect(q(32, 2).accepted).toEqual(["She always studies hard."]);
    for (const x of L(32).questions) expect(x.options[1]).toMatch(/^(They come late\.|She studies hard\.)$/);
  });

  it("س۹ جواب صحیح: چهار کلیدِ photo dictionary + گزینه‌های چاپیِ verbatim", () => {
    expect(q(33, 1).options).toEqual(["save people’ lives", "ask information desk", "call the emergency", "keep the city clean"]);
    expect(q(33, 1).answer).toBe(1);
    expect(q(33, 2).options).toEqual(["send an email", "hire a taxi", "recharge my E-ticket", "open an account"]);
    expect(q(33, 2).answer).toBe(3); // open an account*
    expect(q(33, 3).answer).toBe(2); // take out money from an ATM*
    expect(q(33, 4).answer).toBe(1); // help charity*
    expect([1, 2, 3, 4].map((n) => q(33, n).answer)).toEqual([1, 3, 2, 1]);
  });

  it("س۱۰ وصل‌کردنی: هفت گزینهٔ مشترکِ چاپی a-g + آینه‌سازیِ ساختاریِ پرسش/پاسخ", () => {
    const opts = ["He works on shifts", "He is Mr. Amaini", "At a fire station.", "Yes, there’s one over there.",
                  "He is fire fighter.", "from a post office", "He puts out fire and saves people’s lives"];
    expect(opts).toHaveLength(7); // نخستین MCQ هفت‌گزینه‌ایِ کارت
    for (let n = 1; n <= 6; n++) expect(q(34, n).options).toEqual(opts);
    expect([1, 2, 3, 4, 5, 6].map((n) => q(34, n).answer)).toEqual([1, 4, 6, 2, 0, 3]);
    expect(q(34, 6).question).toBe("Is there a fire station near here ( ------- )"); // بی‌علامتِ پرسشِ چاپی
    expect(q(34, 2).question).toContain("What s his job?"); // افتادِ آپاستروفِ چاپی
    // f اضافی است — هیچ کلیدی روی اندیس ۵ نیست
    for (let n = 1; n <= 6; n++) expect(q(34, n).answer).not.toBe(5);
  });

  it("س۱۱ تکمیل: چهار کلیدِ لنگردار (take out/round/hire/fire station)", () => {
    expect(q(35, 1).question).toBe("You can t_ _ _ _ _ _ money from that ATM.");
    expect(q(35, 1).accepted).toEqual(["take out"]);
    expect(q(35, 2).accepted).toEqual(["round"]);
    expect(q(35, 3).accepted).toEqual(["hire"]);
    expect(q(35, 4).accepted).toEqual(["fire station", "firestation"]);
    expect(q(35, 4).question).toContain("f _ _ _ _ _ _ _ _ _."); // خانه‌های ناقصِ چاپی verbatim
    for (const x of L(35).questions) {
      expect(x.kind).toBe("typed");
      expect(x.options).toHaveLength(2);
      expect(x.options[0]).toBe(x.accepted?.[0]);
    }
  });

  it("مستثنی‌ها وارد بانک‌های تازه نشده‌اند: تصویری‌ها/آهنگی/چهار-اشتباه غایب‌اند", () => {
    const stems = [29, 30, 31, 32, 33, 34, 35].flatMap((bn) => L(bn).questions.map((x) => x.question)).join("\n");
    expect(stems).not.toContain("Its near my school");     // متنِ س۴ سقوط‌کرده
    expect(stems).not.toContain("Who helps lost children"); // س۳ِ آهنگی
    expect(stems).not.toContain("Take out money …");        // س۲ِ تصویری
  });

  it("خلوصِ لاتین: بانک‌های ۲۹-۳۵ هیچ نویسهٔ فارسی ندارند", () => {
    for (const bn of [29, 30, 31, 32, 33, 34, 35])
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
