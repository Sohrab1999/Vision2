// r337 — «هدرفول»: شخصیتِ r324 + دادهٔ کاملِ خانوادهٔ c-chip هدر.
//   پیشنهادِ ②ِ r336: چهار عضوِ دیگرِ خانوادهٔ c-chip (due/goal/freeze/
//   goal-done) در دسکتاپِ تاریک با دادهٔ پُر هرگز زندهسنجیده نشدهاند —
//   قفلِ خانوادهٔ r336 قفلِ «منبع» بود نه سنجشِ زنده.
//   کشفِ ابزاریِ ساختِ همین persona: r324 فقط کلیدهایِ "q:" (سؤالِ کنکور)
//   را میکارد ولی srsDueTotal عمداً "q:" را نادیده میگیرد (F11) → حبهٔ
//   مرور (c-chip-due) در هیچ persona-sویپی هرگز mount نشده بود؛ کلیدِ
//   واژه = wordKey(lessonId, en) = "1:ability" (progress.ts).
//   واریانتها (argv[2]):
//     full         — شعلهٔ ۶ + حبهٔ ۴ کارت سررسیده + هدفِ ۶/۱۰ + «۲ یخ»
//     goal-done    — همان + هدفِ ۱۰/۱۰ (شاخهٔ توپرِ زمردیِ جدا از c-chip-goal)
//     freeze-saved — freezeSavedDay=امروز → «نجات شد» (شاخهٔ saved)
//     empty        — زنجیرهٔ ۰/بیسررسید/بییخ → فقط GoalChip «۰ از ۱۰»
//   ساخت: node scripts/r337-persona.js [variant]  → JSON در stdout
//   نکتهٔ پایه: championِ r322 خودش دو سرآمدِ واژه دارد (1:action · 2:attend)
//   → شمارشِ نهاییِ حبه = ۶ (۴ واژهٔ تزریقی + ۲ سرآمدِ پایه)؛ empty رویِ
//   rookieِ r322 سوار میشود (تنها userName+onboarded — همهٔ چیپهایِ شرطی خاموش).
"use strict";

const { execFileSync } = require("child_process");
const path = require("path");

const DAY = 86400000;

const isoAt = (daysAgo, h = 15) => {
  const d = new Date(Date.now() - daysAgo * DAY);
  d.setHours(h, 12, 0, 0);
  return d.toISOString();
};

// کلیدِ روزِ ISO — همان قالبِ todayStr (ظهرِ محلی، مصون از DST)
const dayKey = (offsetDays = 0) => {
  const d = new Date(Date.now() - offsetDays * DAY);
  d.setHours(12, 0, 0, 0);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
};

const variant = process.argv[2] || "full";

// empty = یادگیرندهٔ واقعاً تازه (rookie) — بقیه = قهرمانِ r324
const base = JSON.parse(
  execFileSync(
    process.execPath,
    [path.join(__dirname, variant === "empty" ? "r322-persona.js" : "r324-persona.js"), ...(variant === "empty" ? ["rookie"] : [])],
    { encoding: "utf8" },
  ),
);

const st = base.state;
const TODAY = dayKey(0);
const BASE_OVERDUE = 2; // 1:action + 2:attend — سرآمدهایِ خودِ championِ r322

// ——— زنجیره: شعلهٔ هدر streak>0 میخواهد — lastActiveDay=امروز تا
//      هر تصادفِ activity هم زنجیره را نپاشد (applyStreak: امروز=نگهداشت) ———
if (variant !== "empty") {
  st.streak = 6;
  st.bestStreak = Math.max(st.bestStreak || 0, 9);
  st.lastActiveDay = TODAY;
}

// ——— حبهٔ مرور: کلیدِ واژهٔ واقعیِ درسِ ۱ (vocabulary lesson1.ts) —
//      srsDueTotal کلیدهایِ غیرِq: سررسیده را میشمارد ———
const DUE_WORDS = ["ability", "absolutely", "access", "across"];
if (variant !== "empty") {
  for (const w of DUE_WORDS) {
    st.srs[`1:${w}`] = { level: 1, dueAt: Date.now() - 20 * 60000 };
  }
}

// ——— dayStat: چیپ هدف (reviews+quizzes فقط؛ dailyGoal پیشفرض ۱۰) ———
//      empty: هیچ نمی‌کاریم — rookie بدونِ dayStat یعنی پیشفرضِ صفرِ استور
const mid = variant === "goal-done";
if (variant !== "empty") {
  st.dayStat = {
    day: TODAY,
    reviews: mid ? 8 : 4,
    quizzes: mid ? 2 : 2,
    words: 3,
    dictation: 1,
    rush: 0,
    stories: 0,
  };
}

// ——— یخ: stock («۲ یخ»، سقف ۲) یا saved («نجات شد») یا هیچ ———
if (variant === "full" || variant === "goal-done") {
  st.freezeCount = 2;
  st.freezeSavedDay = "";
} else if (variant === "freeze-saved") {
  st.freezeCount = 1;
  st.freezeSavedDay = TODAY;
}

// ——— گاردهایِ درونی: اگر شکلِ base دگرگون شده باشد همینجا بلند میشود ———
const wordDue = Object.keys(st.srs || {}).filter((k) => !k.startsWith("q:") && st.srs[k].dueAt <= Date.now()).length;
if (variant === "empty") {
  if ((st.streak || 0) !== 0) throw new Error("empty variant must keep streak=0");
  if (wordDue !== 0) throw new Error(`empty variant must have zero word due, got ${wordDue}`);
  if ((st.freezeCount || 0) !== 0) throw new Error("empty variant must have zero freeze");
  if (st.dayStat) throw new Error("empty variant must not plant dayStat");
} else {
  if (st.streak !== 6) throw new Error(`streak expected 6, got ${st.streak}`);
  if (wordDue !== DUE_WORDS.length + BASE_OVERDUE) {
    throw new Error(`word due expected ${DUE_WORDS.length + BASE_OVERDUE} (4 injected + 2 base), got ${wordDue}`);
  }
  if (st.lastActiveDay !== TODAY) throw new Error("lastActiveDay must be today");
}
if (variant === "goal-done" && st.dayStat.reviews + st.dayStat.quizzes !== 10) {
  throw new Error("goal-done requires 10/10 activity");
}
if (variant === "freeze-saved" && st.freezeSavedDay !== TODAY) {
  throw new Error("freeze-saved requires freezeSavedDay=today");
}

process.stdout.write(JSON.stringify(base));
