#!/bin/bash
# Round 72 live QA — snap path visible in real UI (bug fix: raw-number keyword)
# «آزمون ۱۵» → 1 option «آزمون جامع ۱۰ سؤالی» → exam view chip ۱۰ (bare semantics)
# «هدف ۱۲» → «هدف روزانه: ۱۰ فعالیت» instant; «کنکور ۲۵ بدون زمان» → ۲۰ تستی untimed
# Regression: exact values («آزمون ۲۰») unchanged. Mobile 390 + fresh console + DB snapshot.
set -u
cd /home/z/my-project
echo "=== r72 QA start $(date +%T) ==="
echo "--- DB snapshot BEFORE"
node -e '
const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
p.eventDay.findMany({ where: { day: "2026-10-12" }, orderBy: { name: "asc" } })
  .then(rows => { for (const r of rows) console.log(`${r.name}=${r.count}`); return p.$disconnect(); })
  .catch(e => { console.error(e.message); process.exit(1); });' 2>/dev/null

agent-browser close --all >/dev/null 2>&1
sleep 1
agent-browser open http://127.0.0.1:3000 >/dev/null 2>&1
sleep 4

type_query() {
  agent-browser eval "(() => {
    const inp = document.querySelector('.command-palette input');
    if (!inp) return 'no-input';
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    setter.call(inp, '$1');
    inp.dispatchEvent(new Event('input', { bubbles: true }));
    return 'typed';
  })()" 2>/dev/null | head -2
  sleep 1
}
palette_probe() {
  agent-browser eval '(() => {
    const opts = [...document.querySelectorAll(".command-palette [role=option]")];
    return JSON.stringify({n: opts.length, first: opts[0]?.textContent?.slice(0, 60) ?? null});
  })()' 2>/dev/null | head -3
}

echo "--- 1. «آزمون ۱۵» → 1 option, label ۱۰ سؤالی"
agent-browser press Control+k >/dev/null 2>&1
sleep 1
type_query "آزمون ۱۵"
palette_probe
agent-browser press Enter >/dev/null 2>&1
sleep 3
echo "--- 2. exam view: chip state (۱۰ active expected, timed default kept)"
agent-browser eval '(() => {
  const btns = [...document.querySelectorAll("button")];
  const chips = btns.filter(b => /^(۱۰|۲۰|۳۰)( تست)?$/.test((b.textContent||"").trim()))
    .map(b => ({t: (b.textContent||"").trim(), active: /emerald/.test(b.className||"")}));
  const timed = btns.find(b => (b.textContent||"").startsWith("با تایمر ("));
  const untimed = btns.find(b => (b.textContent||"").trim() === "بدون تایمر");
  return JSON.stringify({
    url: location.pathname + "#" + (location.hash||""),
    chips,
    timedActive: timed ? /emerald/.test(timed.className) : "missing",
    untimedActive: untimed ? /emerald/.test(untimed.className) : "missing"
  });
})()' 2>/dev/null | head -4

echo "--- 3. home via palette «خانه», then «هدف ۱۲» instant (no nav)"
agent-browser press Control+k >/dev/null 2>&1
sleep 0.6
type_query "خانه"
agent-browser press Enter >/dev/null 2>&1
sleep 2
agent-browser press Control+k >/dev/null 2>&1
sleep 0.6
type_query "هدف ۱۲"
palette_probe
agent-browser press Enter >/dev/null 2>&1
sleep 1.5
agent-browser eval '(() => {
  const raw = localStorage.getItem("vision2-study-v1") || "";
  const m = raw.match(/"dailyGoal":(\d+)/);
  return JSON.stringify({dailyGoal: m ? m[1] : null, paletteClosed: !document.querySelector(".command-palette input")});
})()' 2>/dev/null | head -3

echo "--- 4. «کنکور ۲۵ بدون زمان» → ۲۰ تستی + untimed (tie→lower + timing)"
agent-browser press Control+k >/dev/null 2>&1
sleep 0.6
type_query "کنکور ۲۵ بدون زمان"
palette_probe
agent-browser press Enter >/dev/null 2>&1
sleep 3
agent-browser eval '(() => {
  const btns = [...document.querySelectorAll("button")];
  const chips = btns.filter(b => /^(۱۰|۲۰|۳۰)( تست)?$/.test((b.textContent||"").trim()))
    .map(b => ({t: (b.textContent||"").trim(), active: /emerald|amber/.test(b.className||"")}));
  const untimed = btns.find(b => (b.textContent||"").trim() === "بدون تایمر");
  const timed = btns.find(b => (b.textContent||"").startsWith("با تایمر ("));
  return JSON.stringify({
    chips,
    untimedActive: untimed ? /emerald|amber/.test(untimed.className) : "missing",
    timedActive: timed ? /emerald|amber/.test(timed.className) : "missing"
  });
})()' 2>/dev/null | head -4

echo "--- 5. regression: exact «آزمون ۲۰» (no raw keyword needed)"
agent-browser press Control+k >/dev/null 2>&1
sleep 0.6
type_query "آزمون ۲۰"
palette_probe
agent-browser press Escape >/dev/null 2>&1
sleep 0.5
echo "--- 6. empty query: top-level 22 options, 5 groups"
agent-browser press Control+k >/dev/null 2>&1
sleep 0.6
agent-browser eval '(() => {
  const opts = [...document.querySelectorAll(".command-palette [role=option]")];
  return JSON.stringify({opts: opts.length});
})()' 2>/dev/null | head -2
agent-browser press Escape >/dev/null 2>&1
sleep 0.5

echo "--- 7. mobile 390 overflow"
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 1
agent-browser eval '(() => JSON.stringify({overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth}))()' 2>/dev/null | head -2
agent-browser set viewport 1280 800 >/dev/null 2>&1

echo "--- 8. fresh console after reload"
agent-browser reload >/dev/null 2>&1
sleep 4
agent-browser errors 2>/dev/null | head -4
agent-browser close --all >/dev/null 2>&1

echo "--- DB snapshot AFTER"
node -e '
const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
p.eventDay.findMany({ where: { day: "2026-10-12" }, orderBy: { name: "asc" } })
  .then(rows => { for (const r of rows) console.log(`${r.name}=${r.count}`); return p.$disconnect(); })
  .catch(e => { console.error(e.message); process.exit(1); });' 2>/dev/null
echo "=== r72 QA end $(date +%T) ==="
