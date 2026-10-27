// گام ۸ §12 — انواع مشترک استور مطالعه
// اسلایس‌ها قرارداد دامنهٔ خود را در فایل خودشان تعریف می‌کنند؛ این ماژول
// انواع اولیهٔ مشترک + تلاقی ۱۲ اسلایس (StudyState = قرارداد عمومی قبلی) را
// نگه می‌دارد. چرخهٔ import صرفاً type-level است (در اجرا حذف می‌شود).

import type { QuizResult } from "@/lib/study-types";
import type { ActivitySlice } from "./slices/activity";
import type { ArcadeSlice } from "./slices/arcade";
import type { DrillSlice } from "./slices/drill";
import type { FreezeSlice } from "./slices/freeze";
import type { IdentitySlice } from "./slices/identity";
import type { KonkurSlice } from "./slices/konkur";
import type { LearningSlice } from "./slices/learning";
import type { LibrarySlice } from "./slices/library";
import type { MistakesSlice } from "./slices/mistakes";
import type { NavigationSlice } from "./slices/navigation";
import type { PrefsSlice } from "./slices/prefs";
import type { ResultsSlice } from "./slices/results";
import type { SrsSlice } from "./slices/srs";
import type { StarredSlice } from "./slices/starred";

export type View =
  | { type: "home" }
  | { type: "lesson"; id: number; focusWord?: string }
  | { type: "dictionary"; focusWord?: string }
  | { type: "exam" }
  | { type: "appendix"; topicId?: string; bgExampleEn?: string; posTableId?: string; posRowWord?: string; verbBase?: string; phonemeId?: string; abbrevSym?: string }
// topicId — لنگرِ عمیقِ موضوعِ «درسنامهٔ جامع» (راند ۲۲۱)
// bgExampleEn — r431 عمقِ سطریِ همان مسیر: خودِ جملهٔ مثال (از اطلسِ پرشِ
// خانهٔ امروز) — سطرِ مثالِ حاویِ آن در موضوعِ لنگرخورده با پالسِ زمردیِ
// همخانوادهٔ r234/r427/r428 باز میشود؛ گاردِ عضویت در AppendixView است
// (جملهٔ بیگانه با مثالهایِ موضوع = سکوتِ صادق — r236)؛ پسِ نخستین تلاشِ
// اسکرول از لنگرِ محلیِ نما پاک میشود تا پرشِ دوباره پالسِ تازه بزند
// posTableId — لنگرِ عمیقِ جدولِ «اجزای کلماتی» (راند ۲۲۴، بازشدن روی زیرتبِ pos)
// posRowWord — r428 عمقِ سطریِ همان جدول: خودِ واژهٔ خانواده (سلولِ انگلیسیِ
// واقعی) — سطرِ حاویِ آن در دید با پالسِ زمردیِ همخانوادهٔ r234/r427 باز
// میشود؛ فقط مسیرِ پرشِ خانهٔ امروز آن را میگذارد و گاردِ عضویت در
// AppendixView است (واژهٔ بیگانه با جدول = سکوتِ صادق — r236)
// verbBase — لنگرِ عمیقِ سطرِ فعلِ بی‌قاعده (راند ۲۳۴، بازشدن روی زیرتبِ verbs)
// phonemeId — لنگرِ عمیقِ کارتِ واکِ «جدول تلفظ» (راند ۲۳۵، زیرتبِ phonetics)
// abbrevSym — لنگرِ عمیقِ کارتِ نشانهٔ «نشانه‌های اختصاری» (راند ۲۳۵، زیرتبِ abbrev)
// focusWord (دیکشنری) — لنگرِ عمیقِ کارتِ واژهٔ دیکشنری (راند ۴۳۰ — الگویِ
// راند ۴۲۷): فقط مسیرِ پرشِ خانهٔ امروز آن را میگذارد؛ خودِ نما پسِ نخستین
// تلاشِ اسکرول از view پاکش میکند و عدسیِ جست‌وجو را بذر میزند تا کارت
// فارغ از سقفِ ۳۰۰تایی از نخستین رندر در DOM باشد
// focusWord (درس) — لنگرِ عمیقِ کارتِ واژه در تبِ واژگانِ درس (راند ۴۲۷ — فقط مسیرِ
// پرشِ خانهٔ امروز آن را میگذارد؛ پسِ نخستین تلاشِ اسکرول از view پاک میشود)
  | { type: "rush" }
  | { type: "duel" }
  | { type: "listen" }
  | { type: "review" }
  | { type: "smart" }
  | { type: "konkur" }
  | { type: "grammar" } // متروی گرامر — Task 39
  | { type: "my-words" } // واژه‌های نشان‌شده — واژه‌نامهٔ شخصی
  | { type: "library" } // Task 290 — کتاب‌خانهٔ داستان‌های L.A. Hill
  | { type: "teacher" } // r352 — پنلِ معلم (فهرستِ کلاس، گیتِ کد)
  | { type: "jozve"; grade: number; chapterId?: string } // کتابخانهٔ جزوه‌ها — deep-linkِ «جزوهٔ همین درس» از کتاب/جست‌وجو (grade اجباری، فصلِ آغازین اختیاری)
  | { type: "book"; grade: number; bank?: number } // نمای کتابِ پایه (اندیسِ بانکِ اختیاری — practice-target)
  | { type: "search"; grade: number }; // جست‌وجوی کتابخانهٔ جزوه‌ها

