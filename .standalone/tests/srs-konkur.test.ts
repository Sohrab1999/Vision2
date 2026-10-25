// Phase-1 «پایداری» — tests for the SM-2-lite spaced repetition engine
// and the konkur bookkeeping that live on the persisted study store.
// The store runs in-memory under vitest (skipHydration + no localStorage).

import { describe, it, expect, beforeEach } from "vitest";
import {
  useStudy,
  SRS_INTERVALS,
  SRS_LABELS,
  srsDueTotal,
  srsQuestionDueTotal,
  srsQuestionDueIds,
} from "@/lib/study-store";
import { firstLessonWithDue, srsDueCount } from "@/lib/study-store";
import { recordKonkurResults, hardIdsOf } from "@/lib/konkur";
import type { QuizQuestion } from "@/lib/study-types";

const state = () => useStudy.getState();

const resetProgress = () =>
  useStudy.setState({
    srs: {},
    mistakes: {},
    konkurSeen: {},
    konkurWrong: {},
    wordSeen: {},
    wordMistakes: {},
  });

beforeEach(resetProgress);

describe("SRS intervals", () => {
  it("has 6 matching intervals/labels from 15 minutes to 1 month", () => {
    expect(SRS_INTERVALS).toHaveLength(6);
    expect(SRS_LABELS).toHaveLength(6);
    expect(SRS_INTERVALS[0]).toBe(15 * 60_000);
    expect(SRS_INTERVALS[5]).toBe(30 * 86_400_000);
    // strictly increasing — the ladder must never go backwards
    for (let i = 1; i < SRS_INTERVALS.length; i++) {
      expect(SRS_INTERVALS[i]).toBeGreaterThan(SRS_INTERVALS[i - 1]);
    }
  });
});

describe("reviewWord — level progression", () => {
  it("a new correct answer starts at level 0 with a 15-minute due date", () => {
    const before = Date.now();
    state().reviewWord("1:l1-v3", true);
    const item = state().srs["1:l1-v3"];
    expect(item.level).toBe(0);
    expect(item.dueAt).toBeGreaterThanOrEqual(before + SRS_INTERVALS[0] - 50);
  });

  it("consecutive correct answers climb the ladder one level at a time", () => {
    state().reviewWord("1:l1-v3", true);
    state().reviewWord("1:l1-v3", true);
    state().reviewWord("1:l1-v3", true);
    expect(state().srs["1:l1-v3"].level).toBe(2);
  });

  it("a wrong answer resets the level to 0", () => {
    for (let i = 0; i < 3; i++) state().reviewWord("1:l1-v3", true);
    state().reviewWord("1:l1-v3", false);
    expect(state().srs["1:l1-v3"].level).toBe(0);
  });

  it("caps at the top level instead of overflowing", () => {
    for (let i = 0; i < 10; i++) state().reviewWord("1:l1-v3", true);
    expect(state().srs["1:l1-v3"].level).toBe(SRS_INTERVALS.length - 1);
    expect(state().srs["1:l1-v3"].level).toBe(5);
  });
});

describe("due counting", () => {
  it("counts only overdue items of the requested lesson", () => {
    useStudy.setState({
      srs: {
        "1:overdue": { level: 1, dueAt: Date.now() - 1000 },
        "1:future": { level: 2, dueAt: Date.now() + 86_400_000 },
        "2:overdue": { level: 1, dueAt: Date.now() - 1000 },
      },
    });
    expect(srsDueCount(state().srs, 1)).toBe(1);
    expect(srsDueCount(state().srs, 2)).toBe(1);
    expect(srsDueCount(state().srs, 3)).toBe(0);
    expect(srsDueTotal(state().srs)).toBe(2);
    expect(firstLessonWithDue(state().srs)).toBe(1);
  });

  it("returns null when nothing is due", () => {
    expect(firstLessonWithDue({})).toBeNull();
    expect(firstLessonWithDue({ "1:x": { level: 1, dueAt: Date.now() + 60_000 } })).toBeNull();
  });
});

