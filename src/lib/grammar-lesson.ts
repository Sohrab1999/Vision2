// ---------------------------------------------------------------------
// متروی گرامر — قرارداد خالص درس‌های ۹۰ثانیه‌ای (Task 40 / مرحلهٔ ۲)
// هیچ وابستگی به React/Store ندارد؛ استور و تست‌ها همین توابع را صدا
// می‌زنند. محتوا فقط داده است (data/grammar-lessons.ts).
//
// ثبت اتمام درس: همان results map استور (کلید "g:ls:<stationId>") —
// بدون فیلد جدید استور؛ بک‌آپ/سینک ابری رایگان می‌ماند. addResult بهترین
// نمره را نگه می‌دارد؛ نمرهٔ درس = درصد ۳ سؤال «امتحان کن».
// ---------------------------------------------------------------------

import type { GrammarMicroLesson, SentenceRole } from "@/data/grammar-lessons";
import { GRAMMAR_MICRO_LESSONS } from "@/data/grammar-lessons";
import { GRAMMAR_LINES } from "@/data/grammar-map";

/** تعداد سؤال‌های «امتحان کن» هر درس — قالب ثابت نقشهٔ راه */
export const LESSON_TRY_COUNT = 3;

/** کلید نتیجهٔ درس ایستگاه در results استور */
export const lessonKey = (stationId: string): string => `g:ls:${stationId}`;

/** درس ۹۰ثانیه‌ای یک ایستگاه (null = این ایستگاه هنوز درس ندارد) */
export function lessonFor(stationId: string): GrammarMicroLesson | null {
  return GRAMMAR_MICRO_LESSONS.find((l) => l.stationId === stationId) ?? null;
}

/** ایستگاه‌های دارای درس — برای نشانِ روی نقشه */
export function stationIdsWithLesson(): Set<string> {
  return new Set(GRAMMAR_MICRO_LESSONS.map((l) => l.stationId));
}

/** خط‌هایی که همهٔ ایستگاه‌هایشان درس ۹۰ثانیه‌ای دارد */
export function lineIdsWithLessons(): number[] {
  const withLesson = stationIdsWithLesson();
  return GRAMMAR_LINES.filter((line) =>
    line.stations.every((s) => withLesson.has(s.id))
  ).map((l) => l.id);
}

/** درصد نمرهٔ «امتحان کن» از تعداد درست */
export function tryPercent(correct: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((correct / total) * 100);
}

/** رنگ نقش‌های جمله — ثابت در همهٔ درس‌ها (بدون آبی/نیلی طبق سلیقهٔ پروژه) */
export const ROLE_CLASSES: Record<SentenceRole, string> = {
  subject: "bg-emerald-100 text-emerald-800 border-emerald-300",
  verb: "bg-rose-100 text-rose-800 border-rose-300",
  object: "bg-amber-100 text-amber-800 border-amber-300",
  aux: "bg-violet-100 text-violet-800 border-violet-300",
  rest: "bg-stone-100 text-stone-700 border-stone-300",
};

/** قالب ثابت دکمهٔ «چرا اشتباه شد؟» — دستیار «چرا؟» نقشهٔ راه (بخش ۱۰) */
export function whyAnswer(why: string): string {
  return `چون ${why}`;
}

/** اعتبارسنجی ساختاری یک درس (برای تست و توسعهٔ آیندهٔ محتوا) */
export function validateLesson(l: GrammarMicroLesson): string[] {
  const errors: string[] = [];
  if (l.try.length !== LESSON_TRY_COUNT)
    errors.push(`try باید دقیقاً ${LESSON_TRY_COUNT} سؤال باشد (${l.try.length})`);
  l.try.forEach((q, i) => {
    if (!q.prompt.includes("___"))
      errors.push(`سؤال ${i + 1} جای خالی ___ ندارد`);
    if (q.options.length < 2) errors.push(`سؤال ${i + 1} کمتر از ۲ گزینه دارد`);
    if (q.answer < 0 || q.answer >= q.options.length)
      errors.push(`سؤال ${i + 1} ایندکس جواب خارج از محدوده است`);
    if (q.why.trim().length < 10) errors.push(`سؤال ${i + 1} چرای کوتاه دارد`);
  });
  if (l.mirrors.length < 1) errors.push("حداقل یک آینهٔ فارسی لازم است");
  l.mirrors.forEach((m, i) => {
    if (!m.fa || !m.en) errors.push(`آینهٔ ${i + 1} جملهٔ خالی دارد`);
    if (!m.mistake.wrong || !m.mistake.right || !m.mistake.why)
      errors.push(`آینهٔ ${i + 1} غلط کلاسیک ناقص دارد`);
  });
  if (l.see.pieces.length < 2) errors.push("جملهٔ «ببین» کمتر از ۲ تکه است");
  if (
    l.see.timebar &&
    (l.see.timebar.marker < 0 || l.see.timebar.marker > 100)
  )
    errors.push("پرچم نوار زمان خارج از بازهٔ ۰-۱۰۰ است");
  return errors;
}
