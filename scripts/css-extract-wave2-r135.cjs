#!/usr/bin/env node
/* Task 135 — §8.3 wave 2: the small single-family bands leave globals.css.
 * Bands (1-indexed, verified against HEAD 0046a65):
 *   A  446-456  streak flame (+flame-flicker)      -> shared/streak-flame.css
 *   B  458-461  footer band light                  -> shell/footer.css
 *   C  463-478  quote band decorative mark         -> home/quote-band.css
 *   D  480-483  dictation-box  (DEAD — retire)     -> tombstone only
 *   E  513-533  hero book (+hero-sheen)            -> home/home-hero.css
 *   F  535-551  badge shine (+badge-sheen)         -> practice/badges.css
 *   G  553-558  certificate light                  -> quiz/quiz-result.css
 *   H  560-566  heatmap light + media              -> practice/weekly-chart.css
 *   I  572      certificate dark dashed            -> quiz/quiz-result.css
 *   J  576-579  heat-cell dark emerald             -> practice/weekly-chart.css
 *   K  582-589  word-day base light+dark           -> lesson/word-of-day.css
 *   L  596-599  word-day dark descendants          -> lesson/word-of-day.css
 *   M  611-612  word-day dark emerald              -> lesson/word-of-day.css
 *   N  626-630  badge popover pop-fade             -> practice/badges.css
 *   O  651-653  footer dark                        -> shell/footer.css
 *   P  654      quote dark ::before                -> home/quote-band.css
 * STAY (cross-family/canonical/a11y): 330-333 surface cluster, 398 quote !important,
 * 485-511 utility overrides, 569-575+580 amber/ring utilities, 590-595 comments,
 * 601-617 ink canonical groups, 619-625 popover surface cluster, 632-649, 655-657,
 * 854 reduce-motion kill-switch.
 * Every cut asserts its exact boundary content first — any drift fails loudly.
 */
const fs = require("fs");
const P = "src/app/globals.css";
const css = fs.readFileSync(P, "utf8");
const lines = css.split("\n"); // 0-indexed internally

const cut = (n) => lines[n - 1]; // 1-indexed accessor
const expectLine = (n, frag) => {
  if (!cut(n).includes(frag)) {
    console.error(`BOUNDARY DRIFT at line ${n}: expected frag [${frag}] got [${cut(n)}]`);
    process.exit(1);
  }
};

// --- boundary assertions (all cuts) ---
expectLine(446, "/* ---------------- streak flame ---------------- */");
expectLine(456, "}");
expectLine(458, "/* ---------------- footer band ---------------- */");
expectLine(461, "}");
expectLine(463, "/* ---------------- quote band decorative mark ---------------- */");
expectLine(478, "}");
expectLine(480, "/* dictation letter boxes: latin font + slight spacing */");
expectLine(483, "}");
expectLine(513, "/* ---------------- hero book (task 111");
expectLine(533, "}");
expectLine(535, "/* ---------------- badges / achievements ---------------- */");
expectLine(551, "}");
expectLine(553, "/* ---------------- final-exam certificate ---------------- */");
expectLine(558, "}");
expectLine(560, "/* ---------------- 30-day heatmap ---------------- */");
expectLine(566, "}");
expectLine(572, ".dark .certificate-card .border-dashed");
expectLine(576, ".dark .heat-cell.bg-emerald-200");
expectLine(579, ".dark .heat-cell.bg-emerald-800");
expectLine(582, "/* ---------------- word of the day ---------------- */");
expectLine(589, "}");
expectLine(596, ".dark .word-day .text-emerald-700");
expectLine(599, ".dark .word-day .border-stone-200");
expectLine(611, ".dark .word-day .border-emerald-600");
expectLine(612, ".dark .word-day .bg-emerald-600");
expectLine(626, ".badge-popover { animation: pop-fade 0.18s ease-out; }");
expectLine(630, "}");
expectLine(651, ".dark .footer-band {");
expectLine(654, ".dark .quote-band::before");

const take = (a, b) => lines.slice(a - 1, b);
const drop = new Set();
const mark = (a, b) => { for (let i = a; i <= b; i++) drop.add(i); };
mark(446, 456); mark(458, 461); mark(463, 478); mark(480, 483);
mark(513, 533); mark(535, 551); mark(553, 558); mark(560, 566);
mark(572, 572); mark(576, 579); mark(582, 589); mark(596, 599);
mark(611, 612); mark(626, 630); mark(651, 654);

