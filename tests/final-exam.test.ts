// ------------------------------------------------------------------
// Round 195 — «آزمون پایان‌ترم سه‌پایه» guards.
//
// The shelf grew to 9 lessons / 3 grades (tasks 193-194) but the final
// exam kept mixing only lessons 1-3 + the 360-bank. These tests pin:
//   - the per-grade pool composition (10 per lesson, +10 bank only for
//     the 11th grade — the 360 bank IS a یازدهم booklet),
//   - the nine-lesson group machinery (buckets, labels, mistakes targets),
//   - the final-family result keys flowing through skill stats and the
//     home-feed label maps (no raw "final-10" English keys on the UI).
// ------------------------------------------------------------------

import { describe, expect, it } from "vitest";
import {
  FINAL_GRADES,
  buildFinalPool,
  examGroupLabels,
  finalAccentOf,
  finalGradeOf,
  finalKeyLabel,
  finalQuestionsCount,
  finalTimerMinutes,
  mistakesTargetOf,
  questionGroup,
} from "@/lib/domain/final-exam";
import { examBank, lessons } from "@/data";
import { LESSONS_META, lessonOrdinalFa } from "@/data/lesson-meta";
import { lessonIdOfKey, skillBreakdown } from "@/lib/skill-stats";
import { categoryLabel, feedLabel, globalResultLabel, globalResultTheme } from "@/components/study/home/home-constants";
import { ring600 } from "@/lib/ui-colors";

const identity = <T,>(a: T[]): T[] => [...a];
const r = (p: number) => ({ correct: 1, total: 2, percent: p, at: "2026-01-01T00:00:00.000Z" });

describe("FINAL_GRADES definitions", () => {
  it("pins the three grades, their lessons and their result keys", () => {
    expect(FINAL_GRADES).toHaveLength(3);
    const [g10, g11, g12] = FINAL_GRADES;
    expect(g10.id).toBe("g10");
    expect(g10.label).toBe("پایهٔ دهم");
    expect(g10.lessons).toEqual([7, 8, 9]);
    expect(g10.withBank).toBe(false);
    expect(g10.resultKey).toBe("final-10");
    expect(g10.category).toBe("final-10");
    expect(g11.id).toBe("g11");
    expect(g11.label).toBe("پایهٔ یازدهم");
    expect(g11.lessons).toEqual([1, 2, 3]);
    expect(g11.withBank).toBe(true);
    expect(g11.resultKey).toBe("final"); // backward-compat key
    expect(g11.category).toBe("final");
    expect(g12.id).toBe("g12");
    expect(g12.label).toBe("پایهٔ دوازدهم");
    expect(g12.lessons).toEqual([4, 5, 6]);
    expect(g12.withBank).toBe(false);
    expect(g12.resultKey).toBe("final-12");
    expect(g12.category).toBe("final-12");
    for (const g of FINAL_GRADES) expect(g.perLesson).toBe(10);
  });

  it("matches the shelf grades: every lesson of LESSONS_META belongs to exactly one grade final", () => {
    const covered = FINAL_GRADES.flatMap((g) => g.lessons).sort((a, b) => a - b);
    expect(covered).toEqual(LESSONS_META.map((l) => l.id));
    for (const g of FINAL_GRADES) {
      for (const id of g.lessons) {
        // grade-final lessons must be same-grade lessons on the shelf
        const meta = LESSONS_META.find((l) => l.id === id)!;
        expect(meta.grade).toBe(g.label.replace("پایهٔ ", ""));
      }
    }
  });

  it("finalGradeOf falls back to the 11th grade", () => {
    expect(finalGradeOf("g12").id).toBe("g12");
    expect(finalGradeOf("whatever" as never).id).toBe("g11");
  });

  it("counts questions and timer minutes per grade (45s per question)", () => {
    expect(finalQuestionsCount(FINAL_GRADES[1])).toBe(40); // 3 lessons + bank
    expect(finalQuestionsCount(FINAL_GRADES[0])).toBe(30);
    expect(finalQuestionsCount(FINAL_GRADES[2])).toBe(30);
    expect(finalTimerMinutes(FINAL_GRADES[1])).toBe(30); // 40 × 45s = 30min
    expect(finalTimerMinutes(FINAL_GRADES[0])).toBe(23); // 30 × 45s = 22.5 → ceil
    expect(finalTimerMinutes(FINAL_GRADES[2])).toBe(23);
  });
});

describe("questionGroup / examGroupLabels / mistakesTargetOf", () => {
  it("buckets ids into l1..l9 / x", () => {
    expect(questionGroup({ id: "l1-v3" })).toBe("l1");
    expect(questionGroup({ id: "l9-g2" })).toBe("l9");
    expect(questionGroup({ id: "x-55" })).toBe("x");
    expect(questionGroup({ id: "weird" })).toBe("x");
  });

  it("builds the full nine-lesson label map with the legacy literals intact", () => {
    const labels = examGroupLabels();
    expect(Object.keys(labels).sort()).toEqual([...LESSONS_META.map((l) => `l${l.id}`), "x"].sort());
    // legacy three-lesson pins (the old hardcoded GROUP_LABELS)
    expect(labels.l1).toBe("درس اول — فهمیدن مردم");
    expect(labels.l2).toBe("درس دوم — یک شیوهٔ زندگی سالم");
    expect(labels.l3).toBe("درس سوم — هنر و فرهنگ");
    expect(labels.x).toBe("بانک ۳۶۰ تستی جزوه");
    // the new grades ride the same recipe
    for (const l of LESSONS_META) {
      expect(labels[`l${l.id}`]).toBe(`درس ${lessonOrdinalFa(l.id)} — ${l.titleFa}`);
    }
  });

  it("maps groups to mistakes targets (lN → N, x → 0)", () => {
    expect(mistakesTargetOf("l1")).toBe(1);
    expect(mistakesTargetOf("l9")).toBe(9);
    expect(mistakesTargetOf("x")).toBe(0);
    expect(mistakesTargetOf("lzz")).toBe(0);
  });
});

