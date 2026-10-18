import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

// =====================================================================
// r308 — گاردِ «آزمون جامع ۳۶۰ تست آموزش واژگان درس ۱ تا ۳ — پایه یازدهم»
// منبع: جزوهٔ جامع یازدهم — سؤال‌ها PDF ص۱۱۸-۱۳۵، گریدِ کلیدِ چاپی «پاسخنامه کلیدی360» ص۲۰۴
// ۱۸ بانک (درس ۶..۲۳) × ۲۰ تست؛ بانکِ ۱۲ (درس ۱۷) ۲۱تستی است — جزوه شمارهٔ ۲۲۸ را
// دو بار با دو سؤالِ متفاوت چاپ کرده (ص۱۲۸ بیرون از توالی + ص۱۲۹ در توالی) و هر دو
// کلیدِ «c» گرید با هر دو سازگار است — رسیدِ داوری در source.comprehensive360.note.
// کلید: ۳۶۰ جفتِ (حرف، شماره) از گرید چاپی؛ جفت‌سازیِ مستقیمِ موقعیتی (نه معکوس).
// رسیدِ استخراج: scripts/jozve-g11-360-r308.py
// =====================================================================

interface BankQuestion {
  id: string;
  n: number;
  category: string;
  question: string;
  options: string[];
  answer: number;
  translation?: string;
}
interface BankLesson {
  lesson: number;
  title: string;
  level: string;
  count: number;
  questions: BankQuestion[];
}
interface Bank {
  grade: number;
  source: {
    file: string;
    lessons: { lesson: number }[];
    comprehensive360?: {
      family: string;
      questionPages: string;
      keyGrid: string;
      note: string;
      extractedRound: string;
    };
  };
  lessons: BankLesson[];
}

const bank: Bank = JSON.parse(
  readFileSync(path.join(process.cwd(), "public/jozve/tests-g11.json"), "utf8")
);

const FA = /[\u0600-\u06FF]/;
const LETTER_INDEX: Record<string, number> = { a: 0, b: 1, c: 2, d: 3 };

// نمونهٔ کلیدِ مستقل — رونویسیِ دستی از گرید چاپی ص۲۰۴ (سه پوزیشن از هر بانک + چهار خاص)
// {1: a, 10: a, 20: b, 21: c, 30: b, 40: a, 41: a, 50: a, 60: c, 61: c, 70: d, 80: b,
//  81: c, 90: b, 100: d, 101: a, 110: c, 120: b, 121: b, 130: b, 140: c, 141: c, 150: d,
//  160: b, 161: b, 170: c, 180: b, 181: a, 190: a, 200: a, 201: b, 210: c, 220: c,
//  221: a, 228: c, 230: c, 240: b, 241: a, 250: a, 260: c, 261: a, 270: a, 280: b,
//  281: d, 290: b, 300: d, 301: a, 310: d, 320: a, 321: b, 330: d, 340: a, 341: d, 350: d, 360: c}
const KEY_RECEIPT: Record<number, string> = {
  1: "a", 10: "a", 20: "b", 21: "c", 30: "b", 40: "a", 41: "a", 50: "a", 60: "c",
  61: "c", 70: "d", 80: "b", 81: "c", 90: "b", 100: "d", 101: "a", 110: "c", 120: "b",
  121: "b", 130: "b", 140: "c", 141: "c", 150: "d", 160: "b", 161: "b", 170: "c",
  180: "b", 181: "a", 190: "a", 200: "a", 201: "b", 210: "c", 220: "c", 221: "a",
  228: "c", 230: "c", 240: "b", 241: "a", 250: "a", 260: "c", 261: "a", 270: "a",
  280: "b", 281: "d", 290: "b", 300: "d", 301: "a", 310: "d", 320: "a", 321: "b",
  330: "d", 340: "a", 341: "d", 350: "d", 360: "c",
};

const newLessons = bank.lessons.filter((l) => l.lesson >= 6 && l.lesson <= 23); // فقط جامع؛ l24 (r309) گاردِ خودش را دارد
const newQuestions = newLessons.flatMap((l) =>
  l.questions.map((q, k) => ({
    lesson: l.lesson,
    k, // ایندکس صفرمبنا در بانک
    printed360: printedOf(l.lesson, k),
    q,
  }))
);

/** شمارهٔ چاپیِ ۳۶۰تاییِ یک سؤال از درس/ایندکس — بانکِ ۱۲ (درس ۱۷) ۲۱ عضو دارد
 *  و توالیِ چاپیِ بانک‌های بعد را ۲۰ تا جابه‌جا می‌کند. */
