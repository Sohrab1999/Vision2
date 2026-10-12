// ------------------------------------------------------------------
// «سررسید الآن» preview — the SRS dashboard shows how many words are
// due; this lib answers the sharper question: WHICH words, so the
// panel can render tappable chips that jump straight into review.
//
// Pure + testable: the store map comes in, resolved word cards come
// out. Exam-bank keys ("q:") are excluded — vocabulary widgets must
// never count konkur questions (same contract as srsDueTotal). Keys
// whose word no longer exists in the book (dangling) are dropped
// silently via the shared resolveStar, so content updates never
// crash the preview — and every count this lib reports counts only
// words a learner can actually review, keeping the block self-
// consistent even when content shifts.
// ------------------------------------------------------------------

import type { SrsItem } from "@/lib/study-store";
import { resolveStar } from "@/lib/my-words-resolve";

export interface SrsDueWord {
  key: string; // canonical wordKey "1:ability"
  en: string;
  fa: string;
  dueAt: number; // epoch ms — how long overdue
  level: number; // 0..5 SRS level at the time it fell due
}

export interface SrsDueSummary {
  /** capped preview, oldest-due first (most neglected words lead) */
  words: SrsDueWord[];
  /** ALL resolvable due words (uncapped) — the honest count for the badge */
  dueTotal: number;
}

/**
 * Words whose SRS review is due right now + the uncapped resolvable
 * count. One pass over the store map; `limit` caps only the chip list.
 */
export function srsDueSummary(
  srs: Record<string, SrsItem>,
  now: number,
  limit = 5
): SrsDueSummary {
  const words: SrsDueWord[] = [];
  let dueTotal = 0;
  for (const [key, it] of Object.entries(srs)) {
    if (key.startsWith("q:")) continue; // exam-bank questions are not words
    if (!Number.isFinite(it?.dueAt) || it.dueAt > now) continue;
    const star = resolveStar(key);
    if (!star) continue; // vocabulary changed → silently drop
    dueTotal++;
    if (words.length < Math.max(0, limit)) {
      words.push({ key, en: star.en, fa: star.fa, dueAt: it.dueAt, level: it.level ?? 0 });
    }
  }
  words.sort((a, b) => a.dueAt - b.dueAt || a.key.localeCompare(b.key));
  return { words, dueTotal };
}
