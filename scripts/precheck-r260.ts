// پیش‌سنجهٔ r260 — واقعیت‌های داده برایِ «خروجی دامنهٔ لنز» (CSV/Anki) + رتبهٔ دیالوگ
import { lessons } from "../src/data";
import { findWordUsages, usedWordRank } from "../src/lib/word-usage";
import { buildAnkiTsv } from "../src/lib/anki-export";

interface Row {
  en: string;
  fa: string;
  lessonId: number;
  count: number;
}

const all = lessons.flatMap((l) => l.vocabulary.map((w) => ({ ...w, lessonId: l.id })));

// دامنهٔ باریک‌شدهٔ هر آستانه — همان فیلترِ filtered در لنز (بی‌جستجو)
for (const t of [0, 5, 10, 20]) {
  const rows: Row[] = all
    .filter((w) => {
      const c = findWordUsages(w.en).length;
      return c > 0 && c >= t;
    })
    .map((w) => ({ en: w.en, fa: w.fa, lessonId: w.lessonId, count: findWordUsages(w.en).length }));
  console.log(`domain>=${t}: ${rows.length} cards`);
}

// دامنهٔ درس ۱ + آستانهٔ ۲۰ — مرتب‌شدهٔ نزولیِ پایدار (سیمِ sortUsed)
const l1t20 = all
  .filter((w) => w.lessonId === 1)
  .map((w) => ({ en: w.en, fa: w.fa, count: findWordUsages(w.en).length }))
  .filter((r) => r.count >= 20)
  .sort((a, b) => b.count - a.count);
console.log("lesson1&>=20:", l1t20.length, "cards —", l1t20.map((r) => `${r.en}:${r.count}`).join(" | "));

// هم‌نامی داخلِ دامنهٔ کاملِ کاربرددار — پیش‌شرطِ ددوپِ Anki
const usedRows = all.filter((w) => findWordUsages(w.en).length > 0);
const keyOf = (en: string) => en.trim().toLowerCase();
const seen = new Set<string>();
let homonymCards = 0;
for (const w of usedRows) {
  if (seen.has(keyOf(w.en))) homonymCards++;
  else seen.add(keyOf(w.en));
}
console.log(`used cards: ${usedRows.length}, unique: ${seen.size}, homonym-extra-cards: ${homonymCards}`);

// Anki از دامنهٔ باریک‌شده — count باید = unique باشد (ددوپِ ایدئومِ موجود)
const anki = buildAnkiTsv(usedRows);
console.log(`anki(full used): count=${anki.count} (expect ${seen.size})`);
console.log("anki header:", JSON.stringify(anki.tsv.split("\n").slice(0, 3).join("⏎")));

// رتبه‌ها برایِ دیالوگ — of/you/it/are + یک واژهٔ مرزی
for (const en of ["of", "you", "it", "are", "communication", "language"]) {
  const r = usedWordRank(en);
  console.log(`rank(${en}):`, r ? `${r.rank} از ${r.total} (count=${r.count})` : "null");
}
// پیش‌شرط: واژهٔ کاربرددار همیشه رتبه دارد؛ صفر-سایت null
const allRanked = usedRows.every((w) => usedWordRank(w.en) !== null);
console.log("every used card has rank:", allRanked);

// نیازِ escape در CSV — کاما/کوتیشن/نیولاین در fa و enِ دامنه
const needsEscape = usedRows.filter((r) => /["\n]/.test(r.en + r.fa) || (r.en + r.fa).includes(","));
console.log("rows needing quotes:", needsEscape.length);
for (const r of needsEscape.slice(0, 4)) console.log("  e.g.:", JSON.stringify(r.en), "→", JSON.stringify(r.fa));
// تب در fa — تهدیدِ TSV
const tabInFa = usedRows.filter((r) => /[\t\r\n]/.test(r.fa));
console.log("fa rows with tab/cr/nl:", tabInFa.length);
