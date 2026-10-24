// @vitest-environment jsdom
// ------------------------------------------------------------------
// r386 — «مسیرِ پنجم» — rehydrationِ localStorage حالا از جدول میگذرد
//
// شاهدِ زندهٔ راند: رکوردِ دستکاریِ idِ بیقرارداد («zzz») از hydrationِ
// خامِ zustand گذشت، در duelHistory[0] نشست و چیپِ خانه او را «آخرین
// مصاف» خواند — درحالیکه سندِ schema ادعا میکرد «ورودیِ نامطمئن فقط از
// sanitizeAll وارد میشود» (آن ادعا فقط رویِ بکاپ/کلاد راست بود).
// این فایل همان سناریو را رویِ استورِ واقعی قفل میکند: بذرِ localStorage
// ← rehydrate() ← استورِ پالایششده.
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { useStudy } from "@/lib/study-store";

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");

const E0 = 1_739_000_000_000;
const winRec = (id: string, day: string, opponent: string) => ({
  id,
  day,
  outcome: "win",
  reason: "finished",
  opponent,
  opponentColor: "rose",
  myScore: 8,
  oppScore: 3,
  myCorrect: 8,
  oppCorrect: 3,
  answered: 10,
  total: 10,
  durationSec: 95,
});
const seed = (state: Record<string, unknown>) =>
  localStorage.setItem("vision2-study-v1", JSON.stringify({ state, version: 0 }));

const INITIAL = useStudy.getState();

beforeEach(() => {
  localStorage.clear();
  useStudy.setState(INITIAL, true);
});

describe("rehydrateMerge — مسیرِ پنجمِ جدول (استورِ واقعی)", () => {
  it("رکوردِ بیقرارداد از hydration میگذشت — حالا در همان مرز میافتد", () => {
    seed({
      onboarded: true,
      duelHistory: [
        winRec("zzz", "2026-10-24", "ربایندهٔ آزمون"),
        winRec(`d${E0}`, "2026-10-25", "سارا"),
      ],
    });
    useStudy.persist.rehydrate();
    const ledger = useStudy.getState().duelHistory;
    expect(ledger).toHaveLength(1);
    expect(ledger[0].id).toBe(`d${E0}`);
    expect(ledger[0].opponent).toBe("سارا");
  });

  it("آرایهٔ قانونیِ وارونه در ورود ترمیم میشود — newest-first", () => {
    seed({
      onboarded: true,
      duelHistory: [
        winRec(`d${E0 - 86_400_000}`, "2026-10-24", "مریم"),
        winRec(`d${E0}`, "2026-10-25", "سارا"),
      ],
    });
    useStudy.persist.rehydrate();
    expect(useStudy.getState().duelHistory.map((r) => r.id)).toEqual([
      `d${E0}`,
      `d${E0 - 86_400_000}`,
    ]);
  });

  it("کلیدهایِ دستگاه از گیتِ DEVICE_FIELDS میگذرند — r393: مقدارِ قانونی دستنخورده", () => {
    // r393 — حکمِ سیاستِ دستگاه: تا r386 این قفل «همان‌طور خام» بود («جدول
    // سیاستی برایشان ندارد»)؛ شاهدِ زندهٔ r393 settings:null را آجری نشان داد —
    // حالا گیتِ sanitize دارند؛ مقدارِ قانونی از گیت سالم میگذرد.
    seed({ onboarded: true, settings: { reduceMotion: true } });
    useStudy.persist.rehydrate();
    expect(useStudy.getState().onboarded).toBe(true);
    expect(useStudy.getState().settings.reduceMotion).toBe(true);
  });

  it("r393 — آجریِ شاهدزنده درمان شد: settings:null ⇒ کاملِ پیشفرض، نه TypeError", () => {
    seed({ settings: null, dailyGoal: "abc" });
    useStudy.persist.rehydrate();
    const s = useStudy.getState();
    expect(s.settings).toEqual({ ttsRate: 1, fontScale: 1, reduceMotion: false });
    expect(s.dailyGoal).toBe(10);
    expect(s.settings.reduceMotion).toBe(false);
  });

  it("کلیدِ غایب در snapshot مقدارِ اولیهٔ اسلایس را نگه میدارد", () => {
    seed({ onboarded: true });
    useStudy.persist.rehydrate();
    expect(useStudy.getState().duelHistory).toEqual([]);
    expect(useStudy.getState().streak).toBe(0);
  });

  it("قفلِ منبع: mergeِ persist به rehydrateMerge وصل است", () => {
    const store = read("src/state/store.ts");
    expect(store).toContain("merge: (persisted, current) => rehydrateMerge(persisted, current)");
    const schema = read("src/lib/persist/schema.ts");
    expect(schema).toContain("export function rehydrateMerge");
  });
});
