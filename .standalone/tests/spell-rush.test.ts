// «دیکتهٔ برق‌آسا» — contract tests for the spelling-sprint arcade mode.
// The pure core (lib/spell-rush.ts) owns the economics: deck coverage over
// the WHOLE book vocabulary on canonical keys, the combo ladder (10..30,
// parity with the quiz rush), and the hint policy (flat points, streak
// preserved). The store keeps the best records honestly.

import { describe, it, expect, beforeEach } from "vitest";
import { lessons } from "@/data";
import {
  buildSpellDeck,
  pointsFor,
  scoreAnswer,
  SPELL_ROUND_MS,
  SPELL_HINT_POINTS,
  type SpellItem,
} from "@/lib/spell-rush";
import { wordByKey } from "@/lib/word-risk";
import { wordKey, useStudy } from "@/lib/study-store";
import { EVENT_NAMES, EVENT_LABELS_FA } from "@/lib/analytics-events";

describe("buildSpellDeck", () => {
  it("covers the book's DISTINCT vocabulary exactly once (no dups, no gaps)", () => {
    const deck = buildSpellDeck();
    // duplicates across lessons ("take", "power", "create"…) collapse to
    // the FIRST occurrence — the resolver's own convention
    const expected = new Set(
      lessons.flatMap((l) => l.vocabulary.map((w) => w.en.toLowerCase()))
    );
    expect(deck).toHaveLength(expected.size);
    const enLower = deck.map((d) => d.en.toLowerCase());
    expect(new Set(enLower).size).toBe(enLower.length);
    for (const en of expected) expect(enLower).toContain(en);
  });

  it("pins canonical RESOLVABLE keys and mirrors en/fa from the book", () => {
    const deck = buildSpellDeck();
    for (const d of deck) {
      const book = wordByKey(d.key);
      expect(book, `key ${d.key} must resolve`).not.toBeNull();
      expect(d.en).toBe(book!.word.en);
      expect(d.fa).toBe(book!.word.fa);
    }
  });

  it("is shuffled (not the book's static order)", () => {
    const bookOrder = lessons.flatMap((l) => l.vocabulary.map((w) => `${w.en}`));
    const deck = buildSpellDeck();
    const deckOrder = deck.map((d) => d.en);
    // a shuffle of ~500 items matching the source order exactly is impossible in practice
    expect(deckOrder.join("|")).not.toBe(bookOrder.join("|"));
  });
});

describe("scoring economics (parity with the quiz rush ladder)", () => {
  it("ladder starts at 10, grows +2 per combo step, caps at 30", () => {
    expect(pointsFor(1)).toBe(10);
    expect(pointsFor(2)).toBe(12);
    expect(pointsFor(6)).toBe(20);
    expect(pointsFor(11)).toBe(30);
    expect(pointsFor(12)).toBe(30); // cap
    expect(pointsFor(99)).toBe(30);
  });

  it("full-correct grows the combo; wrong resets it; hint rides flat", () => {
    expect(scoreAnswer(0, "full")).toEqual({ pts: 10, nextCombo: 1 });
    expect(scoreAnswer(4, "full")).toEqual({ pts: 18, nextCombo: 5 });
    expect(scoreAnswer(7, "wrong")).toEqual({ pts: 0, nextCombo: 0 });
    // hint: SPELL_HINT_POINTS flat, combo NEITHER grows NOR resets
    expect(scoreAnswer(5, "hint")).toEqual({ pts: SPELL_HINT_POINTS, nextCombo: 5 });
    expect(scoreAnswer(0, "hint")).toEqual({ pts: SPELL_HINT_POINTS, nextCombo: 0 });
    expect(SPELL_HINT_POINTS).toBe(5);
  });

  it("round is 60 seconds — the shared arcade contract", () => {
    expect(SPELL_ROUND_MS).toBe(60_000);
  });
});

describe("spelling-sprint records (arcade slice)", () => {
  beforeEach(() => {
    useStudy.setState({ spellRushBest: 0, spellRushBestCorrect: 0 });
  });

  it("keeps the maxima and never regresses", () => {
    useStudy.getState().setSpellRushBest(120, 9);
    expect(useStudy.getState().spellRushBest).toBe(120);
    expect(useStudy.getState().spellRushBestCorrect).toBe(9);
    useStudy.getState().setSpellRushBest(70, 4);
    expect(useStudy.getState().spellRushBest).toBe(120);
    expect(useStudy.getState().spellRushBestCorrect).toBe(9);
    useStudy.getState().setSpellRushBest(150, 11);
    expect(useStudy.getState().spellRushBest).toBe(150);
    expect(useStudy.getState().spellRushBestCorrect).toBe(11);
  });

  it("does NOT touch the quiz-rush records or the rush games counter", () => {
    useStudy.setState({ rushBest: 200, rushBestCorrect: 15, rushGames: 3 });
    useStudy.getState().setSpellRushBest(80, 6);
    expect(useStudy.getState().rushBest).toBe(200);
    expect(useStudy.getState().rushGames).toBe(3);
  });

  it("a sprint answer writes the REAL SRS schedule on the canonical key", () => {
    const key = wordKey(lessons[0].id, lessons[0].vocabulary[0].en);
    useStudy.getState().reviewWord(key, true);
    const up = useStudy.getState().srs[key];
    expect(up.level).toBe(0); // first success → step 0 scheduled
    expect(up.dueAt).toBeGreaterThan(Date.now());
    useStudy.getState().reviewWord(key, false);
    expect(useStudy.getState().srs[key].level).toBe(0);
  });
});

describe("funnel event", () => {
  it("spell_rush_done is registered with a Persian label", () => {
    expect(EVENT_NAMES).toContain("spell_rush_done");
    expect(EVENT_LABELS_FA.spell_rush_done).toBe("چالش دیکتهٔ برق‌آسا");
  });
});

// the view normalizer — pinned so QA typing matches the app's grading
describe("normSpelling", () => {
  it("matches the dictation-tab semantics (case, apostrophes, trailing punct, spaces)", () => {
    // import lazily to keep the module graph of this file light
    return import("@/components/study/duel/spell-rush-view").then(({ normSpelling }) => {
      expect(normSpelling("Ability")).toBe("ability");
      expect(normSpelling("isn't")).toBe("isn't");
      expect(normSpelling("isn’t")).toBe("isn't");
      expect(normSpelling("word.")).toBe("word");
      expect(normSpelling("  two   words ")).toBe("two words");
    });
  });
});
