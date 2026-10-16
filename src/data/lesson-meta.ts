// Task 44 (roadmap step 3 — code splitting): lightweight lesson metadata for
// the EAGER shell (home bookshelf, footer, official-report, hero chips).
//
// Why this file exists: `@/data` (the barrel) pulls lesson1+2+3+exam ≈ 371 KB
// of source content. Eager components only need titles/colors/counts — not the
// vocabulary, quizzes, or grammar HTML. Importing THIS module keeps the whole
// content layer out of the first-load bundle; the real content loads lazily
// inside the views that use it (lesson-view, exam-view, review-view, …).
//
// Drift safety: tests/lesson-meta.test.ts asserts every value below against
// the real data layer, so any content edit that changes counts/titles fails
// the test suite instead of silently showing stale numbers.

export type LessonColor = "emerald" | "amber" | "rose";

export interface LessonMeta {
  id: number;
  titleEn: string;
  titleFa: string;
  tagline: string;
  color: LessonColor;
  vocabCount: number;
  quizCount: number;
  grammarCount: number;
}

export const LESSONS_META: LessonMeta[] = [
  {
    id: 1,
    titleEn: "Understanding People",
    titleFa: "فهمیدن مردم",
    tagline: "زبان‌های دنیا، ارتباطات و مهارت‌های یادگیری زبان",
    color: "emerald",
    vocabCount: 204,
    quizCount: 142,
    grammarCount: 6,
  },
  {
    id: 2,
    titleEn: "A Healthy Lifestyle",
    titleFa: "یک شیوهٔ زندگی سالم",
    tagline: "سلامتی، تکنولوژی و زمان حال کامل",
    color: "amber",
    vocabCount: 229,
    quizCount: 150,
    grammarCount: 6,
  },
  {
    id: 3,
    titleEn: "Art and Culture",
    titleFa: "هنر و فرهنگ",
    tagline: "فرهنگ ایران، صنایع دستی و جملات شرطی",
    color: "rose",
    vocabCount: 200,
    quizCount: 160,
    grammarCount: 3,
  },
];

export const TOTAL_VOCABULARY = 633;
export const LESSON_QUIZ_COUNT = 452;
export const EXAM_BANK_SIZE = 360;
export const TOTAL_QUESTIONS = LESSON_QUIZ_COUNT + EXAM_BANK_SIZE; // 812

export function lessonMetaById(id: number): LessonMeta | undefined {
  return LESSONS_META.find((l) => l.id === id);
}
