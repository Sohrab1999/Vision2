// ------------------------------------------------------------------
// راند ۲۶۰ — «خروجی این دامنه» از لنزِ «کاربرددار» (بندِ ① پیشنهادِ ۲۵۹)
//
// learner که لنز را با آستانه/درس باریک کرده، حالا همان دامنهٔ دیدنی را
// بیرون می‌کشد: CSV برای اکسلِ معلم، TSV برای کارت‌های Anki. «همان دامنه»
// یعنی همان filtered/sighted کارت‌ها با همان ترتیبِ رندر (مرتب‌سازیِ
// r256 هم اگر فعال باشد، در فایل می‌آید) — دامنهٔ خروجی هیچ گامِ مستقل
// خودش را ندارد تا دو عددِ ناسازگار زندگی نکند (درسِ راندِ ۲۵۸).
//
// قراردادِ خانوادهٔ CSV (یک زبان با ۱۶۹/۱۷۸/۱۸۰):
//   · CRLF (RFC 4180) و BOM صریح — از CSV_BOM مشترکِ coverage-csv
//   · اعدادِ ASCII خالص — اکسل بتواند شمارش و رتبه را حساب کند
//   · مقدارها بدونِ ویرگول/نقل‌قول (پیش‌سنجهٔ r260: صفر در دامنه) —
//     پیمانِ ساختاری قفل می‌کند؛ اگر روزی داده شکست، پیمان نگهبان است
//   · رتبه از usedWordRank (همان سیمِ r259) — هم‌شمارها هم‌رتبه
//   · سطح (r266) از usageTierLabel — نگاشتِ ثابتِ شمارش (۵+/۲–۴/۱) که
//     رویِ مرزِ نوارهایِ هم‌شمار می‌نشیند؛ فیلترِ یک‌کلیکیِ معلم در Excel
// Anki: همان buildAnkiTsv موجود (ایدئومِ #separator:tab و ددوپِ هم‌نام)
// رویِ دامنهٔ باریک‌شده — countِ برگشتی صادقانه است (هم‌نام‌ها یکی می‌شوند).
// ------------------------------------------------------------------

import { CSV_BOM, downloadCsvFile } from "./file-download"; // r399+398 — تکخانه (مالک)
import { buildAnkiTsv } from "./anki-export";
import { faNum } from "./study-theme";
import type { VocabWord } from "./study-types";

const NL = "\r\n";

/** یک ردیفِ خروجی — دقیقاً همان کارتِ دیکشنری با آمارِ زندهٔ همان لحظه */
export interface LensExportRow {
  en: string;
  fa: string;
  lessonId: number;
  lessonTitle: string;
  /** تعدادِ کاربرد در مکالمه/ریدینگِ جزوه — همان sites.length */
  count: number;
  /** رتبهٔ رقابتیِ r259 — null یعنی بی‌رتبه (در لنزِ کاربرددار رخ نمی‌دهد) */
  rank: number | null;
}

export const LENS_CSV_COLUMNS = [
  "واژه",
  "معنی",
  "درس",
  "عنوان درس",
  "کاربرد در جزوه",
  "رتبه",
  "سطح",
] as const;

/**
 * سطحِ پرکاربردی (راند ۲۶۶) — نگاشتِ ثابتِ شمارشِ کاربرد:
 *   ۵+ → «پرکاربرد» · ۲–۴ → «میانه» · ۱ → «کم‌کاربرد» · ۰ → "" (بی‌سطحِ صادقانه)
 *
 * چرا مرزِ ۵ و نه ثلثِ رتبهٔ خام؟ پیش‌سنجهٔ r266 نشان داد مرزهایِ ثلثیِ
 * (۶۳۹/۱۲۷۷) داخلِ نوارهایِ هم‌شمار می‌افتند — t1 داخلِ نوارِ count=4
 * (رتبه‌هایِ ۵۳۷..۶۹۲) و t2 داخلِ نوارِ ۶۵۲تاییِ count=1 (۱۲۶۴..۱۹۱۵) —
 * یعنی واژه‌هایِ هم‌شمار در دو سطح می‌شکستند. برشِ مقاوم به تساوی روی
 * مرزِ نوارها: ۵+/۲–۴/۱ — و مرزِ ۵+ همان آستانهٔ آشنایِ لنز است
 * (MIN_USED_THRESHOLDS[0] — چیپِ «۵+» راندهایِ ۲۵۸/۲۶۵). توزیعِ امروز:
 * پرکاربرد=۵۳۶ · میانه=۷۲۷ · کم‌کاربرد=۶۵۲ — سه سطحِ زنده و متوازن.
 * تعمیمِ اصلِ «هم‌شمارها هم‌رتبه»یِ r260: هم‌شمارها هم‌سطح.
 */
