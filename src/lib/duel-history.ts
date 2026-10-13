// ------------------------------------------------------------------
// «تاریخچهٔ نبردها» (Task 65) — موتور خالص دفترچهٔ دودل.
//
// تا امروز از یک نبرد فقط سه شمارندهٔ W/L/T روی جا می‌ماند؛ نام حریف،
// امتیازها، تاریخ و فرمِ بردها برای همیشه گم می‌شدند. این ماژول رکورد
// استاندارد یک نبرد تمام‌شده را از EndPayload سوکت می‌سازد، نگه‌داری
// جدیدترین‌اول با سقف دارد و خلاصه‌های آماری (برد متوالی/بهترین امتیاز/فرم)
// را برای پنل «آخرین نبردها» حساب می‌کند.
//
// خالص است — هیچ import از store/React؛ اسلایس arcade و تست‌ها مصرفش می‌کنند.
// تنها import: قراردادِ درصدِ دامنه (pure→pure — طبقهٔ پایینِ معماری).
// ------------------------------------------------------------------

import { percent } from "./domain/percent";

export type DuelOutcome = "win" | "loss" | "tie";
export type DuelEndReason = "finished" | "forfeit";

/** یک نبرد تمام‌شدهٔ ثبت‌شده — id ترتیبِ ساخت را حمل می‌کند (`d${epochMs}`) */
export interface DuelRecord {
  id: string;
  /** ISO day key (YYYY-MM-DD) برای نمایش تاریخ */
  day: string;
  outcome: DuelOutcome;
  reason: DuelEndReason;
  /** نام نمایشی حریف (فالبک: «حریف») */
  opponent: string;
  /** رنگ آواتار حریف (واژهٔ رنگ) */
  opponentColor: string;
  myScore: number;
  oppScore: number;
  myCorrect: number;
  oppCorrect: number;
  /** تعداد پاسخ‌های من */
  answered: number;
  /** تعداد سؤال‌های نبرد */
  total: number;
  /** ثانیه‌های من تا پایان (myFinishAt−startedAt؛ فورفیت/تایم‌اوت → ساعتِ پایان) */
  durationSec: number;
  /**
   * Task 96 — رسیدِ امضاشدهٔ داور (۳۰۰۳) برای همین نبرد، فقط وقتی رسیدِ سالم
   * به دست رسید (Task 94). رکوردهای قدیمی‌تر و نبردهایِ سرورِ قدیمی این فیلد
   * را ندارند — نمایشِ «داورگواه» باید زیرمجموعهٔ صادق باشد، نه وضعیتِ دودویی.
   */
  receiptSig?: string;
}

/** سقف دفترچه — جدیدترین‌ها می‌مانند (هم‌سقف goalMetDays سبکِ union) */
export const DUEL_HISTORY_CAP = 15;

const OUTCOMES: readonly DuelOutcome[] = ["win", "loss", "tie"];

const clampInt = (v: unknown, max: number): number => {
  const n = typeof v === "number" && Number.isFinite(v) ? Math.round(v) : 0;
  return Math.min(max, Math.max(0, n));
};

// امضای رسید = hex ۶۴نویسه‌ایِ HMAC-SHA256ِ داور (Task 94). اینجا فقط شکل
// سنجیده می‌شود — درستیِ امضا کارِ سرور است؛ دفترچه فقط حاملِ سند است.
const SIG_RE = /^[0-9a-f]{64}$/;

const sigOk = (v: unknown): string | undefined =>
  typeof v === "string" && SIG_RE.test(v) ? v : undefined;

export const duelDayKey = (d = new Date()): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/**
 * رکورد یک نبرد تمام‌شده را از payload پایان سرور بساز.
 * اگر بازیکنِ خودی بین players نبود null برمی‌گرداند (رکورد ساختنی نیست).
 * `now` و `myFinishAt` (epoch ms) از بیرون می‌آیند تا تابع در تست‌ها قطعی بماند؛
 * myFinishAt=0 یعنی خودم تمام نکرده بودم (فورفیت/تایم‌اوت) → ساعتِ همان لحظه.
 */
