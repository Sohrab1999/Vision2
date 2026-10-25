// «دیکتهٔ واژه‌های خطرناک» — session builder for the danger-words panel.
//
// Pure and UI-free: takes the ranked danger list (word-risk.ts) and returns
// a DictationSource for the shared DictationTab — the third leg of the
// targeted-practice triad (flashcards ✓ / drill ✓ / dictation ← this):
//   • every word pins storeKey = the canonical word key ("1:ability") so the
//     round writes SRS/known/mistake bookkeeping on the SAME keys the mistake
//     feed uses — spelling a dangerous word right feeds wordSeen/srs on that
//     exact key;
//   • statsLesson 0 sends /api/stats a non-lesson row (the same contract the
//     my-words dictation and quiz use);
//   • category "danger-dictation" keeps the analytics rows separate from real
//     lesson dictations while the local result bucket "danger:dictation" stays
//     consistent with the danger drill bucket "0:danger" naming style.
// The pool is whatever the panel ranked — capped by dangerWords(limit=10) so
// every round is a short, focused spelling sprint.

import type { DictationSource } from "@/lib/study-types";
import type { DangerWord } from "@/lib/word-risk";

/** below this a dictation round feels hollow (same floor as the star launcher) */
export const DICTATION_MIN_DANGER = 4;

export function buildDangerDictation(words: DangerWord[]): DictationSource {
  return {
    id: "danger",
    label: "واژه‌های خطرناک",
    color: "rose",
    statsLesson: 0,
    category: "danger-dictation",
    words: words.map((d) => ({
      en: d.en,
      fa: d.fa,
      storeKey: d.key,
    })),
  };
}
