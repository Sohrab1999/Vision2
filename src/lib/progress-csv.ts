// ------------------------------------------------------------------
// تسک ۱۷۸ — بازسازیِ وفادارِ خانوادهٔ CSV (تسک ۱۶۹ با اسنپ‌شاتِ ریموت
// فقط رویِ GitHub زنده بود و درختِ محلی در حادثهٔ رول‌بک آن را گم کرده بود)
// + برادرِ تازه: روندِ ۴هفته‌ای برایِ معلم.
// قراردادِ CSV (خانواده — یک زبان):
//   · CRLF (RFC 4180) و BOM با `\uFEFF` صریح — اکسلِ فارسی درست می‌خواند
//   · اعدادِ ASCII عمداً — اکسل بتواند حساب کند (برچسب‌ها فارسی می‌مانند)
//   · سطرهایِ کم‌داده = صفرِ صادقانه، نه حذفِ سطر — جدولِ همیشه‌هم‌شکل
//   · قراردادِ روزِ لنگر: هیچ Date.now() — امروز همیشه ورودی است
//   · ساختار: هیچ‌وقت ویرگول/نقل‌قول داخلِ مقدارها نمی‌آید — بدونِ
//     escape هم ۸/۱۰ فیلدِ سالم، تستِ ساختار این را قفل می‌کند
// بازسازیِ ۱۶۹: ۳۵ روز × ۸ ستون (تاریخ/روز هفته/پنج شمارنده/مجموع).
// تازهٔ ۱۷۸: ۴ هفته × ۱۰ ستون (+روزهایِ فعال/هدف) از statOfDay
// هفته‌نامه (شاملِ سقوطِ legacy history) و goalMetDays.
// ------------------------------------------------------------------

import {
  dayKeyBefore,
  faWeekday,
  statOfDay,
  type DigestInput,
} from "./weekly-digest";
import { monthReads } from "./library-month";
import { downloadCsvFile } from "./file-download";
import type { DayHistoryMap } from "./study-store";

export const CSV_BOM = "\uFEFF";

/** CRLF per RFC 4180 — excel-friendly, exactly like the 169 contract */
const NL = "\r\n";

// ---------------- ۱۶۹ — جدولِ ۳۵روزهٔ پیشرفت ----------------
// r314 — زبانِ دوهفته‌ای در هر سه اکسل: جدولِ ۳۵روزه هم صاحبِ دو ستونِ
// هفت‌روزه شد (۸→۱۰ فیلد) — همان الگویِ r312 در ماه‌نامه، همان خانواده:
//   · «جمعِ هفت‌روزه» = جمعِ لغزانِ ۷روزِ منتهی به سطر — فقط از سطرهای
//     همین جدول (هم‌قراردادِ جمعِ فزاینده)؛ تا ششمین سطر پنجرهٔ کامل
//     ندارد → خانهٔ تهیِ صادق (نه صفرِ دروغین)؛ با daysِ کوتاهِ سفارشی
//     (مثل ۷ یا ۱) هم از خودِ همان سطرها مشتق می‌شود.
//   · «تفاوت با هفت‌روزهٔ پیش» = دو پنجرهٔ غیرهمپوشان — سطر i در برابر
//     سطر i−۷؛ از چهاردهمین سطر دو پنجرهٔ کاملِ درون-فایلی هست؛ افت با
//     مینوسِ ASCII. سطرِ آخر (امروز) = «جمعِ ۷روزِ آخر در برابرِ ۷روزِ
//     قبلش» — همین حکایتی که جملهٔ جهتیِ کارتها میگویند؛ و چون واحدِ
//     این جدول همان پنج شمارندهٔ نوارِ کارتهاست، سطرِ آخرِ همین ستونها
//     باید با weekStripSums برابر باشد — قفلش در آزمونِ پیوندیِ سه‌سطحی.

export const PROGRESS_CSV_COLUMNS = [
  "تاریخ",
  "روز هفته",
  "مرور",
  "آزمون",
  "واژهٔ نو",
  "دیکته",
  "برق‌آسا",
  "مجموع",
  "جمعِ هفت‌روزه",
  "تفاوت با هفت‌روزهٔ پیش",
] as const;

export const PROGRESS_CSV_DAYS = 35;

