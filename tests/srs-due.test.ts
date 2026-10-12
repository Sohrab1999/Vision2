// tests for «سررسید الآن» preview — srsDueSummary (lib/srs-due.ts)
// contract: words-only (no "q:" exam keys), due-now only, oldest-due first,
// dangling keys silently dropped, limit caps only the chip list while
// dueTotal stays uncapped and resolvable-only (self-consistent block).

import { describe, it, expect } from "vitest";
import { srsDueSummary, type SrsDueWord } from "@/lib/srs-due";
import type { SrsItem } from "@/lib/study-store";
import { lessons } from "@/data";

const NOW = 1_800_000_000_000;
const MIN = 60_000;

const wordAt = (lessonId: number, n: number) => lessons.find((l) => l.id === lessonId)!.vocabulary[n];
const keyOf = (lessonId: number, n: number) => `${lessonId}:${wordAt(lessonId, n).en.toLowerCase()}`;

const item = (overdueMs: number, level = 0): SrsItem => ({ level, dueAt: NOW - overdueMs });
const future = (ms: number, level = 3): SrsItem => ({ level, dueAt: NOW + ms });

const enOf = (list: SrsDueWord[]) => list.map((w) => w.en);

describe("srsDueSummary", () => {
  it("keeps only words whose review is due right now", () => {
    const srs = {
      [keyOf(1, 0)]: item(5 * MIN), // due 5 min ago
      [keyOf(1, 1)]: future(30 * MIN), // not yet
    };
    const out = srsDueSummary(srs, NOW);
    expect(enOf(out.words)).toEqual([wordAt(1, 0).en]);
    expect(out.dueTotal).toBe(1);
  });

  it("excludes exam-bank question keys (q: prefix) — vocabulary widgets only", () => {
    const srs = {
      [keyOf(1, 0)]: item(2 * MIN),
      "q:konkur-12": item(90 * MIN), // overdue konkur question must NOT leak in
    };
    const out = srsDueSummary(srs, NOW);
    expect(out.words).toHaveLength(1);
    expect(out.words[0].key).toBe(keyOf(1, 0));
    expect(out.dueTotal).toBe(1);
  });

  it("sorts oldest-due first (most neglected word leads)", () => {
    const srs = {
      [keyOf(1, 0)]: item(10 * MIN), // less overdue
      [keyOf(2, 0)]: item(3 * 60 * MIN), // way overdue
      [keyOf(3, 0)]: item(60 * MIN), // in between
    };
    const out = srsDueSummary(srs, NOW);
    expect(out.words.map((w) => w.key)).toEqual([keyOf(2, 0), keyOf(3, 0), keyOf(1, 0)]);
  });

  it("drops dangling keys whose word no longer exists in the book", () => {
    const srs = {
      [keyOf(1, 0)]: item(4 * MIN),
      "1:zombie-word-xyz": item(8 * MIN), // removed from content
      "9:another-ghost": item(9 * MIN), // no lesson 9
    };
    const out = srsDueSummary(srs, NOW);
    expect(out.words).toHaveLength(1);
    expect(out.words[0].key).toBe(keyOf(1, 0));
    expect(out.dueTotal).toBe(1); // dangling keys never inflate the count
  });

  it("carries en/fa/level/dueAt resolved from the real vocabulary", () => {
    const srs = { [keyOf(2, 3)]: item(7 * MIN, 2) };
    const [w] = srsDueSummary(srs, NOW).words;
    expect(w.en).toBe(wordAt(2, 3).en);
    expect(w.fa).toBe(wordAt(2, 3).fa);
    expect(w.level).toBe(2);
    expect(w.dueAt).toBe(NOW - 7 * MIN);
  });

  it("caps the chip list at the limit but keeps dueTotal uncapped", () => {
    const srs: Record<string, SrsItem> = {};
    for (let i = 0; i < 8; i++) srs[keyOf(1, i)] = item((i + 1) * MIN);
    const out = srsDueSummary(srs, NOW, 5);
    expect(out.words).toHaveLength(5);
    expect(out.dueTotal).toBe(8);
    expect(srsDueSummary(srs, NOW, 0).words).toHaveLength(0);
    expect(srsDueSummary(srs, NOW, 0).dueTotal).toBe(8);
  });

  it("dueTotal counts only resolvable words even beyond the preview limit", () => {
    const srs: Record<string, SrsItem> = {};
    for (let i = 0; i < 6; i++) srs[keyOf(2, i)] = item((i + 1) * MIN);
    srs["1:ghost-word"] = item(20 * MIN); // dangling beyond limit — not counted
    const out = srsDueSummary(srs, NOW, 5);
    expect(out.words).toHaveLength(5);
    expect(out.dueTotal).toBe(6); // 6 real + 0 dangling
  });

  it("returns an empty summary for an empty or all-future queue", () => {
    expect(srsDueSummary({}, NOW)).toEqual({ words: [], dueTotal: 0 });
    expect(srsDueSummary({ [keyOf(1, 2)]: future(10 * MIN) }, NOW)).toEqual({ words: [], dueTotal: 0 });
  });

  it("survives corrupt entries (missing/NaN dueAt) without throwing", () => {
    const srs = {
      [keyOf(1, 0)]: { level: 1, dueAt: Number.NaN } as SrsItem,
      [keyOf(1, 1)]: item(3 * MIN),
    };
    const out = srsDueSummary(srs, NOW);
    expect(out.words.map((w) => w.key)).toEqual([keyOf(1, 1)]);
    expect(out.dueTotal).toBe(1);
  });
});
