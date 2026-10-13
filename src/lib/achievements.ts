// ------------------------------------------------------------------
// Achievements (نشان‌ها) — computed from the study store state.
// Each badge has: id, title, desc, icon key, tier, and a check(state)
// returning boolean. Evaluation is pure so it can run on any snapshot.
// ------------------------------------------------------------------

import type { StudyState } from "./study-store";
import { daysAgoKey, normDayStat, todayStr } from "./study-store";
import { faNum, secFa } from "./study-theme";
import { completedQuestCount } from "./daily-quests";
import { duelTopRival, duelSpeedStats, duelVerifiedWins, duelQuickThinkers } from "./duel-history";
import { duelQuickWeekReport, DUEL_QUICK_WEEK, type QuickWeekReport } from "./weekly-digest";
import { FREEZE_WINDOW } from "@/state/types";

export type BadgeTier = "bronze" | "silver" | "gold";

export interface BadgeDef {
  id: string;
  title: string;
  desc: string;
  icon: string; // lucide icon name handled in the component
  tier: BadgeTier;
  /** short progress hint when locked, e.g. "۳ از ۵ آزمون" */
  progress?: (s: BadgeEvalInput) => string | undefined;
  check: (s: BadgeEvalInput) => boolean;
}

export interface BadgeEvalInput {
  knownCount: number;
  resultsCount: number;
  bestPercent: number;
  hasPerfect: boolean;
  totalQuizzes: number; // all-time quizzes done (from history)
  totalReviews: number;
  streak: number;
  bestStreak: number;
  hasExam: boolean;
  hasFinal: boolean;
  hasRush: boolean; // has completed at least one 60s challenge
  hasDictation: boolean;
  hasWriting: boolean;
  activeDays: number;
  mistakesTotal: number;
  rushBest: number; // best points in the 60s challenge
  rushBestCorrect: number; // best correct answers in one challenge
  rushGames: number; // total completed 60s challenge rounds
  questsDoneToday: number; // daily quests completed today (0..5)
  freezeCount: number; // یخِ فعلیِ مخزن (سقف ۲ — F9)
  freezeRescues: number; // چند بار یخ زنجیره را نجات داده (freezeUsedDays)
  hasFreezeEver: boolean; // حداقل یک یخ ساخته شده (freezeEarnedDay ثبت است)
  goalDays: number; // چند روز هدفِ روزانه کامل شده (goalMetDays — سقف حافظه ۱۴، Task 82)
  goalDays7: number; // روزهای هدف‌دار در پنجرهٔ ۷روزه (Task 83 — همان پنجرهٔ موتور)
  rescues7: number; // نجات‌های یخ در پنجرهٔ ۷روزه (Task 83)
  dictation7: number; // جمعِ دیکته‌های پنجرهٔ ۷روزه از dayHistory (Task 84)
  quizzes7: number; // جمعِ آزمون‌های پنجرهٔ ۷روزه از dayHistory (Task 84)
  dictationDays7: number; // چند روزِ پنجره دیکته داشتند (≠ جمع — رانِ روزانه، Task 85)
  quizDays7: number; // چند روزِ پنجره آزمون داشتند (≠ جمع — رانِ روزانه، Task 86)
  reviewsDays7: number; // چند روزِ پنجره مرور داشتند (≠ جمع — رانِ روزانه، Task 88)
  // پنجرهٔ ۱۴روزه (Task 90) — سقفِ حافظه مجاز است: dayHistory ۳۵ روز نگه می‌دارد
  dictationDays14: number; // چند روزِ پنجرهٔ ۱۴روزه دیکته داشتند
  quizDays14: number; // چند روزِ پنجرهٔ ۱۴روزه آزمون داشتند
  reviewsDays14: number; // چند روزِ پنجرهٔ ۱۴روزه مرور داشتند
  activeDays35: number; // چند روزِ پنجرهٔ ۳۵روزه هر فعالیتی داشتند (خانوادهٔ حضور، Task 92)
  wordsDays7: number; // چند روزِ پنجرهٔ ۷روزه واژهٔ تازه داشتند (≠ جمع — Task 93)
  rushDays7: number; // چند روزِ پنجرهٔ ۷روزه برق‌آسا داشتند (≠ جمع — Task 93)
  duelTopRivalWins: number; // بیشترین برد مقابلِ یک حریفِ واحد در دفترچه (Task 99)
  duelVerifiedWins: number; // بردهای رسیددارِ دفترچه — امضای داور روی برد (Task 105)
  duelQuickThinkers: number; // رکوردهای «فکرِ کم + درستِ زیاد» — نهمین خانواده (Task 108)
  duelQuickWeek: QuickWeekReport; // گیتِ ترکیبیِ هفتگی — دهمین خانواده (Task 110)
  duelTopRivalName: string; // نامِ نمایشیِ همان رقیب (برای پیشرفتِ صادق)
  duelSpeedAvg: number; // میانگینِ پاداشِ سرعت بر پاسخِ درست (۰..۱۰۰ — Task 100)
  duelSpeedCorrect: number; // جمعِ پاسخ‌های درستِ دفترچه — نمونهٔ آماریِ سرعت
}

function historyTotals(history: StudyState["history"]): { quizzes: number; reviews: number; days: number } {
  let quizzes = 0;
  let reviews = 0;
  let days = 0;
  for (const v of Object.values(history)) {
    quizzes += v.quizzes;
    reviews += v.reviews;
    if (v.quizzes + v.reviews > 0) days++;
  }
  return { quizzes, reviews, days };
}

