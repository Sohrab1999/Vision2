// ------------------------------------------------------------------
// Vision 2 — «بلیتِ ورود» (Task 112، SEC-5 — آخرین دهانهٔ بازِ این بند)
//
// چرا؟ تا امروز duel:create / duel:join فقط پشتِ گلوگاهِ نرخ (تسک ۹۷)
// بودند؛ هر سوکتی — مرورگر یا نه — می‌توانست تا سقفِ بودجهٔ IP اتاق
// بسازد/بکاود و cors هم "*" بود. حالا ورود به اتاق به بلیتی گره می‌خورد
// که فقط Next (با شناسهٔ ثبت‌شدهٔ یادگیرنده: userId+secret) ضرب می‌کند؛
// داورِ ۳۰۰۳ امضای HMAC، پنجرهٔ زمان و یک‌بارمصرف بودنِ nonce را
// بازبینی می‌کند. سوکتِ بی‌بلیت حتی به شمارندهٔ گلوگاه نمی‌رسد.
//
// قراردادها (هم‌خانوادهٔ duel-receipt.ts و join-throttle.ts):
//   • این فایل خالص است — بدون هیچ import؛ نیمهٔ crypto در
//     duel-ticket-server.ts و مصرف‌کننده‌ها: روتِ API (ضربِ بلیت) و
//     سرویس داوری (بازبینی). کلاینتِ مرورگر هرگز راز را نمی‌بیند —
//     فقط رشتهٔ بلیت را از /api/duel-ticket می‌گیرد.
//   • توکن: base64url(JSON payload) + "." + hmac_hex(canonical)
//   • یک‌بارمصرف: گنبدِ nonce (createTicketVault) در حافظهٔ داور؛
//     مصرفِ موفق nonce را ثبت می‌کند و دومین مصرف همان را رد می‌کند.
//   • گنبد در سرِ ظرفیت fail-closed است (تا sweep جا نشود) — سیلابِ
//     بلیتِ معتبر هم عملاً ناممکن است: ضربِ بلیت احراز + لیمیت ۳۰/دقیقه دارد.
// ------------------------------------------------------------------

export type TicketRejectReason = "malformed" | "bad_sig" | "expired" | "replayed";

export interface TicketPayload {
  /** شناسهٔ یادگیرندهٔ احرازشده — از روتِ API می‌آید، نه ادعای کلاینت */
  uid: string;
  /** انقضا (ms epoch) — TTL کوتاه: بلیت برای «همین لحظهٔ ورود» است */
  exp: number;
  /** nonce یک‌بارمصرف (۱۲ نویسهٔ hex) */
  n: string;
}

export type TicketVerdict =
  | { ok: true; uid: string; n: string }
  | { ok: false; reason: TicketRejectReason };

/** عمرِ بلیت: ۱۲۰ ثانیه — برای گرفتنِ بلیت و زدنِ create/join کافی است */
export const TICKET_TTL_MS = 120_000;

/** قالبِ nonce: ۱۲ نویسهٔ hex (۶ بایت تصادفی) */
export const TICKET_NONCE_RE = /^[0-9a-f]{12}$/;

/** فرمِ کانونیک — ورودیِ امضا؛ جداکنندهٔ | مثل رسیدِ داوری */
export function canonicalTicketString(t: TicketPayload): string {
  return `t1|${t.uid}|${t.exp}|${t.n}`;
}

/** گاردِ ساختاریِ payload — هر ورودیِ خراب/ساختگی اینجا می‌میرد */
export function ticketIsShaped(x: unknown): x is TicketPayload {
  if (typeof x !== "object" || x === null) return false;
  const t = x as Record<string, unknown>;
  return (
    typeof t.uid === "string" &&
    t.uid.length > 0 &&
    t.uid.length <= 64 &&
    typeof t.exp === "number" &&
    Number.isInteger(t.exp) &&
    t.exp > 0 &&
    typeof t.n === "string" &&
    TICKET_NONCE_RE.test(t.n)
  );
}

/** پیامِ ردِ فارسیِ هم‌خانوادهٔ خطاهای دیگرِ داور؛ منقضی پیامِ صادقِ خودش را دارد */
export function ticketRejectMessage(reason: TicketRejectReason): string {
  if (reason === "expired") return "بلیتِ ورود منقضی شده؛ دوباره تلاش کن.";
  return "بلیتِ ورود معتبر نیست؛ صفحه را تازه‌سازی کن.";
}

// ----------------------------- گنبدِ nonce -----------------------------

export interface TicketVault {
  /** true = اولین مصرف (ثبت شد)؛ false = تکراری در پنجرهٔ TTL */
  consume(n: string, at?: number): boolean;
  /** nonceهای مُرده را جمع می‌کند؛ شمارِ حذف‌شده برمی‌گرداند */
  sweep(at?: number): number;
  /** برای تست و پایش */
  size(): number;
}

export interface TicketVaultOptions {
  now?: () => number;
  /** پیش‌فرض TTLِ بلیت — سکونتِ nonce نباید از عمرِ بلیت بیشتر باشد */
  ttlMs?: number;
  /**
   * سقفِ ضبط: بعد از آن fail-closed (مصرف رد می‌شود) تا سیلاب، حافظه را
   * بی‌سقف نکند. با سقفِ ضربِ بلیت (۳۰/دقیقه/IP) پرکردنِ ۱۰۲۴ جای گنبد
   * یعنی ۱۰۲۴ ضربِ احرازشده — عملاً فقط خودمان.
   */
  cap?: number;
}

const VAULT_CAP_DEFAULT = 1024;

export function createTicketVault(opts: TicketVaultOptions = {}): TicketVault {
  const ttl = opts.ttlMs ?? TICKET_TTL_MS;
  const cap = opts.cap ?? VAULT_CAP_DEFAULT;
  const now = opts.now ?? (() => Date.now());
  /** nonce → زمانِ مصرف */
  const seen = new Map<string, number>();

  function consume(n: string, at?: number): boolean {
    const t = at ?? now();
    // پیرایشِ حینِ مصرف: nonceهای مُرده همین‌جا آزاد می‌شوند
    if (seen.size >= cap) {
      for (const [k, usedAt] of seen) {
        if (usedAt <= t - ttl) seen.delete(k);
      }
      if (seen.size >= cap) return false; // fail-closed — گنبد لبریز
    }
    if (seen.has(n)) return false;
    seen.set(n, t);
    return true;
  }

  function sweep(at?: number): number {
    const t = at ?? now();
    let removed = 0;
    for (const [k, usedAt] of seen) {
      if (usedAt <= t - ttl) {
        seen.delete(k);
        removed++;
      }
    }
    return removed;
  }

  return { consume, sweep, size: () => seen.size };
}
