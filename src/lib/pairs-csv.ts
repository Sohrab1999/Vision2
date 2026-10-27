// ------------------------------------------------------------------
// راند ۲۷۳ — درِ سومِ خروجی: «جدولِ جفت‌ها» به CSVِ اکسلِ معلم
// (بندِ ② پیشنهادِ r272 — نوارِ جفت‌ها جمعیت را نام می‌برد (r270) ولی
// راهِ بیرون‌کشیدنِ خودِ جدول نداشت؛ لنزِ کاربرددار دو درِ خروجی دارد
// (r260) و جفت‌ها هیچ).
//
// جدولِ مترادف/متضادِ خودِ جزوه — ردیف‌به‌ردیفِ همان SYN/ANT (نه ددوپ):
// واژه‌هایِ چند-جفت (remember×۸، happy×۵) چند ردیف می‌گیرند — فایل
// آینهٔ صادقانهٔ جدولِ کاغذی است و شمارشِ ردیف‌هایش با «N ردیفِ جدولِ»
// نوار یکی می‌خواند (درسِ «یک جمعیت، دو نام‌گذاری»).
//
// قراردادِ خانوادهٔ CSV (یک زبان با lens-csvِ r260/۲۶۶):
//   · CRLF (RFC 4180) و BOM صریح — از CSV_BOM مشترکِ coverage-csv
//   · مقدارها بدونِ ویرگول/نقل‌قول — پیش‌سنجهٔ r273 صفر مورد یافت؛
//     پیمانِ ساختاریِ تست نگهبان است (هم‌الگویِ r260)
//   · درس عددِ ASCII — اکسل بتواند فیلتر/مرتب کند
//   · نوع از خودِ ردیف مشتق می‌شود (syn → «مترادف»، ant → «متضاد») —
//     فراخوان نمی‌تواند ناساز بفرستد (هم‌الگویِ سطحِ r266)
// تگِ دامنه و برچسبِ فارسی از سیمِ لنز reuse می‌شوند با آستانهٔ ۰
// (جفت‌ها آستانه‌نشدنی‌اند — درسِ r264) — یک لهجه برایِ نامِ فایل و توست.
// ------------------------------------------------------------------

import { CSV_BOM } from "./file-download"; // r399 — BOM تکخانه (مالک)؛ مسیرِ کهنهٔ coverage-csv منقرض

const NL = "\r\n";

/** یک ردیفِ خروجی — دقیقاً یک ردیفِ جدولِ جزوه با هویتِ درسِ مبدأ */
export interface PairsExportRow {
  /** واژهٔ اصلیِ جدول */
  en: string;
  /** جفتِ همان ردیف — مترادف یا متضاد */
  pair: string;
  /** جهتِ جدول: مترادف (syn) یا متضاد (ant) */
  kind: "syn" | "ant";
  /** معنیِ فارسیِ خودِ جزوه */
  fa: string;
  lessonId: number;
  lessonTitle: string;
}

export const PAIRS_CSV_COLUMNS = [
  "واژه",
  "جفت",
  "نوع",
  "معنی",
  "درس",
  "عنوان درس",
] as const;

/** برچسبِ نوع از خودِ جهتِ ردیف — ثابت و فراخوان‌ناساز */
export function pairsKindLabel(kind: "syn" | "ant"): string {
  return kind === "syn" ? "مترادف" : "متضاد";
}

export function buildPairsCsv(rows: PairsExportRow[]): string {
  const lines: string[] = [PAIRS_CSV_COLUMNS.join(",")];
  for (const r of rows) {
    lines.push(
      [
        r.en,
        r.pair,
        pairsKindLabel(r.kind),
        r.fa,
        String(r.lessonId),
        r.lessonTitle,
      ].join(",")
    );
  }
  return lines.join(NL) + NL;
}

/** ساخت + دانلودِ CSV جدولِ جفت‌ها — SSR-guard و try-guard، هم‌الگویِ lens */
export function downloadPairsCsv(rows: PairsExportRow[], scope: string): boolean {
  if (typeof document === "undefined") return false;
  try {
    const blob = new Blob([CSV_BOM + buildPairsCsv(rows)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vision2-pairs-${scope}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return true;
  } catch {
    return false;
  }
}
