// ------------------------------------------------------------------
// Phase-0 «اعتماد» — learner write-secret primitive (SERVER-ONLY).
//
// Audit 2026-10-12 (SEC-1/S4): the secret used to be stored AND compared
// as plaintext with `!==` in three drifting copies (register / profile /
// stats). Now there is one module: SHA-256 at rest, timing-safe compare.
// Plaintext exists exactly once — in the HTTP response that issues it.
// ------------------------------------------------------------------

import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

/** Issue a fresh 192-bit secret as 48 hex chars. */
export function newSecret(): string {
  return randomBytes(24).toString("hex");
}

/** SHA-256 of a secret, as 64 hex chars — what we store, never the secret itself. */
export function hashSecret(secret: string): string {
  return createHash("sha256").update(secret, "utf8").digest("hex");
}

const HEX64 = /^[0-9a-f]{64}$/;

/**
 * Timing-safe check of a presented plaintext secret against storage.
 * Storage may be a 64-hex SHA-256 digest (current write path) or a legacy
 * plaintext secret (hashed on the fly — the one-off migration rewrites
 * every row, so this branch only guards the rollout window).
 */
export function secretMatches(presented: string, stored: string | null | undefined): boolean {
  if (!presented || !stored) return false;
  const a = Buffer.from(hashSecret(presented), "hex");
  const b = Buffer.from(HEX64.test(stored) ? stored : hashSecret(stored), "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Sanitize an incoming presented secret to a bounded string. */
export function presentSecret(v: unknown): string {
  return typeof v === "string" ? v.slice(0, 100) : "";
}
