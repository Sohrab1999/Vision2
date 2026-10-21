// پیش‌شمارشِ ترمینالِ r261 — لنگرهایِ داده‌محور برایِ:
// ① badgeِ کهرباییِ «بیرونی‌ترین» — قرینهٔ کهرباییِ «بیشترینِ» آسمانی: درسی با
//   بیشترین واژهٔ بیرون-از-متن (یگانگیِ قهرمان سنجیده شود)
// ② رتبهٔ سهمِ در-متن در tooltipِ هر سطر («رتبهٔ N از ۱۲») — رتبه‌بندیِ نسبتِ
//   usedWords/totalWords با سیاستِ تساویِ رقابتی (۱،۲،۲،۴)
// اجرا: bun scripts/precount-r261.ts
import { lessonsVocabUsageRanking } from "../src/lib/word-usage";

const RANK = lessonsVocabUsageRanking();

// ① شمارشِ بیرون-از-متنِ هر درس + یگانگیِ قهرمان
const unusedRows = RANK.map((r) => ({
  id: r.lessonId,
  used: r.usedWords,
  total: r.totalWords,
  unused: r.totalWords - r.usedWords,
  ratio: r.usedWords / r.totalWords,
}));
const maxUnused = Math.max(...unusedRows.map((r) => r.unused));
const unusedChampions = unusedRows.filter((r) => r.unused === maxUnused);
console.log("شمارشِ بیرون-از-متنِ هر ۱۲ درس:");
console.log(unusedRows.map((r) => `درس${r.id}: ${r.unused} (${r.used}/${r.total})`).join(" · "));
console.log(`→ قهرمانِ بیرون-از-متن: max=${maxUnused} · تعدادِ قهرمان‌ها=${unusedChampions.length} → درسِ ${unusedChampions.map((c) => c.id).join("،")}`);
console.log(`Σ بیرون-از-متن = ${unusedRows.reduce((n, r) => n + r.unused, 0)} (قفلِ r259: ۲۱۱۷)`);

// ② رتبهٔ نسبتِ در-متن (نزولی؛ تساویِ رقابتی: رتبهٔ برابر برایِ کسرِ برابر)
const sorted = [...unusedRows].sort((a, b) => b.ratio - a.ratio);
const rankOf = new Map<number, number>();
sorted.forEach((r, i) => {
  if (!rankOf.has(r.ratio)) rankOf.set(r.ratio, i + 1);
});
console.log("رتبهٔ سهمِ در-متنِ هر درس (نسبتِ شناور، تساویِ رقابتی):");
console.log(unusedRows.map((r) => `درس${r.id}: رتبهٔ ${rankOf.get(r.ratio)} (٪${(r.ratio * 100).toFixed(1)})`).join(" · "));
const ties = [...new Set(unusedRows.map((r) => r.ratio))].length !== 12;
console.log(`→ تساویِ نسبت وجود ${ties ? "دارد — گارد باید همهٔ هم‌رتبه‌ها را پوشش دهد" : "ندارد"}`);

// لنگرهایِ تست: درسِ ۷ (قهرمانِ نسبت، رتبهٔ ۱) و درسِ ۱ و درسِ ۱۰
for (const id of [1, 7, 10]) {
  const r = unusedRows.find((x) => x.id === id)!;
  console.log(`لنگرِ درسِ ${id}: unused=${r.unused} · ratio=${(r.ratio * 100).toFixed(1)}% · rank=${rankOf.get(r.ratio)}`);
}
