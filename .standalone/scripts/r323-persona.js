// r323 — «قهرمان در سطح‌هایِ دیگر»: شخصیتِ r322 + دفترچهٔ نبردِ واقعی + سابقهٔ آزمون.
//   پیشنهادِ ②ِ r322: شخصیتِ «قهرمان» باید پیمایش‌هایِ سطحِ دیگر را هم ببیند —
//   نبرد با تاریخچهٔ واقعی (duel-setup فقط با duelHistory رندر میشود: کارتِ
//   کارنامه، رقیبِ همیشگی، نشان‌های نبردی، دفترچهٔ قابلِ کاویدن با فیلتر/جست‌وجو)،
//   آزمونِ جامع با سابقه (results["exam"] و results["final"] و کلیدهایِ پایه)،
//   و واژه‌های منِ پُر (۳۰ واژهٔ known + واژه‌های خطرناک — ردیف‌های واقعی).
//   ساختارِ رکورد: DuelRecord (lib/duel-history.ts) — sanitize سخت‌گیر دارد:
//   id:string·day:YYYY-MM-DD·outcome∈{win,loss,tie}·opponent≤40·sig:hex64.
//   رکوردهایِ اینجا با همان sanitizeDuelHistory در آزمونِ قفل تطبیق داده میشوند
//   تا هر انحرافِ شکل، seed را بیاثر کند (رکوردِ خراب کلاً میافتد — زیرمجموعهٔ صادق).
// مصرف: node scripts/r323-persona.js [champion|rookie]  → JSON در stdout
"use strict";

const DAY = 86400000;

const isoAt = (daysAgo, h = 15) => {
  const d = new Date(Date.now() - daysAgo * DAY);
  d.setHours(h, 12, 0, 0);
  return d.toISOString();
};

