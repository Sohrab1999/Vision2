// r256 terminal precount — census anchors for word-family usage lens
import { WORD_FAMILY_TABLES, WORD_FAMILY_TOTAL, wordFamilyTableId } from "../src/data/word-families";
import { findWordUsages } from "../src/lib/word-usage";

let grandCells = 0, grandUsed = 0, grandUsedFam = 0, grandFam = 0;
const gradeUsedFam: Record<string, number> = {};
const gradeFam: Record<string, number> = {};

console.log("=== per-table census (cells + families) ===");
for (const t of WORD_FAMILY_TABLES) {
  let totalCells = 0, usedCells = 0, usedFam = 0;
  let firstUsed = "", firstUnused = "";
  for (const f of t.families) {
    let famUsed = false;
    for (const en of [f.noun, f.verb, f.adjective, f.adverb]) {
      if (!en) continue;
      totalCells++;
      if (findWordUsages(en).length > 0) { usedCells++; famUsed = true; }
    }
    if (famUsed) {
      usedFam++;
      if (!firstUsed) firstUsed = [f.noun, f.verb, f.adjective, f.adverb].filter(Boolean).join("/");
    } else if (!firstUnused) {
      firstUnused = [f.noun, f.verb, f.adjective, f.adverb].filter(Boolean).join("/") || "(empty)";
    }
  }
  grandCells += totalCells; grandUsed += usedCells; grandUsedFam += usedFam; grandFam += t.families.length;
  gradeUsedFam[t.grade] = (gradeUsedFam[t.grade] ?? 0) + usedFam;
  gradeFam[t.grade] = (gradeFam[t.grade] ?? 0) + t.families.length;
  console.log(`${wordFamilyTableId(t)} | ${t.grade}·${t.lesson} | families=${t.families.length} usedFam=${usedFam} | cells=${totalCells} usedCells=${usedCells} | firstUsed="${firstUsed}" firstUnusedFam="${firstUnused}"`);
}

console.log("=== grand totals ===");
console.log(`families=${grandFam}/${WORD_FAMILY_TOTAL} usedFamilies=${grandUsedFam} cells=${grandCells} usedCells=${grandUsed}`);
for (const g of ["دهم", "یازدهم", "دوازدهم"]) {
  console.log(`grade ${g}: families=${gradeFam[g]} usedFamilies=${gradeUsedFam[g]}`);
}

// honesty zero anchors: words with no usage (for synthetic-table guard)
console.log("=== zero-usage probe ===");
for (const w of ["amusement", "broadcast", "amazement"]) {
  console.log(`${w}: ${findWordUsages(w).length}`);
}
