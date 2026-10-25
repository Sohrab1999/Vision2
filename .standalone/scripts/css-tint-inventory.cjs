#!/usr/bin/env node
// Tranche 3b inventory — tinted-family dark band rules in globals.css.
// Groups every single-declaration .dark color rule on a tinted utility by
// (utilityClass) and reports: bare global rules (tokenizable), /NN keeps,
// scoped keeps (intermediate class), and the effective value per bare group.
const fs = require("fs");
const src = fs.readFileSync("src/app/globals.css", "utf8");

const FAMS = ["sky","rose","emerald","amber","violet","teal","cyan","lime","orange","fuchsia","indigo"];
const PROPS = ["background-color","border-color","color","--tw-ring-color","--tw-gradient-from","--tw-gradient-to","--tw-gradient-via","fill","stroke"];
// utility prefix in selector for each property
const PREFIX = {
  "background-color": ["bg"],
  "border-color": ["border","divide"],
  "color": ["text"],
  "--tw-ring-color": ["ring"],
  "--tw-gradient-from": ["from"],
  "--tw-gradient-to": ["to"],
  "--tw-gradient-via": ["via"],
  fill: ["fill"],
  stroke: ["stroke"],
};

// crude but sufficient: split top-level rules (no nested @media inside .dark here except tracked)
const lines = src.split("\n");
const groups = new Map(); // key: utilclass (e.g. bg-emerald-50) -> array of {line, scoped, nn, prop, value, sel}
for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line.startsWith(".dark")) continue;
  const m = line.match(/^(\.dark[^{]*)\{([^}]*)\};?$/);
  if (!m) continue;
  const sel = m[1], body = m[2].trim().replace(/;$/, "").trim();
  // single declaration only (trailing ; stripped, interior ; = multi-decl)
  if (body.includes(";")) continue;
  const dm = body.match(/^([a-z-]+):\s*(.+)$/);
  if (!dm) continue;
  const prop = dm[1], value = dm[2].trim();
  if (!PROPS.includes(prop)) continue;
  const prefixes = PREFIX[prop];
  // find utility class token in selector: e.g. .dark .hover\:bg-emerald-50\/40:hover
  const utilRe = new RegExp("\\\\?(?:" + prefixes.join("|") + ")-(" + FAMS.join("|") + ")-(\\d{2,3})(\\\\/\\d+)?(?![a-z-])");
  const um = sel.match(utilRe);
  if (!um) continue;
  const fam = um[1], shade = um[2], nn = um[3] || "";
  // bare = selector contains ONLY .dark + the utility (no intermediate classes)
  const compound = sel
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);
  let allBare = true, hasNn = Boolean(nn);
  for (const c of compound) {
    // strip .dark and pseudo suffixes, then expect exactly the utility class token
    const stripped = c.replace(/^\.dark\s+/, "").replace(/^\\?\./, "").replace(/\\\/(\d+)/, "").replace(/:hover$/, "").replace(/:focus$/, "").trim();
    const bare = new RegExp("^\\\\?(?:" + prefixes.join("|") + ")-" + fam + "-" + shade + "$").test(stripped);
    if (!bare) allBare = false;
  }
  const key = (fam + "-" + shade + (nn ? nn.replace(/\\/g, "") : "")) + "|" + prefixes.join("/");
  if (!groups.has(key)) groups.set(key, []);
  groups.get(key).push({ line: i + 1, sel, bare: allBare, nn: hasNn, prop, value });
}

let bareCount = 0, keepCount = 0;
const rows = [];
for (const [key, arr] of [...groups.entries()].sort()) {
  const bare = arr.filter(r => r.bare && !r.nn);
  const rest = arr.filter(r => !(r.bare && !r.nn));
  rows.push({ key, bare, rest });
  bareCount += bare.length;
  keepCount += rest.length;
}
console.log("== BARE (tokenizable) groups ==");
for (const { key, bare } of rows) {
  if (!bare.length) continue;
  const vals = [...new Set(bare.map(r => r.prop + "=" + r.value))];
  console.log(`${key}  x${bare.length}  [${vals.join(" | ")}]  lines ${bare.map(b=>b.line).join(",")}`);
}
console.log(`\nbare rules total: ${bareCount}, keep rules: ${keepCount}`);
console.log("== KEEPS (scoped or /NN) sample ==");
for (const { key, rest } of rows) {
  if (rest.length) console.log(`${key}  x${rest.length} keep`);
}
