/**
 * Pure domain — shuffle primitives (audit §10 R-4).
 *
 * Zero React, zero store imports: the unit-test core of the app.
 * This is the ONE shuffle of the codebase — it replaces 8 byte-identical
 * Fisher–Yates copies that used to live in rush-view, exam-view,
 * konkur-view, dictation-tab, writing-tab, listen-bank, smart-practice
 * and word-risk.
 */

/** Random source returning a float in [0, 1). Injectable for deterministic tests. */
export type Rng = () => number;

/**
 * Fisher–Yates shuffle of a copy — the input array is never mutated.
 * Every quiz deck, option row and token pool in the app flows through here.
 */
export function shuffle<T>(arr: readonly T[], rng: Rng = Math.random): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Shuffle a question's options and report where the correct one landed.
 * The recurring «options + answer index» shape of every quiz view —
 * shuffling index pairs (not values) stays correct even when two options
 * hold equal text.
 */
export function shuffleWithOptions<A>(
  options: readonly A[],
  answer: number,
  rng: Rng = Math.random,
): { options: A[]; answer: number } {
  const order = shuffle(
    options.map((_, i) => i),
    rng,
  );
  return {
    options: order.map((i) => options[i]),
    answer: order.indexOf(answer),
  };
}
