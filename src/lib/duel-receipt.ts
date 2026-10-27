// ------------------------------------------------------------------
// رسیدِ امضاشدهٔ داوری «نبرد دودنفره» (Task 94) — هستهٔ خالص.
//
// تا امروز نتیجهٔ نبرد «خوداظهاریِ امضاشده» بود: هر کلاینت هر نتیجه‌ای
// می‌توانست ادعا کند و فقط هویتِ امضاکننده معتبر بود (Task 35). داورِ واقعی
// سرویس ۳۰۰۳ است که درستیِ هر پاسخ و امتیاز سرعت را خودش حساب می‌کند —
// اما امضایش را هرگز نمی‌فرستاد. این ماژول قرارداد رسید را تعریف می‌کند:
//   • سرور ۳۰۰۳ در پایان مسابقه یک receipt می‌سازد و با HMAC-SHA256 امضا
//     می‌کند (duel-receipt-server.ts) و در duel:end می‌فرستد.
//   • کلاینت همان رسید را کنار نتیجه به /api/stats می‌فرستد.
//   • API امضا را با راز مشترک بازبینی می‌کند و هم‌خوانیِ نتیجهٔ اعلامی
//     (نام/امتیاز/تعداد درست/outcome) با بازیکنِ داخل رسید را ثابت می‌کند.
//
// این فایل «خالص» است و هیچ importی ندارد — کلاینت فقط تایپ‌ها و سازندهٔ
// کانونی‌کال را مصرف می‌کند (امضا و راز در ماژول سرور جفت است).
// ------------------------------------------------------------------

export type DuelEndReason = "finished" | "forfeit";

/** یک بازیکنِ داخل رسید — همان خلاصه‌ای که داور در پایان مسابقه دارد */
export interface DuelReceiptPlayer {
  sid: string;
  name: string;
  score: number;
  correct: number;
}

/** رسیدِ امضاشده — دقیقاً همان شکلی که در duel:end می‌آید و به /api/stats می‌رود */
export interface DuelReceipt {
  v: 1;
  /** کد اتاق — شناسهٔ مسابقه نزد داور */
  code: string;
  startedAt: number;
  endedAt: number;
  reason: DuelEndReason;
  /** sid برنده؛ null = مساوی */
  winner: string | null;
  players: DuelReceiptPlayer[];
  /** HMAC-SHA256 hex روی canonicalReceiptString همین ساختار */
  sig: string;
}

/** آنچه کلاینت هنگام ثبت نتیجه دربارهٔ خودش ادعا می‌کند */
export interface DuelSubmissionProbe {
  /** نام نمایشیِ همان‌که در اتاق بود (mirror of service readProfile) */
  name: string;
  score: number;
  correct: number;
  outcome: "win" | "loss" | "tie" | null;
}

export type DuelReceiptVerdict =
  | { ok: true }
  | {
      ok: false;
      reason: "malformed" | "bad_sig" | "stale" | "no_candidate" | "outcome_mismatch" | "replayed";
    };

/**
 * رشتهٔ کانونیِ امضا — تنها ورودی HMAC. از ساختارِ دریافت‌شده بازسازی می‌شود
 * (هرگز parse نمی‌شود) پس تزریق نویسه در نام فقط امضا را می‌شکند، نه دور می‌زند.
 */
export function canonicalReceiptString(r: DuelReceipt): string {
  const players = r.players
    .map((p) => `${p.sid}|${p.name}|${p.score}|${p.correct}`)
    .join("|");
  return `v1|${r.code}|${r.startedAt}|${r.endedAt}|${r.reason}|${r.winner ?? "-"}|${players}`;
}

/**
 * نام نمایشی در اتاق — پاریتیِ دقیق با readProfile سرویس ۳۰۰۳
 * (trim + slice(24) + فالبک). کلاینت باید «همان نامی» را ادعا کند که داور
 * در رسید ثبت کرده وگرنه candidate پیدا نمی‌شود.
 */
export function duelDisplayName(raw: string): string {
  const name = typeof raw === "string" ? raw.trim().slice(0, 24) : "";
  return name || "یادگیرنده";
}

const HEX64 = /^[0-9a-f]{64}$/;

