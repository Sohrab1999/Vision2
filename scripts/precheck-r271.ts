/**
 * پیش‌سنجهٔ r271 — قفلِ لنگرهایِ دو فیچرِ راند:
 * ① جمعیتِ نوارِ دریلِ درسنامه (بندِ ② پیشنهادِ r270): «از N نامزد» =
 *    scopeChipCount(grScope) = |grammarExampleCandidates(scope ∩ threshold)|
 *    — دوقلو-سازگار با چیپ‌هایِ r265/r268 (یک سیم، دو نام‌گذاری).
 * ② پسوندِ دامنهٔ توست‌هایِ لنز (بندِ ③ پیشنهادِ r270): lensDomainLabel —
 *    همان ایدئومِ suffixِ عنوان‌ها (درس · آستانه).
 */
import { lessons } from "../src/data";
import { grammarExampleCandidates, GRAM_DRILL_THRESHOLDS } from "../src/lib/live-words-quiz";

console.log("=== ① استخرهایِ دریلِ درسنامه (دامنه × آستانه) ===");
const all = grammarExampleCandidates(lessons);
console.log(`همه (بدون آستانه) = ${all.length}`);
for (const t of GRAM_DRILL_THRESHOLDS) {
  console.log(`همه × ${t}+ = ${all.filter((c) => c.count >= t).length}`);
}
for (const l of lessons) {
  const pool = grammarExampleCandidates([l]);
  const row = GRAM_DRILL_THRESHOLDS.map(
    (t) => `${t}+:${pool.filter((c) => c.count >= t).length}`
  ).join(" ");
  console.log(`L${l.id}: pool=${pool.length} | ${row}`);
}

console.log("\n=== ② لنگرهایِ lensDomainLabel ===");
const label = (lf: number | null, mu: number) => {
  const lessonPart = lf ? `درس ${lf}` : "";
  const thrPart = mu > 0 ? `واژه‌هایِ ${mu}+ کاربرد` : "";
  return [lessonPart, thrPart].filter(Boolean).join(" · ");
};
console.log(`(null,0)  -> "${label(null, 0)}"   (منتظر: "" — نبودِ صادقانه)`);
console.log(`(3,0)     -> "${label(3, 0)}"`);
console.log(`(null,10) -> "${label(null, 10)}"`);
console.log(`(3,10)    -> "${label(3, 10)}"`);
console.log(`(12,20)   -> "${label(12, 20)}"`);

console.log("\n=== ③ شمارشِ shownِ لنز برایِ لنگرِ توست (تقریبِ سیمِ shown) ===");
// shown = واژگانِ همهٔ درس‌ها (پیش‌فرضِ state=all) — فقط برایِ فهمِ مقیاسِ ردیف‌ها
let totalVocab = 0;
for (const l of lessons) totalVocab += l.vocabulary.length;
console.log(`جمعِ واژگانِ ۱۲ درس = ${totalVocab} (ددوپ در کامپوننت با allWords/usedSet)`);

console.log("\n=== ④ لنگرهایِ Anki (ددوپِ en) ===");
import { findWordUsages } from "../src/lib/word-usage";
const allRows = lessons.flatMap((l) => l.vocabulary);
const distinctEn = new Set(allRows.map((w) => w.en.trim().toLowerCase())).size;
const min10Rows = allRows.filter((w) => findWordUsages(w.en).length >= 10);
const min10Distinct = new Set(min10Rows.map((w) => w.en.trim().toLowerCase())).size;
console.log(`CSV پیش‌فرض = ${allRows.length} ردیف | Anki پیش‌فرض = ${distinctEn} کارت (هم‌نام‌ها: ${allRows.length - distinctEn} → پرانتز حاضر)`);
console.log(`CSV ۱۰+ = ${min10Rows.length} ردیف | Anki ۱۰+ = ${min10Distinct} کارت (پرانتز: ${min10Rows.length > min10Distinct ? "حاضر" : "غایب"})`);
// چند واژهٔ هم‌نامِ بین‌درسیِ حاضر در ۱۰+ — برایِ روایتِ پیمان
const seen10 = new Map<string, number>();
for (const w of min10Rows) {
  const k = w.en.trim().toLowerCase();
  seen10.set(k, (seen10.get(k) ?? 0) + 1);
}
const dups10 = [...seen10.entries()].filter(([, n]) => n > 1);
console.log(`هم‌نام‌هایِ ۱۰+: ${dups10.map(([k, n]) => `${k}×${n}`).join("، ")}`);
