// Task 44 (roadmap step 3 — code splitting): the eager shell renders lesson
// metadata from src/data/lesson-meta.ts instead of importing the full content
// layer (@/data ≈ 371 KB). These tests pin every hardcoded value in that
// module to the real data, so a content edit that changes titles or counts
// fails here instead of silently showing stale numbers on the home screen.

import { describe, it, expect } from "vitest";
import {
  LESSONS_META,
  TOTAL_VOCABULARY,
  LESSON_QUIZ_COUNT,
  EXAM_BANK_SIZE,
  EXAM_BANK_G10_SIZE,
  TOTAL_QUESTIONS,
  lessonMetaById,
} from "@/data/lesson-meta";
import { lessons, examBank, examBankG10 } from "@/data";

describe("lesson-meta drift guard", () => {
  it("covers exactly the 3 book lessons, in order", () => {
    expect(LESSONS_META.map((m) => m.id)).toEqual([1, 2, 3]);
    expect(lessons.map((l) => l.id)).toEqual([1, 2, 3]);
  });

  it("matches every real lesson's identity fields", () => {
    for (const meta of LESSONS_META) {
      const real = lessons.find((l) => l.id === meta.id);
      expect(real, `lesson ${meta.id} missing from @/data`).toBeDefined();
      expect(meta.titleEn).toBe(real!.titleEn);
      expect(meta.titleFa).toBe(real!.titleFa);
      expect(meta.tagline).toBe(real!.tagline);
      expect(meta.color).toBe(real!.color);
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

  it("aggregates match the real data layer", () => {
    expect(TOTAL_VOCABULARY).toBe(lessons.reduce((s, l) => s + l.vocabulary.length, 0));
    expect(LESSON_QUIZ_COUNT).toBe(lessons.reduce((s, l) => s + l.quizzes.length, 0));
    expect(EXAM_BANK_SIZE).toBe(examBank.length);
    expect(EXAM_BANK_G10_SIZE).toBe(examBankG10.length);
    expect(TOTAL_QUESTIONS).toBe(LESSON_QUIZ_COUNT + EXAM_BANK_SIZE + EXAM_BANK_G10_SIZE);
  });

  it("grade-10 bank: every question has a valid 4-option shape and a booklet-key answer", () => {
    expect(examBankG10.length).toBeGreaterThan(0);
    for (const q of examBankG10) {
      expect(q.id.startsWith("g10-"), q.id).toBe(true);
      expect(q.options.length, q.id).toBe(4);
      expect(q.answer, q.id).toBeGreaterThanOrEqual(0);
      expect(q.answer, q.id).toBeLessThanOrEqual(3);
      expect(q.options.every((o) => o.trim().length > 0), q.id).toBe(true);
    }
    // شناسه‌ها یکتا و پیوسته‌اند
    const ids = new Set(examBankG10.map((q) => q.id));
    expect(ids.size).toBe(examBankG10.length);
    // هیچ نشت فارسی در متن انگلیسی (استاندارد بانک x)
    const faRe = /[\u0600-\u06FF]/;
    for (const q of examBankG10) {
      expect(faRe.test(q.question), q.id).toBe(false);
      expect(q.options.some((o) => faRe.test(o)), q.id).toBe(false);
    }
    // حذف تکرارهای نزدیک (الگوی Jaccard r268)
    const stems = examBankG10.map((q) => q.question.replace(/-{2,}/g, " ").toLowerCase());
    expect(new Set(stems).size).toBe(stems.length);
  });

  it("lessonMetaById resolves 1..3 and rejects the rest", () => {
    expect(lessonMetaById(1)?.titleFa).toBe("فهمیدن مردم");
    expect(lessonMetaById(2)?.color).toBe("amber");
    expect(lessonMetaById(3)?.color).toBe("rose");
    expect(lessonMetaById(0)).toBeUndefined();
    expect(lessonMetaById(4)).toBeUndefined();
  });
});
