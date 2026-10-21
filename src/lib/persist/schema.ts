// ------------------------------------------------------------------
// R-1 «پایداری schema-محور» — single source of truth for every
// persisted learner field (audit 2026-10-12 §10 R-1).
//
// One SyncField table drives ALL FOUR persistence paths that used to
// be hand-synced lists (and had already drifted: the duel record was
// persisted but never travelled in backups or cloud snapshots):
//   1. partialize    → study-store.ts      (pickPersisted)
//   2. collectData   → backup.ts export/push (sanitizeAll)
//   3. parseBackup   → backup.ts import      (sanitizeAll)
//   4. mergeSyncData → sync.ts cloud merge   (mergeAll)
//
// Adding a persisted field = one entry in the table (+ its type in
// SyncData, right above). The mapped SyncFieldMap type makes any
// drift between the two a compile error, and SYNC_KEYS/DEVICE_KEYS/
// PERSIST_KEYS are derived — so no other list can go stale.
//
// NOTE: this module must stay free of runtime imports from
// study-store (only `import type`) — study-store imports the helpers
// below, and a runtime cycle would break initialization order.
// ------------------------------------------------------------------

import type { QuizResult } from "@/lib/study-types";
import { percent } from "@/lib/domain/percent";
import { sanitizeDuelHistory, mergeDuelHistory, type DuelRecord } from "@/lib/duel-history";
import type {
  DayHistoryMap,
  DayStat,
  HistoryMap,
  LibraryDoneEntry,
  MistakeMap,
  SrsItem,
  StudyState,
  WordStatMap,
} from "@/lib/study-store";

// ---------------- the one persisted-field type ----------------

/**
 * The learner progress subset that travels: manual backup files,
 * the 24h auto-snapshot and cloud sync all carry exactly this shape.
 * Optional members exist for backward compatibility with legacy
 * files/snapshots — sanitize always produces them at runtime.
 */
export interface SyncData {
  known: Record<string, boolean>;
  results: Record<string, QuizResult>;
  srs: Record<string, SrsItem>;
  userName: string;
  avatarColor: string;
  streak: number;
  bestStreak: number;
  lastActiveDay: string;
  dayStat: DayStat;
  history: HistoryMap;
  /** Task-37 «هفته‌نامه» — legacy payloads may omit the 35-day window */
  dayHistory?: DayHistoryMap;
  mistakes: MistakeMap;
  seenBadges: string[];
  rushBest: number;
  rushBestCorrect: number;
  rushGames: number;
  /** «دیکتهٔ برق‌آسا» — spelling-sprint records (Task 61) */
  spellRushBest: number;
  spellRushBestCorrect: number;
  /** R-1 drift fix — the duel record used to be persisted-only and
   *  silently vanished from backups and cloud sync; now it travels. */
  duelWins: number;
  duelLosses: number;
  duelTies: number;
  /** Task 65 «تاریخچهٔ نبردها» — duel log travels like the counters */
  duelHistory?: DuelRecord[];
  freezeCount: number;
  freezeEarnedDay: string;
  freezeUsedDays: string[];
  goalMetDays: string[];
  /** F7 word-level risk maps — legacy payloads may omit them */
  wordMistakes?: WordStatMap;
  wordSeen?: WordStatMap;
  /** Task 290 «کتاب‌خانهٔ داستان‌ها» — story completion records; legacy
   *  payloads may omit them (opt-in since r290) */
  libraryDone?: Record<string, LibraryDoneEntry>;
  /** گوشهٔ کنکور coverage maps — legacy payloads may omit them */
  konkurSeen?: Record<string, boolean>;
  konkurWrong?: Record<string, boolean>;
  /** «واژه‌های من» — starred word keys; legacy payloads may omit them */
  starredWords?: string[];
  /** Phase-0 «اعتماد» — identity moves as a pair, only to
   *  identity-less devices (special-cased in mergeAll). */
  userId?: string;
  userSecret?: string;
}

