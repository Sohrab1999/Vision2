// @vitest-environment jsdom
// ------------------------------------------------------------------
// r384 — «ممیزیِ دوقلو: خانوادهٔ زندهٔ امروز» + «حکمِ شکافِ حلقهٔ هدر».
// دو بندِ پیشنهادِ r383 (② و ③):
//   ② سه نما گاردِ «آمارِ زندهٔ امروز» را بایتبهبایت تکرار میکردند —
//     goal-chip با ZERO_DAYِ محلی، daily-quests با لیترالِ inline،
//     home-today با گاردِ زیرمجموعهای. موتورِ liveTodayStat به
//     day-engine (مالکِ دامنهٔ DayStat) رفت و هر سه قرض گرفتند —
//     هیچ گاردِ محلی مجاز نیست (قفلِ تستی).
//   ③ use-fresh-badges پیشاز Task ۹۹ نوشته شده بود و duelHistory
//     هرگز به آن نرسید — نشانِ نبردیِ دیده‌نشده تا ابد حلقهٔ هدر و
//     نقطهٔ پروفایل را خاموش نگه میداشت در حالیکه گریدِ خانه همان را
//     «تازه» میخواند (نقیضِ نیمه — خانوادهٔ خطای r383). حالا قلاب
//     ۱۹سیگنالی است — «تازه ⊆ باز» همیشه برقرار.
// قراردادها:
//   • mounted=false یا روزِ کهنه ⇒ صفرِ صادقِ امروز — هیچ عددِ جعلی
//   • زنده ⇒ همان مرجعِ استور (پایداریِ memoیِ نماها)
//   • پسرعموهایِ state/کتابخانه قراردادِ خودشان: effects.ts و
//     achievements.ts دستنخورده (قفلِ دامنهدار)
//   • duel-setup/duel-done چهاردهسیگنالیِ خودشان (گویشِ evalStreak)
//   • رجیستری ۵۶ نشان؛ صفرِ رویدادِ تحلیلیِ نو (رجیستری ۵۳)
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, renderHook, act, waitFor } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { liveTodayStat } from "@/lib/study-store";
import { useStudy, daysAgoKey } from "@/lib/study-store";
import { useFreshBadges } from "@/hooks/use-fresh-badges";
import { useBadgeCensus } from "@/hooks/use-badge-census";
import { BADGES } from "@/lib/achievements";
import { EVENT_NAMES } from "@/lib/analytics-events";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: vi.fn() }) }));

const ENGINE_SRC = readFileSync(join(process.cwd(), "src/state/day-engine.ts"), "utf8");
const STORE_SRC = readFileSync(join(process.cwd(), "src/lib/study-store.ts"), "utf8");
const CHIP_SRC = readFileSync(join(process.cwd(), "src/components/study/practice/goal-chip.tsx"), "utf8");
const QUESTS_SRC = readFileSync(join(process.cwd(), "src/components/study/practice/daily-quests.tsx"), "utf8");
const TODAY_SRC = readFileSync(join(process.cwd(), "src/components/study/home/home-today.tsx"), "utf8");
const FRESH_SRC = readFileSync(join(process.cwd(), "src/hooks/use-fresh-badges.ts"), "utf8");
const EFFECTS_SRC = readFileSync(join(process.cwd(), "src/state/effects.ts"), "utf8");
const ACH_SRC = readFileSync(join(process.cwd(), "src/lib/achievements.ts"), "utf8");
const SETUP_SRC = readFileSync(join(process.cwd(), "src/components/study/duel/duel-setup.tsx"), "utf8");
const DUEL_DONE_SRC = readFileSync(join(process.cwd(), "src/components/study/duel/duel-done.tsx"), "utf8");

const freshDayStat = (reviews: number, quizzes: number) => ({
  day: daysAgoKey(0),
  reviews,
  quizzes,
  words: 0,
  dictation: 0,
  rush: 0,
  stories: 0,
});

