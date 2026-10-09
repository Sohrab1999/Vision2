"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { QuizResult } from "@/lib/study-types";

export type View =
  | { type: "home" }
  | { type: "lesson"; id: number }
  | { type: "dictionary" }
  | { type: "exam" }
  | { type: "appendix" };

export type LessonTab = "vocab" | "conversation" | "reading" | "grammar" | "tests";

interface StudyState {
  view: View;
  lessonTab: LessonTab;
  known: Record<string, boolean>;
  results: Record<string, QuizResult>;
  userId: string;

  goHome: () => void;
  openLesson: (id: number) => void;
  setView: (v: View) => void;
  setLessonTab: (t: LessonTab) => void;
  toggleKnown: (key: string) => void;
  addResult: (key: string, r: QuizResult) => void;
  ensureUserId: () => string;
}

export const wordKey = (lessonId: number, en: string) => `${lessonId}:${en.toLowerCase()}`;
export const resultKey = (lessonId: number | string, category: string) => `${lessonId}:${category}`;

export const useStudy = create<StudyState>()(
  persist(
    (set, get) => ({
      view: { type: "home" },
      lessonTab: "vocab",
      known: {},
      results: {},
      userId: "",

      goHome: () => set({ view: { type: "home" } }),
      openLesson: (id) => set({ view: { type: "lesson", id } }),
      setView: (v) => set({ view: v }),
      setLessonTab: (t) => set({ lessonTab: t }),
      toggleKnown: (key) =>
        set((s) => ({ known: { ...s.known, [key]: !s.known[key] } })),
      addResult: (key, r) =>
        set((s) => {
          const prev = s.results[key];
          // keep the best score
          if (prev && prev.percent >= r.percent) return s;
          return { results: { ...s.results, [key]: r } };
        }),
      ensureUserId: () => {
        const existing = get().userId;
        if (existing) return existing;
        const id =
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `u-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        set({ userId: id });
        return id;
      },
    }),
    {
      name: "vision2-study-v1",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (s) => ({
        known: s.known,
        results: s.results,
        userId: s.userId,
      }),
    }
  )
);

// ---------------- aggregate progress helpers ----------------

export interface ProgressSummary {
  knownCount: number;
  totalPercent: number;
  doneCategories: number;
  bestExam: QuizResult | null;
}

export function summarize(
  known: Record<string, boolean>,
  results: Record<string, QuizResult>
): ProgressSummary {
  const knownCount = Object.values(known).filter(Boolean).length;
  const rs = Object.values(results);
  const totalPercent = rs.length
    ? Math.round(rs.reduce((s, r) => s + r.percent, 0) / rs.length)
    : 0;
  const bestExam = results["exam"] ?? null;
  return { knownCount, totalPercent, doneCategories: rs.length, bestExam };
}

export function knownCountOfLesson(
  known: Record<string, boolean>,
  lessonId: number
): number {
  const prefix = `${lessonId}:`;
  return Object.entries(known).filter(([k, v]) => k.startsWith(prefix) && v).length;
}
