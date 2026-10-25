// ------------------------------------------------------------------
// r351 — «دفترِ نبض» — برادرِ چهارمِ خانوادهٔ CSV (۱۶۹/۱۷۸/۱۸۰ و
// برادرِ hفته‌نامهها). تفاوتِ جهت با همه: این جدول از سرور میآید نه
// از stateِ محلی — سریِ (روز × رویداد × تعداد) که GET /api/event?days=30
// میدهد؛ «دفترِ سیروزهٔ فعالیتِ بی‌نام». tidyِ تمامعیار: هر سطر =
// یک روز × یک رویداد — معلم/اپراتور در اکسل فیلتر و پیوت میکند.
// قراردادِ خانواده (یک زبان با ۱۶۹/۱۷۸/۱۸۰):
//   · CRLF (RFC 4180) و BOM صریح
//   · اعدادِ ASCII — اکسل بتواند جمع بگیرد
//   · ساختار بدونِ ویرگول/نقل‌قول در مقدارها — تستِ ساختار قفل می‌کند
//     (برچسبهایِ فارسیِ رجیستری هم از همین قانون جزم میشوند)
//   · نامِ ناشناخته همان خودش میماند (صداقت — برچسبِ جعلی ساخته نمیشود)
// ------------------------------------------------------------------

import { EVENT_LABELS_FA, type EventName } from "./analytics-events";
import { downloadCsvFile } from "./file-download";

export const CSV_BOM = "\uFEFF";

/** CRLF per RFC 4180 — same family dialect as 169/178/180 */
const NL = "\r\n";

export const PULSE_CSV_COLUMNS = ["روز", "رویداد", "تعداد"] as const;

export interface PulseLedgerRow {
  day: string;
  name: string;
  count: number;
}

/** برچسبِ فارسی از تکحقیقتِ رجیستری؛ ناشناخته = خودِ کلیدِ خام */
export function pulseLabel(name: string): string {
  return (EVENT_LABELS_FA as Record<string, string>)[name] ?? name;
}

export function buildPulseCsv(rows: PulseLedgerRow[]): string {
  const lines: string[] = [PULSE_CSV_COLUMNS.join(",")];
  for (const r of rows) {
    // عددِ ASCIIِ خالص — اکسل بتواند جمع و نمودار بگیرد
    lines.push([r.day, pulseLabel(r.name), String(r.count)].join(","));
  }
  return lines.join(NL) + NL;
}

export function downloadPulseCsv(rows: PulseLedgerRow[], today: string): boolean {
  // r398 — the byte-identical tail borrows the shared painter.
  return downloadCsvFile(() => CSV_BOM + buildPulseCsv(rows), `vision2-pulse-${today}.csv`);
}
