// r325 — «تقویمِ ۳۰روزهٔ پُر»: شخصیتِ r324 + تاریخچهٔ کاملِ هر ۳۰ روز.
//   پیشنهادِ ②ِ r324: نمایِ ماهانه (نقشهٔ حرارتیِ ۳۰خانه) هرگز در حالتِ پُر
//   سنجیده نشده — r322 فقط چهار badge-cardِ درخش را در همین نما دید. lastNDays
//   مجموعِ روز را از reviews+quizzes میسازد (day-engine.ts:186) — پس الگویِ
//   ۳۰روزه باید فقط با همین دو فیلد، هر چهار باندِ حرارتی را بپوشاند:
//     ≤3 → emerald-200 · 4-7 → emerald-400 · 8-12 → emerald-600 · 13+ → emerald-800
//   + یک روزِ «سه‌رقمی» (۱۱۹) برایِ آزمونِ لبهٔ رقمِ درونِ خانهٔ ~29px
//   + libraryDone (سه داستانِ واقعیِ s1/s1-1/s2) تا چیپِ «داستان ۳۰روزه» هم پُر شود.
//   ساخت: node scripts/r325-persona.js  → JSON در stdout
"use strict";

const { execFileSync } = require("child_process");
const path = require("path");

const DAY = 86400000;

// ——— قهرمانِ پایه از r324 (تکمنبع — بازتولیدِ داده ممنوع) ———
const base = JSON.parse(
  execFileSync(process.execPath, [path.join(__dirname, "r324-persona.js"), "champion"], {
    encoding: "utf8",
  }),
);

const st = base.state;

// ——— الگویِ ۳۰روزه: [مرور، آزمون] برایِ daysAgo 29..0 — پوششِ هر چهار باند ———
// b1=۷ روز · b2=۸ روز · b3=۸ روز · b4=۷ روز — مجموع=۳۵۷ (میانگین≈۱۱٫۹ → «۱۲»)
// ago8 عمداً سه‌رقمی است: 99+20=۱۱۹ (روزِ مرورِ سنگین) — لبهٔ رقمِ درونِ خانه.
const PATTERN = [
  [2, 1], [5, 2], [10, 3], [1, 1], [8, 2], [4, 2], [12, 4], [2, 1], // 29..22
  [9, 3], [5, 1], [1, 2], [11, 2], [6, 2], [3, 1], [14, 4], [2, 1], // 21..14
  [10, 2], [4, 3], [1, 1], [9, 2], [5, 1], [99, 20], [12, 3], [6, 2], // 13..6
  [4, 2], [1, 2], [10, 3], [7, 2], [5, 2], [9, 3], // 5..0
];

const dayKey = (daysAgo) => {
  const d = new Date(Date.now() - daysAgo * DAY);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const history = {};
const bandOf = (t) => (t <= 3 ? 1 : t <= 7 ? 2 : t <= 12 ? 3 : 4);
const bands = { 1: 0, 2: 0, 3: 0, 4: 0 };
let monthTotal = 0;
PATTERN.forEach(([reviews, quizzes], idx) => {
  const ago = 29 - idx;
  const total = reviews + quizzes;
  bands[bandOf(total)]++;
  monthTotal += total;
  history[dayKey(ago)] = {
    day: dayKey(ago),
    reviews,
    quizzes,
    words: 0,
    dictation: 0,
    rush: 0,
    stories: 0,
  };
});
st.history = history;

// ——— سه داستانِ تمامشده (شناسههای واقعیِ hill-stories — آزمونِ قفل دوباره
//      تطبیق میدهد) → چیپِ «داستان ۳۰روزه» = ۳ و «داستان این هفته» = ۱ ———
const dayAgoIso = (ago) => dayKey(ago);
st.libraryDone = {
  "s1-1": { score: 5, total: 6, day: dayAgoIso(2) },
  "s1-2": { score: 4, total: 6, day: dayAgoIso(9) },
  "s2-1": { score: 6, total: 6, day: dayAgoIso(20) },
};

// ——— گاردِ درونی: اگر الگو یا حسابداری از انتظار دور شود، ساخت شخصیت بلند میشود ———
const keys = Object.keys(history);
if (keys.length !== 30) throw new Error(`history expected 30 days, got ${keys.length}`);
if (new Set(keys).size !== 30) throw new Error("history day keys are not unique");
for (const [k, v] of Object.entries(history))
  if (v.reviews + v.quizzes < 1) throw new Error(`day ${k} is not active (total<1)`);
if (bands[1] !== 7 || bands[2] !== 8 || bands[3] !== 8 || bands[4] !== 7)
  throw new Error(`band coverage drifted: b1=${bands[1]} b2=${bands[2]} b3=${bands[3]} b4=${bands[4]} (expect 7/8/8/7)`);
if (monthTotal !== 357) throw new Error(`monthTotal expected 357, got ${monthTotal}`);
const threeDigit = Object.values(history).filter((d) => d.reviews + d.quizzes >= 100).length;
if (threeDigit !== 1) throw new Error(`expected exactly one 3-digit day, got ${threeDigit}`);
const stories = Object.keys(st.libraryDone).length;
if (stories !== 3) throw new Error(`libraryDone expected 3 stories, got ${stories}`);

process.stdout.write(JSON.stringify(base));
