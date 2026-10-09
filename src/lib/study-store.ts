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

export type LessonTab = "vocab" | "conversation" | "reading" | "grammar" | "writing" | "dictation" | "tests";

// daily activity for streak + daily goal
interface DayStat {
  day: string; // "2026-10-09"
  reviews: number; // flashcard reviews
  quizzes: number; // finished quizzes/dictation/writing
}

// error bank: mistakes["1:l1-v3"] = number of wrong answers
export type MistakeMap = Record<string, number>;
// weekly history: history["2026-10-09"] = { reviews, quizzes }
export type HistoryMap = Record<string, { reviews: number; quizzes: number }>;

export const AVATAR_COLORS = ["emerald", "amber", "rose", "violet", "sky"] as const;
export type AvatarColor = (typeof AVATAR_COLORS)[number];

const DAILY_GOAL = 10;

function todayStr(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export interface StudyState {
  view: View;
  lessonTab: LessonTab;
  known: Record<string, boolean>;
  results: Record<string, QuizResult>;
  srs: Record<string, SrsItem>;
  userId: string;
  userName: string;
  avatarColor: string;
  streak: number;
  bestStreak: number;
  lastActiveDay: string;
  dayStat: DayStat;
  history: HistoryMap;
  mistakes: MistakeMap;
  flashIntent: "none" | "smart";
  seenBadges: string[];

  setProfile: (name: string, color: string) => void;
  markBadgesSeen: (ids: string[]) => void;
  goHome: () => void;
  openLesson: (id: number, flashIntent?: "smart") => void;
  openLessonTab: (id: number, tab: LessonTab) => void;
  setView: (v: View) => void;
  setLessonTab: (t: LessonTab) => void;
  consumeFlashIntent: () => void;
  toggleKnown: (key: string) => void;
  addResult: (key: string, r: QuizResult) => void;
  reviewWord: (key: string, known: boolean) => void;
  trackReview: () => void;
  trackQuizDone: () => void;
  addMistakes: (lessonId: number | string, ids: string[]) => void;
  clearMistake: (lessonId: number | string, id: string) => void;
  lessonMistakeCount: (lessonId: number) => number;
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

export function srsDueTotal(srs: Record<string, SrsItem>): number {
  const now = Date.now();
  return Object.values(srs).filter((v) => v.dueAt <= now).length;
}

export function firstLessonWithDue(srs: Record<string, SrsItem>): number | null {
  for (const id of [1, 2, 3]) {
    if (srsDueCount(srs, id) > 0) return id;
  }
  return null;
}

export const DAILY_TARGET = DAILY_GOAL;
export { todayStr };

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
      userName: "",
      avatarColor: "emerald",
      streak: 0,
      bestStreak: 0,
      lastActiveDay: "",
      dayStat: { day: "", reviews: 0, quizzes: 0 },
      history: {},
      mistakes: {},
      flashIntent: "none",
      seenBadges: [],

      setProfile: (name, color) => set({ userName: name, avatarColor: color }),
      markBadgesSeen: (ids) => set((s) => ({ seenBadges: [...new Set([...s.seenBadges, ...ids])] })),
      goHome: () => set({ view: { type: "home" }, flashIntent: "none" }),
      openLesson: (id, flashIntent = "none") => set({ view: { type: "lesson", id }, flashIntent }),
      openLessonTab: (id, tab) => set({ view: { type: "lesson", id }, lessonTab: tab }),
      setView: (v) => set({ view: v, flashIntent: "none" }),
      setLessonTab: (t) => set({ lessonTab: t }),
      consumeFlashIntent: () => set({ flashIntent: "none" }),
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
      trackReview: () =>
        set((s) => {
          const today = todayStr();
          const stat = s.dayStat.day === today ? s.dayStat : { day: today, reviews: 0, quizzes: 0 };
          return applyStreak(s, { ...stat, reviews: stat.reviews + 1 });
        }),
      trackQuizDone: () =>
        set((s) => {
          const today = todayStr();
          const stat = s.dayStat.day === today ? s.dayStat : { day: today, reviews: 0, quizzes: 0 };
          return applyStreak(s, { ...stat, quizzes: stat.quizzes + 1 });
        }),
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
      lessonMistakeCount: (lessonId) => {
        const prefix = `${lessonId}:`;
        return Object.keys(get().mistakes).filter((k) => k.startsWith(prefix)).length;
      },
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
        userName: s.userName,
        avatarColor: s.avatarColor,
        streak: s.streak,
        bestStreak: s.bestStreak,
        lastActiveDay: s.lastActiveDay,
        dayStat: s.dayStat,
        history: s.history,
        mistakes: s.mistakes,
        seenBadges: s.seenBadges,
      }),
    }
  )
);

// ---------------- streak helper ----------------

function applyStreak(
  s: {
    streak: number;
    bestStreak: number;
    lastActiveDay: string;
    history: HistoryMap;
  },
  dayStat: DayStat
): Pick<StudyState, "streak" | "bestStreak" | "lastActiveDay" | "dayStat" | "history"> {
  const today = todayStr();
  // keep last 30 days of weekly history
  const history: HistoryMap = { ...s.history, [dayStat.day]: { reviews: dayStat.reviews, quizzes: dayStat.quizzes } };
  for (const k of Object.keys(history)) {
    if (Object.keys(history).length <= 30) break;
    delete history[k];
  }
  if (s.lastActiveDay === today) {
    return { streak: s.streak, bestStreak: s.bestStreak, lastActiveDay: today, dayStat, history };
  }
  const y = new Date();
  y.setDate(y.getDate() - 1);
  const streak = s.lastActiveDay === todayStr(y) ? s.streak + 1 : 1;
  return { streak, bestStreak: Math.max(streak, s.bestStreak), lastActiveDay: today, dayStat, history };
}

/** last N days (oldest → newest) with Persian weekday labels */
export function lastNDays(n: number, history: HistoryMap): { day: string; weekday: string; reviews: number; quizzes: number; total: number; isToday: boolean }[] {
  const weekdays = ["یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه", "شنبه"];
  const out: ReturnType<typeof lastNDays> = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = todayStr(d);
    const h = history[key] ?? { reviews: 0, quizzes: 0 };
    out.push({
      day: key,
      weekday: weekdays[d.getDay()],
      reviews: h.reviews,
      quizzes: h.quizzes,
      total: h.reviews + h.quizzes,
      isToday: i === 0,
    });
  }
  return out;
}

/** count of wrong-bank questions for a lesson */
export function mistakesOfLesson(mistakes: MistakeMap, lessonId: number | string): number {
  const prefix = `${lessonId}:`;
  return Object.keys(mistakes).filter((k) => k.startsWith(prefix)).length;
}

// ---------------- aggregate progress ----------------

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
