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

interface LessonVocabIndex {
  byEn: Map<string, { lessonId: number; word: VocabWord }>; // lowercase en → word
  words: { lessonId: number; word: VocabWord }[];
}

let vocabIndex: LessonVocabIndex | null = null;

function getVocabIndex(): LessonVocabIndex {
  if (vocabIndex) return vocabIndex;
  const byEn = new Map<string, { lessonId: number; word: VocabWord }>();
  const words: { lessonId: number; word: VocabWord }[] = [];
  for (const lesson of lessons) {
    for (const w of lesson.vocabulary) {
      const k = w.en.toLowerCase();
      if (!byEn.has(k)) {
        byEn.set(k, { lessonId: lesson.id, word: w });
        words.push({ lessonId: lesson.id, word: w });
      }
    }
  }
  vocabIndex = { byEn, words };
  return vocabIndex;
}

const clean = (s: string) => s.trim().toLowerCase().replace(/[.,!?;:]+$/, "");

/** Resolve the vocabulary word a quiz option text refers to (exact match). */
export function matchVocabWord(lessonId: number, optionText: string): VocabWord | null {
  if (lessonId < 1) return null;
  const idx = getVocabIndex();
  const hit = idx.byEn.get(clean(optionText));
  return hit && hit.lessonId === lessonId ? hit.word : null;
}

/** Resolve a word by its store key ("1:ability"). */
export function wordByKey(key: string): { lessonId: number; word: VocabWord } | null {
  const [head, ...rest] = key.split(":");
  const lessonId = Number(head);
  const en = rest.join(":");
  if (!Number.isInteger(lessonId) || lessonId < 1 || !en) return null;
  const idx = getVocabIndex();
  const hit = idx.byEn.get(en.toLowerCase());
  return hit && hit.lessonId === lessonId ? hit : null;
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

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

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
