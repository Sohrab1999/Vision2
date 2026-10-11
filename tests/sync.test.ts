// Phase-1 «پایداری» — tests for the F3 cloud-sync merge engine.
// The merge must NEVER lose progress from either side (union / best-wins /
// max) and identity must move as a pair only to identity-less devices.

import { describe, it, expect } from "vitest";
import {
  normalizeCode,
  looksLikeCode,
  mergeSyncData,
  isEmptyProgress,
  type SyncData,
} from "@/lib/sync";

const base = (): SyncData => ({
  known: {},
  results: {},
  srs: {},
  userName: "",
  avatarColor: "emerald",
  streak: 0,
  bestStreak: 0,
  lastActiveDay: "",
  dayStat: { day: "", reviews: 0, quizzes: 0, words: 0, dictation: 0, rush: 0 },
  history: {},
  mistakes: {},
  seenBadges: [],
  rushBest: 0,
  rushBestCorrect: 0,
  rushGames: 0,
  freezeCount: 0,
  freezeEarnedDay: "",
  freezeUsedDays: [],
  goalMetDays: [],
});

describe("normalizeCode", () => {
  it("uppercases, strips separators and re-hyphenates at 8 chars", () => {
    expect(normalizeCode("k7qm34xp")).toBe("K7QM-34XP");
    expect(normalizeCode("k7qm-34xp")).toBe("K7QM-34XP");
    expect(normalizeCode(" k7 qm 34xp ")).toBe("K7QM-34XP");
  });

  it("strips ambiguous characters (0/1 and non-latin)", () => {
    expect(normalizeCode("K7QM-340P")).toBe("K7QM34P"); // 0 dropped → 7 chars, no hyphen
    expect(normalizeCode("K7QM-1XLP")).toBe("K7QMXLP"); // 1 dropped
    expect(normalizeCode("ک۷قم-۳۴xp")).toBe("XP"); // persian digits dropped
  });

  it("keeps short input unhyphenated", () => {
    expect(normalizeCode("K7QM")).toBe("K7QM");
    expect(normalizeCode("")).toBe("");
  });
});

describe("looksLikeCode", () => {
  it("accepts valid codes (case-insensitive)", () => {
    expect(looksLikeCode("K7QM-34XP")).toBe(true);
    expect(looksLikeCode("k7qm34xp")).toBe(true);
  });

  it("rejects ambiguous alphabet, wrong length and garbage", () => {
    expect(looksLikeCode("IOLO-ABCD")).toBe(false); // I/O/L excluded
    expect(looksLikeCode("K7QM-34X")).toBe(false); // 7 chars
    expect(looksLikeCode("")).toBe(false);
    expect(looksLikeCode("۱۲۳۴-۵۶۷۸")).toBe(false); // persian digits
  });

  it("silently truncates overlong input to 8 chars (lenient UX)", () => {
    expect(looksLikeCode("K7QM-34XPX")).toBe(true); // → K7QM-34XP
    expect(normalizeCode("K7QM34XPX")).toBe("K7QM-34XP");
  });
});

