// «دیکتهٔ واژگان پایه‌محور» — the SIXTH DictationSource family: grade decks.
//
// Round 200 — the top recommendation of three consecutive rounds (196/198/199):
// the dictation shelf knew the 360-question bank (149 words) and four
// personal pools, but no deck spoke a GRADE's own vocabulary. Six decks,
// one per FINAL_GRADES entry, walk their lessons' vocabulary arrays —
// every real book word of the grade (دهم ≈ ۳۷۰ واژه، هفتم ≈ ۶۵) — so a
// learner can drill «فقط واژه‌های کتابِ پایهٔ من» by ear.
//   • store keys follow the SAME canonical first-occurrence convention as
//     the exam-bank dictation and the spell sprint (vocabByText →
//     "lessonId:en") — a correct spelling is a genuine SRS upgrade on the
//     keys the rest of the app already uses, even when a word re-taught in
//     a later lesson resolves to its first home;
//   • id "exam-g10"… → result buckets "exam-g10:dictation"… — siblings of
//     the bank deck "exam:dictation", all caught by the dictation skill
//     matcher (endsWith ":dictation");
//   • statsLesson 0 + per-grade category "dict-g10"… keep /api/stats rows
//     separated (same contract as exam/my-words/danger/srs-due dictations);
//   • color = the grade's certificate accent — the deck chip, the dictation
//     theme and the final-exam family share one identity per grade.

import { lessons } from "@/data";
import { FINAL_GRADES, type FinalGradeDef } from "@/lib/domain/final-exam";
import type { DictationSource } from "@/lib/study-types";
import { vocabByText } from "@/lib/word-risk";

/** below this a grade deck feels hollow (same floor as the other launchers) */
export const DICTATION_MIN_GRADE = 4;

export function buildGradeDictation(grade: FinalGradeDef): DictationSource {
  const seen = new Set<string>();
  const words: DictationSource["words"] = [];
  for (const lessonId of grade.lessons) {
    const les = lessons.find((l) => l.id === lessonId);
    if (!les) continue;
    for (const w of les.vocabulary) {
      // canonical first-occurrence key; the text resolver misses exclamation
      // phrases the index keys raw ("How touching!") — those fall back to
      // their own lesson's key (the SAME wordKey the lesson flow writes)
      const hit = vocabByText(w.en);
      // key template = wordKey(lessonId, en) — kept inline so this lib stays
      // pure/state-free (same choice as exam-dictation)
      const key = hit ? `${hit.lessonId}:${hit.word.en.toLowerCase()}` : `${lessonId}:${w.en.toLowerCase()}`;
      if (seen.has(key)) continue; // re-taught words dealt once per deck
      seen.add(key);
      const src = hit?.word ?? w;
      words.push({ en: src.en, fa: src.fa, pos: src.pos, storeKey: key });
    }
  }
  return {
    id: `exam-${grade.id}`,
    label: grade.label,
    color: grade.accent,
    statsLesson: 0,
    category: `dict-${grade.id}`,
    words,
  };
}

/** all six grade decks, keyed by grade id — built once by the consumer */
export function buildGradeDictations(): Record<string, DictationSource> {
  const decks: Record<string, DictationSource> = {};
  for (const grade of FINAL_GRADES) decks[grade.id] = buildGradeDictation(grade);
  return decks;
}
