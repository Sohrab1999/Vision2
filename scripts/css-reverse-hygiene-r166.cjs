#!/usr/bin/env node
// r166 — reverse-hygiene audit: every class used in a CSS selector must have
// a live consumer in src/**/*.{ts,tsx}. The guard (css-hygiene.test.ts) only
// proves rules EXIST; nothing proves their consumers still do. Over 165 tasks
// components get renamed/removed — this audit finds rules whose owner left.
//
// Method:
//   1. parse globals.css + all feature files listed in tests/css-hygiene.test.ts
//   2. extract class tokens from selector heads (skip declarations, skip vars)
//   3. for each class, search src for a literal occurrence with dash-aware
//      boundaries: the class must appear NOT followed/preceded by [A-Za-z0-9_-]
//      (so `chip` inside `chip-duel` does not count, but `chip-duel` covers
//      itself as its own token)
//   4. print verdict per file; DEAD candidates need rg arbitration before removal
//
// Exit code: 0 always (audit report, not a gate — the gate lives in the test).
const { readFileSync } = require("fs");
const { resolve, join } = require("path");
const { execSync } = require("child_process");

const ROOT = resolve(__dirname, "..");

// pull the feature file list straight from the guard so they can never drift
const guardSrc = readFileSync(join(ROOT, "tests/css-hygiene.test.ts"), "utf8");
const featureFiles = [...new Set([...guardSrc.matchAll(/"(src\/[^"]+\.css)"/g)].map(m => m[1]))];
const files = ["src/app/globals.css", ...featureFiles];

// ── 1. collect class tokens per file ────────────────────────────────────────
// selector heads = lines before ` {` ... but multi-line selectors exist, and
// comments may embed class names. Simplest robust approach: strip comments,
// take everything before the first `{` of each rule (selectors), extract
// \.[A-Za-z][\w-]* tokens. Also skip :root vars (they are `--x` not `.x`).
const classRe = /\.([A-Za-z][A-Za-z0-9_-]*)/g;

function extractClasses(css) {
  const noComments = css.replace(/\/\*[\s\S]*?\*\//g, "");
  // rule head = text between end of previous rule (`}` or start) and `{`
  const heads = [];
  let depth = 0, headStart = 0;
  for (let i = 0; i < noComments.length; i++) {
    const ch = noComments[i];
    if (ch === "{") {
      if (depth === 0) heads.push(noComments.slice(headStart, i));
      depth++;
    } else if (ch === "}") {
      depth--;
      if (depth === 0) headStart = i + 1;
    }
  }
  const tokens = new Set();
  for (const head of heads) {
    // drop @media/@supports query remnants and keyframe percentages
    if (/@(media|supports|keyframes|import|font-face)/.test(head) && !/\.[A-Za-z]/.test(head.replace(/@(media|supports)[^{]*/, ""))) {
      // media queries may still contain class selectors after `and` — keep parsing
    }
    let m;
    classRe.lastIndex = 0;
    while ((m = classRe.exec(head))) tokens.add(m[1]);
  }
  return tokens;
}

// ── 1b. dynamic template-literal prefixes ───────────────────────────────────
// `glesson-role-${piece.role}` (grammar-lesson-flow.tsx) builds class families
// dynamically — a literal search can never see glesson-role-subject etc.
// r166 first-run lesson: these reported hard-dead until prefixes were taught.
function collectDynamicPrefixes() {
  // walk src in-process — shelling to rg needs \$-escaping that breaks in
  // nested quoting (r166 lesson); Node reads the bytes verbatim.
  const { readdirSync, statSync } = require("fs");
  const walk = (d, out = []) => {
    for (const e of readdirSync(d)) {
      const f = join(d, e);
      if (statSync(f).isDirectory()) walk(f, out);
      else if (/\.(ts|tsx)$/.test(e)) out.push(f);
    }
    return out;
  };
  let blob = "";
  try { blob = walk(join(ROOT, "src")).map(f => readFileSync(f, "utf8")).join("\n"); } catch { return []; }
  return [...new Set([...blob.matchAll(/([A-Za-z][A-Za-z0-9_-]*)-\$\{/g)].map(m => `${m[1]}-`))];
}
const DYN_PREFIXES = collectDynamicPrefixes();

// ── 2. dash-aware source search ─────────────────────────────────────────────
// build ONE regex per class: (?<![A-Za-z0-9_-])CLASS(?![A-Za-z0-9_-])
// search src, excluding .css files and the study components' own css.
function consumersExist(cls) {
  const re = new RegExp(`(?<![A-Za-z0-9_-])${cls}(?![A-Za-z0-9_-])`);
  try {
    const out = execSync(
      `rg -l --no-messages -g '*.ts' -g '*.tsx' -g '!**/*.css' -g '!tests/**' ${JSON.stringify(cls)} ${JSON.stringify(join(ROOT, "src"))} || true`,
      { cwd: ROOT, shell: "/bin/bash" }
    ).toString().trim();
    if (!out) return { hits: 0, files: [] };
    // literal rg found files containing substring; now dash-boundary check
    const hitFiles = out.split("\n").filter(Boolean);
    const exact = hitFiles.filter(f => {
      const txt = readFileSync(join(ROOT, f), "utf8");
      return re.test(txt);
    });
    return { hits: exact.length, files: exact, looseFiles: hitFiles };
  } catch {
    return { hits: -1, files: [], looseFiles: [] };
  }
}

// ── 3. run ──────────────────────────────────────────────────────────────────
const report = [];
for (const rel of files) {
  const abs = join(ROOT, rel);
  let css;
  try { css = readFileSync(abs, "utf8"); } catch { report.push({ rel, error: "unreadable" }); continue; }
  const classes = extractClasses(css);
  const dead = [], loose = [];
  for (const cls of [...classes].sort()) {
    const r = consumersExist(cls);
    if (r.hits === 0) {
      if (DYN_PREFIXES.some(pre => cls.startsWith(pre))) continue; // dynamic family
      if (r.looseFiles && r.looseFiles.length) loose.push({ cls, looseFiles: r.looseFiles });
      else dead.push(cls);
    }
  }
  report.push({ rel, total: classes.size, dead, loose });
}

let anyDead = 0, anyLoose = 0;
for (const r of report) {
  if (r.error) { console.log(`!! ${r.rel}: ${r.error}`); continue; }
  const flag = r.dead.length || r.loose.length ? "⚠️" : "✓";
  console.log(`${flag} ${r.rel} — ${r.total} classes, ${r.dead.length} hard-dead, ${r.loose.length} loose-only`);
  for (const d of r.dead) { console.log(`   DEAD  .${d}`); anyDead++; }
  for (const l of r.loose) {
    console.log(`   LOOSE .${l.cls}  (substring-only in: ${l.looseFiles.slice(0, 3).join(", ")})`);
    anyLoose++;
  }
}
console.log(`\n== summary: ${anyDead} hard-dead, ${anyLoose} loose-only across ${files.length} files ==`);
