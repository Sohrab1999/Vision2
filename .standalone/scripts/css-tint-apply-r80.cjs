#!/usr/bin/env node
// Task 80 — tranche 3b surface-tint transformer.
// Deletes the 12 bare band rules (verified byte-exact before cutting) + the 1
// shadowed-dead rush-card rule, inserts the 12 tokens into the .dark kernel,
// and extends the official-report always-light patch. Every deletion is
// content-verified: if any line drifted, abort with no writes.
const fs = require("fs");
const p = "src/app/globals.css";
let src = fs.readFileSync(p, "utf8");
const orig = src;

const KILL = [
  '.dark .bg-rose-50 { background-color: rgba(80, 18, 28, 0.35); }',
  '.dark .border-rose-200 { border-color: rgba(140, 40, 55, 0.5); }',
  '.dark .bg-emerald-50 { background-color: rgba(6, 55, 40, 0.35); }',
  '.dark .bg-orange-50 { background-color: rgba(88, 44, 14, 0.4); }',
  '.dark .border-orange-200 { border-color: rgba(160, 95, 30, 0.5); }',
  '.dark .bg-violet-50 { background-color: rgba(59, 40, 92, 0.35); }',
  '.dark .border-violet-200 { border-color: rgba(110, 80, 170, 0.5); }',
  '.dark .border-violet-300 { border-color: rgba(130, 100, 190, 0.55); }',
  '.dark .bg-teal-50 { background-color: rgba(6, 55, 50, 0.35); }',
  '.dark .bg-amber-50 { background-color: rgba(69, 48, 12, 0.35); }',
  '.dark .rush-card.border-sky-200 { border-color: rgb(7 66 84 / 0.7); }',
  '.dark .border-sky-200 { border-color: rgb(7 66 84 / 0.7); }',
  '.dark .bg-sky-50 { background-color: rgba(8, 47, 60, 0.45); }',
];
for (const k of KILL) {
  const n = src.split("\n").filter((l) => l.trim() === k).length;
  if (n !== 1) {
    console.error(`ABORT: expected exactly 1 occurrence, got ${n}: ${k}`);
    process.exit(1);
  }
  src = src.replace(k + "\n", "").replace(k, "");
}

const TOKENS = `
  /* Step 9 tranche 3b surface half (Task 80) — dark bg/border TINT tokens
     (same mechanism as the stone kernel): shades whose dark value is uniform
     across all bare band rules — proven by scripts/css-tint-inventory.cjs +
     the TSX consumer matrix. The per-utility band for these shades is retired
     (css-hygiene guard); hover: variants and gradient from/via/to stops that
     were never enumerated now go dark for free. Deliberate SKIPS (intentional
     light values live there): emerald-200 (home-hero glow + weekly-chart
     scale), emerald-300 (srs forecast bar tops), amber-100 (focus/hover rings
     + border conflict), amber-200 (the active goal dot), amber-300 + rose-300
     (text-ink consumers disagree), teal-500 (solid bg consumers); ink shades
     500-800 stay explicit — solid bg-<fam>-600/700 buttons keep light scale.
     Deviating scoped rules (srs-panel/rush-done/vocab-donut/badge-popover
     tints, hover:bg-sky-50, rush-hero borders) stay and win by specificity. */
  --color-amber-50: rgba(69, 48, 12, 0.35);
  --color-emerald-50: rgba(6, 55, 40, 0.35);
  --color-orange-50: rgba(88, 44, 14, 0.4);
  --color-orange-200: rgba(160, 95, 30, 0.5);
  --color-rose-50: rgba(80, 18, 28, 0.35);
  --color-rose-200: rgba(140, 40, 55, 0.5);
  --color-sky-50: rgba(8, 47, 60, 0.45);
  --color-sky-200: rgb(7 66 84 / 0.7);
  --color-teal-50: rgba(6, 55, 50, 0.35);
  --color-violet-50: rgba(59, 40, 92, 0.35);
  --color-violet-200: rgba(110, 80, 170, 0.5);
  --color-violet-300: rgba(130, 100, 190, 0.55);`;

// tokens may already be present (idempotent re-run) — require exactly one copy
const tokenCount = (src.match(/--color-violet-300: rgba\(130, 100, 190, 0\.55\);/g) || []).length;
if (tokenCount === 0) {
  const anchor = "  --color-slate-500: #a8a29e;\n}";
  if (!src.includes(anchor)) {
    console.error("ABORT: .dark token kernel anchor not found");
    process.exit(1);
  }
  src = src.replace(anchor, "  --color-slate-500: #a8a29e;\n" + TOKENS + "\n}");
} else if (tokenCount > 1) {
  console.error(`ABORT: tokens duplicated (${tokenCount}x)`);
  process.exit(1);
}

// official-report paper must stay light: re-light the tokenized shades it uses
if (!src.includes("re-light the tinted tokens")) {
  const paperAnchor = ".dark .official-report {\n  --color-stone-50: #fafaf9;\n  --color-stone-100: #f5f5f4;\n  --color-stone-200: #e7e5e4;\n}";
  if (!src.includes(paperAnchor)) {
    console.error("ABORT: official-report patch anchor not found");
    process.exit(1);
  }
  src = src.replace(
    paperAnchor,
    ".dark .official-report {\n  --color-stone-50: #fafaf9;\n  --color-stone-100: #f5f5f4;\n  --color-stone-200: #e7e5e4;\n  /* tranche 3b (Task 80): re-light the tinted tokens the paper consumes */\n  --color-emerald-50: #ecfdf5;\n  --color-amber-50: #fffbeb;\n  --color-rose-50: #fff1f2;\n}"
  );
}

fs.writeFileSync(p, src);
const before = orig.split("\n").length, after = src.split("\n").length;
console.log(`OK: 13 rules retired, tokens verified, paper patch ensured; ${before} -> ${after} lines`);
