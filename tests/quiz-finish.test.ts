// R-7 «برش موتور تست» — گاردهای منطق پایان راند (src/lib/quiz-finish.ts)
//
// completeQuizRun قبلاً تابع خدای finish() داخل quiz-engine بود؛ این تست‌ها
// قراردادهایش را روی استور واقعی (بدون mock استور) قفل می‌کنند:
// ثبت نتیجه با سیاست «بهترین نمره»، سطل‌بندی بانک اشتباهات با mistakesOf،
// پاک‌سازی اشتباهِ درست‌شده، مسیر trackMistakes=false، و خلاصهٔ بازگشتی.

import { describe, it, expect, vi } from "vitest";
import type { QuizQuestion } from "@/lib/study-types";
import { useStudy } from "@/lib/study-store";
import { completeQuizRun, countCorrect } from "@/lib/quiz-finish";

vi.mock("@/lib/identity", () => ({
  sendStats: vi.fn(async () => true),
}));
vi.mock("@/lib/analytics", () => ({
  trackEvent: vi.fn(),
}));

// poison switch — lets one test prove completeQuizRun survives a
// thrown best-effort recorder without mocking the store away
const poison = { wordRisk: false };
vi.mock("@/lib/word-risk", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/word-risk")>();
  return {
    ...actual,
    recordQuizWordResults: (...args: Parameters<typeof actual.recordQuizWordResults>) => {
      if (poison.wordRisk) throw new Error("poisoned");
      return actual.recordQuizWordResults(...args);
    },
  };
});

const Q = (id: string, answer: number, question = "What?", options = ["a", "b", "c", "d"]): QuizQuestion => ({
  id,
  category: "vocab",
  question,
  options,
  answer,
});

const freshKey = () => `t:unit:${Math.random().toString(36).slice(2, 9)}`;

describe("countCorrect", () => {
  it("counts matching answers and tolerates unanswered/overflow slots", () => {
    const qs = [Q("a", 0), Q("b", 2), Q("c", 1)];
    expect(countCorrect(qs, [0, 1, 1])).toBe(2);
    expect(countCorrect(qs, [0, 2, 1, 3])).toBe(3); // extra slot ignored via questions[i]?.answer
    expect(countCorrect([], [])).toBe(0);
  });
});

describe("completeQuizRun", () => {
  it("records the result with best-score-keep policy and returns the summary", () => {
    const key = freshKey();
    const qs = [Q("q1", 0), Q("q2", 2), Q("q3", 1)];
    const s1 = completeQuizRun({ questions: qs, finalAnswers: [0, 2, 1], resultKeyStr: key, lessonId: 1, category: "vocab" });
    expect(s1).toMatchObject({ correct: 3, total: 3, percent: 100, wrongIds: [] });

    // worse rerun must not overwrite the stored best
    const s2 = completeQuizRun({ questions: qs, finalAnswers: [0, 0, 0], resultKeyStr: key, lessonId: 1, category: "vocab" });
    expect(s2.correct).toBe(1);
    expect(useStudy.getState().results[key]?.percent).toBe(100);
    expect(useStudy.getState().results[key]?.correct).toBe(3);
  });

  it("adds wrong answers to the mistake bank and clears now-correct ones", () => {
    const store = useStudy.getState();
    // seed: r1 was wrong before, and will be right this run → must be cleared
    store.addMistakes(1, ["r1"]);
    expect(useStudy.getState().mistakes["1:r1"]).toBeGreaterThan(0);

    const qs = [Q("r1", 0), Q("w1", 2), Q("w2", 3)];
    const summary = completeQuizRun({ questions: qs, finalAnswers: [0, 1, 1], resultKeyStr: freshKey(), lessonId: 1, category: "vocab" });
    expect(summary.wrongIds).toEqual(["w1", "w2"]);
    const m = useStudy.getState().mistakes;
    expect(m["1:w1"]).toBe(1);
    expect(m["1:w2"]).toBe(1);
    expect(m["1:r1"]).toBeUndefined();
  });

  it("buckets mistakes per source lesson when mistakesOf is provided", () => {
    const qs = [Q("m1", 0), Q("m2", 0), Q("m3", 0)];
    const mistakesOf = (q: QuizQuestion) => (q.id === "m1" ? 2 : 3);
    completeQuizRun({ questions: qs, finalAnswers: [1, 0, 1], resultKeyStr: freshKey(), lessonId: 9, category: "mix", mistakesOf });
    const m = useStudy.getState().mistakes;
    expect(m["2:m1"]).toBe(1);       // wrong → bucket lesson 2
    expect(m["3:m2"]).toBeUndefined(); // right → cleared in bucket lesson 3
    expect(m["3:m3"]).toBe(1);       // wrong → bucket lesson 3
    expect(m["9:m1"]).toBeUndefined(); // default lesson untouched
  });

  it("keeps the mistake bank untouched when trackMistakes=false", () => {
    const before = { ...useStudy.getState().mistakes };
    const qs = [Q("x1", 1)];
    completeQuizRun({ questions: qs, finalAnswers: [0], resultKeyStr: freshKey(), lessonId: 1, category: "drill", trackMistakes: false });
    expect(useStudy.getState().mistakes).toEqual(before);
  });

  it("never throws when the analysis recorders are poisoned", () => {
    poison.wordRisk = true;
    const qs = [Q("z1", 0)];
    try {
      expect(() =>
        completeQuizRun({ questions: qs, finalAnswers: [0], resultKeyStr: freshKey(), lessonId: 1, category: "vocab" })
      ).not.toThrow();
    } finally {
      poison.wordRisk = false;
    }
  });
});
