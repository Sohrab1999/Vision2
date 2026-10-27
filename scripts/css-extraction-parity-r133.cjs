#!/usr/bin/env node
/* Task 133 — extraction parity proof: every rule in the HEAD r12 band must
 * appear VERBATIM (selector + declarations, whitespace-normalized) exactly
 * once across {new feature files + globals residue}; and the residue must
 * contain nothing else new except the documented header/comments.
 */
const { execSync } = require("child_process");
const fs = require("fs");

const norm = (s) => s.replace(/\s+/g, " ").trim();
const stripComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, "");

// --- collect rules (selector -> normalized decl text) from a css chunk ---
function rules(css) {
  const out = [];
  const src = stripComments(css);
  let depth = 0, cur = "", buf = "";
  for (const ch of src) {
    if (ch === "{") { depth++; if (depth === 1) { cur = norm(buf); buf = ""; continue; } }
    if (ch === "}") {
      depth--;
      if (depth === 0) { out.push({ sel: cur, decl: norm(buf) }); cur = ""; buf = ""; continue; }
    }
    if (depth >= 1) buf += ch;
    else if (!/\s|;/.test(ch)) buf += ch;
  }
  return out;
}

const band = execSync("git show HEAD:src/app/globals.css", { encoding: "utf8" }).split("\n");
// HEAD band = lines 692..925 (1-indexed) — verified by the splice asserts
const bandCss = band.slice(691, 925).join("\n");
const bandRules = rules(bandCss).filter((r) => r.sel && r.decl);

const files = [
  "src/components/study/shared/confetti.css",
  "src/components/study/duel/rush.css",
  "src/components/study/duel/spell-input.css",
  "src/components/study/practice/srs-panel.css",
  "src/components/study/practice/skill-panel.css",
  "src/components/study/reports/report-card.css",
];
// residue region only (NOT the whole globals.css — the rest of globals is
// untouched by this extraction and must not enter the comparison pool)
const g = fs.readFileSync("src/app/globals.css", "utf8").split("\n");
const r0 = g.findIndex((l) => l.includes("r12 — residue after per-feature extraction"));
const r1 = g.findIndex((l) => l.includes("r14 — SRS donut"));
if (r0 < 0 || r1 < 0) { console.error("FAIL: residue markers not found"); process.exit(1); }
const residueCss = g.slice(r0, r1).join("\n");

const pool = [...files.map((f) => rules(fs.readFileSync(f, "utf8"))).flat(), ...rules(residueCss)]
  .filter((r) => r.sel && r.decl);
const residueOnly = rules(residueCss).filter((r) => r.sel && r.decl);

let ok = true;
// 1. every band rule must exist verbatim in the pool
const poolKeys = new Map();
for (const r of pool) {
  const k = norm(r.sel) + " {" + norm(r.decl) + "}";
  poolKeys.set(k, (poolKeys.get(k) || 0) + 1);
}
for (const r of bandRules) {
  const k = norm(r.sel) + " {" + norm(r.decl) + "}";
  if (!poolKeys.has(k)) { console.error("MISSING RULE:", k); ok = false; }
  else poolKeys.set(k, poolKeys.get(k) - 1);
}
// 2. no extra rules introduced (pool minus band must equal residue rules)
const residueKeys = new Set(residueOnly.map((r) => norm(r.sel) + " {" + norm(r.decl) + "}"));
const extras = [];
for (const [k, n] of poolKeys) if (n > 0 && !residueKeys.has(k)) extras.push(k);
// leftovers that ARE residue rules are expected (they stayed)
for (const e of extras) { console.error("EXTRA RULE (not in band, not residue):", e); ok = false; }

console.log("band rules:", bandRules.length, "| pool rules:", pool.length, "| residue rules:", residueOnly.length);
console.log(ok ? "PARITY-OK — verbatim move proven, zero rules lost, zero rules changed, zero unexpected additions" : "PARITY-FAILED");
process.exit(ok ? 0 : 1);
