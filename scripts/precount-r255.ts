import { findWordUsages } from "../src/lib/word-usage";
import { WORD_FAMILY_TABLES as wordFamilies } from "../src/data/word-families";
import { lessons } from "../src/data";

// 1) word-family table words with usage (overall census)
let withU = 0, total = 0;
const samples: string[] = [];
for (const t of wordFamilies) {
  for (const f of t.families) {
    for (const w of [f.noun, f.verb, f.adjective, f.adverb]) {
      if (!w) continue;
      total++;
      const sites = findWordUsages(w);
      if (sites.length > 0) {
        withU++;
        if (samples.length < 14) samples.push(`${w}:${sites.length}`);
      }
    }
  }
}
console.log("family-words with usage:", withU, "of", total);
console.log("samples:", samples.join(" | "));

// 2) anchors
for (const w of ["amusement", "attention", "beauty", "change", "correction", "amazing", "amazingly"]) {
  console.log(w, "→", findWordUsages(w).length);
}

// 3) lesson-1 vocab sample with usage (for danger-row-style anchors)
const l1 = lessons.find(l => l.id === 1)!;
for (const v of (l1.vocabulary ?? []).slice(0, 8)) {
  console.log("L1 vocab:", v.en, "→", findWordUsages(v.en).length);
}