// ---------------- the table machinery ----------------

export interface MergeCtx {
  local: SyncData;
  remote: SyncData;
}

export interface SyncFieldDef<T> {
  /** validate + clamp an untrusted value (backup file / cloud snapshot / raw persisted state) */
  sanitize: (v: unknown) => T;
  /** cloud-merge policy (remote into local); absent → special-cased (identity pair) */
  merge?: (local: T, remote: T, ctx: MergeCtx) => T;
}

/** every SyncData key MUST have a table entry and vice versa — compile-enforced */
export type SyncFieldMap = { [K in keyof SyncData]-?: SyncFieldDef<SyncData[K]> };

// ---------------- small sanitize/merge helpers ----------------

export const asRecord = (v: unknown): Record<string, unknown> =>
  v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {};

const num = (v: unknown): number | null =>
  typeof v === "number" && Number.isFinite(v) ? v : null;

/** finite non-negative rounded int, capped — null when not a number */
const cnt = (v: unknown, max = 9999): number | null => {
  const n = num(v);
  return n === null ? null : Math.min(max, Math.max(0, Math.round(n)));
};

const maxNum = (a: number, b: number): number => Math.max(a || 0, b || 0);

const str = (fallback: string) => (v: unknown): string =>
  typeof v === "string" ? v : fallback;

/** newer ISO day-key wins ("" never beats a real day) */
const strMax = (l: string, r: string): string =>
  (l || "") >= (r || "") ? l : r;

const stringList = (cap: number) => (v: unknown): string[] =>
  Array.isArray(v)
    ? v.filter((x): x is string => typeof x === "string").slice(-cap)
    : [];

const unionCapped = (cap: number) => (l: string[] | undefined, r: string[] | undefined): string[] =>
  [...new Set([...(l ?? []), ...(r ?? [])])].slice(-cap);

/** word-stat map (F7): finite non-negative ints, key slice, hard entry cap */
const sanitizeWordStat = (v: unknown): WordStatMap => {
  const out: WordStatMap = {};
  for (const [k, n] of Object.entries(asRecord(v))) {
    if (typeof n === "number" && Number.isFinite(n) && n >= 0) {
      out[k.slice(0, 80)] = Math.min(9999, Math.round(n));
    }
    if (Object.keys(out).length >= 2000) break;
  }
  return out;
};

/** flag map (konkur coverage): only true entries survive, key slice, cap 2000 */
const sanitizeFlagMap = (v: unknown): Record<string, boolean> => {
  const out: Record<string, boolean> = {};
  for (const [k, b] of Object.entries(asRecord(v))) {
    if (typeof b === "boolean" && b) out[k.slice(0, 80)] = true;
    if (Object.keys(out).length >= 2000) break;
  }
  return out;
};

/** boolean-map union — `true` always wins from either side */
const flagUnion = (
  l: Record<string, boolean> | undefined,
  r: Record<string, boolean> | undefined
): Record<string, boolean> => {
  const out: Record<string, boolean> = { ...(l ?? {}) };
  for (const [k, v] of Object.entries(r ?? {})) {
    if (v) out[k] = true;
    else if (!(k in out)) out[k] = false;
  }
  return out;
};

/** max-per-key counter map (mistakes / word stats) */
const mergeMaxMap = (l: MistakeMap | undefined, r: MistakeMap | undefined): MistakeMap => {
  const out: MistakeMap = { ...(l ?? {}) };
  for (const [k, v] of Object.entries(r ?? {})) out[k] = maxNum(out[k] ?? 0, v);
  return out;
};

// ---------------- composite field policies ----------------

const sanitizeKnown = (v: unknown): Record<string, boolean> => {
  const out: Record<string, boolean> = {};
  for (const [k, b] of Object.entries(asRecord(v))) {
    if (typeof b === "boolean") out[k] = b;
  }
  return out;
};

