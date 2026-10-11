"use client";

// ------------------------------------------------------------------
// Progress backup — export/import the learner's persisted study state
// as a JSON file. Export triggers a download; import validates the
// shape and returns the sanitized payload to be applied to the store.
// ------------------------------------------------------------------

import { useStudy } from "./study-store";
import type { DayHistoryMap, HistoryMap, MistakeMap, SrsItem } from "./study-store";
import type { QuizResult } from "./study-types";
import { faNum } from "./study-theme";

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
    dayStat: { day: string; reviews: number; quizzes: number; words: number; dictation: number; rush: number };
    history: HistoryMap;
    // Task-37 «هفته‌نامه» — full DayStat window (optional for backward compatibility)
    dayHistory?: DayHistoryMap;
    mistakes: MistakeMap;
    seenBadges: string[];
    rushBest: number;
    rushBestCorrect: number;
    rushGames: number;
    // F9 streak freeze
    freezeCount: number;
    freezeEarnedDay: string;
    freezeUsedDays: string[];
    goalMetDays: string[];
    // F7 word-level risk maps (optional for backward compatibility)
    wordMistakes?: Record<string, number>;
    wordSeen?: Record<string, number>;
    // گوشهٔ کنکور coverage/mastery maps (optional for backward compatibility)
    konkurSeen?: Record<string, boolean>;
    konkurWrong?: Record<string, boolean>;
    // Phase-0 «اعتماد» — learner identity pair (optional for backward compatibility).
    // A backup file (or cloud snapshot) carrying the pair restores the SAME
    // identity on the new device — the file/code itself is the credential.
    userId?: string;
    userSecret?: string;
  };
}

