#!/usr/bin/env node
/* Step 9 tranche-3a — tinted tone-group consolidation.
 *
 * Extends tranche-2's part C to ALL dark rules: any set of `.dark …` rule
 * blocks that share the SAME media context and BYTE-IDENTICAL declaration
 * tuples is merged into ONE rule whose selector list is the ordered union of
 * the members, placed at the first member's position.
 *
 * Safety argument (same as tranche-1 dedupe): identical declarations make
 * source order between members irrelevant; merging selector lists preserves
 * each selector's own specificity, so the cascade result is unchanged —
 * every element still matches through its own selector.
 *
 * Stone ink groups were consolidated in tranche 2; this pass catches the
 * tinted families (emerald/amber/orange/rose/teal/fuchsia/violet/sky) plus
 * any stone residue with equal declarations.
 *
 * Usage: node scripts/css-tones.cjs           (dry-run report)
 *        node scripts/css-tones.cjs --apply   (write file)
 */
const fs = require("fs");
const FILE = "src/app/globals.css";

const normDecl = (l) => l.replace(/\s+/g, " ").replace(/;\s*$/, ";").trim();

/* ---- source co-occurrence oracle: can both selector class-token sets land
   on ONE element? A static className is ONE quoted string, so co-occurrence
   is tested within a single string literal (conditional ternaries keep their
   branches in separate strings; template literals with ${} that mix branches
   stay conservative false-positives — safe direction). ---- */
let SRC_STRINGS = null;
function srcStrings() {
  if (SRC_STRINGS) return SRC_STRINGS;
  SRC_STRINGS = [];
  const walk = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = `${d}/${e.name}`;
      if (e.isDirectory()) walk(p);
      else if (/\.(tsx?|jsx?)$/.test(e.name)) {
        const src = fs.readFileSync(p, "utf8");
        // pre-tokenize ONCE: a `(^|[^\w/-])tok([^\w/-]|$)` occurrence inside a
        // string is exactly a maximal [\w/-] run equal to tok (lowercased —
        // the oracle regex was case-insensitive), so we store run-sets per
        // string and answer co-occurrence with O(1) set lookups instead of
        // rebuilding regexes across every literal per pair (4.9s → ~0.3s).
        const runs = new Set(
          (src.match(/[\w/-]+/g) || []).map((t) => t.toLowerCase())
        );
        SRC_STRINGS.push(runs);
      }
    }
  };
  walk("src");
  return SRC_STRINGS;
}
function hazardsCoOccur(a, b) {
  const toks = [...a, ...b].map((t) => t.toLowerCase());
  if (toks.length === 0) return "member without class tokens";
  const res = srcStrings().find((runs) => toks.every((t) => runs.has(t)));
  return res ? "same-string co-occurrence" : null;
}

/** parse all rule blocks with media context (borrowed from css-dupes.cjs shape) */
function parse(src) {
  const lines = src.split("\n");
  const blocks = [];
  const stack = [];
  let depth = 0;
  let cur = null;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const opens = (line.match(/{/g) || []).length;
    const closes = (line.match(/}/g) || []).length;
    if (!cur && opens > 0) {
      const header = line.replace(/\{[\s\S]*$/, "").trim();
      if (header.startsWith("@")) {
        depth += opens - closes;
        if (depth > 0 && !stack.includes(header)) stack.push(header);
        if (closes > 0 && depth <= 0) {
          depth = 0;
          stack.length = 0;
        }
        continue;
      }
      cur = {
        sel: header,
        start: i,
        end: i,
        decls: [],
        raw: [],
        ctx: stack.join(" & ") || "(top)",
      };
      const inline = line.slice(line.indexOf("{") + 1);
      depth += opens - closes;
      if (depth <= 0) {
        const body = inline.slice(0, inline.lastIndexOf("}"));
        cur.decls = body.split(";").map(normDecl).filter(Boolean);
        cur.end = i;
        blocks.push(cur);
        cur = null;
        depth = 0;
        continue;
      }
      if (inline.trim()) cur.decls.push(...inline.split(";").map(normDecl).filter(Boolean));
      continue;
    }
    if (cur) {
      const bodyPart = closes > 0 ? line.slice(0, line.lastIndexOf("}")) : line;
      for (const d of bodyPart.split(";")) {
        const n = normDecl(d);
        if (n && n !== "}") cur.decls.push(n);
      }
      depth += opens - closes;
      cur.end = i;
      if (depth <= 0) {
        cur.decls = cur.decls.filter(Boolean);
        blocks.push(cur);
        cur = null;
        depth = 0;
        stack.length = 0;
      }
    } else {
      // close-only lines (e.g. the `}` of an @theme/@media block) and any
      // brace-bearing line outside a rule — keep depth/stack honest
      depth += opens - closes;
      if (closes > 0 && depth <= 0) {
        depth = 0;
        stack.length = 0;
      }
    }
  }
  return { lines, blocks };
}

