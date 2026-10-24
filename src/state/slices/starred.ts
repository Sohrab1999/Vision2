// گام ۸ §12 — اسلایس واژه‌های نشان‌شده: کتاب شخصی ستاره‌ها (قدیمی → جدید).
// رویداد star_word فقط هنگام افزودن ستاره برمی‌خیزد (حذف، سیگنال یادگیری نیست).

import type { StateCreator } from "zustand";
import { trackEvent } from "@/lib/analytics";
import type { StudyStore } from "../types";

// ---------------------------------------------------------------
// راند ۳۹۱ — قراردادِ a11y خانوادهٔ ستاره (سرشماریِ ۸ دکمه در ۶ نما)
// ---------------------------------------------------------------
// aria-label همیشه واژه را نام می‌برد و همیشه با همین قالبِ بی‌گیومه —
// «حذف {en} از واژه‌های من» / «افزودن {en} به واژه‌های من».
// aria-pressed همیشه وضعیتِ ستاره است (در my-words غایب بود — همان راند
// با شاهدِ زندهٔ agent-browser ترمیم شد). title گویشِ آزادِ هر نماست:
// دو نما (danger-words و quiz-result) در title گیومهٔ «» میگذارند —
// گویشِ مستند، نه خطا؛ srs-panel قالبِ همان aria را برای title هم قرض میگیرد.
//
// حکمهای «نخیر»ِ سرشماری (الگویِ r386/r389 — فقط زیرگروهِ همقرارداد یکجا میشود):
// ① فلش‌کارت ariaِ ایستایِ بافتاری میماند («حذف/افزودن به واژه‌های من» بی‌نامِ
//    واژه) — ستاره رویِ خودِ کارت است، کارت خودِ بافتِ واژه است و هر بار یک
//    نمونه در صحنه دارد؛ وامگرفتنِ قالب، رشتهٔ ثابتش را پیچیده میکرد بی سود.
// ② گویشِ بصریِ ۶گانه (چیپِ ۲۲pxِ srs · ردیفِ p-1ِ خطر · p-0.5ِ درونخطی ·
//    گوشهٔ مطلقِ فلش‌کارت · لحنِ roseِ نتیجهٔ غلط · همیشه‌پرِ my-words)
//    عمدی است — مالکِ «کامپوننتِ دکمه» اینجا چرخِ نامفهوم میساخت (انفجارِ
//    props: motion/سایزِ ۱۲..۱۷/چهار املایِ fill/stopPropagationِ اختیاری).
// ③ مشتقِ وضعیت هم گویشِ هر نماست: `new Set(starredWords)` در useMemo برای
//    نماهای چندجست‌وجو (srs/danger/quiz-result) و `includes` مستقیم برای
//    نماهای تک‌جست‌وجو (flashcards/vocab-tab/dictionary) — یک‌خطیِ عمدی.
export const starToggleAria = (en: string, starred: boolean): string =>
  starred ? `حذف ${en} از واژه‌های من` : `افزودن ${en} به واژه‌های من`;

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
