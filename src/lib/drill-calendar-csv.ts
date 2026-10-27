// ------------------------------------------------------------------
// r418 — «صادرِ تقویمِ مرور» — دوقلویِ خانوادهٔ CSV (تسک ۱۶۹/r312/r314)
// رویِ بانکِ خطایِ دریلها (r413/r414/r416/r417). مکملِ طبیعیِ r417:
// چیپِ آسمانی «نزدیکترین بازگشت» را در نما میگوید؛ تقویم همین روایت
// را در اکسل میدهد — همهٔ ردیفهایِ زندهٔ بانک با روزِ بازگشتِ برنامهای.
//
// قراردادِ خانواده (عینِ progress-csv — یک زبان):
//   · CRLF (RFC 4180) و BOM با `CSV_BOM + build(...)` نزدِ جایِ دانلود
//   · اعدادِ ASCII عمداً — اکسل بتواند حساب کند (برچسبها فارسی میمانند)
//   · روزِ لنگر: هیچ Date.now() — امروز همیشه ورودی است
//   · دو مجموعهٔ زنده، دو حقیقت (همپوشانیِ صفرِ r417): سررسیدها (امروز
//     پرسیدنی — drillDueBases به ترتیبِ اولویتِ صادق) و درنفسها
//     (drillGraceRows به ترتیبِ نزدیکترین بازگشت). مسلطها و اشتباهِ
//     امروزِ بیحق بازگشتِ برنامهای ندارند — تقویم ادعایِ بیپشتوانه
//     نمیسازد (حکمِ r417: آسمان هیچ را بدونِ پشتوانه رندر نمیکند).
//   · ردیفِ سررسید: روزِ بازگشتش «امروز» است (همین تعریفِ سررسید) —
//     ستونِ روزِ بازگشت همیشه پُر میماند (جدولِ همیشههمشکل).
//
// گویشِ مستندِ خود (الگویِ no-verdictِ file-download): خانوادهٔ ۱۶۹
// «بدونِ escape» بود چون دامنهٔ ارزشهاش شمارنده/کلیدِ بیویرگول بود؛
// دامنهٔ تقویم جملهٔ انگلیسیِ درسنامه (bg-examples) و واژهٔ چندکلمهای
// دیکشنری را هم حمل میکند — پس escapeِ کمینهٔ RFC 4180 (نقلقولِ
// دوبرابر) نزدِ همین ماژول است؛ مالکِ خانواده (file-download) دستنخورده.
//
// مالکیتِ برچسب (r403): معنیِ هر پایه نزدِ میزبانِ همان بانک است —
// سازنده فقط resolver میگیرد؛ «معنی»یِ حلنشده خانهٔ تهیِ صادق است
// (نه حدسِ ساختگی).
// ------------------------------------------------------------------

import { CSV_BOM, downloadCsvFile } from "./file-download"; // r399 — BOM تکخانه (مالک)
import {
  drillDueBases,
  drillGraceRows,
  type DrillMistakeBank,
  type DrillMistakeEntry,
  type DrillMistakeMap,
} from "./drill-mistakes";
import { faWeekday } from "./weekly-digest";

/** CRLF per RFC 4180 — excel-friendly, exactly like the 169 contract */
const NL = "\r\n";

