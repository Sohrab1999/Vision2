// Two-level word-key resolver (task 62) — 33 words appear in TWO lessons
// with different senses ("take", "happen", "create"…). The old vocab index
// kept only the FIRST occurrence, so:
//   • matchVocabWord(2, "take") → null  → lesson-2 quiz signals silently
//     dropped from the mistake feed (recordQuizWordResults) and those
//     questions could never be starred from results (starrableWord);
//   • wordByKey("2:take") → null → dangerWords DROPPED every second-
//     occurrence mistake that lesson dictation / flashcards / listening
//     had honestly written to per-lesson keys.
// The index is now per-lesson (same semantics as resolveStar) and
// wordByKey gains a cross-lesson fallback for keys orphaned by content
// churn. These tests pin both levels against the REAL book data.

import { describe, it, expect, afterEach } from "vitest";
import { lessons } from "@/data";
import {
  matchVocabWord,
  wordByKey,
  dangerWords,
  buildDangerQuiz,
  recordQuizWordResults,
} from "@/lib/word-risk";
import { starrableWord } from "@/lib/starred-from-quiz";
import { buildDangerDictation } from "@/lib/danger-dictation";
import { useStudy } from "@/lib/study-store";

/** cross-lesson duplicate word strings of the book (computed, not hardcoded) */
function duplicateEnStrings(): { en: string; lessonIds: number[] }[] {
  const occ = new Map<string, number[]>();
  for (const l of lessons) {
    for (const w of l.vocabulary) {
      const k = w.en.toLowerCase();
      if (!occ.has(k)) occ.set(k, []);
      occ.get(k)!.push(l.id);
    }
  }
  return [...occ.entries()]
    .filter(([, ids]) => ids.length > 1)
    .map(([en, lessonIds]) => ({ en, lessonIds }));
}

afterEach(() => {
  useStudy.setState({ wordMistakes: {}, wordSeen: {} });
});

describe("discovery: cross-lesson duplicate vocabulary", () => {
  it("the book really has dozens of twice-taught words, including the pinned trio", () => {
    const dups = duplicateEnStrings();
    expect(dups.length).toBeGreaterThanOrEqual(30);
    for (const en of ["take", "happen", "create"]) {
      expect(dups.find((d) => d.en === en)).toBeDefined();
    }
  });

  it("«take» is taught in lessons 1 AND 2 with different Persian senses", () => {
    const fa1 = matchVocabWord(1, "take");
    const fa2 = matchVocabWord(2, "take");
    expect(fa1).not.toBeNull();
    expect(fa2).not.toBeNull();
    expect(fa1!.fa).not.toBe(fa2!.fa);
    expect(fa1!.fa).toContain("گرفتن");
    expect(fa2!.fa).toContain("بردن");
  });
});

describe("level 1 — matchVocabWord resolves per lesson (not first-occurrence-only)", () => {
  it("resolves the SECOND occurrence to its own sense", () => {
    const w1 = matchVocabWord(1, "take")!;
    const w2 = matchVocabWord(2, "take")!;
    expect(w1).not.toBe(w2);
    expect(w2.fa).not.toBe(w1.fa);
  });

  it("stays exact-match: case/punctuation tolerant, garbage and exam lesson rejected", () => {
    expect(matchVocabWord(2, "  Take.! ")).not.toBeNull();
    expect(matchVocabWord(2, "zzznotaword")).toBeNull();
    expect(matchVocabWord(0, "take")).toBeNull();
    expect(matchVocabWord(-1, "take")).toBeNull();
  });
});

describe("level 1 — wordByKey resolves every per-lesson occurrence", () => {
  it("resolves «2:take» to lesson 2's entry and «1:take» to lesson 1's", () => {
    expect(wordByKey("2:take")?.lessonId).toBe(2);
    expect(wordByKey("2:take")?.word.fa).toContain("بردن");
    expect(wordByKey("1:take")?.lessonId).toBe(1);
    expect(wordByKey("1:take")?.word.fa).toContain("گرفتن");
  });

  it("DATA-COMPLETENESS GUARD: every vocabulary key of the whole book resolves (would have dropped 30+ second-occurrence keys before the fix)", () => {
    let checked = 0;
    for (const l of lessons) {
      for (const w of l.vocabulary) {
        const key = `${l.id}:${w.en.toLowerCase()}`;
        const hit = wordByKey(key);
        expect(hit, `unresolvable key: ${key}`).not.toBeNull();
        expect(hit!.lessonId).toBe(l.id);
        expect(hit!.word.en).toBe(w.en);
        checked++;
      }
    }
    expect(checked).toBeGreaterThan(400); // the book's full vocabulary
  });
});

