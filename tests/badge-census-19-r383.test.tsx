// @vitest-environment jsdom
// ------------------------------------------------------------------
// r383 — «داوریِ واگراییِ سرشماری» — بندِ ②ِ پیشنهادِ r382.
// حکم (بازبینیِ دوسویه با شاهدِ بایتی و شاهدِ زنده): نسخهٔ ۱۳سیگنالیِ
// سرشماریِ گزارش، هجده نشانِ خانوادههایِ یخ/هدف/ران/حضور را هرگز «باز»
// نمیدید — گریدِ خانه (کنونیکِ ۱۹سیگنالی) همان یادگیرنده را «۲۰ از ۵۶»
// میدید و کارنامه «۵ از ۵۶» میگفت (qa-r383-probe-divergence.sh).
// سندِ رسمی که نشانِ واقعی را نمیشمارد نقیضِ نیمه است (r236). ریشه،
// رتِ سرشماری بود نه تصمیمِ دامنه. پس: سرشماری = ارزیابیِ کاملِ
// ۱۹سیگنالیِ گریدِ خانه — یک دامنه، یک موتور (ایدئومِ r363/r381/r382).
// قراردادها:
//   • قلابِ سرشماری دقیقاً ۱۹ برش را انتخاب میکند — نه کم (واگرایی
//     زنده میماند) نه زیاد (سیگنالِ ناموجود در استور)
//   • همارزیِ مجموعه: سرشماری ≡ ارزیابیِ کنونیکِ گریدِ خانه رویِ همان
//     مخزن — در هر حالتِ بذرشده
//   • خانوادههایِ دیگر با قراردادِ خودشان: حلقهٔ هدر از r384 هم ۱۹سیگنالی
//     شد (حکمِ شکافِ واقعی — بروزرسانیِ حاشیهٔ همین فایل)؛
//     duel-setup/duel-done چهاردهسیگنالیِ دامنهدار میمانند
//   • رجیستری ۵۶ نشان؛ رشدِ ثبتشده (۵۳ با r423)
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, waitFor, renderHook, act } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { useBadgeCensus } from "@/hooks/use-badge-census";
import { BADGES, buildEvalInput, unlockedBadgeIds } from "@/lib/achievements";
import ReportCard from "@/components/study/reports/report-card";
import { useStudy, daysAgoKey } from "@/lib/study-store";
import { faNum } from "@/lib/study-theme";
import { EVENT_NAMES } from "@/lib/analytics-events";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: vi.fn() }) }));

const HOOK_SRC = readFileSync(join(process.cwd(), "src/hooks/use-badge-census.ts"), "utf8");
const FRESH_SRC = readFileSync(join(process.cwd(), "src/hooks/use-fresh-badges.ts"), "utf8");
const GRID_SRC = readFileSync(join(process.cwd(), "src/components/study/practice/badges.tsx"), "utf8");
const SETUP_SRC = readFileSync(join(process.cwd(), "src/components/study/duel/duel-setup.tsx"), "utf8");
const DUEL_DONE_SRC = readFileSync(join(process.cwd(), "src/components/study/duel/duel-done.tsx"), "utf8");

/** بذرِ کاملِ خانوادههایِ یخ/هدف/ران/حضور — ۱۴ روزِ همهفعالیت + ۱۴ روزِ هدفدار + یخِ انباشته */
function seedFamilies() {
  const dayKeys = Array.from({ length: 25 }, (_, i) => daysAgoKey(i));
  const dayHistory = Object.fromEntries(
    dayKeys.map((k) => [k, { day: k, reviews: 9, quizzes: 2, words: 4, dictation: 3, rush: 1, stories: 0 }])
  );
  useStudy.setState({
    freezeCount: 2,
    freezeEarnedDay: dayKeys[0],
    freezeUsedDays: [],
    goalMetDays: dayKeys.slice(0, 14),
    dayHistory,
    dayStat: { day: dayKeys[0], reviews: 9, quizzes: 2, words: 4, dictation: 3, rush: 1, stories: 0 },
    streak: 9,
    bestStreak: 12,
  } as Partial<ReturnType<typeof useStudy.getState>>);
}