const dayKey = (daysAgo) => {
  const d = new Date(Date.now() - daysAgo * DAY);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

// ۶۴ hex ثابت (شکلِ رسیدِ داور — HMAC-SHA256) برایِ رکوردهایِ «داورگواه»
const SIG_A = "a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90";
const SIG_B = "0f1e2d3c4b5a69788796a5b4c3d2e1f00f1e2d3c4b5a69788796a5b4c3d2e1f0";

// واژه‌های واقعیِ درسها (تصدیق‌شده در lesson1/2/3.ts — آزمونِ قفل دوباره چک میکند)
const CHAMPION_WORDS = {
  1: ["ability", "absolutely", "access", "across", "action", "add", "additional", "afraid", "age", "always", "amazing", "amount", "appropriate", "artist", "available", "belief"],
  2: ["a bit", "active", "activity", "addict", "addictive", "addiction", "all right", "anti-cancer", "asleep", "attend"],
  3: ["accept", "according to", "achieve", "actually", "advice", "agree", "amazed", "amused", "antonym", "appreciate"],
};

// دفترچهٔ نبرد — ۶ رکورد با طیفِ کاملِ نتیجه/دلیل/رسید/فکر:
//   بردِ داورگواه · بردِ بی‌رسید (قدیمی) · بردِ داورگواهِ دوم · باختِ داورگواه ·
//   مساوی · باختِ فورفیت (چیپِ «ضربهٔ فنی») — + یک رکوردِ فکردار («چابکیِ ذهن»)
// نام‌ها عمداً بلند و همخانواده‌اند («امیر محمد» / «امیرمحمد») تا جست‌وجوی
// نرمال‌شدهٔ Task 98 و شکستنِ سطرِ نام در ردیفِ دفترچه هم سنجیده شود.
const DUELS = () => [
  {
    id: "d1789000000006", day: dayKey(0), outcome: "win", reason: "finished",
    opponent: "امیر محمد رضایی نژاد", opponentColor: "rose",
    myScore: 1240, oppScore: 890, myCorrect: 9, oppCorrect: 7, answered: 10, total: 10,
    durationSec: 214, receiptSig: SIG_A,
    think: { avgMs: 1200, minMs: 800, maxMs: 1800, seen: 9, total: 10 },
  },
  {
    id: "d1789000000005", day: dayKey(1), outcome: "loss", reason: "finished",
    opponent: "سینا", opponentColor: "sky",
    myScore: 760, oppScore: 1310, myCorrect: 6, oppCorrect: 10, answered: 10, total: 10,
    durationSec: 268, receiptSig: SIG_B,
  },
  {
    id: "d1789000000004", day: dayKey(3), outcome: "win", reason: "finished",
    opponent: "امیرمحمد", opponentColor: "violet",
    myScore: 980, oppScore: 450, myCorrect: 8, oppCorrect: 4, answered: 9, total: 10,
    durationSec: 190, receiptSig: SIG_A,
  },
  {
    id: "d1789000000003", day: dayKey(6), outcome: "tie", reason: "finished",
    opponent: "مریم", opponentColor: "emerald",
    myScore: 900, oppScore: 900, myCorrect: 7, oppCorrect: 7, answered: 10, total: 10,
    durationSec: 240,
  },
  {
    id: "d1789000000002", day: dayKey(9), outcome: "loss", reason: "forfeit",
    opponent: "کاوه", opponentColor: "orange",
    myScore: 300, oppScore: 500, myCorrect: 3, oppCorrect: 5, answered: 4, total: 10,
    durationSec: 96,
  },
  {
    id: "d1789000000001", day: dayKey(14), outcome: "win", reason: "finished",
    opponent: "سینا", opponentColor: "sky",
    myScore: 1120, oppScore: 670, myCorrect: 9, oppCorrect: 6, answered: 10, total: 10,
    durationSec: 205,
  },
];

const CHAMPION = () => {
  const known = {};
  for (const [ls, words] of Object.entries(CHAMPION_WORDS))
    for (const w of words) known[`${ls}:${w.toLowerCase()}`] = true;

  const now = Date.now();
  const srs = {
    "1:action": { level: 2, dueAt: now - 2 * 3600000 },
    "2:attend": { level: 0, dueAt: now - 600000 },
    "3:achieve": { level: 3, dueAt: now + 2 * DAY },
    "1:age": { level: 4, dueAt: now + 5 * DAY },
    "2:asleep": { level: 1, dueAt: now + 6 * 3600000 },
    "3:accept": { level: 2, dueAt: now + DAY },
  };

  const results = {
    "1:vocab": { correct: 17, total: 20, percent: 85, at: isoAt(1) },
    "1:grammar": { correct: 8, total: 10, percent: 80, at: isoAt(2) },
    "1:dictation": { correct: 6, total: 10, percent: 60, at: isoAt(3) },
    "2:vocab": { correct: 15, total: 18, percent: 83, at: isoAt(2) },
    "2:dictation": { correct: 9, total: 12, percent: 75, at: isoAt(4) },
    "2:listening": { correct: 7, total: 10, percent: 70, at: isoAt(5) },
    "3:vocab": { correct: 12, total: 15, percent: 80, at: isoAt(6) },
    "3:synant": { correct: 5, total: 10, percent: 50, at: isoAt(1) },
    rush: { correct: 21, total: 44, percent: 48, at: isoAt(0, 10) },
    // سابقهٔ آزمون — r323: exam-view با این کلیدها «بهترین نتیجه» و گواهی میسازد
    exam: { correct: 36, total: 40, percent: 90, at: isoAt(2) },
    "exam-mistakes": { correct: 3, total: 10, percent: 30, at: isoAt(2) },
    final: { correct: 42, total: 50, percent: 84, at: isoAt(5) },
    "final-10": { correct: 38, total: 50, percent: 76, at: isoAt(7) },
    "final-11": { correct: 44, total: 50, percent: 88, at: isoAt(4) },
  };

  const wordMistakes = {
    "2:addiction": 4,
    "1:ability": 3,
    "1:appropriate": 2,
    "3:advice": 2,
    "3:amazed": 1,
  };
  const wordSeen = {
    "2:addiction": 5,
    "1:ability": 6,
    "1:appropriate": 2,
    "3:advice": 3,
    "3:amazed": 2,
  };

  const history = {};
  const week = [
    { reviews: 12, quizzes: 2, words: 5, dictation: 1, rush: 1, stories: 0 },
    { reviews: 8, quizzes: 1, words: 3, dictation: 0, rush: 0, stories: 1 },
    { reviews: 0, quizzes: 0, words: 0, dictation: 0, rush: 0, stories: 0 },
    { reviews: 15, quizzes: 3, words: 8, dictation: 1, rush: 2, stories: 1 },
    { reviews: 20, quizzes: 2, words: 10, dictation: 0, rush: 1, stories: 0 },
    { reviews: 6, quizzes: 1, words: 2, dictation: 0, rush: 0, stories: 0 },
    { reviews: 10, quizzes: 2, words: 6, dictation: 1, rush: 1, stories: 0 },
  ];
  week.forEach((d, i) => {
    history[dayKey(6 - i)] = { day: dayKey(6 - i), ...d };
  });
  for (const ago of [14, 21, 28]) {
    history[dayKey(ago)] = { day: dayKey(ago), reviews: 4, quizzes: 1, words: 2, dictation: 0, rush: 0, stories: 0 };
  }

  return {
    state: {
      userName: "آرش-قهرمان",
      onboarded: true,
      known,
      results,
      srs,
      mistakes: { "1:l1-v3": 2, "2:l2-v5": 1 },
      wordMistakes,
      wordSeen,
      history,
      // r323 — دفترچهٔ نبرد: شمارنده‌ها با رکوردها همخوان‌اند (3 برد / 2 باخت / 1 مساوی)
      duelWins: 3,
      duelLosses: 2,
      duelTies: 1,
      duelHistory: DUELS(),
      // r323 — واژه‌های منِ پُر: فهرست از starredWords میخواند (نه known) —
      // ۱۰ ستاره از سه درس، شاملِ واژه‌های خطرناک تا چیپهایِ ریسک هم رندر شوند
      starredWords: [
        "1:ability", "1:action", "1:age", "1:appropriate",
        "2:attend", "2:addiction", "2:asleep",
        "3:achieve", "3:accept", "3:advice",
      ],
    },
    version: 0,
  };
};

const ROOKIE = () => ({
  state: { userName: "آرش-تازه", onboarded: true },
  version: 0,
});

const name = process.argv[2] || "champion";
const builders = { champion: CHAMPION, rookie: ROOKIE };
const build = builders[name];
if (!build) {
  console.error(`unknown persona: ${name} (available: ${Object.keys(builders).join(" | ")})`);
  process.exit(1);
}
process.stdout.write(JSON.stringify(build()));
