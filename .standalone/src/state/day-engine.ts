// گام ۸ §12 — موتور روز/زنجیره (خالص)
// todayStr/daysAgoKey/نرمال‌سازی DayStat/پنجرهٔ ۳۵روزه/پنجرهٔ ۳۰روزهٔ history/
// applyStreak با یخِ F9 + goalAndFreezePatch اعطای یخ. همهٔ توابع خالص‌اند —
// اسلایس activity و effects/activityPatch آن‌ها را مصرف می‌کنند.

import {
  FREEZE_CAP,
  FREEZE_EARN_GOALS,
  FREEZE_WINDOW,
  type DayHistoryMap,
  type DayStat,
  type HistoryMap,
  type StudyState,
} from "./types";

function todayStr(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** ISO day-key of n days ago (string-comparable) */
export function daysAgoKey(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return todayStr(d);
}

/** normalize a (possibly legacy) DayStat so every counter exists */
export function normDayStat(d: Partial<DayStat> | undefined): DayStat {
  return {
    day: d?.day ?? "",
    reviews: d?.reviews ?? 0,
    quizzes: d?.quizzes ?? 0,
    words: d?.words ?? 0,
    dictation: d?.dictation ?? 0,
    rush: d?.rush ?? 0,
    stories: d?.stories ?? 0,
  };
}

/** fresh zeroed DayStat for a given day key */
export function emptyDayStat(day: string): DayStat {
  return { day, reviews: 0, quizzes: 0, words: 0, dictation: 0, rush: 0, stories: 0 };
}

/**
 * r384 — «آمارِ زندهٔ امروز» تکمنبع (ممیزیِ دوقلو — ایدئومِ r363/r381/r382/r383).
 * سه نما (goal-chip با ZERO_DAYِ محلی، daily-quests با لیترالِ inline،
 * home-today با گاردِ زیرمجموعهای) همین گارد را بایتبهبایت تکرار میکردند:
 * «فقط وقتی mount شده و dayStat مالِ امروز است، زنده؛ وگرنه صفرِ امروز».
 * مالکِ دامنه: موتورِ روز — کنارِ normDayStat/emptyDayStat. قرارداد:
 *  • mounted=false (پیشِ هیدریشن) ⇒ صفرِ صادقِ امروز — هیچ عددِ جعلیِ دیروز
 *  • dayStat.day !== today (روزِ کهنه/آینده) ⇒ صفرِ صادقِ امروز
 *  • زنده ⇒ همان مرجعِ استور (بدونِ کپی — مرجعِ پایدار برایِ memoهایِ نما)
 * پسرعموهایِ لایهٔ state/کتابخانه قراردادِ خودشان را دارند (قفلِ
 * دامنهدار): effects.ts بدونِ گیتِ mounted (state پسِ هیدریشن است) و
 * normDayStat میخواند؛ achievements.ts با fallbackِ day:""ِ
 * normDayStat(undefined) که فیلدِ dayاش هرگز خوانده نمیشود.
 */
export function liveTodayStat(mounted: boolean, dayStat: DayStat, today: string): DayStat {
  return mounted && dayStat.day === today ? dayStat : emptyDayStat(today);
}

/**
 * Task-37 «هفته‌نامه» — merge today's full stat into the 35-day window.
 * Day keys sort lexicographically, so dropping the smallest keys keeps the
 * newest days (same policy as the legacy HistoryMap cap in applyStreak).
 */
export function pushDayHistory(dayHistory: DayHistoryMap, stat: DayStat): DayHistoryMap {
  if (!stat.day) return dayHistory;
  const out: DayHistoryMap = { ...dayHistory, [stat.day]: stat };
  const keys = Object.keys(out).sort();
  while (keys.length > 35) {
    delete out[keys.shift()!];
  }
  return out;
}

export { todayStr };

/** نتیجهٔ applyStreak — وصلهٔ زنجیره + پنجره‌ها + یخ */
export type StreakPatch = Pick<
  StudyState,
  | "streak"
  | "bestStreak"
  | "lastActiveDay"
  | "dayStat"
  | "history"
  | "dayHistory"
  | "freezeCount"
  | "freezeUsedDays"
  | "freezeSavedDay"
>;

export function applyStreak(
  s: {
    streak: number;
    bestStreak: number;
    lastActiveDay: string;
    history: HistoryMap;
    dayHistory: DayHistoryMap;
    freezeCount: number;
    freezeUsedDays: string[];
    freezeSavedDay: string;
  },
  dayStat: DayStat
): StreakPatch {
  const today = todayStr();
  // keep last 30 days of weekly history
  // audit 2026-10-12 (F-2.4/D-10): the old loop deleted in INSERTION order —
  // after a cloud merge (scrambled key order) it could delete the NEWEST days.
  // Day keys sort lexicographically, so sorted keys + drop-smallest = honest cap.
  const history: HistoryMap = { ...s.history, [dayStat.day]: { reviews: dayStat.reviews, quizzes: dayStat.quizzes } };
  const hKeys = Object.keys(history).sort();
  while (hKeys.length > 30) {
    delete history[hKeys.shift()!];
  }
  const dayHistory = pushDayHistory(s.dayHistory, dayStat);
  if (s.lastActiveDay === today) {
    return {
      streak: s.streak,
      bestStreak: s.bestStreak,
      lastActiveDay: today,
      dayStat,
      history,
      dayHistory,
      freezeCount: s.freezeCount,
      freezeUsedDays: s.freezeUsedDays,
      freezeSavedDay: s.freezeSavedDay,
    };
  }

  // F9 — freeze bookkeeping (only mutated when a freeze actually repairs the chain)
  const freeze = {
    freezeCount: s.freezeCount,
    freezeUsedDays: s.freezeUsedDays,
    freezeSavedDay: s.freezeSavedDay,
  };

  const streak = (() => {
    if (s.lastActiveDay === daysAgoKey(1)) return s.streak + 1; // natural continue
    // exactly one missed day + a freeze available → the freeze saves the chain
    if (
      s.lastActiveDay === daysAgoKey(2) &&
      s.freezeCount > 0 &&
      !s.freezeUsedDays.includes(daysAgoKey(1))
    ) {
      freeze.freezeCount = s.freezeCount - 1;
      freeze.freezeUsedDays = [...s.freezeUsedDays, daysAgoKey(1)].slice(-30);
      freeze.freezeSavedDay = today;
      return s.streak + 1;
    }
    return 1; // gap too long (or no freeze) → chain resets
  })();

  return { streak, bestStreak: Math.max(streak, s.bestStreak), lastActiveDay: today, dayStat, history, dayHistory, ...freeze };
}

/**
 * F9 — record «هدفِ امروز کامل شد» and maybe grant a freeze.
 * Grant rule: ≥۳ روزِ هدف‌دار در ۷ روز گذشته، بدون ساخت یخ در ۷ روز گذشته،
 * زیر سقف. freezeCountNow از نتیجهٔ applyStreak می‌آید تا مصرفِ یخ در همان
 * فراخوانی بازنویسی نشود.
 *
 * اصلاح ۲۰۲۶-۱۰-۱۲ (راند ۵۵): روزها فقط وقتی در goalMetDays ثبت می‌شوند که
 * هدف واقعاً کامل شده باشد — قبلاً هر روزِ فعال (حتی کمتر از هدف) ثبت می‌شد و
 * پنجرهٔ ۷روزه را inflated می‌کرد. دادهٔ legacy ممکن است روزهای بی‌هدف داشته
 * باشد؛ با کهنه‌شدن از پنجره (۷ روز) خودبه‌خود اصلاح می‌شود.
 */
export function goalAndFreezePatch(
  s: { dailyGoal: number; goalMetDays: string[]; freezeEarnedDay: string },
  dayStat: DayStat,
  freezeCountNow: number
): Pick<StudyState, "goalMetDays" | "freezeCount" | "freezeEarnedDay"> {
  const windowStart = daysAgoKey(FREEZE_WINDOW - 1);
  const today = todayStr();
  const met = dayStat.reviews + dayStat.quizzes >= s.dailyGoal;
  const goalMetDays =
    !met || s.goalMetDays.includes(today) ? s.goalMetDays : [...s.goalMetDays, today].slice(-14);
  const inWindow = goalMetDays.filter((d) => d >= windowStart).length;
  const cooledDown = !s.freezeEarnedDay || s.freezeEarnedDay < windowStart;
  const grant = met && inWindow >= FREEZE_EARN_GOALS && cooledDown && freezeCountNow < FREEZE_CAP;

  return {
    goalMetDays,
    freezeCount: grant ? freezeCountNow + 1 : freezeCountNow,
    freezeEarnedDay: grant ? today : s.freezeEarnedDay,
  };
}

/** last N days (oldest → newest) with Persian weekday labels */
export function lastNDays(n: number, history: HistoryMap): { day: string; weekday: string; reviews: number; quizzes: number; total: number; isToday: boolean }[] {
  const weekdays = ["یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه", "شنبه"];
  const out: ReturnType<typeof lastNDays> = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = todayStr(d);
    const h = history[key] ?? { reviews: 0, quizzes: 0 };
    out.push({
      day: key,
      weekday: weekdays[d.getDay()],
      reviews: h.reviews,
      quizzes: h.quizzes,
      total: h.reviews + h.quizzes,
      isToday: i === 0,
    });
  }
  return out;
}

