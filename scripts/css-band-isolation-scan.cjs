#!/usr/bin/env node
/* Task 133 — r12 band extraction: selector isolation scan.
 * For every selector in the r12 band (globals.css lines 692-925), find whether
 * the same class tokens appear elsewhere in globals.css (conflict candidates
 * for equal-specificity cascade flips after the move).
 */
const fs = require("fs");
const css = fs.readFileSync("src/app/globals.css", "utf8");
const lines = css.split("\n");

// band boundaries (1-indexed inclusive): 692..925
const BAND_START = 692, BAND_END = 925;
const band = lines.slice(BAND_START - 1, BAND_END).join("\n");
const outside =
  lines.slice(0, BAND_START - 1).join("\n") +
  "\n@@@SPLIT@@@\n" +
  lines.slice(BAND_END).join("\n");

// collect class tokens from band selectors
const selectorLines = band.split("\n").filter((l) => {
  const s = l.trim();
  return s && !s.startsWith("/*") && !s.startsWith("*") && (s.includes("{") || s.includes(","));
});
const tokens = new Set();
for (const l of selectorLines) {
  const selPart = l.split("{")[0];
  for (const m of selPart.matchAll(/\.([a-zA-Z0-9_-]+)/g)) tokens.add(m[1]);
}
// keyframes names are not selectors; drop them
["confetti-fall", "rush-pulse"].forEach((k) => tokens.delete(k));

console.log("=== class tokens in band (" + tokens.size + ") ===");
const conflicts = [];
for (const t of [...tokens].sort()) {
  const re = new RegExp("\\." + t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "(?![a-zA-Z0-9_-])", "g");
  const outsideHits = [];
  const outLines = outside.split("@@@SPLIT@@@");
  outLines.forEach((chunk, i) => {
    let m;
    while ((m = re.exec(chunk)) !== null) {
      const lineNo = i === 0
        ? chunk.slice(0, m.index).split("\n").length
        : BAND_END + chunk.slice(0, m.index).split("\n").length;
      outsideHits.push(lineNo);
    }
  });
  if (outsideHits.length) conflicts.push({ token: t, lines: outsideHits });
}

if (conflicts.length === 0) {
  console.log("NO CONFLICTS — every band token is band-exclusive.");
} else {
  console.log("CONFLICT CANDIDATES (token → outside line numbers):");
  for (const c of conflicts) console.log("  ." + c.token + " → lines " + c.lines.join(","));
}
console.log("=== done ===");
