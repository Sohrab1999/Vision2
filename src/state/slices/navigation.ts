// گام ۸ §12 — اسلایس ناوبری: view فعال + تب درس + نیت فلش‌کارت هوشمند.
// رویداد lesson_open از openLesson برمی‌خیزد (تحلیل‌گری سمت اکشن می‌ماند).

import type { StateCreator } from "zustand";
import { trackEvent } from "@/lib/analytics";
import type { FlashIntent, LessonTab, StudyStore, View } from "../types";

export interface NavigationSlice {
  view: View;
  lessonTab: LessonTab;
  flashIntent: FlashIntent;
  flashNonce: number; // bumped on every "smart" intent so VocabTab remounts into flashcards

  goHome: () => void;
  openLesson: (id: number, flashIntent?: FlashIntent) => void;
  openLessonTab: (id: number, tab: LessonTab) => void;
  /** رفت‌وبرگشتِ درسنامه ↔ ضمیمه (راند ۲۲۱): ضمیمه را با لنگرِ موضوعِ
   * «درسنامهٔ جامع» باز می‌کند — کارتِ همان موضوع باز و در دیدِ اسکرول می‌شود. */
  openAppendixTopic: (topicId: string) => void;
  /** رفت‌وبرگشتِ «اجزای کلماتی» (راند ۲۲۴): ضمیمه را با لنگرِ جدولِ
   * خانوادهٔ واژه‌ها باز می‌کند — مستقیم روی زیرتبِ pos و در دیدِ اسکرول. */
  openAppendixPosTable: (tableId: string) => void;
  setView: (v: View) => void;
  setLessonTab: (t: LessonTab) => void;
  consumeFlashIntent: () => void;
}

export const createNavigationSlice: StateCreator<StudyStore, [], [], NavigationSlice> = (set) => ({
  view: { type: "home" },
  lessonTab: "vocab",
  flashIntent: "none",
  flashNonce: 0,

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
  openAppendixTopic: (topicId) =>
    set({ view: { type: "appendix", topicId }, flashIntent: "none" }),
  openAppendixPosTable: (posTableId) =>
    set({ view: { type: "appendix", posTableId }, flashIntent: "none" }),
  setView: (v) => set({ view: v, flashIntent: "none" }),
  setLessonTab: (t) => set({ lessonTab: t }),
  consumeFlashIntent: () => set({ flashIntent: "none" }),
});
