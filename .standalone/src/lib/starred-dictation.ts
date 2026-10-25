// «دیکتهٔ واژه‌های من» — session builder for the personal word-book dictation.
//
// Pure and UI-free: takes resolved stars and returns a DictationSource for
// the shared DictationTab. The source is a VIRTUAL lesson ("my-words"):
//   • every word pins storeKey = the star key ("1:ability") so the round
//     writes SRS/known/mistake bookkeeping on the canonical key — exactly
//     the keys the star surfaces created;
//   • statsLesson 0 sends /api/stats a non-lesson row (the same contract the
//     my-words quiz uses via quiz-finish's `typeof lessonId === "number"`);
//   • category "my-words-dictation" keeps the analytics rows separate from
//     real lesson dictations while the local result bucket "my-words:dictation"
//     stays consistent with the quiz bucket "my-words".
// The pool is the CURRENTLY FILTERED star list — lesson chips and the search
// query scope the session, mirroring the my-words quiz launcher.

import type { DictationSource, DictationSourceWord } from "@/lib/study-types";
import type { ResolvedStar } from "@/lib/my-words-resolve";

/** below this a dictation round feels hollow (same floor as the quiz launcher) */
export const DICTATION_MIN_STARS = 4;

export function buildStarredDictation(stars: ResolvedStar[]): DictationSource {
  const words: DictationSourceWord[] = stars.map((s) => ({ ...s.word, storeKey: s.key }));
  return {
    id: "my-words",
    label: "واژه‌های من",
    color: stars[0]?.color ?? "emerald",
    statsLesson: 0,
    category: "my-words-dictation",
    words,
  };
}
