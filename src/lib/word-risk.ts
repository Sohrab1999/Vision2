"use client";

// ------------------------------------------------------------------
// F7 «واژه‌های خطرناک من» — word-level mistake analysis (roadmap sprint 4)
//
// Signals feed in from every engine that KNOWS which word was tested:
//   • quiz-engine  → the correct-answer option of vocab/konkuri questions
//   • dictation    → the typed word itself
//   • listening    → "word" kind items
// The panel ranks words by wrong-answers and offers targeted
// flashcards / a generated practice quiz that closes the loop with SRS.
// ------------------------------------------------------------------

import type { QuizQuestion, VocabWord } from "@/lib/study-types";
import { lessons } from "@/data";
import { questionSourceLesson, wordKey, useStudy, type WordStatMap } from "@/lib/study-store";
import { shuffle } from "@/lib/domain/shuffle";

export interface DangerWord {
  key: string; // "1:ability"
  lessonId: number;
  en: string;
  fa: string;
  mistakes: number;
  seen: number;
  rate: number; // mistakes / seen (0..1)
}

// ---- lesson vocabulary lookup (lazy, module-level cache) ----
//
// TWO-LEVEL resolver (task 62). 34 words appear in TWO lessons with
// different senses ("take", "happen", "create"…) — the old index kept only
// the FIRST occurrence, so every lesson-2/3 signal on those words (quiz
// mistakes, starring from results) was silently dropped and "2:take" keys
// were unresolvable for the danger feed. The index is now per-lesson
// (same semantics as resolveStar / flashcards / lesson dictation, which
// always wrote per-lesson keys), and wordByKey gains a cross-lesson
// fallback so keys orphaned by content churn still resolve somewhere.

interface LessonVocabIndex {
  /** "lessonId:lowercase-en" → entry — EVERY occurrence of every word */
  byLessonEn: Map<string, { lessonId: number; word: VocabWord }>;
  /** lowercase en → first-occurrence entry — level-2 fallback for stale keys */
  firstByEn: Map<string, { lessonId: number; word: VocabWord }>;
}

let vocabIndex: LessonVocabIndex | null = null;

function getVocabIndex(): LessonVocabIndex {
  if (vocabIndex) return vocabIndex;
  const byLessonEn = new Map<string, { lessonId: number; word: VocabWord }>();
  const firstByEn = new Map<string, { lessonId: number; word: VocabWord }>();
  for (const lesson of lessons) {
    for (const w of lesson.vocabulary) {
      const k = w.en.toLowerCase();
      const entry = { lessonId: lesson.id, word: w };
      byLessonEn.set(`${lesson.id}:${k}`, entry);
      if (!firstByEn.has(k)) firstByEn.set(k, entry);
    }
  }
  vocabIndex = { byLessonEn, firstByEn };
  return vocabIndex;
}

const clean = (s: string) => s.trim().toLowerCase().replace(/[.,!?;:]+$/, "");

/**
 * Resolve the vocabulary word a quiz option text refers to (exact match)
 * WITHIN the question's source lesson — second occurrences resolve to
 * their own sense, not the first lesson's.
 */
export function matchVocabWord(lessonId: number, optionText: string): VocabWord | null {
  if (lessonId < 1) return null;
  const idx = getVocabIndex();
  return idx.byLessonEn.get(`${lessonId}:${clean(optionText)}`)?.word ?? null;
}

/**
 * Resolve a word by its store key ("1:ability", "2:take").
 * Level 1: the exact per-lesson occurrence. Level 2: if the lesson has no
 * such word (key orphaned by content churn), fall back to the word's first
 * occurrence in book order — a stale key still points at the same string.
 */
export function wordByKey(key: string): { lessonId: number; word: VocabWord } | null {
  const [head, ...rest] = key.split(":");
  const lessonId = Number(head);
  const en = rest.join(":");
  if (!Number.isInteger(lessonId) || lessonId < 1 || !en) return null;
  const idx = getVocabIndex();
  const enLower = en.toLowerCase();
  return idx.byLessonEn.get(`${lessonId}:${enLower}`) ?? idx.firstByEn.get(enLower) ?? null;
}

// ---- feed from engines ----

/**
 * Word-level tracking for quiz engines: for every answered vocab /
 * vocab-konkuri question of a lesson bank, the CORRECT option is the word
 * under test — count it as seen, and as a mistake when answered wrong.
 * (Exam-bank questions have no lesson vocabulary to resolve → skipped.)
 */
