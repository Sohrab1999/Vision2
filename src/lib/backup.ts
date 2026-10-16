"use client";

// ------------------------------------------------------------------
// Progress backup — export/import the learner's persisted study state
// as a JSON file. Export triggers a download; import validates the
// shape and returns the sanitized payload to be applied to the store.
// ------------------------------------------------------------------

import { useStudy } from "./study-store";
import { DEVICE_KEYS, sanitizeAll, asRecord } from "@/lib/persist/schema";
import type { SyncData } from "@/lib/persist/schema";
import { readAppendixResume, sanitizeResumeInput, adoptResumeIfAbsent, type AppendixResumeItem } from "./bg-reading";
import { faNum } from "./study-theme";

// R-1 «پایداری schema-محور»: the payload shape, its sanitization and
// its defaults all live in the SyncField table (src/lib/persist/schema.ts).
export type { SyncData };
export const BACKUP_VERSION = 1;

export interface BackupPayload {
  app: "vision2-webbook";
  version: number;
  exportedAt: string;
  data: SyncData;
  /** راند ۲۳۶ — نشانگرِ «ادامهٔ مطالعه» همراهِ پشتیبان سفر می‌کند (بندِ ②
   *  پیشنهادِ ۲۳۵). بیرونِ SyncData می‌ماند (رکورد در استورِ یادگیری نیست —
   *  قراردادِ r233-235) ولی در همهٔ مسیرهایِ سفر همسفرِ data است. legacy
   *  payloads بدونِ آن می‌آیند — پالایشِ دفاعیِ sanitizeResumeInput. */
  resume?: AppendixResumeItem;
}

/**
 * Collect the current persisted subset of the study store, through the
 * SyncField table — so every export/cloud-push is validated and clamped
 * exactly like an import (self-healing against legacy junk in localStorage).
 */
export function collectData(): SyncData {
  const raw = localStorage.getItem("vision2-study-v1");
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as { state?: unknown };
      if (parsed.state && typeof parsed.state === "object") return sanitizeAll(parsed.state);
    } catch {
      /* fall through to store */
    }
  }
  // fallback: read from the store directly
  return sanitizeAll(useStudy.getState());
}

