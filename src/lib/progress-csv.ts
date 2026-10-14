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
import type { DayHistoryMap } from "./study-store";

export const CSV_BOM = "\uFEFF";

/** CRLF per RFC 4180 — excel-friendly, exactly like the 169 contract */
const NL = "\r\n";

// ---------------- ۱۶۹ — جدولِ ۳۵روزهٔ پیشرفت ----------------

export const PROGRESS_CSV_COLUMNS = [
  "تاریخ",
  "روز هفته",
  "مرور",
  "آزمون",
  "واژهٔ نو",
  "دیکته",
  "برق‌آسا",
  "مجموع",
] as const;

export const PROGRESS_CSV_DAYS = 35;

export function buildProgressCsv(
  history: DayHistoryMap,
  today: string,
  days: number = PROGRESS_CSV_DAYS
): string {
  const lines: string[] = [PROGRESS_CSV_COLUMNS.join(",")];
  for (let i = days - 1; i >= 0; i -= 1) {
    const key = dayKeyBefore(today, i);
    const s = statOfDay(key, { dayHistory: history });
    const total = s.reviews + s.quizzes + s.words + s.dictation + s.rush;
    lines.push(
      [key, faWeekday(key), s.reviews, s.quizzes, s.words, s.dictation, s.rush, total].join(",")
    );
  }
  return lines.join(NL) + NL;
}

export function downloadProgressCsv(
  history: DayHistoryMap,
  today: string,
  days: number = PROGRESS_CSV_DAYS
): boolean {
  if (typeof document === "undefined") return false; // SSR guard
  try {
    const csv = CSV_BOM + buildProgressCsv(history, today, days);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vision2-progress-${today}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return true;
  } catch {
    return false;
  }
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
  if (typeof document === "undefined") return false; // SSR guard
  try {
    const csv = CSV_BOM + buildWeeklyTrendCsv(input, today, weeks);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vision2-weekly-${today}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return true;
  } catch {
    return false;
  }
}
