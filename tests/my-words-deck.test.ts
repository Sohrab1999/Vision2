// tests for «فلش‌کارت واژه‌های من» — buildMyWordsDeck (lib/my-words-deck.ts)

import { describe, it, expect } from "vitest";
import { buildMyWordsDeck, dominantLessonId } from "@/lib/my-words-deck";
import { lessons } from "@/data";

const enAt = (lessonId: number, n: number) => lessons.find((l) => l.id === lessonId)!.vocabulary[n];
const keyOf = (lessonId: number, n: number) => `${lessonId}:${enAt(lessonId, n).en.toLowerCase()}`;

describe("buildMyWordsDeck", () => {
  it("resolves starred keys into deck cards with real word objects", () => {
    const keys = [keyOf(1, 0), keyOf(2, 1), keyOf(3, 2)];
    const deck = buildMyWordsDeck(keys, () => false, "all");
    expect(deck).toHaveLength(3);
    expect(deck[0].lessonId).toBe(1);
    expect(deck[0].word).toEqual(enAt(1, 0));
    expect(deck[0].key).toBe(keyOf(1, 0));
    expect(deck[2].word.fa).toBe(enAt(3, 2).fa);
  });

  it("preserves starred order (oldest → newest)", () => {
    const keys = [keyOf(3, 0), keyOf(1, 1), keyOf(2, 2)];
    const deck = buildMyWordsDeck(keys, () => false, "all");
    expect(deck.map((c) => c.key)).toEqual(keys);
  });

  it("drops dangling keys instead of crashing", () => {
    const deck = buildMyWordsDeck(["1:does-not-exist-xyz", keyOf(1, 0), "junk-no-colon"], () => false, "all");
    expect(deck).toHaveLength(1);
    expect(deck[0].lessonId).toBe(1);
  });

  it("scope unmastered filters out known words, scope all keeps them", () => {
    const keys = [keyOf(1, 0), keyOf(1, 1), keyOf(1, 2)];
    const knownKey = keyOf(1, 1);
    const unmastered = buildMyWordsDeck(keys, (k) => k === knownKey, "unmastered");
    expect(unmastered.map((c) => c.key)).toEqual([keys[0], keys[2]]);
    const all = buildMyWordsDeck(keys, (k) => k === knownKey, "all");
    expect(all).toHaveLength(3);
  });

  it("empty input yields an empty deck", () => {
    expect(buildMyWordsDeck([], () => false, "all")).toEqual([]);
    expect(buildMyWordsDeck([], () => true, "unmastered")).toEqual([]);
  });

  it("dominantLessonId picks the biggest share and returns 0 for empty", () => {
    const deck = buildMyWordsDeck([keyOf(2, 0), keyOf(2, 3), keyOf(1, 0)], () => false, "all");
    expect(dominantLessonId(deck)).toBe(2);
    expect(dominantLessonId([])).toBe(0);
  });
});
