// «دیکتهٔ برق‌آسا» — the spelling-sprint mode of the 60-second arcade.
//
// Pure and UI-free: the deck builder, the scoring ladder and the answer
// policy live here so the component stays a shell and the tests can pin
// the exact economics. Design mirrors the rush quiz (endless shuffled
// pool, combo ladder 10..30, best-record keeping) but every item is a
// WORD heard by ear and typed:
//   • full-correct (no hint)  → the combo ladder grows: 10 + min(combo-1,10)*2
//   • hint-correct (revealed letters) → a flat SPELL_HINT_POINTS, the combo
//     neither grows nor resets — a hint costs the streak, not the round;
//   • wrong / skipped → combo resets to 0.
// Every answered word feeds the SAME canonical keys the rest of the app
// uses (wordKey "1:ability"): addWordResults for the sighting/mistake feed
// and reviewWord for the real SRS schedule — the sprint is genuine study,
// not just an arcade toy.

import { lessons } from "@/data";
import { wordKey } from "@/state/progress";
import { shuffle } from "@/lib/domain/shuffle";

export const SPELL_ROUND_MS = 60_000;
export const SPELL_HINT_POINTS = 5;

export interface SpellItem {
  en: string;
  fa: string;
  /** canonical word key "1:ability" — the key every feed writes to */
  key: string;
  lessonId: number;
}

/**
 * One full shuffled deck of the book's DISTINCT vocabulary (by en).
 * Several words appear in two lessons with different meanings ("take",
 * "power", "create"…) — the book's resolver convention is first-
 * occurrence-wins, so per-lesson keys of the later occurrences are
 * unresolvable by design (wordByKey). A sprint therefore keeps ONLY the
 * first occurrence: every dealt word resolves on its canonical key and
 * no word is heard twice with two different meanings in one round.
 */
export function buildSpellDeck(): SpellItem[] {
  const seen = new Set<string>();
  const all: SpellItem[] = [];
  for (const l of lessons) {
    for (const w of l.vocabulary) {
      const k = w.en.toLowerCase();
      if (seen.has(k)) continue;
      seen.add(k);
      all.push({ en: w.en, fa: w.fa, key: wordKey(l.id, w.en), lessonId: l.id });
    }
  }
  return shuffle(all);
}

/** points for a full-correct answer given the current combo (1-based next) */
export function pointsFor(combo: number): number {
  return 10 + Math.min(Math.max(0, combo - 1), 10) * 2;
}

export type SpellAnswer = "full" | "hint" | "wrong";

/** the ONE scoring policy: (current combo, answer quality) → points + next combo */
export function scoreAnswer(
  combo: number,
  answer: SpellAnswer
): { pts: number; nextCombo: number } {
  if (answer === "full") return { pts: pointsFor(combo + 1), nextCombo: combo + 1 };
  if (answer === "hint") return { pts: SPELL_HINT_POINTS, nextCombo: combo };
  return { pts: 0, nextCombo: 0 };
}
