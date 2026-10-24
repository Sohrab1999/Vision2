/**
 * r383 ② — داوریِ داده‌محورِ واگراییِ سرشماری (گریدِ خانه ۱۸سیگنالی vs خانوادهٔ گزارش ۱۳سیگنالی).
 * سوال: کدام شناسههایِ نشان با حذفِ ۵ سیگنالِ یخ/هدف/روزِ تاریخچه (freezeCount,
 * freezeUsedDays, freezeEarnedDay, goalMetDays, dayHistory) نتیجهشان عوض میشود؟
 * خروجی: لیستِ دقیقِ شناسههایِ واگرا + شمارش.
 */
import { BADGES, buildEvalInput, unlockedBadgeIds } from "../src/lib/achievements";

// یادگیرندهٔ سینتتیکیِ «همه‌چیزدارد» — هر ۱۹ سیگنال در سقف
const FULL: Parameters<typeof buildEvalInput>[0] = {
  known: Object.fromEntries(Array.from({ length: 200 }, (_, i) => [`w${i}`, true])),
  results: {
    "1:vocab": { percent: 100, total: 20, correct: 20, at: "2026-10-24T10:00:00.000Z" },
    "1:grammar": { percent: 90, total: 10, correct: 9, at: "2026-10-24T10:00:00.000Z" },
    exam: { percent: 95, total: 40, correct: 38, at: "2026-10-24T10:00:00.000Z" },
    final: { percent: 92, total: 40, correct: 37, at: "2026-10-24T10:00:00.000Z" },
    dictation: { percent: 100, total: 10, correct: 10, at: "2026-10-24T10:00:00.000Z" },
    writing: { percent: 100, total: 10, correct: 10, at: "2026-10-24T10:00:00.000Z" },
  },
  history: {},
  dayStat: {
    day: "2026-10-24",
    reviews: 30,
    quizzes: 3,
    words: 5,
    dictation: 2,
    rush: 1,
    stories: 1,
  },
  streak: 30,
  bestStreak: 45,
  mistakes: {},
  rushBest: 120,
  rushBestCorrect: 18,
  rushGames: 25,
  freezeCount: 2,
  freezeUsedDays: ["2026-10-10", "2026-10-11", "2026-10-12"],
  freezeEarnedDay: "2026-10-01",
  goalMetDays: ["2026-10-18", "2026-10-19", "2026-10-20", "2026-10-21", "2026-10-22", "2026-10-23", "2026-10-24", "2026-10-17", "2026-10-16", "2026-10-15", "2026-10-14", "2026-10-13", "2026-10-12", "2026-10-11"],
  dayHistory: Object.fromEntries(
    Array.from({ length: 35 }, (_, i) => {
      const d = new Date("2026-10-24T00:00:00Z");
      d.setUTCDate(d.getUTCDate() - i);
      const key = d.toISOString().slice(0, 10);
      return [
        key,
        { day: key, reviews: 10, quizzes: 2, words: 4, dictation: 3, rush: 1, stories: 1 },
      ];
    })
  ),
  seenBadges: [],
  userName: "آزماینده",
  libraryDone: {},
};

const full = buildEvalInput(FULL);
const slim = buildEvalInput({
  known: FULL.known,
  results: FULL.results,
  history: FULL.history,
  dayStat: FULL.dayStat,
  streak: FULL.streak,
  bestStreak: FULL.bestStreak,
  mistakes: FULL.mistakes,
  rushBest: FULL.rushBest,
  rushBestCorrect: FULL.rushBestCorrect,
  rushGames: FULL.rushGames,
  seenBadges: FULL.seenBadges,
  userName: FULL.userName,
  libraryDone: FULL.libraryDone,
}); // ۱۳سیگنالیِ سرشماریِ گزارش — ۵ سیگنالِ یخ/هدف/روز غایب

const a = unlockedBadgeIds(full);
const b = unlockedBadgeIds(slim);
const divergent = BADGES.filter((x) => a.has(x.id) !== b.has(x.id));

console.log("FULL unlocked:", a.size, "| 13-signal unlocked:", b.size, "| registry:", BADGES.length);
console.log("DIVERGENT:", divergent.length);
for (const x of divergent) {
  console.log(`  ${x.id} — full=${a.has(x.id) ? "OPEN" : "locked"} slim=${b.has(x.id) ? "OPEN" : "locked"} | ${x.title ?? ""}`);
}
