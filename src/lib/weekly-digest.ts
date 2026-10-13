// Task-37 «هفته‌نامهٔ پیشرفت» — pure weekly digest computation.
//
// Compares the last 7 days against the 7 days before them and derives
// deltas, activity shape and highlights. Pure input/output so the exact
// contract is unit-tested and the UI stays a dumb renderer.
//
// Data sources: the store's dayHistory window (full DayStat, Task-37) with a
// graceful fallback to the legacy HistoryMap (reviews/quizzes only) for days
// that predate it — old learners keep an honest digest from day one.

import type { DayHistoryMap, DayStat, HistoryMap } from "./study-store";
import { faNum } from "./study-theme";
import { percent } from "./domain/percent";
import { DUEL_HISTORY_CAP, saneThink, type DuelRecord } from "./duel-history";

export interface WeekTotals {
  reviews: number;
  quizzes: number;
  words: number;
  dictation: number;
  rush: number;
  activities: number; // sum of all counters
  activeDays: number; // days with any activity
  goalDays: number; // days whose daily goal was met
}

export interface Delta {
  field: keyof Pick<WeekTotals, "reviews" | "quizzes" | "words" | "dictation" | "rush" | "activities">;
  current: number;
  previous: number;
  diff: number; // current - previous
  percent: number | null; // vs previous; null when previous is 0
}

export interface WeeklyDigest {
  thisWeek: WeekTotals;
  lastWeek: WeekTotals;
  deltas: Delta[];
  bestDay: { day: string; total: number } | null;
  perDay: { day: string; stat: DayStat; inThisWeek: boolean }[]; // 14 days, oldest → today
  highlights: string[]; // Persian one-liners for the UI
  empty: boolean; // no activity in the full 14-day window
  /** Task 103 — خلاصهٔ نبردها؛ null یعنی دفترچه‌ای در کار نیست (بلوکِ UI پنهان) */
  duels: WeeklyDuels | null;
}

export interface DigestInput {
  dayHistory?: DayHistoryMap;
  history?: HistoryMap; // legacy fallback — reviews/quizzes per day
  goalMetDays?: string[];
  duelHistory?: DuelRecord[]; // Task 103 — خلاصهٔ نبردهای پنجرهٔ ۷روزه
}

const WEEK = 7;

/** zeroed DayStat for a day key */
const zeroDay = (day: string): DayStat => ({ day, reviews: 0, quizzes: 0, words: 0, dictation: 0, rush: 0 });

