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

export type LessonTab = "vocab" | "conversation" | "reading" | "grammar" | "writing" | "tests";

interface StudyState {
  view: View;
  lessonTab: LessonTab;
  known: Record<string, boolean>;
  results: Record<string, QuizResult>;
  srs: Record<string, SrsItem>;
  userId: string;

  goHome: () => void;
  openLesson: (id: number) => void;
  setView: (v: View) => void;
  setLessonTab: (t: LessonTab) => void;
  toggleKnown: (key: string) => void;
  addResult: (key: string, r: QuizResult) => void;
  reviewWord: (key: string, known: boolean) => void;
  ensureUserId: () => string;
}

// ---------------- spaced repetition (SM-2 lite) ----------------

export interface SrsItem {
  level: number; // 0..5
  dueAt: number; // epoch ms
}

export const SRS_INTERVALS = [
  15 * 60_000, // 15 دقیقه
  86_400_000, // ۱ روز
  3 * 86_400_000, // ۳ روز
  7 * 86_400_000, // ۱ هفته
  14 * 86_400_000, // ۲ هفته
  30 * 86_400_000, // ۱ ماه
];

export const SRS_LABELS = ["۱۵ دقیقه", "۱ روز", "۳ روز", "۱ هفته", "۲ هفته", "۱ ماه"];

export function srsDueCount(srs: Record<string, SrsItem>, lessonId: number): number {
  const now = Date.now();
  const prefix = `${lessonId}:`;
  return Object.entries(srs).filter(([k, v]) => k.startsWith(prefix) && v.dueAt <= now).length;
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
      srs: {},
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
      reviewWord: (key, known) =>
        set((s) => {
          const prev = s.srs[key];
          const level = known
            ? Math.min((prev?.level ?? -1) + 1, SRS_INTERVALS.length - 1)
            : 0;
          return {
            srs: {
              ...s.srs,
              [key]: { level, dueAt: Date.now() + SRS_INTERVALS[level] },
            },
          };
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
        srs: s.srs,
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
