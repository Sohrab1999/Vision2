"use client";

import { useMemo } from "react";
import { useStudy } from "@/lib/study-store";
import { useMounted } from "@/lib/use-mounted";
import { buildEvalInput, newBadgeIds } from "@/lib/achievements";

/**
 * نشان‌های تازهٔ دیده‌نشده (Task 82) — قراردادِ واحدِ «قهرمان‌سازی»:
 * هم حلقهٔ طلاییِ آواتارِ هدر و هم نقطهٔ شمارنده از این‌جا می‌خوانند.
 * خروجی = شناسه‌های بازِ دیده‌نشده به ترتیب رجیستری (چراغ تا لحظهٔ
 * دیده‌شدن در بخش نشان‌های «خانه» روشن می‌ماند — تک‌نویسنده همان‌جاست).
 * تا پیش از هیدریشن خالی است (SSR-safe).
 */
export function useFreshBadges(): string[] {
  const known = useStudy((s) => s.known);
  const results = useStudy((s) => s.results);
  const history = useStudy((s) => s.history);
  const dayStat = useStudy((s) => s.dayStat);
  const streak = useStudy((s) => s.streak);
  const bestStreak = useStudy((s) => s.bestStreak);
  const mistakes = useStudy((s) => s.mistakes);
  const rushBest = useStudy((s) => s.rushBest);
  const rushBestCorrect = useStudy((s) => s.rushBestCorrect);
  const rushGames = useStudy((s) => s.rushGames);
  const freezeCount = useStudy((s) => s.freezeCount);
  const freezeUsedDays = useStudy((s) => s.freezeUsedDays);
  const freezeEarnedDay = useStudy((s) => s.freezeEarnedDay);
  const goalMetDays = useStudy((s) => s.goalMetDays);
  const dayHistory = useStudy((s) => s.dayHistory);
  const seenBadges = useStudy((s) => s.seenBadges);
  const userName = useStudy((s) => s.userName); // r282 — خانوادهٔ هویت
  const libraryDone = useStudy((s) => s.libraryDone) ?? {}; // r298 — خانوادهٔ کتاب‌خوان
  const mounted = useMounted();

  return useMemo(() => {
    if (!mounted) return [];
    const input = buildEvalInput({
      known,
      results,
      history,
      dayStat,
      streak,
      bestStreak,
      mistakes,
      rushBest,
      rushBestCorrect,
      rushGames,
      freezeCount,
      freezeUsedDays,
      freezeEarnedDay,
      goalMetDays,
      dayHistory,
      seenBadges,
      userName,
      libraryDone, // r298 — جشنِ نشانِ کتاب‌خوان از همان ارزیابیِ واحد
    });
    return newBadgeIds(input, seenBadges);
  }, [mounted, known, results, history, dayStat, streak, bestStreak, mistakes, rushBest, rushBestCorrect, rushGames, freezeCount, freezeUsedDays, freezeEarnedDay, goalMetDays, dayHistory, seenBadges, userName, libraryDone]);
}