describe("konkur bookkeeping", () => {
  it("markKonkur records coverage and tracks/clears the wrong-now set", () => {
    state().markKonkur([
      { id: "x-21", ok: false },
      { id: "x-26", ok: true },
      { id: "x-34", ok: false },
    ]);
    expect(state().konkurSeen).toEqual({ "x-21": true, "x-26": true, "x-34": true });
    expect(state().konkurWrong).toEqual({ "x-21": true, "x-34": true });

    // answering x-21 right later clears it from the wrong set
    state().markKonkur([{ id: "x-21", ok: true }]);
    expect(state().konkurWrong).toEqual({ "x-34": true });
    expect(state().konkurSeen["x-21"]).toBe(true);
  });

  it("recordKonkurResults only reports exam-bank (x-) questions", () => {
    const questions = [
      { id: "x-21", answer: 1 } as unknown as QuizQuestion,
      { id: "1:l1-v3", answer: 0 } as unknown as QuizQuestion,
      { id: "x-26", answer: 2 } as unknown as QuizQuestion,
    ];
    recordKonkurResults(questions, [1, 0, 0]); // x-21 right, lesson word ignored, x-26 wrong
    expect(state().konkurSeen).toEqual({ "x-21": true, "x-26": true });
    expect(state().konkurWrong).toEqual({ "x-26": true });
  });

  it("hardIdsOf unions the mistake bank (bucket 0) with konkur wrong-now ids", () => {
    const ids = hardIdsOf(
      { "0:x-21": 3, "1:l1-v3": 2, "2:l2-v1": 1 },
      { "x-26": true, "x-21": true }
    );
    expect(ids.has("x-21")).toBe(true);
    expect(ids.has("x-26")).toBe(true);
    expect(ids.has("l1-v3")).toBe(false); // lesson mistakes (bucket 1) stay out
    expect(ids.has("l2-v1")).toBe(false);
    expect(ids.size).toBe(2);
  });
});

describe("F11 — konkur question SRS (q: keys on the shared ladder)", () => {
  beforeEach(resetProgress);

  it("a wrong answer schedules the question at level 0, due in 15 minutes", () => {
    const before = Date.now();
    state().markKonkur([{ id: "x-21", ok: false }]);
    const item = state().srs["q:x-21"];
    expect(item).toBeDefined();
    expect(item.level).toBe(0);
    expect(item.dueAt).toBeGreaterThanOrEqual(before + SRS_INTERVALS[0] - 50);
  });

  it("a first-time-right answer never enters the review queue", () => {
    state().markKonkur([{ id: "x-26", ok: true }]);
    expect(state().srs["q:x-26"]).toBeUndefined();
  });

  it("a right answer BEFORE due does not inflate the level (no drilling exploit)", () => {
    state().markKonkur([{ id: "x-34", ok: false }]); // level 0, due in 15min
    const before = { ...state().srs["q:x-34"] };
    state().markKonkur([{ id: "x-34", ok: true }]); // right too early
    expect(state().srs["q:x-34"]).toEqual(before);
  });

  it("a right answer exactly when due climbs one rung with the next interval", () => {
    state().markKonkur([{ id: "x-34", ok: false }]); // level 0
    // simulate the 15-minute wait by rewinding the due date
    useStudy.setState({ srs: { "q:x-34": { level: 0, dueAt: Date.now() - 1000 } } });
    const before = Date.now();
    state().markKonkur([{ id: "x-34", ok: true }]);
    const item = state().srs["q:x-34"];
    expect(item.level).toBe(1);
    expect(item.dueAt).toBeGreaterThanOrEqual(before + SRS_INTERVALS[1] - 50);
  });

  it("a wrong answer after promotion resets back to level 0", () => {
    useStudy.setState({ srs: { "q:x-121": { level: 3, dueAt: Date.now() - 1000 } } });
    state().markKonkur([{ id: "x-121", ok: true }]); // → level 4
    expect(state().srs["q:x-121"].level).toBe(4);
    state().markKonkur([{ id: "x-121", ok: false }]); // wrong again → reset
    expect(state().srs["q:x-121"].level).toBe(0);
  });

  it("capped at the top rung like words", () => {
    useStudy.setState({ srs: { "q:x-7": { level: 5, dueAt: Date.now() - 1000 } } });
    state().markKonkur([{ id: "x-7", ok: true }]);
    expect(state().srs["q:x-7"].level).toBe(5);
  });

  it("srsQuestionDueIds/Total expose only due q: ids (prefix stripped)", () => {
    useStudy.setState({
      srs: {
        "q:x-1": { level: 0, dueAt: Date.now() - 100 }, // due
        "q:x-2": { level: 2, dueAt: Date.now() + 60_000 }, // future
        "1:l1-v3": { level: 0, dueAt: Date.now() - 100 }, // word, not a question
      },
    });
    expect(srsQuestionDueIds(state().srs)).toEqual(["x-1"]);
    expect(srsQuestionDueTotal(state().srs)).toBe(1);
  });

  it("srsDueTotal stays words-only (q: items do not pollute vocab widgets)", () => {
    useStudy.setState({
      srs: {
        "q:x-1": { level: 0, dueAt: Date.now() - 100 },
        "q:x-2": { level: 0, dueAt: Date.now() - 100 },
        "1:word": { level: 0, dueAt: Date.now() - 100 },
      },
    });
    expect(srsDueTotal(state().srs)).toBe(1);
  });
});