const mergeKnown = (l: Record<string, boolean>, r: Record<string, boolean>): Record<string, boolean> => {
  const out = { ...l };
  for (const [k, v] of Object.entries(r)) out[k] = (out[k] ?? false) || v;
  return out;
};

const sanitizeResults = (v: unknown): Record<string, QuizResult> => {
  const out: Record<string, QuizResult> = {};
  for (const [k, raw] of Object.entries(asRecord(v))) {
    const r = asRecord(raw);
    const total = cnt(r["total"]);
    const correct = cnt(r["correct"]);
    if (total === null || total < 1 || correct === null || correct > total) continue;
    // percent is recomputed on every read path so a tampered value can
    // never poison the best-score merge (audit F-7.2)
    out[k] = {
      correct,
      total,
      percent: percent(correct, total),
      at: typeof r["at"] === "string" ? r["at"] : new Date().toISOString(),
    };
  }
  return out;
};

const mergeResults = (l: Record<string, QuizResult>, r: Record<string, QuizResult>): Record<string, QuizResult> => {
  const out = { ...l };
  for (const [k, res] of Object.entries(r)) {
    const cur = out[k];
    if (!cur || res.percent > cur.percent) out[k] = res;
  }
  return out;
};

const sanitizeSrs = (v: unknown): Record<string, SrsItem> => {
  const out: Record<string, SrsItem> = {};
  for (const [k, raw] of Object.entries(asRecord(v))) {
    const it = asRecord(raw);
    const dueAt = num(it["dueAt"]);
    if (typeof it["level"] === "number" && dueAt !== null && dueAt >= 0) {
      out[k] = { level: Math.max(0, Math.min(5, it["level"])), dueAt: Math.round(dueAt) };
    }
  }
  return out;
};

const mergeSrs = (l: Record<string, SrsItem>, r: Record<string, SrsItem>): Record<string, SrsItem> => {
  const out = { ...l };
  for (const [k, it] of Object.entries(r)) {
    const cur = out[k];
    if (!cur || it.level > cur.level || (it.level === cur.level && it.dueAt > cur.dueAt)) out[k] = it;
  }
  return out;
};

const sanitizeDayStat = (v: unknown): DayStat => {
  const d = asRecord(v);
  const c = (x: unknown) => cnt(x) ?? 0;
  return {
    day: typeof d["day"] === "string" ? d["day"] : "",
    reviews: c(d["reviews"]),
    quizzes: c(d["quizzes"]),
    words: c(d["words"]),
    dictation: c(d["dictation"]),
    rush: c(d["rush"]),
    stories: c(d["stories"]), // Task 299 — legacy payloads بدونِ این فیلد صفرِ صادق می‌گیرند
  };
};

const dayTotal = (d: DayStat): number => d.reviews + d.quizzes + d.words + d.dictation + d.rush + d.stories;

/** same-day → per-counter max; different days → the busier side wins */
const mergeDayStat = (l: DayStat, r: DayStat): DayStat => {
  const days = [l.day, r.day].filter(Boolean).sort();
  const latestDay = days[days.length - 1] ?? "";
  if (latestDay !== "" && l.day === latestDay && r.day === latestDay) {
    return {
      day: l.day,
      reviews: maxNum(l.reviews, r.reviews),
      quizzes: maxNum(l.quizzes, r.quizzes),
      words: maxNum(l.words, r.words),
      dictation: maxNum(l.dictation, r.dictation),
      rush: maxNum(l.rush, r.rush),
      stories: maxNum(l.stories, r.stories),
    };
  }
  return dayTotal(l) >= dayTotal(r) ? l : r;
};

const sanitizeHistory = (v: unknown): HistoryMap => {
  const out: HistoryMap = {};
  for (const [k, raw] of Object.entries(asRecord(v))) {
    const h = asRecord(raw);
    const reviews = cnt(h["reviews"]);
    const quizzes = cnt(h["quizzes"]);
    if (reviews !== null && quizzes !== null) out[k] = { reviews, quizzes };
  }
  return out;
};

