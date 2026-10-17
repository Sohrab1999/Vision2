import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

type TQuestion = {
  id: string;
  n: number;
  category: string;
  kind?: "mcq" | "typed";
  question: string;
  options: string[];
  answer: number;
  accepted?: string[];
  translation?: string;
};
type TLesson = { lesson: number; title: string; level: string; count: number; questions: TQuestion[] };
type TBank = { grade: number; family: string; source: Record<string, unknown>; lessons: TLesson[] };

const bank: TBank = JSON.parse(
  readFileSync(path.join(process.cwd(), "public/jozve/grammar-g12-topic.json"), "utf8")
);

const FA = /[\u0600-\u06FF]/;
const BLANK = "---------------";

// نرمال‌سازی موازی با lib/typed-answer.ts (آپاستروف خمیده/علامت پایانی/فاصله)
const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/[’‘`´]/g, "'")
    .replace(/[\s?؟.!]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();

const l12 = bank.lessons.find((l) => l.lesson === 12)!;

// رسیدِ کاملِ کلیدِ چاپی ص۱۸۸ — ۲۲ آیتم، عیناً از پاسخنامهٔ ترجمه‌دار جزوه
const PRINTED_KEY: Record<number, string> = {
  1: "are they",
  2: "won’t you",
  3: "are they",
  4: "shouldn’t we",
  5: "doesn’t she",
  6: "doesn’t it",
  7: "didn’t you",
  8: "don’t we",
  9: "didn’t you",
  10: "don’t we",
  11: "hasn’t he",
  12: "can’t they",
  13: "haven’t I",
  14: "won’t you",
  15: "hasn’t she",
  16: "isn’t it",
  17: "have you",
  18: "do I",
  19: "have they",
  20: "can’t she",
  21: "didn’t we",
  22: "don’t they",
};

// قفلِ متنِ ساقه — سرنخ‌های حسیِ کلید (سوژه/فعل کمکی/قطبیت) برای چند آیتم حساس
const STEM_LOCKS: Record<number, RegExp> = {
  1: /aren’t going to cut that tree down/,
  8: /We use only 10 percent of our brain/,
  12: /Your students can play ping-pong after doing their homework/,
  16: /That’s a good idea/,
  18: /I never go to that supermarket/,
  20: /Mary can speak English, Spanish and Italian well/,
  21: /You and I answered some difficult questions/,
  22: /Mehdi and Mehran want to be with each other at the party/,
};

describe("jozve topic grammar bank g12 — typed «بنویسید» p43 (r285 extraction receipt)", () => {
  it("bank shape: twelve lessons, typed bank added as exactly 22 with continuous numbering", () => {
    expect(bank.lessons.map((l) => l.lesson)).toEqual(Array.from({ length: 324 }, (_, i) => i + 1)); // r286 دو بانک کلمات ربط، r287 هفت بانک تشریحی و r288 بخش‌های ۸/۹ را افزودند؛ r289-r291 آزمون‌های جامع درس اول تا سوم (۲۴-۵۸) و r292-r307 آزمون‌های نهایی دی ۹۷، خرداد ۹۸، شهریور ۹۸، دی ۹۸، خرداد ۹۹ (دو واریانتِ رشته‌ای)، شهریور ۹۹ (چاپِ جزوه + چاپِ رسمیِ سراسری + ویژهٔ ناشنوایان)، دی ۹۹، خرداد ۱۴۰۰ (دو واریانتِ رشته‌ای)، شهریور ۱۴۰۰، دی ۱۴۰۰، خرداد ۱۴۰۱ و شهریور ۱۴۰۱ (۵۹-۳۲۴) را افزودند
    // بانک‌های r280-r284 دست‌نخورده
    const counts = [27, 61, 30, 50, 20, 20, 40, 20, 15, 20, 40];
    counts.forEach((c, i) => expect(bank.lessons[i].questions).toHaveLength(c));
    expect(l12.count).toBe(22);
    expect(l12.questions).toHaveLength(22);
    expect(l12.questions.map((q) => q.n)).toEqual(Array.from({ length: 22 }, (_, i) => i + 1));
    expect(l12.questions.every((q) => q.id === `g12-tagwrite-${q.n}`)).toBe(true);
    expect(l12.level).toBe("آموزشی — ورود آزاد");
    // جمع خانواده: ۴۹۹ + ۱۶ (r288) = ۵۱۵
    expect(bank.lessons.reduce((a, l) => a + l.count, 0)).toBe(1556); // ۵۱۵ + ۵۹ آزمون جامع r289
  });

  it("every question is typed-shaped: kind, accepted==printed key, correct scaffold at answer index", () => {
    for (const q of l12.questions) {
      expect(q.kind, q.id).toBe("typed");
      expect(q.accepted, q.id).toEqual([PRINTED_KEY[q.n]]);
      expect(q.options, q.id).toHaveLength(4);
      expect(q.answer, q.id).toBe(0);
      // گزینهٔ درستِ داربست = کلید چاپی
      expect(norm(q.options[q.answer]), q.id).toBe(norm(PRINTED_KEY[q.n]));
      // سه داربست نادرست: هیچ‌کدام معادل نرمال‌شدهٔ کلید نیستند + یکتا
      const wrongs = q.options.filter((_, i) => i !== q.answer);
      expect(new Set(wrongs.map(norm)).size, q.id).toBe(3);
      for (const w of wrongs) expect(norm(w), q.id).not.toBe(norm(PRINTED_KEY[q.n]));
    }
  });

  it("stem fidelity: single blank placeholder, English purity, sensitive stems locked verbatim", () => {
    for (const q of l12.questions) {
      const blanks = q.question.match(/-+/g) ?? [];
      expect(blanks.some((b) => b.length >= BLANK.length), q.id).toBe(true);
      expect((q.question.match(new RegExp(BLANK, "g")) ?? []).length, q.id).toBe(1);
      expect(q.question.endsWith("?"), q.id).toBe(true);
      expect(FA.test(q.question), q.id).toBe(false);
      for (const o of q.options) expect(FA.test(o), `${q.id}:${o}`).toBe(false);
      for (const a of q.accepted ?? []) expect(FA.test(a), `${q.id}:${a}`).toBe(false);
    }
    for (const [n, re] of Object.entries(STEM_LOCKS)) {
      expect(l12.questions[Number(n) - 1].question, `q${n}`).toMatch(re);
    }
  });

  it("translation receipts: every item carries the printed p188 Persian receipt (non-empty, Persian)", () => {
    for (const q of l12.questions) {
      expect(q.translation, q.id).toBeTruthy();
      expect(FA.test(q.translation!), q.id).toBe(true);
      // ترجمه حداقل یک واژهٔ فارسی بلند دارد (رسیدِ چاپی، نه placeholder)
      expect(q.translation!.length, q.id).toBeGreaterThan(15);
    }
    // نمونهٔ قفل‌شده از کلید چاپی
    expect(l12.questions[0].translation).toContain("آنها قصد ندارند آن درخت را قطع کنند");
    expect(l12.questions[5].translation).toContain("قیمت بلیط");
  });

  it("id uniqueness across the whole 324-bank family (1556 ids) + lesson 12 introduces zero new stem collisions", () => {
    const all = bank.lessons.flatMap((l) => l.questions);
    const ids = new Set(all.map((q) => q.id));
    expect(ids.size).toBe(1556);
    // برخورد ساقهٔ «نو» صفر: ساقه‌های درس ۱۲ نباید در بانک‌های ۱..۱۲ باشند.
    // (دو برخوردِ پیشینِ چاپیِ مستندِ r281/r283 — tense1/14↔tense2/38 و tag2/9↔tag2/12 —
    //  وفادار به خود جزوه نگه داشته شده‌اند و دامنهٔ این گارد نیستند.)
    const stems = new Set(
      bank.lessons
        .filter((l) => l.lesson !== 12)
        .flatMap((l) => l.questions.map((q) => norm(q.question.replace(/-+/g, " "))))
    );
    for (const q of l12.questions) {
      const key = norm(q.question.replace(/-+/g, " "));
      expect(stems.has(key), `new stem collision: ${q.id}`).toBe(false);
    }
  });

  it("provenance: source.tagwrite receipt (r285) and frozen r280 stats untouched", () => {
    const tw = bank.source.tagwrite as Record<string, unknown> | undefined;
    expect(tw).toBeTruthy();
    expect(tw?.extractedRound).toBe(285);
    expect(String(tw?.pages)).toContain("43");
    expect(String(tw?.keyType)).toContain("۱۸۸");
    // stats رسیدِ r280 — frozen
    const stats = bank.source.stats as Record<string, number>;
    expect(stats.questions).toBe(88);
    expect(stats.lesson1).toBe(27);
    expect(stats.lesson2).toBe(61);
  });

  it("family purity: lessons 1..11 + 14 remain mcq (no kind field leaked), lessons 12/13 fully typed", () => {
    for (const l of bank.lessons.filter((x) => ![12, 13].includes(x.lesson) && (x.lesson < 15 || x.lesson === 20))) {
      for (const q of l.questions) expect(q.kind, q.id).toBeUndefined();
    }
    expect(l12.questions.every((q) => q.kind === "typed")).toBe(true);
  });
});
