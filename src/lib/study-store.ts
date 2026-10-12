"use client";

// گام ۸ §12 — لایهٔ سازگاری: سطح عمومی قبلی study-store دقیقاً همین است.
// پیاده‌سازی به src/state/* منتقل شد (۱۲ اسلایس + موتورهای خالص + effects)؛
// ۳۷ مصرف‌کننده با همین import مسیر قدیمی، useStudy و همهٔ انواع/توابع را
// بدون هیچ تغییری می‌گیرند. عضو حذف‌شده: lessonMistakeCount (کد مرده —
// صفر مصرف‌کننده، تأییدشده با grep سراسری src/ + tests/).

export { useStudy } from "@/state/store";

// انواع + ثابت‌ها
export type {
  AvatarColor,
  DayHistoryMap,
  DayStat,
  FlashIntent,
  HistoryMap,
  LessonTab,
  MistakeMap,
  SrsItem,
  StudySettings,
  StudyState,
  View,
  WordStatMap,
} from "@/state/types";
export {
  AVATAR_COLORS,
  DEFAULT_SETTINGS,
  DAILY_GOAL_OPTIONS,
  FREEZE_CAP,
  FREEZE_EARN_GOALS,
  FREEZE_WINDOW,
} from "@/state/types";

// موتور روز/زنجیره
export {
  applyStreak,
  daysAgoKey,
  emptyDayStat,
  goalAndFreezePatch,
  lastNDays,
  normDayStat,
  pushDayHistory,
  todayStr,
} from "@/state/day-engine";

// موتور تکرار فاصله‌دار
export {
  SRS_INTERVALS,
  SRS_LABELS,
  firstLessonWithDue,
  konkurSrsEntry,
  srsDueCount,
  srsDueTotal,
  srsQuestionDueIds,
  srsQuestionDueTotal,
} from "@/state/srs-engine";

// کلیدها + تجمیع پیشرفت
export {
  knownCountOfLesson,
  mistakesOfLesson,
  questionSourceLesson,
  resultKey,
  summarize,
  wordKey,
  type ProgressSummary,
} from "@/state/progress";

// لایهٔ اثرهای بین-دامنه‌ای (خط‌مشی فعالیت روزانه)
export { activityPatch, type ActivityKind } from "@/state/effects";
