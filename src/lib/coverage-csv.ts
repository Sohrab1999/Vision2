// ------------------------------------------------------------------
// تسک ۱۸۰ — «خروجیِ CSVِ پوشش» — خانهٔ سومِ خطِ ۱۷۴/۱۷۶ و برادرِ
// خانوادهٔ CSV (۱۶۹/۱۷۸). تفاوتِ جهت: ۳۵روزه/روند خطِ زمان‌اند، این
// یکی «سطحِ توانایی» است — جدولِ بلندِ tidy (هر سطر = درس×مهارت) که
// معلم در اکسل فیلتر/مرتب/پیوت می‌کند؛ همان شکلی که داده‌آشناها دوست
// دارند، نه بازتابِ ۱:۱ جدولِ چاپی.
// قراردادِ خانواده (یک زبان با ۱۶۹/۱۷۸):
//   · CRLF (RFC 4180) و BOM صریح
//   · اعدادِ ASCII — «بهترین نمره» عددِ خالص بدونِ ٪ تا اکسل حساب کند
//   · تلاش‌نشده = سلولِ خالی، نه صفرِ ساختگی (همان صداقتِ «—»یِ چاپی)
//   · تاریخِ بهترین همان ISOِ ثبت‌شده است؛ هیچ Date.now()ای در ساخت
//   · ساختار بدونِ ویرگول/نقل‌قول در مقدارها — تستِ ساختار قفل می‌کند
// چهار حالتِ وضعیت: تلاش‌نشده (null) / ضعیف (<۵۰ — هم‌زبانِ or-bad چاپی)
// / خوب (۵۰..۸۴) / عالی (≥۸۵).
// ------------------------------------------------------------------

import type { CoverageMapResult } from "./coverage-map";

export const CSV_BOM = "\uFEFF";

/** CRLF per RFC 4180 — same family dialect as 169/178 */
const NL = "\r\n";

export const COVERAGE_CSV_COLUMNS = [
  "درس",
  "عنوان درس",
  "مهارت",
  "بهترین نمره",
  "وضعیت",
  "تاریخِ بهترین",
] as const;

export type CoverageStatus = "تلاش‌نشده" | "ضعیف" | "خوب" | "عالی";

/** آستانه‌ها هم‌زبانِ کاغذِ رسمی: زیرِ ۵۰ = or-bad چاپی = «ضعیف» */
export function coverageStatus(best: number | null): CoverageStatus {
  if (best === null) return "تلاش‌نشده";
  if (best < 50) return "ضعیف";
  if (best < 85) return "خوب";
  return "عالی";
}

export function buildCoverageCsv(coverage: CoverageMapResult): string {
  const lines: string[] = [COVERAGE_CSV_COLUMNS.join(",")];
  for (const L of coverage.lessons) {
    for (const c of L.cells) {
      // عددِ ASCIIِ خالص (بدونِ ٪) — اکسل بتواند میانگین بگیرد
      const best = c.best === null ? "" : String(c.best);
      const at = c.at ?? "";
      lines.push([String(L.id), L.title, c.label, best, coverageStatus(c.best), at].join(","));
    }
  }
  return lines.join(NL) + NL;
}

export function downloadCoverageCsv(coverage: CoverageMapResult, today: string): boolean {
  if (typeof document === "undefined") return false; // SSR guard
  try {
    const csv = CSV_BOM + buildCoverageCsv(coverage);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vision2-coverage-${today}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return true;
  } catch {
    return false;
  }
}
