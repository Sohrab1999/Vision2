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

export interface ClassLedgerInput {
  generatedAt: string; // ISO — از گزارشِ پنل
  roster: RosterRow[];
  details: LearnerDetail[]; // به ترتیبِ فهرستِ سرور — هم‌ترازِ roster
}

export function buildClassLedgerCsv(input: ClassLedgerInput): string {
  const parts: string[] = [];
  parts.push(`${LEDGER_TITLE}${NL}${ledgerIssuedRow(input.generatedAt)}${NL}`);
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