/** پیش‌ازمانیِ ساختاری — قبل از هر HMAC تا canonical روی دادهٔ سالم ساخته شود */
export function receiptIsShaped(r: unknown): r is DuelReceipt {
  if (!r || typeof r !== "object" || Array.isArray(r)) return false;
  const x = r as Record<string, unknown>;
  if (x.v !== 1) return false;
  if (typeof x.code !== "string" || x.code.length < 4 || x.code.length > 8) return false;
  if (typeof x.startedAt !== "number" || !Number.isInteger(x.startedAt) || x.startedAt < 0) return false;
  if (typeof x.endedAt !== "number" || !Number.isInteger(x.endedAt) || x.endedAt < 0) return false;
  if (x.reason !== "finished" && x.reason !== "forfeit") return false;
  if (x.winner !== null && (typeof x.winner !== "string" || x.winner.length === 0 || x.winner.length > 64)) return false;
  if (!Array.isArray(x.players) || x.players.length !== 2) return false;
  for (const p of x.players) {
    if (!p || typeof p !== "object") return false;
    const q = p as Record<string, unknown>;
    if (typeof q.sid !== "string" || q.sid.length === 0 || q.sid.length > 64) return false;
    if (typeof q.name !== "string" || q.name.length === 0 || q.name.length > 40) return false;
    if (typeof q.score !== "number" || !Number.isInteger(q.score) || q.score < 0 || q.score > 1_000_000) return false;
    if (typeof q.correct !== "number" || !Number.isInteger(q.correct) || q.correct < 0 || q.correct > 999) return false;
  }
  if (typeof x.sig !== "string" || !HEX64.test(x.sig)) return false;
  return true;
}

/**
 * بازبینی کامل یک ادعای نتیجه در برابر رسیدِ امضاشده.
 * `sigOk` را صداکنندهٔ سرور تأمین می‌کند (HMAC در ماژول سرور) — اینجا فقط
 * قراردادهای خالص: ساختار، پنجرهٔ زمانی، candidate و هم‌خوانیِ outcome.
 */
export function judgeReceiptShape(
  receipt: DuelReceipt,
  probe: DuelSubmissionProbe,
  sigOk: boolean,
  opts?: { now?: number; maxAgeMs?: number }
): DuelReceiptVerdict {
  if (!receiptIsShaped(receipt)) return { ok: false, reason: "malformed" };
  if (!sigOk) return { ok: false, reason: "bad_sig" };

  // پنجرهٔ زمانی: رسیدِ آینده یا کهنه‌تر از سقف پذیرفته نمی‌شود — ضد پخشِ
  // مجددِ رسیدهای باستانی (ضدتکرارِ قطعی در DB سمتِ روت انجام می‌شود).
  const now = opts?.now ?? Date.now();
  const maxAge = opts?.maxAgeMs ?? 24 * 60 * 60 * 1000;
  if (receipt.endedAt > now + 2 * 60 * 1000 || now - receipt.endedAt > maxAge) {
    return { ok: false, reason: "stale" };
  }

  // candidate: بازیکنِ رسیدی که «نام + امتیاز + تعداد درست»‌اش با ادعا یکی است.
  // هم‌نام‌بودن دو بازیکن با نمرهٔ برابر فقط در مساویِ کامل ممکن است (در آن
  // حالت winner=null است) — پس ادعای win/loss در آن حالت پایین می‌سوزد.
  const candidates = receipt.players.filter(
    (p) => p.name === probe.name && p.score === probe.score && p.correct === probe.correct
  );
  if (candidates.length === 0) return { ok: false, reason: "no_candidate" };

  if (probe.outcome === "tie") {
    return receipt.winner === null ? { ok: true } : { ok: false, reason: "outcome_mismatch" };
  }
  if (probe.outcome === "win") {
    return receipt.winner !== null && candidates.some((p) => p.sid === receipt.winner)
      ? { ok: true }
      : { ok: false, reason: "outcome_mismatch" };
  }
  if (probe.outcome === "loss") {
    return receipt.winner !== null && candidates.every((p) => p.sid !== receipt.winner)
      ? { ok: true }
      : { ok: false, reason: "outcome_mismatch" };
  }
  return { ok: false, reason: "outcome_mismatch" };
}

/**
 * Task 131 «نامِ نمایشیِ نبرد» — الگویِ نهاییِ نام از دو ورودی:
 * پیش‌نویسِ فیلدِ لابی (اگر واقعی باشد) بر نامِ پروفایل مقدم است؛
 * هر دو از trim/slice(24)/فالبکِ duelDisplayName میگذرند (پاریتیِ
 * readProfile سرویس ۳۰۰۳). ورودیِ غیرِ رشته هرگز throw نمیکند.
 */
export function resolveDuelName(draft: unknown, profile: unknown): string {
  const d = typeof draft === "string" ? draft.trim() : "";
  const p = typeof profile === "string" ? profile.trim() : "";
  return duelDisplayName(d || p);
}
