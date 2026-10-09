// ------------------------------------------------------------------
// Achievements (نشان‌ها) — computed from the study store state.
// Each badge has: id, title, desc, icon key, tier, and a check(state)
// returning boolean. Evaluation is pure so it can run on any snapshot.
// ------------------------------------------------------------------

import type { StudyState } from "./study-store";
import { normDayStat, todayStr } from "./study-store";
import { completedQuestCount } from "./daily-quests";

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
  };
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
    progress: (s) => `${Math.min(s.knownCount, 10)} از ۱۰ واژه`,
    check: (s) => s.knownCount >= 10,
  },
  {
    id: "word-scholar",
    title: "واژه‌شناس",
    desc: "۵۰ واژه را یاد بگیر",
    icon: "BookOpenCheck",
    tier: "silver",
    progress: (s) => `${Math.min(s.knownCount, 50)} از ۵۰ واژه`,
    check: (s) => s.knownCount >= 50,
  },
  {
    id: "word-master",
    title: "واژه‌دان",
    desc: "۱۵۰ واژه را یاد بگیر",
    icon: "GraduationCap",
    tier: "gold",
    progress: (s) => `${Math.min(s.knownCount, 150)} از ۱۵۰ واژه`,
    check: (s) => s.knownCount >= 150,
  },
  {
    id: "quiz-5",
    title: "تست‌باز",
    desc: "۵ آزمون یا تمرین کامل کن",
    icon: "ListChecks",
    tier: "bronze",
    progress: (s) => `${Math.min(s.totalQuizzes, 5)} از ۵ آزمون`,
    check: (s) => s.totalQuizzes >= 5,
  },
  {
    id: "quiz-20",
    title: "معلم‌پرسان",
    desc: "۲۰ آزمون یا تمرین کامل کن",
    icon: "ClipboardCheck",
    tier: "silver",
    progress: (s) => `${Math.min(s.totalQuizzes, 20)} از ۲۰ آزمون`,
    check: (s) => s.totalQuizzes >= 20,
  },
  {
    id: "review-50",
    title: "مرورگر",
    desc: "۵۰ بار با فلش‌کارت‌ها مرور کن",
    icon: "RefreshCcw",
    tier: "bronze",
    progress: (s) => `${Math.min(s.totalReviews, 50)} از ۵۰ مرور`,
    check: (s) => s.totalReviews >= 50,
  },
  {
    id: "streak-3",
    title: "سه‌روزهٔ پیوسته",
    desc: "۳ روز پشت‌سرهم فعالیت کن",
    icon: "Flame",
    tier: "bronze",
    progress: (s) => `رکورد: ${Math.min(s.bestStreak, 3)} از ۳ روز`,
    check: (s) => s.bestStreak >= 3,
  },
  {
    id: "streak-7",
    title: "هفتهٔ کامل",
    desc: "۷ روز پشت‌سرهم فعالیت کن",
    icon: "CalendarCheck",
    tier: "gold",
    progress: (s) => `رکورد: ${Math.min(s.bestStreak, 7)} از ۷ روز`,
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
    progress: (s) => `بهترین: ${Math.min(s.bestPercent, 85)}٪`,
    check: (s) => s.bestPercent >= 85,
  },
  {
    id: "perfect",
    title: "بی‌نقص",
    desc: "در یک آزمون ۱۰۰٪ بگیر",
    icon: "Target",
    tier: "gold",
    progress: (s) => `بهترین: ${Math.min(s.bestPercent, 100)}٪`,
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
    progress: (s) => `بهترین: ${Math.min(s.rushBestCorrect, 15)} از ۱۵ پاسخ`,
    check: (s) => s.rushBestCorrect >= 15,
  },
  {
    id: "rush-5",
    title: "چالش‌باز",
    desc: "در ۵ چالش برق‌آسا شرکت کن",
    icon: "Gamepad2",
    tier: "silver",
    progress: (s) => `${Math.min(s.rushGames, 5)} از ۵ چالش`,
    check: (s) => s.rushGames >= 5,
  },
  {
    id: "rush-champ",
    title: "قهرمان برق‌آسا",
    desc: "در یک دور چالش ۱۰۰ امتیاز یا بیشتر بگیر",
    icon: "Trophy",
    tier: "gold",
    progress: (s) => `بهترین: ${Math.min(s.rushBest, 100)} از ۱۰۰ امتیاز`,
    check: (s) => s.rushBest >= 100,
  },
  {
    id: "quest-master",
    title: "مأمور پنج‌گانه",
    desc: "هر ۵ هدف روزانه را در یک روز کامل کن",
    icon: "Crown",
    tier: "gold",
    progress: (s) => `${Math.min(s.questsDoneToday, 5)} از ۵ هدف امروز`,
    check: (s) => s.questsDoneToday >= 5,
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