const mergeHistory = (l: HistoryMap, r: HistoryMap): HistoryMap => {
  const out: HistoryMap = { ...l };
  for (const [k, h] of Object.entries(r)) {
    const cur = out[k];
    out[k] = cur
      ? { reviews: maxNum(cur.reviews, h.reviews), quizzes: maxNum(cur.quizzes, h.quizzes) }
      : h;
  }
  return out;
};

const DAY_KEY = /^\d{4}-\d{2}-\d{2}$/;

/** Task-37 — valid day keys only, clamped counters, 35 newest days kept */
const sanitizeDayHistory = (v: unknown): DayHistoryMap => {
  const clamp = (x: unknown) => cnt(x) ?? 0;
  const out: DayHistoryMap = {};
  const entries = Object.entries(asRecord(v))
    .filter(([k]) => DAY_KEY.test(k))
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  for (const [k, raw] of entries.slice(-35)) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) continue; // garbage → drop, not zero-fill
    const d = asRecord(raw);
    out[k] = {
      day: k,
      reviews: clamp(d["reviews"]),
      quizzes: clamp(d["quizzes"]),
      words: clamp(d["words"]),
      dictation: clamp(d["dictation"]),
      rush: clamp(d["rush"]),
      stories: clamp(d["stories"]),
    };
  }
  return out;
};

/** per-day field-wise max, then keep the 35 newest days */
const mergeDayHistory = (l: DayHistoryMap | undefined, r: DayHistoryMap | undefined): DayHistoryMap => {
  const out: DayHistoryMap = { ...(l ?? {}) };
  for (const [k, d] of Object.entries(r ?? {})) {
    const cur = out[k];
    out[k] = cur
      ? {
          day: cur.day || d.day,
          reviews: maxNum(cur.reviews, d.reviews),
          quizzes: maxNum(cur.quizzes, d.quizzes),
          words: maxNum(cur.words, d.words),
          dictation: maxNum(cur.dictation, d.dictation),
          rush: maxNum(cur.rush, d.rush),
          stories: maxNum(cur.stories, d.stories),
        }
      : d;
  }
  const keys = Object.keys(out).sort();
  while (keys.length > 35) {
    delete out[keys.shift()!];
  }
  return out;
};

const sanitizeMistakes = (v: unknown): MistakeMap => {
  const out: MistakeMap = {};
  for (const [k, n] of Object.entries(asRecord(v))) {
    const m = cnt(n, 999);
    if (m !== null && m > 0) out[k] = m;
  }
  return out;
};

const sanitizeUserId = (v: unknown): string | undefined =>
  typeof v === "string" && v.length >= 6 && v.length <= 80 ? v : undefined;

const sanitizeUserSecret = (v: unknown): string | undefined =>
  typeof v === "string" && /^[0-9a-f]{24,100}$/.test(v) ? v : undefined;

// Task 290 — story-completion records: keys are hill story ids ("s1-1"),
// values are {score,total,day}. Cap 300 keys (the series stays < 100). The
// regex below doubles as the id contract for the data file.
const HILL_STORY_KEY_RE = /^s[123]-\d{1,3}$/;

const sanitizeLibraryDone = (
  v: unknown,
): Record<string, LibraryDoneEntry> | undefined => {
  const out: Record<string, LibraryDoneEntry> = {};
  for (const [k, val] of Object.entries(asRecord(v))) {
    if (!HILL_STORY_KEY_RE.test(k)) continue;
    const e = asRecord(val);
    const score = cnt(e["score"], 999);
    const total = cnt(e["total"], 999);
    if (score === null || total === null || score > total) continue;
    const day = typeof e["day"] === "string" && /^\d{4}-\d{2}-\d{2}$/.test(e["day"]) ? e["day"] : "";
    out[k] = { score, total, day };
    if (Object.keys(out).length >= 300) break;
  }
  return Object.keys(out).length ? out : undefined;
};

