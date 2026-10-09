"use client";

// ------------------------------------------------------------------
// Progress backup — export/import the learner's persisted study state
// as a JSON file. Export triggers a download; import validates the
// shape and returns the sanitized payload to be applied to the store.
// ------------------------------------------------------------------

import { useStudy } from "./study-store";
import type { HistoryMap, MistakeMap, SrsItem } from "./study-store";
import type { QuizResult } from "./study-types";

export const BACKUP_VERSION = 1;

export interface BackupPayload {
  app: "vision2-webbook";
  version: number;
  exportedAt: string;
  data: {
    known: Record<string, boolean>;
    results: Record<string, QuizResult>;
    srs: Record<string, SrsItem>;
    userName: string;
    avatarColor: string;
    streak: number;
    bestStreak: number;
    lastActiveDay: string;
    dayStat: { day: string; reviews: number; quizzes: number };
    history: HistoryMap;
    mistakes: MistakeMap;
    seenBadges: string[];
  };
}

/** Collect the current persisted subset of the study store. */
function collectData(): BackupPayload["data"] {
  const raw = localStorage.getItem("vision2-study-v1");
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as { state?: BackupPayload["data"] };
      if (parsed.state) return parsed.state;
    } catch {
      /* fall through to store */
    }
  }
  // fallback: read from the store directly
  const s = useStudy.getState();
  return {
    known: s.known,
    results: s.results,
    srs: s.srs,
    userName: s.userName,
    avatarColor: s.avatarColor,
    streak: s.streak,
    bestStreak: s.bestStreak,
    lastActiveDay: s.lastActiveDay,
    dayStat: s.dayStat,
    history: s.history,
    mistakes: s.mistakes,
    seenBadges: s.seenBadges,
  };
}

/** Serialize + download the learner's progress as a pretty JSON file. */
export function exportProgress(): boolean {
  try {
    const payload: BackupPayload = {
      app: "vision2-webbook",
      version: BACKUP_VERSION,
      exportedAt: new Date().toISOString(),
      data: collectData(),
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

const asRecord = (v: unknown): Record<string, unknown> =>
  v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {};

/**
 * Validate a backup file's JSON and return the sanitized payload.
 * Throws with a Persian message when the file is not a valid backup.
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
  const data = asRecord(rec["data"]);
  const results: Record<string, QuizResult> = {};
  for (const [k, v] of Object.entries(asRecord(data["results"]))) {
    const r = asRecord(v);
    if (typeof r["percent"] === "number" && typeof r["correct"] === "number" && typeof r["total"] === "number") {
      results[k] = {
        correct: r["correct"],
        total: r["total"],
        percent: r["percent"],
        at: typeof r["at"] === "string" ? r["at"] : new Date().toISOString(),
      };
    }
  }
  const srs: Record<string, SrsItem> = {};
  for (const [k, v] of Object.entries(asRecord(data["srs"]))) {
    const it = asRecord(v);
    if (typeof it["level"] === "number" && typeof it["dueAt"] === "number") {
      srs[k] = { level: Math.max(0, Math.min(5, it["level"])), dueAt: it["dueAt"] };
    }
  }
  const known: Record<string, boolean> = {};
  for (const [k, v] of Object.entries(asRecord(data["known"]))) {
    if (typeof v === "boolean") known[k] = v;
  }
  const history: HistoryMap = {};
  for (const [k, v] of Object.entries(asRecord(data["history"]))) {
    const h = asRecord(v);
    if (typeof h["reviews"] === "number" && typeof h["quizzes"] === "number") {
      history[k] = { reviews: h["reviews"], quizzes: h["quizzes"] };
    }
  }
  const mistakes: MistakeMap = {};
  for (const [k, v] of Object.entries(asRecord(data["mistakes"]))) {
    if (typeof v === "number") mistakes[k] = v;
  }
  const ds = asRecord(data["dayStat"]);
  return {
    app: "vision2-webbook",
    version: BACKUP_VERSION,
    exportedAt: typeof rec["exportedAt"] === "string" ? rec["exportedAt"] : new Date().toISOString(),
    data: {
      known,
      results,
      srs,
      userName: typeof data["userName"] === "string" ? data["userName"] : "",
      avatarColor: typeof data["avatarColor"] === "string" ? data["avatarColor"] : "emerald",
      streak: typeof data["streak"] === "number" ? data["streak"] : 0,
      bestStreak: typeof data["bestStreak"] === "number" ? data["bestStreak"] : 0,
      lastActiveDay: typeof data["lastActiveDay"] === "string" ? data["lastActiveDay"] : "",
      dayStat: {
        day: typeof ds["day"] === "string" ? ds["day"] : "",
        reviews: typeof ds["reviews"] === "number" ? ds["reviews"] : 0,
        quizzes: typeof ds["quizzes"] === "number" ? ds["quizzes"] : 0,
      },
      history,
      mistakes,
      seenBadges: Array.isArray(data["seenBadges"]) ? data["seenBadges"].filter((x): x is string => typeof x === "string") : [],
    },
  };
}

/** Apply a parsed backup to the persisted localStorage and reload. */
export function applyBackup(payload: BackupPayload): boolean {
  try {
    const raw = localStorage.getItem("vision2-study-v1");
    const current = raw ? (JSON.parse(raw) as { state?: Record<string, unknown>; version?: number }) : {};
    localStorage.setItem(
      "vision2-study-v1",
      JSON.stringify({
        ...current,
        state: payload.data,
        version: 0, // force zustand to rehydrate/migrate normally
      })
    );
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