export function buildDuelRecord(
  end: {
    reason: DuelEndReason;
    winner: string | null;
    total: number;
    startedAt: number | null;
    players: { sid: string; name: string; color: string; score: number; correct: number; answered: number }[];
  },
  sid: string,
  now: number,
  myFinishAt = 0,
  /** Task 96 — sig رسیدِ داور از EndPayload؛ نامشکل یا غایب → فیلد ثبت نمی‌شود */
  receiptSig?: string | null
): DuelRecord | null {
  const mine = end.players.find((p) => p.sid === sid);
  if (!mine) return null;
  const opp = end.players.find((p) => p.sid !== sid);
  const outcome: DuelOutcome = end.winner === null ? "tie" : end.winner === sid ? "win" : "loss";
  const durationSec =
    end.startedAt && end.startedAt > 0
      ? clampInt((Math.max(myFinishAt > 0 ? myFinishAt : now) - end.startedAt) / 1000, 7200)
      : 0;
  return {
    id: `d${now}`,
    day: duelDayKey(new Date(now)),
    outcome,
    reason: end.reason === "forfeit" ? "forfeit" : "finished",
    opponent: (opp?.name || "").trim().slice(0, 40) || "حریف",
    opponentColor: (opp?.color || "stone").slice(0, 24),
    myScore: clampInt(mine.score, 1_000_000),
    oppScore: clampInt(opp?.score ?? 0, 1_000_000),
    myCorrect: clampInt(mine.correct, 999),
    oppCorrect: clampInt(opp?.correct ?? 0, 999),
    answered: clampInt(mine.answered, 999),
    total: clampInt(end.total, 999),
    durationSec,
    receiptSig: sigOk(receiptSig),
  };
}

/** درج newest-first با حذف تکراریِ هم‌id و سقف DUEL_HISTORY_CAP */
export function pushDuelRecord(records: DuelRecord[], rec: DuelRecord): DuelRecord[] {
  return [rec, ...records.filter((r) => r.id !== rec.id)].slice(0, DUEL_HISTORY_CAP);
}

/** بردِ متوالیِ انتهای دفترچه — از جدیدترین رکورد؛ مساوی/باخت زنجیره را می‌شکند */
export function duelWinStreak(records: DuelRecord[]): number {
  let n = 0;
  for (const r of records) {
    if (r.outcome !== "win") break;
    n++;
  }
  return n;
}

/** بهترین امتیاز شخصی در دفترچه (۰ اگر خالی) */
export function duelBestScore(records: DuelRecord[]): number {
  return records.reduce((m, r) => Math.max(m, r.myScore), 0);
}

/**
 * Task 96 — چند رکوردِ دفترچه رسیدِ داور دارند (زیرمجموعهٔ صادق).
 * الگوی تسک ۹۵: شمارندهٔ زیرمجموعه بهتر از وضعیتِ دودویی است — نیمی‌داورگواه
 * باید نیمی دیده شود.
 */
export function duelVerifiedCount(records: DuelRecord[]): number {
  return records.reduce((n, r) => (r.receiptSig ? n + 1 : n), 0);
}

/** فرم آخرین n نبرد (جدید→قدیم) برای نشان‌های رنگی */
export function duelForm(records: DuelRecord[], n = 5): DuelOutcome[] {
  return records.slice(0, n).map((r) => r.outcome);
}

// ---------------- جست‌وجو و فیلترِ دفترچه (Task 98 — «دفترچهٔ قابلِ کاویدن») ----------------
// دفترچه تا ۱۵ رکورد نگه می‌دارد و رابط فقط ۵ تای آخر را نشان می‌داد؛ بقیه پشتِ
// یک جملهٔ ثابت قفل بود. این قراردادها دفترچه را قابلِ کاویدن می‌کنند: جست‌وجوی
// نامِ حریف + فیلترِ نتیجه + فقطِ داورگواه — همه AND و حفظِ ترتیبِ جدید→قدیم.