const body = (a, b) => take(a, b).join("\n").trim();

const files = [
  {
    path: "src/components/study/shared/streak-flame.css",
    head: `/* Task 135 — §8.3 wave 2: the streak flame (header + home-today) and its
   flame-flicker keyframes, verbatim from globals.css. The global a11y
   kill-switch (html.user-reduce-motion .streak-flame, globals) still wins
   via !important regardless of position. */`,
    blocks: [body(446, 456)],
  },
  {
    path: "src/components/study/shell/footer.css",
    head: `/* Task 135 — §8.3 wave 2: the footer band gradient, light + dark twin,
   verbatim from globals.css (owner: shell/footer.tsx). The dark twin keeps
   its cascade position AFTER the light rule inside this file — no other
   .footer-band rule competes anywhere (isolation scan). */`,
    blocks: [body(458, 461), body(651, 653)],
  },
  {
    path: "src/components/study/home/quote-band.css",
    head: `/* Task 135 — §8.3 wave 2: the quote band decorative quotation mark,
   light + dark twin, verbatim from globals.css (owner: home-view.tsx).
   The .dark .quote-band background-image !important rule (home-stat band)
   stays in globals — different property, and !important is position-free. */`,
    blocks: [body(463, 478), body(654, 654)],
  },
  {
    path: "src/components/study/home/home-hero.css",
    head: `/* Task 135 — §8.3 wave 2: the living-book cover sheen (task 111) and its
   hero-sheen keyframes, verbatim from globals.css (owner: home-hero.tsx).
   Theme-free by design; the global user-reduce-motion catch-all still
   catches it via animation-duration 0.01ms !important. */`,
    blocks: [body(513, 533)],
  },
  {
    path: "src/components/study/practice/badges.css",
    head: `/* Task 135 — §8.3 wave 2: the badge shine sweep (badge-sheen) and the
   details-popover entrance (pop-fade), verbatim from globals.css (owner:
   badges.tsx). The popover's dark surface rules (the cross-family trio and
   the scoped bg-stone-50) stay in globals — surfaces cluster. */`,
    blocks: [body(535, 551), body(626, 630)],
  },
  {
    path: "src/components/study/quiz/quiz-result.css",
    head: `/* Task 135 — §8.3 wave 2: the final-exam certificate card, light washes +
   the dark dashed-border retune, verbatim from globals.css (owner:
   quiz-result.tsx). The elevated-dark surface quintet (which names
   .certificate-card among five families) stays in globals — different
   property (background-color), canonical cluster. */`,
    blocks: [body(553, 558), body(572, 572)],
  },
  {
    path: "src/components/study/practice/weekly-chart.css",
    head: `/* Task 135 — §8.3 wave 2: the 30-day heatmap cells, light + the dark
   emerald ramp + the 480px media gap, verbatim from globals.css (owner:
   weekly-chart.tsx). The amber/ring utility retunes around it stay. */`,
    blocks: [body(560, 566), body(576, 579)],
  },
  {
    path: "src/components/study/lesson/word-of-day.css",
    head: `/* Task 135 — §8.3 wave 2: the word-of-day band, base light+dark + the
   word-day-scoped dark descendants (emerald text/borders, bg-white,
   border-stone-200), verbatim from globals.css (owner: word-of-day.tsx).
   The cross-family ink canonical groups (word-day × badge-popover ×
   shortcuts-dialog …) stay in globals. Scoped descendants keep winning
   over plain utilities by specificity — order-free. */`,
    blocks: [body(582, 589), body(596, 599), body(611, 612)],
  },
];

// --- tombstones for globals.css (selector-pattern-free: absence keys are safe) ---
const TOMB = "/* task 135 (§8.3 wave 2): this band moved verbatim beside its owner via";
const tomb = (what, where) =>
  what.includes("DEAD")
    ? `/* task 135 (§8.3 wave 2): ${what} — no extraction, just an honest burial */`
    : `${TOMB} src/app/features.css — ${what} -> ${where} */`;