/** Build the evaluation input from raw store fields */
export function buildEvalInput(s: {
  known: StudyState["known"];
  results: StudyState["results"];
  history: StudyState["history"];
  dayStat: StudyState["dayStat"];
  streak: number;
  bestStreak: number;
  mistakes: StudyState["mistakes"];
  rushBest?: number;
  rushBestCorrect?: number;
  rushGames?: number;
  freezeCount?: number;
  freezeUsedDays?: string[];
  freezeEarnedDay?: string;
  goalMetDays?: string[];
  dayHistory?: StudyState["dayHistory"];
  duelHistory?: StudyState["duelHistory"]; // خانوادهٔ نبرد (Task 99) — دفترچهٔ ۱۵تایی
}): BadgeEvalInput {
  const knownCount = Object.values(s.known).filter(Boolean).length;
  const rs = Object.values(s.results);
  const resultsCount = rs.length;
  const bestPercent = rs.reduce((m, r) => Math.max(m, r.percent), 0);
  const hasPerfect = rs.some((r) => r.percent === 100 && r.total >= 5);
  // include today's stats (history is written on activity too, but be safe)
  const hist = historyTotals(s.history);
  const today = todayStr();
  const ds = s.dayStat.day === today ? normDayStat(s.dayStat) : normDayStat(undefined);
  const todayInHist = s.history[today];
  const totalQuizzes = Math.max(
    hist.quizzes + (todayInHist ? 0 : ds.quizzes),
    ds.quizzes
  );
  const totalReviews = Math.max(
    hist.reviews + (todayInHist ? 0 : ds.reviews),
    ds.reviews
  );
  const hasDictation = Object.keys(s.results).some((k) => k.endsWith(":dictation"));
  const hasWriting = Object.keys(s.results).some((k) => k.endsWith(":writing"));
  const mistakesTotal = Object.keys(s.mistakes).length;
  // خانوادهٔ نبرد (Task 99) — رقیبِ نخستِ دفترچه؛ گاردِ خراب: غیرآرایه → صفر/خالی
  const ledger = Array.isArray(s.duelHistory) ? s.duelHistory : [];
  const topRival = duelTopRival(ledger);
  const verifiedWins = duelVerifiedWins(ledger);
  // خانوادهٔ چابکیِ ذهن (Task 108) — رکوردهای «فکرِ کم + درستِ زیاد» از همان دفترچه؛
  // زیرمجموعهٔ صادق: رکوردِ بی‌think (قدیمی/بی‌نمونه) هرگز نمی‌شمارد
  const quickThinkers = duelQuickThinkers(ledger);
  // خانوادهٔ هفتهٔ چابک (Task 110) — همان گیت در مقیاسِ پنجرهٔ ۷روزه؛
  // پیوستگی به‌جای پراکندگی — سه شانسِ جدا در سه فصل این‌جا شمرده نمی‌شود
  const quickWeek = duelQuickWeekReport(ledger);
  // خانوادهٔ سرعت (Task 100) — میانگینِ پاداشِ سرعت از همان دفترچه (قراردادِ داور، Task 99)
  const speed = duelSpeedStats(ledger);
  // پنجرهٔ ۷روزه — همان قرارداد موتور: کلیدِ رشته‌ای محلی، مقایسهٔ >=
  const windowStart = daysAgoKey(FREEZE_WINDOW - 1);
  const goalList = Array.isArray(s.goalMetDays)
    ? s.goalMetDays.filter((d): d is string => typeof d === "string")
    : [];
  const usedList = Array.isArray(s.freezeUsedDays)
    ? s.freezeUsedDays.filter((d): d is string => typeof d === "string")
    : [];
  return {
    knownCount,
    resultsCount,
    bestPercent,
    hasPerfect,
    totalQuizzes,
    totalReviews,
    streak: s.streak,
    bestStreak: s.bestStreak,
    hasExam: "exam" in s.results,
    hasFinal: "final" in s.results,
    hasRush: "rush" in s.results,
    hasDictation,
    hasWriting,
    activeDays: hist.days + (todayInHist ? 0 : ds.quizzes + ds.reviews > 0 ? 1 : 0),
    mistakesTotal,
    rushBest: s.rushBest ?? 0,
    rushBestCorrect: s.rushBestCorrect ?? 0,
    rushGames: s.rushGames ?? 0,
    questsDoneToday: completedQuestCount(ds),
    // خانوادهٔ یخ (Task 81) — گاردِ ورودی خراب: مخزن منفی/NaN → صفر، آرایهٔ خراب → فقط رشته‌ها
    freezeCount:
      typeof s.freezeCount === "number" && Number.isFinite(s.freezeCount)
        ? Math.max(0, Math.floor(s.freezeCount))
        : 0,
    freezeRescues: Array.isArray(s.freezeUsedDays)
      ? s.freezeUsedDays.filter((d): d is string => typeof d === "string").length
      : 0,
    hasFreezeEver: typeof s.freezeEarnedDay === "string" && s.freezeEarnedDay.length > 0,
    // خانوادهٔ هدف (Task 82) — گاردِ ورودی خراب: آرایهٔ نامعتبر → فقط رشته‌ها
    // (قرارداد از goalAndFreezePatch می‌آید: فقط روزِ واقعاً هدف‌دار ثبت می‌شود)
    goalDays: Array.isArray(s.goalMetDays)
      ? s.goalMetDays.filter((d): d is string => typeof d === "string").length
      : 0,
    // پنجرهٔ ۷روزه (Task 83) — دقیقاً همان مقایسهٔ رشته‌ایِ موتور
    // (goalAndFreezePatch / freezeEarnMeta): >= windowStart، بدون فیلترِ آینده.
    // پنجره از ساعتِ واقعی می‌آید (eval روی snapshot)؛ تست‌ها با کلیدِ نسبی می‌کارند.
    goalDays7: goalList.filter((d) => d >= windowStart).length,
    rescues7: usedList.filter((d) => d >= windowStart).length,
    // پنجرهٔ ۷روزه از dayHistory (Task 84) — همان مقایسهٔ رشته‌ایِ موتور
    // (>= windowStart، بدون فیلترِ آینده). روزِ امروز اگر هنوز در dayHistory
    // ثبت نشده (الگوی totalQuizzes) از dayStat اضافه می‌شود؛ ورودی‌های خرابِ
    // هر خانه (غیرِ آبجکت) نادیده گرفته می‌شوند نه اینکه کل پنجره را بی‌اعتبار کنند.
    // (Task 90) همان تابعِ پنجره‌خنثی دوبار صدا زده می‌شود: ۷روزه (windowStart
    // موتور) و ۱۴روزه (daysAgoKey(13)) — سقفِ حافظه مجاز است (dayHistory ۳۵ روز)؛
    // و روزِ ۱۴ در پنجرهٔ ۷ نیست ولی روزِ ۷ در پنجرهٔ ۱۴ هست (زیرمجموعه).
    // (Task 92) پنجرهٔ سوم = کلِ حافظهٔ ۳۵روزه (daysAgoKey(34)) — شمارِ روزهایِ
    // «هر فعالیتی» برای خانوادهٔ حضور؛ با هیچ‌کدام از شمارنده‌های تک‌فعالیت کاری ندارد.
    // (Task 93) presence-dayهای واژه/برق هم از win7 می‌آیند — خانوادهٔ تنوع (پنج‌گانه).
    ...(() => {
      const win7 = windowCounters(s.dayHistory, windowStart, today, ds);
      const win14 = windowCounters(s.dayHistory, daysAgoKey(13), today, ds);
      const win35 = windowCounters(s.dayHistory, daysAgoKey(34), today, ds);
      return {
        dictation7: win7.dictation7,
        quizzes7: win7.quizzes7,
        dictationDays7: win7.dictationDays,
        quizDays7: win7.quizDays,
        reviewsDays7: win7.reviewsDays,
        dictationDays14: win14.dictationDays,
        quizDays14: win14.quizDays,
        reviewsDays14: win14.reviewsDays,
        activeDays35: win35.activeDays,
        wordsDays7: win7.wordsDays,
        rushDays7: win7.rushDays,
      };
    })(),
    duelTopRivalWins: topRival?.wins ?? 0,
    duelTopRivalName: topRival?.opponent ?? "",
    duelVerifiedWins: verifiedWins,
    duelQuickThinkers: quickThinkers,
    duelQuickWeek: quickWeek,
    duelSpeedAvg: speed.avgBonus,
    duelSpeedCorrect: speed.totalCorrect,
  };
}

/** جمعِ dictation/quizzes پنجره از dayHistory + fallbackِ روزِ امروز (Task 84)
 *  + شمارِ روزهایِ دیکته‌دار/آزمون‌دار/مرور‌دار ≠ جمع‌ها — رانِ روزانه (Task 85/86/88).
 *  یعنی هر روزِ پنجره حداقل یک دیکته؛ دو دیکته در یک روز هنوز یک روزِ دیکته‌دار است.
 *  (Task 90) پنجره‌خنثی شد: windowStart پارامتر است — همان تابع هم ۷روزه هم
 *  ۱۴روزه را می‌سازد؛ کلیدهای برگشتی بدونِ پسوندِ ۷ تا caller نقشه بکشد. */
