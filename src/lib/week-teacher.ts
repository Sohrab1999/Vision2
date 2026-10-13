// ------------------------------------------------------------------
// Task 119 «معلمِ هفته» — pure contract for the AI weekly review.
//
// The teacher judges a whole WEEK as the weekly report (Task 37/103/113)
// shows it. Same honest economy as exam-teacher (117) and story-forge
// (116), with one honest difference: the week lives in the learner's
// localStorage, so there is no server-side bank to recompute from —
// instead the client ships ONLY the same aggregate counts the report
// band already renders (never the raw dayHistory, never question or
// word content), and the route re-derives every derived number (win
// rate, trend) from those counts so the prompt and the fingerprint are
// built from one small validated shape.
//
//   • fingerprint = the fixed field list serialized — same week shape
//     → same controlled text (one paid generation, many reads)
//   • fallback = an honest offline review composed from the REAL
//     counts — the strongest dimension is praised, the weakest gets a
//     concrete exercise, an empty week is never fabricated
//
// UI-free: depends only on the domain percent helper, the static faNum
// digit map, the WeeklyDigest type, and the plain shapes below.
// ------------------------------------------------------------------

import { percent } from "@/lib/domain/percent";
import { faNum } from "@/lib/study-theme";
import type { WeeklyDigest } from "@/lib/weekly-digest";

/** the aggregate shape the client ships — the report band's own numbers */
export interface WeekTeacherStats {
  /** this week's study activities (reviews+quizzes+words+dictation+rush) */
  activities: number;
  reviews: number;
  quizzes: number;
  words: number;
  dictation: number;
  rush: number;
  /** days with any activity inside the 7-day window — 0..7 */
  activeDays: number;
  /** days whose daily goal was met — 0..7 */
  goalDays: number;
  /** last week's activities — the trend the teacher reads */
  prevActivities: number;
  /** busiest day's activity total inside the window — null when none */
  bestDay: number | null;
  /** duels inside the window per the ledger — null when no ledger */
  duels: number | null;
  duelWins: number;
  /** best personal duel score of the week — 0 when none */
  duelBest: number;
  /** weighted average think of the week's thinkful duels — null when none */
  thinkAvgMs: number | null;
  /** the window passed the quick-week gate (Task 113's evaluator) */
  quickWeek: boolean;
  /** current day streak */
  streak: number;
}

/** fixed serialization order — the fingerprint contract itself */
const FIELDS = [
  "activities",
  "reviews",
  "quizzes",
  "words",
  "dictation",
  "rush",
  "activeDays",
  "goalDays",
  "prevActivities",
  "bestDay",
  "duels",
  "duelWins",
  "duelBest",
  "thinkAvgMs",
  "quickWeek",
  "streak",
] as const;

/**
 * The one verdict gate — the teacher only judges a week that actually
 * happened. Duel-only learners count (Task 103: the duel line is
 * independent of study activity). One evaluator for the UI render
 * guard, the zod refine and the tests — never two faces.
 */
export function hasWeekVerdict(s: Pick<WeekTeacherStats, "activities" | "duels">): boolean {
  return s.activities > 0 || (s.duels ?? 0) > 0;
}

/**
 * Reduce the weekly digest + streak to the shippable aggregate shape.
 * Honest nulls follow the digest's own honesty: no ledger → duels null,
 * no thinkful duel → thinkAvgMs null, no busy day → bestDay null.
 */
export function weekTeacherStats(digest: WeeklyDigest, streak: number): WeekTeacherStats {
  const tw = digest.thisWeek;
  const d = digest.duels;
  return {
    activities: tw.activities,
    reviews: tw.reviews,
    quizzes: tw.quizzes,
    words: tw.words,
    dictation: tw.dictation,
    rush: tw.rush,
    activeDays: tw.activeDays,
    goalDays: tw.goalDays,
    prevActivities: digest.lastWeek.activities,
    bestDay: digest.bestDay ? digest.bestDay.total : null,
    duels: d ? d.thisWeek : null,
    duelWins: d?.win ?? 0,
    duelBest: d?.best ?? 0,
    thinkAvgMs: d?.think?.avgMs ?? null,
    quickWeek: d?.quickWeek != null,
    streak,
  };
}

/**
 * Cache fingerprint of a week: the fixed field list joined — every stat
 * change is a different week worth its own text; the same shape reads
 * the same controlled verdict for the whole class.
 */
export function weekFingerprint(s: WeekTeacherStats): string {
  return ["week-v1", ...FIELDS.map((f) => `${f}=${s[f] ?? "-"}`)].join(":");
}

/** Persian labels of the countable dimensions — local, bank-free */
const DIMENSIONS: { key: keyof Pick<WeekTeacherStats, "reviews" | "quizzes" | "words" | "dictation" | "rush" | "duels">; label: string }[] = [
  { key: "reviews", label: "مرور لغت" },
  { key: "quizzes", label: "آزمون" },
  { key: "words", label: "واژهٔ نو" },
  { key: "dictation", label: "دیکته" },
  { key: "rush", label: "چالشِ برق‌آسا" },
  { key: "duels", label: "نبردهای واژگانی" },
];

function dimensionCount(s: WeekTeacherStats, key: (typeof DIMENSIONS)[number]["key"]): number {
  return key === "duels" ? (s.duels ?? 0) : (s[key] as number);
}