// build new globals: iterate keep-lines, insert tombstones at band starts
const out = [];
let i = 1;
const tombAt = new Map([
  [446, tomb("streak flame", "shared/streak-flame.css")],
  [458, tomb("footer band light", "shell/footer.css")],
  [463, tomb("quote band mark", "home/quote-band.css")],
  [480, tomb("dictation-box — DEAD rule, zero TSX consumers — retired", "(nowhere)")],
  [513, tomb("hero book sheen", "home/home-hero.css")],
  [535, tomb("badge shine", "practice/badges.css")],
  [553, tomb("certificate light", "quiz/quiz-result.css")],
  [560, tomb("heatmap light", "practice/weekly-chart.css")],
  [572, tomb("certificate dark dashed", "quiz/quiz-result.css")],
  [576, tomb("heatmap dark ramp", "practice/weekly-chart.css")],
  [582, tomb("word-day base", "lesson/word-of-day.css")],
  [596, tomb("word-day dark descendants", "lesson/word-of-day.css")],
  [611, tomb("word-day dark emerald", "lesson/word-of-day.css")],
  [626, tomb("badge popover pop-fade", "practice/badges.css")],
]);
const tombText = new Map();
// 650 header becomes a tombstone too (its two rules moved; 655-657 stay)
tombText.set(650, "/* task 135 (§8.3 wave 2): the footer-band and quote-band dark twins that lived here moved beside their owners (shell/footer.css, home/quote-band.css) via the features.css manifest — the rules below are unrelated and stay */");

while (i <= lines.length) {
  if (tombText.has(i)) { out.push(tombText.get(i)); i++; continue; }
  if (drop.has(i)) {
    if (tombAt.has(i)) out.push(tombAt.get(i));
    i++;
    while (drop.has(i)) i++; // skip rest of band
    continue;
  }
  out.push(lines[i - 1]);
  i++;
}

// collapse >1 consecutive blank lines introduced at band seams
const collapsed = [];
for (const l of out) {
  if (l.trim() === "" && collapsed.length && collapsed[collapsed.length - 1].trim() === "") continue;
  collapsed.push(l);
}

// --- write feature files ---
for (const f of files) {
  const content = f.head + "\n\n" + f.blocks.join("\n\n") + "\n";
  fs.writeFileSync(f.path, content);
  console.log("WROTE", f.path, `(${content.split("\n").length} lines)`);
}

// --- write globals ---
fs.writeFileSync(P, collapsed.join("\n"));
console.log("GLOBALS", collapsed.length, "lines (was", lines.length + ")");

// --- parity proof (block-level, collision-proof): each moved block's full
// multi-line text must (a) appear verbatim in its target feature file and
// (b) NOT appear in the new globals. Line-level substring checks are unsafe
// here: ".streak-flame {" and ".quote-band {" survive in globals inside the
// reduce-motion kill-switch and the home-stat !important rule respectively.
const gnew = fs.readFileSync(P, "utf8");
const allFeature = files.map((f) => fs.readFileSync(f.path, "utf8")).join("\n@@@\n");
const bands = [
  [446, 456, "src/components/study/shared/streak-flame.css"],
  [458, 461, "src/components/study/shell/footer.css"],
  [463, 478, "src/components/study/home/quote-band.css"],
  [513, 533, "src/components/study/home/home-hero.css"],
  [535, 551, "src/components/study/practice/badges.css"],
  [553, 558, "src/components/study/quiz/quiz-result.css"],
  [560, 566, "src/components/study/practice/weekly-chart.css"],
  [572, 572, "src/components/study/quiz/quiz-result.css"],
  [576, 579, "src/components/study/practice/weekly-chart.css"],
  [582, 589, "src/components/study/lesson/word-of-day.css"],
  [596, 599, "src/components/study/lesson/word-of-day.css"],
  [611, 612, "src/components/study/lesson/word-of-day.css"],
  [626, 630, "src/components/study/practice/badges.css"],
  [651, 653, "src/components/study/shell/footer.css"],
  [654, 654, "src/components/study/home/quote-band.css"],
];
let blockCount = 0;
for (const [a, b, target] of bands) {
  const block = body(a, b);
  blockCount++;
  const ftxt = fs.readFileSync(target, "utf8");
  if (!ftxt.includes(block)) { console.error("PARITY FAIL — block missing from", target, ":\n" + block.slice(0, 120)); process.exit(1); }
  if (gnew.includes(block)) { console.error("PARITY FAIL — block still in globals:\n" + block.slice(0, 120)); process.exit(1); }
}
console.log("PARITY-OK —", blockCount, "moved blocks verified verbatim in features, absent from globals");
