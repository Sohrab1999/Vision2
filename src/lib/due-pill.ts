// ------------------------------------------------------------------
// Task 73 «حبهٔ مرور سررسیده» — قرارداد متنی حبهٔ هدر.
// خالص و بی‌UI: تعداد کارت‌های سررسیده + درسِ شروع را به عنوان/برچسبِ
// دسترس‌پذیری ترجمه می‌کند تا هم tooltip و هم aria-label با هم یک
// قرارداد باشند (تغییر wording = یک‌جا). ارقام فارسی از faNum.
// ------------------------------------------------------------------

import { faNum } from "./study-theme";

export interface DuePillMeta {
  /** عنوان کامل — aria-label و tooltip حبه */
  title: string;
  /** برچسب بلند دسکتاپ: «۷ کارت سررسیده» */
  long: string;
  /** برچسب فشردهٔ موبایل: فقط شمارش «۷» */
  short: string;
}

export function duePillMeta(due: number, lesson: number | null): DuePillMeta {
  const count = faNum(due);
  const long = `${count} کارت سررسیده`;
  const title = lesson
    ? `${long} — شروع مرور با فلش‌کارت‌های درس ${faNum(lesson)}`
    : `${long} — شروع مرور`;
  return { title, long, short: count };
}
