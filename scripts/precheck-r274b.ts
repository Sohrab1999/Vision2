// ریز-بررسیِ لهجه: ASCII , و " جدا از گیومهٔ خمیده/«»
import { BOOKLET_GRAMMAR_TOPICS } from "../src/data/booklet-grammar";
const rows = BOOKLET_GRAMMAR_TOPICS.flatMap((t) => (t.examples ?? []).map((ex) => ({ topic: t.title, source: t.source, page: t.page, en: ex.en, fa: ex.fa, tag: ex.tag ?? "" })));
const fields = ["en", "fa", "tag", "topic", "source", "page"] as const;
for (const f of fields) {
  const asciiComma = rows.filter((r) => r[f].includes(",")).length;
  const asciiQuote = rows.filter((r) => r[f].includes('"')).length;
  const curly = rows.filter((r) => /[“”‘’«»]/.test(r[f])).length;
  console.log(`${f}: ascii-comma=${asciiComma} ascii-quote=${asciiQuote} curly/guillemet=${curly}`);
}
// چند نمونهٔ انگلیسیِ ویرگول‌دار
console.log("\nنمونه‌ها:");
rows.filter((r) => r.en.includes(",")).slice(0, 3).forEach((r) => console.log("  EN:", r.en.slice(0, 80)));
rows.filter((r) => r.en.includes('"')).slice(0, 2).forEach((r) => console.log('  QUOTE:', r.en.slice(0, 80)));
// dup جزئیات — کدام موضوع‌ها
const seen = new Map<string, string[]>();
for (const r of rows) seen.set(r.en, [...(seen.get(r.en) ?? []), r.topic]);
console.log("\ndup topics:");
for (const [s, ts] of seen) if (ts.length > 1) console.log(`  "${s.slice(0, 45)}" → ${ts.join(" + ")}`);