describe("buildFinalPool", () => {
  const countByGroup = (pool: { id: string }[]) =>
    pool.reduce<Record<string, number>>((acc, q) => {
      const g = questionGroup(q);
      acc[g] = (acc[g] ?? 0) + 1;
      return acc;
    }, {});

  it("11th grade: 40 questions — 10 per lesson + 10 from the 360 bank", () => {
    const pool = buildFinalPool(FINAL_GRADES[1], lessons, examBank, identity);
    expect(pool).toHaveLength(40);
    const counts = countByGroup(pool);
    expect(counts.l1).toBe(10);
    expect(counts.l2).toBe(10);
    expect(counts.l3).toBe(10);
    expect(counts.x).toBe(10);
  });

  it("10th grade: 30 questions, all from lessons 7-9, zero bank", () => {
    const pool = buildFinalPool(FINAL_GRADES[0], lessons, examBank, identity);
    expect(pool).toHaveLength(30);
    const counts = countByGroup(pool);
    expect(counts.l7).toBe(10);
    expect(counts.l8).toBe(10);
    expect(counts.l9).toBe(10);
    expect(counts.x).toBeUndefined();
  });

  it("12th grade: 30 questions, all from lessons 4-6, zero bank", () => {
    const pool = buildFinalPool(FINAL_GRADES[2], lessons, examBank, identity);
    expect(pool).toHaveLength(30);
    const counts = countByGroup(pool);
    expect(counts.l4).toBe(10);
    expect(counts.l5).toBe(10);
    expect(counts.l6).toBe(10);
    expect(counts.x).toBeUndefined();
  });

  it("default shuffle still draws exactly 10 per source with no duplicates (fair draw)", () => {
    const shuffled = buildFinalPool(FINAL_GRADES[1], lessons, examBank);
    expect(shuffled).toHaveLength(40);
    const counts = countByGroup(shuffled);
    expect(counts.l1).toBe(10);
    expect(counts.l2).toBe(10);
    expect(counts.l3).toBe(10);
    expect(counts.x).toBe(10);
    expect(new Set(shuffled.map((q) => q.id)).size).toBe(40);
  });
});

describe("final-family keys across consumers", () => {
  it("skillBreakdown aggregates final-10/final-12 under the پایان ترم skill", () => {
    const stats = skillBreakdown({ final: r(80), "final-10": r(60), "final-12": r(40), exam: r(90) });
    const finalSkill = stats.find((s) => s.def.id === "final")!;
    expect(finalSkill.attempts).toBe(3);
    expect(finalSkill.best).toBe(80);
    expect(finalSkill.avg).toBe(60);
    // they stay global keys — never mistaken for lesson keys
    expect(lessonIdOfKey("final-10")).toBeNull();
    expect(lessonIdOfKey("final-12")).toBeNull();
    expect(lessonIdOfKey("final")).toBeNull();
  });

  it("finalKeyLabel covers the family and refuses foreign keys", () => {
    expect(finalKeyLabel("final")).toBe("آزمون پایان ترم");
    expect(finalKeyLabel("final-10")).toBe("آزمون پایان‌ترم پایهٔ دهم");
    expect(finalKeyLabel("final-12")).toBe("آزمون پایان‌ترم پایهٔ دوازدهم");
    expect(finalKeyLabel("1:vocab")).toBeNull();
    expect(finalKeyLabel("final-x")).toBeNull();
  });

  it("home label maps carry every grade-final key (no raw English keys on the feed)", () => {
    for (const g of FINAL_GRADES) {
      if (g.resultKey === "final") continue; // legacy entry already present
      expect(globalResultLabel[g.resultKey]).toBe(`آزمون پایان‌ترم ${g.label}`);
      expect(categoryLabel[g.resultKey]).toBe(`آزمون پایان‌ترم ${g.label}`);
      expect(feedLabel[g.resultKey]).toBe(`آزمون پایان‌ترم ${g.label}`);
      expect(globalResultTheme[g.resultKey]).toBe("emerald");
    }
    // legacy key untouched
    expect(globalResultLabel.final).toBe("آزمون پایان ترم");
    expect(globalResultTheme.final).toBe("emerald");
  });
});

describe("certificate accent — نشانِ رنگِ خانواده (راند ۱۹۷)", () => {
  it("each grade leads with its first lesson's family color", () => {
    for (const g of FINAL_GRADES) {
      const lead = LESSONS_META.find((l) => l.id === g.lessons[0])!;
      expect(g.accent, `grade ${g.id} must lead with its first lesson's family`).toBe(lead.color);
    }
    expect(FINAL_GRADES.map((g) => g.accent)).toEqual(["orange", "emerald", "violet"]);
  });

  it("finalAccentOf maps the family keys and lands emerald for strangers", () => {
    expect(finalAccentOf("final-10")).toBe("orange");
    expect(finalAccentOf("final")).toBe("emerald");
    expect(finalAccentOf("final-12")).toBe("violet");
    expect(finalAccentOf("1:vocab")).toBe("emerald");
    expect(finalAccentOf("exam")).toBe("emerald");
  });

  it("every accent owns its true 600 leaf — the canvas seal never approximates", () => {
    // ring600 must resolve the family's OWN 600, not the emerald fallback
    expect(ring600("orange")).toBe("#ea580c");
    expect(ring600("emerald")).toBe("#059669");
    expect(ring600("violet")).toBe("#7c3aed");
  });
});