export type DuelLedgerOutcomeFilter = DuelOutcome | "all";

export interface DuelLedgerFilter {
  /** زیررشتهٔ نامِ حریف — خالی/فقطِ فاصله یعنی بی‌قید */
  query?: string;
  outcome?: DuelLedgerOutcomeFilter;
  /** فقط رکوردهای دارای رسیدِ امضاشدهٔ داور */
  verifiedOnly?: boolean;
}

/**
 * یکسان‌سازیِ عبارتِ جست‌وجو برای «خواندنِ» نامِ فارسی: فاصله و نیم‌فاصلهٔ
 * (U+200C) کلاً حذف و lowercase می‌شود — «امیر محمد»، «امیرمحمد» و
 * «امیر‌محمد» هر سه یکی می‌شوند. ابهامِ فاصله/نیم‌فاصله دردِ کلاسیکِ متنِ
 * فارسی است و روی دفترچهٔ ۱۵تایی، تطبیقِ بی‌فاصله همیشه کمتر سخت‌گیر است.
 */
export function normalizeDuelQuery(q: string): string {
  return (q ?? "")
    .toLowerCase()
    .replace(/[\u200c\s]+/g, "");
}

/** فیلترِ ترکیبیِ AND با حفظِ ترتیب — فیلترِ خالی همان دفترچه را می‌دهد */
export function filterDuelLedger(records: DuelRecord[], f: DuelLedgerFilter = {}): DuelRecord[] {
  const q = normalizeDuelQuery(f.query ?? "");
  return records.filter((r) => {
    if (f.outcome && f.outcome !== "all" && r.outcome !== f.outcome) return false;
    if (f.verifiedOnly && !r.receiptSig) return false;
    if (q && !normalizeDuelQuery(r.opponent).includes(q)) return false;
    return true;
  });
}

/** خلاصهٔ برد/باخت/مساویِ یک مجموعه (برای خطِ نتیجهٔ فیلتر) */
export function duelLedgerDigest(records: DuelRecord[]): { win: number; loss: number; tie: number } {
  const d = { win: 0, loss: 0, tie: 0 };
  for (const r of records) d[r.outcome]++;
  return d;
}

// ---------------- امتیازِ نبرد — تفکیکِ پایه/سرعت (Task 99) ----------------
// قراردادِ داور (mini-services/challenge-service/scoring.ts): هر پاسخِ درست
// ۱۰۰ امتیازِ پایه + پاداشِ سرعتِ ۰..۱۰۰ (ساعتِ سرور؛ msِ کلاینت خوانده
// نمی‌شود). تفکیکِ سمتِ کلاینت صرفاً «نمایش» است — اعتبارِ نتیجه کارِ
// رسیدِ امضاشدهٔ تسک ۹۴ است؛ scoreِ جعلی این‌جا فقط دروغ‌تر دیده می‌شود.

export const DUEL_BASE_POINTS = 100;

/** امتیازِ یک بازیکن را به پایه (درست×۱۰۰) و پاداشِ سرعت می‌شکند */
export function decomposeDuelScore(score: number, correct: number): { base: number; bonus: number } {
  const c = Number.isFinite(correct) && correct > 0 ? Math.floor(correct) : 0;
  const base = c * DUEL_BASE_POINTS;
  const raw = Number.isFinite(score) ? Math.floor(score) : 0;
  return { base, bonus: Math.max(0, raw - base) };
}

