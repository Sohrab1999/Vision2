"use client";

// گام ۸ §12 — استور مرکزی: ترکیب ۱۲ اسلایس + لایهٔ persist schema-محور.
// قرارداد عمومی (StudyState) و نام storage کلید (vision2-study-v1) دست‌نخورده
// ماند — ۳۷ مصرف‌کننده فقط از این فایل useStudy می‌گیرند و از هیچ تغییر داخلی
// خبردار نمی‌شوند. افزودن میدان تازه = یک اسلایس/سطر در persist/schema + یک
// جایگاه در تلاقی StudyState — همین.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { pickPersisted } from "@/lib/persist/schema";
import { createActivitySlice } from "./slices/activity";
import { createArcadeSlice } from "./slices/arcade";
import { createFreezeSlice } from "./slices/freeze";
import { createIdentitySlice } from "./slices/identity";
import { createKonkurSlice } from "./slices/konkur";
import { createLearningSlice } from "./slices/learning";
import { createMistakesSlice } from "./slices/mistakes";
import { createNavigationSlice } from "./slices/navigation";
import { createPrefsSlice } from "./slices/prefs";
import { createResultsSlice } from "./slices/results";
import { createSrsSlice } from "./slices/srs";
import { createStarredSlice } from "./slices/starred";
import type { StudyStore, StudyState } from "./types";

export const useStudy = create<StudyStore>()(
  persist(
    (...a) => ({
      ...createNavigationSlice(...a),
      ...createIdentitySlice(...a),
      ...createPrefsSlice(...a),
      ...createLearningSlice(...a),
      ...createResultsSlice(...a),
      ...createSrsSlice(...a),
      ...createMistakesSlice(...a),
      ...createKonkurSlice(...a),
      ...createActivitySlice(...a),
      ...createFreezeSlice(...a),
      ...createArcadeSlice(...a),
      ...createStarredSlice(...a),
    }),
    {
      name: "vision2-study-v1",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      // R-1 «پایداری schema-محور» — the persisted key list is generated
      // from the SyncField table + DEVICE_KEYS (src/lib/persist/schema.ts);
      // adding a field there is the whole change.
      partialize: (s) => pickPersisted(s),
    }
  )
);

export type { StudyStore, StudyState };
