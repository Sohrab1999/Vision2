import lesson1 from "./lesson1";
import lesson2 from "./lesson2";
import lesson3 from "./lesson3";
import lesson4 from "./lesson4";
import lesson5 from "./lesson5";
import lesson6 from "./lesson6";
import lesson7 from "./lesson7";
import lesson8 from "./lesson8";
import lesson9 from "./lesson9";
import lesson10 from "./lesson10";
import lesson11 from "./lesson11";
import lesson12 from "./lesson12";
import examBank from "./exam";
import type { LessonData } from "@/lib/study-types";

// درس‌های ۱-۳: جزوهٔ اصلی «Vision Two» پایهٔ یازدهم (جمال احمدی)
// درس‌های ۴-۶: جزوه‌های تکمیلی پایهٔ دوازدهم — Sense of Appreciation / Look
// to the Future / Renewable Energy (راند ۱۹۱ — «جزوه‌های بیشتر»)
// درس‌های ۷-۹: جزوه‌های پایهٔ دهم — Saving Nature / Wonders of Creation /
// The Value of Knowledge (راند ۱۹۴ — «قفسهٔ کامل»)
// درس‌های ۱۰-۱۲: جزوه‌های متوسطهٔ اول — Hello, English! / My World / People
// and Media (راند ۱۹۸ — «قفسهٔ شش‌پایه»؛ جزوه‌های دکتر حسن لطفی، هفتم/هشتم/نهم)
export const lessons: LessonData[] = [
  lesson1,
  lesson2,
  lesson3,
  lesson4,
  lesson5,
  lesson6,
  lesson7,
  lesson8,
  lesson9,
  lesson10,
  lesson11,
  lesson12,
];
export { examBank };
export * from "./appendix";

export const totalVocabulary = lessons.reduce((s, l) => s + l.vocabulary.length, 0);
export const totalQuestions = lessons.reduce((s, l) => s + l.quizzes.length, 0) + examBank.length;
export const totalGrammarSections = lessons.reduce((s, l) => s + l.grammar.length, 0);

export function findLesson(id: number): LessonData | undefined {
  return lessons.find((l) => l.id === id);
}