/** escapeِ کمینهٔ RFC 4180 — گویشِ مستندِ این ماژول (سرصفحه را ببین) */
const calendarCell = (v: string): string =>
  /[",\r\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;

export const DRILL_CALENDAR_COLUMNS = [
  "وضعیت",
  "پایه",
  "معنی",
  "خطاها",
  "حقها",
  "آخرین خطا",
  "روزِ بازگشت",
  "روز هفته",
  "روزهای مانده",
] as const;

/** یک سطرِ تقویم — دو وضعیتِ زنده؛ سررسید = بازگشتِ امروز (daysUntil ۰) */
export interface DrillCalendarRow {
  state: "due" | "grace";
  base: string;
  label: string;
  wrong: number;
  ok: number;
  lastDay: string;
  nextDueDay: string;
  daysUntil: number;
}

/**
 * سازندهٔ خالصِ سطرها از بانکِ خطایِ «همان بانک» (نه کلِ نقشه — قراردادِ
 * مرجعِ پایدارِ نما): نخست سررسیدها به ترتیبِ اولویتِ drillDueBases
 * (بیشترین خطا، کهنهترین اشتباه) و بعد درنفسها به ترتیبِ نزدیکترین
 * بازگشتِ drillGraceRows — ترتیبِ SRSِ صادق، بی شمارشِ موازی.
 */
export function buildDrillCalendarRows(
  bank: DrillMistakeBank | undefined,
  today: string,
  resolveLabel: (base: string) => string,
): DrillCalendarRow[] {
  const entryOf = (base: string): DrillMistakeEntry | undefined => bank?.[base];
  const due: DrillCalendarRow[] = drillDueBases(bank, today).map((base) => {
    const e = entryOf(base);
    return {
      state: "due" as const,
      base,
      label: resolveLabel(base) ?? "",
      wrong: e?.wrong ?? 0,
      ok: e?.ok ?? 0,
      lastDay: e?.lastDay ?? "",
      nextDueDay: today,
      daysUntil: 0,
    };
  });
  const grace: DrillCalendarRow[] = drillGraceRows(bank, today).map((r) => {
    const e = entryOf(r.base);
    return {
      state: "grace" as const,
      base: r.base,
      label: resolveLabel(r.base) ?? "",
      wrong: e?.wrong ?? 0,
      ok: e?.ok ?? 0,
      lastDay: e?.lastDay ?? "",
      nextDueDay: r.nextDueDay,
      daysUntil: r.daysUntil,
    };
  });
  return [...due, ...grace];
}

/** بدنهٔ CSV — سرصفحه + سطرها؛ بانکِ تهی = جدولِ همیشههمشکلِ تهیِ صادق */
export function buildDrillCalendarCsv(rows: readonly DrillCalendarRow[]): string {
  const lines: string[] = [DRILL_CALENDAR_COLUMNS.join(",")];
  for (const r of rows) {
    lines.push(
      [
        calendarCell(r.state === "due" ? "سررسید" : "درنفس"),
        calendarCell(r.base),
        calendarCell(r.label),
        String(r.wrong),
        String(r.ok),
        calendarCell(r.lastDay),
        calendarCell(r.nextDueDay),
        calendarCell(faWeekday(r.nextDueDay)),
        String(r.daysUntil),
      ].join(","),
    );
  }
  return lines.join(NL) + NL;
}

/** r398 — دنبالهٔ دانلود از نقاشِ مشترک؛ BOM نزدِ جایِ دانلود (r399) */
export function downloadDrillCalendarCsv(
  rows: readonly DrillCalendarRow[],
  today: string,
): boolean {
  return downloadCsvFile(
    () => CSV_BOM + buildDrillCalendarCsv(rows),
    `vision2-review-calendar-${today}.csv`,
  );
}

// ------------------------------------------------------------------
// r420 — «تقویمِ همهٔ بانکها» — دوقلویِ چندبانکیِ همان تقویم (پیشنهادِ
// ②ِ r418): یک فایل برایِ همهٔ بانکهایِ زندهٔ نقشه، کنارِ خروجیهایِ
// هفته‌نامه. سازنده خالص میماند — خانوادهٔ میزبان (سازندهٔ برچسبِ هر
// بانک + عنوانِ بانک + ترتیبِ رسمی) از بیرون تزریق میشود (اطلسِ r420
// نزدِ صداکننده است؛ کتابخانهٔ CSV بیداده میماند — عینِ قراردادِ
// بیدادهِ ۱۶۹). ساختارِ بلوکی: بانکها به ترتیبِ رسمیِ میزبان، بانکِ
// ناشناسِ بیرونِ ترتیب به ترتیبِ الفباییِ خودش در انتها (قطعیِ صادق)؛
// داخلِ هر بانک عینِ ترتیبِ SRSِ r418 (سررسیدها به اولویت، درنفسها
// به نزدیکترین بازگشت). ستونِ تازهٔ «بانک» بعدِ «وضعیت» — گویشِ
// دهستونیِ مستندِ خود (دوقلوی ۹ستونیِ r418). مسلطها و تازهٔ امروزِ
// بیحق اینجا هم سطر ندارند — تقویمِ چندبانکی هم ادعایِ بیپشتوانه
// نمیسازد.
// ------------------------------------------------------------------

/** خانوادهٔ میزبانِ چندبانکی — تزریقِ اطلس (r420) به سازندهٔ خالص */
export interface DrillCalendarHosts {
  labelFor: (bankId: string) => (base: string) => string;
  titleFor: (bankId: string) => string;
  order: readonly string[];
}

/** یک سطرِ تقویمِ چندبانکی — همان سطرِ r418 + شناسه و عنوانِ بانک */
export interface DrillCalendarAllRow extends DrillCalendarRow {
  bankId: string;
  bankTitle: string;
}

export const DRILL_CALENDAR_ALL_COLUMNS = [
  "وضعیت",
  "بانک",
  "پایه",
  "معنی",
  "خطاها",
  "حقها",
  "آخرین خطا",
  "روزِ بازگشت",
  "روز هفته",
  "روزهای مانده",
] as const;

/**
 * سازندهٔ خالصِ سطرهایِ همهٔ بانکها: بلوکهایِ بانکی به ترتیبِ رسمیِ
 * میزبان (بانکِ بیردیف از فهرست میافتد — هیچ بلوکِ تهیِ ساختگی)،
 * بانکهایِ بیرونِ ترتیبِ رسمی (سقفِ ۲۴ بانک اجازهشان میدهد) به
 * ترتیبِ الفبایی در انتها؛ داخلِ هر بلوک عینِ buildDrillCalendarRows.
 */
export function buildDrillCalendarAllRows(
  map: DrillMistakeMap,
  today: string,
  hosts: DrillCalendarHosts,
): DrillCalendarAllRow[] {
  const bankIds = Object.keys(map ?? {});
  const ordered = [
    ...hosts.order.filter((id) => bankIds.includes(id)),
    ...bankIds.filter((id) => !hosts.order.includes(id)).sort(),
  ];
  const rows: DrillCalendarAllRow[] = [];
  for (const bankId of ordered) {
    const bank = map[bankId];
    if (!bank) continue; // بانکِ غایب — هیچ بلوکی
    const resolve = hosts.labelFor(bankId);
    for (const r of buildDrillCalendarRows(bank, today, resolve)) {
      rows.push({ ...r, bankId, bankTitle: hosts.titleFor(bankId) });
    }
  }
  return rows;
}

/** بدنهٔ CSVِ چندبانکی — سرصفحهٔ دهستونی + سطرها؛ عینِ گویشِ r418 */
export function buildDrillCalendarAllCsv(rows: readonly DrillCalendarAllRow[]): string {
  const lines: string[] = [DRILL_CALENDAR_ALL_COLUMNS.join(",")];
  for (const r of rows) {
    lines.push(
      [
        calendarCell(r.state === "due" ? "سررسید" : "درنفس"),
        calendarCell(r.bankTitle),
        calendarCell(r.base),
        calendarCell(r.label),
        String(r.wrong),
        String(r.ok),
        calendarCell(r.lastDay),
        calendarCell(r.nextDueDay),
        calendarCell(faWeekday(r.nextDueDay)),
        String(r.daysUntil),
      ].join(","),
    );
  }
  return lines.join(NL) + NL;
}

/** r398/r418 — BOM نزدِ جایِ دانلود؛ نامِ فایلِ خودگویشِ چندبانکی */
export function downloadDrillCalendarAllCsv(
  rows: readonly DrillCalendarAllRow[],
  today: string,
): boolean {
  return downloadCsvFile(
    () => CSV_BOM + buildDrillCalendarAllCsv(rows),
    `vision2-review-calendar-all-${today}.csv`,
  );
}

// ------------------------------------------------------------------
// r421 — «تقویمِ هفتهٔ پیشِ رو» — برشِ ۷روزهٔ همان تقویم (پیشنهادِ ③ِ
// r418؛ پرسشِ ابزار، نه سیاست). پرسشِ سند: «این هفته چه چیزی برمیگردد؟»
// — همهٔ اطلسِ r420 را میخوانَد (buildDrillCalendarAllRows — تکمنبع،
// هیچ شمارشِ موازیای) و فقط روزهایِ ۰ تا ۶ (امروز + ۶ روزِ پیشِ رو)
// را روزبهروز میچیند؛ هر روز با یک سطرِ «جمعِ روز» پیشِ ردیفهایش.
// ردیفهایِ دورتر حذفِ خاموش نمیشوند — یک سطرِ «پس از هفته» در دنباله
// میگوید چندتایند و نزدیکترینِشان کی برمیگردد (صداقتِ بدونِادعا: سندِ
// هفته فقط پنجرهاش را وعده میدهد، بقیه را انکار نمیکند). مسلطها و
// تازهٔ امروزِ بیحق از منبعِ r420 همینجا هم سطر ندارند.
// ------------------------------------------------------------------

/** پنجرهٔ ۷روزه: روزهایِ ماندهٔ ۰ تا ۶ — بیشتر از آن «پس از هفته» است */
export const DRILL_WEEK_WINDOW = 6;

/**
 * یک سطرِ بدنهٔ هفته: آیتمِ زنده، یا جمعِ روز، یا دنبالهٔ پس از هفته.
 * r434 — دنبالهٔ پس از هفته «نام» هم میگوید: nearestCount و
 * nearestBankIds روزِ نزدیکترین را حمل میکنند (آیتمهایِ همان روز و
 * بانکهایِ متمایزشان به ترتیبِ بلوکیِ رسمی — نخستینِ برخورد از خودِ
 * ترتیبِ r420 میآید، بی محاسبهٔ موازی). CSV این فیلدها را نادیده
 * میگیرد — قراردادِ سطریِ r421 دستنخورده میماند.
 */
export type DrillWeekAgendaRow =
  | { kind: "item"; item: DrillCalendarAllRow }
  | { kind: "dayTotal"; day: string; daysUntil: number; count: number }
  | {
      kind: "afterWeek";
      count: number;
      nearestDay: string;
      nearestDaysUntil: number;
      nearestCount: number;
      nearestBankIds: string[];
    };

/** شکلِ برگشتیِ سازندهٔ هفته — نما فقط با itemCount دکمه را بالا میآورد (r236) */
export interface DrillWeekAgenda {
  rows: DrillWeekAgendaRow[];
  itemCount: number; // ردیفهایِ زندهٔ درونِ پنجره
  dayCount: number; // روزهایِ دارایِ ردیف (زیرِ پنجرهٔ ۷روزه)
  afterCount: number; // ردیفهایِ زندهٔ پسِ پنجره
}

/**
 * چینندهٔ روزبهروز — ورودیاش سطرهایِ همه-بانکیِ r420 است (نه نقشه):
 * نما همین memo را با همین وابستگی دارد و کتابخانه دو بار از بانکها
 * عبور نمیکند. ترتیب: روز صعودی؛ در هر روز اولِ «جمعِ روز» بعد
 * ردیفها به همان ترتیبِ بلوکیِ رسمیِ r420 (بانکِ رسمی، درونِ بانک
 * سررسیدها به اولویت و درنفسها به نزدیکترین).
 */
export function buildDrillWeekAgendaFromRows(
  all: readonly DrillCalendarAllRow[],
): DrillWeekAgenda {
  const inWindow = all.filter((r) => r.daysUntil <= DRILL_WEEK_WINDOW);
  const after = all.filter((r) => r.daysUntil > DRILL_WEEK_WINDOW);
  const rows: DrillWeekAgendaRow[] = [];
  let dayCount = 0;
  for (let k = 0; k <= DRILL_WEEK_WINDOW; k++) {
    const dayItems = inWindow.filter((r) => r.daysUntil === k);
    if (dayItems.length === 0) continue;
    // همهٔ اعضایِ یک روز، روزِ بازگشتِ یکسان دارند (سررسید=امروز،
    // درنفس=lastOkDay+نردبان) — از خودِ سطر میآید، بی محاسبهٔ موازی
    const day = dayItems[0].nextDueDay;
    rows.push({ kind: "dayTotal", day, daysUntil: k, count: dayItems.length });
    for (const item of dayItems) rows.push({ kind: "item", item });
    dayCount += 1;
  }
  const nearest = after.length
    ? after.reduce((m, r) => (r.daysUntil < m.daysUntil ? r : m))
    : null;
  if (nearest) {
    // r434 — روزِ نزدیکترین و بانکهایِ متمایزشان (ترتیبِ بلوکیِ رسمی:
    // سطرهایِ after با همان ترتیبِ r420 میآیند، نخستینِ برخورد مالکِ
    // ترتیب است — هیچ مرتبسازیِ موازیای). reduce در تساوی نخستین را
    // نگه میدارد — همین نخستینِ بلوکی، نزدیکترینِ مستند است.
    const sameDay = after.filter((r) => r.daysUntil === nearest.daysUntil);
    const nearestBankIds: string[] = [];
    for (const r of sameDay) {
      if (!nearestBankIds.includes(r.bankId)) nearestBankIds.push(r.bankId);
    }
    rows.push({
      kind: "afterWeek",
      count: after.length,
      nearestDay: nearest.nextDueDay,
      nearestDaysUntil: nearest.daysUntil,
      nearestCount: sameDay.length,
      nearestBankIds,
    });
  }
  return { rows, itemCount: inWindow.length, dayCount, afterCount: after.length };
}

/**
 * r423 — خانههایِ هفتگانهٔ تقویمِ هفته — تکمنبعِ مشترکِ نوارِ نمایِ r422
 * و کارتِ تصویریِ r423: هر دو از همین آرایه میخوانند و هیچ خانهای
 * دوباره شمرده نمیشود (شمارِ هر خانه از سطرِ dayTotalِ خودِ agenda
 * میآید — صفرِ شمارشِ موازی). dayFor تزریقی است (نما:
 * k => daysAgoKey(-k)) تا کتابخانه بیِ study-store بماند و آزمونها
 * با کلیدهایِ ثابت قطعی باشند. خانههایِ بیبازگشت با count=۰ میآیند —
 * صداقتِ ساکتِ r236 در نما و بوم رنگ میگیرد، اینجا فقط واقعیت است.
 * برچسبِ «امروز»/«فردا» زبانِ خودِ خانههایِ r422 است؛ k≥۲ روزِ هفتهٔ
 * واقعی (faWeekday) — برایِ روزِ دارایِ سطر از dayِ خودِ سطر (روزی که
 * SRS وعده کرده)، برایِ روزِ ساکت از dayFor.
 */
export interface DrillWeekCalendarCell {
  k: number;
  day: string;
  label: string;
  count: number;
}

export function buildDrillWeekCalendarCells(
  agenda: DrillWeekAgenda,
  dayFor: (k: number) => string,
): DrillWeekCalendarCell[] {
  return Array.from({ length: DRILL_WEEK_WINDOW + 1 }, (_, k) => {
    const t = agenda.rows.find((r) => r.kind === "dayTotal" && r.daysUntil === k);
    const day = t?.kind === "dayTotal" ? t.day : dayFor(k);
    const label = k === 0 ? "امروز" : k === 1 ? "فردا" : faWeekday(day);
    return { k, day, label, count: t?.kind === "dayTotal" ? t.count : 0 };
  });
}

/** بدنهٔ CSVِ هفته — سرصفحهٔ دهستونیِ r420 + سطرهایِ جمع/آیتم/پساز هفته */
export function buildDrillWeekAgendaCsv(agenda: DrillWeekAgenda): string {
  const lines: string[] = [DRILL_CALENDAR_ALL_COLUMNS.join(",")];
  for (const row of agenda.rows) {
    if (row.kind === "item") {
      const r = row.item;
      lines.push(
        [
          calendarCell(r.state === "due" ? "سررسید" : "درنفس"),
          calendarCell(r.bankTitle),
          calendarCell(r.base),
          calendarCell(r.label),
          String(r.wrong),
          String(r.ok),
          calendarCell(r.lastDay),
          calendarCell(r.nextDueDay),
          calendarCell(faWeekday(r.nextDueDay)),
          String(r.daysUntil),
        ].join(","),
      );
    } else if (row.kind === "dayTotal") {
      // سطرِ جمع: خانهٔ «معنی» متنِ انسانیِ سطر را حمل میکند (N مورد) —
      // بانکِ تهی یعنی فیلترِ بانکی سطرِ جمع را خودکار کنار میگذارد
      lines.push(
        [
          calendarCell("جمعِ روز"),
          "",
          "",
          `${row.count} مورد`,
          "",
          "",
          "",
          calendarCell(row.day),
          calendarCell(faWeekday(row.day)),
          String(row.daysUntil),
        ].join(","),
      );
    } else {
      // سطرِ پس از هفته: نزدیکترینِ دورترها با روزِ بازگشتِ خودش —
      // «پنجره تمام شد» انکارِ بقیه نیست
      lines.push(
        [
          calendarCell("پس از هفته"),
          "",
          "",
          `${row.count} موردِ دیگر`,
          "",
          "",
          "",
          calendarCell(row.nearestDay),
          calendarCell(faWeekday(row.nearestDay)),
          String(row.nearestDaysUntil),
        ].join(","),
      );
    }
  }
  return lines.join(NL) + NL;
}

/** r398/r418 — BOM نزدِ جایِ دانلود؛ نامِ فایلِ خودگویشِ هفتگی */
export function downloadDrillWeekAgendaCsv(
  agenda: DrillWeekAgenda,
  today: string,
): boolean {
  return downloadCsvFile(
    () => CSV_BOM + buildDrillWeekAgendaCsv(agenda),
    `vision2-review-week-${today}.csv`,
  );
}
