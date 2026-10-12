// Phase-1 «پایداری» — tests for backup import sanitization (parseBackup).
// The backup file is an untrusted input: every field must be validated,
// clamped and capped before it ever touches the persisted store.

import { describe, it, expect } from "vitest";
import {
  parseBackup,
  backupSummary,
  countsOf,
  autoBackupAgeFa,
  BACKUP_VERSION,
  type BackupPayload,
} from "@/lib/backup";

const validPayload = (data: Record<string, unknown>) =>
  JSON.stringify({ app: "vision2-webbook", version: BACKUP_VERSION, exportedAt: "2026-10-10T10:00:00Z", data });

describe("parseBackup — rejection", () => {
  it("rejects invalid JSON with a Persian message", () => {
    expect(() => parseBackup("{not json")).toThrow("فایل، JSON معتبری نیست.");
  });

  it("rejects files from another app", () => {
    expect(() => parseBackup(JSON.stringify({ app: "other-app", version: 1, data: {} }))).toThrow(
      "این فایل پشتیبانِ وب‌کتاب ویژن ۲ نیست."
    );
  });

  it("rejects unsupported versions", () => {
    expect(() => parseBackup(JSON.stringify({ app: "vision2-webbook", version: 0, data: {} }))).toThrow(
      "نسخهٔ فایل پشتیبان پشتیبانی نمی‌شود."
    );
    expect(() => parseBackup(JSON.stringify({ app: "vision2-webbook", version: BACKUP_VERSION + 1, data: {} }))).toThrow(
      "نسخهٔ فایل پشتیبان پشتیبانی نمی‌شود."
    );
  });
});

describe("parseBackup — sanitization", () => {
  it("keeps only well-formed quiz results", () => {
    const payload = parseBackup(
      validPayload({
        results: {
          "1:vocab": { correct: 8, total: 10, percent: 80, at: "2026-10-01" },
          "2:bad": { correct: "x", total: 10 }, // no percent → dropped
          "3:partial": { percent: 50 }, // no correct/total → dropped
        },
      })
    );
    expect(Object.keys(payload.data.results)).toEqual(["1:vocab"]);
    expect(payload.data.results["1:vocab"]).toEqual({ correct: 8, total: 10, percent: 80, at: "2026-10-01" });
  });

  it("gives results without a timestamp a fresh one", () => {
    const payload = parseBackup(
      validPayload({ results: { "1:vocab": { correct: 8, total: 10, percent: 80 } } })
    );
    expect(payload.data.results["1:vocab"].at).toBeTruthy();
  });

  it("clamps SRS levels into 0..5 and drops malformed items", () => {
    const payload = parseBackup(
      validPayload({
        srs: {
          "1:a": { level: 9, dueAt: 123 }, // clamped to 5
          "1:b": { level: -3, dueAt: 123 }, // clamped to 0
          "1:c": { level: "x", dueAt: 123 }, // dropped
          "1:d": { level: 2 }, // no dueAt → dropped
        },
      })
    );
    expect(payload.data.srs["1:a"].level).toBe(5);
    expect(payload.data.srs["1:b"].level).toBe(0);
    expect(payload.data.srs["1:c"]).toBeUndefined();
    expect(payload.data.srs["1:d"]).toBeUndefined();
  });

  it("keeps only boolean known flags", () => {
    const payload = parseBackup(validPayload({ known: { "1:a": true, "1:b": "yes", "1:c": false } }));
    expect(payload.data.known).toEqual({ "1:a": true, "1:c": false });
  });

  it("clamps freezeCount into 0..2 (rounded)", () => {
    expect(parseBackup(validPayload({ freezeCount: -5 })).data.freezeCount).toBe(0);
    expect(parseBackup(validPayload({ freezeCount: 1.4 })).data.freezeCount).toBe(1);
    expect(parseBackup(validPayload({ freezeCount: 1.7 })).data.freezeCount).toBe(2);
    expect(parseBackup(validPayload({ freezeCount: 99 })).data.freezeCount).toBe(2);
    expect(parseBackup(validPayload({})).data.freezeCount).toBe(0);
  });

  it("caps freezeUsedDays at the last 30 and goalMetDays at the last 14", () => {
    const days30 = Array.from({ length: 40 }, (_, i) => `2026-09-${String(1 + i).padStart(2, "0")}`);
    const payload = parseBackup(validPayload({ freezeUsedDays: days30, goalMetDays: days30 }));
    expect(payload.data.freezeUsedDays).toHaveLength(30);
    expect(payload.data.freezeUsedDays[0]).toBe("2026-09-11"); // oldest kept is day 11
    expect(payload.data.goalMetDays).toHaveLength(14);
  });

  it("sanitizes dayHistory (Task-37): valid day keys only, clamped counters, 35-day cap", () => {
    const payload = parseBackup(
      validPayload({
        dayHistory: {
          "2026-10-09": { day: "2026-10-09", reviews: 5, quizzes: -3, words: 1.7, dictation: "x", rush: 99999 },
          "20261010": { day: "20261010", reviews: 50 }, // invalid key → dropped
          "2026-10-11": "garbage", // non-object → dropped
        },
      })
    );
    const dh = payload.data.dayHistory ?? {};
    expect(Object.keys(dh).sort()).toEqual(["2026-10-09"]);
    expect(dh["2026-10-09"]).toEqual({
      day: "2026-10-09",
      reviews: 5,
      quizzes: 0, // negative clamped to 0
      words: 2, // rounded
      dictation: 0, // non-number clamped
      rush: 9999, // clamped to 9999
    });

    // 40 valid days → only the 35 newest survive
    const many: Record<string, unknown> = {};
    for (let i = 1; i <= 40; i += 1) {
      const k = `2026-09-${String(i).padStart(2, "0")}`;
      many[k] = { day: k, reviews: i, quizzes: 0, words: 0, dictation: 0, rush: 0 };
    }
    const capped = parseBackup(validPayload({ dayHistory: many }));
    const keys = Object.keys(capped.data.dayHistory ?? {}).sort();
    expect(keys).toHaveLength(35);
    expect(keys[0]).toBe("2026-09-06");
  });

  it("sanitizes konkur maps: only true entries, keys trimmed to 80, capped at 2000", () => {
    const payload = parseBackup(
      validPayload({
        konkurSeen: { "x-21": true, "x-26": false, "x-34": 1 },
        konkurWrong: { "x-21": true },
      })
    );
    expect(payload.data.konkurSeen).toEqual({ "x-21": true });
    expect(payload.data.konkurWrong).toEqual({ "x-21": true });

    const big: Record<string, boolean> = {};
    for (let i = 0; i < 3000; i++) big[`x-${i}`] = true;
    const capped = parseBackup(validPayload({ konkurSeen: big }));
    expect(Object.keys(capped.data.konkurSeen ?? {})).toHaveLength(2000);
  });

  it("validates the identity pair (userId length, hex secret)", () => {
    const good = parseBackup(validPayload({ userId: "learner-12345", userSecret: "ab".repeat(24) }));
    expect(good.data.userId).toBe("learner-12345");
    expect(good.data.userSecret).toBe("ab".repeat(24));

    const bad = parseBackup(
      validPayload({ userId: "abc", userSecret: "zzzz-not-hex" })
    );
    expect(bad.data.userId).toBeUndefined();
    expect(bad.data.userSecret).toBeUndefined();
  });

  it("falls back to defaults for scalar fields", () => {
    const payload = parseBackup(
      validPayload({ userName: 42, streak: "x", avatarColor: null })
    );
    expect(payload.data.userName).toBe("");
    expect(payload.data.streak).toBe(0);
    expect(payload.data.avatarColor).toBe("emerald");
  });
});

