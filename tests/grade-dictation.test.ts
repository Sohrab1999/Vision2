// «دیکتهٔ واژگان پایه‌محور» — contract tests for the SIXTH DictationSource
// family (round 200): six grade decks, one per FINAL_GRADES entry. Each deck
// walks its lessons' vocabulary — every real book word of the grade — pins
// canonical first-occurrence storeKeys (same convention as the exam-bank
// dictation and the spell sprint), and lands its result in its own bucket
// ("exam-g10:dictation"…) that the dictation skill matcher catches.

import { describe, it, expect } from "vitest";
import { lessons } from "@/data";
import { FINAL_GRADES } from "@/lib/domain/final-exam";
import { buildGradeDictation, buildGradeDictations, DICTATION_MIN_GRADE } from "@/lib/grade-dictation";
import { buildExamDictation } from "@/lib/exam-dictation";
import { vocabByText } from "@/lib/word-risk";
import { resultKey } from "@/lib/study-store";
import { SKILL_DEFS } from "@/lib/skill-stats";
import { categoryLabel, feedLabel, globalResultLabel, globalResultTheme } from "@/components/study/home/home-constants";
import { themeOf } from "@/lib/study-theme";

describe("buildGradeDictations — six decks, one per grade", () => {
  const decks = buildGradeDictations();

  it("builds exactly the six FINAL_GRADES decks with matching ids", () => {
    expect(Object.keys(decks).sort()).toEqual(["g10", "g11", "g12", "g7", "g8", "g9"].sort());
    for (const g of FINAL_GRADES) {
      expect(decks[g.id].id).toBe(`exam-${g.id}`);
    }
  });

  it("keeps the source contract: label/color from the grade, statsLesson 0, per-grade category", () => {
    for (const g of FINAL_GRADES) {
      const src = decks[g.id];
      expect(src.label).toBe(g.label); // «پایهٔ دهم» — toast reads «دیکتهٔ پایهٔ دهم»
      expect(src.color).toBe(g.accent); // certificate family identity
      expect(src.statsLesson).toBe(0); // non-lesson stats row (same contract as the bank deck)
      expect(src.category).toBe(`dict-${g.id}`);
      expect(themeOf(src.color)).toBeDefined(); // every accent resolves to a theme
    }
  });

  it("result buckets are distinct from each other and from every earlier dictation source", () => {
    const keys = FINAL_GRADES.map((g) => resultKey(decks[g.id].id, "dictation"));
    expect(new Set(keys).size).toBe(keys.length);
    expect(keys).not.toContain(resultKey("exam", "dictation")); // bank deck
    expect(keys).not.toContain(resultKey("my-words", "dictation"));
    expect(keys).not.toContain(resultKey("danger", "dictation"));
    expect(keys).not.toContain(resultKey("srs-due", "dictation"));
  });

  it("every deck is a real pool (≥ min) and every word pins a CANONICAL storeKey", () => {
    for (const g of FINAL_GRADES) {
      const src = decks[g.id];
      const gradeLessons = new Set(g.lessons);
      expect(src.words.length).toBeGreaterThanOrEqual(DICTATION_MIN_GRADE);
      for (const w of src.words) {
        expect(w.storeKey).toBeDefined();
        expect(w.fa.length).toBeGreaterThan(0); // meaning prompt is mandatory
        const hit = vocabByText(w.en);
        if (hit) {
          // first-occurrence convention — same key the exam deck + spell sprint write
          expect(w.storeKey).toBe(`${hit.lessonId}:${hit.word.en.toLowerCase()}`);
        } else {
          // exclamation phrases the text resolver misses ("How touching!") —
          // keyed by their own lesson, the SAME wordKey the lesson flow writes
          const [les] = w.storeKey!.split(":");
          expect(gradeLessons.has(Number(les))).toBe(true);
          expect(w.storeKey).toBe(`${les}:${w.en.toLowerCase()}`);
        }
      }
    }
  });

  it("no duplicate storeKeys or duplicate spellings within a deck", () => {
    for (const g of FINAL_GRADES) {
      const src = decks[g.id];
      const keys = src.words.map((w) => w.storeKey!);
      const ens = src.words.map((w) => w.en.toLowerCase());
      expect(new Set(keys).size).toBe(keys.length);
      expect(new Set(ens).size).toBe(ens.length);
    }
  });

  it("deck words have provenance: each spelling appears in one of the grade's own lessons", () => {
    for (const g of FINAL_GRADES) {
      const gradeEn = new Set(
        g.lessons.flatMap((id) => lessons.find((l) => l.id === id)!.vocabulary.map((w) => w.en.toLowerCase())),
      );
      for (const w of decks[g.id].words) {
        expect(gradeEn.has(w.en.toLowerCase())).toBe(true);
      }
    }
  });

  it("the six decks jointly cover every distinct book word of all 12 lessons", () => {
    const allEn = new Set(lessons.flatMap((l) => l.vocabulary.map((w) => w.en.toLowerCase())));
    const deckEn = new Set(FINAL_GRADES.flatMap((g) => decks[g.id].words.map((w) => w.en.toLowerCase())));
    expect(deckEn.size).toBe(allEn.size);
    for (const en of allEn) expect(deckEn.has(en)).toBe(true);
  });

  it("grade decks are disjoint-sized but MAY share re-taught words — always under the same canonical key", () => {
    // a word re-taught in a later grade resolves to the SAME first-occurrence
    // key in both decks → a correct spelling upgrades one SRS entry, never two
    const keyOwner = new Map<string, string>();
    for (const g of FINAL_GRADES) {
      for (const w of decks[g.id].words) {
        const prev = keyOwner.get(w.storeKey!);
        if (prev) expect(prev).toBe(w.en.toLowerCase()); // same spelling, same key
        keyOwner.set(w.storeKey!, w.en.toLowerCase());
      }
    }
  });
});

