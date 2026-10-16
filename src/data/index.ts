import lesson1 from "./lesson1";
import lesson2 from "./lesson2";
import lesson3 from "./lesson3";
import examBank from "./exam";
import { examBankG10 } from "./exam-g10";
import type { LessonData } from "@/lib/study-types";

export const lessons: LessonData[] = [lesson1, lesson2, lesson3];
export { examBank, examBankG10 };
export * from "./appendix";

export const totalVocabulary = lessons.reduce((s, l) => s + l.vocabulary.length, 0);
export const totalQuestions = lessons.reduce((s, l) => s + l.quizzes.length, 0) + examBank.length;
export const totalGrammarSections = lessons.reduce((s, l) => s + l.grammar.length, 0);

export function findLesson(id: number): LessonData | undefined {
  return lessons.find((l) => l.id === id);
}
