// r329 — pretty-print dbg failsList per stage from /tmp/r329-dbg-results.txt
const fs = require("fs");
const raw = fs.readFileSync("/tmp/r329-dbg-results.txt", "utf8");
let stage = "";
for (const line of raw.split("\n")) {
  const m = line.match(/^########## STAGE\d+\. (.+?) \(dbg\)/);
  if (m) { stage = m[1].trim(); continue; }
  if (!line.startsWith('"{\\"probed')) continue;
  let d;
  try { d = JSON.parse(JSON.parse(line)); } catch { continue; }
  console.log(`\n============ ${stage}  probed=${d.probed} fails=${d.fails}`);
  for (const g of d.failsList) {
    const db = g.dbg || {};
    console.log(`  cr=${g.cr} n=${g.n} bg=${g.bg} ink=${g.inkCls || db.ink || "?"}`);
    console.log(`     sample="${(g.samples || []).join('" | "')}"`);
    console.log(`     surfCls=${(db.surfCls || "").slice(0, 110)}`);
    if (db.surfImg) console.log(`     surfImg=${db.surfImg.slice(0, 110)}`);
  }
}
