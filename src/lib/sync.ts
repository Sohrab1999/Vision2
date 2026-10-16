"use client";

// ------------------------------------------------------------------
// F3 «کد یادگیرنده» — cross-device progress sync (نقشهٔ راه، اسپرینت ۲)
//
// The learner code is an 8-char credential (no full auth — see roadmap
// warning). Flow:
//   • «ساخت کد»  → POST /api/sync → server stores a snapshot → code shown
//   • auto-push  → debounced POST while a code is attached to this device
//   • «ورود با کد» on another device → GET /api/sync?code=… → MERGE into
//     local progress (union/max per field — never loses either side)
// ------------------------------------------------------------------

import { useStudy } from "./study-store";
import type { BackupPayload } from "./backup";
import { BACKUP_VERSION, collectData, parseBackup } from "./backup";
import { readAppendixResume, sanitizeResumeInput, type AppendixResumeItem } from "./bg-reading";
import { mergeAll } from "@/lib/persist/schema";
import { looksLikeCode, normalizeCode } from "./sync-code";

export type SyncData = BackupPayload["data"];

// audit 2026-10-12 (D-8): the code-format helpers were duplicated client and
// server (and had already drifted). They now live in src/lib/sync-code.ts —
// re-exported here so the header UI and existing tests keep their imports.
export { looksLikeCode, normalizeCode };

// ---------------- merge (never lose progress from either side) ----------------

/**
 * Merge a remote (cloud) snapshot into the local one, field by field.
 * Sets/records are unioned with "best wins"; counters take the max;
 * identity falls back to whichever side has it.
 *
 * R-1 «پایداری schema-محور»: every per-field policy lives in the
 * SyncField table (src/lib/persist/schema.ts) and is generated from it —
 * this wrapper keeps the historical import path for the header UI and tests.
 */
export function mergeSyncData(local: SyncData, remote: SyncData): SyncData {
  return mergeAll(local, remote);
}

/**
 * Apply a merged snapshot through the live store (persist middleware writes
 * it atomically — no localStorage race with concurrent set() calls).
 * Device-owned fields (settings / dailyGoal / onboarded) are untouched.
 */
export function applyMergedSnapshot(merged: SyncData): boolean {
  try {
    useStudy.setState(merged);
    return true;
  } catch {
    return false;
  }
}

// ---------------- server calls ----------------

export interface SyncPushResult {
  ok: boolean;
  code?: string;
  updatedAt?: string;
  error?: string;
}

/** Push the local snapshot to the cloud. Generates a new code when none given.
 *  راند ۲۳۶ — نشانگرِ «ادامهٔ مطالعه» هم‌پایِ data به ابر می‌رود (بندِ ②
 *  پیشنهادِ ۲۳۵): سرور پاکتِ {data, resume} را مات و نامحوظ ذخیره می‌کند. */
export async function pushSync(code: string | null): Promise<SyncPushResult> {
  try {
    const userId = useStudy.getState().ensureUserId();
    const resume = readAppendixResume();
    const res = await fetch("/api/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: code || undefined,
        userId,
        data: collectData(),
        ...(resume ? { resume } : {}),
      }),
    });
    const json = (await res.json().catch(() => ({}))) as { code?: string; updatedAt?: string; error?: string };
    if (!res.ok) return { ok: false, error: json.error ?? "خطا در همگام‌سازی. دوباره تلاش کن." };
    return { ok: true, code: json.code, updatedAt: json.updatedAt };
  } catch {
    return { ok: false, error: "ارتباط با سرور برقرار نشد." };
  }
}

export interface SyncFetchResult {
  ok: boolean;
  updatedAt?: string;
  data?: SyncData;
  /** راند ۲۳۶ — نشانگرِ «ادامهٔ مطالعه»ی ابری (وقتی پاکتِ ذخیره‌شده آن را دارد). */
  resume?: AppendixResumeItem;
  error?: string;
}

/** Fetch the cloud snapshot of a learner code (sanitized through parseBackup). */
export async function fetchSync(rawCode: string): Promise<SyncFetchResult> {
  const code = normalizeCode(rawCode);
  if (!looksLikeCode(code)) return { ok: false, error: "قالب کد درست نیست — ۸ کاراکتر انگلیسی." };
  try {
    const res = await fetch(`/api/sync?code=${encodeURIComponent(code)}`);
    const json = (await res.json().catch(() => ({}))) as { updatedAt?: string; data?: unknown; error?: string };
    if (res.status === 404) return { ok: false, error: "کدی با این مشخصات پیدا نشد." };
    if (!res.ok) return { ok: false, error: json.error ?? "خطا در بازیابی. دوباره تلاش کن." };
    // راند ۲۳۶ — پاکت می‌تواند دو شکل داشته باشد: legacy (خودِ SyncData)
    // یا جدید ({data, resume}). unwrapِ دفاعی — هر شکلی که نباشد = بی‌رکورد.
    const envelope = (json.data ?? null) as unknown;
    const envRec = envelope && typeof envelope === "object" && !Array.isArray(envelope) ? (envelope as Record<string, unknown>) : null;
    const isEnvelope = !!envRec && "data" in envRec && envRec["data"] && typeof envRec["data"] === "object";
    const rawData = isEnvelope ? envRec!["data"] : envelope;
    const rawResume = isEnvelope ? envRec!["resume"] : undefined;
    try {
      const payload = parseBackup(JSON.stringify({ app: "vision2-webbook", version: BACKUP_VERSION, exportedAt: json.updatedAt ?? "", data: rawData }));
      const resume = sanitizeResumeInput(rawResume);
      return {
        ok: true,
        updatedAt: json.updatedAt,
        data: payload.data,
        ...(resume ? { resume } : {}),
      };
    } catch {
      return { ok: false, error: "دادهٔ ابری قابل خواندن نیست." };
    }
  } catch {
    return { ok: false, error: "ارتباط با سرور برقرار نشد." };
  }
}

/** True when the store currently has no meaningful progress (fresh device). */
export function isEmptyProgress(data: SyncData): boolean {
  return (
    Object.values(data.known).filter(Boolean).length === 0 &&
    Object.keys(data.results).length === 0 &&
    Object.keys(data.srs).length === 0
  );
}
