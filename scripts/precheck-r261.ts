// پیش‌سنجهٔ r261 — دریلِ مثال‌هایِ درسنامهٔ جامع (بندِ ① پیشنهادِ ۲۶۰)
// سنجش: چند واژهٔ واژگانِ درس‌ها در جمله‌هایِ مثالِ ساختاریافتهٔ
// booklet-grammar.ts (BgExample.en) زندگی می‌کنند — با همان معناشناسیِ
// wordFormRegex. و توزیعِ شمارشِ کاربردِ پیکره برایِ «پرکاربردترها اول».
import { BOOKLET_GRAMMAR_TOPICS } from "../src/data/booklet-grammar";
import { lessons as LESSONS } from "../src/data";
import { findWordUsages, wordFormRegex } from "../src/lib/word-usage";
import type { LessonData } from "../src/lib/study-types";

const examples: { en: string; fa: string; topic: string; source: string }[] = [];
for (const t of BOOKLET_GRAMMAR_TOPICS) {
  for (const ex of t.examples ?? []) {
    examples.push({ en: ex.en, fa: ex.fa, topic: t.title, source: t.source });
  }
}
console.log("topics:", BOOKLET_GRAMMAR_TOPICS.length);
console.log("structured examples:", examples.length);

// هر واژهٔ واژگان (کارت‌محور) که در حداقل یک مثال زندگی می‌کند
const seen = new Set<string>();
const candidates: { en: string; count: number; exIdx: number; hits: number }[] = [];
let crossLesson = 0;
for (const l of LESSONS as unknown as LessonData[]) {
  for (const w of l.vocabulary) {
    const k = w.en.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    const hits: number[] = [];
    examples.forEach((ex, i) => {
      if (wordFormRegex(w.en).test(ex.en)) hits.push(i);
    });
    if (hits.length === 0) { crossLesson++; continue; }
    candidates.push({ en: w.en, count: findWordUsages(w.en).length, exIdx: hits[0], hits: hits.length });
  }
}
console.log("vocab words in examples:", candidates.length, "| zero-hit:", crossLesson);
console.log("multi-example words:", candidates.filter((c) => c.hits > 1).length);
console.log("examples with >=1 word:", new Set(candidates.map((c) => c.exIdx)).size);

// توزیعِ شمارشِ پیکره — برایِ نزولیِ «پرکاربردترها اول»
const byCount = [...candidates].sort((a, b) => b.count - a.count);
console.log("corpus-count top12:", byCount.slice(0, 12).map((c) => `${c.en}:${c.count}`).join(" "));
console.log("count>0:", candidates.filter((c) => c.count > 0).length, "| count=0:", candidates.filter((c) => c.count === 0).length);

// آیا مثالِ اولِ هر نامزد واقعاً واژه را دارد (highlightParts مسیرِ سازنده)
const { highlightParts } = await import("../src/lib/word-usage");
let blankable = 0;
for (const c of candidates) {
  const parts = highlightParts(examples[c.exIdx].en, c.en);
  if (parts.some((p) => p.hit)) blankable++;
}
console.log("highlightable-first-example:", blankable, "/", candidates.length);

// نمونه‌های سؤال‌سازِ اول (شبیه‌سازیِ ترتیبِ سازنده)
console.log("first5:", byCount.slice(0, 5).map((c) => `${c.en} @ ${examples[c.exIdx].topic} :: ${examples[c.exIdx].en.slice(0, 48)}`).join("\n  "));