describe("mergeSyncData — progress safety", () => {
  it("unions known words with true winning from either side", () => {
    const local = { ...base(), known: { "1:ability": true, "1:absent": false } };
    const remote = { ...base(), known: { "1:absent": true, "1:accept": true } };
    const merged = mergeSyncData(local, remote);
    expect(merged.known).toEqual({ "1:ability": true, "1:absent": true, "1:accept": true });
  });

  it("keeps the better (higher percent) quiz result per key", () => {
    const local = {
      ...base(),
      results: { "1:vocab": { correct: 4, total: 10, percent: 40, at: "2026-10-01" } },
    };
    const remote = {
      ...base(),
      results: {
        "1:vocab": { correct: 8, total: 10, percent: 80, at: "2026-10-02" },
        "2:vocab": { correct: 3, total: 5, percent: 60, at: "2026-10-02" },
      },
    };
    const merged = mergeSyncData(local, remote);
    expect(merged.results["1:vocab"].percent).toBe(80);
    expect(merged.results["2:vocab"].percent).toBe(60);
  });

  it("keeps the higher SRS level; ties break to the later dueAt", () => {
    const local = { ...base(), srs: { "1:word": { level: 2, dueAt: 1000 } } };
    const remote = { ...base(), srs: { "1:word": { level: 3, dueAt: 500 } } };
    expect(mergeSyncData(local, remote).srs["1:word"].level).toBe(3);

    const tieLocal = { ...base(), srs: { "1:word": { level: 2, dueAt: 1000 } } };
    const tieRemote = { ...base(), srs: { "1:word": { level: 2, dueAt: 9000 } } };
    expect(mergeSyncData(tieLocal, tieRemote).srs["1:word"].dueAt).toBe(9000);
  });

  it("mistakes and word stats take the max per key", () => {
    const local = {
      ...base(),
      mistakes: { "1:l1-v3": 2 },
      wordMistakes: { "1:ability": 3 },
      wordSeen: { "1:ability": 5 },
    };
    const remote = {
      ...base(),
      mistakes: { "1:l1-v3": 4, "2:l2-v1": 1 },
      wordMistakes: { "1:ability": 1 },
      wordSeen: { "1:ability": 9 },
    };
    const merged = mergeSyncData(local, remote);
    expect(merged.mistakes).toEqual({ "1:l1-v3": 4, "2:l2-v1": 1 });
    expect(merged.wordMistakes).toEqual({ "1:ability": 3 });
    expect(merged.wordSeen).toEqual({ "1:ability": 9 });
  });

  it("history takes the max per counter per day", () => {
    const local = { ...base(), history: { "2026-10-09": { reviews: 5, quizzes: 1 } } };
    const remote = { ...base(), history: { "2026-10-09": { reviews: 3, quizzes: 4 } } };
    expect(mergeSyncData(local, remote).history["2026-10-09"]).toEqual({
      reviews: 5,
      quizzes: 4,
    });
  });

  it("dayHistory (Task-37) merges per-field max per day and keeps the 35 newest days", () => {
    const local = {
      ...base(),
      dayHistory: {
        "2026-10-09": { day: "2026-10-09", reviews: 5, quizzes: 0, words: 2, dictation: 0, rush: 0 },
        "2026-10-01": { day: "2026-10-01", reviews: 1, quizzes: 1, words: 0, dictation: 0, rush: 0 },
      },
    };
    const remote = {
      ...base(),
      dayHistory: {
        "2026-10-09": { day: "2026-10-09", reviews: 2, quizzes: 3, words: 0, dictation: 1, rush: 1 },
        "2026-10-05": { day: "2026-10-05", reviews: 0, quizzes: 2, words: 0, dictation: 0, rush: 0 },
      },
    };
    const merged = mergeSyncData(local, remote);
    expect(merged.dayHistory?.["2026-10-09"]).toEqual({
      day: "2026-10-09",
      reviews: 5,
      quizzes: 3,
      words: 2,
      dictation: 1,
      rush: 1,
    });
    // union of days from both sides
    expect(Object.keys(merged.dayHistory ?? {}).sort()).toEqual(["2026-10-01", "2026-10-05", "2026-10-09"]);

    // cap: 36 distinct days → oldest (smallest key) dropped
    const many: Record<string, { day: string; reviews: number; quizzes: number; words: number; dictation: number; rush: number }> = {};
    for (let i = 1; i <= 36; i += 1) {
      const k = `2026-09-${String(i).padStart(2, "0")}`;
      many[k] = { day: k, reviews: i, quizzes: 0, words: 0, dictation: 0, rush: 0 };
    }
    const capped = mergeSyncData({ ...base(), dayHistory: many }, base());
    const keys = Object.keys(capped.dayHistory ?? {}).sort();
    expect(keys).toHaveLength(35);
    expect(keys[0]).toBe("2026-09-02"); // oldest dropped
  });

  it("merge survives when neither side has a dayHistory (legacy snapshots)", () => {
    const merged = mergeSyncData(base(), base());
    expect(merged.dayHistory).toEqual({});
  });

  it("rush counters take the max; freeze count is capped at 2", () => {
    const local = { ...base(), rushBest: 120, rushBestCorrect: 9, rushGames: 4, freezeCount: 2 };
    const remote = { ...base(), rushBest: 200, rushBestCorrect: 7, rushGames: 3, freezeCount: 1 };
    const merged = mergeSyncData(local, remote);
    expect(merged.rushBest).toBe(200);
    expect(merged.rushBestCorrect).toBe(9);
    expect(merged.rushGames).toBe(4);
    expect(merged.freezeCount).toBe(2);
  });

  it("unions badges and day sets; freeze used days keep the last 30", () => {
    const local = { ...base(), seenBadges: ["first-quiz"], freezeUsedDays: ["2026-10-01"], goalMetDays: ["2026-10-01"] };
    const remote = {
      ...base(),
      seenBadges: ["first-quiz", "streak-7"],
      freezeUsedDays: ["2026-10-02"],
      goalMetDays: ["2026-10-02"],
    };
    const merged = mergeSyncData(local, remote);
    expect(merged.seenBadges).toEqual(["first-quiz", "streak-7"]);
    expect(merged.freezeUsedDays).toEqual(["2026-10-01", "2026-10-02"]);
    expect(merged.goalMetDays).toEqual(["2026-10-01", "2026-10-02"]);
  });

  it("same-day stats merge per-field max; different days keep the busier side", () => {
    const local = {
      ...base(),
      dayStat: { day: "2026-10-09", reviews: 5, quizzes: 0, words: 3, dictation: 0, rush: 0 },
    };
    const remote = {
      ...base(),
      dayStat: { day: "2026-10-09", reviews: 2, quizzes: 4, words: 0, dictation: 1, rush: 0 },
    };
    const merged = mergeSyncData(local, remote);
    expect(merged.dayStat).toEqual({
      day: "2026-10-09",
      reviews: 5,
      quizzes: 4,
      words: 3,
      dictation: 1,
      rush: 0,
    });

    const olderLocal = { ...base(), dayStat: { day: "2026-10-08", reviews: 1, quizzes: 1, words: 1, dictation: 1, rush: 1 } };
    const newerRemote = { ...base(), dayStat: { day: "2026-10-09", reviews: 2, quizzes: 0, words: 0, dictation: 0, rush: 0 } };
    // older side has bigger total (5 vs 2) → older wins even though newer
    expect(mergeSyncData(olderLocal, newerRemote).dayStat.day).toBe("2026-10-08");
    // newer side has bigger total → newer wins
    expect(mergeSyncData(newerRemote, olderLocal).dayStat.day).toBe("2026-10-08");
  });
});

