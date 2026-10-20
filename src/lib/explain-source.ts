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
import { faNum } from "./study-theme";
import type { QuizQuestion } from "./study-types";

let index: Map<string, QuizQuestion> | null = null;

function buildIndex(): Map<string, QuizQuestion> {
  const map = new Map<string, QuizQuestion>();
  const push = (q: QuizQuestion) => {
    if (!map.has(q.id)) map.set(q.id, q);
  };
  for (const lesson of [lesson1, lesson2, lesson3]) for (const q of lesson.quizzes) push(q);
  for (const q of examBank) push(q);
  // r405 — بانک کنکور دهم (g10-1..g10-862) هم اکنون بخشی از ایندکسِ باندل است؛
  // پیش از این خطاهایِ کنکور در مرورِ سریع ناپدید می‌شدند و /api/explain
  // و /api/exam-review روی این شناسه‌ها 404/400 می‌دادند.
  for (const q of examBankG10) push(q);
  return map;
}

/**
 * Client-safe bundled index (1674 = 142+150+160 lessons + 360 exam + 862 konkur g10).
 * r405 — examBankG10 joined the bundle: quick review now resolves konkur
 * mistake keys (g10:N) synchronously and the exam corner's own review
 * sessions stop being invisible to the mistake bank.
 * r403 — the WIDE index (bundled + jozve library, ۷٬۸۹۶) lives in
 * lib/teacher-bank.server.ts: this module is also imported by client
 * components (review-view / smart-practice), so node:fs must stay out.
 */
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

/** r403 — برچسبِ حرفِ گزینه برای پرامپت: بانک‌های جزوه تا ۹ گزینه دارند
 *  (خانوادهٔ «جای خالی از بانک واژه») و نسخهٔ قبلی «abcd» برای گزینهٔ
 *  پنجم به بعد «undefined) …» چاپ می‌کرد. */
export function optionLetter(i: number): string {
  return "abcdefghi"[i] ?? `#${i + 1}`;
}

/** r403 — پرامپتِ «چرا غلط شد؟» از روت به اینجا کوچید (pure، تست‌پذیر).
 *  شمارِ گزینه‌ها و سؤالِ تایپی صادقانه معرفی می‌شوند — نسخهٔ قبلی
 *  هر سؤالی را «چهارگزینه‌ای» می‌نامید و برای تایپی‌ها بی‌معنا بود. */
export function buildExplainPrompt(q: QuizQuestion): string {
  const header =
    q.kind === "typed"
      ? "یک دانش‌آموز در سؤالِ تایپیِ (پاسخِ باز) زیر پاسخ اشتباه داده و می‌خواهد بداند چرا پاسخِ مدل، درست است.\n\n"
      : `یک دانش‌آموز در سؤالِ ${faNum(q.options.length)}گزینه‌ای زیر پاسخ اشتباه داده و می‌خواهد بداند چرا گزینهٔ درست، درست است.\n\n`;
  const options =
    q.kind === "typed"
      ? `پاسخِ مدل (کلید):\n${optionLetter(0)}) ${q.options[0]}\n`
      : `گزینه‌ها:\n${q.options.map((o, i) => `${optionLetter(i)}) ${o}${i === q.answer ? "  ← کلید درست" : ""}`).join("\n")}\n`;
  const tail =
    q.kind === "typed"
      ? `طبق قواعد سیستم توضیح بده که پاسخِ مدل چه نکتهٔ گرامری یا واژگانی را می‌خواهد و شکلِ درستِ پاسخ چیست.`
      : `طبق قواعد سیستم توضیح بده که چرا فقط همین گزینه با جمله سازگار است (و نکتهٔ اصلی تفاوتش با گزینه‌های نزدیک چیست).`;
  return (
    header +
    `مهارت سؤال: ${categoryFa(q)}\n` +
    `متن سؤال: ${q.question}\n` +
    options +
    `کلید: ${optionLetter(q.answer)}) ${q.options[q.answer]}\n\n` +
    tail
  );
}