describe("level 2 — wordByKey falls back across lessons for orphaned keys", () => {
  it("a key whose lesson has no such word resolves to the first occurrence", () => {
    const hit = wordByKey("9:take"); // lesson 9 does not exist
    expect(hit).not.toBeNull();
    expect(hit!.lessonId).toBe(1);
    expect(hit!.word).toBe(matchVocabWord(1, "take"));
  });

  it("still rejects malformed keys and unknown words", () => {
    expect(wordByKey("1:zzznotaword")).toBeNull();
    expect(wordByKey("no-colon")).toBeNull();
    expect(wordByKey("x:take")).toBeNull();
  });
});

describe("recordQuizWordResults no longer drops second-occurrence signals", () => {
  it("a lesson-2 vocab question on «take» feeds wordSeen/wordMistakes on the «2:take» key", () => {
    const q = {
      id: "l2-dupfix-1",
      category: "vocab" as const,
      question: "Choose the correct word: … … … the bus every morning.",
      options: ["take", "give", "sit", "run"],
      answer: 0,
    };
    recordQuizWordResults([q], [1]); // wrong answer
    expect(useStudy.getState().wordSeen["2:take"]).toBe(1);
    expect(useStudy.getState().wordMistakes["2:take"]).toBe(1);

    recordQuizWordResults([q], [0]); // correct answer — seen grows, mistakes don't
    expect(useStudy.getState().wordSeen["2:take"]).toBe(2);
    expect(useStudy.getState().wordMistakes["2:take"]).toBe(1);
  });

  it("exam-bank questions (source lesson 0) are still skipped", () => {
    const q = {
      id: "exam-dupfix-1",
      category: "vocab-konkuri" as const,
      question: "…",
      options: ["take", "give", "sit", "run"],
      answer: 0,
    };
    recordQuizWordResults([q], [1]);
    expect(useStudy.getState().wordSeen["2:take"]).toBeUndefined();
  });
});

describe("starrableWord works for second occurrences", () => {
  it("a lesson-2 question on «take» offers the «2:take» star key with lesson-2's sense", () => {
    const q = {
      id: "l2-dupfix-2",
      category: "vocab" as const,
      question: "…",
      options: ["take", "give", "sit", "run"],
      answer: 0,
    };
    const s = starrableWord(q);
    expect(s).not.toBeNull();
    expect(s!.key).toBe("2:take");
    expect(s!.fa).toContain("بردن");
  });
});

describe("danger feed ranks second occurrences instead of dropping them", () => {
  it("wordMistakes on «2:take» produce a rankable danger row with lesson-2's sense", () => {
    const rows = dangerWords({ "2:take": 2 }, { "2:take": 3 }, 10);
    expect(rows).toHaveLength(1);
    expect(rows[0].key).toBe("2:take");
    expect(rows[0].lessonId).toBe(2);
    expect(rows[0].en).toBe("take");
    expect(rows[0].fa).toContain("بردن");
    expect(rows[0].rate).toBeCloseTo(2 / 3);
  });
});

describe("targeted practice closes the loop on second occurrences", () => {
  it("buildDangerQuiz synthesizes a lesson-2 drill for «2:take» with same-lesson distractors", () => {
    const rows = dangerWords({ "2:take": 2 }, { "2:take": 3 }, 10);
    const quiz = buildDangerQuiz(rows);
    expect(quiz.questions).toHaveLength(1);
    const q = quiz.questions[0];
    expect(q.id).toBe("risk-2-take");
    expect(quiz.faOptions.has(q.id)).toBe(true);
    expect(q.translation).toContain("درس دوم");
    // the three Persian distractors must come from lesson 2's own vocabulary
    const lesson2Fa = new Set(
      lessons.find((l) => l.id === 2)!.vocabulary.map((w) => w.fa)
    );
    for (const opt of q.options) {
      if (opt !== rows[0].fa) expect(lesson2Fa.has(opt)).toBe(true);
    }
  });

  it("buildDangerDictation pins resolvable per-lesson storeKeys for second occurrences", () => {
    const rows = dangerWords(
      { "2:take": 2, "1:ability": 1 },
      { "2:take": 3, "1:ability": 4 },
      10
    );
    const src = buildDangerDictation(rows);
    expect(src.id).toBe("danger");
    const take = src.words.find((w) => w.storeKey === "2:take");
    expect(take).toBeDefined();
    expect(wordByKey(take!.storeKey!)?.lessonId).toBe(2);
  });
});
