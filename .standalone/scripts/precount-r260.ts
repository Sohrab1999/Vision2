// پیش‌شمارشِ ترمینالِ r260 — لنگرهایِ داده‌محور برایِ:
// ① «میانگینِ سهمِ درس‌ها» در تیترِ پنل — میانگینِ سادهٔ ۱۲ نسبت (مقیاسِ متفاوت از سهمِ کلِ پیکره)
// ② Shift+کلیکِ سطر → لنزِ کهرباییِ «بیرون-از-متن» همان درس (لنگرِ درسِ ۷: ۱۰۵−۷۳=۳۲)
// ③ سهمِ بیرون-از-متن در tooltipِ سطرها (٪بیرون از متن برای هر درس)
// اجرا: bun scripts/precount-r260.ts
import { lessonsVocabUsageRanking } from "../src/lib/word-usage";

const RANK = lessonsVocabUsageRanking();
const sumUsed = RANK.reduce((n, r) => n + r.usedWords, 0);
const sumTotal = RANK.reduce((n, r) => n + r.totalWords, 0);

// ① میانگینِ سادهٔ نسبت‌ها (بدونِ وزن‌دهیِ اندازهٔ درس) در برابرِ سهمِ کلِ پیکره
const avgRatio = RANK.reduce((n, r) => n + r.usedWords / r.totalWords, 0) / RANK.length;
const pooledRatio = sumUsed / sumTotal;
console.log(`میانگینِ سادهٔ ۱۲ نسبت: ${(avgRatio * 100).toFixed(1)}% · سهمِ کلِ پیکره: ${(pooledRatio * 100).toFixed(1)}%`);
console.log(`  → یک‌رقمِ اعشار: avg=${(Math.round(avgRatio * 1000) / 10)} · pooled=${(Math.round(pooledRatio * 1000) / 10)}`);

// ③ سهمِ بیرون-از-متنِ هر درس (مکملِ گردشده — برایِ tooltip)
const rows = RANK.map((r) => ({
  id: r.lessonId,
  used: r.usedWords,
  total: r.totalWords,
  usedPct: Math.round((r.usedWords / r.totalWords) * 100),
  unusedPct: Math.round(((r.totalWords - r.usedWords) / r.totalWords) * 100),
}));
console.log("سهمِ بیرون-از-متنِ هر ۱۲ درس:");
console.log(rows.map((r) => `درس${r.id}: ٪${r.unusedPct} بیرون (${r.used}/${r.total})`).join(" · "));

// ② لنگرِ Shift+کلیکِ درسِ ۷ — بیرون-از-متن = ۱۰۵ − ۷۳ = ۳۲
const l7 = RANK.find((r) => r.lessonId === 7)!;
console.log(`درسِ ۷: used=${l7.usedWords} · total=${l7.totalWords} · بیرون-از-متن=${l7.totalWords - l7.usedWords}`);
const l1 = RANK.find((r) => r.lessonId === 1)!;
console.log(`درسِ ۱: used=${l1.usedWords} · total=${l1.totalWords} · بیرون-از-متن=${l1.totalWords - l1.usedWords}`);

// مجموعِ کلِ بیرون-از-متن (باید ۲۱۱۷ — قفلِ r259)
console.log(`Σ بیرون-از-متن: ${sumTotal - sumUsed}`);
