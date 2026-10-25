// r326 — تحلیلگرِ خروجیِ سویپِ کنتراست — تفکیکِ مرحلهبهمرحله از نتایجِ راننده
//   ورودی: /tmp/r326-contrast-results.txt (هر مرحله: سطرِ JSON از sweep)
//   خروجی: برای هر مرحله — شمارشِ خطاها؛ خطاهایِ سخت (cr<3) با نمونه؛
//   گروههای مرزیِ 3-4.5 فقط برای چیپها (خانوادههای page-stone حذف میشوند).
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
      // خروجی eval ممکن است گاهی escape داشته باشد — تلاش دوم
      try {
        const j = JSON.parse(ln.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, "\\"));
        data[stage] = j;
      } catch (e2) { /* skip */ }
    }
  }
}
for (const [stage, j] of Object.entries(data)) {
  if (!j || !j.all) { console.log(`== ${stage}: (no sweep JSON)`); continue; }
  console.log(`\n== ${stage}: probed=${j.probed} groups=${j.groups} fails=${j.fails}`);
  const hard = j.all.filter((g) => g.cr < g.need && g.cr < 3 && !(g.bgCls === "page" && /stone/.test(g.ink || "")));
  for (const g of hard) {
    console.log(
      `  HARD cr=${g.cr} need=${g.need} n=${g.n} large=${g.L} bg=${g.bg}[${g.bgCls}] ink=${g.ink || "(default)"}`
    );
  }
  const border = j.all.filter(
    (g) => g.cr < g.need && g.cr >= 3 && g.bgCls !== "page" && !/^(stone|neutral|zinc)/.test(g.bgCls || "")
  );
  for (const g of border) {
    console.log(
      `  soft cr=${g.cr} need=${g.need} n=${g.n} large=${g.L} bg=${g.bg}[${g.bgCls}] ink=${g.ink || "(default)"}`
    );
  }
}
