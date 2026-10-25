// Round 204 — targeted-practice CTA routing map. The home skill panel's
// weakest-skill CTA used to dump every lesson-bound skill on the tests tab;
// skillPracticeTarget now routes each skill where it is actually practiced.
// These guards pin the WHOLE map so a new skill def cannot silently fall
// back to tests.

import { describe, it, expect } from "vitest";
import { SKILL_DEFS, skillPracticeTarget, type SkillStat } from "@/lib/skill-stats";

const stat = (defId: string, weakestKey?: string): SkillStat => {
  const def = SKILL_DEFS.find((d) => d.id === defId);
  if (!def) throw new Error(`unknown skill def: ${defId}`);
  return {
    def,
    attempts: 1,
    best: 40,
    avg: 40,
    weakest: weakestKey ? { key: weakestKey, percent: 40 } : null,
  };
};

describe("skillPracticeTarget — global view skills", () => {
  it("rush → rush view", () => {
    expect(skillPracticeTarget(stat("rush", "rush"))).toEqual({
      kind: "view",
      view: { type: "rush" },
    });
  });

  it("exam AND final both land on the exam view", () => {
    expect(skillPracticeTarget(stat("exam", "exam"))).toEqual({
      kind: "view",
      view: { type: "exam" },
    });
    expect(skillPracticeTarget(stat("final", "final-1"))).toEqual({
      kind: "view",
      view: { type: "exam" },
    });
  });

  it("listening → listen view (not a lesson tab)", () => {
    expect(skillPracticeTarget(stat("listening", "1:listening"))).toEqual({
      kind: "view",
      view: { type: "listen" },
    });
  });

  it("mistakes → the cross-lesson review session", () => {
    expect(skillPracticeTarget(stat("mistakes", "0:x-21"))).toEqual({
      kind: "view",
      view: { type: "review" },
    });
  });
});

describe("skillPracticeTarget — lesson-bound skills land on their own tab", () => {
  it("synant weakest «3:synant» → lesson 3 synant tab (the r203 suggestion, live since r202)", () => {
    expect(skillPracticeTarget(stat("synant", "3:synant"))).toEqual({
      kind: "lesson",
      lessonId: 3,
      tab: "synant",
    });
  });

  it("vocab weakest «2:vocab» → lesson 2 flashcards (vocab tab)", () => {
    expect(skillPracticeTarget(stat("vocab", "2:vocab"))).toEqual({
      kind: "lesson",
      lessonId: 2,
      tab: "vocab",
    });
  });

  it("vocab-konkuri keys still route to the vocab tab", () => {
    expect(skillPracticeTarget(stat("vocab", "4:vocab-konkuri"))).toEqual({
      kind: "lesson",
      lessonId: 4,
      tab: "vocab",
    });
  });

  it("grammar weakest «5:grammar» → lesson 5 grammar lesson tab", () => {
    expect(skillPracticeTarget(stat("grammar", "5:grammar"))).toEqual({
      kind: "lesson",
      lessonId: 5,
      tab: "grammar",
    });
  });

  it("writing weakest «4:writing» → lesson 4 writing tab (old behavior kept)", () => {
    expect(skillPracticeTarget(stat("writing", "4:writing"))).toEqual({
      kind: "lesson",
      lessonId: 4,
      tab: "writing",
    });
  });

  it("dictation weakest lesson key «6:dictation» → lesson 6 dictation tab (old behavior kept)", () => {
    expect(skillPracticeTarget(stat("dictation", "6:dictation"))).toEqual({
      kind: "lesson",
      lessonId: 6,
      tab: "dictation",
    });
  });

  it("dictation weakest GLOBAL bucket (exam-g7:dictation) → lesson 1 dictation tab, never tests", () => {
    const t = skillPracticeTarget(stat("dictation", "exam-g7:dictation"));
    expect(t).toEqual({ kind: "lesson", lessonId: 1, tab: "dictation" });
  });

  it("mixed weakest «1:mixed» → tests tab of that lesson (mixed IS the test bank)", () => {
    expect(skillPracticeTarget(stat("mixed", "1:mixed"))).toEqual({
      kind: "lesson",
      lessonId: 1,
      tab: "tests",
    });
  });
});

describe("skillPracticeTarget — defensive fallbacks", () => {
  it("lesson-bound skill with null weakest → lesson 1 of its own tab (not tests)", () => {
    expect(skillPracticeTarget(stat("vocab"))).toEqual({
      kind: "lesson",
      lessonId: 1,
      tab: "vocab",
    });
  });

  it("unknown skill id falls back to lesson 1 tests (pre-r204 behavior)", () => {
    const ghost = { ...stat("vocab"), def: { ...stat("vocab").def, id: "ghost" } };
    expect(skillPracticeTarget(ghost)).toEqual({
      kind: "lesson",
      lessonId: 1,
      tab: "tests",
    });
  });
});

describe("skillPracticeTarget — every def id is covered by the map", () => {
  it("no SKILL_DEFS entry routes to a bare tests tab by accident (mixed is the one legal tests routing)", () => {
    for (const def of SKILL_DEFS) {
      const s = stat(def.id, def.id === "exam" || def.id === "rush" ? def.id : `1:${def.id}`);
      const t = skillPracticeTarget(s);
      if (t.kind === "view") continue; // global skills are view-routed by design
      if (def.id === "mixed") {
        expect(t.tab).toBe("tests"); // mixed IS the lesson test bank
        continue;
      }
      // every other lesson-bound skill must land on its own practice tab
      expect(["vocab", "grammar", "writing", "dictation", "synant"]).toContain(t.tab);
    }
  });
});
