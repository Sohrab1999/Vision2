// ------------------------------------------------------------------
// Grade-aware final exam («آزمون پایان‌ترم سه‌پایه») — round 195.
//
// The shelf grew to 9 lessons / 3 grades (tasks 193-194) but the final
// exam kept mixing only lessons 1-3 + the 360-question bank — the
// «ارزیابی نهایی همهٔ آموخته‌ها» claim had drifted dishonest, the same
// under-report class as the three-lesson vocab-donut. These pure
// helpers make the final exam per-grade and share the group machinery
// (source buckets + labels + mistakes targets) with the result card,
// skill stats and the home feed labels.
//
// Imports stay LIGHT: lesson-meta (metadata only) + shuffle — the
// heavy content barrel is pulled by the consumer views, not here.
// ------------------------------------------------------------------

import type { LessonColor, QuizQuestion } from "@/lib/study-types";
import { LESSONS_META, lessonOrdinalFa } from "@/data/lesson-meta";
import { shuffle } from "./shuffle";

export type FinalGradeId = "g10" | "g11" | "g12";

export interface FinalGradeDef {
  id: FinalGradeId;
  /** «پایهٔ دهم» */
  label: string;
  /** the three lesson ids of this grade, curriculum order */
  lessons: number[];
  /** only the 11th grade rides the 360-question bank (it is a یازدهم booklet) */
  withBank: boolean;
  /** questions drawn per source */
  perLesson: number;
  /** localStorage result key — "final" stays the 11th-grade key for backward compat */
  resultKey: string;
  /** DB category for /api/stats */
  category: string;
  /** certificate family color — the first lesson of the grade leads the accent
   *  (round 197: گواهیِ پایان‌ترم با نشانِ رنگِ خانواده) */
  accent: LessonColor;
}

export const FINAL_GRADES: FinalGradeDef[] = [
  {
    id: "g10",
    label: "پایهٔ دهم",
    lessons: [7, 8, 9],
    withBank: false,
    perLesson: 10,
    resultKey: "final-10",
    category: "final-10",
    accent: "orange",
  },
  {
    id: "g11",
    label: "پایهٔ یازدهم",
    lessons: [1, 2, 3],
    withBank: true,
    perLesson: 10,
    resultKey: "final",
    category: "final",
    accent: "emerald",
  },
  {
    id: "g12",
    label: "پایهٔ دوازدهم",
    lessons: [4, 5, 6],
    withBank: false,
    perLesson: 10,
    resultKey: "final-12",
    category: "final-12",
    accent: "violet",
  },
];

/** definition of a grade final (defensive fallback: the 11th grade) */
export function finalGradeOf(id: FinalGradeId): FinalGradeDef {
  return FINAL_GRADES.find((g) => g.id === id) ?? FINAL_GRADES[1];
}

/** total questions of a grade final */
export function finalQuestionsCount(g: FinalGradeDef): number {
  return g.lessons.length * g.perLesson + (g.withBank ? g.perLesson : 0);
}

/** 45s per question, ceiling to whole minutes */
export function finalTimerMinutes(g: FinalGradeDef): number {
  return Math.ceil((finalQuestionsCount(g) * 45) / 60);
}

/** source bucket of a question id: "l1".."l9" or "x" (the 360 bank) */
export function questionGroup(q: { id: string }): string {
  const m = /^l(\d+)/.exec(q.id);
  return m ? `l${m[1]}` : "x";
}

/** full label map (l1..l9 + x) — quiz-result filters absent groups out */
export function examGroupLabels(): Record<string, string> {
  const labels: Record<string, string> = {};
  for (const l of LESSONS_META) labels[`l${l.id}`] = `درس ${lessonOrdinalFa(l.id)} — ${l.titleFa}`;
  labels.x = "بانک ۳۶۰ تستی جزوه";
  return labels;
}

/** mistakes registration target of a group: lN → lesson N, x → bank 0 */
export function mistakesTargetOf(group: string): number {
  const n = Number(group.slice(1));
  return Number.isInteger(n) && n >= 1 && n <= LESSONS_META.length ? n : 0;
}

export type QuestionShuffler = <T>(arr: T[]) => T[];

/** one snapshot pool for a grade final — perLesson per source, then shuffled */
export function buildFinalPool(
  grade: FinalGradeDef,
  lessons: { id: number; quizzes: QuizQuestion[] }[],
  bank: QuizQuestion[],
  shuf: QuestionShuffler = shuffle,
): QuizQuestion[] {
  const pool: QuizQuestion[] = [];
  for (const id of grade.lessons) {
    const les = lessons.find((l) => l.id === id);
    if (les) pool.push(...shuf(les.quizzes).slice(0, grade.perLesson));
  }
  if (grade.withBank) pool.push(...shuf(bank).slice(0, grade.perLesson));
  return shuf(pool);
}

/** «آزمون پایان‌ترم پایهٔ دهم» for a final-family result key, else null */
export function finalKeyLabel(key: string): string | null {
  if (key === "final") return "آزمون پایان ترم";
  const grade = FINAL_GRADES.find((g) => g.resultKey === key);
  return grade ? `آزمون پایان‌ترم ${grade.label}` : null;
}

/**
 * راند ۱۹۷ — خانوادهٔ رنگیِ گواهیِ یک کلیدِ نتیجهٔ پایان‌ترم.
 * "final" (کلیدِ تاریخیِ یازدهم) هم امردی می‌گیرد؛ کلیدِ ناشناخته →
 * زمردی (پیش‌فرضِ تاریخی، هم‌راستا با ring600).
 */
export function finalAccentOf(key: string): LessonColor {
  const grade = FINAL_GRADES.find((g) => g.resultKey === key);
  return grade?.accent ?? "emerald";
}
