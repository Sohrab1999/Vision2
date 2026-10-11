"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { QuizResult } from "@/lib/study-types";
import { trackEvent } from "./analytics";

export type View =
  | { type: "home" }
  | { type: "lesson"; id: number }
  | { type: "dictionary" }
  | { type: "exam" }
  | { type: "appendix" }
  | { type: "rush" }
  | { type: "duel" }
  | { type: "listen" }
  | { type: "review" }
  | { type: "smart" }
  | { type: "konkur" }
  | { type: "grammar" }; // متروی گرامر — Task 39

export type LessonTab = "vocab" | "conversation" | "reading" | "grammar" | "writing" | "dictation" | "tests";

// daily activity for streak + daily goal + quests
export interface DayStat {
  day: string; // "2026-10-09"
  reviews: number; // flashcard reviews
  quizzes: number; // finished quizzes/dictation/writing
  words: number; // words marked known today (new learning)
  dictation: number; // dictation rounds finished today
  rush: number; // 60s challenge rounds finished today
}

/** normalize a (possibly legacy) DayStat so every counter exists */
export function normDayStat(d: Partial<DayStat> | undefined): DayStat {
  return {
    day: d?.day ?? "",
    reviews: d?.reviews ?? 0,
    quizzes: d?.quizzes ?? 0,
    words: d?.words ?? 0,
    dictation: d?.dictation ?? 0,
    rush: d?.rush ?? 0,
  };
}

/** fresh zeroed DayStat for a given day key */
export function emptyDayStat(day: string): DayStat {
  return { day, reviews: 0, quizzes: 0, words: 0, dictation: 0, rush: 0 };
}

// error bank: mistakes["1:l1-v3"] = number of wrong answers
export type MistakeMap = Record<string, number>;
// F7 word-level risk maps: wordMistakes["1:ability"] = wrong answers involving
// that word (quiz option / dictation / listening) — paired with wordSeen counts
export type WordStatMap = Record<string, number>;
// weekly history: history["2026-10-09"] = { reviews, quizzes }
export type HistoryMap = Record<string, { reviews: number; quizzes: number }>;
// Task-37 «هفته‌نامه» — full DayStat window (last 35 days) powering the weekly
// progress digest. Superset of HistoryMap; legacy clients simply omit it.
export type DayHistoryMap = Record<string, DayStat>;

export const AVATAR_COLORS = ["emerald", "amber", "rose", "violet", "sky"] as const;
export type AvatarColor = (typeof AVATAR_COLORS)[number];

// user-tunable preferences (settings hub) — fontScale multiplies root font-size,
// ttsRate multiplies every speak() speed, reduceMotion kills heavy animations
export interface StudySettings {
  ttsRate: number; // 0.7 .. 1.3 (multiplier)
  fontScale: number; // 0.94 | 1 | 1.1
  reduceMotion: boolean;
}

export const DEFAULT_SETTINGS: StudySettings = { ttsRate: 1, fontScale: 1, reduceMotion: false };

export const DAILY_GOAL_OPTIONS = [5, 10, 15] as const;
const DEFAULT_DAILY_GOAL = 10;

// ---------------- F9 — streak freeze (نگهبان زنجیره) ----------------

export const FREEZE_CAP = 2; // حداکثر یخ‌های قابل نگهداری (ضد-آبُس)
export const FREEZE_EARN_GOALS = 3; // ۳ هدفِ کامل در بازهٔ ۷روزه ← ۱ یخ
export const FREEZE_WINDOW = 7; // بازهٔ شمارش، به روز