/** r321 — حرفِ ابتدایِ رسمیِ روزهایِ هفته (قراردادِ همهٔ تقویمهایِ فارسی) برایِ
 *  محورِ باریکِ نمودارِ هفتگی در موبایل. سنجشِ زندهٔ ۳۹۰px: ستونها ۳۹pxاند و
 *  پیلِ نامِ کامل — truncate داشت ولی در flex-col با items-center کفِ عرضی
 *  نمیگرفت — تا ۴۹px باز میشد: یکشنبه/دوشنبه +۴، سه‌شنبه +۷، چهارشنبه +۱۰
 *  (شنبه/جمعه ۳۹px جا میشوند) — خونِ متقارن در گپِ ۶px و تصادفِ همسایهها.
 *  واحدِ بودجه پیکسل است (درسِ r316). موبایل حرفِ ابتدا را میگیرد؛ دسکتاپ
 *  با sm: نامِ کاملِ خودش — این نقشه فقط سطحِ موبایل مصرف میشود؛
 *  نامهایِ کاملِ lastNDays دستنخوردهاند (CSV/کارنامه/عنوانِ میلهها همانها). */
export const FA_WEEKDAY_INITIAL: Record<string, string> = {
  "یکشنبه": "ی",
  "دوشنبه": "د",
  "سه‌شنبه": "س",
  "چهارشنبه": "چ",
  "پنجشنبه": "پ",
  "جمعه": "ج",
  "شنبه": "ش",
};