beforeEach(() => {
  localStorage.clear();
  useStudy.setState({
    known: {},
    results: {},
    mistakes: {},
    history: {},
    dayHistory: {},
    dayStat: { day: "", reviews: 0, quizzes: 0, words: 0, dictation: 0, rush: 0, stories: 0 },
    streak: 0,
    bestStreak: 0,
    seenBadges: [],
    duelHistory: [],
    libraryDone: {},
  } as Partial<ReturnType<typeof useStudy.getState>>);
  cleanup();
});

afterEach(() => {
  cleanup();
});

describe("موتورِ liveTodayStat — «آمارِ زندهٔ امروز» تکمنبع", () => {
  it("روزِ زنده: همان مرجعِ استور برمیگردد — بدونِ کپی (پایداریِ memoیِ نما)", () => {
    const stat = freshDayStat(3, 4);
    expect(liveTodayStat(true, stat, daysAgoKey(0))).toBe(stat);
  });

  it("روزِ کهنه: صفرِ صادقِ امروز — نه عددِ جعلیِ دیروز (قراردادِ هر سه نما)", () => {
    const stat = { ...freshDayStat(9, 9), day: daysAgoKey(1) };
    const out = liveTodayStat(true, stat, daysAgoKey(0));
    expect(out.reviews).toBe(0);
    expect(out.quizzes).toBe(0);
    expect(out.day).toBe(daysAgoKey(0));
  });

  it("پیشِ هیدریشن (mounted=false): صفرِ صادقِ امروز — حتی اگر dayStat مالِ امروز باشد", () => {
    const stat = freshDayStat(5, 2);
    const out = liveTodayStat(false, stat, daysAgoKey(0));
    expect(out.reviews).toBe(0);
    expect(out.quizzes).toBe(0);
    expect(out.day).toBe(daysAgoKey(0));
  });

  it("جمعِ زیرمجموعهایِ home-today با موتور همخوان است — reviews+quizzes (گویشِ هدف)", () => {
    const stat = freshDayStat(7, 3);
    const liveToday = liveTodayStat(true, stat, daysAgoKey(0));
    expect(liveToday.reviews + liveToday.quizzes).toBe(10);
    const stale = { ...stat, day: daysAgoKey(2) };
    const liveToday2 = liveTodayStat(true, stale, daysAgoKey(0));
    expect(liveToday2.reviews + liveToday2.quizzes).toBe(0);
  });
});

describe("قفلِ منبعِ r384 — دوقلوهایِ «زندهٔ امروز» مردهاند", () => {
  it("هر سه نما موتور را قرض میگیرند و هیچ گاردِ محلی زنده نیست", () => {
    for (const [name, src] of [
      ["goal-chip", CHIP_SRC],
      ["daily-quests", QUESTS_SRC],
      ["home-today", TODAY_SRC],
    ] as const) {
      expect(src, name).toContain("liveTodayStat");
      expect(src, name).not.toContain("dayStat.day ===");
    }
    expect(CHIP_SRC).not.toContain("ZERO_DAY");
    expect(QUESTS_SRC).not.toContain("reviews: 0, quizzes: 0, words: 0");
    expect(TODAY_SRC).not.toContain("dayStat.reviews + dayStat.quizzes");
    // موتور در مالکِ دامنه زندگی میکند و از study-store صادر میشود
    expect(ENGINE_SRC).toContain("export function liveTodayStat");
    expect(STORE_SRC).toMatch(/liveTodayStat,\s*\n\s*normDayStat,/);
  });

  it("پسرعموهایِ state/کتابخانه قراردادِ خودشان را نگه میدارند (قفلِ دامنهدار)", () => {
    // effects.ts — لایهٔ state پسِ هیدریشن است؛ normDayStatِ خودش را دارد
    expect(EFFECTS_SRC).toContain("s.dayStat.day === today ? normDayStat(s.dayStat) : emptyDayStat(today)");
    expect(EFFECTS_SRC).not.toContain("liveTodayStat");
    // achievements.ts — fallbackِ day:""ِ normDayStat(undefined)؛ dayاش هرگز خوانده نمیشود
    expect(ACH_SRC).toContain("s.dayStat.day === today ? normDayStat(s.dayStat) : normDayStat(undefined)");
    expect(ACH_SRC).not.toContain("liveTodayStat");
  });
});