// ---------------- رقیبِ نخست (Task 99 — خانوادهٔ نبردِ نشان‌ها) ----------------
/**
 * بیشترین بردِ مقابلِ یک حریفِ واحد در دفترچه — گروه‌بندی با نامِ نرمال‌شده
 * (بی‌فاصله/بی‌نیم‌فاصله) تا «امیر محمد» و «امیرمحمد» یک رقیب باشند. نامِ
 * نمایشیِ خوداظهار است (SEC-5) — دو «سینا»ی واقعی یکی دیده می‌شوند؛ صادقانه
 * روی همان نمایش. تساویِ شمار: رقیبی که بردِ Nامش تازه‌تر است (پیمایش
 * جدید→قدیم، اولینِ رسیده به سقف می‌ماند) — قطعی و معنادار.
 */
export function duelTopRival(records: DuelRecord[]): { opponent: string; wins: number } | null {
  const winsBy = new Map<string, { opponent: string; wins: number }>();
  let top: { opponent: string; wins: number } | null = null;
  for (const r of records) {
    if (r.outcome !== "win") continue;
    const key = normalizeDuelQuery(r.opponent) || r.opponent.trim();
    const cur = winsBy.get(key);
    if (cur) {
      cur.wins++;
    } else {
      winsBy.set(key, { opponent: r.opponent, wins: 1 });
    }
    const now = winsBy.get(key)!;
    if (!top || now.wins > top.wins) top = now;
  }
  return top;
}

// ---------------- آمارِ سرعتِ دفترچه (Task 100 — هفتمین خانوادهٔ نشان: «سرعت») ----------------
// قراردادِ داور (Task 99): امتیاز = درست×۱۰۰ + پاداشِ سرعتِ ۰..۱۰۰ بر پاسخ.
// پس پاداشِ سرعتِ هر نبرد از همان decomposeDuelScore درمی‌آید — صفر ورودیِ
// تازه، صفر ری‌استارتِ داور. میانگینِ پاداش بر «پاسخِ درست» معنادار است:
// رکوردِ بی‌درست (myCorrect=0) هیچ اطلاعاتِ سرعتی ندارد و کلاً کنار گذاشته
// می‌شود — نه اینکه امتیازِ دروغینش واردِ میانگین شود.
// سقفِ قراردادی: پاداشِ هر نبرد ≤ درست×۱۰۰ (هر پاسخ حداکثر ۱۰۰) — امتیازِ
// جعلیِ فراتر از سقف فقط تا همین سقف حساب می‌شود؛ دروغ‌تر دیده نمی‌شود.

export function duelSpeedStats(records: DuelRecord[]): {
  totalBonus: number;
  totalCorrect: number;
  /** میانگینِ پاداشِ سرعت بر پاسخِ درست (۰..۱۰۰) — دفترچهٔ بی‌درست → ۰ نه NaN */
  avgBonus: number;
} {
  let totalBonus = 0;
  let totalCorrect = 0;
  for (const r of records) {
    const c = Number.isFinite(r.myCorrect) ? Math.floor(r.myCorrect) : 0;
    if (c <= 0) continue; // پاسخِ درستی در کار نیست — سرعتی برای سنجش نیست
    const { bonus } = decomposeDuelScore(r.myScore, c);
    totalBonus += Math.min(bonus, c * DUEL_BASE_POINTS);
    totalCorrect += c;
  }
  return { totalBonus, totalCorrect, avgBonus: totalCorrect > 0 ? totalBonus / totalCorrect : 0 };
}

// ---------------- مرتب‌سازیِ دفترچه (Task 100 — «دفترچهٔ مرتب») ----------------
// دفترچه همیشه جدید→قدیم ذخیره می‌شود (id حامل epoch ms است)؛ اما «کاویدنِ»
// کامل (Task 98) مرتب‌سازی را هم می‌خواهد: «سنگین‌ترین بردم کدام بود؟» یا
// «بهترین امتیازم توی دفترچه کجاست؟». سه کلید: جدیدترین (پیش‌فرض)، بیشترین
// امتیازِ خودی، بیشترین اختلافِ امتیاز (myScore−oppScore — هم بردهای سنگین
// را می‌آورد بالا هم باخت‌های سنگین را می‌فرستد پایین؛ یک طیفِ صادق است).

