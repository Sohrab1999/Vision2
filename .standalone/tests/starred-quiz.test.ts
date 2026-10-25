// tests for «مرور واژه‌های نشان‌شده» — buildStarredQuiz (lib/starred-quiz.ts)

import { describe, it, expect } from "vitest";
import { buildStarredQuiz, type StarredQuizWord } from "@/lib/starred-quiz";
import { lessons } from "@/data";

const word = (lessonId: number, en: string): StarredQuizWord => {
  const l = lessons.find((x) => x.id === lessonId)!;
  const v = l.vocabulary.find((w) => w.en.toLowerCase() === en.toLowerCase())!;
  return { key: `${lessonId}:${v.en.toLowerCase()}`, lessonId, en: v.en, fa: v.fa };
};

describe("buildStarredQuiz", () => {
  it("produces one question per word, capped at max", () => {
    const words = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => word(1, lessonEnAt(1, n)));
    const quiz = buildStarredQuiz(words, 8);
    expect(quiz.questions).toHaveLength(8);
    // every input word appears (cap drops the tail)
    expect(quiz.lessonOf.size).toBe(8);
  });

  it("every question has exactly 4 unique options with the answer inside", () => {
    const words = [1, 2, 3, 4, 5, 6].map((n) => word(1, lessonEnAt(1, n)));
    const quiz = buildStarredQuiz(words);
    for (const q of quiz.questions) {
      expect(q.options).toHaveLength(4);
      expect(new Set(q.options).size).toBe(4);
      expect(q.options[q.answer]).toBeTruthy();
      expect(q.answer).toBeGreaterThanOrEqual(0);
      expect(q.answer).toBeLessThan(4);
    }
  });

  it("EN→FA drills are flagged in faOptions and their answer IS the word's fa", () => {
    // find words with no real bank question to force synthesized drills
    const used = new Set<string>();
    const words: StarredQuizWord[] = [];
    for (const l of lessons) {
      for (const v of l.vocabulary) {
        words.push(word(l.id, v.en));
        if (words.length >= 40) break;
      }
      if (words.length >= 40) break;
    }
    const quiz = buildStarredQuiz(words, 40);
    let drillChecks = 0;
    for (const q of quiz.questions) {
      if (quiz.faOptions.has(q.id)) {
        drillChecks++;
        // the correct option must be the Persian meaning of the tested word
        const lessonId = quiz.lessonOf.get(q.id)!;
        const w = words.find((x) => x.lessonId === lessonId && q.translation?.includes(x.en));
        if (w) expect(q.options[q.answer]).toBe(w.fa);
      }
    }
    expect(drillChecks).toBeGreaterThan(0);
    void used;
  });

  it("FA→EN drills keep English options", () => {
    const words = [1, 2, 3, 4, 5, 6].map((n) => word(1, lessonEnAt(1, n)));
    const quiz = buildStarredQuiz(words, 6);
    for (const q of quiz.questions) {
      if (!quiz.faOptions.has(q.id)) {
        // real bank questions may have Persian options in konkur style —
        // but FA→EN synthesized ids carry -rev-
        if (q.id.includes("-rev-")) {
          for (const opt of q.options) expect(opt).toMatch(/^[A-Za-z]/);
        }
      }
    }
  });

  it("no duplicate question ids across the session", () => {
    const words = [1, 2, 3, 4, 5, 6, 7, 8].map((n) => word(1, lessonEnAt(1, n)));
    const quiz = buildStarredQuiz(words, 8);
    const ids = new Set(quiz.questions.map((q) => q.id));
    expect(ids.size).toBe(quiz.questions.length);
  });

  it("prefers a real bank question when the word has one", () => {
    // find a lesson word whose exact en matches some bank question option
    let found: StarredQuizWord | null = null;
    for (const l of lessons) {
      for (const q of l.quizzes) {
        if (q.category !== "vocab" && q.category !== "vocab-konkuri") continue;
        const correct = (q.options[q.answer] ?? "").toLowerCase();
        const v = l.vocabulary.find((w) => w.en.toLowerCase() === correct);
        if (v) {
          found = word(l.id, v.en);
          break;
        }
      }
      if (found) break;
    }
    if (!found) return; // no exact-match bank question in content — skip
    const quiz = buildStarredQuiz([found]);
    expect(quiz.questions).toHaveLength(1);
    // real bank question ids never carry the -star- drill marker
    expect(quiz.questions[0].id.includes("-star-")).toBe(false);
    expect(quiz.faOptions.size).toBe(0);
  });

  it("distractors never duplicate the tested meaning", () => {
    const words = [1, 2, 3, 4, 5, 6].map((n) => word(1, lessonEnAt(1, n)));
    const quiz = buildStarredQuiz(words, 6);
    for (const q of quiz.questions) {
      if (!quiz.faOptions.has(q.id)) continue;
      const correct = q.options[q.answer];
      expect(q.options.filter((o) => o === correct)).toHaveLength(1);
    }
  });

  it("lessonOf maps every question to a valid lesson", () => {
    const words = [word(1, lessonEnAt(1, 1)), word(2, lessonEnAt(2, 1)), word(3, lessonEnAt(3, 1))];
    const quiz = buildStarredQuiz(words, 3);
    for (const lid of quiz.lessonOf.values()) {
      expect([1, 2, 3]).toContain(lid);
    }
  });
});

/** nth vocabulary word of a lesson (test fixture helper) */
function lessonEnAt(lessonId: number, n: number): string {
  const l = lessons.find((x) => x.id === lessonId)!;
  return l.vocabulary[n % l.vocabulary.length].en;
}