/** the strongest real dimension (first-max tie-break — deterministic) */
function strongest(s: WeekTeacherStats): { label: string; count: number } | null {
  let best: { label: string; count: number } | null = null;
  for (const d of DIMENSIONS) {
    const count = dimensionCount(s, d.key);
    if (count > 0 && (!best || count > best.count)) best = { label: d.label, count };
  }
  return best;
}

/** the weakest real dimension — every zero dimension is a candidate */
function weakest(s: WeekTeacherStats): { label: string; count: number } | null {
  let worst: { label: string; count: number } | null = null;
  for (const d of DIMENSIONS) {
    const count = dimensionCount(s, d.key);
    if (worst === null || count < worst.count) worst = { label: d.label, count };
  }
  return worst;
}

const PRACTICE: Record<string, string> = {
  "مرور لغت": "چند مرورِ کوتاهِ فلش‌کارت‌ها به روزهایت اضافه کن — حتی روزی پنج‌تا",
  آزمون: "یک آزمونِ کوتاه از درس‌های این هفته بزن تا یادگیری‌ات سنجیده شود",
  "واژهٔ نو": "از متنِ درس‌ها چند واژهٔ تازه پیدا کن و به «واژه‌های من» ستاره بزن",
  دیکته: "یک دیکتهٔ کوتاه گوش کن — گوشِ زبان با تمرینِ کم‌但ِ پیوسته تیز می‌شود",
  "چالشِ برق‌آسا": "یک دورِ چالشِ برق‌آسا امتحان کن — سرعتِ تصمیم هم تمرین می‌خواهد",
  "نبردهای واژگانی": "یک نبرد واژگانی را تجربه کن — رقابتِ دو‌نفره واژه‌ها را ماندگار می‌کند",
};

function practiceFor(label: string): string {
  return PRACTICE[label] ?? "یک تمرینِ کوچکِ روزانه از همان مهارت انتخاب کن";
}

/**
 * The offline week teacher: an honest review composed from the REAL
 * aggregates — real counts, real trend, real strongest/weakest
 * dimension. Deterministic for the same stats; Persian digits via the
 * shared faNum. Never a fabricated praise for an empty week.
 */
export function fallbackWeekReview(s: WeekTeacherStats): import("@/lib/exam-teacher").TeacherReview {
  if (!hasWeekVerdict(s)) {
    return {
      intro: "هفته‌ای برای داوری نیست — هیچ فعالیت و نبردی به معلم نرسید.",
      strength: "چیزی برای سنجش وجود نداشت؛ صادقانه‌ترین پاسخ همین است.",
      advice: "از همین امروز با چند مرور شروع کن تا هفتهٔ بعد، معلم کارِ بیشتری برای تحسین داشته باشد.",
    };
  }

  const duels = s.duels ?? 0;
  const diff = s.activities - s.prevActivities;
  const trend =
    s.prevActivities === 0
      ? "هفتهٔ پیشِ تو خالی بود و این هفته فعال شدی — آغازِ واقعیِ مسیر."
      : diff > 0
        ? `از هفتهٔ پیش ${faNum(diff)} فعالیت بیشتر داشتی — شیبِ حرکت رو به بالاست.`
        : diff < 0
          ? `از هفتهٔ پیش ${faNum(Math.abs(diff))} فعالیت کمتر داشتی — یک تمرینِ کوچک، فاصله را پر می‌کند.`
          : "گام‌به‌گامِ همان وزنِ هفتهٔ پیش حرکت کردی — ثبات خودش نوعی برد است.";

  const parts: string[] = [];
  if (s.activities > 0) parts.push(`${faNum(s.activities)} فعالیت`);
  if (duels > 0) parts.push(`${faNum(duels)} نبرد`);
  const intro = `این هفته ${parts.join(" و ")} در دفترت ثبت شد؛ ${faNum(s.activeDays)} روز از ۷ روز فعال بودی. ${trend}`;

  const perfect = s.goalDays === 7 && s.activities > 0;
  const top = strongest(s);

  const strength = perfect
    ? `هر ۷ روزِ هفته هدفِ روزانه را کامل کردی — پیوستگیِ کامل، کمیاب‌ترین مهارتِ یادگیری.`
    : top
      ? `«${top.label}» ستونِ این هفته‌ات بود — ${faNum(top.count)} بار، بیشترین سهم را در کارنامهٔ هفته داشتی.`
      : "هفته‌ات در نبردها جریان داشت — واژه‌ها در میدان تمرین شدند.";

  const low = weakest(s);
  const adviceParts: string[] = [];
  if (!perfect && s.goalDays < 3) {
    adviceParts.push("هدفِ روزانه را کوچک‌تر اما هرروزی کن — سه روزِ کامل، آغازِ یک زنجیرهٔ واقعی است");
  }
  if (low && low.count === 0) {
    adviceParts.push(practiceFor(low.label));
  } else if (top && !perfect) {
    adviceParts.push(`برتری‌ات را حفظ کن و ${practiceFor(low?.label ?? "مرور لغت")} تا ستونِ دومِ هفته شود`);
  }
  if (adviceParts.length === 0) {
    adviceParts.push("همین ریتم را برای هفتهٔ بعد هم نگه دار — تکرارِ هوشمند، تثبیت می‌کند");
  }

  return { intro, strength, advice: `${adviceParts.join("؛ ")}.` };
}
