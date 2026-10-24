// ------------------------------------------------------------------
// r357 — «دفترِ کلاسِ کامل» — هشتمین عضوِ خانوادهٔ CSV
// (۱۶۹/۱۷۸/۱۸۰/۳۵۱ و روزنامهٔ r352 و کارنامهٔ r354) — پیشنهادِ ④ِ
// r354 (سه راند باز): پیوندِ روزنامه و کارنامه در یک پروندهٔ آرشیوی.
//
// [قانونِ این عضو — قرض، نه رونویسی]: بدنهٔ جدولِ کلاس از
// buildClassCsv (تکحقیقتِ r352) و بدنهٔ هر کارنامه از
// buildLearnerCardCsv (تکحقیقتِ r354) قرض گرفته میشود — این فایل
// هیچ ستونی و هیچ سطرِ دادهای را دوباره نمیسازد. روزنامه ستونی
// بگیرد یا کارنامه بخشی، دفتر خودبهخود دنبالش میرود؛ حذفِ یکی از
// دو تکحقیقت، کامپایلِ همین فایل را هم میشکند.
//
// شکل: گزارشِ چندبخشیِ همخانواده با کارنامهٔ r354 (گویشِ خانواده
// بایت‌به‌بایت: BOM صریحِ دانلودکننده + CRLF (RFC 4180) + عددِ ASCII
// + csvSafe + سلولِ خالیِ صادق + تاریخِ ISOِ پایدار)؛ بخشها با سطرِ
// خالی جدا میشوند — عنوانِ دفتر + سطرِ «صادره» + جدولِ کلاس + یک
// کارنامه برای هر یادگیرندهٔ دارایِ جزئیات (به همان ترتیبِ فهرستِ
// سرور که ترتیبِ آرشیو است — مرتبسازیِ لحظهایِ معلم نگرِ نمایش است
// نه آرشیو؛ واکشِ نما به همان ترتیب انجام میشود).
//
// حریم: فقط همان داده‌ای که پنل نشان میدهد — نه userId و نه secret
// و نه پاسخِ خام و نه handle (قفلِ r352 دستنخورده).
// ------------------------------------------------------------------

import { CSV_BOM, buildClassCsv } from "./teacher-csv";
import { buildLearnerCardCsv } from "./teacher-learner-csv";
import { activeWeekMeta, activeWeekRows } from "./active-week";
import type { RosterRow, LearnerDetail } from "./teacher-report";

const NL = "\r\n";

export const LEDGER_TITLE = "ویژن ۲ — دفترِ کلاسِ کامل";

/** سطرِ متا — روزِ صدورِ دفتر (ISOِ پایدار، نه برچسبِ روانِ کهنهشونده) */
export function ledgerIssuedRow(generatedAt: string): string {
  return `صادره,${generatedAt.slice(0, 10)}`;
}

// ------------------------------------------------------------------
// r362 — «هفتهٔ فعال» در سربرگِ دفتر — تجمیعِ هفتروزی که r357 وعده
// داده بود. از خودِ گزارشِ پنل میخواند (summary.byDay — همان
// تکحقیقتی که نوارِ هفتروزه میخواند) — هیچ محاسبهٔ موازی‌ای روی
// DB نیست.
// r363 — موتورِ هفتهٔ فعال به کتابخانهٔ مشترکِ active-week.ts رفت
// (کارنامهٔ یادگیرنده هم همزبانِ دفتر شد و ایمپورتِ معکوس سیکل
// میساخت — آیدیومِ r360: تکحقیقت قرض داده میشود، ساخته نمیشود).
// صداقتهایِ موتور (هفتهٔ خالی/ردیفِ بدنام/تساوی/پنجرهٔ مشتق/زباله)
// حالا در src/lib/active-week.ts ساکن‌اند و قفلِ تستیشان همان
// است — دفتر فقط مصرفکنندهٔ نخستِ آن است.
// ------------------------------------------------------------------

// سازگاریِ APIِ r362 — موتورِ هفتهٔ فعال از کتابخانهٔ مشترک عبور میکند
export { activeWeekMeta, activeWeekRows } from "./active-week";
export type { ActiveWeekMeta } from "./active-week";

// ------------------------------------------------------------------
// r373 — «دفترِ کلاسهایِ بزرگ» — سیاستِ سرعتِ واکشی. مسیرِ جزئیات
// (/api/teacher/learner) با سقفِ ۶۰/دقیقه محافظت میشود؛ دفتری با
// بیش از LEDGER_RATE_WINDOW_MAX کارنامه حتماً از پنجره عبور میکند —
// نما با مکثِ محترمانه (Retry-After سرور) ادامه میدهد، تا LEDGER_RATE_WAITS
// بار. دفترِ نصفه همچنان ممنوع (قراردادِ r357) — یا کامل یا هیچ.
// ------------------------------------------------------------------

/** سقفِ نرخِ /api/teacher/learner — از این مرز، دانلودِ دفتر حتماً مکث میخواهد */
export const LEDGER_RATE_WINDOW_MAX = 60;
/** بیشینهٔ مکثِ ۴۲۹ در یک دانلودِ دفتر — بعدش انصرافِ صادق */
export const LEDGER_RATE_WAITS = 3;

export interface ClassLedgerInput {
  generatedAt: string; // ISO — از گزارشِ پنل
  byDay: { day: string; attempts: number }[]; // r362 — هفتهٔ فعال از خودِ گزارش (summary.byDay) — حذفش کامپایل را میشکند
  roster: RosterRow[];
  details: LearnerDetail[]; // به ترتیبِ فهرستِ سرور — هم‌ترازِ roster
}

export function buildClassLedgerCsv(input: ClassLedgerInput): string {
  const parts: string[] = [];
  parts.push(`${LEDGER_TITLE}${NL}${ledgerIssuedRow(input.generatedAt)}${NL}`);
  // r362 — سطرهایِ «هفتهٔ فعال» بینِ صادره و جدولِ کلاس؛ ورودیِ زباله ⇒ غیبتِ صادق
  const week = activeWeekMeta(input.byDay);
  if (week) {
    for (const row of activeWeekRows(week)) {
      parts.push(`${row}${NL}`);
    }
  }
  // جداکنندهٔ بخش — همان idiomِ سطرِ خالیِ کارنامهٔ r354
  parts.push(NL);
  // جدولِ کلاس — قرضِ کامل از r352 (سرستون + سطرها، به NL ختم)
  parts.push(buildClassCsv(input.roster));
  // کارنامهها — قرضِ کامل از r354؛ هر کدام به NL ختم، جداکنندهٔ سطرِ خالی
  for (const d of input.details) {
    parts.push(NL);
    parts.push(buildLearnerCardCsv(d));
  }
  return parts.join("");
}

export function downloadClassLedgerCsv(input: ClassLedgerInput, today: string): boolean {
  if (typeof document === "undefined") return false; // SSR guard
  try {
    const csv = CSV_BOM + buildClassLedgerCsv(input);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vision2-class-ledger-${today}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return true;
  } catch {
    return false;
  }
}
