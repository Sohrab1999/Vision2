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
  /** راند ۲۹۷ — نیتِ «این داستان را باز کن»: کارتِ «ادامهٔ خواندن» خانه با آن
   * خوانندهٔ کتاب‌خانه را مستقیم روی داستانِ بعدی باز می‌کند (هم‌الگوی flashIntent) */
  libraryIntent: string | null;

  goHome: () => void;
  openLesson: (id: number, flashIntent?: FlashIntent) => void;
  /** r427 — پارامترِ سومِ اختیاری: لنگرِ عمیقِ کارتِ واژه در تبِ واژگان (فقط
   *  مسیرِ پرشِ خانهٔ امروز آن را میگذارد)؛ فراخوانیِ بیِ آن هر focusWordِ
   *  کهنهای از view پاک میکند — رفتارِ دو-آرگومِنتیِ کهنه دستنخورده. */
  openLessonTab: (id: number, tab: LessonTab, focusWord?: string) => void;
  /** رفت‌وبرگشتِ درسنامه ↔ ضمیمه (راند ۲۲۱): ضمیمه را با لنگرِ موضوعِ
   * «درسنامهٔ جامع» باز می‌کند — کارتِ همان موضوع باز و در دیدِ اسکرول می‌شود.
   * r431 — پارامترِ دومِ اختیاری: عمقِ سطریِ مثال (خودِ جملهٔ انگلیسی — فقط
   * مسیرِ پرشِ خانهٔ امروز آن را میگذارد)؛ فراخوانیِ تک‌آرگومنتیِ کهنه هر
   * bgExampleEnِ کهنهای از view پاک میکند — رفتارِ سابق دستنخورده. */
  openAppendixTopic: (topicId: string, bgExampleEn?: string) => void;
  /** رفت‌وبرگشتِ «اجزای کلماتی» (راند ۲۲۴): ضمیمه را با لنگرِ جدولِ
   * خانوادهٔ واژه‌ها باز می‌کند — مستقیم روی زیرتبِ pos و در دیدِ اسکرول.
   * r428 — پارامترِ دومِ اختیاری: عمقِ سطری (خودِ واژهٔ خانواده — فقط مسیرِ
   * پرشِ خانهٔ امروز آن را میگذارد)؛ فراخوانیِ تک‌آرگومنتیِ کهنه هر
   * posRowWordِ کهنهای از view پاک میکند — رفتارِ سابق دستنخورده. */
  openAppendixPosTable: (tableId: string, rowWord?: string) => void;
  /** رفت‌وبرگشتِ «افعال بی‌قاعده» (راند ۲۳۴): ضمیمه را با لنگرِ سطرِ فعل
   * باز می‌کند — مستقیم روی زیرتبِ verbs، سطر در دید با پالسِ زمردی. */
  openAppendixVerb: (base: string) => void;
  /** رفت‌وبرگشتِ «جدول تلفظ» (راند ۲۳۵): ضمیمه را با لنگرِ کارتِ واک
   * باز می‌کند — مستقیم روی زیرتبِ phonetics، کارت در دید با پالسِ زمردی. */
  openAppendixPhoneme: (symbol: string) => void;
  /** رفت‌وبرگشتِ «نشانه‌های اختصاری» (راند ۲۳۵): ضمیمه را با لنگرِ کارتِ
   * نشانه باز می‌کند — مستقیم روی زیرتبِ abbrev، کارت در دید با پالسِ زمردی. */
  openAppendixAbbrev: (sym: string) => void;
  /** r430 — رفتن به دیکشنری با لنگرِ کارتِ واژه (الگویِ openLessonTabِ r427):
   * فقط مسیرِ پرشِ خانهٔ امروز آن را میگذارد؛ خودِ نما عدسیِ جست‌وجو را بذر
   * میزند و پسِ نخستین تلاشِ اسکرول لنگر را از view پاک میکند. */
  openDictionaryWord: (en: string) => void;
  setView: (v: View) => void;
  setLessonTab: (t: LessonTab) => void;
  consumeFlashIntent: () => void;
  /** راند ۲۹۷ — رفتن به کتاب‌خانه با نیتِ بازکردنِ یک داستانِ مشخص */
  openLibraryStory: (storyId: string) => void;
  consumeLibraryIntent: () => void;
}

export const createNavigationSlice: StateCreator<StudyStore, [], [], NavigationSlice> = (set) => ({
  view: { type: "home" },
  lessonTab: "vocab",
  flashIntent: "none",
  flashNonce: 0,
  libraryIntent: null,

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
  openLessonTab: (id, tab, focusWord?) =>
    set({
      view: focusWord ? { type: "lesson", id, focusWord } : { type: "lesson", id },
      lessonTab: tab,
    }),
  openAppendixTopic: (topicId, bgExampleEn?) =>
    set({
      view: bgExampleEn
        ? { type: "appendix", topicId, bgExampleEn }
        : { type: "appendix", topicId },
      flashIntent: "none",
    }),
  openAppendixPosTable: (posTableId, posRowWord?) =>
    set({
      view: posRowWord
        ? { type: "appendix", posTableId, posRowWord }
        : { type: "appendix", posTableId },
      flashIntent: "none",
    }),
  openAppendixVerb: (verbBase) =>
    set({ view: { type: "appendix", verbBase }, flashIntent: "none" }),
  openAppendixPhoneme: (phonemeId) =>
    set({ view: { type: "appendix", phonemeId }, flashIntent: "none" }),
  openAppendixAbbrev: (abbrevSym) =>
    set({ view: { type: "appendix", abbrevSym }, flashIntent: "none" }),
  openDictionaryWord: (focusWord) =>
    set({ view: { type: "dictionary", focusWord }, flashIntent: "none" }), // r430
  setView: (v) => set({ view: v, flashIntent: "none" }),
  setLessonTab: (t) => set({ lessonTab: t }),
  consumeFlashIntent: () => set({ flashIntent: "none" }),
  openLibraryStory: (storyId) =>
    set({ view: { type: "library" }, libraryIntent: storyId, flashIntent: "none" }),
  consumeLibraryIntent: () => set({ libraryIntent: null }),
});