/** ISO day key of `n` days before the given key (all math is key-string based). */
export function dayKeyBefore(key: string, n: number): string {
  const d = new Date(`${key}T00:00:00`);
  d.setDate(d.getDate() - n);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

/** Resolve a day's full stat: dayHistory first, then legacy history, then zeros. */
export function statOfDay(day: string, input: DigestInput): DayStat {
  const dh = input.dayHistory?.[day];
  if (dh) {
    return {
      day,
      reviews: dh.reviews ?? 0,
      quizzes: dh.quizzes ?? 0,
      words: dh.words ?? 0,
      dictation: dh.dictation ?? 0,
      rush: dh.rush ?? 0,
    };
  }
  const legacy = input.history?.[day];
  if (legacy) return { ...zeroDay(day), reviews: legacy.reviews ?? 0, quizzes: legacy.quizzes ?? 0 };
  return zeroDay(day);
}

const sumTotals = (days: DayStat[], goalSet: Set<string>): WeekTotals => {
  const t: WeekTotals = { reviews: 0, quizzes: 0, words: 0, dictation: 0, rush: 0, activities: 0, activeDays: 0, goalDays: 0 };
  for (const d of days) {
    t.reviews += d.reviews;
    t.quizzes += d.quizzes;
    t.words += d.words;
    t.dictation += d.dictation;
    t.rush += d.rush;
    const total = d.reviews + d.quizzes + d.words + d.dictation + d.rush;
    t.activities += total;
    if (total > 0) t.activeDays += 1;
    if (goalSet.has(d.day)) t.goalDays += 1;
  }
  return t;
};

const DELTA_FIELDS = ["reviews", "quizzes", "words", "dictation", "rush", "activities"] as const;

function faPercent(n: number): string {
  return `${faNum(n)}٪`;
}

/** Build the digest for the 7-day window ending at todayKey (inclusive). */
export function computeWeeklyDigest(input: DigestInput, todayKey: string): WeeklyDigest {
  const goalSet = new Set(input.goalMetDays ?? []);

  const perDay: { day: string; stat: DayStat; inThisWeek: boolean }[] = [];
  const thisDays: DayStat[] = [];
  const lastDays: DayStat[] = [];
  for (let i = 2 * WEEK - 1; i >= 0; i -= 1) {
    const day = dayKeyBefore(todayKey, i);
    const stat = statOfDay(day, input);
    const inThisWeek = i < WEEK;
    perDay.push({ day, stat, inThisWeek });
    (inThisWeek ? thisDays : lastDays).push(stat);
  }

  const thisWeek = sumTotals(thisDays, goalSet);
  const lastWeek = sumTotals(lastDays, goalSet);

  const deltas: Delta[] = DELTA_FIELDS.map((field) => {
    const current = thisWeek[field];
    const previous = lastWeek[field];
    return {
      field,
      current,
      previous,
      diff: current - previous,
      percent: previous > 0 ? Math.round(((current - previous) / previous) * 100) : null,
    };
  });

  let bestDay: WeeklyDigest["bestDay"] = null;
  for (const d of thisDays) {
    const total = d.reviews + d.quizzes + d.words + d.dictation + d.rush;
    if (total > 0 && (!bestDay || total > bestDay.total)) bestDay = { day: d.day, total };
  }

  const highlights: string[] = [];
  const isEmpty = thisWeek.activities === 0 && lastWeek.activities === 0;
  if (!isEmpty) {
    const act = deltas.find((d) => d.field === "activities")!;
    if (act.previous === 0 && act.current > 0) {
      highlights.push(`شروع پرانرژی — ${faNum(act.current)} فعالیت این هفته ثبت شد`);
    } else if (act.diff > 0) {
      highlights.push(`${faNum(act.diff)} فعالیت بیشتر از هفتهٔ پیش (${faPercent(act.percent ?? 0)} رشد)`);
    } else if (act.diff < 0) {
      highlights.push(`${faNum(Math.abs(act.diff))} فعالیت کمتر از هفتهٔ پیش — یک تمرین کوچک، فاصله را پر می‌کند`);
    } else {
      highlights.push(`هم‌قدم با هفتهٔ پیش — ${faNum(act.current)} فعالیت`);
    }
    if (thisWeek.goalDays > 0) {
      highlights.push(`${faNum(thisWeek.goalDays)} روزِ هدفِ روزانه کامل شد`);
    }
    if (thisWeek.words > 0) {
      highlights.push(`${faNum(thisWeek.words)} واژهٔ جدید به گنجینهٔ تو اضافه شد`);
    }
    if (thisWeek.rush > 0 && thisWeek.rush >= lastWeek.rush && lastWeek.rush > 0) {
      highlights.push(`چالش برق‌آسا را رها نکردی — ${faNum(thisWeek.rush)} دور این هفته`);
    }
  }

  const duels = duelWeeklyStats(input.duelHistory, todayKey);
  // Task 103 — خطِ نبردها مستقل از فعالیتِ مطالعاتی است: دودل‌بازِ بی‌مرور هم
  // حق دارد هفته‌نامه از او حرف بزند؛ «+» یعنی شمارشِ حداقلی (سقفِ دفترچه)
  if (duels !== null && duels.thisWeek > 0) {
    highlights.push(
      `${faNum(duels.thisWeek)}${duels.truncated ? "+" : ""} نبرد واژگانی این هفته — ${faNum(duels.win)} برد، ${faNum(duels.loss)} باخت${duels.tie > 0 ? `، ${faNum(duels.tie)} مساوی` : ""}`
    );
  }

  return { thisWeek, lastWeek, deltas, bestDay, perDay, highlights, empty: isEmpty, duels };
}

// ------------------------------------------------------------------
// Task 103 — «نبردهای هفته» — خلاصهٔ صادقِ دفترچهٔ نبرد در پنجرهٔ ۷روزه.
// دفترچه فقط DUEL_HISTORY_CAP رکورد آخر را نگه می‌دارد؛ اگر تمامِ پنجره
// پرِ آن رکوردها باشد، شمارشِ هفته «حداقل» است نه قطعی — truncated این
// صداقت را حمل می‌کند تا UI هرگز عددِ مشکوک را قطعی نشان ندهد.
// ------------------------------------------------------------------

export interface WeeklyDuels {
  thisWeek: number; // نبردهای پنجرهٔ ۷روزه (از دفترچه — با سقفِ حافظه)
  lastWeek: number; // نبردهای ۸..۱۴ روزِ پیش
  win: number;
  loss: number;
  tie: number;
  winRate: number; // percent(win, thisWeek) — ۰ بی‌نبرد
  best: number; // بهترین امتیازِ شخصیِ همین هفته — ۰ بی‌نبرد
  truncated: boolean; // پنجره پرِ سقفِ دفترچه است — شمارش حداقلی
  /**
   * Task 109 «فکرِ هفته» — تلفیقِ وزن‌دارِ آمارِ فکرِ نبردهای همینِ هفته؛
   * null یعنی هیچ رکوردِ فکرِ سالمی در پنجره نیست (خطِ UI پنهان — نه صفرِ ساختگی).
   * رکوردهای بی‌think (قدیمی/سرویسِ قدیمی/بی‌نمونه) در شمارش نمی‌آیند —
   * زیرمجموعهٔ صادق، هم‌الگوی چیپِ دفترچه و نشانِ چابکیِ ذهن (۱۰۸).
   */
  think: WeeklyThink | null;
}

export interface WeeklyThink {
  /** میانگینِ وزن‌دار بر اساسِ seen هر نبرد (Σ avgMs·seen ÷ Σ seen)، گِرد به ms */
  avgMs: number;
  /** سریع‌ترین لحظهٔ فکرِ هفته — کمینهٔ minMsها */
  fastestMs: number;
  /** جمعِ نمونه‌های سالمِ همهٔ نبردهای فکردار */
  seen: number;
  /** جمعِ طولِ نبردهای فکردار — برای «N از M سؤالِ فکردار» */
  total: number;
}

/**
 * خلاصهٔ نبردهای پنجره — بدونِ دفترچه null (بلوکِ UI پنهان، نه صفرِ ساختگی).
 * رکوردِ خراب (روزِ نامعتبر یا نتیجهٔ ناشناخته) کلاً کنار می‌رود، نه نصفه.
 */
export function duelWeeklyStats(records: DuelRecord[] | undefined, todayKey: string): WeeklyDuels | null {
  if (!Array.isArray(records) || records.length === 0) return null;
  const thisDays = new Set<string>();
  const lastDays = new Set<string>();
  for (let i = 0; i < WEEK; i += 1) thisDays.add(dayKeyBefore(todayKey, i));
  for (let i = WEEK; i < 2 * WEEK; i += 1) lastDays.add(dayKeyBefore(todayKey, i));

  let thisWeek = 0;
  let lastWeek = 0;
  let win = 0;
  let loss = 0;
  let tie = 0;
  let best = 0;
  // Task 109 — تجمیعِ وزن‌دارِ فکر؛ فقط رکوردهای همینِ هفته با thinkِ سالم
  let thinkSumMs = 0; // Σ avgMs·seen — میانگینِ میانگین‌ها وزن‌دار بر نمونه‌ها
  let thinkSeen = 0;
  let thinkTotal = 0;
  let thinkFastest = Number.POSITIVE_INFINITY;
  for (const r of records) {
    if (!r || typeof r.day !== "string") continue;
    const outcome = r.outcome === "win" || r.outcome === "loss" || r.outcome === "tie" ? r.outcome : null;
    if (!outcome) continue;
    if (thisDays.has(r.day)) {
      thisWeek += 1;
      if (outcome === "win") win += 1;
      else if (outcome === "loss") loss += 1;
      else tie += 1;
      if (Number.isFinite(r.myScore) && r.myScore > best) best = r.myScore;
      const t = saneThink(r.think);
      if (t) {
        thinkSumMs += t.avgMs * t.seen;
        thinkSeen += t.seen;
        thinkTotal += t.total;
        if (t.minMs < thinkFastest) thinkFastest = t.minMs;
      }
    } else if (lastDays.has(r.day)) {
      lastWeek += 1;
    }
  }
  return {
    thisWeek,
    lastWeek,
    win,
    loss,
    tie,
    winRate: percent(win, thisWeek),
    best,
    truncated: thisWeek >= DUEL_HISTORY_CAP,
    think:
      thinkSeen > 0
        ? {
            avgMs: Math.round(thinkSumMs / thinkSeen),
            fastestMs: thinkFastest,
            seen: thinkSeen,
            total: thinkTotal,
          }
        : null,
  };
}

const FA_WEEKDAYS = ["یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه", "شنبه"];
/** Persian weekday label of an ISO day key. */
export function faWeekday(key: string): string {
  const d = new Date(`${key}T00:00:00`);
  if (Number.isNaN(d.getTime())) return "";
  return FA_WEEKDAYS[d.getDay()];
}

/** Short "M/D" style label with Persian digits. */
export function faDayLabel(key: string): string {
  const parts = key.split("-");
  if (parts.length !== 3) return key;
  const [, m, d] = parts;
  return `${faNum(Number(d))}/${faNum(Number(m))}`;
}
