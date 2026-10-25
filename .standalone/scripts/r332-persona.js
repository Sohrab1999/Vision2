// r332 — «کتابخوان»: شخصیتِ r324 + دادهٔ کتابخانه — وصلهٔ کورفتِ راند.
//   کشفِ راند: personaهایِ r322/r323/r324 فقط state.history (فرمتِ کهنه)
//   را میکارد و dayHistory خالی میماند → چیپِ استریکِ کتابخانه
//   (aria-label="زنجیرهٔ روزهای خواندن داستان") در هیچ QAِ شخصیت‌داری
//   بیدار نشده بود؛ چیپهایِ done/«بعدیِ تو» هم به libraryDone وابستهاند
//   که هیچ personaیی نمیکاشت. این سازنده هر دو را تزریق میکند:
//     · libraryDone — پنج داستانِ خواندهٔ کتابِ ۱ (s1-1..s1-5) با
//       نمرههایِ مخلوط → چیپهایِ done + نوارِ پیشرفت + «بعدیِ تو» (s1-6)
//     · dayHistory = history — همان DayStatهایِ هفتهٔ r322؛ دو روزِ
//       استوری‌دار با شکافِ وسط → زنجیرهٔ current=0 · longest=1 →
//       چیپ با برچسبِ صادقِ «شروعِ زنجیرهٔ خواندن» بیدار میشود
//   ساخت: node scripts/r332-persona.js  → JSON در stdout
"use strict";

const { execFileSync } = require("child_process");
const path = require("path");

const base = JSON.parse(
  execFileSync(process.execPath, [path.join(__dirname, "r324-persona.js")], {
    encoding: "utf8",
  }),
);

const st = base.state;

// ——— پیشرفتِ کتابخانه: پنج داستانِ خواندهٔ کتابِ ۱ — «بعدیِ تو» = s1-6 ———
st.libraryDone = {
  "s1-1": { score: 5, total: 5, day: "2026-10-22" },
  "s1-2": { score: 4, total: 5, day: "2026-10-22" },
  "s1-3": { score: 5, total: 5, day: "2026-10-21" },
  "s1-4": { score: 3, total: 5, day: "2026-10-21" },
  "s1-5": { score: 4, total: 5, day: "2026-10-20" },
};

// ——— dayHistory: personaیِ پایه فقط «history» را میکارد — اسلایسِ
//      activity هر دو را دارد و storyStreak از dayHistory میخواند ———
if (!st.dayHistory && st.history && typeof st.history === "object") {
  st.dayHistory = st.history;
}

// ——— گاردِ درونی: personaیِ پایه باید همان شکلِ شناختهشده را بدهد ———
if (!st.history || !st.history["2026-10-22"] === undefined) {
  // کلیدِ دیروز باید در هفتهٔ r322 موجود باشد (storyStreak از دیروز راه میافتد)
  const keys = Object.keys(st.dayHistory || {});
  if (!keys.some((k) => k < "2026-10-23")) {
    throw new Error("r332-persona: dayHistory of base persona is empty — r322 shape changed?");
  }
}

process.stdout.write(JSON.stringify(base));
