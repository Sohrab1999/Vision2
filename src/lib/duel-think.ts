// ------------------------------------------------------------------
// «زمانِ فکر» — تفکیکِ زمانِ فکر از زمانِ پاسخ (Task 106).
//
// قراردادِ داور دست‌نخورده می‌ماند: امتیاز فقط از qStartAtِ خودِ سرور
// می‌آید (SEC — گزارشِ ms کلاینت خوانده نمی‌شود). ولی داور حالا
// «دیدنِ» هر سؤال را هم با رویدادِ duel:seen ثبت می‌کند (ساعتش را
// خودِ سرور می‌زند) تا پنجرهٔ دیدن→پاسخ‌دادن — یعنی زمانِ فکرِ واقعی —
// به‌صورتِ «نمایشی» گزارش شود. نمونه‌ها بیرونِ رسیدِ امضاشده سفر
// می‌کنند: سند نیستند، فقط کارنامهٔ همان لحظه‌اند.
//
// خالص — هم سرویس ۳۰۰۳ (ثبت/پرکردن) و هم کارنامهٔ نبرد (آمار) همین
// قرارداد را مصرف می‌کنند تا هر دو طرف عددِ همسان ببینند.
// ------------------------------------------------------------------

/** نمونهٔ فکرِ هر سؤال — null یعنی «دیده/ثبت نشده» (صداقتِ زیرمجموعه) */
export type ThinkSamples = (number | null)[];

/** سقفِ گاردِ ورودی — هم‌مرتبهٔ سقف‌های دامنه؛ نبرد واقعی ۱۰ سؤال دارد */
const MAX_QUESTIONS = 999;

const finite = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);

/**
 * یک نمونهٔ فکر ثبت کن — آرایهٔ تازه برمی‌گرداند (خلوص؛ ورودی دست‌نخورده).
 *  • seenAt=null (کلاینتِ قدیمی/سؤالِ ندیده) → نمونهٔ null
 *  • ساعت‌های وارونه (answeredAt < qStartAt) → نمونهٔ null
 *  • مقدار منفی → ۰ (فکر نمی‌تواند وارونه باشد)
 *  • مقدار هرگز از کلِ پنجرهٔ پاسخ (answeredAt − qStartAt) نمی‌گذرد —
 *    حتی اگر seen خراب گزارش شده باشد، فکر از کلِ پنجره بلندتر نیست
 */
export function recordThinkSample(
  samples: ThinkSamples,
  qi: number,
  seenAt: number | null,
  answeredAt: number,
  qStartAt: number
): ThinkSamples {
  const out: ThinkSamples = [...samples];
  const idx = finite(qi) ? Math.floor(qi) : -1;
  if (idx < 0 || idx >= MAX_QUESTIONS) return out;
  let value: number | null = null;
  if (
    seenAt !== null &&
    finite(seenAt) &&
    finite(answeredAt) &&
    finite(qStartAt) &&
    answeredAt >= qStartAt
  ) {
    const windowMs = Math.max(0, answeredAt - qStartAt);
    value = Math.min(Math.max(0, answeredAt - seenAt), windowMs);
  }
  // گپ‌های میانی (سؤالِ ردشدهٔ سگ‌منت) nullِ صادق می‌مانند — آرایهٔ فشرده
  // می‌سازیم تا خوانندهٔ قرارداد هرگز با حفرهٔ کم مواجه نشود
  for (let i = 0; i < idx; i++) if (out[i] === undefined) out[i] = null;
  out[idx] = value;
  return out;
}

/**
 * نمونه‌ها را به طولِ نبرد می‌کشد — جایِ سؤالِ بی‌نمونه nullِ صادق می‌ماند.
 * ورودیِ خراب (منفی/نامعین/غایب) هم null می‌شود نه صفرِ ساختگی.
 */
export function padThinkSamples(samples: ThinkSamples, total: number): ThinkSamples {
  const n = finite(total) ? Math.max(0, Math.floor(total)) : 0;
  const out: ThinkSamples = [];
  for (let i = 0; i < n; i++) {
    const v = samples[i];
    out.push(finite(v) && v >= 0 ? v : null);
  }
  return out;
}

export interface DuelThinkStats {
  /** میانگینِ فکر بر نمونه‌های موجود — بی‌نمونه → null (نه صفرِ ساختگی) */
  avgMs: number | null;
  minMs: number | null;
  maxMs: number | null;
  /** چند سؤال نمونه دارند (زیرمجموعهٔ صادق از کل) */
  seen: number;
  /** طولِ کلِ نبرد — مبنای «N از M سؤال» */
  total: number;
}

/** آمارِ فکر از نمونه‌ها — هرگز throw نمی‌کند؛ ورودیِ خراب = بی‌نمونه */
export function duelThinkStats(samples: ThinkSamples): DuelThinkStats {
  const valid = samples.filter((v): v is number => finite(v) && v >= 0);
  const total = samples.length;
  if (valid.length === 0) return { avgMs: null, minMs: null, maxMs: null, seen: 0, total };
  const sum = valid.reduce((s, v) => s + v, 0);
  return {
    avgMs: sum / valid.length,
    minMs: valid.reduce((m, v) => Math.min(m, v), Infinity),
    maxMs: valid.reduce((m, v) => Math.max(m, v), 0),
    seen: valid.length,
    total,
  };
}

// ------------------------------------------------------------------
// Task 108 «ماندگاریِ آمارِ فکر» — فیلدِ نمایشیِ ۱۰۶ حالا سفرِ ماندگار
// هم می‌کند: در لحظهٔ ثبتِ نتیجه، آمارِ فکرِ خودی به رکوردِ دفترچه
// می‌نشیند (ThinkStats — سریال‌پذیر و کوچک) تا دفترچه و نشان‌های
// «چابکیِ ذهن» از آن بخوانند. نمونه‌های خام ذخیره نمی‌شوند — فقط
// خلاصهٔ آماری؛ زیرمجموعهٔ صادق: بی‌نمونه → فیلد اصلاً ثبت نمی‌شود
// (رکوردهای قدیمی و نبردهای سرویسِ قدیمی بدونِ think می‌مانند).
// ------------------------------------------------------------------

/** خلاصهٔ آماریِ قابلِ ذخیره‌سازی — avgMs همیشه عدد است (بی‌نمونه → خودِ فیلد غایب) */
export interface ThinkStats {
  avgMs: number;
  minMs: number;
  maxMs: number;
  /** چند سؤال نمونه داشتند — گیتِ نازک‌بودنِ نمونه (نشان ≥۳ می‌خواهد) */
  seen: number;
  /** طولِ کلِ نبردِ همان روز */
  total: number;
}

/**
 * آمارِ ذخیره‌کردنی از نمونه‌ها — null یعنی «چیزی برای ماندگاری نیست»:
 * ورودیِ غیرآرایه/بی‌نمونه/همه‌null → null (فیلدِ think روی رکورد ثبت
 * نمی‌شود). میانگین به ms گرد می‌شود تا سریال‌سازی پایدار بماند.
 */
export function thinkStatsFromSamples(samples: ThinkSamples): ThinkStats | null {
  if (!Array.isArray(samples)) return null;
  const st = duelThinkStats(samples);
  if (st.seen === 0 || st.avgMs === null || st.minMs === null || st.maxMs === null) return null;
  return {
    avgMs: Math.round(st.avgMs),
    minMs: Math.round(st.minMs),
    maxMs: Math.round(st.maxMs),
    seen: st.seen,
    total: st.total,
  };
}