/** Collect the current persisted subset of the study store. */
export function collectData(): BackupPayload["data"] {
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
    dayHistory: s.dayHistory ?? {},
    mistakes: s.mistakes,
    seenBadges: s.seenBadges,
    rushBest: s.rushBest ?? 0,
    rushBestCorrect: s.rushBestCorrect ?? 0,
    rushGames: s.rushGames ?? 0,
    freezeCount: s.freezeCount ?? 0,
    freezeEarnedDay: s.freezeEarnedDay ?? "",
    freezeUsedDays: s.freezeUsedDays ?? [],
    goalMetDays: s.goalMetDays ?? [],
    wordMistakes: s.wordMistakes ?? {},
    wordSeen: s.wordSeen ?? {},
    konkurSeen: s.konkurSeen ?? {},
    konkurWrong: s.konkurWrong ?? {},
    userId: s.userId || undefined,
    userSecret: s.userSecret || undefined,
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

/** sanitize a boolean flag map (konkur coverage): short keys, hard cap on entries */
function sanitizeFlagMap(v: unknown): Record<string, boolean> {
  const out: Record<string, boolean> = {};
  for (const [k, b] of Object.entries(asRecord(v))) {
    if (typeof b === "boolean" && b) out[k.slice(0, 80)] = true;
    if (Object.keys(out).length >= 2000) break;
  }
  return out;
}

/** sanitize an F7 word-stat map: finite non-negative ints, hard cap on entries */
function sanitizeWordStat(v: unknown): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [k, n] of Object.entries(asRecord(v))) {
    if (typeof n === "number" && Number.isFinite(n) && n >= 0) {
      out[k.slice(0, 80)] = Math.min(9999, Math.round(n));
    }
    if (Object.keys(out).length >= 2000) break;
  }
  return out;
}

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
  // audit 2026-10-12 (F-7.2): every numeric field below is clamped now —
  // previously a tampered/corrupt file could inject percent 9000 or negative
  // counts that the max-merge in sync would happily keep as "best" forever.
  const num = (v: unknown): number | null =>
    typeof v === "number" && Number.isFinite(v) ? v : null;
  const cnt = (v: unknown, max = 9999): number | null => {
    const n = num(v);
    return n === null ? null : Math.min(max, Math.max(0, Math.round(n)));
  };
  const results: Record<string, QuizResult> = {};
  for (const [k, v] of Object.entries(asRecord(data["results"]))) {
    const r = asRecord(v);
    const total = cnt(r["total"]);
    const correct = cnt(r["correct"]);
    if (total === null || total < 1 || correct === null || correct > total) continue;
    // percent is always round(correct/total*100) on every write path —
    // recomputing here keeps a tampered percent field from poisoning "best"
    results[k] = {
      correct,
      total,
      percent: Math.round((correct / total) * 100),
      at: typeof r["at"] === "string" ? r["at"] : new Date().toISOString(),
    };
  }
  const srs: Record<string, SrsItem> = {};
  for (const [k, v] of Object.entries(asRecord(data["srs"]))) {
    const it = asRecord(v);
    const dueAt = num(it["dueAt"]);
    if (typeof it["level"] === "number" && dueAt !== null && dueAt >= 0) {
      srs[k] = { level: Math.max(0, Math.min(5, it["level"])), dueAt: Math.round(dueAt) };
    }
  }
  const known: Record<string, boolean> = {};
  for (const [k, v] of Object.entries(asRecord(data["known"]))) {
    if (typeof v === "boolean") known[k] = v;
  }
  const history: HistoryMap = {};
  for (const [k, v] of Object.entries(asRecord(data["history"]))) {
    const h = asRecord(v);
    const reviews = cnt(h["reviews"]);
    const quizzes = cnt(h["quizzes"]);
    if (reviews !== null && quizzes !== null) {
      history[k] = { reviews, quizzes };
    }
  }
  // Task-37 «هفته‌نامه» — sanitize the full-day window: valid day keys, clamped
  // counters, hard cap of 35 entries (the digest never needs more).
  const dayHistory: DayHistoryMap = {};
  {
    const DAY_KEY = /^\d{4}-\d{2}-\d{2}$/;
    const clamp = (v: unknown) =>
      typeof v === "number" && Number.isFinite(v) ? Math.min(9999, Math.max(0, Math.round(v))) : 0;
    const entries = Object.entries(asRecord(data["dayHistory"]))
      .filter(([k]) => DAY_KEY.test(k))
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
    for (const [k, v] of entries.slice(-35)) {
      if (!v || typeof v !== "object" || Array.isArray(v)) continue; // garbage → drop, not zero-fill
      const d = asRecord(v);
      dayHistory[k] = {
        day: k,
        reviews: clamp(d["reviews"]),
        quizzes: clamp(d["quizzes"]),
        words: clamp(d["words"]),
        dictation: clamp(d["dictation"]),
        rush: clamp(d["rush"]),
      };
    }
  }
  const mistakes: MistakeMap = {};
  for (const [k, v] of Object.entries(asRecord(data["mistakes"]))) {
    const m = cnt(v, 999);
    if (m !== null && m > 0) mistakes[k] = m;
  }
  const ds = asRecord(data["dayStat"]);
  const clampStat = (v: unknown) => cnt(v) ?? 0;
  return {
    app: "vision2-webbook",
    version: BACKUP_VERSION,
    exportedAt: typeof rec["exportedAt"] === "string" ? rec["exportedAt"] : new Date().toISOString(),
    data: {
      known,
      results,
      srs,
      userName: typeof data["userName"] === "string" ? data["userName"].slice(0, 24) : "",
      avatarColor: typeof data["avatarColor"] === "string" ? data["avatarColor"].slice(0, 24) : "emerald",
      streak: cnt(data["streak"]) ?? 0,
      bestStreak: cnt(data["bestStreak"]) ?? 0,
      lastActiveDay: typeof data["lastActiveDay"] === "string" ? data["lastActiveDay"] : "",
      dayStat: {
        day: typeof ds["day"] === "string" ? ds["day"] : "",
        reviews: clampStat(ds["reviews"]),
        quizzes: clampStat(ds["quizzes"]),
        words: clampStat(ds["words"]),
        dictation: clampStat(ds["dictation"]),
        rush: clampStat(ds["rush"]),
      },
      history,
      dayHistory,
      mistakes,
      seenBadges: Array.isArray(data["seenBadges"]) ? data["seenBadges"].filter((x): x is string => typeof x === "string") : [],
      rushBest: cnt(data["rushBest"], 1_000_000) ?? 0,
      rushBestCorrect: cnt(data["rushBestCorrect"]) ?? 0,
      rushGames: cnt(data["rushGames"], 99_999) ?? 0,
      freezeCount: typeof data["freezeCount"] === "number" ? Math.min(2, Math.max(0, Math.round(data["freezeCount"]))) : 0,
      freezeEarnedDay: typeof data["freezeEarnedDay"] === "string" ? data["freezeEarnedDay"] : "",
      freezeUsedDays: Array.isArray(data["freezeUsedDays"])
        ? data["freezeUsedDays"].filter((x): x is string => typeof x === "string").slice(-30)
        : [],
      goalMetDays: Array.isArray(data["goalMetDays"])
        ? data["goalMetDays"].filter((x): x is string => typeof x === "string").slice(-14)
        : [],
      wordMistakes: sanitizeWordStat(data["wordMistakes"]),
      wordSeen: sanitizeWordStat(data["wordSeen"]),
      konkurSeen: sanitizeFlagMap(data["konkurSeen"]),
      konkurWrong: sanitizeFlagMap(data["konkurWrong"]),
      userId:
        typeof data["userId"] === "string" && data["userId"].length >= 6 && data["userId"].length <= 80
          ? data["userId"]
          : undefined,
      userSecret:
        typeof data["userSecret"] === "string" && /^[0-9a-f]{24,100}$/.test(data["userSecret"])
          ? data["userSecret"]
          : undefined,
    },
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
    for (const key of ["onboarded", "dailyGoal", "settings", "syncCode"] as const) {
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
  counts: { known: number; results: number; srs: number; mistakes: number; history: number; dayHistory: number; konkur: number };
  data: BackupPayload["data"];
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
  };
}

const sameCounts = (a: AutoBackup["counts"], b: AutoBackup["counts"]) =>
  a.known === b.known && a.results === b.results && a.srs === b.srs && a.mistakes === b.mistakes && a.history === b.history && a.dayHistory === b.dayHistory && a.konkur === b.konkur;

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

    const payload: AutoBackup = { savedAt: new Date().toISOString(), counts, data };
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

/** Restore the automatic snapshot into the live persisted state (then reload). */
export function restoreAutoBackup(): boolean {
  const snap = readAutoBackup();
  if (!snap) return false;
  return applyBackup({
    app: "vision2-webbook",
    version: BACKUP_VERSION,
    exportedAt: snap.savedAt,
    data: snap.data,
  });
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
