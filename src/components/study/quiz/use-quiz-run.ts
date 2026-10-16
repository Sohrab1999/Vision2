"use client";

// R-7 «برش موتور تست» (docs/codebase-audit.md §12 گام ۷)
// useQuizRun — ماشین حالت راند تست که قبلاً درونی quiz-engine بود:
// اندیس سؤال، انتخاب‌ها، تایمر کل راند، کیبورد (رقم/Enter/←) و اسکرول بازخورد.
//
// پایان راند به onFinish واگذار می‌شود (کامپوننت آن را به completeQuizRun
// و توست وصل می‌کند)؛ این قلاب فقط مسیر اجرا را می‌داند.
//
// اصلاح همراه (هم‌کلاس P-3 در ممیزی): تایمر قبلاً `answers` را از کلوسور
// می‌گرفت و اگر یادگیرنده در ثانیهٔ آخر گزینه می‌زد، finish با پاسخ‌های
// کهنه صدا زده می‌شد؛ اکنون answersRef همیشه‌تازه جایگزین شده است.

import { useEffect, useMemo, useRef, useState } from "react";
import type { QuizQuestion } from "@/lib/study-types";
import { isTypingTarget, readDigit, useKeydown } from "@/hooks/use-keyboard";

export interface QuizRunConfig {
  questions: QuizQuestion[];
  /** instant feedback per question (lesson quizzes) vs exam mode */
  immediate?: boolean;
  /** total quiz timer in seconds per question (omit = untimed) */
  secondsPerQuestion?: number;
  /** called exactly once per run with the frozen answer list */
  onFinish: (finalAnswers: number[]) => void;
}

export interface QuizRunState {
  idx: number;
  selected: number | null;
  answers: number[];
  finished: boolean;
  timeLeft: number | null;
  total: number;
  correctCount: number;
  choose: (i: number) => void;
  nextQuestion: () => void;
  restart: () => void;
  /** r285 — متنِ خامِ پاسخ تایپی بر اساس شناسهٔ سؤال (برای بازبینی صادقانه) */
  typedTexts: Record<string, string>;
  recordTyped: (qid: string, text: string) => void;
}

export function useQuizRun({
  questions,
  immediate = true,
  secondsPerQuestion,
  onFinish,
}: QuizRunConfig): QuizRunState {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]); // chosen per question (in order)
  // r285 — پاسخ تایپی: متنِ خامِ تایپ‌شده نگه داشته می‌شود تا بازبینی پایان
  // راند «پاسخ شما» را صادقانه نشان دهد، نه گزینهٔ داربستیِ نگاشت‌شده.
  const [typedTexts, setTypedTexts] = useState<Record<string, string>>({});
  const [finished, setFinished] = useState(false);
  const finishedRef = useRef(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(
    secondsPerQuestion ? secondsPerQuestion * questions.length : null
  );

  // always-fresh mirrors for effects that must not re-arm on every keystroke
  const answersRef = useRef(answers);
  const onFinishRef = useRef(onFinish);

  useEffect(() => {
    onFinishRef.current = onFinish;
  });

  const total = questions.length;
  const correctCount = useMemo(
    () => answers.reduce((s, a, i) => (a === questions[i]?.answer ? s + 1 : s), 0),
    [answers, questions]
  );

  const commitAnswers = (next: number[]) => {
    answersRef.current = next;
    setAnswers(next);
  };

  const finish = (finalAnswers: number[]) => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    onFinishRef.current(finalAnswers);
    // freeze the answers so late clicks during exit animations can't mutate the result
    commitAnswers(finalAnswers);
    setFinished(true);
  };

  // total-quiz timer (1 s cadence; reads answers through the always-fresh ref)
  useEffect(() => {
    if (timeLeft === null || finished) return;
    const t = setTimeout(() => {
      const next = timeLeft - 1;
      setTimeLeft(next);
      if (next <= 0) finish(answersRef.current);
    }, 1000);
    return () => clearTimeout(t);
  }, [timeLeft, finished]);

  const recordTyped = (qid: string, text: string) => {
    setTypedTexts((prev) => ({ ...prev, [qid]: text }));
  };

  const choose = (i: number) => {
    if (finishedRef.current || finished) return;
    if (immediate) {
      if (selected !== null) return;
      const next = [...answers];
      next[idx] = i;
      commitAnswers(next);
      setSelected(i);
    } else {
      // exam mode: record answer and auto advance (one answer per question)
      if (answers[idx] !== undefined) return;
      const next = [...answers];
      next[idx] = i;
      commitAnswers(next);
      if (idx < total - 1) {
        setIdx(idx + 1);
        setSelected(null);
      } else {
        finish(next);
      }
    }
  };

  const nextQuestion = () => {
    if (idx < total - 1) {
      setIdx(idx + 1);
      setSelected(null);
    } else {
      finish(answers);
    }
  };

  const restart = () => {
    finishedRef.current = false;
    setIdx(0);
    setSelected(null);
    commitAnswers([]);
    setTypedTexts({});
    setFinished(false);
    setTimeLeft(secondsPerQuestion ? secondsPerQuestion * questions.length : null);
  };

  // keyboard shortcuts: 1-4 choose an option, Enter / ← advance
  // (useKeydown keeps the listener bound once; the handler is always fresh via ref)
  useKeydown((e) => {
    if (isTypingTarget(e)) return;
    if (finished) return;
    // option picking works on any keyboard layout: physical digit keys
    // (e.code), Persian digits (۰-۹) and Latin digits all count
    const num = readDigit(e);
    // r285 — سؤال تایپی: کلیدهای رقم راهِ میان‌برِ دورزدنِ تایپ نیستند؛
    // Enter/← برای پیشروی پس از بازخورد سرِ جایش می‌ماند
    if (num !== null && questions[idx]?.kind !== "typed" && num >= 1 && num <= (questions[idx]?.options.length ?? 0)) {
      e.preventDefault();
      choose(num - 1);
      return;
    }
    if (e.key === "Enter" || e.key === "ArrowLeft") {
      // immediate mode: Enter/← only advances after an answer is picked;
      // exam mode: always advances (parity with the inline handler pre-split)
      if (!immediate || selected !== null) nextQuestion();
    }
  });

  // scroll the feedback box into view when it appears (matters inside dialogs)
  useEffect(() => {
    if (selected === null || finished) return;
    document.querySelector("[data-quiz-feedback]")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [selected, finished]);

  return {
    idx,
    selected,
    answers,
    finished,
    timeLeft,
    total,
    correctCount,
    choose,
    nextQuestion,
    restart,
    typedTexts,
    recordTyped,
  };
}
