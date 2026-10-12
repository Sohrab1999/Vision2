// گام ۸ §12 — اسلایس تنظیمات/ترجیحات: settings، آنبردینگ، هدف روزانه، بج‌ها.

import type { StateCreator } from "zustand";
import { DEFAULT_SETTINGS, type StudySettings, type StudyStore } from "../types";

export interface PrefsSlice {
  settings: StudySettings;
  onboarded: boolean; // first-run welcome flow completed?
  dailyGoal: number; // user-chosen daily activity target (5/10/15)
  seenBadges: string[];

  setSettings: (patch: Partial<StudySettings>) => void;
  setOnboarded: () => void;
  setDailyGoal: (n: number) => void;
  markBadgesSeen: (ids: string[]) => void;
}

export const createPrefsSlice: StateCreator<StudyStore, [], [], PrefsSlice> = (set) => ({
  settings: DEFAULT_SETTINGS,
  onboarded: false,
  dailyGoal: 10,
  seenBadges: [],

  setSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),
  setOnboarded: () => set({ onboarded: true }),
  setDailyGoal: (n) => set({ dailyGoal: Math.min(20, Math.max(5, Math.round(n))) }),
  markBadgesSeen: (ids) => set((s) => ({ seenBadges: [...new Set([...s.seenBadges, ...ids])] })),
});
