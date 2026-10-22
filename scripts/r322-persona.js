// r322 — سازندهٔ «شخصیت‌های داده» برای seedِ پنل‌های hasProgress.
//   درسِ r321: بزرگترین کورسوها شرطی‌اند — پنلی که فقط برایِ یادگیرندهٔ دارایِ
//   پیشرفت رندر میشود با seedِ تازه هرگز دیده نمیشود؛ r319 home-progress فقط
//   known:{book:true} داد (پنل‌ها «خالی» میآمدند). این ابزار حالتِ «پُر» میسازد:
//   قهرمان = ۳۰ واژهٔ بلد + نتایج آزمون هفتگی + SRS (با سرآمد) + واژه‌های خطرناک
//   + هفت روزِ تاریخچهٔ فعال (نمودار هفتگی/حرارتی ۳۰روزه با دادهٔ واقعی).
//   کلیدها با فرمتِ رسمیِ استور:
//     known/srs  → wordKey  = `${lessonId}:${en.toLowerCase()}`  (state/progress.ts:8)
//     results    → resultKey = `${lessonId}:${category}`           (state/progress.ts:9)
//     history    → todayStr  = `YYYY-MM-DD` محلی                  (state/day-engine.ts:16)
//   واژه‌ها با فهرستِ واقعیِ درسها تصدیق شده‌اند (lesson1/2/3.ts) — قفلِ آزمونِ
//   r322 هر واژه را دوباره به دادهٔ درس تطبیق میدهد تا انحرافِ واژگان، seed را
//   بیاثر نکند (wordByKeyِ stale را drop میکند — درسِ درونِ word-risk.ts).
// مصرف: node scripts/r322-persona.js [champion|rookie]  → JSON در stdout
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

// واژه‌های واقعیِ درسها (تصدیق‌شده در lesson1/2/3.ts — آزمونِ قفل دوباره چک میکند)
const CHAMPION_WORDS = {
  1: ["ability", "absolutely", "access", "across", "action", "add", "additional", "afraid", "age", "always", "amazing", "amount", "appropriate", "artist", "available", "belief"],
  2: ["a bit", "active", "activity", "addict", "addictive", "addiction", "all right", "anti-cancer", "asleep", "attend"],
  3: ["accept", "according to", "achieve", "actually", "advice", "agree", "amazed", "amused", "antonym", "appreciate"],
};

const CHAMPION = () => {
  const known = {};
  for (const [ls, words] of Object.entries(CHAMPION_WORDS))
    for (const w of words) known[`${ls}:${w.toLowerCase()}`] = true;

  // SRS — دو سرآمدِ امروز (پنلِ SRS + پیشبینیِ بار) و بقیه در آینده
  const now = Date.now();
  const srs = {
    "1:action": { level: 2, dueAt: now - 2 * 3600000 },      // سرآمد
    "2:attend": { level: 0, dueAt: now - 600000 },           // سرآمد
    "3:achieve": { level: 3, dueAt: now + 2 * DAY },
    "1:age": { level: 4, dueAt: now + 5 * DAY },
    "2:asleep": { level: 1, dueAt: now + 6 * 3600000 },
    "3:accept": { level: 2, dueAt: now + DAY },
  };

  // نتایج آزمون — هر مهارتِ SKILL_DEFS حداقل یک ردیف بگیرد
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
  };

  // واژه‌های خطرناک — آستانهٔ word-risk: seen>=2 یا mistakes>=2، کلیدِ زنده
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

  // هفت روزِ فعال با الگویِ متنوع + دو خال در حرارتیِ ۳۰روزه
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
  // دو نقطهٔ دورتر برای نقشهٔ حرارتیِ ماهانه (۳۰روزه)
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