function windowCounters(
  dayHistory: StudyState["dayHistory"] | undefined,
  windowStart: string,
  today: string,
  ds: ReturnType<typeof normDayStat>
): { dictation7: number; quizzes7: number; reviewsDays: number; dictationDays: number; quizDays: number; activeDays: number; wordsDays: number; rushDays: number } {
  let dictation7 = 0;
  let quizzes7 = 0;
  let reviewsDays = 0;
  let dictationDays = 0;
  let quizDays = 0;
  let activeDays = 0; // (Task 92) هر فعالیتی روز را ثبت می‌کند — مرور/آزمون/دیکته/واژه/برق
  let wordsDays = 0; // (Task 93) روزهایِ واژه‌دار — بُعدِ تنوع
  let rushDays = 0; // (Task 93) روزهایِ برق‌آسا — بُعدِ تنوع
  if (dayHistory && typeof dayHistory === "object") {
    for (const [key, raw] of Object.entries(dayHistory)) {
      if (key < windowStart || !raw || typeof raw !== "object") continue;
      const st = normDayStat(raw as Partial<StudyState["dayStat"]>);
      const r = Number.isFinite(st.reviews) ? Math.max(0, st.reviews) : 0;
      if (r > 0) reviewsDays += 1;
      const d = Number.isFinite(st.dictation) ? Math.max(0, st.dictation) : 0;
      dictation7 += d;
      if (d > 0) dictationDays += 1;
      const q = Number.isFinite(st.quizzes) ? Math.max(0, st.quizzes) : 0;
      quizzes7 += q;
      if (q > 0) quizDays += 1;
      const w = Number.isFinite(st.words) ? Math.max(0, st.words) : 0;
      if (w > 0) wordsDays += 1;
      const sh = Number.isFinite(st.rush) ? Math.max(0, st.rush) : 0;
      if (sh > 0) rushDays += 1;
      if (r + d + q + w + sh > 0) activeDays += 1;
    }
  }
  const todayInHistory = !!(dayHistory && typeof dayHistory === "object" && (dayHistory as Record<string, unknown>)[today]);
  if (!todayInHistory) {
    const r = Number.isFinite(ds.reviews) ? Math.max(0, ds.reviews) : 0;
    if (r > 0) reviewsDays += 1;
    const d = Number.isFinite(ds.dictation) ? Math.max(0, ds.dictation) : 0;
    dictation7 += d;
    if (d > 0) dictationDays += 1;
    const q = Number.isFinite(ds.quizzes) ? Math.max(0, ds.quizzes) : 0;
    quizzes7 += q;
    if (q > 0) quizDays += 1;
    const w = Number.isFinite(ds.words) ? Math.max(0, ds.words) : 0;
    if (w > 0) wordsDays += 1;
    const sh = Number.isFinite(ds.rush) ? Math.max(0, ds.rush) : 0;
    if (sh > 0) rushDays += 1;
    if (r + d + q + w + sh > 0) activeDays += 1;
  }
  return { dictation7, quizzes7, reviewsDays, dictationDays, quizDays, activeDays, wordsDays, rushDays };
}

/**
 * نشان‌های تازه = بازِ فعلی − دیده‌شده‌ها (Task 82 — تک‌منبعِ تعریفِ «تازه»).
 * قبل از این‌جا همین منطق درون badges.tsx تکرار می‌شد؛ حالا هم توستِ بخش
 * نشان‌ها و هم حلقهٔ طلاییِ آواتارِ هدر از یک قرارداد می‌خوانند.
 * ترتیب خروجی = ترتیب رجیستری؛ ورودیِ seen خراب → فقط رشته‌ها.
 */
export function newBadgeIds(input: BadgeEvalInput, seen: string[]): string[] {
  const seenSet = new Set(Array.isArray(seen) ? seen.filter((d): d is string => typeof d === "string") : []);
  const out: string[] = [];
  for (const b of BADGES) {
    if (b.check(input) && !seenSet.has(b.id)) out.push(b.id);
  }
  return out;
}

