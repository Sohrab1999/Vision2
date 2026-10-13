// ------------------------------------------------------------------
// Task 111 «کتابِ زنده» — پیشرفتِ گنجینهٔ واژگان روی جلدِ کتابِ هیرو.
//
// جلدِ کتاب از روزِ اول فقط یک نقشِ تزئینی داشت؛ از امروز حلقهٔ «تو» را
// نشان می‌دهد: چند واژه از ۶۳۳ واژهٔ جزوه بلدی. خالص و گارددار — استورِ
// خراب (تهی/آرایه/رشته) صفرِ صادق می‌دهد، هرگز throw نمی‌کند؛ درصد از
// percentِ دامنه (سقفِ ۱۰۰ و مخرجِ صفر → ۰) و ارقام فارسی از faNum.
// ------------------------------------------------------------------

import { percent } from "./domain/percent";
import { faNum } from "./study-theme";

export interface CoverProgress {
  /** درصدِ گِردِ ۰..۱۰۰ — مخرجِ نامعتبر/صفر → ۰ (percentِ دامنه) */
  percent: number;
  /** درصد با رقمِ فارسی — «۲۰٪» */
  fa: string;
  /** شمارِ واژه‌های «بلدم» — گاردِ خرابی روی خودِ رکورد */
  count: number;
  /** شمار با رقمِ فارسی */
  countFa: string;
}

/**
 * پیشرفتِ گنجینهٔ واژگان از رکوردِ known استور.
 * رکوردِ سالم: آبجکتِ key→boolean؛ هر مقدارِ درست یک واژه شمرده می‌شود
 * (همان قراردادِ knownCountOfLesson/wordKey). ورودیِ خراب → صفرِ صادق.
 */
export function coverProgress(known: unknown, total: number): CoverProgress {
  const count =
    known && typeof known === "object" && !Array.isArray(known)
      ? Object.values(known as Record<string, unknown>).filter(Boolean).length
      : 0;
  const p = percent(count, total);
  return { percent: p, fa: faNum(p), count, countFa: faNum(count) };
}
