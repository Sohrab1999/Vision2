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
import type { HistoryMap, MistakeMap, SrsItem } from "./study-store";
import type { QuizResult } from "./study-types";

export type SyncData = BackupPayload["data"];

// unambiguous alphabet (no 0/O, 1/I/L) — codes are shown in a school context
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

/** Generate a human-friendly learner code like "K7QM-34XP". */
export function generateLearnerCode(): string {
  const pick = () =>
    Array.from(crypto.getRandomValues(new Uint8Array(4)))
      .map((n) => ALPHABET[n % ALPHABET.length])
      .join("");
  return `${pick()}-${pick()}`;
}

/** Normalize a user-typed code: uppercase, latin digits, re-hyphenated. */
export function normalizeCode(input: string): string {
  const clean = input
    .toUpperCase()
    .replace(/[^2-9A-Z]/g, "")
    .slice(0, 8);
  return clean.length === 8 ? `${clean.slice(0, 4)}-${clean.slice(4)}` : clean;
}

export function looksLikeCode(input: string): boolean {
  return /^[2-9A-HJKMNP-Z]{4}-[2-9A-HJKMNP-Z]{4}$/.test(normalizeCode(input));
}

// ---------------- merge (never lose progress from either side) ----------------

const maxNum = (a: number, b: number) => Math.max(a || 0, b || 0);

function mergeResults(local: Record<string, QuizResult>, remote: Record<string, QuizResult>) {
  const out: Record<string, QuizResult> = { ...local };
  for (const [k, r] of Object.entries(remote)) {
    const cur = out[k];
    if (!cur || r.percent > cur.percent) out[k] = r;
  }
  return out;
}

function mergeSrs(local: Record<string, SrsItem>, remote: Record<string, SrsItem>) {
  const out: Record<string, SrsItem> = { ...local };
  for (const [k, it] of Object.entries(remote)) {
    const cur = out[k];
    if (!cur || it.level > cur.level || (it.level === cur.level && it.dueAt > cur.dueAt)) out[k] = it;
  }
  return out;
}

function mergeHistory(local: HistoryMap, remote: HistoryMap): HistoryMap {
  const out: HistoryMap = { ...local };
  for (const [k, h] of Object.entries(remote)) {
    const cur = out[k];
    out[k] = cur
      ? { reviews: maxNum(cur.reviews, h.reviews), quizzes: maxNum(cur.quizzes, h.quizzes) }
      : h;
  }
  return out;
}

function mergeMistakes(local: MistakeMap, remote: MistakeMap): MistakeMap {
  const out: MistakeMap = { ...local };
  for (const [k, v] of Object.entries(remote)) out[k] = maxNum(out[k] ?? 0, v);
  return out;
}

const dayTotal = (d: SyncData["dayStat"]) => d.reviews + d.quizzes + d.words + d.dictation + d.rush;

/**
 * Merge a remote (cloud) snapshot into the local one, field by field.
 * Sets/records are unioned with "best wins"; counters take the max;
 * identity falls back to whichever side has it.
 */
