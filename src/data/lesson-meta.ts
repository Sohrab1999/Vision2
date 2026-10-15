// Task 44 (roadmap step 3 — code splitting): lightweight lesson metadata for
// the EAGER shell (home bookshelf, footer, official-report, hero chips).
//
// Why this file exists: `@/data` (the barrel) pulls lesson1..9+exam ≈ 700 KB
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
// Round 194 («قفسهٔ کامل»): lessons 7-9 join — the 10th-grade booklets
// (Vision 1): حفاظت از طبیعت، شگفتی‌های آفرینش، ارزش دانش.
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
  /** راند ۲۰۶: ثروتِ جفتِ درس — ردیف‌های مترادف + متضادِ جزوه (تبِ ۸) */
  pairCount: number;
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
    quizCount: 55,
    grammarCount: 6,
    pairCount: 40,
  },
  {
    id: 2,
    titleEn: "A Healthy Lifestyle",
    titleFa: "یک شیوهٔ زندگی سالم",
    tagline: "سلامتی، تکنولوژی و زمان حال کامل",
    color: "amber",
    grade: "یازدهم",
    vocabCount: 229,
    quizCount: 45,
    grammarCount: 6,
    pairCount: 65,
  },
  {
    id: 3,
    titleEn: "Art and Culture",
    titleFa: "هنر و فرهنگ",
    tagline: "فرهنگ ایران، صنایع دستی و جملات شرطی",
    color: "rose",
    grade: "یازدهم",
    vocabCount: 200,
    quizCount: 45,
    grammarCount: 3,
    pairCount: 123,
  },
  {
    id: 4,
    titleEn: "Sense of Appreciation",
    titleFa: "حس قدردانی",
    tagline: "قدردانی، ادب و فرهنگ‌های جهان و جملهٔ مجهول",
    color: "violet",
    grade: "دوازدهم",
    vocabCount: 100,
    quizCount: 45,
    grammarCount: 4,
    pairCount: 34,
  },
  {
    id: 5,
    titleEn: "Look to the Future",
    titleFa: "نگاه به آینده",
    tagline: "آینده، فناوری و مجهولِ آینده و مدال‌دار",
    color: "sky",
    grade: "دوازدهم",
    vocabCount: 84,
    quizCount: 45,
    grammarCount: 3,
    pairCount: 30,
  },
  {
    id: 6,
    titleEn: "Renewable Energy",
    titleFa: "انرژی تجدیدپذیر",
    tagline: "انرژی‌های پاک، محیط زیست و نقل قول",
    color: "teal",
    grade: "دوازدهم",
    vocabCount: 76,
    quizCount: 45,
    grammarCount: 3,
    pairCount: 29,
  },
  {
    id: 7,
    titleEn: "Saving Nature",
    titleFa: "حفاظت از طبیعت",
    tagline: "طبیعت، بازیافت و مرورِ حال ساده/استمراری با حروف ربط",
    color: "orange",
    grade: "دهم",
    vocabCount: 80,
    quizCount: 45,
    grammarCount: 3,
    pairCount: 28,
  },
  {
    id: 8,
    titleEn: "Wonders of Creation",
    titleFa: "شگفتی‌های آفرینش",
    tagline: "حیوانات شگفت‌انگیز، مهاجرت و گذشتهٔ ساده با تفضیلی/عالی",
    color: "indigo",
    grade: "دهم",
    vocabCount: 72,
    quizCount: 45,
    grammarCount: 3,
    pairCount: 28,
  },
  {
    id: 9,
    titleEn: "The Value of Knowledge",
    titleFa: "ارزش دانش",
    tagline: "کتاب‌خوانی، دانشگاه و آینده با will و be going to",
    color: "fuchsia",
    grade: "دهم",
    vocabCount: 70,
    quizCount: 45,
    grammarCount: 3,
    pairCount: 28,
  },
  // راند ۱۹۸ — «قفسهٔ شش‌پایه»: جزوه‌های متوسطهٔ اول (Prospect 1-3)
  {
    id: 10,
    titleEn: "Hello, English!",
    titleFa: "سلام، انگلیسی!",
    tagline: "الفبا، احوالپرسی، خانواده و مشاغل با فعل to be",
    color: "pink",
    grade: "هفتم",
    vocabCount: 631,
    quizCount: 40,
    grammarCount: 3,
    pairCount: 24,
  },
  {
    id: 11,
    titleEn: "My World",
    titleFa: "دنیای من",
    tagline: "ملیت‌ها، روزهای هفته، توانایی‌ها با can و توصیه",
    color: "blue",
    grade: "هشتم",
    vocabCount: 454,
    quizCount: 40,
    grammarCount: 3,
    pairCount: 24,
  },
  {
    id: 12,
    titleEn: "People and Media",
    titleFa: "آدم‌ها و رسانه",
    tagline: "شخصیت، سفر، جشن‌ها و گذشتهٔ ساده",
    color: "purple",
    grade: "نهم",
    vocabCount: 556,
    quizCount: 40,
    grammarCount: 3,
    pairCount: 24,
  },
];

export const TOTAL_VOCABULARY = 2756;
export const LESSON_QUIZ_COUNT = 535;
export const EXAM_BANK_SIZE = 360;
export const TOTAL_QUESTIONS = LESSON_QUIZ_COUNT + EXAM_BANK_SIZE; // 895
/** راند ۲۰۶: کلِ ردیف‌های جفتِ جزوه روی ۱۲ درس (۴۰+۶۵+۱۲۳+…+۲۴) */
export const TOTAL_PAIRS = 477;

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

const ORDINAL_FA = [
  "اول",
  "دوم",
  "سوم",
  "چهارم",
  "پنجم",
  "ششم",
  "هفتم",
  "هشتم",
  "نهم",
  "دهم",
  "یازدهم",
  "دوازدهم",
];

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
  if (id <= 3) return "یازدهم";
  if (id <= 6) return "دوازدهم";
  if (id <= 9) return "دهم";
  if (id === 10) return "هفتم";
  if (id === 11) return "هشتم";
  return "نهم";
}
