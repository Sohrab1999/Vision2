// r412 — «دریلها واردِ استور میشوند» — اسلایسِ پیشرفتِ بانکهایِ تمرین.
// فقط مالکیتِ داده: موتورِ خالص در lib/drill-stats (sanitize/merge/record)
// و ردیفِ SyncField در persist/schema. ثبتِ یک جلسهٔ کامل، هم‌زمان یک
// واحدِ فعالیتِ «quizzes» است (جدولِ سیاستِ effects — تمرینِ دهسؤالی
// آزمون‌گونه است: زنجیره + هدف، عینِ رفتارِ تاریخیِ کوئیز). مرورِ
// اشتباهها (r401) زیرِجلسه است و از اینجا عبور نمیکند — نمایِ دریل
// گاردِ isReplay را مالکیت میکند.
//
// r413 — «بانکِ خطایِ ماندگار»: نقشهٔ ریسکِ سطحِ پایه (بانک+base) در
// lib/drill-mistakes — ردیفِ سیویکمِ SyncField. پایانِ جلسهٔ کامل
// پایههایِ نادرست/بیپاسخ را ثبت میکند (هر رخداد یک واحد)؛ هیچ فعالیتِ
// روزی اضافه نمیکند (فعالیتِ جلسه یک‌بار نزدِ trackDrillResult مُهر
// میشود) و بدونِ رویدادِ تحلیلی است (سرشماریِ رویدادها قفل است).

import type { StateCreator } from "zustand";
import { recordDrillResult, type DrillStatMap } from "@/lib/drill-stats";
import { recordDrillMistakes, type DrillMistakeMap } from "@/lib/drill-mistakes";
import { activityPatch } from "../effects";
import { todayStr } from "../day-engine";
import type { StudyStore } from "../types";

export interface DrillSlice {
  /** پیشرفتِ هر بانکِ تمرین — کلید = شناسهٔ بانک ("verbs"، "phonemes"، …) */
  drillStats: DrillStatMap;
  /** r413 — بانکِ خطایِ ماندگار — کلیدِ بیرونی = بانک، درونی = پایهٔ پرسش */
  drillMistakes: DrillMistakeMap;
  /** پایانِ یک جلسهٔ کاملِ تمرین: ثبتِ نمره + یک واحدِ فعالیتِ امروز */
  trackDrillResult: (bankId: string, correct: number, total: number) => void;
  /** r413 — پایانِ جلسهٔ کامل: پایههایِ نادرست/بیپاسخ به بانکِ خطا میرود
   *  (مرورِ اشتباهها زیرِجلسه است و هرگز عبور نمیکند — گاردِ نما) */
  trackDrillMistakes: (bankId: string, bases: readonly string[]) => void;
}

export const createDrillSlice: StateCreator<StudyStore, [], [], DrillSlice> = (set) => ({
  drillStats: {},
  drillMistakes: {},
  trackDrillResult: (bankId, correct, total) => {
    set((s) => {
      const day = todayStr();
      const next = recordDrillResult(s.drillStats, bankId, correct, total, day);
      if (next === s.drillStats) return s; // ورودیِ نامعتبر — هیچ (گاردِ صادقِ موتور)
      return {
        drillStats: next,
        // جلسهٔ کاملِ دهسؤالی = یک فعالیتِ آزمون‌گونه (زنجیره + هدف/یخ)
        ...activityPatch(s, "quizzes"),
      };
    });
  },
  trackDrillMistakes: (bankId, bases) => {
    set((s) => {
      const next = recordDrillMistakes(s.drillMistakes, bankId, bases, todayStr());
      if (next === s.drillMistakes) return s; // هیچ رخدادِ واقعی — هیچ (گاردِ صادق)
      return { drillMistakes: next };
    });
  },
});
