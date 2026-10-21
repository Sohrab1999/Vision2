// پیش‌شمارشِ ترمینالِ r259 — لنگرهایِ داده‌محور برایِ:
// ① سهمِ بی‌کاربرد در پانوشتِ نوارِ مقایسه‌ای («جمعِ بی‌کاربردها: ۲۱۱۷»)
// ② badgeِ «بیشترینِ نسبت» — دو قهرمانِ دو مقیاس (شمارشِ درس ۱۰ در برابرِ نسبتِ درس ۷)
// ③ چیپِ کهرباییِ هدر → لنزِ «فقط بی‌کاربردها» (رفتار همان لنزِ r257 — لنگرها تکرار می‌شوند)
// اجرا: bun scripts/precount-r259.ts
import { lessons } from "../src/data";
import { lessonsVocabUsageRanking } from "../src/lib/word-usage";

const RANK = lessonsVocabUsageRanking();
const sumUsed = RANK.reduce((n, r) => n + r.usedWords, 0);
const sumTotal = RANK.reduce((n, r) => n + r.totalWords, 0);
console.log(`Σ: ${sumUsed}/${sumTotal} · unused=${sumTotal - sumUsed} (پانوشتِ دوم)`);

const maxUsed = Math.max(...RANK.map((r) => r.usedWords));
const maxUsedRows = RANK.filter((r) => r.usedWords === maxUsed);
console.log(`بیشترینِ شمارش: ${maxUsedRows.map((r) => "درس" + r.lessonId).join(",")} (${maxUsed}) — تعداد=${maxUsedRows.length}`);

const maxRatio = Math.max(...RANK.map((r) => r.usedWords / r.totalWords));
const maxRatioRows = RANK.filter((r) => r.usedWords / r.totalWords === maxRatio);
console.log(`بیشترینِ نسبت: ${maxRatioRows.map((r) => `درس${r.lessonId}(${r.usedWords}/${r.totalWords}=${(maxRatio * 100).toFixed(1)}%)`).join(" · ")} — تعداد=${maxRatioRows.length}`);

// آیا درسی هم قهرمانِ شمارش است هم قهرمانِ نسبت؟ (برخوردِ دو badge)
const both = RANK.filter((r) => r.usedWords === maxUsed && r.usedWords / r.totalWords === maxRatio);
console.log(`برخوردِ دو badge: ${both.length === 0 ? "هیچ (دو قهرمانِ جدا)" : both.map((r) => r.lessonId).join(",")}`);

// قهرمانِ نسبت در جفت‌هایِ سالمِ اعشاری — تساویِ کسری (a/b === c/d)
const ratios = RANK.map((r) => ({ id: r.lessonId, ratio: r.usedWords / r.totalWords })).sort((a, b) => b.ratio - a.ratio);
console.log("سهِ نخستِ نسبت:", ratios.slice(0, 3).map((x) => `درس${x.id}=${(x.ratio * 100).toFixed(1)}%`).join(" · "));