function printedOf(lesson: number, k: number): number {
  if (lesson <= 16) return (lesson - 6) * 20 + k + 1; // l6: 1-20 … l16: 201-220
  if (lesson === 17) return 220 + k + 1; // k=0..19 → ۲۲۱-۲۴۰؛ k=20 → ۲۴۱ (نشانگرِ نمادینِ ۲۲۸x)
  return 220 + (lesson - 17) * 20 + k + 1; // l18: ۲۴۱-۲۶۰ … l23: ۳۴۱-۳۶۰
}

const L = (lesson: number) => newLessons.find((l) => l.lesson === lesson)!;

describe("jozve comprehensive360 g11 (r308 extraction receipt)", () => {
  it("bank shape: grade 11 now has 24 lessons — 18 comprehensive banks of 20 (bank 12 has 21) + r309 konkur vocab", () => {
    expect(bank.grade).toBe(11);
    expect(bank.lessons.map((l) => l.lesson)).toEqual(
      Array.from({ length: 42 }, (_, i) => i + 1) // r354: ۳۶ → ۴۲ با بانک‌های تشریحیِ گرامرِ l37..l42 (r312: l29..l36، r311: l25..l28)
    );
    for (const l of newLessons) {
      const want = l.lesson === 17 ? 21 : 20;
      expect(l.count, `lesson ${l.lesson}`).toBe(want);
      expect(l.questions, `lesson ${l.lesson}`).toHaveLength(want);
      expect(l.questions.map((q) => q.n), `lesson ${l.lesson}`).toEqual(
        Array.from({ length: want }, (_, i) => i + 1)
      );
      expect(l.level, `lesson ${l.lesson}`).toBe("جامع درس ۱ تا ۳");
    }
  });

  it("ids: g11-l6-1 .. g11-l23-20 unique across the whole bank — total 543 (r309 added l24)", () => {
    const all = bank.lessons.flatMap((l) => l.questions.map((q) => q.id));
    expect(new Set(all).size).toBe(all.length);
    expect(all).toHaveLength(40 + 40 + 40 + 22 + 20 + 20 + 361 + 57 + 114 + 68); // +۲۰: واژگان کنکوری درس دوم (r309)؛ +۶۸: تشریحی گرامر د۱ (r354)
    for (const l of newLessons) {
      expect(l.questions.map((q) => q.id)).toEqual(
        Array.from({ length: l.questions.length }, (_, i) => `g11-l${l.lesson}-${i + 1}`)
      );
    }
  });

  it("every comprehensive question: 4 unique options, valid answer, English purity, no translation", () => {
    for (const { q, lesson, k } of newQuestions) {
      expect(q.category, q.id).toBe("vocab");
      expect(q.options, q.id).toHaveLength(4);
      expect(new Set(q.options).size, q.id).toBe(4);
      q.options.forEach((o) => expect(o.length, `${q.id} opt`).toBeGreaterThan(0));
      expect(q.answer, q.id).toBeGreaterThanOrEqual(0);
      expect(q.answer, q.id).toBeLessThanOrEqual(3);
      expect(FA.test(q.question), `${q.id} «${q.question}»`).toBe(false);
      expect(FA.test(q.options.join(" ")), q.id).toBe(false);
      expect(q.translation, q.id).toBeUndefined(); // جزوه برای این بخش ترجمه چاپ نکرده
      expect("translation" in q, q.id).toBe(false);
      // خالیِ واژگانی: همه جز «Choose the odd word out.» باید خالی داشته باشند
      if (!(lesson === 23 && k === 0)) {
        expect(q.question, q.id).toMatch(/-{3,}/);
      }
    }
    // تنها استثنای بی‌خالی
    expect(L(23).questions[0].question).toBe("Choose the odd word out.");
  });

  it("printed key-grid fidelity: sampled answers match the hand-transcribed پاسخنامه کلیدی360", () => {
    for (const { q, lesson, k } of newQuestions) {
      const printed = printedOf(lesson, k);
      const want = KEY_RECEIPT[printed];
      if (want !== undefined && printed !== 241) {
        expect(q.answer, `${q.id} (printed Q${printed})`).toBe(LETTER_INDEX[want]);
      }
    }
  });

  it("duplicate printed 228: bank 12 (lesson 17) carries both bookleted variants, both keyed c", () => {
    const l17 = L(17);
    expect(l17.questions).toHaveLength(21);
    const inSeq = l17.questions[7]; // n=8 → چاپیِ ۲۲۸ (توالیِ ص۱۲۹)
    const outSeq = l17.questions[20]; // n=21 → چاپیِ ۲۲۸x (ص۱۲۸، بیرون از توالی)
    expect(inSeq.question).toContain("teaching system");
    expect(inSeq.options).toEqual(["scans", "visits", "varies", "quits"]);
    expect(inSeq.answer).toBe(2); // varies
    expect(outSeq.question).toContain("Ideas about childcare");
    expect(outSeq.options).toEqual(["habit", "development", "disagreement", "comprehension"]);
    expect(outSeq.answer).toBe(2); // disagreement — همان حرفِ c گرید
    expect(inSeq.question).not.toBe(outSeq.question);
    // رسیدِ داوری در source
    expect(bank.source.comprehensive360?.note).toContain("۲۲۸");
    expect(bank.source.comprehensive360?.note).toContain("دو سؤالِ متفاوت");
  });

  it("content spot-locks: two-row (Q6), vertical (Q100), slash (Q240), odd-word (Q341), normalization (Q58)", () => {
    // Q1 — کلید a = explain
    expect(L(6).questions[0].question).toContain("totally confused");
    expect(L(6).questions[0].options[0]).toBe("explain");
    expect(L(6).questions[0].answer).toBe(0);
    // Q6 — گزینه‌های دوردیفیِ چاپی کامل آمده‌اند
    expect(L(6).questions[5].options).toEqual([
      "run out of",
      "be familiar with",
      "take care of",
      "meet the needs of",
    ]);
    expect(L(6).questions[5].answer).toBe(3); // meet the needs of
    // Q58 — «؟» عربیِ چاپی به «?» لاتین یکدست شده
    expect(L(8).questions[17].question).toContain("computer software they use in the company?");
    expect(L(8).questions[17].question).not.toContain("؟");
    expect(L(8).questions[17].options[1]).toBe("familiar");
    // Q100 — بازسازیِ عمودی: جفت‌سازیِ مستقیمِ موقعیتی (d=products با کلید d)
    expect(L(10).questions[19].options).toEqual(["artifacts", "incomes", "customs", "products"]);
    expect(L(10).questions[19].answer).toBe(3);
    // Q217 — پرسشِ متضاد
    expect(L(16).questions[16].question).toContain("‘vast’ is the antonym of");
    expect(L(16).questions[16].options[1]).toBe("tiny");
    // Q240 — گزینه‌های اسلش‌دارِ دوردیفی
    expect(L(17).questions[19].options).toEqual([
      "give up / look for",
      "give up / look after",
      "give back / look for",
      "give back / look after",
    ]);
    expect(L(17).questions[19].answer).toBe(1); // give up / look after
    // Q299
    expect(L(20).questions[18].options[2]).toBe("increased");
    expect(L(20).questions[18].answer).toBe(2);
    // Q341 — odd word out با کلید d
    expect(L(23).questions[0].options[3]).toBe("cheap and expensive");
    expect(L(23).questions[0].answer).toBe(3);
    // Q360 — واپسین سؤال
    expect(L(23).questions[19].question).toContain("E-mail has become");
    expect(L(23).questions[19].options[2]).toBe("means");
    expect(L(23).questions[19].answer).toBe(2);
  });

  it("source receipt: question pages 118-135, key grid p204, round r308 — old entries intact", () => {
    const comp = bank.source.comprehensive360!;
    expect(comp.family).toBe("comprehensive360");
    expect(comp.questionPages).toBe("118-135");
    expect(comp.keyGrid).toContain("پاسخنامه کلیدی360");
    expect(comp.keyGrid).toContain("۳۶۰ جفت");
    expect(comp.extractedRound).toBe("r308");
    // بانک‌های قدیمی دست‌نخورده‌اند
    expect(bank.source.lessons.find((s) => s.lesson === 1)).toBeDefined();
    expect(bank.lessons[0].count).toBe(40);
    expect(bank.lessons[0].questions[0].translation).toBeDefined(); // ترجمهٔ درس ۱ سر جایش
  });

  it("UI manifest lock: jozve-view GRADE_TESTS[11] lists all 18 comprehensive banks", () => {
    const src = readFileSync(
      path.join(process.cwd(), "src/components/study/jozve/jozve-view.tsx"),
      "utf8"
    );
    expect(src).toContain('lesson: 6, title: "جامع ۳۶۰ — بانک ۱ (۱-۲۰)", count: 20');
    expect(src).toContain('lesson: 17, title: "جامع ۳۶۰ — بانک ۱۲ (۲۲۱-۲۴۰)", count: 21');
    expect(src).toContain('lesson: 23, title: "جامع ۳۶۰ — بانک ۱۸ (۳۴۱-۳۶۰)", count: 20');
    // بانک‌های قدیمیِ کارت دست‌نخورده‌اند + دکمهٔ ص۵۹ (r309) میانِ ص۲۱ و ص۹۳
    expect(src).toContain('lesson: 4, title: "تکمیلی درس اول (ص۲۱)", count: 22');
    expect(src).toContain('lesson: 24, title: "واژگان کنکوری درس دوم (ص۵۹)", count: 20');
    expect(src).toContain('lesson: 5, title: "تکمیلی درس سوم (ص۹۳)", count: 20');
  });
});
