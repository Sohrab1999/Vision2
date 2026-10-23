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
// DB نیست. صداقتها:
//   · هفتهٔ بی‌تلاش = صفرِ واقعی با شاهد (بنیادِ صفرِ r352) — سطرِ
//     «هفتهٔ فعال» چاپ میشود، اما سطرِ «پرکارترین» چاپ نمیشود؛
//     در هفتهٔ خالی پرکارترینِ روز وجود ندارد — ساختگی ممنوع.
//   · ردیفِ بدنام (تلاشِ غیرعددی) ⇒ صفرِ آن ردیف — شمارندهها هرگز
//     دروغ نمیگویند؛ روزِ بی‌برچسب ⇒ فقط سطرِ پرکارترین حذف
//     میشود، نه تجمیع — aggregate صادق میماند، جزئیاتِ
//     قالبپذیرِ ناقص حذف.
//   · تساویِ پرکارترین ⇒ روزِ تازهتر — قطعی و قفلِ تستی.
//   · طولِ پنجره از خودِ داده مشتق میشود (همان درسِ TREND_TITLE_OF
//     در r354) — اگر گزارش پنجرهاش را عوض کند، سطر دنبالش میرود.
//   · ورودیِ زباله (غیرآرایه/تهی) ⇒ هیچ سطری — غیبتِ صادق.
//   · اعدادِ ASCII (گویشِ خانواده) — اکسل بتواند جمع بگیرد.
// ------------------------------------------------------------------

export interface ActiveWeekMeta {
  total: number; // کلِ تلاشهایِ پنجره
  activeDays: number; // روزهایِ دارایِ تلاش
  windowDays: number; // طولِ پنجره — از خودِ داده
  busiest: { day: string; attempts: number } | null; // هفتهٔ خالی = null
}

export function activeWeekMeta(
  byDay: { day: string; attempts: number }[] | null | undefined
): ActiveWeekMeta | null {
  if (!Array.isArray(byDay) || byDay.length === 0) return null;
  let total = 0;
  let activeDays = 0;
  let busiest: { day: string; attempts: number } | null = null;
  for (const row of byDay) {
    // پالایشِ هر ردیف: تلاشِ غیرعددی/منفی ⇒ صفرِ آن ردیف — شمارندهها هرگز دروغ نمیگویند
    const attempts =
      row && typeof row.attempts === "number" && Number.isFinite(row.attempts) && row.attempts > 0
        ? Math.floor(row.attempts)
        : 0;
    total += attempts;
    if (attempts > 0) activeDays += 1;
    // تساوی ⇒ روزِ تازهتر میبرد (>=) — قطعی
    if (attempts > 0 && (!busiest || attempts >= busiest.attempts)) {
      busiest = {
        day: row && typeof row.day === "string" ? row.day : "",
        attempts,
      };
    }
  }
  return { total, activeDays, windowDays: byDay.length, busiest };
}

/** سطرهایِ «هفتهٔ فعال» — پرکارترین فقط وقتی واقعاً روزی برایِ پر بودن هست */
export function activeWeekRows(meta: ActiveWeekMeta): string[] {
  const rows: string[] = [
    `هفتهٔ فعال,${meta.total} تلاش در ${meta.windowDays} روزِ اخیر · ${meta.activeDays} روزِ فعال`,
  ];
  if (meta.busiest && meta.busiest.day) {
    rows.push(`پرکارترینِ روز,${meta.busiest.day} · ${meta.busiest.attempts} تلاش`);
  }
  return rows;
}

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