export const BADGES: BadgeDef[] = [
  {
    id: "first-step",
    title: "اولین قدم",
    desc: "اولین فعالیت خود را در وب‌کتاب انجام بده",
    icon: "Footprints",
    tier: "bronze",
    check: (s) => s.totalQuizzes + s.totalReviews > 0,
  },
  {
    id: "word-starter",
    title: "واژه‌آموز",
    desc: "۱۰ واژه را در فلش‌کارت‌ها «بلدم» علامت بزن",
    icon: "BookA",
    tier: "bronze",
    progress: (s) => `${faNum(Math.min(s.knownCount, 10))} از ۱۰ واژه`,
    check: (s) => s.knownCount >= 10,
  },
  {
    id: "word-scholar",
    title: "واژه‌شناس",
    desc: "۵۰ واژه را یاد بگیر",
    icon: "BookOpenCheck",
    tier: "silver",
    progress: (s) => `${faNum(Math.min(s.knownCount, 50))} از ۵۰ واژه`,
    check: (s) => s.knownCount >= 50,
  },
  {
    id: "word-master",
    title: "واژه‌دان",
    desc: "۱۵۰ واژه را یاد بگیر",
    icon: "GraduationCap",
    tier: "gold",
    progress: (s) => `${faNum(Math.min(s.knownCount, 150))} از ۱۵۰ واژه`,
    check: (s) => s.knownCount >= 150,
  },
  {
    id: "quiz-5",
    title: "تست‌باز",
    desc: "۵ آزمون یا تمرین کامل کن",
    icon: "ListChecks",
    tier: "bronze",
    progress: (s) => `${faNum(Math.min(s.totalQuizzes, 5))} از ۵ آزمون`,
    check: (s) => s.totalQuizzes >= 5,
  },
  {
    id: "quiz-20",
    title: "معلم‌پرسان",
    desc: "۲۰ آزمون یا تمرین کامل کن",
    icon: "ClipboardCheck",
    tier: "silver",
    progress: (s) => `${faNum(Math.min(s.totalQuizzes, 20))} از ۲۰ آزمون`,
    check: (s) => s.totalQuizzes >= 20,
  },
  {
    id: "review-50",
    title: "مرورگر",
    desc: "۵۰ بار با فلش‌کارت‌ها مرور کن",
    icon: "RefreshCcw",
    tier: "bronze",
    progress: (s) => `${faNum(Math.min(s.totalReviews, 50))} از ۵۰ مرور`,
    check: (s) => s.totalReviews >= 50,
  },
  {
    id: "streak-3",
    title: "سه‌روزهٔ پیوسته",
    desc: "۳ روز پشت‌سرهم فعالیت کن",
    icon: "Flame",
    tier: "bronze",
    progress: (s) => `رکورد: ${faNum(Math.min(s.bestStreak, 3))} از ۳ روز`,
    check: (s) => s.bestStreak >= 3,
  },
  {
    id: "streak-7",
    title: "هفتهٔ کامل",
    desc: "۷ روز پشت‌سرهم فعالیت کن",
    icon: "CalendarCheck",
    tier: "gold",
    progress: (s) => `رکورد: ${faNum(Math.min(s.bestStreak, 7))} از ۷ روز`,
    check: (s) => s.bestStreak >= 7,
  },
  {
    id: "sharp-ear",
    title: "گوش تیز",
    desc: "یک آزمون دیکته را کامل کن",
    icon: "Ear",
    tier: "bronze",
    check: (s) => s.hasDictation,
  },
  {
    id: "golden-pen",
    title: "قلم طلایی",
    desc: "یک تمرین نگارش را کامل کن",
    icon: "PenLine",
    tier: "bronze",
    check: (s) => s.hasWriting,
  },
  {
    id: "high-scorer",
    title: "نمرهٔ بالا",
    desc: "در یک آزمون ۸۵٪ یا بالاتر بگیر",
    icon: "Star",
    tier: "silver",
    progress: (s) => `بهترین: ${faNum(Math.min(s.bestPercent, 85))}٪`,
    check: (s) => s.bestPercent >= 85,
  },
  {
    id: "perfect",
    title: "بی‌نقص",
    desc: "در یک آزمون ۱۰۰٪ بگیر",
    icon: "Target",
    tier: "gold",
    progress: (s) => `بهترین: ${faNum(Math.min(s.bestPercent, 100))}٪`,
    check: (s) => s.hasPerfect,
  },
  {
    id: "exam-taker",
    title: "جامع‌نگر",
    desc: "در آزمون جامع واژگان شرکت کن",
    icon: "BookMarked",
    tier: "silver",
    check: (s) => s.hasExam,
  },
  {
    id: "final-exam",
    title: "فارغ‌التحصیل",
    desc: "آزمون جامع پایان ترم را کامل کن",
    icon: "Award",
    tier: "gold",
    check: (s) => s.hasFinal,
  },
  {
    id: "clean-sweep",
    title: "اشتباه‌ناپذیر",
    desc: "بانک اشتباهاتت را خالی کن (مرور همهٔ خطاها)",
    icon: "Eraser",
    tier: "silver",
    check: (s) => s.totalQuizzes >= 3 && s.mistakesTotal === 0,
  },
  {
    id: "rush-first",
    title: "برق‌آسا",
    desc: "یک چالش برق‌آسای ۶۰ ثانیه‌ای را کامل کن",
    icon: "Zap",
    tier: "bronze",
    check: (s) => s.hasRush,
  },
  {
    id: "rush-combo",
    title: "کمبوی آتشین",
    desc: "در یک چالش برق‌آسا ۱۵ پاسخ درست یا بیشتر بگیر",
    icon: "Sparkles",
    tier: "silver",
    progress: (s) => `بهترین: ${faNum(Math.min(s.rushBestCorrect, 15))} از ۱۵ پاسخ`,
    check: (s) => s.rushBestCorrect >= 15,
  },
  {
    id: "rush-5",
    title: "چالش‌باز",
    desc: "در ۵ چالش برق‌آسا شرکت کن",
    icon: "Gamepad2",
    tier: "silver",
    progress: (s) => `${faNum(Math.min(s.rushGames, 5))} از ۵ چالش`,
    check: (s) => s.rushGames >= 5,
  },
  {
    id: "rush-champ",
    title: "قهرمان برق‌آسا",
    desc: "در یک دور چالش ۱۰۰ امتیاز یا بیشتر بگیر",
    icon: "Trophy",
    tier: "gold",
    progress: (s) => `بهترین: ${faNum(Math.min(s.rushBest, 100))} از ۱۰۰ امتیاز`,
    check: (s) => s.rushBest >= 100,
  },
  {
    id: "quest-master",
    title: "مأمور پنج‌گانه",
    desc: "هر ۵ هدف روزانه را در یک روز کامل کن",
    icon: "Crown",
    tier: "gold",
    progress: (s) => `${faNum(Math.min(s.questsDoneToday, 5))} از ۵ هدف امروز`,
    check: (s) => s.questsDoneToday >= 5,
  },
  // ---- خانوادهٔ یخ (Task 81) — داستان F9 در سطح دستاورد؛ هم‌پیوند با
  // چیپ هدر/دفتر کارنامه: یخ بساز، بگذار نجات دهد، مخزن را پر کن، سپر شو
  {
    id: "ice-maker",
    title: "یخ‌ساز",
    desc: "با ۳ روزِ هدف‌دار در ۷ روز، اولین یخ زنجیره‌ات را بساز",
    icon: "Snowflake",
    tier: "bronze",
    check: (s) => s.hasFreezeEver,
  },
  {
    id: "chain-rescuer",
    title: "نجات‌گر",
    desc: "یک روز غایب شو و بگذار یخ، زنجیره را نجات دهد",
    icon: "ShieldCheck",
    tier: "silver",
    check: (s) => s.freezeRescues >= 1,
  },
  {
    id: "ice-stockpile",
    title: "انبار یخ",
    desc: "هر دو یخِ مخزن را هم‌زمان داشته باش — سقف یخ‌ها",
    icon: "Package",
    tier: "silver",
    progress: (s) => `${faNum(Math.min(s.freezeCount, 2))} از ۲ یخ در انبار`,
    check: (s) => s.freezeCount >= 2,
  },
  {
    id: "ice-shield",
    title: "سپر یخی",
    desc: "۳ بار یخ زنجیره‌ات را نجات دهد — محافظ همیشگی زنجیره",
    icon: "Shield",
    tier: "gold",
    progress: (s) => `${faNum(Math.min(s.freezeRescues, 3))} از ۳ نجات`,
    check: (s) => s.freezeRescues >= 3,
  },
  // ---- خانوادهٔ هدف (Task 82) — داستانِ «قولِ روزانه» در سطح دستاورد؛
  // هم‌پیوند با چیپ هدف هدر (۷۶) و دفتر کارنامه (۷۸-۷۹): روزهایِ
  // هدف‌دار از goalMetDays می‌آیند (فقط روزِ واقعاً کامل‌شده ثبت است)،
  // سقف حافظه ۱۴ = سقفِ نشانِ آخر هم هست (بعد از آن همیشه باز می‌ماند).
  {
    id: "goal-first",
    title: "اولین هدف",
    desc: "اولین روزی که هدفِ روزانه‌ات را کامل کن",
    icon: "Flag",
    tier: "bronze",
    check: (s) => s.goalDays >= 1,
  },
  {
    id: "goal-five",
    title: "پنج‌روزهٔ هدف‌دار",
    desc: "در ۵ روز هدفِ روزانه‌ات را کامل کن — پیوسته یا با فاصله",
    icon: "CalendarDays",
    tier: "silver",
    progress: (s) => `${faNum(Math.min(s.goalDays, 5))} از ۵ روزِ هدف‌دار`,
    check: (s) => s.goalDays >= 5,
  },
  {
    id: "goal-week",
    // عنوانِ یکتا — «هفتهٔ کامل» قبلاً برای streak-7 (فعالیتِ پیوسته) گرفته شده
    title: "هفتهٔ هدف‌دار",
    desc: "۷ روزِ هدف‌دار جمع کن — یک هفتهٔ تمام به قول‌ات وفادار بمان",
    icon: "CalendarRange",
    tier: "gold",
    progress: (s) => `${faNum(Math.min(s.goalDays, 7))} از ۷ روزِ هدف‌دار`,
    check: (s) => s.goalDays >= 7,
  },
  {
    id: "goal-fortnight",
    title: "دو هفتهٔ درخشان",
    desc: "۱۴ روزِ هدف‌دار — سقفِ دفترِ کارنامه؛ دو هفتهٔ تمام تعهد",
    icon: "Sun",
    tier: "gold",
    progress: (s) => `${faNum(Math.min(s.goalDays, 14))} از ۱۴ روزِ هدف‌دار`,
    check: (s) => s.goalDays >= 14,
  },
  // ---- هفتهٔ بی‌قفسه (Task 83) — نشانِ نابِ هدف‌داری: کلِ پنجرهٔ ۷روزه
  // هدف‌دار و صفر نجات در همان پنجره (همان پنجرهٔ موتور). فرقش با
  // «هفتهٔ هدف‌دار»: آن‌جا ۷ روزِ هدف‌دار با فاصله هم کافی است و نجاتِ
  // زنجیره اشکالی ندارد؛ این‌جا هفتهٔ یک‌تکه و خود‌اتکاست — یخ دست‌نخورده.
  // پیشرفتِ زیرِ قفل فقط بُعدِ روز را نشان می‌دهد؛ اگر نجاتِ درون‌پنجره‌ای
  // باشد، ۷/۷ هم قفل می‌ماند و توضیحش در desc است (قراردادِ بر حدس مقدم).
  {
    id: "cage-free",
    title: "هفتهٔ بی‌قفسه",
    desc: "هر ۷ روزِ این هفته هدفِ روزانه‌ات را کامل کن — بدون آن‌که یخ مجبور به نجات شود",
    icon: "Bird",
    tier: "gold",
    progress: (s) => `${faNum(Math.min(s.goalDays7, 7))} از ۷ روزِ این هفته`,
    check: (s) => s.goalDays7 >= 7 && s.rescues7 === 0,
  },
  // ---- نشان‌های رویدادیِ هفته (Task 84) — از dayHistory، همان پنجرهٔ موتور.
  // هدف فقط با reviews/quizzes کامل می‌شود (dictation/words/rush بای‌پسِ هدف‌اند
  // — جدول سیاستِ effects.ts)؛ پس «بی‌دیکته» یعنی هفتهٔ هدف‌دار که تنوعِ مهارت
  // داشت و دیکته‌ای در کار نبود، و «بی‌آزمون» یعنی هفته‌ای که فقط با مرور پر شد.
  // دو شمارنده مستقل‌اند (trackDictation فقط dictation را بالا می‌برد) — هیچ‌کدام
  // دیگری را نمی‌پوشاند. پیشرفتِ زیرِ قفل فقط بُعدِ روز را نشان می‌دهد — الگوی
  // cage-free: اگر ۷/۷ ولی شرطِ صفر برقرار نیست، desc توضیح می‌دهد نه حدس.
  {
    id: "week-no-dictation",
    title: "هفتهٔ بی‌دیکته",
    desc: "یک هفتهٔ کامل هدف‌دار بدون حتی یک دیکته — با مهارت‌های دیگر هم هفته پر می‌شود",
    icon: "Feather",
    tier: "silver",
    progress: (s) => `${faNum(Math.min(s.goalDays7, 7))} از ۷ روزِ این هفته`,
    check: (s) => s.goalDays7 >= 7 && s.dictation7 === 0,
  },
  {
    id: "week-no-exam",
    title: "هفتهٔ بی‌آزمون",
    desc: "هفت روزِ هدف‌دار بدون حتی یک آزمون — این هفته را فقط مرور و تکرار پر کرده",
    icon: "Repeat",
    tier: "silver",
    progress: (s) => `${faNum(Math.min(s.goalDays7, 7))} از ۷ روزِ این هفته`,
    check: (s) => s.goalDays7 >= 7 && s.quizzes7 === 0,
  },
  // رانِ ترکیبی (Task 85): دیکته در جدول سیاستِ effects.ts هیچ‌گاه goal را بالا
  // نمی‌برد — پس رانِ دیکته از هدف کاملاً مستقل است و برخلاف بی‌دیکته/بی‌آزمون
  // شرطِ goalDays7 ندارد؛ شرطش فقط پیوستگی است: هر روزِ پنجره حداقل یک دیکته.
  // طلایی — هفت روزِ پیوسته املاء، سخت‌تر از یک هفتهٔ هدف‌دارِ معمولی.
  {
    id: "dictation-run",
    title: "هفتهٔ دیکتهٔ پیوسته",
    desc: "هفت روزِ پیوسته دیکته تمرین شده — رانِ روزانهٔ املاء، بدون حتی یک روزِ غیبت",
    icon: "SpellCheck2",
    tier: "gold",
    progress: (s) => `${faNum(Math.min(s.dictationDays7, 7))} از ۷ روزِ این هفته`,
    check: (s) => s.dictationDays7 >= 7,
  },
  // رانِ ترکیبی دوم (Task 86): آزمون برخلاف دیکته در قراردادِ goal-chip به هدف
  // کمک می‌کند (met = reviews+quizzes >= dailyGoal) — ولی شرطِ این نشان
  // پیوستگی است نه هدف: یک آزمونِ کوچکِ روزانه (زیرِ سقفِ هدف) هم روزِ
  // آزمون‌دار است، پس ران می‌تواند در هفته‌ای بدونِ حتی یک روزِ هدف‌دار باز
  // شود. قرینهٔ متضادِ «هفتهٔ بی‌آزمون» — ۷ روزِ آزمون‌دار یعنی quizzes7 > 0،
  // پس این دو هرگز هم‌زمان باز نمی‌شوند (تستِ قفل شده).
  {
    id: "exam-run",
    title: "هفتهٔ آزمون‌دار",
    desc: "هفت روزِ پیوسته آزمون داده شده — رانِ روزانهٔ آزمون، بدون حتی یک روزِ غیبت",
    icon: "ClipboardCheck",
    tier: "gold",
    progress: (s) => `${faNum(Math.min(s.quizDays7, 7))} از ۷ روزِ این هفته`,
    check: (s) => s.quizDays7 >= 7,
  },
  // رانِ دوتایی (Task 87): ترکیبِ هر دو رانِ روزانه در همان هفته — هر روزِ
  // پنجره هم دیکته داشته و هم آزمون. از دلِ شمارنده‌های موجود (dictationDays7
  // و quizDays7) خوانده می‌شود — هیچ ورودی تازه‌ای نمی‌خواهد. گلوگاهِ پیشرفتِ
  // قفل‌شده minِ دو شمارنده است (کمترینِ دیکته‌روز و آزمون‌روز) — سرنخِ زیرِ
  // قفل فقط بُعدِ روز را نشان می‌دهد (قراردادِ cage-free، r83). نتیجهٔ
  // ناخواسته ندارد: بازشدنِ این نشان یعنی #۳۳ و #۳۴ هم همان هفته باز شده‌اند
  // (زیرمجموعه‌اند) — این هم‌پوشانی عمدی است و در تست مستند می‌شود.
  {
    id: "double-run",
    title: "هفتهٔ دوبل",
    desc: "هفت روزِ پیوسته هم دیکته گرفته‌ای و هم آزمون داده‌ای — دو رانِ هم‌زمان در یک هفته",
    icon: "Layers",
    tier: "gold",
    progress: (s) =>
      `${faNum(Math.min(s.dictationDays7, s.quizDays7, 7))} از ۷ روزِ دوبلِ این هفته`,
    check: (s) => s.dictationDays7 >= 7 && s.quizDays7 >= 7,
  },
  // رانِ مرور (Task 88): هر روزِ پنجره حداقل یک مرور. تحلیلِ همان آزمون‌دار:
  // مرور به هدف کمک می‌کند (met = reviews+quizzes >= dailyGoal) ولی شرطِ این
  // نشان پیوستگی است نه هدف — یک مرورِ کوچکِ روزانه (زیرِ سقفِ هدف) هم روزِ
  // مرور‌دار است، پس ران می‌تواند در هفته‌ای بدونِ حتی یک روزِ هدف‌دار باز شود.
  // نقره‌ای — مرورِ رایج‌ترین فعالیت است و رانش از ران‌های دیکته/آزمون آسان‌تر؛
  // نقره جایگاهِ درستش در نردبان است.
  {
    id: "review-run",
    title: "هفتهٔ مرور",
    desc: "هفت روزِ پیوسته مرور کرده‌ای — رانِ روزانهٔ مرور، بدون حتی یک روزِ غیبت",
    icon: "History",
    tier: "silver",
    progress: (s) => `${faNum(Math.min(s.reviewsDays7, 7))} از ۷ روزِ این هفته`,
    check: (s) => s.reviewsDays7 >= 7,
  },
  // رانِ سه‌گانه (Task 89): تاجِ نردبانِ ران‌های هفتگی — هر روزِ پنجره هر سهٔ
  // دیکته + آزمون + مرور. شرطش یعنی سه رانِ تکی (دیکته/آزمون/مرور) و رانِ
  // دوبل هم‌زمان بازند — هم‌پوشانیِ چهارنفره، قرارداد است نه باگ: سه‌گانه
  // زیرمجموعهٔ همهٔ ران‌های هفتگی است. تاج طلا + آیکنِ Crown — تنها نشانِ
  // هفتگی که «همهٔ فعالیت‌ها با هم» را می‌خواهد. گلوگاهِ صادق: minِ سه
  // شمارنده — ضعیف‌ترین حلقهٔ زنجیره پیشرفت را تعیین می‌کند.
  {
    id: "triple-run",
    title: "هفتهٔ سه‌گانه",
    desc: "هفت روزِ پیوسته دیکته گرفته‌ای، آزمون داده‌ای و مرور کرده‌ای — هر سهٔ ران در یک هفته",
    icon: "Crown",
    tier: "gold",
    progress: (s) =>
      `${faNum(Math.min(s.dictationDays7, s.quizDays7, s.reviewsDays7, 7))} از ۷ روزِ سه‌گانهٔ این هفته`,
    check: (s) => s.dictationDays7 >= 7 && s.quizDays7 >= 7 && s.reviewsDays7 >= 7,
  },
  // ماراتن (Task 90): پایانِ نردبانِ ران‌ها — چهارده روزِ پیوسته هر سه فعالیت.
  // پنجرهٔ ۱۴روزه از dayHistory می‌آید (سقفِ حافظهٔ ۳۵ روزه مجازش است) و
  // زیرمجموعه‌بودنِ پنجرهٔ ۷ تضمینِ ریاضیِ هم‌بازشدنِ پنج نشانِ پایینی است:
  // هر روزِ پنجرهٔ ۷ (>= windowStart) در پنجرهٔ ۱۴ (>= daysAgoKey(13)) هم هست،
  // پس days14 >= 14 ⇒ days7 >= 14 ≥ 7. هم‌پوشانیِ شش‌نفره قرارداد است نه باگ.
  // تروفی = خطِ پایان؛ تنها نشانِ دوهفته‌ایِ خانوادهٔ ران (goal-fortnight
  // هم‌سنجِ خانوادهٔ هدف است، این یکی سخت‌ترش است: پیوستگیِ هر سه فعالیت).
  // گلوگاهِ صادق: minِ سه شمارنده — یک غیبت، ماراتن را می‌شکند.
  {
    id: "marathon-run",
    title: "ماراتنِ دوهفته‌ای",
    desc: "چهارده روزِ پیوسته دیکته، آزمون و مرور — بلندترین رانِ ممکن؛ دو هفته حتی یک غیبت نه",
    icon: "Trophy",
    tier: "gold",
    progress: (s) =>
      `${faNum(Math.min(s.dictationDays14, s.quizDays14, s.reviewsDays14, 14))} از ۱۴ روزِ ماراتن`,
    check: (s) => s.dictationDays14 >= 14 && s.quizDays14 >= 14 && s.reviewsDays14 >= 14,
  },
  // ---- خانوادهٔ حضور (Task 92) — بُعدِ چهارمِ ثبات: زنجیره «پیوستگی» را می‌سنجد
  // (یک غیبت می‌شکند)، هدف «وفاداری به قولِ روزانه» را، ران‌ها «پیوستگیِ یک
  // فعالیتِ خاص» را — حضور فقط می‌پرسد «این ماه چند روز اصلاً آمده‌ای؟» با
  // گسترده‌ترین شرطِ ممکن: هر فعالیتی روز را ثبت می‌کند (مرور/آزمون/دیکته/واژهٔ
  // تازه/برق‌آسا — همان پنج شمارندهٔ DayStat)؛ پس یادگیرنده‌ای که فقط واژه
  // بلدم‌می‌کند هم مسیرِ همین نشان را می‌رود. پنجره = کلِ حافظهٔ ۳۵روزهٔ
  // dayHistory (همان سقفِ Task 90)؛ روز≠جمع (قراردادِ ران‌ها): پنج فعالیت در
  // یک روز هنوز یک روزِ حاضره. دو پله: ۲۵ روز (نقره — حدود ۷۰٪ ماه) و ۳۰ روز
  // (طلا — تقریباً روزانه). زیرمجموعهٔ ریاضی: ۳۰ روز ⇒ ۲۵ روز هم هست.
  {
    id: "presence-month",
    title: "ماهِ حاضر",
    desc: "بیست‌وپنج روزِ فعال در ۳۵ روزِ اخیر — هر فعالیتی می‌شود؛ مهم این است که هر روز آمده باشی",
    icon: "CalendarCheck",
    tier: "silver",
    progress: (s) => `${faNum(Math.min(s.activeDays35, 25))} از ۲۵ روزِ فعال`,
    check: (s) => s.activeDays35 >= 25,
  },
  {
    id: "presence-month-full",
    title: "ماهِ درخشان",
    desc: "سی روزِ فعال در ۳۵ روزِ اخیر — تقریباً هر روزِ ماه حضور داشته‌ای و جا نمانده‌ای",
    icon: "Sparkles",
    tier: "gold",
    progress: (s) => `${faNum(Math.min(s.activeDays35, 30))} از ۳۰ روزِ فعال`,
    check: (s) => s.activeDays35 >= 30,
  },
  // ---- ماهِ بی‌وقفه (Task 95) — پلهٔ نهاییِ خانوادهٔ حضور: تمامِ حافظه.
  // dayHistory دقیقاً ۳۵ روز نگه می‌دارد (سقفِ Task 90) — پس «۳۵ روزِ فعال»
  // یعنی هر روزِ حافظه دست‌کم یک فعالیتی داشته؛ هم‌ارزِ ۳۵ روزِ پیوستهٔ
  // هر-فعالیتی (زنجیرهٔ حضور). با ۳۰⇒۲۵ زیرمجموعهٔ خانواده هم‌قرارداد است:
  // بازشدنش هر دو پلهٔ قبلی را هم روشن می‌کند. هیچ شمارندهٔ تازه‌ای نمی‌خواهد
  // — activeDays35 (Task 92) همین حالا محاسبه می‌شود. طلایی/Gem — همان
  // الگوی چند-طلاییِ خانوادهٔ ران (دوبل/سه‌گانه/ماراتن).
  {
    id: "presence-month-perfect",
    title: "ماهِ بی‌وقفه",
    desc: "هر ۳۵ روزِ حافظه فعال — یک ماه و چند روزِ پیوسته بدون حتی یک غیبت",
    icon: "Gem",
    tier: "gold",
    progress: (s) => `${faNum(Math.min(s.activeDays35, 35))} از ۳۵ روزِ فعال`,
    check: (s) => s.activeDays35 >= 35,
  },
  // ---- هفتهٔ پنج‌گانه (Task 93) — خانوادهٔ تنوع: ران‌ها «تکرارِ یک فعالیت» را
  // جایزه می‌دهند؛ هیچ نشانِ تنوع نبود. شرط: در پنجرهٔ ۷روزهٔ موتور هر پنج
  // مهارتِ DayStat دست‌کم یک روز حضور داشته باشند (مرور/آزمون/دیکته/واژهٔ
  // تازه/برق‌آسا). قراردادِ تنوع-در-پنجره (تست-قفل‌شده): حتی یک روزِ
  // پنج‌فعالیه شرط را برآورده می‌کند — معیار «حضورِ هر پنج مهارت در پنجره»
  // است نه پراکندگیِ روزها. پیشرفت = شمارِ مهارت‌های حاضر («۳ از ۵ مهارت») —
  // صادقانه می‌گوید کدام بُعد کم است. استثنای قراردادی: بازشدنش یعنی
  // dictation7>0 و quizzes7>0 — پس «هفتهٔ بی‌دیکته» و «هفتهٔ بی‌آزمون» هرگز
  // هم‌زمان باز نمی‌شوند (قفلِ متقابل).
  {
    id: "five-skill-week",
    title: "هفتهٔ پنج‌گانه",
    desc: "در یک هفته هر پنج مهارت را دست‌کم یک بار تجربه کن: مرور، آزمون، دیکته، واژهٔ تازه و برق‌آسا",
    icon: "Puzzle",
    tier: "gold",
    progress: (s) =>
      `${faNum([s.reviewsDays7, s.quizDays7, s.dictationDays7, s.wordsDays7, s.rushDays7].filter((x) => x >= 1).length)} از ۵ مهارت`,
    check: (s) =>
      s.reviewsDays7 >= 1 && s.quizDays7 >= 1 && s.dictationDays7 >= 1 && s.wordsDays7 >= 1 && s.rushDays7 >= 1,
  },
  // ---- شکارچیِ رقیب (Task 99) — ششمین خانواده: «نبرد». پاداشِ پایداریِ مقابلِ
  // یک حریفِ واحد؛ منبعِ داده دفترچهٔ ۱۵تاییِ دستگاه است (duelHistory — بدونِ
  // فیلدِ persist تازه). گروه‌بندی با نامِ نرمال‌شده (بی‌فاصله/بی‌نیم‌فاصله)؛
  // نامِ نمایشیِ خوداظهار است (SEC-5) و گروه‌بندی صادقانه روی همان نمایش.
  // دو پله: ۲ برد نقره/Swords، ۳ برد طلا/Crown — زیرمجموعهٔ ریاضیِ ۳⇒۲
  // (تست-قفل در هر دو جهت، هم‌قراردادِ خانواده‌های حضور/ران).
  {
    id: "rival-hunter",
    title: "شکارچیِ رقیب",
    desc: "دو برد مقابلِ یک حریفِ واحد در دفترچهٔ نبردها",
    icon: "Swords",
    tier: "silver",
    progress: (s) => `${faNum(Math.min(s.duelTopRivalWins, 2))} از ۲ برد مقابلِ یک حریف`,
    check: (s) => s.duelTopRivalWins >= 2,
  },
  {
    id: "rival-nightmare",
    title: "کابوسِ رقیب",
    desc: "سه برد مقابلِ یک حریفِ واحد — کابوسِ او تویی",
    icon: "Crown",
    tier: "gold",
    progress: (s) => `${faNum(Math.min(s.duelTopRivalWins, 3))} از ۳ برد مقابلِ یک حریف`,
    check: (s) => s.duelTopRivalWins >= 3,
  },
  // ---- صاعقه (Task 100) — هفتمین خانواده: «سرعت». امتیازِ نبرد از داور
  // می‌آید: درست×۱۰۰ + پاداشِ سرعتِ ۰..۱۰۰ بر پاسخ (ساعتِ سرور، Task 99) —
  // پس میانگینِ پاداش، میانگینِ سرعتِ واقعیِ پاسخ‌دادن است نه خوداظهاری.
  // دو گیتِ صادق: نمونهٔ آماری (۱۰ پاسخِ درست — دو نبردِ معمول) و آستانهٔ
  // میانگین (۶۰ ≈ پاسخِ ~۶.۷ثانیه‌ای بر قراردادِ BONUS_STEP_MS=۱۵۰). پیشرفت
  // همیشه روی «گیتِ مقیدِ» فعلی نامیده می‌شود: نمونه کم است → شمارِ نمونه،
  // نمونه کافی است ولی میانگین نه → خودِ میانگین. هیچ‌وقت «۷۵ از ۷۵» زیرِ
  // قفلِ نمونه‌کم دیده نمی‌شود — همان پیشرفتِ صادقِ خانواده‌های ۹۲-۹۹.
  {
    id: "speed-bolt",
    title: "صاعقه",
    desc: "میانگینِ پاداشِ سرعتِ ۶۰ از ۱۰۰ روی دست‌کم ۱۰ پاسخِ درست در دفترچهٔ نبردها — دکمه را پیش از فکرکردنِ حریف می‌زنی",
    icon: "Zap",
    tier: "silver",
    progress: (s) =>
      s.duelSpeedCorrect < 10
        ? `${faNum(Math.min(s.duelSpeedCorrect, 10))} از ۱۰ پاسخِ درست`
        : `میانگینِ سرعت: ${faNum(Math.min(Math.floor(s.duelSpeedAvg), 60))} از ۶۰`,
    check: (s) => s.duelSpeedCorrect >= 10 && s.duelSpeedAvg >= 60,
  },
  // ---- سرعتِ صوت (Task 100) — پلهٔ طلاییِ همان خانواده: ۷۵ ≈ پاسخِ ~۴.۵ثانیه‌ای
  // با نمونهٔ بزرگ‌تر (۱۵ پاسخ). زیرمجموعهٔ ریاضیِ ۷۵⇒۶۰ و ۱۵⇒۱۰ در هر دو بُعد
  // (تست-قفل در هر دو جهت، هم‌قراردادِ خانواده‌های حضور/ران/نبرد).
  {
    id: "speed-sound",
    title: "سرعتِ صوت",
    desc: "میانگینِ پاداشِ سرعتِ ۷۵ از ۱۰۰ روی دست‌کم ۱۵ پاسخِ درست — از صدای رسیدنِ سؤال هم تندتر جواب می‌دهی",
    icon: "Rocket",
    tier: "gold",
    progress: (s) =>
      s.duelSpeedCorrect < 15
        ? `${faNum(Math.min(s.duelSpeedCorrect, 15))} از ۱۵ پاسخِ درست`
        : `میانگینِ سرعت: ${faNum(Math.min(Math.floor(s.duelSpeedAvg), 75))} از ۷۵`,
    check: (s) => s.duelSpeedCorrect >= 15 && s.duelSpeedAvg >= 75,
  },
  // ---- گواه‌گرفته (Task 105) — هشتمین خانواده: «اعتماد». بردِ رسیددار یعنی
  // نتیجه از راهِ داوریِ متمرکز گذشته (Task 94): امضای HMAC داور روی آن است و
  // سمتِ API راستی‌آزمایی شده — درست پس از تعمیرِ زنجیرهٔ رسید (Task 104) این
  // خانواده پاداشِ اعتمادِ به‌جای‌ماندنی است نه خوداظهاری: رکوردِ بی‌sig
  // (قدیمی یا دستی) هرگز نمی‌شمارد. منبع: همان دفترچهٔ ۱۵تایی (duelHistory،
  // بدونِ فیلدِ persist تازه). دو پله: ۳ بردِ گواه‌دار نقره/ShieldCheck،
  // ۷ برد طلا/Stamp — زیرمجموعهٔ ریاضیِ ۷⇒۳ (تست-قفل در هر دو جهت،
  // هم‌قراردادِ خانواده‌های حضور/ران/نبرد/سرعت). پیشرفتِ شمارشیِ تک‌گایتی.
  {
    id: "receipt-trust",
    title: "گواه‌گرفته",
    desc: "سه برد با رسیدِ امضاشدهٔ داور در دفترچهٔ نبردها — داور پشتِ نتیجه‌ات ایستاده",
    icon: "ShieldCheck",
    tier: "silver",
    progress: (s) => `${faNum(Math.min(s.duelVerifiedWins, 3))} از ۳ بردِ گواه‌دار`,
    check: (s) => s.duelVerifiedWins >= 3,
  },
  {
    id: "receipt-oath",
    title: "سندِ زنده",
    desc: "هفت بردِ رسیددار — دفترچه‌ات سندِ زندهٔ داوریِ متمرکز است",
    icon: "Stamp",
    tier: "gold",
    progress: (s) => `${faNum(Math.min(s.duelVerifiedWins, 7))} از ۷ بردِ گواه‌دار`,
    check: (s) => s.duelVerifiedWins >= 7,
  },
  // ---- نیم‌نگاه (Task 108) — نهمین خانواده: «چابکیِ ذهن» — «فکرِ کم +
  // درستِ زیاد». زمانِ فکر (Task 106/108) حالا در دفترچه ماندگار است؛ رکوردِ
  // چابک = میانگینِ فکر ≤ ۱٫۵ثانیه + نرخِ درستیِ ≥ ۸۰٪ روی ≥ ۵ پاسخ با ≥ ۳
  // نمونهٔ فکر. گیتِ دومرحله‌ایِ صادق: رکوردِ بی‌think (قدیمی/بی‌نمونه/سرویسِ
  // قدیمی) هرگز نمی‌شمارد — زیرمجموعهٔ زیرمجموعه (بردها هم لازم نیست،
  // درستیِ خودِ پاسخ‌ها معیار است). دو پله: ۳ رکورد نقره/Eye، ۷ رکورد
  // طلا/BrainCircuit — زیرمجموعهٔ ریاضیِ ۷⇒۳ (تست-قفل در هر دو جهت،
  // هم‌قراردادِ خانواده‌های حضور/ران/نبرد/سرعت/اعتماد). پیشرفتِ شمارشیِ تک‌گایتی.
  {
    id: "quick-think",
    title: "نیم‌نگاه",
    desc: "سه نبرد با فکرِ میانگین زیر ۱٫۵ ثانیه و ۸۰٪ درستی — جواب پیش از آنکه فکر کنی آماده بود",
    icon: "Eye",
    tier: "silver",
    progress: (s) => `${faNum(Math.min(s.duelQuickThinkers, 3))} از ۳ نبردِ چابک`,
    check: (s) => s.duelQuickThinkers >= 3,
  },
  {
    id: "flash-mind",
    title: "برقِ فکر",
    desc: "هفت نبردِ چابک — ذهنی که پیش از پرسش، پاسخ را می‌داند",
    icon: "BrainCircuit",
    tier: "gold",
    progress: (s) => `${faNum(Math.min(s.duelQuickThinkers, 7))} از ۷ نبردِ چابک`,
    check: (s) => s.duelQuickThinkers >= 7,
  },
  // ---- هفتهٔ چابک (Task 110) — دهمین خانواده: «پیوستگیِ چابکی» — گیتِ
  // ترکیبیِ «فکرِ کم + درستِ زیاد» در مقیاسِ یک پنجرهٔ ۷روزه. تفاوتِ ماهوی
  // با چابکیِ ذهن (۱۰۸): آن‌جا سه رکوردِ چابک حتی پراکنده در سه فصل
  // می‌شمارد؛ این‌جا یک هفتهٔ یک‌پارچه می‌خواهد — میانگینِ وزن‌دارِ فکرِ
  // کلِ پنجره (هم‌وزنِ فکرِ هفتهٔ ۱۰۹) زیرِ آستانه، نرخِ درستیِ کلِ
  // پاسخ‌ها بالای ۸۰٪، روی نمونهٔ معنادار (≥۳ نبردِ فکردار، ≥۹ نمونهٔ
  // فکر، ≥۱۵ پاسخ). دو پله بر سقفِ میانگین: نقره ≤۱٫۵ثانیه (همان
  // آستانهٔ تک‌رکوردی — یک قرارداد) و طلا ≤۱ثانیه — زیرمجموعهٔ ریاضیِ
  // طلا⇒نقره (تست-قفل در هر دو جهت). پنجره‌ها لغزان‌اند و لنگرشان روزِ
  // رکورد — هفتهٔ درخشانِ هر جای دفترچه می‌شمارد، نه فقط هفتهٔ جاری.
  // رکوردِ بی‌think (قدیمی/بی‌نمونه) در میانگین و شمارِ فکردار هرگز
  // نمی‌آید؛ نرخِ درستی اما از همهٔ پاسخ‌های پنجره می‌خواند — هفتهٔ
  // سریعِ بی‌دقت، گیت را نمی‌گذراند.
  {
    id: "quick-week",
    title: "هفتهٔ چابک",
    desc: "یک هفتهٔ یک‌پارچه با میانگینِ فکر زیر ۱٫۵ ثانیه و ۸۰٪ درستی — چابکیِ پیوسته، نه شانسِ روز",
    icon: "CalendarClock",
    tier: "silver",
    progress: (s) =>
      `${faNum(Math.min(s.duelQuickWeek.maxThinkful, DUEL_QUICK_WEEK.minThinkful))} از ${faNum(DUEL_QUICK_WEEK.minThinkful)} نبردِ فکردار در یک هفته`,
    check: (s) => s.duelQuickWeek.qualifying !== null,
  },
  {
    id: "lightning-week",
    title: "هفتهٔ برق",
    desc: "هفته‌ای که میانگینِ فکرت زیر یک ثانیه بود — سریع‌ترین هفتهٔ عمرِ نبردت",
    icon: "Gauge",
    tier: "gold",
    progress: (s) =>
      s.duelQuickWeek.qualifying && s.duelQuickWeek.bestAvgMs !== null
        ? `${secFa(s.duelQuickWeek.bestAvgMs)} از ۱ ثانیه`
        : undefined,
    check: (s) =>
      s.duelQuickWeek.qualifying !== null &&
      s.duelQuickWeek.qualifying.avgMs <= DUEL_QUICK_WEEK.goldMs,
  },
];

export const TIER_STYLE: Record<BadgeTier, { ring: string; grad: string; chip: string; glow: string }> = {
  bronze: {
    ring: "border-amber-300",
    grad: "from-amber-400 to-orange-600",
    chip: "bg-amber-100 text-amber-800",
    glow: "shadow-amber-500/30",
  },
  silver: {
    ring: "border-slate-300",
    grad: "from-slate-400 to-slate-600",
    chip: "bg-slate-100 text-slate-700",
    glow: "shadow-slate-500/30",
  },
  gold: {
    ring: "border-yellow-400",
    grad: "from-yellow-400 to-amber-600",
    chip: "bg-yellow-100 text-yellow-800",
    glow: "shadow-yellow-500/40",
  },
};

/** ids of badges currently unlocked */
export function unlockedBadgeIds(s: BadgeEvalInput): Set<string> {
  const out = new Set<string>();
  for (const b of BADGES) if (b.check(s)) out.add(b.id);
  return out;
}
