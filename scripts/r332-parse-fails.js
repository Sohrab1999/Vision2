// r332 — parse /tmp/r332-recheck.txt: per stage, list only FAIL groups
// (cr < need) from the r328 dbg JSON. Compact table: stage | cr | need | n | bg | bgCls | ink | L
const fs = require("fs");
const raw = fs.readFileSync("/tmp/r332-recheck.txt", "utf8");
const lines = raw.split("\n");
let stage = "";
for (const line of lines) {
  const m = line.match(/^-- (.+)$/);
  if (m) { stage = m[1].trim(); continue; }
  if (!line.includes("failsList")) continue;
  let data;
  try {
    data = JSON.parse(line);
    if (typeof data === "string") data = JSON.parse(data);
  } catch { continue; }
  const fails = data.failsList || [];
  console.log(`\n### ${stage}  probed=${data.probed} fails=${data.fails}`);
  for (const g of fails) {
    console.log(
      `  cr=${String(g.cr).padEnd(6)} need=${g.need} n=${String(g.n).padEnd(3)} bg=${g.bg.padEnd(9)} bgCls=${String(g.bgCls).padEnd(16)} ink=${g.inkCls || "(inherited)"} L=${g.large ? "L" : "N"} :: ${JSON.stringify(g.samples).slice(0, 110)}`
    );
    if (g.dbg) {
      console.log(`     dbg: ink=${g.dbg.ink} fs=${g.dbg.fs} fw=${g.dbg.fw} surfCls=${String(g.dbg.surfCls).slice(0, 90)}`);
    }
  }
}
