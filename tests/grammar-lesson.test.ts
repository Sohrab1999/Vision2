// ---------------------------------------------------------------------
// تست‌های درس‌های ۹۰ثانیه‌ای متروی گرامر — Task 40 / مرحلهٔ ۲ «چشم‌ها»
// ---------------------------------------------------------------------

import { describe, it, expect } from "vitest";
import { GRAMMAR_MICRO_LESSONS } from "@/data/grammar-lessons";
import { GRAMMAR_LINES } from "@/data/grammar-map";
import {
  LESSON_TRY_COUNT,
  lessonFor,
  lessonKey,
  stationIdsWithLesson,
  lineIdsWithLessons,
  tryPercent,
  whyAnswer,
  validateLesson,
  ROLE_CLASSES,
} from "@/lib/grammar-lesson";

describe("data — درس‌های PPP تمام خط‌ها (راند ۱۹۶: پوشش ۳۴/۳۴)", () => {
  const stationIds = GRAMMAR_LINES.flatMap((l) => l.stations.map((s) => s.id));

  it("هر ۳۴ ایستگاه نقشه درس دارد", () => {
    for (const id of stationIds) expect(lessonFor(id), id).not.toBeNull();
  });

  it("درس‌های خط‌های ۳-۶ محتوای واقعی کتاب را پوشش می‌دهند (کاوش اِلِمانی)", () => {
    // خط ۳: حال کامل — have/has + p.p. و سرنخ‌ها
    const pp = lessonFor("g-present-perfect")!;
    expect(pp.see.pieces.some((p) => p.text === "have")).toBe(true);
    expect(pp.see.pieces.some((p) => p.text === "lived")).toBe(true);
    expect(pp.see.timebar).toBeDefined();
    expect(pp.try.some((q) => q.options.includes("has just cooked"))).toBe(true);
    // خط ۴: فعل دوکلمه‌ای — ضمیر وسط در جدا شدنی، چسبیدگی در جدا نشدنی
    const sep = lessonFor("g-phrasal-sep")!;
    expect(sep.try.some((q) => q.options.includes("pick them up"))).toBe(true);
    const insep = lessonFor("g-phrasal-insep")!;
    expect(insep.see.pieces.some((p) => p.text === "looks after")).toBe(true);
    // خط ۵: شرطی نوع اول — بعد از if حال ساده
    const cond = lessonFor("g-cond1")!;
    expect(cond.try.some((q) => q.options.includes("rains"))).toBe(true);
    // خط ۶: پیشوند — impossible با im-
    const prefix = lessonFor("g-prefix")!;
    expect(prefix.try.some((q) => q.options.includes("impossible"))).toBe(true);
  });

  it("stationId هر درس به ایستگاه واقعی نقشه اشاره می‌کند", () => {
    for (const l of GRAMMAR_MICRO_LESSONS) {
      expect(stationIds).toContain(l.stationId);
    }
  });

  it("یککتایی stationId و ترتیب درس‌ها با ترتیب کامل ایستگاه‌های نقشه هم‌خوان است", () => {
    const ids = GRAMMAR_MICRO_LESSONS.map((l) => l.stationId);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toEqual(stationIds); // درس‌ها دقیقاً به ترتیب نقشه، بدون جا و اضافه
  });

  it("همهٔ درس‌ها ساختار کامل PPP دارند", () => {
    for (const l of GRAMMAR_MICRO_LESSONS) {
      expect(validateLesson(l), l.stationId).toEqual([]);
    }
  });

  it("جملهٔ «ببین» از نقش‌های شناخته‌شده ساخته شده و تکه‌ها متن دارند", () => {
    for (const l of GRAMMAR_MICRO_LESSONS) {
      for (const p of l.see.pieces) {
        expect(ROLE_CLASSES[p.role]).toBeDefined();
        expect(p.text.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it("نوار زمان فقط در درس‌های زمان‌محور مجاز است و در بازهٔ ۰-۱۰۰ است", () => {
    for (const l of GRAMMAR_MICRO_LESSONS) {
      if (l.see.timebar) {
        expect(l.see.timebar.marker).toBeGreaterThanOrEqual(0);
        expect(l.see.timebar.marker).toBeLessThanOrEqual(100);
      }
    }
    // g-order گذشتهٔ ساده و g-present-perfect پل گذشته‌تاحالا → هر دو نوار زمان
    expect(lessonFor("g-order")?.see.timebar).toBeDefined();
    expect(lessonFor("g-present-perfect")?.see.timebar).toBeDefined();
    // درس‌های غیرزمانی نوار زمان ندارند
    expect(lessonFor("g-cond1")?.see.timebar).toBeUndefined();
    expect(lessonFor("g-prefix")?.see.timebar).toBeUndefined();
  });

  it("گزینهٔ درست هر سؤال «امتحان کن» از بقیه فرق دارد (تلهٔ گزینه‌های تکراری)", () => {
    for (const l of GRAMMAR_MICRO_LESSONS) {
      for (const [qi, q] of l.try.entries()) {
        expect(new Set(q.options).size, `${l.stationId} سؤال ${qi + 1}`).toBe(q.options.length);
      }
    }
  });

  it("ایندکس‌های جواب در هر درس همه یک عدد نیستند (ضد حدس‌زدن الگو‌وار)", () => {
    for (const l of GRAMMAR_MICRO_LESSONS) {
      const answers = new Set(l.try.map((q) => q.answer));
      expect(answers.size, l.stationId).toBeGreaterThan(1);
    }
  });

  it("غلط کلاسیک هر آینه با درستِ آن فرق دارد", () => {
    for (const l of GRAMMAR_MICRO_LESSONS) {
      for (const m of l.mirrors) {
        expect(m.mistake.wrong).not.toBe(m.mistake.right);
        expect(m.mistake.why.length).toBeGreaterThan(10);
      }
    }
  });
});

describe("قراردادهای خالص grammar-lesson", () => {
  it("کلید نتیجهٔ درس در فضای نام g:ls: است و با کلید ایستگاه تداخل ندارد", () => {
    expect(lessonKey("g-count")).toBe("g:ls:g-count");
    expect(lessonKey("g-count")).not.toBe("g:g-count");
    expect(lessonKey("g-count")).not.toBe("g:probe:l1");
  });

  it("tryPercent محاسبهٔ درست و گارد تقسیم بر صفر دارد", () => {
    expect(tryPercent(3, LESSON_TRY_COUNT)).toBe(100);
    expect(tryPercent(2, 3)).toBe(67);
    expect(tryPercent(0, 3)).toBe(0);
    expect(tryPercent(1, 0)).toBe(0);
  });

  it("whyAnswer قالب ثابت «چون …» دستیار چرا؟ را می‌سازد", () => {
    expect(whyAnswer("water غیرقابل شمارش است")).toBe("چون water غیرقابل شمارش است");
  });

  it("خط‌های کامل‌درس‌دار حالا هر ۱۱ خط نقشه است", () => {
    expect(lineIdsWithLessons()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  });

  it("درس‌های ایستگاه‌های تازهٔ سه‌پایه محتوای کتاب را پوشش می‌دهند (کاوش اِلِمانی)", () => {
    // خط ۷: مجهول — be + p.p. و مفعولِ بالا آمده
    const passive = lessonFor("g-passive-base")!;
    expect(passive.see.pieces.some((p) => p.text === "is grown")).toBe(true);
    expect(passive.try.some((q) => q.options.includes("is spoken"))).toBe(true);
    const modal = lessonFor("g-passive-modal")!;
    expect(modal.try.some((q) => q.options.includes("cannot be solved"))).toBe(true);
    // خط ۸: نقل قول — عقب‌رفتِ زمان و حذفِ did
    const rep = lessonFor("g-report-statements")!;
    expect(rep.try.some((q) => q.options.includes("would come"))).toBe(true);
    // خط ۱۱: آینده — will و be going to
    const will = lessonFor("g-future-will")!;
    expect(will.see.pieces.some((p) => p.text === "I will help you")).toBe(true);
    const going = lessonFor("g-future-going")!;
    expect(going.try.some((q) => q.options.includes("is going to"))).toBe(true);
  });

  it("stationIdsWithLesson دقیقاً ایستگاه‌های درس‌دار را برمی‌گرداند", () => {
    const set = stationIdsWithLesson();
    expect(set.size).toBe(GRAMMAR_MICRO_LESSONS.length);
    expect(set.has("g-order")).toBe(true);
    expect(set.has("g-numbers")).toBe(true);
    expect(set.has("g-present-perfect")).toBe(true);
    expect(set.has("g-suffix")).toBe(true);
  });

  it("validateLesson خرابی‌ها را گزارش می‌کند نه اینکه کرش کند", () => {
    const broken = lessonFor("g-count")!;
    const bad = {
      ...broken,
      try: [{ ...broken.try[0], prompt: "بدون جای خالی", answer: 99 }],
      mirrors: [],
      see: { ...broken.see, pieces: [] },
    };
    const errs = validateLesson(bad as typeof broken);
    expect(errs.length).toBeGreaterThanOrEqual(4);
  });
});
