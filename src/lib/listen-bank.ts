"use client";

// ------------------------------------------------------------------
// F6 «بشنو و انتخاب کن» — listening bank built entirely from the
// existing book content (roadmap sprint 4: no external content).
//
// Three item kinds, mirroring the real Vision exam listening:
//   meaning — a sentence is spoken → pick the right Persian translation
//   next    — a dialogue line is spoken → pick the actual next line
//   word    — a vocabulary word is spoken → pick the right meaning
// ------------------------------------------------------------------

import { lessons } from "@/data";
import type { LessonData } from "@/lib/study-types";
import { shuffle } from "@/lib/domain/shuffle";

export type ListenKind = "meaning" | "next" | "word";

export interface ListenItem {
  id: string;
  lessonId: number;
  kind: ListenKind;
  audio: string; // English text for TTS
  prompt: string; // Persian instruction shown under the player
  correct: string; // the correct option
  distractors: string[]; // two wrong options (same lesson)
  translation: string; // Persian explanation shown in the feedback
  reveal: string; // English text revealed after answering
  wordEn?: string; // word-kind items: feeds SRS + F7 word tracking
}

export interface RoundItem extends ListenItem {
  options: string[];
  answer: number;
}

export const LISTEN_KIND_LABEL: Record<ListenKind, string> = {
  meaning: "ترجمهٔ جمله",
  next: "ادامهٔ مکالمه",
  word: "واژه",
};

const PROMPTS: Record<ListenKind, string> = {
  meaning: "به جمله‌ای که می‌شنوی گوش کن؛ معنی درست آن کدام است؟",
  next: "مکالمه را دنبال کن؛ گویشگر بعدی چه می‌گوید؟",
  word: "واژه‌ای که می‌شنوی چه معنایی دارد؟",
};

const wordCount = (s: string) => s.trim().split(/\s+/).length;

function pick2<T>(arr: T[], not: (x: T) => boolean): T[] {
  return shuffle(arr.filter(not)).slice(0, 2);
}

interface BankPool {
  meaning: ListenItem[];
  next: ListenItem[];
  word: ListenItem[];
}

let bank: BankPool | null = null;

/** Build (once) the listening bank from the three lessons. */
export function getListenBank(): BankPool {
  if (bank) return bank;
  const pools: BankPool = { meaning: [], next: [], word: [] };

  for (const lesson of lessons as LessonData[]) {
    const L = lesson.id;
    const seenAudio = new Set<string>();

    // ---- meaning items: conversation lines only (they carry sentence-level
    // fa translations — reading paragraphs only have paragraph-level ones) ----
    const lines = lesson.conversation.lines.filter((l) => wordCount(l.en) >= 3 && wordCount(l.en) <= 24);
    for (const line of lines) {
      if (seenAudio.has(line.en)) continue;
      seenAudio.add(line.en);
      const dis = pick2(
        lines.map((l) => l.fa),
        (fa) => fa !== line.fa
      );
      if (dis.length < 2) continue;
      pools.meaning.push({
        id: `ls${L}-m-${pools.meaning.length}`,
        lessonId: L,
        kind: "meaning",
        audio: line.en,
        prompt: PROMPTS.meaning,
        correct: line.fa,
        distractors: dis,
        translation: line.fa,
        reveal: line.en,
      });
    }

    // next items — dialogue line → the actual next line
    for (let i = 0; i < lesson.conversation.lines.length - 1; i++) {
      const cur = lesson.conversation.lines[i];
      const nxt = lesson.conversation.lines[i + 1];
      if (seenAudio.has(`n-${cur.en}`)) continue;
      seenAudio.add(`n-${cur.en}`);
      const dis = pick2(
        lesson.conversation.lines.map((l) => l.en),
        (en) => en !== nxt.en && en !== cur.en
      );
      if (dis.length < 2) continue;
      pools.next.push({
        id: `ls${L}-n-${i}`,
        lessonId: L,
        kind: "next",
        audio: cur.en,
        prompt: PROMPTS.next,
        correct: nxt.en,
        distractors: dis,
        translation: `${nxt.speakerFa}: ${nxt.fa}`,
        reveal: `${nxt.speaker}: ${nxt.en}`,
      });
    }

    // word items — vocabulary word → Persian meaning
    for (const w of lesson.vocabulary) {
      const dis = pick2(
        lesson.vocabulary.map((v) => v.fa),
        (fa) => fa !== w.fa
      );
      if (dis.length < 2) continue;
      pools.word.push({
        id: `ls${L}-w-${pools.word.length}`,
        lessonId: L,
        kind: "word",
        audio: w.en,
        prompt: PROMPTS.word,
        correct: w.fa,
        distractors: dis,
        translation: `${w.en} — ${w.fa}`,
        reveal: w.en,
        wordEn: w.en,
      });
    }
  }

  bank = pools;
  return pools;
}

/**
 * Assemble a balanced round: ~40% word / ~35% meaning / ~25% next
 * (falling back to whatever kind still has items). Options are shuffled
 * per round so replays never look identical.
 */
export function pickRound(count: number, lessonId: number): RoundItem[] {
  const pools = getListenBank();
  const f = <T,>(list: ListenItem[]) => (lessonId >= 1 ? list.filter((i) => i.lessonId === lessonId) : list);

  const shuffled = {
    word: shuffle(f(pools.word)),
    meaning: shuffle(f(pools.meaning)),
    next: shuffle(f(pools.next)),
  };

  const wantWord = Math.round(count * 0.4);
  const wantMeaning = Math.round(count * 0.35);
  const picked: ListenItem[] = [
    ...shuffled.word.slice(0, wantWord),
    ...shuffled.meaning.slice(0, wantMeaning),
    ...shuffled.next.slice(0, Math.max(0, count - wantWord - wantMeaning)),
  ];
  // top-up from any remaining kinds when a pool ran dry
  const usedAudio = new Set(picked.map((i) => i.audio));
  for (const list of [shuffled.next, shuffled.meaning, shuffled.word]) {
    while (picked.length < count && list.length > 0) {
      const item = list.pop()!;
      if (usedAudio.has(item.audio)) continue;
      usedAudio.add(item.audio);
      picked.push(item);
    }
    if (picked.length >= count) break;
  }

  return shuffle(picked.slice(0, count)).map((item) => {
    const options = shuffle([item.correct, ...item.distractors]);
    return { ...item, options, answer: options.indexOf(item.correct) };
  });
}

/** total available items (for the setup screen hint) */
export function listenBankStats(lessonId: number): { word: number; meaning: number; next: number; total: number } {
  const pools = getListenBank();
  const f = <T,>(list: ListenItem[]) => (lessonId >= 1 ? list.filter((i) => i.lessonId === lessonId) : list);
  const word = f(pools.word).length;
  const meaning = f(pools.meaning).length;
  const next = f(pools.next).length;
  return { word, meaning, next, total: word + meaning + next };
}