export function buildProgressCsv(
  history: DayHistoryMap,
  today: string,
  days: number = PROGRESS_CSV_DAYS
): string {
  const lines: string[] = [PROGRESS_CSV_COLUMNS.join(",")];
  // r314 — سطرها اول ساخته میشوند تا پنجرههایِ هفت‌روزه «از خودِ جدول»
  // مشتق شوند (هم‌قراردادِ r312 در ماه‌نامه — هیچ شمارشِ موازیای).
  const rows: [string, string, number, number, number, number, number, number][] = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const key = dayKeyBefore(today, i);
    const s = statOfDay(key, { dayHistory: history });
    const total = s.reviews + s.quizzes + s.words + s.dictation + s.rush;
    rows.push([key, faWeekday(key), s.reviews, s.quizzes, s.words, s.dictation, s.rush, total]);
  }
  const totals = rows.map((r) => r[7]);
  const trailing7: (number | null)[] = totals.map((_, i) =>
    i >= 6 ? totals.slice(i - 6, i + 1).reduce((s, n) => s + n, 0) : null
  );
  rows.forEach((r, i) => {
    const w7 = trailing7[i];
    const prevW7 = w7 === null ? null : trailing7[i - 7] ?? null;
    const w7Cell = w7 === null ? "" : String(w7);
    const deltaCell = w7 === null || prevW7 === null ? "" : String(w7 - prevW7);
    lines.push([...r, w7Cell, deltaCell].join(","));
  });
  return lines.join(NL) + NL;
}

export function downloadProgressCsv(
  history: DayHistoryMap,
  today: string,
  days: number = PROGRESS_CSV_DAYS
): boolean {
  // r398 — the byte-identical tail borrows the shared painter
  // (downloadCsvFile — the builder runs inside its guard).
  return downloadCsvFile(() => CSV_BOM + buildProgressCsv(history, today, days), `vision2-progress-${today}.csv`);
}

// ---------------- ۱۷۸ — روندِ ۴هفته‌ایِ معلم‌نگر ----------------

export const WEEKLY_TREND_COLUMNS = [
  "پایان هفته",
  "روز",
  "مرور",
  "آزمون",
  "واژهٔ نو",
  "دیکته",
  "برق‌آسا",
  "مجموع",
  "تفاوت با هفتهٔ پیش",
  "روزهای فعال",
  "روزهای هدف",
] as const;

export const WEEKLY_TREND_WEEKS = 4;

export function buildWeeklyTrendCsv(
  input: DigestInput,
  today: string,
  weeks: number = WEEKLY_TREND_WEEKS
): string {
  const goalSet = new Set(input.goalMetDays ?? []);
  const lines: string[] = [WEEKLY_TREND_COLUMNS.join(",")];
  // r311 — ستونِ «تفاوت با هفتهٔ پیش» — هم‌قراردادِ ستونِ جمعِ فزایندهٔ
  // ماه‌نامه: عددیِ مشتق از همین سطرها، بدونِ سطرِ خلاصهٔ بیرونِ جدول.
  // کهنه‌ترین سطر پیشینِ درون-فایلی ندارد → خانهٔ تهیِ صادق (نه صفرِ دروغین).
  let prevGrand: number | null = null;
  // پنجره‌هایِ ۷روزه‌یِ ناپیوسته که امروزی‌ترینشان امرو کار می‌کند؛
  // قدیمی‌ترین هفته اول می‌آید (خطِ زمانِ اکسل مثل ۱۶۹: قدیم → نو)
  for (let w = weeks - 1; w >= 0; w -= 1) {
    const endKey = dayKeyBefore(today, w * 7);
    const t = {
      reviews: 0,
      quizzes: 0,
      words: 0,
      dictation: 0,
      rush: 0,
      activeDays: 0,
      goalDays: 0,
    };
    for (let i = 0; i < 7; i += 1) {
      const day = dayKeyBefore(endKey, i);
      const s = statOfDay(day, input); // dayHistory → legacy → صفرِ صادقانه
      const total = s.reviews + s.quizzes + s.words + s.dictation + s.rush;
      t.reviews += s.reviews;
      t.quizzes += s.quizzes;
      t.words += s.words;
      t.dictation += s.dictation;
      t.rush += s.rush;
      if (total > 0) t.activeDays += 1;
      if (goalSet.has(day)) t.goalDays += 1;
    }
    const grand = t.reviews + t.quizzes + t.words + t.dictation + t.rush;
    const deltaCell = prevGrand === null ? "" : String(grand - prevGrand);
    prevGrand = grand;
    lines.push(
      [
        endKey,
        faWeekday(endKey),
        t.reviews,
        t.quizzes,
        t.words,
        t.dictation,
        t.rush,
        grand,
        deltaCell,
        t.activeDays,
        t.goalDays,
      ].join(",")
    );
  }
  return lines.join(NL) + NL;
}

