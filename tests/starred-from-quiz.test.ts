// tests for «ستاره از نتیجهٔ آزمون» — starrableWord (lib/starred-from-quiz.ts)

import { describe, it, expect } from "vitest";
import { lessons } from "@/data";
import { starrableWord } from "@/lib/starred-from-quiz";
import { wordKey } from "@/lib/study-store";
import { resolveStar } from "@/components/study/my-words-resolve";
import type { QuizQuestion } from "@/lib/study-types";

/** pick real lesson-bank vocab questions (the FA→EN kind with English options) */
const bankVocab = (n: number): QuizQuestion[] =>
  lessons
    .flatMap((l) => l.quizzes.map((q) => ({ q, lessonId: l.id })))
    .filter(({ q }) => q.category === "vocab" || q.category === "vocab-konkuri")
    .map(({ q }) => q)
    .slice(0, n);

describe("starrableWord", () => {
  it("resolves real bank vocab questions to their word", () => {
    const resolved = bankVocab(12).map(starrableWord);
    const hits = resolved.filter(Boolean) as NonNullable<ReturnType<typeof starrableWord>>[];
    // the lesson banks are vocab-heavy — a healthy share must resolve
    expect(hits.length).toBeGreaterThan(0);
    for (const h of hits) {
      expect(h.key).toMatch(/^[123]:[a-z]/);
      expect(h.en.length).toBeGreaterThan(0);
      expect(h.fa.length).toBeGreaterThan(0);
    }
  });

  it("round-trips into the word-book via resolveStar", () => {
    const q = bankVocab(30)
      .map(starrableWord)
      .find(Boolean) as NonNullable<ReturnType<typeof starrableWord>>;
    const back = resolveStar(q.key);
    expect(back).not.toBeNull();
    expect(back!.en).toBe(q.en);
    expect(back!.fa).toBe(q.fa);
    expect(back!.key).toBe(q.key);
  });

  it("key equals the canonical store wordKey", () => {
    const q = bankVocab(30)
      .map(starrableWord)
      .find(Boolean) as NonNullable<ReturnType<typeof starrableWord>>;
    const [lessonId, en] = q.key.split(":");
    expect(q.key).toBe(wordKey(Number(lessonId), en));
  });

  it("exam-bank / foreign-id questions never resolve", () => {
    const q: QuizQuestion = {
      id: "exam-7",
      category: "vocab",
      question: "Pick the right word.",
      options: ["ability", "absence", "absolute", "accept"],
      answer: 0,
    };
    expect(starrableWord(q)).toBeNull();
  });

  it("non-vocab categories never resolve", () => {
    const q: QuizQuestion = {
      id: "l1-grammar-3",
      category: "grammar",
      question: "Choose the correct form.",
      options: ["much", "many", "a lot", "lots"],
      answer: 1,
    };
    expect(starrableWord(q)).toBeNull();
  });

  it("EN→FA drills (Persian correct option) never resolve", () => {
    // synthesized my-words drill: correct option is the Persian meaning
    const q: QuizQuestion = {
      id: "l1-star-ability",
      category: "vocab",
      question: "Choose the Persian meaning of “ability”.",
      options: ["توانایی", "هنر", "غیبت", "پذیرفتن"],
      answer: 0,
    };
    expect(starrableWord(q)).toBeNull();
  });

  it("FA→EN drills (English correct option) resolve their word", () => {
    const q: QuizQuestion = {
      id: "l1-star-rev-ability",
      category: "vocab",
      question: "Choose the English word for «توانایی».",
      options: ["art", "ability", "absence", "accident"],
      answer: 1,
    };
    const h = starrableWord(q);
    expect(h).not.toBeNull();
    expect(h!.key).toBe(wordKey(1, "ability"));
  });

  it("unanswerable / malformed options are safe", () => {
    const q: QuizQuestion = {
      id: "l1-vocab-x",
      category: "vocab",
      question: "?",
      options: [],
      answer: 0,
    };
    expect(starrableWord(q)).toBeNull();
  });
});
