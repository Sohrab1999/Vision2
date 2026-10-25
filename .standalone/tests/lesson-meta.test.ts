// Task 44 (roadmap step 3 — code splitting): the eager shell renders lesson
// metadata from src/data/lesson-meta.ts instead of importing the full content
// layer (@/data ≈ 500 KB). These tests pin every hardcoded value in that
// module to the real data, so a content edit that changes titles or counts
// fails here instead of silently showing stale numbers on the home screen.
//
// Round 191 («جزوه‌های بیشتر»): the shelf grew to SIX lessons — the Vision 2
// core (1-3) plus the complementary 12th-grade booklets (4-6). The pin below
// keeps the eager meta honest against the real data layer.
//
// Round 194 («قفسهٔ کامل»): the shelf is now NINE lessons — the Vision 1
// 10th-grade booklets (7-9) complete all three grades: دهم/یازدهم/دوازدهم.

import { describe, it, expect } from "vitest";
import {
  LESSONS_META,
  TOTAL_VOCABULARY,
  LESSON_QUIZ_COUNT,
  EXAM_BANK_SIZE,
  TOTAL_QUESTIONS,
  TOTAL_PAIRS,
  lessonMetaById,
  lessonOrdinalFa,
  lessonNameFa,
  lessonGradeFa,
} from "@/data/lesson-meta";
import { lessons, examBank } from "@/data";

