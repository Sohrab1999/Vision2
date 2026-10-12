// «فلش‌کارت واژه‌های من» — build a multi-lesson flashcard deck from the
// starred wordKeys. Pure module: the launcher passes the store's known-map
// as a predicate; dangling keys (word removed from content) are dropped so a
// stale star can never crash the deck.

import type { VocabWord } from "@/lib/study-types";
import { resolveStar } from "@/lib/my-words-resolve";

export interface DeckCard {
  key: string; // "1:ability"
  lessonId: number;
  word: VocabWord;
}

export type DeckScope = "all" | "unmastered";

/**
 * Resolved, content-verified deck cards in starred order (oldest → newest).
 * scope "unmastered" keeps only words not yet marked «بلدم» — the quick
 * drill for what remains, while "all" is the full personal deck.
 */
export function buildMyWordsDeck(
  starredKeys: string[],
  isKnown: (key: string) => boolean,
  scope: DeckScope = "all"
): DeckCard[] {
  const cards: DeckCard[] = [];
  for (const key of starredKeys) {
    const hit = resolveStar(key);
    if (!hit) continue; // dangling star → silently skipped
    if (scope === "unmastered" && isKnown(key)) continue;
    cards.push({ key: hit.key, lessonId: hit.lessonId, word: hit.word });
  }
  return cards;
}

/** the lesson carrying the biggest share of the deck (ties → first seen); 0 for empty */
export function dominantLessonId(cards: DeckCard[]): number {
  const count = new Map<number, number>();
  let bestLesson = 0;
  for (const c of cards) {
    const n = (count.get(c.lessonId) ?? 0) + 1;
    count.set(c.lessonId, n);
    if (n > (count.get(bestLesson) ?? 0)) bestLesson = c.lessonId;
  }
  return bestLesson;
}
