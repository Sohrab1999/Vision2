import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

// =====================================================================
// r309 — گاردِ «۲۰ تست استاندارد و کنکوری واژگان درس دوم — پایه یازدهم» (ص۵۹)
// حلقهٔ گمشدهٔ سه‌گانهٔ «تست واژگان کنکوری» جزوهٔ یازدهم: ص۲۱ (l4) / ص۵۹ (l24) / ص۹۳ (l5)
// منبع: سؤال‌ها PDF ص۵۹؛ گریدِ کلیدِ چاپی «Vocabulary Tests (lesson 2)» انتهای ص۱۸۶
//   (سربرگِ خودِ بانک ارجاع می‌دهد: «پاسخنامه کلیدی: انتهای صفحه ۱۸۶»).
// کلید: گریدِ شماره-اولِ چاپی + داوریِ دومِ رونویسیِ دستیِ چاپ + داوریِ معنایی.
// بازاستفادهٔ خودِ جزوه: ۶ ساقه با بانک جامع ۳۶۰ مشترک است (l10/l19/l21/l22/l23) —
//   گاردِ برابریِ بین‌بانکی (الگوی r306)؛ Q14 «form» تایپوی خودِ چاپ است (ERRATA ر۲۷۹).
// ترجمه چاپ نشده — پس بانک هم ترجمه ندارد (الگوی صادقانهٔ r278).
// رسیدِ استخراج: scripts/jozve-g11-konkur-vocab-r309.py
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
  count: number;
  questions: BankQuestion[];
}
interface Bank {
  grade: number;
  source: {
    file: string;
    lessons: { lesson: number; questionPages: string; key: string }[];
    comprehensive360?: { note?: string };
    konkurVocab2?: {
      family: string;
      printedHeader: string;
      questionPage: string;
      keyGridPage: string;
      keyGridAnchor: string;
      printErrata: { q: number; printed: string; why: string }[];
      crossBankDuplicates: { l24q: number; twin: string; note: string }[];
      extractedRound: string;
    };
  };
  lessons: BankLesson[];
}

const bank: Bank = JSON.parse(
  readFileSync(path.join(process.cwd(), "public/jozve/tests-g11.json"), "utf8")
);

const FA = /[\u0600-\u06FF]/;
const BLANK_OK = /(?:^|\s)-{5,}(?=$|[\s,.!?;:])/;
const LETTER_INDEX: Record<string, number> = { a: 0, b: 1, c: 2, d: 3 };

// گریدِ کلید چاپی ص۱۸۶ — عیناً از چاپ رونویسی شده (1 b 6 a 11 c 16 a / 2 a 7 a 12 c 17 d /
// 3 d 8 d 13 b 18 b / 4 b 9 d 14 c 19 c / 5 b 10 c 15 a 20 a) — رسیدِ r309
const KEY_L24 = "b a d b b a a d d c c c b c a a d b c a".split(" ");

const l24 = bank.lessons.find((l) => l.lesson === 24)!;
const byId = (twin: string) =>
  bank.lessons.flatMap((l) => l.questions).find((q) => q.id === twin)!;

const normStem = (s: string) => s.replace(/-{3,}/g, " ").replace(/\s+/g, " ").trim().toLowerCase();

