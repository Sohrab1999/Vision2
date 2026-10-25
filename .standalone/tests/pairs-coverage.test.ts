// ------------------------------------------------------------------
// Round 208 — «حسابِ جفت‌ها»: the 477 booklet syn/ant rows measured
// against the learner's real store signals. Pure-lib guards:
//   ① data pin — per-lesson rows agree with lesson-meta pairCount and
//     TOTAL_PAIRS (two independent data paths must tell one story)
//   ② fresh learner = honest zeros everywhere (no fabricated coverage)
//   ③ both-ends-known row → knownBoth; one-end row → knownOne (XOR)
//   ④ starred-only / wordSeen-only rows count as seen but never known
//   ⑤ cross-lesson head resolution — accept lives in L3 AND L4, so
//     knowing "3:accept" feeds BOTH its antonym rows
//   ⑥ robustness — empty lessons / malformed signals stay zero, no throw
// Fixtures are data-derived (probed: only TWO rows involve
// accept/reject/refuse — L3 accept→reject and L4 accept→refuse).
// ------------------------------------------------------------------

import { describe, it, expect } from "vitest";
import { lessons } from "@/data";
import { LESSONS_META, TOTAL_PAIRS } from "@/data/lesson-meta";
import { buildPairsCoverage } from "@/lib/pairs-coverage";

const fresh = { known: {}, starred: [] as string[], wordSeen: {} };

describe("buildPairsCoverage — حسابِ جفت‌ها (round 208)", () => {
  it("data pin: total = 477 and per-lesson rows agree with lesson-meta pairCount", () => {
    const cov = buildPairsCoverage(lessons, fresh);
    expect(cov.total).toBe(477);
    expect(cov.total).toBe(TOTAL_PAIRS);
    expect(cov.perLesson).toHaveLength(12);
    cov.perLesson.forEach((L, i) => {
      expect(L.lessonId).toBe(i + 1);
      expect(L.rows).toBe(LESSONS_META[i].pairCount);
    });
    // the familiar wealth shape: L3 richest (123), the Prospect trio equal (24)
    expect(cov.perLesson[2].rows).toBe(123);
    expect(cov.perLesson.slice(9).map((L) => L.rows)).toEqual([24, 24, 24]);
  });

  it("fresh learner: honest zeros everywhere — seen/knownBoth/knownOne all 0", () => {
    const cov = buildPairsCoverage(lessons, fresh);
    expect(cov.seen).toBe(0);
    expect(cov.knownBoth).toBe(0);
    expect(cov.knownOne).toBe(0);
    cov.perLesson.forEach((L) => {
      expect(L.seen).toBe(0);
      expect(L.knownBoth).toBe(0);
    });
  });

  it("both ends known → knownBoth; one end known → knownOne (XOR, never double-counted)", () => {
    // probed: exactly two rows involve these words — L3 accept→reject, L4 accept→refuse
    const cov = buildPairsCoverage(lessons, {
      known: { "3:accept": true, "3:reject": true },
      starred: [],
      wordSeen: {},
    });
    expect(cov.seen).toBe(2);
    expect(cov.knownBoth).toBe(1); // L3 accept→reject (both ends known)
    expect(cov.knownOne).toBe(1); // L4 accept→refuse (head known, mate not)
    const l3 = cov.perLesson.find((L) => L.lessonId === 3)!;
    const l4 = cov.perLesson.find((L) => L.lessonId === 4)!;
    expect(l3.seen).toBe(1);
    expect(l3.knownBoth).toBe(1);
    expect(l4.seen).toBe(1);
    expect(l4.knownBoth).toBe(0);
  });

  it("mate-only known is still knownOne — direction does not matter", () => {
    const cov = buildPairsCoverage(lessons, {
      known: { "3:reject": true },
      starred: [],
      wordSeen: {},
    });
    expect(cov.seen).toBe(1);
    expect(cov.knownBoth).toBe(0);
    expect(cov.knownOne).toBe(1);
  });

  it("starred-only rows count as seen but never as known", () => {
    const cov = buildPairsCoverage(lessons, {
      known: {},
      starred: ["3:accept"],
      wordSeen: {},
    });
    // accept is vocab of L3 AND L4 → both its antonym rows are «seen»
    expect(cov.seen).toBe(2);
    expect(cov.knownBoth).toBe(0);
    expect(cov.knownOne).toBe(0);
  });

  it("wordSeen-only rows count as seen (dictation/quiz sightings are real engagement)", () => {
    const cov = buildPairsCoverage(lessons, {
      known: {},
      starred: [],
      wordSeen: { "3:accept": 3 },
    });
    expect(cov.seen).toBe(2);
    expect(cov.knownBoth).toBe(0);
    expect(cov.knownOne).toBe(0);
  });

  it("mixed signals aggregate per lesson exactly", () => {
    const cov = buildPairsCoverage(lessons, {
      known: { "3:accept": true, "3:reject": true },
      starred: ["3:accept"],
      wordSeen: {},
    });
    expect(cov.seen).toBe(2);
    expect(cov.knownBoth).toBe(1);
    expect(cov.knownOne).toBe(1);
  });

  it("robustness: empty lessons → zero coverage; malformed signals never throw", () => {
    const empty = buildPairsCoverage([], { known: { "3:accept": true }, starred: ["3:accept"], wordSeen: { "3:accept": 1 } });
    expect(empty.total).toBe(0);
    expect(empty.perLesson).toEqual([]);
    const torn = buildPairsCoverage(lessons, {
      known: undefined as never,
      starred: undefined as never,
      wordSeen: undefined as never,
    });
    expect(torn.total).toBe(477);
    expect(torn.seen).toBe(0);
  });
});