export type DuelLedgerSortKey = "newest" | "myScore" | "margin";

/** ترتیبِ ثبت‌شدهٔ کلیدها — UI همین را رندر می‌کند */
export const DUEL_LEDGER_SORTS: readonly DuelLedgerSortKey[] = ["newest", "myScore", "margin"];

/**
 * مرتب‌سازیِ قطعی: تساویِ امتیاز/اختلاف با idِ نزولی می‌شکند (تازه‌تر اول).
 * "newest" هم آگاهانه بر اساس id نزول می‌کند — دفترچه‌ای که از ورودیِ نامطمئن
 * آمده (sanitize/merge) ممکن است ترتیبِ خامش درهم باشد؛ تکیه بر قراردادِ id
 * همیشه درست‌تر از تکیه بر ترتیبِ آرایه است.
 */
export function sortDuelLedger(records: DuelRecord[], key: DuelLedgerSortKey = "newest"): DuelRecord[] {
  const byIdDesc = (a: DuelRecord, b: DuelRecord) => (a.id < b.id ? 1 : a.id > b.id ? -1 : 0);
  const arr = [...records];
  if (key === "myScore") arr.sort((a, b) => b.myScore - a.myScore || byIdDesc(a, b));
  else if (key === "margin")
    arr.sort((a, b) => b.myScore - b.oppScore - (a.myScore - a.oppScore) || byIdDesc(a, b));
  else arr.sort(byIdDesc);
  return arr;
}

// ---------------- کارنامهٔ دفترچه (Task 101 — عکسِ قابلِ هم‌رسانی) ----------------
// تجمیعِ صادقِ کل دفترچه در یک شیء برای کارتِ PNG: هیچ عددِ تازه‌ای محاسبه
// نمی‌شود — هر فیلد همان قراردادِ قبلی است (digest/streak/best/topRival/
// verified) که یک‌جا جمع شده تا کانواس و آینده‌ها (گزارشِ هفتگی؟) رقم‌های
// همسان داشته باشند. winRate با همان percentِ دامنه (گاردِ صفر و سقفِ ۱۰۰).
// totalPoints از myScoreهای نامعین می‌گذرد (دفاعِ همان‌خطی — رکوردِ سالمِ
// store همیشه محدود است؛ ورودیِ خامِ خراب حقِ واردشدن به مجموع را ندارد).

export interface DuelLedgerStats {
  total: number;
  win: number;
  loss: number;
  tie: number;
  /** درصدِ برد ۰..۱۰۰ — دفترچهٔ خالی → ۰ (percentِ دامنه) */
  winRate: number;
  /** بهترین امتیازِ شخصی (duelBestScore) */
  best: number;
  /** بردِ متوالیِ انتهای دفترچه (duelWinStreak) */
  streak: number;
  /** مجموعِ امتیازهای شخصیِ ثبت‌شده — myScoreِ نامعین حساب نمی‌شود */
  totalPoints: number;
  /** رقیبِ همیشگی (duelTopRival) — null در دفترچهٔ بی‌برد */
  topRival: { opponent: string; wins: number } | null;
  /** چند نبرد رسیدِ امضاشدهٔ داور دارند (duelVerifiedCount — زیرمجموعهٔ صادق) */
  verified: number;
}

export function duelLedgerStats(records: DuelRecord[]): DuelLedgerStats {
  const d = duelLedgerDigest(records);
  return {
    total: records.length,
    win: d.win,
    loss: d.loss,
    tie: d.tie,
    winRate: percent(d.win, records.length),
    best: duelBestScore(records),
    streak: duelWinStreak(records),
    totalPoints: records.reduce((n, r) => n + (Number.isFinite(r.myScore) ? r.myScore : 0), 0),
    topRival: duelTopRival(records),
    verified: duelVerifiedCount(records),
  };
}

