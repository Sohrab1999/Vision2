// Task 44 (roadmap step 3 — code splitting): the eager shell renders lesson
// metadata from src/data/lesson-meta.ts instead of importing the full content
// layer (@/data ≈ 500 KB). These tests pin every hardcoded value in that
// module to the real data, so a content edit that changes titles or counts
// fails here instead of silently showing stale numbers on the home screen.
//
// Round 191 («جزوه‌های بیشتر»): the shelf grew to SIX lessons — the Vision 2
// core (1-3) plus the complementary 12th-grade booklets (4-6). The pin below
// keeps the eager meta honest against the real data layer.

import { describe, it, expect } from "vitest";
import {
  LESSONS_META,
  TOTAL_VOCABULARY,
  LESSON_QUIZ_COUNT,
  EXAM_BANK_SIZE,
  TOTAL_QUESTIONS,
  lessonMetaById,
  lessonOrdinalFa,
  lessonNameFa,
  lessonGradeFa,
} from "@/data/lesson-meta";
import { lessons, examBank } from "@/data";

describe("lesson-meta drift guard", () => {
  it("covers exactly the 6 book lessons, in order", () => {
    expect(LESSONS_META.map((m) => m.id)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(lessons.map((l) => l.id)).toEqual([1, 2, 3, 4, 5, 6]);
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

  it("grades are pinned: 1-3 = یازدهم (core booklet), 4-6 = دوازدهم (complementary)", () => {
    for (const id of [1, 2, 3]) expect(lessons.find((l) => l.id === id)!.grade).toBe("یازدهم");
    for (const id of [4, 5, 6]) expect(lessons.find((l) => l.id === id)!.grade).toBe("دوازدهم");
    expect(lessonGradeFa(1)).toBe("یازدهم");
    expect(lessonGradeFa(3)).toBe("یازدهم");
    expect(lessonGradeFa(4)).toBe("دوازدهم");
    expect(lessonGradeFa(6)).toBe("دوازدهم");
  });

  it("aggregates match the real data layer", () => {
    expect(TOTAL_VOCABULARY).toBe(lessons.reduce((s, l) => s + l.vocabulary.length, 0));
    expect(LESSON_QUIZ_COUNT).toBe(lessons.reduce((s, l) => s + l.quizzes.length, 0));
    expect(EXAM_BANK_SIZE).toBe(examBank.length);
    expect(TOTAL_QUESTIONS).toBe(LESSON_QUIZ_COUNT + EXAM_BANK_SIZE);
  });

  it("lessonMetaById resolves 1..6 and rejects the rest", () => {
    expect(lessonMetaById(1)?.titleFa).toBe("فهمیدن مردم");
    expect(lessonMetaById(2)?.color).toBe("amber");
    expect(lessonMetaById(3)?.color).toBe("rose");
    expect(lessonMetaById(4)?.titleEn).toBe("Sense of Appreciation");
    expect(lessonMetaById(5)?.titleEn).toBe("Look to the Future");
    expect(lessonMetaById(6)?.titleEn).toBe("Renewable Energy");
    expect(lessonMetaById(0)).toBeUndefined();
    expect(lessonMetaById(7)).toBeUndefined();
  });

  it("Persian ordinal helpers cover all six lessons safely", () => {
    expect(lessonOrdinalFa(1)).toBe("اول");
    expect(lessonOrdinalFa(4)).toBe("چهارم");
    expect(lessonOrdinalFa(6)).toBe("ششم");
    expect(lessonOrdinalFa(99)).toBe("۹۹"); // graceful fallback
    expect(lessonNameFa(4)).toBe("درس چهارم");
  });
});
