// r338 — «پاپ‌آورِ پُر»: شخصیتِ fullِ r337 + دادهٔ کاملِ دو پاپ‌آورِ هدر.
//   پیشنهادِ ②ِ r337: SettingsPopover و ProfilePopover در دسکتاپِ ۱۲۸۰ با
//   دادهٔ پُر هرگز سنجیده نشدهاند. درسِ r337: بخشهایِ شرطی بدونِ داده
//   mount نمیشوند — این persona سه لایهٔ شرطیِ پروفایل را میکارد:
//     ① رکوردِ «ادامهٔ مطالعه» (vision2-bg-last-item) + تاریخچهٔ ۳تایی
//        (vision2-bg-history) → کارتِ resume + ردیفهایِ اخیر + درهایِ حلقه
//     ② پشتیبانِ خودکار (vision2-auto-backup؛ {savedAt,counts,data}) →
//        کارتِ «پشتیبان خودکار: …» بهجایِ حالتِ خالیِ خطچین
//     ③ همگامسازی: عمداً بدونِ کد رها میشود (شاخهٔ create/join) — کاشتنِ
//        کدِ واقعی خطِ شبکه/ذخیرهٔ ابری را زنده میکند و پاکسازیِ DB را
//        میآلایَد؛ شاخهٔ attach و شواهدِ ابری به راندی با درگاهِ اختصاصی
//        موکول شد (اعترافِ صادقانهٔ پوشش، الگویِ r333).
//   شکلِ رکوردها از منبع: bg-reading.ts (parseResumeRaw: scope∈۵ لایه) ·
//   backup.ts (AutoBackup: savedAt+data؛ counts اختیاری در خواندن).
//   ساخت: node scripts/r338-persona.js → JSON در stdout
"use strict";

const { execFileSync } = require("child_process");
const path = require("path");

// پایه = fullِ r337 (زنجیره ۶ + حبهٔ ۶ کارت + هدف ۶/۱۰ + «۲ یخ»)
// درسِ راند: zustand-persist شکلِ `{state:{…},version}` میخواهد — کلِ خروجیِ
// persona باید کاشته شود نه `state` خام؛ وگرنه هیدرات به پیشفرضِ ناشناس برمیگردد
// (خودِ r337 خروجیِ کامل را میکاشت و کار میکرد — من واسطه را ناقص کردم).
const baseRaw = execFileSync(
  process.execPath,
  [path.join(__dirname, "r337-persona.js"), "full"],
  { encoding: "utf8" },
);
const base = JSON.parse(baseRaw);

const planted = {
  // ① ادامهٔ مطالعه + تاریخچه (رکوردهای parseResumeRaw-پسند: scope معتبر + id/title غیرخالی)
  resume: { scope: "verbs", id: "go-went-gone", title: "فعل بی‌قاعدهٔ go / went / gone", hint: "سطح ۲ از ۳" },
  history: [
    { scope: "grammar", id: "g-passive", title: "درسنامهٔ جامع — نکتهٔ Passive" },
    { scope: "phonetics", id: "ph-th", title: "جدول تلفظ — صدای /θ/" },
    { scope: "abbrev", id: "ab-e.g.", title: "نشانه‌های اختصاری — e.g. و i.e." },
  ],
  // ② پشتیبانِ خودکار — data از sanitizeAll میگذرد؛ known بهشکلِ نگاشتِ کلید→سطح
  auto: {
    savedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    counts: { known: 3, results: 2, srs: 4 },
    data: { known: { "1:ability": 2, "1:absolutely": 1, "2:attend": 2 } },
  },
};

const localStorageCommands = [
  ["vision2-study-v1", baseRaw], // کلِ خروجیِ persona — شکلِ persist-پسند
  ["vision2-bg-last-item", JSON.stringify(planted.resume)],
  ["vision2-bg-history", JSON.stringify(planted.history)],
  ["vision2-auto-backup", JSON.stringify(planted.auto)],
];

const out = {
  variant: "popovers-full",
  base: base.variant || "r337-full",
  state: base.state,
  planted,
  // فرمانِ آمادهٔ تزریق در مرورگر (الگویِ راندهای قبل — eval با JSONِ همین خروجی)
  browserEval: `(()=>{${localStorageCommands
    .map(([k, v]) => `localStorage.setItem(${JSON.stringify(k)}, ${JSON.stringify(v)});`)
    .join("")}localStorage.setItem('theme','light');location.reload();return 's';})()`,
};

// گاردهای درونی — الگویِ r337: خودِ اسکریپت ادعاهایش را تصدیق میکند
const assert = (cond, msg) => {
  if (!cond) {
    console.error("GUARD-FAIL: " + msg);
    process.exit(1);
  }
};
assert(base.state && base.state.streak === 6, "base full must have streak=6");
assert(planted.resume.scope === "verbs", "resume scope must be a valid appendix scope");
assert(planted.history.length === 3, "history must have exactly 3 rows");
assert(typeof planted.auto.data.known === "object", "auto backup must carry known map");
assert(Object.keys(planted.auto.data.known).length === 3, "auto known count=3 (matches counts.known)");

console.log(JSON.stringify(out, null, 0));