/** specificity (a=0, b-level count, c=elements) for these class/attr/pseudo selectors */
const specOf = (sel) => {
  const classes = (sel.match(/\.[a-zA-Z_][^ ,>~+:\[]*|\[[^\]]+\]|:[a-z-]+(?:\([^)]*\))?/g) || []).length;
  const elements = (sel.replace(/\.[a-zA-Z_][^ ,>~+:\[]*|\[[^\]]+\]|:[a-z-]+(?:\([^)]*\))?/g, " ").match(/\b[a-z]+\b/g) || []).filter((w) => !["and", "not", "is", "where"].includes(w)).length;
  return classes * 10 + elements;
};
/** literal class tokens a selector requires (lowercased, unescaped; the
    theme root `.dark` is excluded — every rule shares it) */
const classTokensOf = (sel) =>
  (sel.match(/\.[a-zA-Z_][a-zA-Z0-9_-]*(?:\\\/[0-9]+)?/g) || [])
    .map((t) => t.slice(1).replace(/\\/g, "").toLowerCase())
    .filter((t) => t !== "dark");
/** class tokens of the FINAL compound (the part that must sit on the
    element itself); ancestor compounds only gate reachability */
const finalTokensOf = (sel) => {
  const last = sel.split(/[\s>~+]+/).filter(Boolean).pop() || sel;
  return classTokensOf(last);
};

function run(apply) {
  const src = fs.readFileSync(FILE, "utf8");
  const { lines, blocks } = parse(src);

  // dark-scope only, grouped by (context, decl tuple)
  const dark = blocks.filter((b) => b.sel.startsWith(".dark"));
  const groups = new Map();
  for (const b of dark) {
    const key = JSON.stringify([b.ctx || "(top)", b.decls]);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(b);
  }

  const merges = [];
  const conflicts = [];
  const aggressive = process.argv.includes("--aggressive");

  for (const [key, bs] of groups) {
    if (bs.length < 2) continue;
    bs.sort((a, b) => a.start - b.start);
    const declProps = bs[0].decls.map((d) => d.split(":")[0].trim());
    const propSet = new Set(declProps);
    const valOf = (d) => d.slice(d.indexOf(":") + 1).trim();
    // hazard: an intermediate rule between the outermost members declaring the
    // same property with a DIFFERENT value, at EQUAL specificity to some
    // member selector, whose selector can plausibly match a common element.
    // Higher/lower specificity never flips (specificity beats order either way).
    const memberSels = bs.flatMap((b) => b.sel.split(",").map((s) => s.trim()));
    const memberSpecs = new Map(memberSels.map((s) => [s, specOf(s)]));
    const mid = blocks.filter(
      (b) => b.start > bs[0].end && b.end < bs[bs.length - 1].start && b.decls.some((d) => propSet.has(d.split(":")[0].trim()))
    );
    let hazard = null;
    for (const r of mid) {
      for (const d of r.decls) {
        const p = d.split(":")[0].trim();
        if (!propSet.has(p)) continue;
        const gv = bs[0].decls.find((x) => x.split(":")[0].trim() === p);
        if (!gv || valOf(d) === valOf(gv)) continue; // same value → no visual flip
        const rs = specOf(r.sel);
        for (const ms of memberSels) {
          if (memberSpecs.get(ms) !== rs) continue;
          // equal specificity — can both selectors match ONE element?
          // Only the FINAL compounds must sit on the element itself, so the
          // co-occurrence oracle runs on those tokens alone.
          const rt = finalTokensOf(r.sel);
          const mt = finalTokensOf(ms);
          const co = rt.length === 0 || mt.length === 0 ? "bare final compound" : hazardsCoOccur(rt, mt);
          if (co) {
            hazard = { r, ms, why: co };
            break;
          }
        }
        if (hazard) break;
      }
      if (hazard) break;
    }
    if (hazard) {
      conflicts.push({ bs, hazard, mid });
      continue; // excluded from merge (safety first)
    }
    merges.push({ key, bs });
  }
  merges.sort((a, b) => a.bs[0].start - b.bs[0].start);

  let savedLines = 0;
  const report = [];
  for (const { key, bs } of merges) {
    const decls = bs[0].decls;
    const sels = [];
    for (const b of bs)
      for (const s of b.sel.split(",")) {
        const t = s.trim();
        if (!sels.includes(t)) sels.push(t);
      }
    // each member spans start..end lines; merged block is single-line
    const span = bs.reduce((acc, b) => acc + (b.end - b.start + 1), 0);
    savedLines += span - 1;
    report.push(
      `L${bs.map((b) => b.start + 1).join(",L")} (${bs.length}x, span ${span}→1): ${sels.slice(0, 3).join(" | ").slice(0, 90)} :: ${decls.join(" ").slice(0, 70)}`
    );
  }

  console.log(`dark rule blocks: ${dark.length}`);
  console.log(`consolidatable groups: ${merges.length}, members merged: ${merges.reduce((a, m) => a + m.bs.length, 0)}`);
  console.log(`estimated line save: ${savedLines}`);
  for (const r of report) console.log("  " + r);
  console.log(`\nexcluded groups (cascade-conflict hazards): ${conflicts.length}`);
  for (const c of conflicts) {
    console.log(
      `  GROUP L${c.bs.map((b) => b.start + 1).join(",L")} — hazard: ${c.hazard.why} | R L${c.hazard.r.start + 1} ${c.hazard.r.sel.slice(0, 50)} vs member ${c.hazard.ms.slice(0, 50)}`
    );
  }

  if (!apply || merges.length === 0) return;

  // Each member's own span is blanked (never the span BETWEEN members —
  // members of a group can be far apart with unrelated rules in between);
  // the merged single-line rule is written at the first member's line.
  const edits = [];
  for (const { key, bs } of merges) {
    const decls = bs[0].decls;
    const sels = [];
    for (const b of bs)
      for (const s of b.sel.split(",")) {
        const t = s.trim();
        if (!sels.includes(t)) sels.push(t);
      }
    edits.push({
      at: bs[0].start,
      spans: bs.map((b) => [b.start, b.end]),
      line: `${sels.join(",")} { ${decls.join("; ")}; }`,
    });
  }
  const keep = lines.map(() => true);
  const replaced = lines.map(() => null);
  for (const e of edits) for (const [s, t] of e.spans) for (let i = s; i <= t; i++) keep[i] = false;
  for (const e of edits) {
    replaced[e.at] = e.line;
    keep[e.at] = true;
  }
  const next = lines
    .map((l, i) => (replaced[i] !== null ? replaced[i] : l))
    .filter((_, i) => keep[i])
    .join("\n");
  fs.writeFileSync(FILE, next);
  console.log(`applied: ${edits.length} merges → ${src.split("\n").length} → ${next.split("\n").length} lines`);
}