describe("backupSummary & countsOf", () => {
  it("summarizes a payload for the confirm toast", () => {
    const payload = parseBackup(
      validPayload({
        known: { "1:a": true, "1:b": false, "1:c": true },
        results: { "1:vocab": { correct: 1, total: 2, percent: 50 } },
        srs: { "1:a": { level: 1, dueAt: 1 } },
        mistakes: { "1:l1-v3": 2 },
      })
    );
    expect(backupSummary(payload)).toEqual({ known: 2, results: 1, srs: 1, mistakes: 1 });
    expect(countsOf(payload.data)).toEqual({
      known: 2,
      results: 1,
      srs: 1,
      mistakes: 1,
      history: 0,
      dayHistory: 0,
      konkur: 0,
      duel: 0,
    });
  });

  it("counts konkur maps for the auto-backup fingerprint", () => {
    const payload = parseBackup(validPayload({ konkurSeen: { "x-1": true, "x-2": true }, konkurWrong: { "x-3": true } }));
    expect(countsOf(payload.data).konkur).toBe(3);
  });
});

describe("autoBackupAgeFa", () => {
  it("labels fresh, minutes, hours and days in Persian", () => {
    const now = Date.now();
    expect(autoBackupAgeFa(new Date(now).toISOString())).toBe("همین حالا");
    expect(autoBackupAgeFa(new Date(now - 5 * 60_000).toISOString())).toBe("۵ دقیقه پیش");
    expect(autoBackupAgeFa(new Date(now - 3 * 3600_000).toISOString())).toBe("۳ ساعت پیش");
    expect(autoBackupAgeFa(new Date(now - 2 * 86_400_000).toISOString())).toBe("۲ روز پیش");
    expect(autoBackupAgeFa("not-a-date")).toBe("نامشخص");
  });
});

describe("backup identity adoption is explicit", () => {
  it("exposes the pair only through payload.data (used by applyBackup)", () => {
    const payload: BackupPayload = parseBackup(
      validPayload({ userId: "learner-12345", userSecret: "ab".repeat(24) })
    );
    expect(payload.data.userId && payload.data.userSecret).toBeTruthy();
  });
});
