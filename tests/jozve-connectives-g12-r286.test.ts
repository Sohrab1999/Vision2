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

const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/[’‘`´]/g, "'")
    .replace(/[\s?؟.!]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();

const l13 = bank.lessons.find((l) => l.lesson === 13)!;
const l14 = bank.lessons.find((l) => l.lesson === 14)!;

// کلید چاپیِ گرید ستونی ص۱۹۲ («پاسخنامه کلیدی 20 تست گرامر "کلمات ربط" (صفحه: 49)»)
// — جفت‌های (حرف،عدد) خط‌به‌خط جدا؛ هر ۲۰ با داوری معنایی راستی‌آزمایی شد
const GRID_KEY: Record<number, string> = {
  1: "b", 2: "c", 3: "d", 4: "c", 5: "d",
  6: "b", 7: "d", 8: "a", 9: "a", 10: "d",
  11: "c", 12: "a", 13: "b", 14: "c", 15: "b",
  16: "b", 17: "b", 18: "d", 19: "a", 20: "a",
};

// کلید چاپیِ توضیحیِ ص۱۹۲ برای دستگریمیِ تایپی ص۴۸ — هر ۲۰ با داوری معنایی
const TYPED_KEY: Record<number, string> = {
  1: "but", 2: "but", 3: "for", 4: "and", 5: "nor",
  6: "nor", 7: "or", 8: "and", 9: "and", 10: "so",
  11: "nor", 12: "or", 13: "yet", 14: "yet", 15: "for",
  16: "for", 17: "so", 18: "so", 19: "and", 20: "but",
};

// استخرِ ۷ حرفِ ربطِ همپایه‌سازِ خود درس (ص۴۵-۴۷)
const POOL = ["but", "and", "or", "so", "for", "nor", "yet"];

// قفل‌های معنایی MCQ — کلید گرید باید با منطق جمله بخواند
const MCQ_LOCKS: Record<number, string> = {
  1: "so",    // very long, --- it took a long time to finish
  5: "so",    // studied hard, --- they passed successfully
  8: "so",    // doesn't like fast food, --- she doesn't eat any
  11: "and",  // فهرست خرید: …, --- potatoes
  13: "so",   // teeth were hurting, --- appointment
  16: "so",   // not comfortable, --- rarely wear
  18: "or",   // homework, --- shower
  20: "so",   // wanted a novel, --- went to book store
};

// قفل‌های ساقهٔ تایپی — سرنخ‌های حسیِ کلید
const STEM_LOCKS: Record<number, { key: string; frag: RegExp }> = {
  1: { key: "but", frag: /reads magazines/ },
  3: { key: "for", frag: /every Sunday/ },
  5: { key: "nor", frag: /doesn’t like tennis/ },
  10: { key: "so", frag: /brushing my teeth/ },
  13: { key: "yet", frag: /never seem to turn a single page/ },
  16: { key: "for", frag: /she was ill/ },
  20: { key: "but", frag: /doesn’t know how to swim/ },
};

describe("jozve topic grammar bank g12 — connectives p48/p49 (r286 extraction receipt)", () => {
  it("bank shape: fourteen lessons, connectives added as exactly 20+20 with continuous numbering", () => {
    expect(bank.lessons.map((l) => l.lesson)).toEqual(Array.from({ length: 247 }, (_, i) => i + 1)); // r287 هفت بانک تشریحی (۱۵-۲۱) و r288 بخش‌های ۸/۹ (۲۲-۲۳) را افزود؛ r289-r291 آزمون‌های جامع درس اول تا سوم (۲۴-۵۸) و r292-r303 آزمون‌های نهایی دی ۹۷، خرداد ۹۸، شهریور ۹۸، دی ۹۸، خرداد ۹۹ (دو واریانتِ رشته‌ای)، شهریور ۹۹ (چاپِ جزوه + چاپِ رسمیِ سراسری + ویژهٔ ناشنوایان)، دی ۹۹ و خرداد ۱۴۰۰ (دو واریانتِ رشته‌ای) (۵۹-۲۴۷) را افزودند
    // بانک‌های r280-r285 دست‌نخورده
    const counts = [27, 61, 30, 50, 20, 20, 40, 20, 15, 20, 40, 22];
    counts.forEach((c, i) => expect(bank.lessons[i].questions).toHaveLength(c));
    expect(l13.count).toBe(20);
    expect(l13.questions).toHaveLength(20);
    expect(l13.questions.map((q) => q.n)).toEqual(Array.from({ length: 20 }, (_, i) => i + 1));
    expect(l13.questions.every((q) => q.id === `g12-connwrite-${q.n}`)).toBe(true);
    expect(l14.count).toBe(20);
    expect(l14.questions).toHaveLength(20);
    expect(l14.questions.map((q) => q.n)).toEqual(Array.from({ length: 20 }, (_, i) => i + 1));
    expect(l14.questions.every((q) => q.id === `g12-conn-${q.n}`)).toBe(true);
    expect(l13.level).toBe("آموزشی — ورود آزاد");
    expect(l14.level).toBe("استاندارد و متوسط");
    // جمع خانواده: ۴۹۹ + ۱۶ (r288) = ۵۱۵
    expect(bank.lessons.reduce((a, l) => a + l.count, 0)).toBe(1339); // ۵۱۵ + ۵۹ آزمون جامع r289
  });

  it("typed bank p48: kind/accepted==printed key, correct scaffold at index 0, scaffolds from the 7-connective pool", () => {
    for (const q of l13.questions) {
      expect(q.kind, q.id).toBe("typed");
      expect(q.accepted, q.id).toEqual([TYPED_KEY[q.n]]);
      expect(q.options, q.id).toHaveLength(4);
      expect(q.answer, q.id).toBe(0);
      expect(norm(q.options[q.answer]), q.id).toBe(norm(TYPED_KEY[q.n]));
      const wrongs = q.options.filter((_, i) => i !== q.answer);
      expect(new Set(wrongs.map(norm)).size, q.id).toBe(3);
      for (const w of wrongs) {
        expect(norm(w), q.id).not.toBe(norm(TYPED_KEY[q.n]));
        expect(POOL).toContain(norm(w)); // داربست از استخرِ خودِ درس
      }
    }
    for (const [n, { key, frag }] of Object.entries(STEM_LOCKS)) {
      expect(l13.questions[Number(n) - 1].question, `q${n}`).toMatch(frag);
      expect(TYPED_KEY[Number(n)], `q${n} key`).toBe(key);
    }
  });

  it("typed stems: single canonical blank, English purity, printed quirks faithful (ping- pong / Honestly)", () => {
    for (const q of l13.questions) {
      expect((q.question.match(new RegExp(BLANK, "g")) ?? []).length, q.id).toBe(1);
      expect(q.question, q.id).toMatch(new RegExp(BLANK));
      expect(FA.test(q.question), q.id).toBe(false);
      for (const o of q.options) expect(FA.test(o), `${q.id}:${o}`).toBe(false);
      for (const a of q.accepted ?? []) expect(FA.test(a), `${q.id}:${a}`).toBe(false);
      // پایان: ? برای Q7/Q12 (پرسشی) و . برای بقیه
      if ([7, 12].includes(q.n)) expect(q.question.endsWith("?"), q.id).toBe(true);
      else expect(q.question.endsWith("."), q.id).toBe(true);
    }
    // MERGE_BLANKS — خالیِ چندتکهٔ شکستهٔ Q2 به خالیِ کانونی واحد ادغام شد
    expect(l13.questions[1].question).toContain("in the winter, --------------- it’s better");
    // وفاداری چاپی: «ping- pong» با فاصله (سرهٔ چاپ) + جملهٔ دومِ Q5
    expect(l13.questions[4].question).toContain("ping- pong. Honestly, He just likes the soccer.");
  });

  it("translation receipts: every typed item carries the reconstructed p188-style Persian receipt (non-empty, Persian)", () => {
    for (const q of l13.questions) {
      expect(q.translation, q.id).toBeTruthy();
      expect(FA.test(q.translation!), q.id).toBe(true);
      expect(q.translation!.length, q.id).toBeGreaterThan(12);
    }
    // نمونه‌های قفل‌شده از کلید چاپی ص۱۹۲ (بازسازیِ خوانا — الگوی r285)
    expect(l13.questions[0].translation).toContain("او روزنامه می‌خواند");
    expect(l13.questions[6].translation).toContain("چای دوست داری یا قهوه");
    expect(l13.questions[19].translation).toContain("نمی‌داند چطور شنا کند");
  });

  it("mcq bank p49: grid fidelity (all 20 letters), semantic locks, English purity, single canonical blank", () => {
    for (const q of l14.questions) {
      expect(q.kind, q.id).toBeUndefined();
      expect(q.options, q.id).toHaveLength(4);
      expect(new Set(q.options.map(norm)).size, q.id).toBe(4);
      expect(q.answer, q.id).toBe("abcd".indexOf(GRID_KEY[q.n]));
      expect(FA.test(q.question), q.id).toBe(false);
      for (const o of q.options) expect(FA.test(o), `${q.id}:${o}`).toBe(false);
      expect((q.question.match(new RegExp(BLANK, "g")) ?? []).length, q.id).toBe(1);
    }
    for (const [n, opt] of Object.entries(MCQ_LOCKS)) {
      const q = l14.questions[Number(n) - 1];
      expect(q.options[q.answer], `q${n}`).toBe(opt);
    }
    // وفاداری چاپی: «Where» با W بزرگ در Q11
    expect(l14.questions[10].options[0]).toBe("Where");
  });

  it("id uniqueness across the whole 247-bank family (1339 ids) + lessons 13/14 stems unique within the r286-era family (lessons 1-12)", () => {
    const all = bank.lessons.flatMap((l) => l.questions);
    const ids = new Set(all.map((q) => q.id));
    expect(ids.size).toBe(1339);
    // درس r295: ساقه‌های موازی بین راندهای واریانت عمدی است — امتحانِ نهایی تمرین‌های چاپیِ کتاب را عیناً بازمی‌استفاده
    // (رسید r299: آیتم ۴۶ آزمون رسمی سراسری = همان تمرینِ چاپیِ ص۴۹ که l14 از r286 برداشت).
    // پس مقایسهٔ ساقه فقط با خانوادهٔ دورهٔ r286 (درس‌های ۱-۱۲) انجام می‌شود؛ یکتاییِ شناسه کلِ خانواده را می‌پوشاند.
    const stems = new Set(
      bank.lessons
        .filter((l) => l.lesson < 13)
        .flatMap((l) => l.questions.map((q) => norm(q.question.replace(/-+/g, " "))))
    );
    for (const q of [...l13.questions, ...l14.questions]) {
      const key = norm(q.question.replace(/-+/g, " "));
      expect(stems.has(key), `new stem collision: ${q.id}`).toBe(false);
    }
  });

  it("provenance: source.connectives receipt (r286) and frozen r280 stats untouched + family purity", () => {
    const cn = bank.source.connectives as Record<string, unknown> | undefined;
    expect(cn).toBeTruthy();
    expect(cn?.extractedRound).toBe(286);
    expect(String(cn?.pages)).toContain("48");
    expect(String(cn?.keyType)).toContain("۱۹۲");
    // stats رسیدِ r280 — frozen
    const stats = bank.source.stats as Record<string, number>;
    expect(stats.questions).toBe(88);
    expect(stats.lesson1).toBe(27);
    // خلوص خانواده: ۱..۱۱ mcq، ۱۲ تایپی، ۱۳ تایپی، ۱۴ mcq
    for (const l of bank.lessons.filter((x) => [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 14].includes(x.lesson))) {
      for (const q of l.questions) expect(q.kind, q.id).toBeUndefined();
    }
    for (const l of bank.lessons.filter((x) => x.lesson === 12 || x.lesson === 13)) {
      expect(l.questions.every((q) => q.kind === "typed"), l.title).toBe(true);
    }
  });
});
