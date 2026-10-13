const fs = require("fs");

function analyze(file = "src/app/globals.css") {
  const fs = require("fs");
  const src = fs.readFileSync(file, "utf8");
  const lines = src.split("\n");

  const blocks = [];
  const stack = [];
  let depth = 0;
  let cur = null;

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
      cur = { sel: header, start: i + 1, decls: [normDecl(line.slice(line.indexOf("{") + 1))] };
      depth += opens - closes;
      if (depth <= 0) {
        const d = cur.decls.join("");
        blocks.push({ ctx: stack.join(" & ") || "(top)", sel: cur.sel, start: cur.start, decls: d.split(";").filter(Boolean).map((x) => x + ";").map(normDecl) });
        cur = null; depth = 0;
      }
      continue;
    }
    if (cur) {
      const bodyPart = closes > 0 ? line.slice(0, line.lastIndexOf("}")) : line;
      for (const d of bodyPart.split(";")) { const n = normDecl(d); if (n && n !== "}") cur.decls.push(n.endsWith(";") ? n : n + ";"); }
      depth += opens - closes;
      if (depth <= 0) {
        blocks.push({ ctx: stack.join(" & ") || "(top)", sel: cur.sel, start: cur.start, decls: cur.decls.filter((d) => d !== "};") });
        cur = null;
        depth = 0;
        stack.length = 0;
      }
    } else {
      depth += opens - closes;
      if (closes > 0 && depth <= 0) { depth = 0; stack.length = 0; }
    }
  }

  const sig = (b) => `${b.ctx} :: ${b.sel} :: ${b.decls.slice().sort().join(" ")}`;
  const groups = new Map();
  for (const b of blocks) { const k = sig(b); { const arr = groups.get(k) ?? []; arr.push(b); groups.set(k, arr); }; }

  let removable = 0;
  console.log("=== EXACT duplicates (selector+context+decls identical) → safe to keep LAST only ===");
  for (const [k, bs] of groups) {
    if (bs.length < 2) continue;
    removable += bs.length - 1;
    console.log(`x${bs.length}  L${bs.map((b) => b.start).join(",L")}  ${k.split(" :: ").slice(0, 2).join(" :: ")}`);
  }
  console.log(`\nremovable rule blocks: ${removable}`);
  const selGroups = new Map();
  for (const b of blocks) { const k = `${b.ctx} :: ${b.sel}`; { const arr = selGroups.get(k) ?? []; arr.push(b); selGroups.set(k, arr); }; }
  console.log("\n=== same selector+context, different decls (value evolution — keep both) ===");
  for (const [k, bs] of selGroups) {
    if (bs.length < 2) continue;
    const sigs = new Set(bs.map(sig));
    if (sigs.size > 1) console.log(`x${bs.length}  L${bs.map((b) => b.start).join(",L")}  ${k}`);
  }
  console.log(`\ntotal rule blocks parsed: ${blocks.length}`);

  return { blocks, groups, sig, removable };
}

module.exports = { analyze };

if (require.main === module) {
  const a = analyze();
  // report
  let removable = 0;
  console.log("=== EXACT duplicates (selector+context+decls identical) ===");
  const seen = new Map();
  for (const [k, bs] of a.groups) { if (bs.length < 2) continue; removable += bs.length - 1; console.log(`x${bs.length}  L${bs.map(b=>b.start).join(",L")}  ${k.split(" :: ").slice(0,2).join(" :: ")}`); }
  console.log(`removable rule blocks: ${removable}`);
  console.log(`total rule blocks parsed: ${a.blocks.length}`);
  if (process.argv.includes("--apply")) {
    const fs2 = require("fs");
    const lines = fs2.readFileSync("src/app/globals.css", "utf8").split("\n");
    const toDelete = [];
    for (const [, bs] of a.groups) {
      if (bs.length < 2) continue;
      const sigs = new Map();
      for (const b of bs) { const s2 = a.sig(b); const arr = sigs.get(s2) ?? []; arr.push(b); sigs.set(s2, arr); }
      for (const [, group] of sigs) { if (group.length < 2) continue; for (let i = 0; i < group.length - 1; i++) toDelete.push(group[i]); }
    }
    toDelete.sort((x, y) => y.start - x.start);
    const out = lines.slice();
    for (const b of toDelete) {
      let end = b.start - 1, d = 0;
      for (let i = b.start - 1; i < lines.length; i++) { d += (lines[i].match(/{/g) || []).length - (lines[i].match(/}/g) || []).length; if (d <= 0) { end = i; break; } }
      out.splice(b.start - 1, end - (b.start - 1) + 1);
    }
    fs2.writeFileSync("src/app/globals.css", out.join("\n"));
    console.log(`APPLIED: removed ${toDelete.length} duplicate blocks`);
  }
}
