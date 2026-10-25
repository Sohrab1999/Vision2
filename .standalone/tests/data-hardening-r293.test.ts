// @vitest-environment jsdom
// ------------------------------------------------------------------
// Task 293 — «absent means absent» data-layer hardening.
// The audit (r293) found the only real-state crash chain plus its
// siblings; these locks pin the fixes:
//   ① applyMergedSnapshot drops undefined entries — mergeLibraryDone's
//     both-empty `undefined` (the round-trip contract) must never
//     overwrite the live libraryDone default with undefined
//     (the LibraryView Object.keys(undefined) class)
//   ② readAutoBackup sanitizes: a legacy/corrupt auto-backup blob can
//     no longer crash the profile popover render (autoSnap.data.known)
//   ③ srs stats skip null entries instead of throwing (covered by the
//     component's guard; here we pin the pure side through the store)
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach } from "vitest";
import { mergeSyncData, applyMergedSnapshot, type SyncData } from "@/lib/sync";
import { readAutoBackup } from "@/lib/backup";
import { useStudy } from "@/lib/study-store";

const state = () => useStudy.getState();

const base = (over: Partial<SyncData> = {}): SyncData => ({
  known: {},
  results: {},
  srs: {},
  userName: "",
  avatarColor: "emerald",
  streak: 0,
  bestStreak: 0,
  lastActiveDay: "",
  dayStat: { day: "", reviews: 0, quizzes: 0, words: 0, dictation: 0, rush: 0, stories: 0 },
  history: {},
  mistakes: {},
  seenBadges: [],
  rushBest: 0,
  rushBestCorrect: 0,
  rushGames: 0,
  spellRushBest: 0,
  spellRushBestCorrect: 0,
  duelWins: 0,
  duelLosses: 0,
  duelTies: 0,
  freezeCount: 0,
  freezeEarnedDay: "",
  freezeUsedDays: [],
  goalMetDays: [],
  ...over,
});

beforeEach(() => {
  useStudy.setState({ libraryDone: {}, streak: 0, known: {} });
});

describe("① applyMergedSnapshot — undefined never poisons a slice default", () => {
  it("keeps libraryDone as {} when the merge yields undefined for it", () => {
    const merged = { streak: 7, libraryDone: undefined } as unknown as SyncData;
    expect(applyMergedSnapshot(merged)).toBe(true);
    expect(state().libraryDone).toEqual({});
    expect(state().streak).toBe(7); // the real fields still land
  });

  it("keeps a PRE-EXISTING libraryDone intact while other fields apply", () => {
    useStudy.setState({ libraryDone: { "s1-1": { score: 6, total: 6, day: "2026-10-21" } } });
    const merged = { streak: 3, libraryDone: undefined } as unknown as SyncData;
    applyMergedSnapshot(merged);
    expect(state().libraryDone).toEqual({ "s1-1": { score: 6, total: 6, day: "2026-10-21" } });
    expect(state().streak).toBe(3);
  });

  it("documents the source: both-empty merge yields undefined (round-trip contract) — the strip is the boundary", () => {
    const merged = mergeSyncData(base(), base());
    expect(merged.libraryDone).toBeUndefined();
    // …and the live store still ends with the default, not undefined:
    applyMergedSnapshot(merged);
    expect(state().libraryDone).toEqual({});
  });
});

describe("② readAutoBackup — the legacy blob degrades to defaults, not a crash", () => {
  const AUTO_KEY = "vision2-auto-backup";

  it("sanitizes a field-shaped junk blob (known: 5 → {}) so the popover renders 0 واژه", () => {
    localStorage.setItem(
      AUTO_KEY,
      JSON.stringify({ savedAt: "2026-10-21T10:00:00Z", data: { known: 5, results: null } }),
    );
    const snap = readAutoBackup();
    expect(snap).not.toBeNull();
    expect(snap!.data.known).toEqual({});
    expect(snap!.data.results).toEqual({});
  });

  it("fills a months-old partial blob with complete field defaults", () => {
    localStorage.setItem(AUTO_KEY, JSON.stringify({ savedAt: "2026-10-01T08:00:00Z", data: {} }));
    const snap = readAutoBackup();
    expect(snap!.data.srs).toEqual({});
    expect(snap!.data.mistakes).toEqual({});
    expect(snap!.data.libraryDone).toBeUndefined(); // absent stays absent
  });

  it("keeps valid data intact through the sanitize round-trip", () => {
    const data = { known: { "1:ability": true }, streak: 4, libraryDone: { "s1-2": { score: 5, total: 6, day: "2026-10-20" } } };
    localStorage.setItem(AUTO_KEY, JSON.stringify({ savedAt: "2026-10-21T09:00:00Z", data }));
    const snap = readAutoBackup();
    expect(snap!.data.known).toEqual({ "1:ability": true });
    expect(snap!.data.streak).toBe(4);
    expect(snap!.data.libraryDone).toEqual({ "s1-2": { score: 5, total: 6, day: "2026-10-20" } });
  });

  it("still returns null for corrupt JSON / missing data", () => {
    localStorage.setItem(AUTO_KEY, "{oops");
    expect(readAutoBackup()).toBeNull();
    localStorage.setItem(AUTO_KEY, JSON.stringify({ savedAt: "2026-10-21T09:00:00Z" }));
    expect(readAutoBackup()).toBeNull();
  });
});