function todayStr(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** ISO day-key of n days ago (string-comparable) */
export function daysAgoKey(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return todayStr(d);
}

export interface StudyState {
  view: View;
  lessonTab: LessonTab;
  known: Record<string, boolean>;
  results: Record<string, QuizResult>;
  srs: Record<string, SrsItem>;
  userId: string;
  userSecret: string; // Phase-0 «اعتماد» — server-issued write secret (empty until registered)
  userName: string;
  avatarColor: string;
  streak: number;
  bestStreak: number;
  lastActiveDay: string;
  dayStat: DayStat;
  history: HistoryMap;
  dayHistory: DayHistoryMap; // Task-37 — full per-day stats window (35 days)
  mistakes: MistakeMap;
  wordMistakes: WordStatMap; // F7 — wrong answers per word key
  wordSeen: WordStatMap; // F7 — answered (seen) per word key
  konkurSeen: Record<string, boolean>; // گوشهٔ کنکور — exam-bank (x-) questions answered at least once
  konkurWrong: Record<string, boolean>; // گوشهٔ کنکور — exam-bank questions answered wrong (cleared on a correct answer)
  flashIntent: "none" | "smart";
  flashNonce: number; // bumped on every "smart" intent so VocabTab remounts into flashcards
  seenBadges: string[];
  rushBest: number; // best score (points) ever achieved in the 60s challenge
  rushBestCorrect: number; // best number of correct answers in one challenge
  rushGames: number; // total number of completed 60s challenge rounds
  duelWins: number; // 2-player live duel victories
  duelLosses: number; // 2-player live duel defeats
  duelTies: number; // 2-player live duel ties
  dailyGoal: number; // user-chosen daily activity target (5/10/15)
  onboarded: boolean; // first-run welcome flow completed?
  settings: StudySettings;
  syncCode: string; // F3 learner code — empty when cloud sync is off

  // F9 — streak freeze
  freezeCount: number; // owned freezes (0..FREEZE_CAP)
  freezeEarnedDay: string; // day the last freeze was earned (earn cooldown)
  freezeUsedDays: string[]; // days a freeze was auto-consumed (anti double-use)
  goalMetDays: string[]; // days whose daily goal was reached (earn condition)
  freezeSavedDay: string; // day the latest freeze actually saved the chain (device-only toast)

  setProfile: (name: string, color: string) => void;
  setDailyGoal: (n: number) => void;
  setOnboarded: () => void;
  setSettings: (patch: Partial<StudySettings>) => void;
  setSyncCode: (code: string) => void;
  setRushBest: (points: number, correct: number) => void;
  recordDuelOutcome: (outcome: "win" | "loss" | "tie") => void;
  trackDictation: () => void;
  markBadgesSeen: (ids: string[]) => void;
  goHome: () => void;
  openLesson: (id: number, flashIntent?: "none" | "smart") => void;
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
  markKonkur: (entries: { id: string; ok: boolean }[]) => void;
  addWordResults: (entries: { key: string; ok: boolean }[]) => void;
  lessonMistakeCount: (lessonId: number) => number;
  ensureUserId: () => string;
  setIdentity: (userId: string, secret: string) => void;
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

/** ids of exam-bank questions (key prefix "q:") whose review is due now */
export function srsQuestionDueIds(srs: Record<string, SrsItem>): string[] {
  const now = Date.now();
  return Object.entries(srs)
    .filter(([k, v]) => k.startsWith("q:") && v.dueAt <= now)
    .map(([k]) => k.slice(2));
}

export function srsQuestionDueTotal(srs: Record<string, SrsItem>): number {
  const now = Date.now();
  return Object.entries(srs).filter(([k, v]) => k.startsWith("q:") && v.dueAt <= now).length;
}

/** all-time words-only due count (F11: exam-bank questions ride the same
 *  store under "q:" keys but must not pollute the vocabulary widgets) */
export function srsDueTotal(srs: Record<string, SrsItem>): number {
  const now = Date.now();
  return Object.entries(srs).filter(([k, v]) => !k.startsWith("q:") && v.dueAt <= now).length;
}

export function firstLessonWithDue(srs: Record<string, SrsItem>): number | null {
  for (const id of [1, 2, 3]) {
    if (srsDueCount(srs, id) > 0) return id;
  }
  return null;
}

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
      userSecret: "",
      userName: "",
      avatarColor: "emerald",
      streak: 0,
      bestStreak: 0,
      lastActiveDay: "",
      dayStat: emptyDayStat(""),
      history: {},
      dayHistory: {},
      mistakes: {},
      wordMistakes: {},
      wordSeen: {},
      konkurSeen: {},
      konkurWrong: {},
      flashIntent: "none",
      flashNonce: 0,
      seenBadges: [],
      rushBest: 0,
      rushBestCorrect: 0,
      rushGames: 0,
      duelWins: 0,
      duelLosses: 0,
      duelTies: 0,
      dailyGoal: DEFAULT_DAILY_GOAL,
      onboarded: false,
      settings: DEFAULT_SETTINGS,
      syncCode: "",
      freezeCount: 0,
      freezeEarnedDay: "",
      freezeUsedDays: [],
      goalMetDays: [],
      freezeSavedDay: "",

      setProfile: (name, color) => set({ userName: name, avatarColor: color }),
      setDailyGoal: (n) => set({ dailyGoal: Math.min(20, Math.max(5, Math.round(n))) }),
      setOnboarded: () => set({ onboarded: true }),
      setSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),
      setSyncCode: (code) => set({ syncCode: code }),
      // called exactly once per finished rush round → also counts completed games + daily quest
      setRushBest: (points, correct) =>
        set((s) => {
          const today = todayStr();
          const stat = s.dayStat.day === today ? normDayStat(s.dayStat) : emptyDayStat(today);
          const next = { ...stat, rush: stat.rush + 1 };
          return {
            rushBest: Math.max(s.rushBest, points),
            rushBestCorrect: Math.max(s.rushBestCorrect, correct),
            rushGames: s.rushGames + 1,
            dayStat: next,
            // Task-37 — rush bypasses applyStreak, keep the digest window fresh
            dayHistory: pushDayHistory(s.dayHistory, next),
          };
        }),
      markBadgesSeen: (ids) => set((s) => ({ seenBadges: [...new Set([...s.seenBadges, ...ids])] })),
      goHome: () => set({ view: { type: "home" }, flashIntent: "none" }),
      openLesson: (id, flashIntent = "none") =>
        set((s) => {
          trackEvent("lesson_open");
          return {
          view: { type: "lesson", id },
          flashIntent,
          flashNonce: flashIntent === "smart" ? s.flashNonce + 1 : s.flashNonce,
          // smart review always lands on the flashcards, whatever tab was last open
          lessonTab: flashIntent === "smart" ? "vocab" : s.lessonTab,
          };
        }),
      openLessonTab: (id, tab) => set({ view: { type: "lesson", id }, lessonTab: tab }),
      setView: (v) => set({ view: v, flashIntent: "none" }),
      setLessonTab: (t) => set({ lessonTab: t }),
      consumeFlashIntent: () => set({ flashIntent: "none" }),
      toggleKnown: (key) =>
        set((s) => {
          const was = s.known[key];
          // learning a brand-new word today → count it for the daily quest
          if (!was) {
            const today = todayStr();
            const stat = s.dayStat.day === today ? normDayStat(s.dayStat) : emptyDayStat(today);
            const next = { ...stat, words: stat.words + 1 };
            return {
              known: { ...s.known, [key]: true },
              dayStat: next,
              // Task-37 — words bypass applyStreak too
              dayHistory: pushDayHistory(s.dayHistory, next),
            };
          }
          return { known: { ...s.known, [key]: false } };
        }),
        recordDuelOutcome: (outcome) =>
        set((s) => ({
          duelWins: s.duelWins + (outcome === "win" ? 1 : 0),
          duelLosses: s.duelLosses + (outcome === "loss" ? 1 : 0),
          duelTies: s.duelTies + (outcome === "tie" ? 1 : 0),
        })),
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
          const stat = s.dayStat.day === today ? normDayStat(s.dayStat) : emptyDayStat(today);
          const base = applyStreak(s, { ...stat, reviews: stat.reviews + 1 });
          return { ...base, ...goalAndFreezePatch(s, base.dayStat, base.freezeCount) };
        }),
      trackQuizDone: () =>
        set((s) => {
          trackEvent("quiz_done");
          const today = todayStr();
          const stat = s.dayStat.day === today ? normDayStat(s.dayStat) : emptyDayStat(today);
          const base = applyStreak(s, { ...stat, quizzes: stat.quizzes + 1 });
          return { ...base, ...goalAndFreezePatch(s, base.dayStat, base.freezeCount) };
        }),
      trackDictation: () =>
        set((s) => {
          trackEvent("dictation_done");
          const today = todayStr();
          const stat = s.dayStat.day === today ? normDayStat(s.dayStat) : emptyDayStat(today);
          return applyStreak(s, { ...stat, dictation: stat.dictation + 1 });
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
      // گوشهٔ کنکور — bulk per-question result for the 360-question exam bank:
      // marks coverage (seen) and tracks the wrong-now set (cleared when answered right).
      // F11 «SRS کنکور»: a wrong answer schedules the question on the shared SRS
      // ladder (key "q:<id>", first rung = 15 دقیقه); a right answer promotes it one
      // rung — but only when it was actually due, so drilling the hard set early
      // never inflates levels. First-time-right never enters the queue.
      markKonkur: (entries) =>
        set((s) => {
          if (entries.length === 0) return s;
          const seen = { ...s.konkurSeen };
          const wrong = { ...s.konkurWrong };
          let srs: Record<string, SrsItem> | null = null;
          const now = Date.now();
          for (const { id, ok } of entries) {
            if (!id) continue;
            seen[id] = true;
            if (ok) delete wrong[id];
            else wrong[id] = true;

            const qk = `q:${id}`;
            if (!ok) {
              (srs ??= { ...s.srs })[qk] = { level: 0, dueAt: now + SRS_INTERVALS[0] };
            } else {
              const cur = s.srs[qk];
              if (cur && cur.dueAt <= now) {
                const level = Math.min(cur.level + 1, SRS_INTERVALS.length - 1);
                (srs ??= { ...s.srs })[qk] = { level, dueAt: now + SRS_INTERVALS[level] };
              }
            }
          }
          return srs
            ? { konkurSeen: seen, konkurWrong: wrong, srs }
            : { konkurSeen: seen, konkurWrong: wrong };
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
      setIdentity: (userId, secret) => set({ userId, userSecret: secret }),
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
        userSecret: s.userSecret,
        userName: s.userName,
        avatarColor: s.avatarColor,
        streak: s.streak,
        bestStreak: s.bestStreak,
        lastActiveDay: s.lastActiveDay,
        dayStat: s.dayStat,
        history: s.history,
        dayHistory: s.dayHistory,
        mistakes: s.mistakes,
        wordMistakes: s.wordMistakes,
        wordSeen: s.wordSeen,
        konkurSeen: s.konkurSeen,
        konkurWrong: s.konkurWrong,
        seenBadges: s.seenBadges,
        rushBest: s.rushBest,
        rushBestCorrect: s.rushBestCorrect,
        rushGames: s.rushGames,
        duelWins: s.duelWins,
        duelLosses: s.duelLosses,
        duelTies: s.duelTies,
        dailyGoal: s.dailyGoal,
        onboarded: s.onboarded,
        settings: s.settings,
        syncCode: s.syncCode,
        freezeCount: s.freezeCount,
        freezeEarnedDay: s.freezeEarnedDay,
        freezeUsedDays: s.freezeUsedDays,
        goalMetDays: s.goalMetDays,
      }),
    }
  )
);

