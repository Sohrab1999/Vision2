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
import { questStreakMeta } from "./quest-streak";
import { percent } from "./domain/percent";
import { DUEL_HISTORY_CAP, DUEL_QUICK_THINK, saneThink, type DuelRecord } from "./duel-history";

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
    // Task 142 — «زنجیرهٔ مأموریت‌ها در هفته‌نامه» — ادعایِ پایداری با عددِ
    // واقعی، تک‌منبعِ questStreakMeta (همان قراردادِ چیپِ پنلِ مأموریت‌ها —
    // ۱۴۰). خط فقط از streak>=۲ می‌آید: «زنجیره» یعنی حداقلِ دو حلقه و
    // تک‌روزِ کامل را خودِ نوارِ پاداش جشن می‌گیرد. دلتایِ هفته = weekPerfect
    // (حلقه‌هایِ بسته‌شده در همینِ پنجرهٔ ۷روزه — هم‌پنجرهٔ خودِ دایجست)؛
    // وقتی خط هست ناگزیر ≥۱ است چون نخستین حلقهٔ زنجیره (امروز یا دیروز)
    // داخلِ پنجره است — نگهبانِ شرط سندِ همین ناگزانسی است.
    const questStreak = questStreakMeta(input.dayHistory ?? {}, todayKey);
    if (questStreak.streak >= 2 && questStreak.weekPerfect > 0) {
      highlights.push(
        `زنجیرهٔ مأموریت‌ها به ${faNum(questStreak.streak)} روز رسید — ${faNum(questStreak.weekPerfect)} حلقه در همین هفته`
      );
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
  /**
   * Task 113 «هفتهٔ چابک در هفته‌نامه» — پروفایلِ همینِ پنجرهٔ ۷روزهٔ دایجست
   * [today−6..today] وقتی از گیت‌های هفتهٔ چابک (۱۱۰) بگذرد؛ در غیرِ این صورت
   * null (خطِ UI غایب — نه صفرِ ساختگی). ارزیاب و آستانه‌ها همانِ نشانِ
   * خانوادهٔ دهم‌اند (evalQuickWindow + DUEL_QUICK_WEEK) — هرگز دووجهی نمی‌شود.
   */
  quickWeek: QuickWeekProfile | null;
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
    // Task 113 — پروفایلِ هفتهٔ چابکِ همینِ پنجره؛ بدونِ گذرِ گیت null می‌آید
    // (خطِ هفته‌نامه غایب، نه صفرِ ساختگی) — هم‌ارزیابِ نشانِ ۱۱۰
    quickWeek: duelWeekQuickProfile(records, todayKey),
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

// ------------------------------------------------------------------
// Task 110 — «هفتهٔ چابک» — دهمین خانوادهٔ نشان: گیتِ ترکیبیِ «فکرِ کم +
// درستِ زیاد» در مقیاسِ هفته. خانوادهٔ چابکیِ ذهن (۱۰۸) تک‌رکوردی است —
// سه نبردِ چابک حتی در سه فصلِ جدا هم می‌شمارد؛ این‌جا معیار «پیوستگی» است:
// یک پنجرهٔ ۷روزه که در کلِ آن، میانگینِ وزن‌دارِ فکر کم و نرخِ درستیِ
// بالاست — نه سه شانسِ پراکنده. آستانه‌ها از DUEL_QUICK_THINK می‌آیند
// (یک قرارداد، هرگز دووجهی نشود) و میانگین، هم‌وزنِ «فکرِ هفته» (۱۰۹):
// Σ avgMs·seen ÷ Σ seen — نبردِ پرنمونه سنگین‌تر.
// ------------------------------------------------------------------

/** گیت‌های هفتهٔ چابک — فروزن؛ مرزهای دقیق تست-قفل می‌شوند */
export const DUEL_QUICK_WEEK = {
  /** طولِ پنجرهٔ لغزان (روزِ لنگر تا ۶ روزِ پیش‌تر) */
  windowDays: 7,
  /** دست‌کم این تعداد نبردِ فکردارِ سالم در پنجره — «هفته» تک‌نمونه نیست */
  minThinkful: 3,
  /** دست‌کم این جمعِ نمونه‌های فکر — میانگینِ وزن‌دار باید معنا داشته باشد */
  minSeen: 9,
  /** دست‌کم این جمعِ پاسخ‌ها — نرخِ درستی روی هفتهٔ کوتاه بی‌معناست */
  minAnswered: 15,
  /** نرخِ درستیِ حداقل — همان قراردادِ تک‌رکوردی (۱۳۰۸) */
  correctRate: DUEL_QUICK_THINK.correctRate,
  /** سقفِ میانگینِ فکرِ هفته برای نشانِ نقره — همان آستانهٔ تک‌رکوردی */
  silverMs: DUEL_QUICK_THINK.quickMs,
  /** سقفِ نشانِ طلا — زیرِ یک ثانیه در کلِ هفته */
  goldMs: 1000,
} as const;

/** پروفایلِ یک پنجرهٔ ۷روزه — همان چیزی که گیت می‌خواند و تست قفل می‌کند */
export interface QuickWeekProfile {
  /** آغازِ پنجره (لنگر − ۶ روز) */
  startDay: string;
  /** روزِ لنگر — همیشه روزِ یک رکوردِ واقعی */
  endDay: string;
  /** همهٔ رکوردهای سالمِ پنجره (فکردار و بی‌فکر) */
  duels: number;
  /** رکوردهای فکردارِ سالمِ پنجره */
  thinkful: number;
  /** میانگینِ وزن‌دارِ فکر بر seen — فقط رکوردهای فکردار (زیرمجموعهٔ صادق) */
  avgMs: number;
  /** جمعِ نمونه‌های فکرِ پنجره */
  seen: number;
  /** جمعِ پاسخ‌های رکوردهای دارای پاسخ (فورفیتِ بی‌پاسخ حساب نمی‌شود) */
  answered: number;
  /** جمعِ درست‌های همان رکوردها */
  correct: number;
  /** correct/answered — با سقفِ ۱ (درستیِ بیش‌ازصد وجود ندارد) */
  rate: number;
}

export interface QuickWeekReport {
  /**
   * نخستین پنجرهٔ واجدِ گیتِ نقره در پیمایشِ جدید→قدیم — null یعنی هیچ
   * هفته‌ای در دفترچه گیت را نگذرانده (نشانِ قفلِ صادق، نه صفرِ ساختگی).
   */
  qualifying: QuickWeekProfile | null;
  /**
   * کمینهٔ میانگینِ وزن‌دارِ پنجره‌هایِ حداقلِ minThinkful فکردار — بی‌توجهِ
   * نرخ/پاسخ/سقف؛ فقط برای خطِ پیشرفتِ نشانِ طلا («سریع‌ترین هفتهٔ تو»).
   */
  bestAvgMs: number | null;
  /** بیشترین نبردِ فکردارِ یک پنجرهٔ ۷روزه — پیشرفتِ شمارشیِ نشانِ نقره */
  maxThinkful: number;
}

/**
 * ارزیابِ یک پنجرهٔ ۷روزه — تک‌قراردادِ گیت‌های هفتهٔ چابک؛ هم duelQuickWeekReport
 * (پنجره‌های لغزانِ نشان) و هم duelWeekQuickProfile (پنجرهٔ خودِ دایجست) همین را
 * می‌خوانند تا آستانه‌ها هرگز دووجهی نشوند (درسِ «یک اعتبارسنج، دو مصرف‌کننده» — ۱۰۹).
 * ورودی باید از پیش به همان پنجره فیلتر شده باشد؛ startDay/endDay فقط برای پروفایل‌اند.
 */
interface QuickWindowEval {
  /** پروفایلِ کاملِ پنجره؛ avgMs وقتی seen>0 گِردشده وگرنه ۰ (فقط با qualifies معنا دارد) */
  profile: QuickWeekProfile;
  /** شرطِ خطِ bestAvgMs (پیش از گیت‌ها) — دقیقاً همان قراردادِ قبلیِ ۱۱۰ */
  hasBestAvg: boolean;
  /** گذر از همهٔ گیت‌های نقره — ترتیبِ گیت‌ها در نتیجهٔ نهایی بی‌اثر است */
  qualifies: boolean;
}

function evalQuickWindow(inWin: DuelRecord[], startDay: string, endDay: string): QuickWindowEval {
  // فکر: فقط رکوردهای فکردارِ سالم (زیرمجموعهٔ صادق — هم‌الگوی ۱۰۸/۱۰۹)
  let sumMs = 0;
  let seen = 0;
  let thinkful = 0;
  for (const r of inWin) {
    const t = saneThink(r.think);
    if (t) {
      sumMs += t.avgMs * t.seen;
      seen += t.seen;
      thinkful += 1;
    }
  }
  // پاسخ‌ها: همهٔ رکوردهای دارای پاسخ — فورفیتِ بی‌پاسخ نه کمکی دارد نه زیانی
  let answered = 0;
  let correct = 0;
  for (const r of inWin) {
    const a = Number.isFinite(r.answered) ? Math.floor(r.answered) : 0;
    if (a > 0) {
      answered += a;
      correct += Number.isFinite(r.myCorrect) ? Math.floor(r.myCorrect) : 0;
    }
  }
  const rate = correct > 0 ? Math.min(1, correct / answered) : 0;
  const avgMs = seen > 0 ? Math.round(sumMs / seen) : 0;
  const qualifies =
    thinkful >= DUEL_QUICK_WEEK.minThinkful &&
    seen >= DUEL_QUICK_WEEK.minSeen &&
    answered >= DUEL_QUICK_WEEK.minAnswered &&
    rate >= DUEL_QUICK_WEEK.correctRate &&
    avgMs <= DUEL_QUICK_WEEK.silverMs;
  return {
    profile: { startDay, endDay, duels: inWin.length, thinkful, avgMs, seen, answered, correct, rate },
    hasBestAvg: thinkful >= DUEL_QUICK_WEEK.minThinkful && seen > 0,
    qualifies,
  };
}

/**
 * پروفایلِ «هفتهٔ چابک» برای پنجرهٔ خودِ دایجست [todayKey−۶..todayKey] — همان
 * پنجره‌ای که duelWeeklyStats با آن شمارش می‌کند (پنجره‌سازیِ نشان با پنجره‌سازیِ
 * هفته‌نامه قاطی نمی‌شود). فقط وقتی همهٔ گیت‌ها بگذرد پروفایل می‌دهد؛ در غیرِ این
 * صورت null — خطِ هفته‌نامه غایب است، نه صفرِ ساختگی. هرگز throw نمی‌کند.
 */
export function duelWeekQuickProfile(records: DuelRecord[] | undefined, todayKey: string): QuickWeekProfile | null {
  if (!Array.isArray(records)) return null;
  const startDay = dayKeyBefore(todayKey, DUEL_QUICK_WEEK.windowDays - 1);
  const inWin = records.filter(
    (r) =>
      r &&
      typeof r.day === "string" &&
      (r.outcome === "win" || r.outcome === "loss" || r.outcome === "tie") &&
      r.day >= startDay &&
      r.day <= todayKey
  );
  if (inWin.length === 0) return null;
  const ev = evalQuickWindow(inWin, startDay, todayKey);
  return ev.qualifies ? ev.profile : null;
}

/**
 * بهترین «هفتهٔ چابک» دفترچه — پنجره‌های لغزانِ لنگربر-روزِ رکورد.
 * هر روزِ متمایزِ دفترچه یک لنگر است (پنجره = [لنگر−۶ .. لنگر])؛ اسکن
 * جدید→قدیم تا نخستین پنجرهٔ واجد، «گزارش» قطعی بماند. رکوردِ خراب
 * (روزِ نامعتبر/نتیجهٔ ناشناخته) بی‌صدا کنار می‌رود — هم‌نگهبانِ
 * duelWeeklyStats. هرگز throw نمی‌کند.
 */
export function duelQuickWeekReport(records: DuelRecord[] | undefined): QuickWeekReport {
  const empty: QuickWeekReport = { qualifying: null, bestAvgMs: null, maxThinkful: 0 };
  if (!Array.isArray(records)) return empty;
  const valid = records.filter(
    (r) =>
      r &&
      typeof r.day === "string" &&
      (r.outcome === "win" || r.outcome === "loss" || r.outcome === "tie")
  );
  if (valid.length === 0) return empty;
  const days = [...new Set(valid.map((r) => r.day))].sort((a, b) => (a < b ? 1 : a > b ? -1 : 0));

  let qualifying: QuickWeekProfile | null = null;
  let bestAvgMs: number | null = null;
  let maxThinkful = 0;

  for (const endDay of days) {
    const startDay = dayKeyBefore(endDay, DUEL_QUICK_WEEK.windowDays - 1);
    const inWin = valid.filter((r) => r.day >= startDay && r.day <= endDay);
    if (inWin.length === 0) continue;
    const ev = evalQuickWindow(inWin, startDay, endDay);
    if (ev.profile.thinkful > maxThinkful) maxThinkful = ev.profile.thinkful;
    // بهترین میانگینِ قابل‌نمایش — پیش از گیت‌ها، برای خطِ پیشرفتِ طلا
    if (ev.hasBestAvg && (bestAvgMs === null || ev.profile.avgMs < bestAvgMs)) {
      bestAvgMs = ev.profile.avgMs;
    }
    // گیت‌ها — نخستین پنجرهٔ واجد می‌ماند (جدید→قدیم، قطعی)
    if (!qualifying && ev.qualifies) qualifying = ev.profile;
  }
  return { qualifying, bestAvgMs, maxThinkful };
}
