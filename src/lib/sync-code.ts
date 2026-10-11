// ------------------------------------------------------------------
// F3 «کد یادگیرنده» — single source of truth for the learner-code format.
//
// Imported by BOTH the client (src/lib/sync.ts) and the server
// (src/app/api/sync/route.ts). The code is the only credential for the
// cloud snapshot, so generation MUST be cryptographic — the audit
// (2026-10-12, SEC-4/D-8) caught the server copy having drifted to
// Math.random(). One module, one alphabet, one regex, zero drift.
// ------------------------------------------------------------------

/** Unambiguous alphabet (no 0/O, 1/I/L) — codes are shown in a school context. */
export const CODE_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

const CODE_RE = /^[2-9A-HJKMNP-Z]{4}-[2-9A-HJKMNP-Z]{4}$/;

/**
 * Display-friendly normalize: uppercase, latin digits only, re-hyphenated when
 * a full 8 chars survive. Short/garbled input returns the truncated stem so
 * the UI can echo what the user typed (client contract — tests pin this).
 */
export function normalizeCode(input: string): string {
  const clean = input
    .toUpperCase()
    .replace(/[^2-9A-Z]/g, "")
    .slice(0, 8);
  return clean.length === 8 ? `${clean.slice(0, 4)}-${clean.slice(4)}` : clean;
}

/** Strict server-side normalize: full valid codes only, otherwise "" (route contract). */
export function strictNormalizeCode(input: string): string {
  const clean = normalizeCode(input);
  return CODE_RE.test(clean) ? clean : "";
}

/** True only for a complete, well-formed code. */
export function looksLikeCode(input: string): boolean {
  return CODE_RE.test(normalizeCode(input));
}

/**
 * CSPRNG learner code like "K7QM-34XP".
 * 256 % 32 === 0 → uniform sampling, no modulo bias.
 */
export function newCode(): string {
  const pick = () =>
    Array.from(crypto.getRandomValues(new Uint8Array(4)))
      .map((n) => CODE_ALPHABET[n % CODE_ALPHABET.length])
      .join("");
  return `${pick()}-${pick()}`;
}