export function mergeSyncData(local: SyncData, remote: SyncData): SyncData {
  const days = [local.dayStat.day, remote.dayStat.day].filter(Boolean).sort();
  const latestDay = days[days.length - 1] ?? "";
  const localIsToday = latestDay !== "" && local.dayStat.day === latestDay;
  const remoteIsToday = latestDay !== "" && remote.dayStat.day === latestDay;
  const dayStat =
    localIsToday && remoteIsToday
      ? {
          day: local.dayStat.day,
          reviews: maxNum(local.dayStat.reviews, remote.dayStat.reviews),
          quizzes: maxNum(local.dayStat.quizzes, remote.dayStat.quizzes),
          words: maxNum(local.dayStat.words, remote.dayStat.words),
          dictation: maxNum(local.dayStat.dictation, remote.dayStat.dictation),
          rush: maxNum(local.dayStat.rush, remote.dayStat.rush),
        }
      : dayTotal(local.dayStat) >= dayTotal(remote.dayStat)
        ? local.dayStat
        : remote.dayStat;

  const streakByLastActive =
    (local.lastActiveDay || "") >= (remote.lastActiveDay || "") ? local : remote;

  // union of marked words — “known: true” always wins from either side
  const known: Record<string, boolean> = { ...local.known };
  for (const [k, v] of Object.entries(remote.known)) {
    known[k] = (known[k] ?? false) || v;
  }

  return {
    known,
    results: mergeResults(local.results, remote.results),
    srs: mergeSrs(local.srs, remote.srs),
    userName: local.userName || remote.userName,
    avatarColor: local.userName ? local.avatarColor : remote.avatarColor || local.avatarColor,
    streak: Math.max(local.streak || 0, streakByLastActive.streak || 0),
    bestStreak: maxNum(local.bestStreak, remote.bestStreak),
    lastActiveDay: (local.lastActiveDay || "") >= (remote.lastActiveDay || "") ? local.lastActiveDay : remote.lastActiveDay,
    dayStat,
    history: mergeHistory(local.history, remote.history),
    mistakes: mergeMistakes(local.mistakes, remote.mistakes),
    seenBadges: [...new Set([...(local.seenBadges ?? []), ...(remote.seenBadges ?? [])])],
    rushBest: maxNum(local.rushBest, remote.rushBest),
    rushBestCorrect: maxNum(local.rushBestCorrect, remote.rushBestCorrect),
    rushGames: maxNum(local.rushGames, remote.rushGames),
    // F9 — freeze is progress too: own-count takes the max, day sets are unioned,
    // and the last earn-day (cooldown anchor) comes from whichever side is newer
    freezeCount: Math.min(2, maxNum(local.freezeCount, remote.freezeCount)),
    freezeEarnedDay: (local.freezeEarnedDay || "") >= (remote.freezeEarnedDay || "") ? local.freezeEarnedDay : remote.freezeEarnedDay,
    freezeUsedDays: [...new Set([...(local.freezeUsedDays ?? []), ...(remote.freezeUsedDays ?? [])])].slice(-30),
    goalMetDays: [...new Set([...(local.goalMetDays ?? []), ...(remote.goalMetDays ?? [])])].slice(-14),
    // F7 — word-level risk counters take the max (same policy as mistakes)
    wordMistakes: mergeMistakes(local.wordMistakes ?? {}, remote.wordMistakes ?? {}),
    wordSeen: mergeMistakes(local.wordSeen ?? {}, remote.wordSeen ?? {}),
    // گوشهٔ کنکور — conservative union (Phase-0 fix: these maps used to be
    // dropped on merge, so coverage never reached a second device).
    // seen=true wins from either side; wrong stays until BOTH devices clear it.
    konkurSeen: flagUnion(local.konkurSeen, remote.konkurSeen),
    konkurWrong: flagUnion(local.konkurWrong, remote.konkurWrong),
    // Phase-0 «اعتماد» — identity moves as a PAIR: adopt the remote pair only
    // when this device has none, so a linked second device writes stats as the
    // same learner. Never overwrite a device that already owns an identity.
    ...(local.userSecret || !remote.userSecret
      ? {}
      : { userId: remote.userId || local.userId, userSecret: remote.userSecret }),
  };
}

/** boolean-map union — `true` always wins from either side */
function flagUnion(
  local: Record<string, boolean> | undefined,
  remote: Record<string, boolean> | undefined
): Record<string, boolean> {
  const out: Record<string, boolean> = { ...(local ?? {}) };
  for (const [k, v] of Object.entries(remote ?? {})) {
    if (v) out[k] = true;
    else if (!(k in out)) out[k] = false;
  }
  return out;
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

/** Push the local snapshot to the cloud. Generates a new code when none given. */
export async function pushSync(code: string | null): Promise<SyncPushResult> {
  try {
    const userId = useStudy.getState().ensureUserId();
    const res = await fetch("/api/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: code || undefined, userId, data: collectData() }),
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
    try {
      const payload = parseBackup(JSON.stringify({ app: "vision2-webbook", version: BACKUP_VERSION, exportedAt: json.updatedAt ?? "", data: json.data }));
      return { ok: true, updatedAt: json.updatedAt, data: payload.data };
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
