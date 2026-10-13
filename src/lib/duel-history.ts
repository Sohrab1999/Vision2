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
// ------------------------------------------------------------------

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
