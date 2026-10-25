#!/usr/bin/env node
/* Step 9 tranche-2 — surface-token kernel + ink tone consolidation.
 *
 * A. Retire the neutral-surface override band by redefining the Tailwind v4
 *    color TOKENS under `.dark` (--color-stone-50/100/200). Utilities compile
 *    to var(--color-*) and /NN variants derive via color-mix(), so one token
 *    line replaces every `.dark .bg-stone-*`-shaped band rule for that shade.
 *    (Verified against generated CSS: `.bg-white{background-color:var(--color-white)}`,
 *    `.bg-white\/70 → color-mix(in oklab, var(--color-white) 70%, transparent)`.)
 *
 * B. Delete scoped `.dark` rules whose every declaration is already produced
 *    by the token (same RGB + same alpha for /NN variants), and trim such
 *    declarations out of mixed rules.
 *
 * C. Consolidate the drifted per-panel ink rules (`.dark .X .text-stone-N`)
 *    into canonical tone groups (identical selector-shape + identical value).
 *
 * D. Delete provably-dead rules: shadowed globals (a later same-selector
 *    global re-asserts the same property) and the invalid `:not(idden])`
 *    divide selector.
 *
 * Usage: node scripts/css-tokens.cjs          (report)
 *        node scripts/css-tokens.cjs --apply  (write file)
 */
const fs = require("fs");
const FILE = "src/app/globals.css";

