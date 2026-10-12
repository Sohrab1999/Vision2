// R-1 «پایداری schema-محور» — guards for the SyncField table
// (src/lib/persist/schema.ts). partialize / collectData / parseBackup /
// mergeSyncData are all GENERATED from that one table, so keeping the
// table complete, idempotent and merge-safe protects all four paths.
//
// The canonical key list below is intentionally hand-written: if a field
// is added to (or removed from) the table, this test goes red and forces
// a conscious decision — exactly the "1 line + 1 test" acceptance rule
// from docs/codebase-audit.md §12 step 4.

import { describe, it, expect } from "vitest";
import {
  SYNC_FIELDS,
  SYNC_KEYS,
  DEVICE_KEYS,
  PERSIST_KEYS,
  sanitizeAll,
  mergeAll,
  pickPersisted,
} from "@/lib/persist/schema";
import { parseBackup, BACKUP_VERSION } from "@/lib/backup";
import type { SyncData } from "@/lib/persist/schema";
import { useStudy } from "@/lib/study-store";

/** the agreed persisted-field roster, in canonical order */
const CANONICAL_SYNC_KEYS = [
  "known",
  "results",
  "srs",
  "userName",
  "avatarColor",
  "streak",
  "bestStreak",
  "lastActiveDay",
  "dayStat",
  "history",
  "dayHistory",
  "mistakes",
  "seenBadges",
  "rushBest",
  "rushBestCorrect",
  "rushGames",
  "spellRushBest",
  "spellRushBestCorrect",
  "duelWins",
  "duelLosses",
  "duelTies",
  "duelHistory",
  "freezeCount",
  "freezeEarnedDay",
  "freezeUsedDays",
  "goalMetDays",
  "wordMistakes",
  "wordSeen",
  "konkurSeen",
  "konkurWrong",
  "starredWords",
  "userId",
  "userSecret",
] as const;

/** keys that must NEVER travel in a backup/cloud snapshot */
const DEVICE_ONLY = ["dailyGoal", "onboarded", "settings", "syncCode"] as const;

/** keys that must NEVER be persisted at all (ephemeral UI state) */
const EPHEMERAL = ["view", "lessonTab", "flashIntent", "flashNonce", "freezeSavedDay"] as const;

describe("SyncField table — structural guards", () => {
  it("covers exactly the canonical roster, in order", () => {
    expect(SYNC_KEYS).toEqual(CANONICAL_SYNC_KEYS);
  });

  it("gives every field a sanitize function; only the identity pair skips merge", () => {
    for (const key of SYNC_KEYS) {
      expect(typeof (SYNC_FIELDS[key].sanitize as unknown)).toBe("function");
    }
    expect(SYNC_FIELDS["userId"].merge).toBeUndefined();
    expect(SYNC_FIELDS["userSecret"].merge).toBeUndefined();
    for (const key of SYNC_KEYS) {
      if (key === "userId" || key === "userSecret") continue;
      expect(typeof (SYNC_FIELDS[key].merge as unknown)).toBe("function");
    }
  });

  it("keeps device-owned and ephemeral keys out of the travelling set", () => {
    for (const key of DEVICE_ONLY) {
      expect(SYNC_KEYS).not.toContain(key);
      expect(PERSIST_KEYS).toContain(key);
    }
    for (const key of EPHEMERAL) {
      expect(PERSIST_KEYS).not.toContain(key);
    }
    // partialize = sync subset + device subset, nothing else
    expect(PERSIST_KEYS).toHaveLength(SYNC_KEYS.length + DEVICE_KEYS.length);
  });
});

