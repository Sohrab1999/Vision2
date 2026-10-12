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
  };
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
