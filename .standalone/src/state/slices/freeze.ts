// گام ۸ §12 — اسلایس یخ زنجیره (F9 نگهبان زنجیره): فقط مالکیت داده.
// جهش‌های freezeCount/freezeSavedDay از دو مسیر مجاز می‌آیند:
//  ۱) applyStreak (وقتی یخ زنجیره را نجات می‌دهد)  ۲) goalAndFreezePatch (اعطا)
// — هر دو در day-engine/effects متمرکزند تا خط‌مشی یک جا باشد.

import type { StateCreator } from "zustand";
import type { StudyStore } from "../types";

export interface FreezeSlice {
  freezeCount: number; // owned freezes (0..FREEZE_CAP)
  freezeEarnedDay: string; // day the last freeze was earned (earn cooldown)
  freezeUsedDays: string[]; // days a freeze was auto-consumed (anti double-use)
  goalMetDays: string[]; // days whose daily goal was reached (earn condition)
  freezeSavedDay: string; // day the latest freeze actually saved the chain (device-only toast)
}

export const createFreezeSlice: StateCreator<StudyStore, [], [], FreezeSlice> = () => ({
  freezeCount: 0,
  freezeEarnedDay: "",
  freezeUsedDays: [],
  goalMetDays: [],
  freezeSavedDay: "",
});
