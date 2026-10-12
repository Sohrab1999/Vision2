// گام ۸ §12 — اسلایس SRS: نردبان تکرار فاصله‌دار واژه‌ها (مرور فلش‌کارت).

import type { StateCreator } from "zustand";
import { SRS_INTERVALS } from "../srs-engine";
import type { StudyStore } from "../types";

export interface SrsSlice {
  srs: Record<string, import("../types").SrsItem>;

  reviewWord: (key: string, known: boolean) => void;
}

export const createSrsSlice: StateCreator<StudyStore, [], [], SrsSlice> = (set) => ({
  srs: {},

  reviewWord: (key, known) =>
    set((s) => {
      const prev = s.srs[key];
      const level = known
        ? Math.min((prev?.level ?? -1) + 1, SRS_INTERVALS.length - 1)
        : 0;
      return {
        srs: {
          ...s.srs,
          [key]: { level, dueAt: Date.now() + SRS_INTERVALS[level] },
        },
      };
    }),
});
