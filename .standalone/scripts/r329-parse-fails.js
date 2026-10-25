// r329 — parse /tmp/r326-contrast-results.txt: per stage, list only FAIL groups
// (cr < need). Prints a compact table: stage | cr | need | n | bg | bgCls | ink | L
const fs = require("fs");
const raw = fs.readFileSync("/tmp/r326-contrast-results.txt", "utf8");
const lines = raw.split("\n");
let stage = "";
for (const line of lines) {
  const m = line.match(/^-- (.+)$/);
  if (m) { stage = m[1].trim(); continue; }
  if (!line.startsWith('"{\\"probed')) continue;
  let data;
  try { data = JSON.parse(JSON.parse(line)); } catch { continue; }
  const fails = (data.all || []).filter((g) => g.cr < g.need);
  console.log(`\n### ${stage}  probed=${data.probed} groups=${data.groups} fails=${fails.length}`);
  for (const g of fails) {
    console.log(
      `  cr=${String(g.cr).padEnd(6)} need=${g.need} n=${String(g.n).padEnd(3)} bg=${g.bg.padEnd(9)} bgCls=${String(g.bgCls).padEnd(16)} ink=${g.ink || "(inherited)"} L=${g.L}`
    );
  }
}
