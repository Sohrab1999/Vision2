// گام ۸ §12 — اسلایس نتایج آزمون: بهترین درصد هر کلید نگه داشته می‌شود.

import type { StateCreator } from "zustand";
import type { QuizResult, StudyStore } from "../types";

export interface ResultsSlice {
  results: Record<string, QuizResult>;

  addResult: (key: string, r: QuizResult) => void;
}

export const createResultsSlice: StateCreator<StudyStore, [], [], ResultsSlice> = (set) => ({
  results: {},

  addResult: (key, r) =>
    set((s) => {
      const prev = s.results[key];
      // keep the best score
      if (prev && prev.percent >= r.percent) return s;
      return { results: { ...s.results, [key]: r } };
    }),
});
