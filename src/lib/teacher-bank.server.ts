// ------------------------------------------------------------------
// r403 — بانکِ گستردهٔ سمتِ سرور (فقط nodejs runtime).
//
// /api/explain و /api/exam-review باید «همهٔ کتاب» را بشناسند: ۸۱۲ سؤالِ
// درس‌ها/آزمونِ جامع + ۶٬۲۲۲ سؤالِ کتابخانهٔ جزوه (g7-g12: تست‌ها + گرامر)
// = ۷٬۰۳۴. اما lib/explain-source توسط کامپوننت‌های کلاینت هم import
// می‌شود (review-view / smart-practice) و node:fs در باندلِ کلاینت
// صفحهٔ اصلی را ۵۰۰ کرد — پس ایندکسِ گسترده در این ماژولِ جدا و فقط-
// سروری زندگی می‌کند و دو روت از findQuestionAny می‌خوانند.
// ------------------------------------------------------------------

import { questionIndex } from "./explain-source";
import { loadJozveQuestions } from "./jozve-bank";
import type { QuizQuestion } from "./study-types";

let wide: Map<string, QuizQuestion> | null = null;

/** bundled 812 + jozve 6222 — first-wins keeps lesson ids authoritative */
function buildWideIndex(): Map<string, QuizQuestion> {
  const map = new Map<string, QuizQuestion>(questionIndex());
  for (const q of loadJozveQuestions()) {
    if (!map.has(q.id)) map.set(q.id, q);
  }
  return map;
}

/** ۷٬۰۳۴ سؤال — the whole book the teacher/explain services may judge */
export function wideQuestionIndex(): Map<string, QuizQuestion> {
  if (!wide) wide = buildWideIndex();
  return wide;
}

export function findQuestionAny(id: string): QuizQuestion | undefined {
  return wideQuestionIndex().get(id);
}