describe("jozve konkur-vocab lesson-2 g11 (r309 extraction receipt)", () => {
  it("bank shape: grade 11 now has 24 lessons — the p59 bank completes the konkur-vocab trio p21/p59/p93", () => {
    expect(bank.grade).toBe(11);
    expect(bank.lessons.map((l) => l.lesson)).toEqual([
      1, 2, 3, 4, 5,
      // r308 — ۱۸ بانکِ «آزمون جامع ۳۶۰ واژگان» (درس ۶..۲۳)
      ...Array.from({ length: 18 }, (_, i) => i + 6),
      // r309 — واژگان کنکوری درس دوم (ص۵۹) با شناسهٔ ۲۴ (ترتیبِ JSON عددی است؛
      // ترتیبِ نمایشیِ UI با مانیفست ص۵۹ میانِ ص۲۱ و ص۹۳ می‌آید)
      24,
      // r311 — «آزمون تشریحی واژگان درس اول» (ص۱۶-۱۸، کلید واژه‌ای ص۱۷۶) — l25..l28 الحاق شد
      25, 26, 27, 28,
      // r312 — «آزمون تشریحی واژگان درس دوم/سوم» (ص۵۴-۵۶/ص۸۸-۹۰، کلیدهای ص۱۸۴/ص۱۹۳) — l29..l36 الحاق شد
      29, 30, 31, 32, 33, 34, 35, 36,
      // r354 — «آزمون تشریحی گرامر درس اول» (ص۲۹-۳۱) — l37..l42 الحاق شد
      37, 38, 39, 40, 41, 42,
      // r355 — «آزمون جامع تشریحی درس اول» (ص۴۰-۴۲) — l43..l55 الحاق شد
      43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55,
      // r356 — «آزمون تشریحی گرامر درس دوم» (ص۶۳-۶۴) — l56..l59 الحاق شد
      56, 57, 58, 59,
    ]);
    expect(l24.count).toBe(20);
    expect(l24.questions).toHaveLength(20);
    expect(l24.questions.map((q) => q.n)).toEqual(Array.from({ length: 20 }, (_, i) => i + 1));
    expect(l24.title).toBe("واژگان کنکوری درس دوم (ص۵۹)");
  });

  it("ids: g11-l24-1..20, unique across the whole bank — total 839", () => {
    expect(l24.questions.map((q) => q.id)).toEqual(
      Array.from({ length: 20 }, (_, i) => `g11-l24-${i + 1}`)
    );
    const all = bank.lessons.flatMap((l) => l.questions.map((q) => q.id));
    expect(new Set(all).size).toBe(all.length);
    expect(all).toHaveLength(40 + 40 + 40 + 22 + 20 + 20 + 361 + 57 + 114 + 68 + 57 + 54); // +۲۰: واژگان کنکوری درس دوم (r309)؛ +۶۸: تشریحی گرامر د۱ (r354)؛ +۵۷: جامع تشریحی د۱ (r355)؛ +۵۴: تشریحی گرامر د۲ (r356)
  });

  it("every p59 question: 4 unique options, valid answer, healthy blank, English purity, no translation", () => {
    for (const q of l24.questions) {
      expect(q.category, q.id).toBe("vocab");
      expect(q.options, q.id).toHaveLength(4);
      expect(new Set(q.options).size, q.id).toBe(4);
      q.options.forEach((o) => expect(o.length, `${q.id} opt`).toBeGreaterThan(0));
      expect(q.answer, q.id).toBeGreaterThanOrEqual(0);
      expect(q.answer, q.id).toBeLessThanOrEqual(3);
      expect(BLANK_OK.test(q.question), `${q.id} «${q.question}»`).toBe(true);
      expect(FA.test(q.question), q.id).toBe(false);
      expect(FA.test(q.options.join(" ")), q.id).toBe(false);
      expect(q.translation, q.id).toBeUndefined(); // جزوه برای این بخش ترجمه چاپ نکرده
      expect("translation" in q, q.id).toBe(false);
    }
  });

  it("printed key-grid fidelity: every answer matches the booklet's own Vocabulary Tests (lesson 2) grid", () => {
    l24.questions.forEach((q, i) => expect(q.answer, q.id).toBe(LETTER_INDEX[KEY_L24[i]]));
  });

  it("semantic arbitration: the keyed option word is the visually verified answer", () => {
    const keyed = (n: number) => l24.questions[n - 1].options[l24.questions[n - 1].answer];
    expect(keyed(1)).toBe("takes"); // it is time he --- life more seriously
    expect(keyed(2)).toBe("emotional");
    expect(keyed(3)).toBe("look after");
    expect(keyed(4)).toBe("disease");
    expect(keyed(5)).toBe("emergency");
    expect(keyed(7)).toBe("details");
    expect(keyed(10)).toBe("physical");
    expect(keyed(13)).toBe("mission");
    expect(keyed(14)).toBe("prevent");
    expect(keyed(17)).toBe("diet");
    expect(keyed(19)).toBe("blood pressure");
    expect(keyed(20)).toBe("couch potato");
  });

  it("six booklet-internal stem reuses: l24 stem equals its comprehensive-360 twin (and keyed word where order differs)", () => {
    const twins: [number, string][] = [
      [7, "g11-l22-9"],
      [9, "g11-l22-7"],
      [12, "g11-l21-13"],
      [13, "g11-l23-14"],
      [14, "g11-l10-17"],
      [15, "g11-l19-7"],
    ];
    for (const [n, twin] of twins) {
      const q = l24.questions[n - 1];
      const t = byId(twin);
      expect(normStem(q.question), `l24-Q${n} ↔ ${twin}`).toBe(normStem(t.question));
      expect(q.options[q.answer], `l24-Q${n} keyed word`).toBe(t.options[t.answer]);
    }
    // و سؤال‌های دیگرِ l24 باید در جامع تکراری نباشند (۱۴ ساقهٔ تازه)
    const compStems = new Set(
      bank.lessons
        .filter((l) => l.lesson >= 6 && l.lesson <= 23)
        .flatMap((l) => l.questions.map((q) => normStem(q.question)))
    );
    let reused = 0;
    for (const q of l24.questions) if (compStems.has(normStem(q.question))) reused += 1;
    expect(reused).toBe(6);
  });

  it("Q14 print errata is kept faithful («form» is the booklet's own typo — جامع l10-17 prints it too)", () => {
    expect(l24.questions[13].question).toContain("the illness form getting worse");
    expect(l24.questions[13].answer).toBe(2); // prevent
    const err = bank.source.konkurVocab2?.printErrata ?? [];
    const e14 = err.find((e) => e.q === 14);
    expect(e14).toBeDefined();
    expect(e14!.printed).toContain("form");
    expect(e14!.why).toContain("ERRATA");
  });

  it("source receipt: p59 questions, p186 grid, family named, six cross-bank duplicates declared", () => {
    const s24 = bank.source.lessons.find((s) => s.lesson === 24)!;
    expect(s24.questionPages).toBe("59");
    expect(s24.key).toContain("Vocabulary Tests (lesson 2)");
    expect(s24.key).toContain("ص۱۸۶");
    const kv2 = bank.source.konkurVocab2!;
    expect(kv2.family).toBe("konkur-vocab-lesson2");
    expect(kv2.questionPage).toBe("59");
    expect(kv2.keyGridPage).toBe("186");
    expect(kv2.printedHeader).toContain("استاندارد و کنکوری واژگان");
    expect(kv2.extractedRound).toBe("r309");
    expect(kv2.crossBankDuplicates).toHaveLength(6);
    // بانک‌های قدیمی دست‌نخورده مانده‌اند
    expect(bank.source.lessons.find((s) => s.lesson === 4)!.key).toContain("22تست واژگان درس اول");
    expect(bank.source.comprehensive360?.note).toContain("۲۲۸");
  });

  it("UI manifest lock: jozve-view GRADE_TESTS[11] shows the p59 button between p21 and p93 — 24 buttons", () => {
    const src = readFileSync(
      path.join(process.cwd(), "src/components/study/jozve/jozve-view.tsx"),
      "utf8"
    );
    const i4 = src.indexOf('lesson: 4, title: "تکمیلی درس اول (ص۲۱)", count: 22');
    const i24 = src.indexOf('lesson: 24, title: "واژگان کنکوری درس دوم (ص۵۹)", count: 20');
    const i5 = src.indexOf('lesson: 5, title: "تکمیلی درس سوم (ص۹۳)", count: 20');
    expect(i4).toBeGreaterThan(-1);
    expect(i24).toBeGreaterThan(i4);
    expect(i5).toBeGreaterThan(i24); // ترتیبِ کتابت: ص۲۱ < ص۵۹ < ص۹۳
    expect(src).toContain('lesson: 23, title: "جامع ۳۶۰ — بانک ۱۸ (۳۴۱-۳۶۰)", count: 20');
  });
});