describe("lesson-meta drift guard", () => {
  it("covers exactly the 12 book lessons, in order (six-grade shelf r198)", () => {
    expect(LESSONS_META.map((m) => m.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    expect(lessons.map((l) => l.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  it("matches every real lesson's identity fields (incl. grade)", () => {
    for (const meta of LESSONS_META) {
      const real = lessons.find((l) => l.id === meta.id);
      expect(real, `lesson ${meta.id} missing from @/data`).toBeDefined();
      expect(meta.titleEn).toBe(real!.titleEn);
      expect(meta.titleFa).toBe(real!.titleFa);
      expect(meta.tagline).toBe(real!.tagline);
      expect(meta.color).toBe(real!.color);
      expect(meta.grade).toBe(real!.grade);
    }
  });

  it("matches every real lesson's content counts", () => {
    for (const meta of LESSONS_META) {
      const real = lessons.find((l) => l.id === meta.id)!;
      expect(meta.vocabCount).toBe(real.vocabulary.length);
      expect(meta.quizCount).toBe(real.quizzes.length);
      expect(meta.grammarCount).toBe(real.grammar.length);
    }
  });

  it("pair wealth is pinned: pairCount = synonyms + antonyms rows (round 206)", () => {
    for (const meta of LESSONS_META) {
      const real = lessons.find((l) => l.id === meta.id)!;
      expect(meta.pairCount).toBe((real.synonyms ?? []).length + (real.antonyms ?? []).length);
    }
    expect(TOTAL_PAIRS).toBe(LESSONS_META.reduce((s, m) => s + m.pairCount, 0));
    expect(TOTAL_PAIRS).toBe(477); // the booklet's 298 syn + 179 ant rows
  });

  it("grades are pinned: 1-3 = یازدهم, 4-6 = دوازدهم, 7-9 = دهم, 10-12 = هفتم/هشتم/نهم (Prospect)", () => {
    for (const id of [1, 2, 3]) expect(lessons.find((l) => l.id === id)!.grade).toBe("یازدهم");
    for (const id of [4, 5, 6]) expect(lessons.find((l) => l.id === id)!.grade).toBe("دوازدهم");
    for (const id of [7, 8, 9]) expect(lessons.find((l) => l.id === id)!.grade).toBe("دهم");
    expect(lessons.find((l) => l.id === 10)!.grade).toBe("هفتم");
    expect(lessons.find((l) => l.id === 11)!.grade).toBe("هشتم");
    expect(lessons.find((l) => l.id === 12)!.grade).toBe("نهم");
    expect(lessonGradeFa(1)).toBe("یازدهم");
    expect(lessonGradeFa(3)).toBe("یازدهم");
    expect(lessonGradeFa(4)).toBe("دوازدهم");
    expect(lessonGradeFa(6)).toBe("دوازدهم");
    expect(lessonGradeFa(7)).toBe("دهم");
    expect(lessonGradeFa(9)).toBe("دهم");
    expect(lessonGradeFa(10)).toBe("هفتم");
    expect(lessonGradeFa(11)).toBe("هشتم");
    expect(lessonGradeFa(12)).toBe("نهم");
  });

  it("aggregates match the real data layer", () => {
    expect(TOTAL_VOCABULARY).toBe(lessons.reduce((s, l) => s + l.vocabulary.length, 0));
    expect(LESSON_QUIZ_COUNT).toBe(lessons.reduce((s, l) => s + l.quizzes.length, 0));
    expect(EXAM_BANK_SIZE).toBe(examBank.length);
    expect(TOTAL_QUESTIONS).toBe(LESSON_QUIZ_COUNT + EXAM_BANK_SIZE);
  });

  it("lessonMetaById resolves 1..12 and rejects the rest", () => {
    expect(lessonMetaById(1)?.titleFa).toBe("فهمیدن مردم");
    expect(lessonMetaById(2)?.color).toBe("amber");
    expect(lessonMetaById(3)?.color).toBe("rose");
    expect(lessonMetaById(4)?.titleEn).toBe("Sense of Appreciation");
    expect(lessonMetaById(5)?.titleEn).toBe("Look to the Future");
    expect(lessonMetaById(6)?.titleEn).toBe("Renewable Energy");
    expect(lessonMetaById(7)?.titleEn).toBe("Saving Nature");
    expect(lessonMetaById(7)?.color).toBe("orange");
    expect(lessonMetaById(8)?.titleEn).toBe("Wonders of Creation");
    expect(lessonMetaById(8)?.color).toBe("indigo");
    expect(lessonMetaById(9)?.titleEn).toBe("The Value of Knowledge");
    expect(lessonMetaById(9)?.color).toBe("fuchsia");
    expect(lessonMetaById(10)?.titleEn).toBe("Hello, English!");
    expect(lessonMetaById(10)?.color).toBe("pink");
    expect(lessonMetaById(10)?.grade).toBe("هفتم");
    expect(lessonMetaById(11)?.titleEn).toBe("My World");
    expect(lessonMetaById(11)?.color).toBe("blue");
    expect(lessonMetaById(11)?.grade).toBe("هشتم");
    expect(lessonMetaById(12)?.titleEn).toBe("People and Media");
    expect(lessonMetaById(12)?.color).toBe("purple");
    expect(lessonMetaById(12)?.grade).toBe("نهم");
    expect(lessonMetaById(0)).toBeUndefined();
    expect(lessonMetaById(13)).toBeUndefined();
  });

  it("Persian ordinal helpers cover all twelve lessons safely", () => {
    expect(lessonOrdinalFa(1)).toBe("اول");
    expect(lessonOrdinalFa(4)).toBe("چهارم");
    expect(lessonOrdinalFa(6)).toBe("ششم");
    expect(lessonOrdinalFa(7)).toBe("هفتم");
    expect(lessonOrdinalFa(9)).toBe("نهم");
    expect(lessonOrdinalFa(10)).toBe("دهم");
    expect(lessonOrdinalFa(11)).toBe("یازدهم");
    expect(lessonOrdinalFa(12)).toBe("دوازدهم");
    expect(lessonOrdinalFa(99)).toBe("۹۹"); // graceful fallback
    expect(lessonNameFa(4)).toBe("درس چهارم");
    expect(lessonNameFa(9)).toBe("درس نهم");
    expect(lessonNameFa(12)).toBe("درس دوازدهم");
  });
});
