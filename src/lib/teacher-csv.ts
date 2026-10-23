// ------------------------------------------------------------------
// r352 — «روزنامهٔ کلاس» — پنجمین عضوِ خانوادهٔ CSV (۱۶۹/۱۷۸/۱۸۰/۳۵۱).
// تفاوتِ سرنوشتساز با دفترِ نبض: اینجا «نام» ورودیِ کاربر است نه
// برچسبِ رجیستری — پس sanitation اجباری (ویرگول/نقل‌قول/شکستِ خط
// بیرونکشی میشوند) تا قراردادِ بیویرگولِ خانواده با هیچ نامی نشکند.
// سلولهایِ خالی = «تلاش‌نشده» (همان صداقتِ coverage)، نه صفرِ ساختگی.
// قراردادِ خانواده: BOM صریح + CRLF (RFC 4180) + عددِ ASCII + tidy.
// ------------------------------------------------------------------

import type { RosterRow } from "./teacher-report";

export const CSV_BOM = "\uFEFF";

const NL = "\r\n";

export const CLASS_CSV_COLUMNS = [
  "نام",
  "رنگ",
  "تلاش",
  "میانگین",
  "بهترین",
  "درس‌ها",
  "آخرین فعالیت",
  "ضعیف‌ترین مهارت",
] as const;

/** هیچ ویرگول/نقل‌قول/شکستِ خطی از نامِ کاربر به CSV نمیرسد */
export function csvSafe(v: string): string {
  return v.replace(/[,"\r\n]/g, "").trim();
}

export function buildClassCsv(roster: RosterRow[]): string {
  const lines: string[] = [CLASS_CSV_COLUMNS.join(",")];
  for (const r of roster) {
    const weakest = r.weakest ? `${r.weakest.category} (${r.weakest.avgPercent})` : "";
    lines.push(
      [
        csvSafe(r.name),
        csvSafe(r.color),
        String(r.attempts),
        r.avgPercent === null ? "" : String(r.avgPercent),
        r.bestPercent === null ? "" : String(r.bestPercent),
        String(r.lessons),
        // ISOِ پایدار (idiomِ coverage) — «۳ ساعت پیش» در فایل کهنه میشود؛
        // برچسبِ فارسیِ روان فقط در نماست. خالی = هرگز.
        r.lastActive ?? "",
        csvSafe(weakest),
      ].join(",")
    );
  }
  return lines.join(NL) + NL;
}

export function downloadClassCsv(roster: RosterRow[], today: string): boolean {
  if (typeof document === "undefined") return false; // SSR guard
  try {
    const csv = CSV_BOM + buildClassCsv(roster);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vision2-class-${today}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return true;
  } catch {
    return false;
  }
}
