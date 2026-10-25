// پیش‌شمارشِ ترمینالِ r258 — لنگرهایِ داده‌محور برایِ:
// ① چیپِ کهرباییِ «بی‌کاربرد» رویِ هدرِ جدول‌ها (بندِ ① پیشنهادِ ۲۵۷)
// ② نوارِ مقایسه‌ایِ ۱۲ درسی (بندِ ③ پیشنهادِ ۲۵۷) — lessonsVocabUsageRanking
// اجرا: bun scripts/precount-r258.ts
import { WORD_FAMILY_TABLES } from "../src/data/word-families";
import { lessons } from "../src/data";
import { findWordUsages, wordFamilyUsageCensus, lessonVocabUsageCensus } from "../src/lib/word-usage";

console.log("=== ① سرشماریِ بی‌کاربردِ هدرِ جدول‌ها (چیپ کهربایی) ===");
let chipTables = 0;
let hiddenTables = 0;
for (const t of WORD_FAMILY_TABLES) {
  const c = wordFamilyUsageCensus(t.families);
  const unused = c.totalFamilies - c.usedFamilies;
  if (unused > 0) chipTables++;
  else hiddenTables++;
}
console.log(`جدول‌های چیپ‌دار (unused>0): ${chipTables} · جدول‌های بی‌چیپ (صداقت صفر): ${hiddenTables}`);

const t0 = WORD_FAMILY_TABLES[0];
const c0 = wordFamilyUsageCensus(t0.families);
const unusedFams0 = t0.families.filter((_, fi) => !c0.usedFamilyIdx.includes(fi));
console.log(`جدول اول (${t0.grade} · ${t0.lesson}): ${c0.totalFamilies - c0.usedFamilies} از ${c0.totalFamilies} بی‌کاربرد — ${unusedFams0.map((f) => f.noun || f.verb || f.adjective || f.adverb).join(", ")}`);

// جدول‌های مرزی — کمترین/بیشترین بی‌کاربرد
let minUnused = Infinity;
let maxUnused = -1;
for (const t of WORD_FAMILY_TABLES) {
  const c = wordFamilyUsageCensus(t.families);
  const unused = c.totalFamilies - c.usedFamilies;
  minUnused = Math.min(minUnused, unused);
  maxUnused = Math.max(maxUnused, unused);
}
console.log(`minUnused=${minUnused} · maxUnused=${maxUnused}`);

console.log("\n=== ② رتبه‌بندی ۱۲ درسی (lessonsVocabUsageRanking) ===");
let sumUsed = 0;
let sumTotal = 0;
const rows: { id: number; title: string; used: number; total: number }[] = [];
for (const l of lessons) {
  const c = lessonVocabUsageCensus(l.vocabulary);
  sumUsed += c.usedWords;
  sumTotal += c.totalWords;
  rows.push({ id: l.id, title: l.titleFa, used: c.usedWords, total: c.totalWords });
  console.log(`درس ${l.id} (${l.titleFa}): ${c.usedWords}/${c.totalWords} = ${((c.usedWords / c.totalWords) * 100).toFixed(1)}%`);
}
console.log(`Σ: ${sumUsed}/${sumTotal}`);
const maxUsed = Math.max(...rows.map((r) => r.used));
const maxRows = rows.filter((r) => r.used === maxUsed);
console.log(`بیشترین: ${maxRows.map((r) => `درس ${r.id} (${r.used})`).join(" · ")} — تعدادِ برابرِ صدر: ${maxRows.length}`);
const minRow = rows.reduce((a, b) => (b.used / b.total < a.used / a.total ? b : a));
console.log(`کمترین نسبت: درس ${minRow.id} (${minRow.used}/${minRow.total} = ${((minRow.used / minRow.total) * 100).toFixed(1)}%)`);
// لنگرِ هم‌مقیاسی: کلیکِ ردیفِ درس ۱ با لنزِ کاربرددار دیکشنری باید دقیقاً
// همان used درس ۱ را بیاورد (کارت‌ها — هم‌نام‌ها هم کارت‌اند)
const l1 = lessons.find((l) => l.id === 1)!;
const l1c = lessonVocabUsageCensus(l1.vocabulary);
console.log(`لنگرِ کلیکِ ردیف: درس ۱ → فیلترِ درس+کاربرددار باید دقیقاً ${l1c.usedWords} کارت بیاورد (از ${l1c.totalWords})`);
// صفرِ صادقانه در سطحِ درس؟
const zeroLessons = rows.filter((r) => r.used === 0);
console.log(`درس‌های بی‌واژهٔ کاربرددار (بی‌نوار): ${zeroLessons.length ? zeroLessons.map((r) => r.id).join(",") : "هیچ"}`);
// تأییدِ متنِ برنامه: درس‌ها 1..12 صعودی
console.log(`ترتیبِ lessonId: ${rows.map((r) => r.id).join(",")}`);
// سازگاریِ findWordUsages مستقیم با سرشماری (تک‌منبع)
const sample = l1.vocabulary[0];
console.log(`نمونه: ${sample.en} → sites=${findWordUsages(sample.en).length}`);
