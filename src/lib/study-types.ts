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
