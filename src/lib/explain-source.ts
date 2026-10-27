// ------------------------------------------------------------------
// F8 «چرا غلط شد؟» — server-side question lookup.
// The explain endpoint accepts ONLY a question id; the question text,
// options and answer key are resolved here from the bundled banks so
// that arbitrary content can never be injected into the LLM prompt.
// ------------------------------------------------------------------

import { examBank } from "@/data/exam";
import { examBankG10 } from "@/data/exam-g10";
import lesson1 from "@/data/lesson1";
import lesson2 from "@/data/lesson2";
import lesson3 from "@/data/lesson3";
import lesson4 from "@/data/lesson4";
import lesson5 from "@/data/lesson5";
import lesson6 from "@/data/lesson6";
import lesson7 from "@/data/lesson7";
import lesson8 from "@/data/lesson8";
import lesson9 from "@/data/lesson9";
import lesson10 from "@/data/lesson10";
import lesson11 from "@/data/lesson11";
import lesson12 from "@/data/lesson12";
import type { QuizQuestion } from "./study-types";
import { letters } from "@/components/study/quiz/quiz-constants";
import { faNum } from "./study-theme";
// r456 — jozve lookup moved OUT of this module: این ماژول از نمودارِ
// کلاینت قابلِ دسترسی است (smart-practice → questionIndex) و jozve-bank
// سمتِ سرور node:fs میخواند — همان درسِ teacher-bank.server.ts (باندلِ
// کلاینت ۵۰۰ میشد). پوششِ jozve برای /api/explain با فال‌بکِ سمتِ سرور
// در خودِ route برقرار ماند (loadJozveQuestions فقط آنجا خوانده میشود).

let index: Map<string, QuizQuestion> | null = null;

function buildIndex(): Map<string, QuizQuestion> {
  const map = new Map<string, QuizQuestion>();
  const push = (q: QuizQuestion) => {
    if (!map.has(q.id)) map.set(q.id, q);
  };
  for (const lesson of [
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
  ])
    for (const q of lesson.quizzes)
      push(q);
  for (const q of examBank) push(q);
  // r405 — بانک کنکوری پایهٔ دهم (۸۶۲ سؤال) عضوِ شاخصِ bundled است؛
  // jozve فقط سمتِ سرور است (teacher-bank.server) — fs در کلاینت نیست.
  for (const q of examBankG10) push(q);
  return map;
}

/** All bundled questions (lesson quizzes 1-12 + the 360-item exam bank). */
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
    case "synant":
      return "متضاد و مترادف";
    case "livewords":
      return "واژهٔ زنده";
    case "gramdrill":
      return "دریلِ گرامر";
    default:
      return q.category;
  }
}

// ------------------------------------------------------------------
// r403 — پیمانِ گسترشِ بانکِ معلم/توضیح: حروفِ گزینه تا «i» و پرامپتِ
// صادقِ توضیح. «undefined» چاپ‌شدهٔ خانوادهٔ ۹گزینه‌ای ممنوع؛ سؤالِ
// تایپی «پاسخِ مدل» را معرفی میکند و هرگز خودش را گزینه‌ای جعل نمیکند.
// ------------------------------------------------------------------

/** حرفِ گزینهٔ i-ام — a..i؛ بیرونِ فهرست → «#10» (هرگز undefined) */
export function optionLetter(i: number): string {
  return i >= 0 && i < letters.length ? letters[i] : `#${i + 1}`;
}

/**
 * پرامپتِ توضیحِ هوشمند از خودِ سؤالِ بانک — ارجاعِ امنِ ضد تزریق:
 * متنِ سؤال/گزینه‌ها/کلید فقط از بانکهایِ bundled می‌آید (questionIndex).
 * تایپی: «تایپی» + «پاسخِ مدل» و بدونِ واژهٔ «گزینه‌ای»؛ گزینه‌ای:
 * حروفِ a..i با کلیدِ نشان‌شده.
 */
export function buildExplainPrompt(q: QuizQuestion): string {
  const isTyped = q.kind === "typed";
  const lines: string[] = [];
  lines.push(
    `سؤال ${categoryFa(q)} — ${isTyped ? "تایپی" : `${faNum(q.options.length)}گزینه‌ای`}`
  );
  lines.push(q.question);
  if (isTyped) {
    const model = (q.accepted ?? []).filter((a) => typeof a === "string" && a.trim() !== "");
    lines.push(`پاسخِ مدل: ${model.length > 0 ? model.join(" / ") : "—"}`);
  } else {
    q.options.forEach((o, i) => {
      lines.push(`${optionLetter(i)}) ${o}${i === q.answer ? "  ← کلید درست" : ""}`);
    });
  }
  if (typeof q.translation === "string" && q.translation.trim() !== "") {
    lines.push(`ترجمه: ${q.translation}`);
  }
  return lines.join("\n");
}
