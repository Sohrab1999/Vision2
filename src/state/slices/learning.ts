// گام ۸ §12 — اسلایس یادگیری واژه: نقشهٔ known (واژهٔ بلد).
// واژهٔ تازهٔ امروز ← شمارندهٔ words روزانه (بای‌پس زنجیره — سیاست words
// در effects/activityPatch). فراموش‌کردن واژه هیچ شمارشی را نسازمان نمی‌بندد.

import type { StateCreator } from "zustand";
import { activityPatch } from "../effects";
import type { StudyStore } from "../types";

export interface LearningSlice {
  known: Record<string, boolean>;

  toggleKnown: (key: string) => void;
}

export const createLearningSlice: StateCreator<StudyStore, [], [], LearningSlice> = (set) => ({
  known: {},

  toggleKnown: (key) =>
    set((s) => {
      const was = s.known[key];
      // learning a brand-new word today → count it for the daily quest
      if (!was) {
        return {
          known: { ...s.known, [key]: true },
          ...activityPatch(s, "words"),
        };
      }
      return { known: { ...s.known, [key]: false } };
    }),
});
