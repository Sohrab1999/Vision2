// r328 — استخراجِ گروههایِ مردودِ باقیمانده از خروجیِ سویپِ پساترمیم
//   ورودی: /tmp/r328-sweep-run.log — خروجی: برای هر مرحله، گروههایِ
//   cr<need با نمونهها (سقف ۶ گروه) برای داوریِ راند.
"use strict";
const fs = require("fs");
const raw = fs.readFileSync("/tmp/r328-sweep-run.log", "utf8");
const lines = raw.split("\n");
let stage = null;
for (const ln of lines) {
  const st = ln.match(/^--\s+(.+)$/);
  if (st) { stage = st[1]; continue; }
  if (!stage || !(ln.startsWith('"{') || ln.startsWith("{"))) continue;
  try {
    const j = JSON.parse(ln.replace(/^"|"$/g, "").replace(/\\"/g, '"'));
    if (!j || typeof j.fails !== "number") continue;
    console.log(`\n==== ${stage} — fails=${j.fails} probed=${j.probed}`);
    const fails = (j.all || []).filter((g) => {
      const need = g.L ? 3 : 4.5;
      return g.cr < need;
    });
    for (const g of fails.slice(0, 12)) {
      console.log(`  cr=${g.cr} need=${g.L ? 3 : 4.5} n=${g.n} bg=${g.bg} ink=${g.ink || "(default)"}`);
    }
    stage = null;
  } catch (e) { /* not json */ }
}
