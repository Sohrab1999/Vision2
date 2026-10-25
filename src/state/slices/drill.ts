// r412 — «دریلها واردِ استور میشوند» — اسلایسِ پیشرفتِ بانکهایِ تمرین.
// فقط مالکیتِ داده: موتورِ خالص در lib/drill-stats (sanitize/merge/record)
// و ردیفِ SyncField در persist/schema. ثبتِ یک جلسهٔ کامل، هم‌زمان یک
// واحدِ فعالیتِ «quizzes» است (جدولِ سیاستِ effects — تمرینِ دهسؤالی
// آزمون‌گونه است: زنجیره + هدف، عینِ رفتارِ تاریخیِ کوئیز). مرورِ
// اشتباهها (r401) زیرِجلسه است و از اینجا عبور نمیکند — نمایِ دریل
// گاردِ isReplay را مالکیت میکند.
//
// بدونِ رویدادِ تحلیلی — سرشماریِ رویدادها قفل است (REQUIRES-VERDICT).

import type { StateCreator } from "zustand";
import { recordDrillResult, type DrillStatMap } from "@/lib/drill-stats";
import { activityPatch } from "../effects";
import { todayStr } from "../day-engine";
import type { StudyStore } from "../types";

export interface DrillSlice {
  /** پیشرفتِ هر بانکِ تمرین — کلید = شناسهٔ بانک ("verbs"، "phonemes"، …) */
  drillStats: DrillStatMap;
  /** پایانِ یک جلسهٔ کاملِ تمرین: ثبتِ نمره + یک واحدِ فعالیتِ امروز */
  trackDrillResult: (bankId: string, correct: number, total: number) => void;
}

export const createDrillSlice: StateCreator<StudyStore, [], [], DrillSlice> = (set) => ({
  drillStats: {},
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
});
