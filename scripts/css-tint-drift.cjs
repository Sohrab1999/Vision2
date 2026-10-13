#!/usr/bin/env node
/* Tranche 3b — tinted alpha-drift matrix.
 *
 * For every .dark rule whose SELECTOR carries a tinted-family utility of a
 * given (property, family, shade), report the declaration value and scope.
 * Groups with >1 distinct value = drift candidates; groups with 1 value but
 * several scopes = convergence candidates (same value restated).
 *
 * Output is grouped by (prop|family-shade) with value clusters, so the
 * consumer matrix (which scopes carry which value) is directly readable.
 *
 * Usage: node scripts/css-tint-drift.cjs [shades…]   (default 200,300)
 */
const fs = require("fs");

const FILE = "src/app/globals.css";
const FAMS = ["sky","rose","emerald","amber","violet","teal","cyan","lime","orange","fuchsia","indigo","purple"];
const PROPS = {
  "background-color": ["bg"],
  "border-color": ["border","divide"],
  "color": ["text"],
  "--tw-ring-color": ["ring"],
  "--tw-gradient-from": ["from"],
  "--tw-gradient-to": ["to"],
  "--tw-gradient-via": ["via"],
};
const shades = process.argv.slice(2).length ? process.argv.slice(2) : ["200", "300"];

const src = fs.readFileSync(FILE, "utf8");
const lines = src.split("\n");

/* split top-level rules: selector line(s) then decl lines until } */
const rules = [];
for (let i = 0; i < lines.length; i++) {
  const l = lines[i];
  if (!/^\.dark/.test(l.trim())) continue;
  if (l.includes("{")) {
    const sel = l.slice(0, l.indexOf("{")).trim();
    const decls = [];
    if (!l.includes("}")) {
      for (let j = i + 1; j < lines.length && !lines[j].includes("}"); j++) decls.push(lines[j].trim());
    } else {
      const inner = l.slice(l.indexOf("{") + 1, l.indexOf("}")).trim();
      if (inner) decls.push(inner);
    }
    rules.push({ line: i + 1, sel, decls });
  }
}

/* map decl -> which utility prefix it answers to */
const propOf = (decl) => {
  const m = decl.match(/^([a-z-]+)\s*:/);
  if (!m) return null;
  return m[1];
};
const utilPrefixesOf = (prop) => PROPS[prop] ?? null;
const shadeRegex = (fam, shade) =>
  new RegExp(`(?:text|bg|border|divide|from|to|via|ring)-${fam}-${shade}(?![0-9])(?:\\\\\\/\\d+)?`);

/* collect */
const groups = new Map(); // key: prop|fam-shade  -> [{line, sel, value}]
for (const r of rules) {
  for (const d of r.decls) {
    const prop = propOf(d);
    if (!prop) continue;
    const prefixes = utilPrefixesOf(prop);
    if (!prefixes) continue;
    const value = d.slice(d.indexOf(":") + 1).trim().replace(/;$/, "");
    for (const fam of FAMS) {
      for (const shade of shades) {
        if (!shadeRegex(fam, shade).test(r.sel)) continue;
        // the selector must mention one of this property's prefixes with this fam-shade
        const hit = prefixes.some((p) => r.sel.includes(`${p}-${fam}-${shade}`));
        if (!hit) continue;
        const key = `${prop}|${fam}-${shade}`;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push({ line: r.line, sel: r.sel, value });
      }
    }
  }
}

/* report */
const keys = [...groups.keys()].sort();
for (const key of keys) {
  const entries = groups.get(key);
  const byValue = new Map();
  for (const e of entries) {
    const v = e.value;
    if (!byValue.has(v)) byValue.set(v, []);
    byValue.get(v).push(e);
  }
  const distinct = [...byValue.keys()];
  const tag = distinct.length > 1 ? "DRIFT" : entries.length > 1 ? "RESTATE" : "single";
  console.log(`\n== ${key}  [${tag}] (${entries.length} rule(s), ${distinct.length} value(s))`);
  for (const [v, es] of [...byValue.entries()].sort((a, b) => b[1].length - a[1].length)) {
    console.log(`   ${v}`);
    for (const e of es) console.log(`     L${e.line}  ${e.sel}`);
  }
}
