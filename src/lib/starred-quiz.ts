// «مرور واژه‌های نشان‌شده» — quiz generator for the personal word-book.
//
// Pure and UI-free: takes resolved starred words and returns a ready-to-run
// QuizQuestion[] plus the RTL-option set for the engine. Three question
// sources per word, in priority order:
//   1) a REAL bank question whose correct option is this word (best quality,
//      official phrasing — same pre-index strategy as buildDangerQuiz)
//   2) EN→FA drill — "Choose the Persian meaning of «X»" (Persian options)
//   3) FA→EN drill — "Which English word means «X»" (English options)
//
// Distractors come from the SAME lesson first (fair difficulty), then spill
// over to the other lessons so tiny pools still produce 4 options. The `l1`
// style id prefix keeps questionSourceLesson()/word-risk working for real
// bank questions; synthesized drills use category "vocab" too so the
// word-risk feed is best-effort consistent.

import { lessons } from "@/data";
import type { QuizQuestion, VocabWord } from "@/lib/study-types";
import { matchVocabWord } from "@/lib/word-risk";
import { shuffle } from "@/lib/domain/shuffle";

export interface StarredQuizWord {
  key: string; // "1:ability" (store key — used for stable dedupe)
  lessonId: number;
  en: string;
  fa: string;
}

export interface StarredQuiz {
  questions: QuizQuestion[];
  /** question ids whose OPTIONS are Persian (engine renders RTL options) */
  faOptions: Set<string>;
  /** question id → source lesson (for the result-screen breakdown) */
  lessonOf: Map<string, number>;
}

const slug = (en: string) => en.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "w";

interface BankEntry {
  q: QuizQuestion;
  lessonId: number;
}

/** index every vocab bank question by the English word its correct option tests */
function buildBankIndex(): Map<string, BankEntry[]> {
  const map = new Map<string, BankEntry[]>();
  for (const lesson of lessons) {
    for (const q of lesson.quizzes) {
      if (q.category !== "vocab" && q.category !== "vocab-konkuri") continue;
      // exact-match only (matchVocabWord's clean() lookup) — a loose
      // "contains" test would index "apart" under the word "art"
      const w = matchVocabWord(lesson.id, q.options[q.answer] ?? "");
      if (!w) continue;
      const k = `${lesson.id}:${w.en.toLowerCase()}`;
      const list = map.get(k) ?? [];
      list.push({ q, lessonId: lesson.id });
      map.set(k, list);
    }
  }
  return map;
}

let bankIndex: Map<string, BankEntry[]> | null = null;
function bankIndexOnce(): Map<string, BankEntry[]> {
  if (!bankIndex) bankIndex = buildBankIndex();
  return bankIndex;
}

/** pick up to `n` distractors: same lesson first, then other lessons */
function pickDistractors(target: StarredQuizWord, field: "fa" | "en", n: number): VocabWord[] {
  const isDup = (v: VocabWord) => v[field] === target[field];
  const seen = new Set<string>([target[field]]);
  const out: VocabWord[] = [];
  const pushUnique = (pool: VocabWord[]) => {
    for (const v of shuffle(pool)) {
      if (out.length >= n) break;
      const val = v[field];
      if (isDup(v) || seen.has(val)) continue;
      seen.add(val);
      out.push(v);
    }
  };
  const sameLesson = lessons.find((l) => l.id === target.lessonId)?.vocabulary ?? [];
  pushUnique(sameLesson);
  if (out.length < n) {
    const rest = lessons.filter((l) => l.id !== target.lessonId).flatMap((l) => l.vocabulary);
    pushUnique(rest);
  }
  return out;
}

/** EN→FA drill: Persian options */
function enToFa(w: StarredQuizWord): QuizQuestion | null {
  const distractors = pickDistractors(w, "fa", 3);
  if (distractors.length < 3) return null;
  const options = shuffle([w.fa, ...distractors.map((v) => v.fa)]);
  const answer = options.indexOf(w.fa);
  return {
    id: `l${w.lessonId}-star-${slug(w.en)}`,
    category: "vocab",
    question: `Choose the Persian meaning of “${w.en}”:  ----------------`,
    options,
    answer: answer < 0 ? 0 : answer,
    translation: `معنی واژهٔ «${w.en}»: ${w.fa}`,
  };
}

/** FA→EN drill: English options (bidi-isolated Persian inside an LTR stem) */
function faToEn(w: StarredQuizWord): QuizQuestion | null {
  const distractors = pickDistractors(w, "en", 3);
  if (distractors.length < 3) return null;
  const options = shuffle([w.en, ...distractors.map((v) => v.en)]);
  const answer = options.indexOf(w.en);
  return {
    id: `l${w.lessonId}-star-rev-${slug(w.fa)}`,
    category: "vocab",
    question: `Which English word means \u2066«${w.fa}»\u2069 ?`,
    options,
    answer: answer < 0 ? 0 : answer,
    translation: `واژهٔ انگلیسی برای «${w.fa}»: ${w.en}`,
  };
}

/**
 * Build a review session from starred words (order preserved = caller's
 * chosen ordering; the final question order is shuffled). Real bank
 * questions win; otherwise the two drill directions alternate so a session
 * doesn't feel monotonous. Words that cannot produce a question (no bank
 * hit and an empty vocabulary pool) are skipped — never fatal.
 */
export function buildStarredQuiz(words: StarredQuizWord[], max = 15): StarredQuiz {
  const faOptions = new Set<string>();
  const lessonOf = new Map<string, number>();
  const questions: QuizQuestion[] = [];
  const usedIds = new Set<string>();
  const idx = bankIndexOnce();

  const add = (q: QuizQuestion, lessonId: number, faOpts = false) => {
    if (usedIds.has(q.id) || questions.length >= max) return;
    usedIds.add(q.id);
    questions.push(q);
    lessonOf.set(q.id, lessonId);
    if (faOpts) faOptions.add(q.id);
  };

  words.forEach((w, i) => {
    if (questions.length >= max) return;
    // 1) real bank question first
    const bank = idx.get(`${w.lessonId}:${w.en.toLowerCase()}`);
    if (bank && bank.length > 0) {
      const pick = bank[i % bank.length];
      add(pick.q, pick.lessonId);
      return;
    }
    // 2) alternate drill directions for variety
    const isEnToFa = i % 2 === 0;
    const drill = isEnToFa ? enToFa(w) : faToEn(w);
    if (drill) add(drill, w.lessonId, isEnToFa);
  });

  return { questions: shuffle(questions), faOptions, lessonOf };
}
