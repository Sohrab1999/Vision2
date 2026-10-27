// پیش‌سنجهٔ راند ۲۶۵ — آستانه‌هایِ «حداقل کاربرد» برایِ دریلِ مثال‌هایِ درسنامه
// (بندِ ① پیشنهادِ ۲۶۴): نامزدها = واژه‌هایِ یکتای واژگان که در حداقل یک
// مثالِ ساختاریافته زندگی می‌کنند (همان معناشناسیِ buildGrammarExampleQuiz).
import { lessons } from "../src/data";
import { BOOKLET_GRAMMAR_TOPICS } from "../src/data/booklet-grammar";
import { findWordUsages } from "../src/lib/word-usage";
import { wordFormRegex } from "../src/lib/word-usage";

const BG_EXAMPLES = BOOKLET_GRAMMAR_TOPICS.flatMap((t) => (t.examples ?? []).map((ex) => ({ en: ex.en })));
console.log("bg examples:", BG_EXAMPLES.length);

// نامزدها — یکتا با lowercase، حاضر در حداقل یک مثال
const seen = new Set<string>();
const candidates: { en: string; count: number }[] = [];
for (const l of lessons) {
  for (const w of l.vocabulary) {
    const k = w.en.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    if (!BG_EXAMPLES.some((ex) => wordFormRegex(w.en).test(ex.en))) continue;
    candidates.push({ en: w.en, count: findWordUsages(w.en).length });
  }
}
console.log("candidates total (unique example-living words):", candidates.length);
console.log("zero-usage (booklet-only, r259 branch):", candidates.filter((c) => c.count === 0).length);

for (const t of [5, 10, 20]) {
  const sub = candidates.filter((c) => c.count >= t);
  const top = [...sub].sort((a, b) => b.count - a.count).slice(0, 4);
  console.log(`threshold ${t}+:`, sub.length, "words | top:", top.map((c) => `${c.en}·${c.count}`).join(", "));
}

// نمونه‌هایِ گارد: first question at each threshold (بیشترینِ کاربرد)
const sorted = [...candidates].sort((a, b) => b.count - a.count);
console.log("overall top:", sorted.slice(0, 5).map((c) => `${c.en}·${c.count}`).join(", "));
