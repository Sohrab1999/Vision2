// ------------------------------------------------------------------
// Vision 2 — «گلوگاهِ ورود به اتاق» (Task 97، SEC-5)
// محدودسازِ نرخِ ورود برای رویدادهای duel:create / duel:join سرویسِ داوری.
//
// چرا؟ duel:join هیچ سقفی نداشت — یک سوکت می‌توانست کدِ ۵نویسه‌ای اتاق‌ها
// (۳۱^۵ ≈ ۲۸ میلیون ترکیب) را در ثانیه‌ها بکاود؛ duel:create هم می‌توانست
// جدولِ اتاق‌ها را سیلاب کند. مسیرهای API از گام ۵ (withApi) لیمیتِ 429
// دارند ولی سوکت بیرونِ آن لایه است — این ماژول همان نقش را در داور بازی می‌کند.
//
// قراردادها:
//   • خالص و بدونِ import — مثل duel-receipt.ts، تست‌پذیر با nowِ تزریقی.
//   • پنجرهٔ لغزانِ «تمامِ تلاش‌ها» نه فقط قبول‌شده‌ها — کوبیدنِ مداوم قفل
//     می‌ماند تا پنجره واقعاً پیر شود (ضدِ برت‌فورس).
//   • بودجهٔ ضبطِ هر سطل محدود است (CAP) تا سیلاب، حافظه را بی‌سقف نکند؛
//     بعد از CAP رد می‌شود بدونِ ضبط — retryAfter همچنان از قدیمی‌ترین ضبط
//     بیرون می‌آید و صادق می‌ماند.
//   • IP از X-Real-IPِ Caddy خوانده می‌شود (هدر را خودِ گیت‌وی می‌نویسد و
//     بازنویسی — جعل از بیرون بی‌اثر؛ اتصالِ مستقیم فقط loopback است یعنی
//     فرایندهای محلیِ موردِ اعتماد: سرویس‌ها و اسکریپت‌های QA).
// ------------------------------------------------------------------

export type EntryKind = "create" | "join";

export interface ThrottleAttempt {
  ok: boolean;
  /** وقتی ok=false: چقدر دیگر ظرفیت آزاد می‌شود (برای پیامِ صادقِ ثانیه‌ای) */
  retryAfterMs: number;
}

export interface LimitInfo {
  ip: string;
  kind: EntryKind;
  hits: number;
}

export interface JoinThrottle {
  attempt(ip: string, kind: EntryKind, at?: number): ThrottleAttempt;
  /** سطل‌های پیرِ بی‌تلاشِ درون‌پنجره را جمع می‌کند؛ شمارِ حذف‌شده برمی‌گرداند */
  sweep(now?: number): number;
}

export interface JoinThrottleOptions {
  /** طول پنجرهٔ لغزان — پیش‌فرض ۶۰ ثانیه */
  windowMs?: number;
  /** سقفِ ساختِ اتاق در پنجره — پیش‌فرض ۱۲ */
  limitCreate?: number;
  /** سقفِ پیوستن در پنجره — پیش‌فرض ۲۰ (کلاسِ پشتِ NAT مشترک جا شود) */
  limitJoin?: number;
  now?: () => number;
  /** فقط نخستین ردِ هر سطل در هر پنجره صدا می‌شود — گزارشِ امن بدونِ سیلابِ لاگ */
  onLimit?: (info: LimitInfo) => void;
}

interface Bucket {
  hits: number[];
  warned: boolean;
}

// سقفِ ضبط: حدِ بیشتر از بیشینهٔ limitها؛ سیلاب بعد از این فقط رد می‌شود
const HIT_CAP = 64;
const WINDOW_DEFAULT = 60_000;
const LIMIT_CREATE_DEFAULT = 12;
const LIMIT_JOIN_DEFAULT = 20;

/** ۱۲ → «۱۲» — برای پیامِ فارسیِ ثانیهٔ انتظار */
function faNum(n: number): string {
  return String(n).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);
}

/** پیامِ ردِ فارسیِ هم‌خانوادهٔ خطاهای دیگرِ داور («اتاقی با این کد پیدا نشد.») */
export function entryThrottleError(kind: EntryKind, retryAfterMs: number): string {
  const s = Math.max(1, Math.ceil(retryAfterMs / 1000));
  return kind === "create"
    ? `ساختِ اتاقِ بیش‌ازحد؛ ${faNum(s)} ثانیهٔ دیگر دوباره تلاش کن.`
    : `تلاشِ پیاپی برای پیوستن؛ ${faNum(s)} ثانیهٔ دیگر دوباره تلاش کن.`;
}

/**
 * IPِ واقعیِ کلاینت را از دست‌دادنِ سوکت بیرون می‌کشد:
 * X-Real-IP (نوشتهٔ Caddy، معتبر) → نخستین هاپِ X-Forwarded-For →
 * addressِ سوکت با پیرایشِ ::ffff: (اتصالِ مستقیمِ loopback) → «local».
 */
export function clientIpOf(h: { headers?: Record<string, unknown>; address?: string }): string {
  const val = (key: string): string => {
    const v = h.headers?.[key];
    if (typeof v === "string") return v;
    if (Array.isArray(v) && typeof v[0] === "string") return v[0];
    return "";
  };
  const real = val("x-real-ip").trim();
  if (real) return real;
  const fwd = val("x-forwarded-for")
    .split(",")[0]
    .trim();
  if (fwd) return fwd;
  const addr = (h.address ?? "").trim().replace(/^::ffff:/, "");
  return addr || "local";
}

export function createJoinThrottle(opts: JoinThrottleOptions = {}): JoinThrottle {
  const windowMs = opts.windowMs ?? WINDOW_DEFAULT;
  const limitCreate = opts.limitCreate ?? LIMIT_CREATE_DEFAULT;
  const limitJoin = opts.limitJoin ?? LIMIT_JOIN_DEFAULT;
  const now = opts.now ?? (() => Date.now());
  const onLimit = opts.onLimit;

  const buckets = new Map<string, Bucket>();
  const limitOf = (kind: EntryKind) => (kind === "create" ? limitCreate : limitJoin);

  function attempt(ip: string, kind: EntryKind, at?: number): ThrottleAttempt {
    const t = at ?? now();
    const limit = limitOf(kind);
    const key = `${kind}\u0000${ip}`;
    let b = buckets.get(key);
    if (!b) {
      b = { hits: [], warned: false };
      buckets.set(key, b);
    }
    // پیرایش: فقط تلاش‌های درونِ پنجره می‌شمارند؛ سطلِ خالی‌شده هشدارش نو می‌شود
    while (b.hits.length > 0 && b.hits[0] <= t - windowMs) b.hits.shift();
    if (b.hits.length === 0) b.warned = false;

    if (b.hits.length >= limit) {
      // ظرفیت پُر: قدیمی‌ترین ضبطِ درون‌پنجره می‌گوید کِی آزاد می‌شود
      const retryAfterMs = Math.max(0, b.hits[0] + windowMs - t);
      if (!b.warned) {
        b.warned = true;
        onLimit?.({ ip, kind, hits: b.hits.length });
      }
      return { ok: false, retryAfterMs };
    }
    if (b.hits.length < HIT_CAP) b.hits.push(t);
    return { ok: true, retryAfterMs: 0 };
  }

  function sweep(nowAt?: number): number {
    const t = nowAt ?? now();
    let removed = 0;
    for (const [key, b] of buckets) {
      if (b.hits.length === 0 || b.hits[b.hits.length - 1] <= t - windowMs) {
        buckets.delete(key);
        removed++;
      }
    }
    return removed;
  }

  return { attempt, sweep };
}
