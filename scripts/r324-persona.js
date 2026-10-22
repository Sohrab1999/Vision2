// r324 — «قهرمان در گوشهٔ کنکور»: شخصیتِ r323 + دادهٔ کاملِ کنکور و اشتباهاتِ آزمون جامع.
//   پیشنهادِ ②ِ r323: سه کورسویِ باقیمانده فقط «خالی» دیده بودند:
//     A. گوشهٔ کنکور با bestCover/bestHard — results["0:konkur"/"0:konkur-hard"/
//        "0:konkur-cover"] + konkurSeen (۹۶ دیده از بانک ۳۶۰تایی) + konkurWrong
//        (۸ خطایِ باز) → پنج KPIِ hero، نقشهٔ ۳۶۰خانهای، لجند، رکوردِ سه ModeCard
//     B. CTAِ «مرور اشتباهات آزمون جامع» — mistakes["0:x-*"] > 0 لازم است
//        (exam-view: مرورِ اشتباهاتِ بانکِ ۳۶۰تایی)
//     C. مرور سررسیدِ کنکور — SRS با کلیدِ "q:x-*" (srsQuestionDueIds:startsWith q:)
//   ساخت: node scripts/r324-persona.js  → JSON در stdout
//   بانک: src/data/exam.ts — شناسهها "x-1".."x-360" (Q("x-N", ...)).
"use strict";

const { execFileSync } = require("child_process");
const path = require("path");

const DAY = 86400000;
const HOUR = 3600000;

const isoAt = (daysAgo, h = 15) => {
  const d = new Date(Date.now() - daysAgo * DAY);
  d.setHours(h, 12, 0, 0);
  return d.toISOString();
};

// ——— قهرمانِ پایه از r323 (تکمنبع — بازتولیدِ داده ممنوع) ———
const base = JSON.parse(
  execFileSync(process.execPath, [path.join(__dirname, "r323-persona.js"), "champion"], {
    encoding: "utf8",
  }),
);

const st = base.state;

// ——— A: بانکِ دیدهشده (۹۶ از ۳۶۰ → پوششِ ~۲۷٪) ———
const konkurSeen = {};
for (let i = 1; i <= 96; i++) konkurSeen[`x-${i}`] = true;

// ——— ۸ خطایِ باز داخلِ دیدهشدهها (مسلط = ۹۶−۸ = ۸۸) ———
const WRONG = ["x-5", "x-12", "x-23", "x-34", "x-47", "x-58", "x-61", "x-77"];
const konkurWrong = {};
for (const id of WRONG) konkurWrong[id] = true;

// ——— رکوردهایِ سه مد (منبعِ «رکورد: NN٪» در ModeCardها و KPIِ پنجمِ hero) ———
st.results["0:konkur"] = { correct: 28, total: 30, percent: 93, at: isoAt(1) };
st.results["0:konkur-hard"] = { correct: 7, total: 12, percent: 58, at: isoAt(3) };
st.results["0:konkur-cover"] = { correct: 19, total: 20, percent: 95, at: isoAt(2) };

// ——— B: اشتباهاتِ آزمون جامع — دو تستِ بانک (هر دو داخلِ konkurWrong هم؛
//         hardIdsOf: mistakes["0:x-5"] → "x-5" — مجموعهٔ سخت دستنخورده میماند) ———
st.mistakes["0:x-5"] = 3;
st.mistakes["0:x-23"] = 2;

// ——— C: دو سؤالِ سررسیدِ SRS (KPIِ «مرور سررسید» = ۲ + هشدارِ «الان وقت مرور است!») ———
st.srs["q:x-5"] = { level: 0, dueAt: Date.now() - 2 * HOUR };
st.srs["q:x-12"] = { level: 1, dueAt: Date.now() - 10 * 60000 };

st.konkurSeen = konkurSeen;
st.konkurWrong = konkurWrong;

// ——— گاردِ درونی: ثابتهایِ حسابداریِ کنکور — اگر base دگرگون شده باشد اینجا بلند میشود ———
const seen = Object.keys(st.konkurSeen).length;
const wrong = Object.keys(st.konkurWrong).length;
const hardUnique = new Set([
  ...WRONG,
  ...Object.keys(st.mistakes).filter((k) => k.startsWith("0:")).map((k) => k.slice(2)),
]);
if (seen !== 96) throw new Error(`konkurSeen expected 96, got ${seen}`);
if (wrong !== 8) throw new Error(`konkurWrong expected 8, got ${wrong}`);
if (hardUnique.size !== 8) throw new Error(`hard set expected 8 unique, got ${hardUnique.size}`);
if (st.results["0:konkur"].percent !== 93) throw new Error("konkur sim best drifted");
const dueQ = Object.keys(st.srs).filter((k) => k.startsWith("q:")).length;
if (dueQ !== 2) throw new Error(`q: SRS entries expected 2, got ${dueQ}`);

process.stdout.write(JSON.stringify(base));