export function recordQuizWordResults(questions: QuizQuestion[], answers: number[]): void {
  const entries: { key: string; ok: boolean }[] = [];
  for (const [i, q] of questions.entries()) {
    const answer = answers[i];
    if (answer === undefined) continue; // timed-out / unanswered → not a real signal
    if (q.category !== "vocab" && q.category !== "vocab-konkuri") continue;
    const lessonId = questionSourceLesson(q);
    if (lessonId < 1) continue;
    const correctOpt = q.options[q.answer];
    if (typeof correctOpt !== "string") continue;
    const word = matchVocabWord(lessonId, correctOpt);
    if (!word) continue;
    entries.push({ key: wordKey(lessonId, word.en), ok: answer === q.answer });
  }
  if (entries.length) useStudy.getState().addWordResults(entries);
}

// ---- ranking ----

/**
 * Top dangerous words: ranked by wrong answers (primary) then error rate.
 * Only words with ≥1 wrong answer and ≥2 sightings qualify — one unlucky
 * sighting shouldn't brand a word "dangerous".
 */
export function dangerWords(
  wordMistakes: WordStatMap,
  wordSeen: WordStatMap,
  limit = 10
): DangerWord[] {
  const out: DangerWord[] = [];
  for (const [key, mistakes] of Object.entries(wordMistakes)) {
    if (mistakes <= 0) continue;
    const seen = wordSeen[key] ?? 0;
    // one unlucky sighting isn't evidence — require either a second sighting
    // or a repeated failure before branding a word "dangerous"
    if (seen < 2 && mistakes < 2) continue;
    const hit = wordByKey(key);
    if (!hit) continue; // vocabulary changed → drop stale keys
    out.push({
      key,
      lessonId: hit.lessonId,
      en: hit.word.en,
      fa: hit.word.fa,
      mistakes,
      seen,
      rate: seen > 0 ? mistakes / seen : 1,
    });
  }
  return out
    .sort((a, b) => b.mistakes - a.mistakes || b.rate - a.rate || b.seen - a.seen)
    .slice(0, limit);
}

// ---- targeted practice quiz ----

export interface DangerQuiz {
  questions: QuizQuestion[];
  /** question ids whose options are Persian (rendered RTL by the quiz engine) */
  faOptions: Set<string>;
}

/**
 * Build a 10-question drill from the given dangerous words.
 * Prefers REAL bank questions whose correct answer is that word; when the
 * bank has none, synthesizes a "word → meaning" question with same-lesson
 * Persian distractors (marked in faOptions for RTL rendering).
 */
export function buildDangerQuiz(words: DangerWord[], max = 10): DangerQuiz {
  const questions: QuizQuestion[] = [];
  const faOptions = new Set<string>();
  const usedIds = new Set<string>();

  // pre-index real bank questions: lessonId + correct-option-word → question
  const bankByWord = new Map<string, QuizQuestion[]>();
  for (const lesson of lessons) {
    for (const q of lesson.quizzes) {
      if (q.category !== "vocab" && q.category !== "vocab-konkuri") continue;
      const w = matchVocabWord(lesson.id, q.options[q.answer] ?? "");
      if (!w) continue;
      const k = wordKey(lesson.id, w.en);
      const list = bankByWord.get(k) ?? [];
      list.push(q);
      bankByWord.set(k, list);
    }
  }

  for (const d of words) {
    if (questions.length >= max) break;
    // 1) real bank question first (rotating through matches for variety)
    const real = bankByWord.get(d.key);
    if (real && real.length > 0) {
      const pick = real[questions.length % real.length];
      if (!usedIds.has(pick.id)) {
        usedIds.add(pick.id);
        questions.push(pick);
        continue;
      }
    }
    // 2) synthesized "what does X mean" with same-lesson Persian distractors
    const lesson = lessons.find((l) => l.id === d.lessonId);
    if (!lesson) continue;
    const others = shuffle(lesson.vocabulary.filter((w) => w.fa !== d.fa && w.en !== d.en)).slice(0, 3);
    if (others.length < 3) continue;
    const options = shuffle([d.fa, ...others.map((w) => w.fa)]);
    const answer = options.indexOf(d.fa);
    const id = `risk-${d.lessonId}-${d.en.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
    if (usedIds.has(id)) continue;
    usedIds.add(id);
    faOptions.add(id);
    questions.push({
      id,
      category: "vocab",
      question: `Choose the Persian meaning of “${d.en}”:  ----------------`,
      options,
      answer: answer < 0 ? 0 : answer,
      translation: `معنی واژهٔ «${d.en}» در درس ${d.lessonId === 1 ? "اول" : d.lessonId === 2 ? "دوم" : "سوم"}: ${d.fa}`,
    });
  }

  return { questions, faOptions };
}