describe("sanitizeAll — defaults and idempotence", () => {
  it("turns an empty record into safe defaults", () => {
    const d = sanitizeAll({});
    expect(d.known).toEqual({});
    expect(d.results).toEqual({});
    expect(d.srs).toEqual({});
    expect(d.userName).toBe("");
    expect(d.avatarColor).toBe("emerald");
    expect(d.streak).toBe(0);
    expect(d.bestStreak).toBe(0);
    expect(d.lastActiveDay).toBe("");
    expect(d.dayStat).toEqual({ day: "", reviews: 0, quizzes: 0, words: 0, dictation: 0, rush: 0 });
    expect(d.history).toEqual({});
    expect(d.dayHistory).toEqual({});
    expect(d.mistakes).toEqual({});
    expect(d.seenBadges).toEqual([]);
    expect(d.rushBest).toBe(0);
    expect(d.rushGames).toBe(0);
    expect(d.duelWins).toBe(0);
    expect(d.duelLosses).toBe(0);
    expect(d.duelTies).toBe(0);
    expect(d.freezeCount).toBe(0);
    expect(d.wordMistakes).toEqual({});
    expect(d.konkurSeen).toEqual({});
    expect(d.starredWords).toEqual([]);
    expect(d.userId).toBeUndefined();
    expect(d.userSecret).toBeUndefined();
  });

  it("is idempotent on poisoned input (clamp once → stable forever)", () => {
    const poisoned = {
      known: { "1:ability": "yes", "1:absent": false },
      results: { "1:vocab": { correct: 5, total: 10, percent: 9000, at: "2026-10-01" } },
      srs: { "1:a": { level: 42, dueAt: 7 }, "1:b": { level: 1 } },
      userName: 42,
      streak: -8,
      bestStreak: "x",
      dayStat: { day: 5, reviews: 1.7, quizzes: -3, dictation: "x" },
      history: { "2026-10-09": { reviews: 2, quizzes: "x" }, bad: { reviews: 1, quizzes: 1 } },
      dayHistory: { "2026-10-09": { reviews: -1, rush: 99999 }, "nonsense": "junk" },
      mistakes: { "1:l1-v3": 5000, "2:x": 0.4 },
      seenBadges: ["first-quiz", 7],
      rushBest: 5_000_000,
      duelWins: "many",
      freezeCount: 17,
      freezeUsedDays: "not-a-list",
      wordMistakes: { "1:ability": -5, "2:word": 3.9 },
      konkurSeen: { "x-21": true, "x-26": false, "x-34": 1 },
      starredWords: [42, "1:ability", null, "2:zone"],
      userId: "abc",
      userSecret: "not-hex-at-all",
    };
    const once = sanitizeAll(poisoned);
    const twice = sanitizeAll(once);
    expect(twice).toEqual(once);
    // spot-check the clamps themselves
    expect(once.results["1:vocab"].percent).toBe(50); // recomputed, not 9000
    expect(once.srs["1:a"].level).toBe(5);
    expect(once.streak).toBe(0);
    expect(once.dayStat.reviews).toBe(2); // rounded
    expect(once.history["bad"]).toEqual({ reviews: 1, quizzes: 1 }); // legacy behavior: counter validity only, key format untouched
    expect(once.mistakes["1:l1-v3"]).toBe(999);
    expect(once.mistakes["2:x"]).toBeUndefined(); // rounds to 0 → dropped
    expect(once.rushBest).toBe(1_000_000);
    expect(once.duelWins).toBe(0);
    expect(once.freezeCount).toBe(2);
    expect(once.seenBadges).toEqual(["first-quiz"]);
    expect(once.wordMistakes?.["2:word"]).toBe(4);
    expect(once.konkurSeen).toEqual({ "x-21": true });
    expect(once.starredWords).toEqual(["1:ability", "2:zone"]); // non-strings dropped, order kept
    expect(once.userId).toBeUndefined();
    expect(once.userSecret).toBeUndefined();
  });
});

