// Task 290 «کتاب‌خانهٔ داستان‌ها» — اسلایس پیشرفتِ خواندنِ داستان‌های L.A. Hill.
// فقط مالکیتِ داده: هر داستانِ تمام‌شده یک رکورد {score,total,day} می‌شود.
// خط‌مشیِ ادغامِ ابری در persist/schema.ts (بیشترین نمره پیروز است) و
// ثبتِ رویدادِ تحلیلی در اکشنِ markStoryDone متمرکز است (قراردادِ ناوبری).

import type { StateCreator } from "zustand";
import { trackEvent } from "@/lib/analytics";
import type { StudyStore } from "../types";
import type { LibraryDoneEntry } from "../types";

export interface LibrarySlice {
  /** داستان‌های تمام‌شده — کلید = شناسهٔ داستان ("s1-1") */
  libraryDone: Record<string, LibraryDoneEntry>;
  /** پایانِ یک داستان: ثبتِ نمرهٔ صحیح/غلط + رویدادِ تحلیلیِ یک‌جا */
  markStoryDone: (storyId: string, score: number, total: number) => void;
}

function todayKey(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

export const createLibrarySlice: StateCreator<StudyStore, [], [], LibrarySlice> = (set) => ({
  libraryDone: {},
  markStoryDone: (storyId, score, total) => {
    set((s) => ({
      libraryDone: {
        ...s.libraryDone,
        [storyId]: { score, total, day: todayKey() },
      },
    }));
    trackEvent("library_story_done");
  },
});
