// «دیکتهٔ سررسیدها» — contract tests for the SRS-due dictation source.
// The builder must pin the CANONICAL word keys (storeKey), mark the source
// as non-lesson for /api/stats (lesson 0) with a distinct category, keep the
// result bucket consistent with the virtual-source naming style, and — the
// point of the whole feature — a correct spelling on a due word must be a
// REAL SRS upgrade via reviewWord (the same engine the chips drive).

import { describe, it, expect, beforeEach } from "vitest";
import { lessons } from "@/data";
import { buildDueDictation, DICTATION_MIN_DUE } from "@/lib/due-dictation";
import { srsDueSummary } from "@/lib/srs-due";
import { wordByKey } from "@/lib/word-risk";
import { wordKey, resultKey, useStudy } from "@/lib/study-store";
import type { SrsItem } from "@/lib/study-store";

/** due-now words synthesized from REAL book vocabulary (resolvable keys) */
function realDue(count: number, now: number): ReturnType<typeof srsDueSummary>["words"] {
  const srs: Record<string, SrsItem> = {};
  let added = 0;
  for (const l of lessons) {
    for (const w of l.vocabulary) {
      const key = wordKey(l.id, w.en);
      // alternate overdue amounts so the oldest-first ordering is observable
      srs[key] = { level: added % 3, dueAt: now - (added + 1) * 3_600_000 };
      added++;
      if (added >= count) return srsDueSummary(srs, now, count).words;
    }
  }
  return srsDueSummary(srs, now, count).words;
}

const NOW = 1_800_000_000_000;

describe("buildDueDictation", () => {
  it("pins the canonical word keys as storeKey (reviewWord advances the REAL schedule)", () => {
    const due = realDue(6, NOW);
    expect(due.length).toBe(6);
    const src = buildDueDictation(due);
    expect(src.words).toHaveLength(6);
    for (const [i, w] of src.words.entries()) {
      expect(w.storeKey).toBe(due[i].key);
      expect(w.storeKey).toMatch(/^\d+:[a-z'-]+$/i);
      // resolvable: the key exists in book vocabulary
      expect(wordByKey(w.storeKey!)).not.toBeNull();
      expect(w.en).toBe(due[i].en);
      expect(w.fa).toBe(due[i].fa);
    }
  });

  it("marks the source as a non-lesson row for /api/stats (lesson 0 + distinct category)", () => {
    const src = buildDueDictation(realDue(4, NOW));
    expect(src.id).toBe("srs-due");
    expect(src.statsLesson).toBe(0);
    expect(src.category).toBe("srs-due-dictation");
    expect(src.label).toBe("سررسیدها");
  });

  it("keeps the local result bucket distinct from lesson dictations and the other virtual sources", () => {
    const src = buildDueDictation(realDue(4, NOW));
    expect(`${src.id}:dictation`).toBe("srs-due:dictation");
    expect(resultKey(src.id, "dictation")).toBe("srs-due:dictation");
    expect(`${src.id}:dictation`).not.toBe(resultKey(0, "danger"));
    expect(`${src.id}:dictation`).not.toBe("my-words:dictation");
    // every real lesson dictation bucket is "<1|2|3>:dictation" — string id can't collide
    expect(src.id).not.toBe(1);
    expect(src.id).not.toBe(2);
    expect(src.id).not.toBe(3);
  });

  it("covers the FULL due list — not just the 5 preview chips (uncapped pool in → uncapped pool out)", () => {
    // the panel's chip preview caps at 5, but the session must see everything due
    const due = realDue(9, NOW);
    expect(due.length).toBe(9);
    const src = buildDueDictation(due);
    expect(src.words).toHaveLength(9);
  });

  it("preserves the oldest-due-first order srsDueSummary guarantees (most neglected words lead)", () => {
    const due = realDue(5, NOW);
    const src = buildDueDictation(due);
    expect(src.words.map((w) => w.en)).toEqual(due.map((d) => d.en));
    for (let i = 1; i < due.length; i++) {
      expect(due[i].dueAt).toBeGreaterThanOrEqual(due[i - 1].dueAt);
    }
  });

  it("degrades gracefully: empty pool → empty words, rose theme kept", () => {
    const src = buildDueDictation([]);
    expect(src.words).toEqual([]);
    expect(src.color).toBe("rose");
  });

  it("has the same eligibility floor as the other targeted dictation launchers", () => {
    expect(DICTATION_MIN_DUE).toBe(4);
  });

  it("dictating a due word is a REAL review: correct upgrades the schedule, a miss resets it", () => {
    const key = wordKey(lessons[0].id, lessons[0].vocabulary[0].en);
    const before = Date.now();
    useStudy.setState({ srs: { [key]: { level: 2, dueAt: before - 1000 } } });
    // correct spelling → level+1, dueAt pushed past the old schedule
    useStudy.getState().reviewWord(key, true);
    const up = useStudy.getState().srs[key];
    expect(up.level).toBe(3);
    expect(up.dueAt).toBeGreaterThan(before);
    // wrong spelling → back to step 0
    useStudy.getState().reviewWord(key, false);
    const down = useStudy.getState().srs[key];
    expect(down.level).toBe(0);
  });
});

beforeEach(() => {
  useStudy.setState({ srs: {} });
});
