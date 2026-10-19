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

/** آپاستروف‌های خمیده/بریده → راست؛ اسلش → فاصله (کلیدهای دودویی چاپی «X / Y»)؛
 *  نقطه‌گذاری پایانی و فاصلهٔ اضافی حذف */
export function normalizeTypedAnswer(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[’‘`´]/g, "'")
    .replace(/\//g, " ")
    .replace(/[\s?؟.!]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** ورودی خام یادگیرنده → اندیس گزینه برای ثبت در ماشین راند */
export function typedAnswerIndex(q: QuizQuestion, raw: string): number {
  const norm = normalizeTypedAnswer(raw);
  if (q.accepted?.some((a) => normalizeTypedAnswer(a) === norm)) return q.answer;
  const exact = q.options.findIndex((o) => normalizeTypedAnswer(o) === norm);
  if (exact >= 0) {
    if (exact === q.answer) return q.answer; // عینِ متنِ گزینهٔ درست (بدونِ accepted) — درست
    return exact; // عینِ گزینهٔ نادرست — همان اندیسِ نادرست
  }
  // r400 — هیچ شکلِ accepted و هیچ گزینه‌ای نیامد: اگر اندیسِ نادرستی در options هست
  // همان ثبت می‌شود؛ در سؤالِ تک‌گزینه‌ایِ تایپی (options=[مدل]) فرمولِ کهنه
  // (answer+1)%length همیشه خودِ answer را می‌داد و هر ورودیِ غلطِ تایپی «درست»
  // ثبت می‌شد (باگِ از r285 — در E2Eِ راندِ r400 کشف شد). نشانِ -1 = «پاسخِ
  // نادرستِ بدونِ گزینه»: همهٔ مصرف‌کننده‌ها (countCorrect/خطاها/کونکور/واژه‌ریسک)
  // درستی را با «=== answer» می‌سنجند و -1 نادرست است؛ نمایِ معلم -1 را
  // «بی‌پاسخ» می‌خواند (normalizeAnswer) و بانکِ خطا آن را اشتباه ثبت می‌کند.
  const fallback = (q.answer + 1) % q.options.length;
  return fallback !== q.answer ? fallback : -1;
}
