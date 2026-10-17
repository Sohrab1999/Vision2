// ------------------------------------------------------------------
// Study types for the "Vision Two" interactive web book
// Converted from the Persian 11th-grade English workbook PDF
// (Papermorph-style: PDF -> interactive web book)
// ------------------------------------------------------------------

export type Pos =
  | "n"
  | "v"
  | "adj"
  | "adv"
  | "prep"
  | "phr"
  | "phr.v"
  | "conj"
  | "pron";

export interface VocabWord {
  en: string;
  fa: string;
  pos?: Pos;
}

export interface DialogueLine {
  speaker: string;
  speakerFa: string;
  en: string;
  fa: string;
}

export interface Reading {
  titleEn: string;
  titleFa: string;
  source: string;
  paragraphs: { en: string; fa: string }[];
}

export interface GrammarSection {
  title: string;
  html: string;
}

export type QuizCategory = "vocab" | "vocab-konkuri" | "grammar";

export interface QuizQuestion {
  id: string;
  category: QuizCategory;
  question: string;
  options: string[];
  answer: number; // index 0..3
  translation?: string;
  note?: string;
  /**
   * r285 — «mcq» پیش‌فرض (غایب = mcq)؛ «typed» = پاسخ بازِ تایپی:
   * موتور به‌جای گزینه‌ها ورودی متن رندر می‌کند و با شکل‌هایِ accepted
   * (پس از نرمال‌سازی lib/typed-answer.ts) مقایسه می‌کند. options در این
   * حالت داربستِ بازبینی/ثبتِ اشتباه است و رندر نمی‌شود.
   */
  kind?: "mcq" | "typed";
  accepted?: string[];
  /**
   * r289 — راهنمای ورودیِ وابسته به بخش برای سؤال تایپی. اگر غایب باشد،
   * موتور از شکلِ خودِ ساقه استنتاج می‌کند (زنجیرهٔ پنج‌حالتی r288).
   * بانک‌های آزمون جامع درس اول (درس‌های ۲۴-۳۶) از این فیلد بهره می‌برند:
   * بانک واژگان / تعریف / مجهول‌سازی / جمله‌سازی / مرتب‌سازی.
   */
  placeholder?: string;
}

export interface LessonData {
  id: number;
  titleEn: string;
  titleFa: string;
  tagline: string;
  color: "emerald" | "amber" | "rose";
  vocabulary: VocabWord[];
  conversation: { introEn: string; introFa: string; lines: DialogueLine[] };
  readings: Reading[];
  grammar: GrammarSection[];
  synonyms: { en: string; syn: string; fa: string }[];
  antonyms?: { en: string; ant: string; fa: string }[];
  writing: WritingExercise[];
  quizzes: QuizQuestion[];
}

/** A dictation word with an optional store-key override — sources outside a
 *  single lesson (e.g. the personal word-book) pin their own keys so SRS /
 *  known / mistake bookkeeping stays on the canonical star key "1:ability". */
export interface DictationSourceWord extends VocabWord {
  storeKey?: string;
}

/** Non-lesson dictation pool: a virtual lesson for the shared DictationTab
 *  (personal word-book today, custom sets later). */
export interface DictationSource {
  /** resultKey scope, e.g. "my-words" (resultKey accepts string ids) */
  id: number | string;
  /** Persian display noun for toasts — «درس» for the lesson flow */
  label: string;
  /** theme key consumed by themeOf() */
  color: string;
  /** lesson number for /api/stats — 0 marks a non-lesson row (same
   *  contract as the my-words quiz: `lesson: typeof id === "number" ? id : 0`) */
  statsLesson: number;
  /** stats category override (defaults to "dictation") */
  category?: string;
  words: DictationSourceWord[];
}

export interface WritingExercise {
  id: string;
  fa: string; // Persian prompt (the meaning to express)
  answer: string[]; // correct English word order
  hint?: string;
}

export interface QuizResult {
  correct: number;
  total: number;
  percent: number;
  at: string; // ISO date
}

// ---------------- helpers used by data files ----------------
export const W = (en: string, fa: string, pos?: Pos): VocabWord => ({ en, fa, pos });

export const Q = (
  id: string,
  category: QuizCategory,
  question: string,
  options: string[],
  answer: number,
  translation?: string,
  note?: string
): QuizQuestion => ({ id, category, question, options, answer, translation, note });

export const SYN = (en: string, syn: string, fa: string) => ({ en, syn, fa });
export const ANT = (en: string, ant: string, fa: string) => ({ en, ant, fa });

// Grammar HTML micro-helpers (keep strings short & consistent)
export const EN = (t: string) =>
  `<span dir="ltr" style="unicode-bidi:isolate" class="font-semibold text-emerald-700">${t}</span>`;

export const FA = (t: string) =>
  `<span class="text-slate-500 text-[13px]">${t}</span>`;
