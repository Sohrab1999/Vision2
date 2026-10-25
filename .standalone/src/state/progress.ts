// گام ۸ §12 — کلیدهای دامنه + تجمیع پیشرفت (خالص)
// wordKey/resultKey قرارداد کلید واژه/نتیجه؛ summarize/knownCountOfLesson/
// mistakesOfLesson/questionSourceLesson خوانش‌های تجمیعی روی نقشه‌های استور.

import type { QuizResult } from "@/lib/study-types";
import type { MistakeMap } from "./types";

export const wordKey = (lessonId: number, en: string) => `${lessonId}:${en.toLowerCase()}`;
export const resultKey = (lessonId: number | string, category: string) => `${lessonId}:${category}`;

// ---------------- aggregate progress ----------------

export interface ProgressSummary {
  knownCount: number;
  totalPercent: number;
  doneCategories: number;
  bestExam: QuizResult | null;
}

export function summarize(
  known: Record<string, boolean>,
  results: Record<string, QuizResult>
): ProgressSummary {
  const knownCount = Object.values(known).filter(Boolean).length;
  const rs = Object.values(results);
  const totalPercent = rs.length
    ? Math.round(rs.reduce((s, r) => s + r.percent, 0) / rs.length)
    : 0;
  const bestExam = results["exam"] ?? null;
  return { knownCount, totalPercent, doneCategories: rs.length, bestExam };
}

export function knownCountOfLesson(
  known: Record<string, boolean>,
  lessonId: number
): number {
  const prefix = `${lessonId}:`;
  return Object.entries(known).filter(([k, v]) => k.startsWith(prefix) && v).length;
}

/** count of wrong-bank questions for a lesson */
export function mistakesOfLesson(mistakes: MistakeMap, lessonId: number | string): number {
  const prefix = `${lessonId}:`;
  return Object.keys(mistakes).filter((k) => k.startsWith(prefix)).length;
}

/** source lesson bucket (1..N lesson id) or exam bank (0) of a quiz question,
 *  from its id prefix — generische نسخهٔ راند ۱۹۱: هر «l<عدد>» همان درس است */
export function questionSourceLesson(q: { id: string }): number {
  const m = /^l(\d+)/.exec(q.id);
  return m ? Number(m[1]) : 0;
}