export function downloadWeeklyTrendCsv(
  input: DigestInput,
  today: string,
  weeks: number = WEEKLY_TREND_WEEKS
): boolean {
  // r398 — the byte-identical tail borrows the shared painter.
  return downloadCsvFile(() => CSV_BOM + buildWeeklyTrendCsv(input, today, weeks), `vision2-weekly-${today}.csv`);
}

// ---------------- r305 — ماه‌نامهٔ خواندن (CSVِ معلم‌نگر) ----------------
// ستونِ داستان‌ها (dayHistory.stories — منبعِ r299) تا امروز در هیچ CSVیی
// نبود؛ جدولِ ۳۵روزهٔ ۱۶۹ فقط خانواده‌های statOfDay را میبرد. این‌جا
// برشِ ۳۰روزه از همان قراردادِ خالصِ monthReads (r304) میآید — هیچ
// شمارشِ موازی‌ای. «جمعِ فزاینده» شیبِ ماه را برایِ معلم میسازد؛ سطرِ
// آخرش خودِ جمعِ ماه است — بدونِ سطرِ خلاصهٔ خارجِ جدول.
//
// r312 — دو ستونِ هفت‌روزه — کامل‌شدنِ مقایسهٔ دوهفته‌ای در هر سه سطح
// (بوم: جملهٔ جهتیِ کارتِ PNG / اکسلِ هفتگی: «تفاوت با هفتهٔ پیش» r311 /
// اکسلِ ماهانه: همین‌جا):
//   · «جمعِ هفت‌روزه» = جمعِ لغزانِ ۷روزِ منتهی به سطر — فقط از سطرهای
//     همین جدول (هم‌قراردادِ جمعِ فزاینده)؛ تا ششمین سطر پنجرهٔ کامل
//     ندارد → خانهٔ تهیِ صادق (نه صفرِ دروغین — همان تمایزِ r311).
//   · «تفاوت با هفت‌روزهٔ پیش» = جمعِ همین ۷روز منهایِ جمعِ ۷روزِ قبلش
//     (دو پنجرهٔ غیرهمپوشان — سطر i در برابرِ سطر i−۷)؛ از چهاردهمین
//     سطر دو پنجرهٔ کاملِ درون-فایلی هست → اولین تفاوتِ صادق. مینوسِ
//     ASCII برایِ افت.
//   · سطرِ آخر (امروز) = دقیقاً «جمعِ ۷روزِ آخر در برابرِ ۷روزِ قبلش» —
//     همان حکایتی که جملهٔ جهتیِ کارت میگوید؛ یک منبع، سه سطح.

export const MONTH_CSV_COLUMNS = [
  "تاریخ",
  "روز هفته",
  "داستان‌ها",
  "جمعِ فزاینده",
  "جمعِ هفت‌روزه",
  "تفاوت با هفت‌روزهٔ پیش",
] as const;

export const MONTH_CSV_DAYS = 30;

export function buildMonthCsv(history: DayHistoryMap, today: string): string {
  const m = monthReads(history, today); // منبعِ یگانه — همان نوارِ ماه‌نامهٔ DOM
  const lines: string[] = [MONTH_CSV_COLUMNS.join(",")];
  let running = 0;
  // r312 — جمعِ لغزانِ ۷روزه برایِ هر سطر؛ null تا وقتی پنجرهٔ کاملِ
  // درون-پنجرهای نیست (خانهٔ تهیِ صادق — نه صفرِ دروغین).
  const trailing7: (number | null)[] = m.perDay.map((_, i) =>
    i >= 6 ? m.perDay.slice(i - 6, i + 1).reduce((s, d) => s + d.count, 0) : null
  );
  for (let i = 0; i < m.perDay.length; i += 1) {
    const d = m.perDay[i];
    running += d.count;
    const w7 = trailing7[i];
    const prevW7 = w7 === null ? null : trailing7[i - 7] ?? null;
    const w7Cell = w7 === null ? "" : String(w7);
    const deltaCell = w7 === null || prevW7 === null ? "" : String(w7 - prevW7);
    lines.push([d.day, faWeekday(d.day), d.count, running, w7Cell, deltaCell].join(","));
  }
  return lines.join(NL) + NL;
}

export function downloadMonthCsv(history: DayHistoryMap, today: string): boolean {
  // r398 — the byte-identical tail borrows the shared painter.
  return downloadCsvFile(() => CSV_BOM + buildMonthCsv(history, today), `vision2-month-reading-${today}.csv`);
}
