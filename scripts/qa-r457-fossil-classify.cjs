// r457 — precise fossil classifier: for each runtime-dead study file, check
// exact-path references in tests/ and live src/. Outputs DELETE vs KEEP lists.
const fs = require("fs");
const path = require("path");

const SRC = "/home/z/my-project/src";
const TESTS = "/home/z/my-project/tests";
const STUDY = path.join(SRC, "components/study");

// dead files from qa-r457-reach.cjs run (regenerate quickly: files under study
// that we know are runtime-dead — pass as argv or recompute via simple check:
// here we recompute by scanning imports of the whole live graph is overkill;
// instead we take the union list from the previous run, embedded below).
const DEAD = [
  // root files (54)
  ...["appendix-view","badges","command-palette","conversation-tab","daily-quests","danger-words","dictation-tab","dictionary-view","due-pill","duel-view","exam-view","explain-box","flashcards","footer","freeze-badge","goal-chip","grammar-lesson-flow","grammar-tab","grammar-view","header","home-view","konkur-view","leaderboard","lesson-tests-tab","lesson-view","my-words-dictation","my-words-flashcards","my-words-resolve","my-words-review","my-words","official-report","onboarding","progress-ring","pwa-layer","quiz-engine","reading-tab","report-card","review-view","rush-board","rush-view","settings-popover","shortcut-guide","skill-panel","smart-practice-view","speak-button","spell-rush-view","srs-panel","theme-provider","vocab-donut","vocab-tab","weekly-chart","weekly-report","word-of-day","writing-tab"].map((n) => `components/study/${n}.tsx`),
  // subdir dead (10)
  ...["books/book-view","home/home-grade-books","jozve/jozve-view","lesson/usage-dialog","practice/my-words-story","practice/streak-badge","practice/week-chip","quiz/quiz-teacher","reports/week-teacher","search/library-search-view"].map((n) => `components/study/${n}.tsx`),
];

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

const testFiles = walk(TESTS).filter((f) => /\.(ts|tsx)$/.test(f));
const srcFiles = walk(SRC).filter((f) => /\.(ts|tsx)$/.test(f));

// exact-specifier patterns for a dead file "components/study/<path>.tsx":
//   "@/components/study/<path>"  (alias)
//   relative variants: from within study dir: "./<name>" / "../<subdir>/<name>" etc.
// To be precise we check for the exact tail: "study/<path>" which covers alias
// imports; relative imports from live files were already proven absent by the
// reachability scan (it resolves relative specifiers). For tests we ALSO check
// relative "../src/components/study/<path>" style.
function referencedBy(fileRel, text) {
  const base = "study/" + fileRel.replace(/^components\/study\//, "").replace(/\.tsx$/, "");
  const pats = [
    new RegExp("[\"']@/" + base.replace(/\//g, "\\/") + "[\"']"),
    new RegExp("[\"'][^\"']*components/" + base.replace(/\//g, "\\/") + "[\"']"),
  ];
  return pats.some((r) => r.test(text));
}

const deadSet = new Set(DEAD.map((d) => path.join(SRC, d)));
const DELETE = [];
const KEEP = [];
for (const rel of DEAD) {
  const full = path.join(SRC, rel);
  let testRefs = [];
  for (const t of testFiles) {
    const txt = fs.readFileSync(t, "utf8");
    if (referencedBy(rel, txt)) testRefs.push(path.basename(t));
  }
  let srcRefs = [];
  for (const s of srcFiles) {
    if (deadSet.has(s)) continue; // refs from other dead files don't count
    const txt = fs.readFileSync(s, "utf8");
    if (referencedBy(rel, txt)) srcRefs.push(path.basename(s));
  }
  if (testRefs.length || srcRefs.length) KEEP.push({ rel, testRefs: testRefs.slice(0, 4), srcRefs: srcRefs.slice(0, 4) });
  else DELETE.push(rel);
}
console.log("=== KEEP (referenced) — " + KEEP.length + " ===");
KEEP.forEach((k) => console.log(`  ${k.rel}\n     tests: ${k.testRefs.join(", ") || "-"}\n     src:   ${k.srcRefs.join(", ") || "-"}`));
console.log("=== DELETE (pure fossils) — " + DELETE.length + " ===");
DELETE.forEach((d) => console.log("  " + d));
const lines = DELETE.length;
console.log(`TOTAL: keep=${KEEP.length} delete=${DELETE.length}`);
