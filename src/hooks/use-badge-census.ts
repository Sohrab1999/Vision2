"use client";

import { useMemo } from "react";
import { useStudy } from "@/lib/study-store";
import { useMounted } from "@/lib/use-mounted";
import { BADGES, buildEvalInput, unlockedBadgeIds } from "@/lib/achievements";

/**
 * ارزیابیِ واحدِ نشانها برایِ خانوادهٔ گزارشها (r382 — ممیزیِ دوقلوها).
 * سه گزارش (کارنامه، کارنامهٔ رسمی، هفته‌نامه) هرکدام سه نسخهٔ محلیِ
 * همین memoها را نگه میداشتند — ایدئومِ r363/r381: موتور یک‌جا،
 * مصرفکنندهها قرض میگیرند؛ هیچ ارزیابیِ دومی در نماها مجاز نیست
 * (قفلِ تستیِ r382، همتای «دقیقاً دو جایگاهِ فراخوانی»).
 *
 * قرارداد: ۱۳ سیگنالِ سرشماری + گیتِ هیدریشنِ خانواده — تا پیش از mount
 * خروجیِ صادقِ خالی است (SSR-safe، همان قراردادِ useFreshBadges).
 * libraryDone با ایدئومِ مرجعِ پایدارِ r298/r302 (درسِ lintِ هفته‌نامه):
 * ?? داخلِ useMemo تا مرجعِ ناپایدار memo را نشکند.
 * یادداشتِ پیشینه: خانوادهٔ گزارش عمداً بدونِ خانوادهٔ یخ/هدف (freezeCount,
 * goalMetDays, dayHistory) ارزیابی میکند — همان ۱۳ سیگنالِ همیشه؛ تغییرش
 * حکمِ جدا میخواهد (نظمِ نگهبانِ مرزِ r380).
 */
export function useBadgeCensus() {
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
  const seenBadges = useStudy((s) => s.seenBadges);
  const userName = useStudy((s) => s.userName);
  const libraryDoneRaw = useStudy((s) => s.libraryDone);
  const libraryDone = useMemo(() => libraryDoneRaw ?? {}, [libraryDoneRaw]);
  const mounted = useMounted();

  const evalInput = useMemo(
    () =>
      mounted
        ? buildEvalInput({ known, results, history, dayStat, streak, bestStreak, mistakes, rushBest, rushBestCorrect, rushGames, seenBadges, userName, libraryDone })
        : null,
    [mounted, known, results, history, dayStat, streak, bestStreak, mistakes, rushBest, rushBestCorrect, rushGames, seenBadges, userName, libraryDone]
  );
  const unlocked = useMemo(
    () => (evalInput ? unlockedBadgeIds(evalInput) : new Set<string>()),
    [evalInput]
  );
  const unlockedBadges = useMemo(
    () => (unlocked.size > 0 ? BADGES.filter((b) => unlocked.has(b.id)) : []),
    [unlocked]
  );

  return { evalInput, unlocked, unlockedBadges };
}
