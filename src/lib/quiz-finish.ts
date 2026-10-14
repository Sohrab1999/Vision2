// R-7 «برش موتور تست» (docs/codebase-audit.md §12 گام ۷)
//
// completeQuizRun — منطق «پایان راند تست» که قبلاً به‌صورت تابع خدای
// finish() (۷۶ خط) داخل quiz-engine.tsx زندگی می‌کرد. این ماژول
// عارِی از UI است: همهٔ اثرهای جانبی دامنه‌ای را صدا می‌زند و فقط
// خلاصهٔ نتیجه را برمی‌گرداند؛ توست و رندر در کامپوننت می‌ماند.
//
// ترتیب اثرها عیناً حفظ شده:
//   ۱) ثبت نتیجه در استور (addResult) + trackQuizDone
//   ۲) trackEvent برای آزمون جامع
//   ۳) بانک اشتباهات (سطل‌بندی بر اساس mistakesOf) — add/clear
//   ۴) ریسک واژه‌ها (F7) و پوشش کنکور — best-effort، هرگز راند را نمی‌بندند
//   ۵) ارسال اماری امضاشده به سرور — fire-and-forget
//
// اصلاح همراه: در نسخهٔ قبلی `sendStats(...).then(...)` بدون catch بود و
// رد‌شدن fetch (شبکهٔ قطع) یک unhandled rejection می‌ساخت؛ اکنون catch صریح دارد.

import type { QuizQuestion } from "@/lib/study-types";
import { percent as percentOf } from "@/lib/domain/percent";
import { useStudy } from "@/lib/study-store";
import { recordQuizWordResults } from "@/lib/word-risk";
import { recordKonkurResults } from "@/lib/konkur";
import { trackEvent } from "@/lib/analytics";
import { sendStats } from "@/lib/identity";

export interface QuizFinishInput {
  questions: QuizQuestion[];
  /** chosen index per question, in question order (undefined = unanswered) */
  finalAnswers: number[];
  /** store bucket key, e.g. "1:vocab" or "exam" */
  resultKeyStr: string;
  lessonId: number | string;
  category: string;
  /** when false, wrong answers stay out of the mistake bank (word-drills) */
  trackMistakes?: boolean;
  /** override the lesson each question's mistakes are recorded to */
  mistakesOf?: (q: QuizQuestion) => number | string;
}

export interface QuizFinishSummary {
  correct: number;
  total: number;
  percent: number;
  /** ids of wrongly-answered questions (for the result review UI) */
  wrongIds: string[];
}

/** Count how many answers match the correct option. */
export function countCorrect(questions: QuizQuestion[], answers: number[]): number {
  return answers.reduce((s, a, i) => (a === questions[i]?.answer ? s + 1 : s), 0);
}

/**
 * Commit a finished quiz run: store result, mistake bank, word-risk,
 * konkur coverage and the signed stats ping. Idempotent per call —
 * the caller guards double-finish (finishedRef) before invoking.
 */
export function completeQuizRun({
  questions,
  finalAnswers,
  resultKeyStr,
  lessonId,
  category,
  trackMistakes = true,
  mistakesOf,
}: QuizFinishInput): QuizFinishSummary {
  const total = questions.length;
  const correct = countCorrect(questions, finalAnswers);
  const percent = percentOf(correct, total);

  const storeNow = useStudy.getState();
  storeNow.addResult(resultKeyStr, {
    correct,
    total,
    percent,
    at: new Date().toISOString(),
  });
  storeNow.trackQuizDone();
  if (resultKeyStr === "exam" || resultKeyStr === "final" || resultKeyStr.startsWith("final-")) trackEvent("exam_done");

  // error bank: record wrong answers, clear ones now answered correctly
  const wrongIds = questions
    .filter((qq, i) => finalAnswers[i] !== qq.answer)
    .map((qq) => qq.id);
  const rightIds = questions
    .filter((qq, i) => finalAnswers[i] === qq.answer)
    .map((qq) => qq.id);

  if (trackMistakes) {
    if (mistakesOf) {
      // bucket wrong/right ids per source lesson, then record each bucket
      const wrongBy = new Map<string, string[]>();
      const rightBy = new Map<string, string[]>();
      for (const [i, qq] of questions.entries()) {
        const target = String(mistakesOf(qq));
        const bucket = finalAnswers[i] !== qq.answer ? wrongBy : rightBy;
        bucket.set(target, [...(bucket.get(target) ?? []), qq.id]);
      }
      for (const [target, ids] of wrongBy) storeNow.addMistakes(target, ids);
      for (const [target, ids] of rightBy) for (const id of ids) storeNow.clearMistake(target, id);
    } else {
      if (wrongIds.length) storeNow.addMistakes(lessonId, wrongIds);
      for (const id of rightIds) storeNow.clearMistake(lessonId, id);
    }
  }

  // F7 — word-level risk tracking from every answered vocab question
  try {
    recordQuizWordResults(questions, finalAnswers);
  } catch {
    /* analysis is best-effort — never block the result */
  }
  // گوشهٔ کنکور — per-question coverage/mastery for exam-bank questions
  try {
    recordKonkurResults(questions, finalAnswers);
  } catch {
    /* best-effort — never block the result */
  }

  // fire-and-forget to backend (signed — Phase-0); explicit catch so a
  // dead network can never surface as an unhandled promise rejection
  try {
    void sendStats({
      lesson: typeof lessonId === "number" ? lessonId : 0,
      category,
      total,
      correct,
    }).catch(() => {
      /* offline is fine — the local result is the source of truth */
    });
  } catch {
    /* ignore */
  }

  return { correct, total, percent, wrongIds };
}
