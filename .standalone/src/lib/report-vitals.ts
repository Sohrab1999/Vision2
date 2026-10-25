// ------------------------------------------------------------------
// report-vitals — موتورِ حیاتیِ خانوادهٔ گزارشها (r382 — ممیزیِ دوقلوها)
// پیشینه: report-card و official-report سیزده سطرِ ماهانه و چهار سطرِ
// میانگین را بایتبهبایت دوقلو نگه میداشتند (امضای «same semantics»
// بدونِ قراردادِ واحد). ایدئومِ r363/r381: موتورِ خالص در کتابخانهٔ
// دامنه، مصرفکنندهها قرض میگیرند — هیچ دوقلوی محلی مجاز نیست و
// قفلِ تستیِ r382 تکمنبعی را بسته است.
// ------------------------------------------------------------------

/** یک ستونِ ماهانهٔ ۳۰روزه: جمعِ فعالیت + چندِ روزِ زندهٔ همان هفته */
export interface ReportMonthBucket {
  total: number;
  active: number;
}

/** حیاتیِ ماهانه: ستونها + سقفِ نمودار (کفِ ۱ — تقسیمبرصفر ممنوع) + جمع */
export interface ReportMonthVitals {
  buckets: ReportMonthBucket[];
  max: number;
  total: number;
}

/**
 * فعالیتِ ۳۰روزه در ۴ ستونِ هفتگی (کهنه → نو) + سقفِ امن و جمعِ کل —
 * یک موتور، یک قرارداد: هر سه خروجی از همان پیمایشِ واحد بیرون میآیند
 * تا «جمع کل» هیچگاه با ستونها همخوانیِ خودش را از دست ندهد.
 * ماهِ خالی صادقانه گزارش میدهد: ستونی نیست، سقف ۱، جمع ۰.
 */
export function monthVitalsOf(month: { total: number }[]): ReportMonthVitals {
  if (month.length === 0) return { buckets: [], max: 1, total: 0 };
  const size = Math.ceil(month.length / 4);
  const buckets: ReportMonthBucket[] = [];
  for (let i = 0; i < month.length; i += size) {
    const chunk = month.slice(i, i + size);
    buckets.push({
      total: chunk.reduce((s, d) => s + d.total, 0),
      active: chunk.filter((d) => d.total > 0).length,
    });
  }
  return {
    buckets,
    max: Math.max(1, ...buckets.map((b) => b.total)),
    total: buckets.reduce((s, b) => s + b.total, 0),
  };
}

/**
 * میانگینِ درصد رویِ همهٔ نتیجههایِ انباشته — مخزنِ خالی صادقانه ۰
 * میگوید (میانگینِ جعلی ممنوع، r236) — همان قراردادی که گزارشها همیشه
 * داشتند؛ حالا فقط یک‌جا نوشته شده.
 */
export function avgPercentOf(results: Record<string, { percent: number }>): number {
  const rs = Object.values(results);
  return rs.length ? Math.round(rs.reduce((s, r) => s + r.percent, 0) / rs.length) : 0;
}
