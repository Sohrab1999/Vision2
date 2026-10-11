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

describe("data — درس‌های PPP خط‌های ۱ و ۲", () => {
  const stationIds = GRAMMAR_LINES.flatMap((l) => l.stations.map((s) => s.id));

  it("هر ایستگاه خط‌های ۱ و ۲ درس دارد؛ بقیه ندارند", () => {
    const line12 = GRAMMAR_LINES.filter((l) => l.id <= 2).flatMap((l) => l.stations.map((s) => s.id));
    for (const id of line12) expect(lessonFor(id), id).not.toBeNull();
    const after = GRAMMAR_LINES.filter((l) => l.id > 2).flatMap((l) => l.stations.map((s) => s.id));
    for (const id of after) expect(lessonFor(id), id).toBeNull();
  });

  it("stationId هر درس به ایستگاه واقعی نقشه اشاره می‌کند", () => {
    for (const l of GRAMMAR_MICRO_LESSONS) {
      expect(stationIds).toContain(l.stationId);
    }
  });

  it("یککتایی stationId و ترتیب درس‌ها با ترتیب ایستگاه‌های نقشه هم‌خوان است", () => {
    const ids = GRAMMAR_MICRO_LESSONS.map((l) => l.stationId);
    expect(new Set(ids).size).toBe(ids.length);
    // ایستگاه‌های خط ۱ و ۲ به ترتیب خودشان
    const expected = GRAMMAR_LINES.filter((l) => l.id <= 2)
      .flatMap((l) => l.stations.map((s) => s.id))
      .filter((id) => ids.includes(id));
    expect(ids).toEqual(expected);
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
    // g-order گذشتهٔ ساده دارد → نوار زمان
    expect(lessonFor("g-order")?.see.timebar).toBeDefined();
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

  it("خط‌های کامل‌درس‌دار فقط خط ۱ و ۲ هستند", () => {
    expect(lineIdsWithLessons()).toEqual([1, 2]);
  });

  it("stationIdsWithLesson دقیقاً ایستگاه‌های درس‌دار را برمی‌گرداند", () => {
    const set = stationIdsWithLesson();
    expect(set.size).toBe(GRAMMAR_MICRO_LESSONS.length);
    expect(set.has("g-order")).toBe(true);
    expect(set.has("g-numbers")).toBe(true);
    expect(set.has("g-present-perfect")).toBe(false);
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
