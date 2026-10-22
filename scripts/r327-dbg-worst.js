// r327 — استخراجِ شناسنامهٔ گروههایِ سخت از خروجیِ سویپِ r326 (فیلدِ worst.dbg)
//   ورودی: /tmp/r326-contrast-results.txt — خروجی: برای هر مرحله، گروههایِ
//   cr<3 با نمونهٔ متن + کلاسِ سطح + گرادیان + جوهرِ محاسبهشده.
"use strict";
const fs = require("fs");
const raw = fs.readFileSync("/tmp/r326-contrast-results.txt", "utf8");
const lines = raw.split("\n");
let stage = null;
let section = null;
const data = {};
for (const ln of lines) {
  const sec = ln.match(/^#{5,}\s*(.+?)\s*#{5,}$/);
  if (sec) { section = sec[1]; continue; }
  const st = ln.match(/^--\s+(.+)$/);
  if (st) { stage = (section ? section + " · " : "") + st[1]; continue; }
  if (!stage) continue;
  if (ln.startsWith('"{') || ln.startsWith("{")) {
    try {
      const j = JSON.parse(ln.replace(/^"|"$/g, "").replace(/\\"/g, '"'));
      data[stage] = j;
    } catch (e) {
      try {
        const j = JSON.parse(ln.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, "\\"));
        data[stage] = j;
      } catch (e2) { /* skip */ }
    }
  }
}
const only = process.argv[2] || "";
for (const [stage, j] of Object.entries(data)) {
  if (only && !stage.includes(only)) continue;
  if (!j || !j.worst) { console.log(`== ${stage}: (no worst field)`); continue; }
  console.log(`\n======== ${stage} — hard groups: ${j.worst.length}`);
  for (const w of j.worst) {
    const d = w.dbg || {};
    console.log(`  cr=${w.cr} n=${w.n} bg=${w.bg} inkCls=${w.inkCls || "(default)"}`);
    console.log(`    sample="${(d.sample || "").replace(/\s+/g, " ").slice(0, 40)}" ink=${d.ink} fs=${d.fs} fw=${d.fw}`);
    console.log(`    surfCls="${(d.surfCls || "").slice(0, 88)}"`);
    console.log(`    gradCls="${(d.gradCls || "").slice(0, 88)}"`);
    console.log(`    surfImg="${(d.surfImg || "").slice(0, 110)}"`);
  }
}
