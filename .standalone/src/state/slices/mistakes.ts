// گام ۸ §12 — اسلایس خطاها: بانک اشتباه درس‌ها + شمارنده‌های واژه‌سطح (F7).

import type { StateCreator } from "zustand";
import type { StudyStore } from "../types";

export interface MistakesSlice {
  mistakes: Record<string, number>; // mistakes["1:l1-v3"] = wrong count
  wordMistakes: Record<string, number>; // F7 — wrong answers per word key
  wordSeen: Record<string, number>; // F7 — answered (seen) per word key

  addMistakes: (lessonId: number | string, ids: string[]) => void;
  clearMistake: (lessonId: number | string, id: string) => void;
  addWordResults: (entries: { key: string; ok: boolean }[]) => void;
}

export const createMistakesSlice: StateCreator<StudyStore, [], [], MistakesSlice> = (set) => ({
  mistakes: {},
  wordMistakes: {},
  wordSeen: {},

  addMistakes: (lessonId, ids) =>
    set((s) => {
      const next = { ...s.mistakes };
      for (const id of ids) {
        const k = `${lessonId}:${id}`;
        next[k] = (next[k] ?? 0) + 1;
      }
      return { mistakes: next };
    }),
  clearMistake: (lessonId, id) =>
    set((s) => {
      const k = `${lessonId}:${id}`;
      if (!(k in s.mistakes)) return s;
      const next = { ...s.mistakes };
      delete next[k];
      return { mistakes: next };
    }),
  // F7 — accumulate word-level seen/mistake counters (quiz/dictation/listening)
  addWordResults: (entries) =>
    set((s) => {
      if (entries.length === 0) return s;
      const seen = { ...s.wordSeen };
      const wrong = { ...s.wordMistakes };
      for (const { key, ok } of entries) {
        if (!key) continue;
        seen[key] = (seen[key] ?? 0) + 1;
        if (!ok) wrong[key] = (wrong[key] ?? 0) + 1;
      }
      return { wordSeen: seen, wordMistakes: wrong };
    }),
});