/** per-story merge — the better score wins; ties go to the newer day.
 *  Absent on BOTH sides stays absent (round-trip contract of trusted() fixtures). */
const mergeLibraryDone = (
  l: Record<string, LibraryDoneEntry> | undefined,
  r: Record<string, LibraryDoneEntry> | undefined,
): Record<string, LibraryDoneEntry> | undefined => {
  const out: Record<string, LibraryDoneEntry> = { ...(l ?? {}) };
  for (const [k, rv] of Object.entries(r ?? {})) {
    const lv = out[k];
    if (!lv || rv.score > lv.score || (rv.score === lv.score && rv.day > lv.day)) {
      out[k] = rv;
    }
  }
  return Object.keys(out).length ? out : undefined;
};

// ---------------- the SyncField table ----------------

/**
 * The one table. Order here is the canonical field order of every
 * generated object (backup payload, merge output).
 * `userId`/`userSecret` deliberately have no merge — the pair is
 * adopted atomically at the end of mergeAll.
 */
export const SYNC_FIELDS: SyncFieldMap = {
  known: { sanitize: sanitizeKnown, merge: mergeKnown },
  results: { sanitize: sanitizeResults, merge: mergeResults },
  srs: { sanitize: sanitizeSrs, merge: mergeSrs },
  userName: { sanitize: str(""), merge: (l, r) => l || r },
  // the profile travels with the name: the device that owns a name keeps its color
  avatarColor: { sanitize: str("emerald"), merge: (l, r, ctx) => (ctx.local.userName ? l : r || l) },
  // a stale-but-longer chain on the fresher device wins (original mergeSyncData rule)
  streak: {
    sanitize: (v) => cnt(v) ?? 0,
    merge: (l, r, ctx) => {
      const byLastActive = (ctx.local.lastActiveDay || "") >= (ctx.remote.lastActiveDay || "") ? ctx.local : ctx.remote;
      return Math.max(l || 0, byLastActive.streak || 0);
    },
  },
  bestStreak: { sanitize: (v) => cnt(v) ?? 0, merge: maxNum },
  lastActiveDay: { sanitize: str(""), merge: strMax },
  dayStat: { sanitize: sanitizeDayStat, merge: mergeDayStat },
  history: { sanitize: sanitizeHistory, merge: mergeHistory },
  dayHistory: { sanitize: sanitizeDayHistory, merge: mergeDayHistory },
  mistakes: { sanitize: sanitizeMistakes, merge: mergeMaxMap },
  seenBadges: { sanitize: stringList(100), merge: (l, r) => [...new Set([...(l ?? []), ...(r ?? [])])] },
  rushBest: { sanitize: (v) => cnt(v, 1_000_000) ?? 0, merge: maxNum },
  rushBestCorrect: { sanitize: (v) => cnt(v) ?? 0, merge: maxNum },
  rushGames: { sanitize: (v) => cnt(v, 99_999) ?? 0, merge: maxNum },
  spellRushBest: { sanitize: (v) => cnt(v, 1_000_000) ?? 0, merge: maxNum },
  spellRushBestCorrect: { sanitize: (v) => cnt(v) ?? 0, merge: maxNum },
  duelWins: { sanitize: (v) => cnt(v, 99_999) ?? 0, merge: maxNum },
  duelLosses: { sanitize: (v) => cnt(v, 99_999) ?? 0, merge: maxNum },
  duelTies: { sanitize: (v) => cnt(v, 99_999) ?? 0, merge: maxNum },
  duelHistory: { sanitize: sanitizeDuelHistory, merge: mergeDuelHistory },
  freezeCount: {
    sanitize: (v) => (typeof v === "number" && Number.isFinite(v) ? Math.min(2, Math.max(0, Math.round(v))) : 0),
    merge: (l, r) => Math.min(2, maxNum(l, r)),
  },
  freezeEarnedDay: { sanitize: str(""), merge: strMax },
  freezeUsedDays: { sanitize: stringList(30), merge: unionCapped(30) },
  goalMetDays: { sanitize: stringList(14), merge: unionCapped(14) },
  wordMistakes: { sanitize: sanitizeWordStat, merge: mergeMaxMap },
  wordSeen: { sanitize: sanitizeWordStat, merge: mergeMaxMap },
  konkurSeen: { sanitize: sanitizeFlagMap, merge: flagUnion },
  konkurWrong: { sanitize: sanitizeFlagMap, merge: flagUnion },
  // Task 290 «کتاب‌خانهٔ داستان‌ها» — union with best-score-wins per story
  libraryDone: { sanitize: sanitizeLibraryDone, merge: mergeLibraryDone },
  // starred word keys — union keeps both devices' stars, cap 2000 (newest survive)
  starredWords: { sanitize: stringList(2000), merge: unionCapped(2000) },
  userId: { sanitize: sanitizeUserId },
  userSecret: { sanitize: sanitizeUserSecret },
};

