"use client";

// ------------------------------------------------------------------
// گوشهٔ کنکور — coverage & mastery tracking for the 360-question
// exam bank («۳۶۰ تست واژگان» جزوه). Every QuizEngine session reports
// per-question results for exam-bank questions ("x-" ids) so the
// konkur view can show a 360-cell progress map, power the «فقط
// دیده‌نشده‌ها» coverage sessions and the «تست‌های سخت من» drill.
// ------------------------------------------------------------------

import { useStudy } from "./study-store";
import type { QuizQuestion } from "@/lib/study-types";

/**
 * Record per-question results of exam-bank questions (id prefix "x-")
 * after any finished quiz. Called from QuizEngine.finish() so coverage
 * is counted automatically no matter which surface the question came
 * from (konkur view, exam view, quick review, smart practice, ...).
 */
export function recordKonkurResults(questions: QuizQuestion[], answers: number[]): void {
  const entries: { id: string; ok: boolean }[] = [];
  for (const [i, q] of questions.entries()) {
    if (q.id.startsWith("x-")) {
      entries.push({ id: q.id, ok: answers[i] === q.answer });
    }
  }
  if (entries.length) useStudy.getState().markKonkur(entries);
}

/**
 * Union of exam-bank question ids currently considered «hard»:
 * the classic mistake bank (bucket 0) ∪ the konkur wrong-now set.
 */
export function hardIdsOf(
  mistakes: Record<string, number>,
  konkurWrong: Record<string, boolean>
): Set<string> {
  const ids = new Set<string>();
  for (const k of Object.keys(mistakes)) {
    if (k.startsWith("0:")) ids.add(k.slice(2));
  }
  for (const k of Object.keys(konkurWrong)) ids.add(k);
  return ids;
}