export function usageTierLabel(count: number): string {
  if (count >= 5) return "پرکاربرد";
  if (count >= 2) return "میانه";
  if (count === 1) return "کم‌کاربرد";
  return ""; // بی‌کاربرد — بی‌سطح (در لنزِ کاربرددار هرگز رخ نمی‌دهد)
}

export function buildLensCsv(rows: LensExportRow[]): string {
  const lines: string[] = [LENS_CSV_COLUMNS.join(",")];
  for (const r of rows) {
    lines.push(
      [
        r.en,
        r.fa,
        String(r.lessonId),
        r.lessonTitle,
        String(r.count),
        r.rank === null ? "" : String(r.rank),
        usageTierLabel(r.count), // سطح از خودِ شمارش — فراخوان نمی‌تواند ناساز بفرستد
      ].join(",")
    );
  }
  return lines.join(NL) + NL;
}

/** برچسبِ دامنه در نامِ فایل — «all»، «all-min10»، «l1»، «l1-min20» */
export function lensScopeTag(lessonFilter: number | null, minUsed: number): string {
  const parts = [
    lessonFilter ? `l${lessonFilter}` : "all",
    minUsed > 0 ? `min${minUsed}` : null,
  ].filter((p): p is string => p !== null);
  return parts.join("-");
}

/**
 * راند ۲۷۱ — برچسبِ فارسیِ دامنهٔ لنز — همتایِ خوانایِ lensScopeTag
 * (بندِ ③ پیشنهادِ r270): «درس ۳ · واژه‌هایِ ۱۰+ کاربرد» — همان
 * ایدئومِ suffixِ عنوان‌هایِ دریل (r267/r270): درس اول، آستانهٔ دوم.
 * دامنهٔ پیش‌فرض رشتهٔ تهی می‌دهد (نبودِ صادقانه — توست پسوندی
 * نمی‌گیرد). lensScopeTag نامِ فایل را می‌سازد؛ این، دامنه را در
 * همان لحظهٔ دانلود به زبانِ آدمی نام می‌برد.
 */
export function lensDomainLabel(lessonFilter: number | null, minUsed: number): string {
  const lessonPart = lessonFilter ? `درس ${faNum(lessonFilter)}` : "";
  const thrPart = minUsed > 0 ? `واژه‌هایِ ${faNum(minUsed)}+ کاربرد` : "";
  return [lessonPart, thrPart].filter(Boolean).join(" · ");
}

/** ساخت + دانلودِ CSV دامنه — SSR-guard و try-guard، هم‌الگویِ coverage */
export function downloadLensCsv(rows: LensExportRow[], scope: string): boolean {
  // r398 — دُمِ دانلود در مالکِ یکخانه (file-download)
  return downloadCsvFile(() => CSV_BOM + buildLensCsv(rows), `vision2-used-${scope}.csv`);
}

/**
 * TSVِ Anki از دامنهٔ باریک‌شده — همان سازندهٔ موجود (یدکِ #deck:Vision2،
 * ددوپِ هم‌نام). countِ برگشتی = کارت‌هایِ واقعیِ فایل، نه کارت‌هایِ لنز.
 */
export function downloadLensAnki(
  rows: (VocabWord & { lessonId?: number })[],
  scope: string
): number {
  if (typeof document === "undefined") return 0;
  const { tsv, count } = buildAnkiTsv(rows);
  try {
    // r398 — دُمِ دانلود در مالک است؛ TSVِ لنز هم از همان نقاش میگذرد
    downloadCsvFile(() => tsv, `vision2-used-${scope}-anki.txt`);
    return count;
  } catch {
    return 0;
  }
}
