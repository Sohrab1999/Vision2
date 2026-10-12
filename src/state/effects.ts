// گام ۸ §12 — لایهٔ اثرهای بین-دامنه‌ای (خالص)
// پنج نقطهٔ fan-out تاریخی استور — هر جا یک شمارندهٔ روزانه به زنجیره/هدف/یخ
// (یا فقط پنجرهٔ ۳۵روزه) گره می‌خورد — به یک «جدول سیاست» متمرکز می‌آید:
//
//   reviews   → شمارش روز + زنجیره + هدف/یخ
//   quizzes   → شمارش روز + زنجیره + هدف/یخ
//   dictation → شمارش روز + زنجیره (هدف/یخ ندارد — رفتار تاریخی)
//   words     → شمارش روز فقط (بای‌پس زنجیره — واژهٔ تازه، رفتار تاریخی)
//   rush      → شمارش روز فقط (بای‌پس زنجیره — راند سریع، رفتار تاریخی)
//
// همه چیزِ cross-domain که روزی جابه‌جا شود فقط همین‌جا تغییر می‌کند.

import { applyStreak, emptyDayStat, goalAndFreezePatch, normDayStat, pushDayHistory, todayStr } from "./day-engine";
import type { DayStat, StudyState } from "./types";

export type ActivityKind = "reviews" | "quizzes" | "dictation" | "words" | "rush";

const ACTIVITY_FIELD: Record<ActivityKind, keyof Omit<DayStat, "day">> = {
  reviews: "reviews",
  quizzes: "quizzes",
  dictation: "dictation",
  words: "words",
  rush: "rush",
};

/** آیا این شمارش زنجیره را جلو می‌برد؟ (dictation زنجیره دارد اما هدف/یخ ندارد) */
const APPLIES_STREAK: Record<ActivityKind, boolean> = {
  reviews: true,
  quizzes: true,
  dictation: true,
  words: false,
  rush: false,
};

/** آیا کامل‌شدن هدفِ امروز (و اعطای یخ F9) با این شمارش حساب می‌شود؟ */
const COUNTS_TOWARD_GOAL: Record<ActivityKind, boolean> = {
  reviews: true,
  quizzes: true,
  dictation: false,
  words: false,
  rush: false,
};

/** زیرمجموعهٔ استوری که activityPatch لازم دارد */
export type ActivityDeps = Pick<
  StudyState,
  | "dailyGoal"
  | "dayStat"
  | "dayHistory"
  | "freezeCount"
  | "freezeEarnedDay"
  | "freezeSavedDay"
  | "freezeUsedDays"
  | "goalMetDays"
  | "history"
  | "lastActiveDay"
  | "streak"
  | "bestStreak"
>;

/**
 * یک واحد فعالیت امروز را ثبت کن و طبق سیاستِ kind، زنجیره/هدف/یخ را اعمال کن.
 * خروجی وصلهٔ Partial است — اسلایس آن را در set خودش پخش می‌کند.
 */
export function activityPatch(s: ActivityDeps, kind: ActivityKind): Partial<StudyState> {
  const today = todayStr();
  const stat = s.dayStat.day === today ? normDayStat(s.dayStat) : emptyDayStat(today);
  const bumped: DayStat = { ...stat, [ACTIVITY_FIELD[kind]]: stat[ACTIVITY_FIELD[kind]] + 1 };

  if (!APPLIES_STREAK[kind]) {
    // words/rush — فقط شمارندهٔ روز + پنجرهٔ هفته‌نامه (رفتار تاریخی: بای‌پس زنجیره)
    return { dayStat: bumped, dayHistory: pushDayHistory(s.dayHistory, bumped) };
  }

  const base = applyStreak(s, bumped);
  if (!COUNTS_TOWARD_GOAL[kind]) {
    return base; // dictation — زنجیره دارد، هدف/یخ ندارد
  }
  return { ...base, ...goalAndFreezePatch(s, base.dayStat, base.freezeCount) };
}
