// «دیکتهٔ واژگان کنکور» — contract tests for the FIFTH DictationSource.
// The builder walks the 360-question exam bank and keeps only correct
// options that resolve to REAL book vocabulary (149 distinct words) —
// phrases the book doesn't teach are skipped, popular words dealt once,
// every word pins a canonical first-occurrence storeKey so a correct
// spelling is a genuine SRS upgrade on the keys the rest of the app uses.

import { describe, it, expect } from "vitest";
import { examBank } from "@/data";
import { buildExamDictation, DICTATION_MIN_EXAM } from "@/lib/exam-dictation";
import { vocabByText, wordByKey, type DangerWord } from "@/lib/word-risk";
import { buildDangerDictation } from "@/lib/danger-dictation";
import { wordKey, resultKey } from "@/lib/study-store";
import { DICTATION_MIN_DUE } from "@/lib/due-dictation";
import { DICTATION_MIN_DANGER } from "@/lib/danger-dictation";

describe("vocabByText — resolver for texts without lesson provenance", () => {
  it("resolves case/punctuation-insensitively to the FIRST occurrence", () => {
    const hit = vocabByText("  Interview. ");
    expect(hit).not.toBeNull();
    expect(hit!.word.en.toLowerCase()).toBe("interview");
    // first-occurrence convention: the key lives in the lesson that teaches it first
    expect(hit!.lessonId).toBe(wordByKey(`${hit!.lessonId}:interview`)!.lessonId);
  });

  it("rejects garbage and empty text", () => {
    expect(vocabByText("zzznotaword")).toBeNull();
    expect(vocabByText("")).toBeNull();
  });
});

describe("buildExamDictation", () => {
  const src = buildExamDictation();

  it("builds a large resolvable pool from the 360-question bank", () => {
    expect(examBank.length).toBe(360);
    expect(src.words.length).toBeGreaterThanOrEqual(100);
    expect(src.words.length).toBeLessThanOrEqual(examBank.length);
  });

  it("keeps the source contract: id/label/color/statsLesson/category", () => {
    expect(src.id).toBe("exam");
    expect(src.label).toBe("بانک آزمون");
    expect(src.color).toBe("emerald");
    expect(src.statsLesson).toBe(0);
    expect(src.category).toBe("exam-dictation");
    // result bucket distinct from the exam QUIZ bucket ("exam") and all earlier sources
    expect(resultKey(src.id, "dictation")).toBe("exam:dictation");
    expect(resultKey(src.id, "dictation")).not.toBe(resultKey(0, "exam"));
  });

  it("every dealt word resolves on its canonical storeKey (dictation = REAL SRS study)", () => {
    for (const w of src.words) {
      expect(w.storeKey).toBeDefined();
      const hit = wordByKey(w.storeKey!);
      expect(hit, `unresolvable storeKey: ${w.storeKey}`).not.toBeNull();
      expect(hit!.word.en).toBe(w.en);
      expect(w.fa).toBe(hit!.word.fa);
    }
  });

  it("pins first-occurrence keys (spell-sprint convention) — no duplicate strings", () => {
    const keys = new Set<string>();
    const ens = new Set<string>();
    for (const w of src.words) {
      expect(w.storeKey).toBe(wordKey(vocabByText(w.en)!.lessonId, vocabByText(w.en)!.word.en));
      expect(keys.has(w.storeKey!)).toBe(false);
      expect(ens.has(w.en.toLowerCase())).toBe(false);
      keys.add(w.storeKey!);
      ens.add(w.en.toLowerCase());
    }
  });

  it("deals only words the bank actually tests — and skips what the book never teaches", () => {
    // every dealt word must be some exam question's correct option
    const dealt = src.words.map((w) => w.en.toLowerCase());
    const bankWords = new Set(
      examBank.map((q) => (q.options[q.answer] ?? "").trim().toLowerCase().replace(/[.,!?;:]+$/, ""))
    );
    for (const en of dealt) {
      expect(bankWords.has(en), `dealt word not tested by the bank: ${en}`).toBe(true);
    }
    // known non-vocabulary phrases of the bank must NOT leak into the deck
    // (راند ۱۹۴: «explain» از این فهرست حذف شد — درس ۹ «ارزش دانش» آن را
    // رسماً واژهٔ کتاب کرد و اکنون حقِ ورود به استخرِ دیکته را دارد)
    for (const phrase of ["referring to", "meet the needs of", "belongs to"]) {
      expect(dealt).not.toContain(phrase);
    }
  });

  it("floor parity: same hollow-round floor as the other dictation launchers", () => {
    expect(DICTATION_MIN_EXAM).toBe(DICTATION_MIN_DUE);
    expect(DICTATION_MIN_EXAM).toBe(DICTATION_MIN_DANGER);
    expect(DICTATION_MIN_EXAM).toBe(4);
  });

  it("composes with the danger pipeline: exam words ride the same DictationSource shape", () => {
    // the shared dialog accepts the source verbatim — assert the shape
    // danger-dictation's builder produces matches exam-dictation's
    const danger = buildDangerDictation([
      { key: "1:ability", lessonId: 1, en: "ability", fa: "توانایی", mistakes: 2, seen: 3, rate: 2 / 3 } as DangerWord,
    ]);
    expect(Object.keys(src.words[0]).sort()).toEqual(Object.keys(danger.words[0]).sort());
  });
});
