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

export interface StatsPayload {
  lesson: number;
  category: string;
  total: number;
  correct: number;
  score?: number;
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
    return res.ok;
  } catch {
    return false;
  }
}

export interface ProfilePayload {
  name: string;
  color: string;
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
