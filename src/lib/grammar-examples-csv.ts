// ------------------------------------------------------------------
// راند ۲۷۴ — درِ چهارمِ خروجی: «جدول مثال‌های درسنامه» به CSVِ اکسلِ
// معلم (بندِ ③ پیشنهادِ r273 — همان لهجهٔ درِ جفت‌ها، این‌بار برایِ
// مثال‌هایِ ساختاریافتهٔ درسنامهٔ جامع). نوارِ دریلِ مثال‌ها جمعیتِ
// «نامزد» را می‌نامد (واژه‌محور — r271) ولی خودِ جدولِ مثال‌ها هیچ
// راهِ بیرونی نداشت؛ لنزِ کاربرددار دو در (r260)، جفت‌ها یک در (r273)
// و درسنامه حالا درِ خودش را دارد.
//
// جدولِ مثال‌هایِ خودِ جزوه — ردیف‌به‌ردیفِ همان BgExample (نه ددوپ):
// پنج جملهٔ شرطی که در «نوع اول» و «مرور نوع اول و سوم» هر دو زندگی
// می‌کنند دو ردیف می‌گیرند — فایل آینهٔ صادقانهٔ جدولِ کاغذی است و
// شمارشِ ردیف‌هایش (۲۰۵) با دکمه یکی می‌خواند (درسِ «یک جمعیت، دو
// نام‌گذاری»).
//
// قراردادِ خانوادهٔ CSV — نسخهٔ ۲ (یک زبان با lens/pairs؛ پیش‌سنجهٔ
// r274 لو داد که بی‌نقل‌قولِ محضِ v1 رویِ جملات نمی‌ایستد: ۵۵ جملهٔ
// انگلیسی ویرگولِ ASCII دارند):
//   · CRLF (RFC 4180) و BOM صریح — از CSV_BOM مشترک
//   · نقل‌قولِ کمینه: فیلدِ پاک (بدونِ ویرگول/نقل‌قولِ ASCII) عینِ
//     v1 بدونِ هیچ حرفیِ اضافه می‌ماند؛ فیلدِ ناساز دقیقاً یک‌جفت
//     «"» می‌گیرد و نقل‌قولِ درونی دوبرابر می‌شود. گیومهٔ خمیده و
//     «» حروفِ معمولِ UTF-8اند و هیچ‌وقت ناساز نیستند (پیش‌سنجهٔ
//     r274b: ascii-quote=۰ در کلِ داده — شاخهٔ دوبل‌کردنِ امروز
//     خاموش می‌ماند ولی برایِ درستیِ قرارداد هشتمین حرفِ آینده است).
//   · مبدأ از خودِ موضوع (source) مشتق می‌شود — فراخوان نمی‌تواند
//     ناساز بفرستد (هم‌الگویِ نوعِ r273/سطحِ r266)
//   · دامنه‌ثابت: مثال‌هایِ درسنامه به درس تعلق ندارند (دهمِ بنیان
//     بی‌درس است — صفرِ صادقانهٔ r220) و نوارِ دریل واژه‌محور است؛
//     پس نامِ فایل ثابت است و توست پسوندِ دامنه نمی‌گیرد (نبودِ
//     صادقانهٔ r271 در حالتِ پیش‌فرض).
// ------------------------------------------------------------------

import { CSV_BOM } from "./coverage-csv";

const NL = "\r\n";

/** یک ردیفِ خروجی — دقیقاً یک مثالِ جزوه با هویتِ موضوعِ مبدأ */
export interface GrammarExampleExportRow {
  /** جملهٔ انگلیسیِ خودِ جزوه */
  en: string;
  /** ترجمهٔ فارسیِ خودِ جزوه */
  fa: string;
  /** برچسبِ ساختاری که جزوه روی مثال گذاشته — تهی اگر جزوه برچسب نداده بود (۲۱ ردیفِ صادقانه) */
  tag: string;
  /** موضوعِ درسنامهٔ مبدأ */
  topic: string;
  /** جزوهٔ مبدأ — دهم/یازدهم/دوازدهم */
  source: string;
  /** نشانیِ صفحه در خود جزوه */
  page: string;
}

export const GRAMMAR_EXAMPLES_CSV_COLUMNS = [
  "جمله",
  "ترجمه",
  "برچسب ساختاری",
  "موضوع",
  "مبدأ",
  "صفحه",
] as const;

/**
 * لهجهٔ خانواده — v2: فیلدِ پاکِ بی‌دست‌کاری (عینِ v1)، فیلدِ
 * ویرگول‌دار/نقل‌قول‌دار در یک‌جفت «"» با دوبلِ درونی. صفرِ گذرِ
 * بی‌دلیل: فیلدهایِ تمیزِ ۲۰۵ ردیف بایت‌به‌بایت مثلِ pairs خروجی
 * می‌دهند؛ فقط ۵۵ جملهٔ ویرگول‌دار نقل‌قول می‌گیرند.
 */
export function csvField(value: string): string {
  return /[,"]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export function buildGrammarExamplesCsv(rows: GrammarExampleExportRow[]): string {
  const lines: string[] = [GRAMMAR_EXAMPLES_CSV_COLUMNS.join(",")];
  for (const r of rows) {
    lines.push(
      [
        csvField(r.en),
        csvField(r.fa),
        csvField(r.tag),
        csvField(r.topic),
        csvField(r.source),
        csvField(r.page),
      ].join(",")
    );
  }
  return lines.join(NL) + NL;
}

/** ساخت + دانلودِ CSV جدولِ مثال‌های درسنامه — SSR-guard و try-guard، هم‌الگویِ lens/pairs */
export function downloadGrammarExamplesCsv(rows: GrammarExampleExportRow[]): boolean {
  if (typeof document === "undefined") return false;
  try {
    const blob = new Blob([CSV_BOM + buildGrammarExamplesCsv(rows)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    // دامنه‌ثابت — مثال‌های درسنامه درس/آستانه ندارند (سرِ ماژول)
    a.download = "vision2-grammar-examples.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return true;
  } catch {
    return false;
  }
}
