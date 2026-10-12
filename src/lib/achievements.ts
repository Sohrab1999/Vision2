// ------------------------------------------------------------------
// Achievements (نشان‌ها) — computed from the study store state.
// Each badge has: id, title, desc, icon key, tier, and a check(state)
// returning boolean. Evaluation is pure so it can run on any snapshot.
// ------------------------------------------------------------------

import type { StudyState } from "./study-store";
import { daysAgoKey, normDayStat, todayStr } from "./study-store";
import { faNum } from "./study-theme";
import { completedQuestCount } from "./daily-quests";
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
    ...windowCounters(s.dayHistory, windowStart, today, ds),
  };
}

/** جمعِ dictation/quizzes پنجرهٔ ۷روزه از dayHistory + fallbackِ روزِ امروز (Task 84)
 *  + dictationDays7 (Task 85): شمارِ روزهایِ دیکته‌دار ≠ جمعِ دیکته‌ها — رانِ روزانه
 *  یعنی هر روزِ پنجره حداقل یک دیکته؛ دو دیکته در یک روز هنوز یک روزِ دیکته‌دار است. */
function windowCounters(
  dayHistory: StudyState["dayHistory"] | undefined,
  windowStart: string,
  today: string,
  ds: ReturnType<typeof normDayStat>
): Pick<BadgeEvalInput, "dictation7" | "quizzes7" | "dictationDays7" | "quizDays7"> {
  let dictation7 = 0;
  let quizzes7 = 0;
  let dictationDays7 = 0;
  let quizDays7 = 0;
  if (dayHistory && typeof dayHistory === "object") {
    for (const [key, raw] of Object.entries(dayHistory)) {
      if (key < windowStart || !raw || typeof raw !== "object") continue;
      const st = normDayStat(raw as Partial<StudyState["dayStat"]>);
      const d = Number.isFinite(st.dictation) ? Math.max(0, st.dictation) : 0;
      dictation7 += d;
      if (d > 0) dictationDays7 += 1;
      const q = Number.isFinite(st.quizzes) ? Math.max(0, st.quizzes) : 0;
      quizzes7 += q;
      if (q > 0) quizDays7 += 1;
    }
  }
  const todayInHistory = !!(dayHistory && typeof dayHistory === "object" && (dayHistory as Record<string, unknown>)[today]);
  if (!todayInHistory) {
    const d = Number.isFinite(ds.dictation) ? Math.max(0, ds.dictation) : 0;
    dictation7 += d;
    if (d > 0) dictationDays7 += 1;
    const q = Number.isFinite(ds.quizzes) ? Math.max(0, ds.quizzes) : 0;
    quizzes7 += q;
    if (q > 0) quizDays7 += 1;
  }
  return { dictation7, quizzes7, dictationDays7, quizDays7 };
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
