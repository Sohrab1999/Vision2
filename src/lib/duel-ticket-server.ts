// ------------------------------------------------------------------
// بلیتِ ورود — نیمهٔ سرور (Task 112).
//
// مصرف‌کنندگان: روتِ /api/duel-ticket (ضربِ بلیت برای یادگیرندهٔ
// احرازشده) و سرویس داوری ۳۰۰۳ (بازبینی). کلاینتِ مرورگر هرگز این
// فایل را import نمی‌کند (راز + node:crypto) — فقط رشتهٔ بلیت را
// از روت می‌گیرد و داخل duel:create/duel:join می‌فرستد.
//
// رازِ بلیت: فایل ۰۶۰۰ کنار سرویس داوری — همان الگوی رازِ رسید
// (تسک ۹۴): بار اول ساخت (randomBytes ۳۲)، بعد خواندن. داور هنگام
// بوت می‌سازد/می‌خواند؛ Next فقط می‌خواند (غایب → سرویس آماده نیست).
// ------------------------------------------------------------------

import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import {
  TICKET_TTL_MS,
  canonicalTicketString,
  ticketIsShaped,
  type TicketPayload,
  type TicketVerdict,
} from "./duel-ticket";

export type { TicketVerdict };

const SECRET_RELATIVE = join("mini-services", "challenge-service", ".ticket-secret");

/** مسیر راز از ریشهٔ پروژه (cwd سرویس و next هر دو ریشهٔ پروژه است) */
export function ticketSecretPath(cwd = process.cwd()): string {
  return join(cwd, SECRET_RELATIVE);
}

/** خواندنِ فقط-خواندنی برای سمت Next؛ غایب → null (داور هنوز راه نیفتاده) */
export function readTicketSecret(cwd = process.cwd()): string | null {
  const path = ticketSecretPath(cwd);
  try {
    const raw = readFileSync(path, "utf8").trim();
    return /^[0-9a-f]{64}$/.test(raw) ? raw : null;
  } catch {
    return null;
  }
}

/** خواندن یا ساخت — فقط سمت داور (۳۰۰۳) هنگام بوت */
export function loadOrCreateTicketSecret(cwd = process.cwd()): string {
  const path = ticketSecretPath(cwd);
  const existing = readTicketSecret(cwd);
  if (existing) return existing;
  const secret = randomBytes(32).toString("hex");
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, secret + "\n", { mode: 0o600 });
  return secret;
}

function hmacTicketHex(canonical: string, secret: string): string {
  return createHmac("sha256", secret).update(canonical, "utf8").digest("hex");
}

/** base64urlِ بدونِ padding — فرمِ سیمیِ payload */
function b64urlEncode(s: string): string {
  return Buffer.from(s, "utf8").toString("base64url");
}

function b64urlDecode(s: string): string | null {
  try {
    const raw = Buffer.from(s, "base64url").toString("utf8");
    // base64urlِ خراب بی‌صدا می‌پذیرد — با گاردِ ساختارِ بعدی می‌میرد
    return raw.length > 0 ? raw : null;
  } catch {
    return null;
  }
}

export interface MintedTicket {
  /** رشتهٔ سیمی: base64url(payload).sig */
  token: string;
  ttlMs: number;
}

/** ضربِ بلیت — فقط سمت Next با شناسهٔ احرازشده */
export function mintTicket(uid: string, secret: string, now = Date.now()): MintedTicket {
  const payload: TicketPayload = {
    uid,
    exp: now + TICKET_TTL_MS,
    n: randomBytes(6).toString("hex"),
  };
  const token = `${b64urlEncode(JSON.stringify(payload))}.${hmacTicketHex(canonicalTicketString(payload), secret)}`;
  return { token, ttlMs: TICKET_TTL_MS };
}

/**
 * بازبینی کامل سمت داور: رمزگشایی → ساختار → امضا → پنجره.
 * یک‌بارمصرفِ nonce اینجا نیست — داور با گنبدِ خودش (consume) بعد از
 * ok بودنِ همین تابع انجام می‌دهد تا امضای خراب nonceِ کسی را نسوزاند.
 */
export function verifyTicket(token: unknown, secret: string | null, opts?: { now?: number }): TicketVerdict {
  if (typeof token !== "string" || token.length === 0 || token.length > 512) {
    return { ok: false, reason: "malformed" };
  }
  if (!secret) return { ok: false, reason: "bad_sig" };
  const dot = token.indexOf(".");
  if (dot <= 0 || dot === token.length - 1) return { ok: false, reason: "malformed" };
  let payload: unknown;
  try {
    payload = JSON.parse(b64urlDecode(token.slice(0, dot)) ?? "");
  } catch {
    return { ok: false, reason: "malformed" };
  }
  if (!ticketIsShaped(payload)) return { ok: false, reason: "malformed" };
  const t = payload as TicketPayload;
  const expected = Buffer.from(hmacTicketHex(canonicalTicketString(t), secret), "hex");
  const got = Buffer.from(token.slice(dot + 1), "hex");
  if (expected.length !== got.length || !timingSafeEqual(expected, got)) {
    return { ok: false, reason: "bad_sig" };
  }
  const now = opts?.now ?? Date.now();
  if (t.exp <= now) return { ok: false, reason: "expired" };
  return { ok: true, uid: t.uid, n: t.n };
}
