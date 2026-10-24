// ------------------------------------------------------------------
// r352 — «روزنامهٔ کلاس» — پنجمین عضوِ خانوادهٔ CSV (۱۶۹/۱۷۸/۱۸۰/۳۵۱).
// تفاوتِ سرنوشتساز با دفترِ نبض: اینجا «نام» ورودیِ کاربر است نه
// برچسبِ رجیستری — پس sanitation اجباری (ویرگول/نقل‌قول/شکستِ خط
// بیرونکشی میشوند) تا قراردادِ بیویرگولِ خانواده با هیچ نامی نشکند.
// سلولهایِ خالی = «تلاش‌نشده» (همان صداقتِ coverage)، نه صفرِ ساختگی.
// r377 — دو اصلاح: «ضعیف‌ترین مهارت» برچسبِ فارسیِ تکمنبع میخواند
// (نشتِ «rush (30)» خامِ از r352 که ر375 فقط نما را شست) و ستونِ
// «فعال در ۲۴ ساعت» — همزبانِ کارتِ آمارِ پنل؛ روزنامه هم میشمارد.
// قراردادِ خانواده: BOM صریح + CRLF (RFC 4180) + عددِ ASCII + tidy.
// ------------------------------------------------------------------

import { teacherSkillLabel } from "./teacher-skill-label"; // r377 — تکمنبعِ برچسبِ مهارت (نشتِ خامِ ر352 که ر375 از دید برد)
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
  "فعال در ۲۴ ساعت", // r377 — همزبانِ کارتِ آمارِ پنل (summary.last24h) — روزنامه هم میشمارد
  "ضعیف‌ترین مهارت",
] as const;

/** هیچ ویرگول/نقل‌قول/شکستِ خطی از نامِ کاربر به CSV نمیرسد */
export function csvSafe(v: string): string {
  return v.replace(/[,"\r\n]/g, "").trim();
}

/**
 * r377 — «فعال در ۲۴ ساعت» — پنجرهٔ لغزانِ ۲۴ساعته از لحظهٔ دانلود.
 * همزبانِ کارتِ آمارِ پنل (last24h) — روزنامه هم میتواند بشمارد؛
 * گویشِ خروجی ASCII: ۱ ⇒ فعال، خالی ⇒ نه/هرگز — اکسل جمعِ ستون را میگیرد.
 * lastActiveِ غایب/ناخوانا ⇒ خالیِ صادق — نه حدسِ فعال، نه صفرِ ساختگی.
 */
export function activeIn24h(lastActive: string | null | undefined, now: number): boolean {
  if (typeof lastActive !== "string" || lastActive.length === 0) return false;
  const t = Date.parse(lastActive);
  return Number.isFinite(t) && t >= now - 86_400_000;
}

export function buildClassCsv(roster: RosterRow[], now: number = Date.now()): string {
  const lines: string[] = [CLASS_CSV_COLUMNS.join(",")];
  for (const r of roster) {
    // r377 — برچسبِ فارسیِ تکمنبع؛ کلیدِ ناشناخته = خودش (قراردادِ r375)
    const weakest = r.weakest ? `${teacherSkillLabel(r.weakest.category)} (${r.weakest.avgPercent})` : "";
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
        activeIn24h(r.lastActive, now) ? "1" : "",
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
