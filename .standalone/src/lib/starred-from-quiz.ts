// «ستاره از نتیجهٔ آزمون» — resolve which vocabulary word a quiz question
// actually tests, so the result-review rows can offer a star toggle into
// «واژه‌های من». Pure module: no React, no store access — the caller decides
// what to do with the resolved word (quiz-result renders the toggle).

import type { QuizQuestion } from "@/lib/study-types";
import { questionSourceLesson, wordKey } from "@/lib/study-store";
import { matchVocabWord } from "@/lib/word-risk";

export interface StarrableWord {
  /** store wordKey ("1:ability") — feed straight into toggleStarred */
  key: string;
  en: string;
  fa: string;
}

/**
 * The vocabulary word a result-review row can offer for starring, or null.
 * Same contract as recordQuizWordResults (word-risk.ts): only lesson-bank
 * vocab / vocab-konkuri questions whose CORRECT option is an English entry
 * of the question's source lesson resolve — exam-bank questions, grammar /
 * listening categories and EN→FA drills (Persian correct option) never do.
 */
export function starrableWord(q: QuizQuestion): StarrableWord | null {
  if (q.category !== "vocab" && q.category !== "vocab-konkuri") return null;
  const lessonId = questionSourceLesson(q);
  if (lessonId < 1) return null;
  const correctOpt = q.options[q.answer];
  if (typeof correctOpt !== "string") return null;
  const word = matchVocabWord(lessonId, correctOpt);
  if (!word) return null;
  return { key: wordKey(lessonId, word.en), en: word.en, fa: word.fa };
}
