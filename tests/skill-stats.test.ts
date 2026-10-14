// Phase-1 «پایداری» — tests for the per-skill aggregation shown on the
// home skill panel and the report card.

import { describe, it, expect } from "vitest";
import {
  skillBreakdown,
  lessonIdOfKey,
  barColorFor,
  skillGradeFa,
} from "@/lib/skill-stats";
import type { QuizResult } from "@/lib/study-types";

const r = (percent: number): QuizResult => ({ correct: 1, total: 2, percent, at: "2026-10-01" });

describe("lessonIdOfKey", () => {
  it("parses lesson keys 1..6 and rejects global/unknown keys", () => {
    expect(lessonIdOfKey("1:vocab")).toBe(1);
    expect(lessonIdOfKey("3:grammar")).toBe(3);
    expect(lessonIdOfKey("4:vocab")).toBe(4); // جزوهٔ تکمیلی دوازدهم (راند ۱۹۱)
    expect(lessonIdOfKey("6:dictation")).toBe(6);
    expect(lessonIdOfKey("0:x-21")).toBeNull(); // bucket 0 (mistake bank) is not a lesson
    expect(lessonIdOfKey("99:vocab")).toBeNull(); // beyond the shelf
    expect(lessonIdOfKey("exam")).toBeNull();
    expect(lessonIdOfKey("rush")).toBeNull();
  });
});

describe("skillBreakdown", () => {
  it("returns an empty array for a fresh learner", () => {
    expect(skillBreakdown({})).toEqual([]);
  });

  it("groups only matching keys per skill and computes attempts/best/avg/weakest", () => {
    const stats = skillBreakdown({
      "1:vocab": r(40),
      "2:vocab": r(80),
      "2:vocab-konkuri": r(60),
      "1:grammar": r(70),
      "1:reading": r(90), // no such skill def → ignored
    });

    const vocab = stats.find((s) => s.def.id === "vocab")!;
    expect(vocab).toBeDefined();
    expect(vocab.attempts).toBe(3);
    expect(vocab.best).toBe(80);
    expect(vocab.avg).toBe(60); // round((40+80+60)/3)
    expect(vocab.weakest).toEqual({ key: "1:vocab", percent: 40 });

    const grammar = stats.find((s) => s.def.id === "grammar")!;
    expect(grammar.attempts).toBe(1);
    expect(grammar.avg).toBe(70);
  });

  it("treats global keys (exam/final/rush) as their own skills", () => {
    const stats = skillBreakdown({ exam: r(85), rush: r(55) });
    expect(stats.find((s) => s.def.id === "exam")!.avg).toBe(85);
    expect(stats.find((s) => s.def.id === "rush")!.avg).toBe(55);
  });

  it("sorts skills strongest-first", () => {
    const stats = skillBreakdown({ "1:vocab": r(30), "1:grammar": r(90), "1:writing": r(60) });
    expect(stats.map((s) => s.def.id)).toEqual(["grammar", "writing", "vocab"]);
  });
});

describe("barColorFor", () => {
  it("maps thresholds to the traffic-light palette", () => {
    expect(barColorFor(85)).toBe("#059669"); // green ≥70
    expect(barColorFor(70)).toBe("#059669");
    expect(barColorFor(69)).toBe("#d97706"); // amber ≥50
    expect(barColorFor(50)).toBe("#d97706");
    expect(barColorFor(49)).toBe("#e11d48"); // rose <50
  });
});

describe("skillGradeFa", () => {
  it("labels performance bands in Persian", () => {
    expect(skillGradeFa(90).label).toBe("عالی");
    expect(skillGradeFa(85).label).toBe("عالی");
    expect(skillGradeFa(75).label).toBe("خوب");
    expect(skillGradeFa(55).label).toBe("در حال تلاش");
    expect(skillGradeFa(20).label).toBe("نیازمند تمرین");
  });
});