describe("حکمِ r384 — حلقهٔ هدر ۱۹سیگنالی شد؛ «تازه ⊆ باز»", () => {
  it("قلاب: هر ۱۹ برش + حکمِ مستند + گیتِ هیدریشن", () => {
    for (const signal of ["known", "results", "history", "dayStat", "streak", "bestStreak", "mistakes", "rushBest", "rushBestCorrect", "rushGames", "freezeCount", "freezeUsedDays", "freezeEarnedDay", "goalMetDays", "dayHistory", "duelHistory", "seenBadges", "userName", "libraryDone"]) {
      expect(FRESH_SRC).toContain(`s.${signal}`);
    }
    expect(FRESH_SRC).toContain("حکمِ شکافِ واقعی");
    expect(FRESH_SRC).toContain("useMounted");
  });

  it("نشانِ نبردیِ دیده‌نشده حالا در حلقهٔ هدر هم «تازه» است — و در سرشماری «باز» (همارزی)", async () => {
    useStudy.setState({
      duelHistory: [
        { id: "d1", day: daysAgoKey(0), outcome: "win", reason: "score", opponent: "سارا", opponentColor: "rose", myScore: 8, oppScore: 3, myCorrect: 8, oppCorrect: 3 },
        { id: "d2", day: daysAgoKey(0), outcome: "win", reason: "score", opponent: "سارا", opponentColor: "rose", myScore: 6, oppScore: 2, myCorrect: 6, oppCorrect: 2 },
      ] as never,
    } as Partial<ReturnType<typeof useStudy.getState>>);
    const fresh = renderHook(() => useFreshBadges());
    const census = renderHook(() => useBadgeCensus());
    await act(async () => {
      await waitFor(() => expect(census.result.current.evalInput).not.toBeNull());
      await waitFor(() => expect(fresh.result.current.length).toBeGreaterThan(0));
    });
    // شکارچیِ رقیب: دو برد مقابلِ یک حریف — پیش از r384 در هر دو ارزیابِ
    // گزارش/حلقه نامرئی بود (duelHistory غایب)؛ حالا هر دو زنده
    expect(census.result.current.unlocked.has("rival-hunter")).toBe(true);
    expect(fresh.result.current).toContain("rival-hunter");
    // نامتغیر: تازه ⊆ باز — رویِ کلِ مجموعه، نه فقط یک نشان
    for (const id of fresh.result.current) {
      expect(census.result.current.unlocked.has(id), id).toBe(true);
    }
  });

  it("خانوادهٔ نبرد چهاردهسیگنالیِ خودش میماند — گویشِ evalStreak دستنخورده", () => {
    for (const src of [SETUP_SRC, DUEL_DONE_SRC]) {
      expect(src).toContain("duelHistory,");
      expect(src).not.toContain("freezeCount,");
      expect(src).not.toContain("dayHistory,");
    }
  });

  it("رجیستری ۵۶ نشان؛ صفرِ رویدادِ نو و صفرِ رشدِ بهداشت (رجیستری ۵۳)", () => {
    expect(BADGES.length).toBe(56);
    expect(EVENT_NAMES.length).toBe(55); // r423 +۱ — کارتِ تصویریِ تقویمِ هفته؛ r424 +۱ — هم‌رسانیِ بومیِ همان کارت (دوقلویِ r306)؛ r425 +۱ — پرشِ خانهٔ امروزِ نوارِ هفته
    for (const src of [ENGINE_SRC, FRESH_SRC]) {
      expect(src).not.toContain("trackEvent");
      expect(src).not.toContain("transition-all");
      expect(src).not.toContain("stone-400");
    }
  });
});
