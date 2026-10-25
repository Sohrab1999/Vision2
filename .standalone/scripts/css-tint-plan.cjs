#!/usr/bin/env node
// Task 68 — tinted-ink token plan (Step 9 tranche 3b, R-7 direction).
// For every (family, shade) with dark `color` rules, answer:
//   1. are ALL dark rules for that shade color-rules? (bg/border dark rules block the flip)
//   2. is the dark value uniform? (drift -> the deviating scoped rule stays as an override)
//   3. does TSX use the shade ONLY as text ink? (bg-/border-/from-/to-/via-/ring-/decoration-
//      consumers would flip too — they have no dark rules, i.e. they are light-on-dark
//      today, and a token flip would change them -> blocked unless patched)
// Output: FLIP candidates (tokens to add + rules to delete) and BLOCKED shades.
const fs = require("fs");
const path = require("path");

const css = fs.readFileSync("src/app/globals.css", "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
const FAMS = ["emerald","amber","rose","sky","teal","orange","violet","fuchsia","cyan","lime","indigo","stone","slate","gray","zinc","neutral"];

// ---- collect dark rules mentioning the family (selector + decl) ----
const darkRules = [];
const re = /([^{}@]+)\{([^{}]*)\}/g;
let m;
while ((m = re.exec(css))) {
  const sel = m.group1 ? m.group(1).trim() : m[1].trim();
  const decl = m[2].trim();
  if (!sel.startsWith(".dark")) continue;
  if (!new RegExp(`(?:text|bg|border|from|to|via|ring|decoration|divide|outline|shadow|fill|stroke)-(${FAMS.join("|")})-\\d{3}`).test(sel)) continue;
  darkRules.push({ sel: sel.replace(/\s+/g, " "), decl: decl.replace(/\s+/g, " ") });
}

// ---- collect TSX/TS consumers ----
function* walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else if (/\.(tsx?|ts)$/.test(e.name)) yield p;
  }
}
const consumers = new Map(); // key fam|shade -> {text:Set(ctx), other:Set(ctx+class)}
for (const f of walk("src")) {
  const txt = fs.readFileSync(f, "utf8");
  for (const fam of FAMS) {
    const cre = new RegExp(`(?:^|["'\\s\`])((?:[a-z-]+:)*(?:text|bg|border|from|to|via|ring|decoration|divide|outline|fill|stroke)-${fam}-(\\d{3}))`, "g");
    let cm;
    while ((cm = cre.exec(txt))) {
      const shade = cm[2];
      const cls = cm[1];
      const key = `${fam}|${shade}`;
      if (!consumers.has(key)) consumers.set(key, { text: new Set(), other: new Set() });
      const rec = consumers.get(key);
      if (/(?:^|:)text-/.test(cls)) rec.text.add(`${path.basename(f)}:${cls}`);
      else rec.other.add(`${path.basename(f)}:${cls}`);
    }
  }
}

// ---- evaluate ----
const plan = { flip: [], partial: [], blocked: [] };
for (const fam of FAMS) {
  const shades = new Set();
  for (const r of darkRules) {
    const mm = r.sel.match(new RegExp(`(?:text|bg|border)-${fam}-(\\d{3})`));
    if (mm) shades.add(mm[1]);
  }
  for (const shade of shades) {
    const famShade = `${fam}-${shade}`;
    const mine = darkRules.filter((r) => r.sel.includes(`${famShade}`));
    const colorRules = mine.filter((r) => /(?:^|; )color:/.test(r.decl) && !/background-color|border-color/.test(r.decl.replace(/(?:^|; )color:[^;]+;/g, "")));
    const otherPropRules = mine.filter((r) => /background-color|border-color|box-shadow/.test(r.decl));
    const vals = colorRules
      .map((r) => (r.decl.match(/(?:^|; )color:\s*([^;]+)/) || [])[1])
      .filter(Boolean);
    const uniform = vals.length && new Set(vals).size === 1;
    const cons = consumers.get(`${fam}|${shade}`) || { text: new Set(), other: new Set() };
    const entry = { famShade, darkValue: uniform ? vals[0] : [...new Set(vals)].join(" / "), rules: mine.length, otherPropRules: otherPropRules.length, tsxText: cons.text.size, tsxOther: [...cons.other] };
    if (otherPropRules.length === 0 && cons.other.size === 0 && uniform) plan.flip.push(entry);
    else if (uniform && cons.other.size === 0) plan.partial.push(entry);
    else plan.blocked.push(entry);
  }
}
console.log("=== FLIP (add token, delete rules) ===");
for (const e of plan.flip) console.log(` ${e.famShade} -> ${e.darkValue} | delete ${e.rules} dark rule(s) | tsx text=${e.tsxText}`);
console.log("=== PARTIAL (uniform, but other dark props exist on the shade — token serves color; keep bg/border rules) ===");
for (const e of plan.partial) console.log(` ${e.famShade} -> ${e.darkValue} | color rules ${e.rules}, other-prop rules ${e.otherPropRules} | tsx text=${e.tsxText}`);
console.log("=== BLOCKED (drift or non-text consumers) ===");
for (const e of plan.blocked) console.log(` ${e.famShade} | rules=${e.rules} otherPropRules=${e.otherPropRules} drift/other=${e.darkValue} | tsxText=${e.tsxText} tsxOther=${e.tsxOther.slice(0, 4).join(",")}${e.tsxOther.length > 4 ? " …" : ""}`);
const del = plan.flip.reduce((a, e) => a + e.rules, 0) + plan.partial.reduce((a, e) => a + e.rules, 0);
console.log(`\nPOTENTIAL RULE DELETIONS: flip-only ${plan.flip.reduce((a, e) => a + e.rules, 0)}, +partial ${del}`);