describe("backup ↔ restore ↔ cloud-merge round-trip", () => {
  const trusted = () =>
    sanitizeAll({
      known: { "1:ability": true, "1:absent": false },
      results: { "1:vocab": { correct: 8, total: 10, percent: 80, at: "2026-10-01T09:00:00Z" } },
      srs: { "1:word": { level: 3, dueAt: 1730000000000 } },
      userName: "سارا",
      avatarColor: "rose",
      streak: 7,
      bestStreak: 12,
      lastActiveDay: "2026-10-09",
      dayStat: { day: "2026-10-09", reviews: 4, quizzes: 2, words: 3, dictation: 1, rush: 1 },
      history: { "2026-10-09": { reviews: 4, quizzes: 2 } },
      dayHistory: { "2026-10-09": { day: "2026-10-09", reviews: 4, quizzes: 2, words: 3, dictation: 1, rush: 1 } },
      mistakes: { "1:l1-v3": 2 },
      seenBadges: ["first-quiz", "streak-7"],
      rushBest: 120,
      rushBestCorrect: 9,
      rushGames: 4,
      spellRushBest: 30,
      spellRushBestCorrect: 2,
      duelWins: 5,
      duelLosses: 2,
      duelTies: 1,
      freezeCount: 1,
      freezeEarnedDay: "2026-10-05",
      freezeUsedDays: ["2026-10-02"],
      goalMetDays: ["2026-10-05", "2026-10-09"],
      wordMistakes: { "1:ability": 3 },
      wordSeen: { "1:ability": 9 },
      konkurSeen: { "x-21": true },
      konkurWrong: { "x-26": true },
      starredWords: ["1:ability", "2:zone"],
      userId: "learner-12345",
      userSecret: "ab".repeat(24),
    });

  it("file round-trip preserves every field byte-for-byte (trusted data is stable under sanitize)", () => {
    const data = trusted();
    const envelope = JSON.stringify({
      app: "vision2-webbook",
      version: BACKUP_VERSION,
      exportedAt: "2026-10-10T10:00:00Z",
      data,
    });
    const payload = parseBackup(envelope);
    expect(payload.data).toEqual(data);
  });

  it("a restored backup now carries the duel record (R-1 drift fix)", () => {
    const payload = parseBackup(
      JSON.stringify({
        app: "vision2-webbook",
        version: BACKUP_VERSION,
        exportedAt: "2026-10-10T10:00:00Z",
        data: { duelWins: 5, duelLosses: 2, duelTies: 1 },
      })
    );
    expect(payload.data.duelWins).toBe(5);
    expect(payload.data.duelLosses).toBe(2);
    expect(payload.data.duelTies).toBe(1);
  });

  it("cloud merge keeps all four duel counters as max(local, remote)", () => {
    const local = { ...trusted(), duelWins: 5, duelLosses: 2, duelTies: 1 };
    const remote = { ...trusted(), duelWins: 3, duelLosses: 4, duelTies: 1 };
    const merged = mergeAll(local, remote);
    expect(merged.duelWins).toBe(5);
    expect(merged.duelLosses).toBe(4);
    expect(merged.duelTies).toBe(1);
  });

  it("starred words: sanitize drops junk and caps at 2000 newest; merge unions both devices", () => {
    // cap — the newest (tail) stars survive
    const flood = Array.from({ length: 2001 }, (_, i) => `1:w${i}`);
    expect(sanitizeAll({ starredWords: flood }).starredWords).toHaveLength(2000);
    expect(sanitizeAll({ starredWords: flood }).starredWords?.[0]).toBe("1:w1"); // oldest dropped
    // union merge — stars made on two devices both survive, deduped
    const local = { ...trusted(), starredWords: ["1:ability", "2:zone"] };
    const remote = { ...trusted(), starredWords: ["2:zone", "3:paint"] };
    const merged = mergeAll(local, remote);
    expect(merged.starredWords).toEqual(["1:ability", "2:zone", "3:paint"]);
  });

  it("merge output covers every synced field (no silently dropped domain)", () => {
    const merged = mergeAll(trusted(), trusted());
    for (const key of SYNC_KEYS) {
      if (key === "userId" || key === "userSecret") {
        // identity pair present only when adoption happens; here both sides own one
        expect(merged[key]).toBeUndefined();
        continue;
      }
      expect(merged[key], `merge dropped field: ${key}`).toBeDefined();
    }
  });

  it("cloud round-trip is stable: merge(a, sanitize(cloud(a))) === a", () => {
    const a = trusted();
    delete (a as Partial<SyncData>).userId;
    delete (a as Partial<SyncData>).userSecret;
    // simulate what leaves the device and what comes back from the cloud
    const cloud = sanitizeAll(JSON.parse(JSON.stringify(a)));
    expect(mergeAll(a, cloud)).toEqual(a);
  });

  it("merge never rewrites an identity that already exists (pair stays device-owned)", () => {
    const a = trusted();
    const cloud = sanitizeAll(JSON.parse(JSON.stringify(a)));
    const merged = mergeAll(a, cloud);
    // identity is deliberately omitted from the output — applyMergedSnapshot
    // does a partial setState, so the device silently keeps its own pair
    expect(merged.userId).toBeUndefined();
    expect(merged.userSecret).toBeUndefined();
  });
});

describe("pickPersisted — partialize coverage on the live store", () => {
  it("picks exactly SYNC_KEYS + DEVICE_KEYS from real store state", () => {
    const picked = pickPersisted(useStudy.getState());
    const expected = [...SYNC_KEYS, ...DEVICE_KEYS].sort();
    expect(Object.keys(picked).sort()).toEqual(expected);
    // device defaults survive (they are read from the store, not sanitized)
    expect(picked["dailyGoal"]).toBe(10);
    expect(picked["settings"]).toEqual({ ttsRate: 1, fontScale: 1, reduceMotion: false });
  });
});
