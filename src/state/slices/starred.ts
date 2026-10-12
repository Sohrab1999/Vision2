// گام ۸ §12 — اسلایس واژه‌های نشان‌شده: کتاب شخصی ستاره‌ها (قدیمی → جدید).
// رویداد star_word فقط هنگام افزودن ستاره برمی‌خیزد (حذف، سیگنال یادگیری نیست).

import type { StateCreator } from "zustand";
import { trackEvent } from "@/lib/analytics";
import type { StudyStore } from "../types";

export interface StarredSlice {
  starredWords: string[]; // wordKeys ("1:ability") the learner starred, oldest → newest

  toggleStarred: (key: string) => void;
  clearStarred: () => void;
}

export const createStarredSlice: StateCreator<StudyStore, [], [], StarredSlice> = (set) => ({
  starredWords: [],

  toggleStarred: (key) =>
    set((s) => {
      if (!key) return s;
      if (s.starredWords.includes(key)) {
        return { starredWords: s.starredWords.filter((k) => k !== key) };
      }
      trackEvent("star_word");
      return { starredWords: [...s.starredWords, key].slice(-2000) };
    }),
  clearStarred: () => set({ starredWords: [] }),
});