/** ارزیابیِ کنونیکِ گریدِ خانه — همان ۱۹ برش از همان مخزن (بدونِ واسطه) */
function canonicalUnlocked(): Set<string> {
  const s = useStudy.getState();
  return unlockedBadgeIds(
    buildEvalInput({
      known: s.known,
      results: s.results,
      history: s.history,
      dayStat: s.dayStat,
      streak: s.streak,
      bestStreak: s.bestStreak,
      mistakes: s.mistakes,
      rushBest: s.rushBest,
      rushBestCorrect: s.rushBestCorrect,
      rushGames: s.rushGames,
      freezeCount: s.freezeCount,
      freezeUsedDays: s.freezeUsedDays,
      freezeEarnedDay: s.freezeEarnedDay,
      goalMetDays: s.goalMetDays,
      dayHistory: s.dayHistory,
      duelHistory: s.duelHistory,
      seenBadges: s.seenBadges,
      userName: s.userName,
      libraryDone: s.libraryDone ?? {},
    })
  );
}

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
    rushBest: 0,
    rushBestCorrect: 0,
    rushGames: 0,
    freezeCount: 0,
    freezeUsedDays: [],
    freezeEarnedDay: "",
    goalMetDays: [],
    duelHistory: [],
    seenBadges: [],
    userName: "",
    userId: "",
    srs: {},
    starredWords: [],
    wordSeen: {},
    libraryDone: {},
  } as Partial<ReturnType<typeof useStudy.getState>>);
  cleanup();
});

afterEach(() => {
  cleanup();
});

describe("قلابِ سرشماری — ۱۹سیگنالیِ حکمِ r383", () => {
  it("خانوادههایِ یخ/هدف/ران/حضور حالا در سرشماریِ گزارش زندهاند — واگراییِ هجدهنشانهای مرده", async () => {
    seedFamilies();
    const { result } = renderHook(() => useBadgeCensus());
    await act(async () => {
      await waitFor(() => expect(result.current.evalInput).not.toBeNull());
    });
    for (const id of [
      "ice-maker", "ice-stockpile", // یخ
      "goal-first", "goal-week", "goal-fortnight", // هدف
      "cage-free", "dictation-run", "exam-run", "review-run", "double-run", "triple-run", "marathon-run", // ران
      "presence-month", // حضور
    ]) {
      expect(result.current.unlocked.has(id), id).toBe(true);
    }
    // و همین مخزن در ارزیابیِ سیزدهسیگنالیِ قدیم هیچکدام را نمیدید — دلتایِ حکم
    const s = useStudy.getState();
    const slim = unlockedBadgeIds(
      buildEvalInput({
        known: s.known, results: s.results, history: s.history, dayStat: s.dayStat,
        streak: s.streak, bestStreak: s.bestStreak, mistakes: s.mistakes,
        rushBest: s.rushBest, rushBestCorrect: s.rushBestCorrect, rushGames: s.rushGames,
        seenBadges: s.seenBadges, userName: s.userName, libraryDone: s.libraryDone ?? {},
      })
    );
    expect(slim.has("ice-maker")).toBe(false);
    expect(slim.has("goal-first")).toBe(false);
    expect(slim.has("dictation-run")).toBe(false);
    expect(result.current.unlocked.size).toBeGreaterThan(slim.size);
  });

  it("همارزیِ مجموعه با ارزیابیِ کنونیکِ گریدِ خانه — رویِ مخزنِ خانوادهدار و مخزنِ خالی", async () => {
    const { result: empty } = renderHook(() => useBadgeCensus());
    await act(async () => {
      await waitFor(() => expect(empty.current.evalInput).not.toBeNull());
    });
    expect(empty.current.unlocked).toEqual(canonicalUnlocked());

    seedFamilies();
    const { result: rich } = renderHook(() => useBadgeCensus());
    await act(async () => {
      await waitFor(() => expect(rich.current.evalInput).not.toBeNull());
    });
    expect(rich.current.unlocked).toEqual(canonicalUnlocked());
  });
});

