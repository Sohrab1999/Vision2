// گام ۸ §12 — اسلایس بازی‌های سریع: رکوردهای چالش ۶۰ثانیه‌ای + برد/باخت دودل.
// پایان هر راند rush ← شمارندهٔ rush روزانه (بای‌پس زنجیره — سیاست rush در
// effects/activityPatch).

import type { StateCreator } from "zustand";
import { activityPatch } from "../effects";
import type { StudyStore } from "../types";

export interface ArcadeSlice {
  rushBest: number; // best score (points) ever achieved in the 60s challenge
  rushBestCorrect: number; // best number of correct answers in one challenge
  rushGames: number; // total number of completed 60s challenge rounds
  duelWins: number; // 2-player live duel victories
  duelLosses: number; // 2-player live duel defeats
  duelTies: number; // 2-player live duel ties

  setRushBest: (points: number, correct: number) => void;
  recordDuelOutcome: (outcome: "win" | "loss" | "tie") => void;
}

export const createArcadeSlice: StateCreator<StudyStore, [], [], ArcadeSlice> = (set) => ({
  rushBest: 0,
  rushBestCorrect: 0,
  rushGames: 0,
  duelWins: 0,
  duelLosses: 0,
  duelTies: 0,

  // called exactly once per finished rush round → also counts completed games + daily quest
  setRushBest: (points, correct) =>
    set((s) => ({
      rushBest: Math.max(s.rushBest, points),
      rushBestCorrect: Math.max(s.rushBestCorrect, correct),
      rushGames: s.rushGames + 1,
      ...activityPatch(s, "rush"),
    })),
  recordDuelOutcome: (outcome) =>
    set((s) => ({
      duelWins: s.duelWins + (outcome === "win" ? 1 : 0),
      duelLosses: s.duelLosses + (outcome === "loss" ? 1 : 0),
      duelTies: s.duelTies + (outcome === "tie" ? 1 : 0),
    })),
});
