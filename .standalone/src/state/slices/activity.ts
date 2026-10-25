// گام ۸ §12 — اسلایس فعالیت روزانه: زنجیره + شمارندهٔ امروز + پنجره‌های تاریخ.
// منطق fan-out (زنجیره/هدف/یخ) در effects/activityPatch متمرکز است — این اسلایس
// فقط اکشن‌های ثبت فعالیت را روی آن سوار می‌کند.

import type { StateCreator } from "zustand";
import { trackEvent } from "@/lib/analytics";
import { activityPatch } from "../effects";
import type { StudyStore } from "../types";

export interface ActivitySlice {
  streak: number;
  bestStreak: number;
  lastActiveDay: string;
  dayStat: import("../types").DayStat;
  history: import("../types").HistoryMap;
  dayHistory: import("../types").DayHistoryMap; // Task-37 — full per-day stats window (35 days)

  trackReview: () => void;
  trackQuizDone: () => void;
  trackDictation: () => void;
}

export const createActivitySlice: StateCreator<StudyStore, [], [], ActivitySlice> = (set) => ({
  streak: 0,
  bestStreak: 0,
  lastActiveDay: "",
  dayStat: { day: "", reviews: 0, quizzes: 0, words: 0, dictation: 0, rush: 0, stories: 0 },
  history: {},
  dayHistory: {},

  trackReview: () =>
    set((s) => activityPatch(s, "reviews")),
  trackQuizDone: () =>
    set((s) => {
      trackEvent("quiz_done");
      return activityPatch(s, "quizzes");
    }),
  trackDictation: () =>
    set((s) => {
      trackEvent("dictation_done");
      return activityPatch(s, "dictation");
    }),
});
