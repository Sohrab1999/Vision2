import { WORD_FAMILY_LESSON_LINKS } from "../src/data/word-families";
import { findWordUsages } from "../src/lib/word-usage";
const t = WORD_FAMILY_LESSON_LINKS[1]!;
let n = 0;
for (const f of t.families)
  for (const w of [f.noun, f.verb, f.adjective, f.adverb]) {
    if (!w) continue;
    const c = findWordUsages(w).length;
    if (c > 0 && n < 14) { console.log(`${w}:${c}`); n++; }
  }
let tot = 0, withU = 0;
for (const f of t.families) for (const w of [f.noun, f.verb, f.adjective, f.adverb]) {
  if (!w) continue; tot++; if (findWordUsages(w).length > 0) withU++;
}
console.log("census:", withU, "of", tot);
