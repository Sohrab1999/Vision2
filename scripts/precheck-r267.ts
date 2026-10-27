// ------------------------------------------------------------------
// پیش‌سنجهٔ r267 — دامنهٔ درس برای دریل مثال‌های درسنامه + سطح در دیالوگ
// نامزدهای مثال‌دارِ هر درس (کل و در آستانه‌ها) — آیا درسی نامزدِ صفر دارد؟
// ------------------------------------------------------------------
import { lessons } from "../src/data";
import { findWordUsages, wordFormRegex } from "../src/lib/word-usage";
import { BOOKLET_GRAMMAR_TOPICS } from "../src/data/booklet-grammar";

const BG_EXAMPLES: { en: string }[] = BOOKLET_GRAMMAR_TOPICS.flatMap((t) =>
  (t.examples ?? []).map((ex) => ({ en: ex.en }))
);
console.log("bg examples =", BG_EXAMPLES.length);

function candidates(scope: typeof lessons, minCount = 0): { en: string; count: number }[] {
  const seen = new Set<string>();
  const out: { en: string; count: number }[] = [];
  for (const l of scope) {
    for (const w of l.vocabulary) {
      const k = w.en.toLowerCase();
      if (seen.has(k)) continue;
      seen.add(k);
      if (!BG_EXAMPLES.some((ex) => wordFormRegex(w.en).test(ex.en))) continue;
      const count = findWordUsages(w.en).length;
      if (minCount > 0 && count < minCount) continue;
      out.push({ en: w.en, count });
    }
  }
  return out.sort((a, b) => b.count - a.count);
}

const full = candidates(lessons);
console.log("full =", full.length, "| t5 =", full.filter((c) => c.count >= 5).length, "| t10 =", full.filter((c) => c.count >= 10).length, "| t20 =", full.filter((c) => c.count >= 20).length);

for (const l of lessons) {
  const c = candidates([l]);
  const c5 = candidates([l], 5).length;
  const c10 = candidates([l], 10).length;
  const c20 = candidates([l], 20).length;
  console.log(`L${l.id} "${l.titleFa}": vocab=${l.vocabulary.length} candidates=${c.length} 5+=${c5} 10+=${c10} 20+=${c20} top=${c[0]?.en}·${c[0]?.count}`);
}

// چند لنگر برای دیالوگِ سطح
for (const w of ["of", "language", "communication", "ability"]) {
  console.log(w, "count =", findWordUsages(w).length);
}