describe("قفلِ منبعِ r383 — مرزِ خانوادهها", () => {
  it("قلاب: ۱۹ برش + حکمِ مستند + گیتِ هیدریشن + مرجعِ پایدارِ libraryDone", () => {
    for (const signal of ["known", "results", "history", "dayStat", "streak", "bestStreak", "mistakes", "rushBest", "rushBestCorrect", "rushGames", "freezeCount", "freezeUsedDays", "freezeEarnedDay", "goalMetDays", "dayHistory", "duelHistory", "seenBadges", "userName", "libraryDone"]) {
      expect(HOOK_SRC).toContain(`s.${signal}`);
    }
    expect(HOOK_SRC).toContain("حکمِ r383");
    expect(HOOK_SRC).toContain("useMounted");
    expect(HOOK_SRC).toMatch(/mounted\s*\?\s*buildEvalInput/);
    expect(HOOK_SRC).toMatch(/useMemo\(\(\) => libraryDoneRaw \?\? \{\}, \[libraryDoneRaw\]\)/);
  });

  it("گریدِ خانه همان کنونیکِ ۱۹سیگنالی است و حلقهٔ هدر هم ۱۹سیگنالیِ r384 شد (حکمِ شکافِ واقعی)", () => {
    for (const field of ["freezeCount", "freezeUsedDays", "freezeEarnedDay", "goalMetDays", "dayHistory", "duelHistory"]) {
      expect(GRID_SRC, field).toContain(`${field},`);
      expect(FRESH_SRC, field).toContain(`${field},`);
    }
    // حکمِ r384 در خودِ قلاب مستند است — قلاب پیشاز Task ۹۹ بود، نه «حذفِ عمدی»
    expect(FRESH_SRC).toContain("حکمِ شکافِ واقعی");
  });

  it("خانوادهٔ نبرد چهاردهسیگنالیِ دامنهدار میماند — duelHistory دارد، یخ/هدف ندارد", () => {
    for (const src of [SETUP_SRC, DUEL_DONE_SRC]) {
      expect(src).toContain("duelHistory,");
      expect(src).not.toContain("freezeCount,");
      expect(src).not.toContain("dayHistory,");
    }
  });

  it("رجیستری ۵۶ نشان؛ رشدِ ثبتشده و صفرِ رشدِ بهداشت (رجیستری ۵۳ با r423)", () => {
    expect(BADGES.length).toBe(56);
    // r423 — کارتِ تصویریِ تقویمِ هفته رویدادِ خودش را گرفت (خانوادهٔ weekly_image)
    expect(EVENT_NAMES.length).toBe(60); // r456 +۵ — دوقلویِ شعلهٔ زنجیره + چیپِ هفته + آغازِ داستان + دو گیتِ مرورِ هوشمندِ معلم — بعد از ۵۵ِ r424/r425
    expect(HOOK_SRC).not.toContain("trackEvent");
    expect(HOOK_SRC).not.toContain("transition-all");
    expect(HOOK_SRC).not.toContain("stone-400");
  });
});

describe("نمایِ کارنامه رویِ سرشماریِ کامل — داوریِ رندرِ واقعی", () => {
  it("KPIِ «نشان کسب‌شده» دیگر نشانِ یخ/هدف/ران را پنهان نمیکند — عدد با کنونیک یکسان", async () => {
    seedFamilies();
    const expected = canonicalUnlocked();
    render(<ReportCard open onClose={() => {}} />);
    await waitFor(() => expect(screen.getByText("نشان کسب‌شده")).toBeInTheDocument());
    // خوانشِ سلولی (درسِ r379) — شاهد، عددِ کنونیک است نه عددِ فرضی
    await waitFor(() => {
      expect(document.body.textContent).toContain(`${faNum(expected.size)} از ${faNum(56)}`);
    });
    // و یک نشانِ خانوادهٔ یخ در متنِ کارنامه زنده است (لیستِ رسمی)
    const ice = BADGES.find((b) => b.id === "ice-maker");
    expect(ice).toBeDefined();
    expect(document.body.textContent).toContain(ice!.title);
  });
});
