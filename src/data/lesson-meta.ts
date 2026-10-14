// Task 44 (roadmap step 3 — code splitting): lightweight lesson metadata for
// the EAGER shell (home bookshelf, footer, official-report, hero chips).
//
// Why this file exists: `@/data` (the barrel) pulls lesson1..6+exam ≈ 500 KB
// of source content. Eager components only need titles/colors/counts — not the
// vocabulary, quizzes, or grammar HTML. Importing THIS module keeps the whole
// content layer out of the first-load bundle; the real content loads lazily
// inside the views that use it (lesson-view, exam-view, review-view, …).
//
// Drift safety: tests/lesson-meta.test.ts asserts every value below against
// the real data layer, so any content edit that changes counts/titles fails
// the test suite instead of silently showing stale numbers.
//
// Round 191 («جزوه‌های بیشتر»): lessons 4-6 joined the shelf — the
// complementary 12th-grade booklets (Vision 3): قدردانی، آینده، انرژی.
// Every derived count below is pinned by tests/lesson-meta.test.ts.

import type { LessonColor, LessonGrade } from "@/lib/study-types";
import { faNum } from "@/lib/study-theme";

export type { LessonColor, LessonGrade };

export interface LessonMeta {
  id: number;
  titleEn: string;
  titleFa: string;
  tagline: string;
  color: LessonColor;
  grade: LessonGrade;
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
    grade: "یازدهم",
    vocabCount: 204,
    quizCount: 50,
    grammarCount: 6,
  },
  {
    id: 2,
    titleEn: "A Healthy Lifestyle",
    titleFa: "یک شیوهٔ زندگی سالم",
    tagline: "سلامتی، تکنولوژی و زمان حال کامل",
    color: "amber",
    grade: "یازدهم",
    vocabCount: 229,
    quizCount: 40,
    grammarCount: 6,
  },
  {
    id: 3,
    titleEn: "Art and Culture",
    titleFa: "هنر و فرهنگ",
    tagline: "فرهنگ ایران، صنایع دستی و جملات شرطی",
    color: "rose",
    grade: "یازدهم",
    vocabCount: 200,
    quizCount: 40,
    grammarCount: 3,
  },
  {
    id: 4,
    titleEn: "Sense of Appreciation",
    titleFa: "حس قدردانی",
    tagline: "قدردانی، ادب و فرهنگ‌های جهان و جملهٔ مجهول",
    color: "violet",
    grade: "دوازدهم",
    vocabCount: 100,
    quizCount: 40,
    grammarCount: 4,
  },
  {
    id: 5,
    titleEn: "Look to the Future",
    titleFa: "نگاه به آینده",
    tagline: "آینده، فناوری و مجهولِ آینده و مدال‌دار",
    color: "sky",
    grade: "دوازدهم",
    vocabCount: 84,
    quizCount: 40,
    grammarCount: 3,
  },
  {
    id: 6,
    titleEn: "Renewable Energy",
    titleFa: "انرژی تجدیدپذیر",
    tagline: "انرژی‌های پاک، محیط زیست و نقل قول",
    color: "teal",
    grade: "دوازدهم",
    vocabCount: 76,
    quizCount: 40,
    grammarCount: 3,
  },
];

export const TOTAL_VOCABULARY = 893;
export const LESSON_QUIZ_COUNT = 250;
export const EXAM_BANK_SIZE = 360;
export const TOTAL_QUESTIONS = LESSON_QUIZ_COUNT + EXAM_BANK_SIZE; // 610

/** درس‌های جزوهٔ اصلی (یازدهم) — بانک ۳۶۰ تستی و آزمون پایان ترم همین سه درس‌اند */
export const CORE_LESSON_IDS = [1, 2, 3] as const;

export function lessonMetaById(id: number): LessonMeta | undefined {
  return LESSONS_META.find((l) => l.id === id);
}

// ------------------------------------------------------------------
// برچسب‌های فارسی درس — یک قرارداد مشترک برای همهٔ نماها (راند ۱۹۱).
// قبلاً هر نما نقشهٔ اول/دوم/سوم خودش را داشت؛ با شش درس، این کمکی‌ها
// تنها منبع حقیقت‌اند و برای شناسه‌های ناشناخته هم امن‌اند.
// ------------------------------------------------------------------

const ORDINAL_FA = ["اول", "دوم", "سوم", "چهارم", "پنجم", "ششم", "هفتم", "هشتم", "نهم", "دهم"];

/** ترتیبِ فارسیِ درس: ۴ → «چهارم»؛ خارج از جدول → رقم فارسی */
export function lessonOrdinalFa(id: number): string {
  return ORDINAL_FA[id - 1] ?? faNum(id);
}

/** «درس چهارم» */
export function lessonNameFa(id: number): string {
  return `درس ${lessonOrdinalFa(id)}`;
}

/** رقمِ فارسیِ شمارهٔ درس: ۴ → «۴» */
export function lessonNumFa(id: number): string {
  return faNum(id);
}

/** پایهٔ تحصیلی درس از روی شناسه — مستقل از بارگذاری دادهٔ سنگین */
export function lessonGradeFa(id: number): LessonGrade {
  return id <= 3 ? "یازدهم" : "دوازدهم";
}
