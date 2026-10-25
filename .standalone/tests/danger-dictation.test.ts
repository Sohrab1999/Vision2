// «دیکتهٔ واژه‌های خطرناک» — contract tests for the danger-words dictation
// source. The builder must pin the CANONICAL word keys (storeKey), mark the
// source as non-lesson for /api/stats (lesson 0) with a distinct category,
// and keep the result bucket consistent with the danger drill conventions.

import { describe, it, expect } from "vitest";
import { lessons } from "@/data";
import { buildDangerDictation, DICTATION_MIN_DANGER } from "@/lib/danger-dictation";
import { dangerWords, wordByKey, type DangerWord } from "@/lib/word-risk";
import { wordKey } from "@/lib/study-store";

/** danger words synthesized from REAL book vocabulary (resolvable keys) */
function realDanger(count: number): DangerWord[] {
  const out: DangerWord[] = [];
  for (const l of lessons) {
    for (const w of l.vocabulary) {
      const key = wordKey(l.id, w.en);
      out.push({
        key,
        lessonId: l.id,
        en: w.en,
        fa: w.fa,
        mistakes: (out.length % 3) + 1,
        seen: (out.length % 3) + 2,
        rate: 0.5,
      });
      if (out.length >= count) return out;
    }
  }
  return out;
}

describe("buildDangerDictation", () => {
  it("pins the canonical word keys as storeKey (SRS/mistake bookkeeping stays on the keys the mistake feed uses)", () => {
    const danger = realDanger(6);
    expect(danger.length).toBe(6);
    const src = buildDangerDictation(danger);
    expect(src.words).toHaveLength(6);
    for (const [i, w] of src.words.entries()) {
      expect(w.storeKey).toBe(danger[i].key);
      expect(w.storeKey).toMatch(/^\d+:[a-z'-]+$/i);
      // resolvable: the key exists in book vocabulary
      expect(wordByKey(w.storeKey!)).not.toBeNull();
      expect(w.en).toBe(danger[i].en);
      expect(w.fa).toBe(danger[i].fa);
    }
  });

  it("marks the source as a non-lesson row for /api/stats (lesson 0 + distinct category)", () => {
    const src = buildDangerDictation(realDanger(4));
    expect(src.id).toBe("danger");
    expect(src.statsLesson).toBe(0);
    expect(src.category).toBe("danger-dictation");
    expect(src.label).toBe("واژه‌های خطرناک");
  });

  it("keeps the local result bucket distinct from lesson dictations and the danger drill", () => {
    // the tab writes resultKey("danger","dictation"); the drill uses "0:danger"
    const src = buildDangerDictation(realDanger(4));
    expect(`${src.id}:dictation`).toBe("danger:dictation");
    expect(`${src.id}:dictation`).not.toBe("0:danger");
    // every real lesson dictation bucket is "<1|2|3>:dictation" — string id can't collide
    expect(src.id).not.toBe(1);
    expect(src.id).not.toBe(2);
    expect(src.id).not.toBe(3);
  });

  it("degrades gracefully: empty pool → empty words, rose theme kept", () => {
    const src = buildDangerDictation([]);
    expect(src.words).toEqual([]);
    expect(src.color).toBe("rose");
  });

  it("always themed rose (danger panel identity), words mirror the ranked order", () => {
    const danger = realDanger(5);
    const src = buildDangerDictation(danger);
    expect(src.color).toBe("rose");
    expect(src.words.map((w) => w.en)).toEqual(danger.map((d) => d.en));
  });

  it("has the same eligibility floor as the star dictation launcher", () => {
    expect(DICTATION_MIN_DANGER).toBe(4);
  });

  it("integrates with the real ranker: dangerWords output feeds the builder directly", () => {
    const mistakes: Record<string, number> = {};
    const seenMap: Record<string, number> = {};
    for (const l of lessons.slice(0, 2)) {
      for (const w of l.vocabulary.slice(0, 3)) {
        const k = wordKey(l.id, w.en);
        mistakes[k] = 2;
        seenMap[k] = 3;
      }
    }
    const ranked = dangerWords(mistakes, seenMap, 10);
    expect(ranked.length).toBe(6);
    const src = buildDangerDictation(ranked);
    expect(src.words).toHaveLength(6);
    for (const w of src.words) expect(w.storeKey).toBeTruthy();
  });
});
