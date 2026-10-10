// ------------------------------------------------------------------
// F8 «چرا غلط شد؟» — server-side question lookup.
// The explain endpoint accepts ONLY a question id; the question text,
// options and answer key are resolved here from the bundled banks so
// that arbitrary content can never be injected into the LLM prompt.
// ------------------------------------------------------------------

import { examBank } from "@/data/exam";
import lesson1 from "@/data/lesson1";
import lesson2 from "@/data/lesson2";
import lesson3 from "@/data/lesson3";
import type { QuizQuestion } from "./study-types";

let index: Map<string, QuizQuestion> | null = null;

function buildIndex(): Map<string, QuizQuestion> {
  const map = new Map<string, QuizQuestion>();
  const push = (q: QuizQuestion) => {
    if (!map.has(q.id)) map.set(q.id, q);
  };
  for (const lesson of [lesson1, lesson2, lesson3]) for (const q of lesson.quizzes) push(q);
  for (const q of examBank) push(q);
  return map;
}

/** All 490 bundled questions (lesson quizzes + the 360-item exam bank). */
export function questionIndex(): Map<string, QuizQuestion> {
  if (!index) index = buildIndex();
  return index;
}

export function findQuestion(id: string): QuizQuestion | undefined {
  return questionIndex().get(id);
}

/** Persian label of a question category, used in the prompt. */
export function categoryFa(q: QuizQuestion): string {
  switch (q.category) {
    case "vocab":
      return "واژگان";
    case "vocab-konkuri":
      return "واژگان کنکوری";
    case "grammar":
      return "گرامر";
    default:
      return q.category;
  }
}