describe("mergeSyncData — konkur coverage maps (Phase-0 fix)", () => {
  it("unions konkurSeen (true wins) and keeps konkurWrong until both clear it", () => {
    const local = { ...base(), konkurSeen: { "x-21": true }, konkurWrong: { "x-21": true, "x-26": true } };
    const remote = { ...base(), konkurSeen: { "x-34": true, "x-21": true }, konkurWrong: { "x-26": false } };
    const merged = mergeSyncData(local, remote);
    expect(merged.konkurSeen).toEqual({ "x-21": true, "x-34": true });
    // false on remote does NOT clear a true on local (conservative union)
    expect(merged.konkurWrong).toEqual({ "x-21": true, "x-26": true });
  });
});

describe("mergeSyncData — identity pair adoption (Phase-0)", () => {
  it("omits identity from the output when this device already owns one (device keeps its own)", () => {
    const local = { ...base(), userId: "local-id", userSecret: "a".repeat(48) };
    const remote = { ...base(), userId: "remote-id", userSecret: "b".repeat(48) };
    const merged = mergeSyncData(local, remote);
    // the merge output deliberately leaves out identity keys — applyMergedSnapshot
    // uses a partial setState, so the device silently keeps its own pair
    expect(merged.userId).toBeUndefined();
    expect(merged.userSecret).toBeUndefined();
    // …while every other field is still fully merged
    expect(merged.known).toEqual({});
  });

  it("adopts the remote pair only when the device has none", () => {
    const local = base();
    const remote = { ...base(), userId: "remote-id", userSecret: "b".repeat(48) };
    const merged = mergeSyncData(local, remote);
    expect(merged.userId).toBe("remote-id");
    expect(merged.userSecret).toBe("b".repeat(48));
  });

  it("never invents an identity when neither side has one", () => {
    const merged = mergeSyncData(base(), base());
    expect(merged.userId).toBeUndefined();
    expect(merged.userSecret).toBeUndefined();
  });

  it("keeps userName from whichever side has it", () => {
    expect(mergeSyncData({ ...base(), userName: "سارا" }, base()).userName).toBe("سارا");
    expect(mergeSyncData(base(), { ...base(), userName: "رضا" }).userName).toBe("رضا");
  });
});

describe("isEmptyProgress", () => {
  it("true only for a fresh device (no known/results/srs)", () => {
    expect(isEmptyProgress(base())).toBe(true);
    expect(isEmptyProgress({ ...base(), known: { "1:a": true } })).toBe(false);
    expect(isEmptyProgress({ ...base(), results: { "1:vocab": { correct: 1, total: 2, percent: 50, at: "" } } })).toBe(false);
    expect(isEmptyProgress({ ...base(), srs: { "1:a": { level: 0, dueAt: 1 } } })).toBe(false);
  });
});