/* ---------- color normalization ---------- */
function parseColor(v) {
  const s = String(v).trim();
  let m;
  if ((m = s.match(/^#([0-9a-f]{6})$/i))) {
    const n = parseInt(m[1], 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255, a: 1 };
  }
  if ((m = s.match(/^#([0-9a-f]{8})$/i))) {
    const n = parseInt(m[1], 16);
    return { r: (n >> 24) & 255, g: (n >> 16) & 255, b: (n >> 8) & 255, a: round2((n & 255) / 255) };
  }
  if (
    (m = s.match(/^rgba?\(([^)]+)\)$/i)) ||
    (m = s.match(/^rgb\(([^)]+)\)$/i))
  ) {
    const parts = m[1].split(/[,\/\s]+/).filter(Boolean).map(Number);
    if (parts.length >= 3 && parts.slice(0, 3).every(Number.isFinite)) {
      return { r: parts[0], g: parts[1], b: parts[2], a: parts[3] !== undefined ? round2(parts[3]) : 1 };
    }
  }
  return null;
}
const round2 = (x) => Math.round(x * 100) / 100;
const sameColor = (a, b) => !!a && !!b && a.r === b.r && a.g === b.g && a.b === b.b && Math.abs(a.a - b.a) < 0.011;

/* token set: effective base values for the surface trio */
const TOKENS = {
  "stone-50": { r: 21, g: 19, b: 16 },   // #151310
  "stone-100": { r: 40, g: 36, b: 31 },  // #28241f
  "stone-200": { r: 55, g: 49, b: 43 },  // #37312b
};
const CANON_PROP = { bg: "background-color", text: "color", border: "border-color", fill: "fill", stroke: "stroke" };

/* utility class (escaped form in CSS: `bg-stone-50\/70`) → {family, shade, alpha} */
function parseUtil(cls) {
  const raw = cls.replace(/\\/g, "");
  const m = raw.match(/^(bg|text|border|fill|stroke)-stone-(\d+)(?:\/(\d+))?$/);
  if (!m) return null;
  if (!TOKENS["stone-" + m[2]]) return null;
  return { family: m[1], shade: "stone-" + m[2], alpha: m[3] ? Number(m[3]) / 100 : 1 };
}
function derivedValue(util) {
  const t = TOKENS[util.shade];
  return { r: t.r, g: t.g, b: t.b, a: round2(util.alpha) };
}

/* split a selector list on top-level commas */
function splitSelectors(sel) {
  const out = [];
  let depth = 0, cur = "";
  for (const ch of sel) {
    if (ch === "(") depth++;
    if (ch === ")") depth--;
    if (ch === "," && depth === 0) { out.push(cur.trim()); cur = ""; continue; }
    cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

/* last compound's final class, e.g. `.dark .a.bg-stone-100` → `bg-stone-100` */
function lastClass(sel) {
  const compounds = sel.split(/[\s>+~]+/).filter(Boolean);
  const last = compounds[compounds.length - 1];
  const m = last.match(/\.((?:[a-zA-Z0-9_-]|\\\/|\\:)+)$/);
  return m ? m[1] : null;
}

/* ---------- block parsing (line-based) ---------- */
function parseBlocks(lines) {
  const blocks = [];
  const stack = [];
  let depth = 0, cur = null;
  const normDecl = (l) => l.replace(/\s+/g, " ").replace(/;\s*$/, ";").trim();
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const opens = (line.match(/{/g) || []).length;
    const closes = (line.match(/}/g) || []).length;
    if (!cur && opens > 0) {
      const header = line.replace(/\{[\s\S]*$/, "").trim();
      if (header.startsWith("@")) {
        depth += opens - closes;
        if (depth > 0 && !stack.includes(header)) stack.push(header);
        if (closes > 0 && depth <= 0) { depth = 0; stack.length = 0; }
        continue;
      }
      cur = { sel: header, start: i, decls: [] };
      const body0 = line.slice(line.indexOf("{") + 1);
      for (const d of body0.split(";")) { const n = normDecl(d); if (n) cur.decls.push(n.endsWith(";") ? n : n + ";"); }
      depth += opens - closes;
      if (depth <= 0) {
        push(cur);
        cur = null; depth = 0;
      }
      continue;
    }
    if (cur) {
      const bodyPart = closes > 0 ? line.slice(0, line.lastIndexOf("}")) : line;
      for (const d of bodyPart.split(";")) { const n = normDecl(d); if (n && n !== "}") cur.decls.push(n.endsWith(";") ? n : n + ";"); }
      depth += opens - closes;
      if (depth <= 0) { push(cur); cur = null; depth = 0; stack.length = 0; }
    } else {
      depth += opens - closes;
      if (closes > 0 && depth <= 0) { depth = 0; stack.length = 0; }
    }
  }
  function push(b) {
    b.ctx = stack.join(" & ") || "(top)";
    b.end = findEnd(lines, b.start);
    b.decls = b.decls
      .map((d) => d.replace(/\}/g, "").trim())
      .filter((d) => d && d !== ";")
      .map((d) => d.endsWith(";") ? d : d + ";");
    b.selList = splitSelectors(b.sel);
    blocks.push(b);
  }
  return blocks;
}
function findEnd(lines, start) {
  let d = 0;
  for (let i = start; i < lines.length; i++) {
    d += (lines[i].match(/{/g) || []).length - (lines[i].match(/}/g) || []).length;
    if (d <= 0) return i;
  }
  return start;
}

/* ---------- main ---------- */
const apply = process.argv.includes("--apply");
const src = fs.readFileSync(FILE, "utf8");
const lines = src.split("\n");
const blocks = parseBlocks(lines).filter((b) => b.sel !== ".dark"); // the token host block itself is off-limits
if (process.env.DBG_BLOCK) {
  const b = blocks.find((x) => x.start === Number(process.env.DBG_BLOCK));
  console.log(JSON.stringify(b, null, 1));
  if (b) { const lc = lastClass(b.sel); console.log("lastClass:", lc, "util:", JSON.stringify(lc && parseUtil(lc))); }
  process.exit(0);
}

const deletions = [];   // {start, end, reason}
const trims = [];       // {block, keepDecls, reason}
const toneMembers = []; // {block, util-suffix, value}

/* --- D1: shadowed globals (same ctx+sel, every decl prop re-asserted later) --- */
const bySel = new Map();
for (const b of blocks) if (b.ctx === "(top)") { const k = b.sel; (bySel.get(k) ?? bySel.set(k, []).get(k)).push(b); }
for (const [sel, bs] of bySel) {
  for (let i = 0; i < bs.length - 1; i++) {
    const earlier = bs[i];
    let fullyShadowed = true;
    for (const d of earlier.decls) {
      const prop = d.split(":")[0].trim();
      const laterHas = bs.slice(i + 1).some((x) => x.decls.some((y) => y.split(":")[0].trim() === prop));
      if (!laterHas) { fullyShadowed = false; break; }
    }
    if (fullyShadowed) deletions.push({ block: earlier, reason: `shadowed global (later ${sel} re-asserts all props)` });
  }
}

/* --- D2/A2: token-equal rules --- */
for (const b of blocks) {
  if (b.ctx !== "(top)" || !b.sel.startsWith(".dark ")) continue;
  const utils = b.selList.map((s) => {
    const lc = lastClass(s);
    return lc ? parseUtil(lc) : null;
  });
  if (utils.some((u) => !u)) continue; // any non-tokenized selector in the list → skip whole rule
  const canonProps = new Set(utils.map((u) => CANON_PROP[u.family]));
  let allEqual = true;
  for (const d of b.decls) {
    const [propRaw, ...rest] = d.split(":");
    const prop = propRaw.trim();
    const val = rest.join(":").trim().replace(/;$/, "");
    if (!canonProps.has(prop)) { allEqual = false; break; }
    const pc = parseColor(val);
    const ok = utils.every((u) => sameColor(pc, derivedValue(u)));
    if (!ok) { allEqual = false; break; }
  }
  if (allEqual) deletions.push({ block: b, reason: `token-equal (${b.selList.map((s) => lastClass(s)).join(",")})` });
  else {
    // trim: drop token-equal decls, keep the rest
    const keep = b.decls.filter((d) => {
      const prop = d.split(":")[0].trim();
      const val = d.split(":").slice(1).join(":").trim().replace(/;$/, "");
      if (!canonProps.has(prop)) return true;
      const pc = parseColor(val);
      return !utils.every((u) => sameColor(pc, derivedValue(u)));
    });
    if (keep.length > 0 && keep.length < b.decls.length) trims.push({ block: b, keepDecls: keep, reason: `trim token-equal decls (${b.sel})` });
    else if (keep.length === 0) deletions.push({ block: b, reason: `all decls token-equal (${b.sel})` });
  }
}

/* --- C: ink tone groups (2-hop .dark .X .text-stone-N, single color decl) --- */
const toneRe = /^\.dark \.[A-Za-z0-9_\\\/-]+ \.text-stone-(\d+)$/;
const toneMap = new Map();
for (const b of blocks) {
  if (b.ctx !== "(top)" || b.decls.length !== 1) continue;
  if (!/^color:\s*#?[a-z0-9(),.\s\/%]+;$/i.test(b.decls[0])) continue;
  const val = b.decls[0].split(":").slice(1).join(":").trim().replace(/;$/, "");
  for (const s of b.selList) {
    const m = s.match(toneRe);
    if (!m) continue;
    const n = m[1];
    if (!["300", "400", "500", "600", "700", "800"].includes(n)) continue;
    // skip members already slated for deletion (token-equal etc.)
    if (deletions.some((d) => d.block === b)) continue;
    const key = `text-stone-${n} :: ${val}`;
    (toneMap.get(key) ?? toneMap.set(key, []).get(key)).push({ block: b, sel: s });
  }
}
for (const [key, members] of toneMap) {
  const uniqBlocks = [...new Set(members.map((m) => m.block))];
  if (uniqBlocks.length < 2) continue;
  for (const m of members) deletions.push({ block: m.block, reason: `tone-group member (${key})` });
  toneMembers.push({ key, members, anchor: members[0].block.start, value: key.split(" :: ")[1], util: key.split(" :: ")[0] });
}

/* --- D3: the invalid divide rule --- */
for (const b of blocks) if (b.sel.includes("idden]")) deletions.push({ block: b, reason: "invalid selector (mangled :not([hidden]) — dead rule)" });

/* ---------- report ---------- */
const uniqDeletions = [...new Map(deletions.map((d) => [d.block.start, d])).values()];
uniqDeletions.sort((a, b) => a.block.start - b.block.start);
let freed = 0;
console.log("== PLANNED DELETIONS ==");
for (const d of uniqDeletions) {
  const n = d.block.end - d.block.start + 1;
  freed += n;
  console.log(`L${d.block.start}-${d.block.end} (${n}l) ${d.reason}\n    ${lines[d.block.start].trim().slice(0, 100)}`);
}
console.log(`\ndelete blocks: ${uniqDeletions.length}, freed lines: ${freed}`);
console.log(`\n== TRIMS ==`);
for (const t of trims) console.log(`L${t.block.start} ${t.reason}\n    keep: ${t.keepDecls.join(" ")}`);
console.log(`\n== TONE GROUPS ==`);
for (const g of toneMembers.sort((a, b) => a.anchor - b.anchor)) console.log(`${g.key} ×${g.members.length} @L${g.anchor}`);

if (!apply) { console.log("\n(report only — rerun with --apply)"); process.exit(0); }

/* ---------- apply ---------- */
const out = lines.slice();
// tone group text
function groupText(g) {
  const sels = g.members.map((m) => m.sel);
  const rows = [];
  for (let i = 0; i < sels.length; i += 3) rows.push(sels.slice(i, i + 3).join(","));
  return [
    `/* ink tone ${g.util} → ${g.value} — canonical group (Step 9 tranche-2; was N drifted per-panel copies) */`
      .replace("N drifted", `${sels.length} drifted`),
    rows.join(",\n") + ` { color: ${g.value}; }`,
  ];
}
// 1) deletions bottom-up (skip blocks that are tone members — they are covered by group insertion)
const spans = uniqDeletions.map((d) => ({ start: d.block.start, end: d.block.end })).sort((a, b) => b.start - a.start);
for (const s of spans) out.splice(s.start, s.end - s.start + 1);
// 2) trims: rewrite declaration lines of trimmed blocks (find by scanning again)
//    simpler: re-locate trimmed blocks in the NEW line array by their selector text
const trimmedSrc = out.join("\n");
const trimLines = trimmedSrc.split("\n");
for (const t of trims) {
  const selRe = new RegExp("^" + t.block.sel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\\\//g, "\\\\/") + "\\s*\\{");
  // find the rule (single-line or start of multi-line) containing exactly the keep decls target
  for (let i = 0; i < trimLines.length; i++) {
    if (!selRe.test(trimLines[i])) continue;
    // single-line rule?
    if (trimLines[i].includes("}")) {
      const head = trimLines[i].slice(0, trimLines[i].indexOf("{") + 1);
      trimLines[i] = head + " " + t.keepDecls.join(" ") + " }";
      break;
    }
    // multi-line: replace decl lines until closing brace
    let j = i + 1, decls = [];
    while (j < trimLines.length && !trimLines[j].includes("}")) { decls.push(j); j++; }
    const body = t.keepDecls.map((d) => "  " + d);
    trimLines.splice(i + 1, decls.length, ...body);
    break;
  }
}
// 3) tone groups: insert at anchor position (adjusted for deletions already applied).
//    anchors were recorded on ORIGINAL lines; recompute: the group's anchor block was DELETED,
//    so insert at the deletion position of its first member. We re-scan for the first remaining
//    member selector instead: place group where the FIRST member used to be — use original start
//    minus number of deleted lines before it.
const delStarts = spans.map((s) => s.start).sort((a, b) => a - b);
const groupsSorted = toneMembers.slice().sort((a, b) => b.anchor - a.anchor); // bottom-up insert
for (const g of groupsSorted) {
  const adj = g.anchor - delStarts.filter((s) => s < g.anchor).length;
  const text = groupText(g);
  // the anchor block itself was deleted → insert its group text AT adj (where it used to begin)
  trimLines.splice(adj, 0, ...text);
}
fs.writeFileSync(FILE, trimLines.join("\n"));
console.log(`\nAPPLIED. new line count: ${trimLines.length} (was ${lines.length})`);
