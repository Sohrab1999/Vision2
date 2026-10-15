// ------------------------------------------------------------------
// Round 207 — «دریلِ جفت‌ها»: buildPairsDrillQuiz mixes per-lesson
// syn/ant deals into one multi-lesson drill (the «جفت‌دار» lens CTA).
// Invariants that must survive the mix:
//   ① cap respected (SYN_QUIZ_CAP)
//   ② multi-lesson coverage when many lessons are given (ids span ≥3)
//   ③ per-question purity survives: unique options, answer in range,
//     stem kind agrees with the id, translation present
//   ④ ids unique (no double deal of the same row)
//   ⑤ single-lesson input still yields ≤cap valid questions
//   ⑥ syn-only lessons (1-2) contribute only synonym stems
//   ⑦ real shuffle across runs (not one frozen order)
// ------------------------------------------------------------------

import { describe, it, expect } from "vitest";
import { lessons } from "@/data";
import { buildPairsDrillQuiz, SYN_QUIZ_CAP } from "@/lib/syn-ant-quiz";

describe("buildPairsDrillQuiz — pure guards (round 207)", () => {
  it("caps the deal at SYN_QUIZ_CAP (8)", () => {
    const drill = buildPairsDrillQuiz(lessons);
    expect(drill.length).toBe(SYN_QUIZ_CAP);
    expect(SYN_QUIZ_CAP).toBe(8);
  });

  it("spans multiple lessons when all 12 are given (≥3 distinct lesson ids)", () => {
    const drill = buildPairsDrillQuiz(lessons);
    const lessonIds = new Set(drill.map((q) => q.id.split("-")[0]));
    expect(lessonIds.size).toBeGreaterThanOrEqual(3);
    // every id stays in the booklet namespace l{N}-syn{i} / l{N}-ant{i}
    for (const id of drill.map((q) => q.id)) {
      expect(id).toMatch(/^l\d+-(syn|ant)\d+$/);
    }
  });

  it("keeps every per-question purity invariant after the mix", () => {
    for (const q of buildPairsDrillQuiz(lessons)) {
      expect(new Set(q.options).size).toBe(q.options.length); // unique options
      expect(q.options.length).toBe(4); // four-choice house standard
      expect(q.answer).toBeGreaterThanOrEqual(0);
      expect(q.answer).toBeLessThan(q.options.length);
      expect(q.translation).toBeTruthy();
      const isSyn = q.id.includes("-syn");
      expect(q.question).toContain(isSyn ? "هم‌معنی" : "متضاد");
      // kind agreement: the id's direction matches the stem's wording
      expect(isSyn ? q.id.includes("-ant") : q.id.includes("-syn")).toBe(false);
    }
  });

  it("never double-deals the same row (ids unique)", () => {
    const drill = buildPairsDrillQuiz(lessons);
    expect(new Set(drill.map((q) => q.id)).size).toBe(drill.length);
  });

  it("a single-lesson scope behaves like the per-lesson builder (≤cap, valid)", () => {
    const l3 = lessons.find((l) => l.id === 3)!;
    const drill = buildPairsDrillQuiz([l3]);
    expect(drill.length).toBeLessThanOrEqual(SYN_QUIZ_CAP);
    expect(drill.length).toBeGreaterThan(0);
    for (const q of drill) expect(q.id).toMatch(/^l3-(syn|ant)\d+$/);
  });

  it("syn-only lessons (1-2, no antonym tables) contribute only synonym stems", () => {
    const l1 = lessons.find((l) => l.id === 1)!;
    const l2 = lessons.find((l) => l.id === 2)!;
    const drill = buildPairsDrillQuiz([l1, l2]);
    expect(drill.length).toBeGreaterThan(0);
    for (const q of drill) {
      expect(q.id).not.toMatch(/-ant\d+$/);
      expect(q.question).toContain("هم‌معنی");
    }
  });

  it("respects a smaller cap when given", () => {
    expect(buildPairsDrillQuiz(lessons, 4).length).toBe(4);
    expect(buildPairsDrillQuiz(lessons, 1).length).toBe(1);
  });

  it("really shuffles across runs (order is not frozen)", () => {
    const a = buildPairsDrillQuiz(lessons).map((q) => q.id).join("|");
    let same = 0;
    for (let i = 0; i < 6; i++) {
      if (buildPairsDrillQuiz(lessons).map((q) => q.id).join("|") === a) same++;
    }
    expect(same).toBeLessThan(6);
  });

  it("stays within the per-lesson builder's contract (row-index range)", () => {
    // every drill deal is an independent random draw, so ids differ run to
    // run — but each id must name a REAL row of that lesson's tables
    const l4 = lessons.find((l) => l.id === 4)!;
    const synRows = (l4.synonyms ?? []).length;
    const antRows = (l4.antonyms ?? []).length;
    const drill = buildPairsDrillQuiz([l4], SYN_QUIZ_CAP);
    expect(drill.length).toBeGreaterThan(0);
    for (const q of drill) {
      const m = q.id.match(/^l4-(syn|ant)(\d+)$/);
      expect(m, `id ${q.id} outside lesson-4 namespace`).not.toBeNull();
      const limit = m![1] === "syn" ? synRows : antRows;
      expect(Number(m![2])).toBeLessThan(limit);
    }
  });
});
