// «دیکتهٔ واژه‌های من» — contract tests for the virtual dictation source.
// The builder must pin the CANONICAL star keys (storeKey), mark the source
// as non-lesson for /api/stats (lesson 0) and stay consistent with the
// my-words quiz bucket conventions.

import { describe, it, expect } from "vitest";
import { lessons } from "@/data";
import { buildStarredDictation, DICTATION_MIN_STARS } from "@/lib/starred-dictation";
import { resolveStar } from "@/lib/my-words-resolve";
import type { ResolvedStar } from "@/lib/my-words-resolve";

/** real stars resolved from book content (resolvable like production stars) */
function realStars(count: number): ResolvedStar[] {
  const out: ResolvedStar[] = [];
  for (const l of lessons) {
    for (const w of l.vocabulary) {
      const r = resolveStar(`${l.id}:${w.en}`);
      if (r) out.push(r);
      if (out.length >= count) return out;
    }
  }
  return out;
}

describe("buildStarredDictation", () => {
  it("pins the canonical star keys as storeKey (SRS/known bookkeeping stays on star keys)", () => {
    const stars = realStars(6);
    const src = buildStarredDictation(stars);
    expect(src.words).toHaveLength(6);
    for (const [i, w] of src.words.entries()) {
      expect(w.storeKey).toBe(stars[i].key);
      expect(w.storeKey).toMatch(/^\d+:[a-z'-]+$/i);
      // the real vocabulary object travels through — audio/en/fa intact
      expect(w.en).toBe(stars[i].word.en);
      expect(w.fa).toBe(stars[i].word.fa);
    }
  });

  it("marks the source as a non-lesson row for /api/stats (lesson 0 + distinct category)", () => {
    const src = buildStarredDictation(realStars(4));
    expect(src.id).toBe("my-words");
    expect(src.statsLesson).toBe(0);
    expect(src.category).toBe("my-words-dictation");
    expect(src.label).toBe("واژه‌های من");
  });

  it("keeps the local result bucket convention aligned with the my-words quiz", () => {
    // resultKey accepts string ids — the tab writes resultKey("my-words","dictation")
    const src = buildStarredDictation(realStars(4));
    expect(`${src.id}:dictation`).toBe("my-words:dictation");
  });

  it("degrades gracefully: empty pool → empty words, emerald theme fallback", () => {
    const src = buildStarredDictation([]);
    expect(src.words).toEqual([]);
    expect(src.color).toBe("emerald");
  });

  it("carries the first star's theme color", () => {
    const stars = realStars(5);
    const amberFirst = stars.map((s, i) => (i === 0 ? { ...s, color: "amber" as const } : s));
    expect(buildStarredDictation(amberFirst).color).toBe("amber");
  });

  it("has the same eligibility floor as the quiz launcher", () => {
    expect(DICTATION_MIN_STARS).toBe(4);
  });
});