export type LessonTab = "vocab" | "conversation" | "reading" | "grammar" | "writing" | "dictation" | "tests" | "synant" | "booklet";

// daily activity for streak + daily goal + quests
export interface DayStat {
  day: string; // "2026-10-09"
  reviews: number; // flashcard reviews
  quizzes: number; // finished quizzes/dictation/writing
  words: number; // words marked known today (new learning)
  dictation: number; // dictation rounds finished today
  rush: number; // 60s challenge rounds finished today
  stories: number; // Task 299 — Hill library stories finished today
}

// Task 290 «کتاب‌خانهٔ داستان‌ها» — رکوردِ اتمامِ یک داستانِ L.A. Hill.
// کلید = شناسهٔ داستان ("s1-1")؛ day = روزِ آخرین اتمام (فرمتِ todayStr).
export interface LibraryDoneEntry {
  score: number; // پاسخ‌های درستِ بخشِ صحیح/غلط
  total: number; // کل پرسش‌های صحیح/غلط
  day: string; // "2026-10-21"
}

// error bank: mistakes["1:l1-v3"] = number of wrong answers
export type MistakeMap = Record<string, number>;
// F7 word-level risk maps: wordMistakes["1:ability"] = wrong answers involving
// that word (quiz option / dictation / listening) — paired with wordSeen counts
export type WordStatMap = Record<string, number>;
// weekly history: history["2026-10-09"] = { reviews, quizzes }
export type HistoryMap = Record<string, { reviews: number; quizzes: number }>;
// Task-37 «هفته‌نامه» — full DayStat window (last 35 days) powering the weekly
// progress digest. Superset of HistoryMap; legacy clients simply omit it.
export type DayHistoryMap = Record<string, DayStat>;

export const AVATAR_COLORS = ["emerald", "amber", "rose", "violet", "sky"] as const;
export type AvatarColor = (typeof AVATAR_COLORS)[number];
// برچسبِ فارسیِ هر رنگ برایِ aria — screen-reader «رنگ emerald» نمی‌گوید
export const AVATAR_COLOR_LABELS: Record<AvatarColor, string> = {
  emerald: "زمردی",
  amber: "کهربایی",
  rose: "گلگلی",
  violet: "بنفش",
  sky: "آسمانی",
};

// user-tunable preferences (settings hub) — fontScale multiplies root font-size,
// ttsRate multiplies every speak() speed, reduceMotion kills heavy animations
export interface StudySettings {
  ttsRate: number; // 0.7 .. 1.3 (multiplier)
  fontScale: number; // 0.94 | 1 | 1.1
  reduceMotion: boolean;
}

export const DEFAULT_SETTINGS: StudySettings = { ttsRate: 1, fontScale: 1, reduceMotion: false };

export const DAILY_GOAL_OPTIONS = [5, 10, 15] as const;

// ---------------- F9 — streak freeze (نگهبان زنجیره) ----------------

export const FREEZE_CAP = 2; // حداکثر یخ‌های قابل نگهداری (ضد-آبُس)
export const FREEZE_EARN_GOALS = 3; // ۳ هدفِ کامل در بازهٔ ۷روزه ← ۱ یخ
export const FREEZE_WINDOW = 7; // بازهٔ شمارش، به روز

// ---------------- spaced repetition (SM-2 lite) ----------------

export interface SrsItem {
  level: number; // 0..5
  dueAt: number; // epoch ms
}

/** نوع نیت فلش‌کارت هوشمند — فقط «smart» مصرف‌کننده دارد (none = خنثی) */
export type FlashIntent = "none" | "smart";

/**
 * قرارداد کامل استور — تلاقی ۱۴ اسلایس (r412: DrillSlice — پیشرفتِ بانکهایِ تمرین). اسم و شکل همهٔ اعضا دقیقاً مثل
 * StudyState تاریخی است (گام ۸: سازگاری API برای ۳۷ مصرف‌کننده).
 */
export type StudyState = ActivitySlice &
  ArcadeSlice &
  DrillSlice &
  FreezeSlice &
  IdentitySlice &
  KonkurSlice &
  LearningSlice &
  LibrarySlice &
  MistakesSlice &
  NavigationSlice &
  PrefsSlice &
  ResultsSlice &
  SrsSlice &
  StarredSlice;

/** همان قرارداد با نام StoreType الگوی رسمی اسلایس‌های zustand */
export type StudyStore = StudyState;

/** نتیجهٔ آزمون — re-export برای راحتی اسلایس‌ها (results) */
export type { QuizResult };
