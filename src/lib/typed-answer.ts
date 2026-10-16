// پاسخ تایپی — نرمال‌سازی و نگاشت به اندیس گزینه (r285)
//
// بانک «بنویسید» جزوهٔ دوازدهم (ص۴۳) فرمتِ پاسخِ باز دارد: یادگیرنده عبارت
// الحاق (Tag Question) را تایپ می‌کند. موتور تست و خط پایان راند هنوز با
// «اندیس گزینه» کار می‌کنند، پس پاسخ تایپی به یکی از اندیس‌های آرایهٔ
// options نگاشت می‌شود:
//   • تطبیق با یکی از شکل‌های accepted  → اندیس پاسخ درست (q.answer)
//   • تطبیق دقیق با یکی از گزینه‌های نادرست → همان اندیس (گزینهٔ تایپ‌شده)
//   • بقیهٔ ورودی‌ها → نخستین اندیسِ نادرست پس از q.answer
// options برای سؤال تایپی فقط «داربست نتیجه» است (بازبینی پایان راند و
// ثبت اشتباه) و هرگز به‌عنوان انتخاب رندر نمی‌شود.

import type { QuizQuestion } from "./study-types";

/** آپاستروف‌های خمیده/بریده → راست؛ نقطه‌گذاری پایانی و فاصلهٔ اضافی حذف */
export function normalizeTypedAnswer(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[’‘`´]/g, "'")
    .replace(/[\s?؟.!]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** ورودی خام یادگیرنده → اندیس گزینه برای ثبت در ماشین راند */
export function typedAnswerIndex(q: QuizQuestion, raw: string): number {
  const norm = normalizeTypedAnswer(raw);
  if (q.accepted?.some((a) => normalizeTypedAnswer(a) === norm)) return q.answer;
  const exact = q.options.findIndex((o) => normalizeTypedAnswer(o) === norm);
  if (exact >= 0 && exact !== q.answer) return exact;
  return (q.answer + 1) % q.options.length;
}
