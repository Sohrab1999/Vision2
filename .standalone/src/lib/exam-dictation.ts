// «دیکتهٔ واژگان کنکور» — the FIFTH DictationSource: the exam bank.
//
// Pure and UI-free: walks the 360-question vocab bank of the booklet
// (examBank) and keeps every correct option that resolves to REAL book
// vocabulary — 149 distinct words the official bank actually tests
// (interview, measure, native, tongue…). Phrasal answers that are not
// vocabulary entries ("referring to", "meet the needs of") and words the
// book never teaches are skipped: a dictation deck may only deal words
// that resolve, so every spelled word feeds the SAME canonical store keys
// (wordKey "1:interview", first-occurrence convention like the spell
// sprint) and a correct spelling is a genuine SRS upgrade.
//   • id "exam" → result bucket "exam:dictation" — distinct from the exam
//     quiz bucket "exam" and the four earlier sources;
//   • statsLesson 0 + category "exam-dictation" keep /api/stats rows
//     separate (same contract as my-words / danger / srs-due dictations);
//   • color "emerald" — the exam surface's accent in exam-view.

import { examBank } from "@/data";
import type { DictationSource } from "@/lib/study-types";
import { vocabByText } from "@/lib/word-risk";

/** below this a dictation round feels hollow (same floor as the other launchers) */
export const DICTATION_MIN_EXAM = 4;

export function buildExamDictation(): DictationSource {
  const seen = new Set<string>();
  const words: DictationSource["words"] = [];
  for (const q of examBank) {
    if (q.category !== "vocab" && q.category !== "vocab-konkuri") continue;
    const correctOpt = q.options[q.answer];
    if (typeof correctOpt !== "string") continue;
    const hit = vocabByText(correctOpt);
    if (!hit) continue; // phrase / word the book doesn't teach → not a dictation item
    const key = `${hit.lessonId}:${hit.word.en.toLowerCase()}`;
    if (seen.has(key)) continue; // the bank re-tests popular words — deal each once
    seen.add(key);
    words.push({ en: hit.word.en, fa: hit.word.fa, storeKey: key });
  }
  return {
    id: "exam",
    label: "بانک آزمون",
    color: "emerald",
    statsLesson: 0,
    category: "exam-dictation",
    words,
  };
}