/** analysis used by both the CLI report and the hygiene guard test */
function analyze(file = FILE) {
  const src = fs.readFileSync(file, "utf8");
  const { blocks } = parse(src);
  const dark = blocks.filter((b) => b.sel.startsWith(".dark"));
  const groups = new Map();
  for (const b of dark) {
    const key = JSON.stringify([b.ctx || "(top)", b.decls]);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(b);
  }
  const merges = [];
  const conflicts = [];
  for (const [, bs] of groups) {
    if (bs.length < 2) continue;
    bs.sort((a, b) => a.start - b.start);
    const declProps = bs[0].decls.map((d) => d.split(":")[0].trim());
    const propSet = new Set(declProps);
    const valOf = (d) => d.slice(d.indexOf(":") + 1).trim();
    const memberSels = bs.flatMap((b) => b.sel.split(",").map((s) => s.trim()));
    const memberSpecs = new Map(memberSels.map((s) => [s, specOf(s)]));
    const mid = blocks.filter(
      (b) => b.start > bs[0].end && b.end < bs[bs.length - 1].start && b.decls.some((d) => propSet.has(d.split(":")[0].trim()))
    );
    let hazard = null;
    for (const r of mid) {
      for (const d of r.decls) {
        const p = d.split(":")[0].trim();
        if (!propSet.has(p)) continue;
        const gv = bs[0].decls.find((x) => x.split(":")[0].trim() === p);
        if (!gv || valOf(d) === valOf(gv)) continue;
        const rs = specOf(r.sel);
        for (const ms of memberSels) {
          if (memberSpecs.get(ms) !== rs) continue;
          const rt = finalTokensOf(r.sel);
          const mt = finalTokensOf(ms);
          const co = rt.length === 0 || mt.length === 0 ? "bare final compound" : hazardsCoOccur(rt, mt);
          if (co) {
            hazard = { r: r.sel, ms, why: co };
            break;
          }
        }
        if (hazard) break;
      }
      if (hazard) break;
    }
    if (hazard) conflicts.push({ lines: bs.map((b) => b.start + 1), hazard });
    else merges.push({ lines: bs.map((b) => b.start + 1), members: bs.length, decls: bs[0].decls });
  }
  return { darkBlocks: dark.length, merges, conflicts };
}

module.exports = { analyze };

if (require.main === module) {
  const apply = process.argv.includes("--apply");
  run(apply);
}