/** Serialize + download the learner's progress as a pretty JSON file. */
export function exportProgress(): boolean {
  try {
    const payload: BackupPayload = {
      app: "vision2-webbook",
      version: BACKUP_VERSION,
      exportedAt: new Date().toISOString(),
      data: collectData(),
      ...(readAppendixResume() ? { resume: readAppendixResume()! } : {}),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const d = new Date();
    const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
    a.href = url;
    a.download = `vision2-backup-${stamp}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 3000);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate a backup file's JSON and return the sanitized payload.
 * Throws with a Persian message when the file is not a valid backup.
 * The per-field validation/clamping is the SyncField table's sanitize
 * column (R-1) — one shared policy for file import AND cloud snapshots.
 */
export function parseBackup(text: string): BackupPayload {
  let obj: unknown;
  try {
    obj = JSON.parse(text);
  } catch {
    throw new Error("فایل، JSON معتبری نیست.");
  }
  const rec = asRecord(obj);
  if (rec["app"] !== "vision2-webbook") {
    throw new Error("این فایل پشتیبانِ وب‌کتاب ویژن ۲ نیست.");
  }
  const version = typeof rec["version"] === "number" ? rec["version"] : 0;
  if (version < 1 || version > BACKUP_VERSION) {
    throw new Error("نسخهٔ فایل پشتیبان پشتیبانی نمی‌شود.");
  }
  return {
    app: "vision2-webbook",
    version: BACKUP_VERSION,
    exportedAt: typeof rec["exportedAt"] === "string" ? rec["exportedAt"] : new Date().toISOString(),
    data: sanitizeAll(rec["data"]),
    // راند ۲۳۶ — رکوردِ مسافر با همان سیاستِ دفاعیِ خواندنِ محلی پالایش می‌شود؛
    // خراب/سیم‌نشده/ناقص = حذفِ کاملِ کلید (نه یک رکوردِ نیمه‌کارِ جعلی)
    ...(sanitizeResumeInput(rec["resume"])
      ? { resume: sanitizeResumeInput(rec["resume"])! }
      : {}),
  };
}

/** Apply a parsed backup to the persisted localStorage and reload. */
export function applyBackup(payload: BackupPayload): boolean {
  try {
    const raw = localStorage.getItem("vision2-study-v1");
    const current = raw ? (JSON.parse(raw) as { state?: Record<string, unknown>; version?: number }) : {};
    const cur = (current.state ?? {}) as Record<string, unknown>;
    // Phase-0 fix: backups used to wipe device/identity fields (userId, secret,
    // onboarding flag, settings, sync code) because payload.data does not carry
    // them. Identity (userId+userSecret) is ADOPTED from the backup when present
    // — restoring your own file restores YOUR identity; device preferences and
    // the attached sync code are always kept from this device.
    const identity: Record<string, unknown> = {};
    if (payload.data.userId && payload.data.userSecret) {
      identity.userId = payload.data.userId;
      identity.userSecret = payload.data.userSecret;
    } else {
      if (typeof cur.userId === "string") identity.userId = cur.userId;
      if (typeof cur.userSecret === "string") identity.userSecret = cur.userSecret;
    }
    const device: Record<string, unknown> = {};
    for (const key of DEVICE_KEYS) {
      if (key in cur) device[key] = cur[key];
    }
    localStorage.setItem(
      "vision2-study-v1",
      JSON.stringify({
        ...current,
        state: { ...payload.data, ...identity, ...device },
        version: 0, // force zustand to rehydrate/migrate normally
      })
    );
    // راند ۲۳۶ — رکوردِ «ادامهٔ مطالعه»ی مسافر با سیاستِ پذیرش-اگر-غایب:
    // دستگاهِ بی‌رکورد نشانگرِ پشتیبان را می‌گیرد؛ دستگاهِ رکورددار «آخرینِ
    // دیده‌شدهٔ» خودش را نگه می‌دارد (حقیقتِ محلی از مسافر تازه‌تر است).
    if (payload.resume) adoptResumeIfAbsent(payload.resume);
    return true;
  } catch {
    return false;
  }
}

/** Human-readable summary counts of a backup payload (for the confirm toast). */
export function backupSummary(p: BackupPayload): { known: number; results: number; srs: number; mistakes: number } {
  return {
    known: Object.values(p.data.known).filter(Boolean).length,
    results: Object.keys(p.data.results).length,
    srs: Object.keys(p.data.srs).length,
    mistakes: Object.keys(p.data.mistakes).length,
  };
}

// ------------------------------------------------------------------
// Auto-backup — a silent snapshot of the learner's progress kept in
// localStorage. Even if the browser data is cleared (or the user
// wipes it by accident) the snapshot can restore recent progress.
// Refreshed at most once per 24h AND only when the data changed.
// ------------------------------------------------------------------

const AUTO_KEY = "vision2-auto-backup";
export const AUTO_BACKUP_INTERVAL = 24 * 60 * 60 * 1000; // 24h refresh cadence

export interface AutoBackup {
  savedAt: string; // ISO
  counts: { known: number; results: number; srs: number; mistakes: number; history: number; dayHistory: number; konkur: number; duel: number };
  data: BackupPayload["data"];
  /** راند ۲۳۶ — نشانگرِ «ادامهٔ مطالعه» در snapshotِ خودکار هم هست (legacy
   *  snapshots بدونِ آن می‌آیند). */
  resume?: AppendixResumeItem;
}

/** count-based fingerprint so we only rewrite when something actually changed */
export function countsOf(data: BackupPayload["data"]): AutoBackup["counts"] {
  return {
    known: Object.values(data.known).filter(Boolean).length,
    results: Object.keys(data.results).length,
    srs: Object.keys(data.srs).length,
    mistakes: Object.keys(data.mistakes).length,
    history: Object.keys(data.history).length,
    dayHistory: Object.keys(data.dayHistory ?? {}).length,
    konkur: Object.keys(data.konkurSeen ?? {}).length + Object.keys(data.konkurWrong ?? {}).length,
    duel: data.duelWins + data.duelLosses + data.duelTies,
  };
}

const sameCounts = (a: AutoBackup["counts"], b: AutoBackup["counts"]) =>
  a.known === b.known && a.results === b.results && a.srs === b.srs && a.mistakes === b.mistakes && a.history === b.history && a.dayHistory === b.dayHistory && a.konkur === b.konkur && a.duel === b.duel;

/**
 * Write/refresh the automatic snapshot when needed.
 * Writes when forced or when the data actually changed; otherwise skips.
 * Returns "written" | "skipped" | "unchanged".
 */
export function maybeAutoBackup(force = false): "written" | "skipped" | "unchanged" {
  try {
    const data = collectData();
    const counts = countsOf(data);
    const hasProgress = counts.known > 0 || counts.results > 0 || counts.srs > 0;
    const raw = localStorage.getItem(AUTO_KEY);

    if (raw) {
      const prev = JSON.parse(raw) as AutoBackup;
      const changed = !sameCounts(counts, prev.counts ?? counts);
      if (!changed && !force) return "unchanged";
    } else if (!hasProgress && !force) {
      return "skipped"; // nothing worth snapshotting yet
    }

    const payload: AutoBackup = {
      savedAt: new Date().toISOString(),
      counts,
      data,
      ...(readAppendixResume() ? { resume: readAppendixResume()! } : {}),
    };
    localStorage.setItem(AUTO_KEY, JSON.stringify(payload));
    return "written";
  } catch {
    return "skipped";
  }
}

/** Read the automatic snapshot (null when absent/corrupt). */
export function readAutoBackup(): AutoBackup | null {
  try {
    const raw = localStorage.getItem(AUTO_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AutoBackup;
    if (!parsed || typeof parsed.savedAt !== "string" || !parsed.data) return null;
    return parsed;
  } catch {
    return null;
  }
}

/** Restore the automatic snapshot into the live persisted state (then reload).
 *  راند ۲۳۶ — رکوردِ «ادامهٔ مطالعه» هم همان‌جا با پذیرش-اگر-غایب برمی‌گردد. */
export function restoreAutoBackup(): boolean {
  const snap = readAutoBackup();
  if (!snap) return false;
  const ok = applyBackup({
    app: "vision2-webbook",
    version: BACKUP_VERSION,
    exportedAt: snap.savedAt,
    data: snap.data,
    ...(snap.resume ? { resume: snap.resume } : {}),
  });
  return ok;
}

/** Persian relative label for the auto-backup age. */
export function autoBackupAgeFa(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  if (!Number.isFinite(ms)) return "نامشخص";
  const min = Math.floor(ms / 60_000);
  if (min < 1) return "همین حالا";
  if (min < 60) return `${faNum(min)} دقیقه پیش`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${faNum(h)} ساعت پیش`;
  const d = Math.floor(h / 24);
  return `${faNum(d)} روز پیش`;
}
