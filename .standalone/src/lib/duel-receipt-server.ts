// ------------------------------------------------------------------
// رسیدِ داوری — نیمهٔ سرور (Task 94).
//
// مصرف‌کنندگان: سرویس داوری ۳۰۰۳ (bun) و روت‌های API در runtime nodejs.
// کلاینت هرگز این فایل را import نمی‌کند (راز + node:crypto).
//
// رازِ رسید: فایل ۰۶۰۰ کنار سرویس — بار اول ساخت (randomBytes ۳۲)، بعد
// خواندن. هر دو طرف (داور و API) از همان فایل می‌خوانند تا امضا بازبینی‌پذیر
// بماند و از ری‌استارت‌ها جان سالم ببرد.
// ------------------------------------------------------------------

import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import {
  canonicalReceiptString,
  judgeReceiptShape,
  receiptIsShaped,
  type DuelEndReason,
  type DuelReceipt,
  type DuelReceiptPlayer,
  type DuelReceiptVerdict,
} from "./duel-receipt";

export type { DuelReceiptVerdict };

const SECRET_RELATIVE = join("mini-services", "challenge-service", ".receipt-secret");

/** مسیر راز از ریشهٔ پروژه (cwd سرویس و next هر دو ریشهٔ پروژه است) */
export function receiptSecretPath(cwd = process.cwd()): string {
  return join(cwd, SECRET_RELATIVE);
}

/** خواندنِ فقط-خواندنی برای سمت API؛ غایب → null (داور هنوز راه نیفتاده) */
export function readReceiptSecret(cwd = process.cwd()): string | null {
  const path = receiptSecretPath(cwd);
  try {
    const raw = readFileSync(path, "utf8").trim();
    return /^[0-9a-f]{64}$/.test(raw) ? raw : null;
  } catch {
    return null;
  }
}

/** خواندن یا ساخت — فقط سمت داور (۳۰۰۳) هنگام بوت */
export function loadOrCreateReceiptSecret(cwd = process.cwd()): string {
  const path = receiptSecretPath(cwd);
  const existing = readReceiptSecret(cwd);
  if (existing) return existing;
  const secret = randomBytes(32).toString("hex");
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, secret + "\n", { mode: 0o600 });
  return secret;
}

export function hmacReceiptHex(canonical: string, secret: string): string {
  return createHmac("sha256", secret).update(canonical, "utf8").digest("hex");
}

export function receiptSigMatches(receipt: DuelReceipt, secret: string): boolean {
  const expected = Buffer.from(hmacReceiptHex(canonicalReceiptString(receipt), secret), "hex");
  const got = Buffer.from(receipt.sig, "hex");
  return expected.length === got.length && timingSafeEqual(expected, got);
}

export interface DuelEndBase {
  code: string;
  startedAt: number;
  endedAt: number;
  reason: DuelEndReason;
  winner: string | null;
  players: DuelReceiptPlayer[];
}

/** داور در پایان مسابقه: رسید را می‌سازد و امضا می‌کند */
export function signDuelEnd(base: DuelEndBase, secret: string): DuelReceipt {
  const receipt: DuelReceipt = { v: 1, ...base, sig: "" };
  receipt.sig = hmacReceiptHex(canonicalReceiptString(receipt), secret);
  return receipt;
}

export interface VerifyDuelOptions {
  now?: number;
  maxAgeMs?: number;
  /** خروجی checkReceiptReplayed — ضبطِ تکراریِ همان رسید توسط همان یادگیرنده */
  replayed?: boolean;
}

/** بازبینی کامل سمت API: ساختار → امضا → پنجره → candidate → outcome → تکرار */
export function verifyDuelSubmission(
  receipt: unknown,
  probe: { name: string; score: number; correct: number; outcome: "win" | "loss" | "tie" | null },
  secret: string | null,
  opts?: VerifyDuelOptions
): DuelReceiptVerdict {
  if (!receiptIsShaped(receipt)) return { ok: false, reason: "malformed" };
  const r = receipt as DuelReceipt;
  if (!secret) return { ok: false, reason: "bad_sig" };
  const shape = judgeReceiptShape(r, probe, receiptSigMatches(r, secret), {
    now: opts?.now,
    maxAgeMs: opts?.maxAgeMs,
  });
  if (!shape.ok) return shape;
  if (opts?.replayed) return { ok: false, reason: "replayed" };
  return { ok: true };
}
