// گام ۸ §12 — اسلایس گوشهٔ کنکور: پوشش سؤال‌های بانک آزمون + مجموعهٔ غلط‌الان.
// زمان‌بندی SRS سؤال‌ها (کلید q:، F11) به konkurSrsEntry در srs-engine واگذار
// شد — خط‌مشی نردبان یک جا (تقارن با reviewWord).

import type { StateCreator } from "zustand";
import { konkurSrsEntry } from "../srs-engine";
import type { StudyStore } from "../types";

export interface KonkurSlice {
  konkurSeen: Record<string, boolean>; // exam-bank (x-) questions answered at least once
  konkurWrong: Record<string, boolean>; // exam-bank questions answered wrong (cleared on a correct answer)

  markKonkur: (entries: { id: string; ok: boolean }[]) => void;
}

export const createKonkurSlice: StateCreator<StudyStore, [], [], KonkurSlice> = (set) => ({
  konkurSeen: {},
  konkurWrong: {},

  // گوشهٔ کنکور — bulk per-question result for the 360-question exam bank:
  // marks coverage (seen) and tracks the wrong-now set (cleared when answered right).
  markKonkur: (entries) =>
    set((s) => {
      if (entries.length === 0) return s;
      const seen = { ...s.konkurSeen };
      const wrong = { ...s.konkurWrong };
      let srs: Record<string, import("../types").SrsItem> | null = null;
      const now = Date.now();
      for (const { id, ok } of entries) {
        if (!id) continue;
        seen[id] = true;
        if (ok) delete wrong[id];
        else wrong[id] = true;

        const next = konkurSrsEntry(srs ?? s.srs, id, ok, now);
        if (next) srs = next;
      }
      return srs
        ? { konkurSeen: seen, konkurWrong: wrong, srs }
        : { konkurSeen: seen, konkurWrong: wrong };
    }),
});