// ---------------- streak helper ----------------

/**
 * Task-37 «هفته‌نامه» — merge today's full stat into the 35-day window.
 * Day keys sort lexicographically, so dropping the smallest keys keeps the
 * newest days (same policy as the legacy HistoryMap cap in applyStreak).
 */
export function pushDayHistory(dayHistory: DayHistoryMap, stat: DayStat): DayHistoryMap {
  if (!stat.day) return dayHistory;
  const out: DayHistoryMap = { ...dayHistory, [stat.day]: stat };
  const keys = Object.keys(out).sort();
  while (keys.length > 35) {
    delete out[keys.shift()!];
  }
  return out;
}

function applyStreak(
  s: {
    streak: number;
    bestStreak: number;
    lastActiveDay: string;
    history: HistoryMap;
    dayHistory: DayHistoryMap;
    freezeCount: number;
    freezeUsedDays: string[];
    freezeSavedDay: string;
  },
  dayStat: DayStat
): Pick<
  StudyState,
  | "streak"
  | "bestStreak"
  | "lastActiveDay"
  | "dayStat"
  | "history"
  | "dayHistory"
  | "freezeCount"
  | "freezeUsedDays"
  | "freezeSavedDay"
> {
  const today = todayStr();
  // keep last 30 days of weekly history
  const history: HistoryMap = { ...s.history, [dayStat.day]: { reviews: dayStat.reviews, quizzes: dayStat.quizzes } };
  for (const k of Object.keys(history)) {
    if (Object.keys(history).length <= 30) break;
    delete history[k];
  }
  const dayHistory = pushDayHistory(s.dayHistory, dayStat);
  if (s.lastActiveDay === today) {
    return {
      streak: s.streak,
      bestStreak: s.bestStreak,
      lastActiveDay: today,
      dayStat,
      history,
      dayHistory,
      freezeCount: s.freezeCount,
      freezeUsedDays: s.freezeUsedDays,
      freezeSavedDay: s.freezeSavedDay,
    };
  }

  // F9 — freeze bookkeeping (only mutated when a freeze actually repairs the chain)
  const freeze = {
    freezeCount: s.freezeCount,
    freezeUsedDays: s.freezeUsedDays,
    freezeSavedDay: s.freezeSavedDay,
  };

  const streak = (() => {
    if (s.lastActiveDay === daysAgoKey(1)) return s.streak + 1; // natural continue
    // exactly one missed day + a freeze available → the freeze saves the chain
    if (
      s.lastActiveDay === daysAgoKey(2) &&
      s.freezeCount > 0 &&
      !s.freezeUsedDays.includes(daysAgoKey(1))
    ) {
      freeze.freezeCount = s.freezeCount - 1;
      freeze.freezeUsedDays = [...s.freezeUsedDays, daysAgoKey(1)].slice(-30);
      freeze.freezeSavedDay = today;
      return s.streak + 1;
    }
    return 1; // gap too long (or no freeze) → chain resets
  })();

  return { streak, bestStreak: Math.max(streak, s.bestStreak), lastActiveDay: today, dayStat, history, dayHistory, ...freeze };
}