export const SYNC_KEYS = Object.keys(SYNC_FIELDS) as (keyof SyncData)[];

/** persisted but device-owned: they never travel in backups/cloud snapshots */
export const DEVICE_KEYS = ["dailyGoal", "onboarded", "settings", "syncCode"] as const;
export type DeviceKey = (typeof DEVICE_KEYS)[number];

export const PERSIST_KEYS = [...SYNC_KEYS, ...DEVICE_KEYS] as (
  | (keyof SyncData)
  | DeviceKey
)[];
export type PersistedKey = (typeof PERSIST_KEYS)[number];

// ---------------- compile-time drift alarms ----------------

type _MissingPersist = Exclude<PersistedKey, keyof StudyState>;
const _ASSERT_PERSIST: [_MissingPersist] extends [never] ? true : never = true;
void _ASSERT_PERSIST;

type _MissingSync = Exclude<keyof SyncData, keyof StudyState>;
const _ASSERT_SYNC: [_MissingSync] extends [never] ? true : never = true;
void _ASSERT_SYNC;

export type PersistedState = Pick<StudyState, PersistedKey & keyof StudyState>;

// ---------------- the four generated loops ----------------

const TABLE = SYNC_FIELDS as unknown as Record<string, SyncFieldDef<unknown>>;

/**
 * Sanitize an untrusted record (backup file / cloud snapshot / raw
 * persisted state) into a complete SyncData — every field validated,
 * clamped and defaulted. Pure; safe on any JSON.
 */
export function sanitizeAll(input: unknown): SyncData {
  const rec = asRecord(input);
  const out = {} as Record<string, unknown>;
  for (const key of SYNC_KEYS) {
    out[key] = TABLE[key].sanitize(rec[key]);
  }
  return out as unknown as SyncData;
}

/**
 * Cloud merge (remote into local) generated from the table's merge
 * policies. Ends with the Phase-0 identity rule: the remote pair is
 * adopted only when this device has none — a device that already owns
 * an identity silently keeps it (the output just omits the keys).
 */
export function mergeAll(local: SyncData, remote: SyncData): SyncData {
  const ctx: MergeCtx = { local, remote };
  const out = {} as Record<string, unknown>;
  for (const key of SYNC_KEYS) {
    const def = TABLE[key];
    if (!def.merge) continue;
    out[key] = def.merge(local[key], remote[key], ctx);
  }
  if (!local.userSecret && remote.userSecret) {
    out["userId"] = remote.userId || local.userId;
    out["userSecret"] = remote.userSecret;
  }
  return out as unknown as SyncData;
}

/**
 * The zustand partialize subset — trusted in-memory store state copied
 * as-is (no re-sanitization on every keystroke; untrusted input only
 * ever enters through sanitizeAll).
 */
export function pickPersisted(state: StudyState): PersistedState {
  const out = {} as Record<string, unknown>;
  for (const key of PERSIST_KEYS) {
    out[key] = state[key as keyof StudyState];
  }
  return out as PersistedState;
}
