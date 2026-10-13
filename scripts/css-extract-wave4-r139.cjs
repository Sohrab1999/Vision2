#!/usr/bin/env node
/* Task 139 — §8.3 wave 4: the duel dark band leaves globals.css.
 * Band (1-indexed, verified against HEAD 6918bab, globals.css 1420 lines):
 *   795-901  the duel dark-mode family: .dark .duel-* (hero/card/code/hud/
 *            done/think) + .dark .leaderboard.duel-mode (Task-36 standings +
 *            podium)  -> duel/duel-dark.css
 * STAY inside the band: 824-827 — the r115 .bg-stone-100 consolidated trio
 *   (duel-card/duel-done/gmetro-line) — cross-family focal layer, first
 *   member's position contract.
 * STAY outside the band (verified): ink-tone canonical groups 518/566/577/
 *   582/603 (duel members of multi-family selector lists), r90 focal group
 *   347, and the .dark .duel-week rule (1046 — owner reports/weekly-report.
 *   tsx, NOT duel components). Historical comments move with their rules.
 * Every cut asserts its exact boundary content first — drift fails loudly.
 * Parity is proven at BLOCK level (wave-2 lesson: a moved selector may also
 * appear as substring inside a rule that stays).
 */
const fs = require("fs");
const P = "src/app/globals.css";
const OUT = "src/components/study/duel/duel-dark.css";
const css = fs.readFileSync(P, "utf8");
const lines = css.split("\n"); // 0-indexed internally
const cut = (n) => lines[n - 1];
const expectLine = (n, frag) => {
  if (!cut(n).includes(frag)) {
    console.error(`BOUNDARY DRIFT at line ${n}: expected frag [${frag}] got [${cut(n)}]`);
    process.exit(1);
  }
};

// --- boundary assertions ---
expectLine(795, "/* ==================== Duel (نبرد دودنفره) — dark mode ==================== */");
expectLine(796, ".dark .duel-hero {");
expectLine(823, "}");
expectLine(824, "/* r115 merge: the three equal-decl .bg-stone-100 painters consolidated into");
expectLine(827, ".dark .duel-card .bg-stone-100,.dark .duel-done .bg-stone-100,.dark .gmetro-line .bg-stone-100");
expectLine(828, ".dark .duel-card .border-stone-100");
expectLine(897, ".dark .leaderboard.duel-mode .from-violet-200");
expectLine(898, ".dark .leaderboard.duel-mode .to-violet-500");
expectLine(899, ".dark .leaderboard.duel-mode .from-purple-200");
expectLine(900, ".dark .leaderboard.duel-mode .to-purple-400");
expectLine(901, "/* W/L/T record badges — rose ink served by the global .dark .text-rose-700 */");
expectLine(902, "");
expectLine(903, "/* ---------------- grammar metro map (Task-39 «متروی گرامر») ----------------");

// --- partition the band ---
const band = lines.slice(794, 901); // 795..901; band[i] === 1-indexed line 795+i
const stayIdx = new Set([29, 30, 31, 32]); // band-relative: 1-indexed 824..827 (r115 comment + trio)
const moved = band.filter((_, i) => !stayIdx.has(i));
const stayed = band.filter((_, i) => stayIdx.has(i));

// --- build duel-dark.css ---
const header = `/* Duel (نبرد دودنفره) — dark-mode family — extracted from src/app/globals.css
   (§8.3 per-feature extraction, wave 4 — task 139): the .dark .duel-* tuning
   (hero/card/code/hud/done/think) and the .dark .leaderboard.duel-mode
   standings/podium (Task-36), verbatim.
   Owner: src/components/study/duel/ — duel-setup.tsx, duel-play.tsx,
   duel-countdown.tsx, leaderboard.tsx (the leaderboard lives IN the duel
   folder; its duel-mode scope is duel presentation).
   Always loaded via the src/app/features.css manifest; cascade isolation by
   construction — the wave-4 scan found zero equal-specificity competitors
   for the moved heads outside the band. Cross-family focal layers stay in
   globals: the ink-tone canonical groups (518-617), the r90 bg-white focal
   group (347), and the r115 .bg-stone-100 trio (first member's position —
   its gmetro-line member is another family). The .dark .duel-week rule
   (1046) stays: its owner is reports/weekly-report.tsx, not this family.
   Print band wins via !important; @utility defs lose to unlayered author
   rules regardless of position. The dark palette rides the .dark kernel
   tokens (r114/r115 contracts — duel washes paint the token bases). */

`;

const out = header + moved.join("\n") + "\n";
fs.writeFileSync(OUT, out);

