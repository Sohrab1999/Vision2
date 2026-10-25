import { WORD_FAMILY_TABLES } from "../src/data/word-families";
import { findWordUsages } from "../src/lib/word-usage";

const t0 = WORD_FAMILY_TABLES[0];
console.log("table0:", t0.grade, "|", t0.lesson, "|", t0.vision);
for (const f of t0.families) {
  const row = [f.noun, f.verb, f.adjective, f.adverb].map(w => w ? `${w}:${findWordUsages(w).length}` : "-").join(" ");
  console.log(`  ${f.fa ?? "—"} → ${row}`);
}
// totals for honest census
let withU = 0, total = 0;
for (const t of WORD_FAMILY_TABLES) for (const f of t.families)
  for (const w of [f.noun, f.verb, f.adjective, f.adverb]) { if (!w) continue; total++; if (findWordUsages(w).length > 0) withU++; }
console.log("census:", withU, "of", total);
