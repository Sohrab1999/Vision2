"use client";

import { useMemo } from "react";
import { useStudy } from "@/lib/study-store";
import { useMounted } from "@/lib/use-mounted";
import { BADGES, buildEvalInput, unlockedBadgeIds } from "@/lib/achievements";

/**
 * ارزیابیِ واحدِ نشانها برایِ خانوادهٔ گزارشها (r382 — ممیزیِ دوقلوها؛
 * r383 — داوریِ واگراییِ سرشماری).
 *
 * حکمِ r383 (بندِ ②ِ پیشنهادِ r382 — بازبینیِ دوسویه با شاهدِ بایتی):
 * نسخهٔ ۱۳سیگنالیِ این قلاب، هجده نشانِ خانوادههایِ یخ/هدف/ران/حضور/نبرد
 * را هرگز «باز» نمیدید — گریدِ خانه (کنونیکِ سرشماری: ۱۹سیگنالی) همان
 * یادگیرنده را «۲۰ از ۵۶» میدید و کارنامه «۵ از ۵۶» میگفت (شاهدِ زندهٔ
 * پیشِ تغییر، qa-r383-probe-divergence.sh). سندِ رسمی که نشانِ واقعیِ
 * یادگیرنده را نمیشمارد سندِ ناصادق است (r236 — همچنین نقیضِ نیمه).
 * پنج سیگنالِ غایب (freezeCount/freezeUsedDays/freezeEarnedDay/goalMetDays/
 * dayHistory) + duelHistory همگی برشهایِ سادهٔ persist‌اند با همان قراردادِ
 * هیدریشنِ known/results — هیچ خطرِ فنیِ نو؛ ریشهٔ ۱۳، رتِ سرشماری بود
 * (سه censusِ محلیِ پیشاز Task ۸۲ هرگز با خانوادههایِ نو گسترش نیافتند)،
 * نه تصمیمِ دامنه. پس: سرشماری = ارزیابیِ کاملِ ۱۹سیگنالیِ گریدِ خانه —
 * یک دامنه، یک موتور (ایدئومِ r363/r381/r382).
 *
 * خانوادههایِ دیگر با قراردادِ خودشان میمانند (قفلِ دامنهدارِ r382):
 *  • حلقهٔ طلاییِ هدر (use-fresh-badges): ۱۸سیگنالیِ عمدی — جشنِ «تازه»
 *    را خودِ duel-done برمیانگیزد (r287)؛ دستنخورده.
 *  • duel-setup/duel-done: ۱۴سیگنالیِ دامنهدار با evalStreakِ محلی؛
 *    دستنخورده.
 *
 * قرارداد: ۱۹ سیگنال + گیتِ هیدریشنِ خانواده — تا پیش از mount خروجیِ
 * صادقِ خالی است (SSR-safe، همان قراردادِ useFreshBadges).
 * libraryDone با ایدئومِ مرجعِ پایدارِ r298/r302 (درسِ lintِ هفته‌نامه):
 * ?? داخلِ useMemo تا مرجعِ ناپایدار memo را نشکند. برشهایِ دیگرِ
 * آرایهای/شیءای مستقیم از استور میآیند — مرجعِ ذخیرهشده، پایدار.
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
  const freezeCount = useStudy((s) => s.freezeCount);
  const freezeUsedDays = useStudy((s) => s.freezeUsedDays);
  const freezeEarnedDay = useStudy((s) => s.freezeEarnedDay);
  const goalMetDays = useStudy((s) => s.goalMetDays);
  const dayHistory = useStudy((s) => s.dayHistory);
  const duelHistory = useStudy((s) => s.duelHistory);
  const seenBadges = useStudy((s) => s.seenBadges);
  const userName = useStudy((s) => s.userName);
  const libraryDoneRaw = useStudy((s) => s.libraryDone);
  const libraryDone = useMemo(() => libraryDoneRaw ?? {}, [libraryDoneRaw]);
  const mounted = useMounted();

  const evalInput = useMemo(
    () =>
      mounted
        ? buildEvalInput({ known, results, history, dayStat, streak, bestStreak, mistakes, rushBest, rushBestCorrect, rushGames, freezeCount, freezeUsedDays, freezeEarnedDay, goalMetDays, dayHistory, duelHistory, seenBadges, userName, libraryDone })
        : null,
    [mounted, known, results, history, dayStat, streak, bestStreak, mistakes, rushBest, rushBestCorrect, rushGames, freezeCount, freezeUsedDays, freezeEarnedDay, goalMetDays, dayHistory, duelHistory, seenBadges, userName, libraryDone]
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