// --- rewrite globals: tombstone + stayed trio, then nothing else changes ---
const before = lines.slice(0, 794); // 1..794
const after = lines.slice(901); // 902..end
const tombstone = [
  "/* ==================== Duel dark band — moved to duel/duel-dark.css",
  "   (§8.3 wave 4 — task 139; always loaded via the features.css manifest).",
  "   The r115 .bg-stone-100 consolidated trio STAYS — cross-family focal",
  "   layer at the first member's position (its gmetro-line member is the",
  "   grammar-metro family). ==================== */",
];
const newGlobals = [...before, ...tombstone, ...stayed, ...after].join("\n");
fs.writeFileSync(P, newGlobals);

// --- verify: budget + parity at block level ---
const g2 = fs.readFileSync(P, "utf8");
const l2 = g2.split("\n");
const sel = l2.filter((l) => /^\s*\.[a-z]/.test(l) && !l.includes("→")).length;
console.log("BUDGET-AFTER=" + sel + " (floor to set: 287)");
console.log("GLOBALS-LINES=" + l2.length);

const movedText = moved.join("\n");
const checks = [
  [".dark .duel-hero {", "hero block"],
  [".dark .duel-hero .bg-white\\/15, .dark .duel-hero .bg-white\\/10", "hero wash pair"],
  [".dark .duel-hero .duel-cta {", "cta"],
  [".dark .duel-card {", "card root"],
  [".dark .duel-card .bg-stone-50\\/70,.dark .duel-card .c-stone-70,.dark .duel-card .bg-stone-50", "r89 retarget"],
  [".dark .duel-card .text-fuchsia-700,.dark .leaderboard.duel-mode .text-fuchsia-700 { color: #f0abfc; }", "fuchsia pair 700"],
  [".dark .duel-code {", "code"],
  [".dark .duel-hud {", "hud root"],
  [".dark .duel-hud .c-stone-60 { background-color: rgb(41 37 36 / 0.6); }", "r90 one-lined hud"],
  [".dark .duel-done[class*=\"border-emerald-300\"]", "done emerald variant"],
  [".dark .duel-card .hover\\:bg-fuchsia-50\\/50:hover", "hover utilities"],
  [".dark .leaderboard.duel-mode .bg-gradient-to-b.from-fuchsia-50\\/60 {", "standings gradient"],
  [".dark .leaderboard.duel-mode .ring-fuchsia-200", "ring"],
  [".dark .leaderboard.duel-mode .to-purple-400 { --tw-gradient-to: #9333ea; }", "podium tail"],
];
let fail = 0;
for (const [key, name] of checks) {
  const inOut = out.includes(key);
  const inGlobals = g2.includes(key);
  if (!inOut || inGlobals) {
    console.error(`PARITY FAIL [${name}]: inOut=${inOut} goneFromGlobals=${!inGlobals}`);
    fail++;
  }
}
// the trio must be in BOTH the new globals and NOT in duel-dark.css
const trio = ".dark .duel-card .bg-stone-100,.dark .duel-done .bg-stone-100,.dark .gmetro-line .bg-stone-100 { background-color: rgb(68 64 60 / 0.7); }";
if (!g2.includes(trio)) { console.error("PARITY FAIL: trio lost from globals"); fail++; }
if (out.includes(trio)) { console.error("PARITY FAIL: trio leaked into duel-dark.css"); fail++; }
// ink canonical groups must still be in globals (they reference duel members)
for (const key of [
  ".dark .duel-think .text-stone-500 { color: #a8a29e; }",
  ".dark .duel-card .text-stone-700,.dark .duel-hud .text-stone-700,.dark .duel-think .text-stone-700",
  ".dark .duel-hud .text-stone-800,.dark .duel-done .text-stone-800,.dark .gmetro-d",
]) {
  if (!g2.includes(key)) { console.error(`STAY FAIL: ink group lost from globals [${key.slice(0, 50)}]`); fail++; }
  if (out.includes(key)) { console.error(`STAY FAIL: ink group leaked into duel-dark.css [${key.slice(0, 50)}]`); fail++; }
}
// duel-week stays in globals, not in duel-dark
const dw = ".dark .duel-week .text-fuchsia-600 {";
if (!g2.includes(dw)) { console.error("STAY FAIL: duel-week lost from globals"); fail++; }
if (out.includes(dw)) { console.error("STAY FAIL: duel-week leaked into duel-dark.css"); fail++; }

if (fail) { console.error(`FAILED=${fail}`); process.exit(1); }
console.log("PARITY-OK (14 moved-block checks + trio + 3 ink groups + duel-week)");
console.log("OUT-LINES=" + out.split("\n").length);
