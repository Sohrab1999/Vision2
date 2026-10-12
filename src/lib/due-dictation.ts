// «دیکتهٔ سررسیدها» — session builder for the SRS dashboard.
//
// Pure and UI-free: takes the resolvable due-now words (srs-due.ts) and
// returns a DictationSource for the shared DictationTab — the review loop
// closes by ear:
//   • every word pins storeKey = the canonical word key ("1:ability") so
//     the round's reviewWord call advances the REAL schedule — spelling a
//     due word right is a genuine SRS upgrade (level+1, dueAt pushed
//     forward), a miss resets it to step 0; exactly what the chip
//     «مرور» jump does, but with spelling evidence;
//   • statsLesson 0 sends /api/stats a non-lesson row (the same contract
//     the my-words and danger dictations use);
//   • category "srs-due-dictation" keeps the analytics rows separate from
//     real lesson dictations while the local result bucket
//     "srs-due:dictation" stays consistent with the "danger:dictation"
//     naming style;
//   • color "rose" — the builder always renders inside the SRS panel's
//     due-now block, which is rose-accented.
// The pool is the FULL due list (uncapped — not just the 5 preview chips):
// a round covers everything the dashboard is nagging about, oldest-due
// first (the order srsDueSummary already guarantees).

import type { DictationSource } from "@/lib/study-types";
import type { SrsDueWord } from "@/lib/srs-due";

/** below this a dictation round feels hollow (same floor as the other launchers) */
export const DICTATION_MIN_DUE = 4;

export function buildDueDictation(words: SrsDueWord[]): DictationSource {
  return {
    id: "srs-due",
    label: "سررسیدها",
    color: "rose",
    statsLesson: 0,
    category: "srs-due-dictation",
    words: words.map((w) => ({
      en: w.en,
      fa: w.fa,
      storeKey: w.key,
    })),
  };
}