describe("buildGradeDictation — single-deck build matches the map build", () => {
  it("returns an equal deck for the same grade def", () => {
    const g11 = FINAL_GRADES.find((g) => g.id === "g11")!;
    const single = buildGradeDictation(g11);
    const mapped = buildGradeDictations()[g11.id];
    expect(single.words.length).toBe(mapped.words.length);
    expect(single.id).toBe(mapped.id);
    expect(single.words[0].storeKey).toBe(mapped.words[0].storeKey);
  });
});

describe("home label maps — grade dictation never renders a raw key", () => {
  const decks = buildGradeDictations();

  it("globalResultLabel/globalResultTheme know every grade result bucket", () => {
    for (const g of FINAL_GRADES) {
      const key = resultKey(decks[g.id].id, "dictation");
      expect(globalResultLabel[key]).toBe(`دیکتهٔ واژگان ${g.label}`);
      expect(globalResultTheme[key]).toBe("emerald");
    }
  });

  it("categoryLabel/feedLabel know every grade stats category AND the four personal dictation categories", () => {
    for (const g of FINAL_GRADES) {
      const cat = `dict-${g.id}`;
      expect(categoryLabel[cat]).toBe(`دیکتهٔ واژگان ${g.label}`);
      expect(feedLabel[cat]).toBe(`دیکتهٔ واژگان ${g.label}`);
    }
    expect(categoryLabel["exam-dictation"]).toBe("دیکتهٔ بانک آزمون");
    expect(categoryLabel["my-words-dictation"]).toBe("دیکتهٔ نشان‌شده‌ها");
    expect(categoryLabel["danger-dictation"]).toBe("دیکتهٔ واژه‌های خطرناک");
    expect(categoryLabel["srs-due-dictation"]).toBe("دیکتهٔ مرورِ سررسید");
    expect(feedLabel["exam-dictation"]).toBe("دیکتهٔ بانک آزمون");
    expect(feedLabel["srs-due-dictation"]).toBe("دیکتهٔ مرورِ سررسید");
  });

  it("the existing final-grade and global pins are untouched by the spread order", () => {
    expect(globalResultLabel.exam).toBe("آزمون جامع");
    expect(globalResultLabel.final).toBe("آزمون پایان ترم");
    expect(globalResultLabel["final-10"]).toBe("آزمون پایان‌ترم پایهٔ دهم");
    expect(globalResultTheme["my-words"]).toBe("amber");
    expect(globalResultTheme.rush).toBe("rose");
  });
});

describe("skill-stats — grade dictation lands in the دیکته skill", () => {
  const dictation = SKILL_DEFS.find((s) => s.id === "dictation")!;

  it("matcher catches every grade bucket but not the exam QUIZ bucket", () => {
    for (const g of FINAL_GRADES) {
      expect(dictation.match(`exam-${g.id}:dictation`)).toBe(true);
    }
    expect(dictation.match("exam:dictation")).toBe(true);
    expect(dictation.match("exam")).toBe(false);
  });

  it("no other skill claims a grade dictation bucket", () => {
    for (const other of SKILL_DEFS.filter((s) => s.id !== "dictation")) {
      expect(other.match("exam-g7:dictation")).toBe(false);
    }
  });
});

describe("shelf composition — grade decks alongside the bank deck", () => {
  it("the bank deck and grade decks serve different scopes without id collisions", () => {
    const bank = buildExamDictation();
    const decks = buildGradeDictations();
    expect(bank.id).toBe("exam");
    for (const g of FINAL_GRADES) expect(bank.id).not.toBe(decks[g.id].id);
    // grade-7 deck comes from the booklet lesson (10) — a pool the bank never touches
    expect(decks.g7.words.length).toBeGreaterThan(0);
    expect(FINAL_GRADES.find((g) => g.id === "g7")!.lessons).toEqual([10]);
  });
});
