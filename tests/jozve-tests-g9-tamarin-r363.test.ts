/**
 * r363 — گاردِ خانوادهٔ «تمرین‌های مکالمه» نهم + قفلِ اصلاحِ باگِ امتیازدهیِ تایپیِ تک‌گزینه‌ای
 *
 * خانواده: ۱۱ سکشنِ «تمرین ۱/۲» شش درس (ص۱۷/۳۱/۵۱/۶۵/۸۳/۹۶) → ۶ بانک/۵۵ آیتمِ تایپیِ دیالوگ؛
 * پرسش و پاسخ هر دو چاپیِ درون‌صفحه‌اند. چاپ‌خطای L3ق۴ (EN «Yes» در برابرِ ترجمهٔ «نه») verbatim
 * اولِ accepted و شکل‌های اصلاح‌شده در ادامه.
 *
 * باگِ کشف‌شده: typedAnswerIndex برای ورودیِ ناهم‌سان، (answer+1) % options.length برمی‌گرداند —
 * با options.length=1 همیشه خودِ answer → هر ورودیِ غلطی «درست» می‌شد. اصلاح: ۴۳ آیتمِ
 * تک‌گزینه‌ایِ g9/g10/g11 اسکافولدِ غلط گرفتند؛ این گارد بازگشتِ آن را برای همیشه قفل می‌کند.
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

const load = (f: string): Doc =>
  JSON.parse(fs.readFileSync(path.join(process.cwd(), "public/jozve", f), "utf-8")) as Doc;

const g9 = load("tests-g9.json");
const g10 = load("tests-g10.json");
const g11 = load("tests-g11.json");

const L = (n: number) => {
  const b = g9.lessons.find((x) => x.lesson === n);
  expect(b, `bank g9-l${n} missing`).toBeDefined();
  return b as Bank;
};

const rec = g9.source.g9tamarin as {
  extractedRound: string; families: number; sections: number; items: number;
  bankCounts: number[]; examPages: string; keySource: string; printErrata: string[];
  printQuirkCount: number; printQuirks: string[]; acceptedVariantsPolicy: string;
  distractorPolicy: string; examMap: Record<string, string>;
  typedSingleOptionFix: { bug: string; scope: string; fix: string; guard: string };
};

describe("r363 — receipt گ9tamarin", () => {
  it("receipt: round/families/sections/items/bankCounts", () => {
    expect(rec.extractedRound).toBe("r363");
    expect(rec.families).toBe(6);
    expect(rec.sections).toBe(11);
    expect(rec.items).toBe(55);
    expect(rec.bankCounts).toEqual([11, 9, 8, 10, 9, 8]);
  });

  it("receipt: quirks + errata + examMap of six lessons", () => {
    expect(rec.printQuirks.length).toBeGreaterThanOrEqual(12);
    expect(rec.printQuirks.length).toBe(rec.printQuirkCount);
    expect(rec.printErrata).toHaveLength(1);
    expect(rec.printErrata[0]).toContain("goldfish");
    for (const k of ["lesson1", "lesson2", "lesson3", "lesson4", "lesson5", "lesson6"])
      expect(rec.examMap[k], `examMap.${k}`).toBeTruthy();
    expect(rec.examMap.note).toContain("پاسخنامهٔ چاپی");
  });

  it("receipt: typedSingleOptionFix documented", () => {
    expect(rec.typedSingleOptionFix.bug).toContain("(answer+1)");
    expect(rec.typedSingleOptionFix.scope).toContain("۴۳");
  });
});

describe("r363 — شکلِ شش بانکِ مکالمه", () => {
  it("counts: [11,9,8,10,9,8] — همه تایپی با placeholder مشترک", () => {
    const counts = [3, 4, 5, 6, 7, 8].map((n) => L(n).count);
    expect(counts).toEqual([11, 9, 8, 10, 9, 8]);
    for (const bn of [3, 4, 5, 6, 7, 8]) {
      const b = L(bn);
      expect(b.questions).toHaveLength(b.count);
      for (const q of b.questions) {
        expect(q.kind).toBe("typed");
        expect(q.category).toBe("grammar");
        expect(q.placeholder).toBe("answer in English…");
        expect(q.answer).toBe(0);
      }
    }
  });

  it("every item: options[0]=accepted[0]=پاسخ چاپی، اسکافولدِ غلطِ درون‌بانکی، ترجمهٔ فارسی", () => {
    for (const bn of [3, 4, 5, 6, 7, 8]) {
      const b = L(bn);
      const answers = b.questions.map((q) => q.accepted?.[0]);
      b.questions.forEach((q, i) => {
        expect(q.options[0], q.id).toBe(q.accepted?.[0]);
        expect(q.options.length).toBe(2);
        // اسکافولدِ غلط = پاسخِ آیتمِ بعدی (چرخشی) — اندیسِ نادرستِ واقعی می‌سازد
        expect(q.options[1], q.id).toBe(answers[(i + 1) % b.questions.length]);
        const norm = (s: string) => s.toLowerCase().replace(/’/g, "'").replace(/\s+/g, " ").trim();
        expect(norm(q.options[1]) !== norm(q.options[0]), q.id).toBe(true);
        expect(q.translation, q.id).toMatch(/[\u0600-\u06FF]/);
        // خلوصِ لاتینِ ساقه/پاسخ‌ها
        for (const s of [q.question, ...q.options, ...(q.accepted ?? [])])
          expect(s, q.id).not.toMatch(/[\u0600-\u06FF]/);
      });
    }
  });

  it("id uniqueness: 141 آیتمِ یکتا در کلِ tests-g9", () => {
    const ids = g9.lessons.flatMap((b) => b.questions.map((q) => q.id));
    expect(ids).toHaveLength(141);
    expect(new Set(ids).size).toBe(141);
  });

  it("locks معنایی: هر شش درس + جفت‌های شکسته", () => {
    const q = (bn: number, n: number) => L(bn).questions[n - 1];
    expect(q(3, 1).question).toBe("Are you hard-working?");
    expect(q(3, 1).accepted?.[0]).toBe("Yes, I am.");
    expect(q(3, 6).accepted?.[0]).toBe("He’s very funny.");
    expect(q(3, 11).question).toBe("What are they like?");
    expect(q(4, 5).accepted?.[0]).toBe("Sara.");
    expect(q(4, 9).accepted?.[0]).toBe("They are traveling by train.");
    expect(q(5, 2).accepted?.[0]).toBe("No, we don’t");      // بدونِ نقطهٔ چاپی
    expect(q(6, 5).question).toBe("What time does it open?");
    expect(q(6, 10).accepted?.[0]).toBe("I take a bus.");
    expect(q(7, 6).accepted?.[0]).toBe("I attended Fajr International Film Festival."); // پیوستِ شکسته
    expect(q(7, 9).question).toBe("Where did she connect to the Internet?");            // بازچینیِ لایه
    expect(q(8, 8).accepted?.[0]).toBe("Because they drove fast.");
  });

  it("printErrata: L3ق۴ — شکلِ چاپی اول، شکل‌های اصلاح‌شده در accepted", () => {
    const e = L(5).questions[3];
    expect(e.question).toBe("Do Chinese people buy gold fish for the New Year?");
    expect(e.accepted).toEqual([
      "Yes, they don’t buy goldfish",
      "Yes they don’t buy goldfish",
      "Yes, they do not buy goldfish",
      "Yes they do not buy goldfish",
      "No, they don’t buy goldfish",
      "No, they do not buy goldfish",
    ]);
    expect(e.translation).toContain("نه، آنها ماهی قرمز نمیخرند");
  });

  it("ترجمه‌ها: نشتیِ سربرگ/فوتر ندارند و «؟» سرگردانِ پاسخ پاک شده", () => {
    for (const bn of [3, 4, 5, 6, 7, 8])
      for (const q of L(bn).questions) {
        expect(q.translation, q.id).not.toContain("ترجمه");
        expect(q.translation, q.id).not.toContain("practice");
        // قطعهٔ دومِ ترجمه (پاسخ) نباید با «؟» بسته شود — قاعدهٔ پاک‌سازیِ r363
        const parts = q.translation?.split("؟") ?? [];
        if (parts.length > 1) expect(parts[parts.length - 1].trim().length, q.id).toBeGreaterThan(0);
      }
    // جفتِ ۱ درس اول: بازسازیِ RTL «بله، من هستم»
    expect(L(3).questions[0].translation).toBe("آیا تو سخت کوش هستی؟ بله، من هستم");
  });
});

describe("r363 — قفلِ اصلاحِ باگِ تک‌گزینه‌ای (۴۳ آیتم)", () => {
  const allTyped = (d: Doc) => d.lessons.flatMap((b) => b.questions.filter((q) => q.kind === "typed"));

  it("هیچ آیتمِ تایپی در g9/g10/g11 تک‌گزینه‌ای نیست", () => {
    for (const [name, d] of [["g9", g9], ["g10", g10], ["g11", g11]] as const) {
      const bad = allTyped(d).filter((q) => q.options.length < 2);
      expect(bad.map((q) => q.id), `${name} single-option typed items`).toEqual([]);
    }
  });

  it("g9-l1: جفتِ ساختاری is/are — کلیدها is/are/is/are دست‌نخورده", () => {
    const typed = L(1).questions.filter((q) => q.kind === "typed");
    expect(typed.map((t) => t.options[t.answer])).toEqual(["is", "are", "is", "are"]);
    expect(typed.every((t) => t.options.length === 2 && t.options[0] === "is" && t.options[1] === "are")).toBe(true);
  });

  it("g10-l89: اسکافولد = شکلِ خالیِ چاپیِ خودِ سؤال", () => {
    const q1 = g10.lessons.flatMap((b) => b.questions).find((q) => q.id === "g10-l89-1");
    expect(q1?.options).toEqual(["familiar", "fam__li__r"]);
    const q14 = g10.lessons.flatMap((b) => b.questions).find((q) => q.id === "g10-l89-14");
    expect(q14?.options[0]).toBe("agent");
    expect(q14?.options[1]).toMatch(/_/);
  });

  it("g10-l92/l94: جفتِ برعکسِ اسلش‌دار / چرخشِ حرف اضافه", () => {
    const flat = g10.lessons.flatMap((b) => b.questions);
    const q92 = flat.find((q) => q.id === "g10-l92-1");
    expect(q92?.options).toEqual(["The newspaper / the magazine", "the magazine / The newspaper"]);
    const q94 = flat.find((q) => q.id === "g10-l94-1");
    expect(q94?.options).toEqual(["at", "in"]);
  });

  it("g11: چهار اسکافولدِ اختصاصی", () => {
    const flat = g11.lessons.flatMap((b) => b.questions);
    expect(flat.find((q) => q.id === "g11-l90-1")?.options[1]).toBe("falling / rising");
    const q99 = flat.find((q) => q.id === "g11-l99-1");
    expect(q99?.options[1]).toBe(q99?.question);
    expect(flat.find((q) => q.id === "g11-l105-3")?.options[1]).toBe("Few people use social media.");
    expect(flat.find((q) => q.id === "g11-l108-1")?.options).toEqual(["create", "do"]);
  });

  it("رسیدِ typedFixR363 در g10/g11 ثبت شده", () => {
    expect((g10.source.typedFixR363 as { fixed: number }).fixed).toBe(35);
    expect((g11.source.typedFixR363 as { fixed: number }).fixed).toBe(4);
  });

  it("شمارشِ کلِ آیتم‌ها تغییر نکرده: g9=141، g10=1706، g11=1223", () => {
    const total = (d: Doc) => d.lessons.reduce((s, b) => s + b.questions.length, 0);
    expect(total(g9)).toBe(141);
    expect(total(g10)).toBe(1706);
    expect(total(g11)).toBe(1223);
  });
});
