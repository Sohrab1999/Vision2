// ------------------------------------------------------------------
// r404 — گاردِ شکلِ سؤال، مشترک میانِ سرور و کلاینت.
//
// پیشتر همین منطق داخلِ lib/jozve-bank.ts (سمتِ سرور، node:fs) بود؛
// راندِ r404 لودرِ کلاینتِ کتابخانهٔ جزوه را هم اضافه کرد
// (lib/jozve-bank.client.ts) که همان فایل‌های عمومی را با fetch
// می‌خواند — و دو نسخه‌شدنِ گارد یعنی رانشِ رفتار. پس اعتبارسنجِ
// خالص به این ماژولِ بی‌وابستگی کوچ شد و هر دو بانک از آن می‌خوانند.
// هیچ importی از node:fs یا فریمورک ندارد — در هر دو محیط امن است.
// ------------------------------------------------------------------

import type { QuizCategory, QuizQuestion } from "./study-types";

/** minimal runtime shape-check — a row must look like a real question */
export function asQuestion(raw: unknown): QuizQuestion | null {
  if (typeof raw !== "object" || raw === null) return null;
  const q = raw as Record<string, unknown>;
  const { id, question, options, answer } = q as Record<string, unknown>;
  if (typeof id !== "string" || id.length === 0 || id.length > 60) return null;
  if (typeof question !== "string" || question.trim().length === 0) return null;
  if (!Array.isArray(options) || options.length === 0) return null;
  if (!options.every((o) => typeof o === "string")) return null;
  if (typeof answer !== "number" || !Number.isInteger(answer) || answer < 0 || answer >= options.length) return null;
  const rawCat = typeof q.category === "string" ? q.category : "vocab";
  const category: QuizCategory = rawCat === "grammar" || rawCat === "vocab-konkuri" ? rawCat : "vocab";
  const out: QuizQuestion = {
    id,
    category,
    question,
    options: options as string[],
    answer,
  };
  if (q.kind === "typed") out.kind = "typed";
  if (Array.isArray(q.accepted) && q.accepted.every((a) => typeof a === "string")) {
    out.accepted = q.accepted as string[];
  }
  if (typeof q.translation === "string" && q.translation.length > 0) out.translation = q.translation;
  return out;
}