/**
 * F9 — record «هدفِ امروز کامل شد» and maybe grant a freeze.
 * Grant rule: ≥۳ روزِ هدف‌دار در ۷ روز گذشته، بدون ساخت یخ در ۷ روز گذشته،
 * زیر سقف. freezeCountNow از نتیجهٔ applyStreak می‌آید تا مصرفِ یخ در همان
 * فراخوانی بازنویسی نشود.
 */
function goalAndFreezePatch(
  s: { dailyGoal: number; goalMetDays: string[]; freezeEarnedDay: string },
  dayStat: DayStat,
  freezeCountNow: number
): Pick<StudyState, "goalMetDays" | "freezeCount" | "freezeEarnedDay"> {
  const windowStart = daysAgoKey(FREEZE_WINDOW - 1);
  const today = todayStr();
  const goalMetDays = s.goalMetDays.includes(today) ? s.goalMetDays : [...s.goalMetDays, today].slice(-14);

  const met = dayStat.reviews + dayStat.quizzes >= s.dailyGoal;
  const inWindow = goalMetDays.filter((d) => d >= windowStart).length;
  const cooledDown = !s.freezeEarnedDay || s.freezeEarnedDay < windowStart;
  const grant = met && inWindow >= FREEZE_EARN_GOALS && cooledDown && freezeCountNow < FREEZE_CAP;

  return {
    goalMetDays,
    freezeCount: grant ? freezeCountNow + 1 : freezeCountNow,
    freezeEarnedDay: grant ? today : s.freezeEarnedDay,
  };
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

/** source lesson bucket (1/2/3) or exam bank (0) of a quiz question, from its id prefix */
export function questionSourceLesson(q: { id: string }): number {
  if (q.id.startsWith("l1")) return 1;
  if (q.id.startsWith("l2")) return 2;
  if (q.id.startsWith("l3")) return 3;
  return 0;
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
