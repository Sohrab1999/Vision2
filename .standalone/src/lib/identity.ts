"use client";

// ------------------------------------------------------------------
// Phase-0 «اعتماد» — learner identity client helper.
//
// The server issues (userId, secret) pairs via /api/register and every
// stats/profile write must present them. This module:
//   • ensureIdentity() → returns the learner's pair, registering/claiming
//     transparently on first need (legacy first-claim-wins migration)
//   • sendStats()      → signed fire-and-forget POST /api/stats
//   • sendProfile()    → signed POST /api/profile (name/color update)
// ------------------------------------------------------------------

import { useStudy } from "./study-store";

export interface Identity {
  userId: string;
  secret: string;
}

interface RegisterResponse {
  ok?: boolean;
  userId?: string;
  secret?: string;
  error?: string;
}

/** Register (or claim) the learner identity on the server and persist the pair. */
export async function ensureIdentity(): Promise<Identity | null> {
  const s = useStudy.getState();
  if (s.userId && s.userSecret) return { userId: s.userId, secret: s.userSecret };
  try {
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: s.userId || undefined, secret: s.userSecret || undefined }),
    });
    const json = (await res.json().catch(() => ({}))) as RegisterResponse;
    if (!res.ok || typeof json.userId !== "string" || typeof json.secret !== "string") return null;
    s.setIdentity(json.userId, json.secret);
    return { userId: json.userId, secret: json.secret };
  } catch {
    return null;
  }
}

export type DuelOutcome = "win" | "loss" | "tie";

/** r279 «وعده برقرار شد» — pseudo-badge id in seenBadges (no schema change:
 *  the badges pipeline already persists, merges and travels this array). */
export const FIRST_VISIBLE_BADGE_ID = "first-visible";

/**
 * r279 — the fulfillment of r278's deferred promise. The naming toast said
 * «با اولین فعالیتت … دیده میشوی»; the moment a NAMED stats row is actually
 * accepted by the server IS that moment (feed rows and leaderboard rows both
 * come from /api/stats). Fires exactly once ever — the one-shot flag reuses
 * the seenBadges pipeline. Never let a celebration break the stats path.
 */
function celebrateFirstVisible(): void {
  try {
    const s = useStudy.getState();
    if (!s.userName || s.seenBadges.includes(FIRST_VISIBLE_BADGE_ID)) return;
    s.markBadgesSeen([FIRST_VISIBLE_BADGE_ID]);
    window.dispatchEvent(
      new CustomEvent("first-visible", { detail: { name: s.userName } })
    );
  } catch {
    /* celebration is best-effort by contract */
  }
}

export interface StatsPayload {
  lesson: number;
  category: string;
  total: number;
  correct: number;
  score?: number;
  /** Task-36 «جدول نبرد» — duel rows only; the server whitelists it to category "duel". */
  outcome?: DuelOutcome;
  /** Task 94 «رسیدِ داوری» — duel rows only; the judge's HMAC receipt (3003). Required by the server for duels. */
  receipt?: import("@/lib/duel-receipt").DuelReceipt;
  /** Task 94 — the display name THIS player used in the room; lets the API locate the claimant inside the receipt. */
  duelName?: string;
}

/** Fire-and-forget signed stats POST. Resolves true when the server accepted it. */
export async function sendStats(payload: StatsPayload): Promise<boolean> {
  try {
    const ident = await ensureIdentity();
    if (!ident) return false;
    const res = await fetch("/api/stats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, ...ident }),
    });
    // r279 — a server-accepted row from a named learner = the promise moment
    if (res.ok) celebrateFirstVisible();
    return res.ok;
  } catch {
    return false;
  }
}

export interface ProfilePayload {
  name: string;
  color: string;
}

/**
 * Task 112 «بلیتِ ورود» — ضربِ بلیتِ یک‌بارمصرف برای duel:create/join.
 * با همان شناسهٔ احرازشدهٔ یادگیرنده از /api/duel-ticket بلیت می‌گیرد؛
 * هر شکست (بی‌هویتی/شبکه/ردِ سرور) → null و تصمیمِ toast با صداکننده.
 * رشتهٔ بلیت فقط همین‌جا در حافظه می‌ماند — هیچ‌جا ذخیره نمی‌شود.
 */
export async function mintDuelTicket(): Promise<string | null> {
  try {
    const ident = await ensureIdentity();
    if (!ident) return null;
    const res = await fetch("/api/duel-ticket", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: ident.userId, secret: ident.secret }),
    });
    const json = (await res.json().catch(() => ({}))) as { ticket?: unknown };
    return res.ok && typeof json.ticket === "string" && json.ticket.length > 0 ? json.ticket : null;
  } catch {
    return null;
  }
}

/** Signed profile update. Resolves the server profile when accepted. */
export async function sendProfile(
  payload: ProfilePayload
): Promise<{ ok: boolean; error?: string }> {
  try {
    const ident = await ensureIdentity();
    if (!ident) return { ok: false, error: "ثبت‌نام برقرار نشد — اتصال اینترنت را چک کن." };
    const res = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, ...ident }),
    });
    const json = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) return { ok: false, error: json.error ?? "ذخیرهٔ پروفایل ناموفق بود." };
    return { ok: true };
  } catch {
    return { ok: false, error: "ارتباط با سرور برقرار نشد." };
  }
}
