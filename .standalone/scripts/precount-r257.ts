// پیش‌شمارشِ ترمینالِ r257 — لنگرهایِ داده‌محور برایِ:
// ① لنزِ معکوسِ «فقط بی‌کاربرد» (ضمیمه) — per-table و per-scope
// ② سرشماریِ واژگانِ هر درس — «N از M واژه در جزوه» (تبِ واژگانِ درس)
// اجرا: bun scripts/precount-r257.ts
import { WORD_FAMILY_TABLES } from "../src/data/word-families";
import { lessons } from "../src/data";
import { findWordUsages, wordFamilyUsageCensus } from "../src/lib/word-usage";

console.log("=== ① جدول‌های خانواده — لنز معکوس ===");
const grades = ["همه", "دهم", "یازدهم", "دوازدهم"] as const;
for (const g of grades) {
  const tables = g === "همه" ? WORD_FAMILY_TABLES : WORD_FAMILY_TABLES.filter((t) => t.grade === g);
  let used = 0;
  let total = 0;
  for (const t of tables) {
    const c = wordFamilyUsageCensus(t.families);
    used += c.usedFamilies;
    total += c.totalFamilies;
  }
  console.log(`scope=${g}: tables=${tables.length} totalFam=${total} usedFam=${used} unusedFam=${total - used}`);
}
console.log("\n-- per-table (اولین ۵ جدول) --");
for (const t of WORD_FAMILY_TABLES.slice(0, 5)) {
  const c = wordFamilyUsageCensus(t.families);
  console.log(
    `${t.grade} · ${t.lesson}: total=${c.totalFamilies} used=${c.usedFamilies} unused=${c.totalFamilies - c.usedFamilies}`,
  );
}
// جدولِ کاملاً استفاده‌شده (برای ردیفِ خالیِ صادقانهٔ لنزِ معکوس)
const fullyUsed = WORD_FAMILY_TABLES.filter((t) => {
  const c = wordFamilyUsageCensus(t.families);
  return c.usedFamilies === c.totalFamilies;
});
console.log("\n-- جدول‌های کاملاً استفاده‌شده (empty-row anchor لنز معکوس) --");
for (const t of fullyUsed) {
  const c = wordFamilyUsageCensus(t.families);
  console.log(`${t.grade} · ${t.lesson}: ${c.usedFamilies}/${c.totalFamilies}`);
}
// لنگرِ جدولِ اولِ ضمیمه (دهم · درس اول) — بی‌کاربردها
const t0 = WORD_FAMILY_TABLES[0];
const c0 = wordFamilyUsageCensus(t0.families);
const unusedFams0 = t0.families.filter((_, fi) => !c0.usedFamilyIdx.includes(fi));
console.log(`\n-- بی‌کاربردهای جدولِ اول (${t0.grade} · ${t0.lesson}) --`);
console.log(unusedFams0.map((f) => f.noun || f.verb || f.adjective || f.adverb).join(", "));

console.log("\n=== ② سرشماری واژگان هر درس ===");
let sumUsed = 0;
let sumTotal = 0;
for (const l of lessons) {
  const used = l.vocabulary.filter((w) => findWordUsages(w.en).length > 0).length;
  sumUsed += used;
  sumTotal += l.vocabulary.length;
  console.log(`درس ${l.id}: ${used}/${l.vocabulary.length}`);
}
console.log(`Σ: ${sumUsed}/${sumTotal} (باید = ۱۹۱۵/۴۰۳۲ دیکشنری باشد)`);