// ---------------- پایداری (sanitize/merge برای جدول SyncField) ----------------

const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;

/** اعتبارسنجی یک رکورد نامطمئن — رکورد خراب کلاً می‌افتد، نه اینکه نصفه بماند */
export function sanitizeDuelRecord(v: unknown): DuelRecord | null {
  if (!v || typeof v !== "object" || Array.isArray(v)) return null;
  const r = v as Record<string, unknown>;
  const id = typeof r.id === "string" && r.id.length > 0 && r.id.length <= 40 ? r.id : null;
  const day = typeof r.day === "string" && DAY_RE.test(r.day) ? r.day : null;
  const outcome = OUTCOMES.includes(r.outcome as DuelOutcome) ? (r.outcome as DuelOutcome) : null;
  if (!id || !day || !outcome) return null;
  const reason: DuelEndReason = r.reason === "forfeit" ? "forfeit" : "finished";
  const opponent = typeof r.opponent === "string" ? r.opponent.trim().slice(0, 40) : "";
  const opponentColor = typeof r.opponentColor === "string" ? r.opponentColor.slice(0, 24) : "stone";
  return {
    id,
    day,
    outcome,
    reason,
    opponent: opponent || "حریف",
    opponentColor: opponentColor || "stone",
    myScore: clampInt(r.myScore, 1_000_000),
    oppScore: clampInt(r.oppScore, 1_000_000),
    myCorrect: clampInt(r.myCorrect, 999),
    oppCorrect: clampInt(r.oppCorrect, 999),
    answered: clampInt(r.answered, 999),
    total: clampInt(r.total, 999),
    durationSec: clampInt(r.durationSec, 7200),
    // Task 96 — sig خراب/جعلی می‌افتد؛ رکوردِ بدونِ sig (قدیمی) سرِ پا می‌ماند
    receiptSig: sigOk(r.receiptSig),
  };
}

/** آرایهٔ دفترچه از ورودی نامطمئن: فقط رکوردهای سالم، بدون تکرارِ id، با سقف */
export function sanitizeDuelHistory(v: unknown): DuelRecord[] {
  if (!Array.isArray(v)) return [];
  const out: DuelRecord[] = [];
  const seen = new Set<string>();
  for (const item of v) {
    const rec = sanitizeDuelRecord(item);
    if (!rec || seen.has(rec.id)) continue;
    seen.add(rec.id);
    out.push(rec);
    if (out.length >= DUEL_HISTORY_CAP) break;
  }
  return out;
}

/**
 * merge ابری: اتحاد بر اساس id (دفترچهٔ لاگ است، نه شمارنده — هر دو دستگاه ارزش
 * دارند)، مرتب بر اساس id نزولی (id حامل epoch ms است) و سقف‌خورده.
 * هر دو طرف optional هستند (فیلد در snapshotهای قدیمی غایب است).
 */
export function mergeDuelHistory(
  l: DuelRecord[] | undefined,
  r: DuelRecord[] | undefined
): DuelRecord[] {
  const map = new Map<string, DuelRecord>();
  for (const rec of [...(l ?? []), ...(r ?? [])]) {
    const prev = map.get(rec.id);
    if (!prev) {
      map.set(rec.id, rec);
      continue;
    }
    // Task 96 — هم‌id: رکوردِ رسیددار کامل‌تر است (رسید فقط روی دستگاهی که
    // بعد از تسک ۹۴ persist کرده می‌نشیند)؛ ارتقا بیدردسر، هرگز تنزل نه.
    if (!prev.receiptSig && rec.receiptSig) map.set(rec.id, rec);
  }
  return [...map.values()].sort((a, b) => (a.id < b.id ? 1 : -1)).slice(0, DUEL_HISTORY_CAP);
}
