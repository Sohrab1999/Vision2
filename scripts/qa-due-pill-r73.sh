#!/bin/bash
# Round 73 live QA — header due pill (SRS due visibility) + palette relabel
# States: absent (empty srs) → seeded 5 due (3×L1 + 2×L2 + 1 future) → present
# Click → lesson-1 smart tab (openLesson one-tap) + srs_due_pill event.
# Dark: solid rose flips via global bands (no scoped rules). Mobile 390 compact.
set -u
cd /home/z/my-project
echo "=== r73 QA start $(date +%T) ==="
echo "--- DB snapshot BEFORE"
node -e '
const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
p.eventDay.findMany({ where: { day: "2026-10-12", name: { in: ["app_open","lesson_open","srs_due_pill","srs_due_review"] } }, orderBy: { name: "asc" } })
  .then(rows => { for (const r of rows) console.log(`${r.name}=${r.count}`); return p.$disconnect(); })
  .catch(e => { console.error(e.message); process.exit(1); });' 2>/dev/null

agent-browser close --all >/dev/null 2>&1
sleep 1
agent-browser open http://127.0.0.1:3000 >/dev/null 2>&1
sleep 4

set_persist_srs() {
  agent-browser eval "(() => {
    const KEY = 'vision2-study-v1';
    const raw = localStorage.getItem(KEY);
    if (!raw) return 'no-persist';
    const obj = JSON.parse(raw);
    obj.state = obj.state || {};
    obj.state.srs = $1;
    obj.version = 0;
    localStorage.setItem(KEY, JSON.stringify(obj));
    return 'seeded:' + Object.keys(obj.state.srs).length;
  })()" 2>/dev/null | head -2
}
due_pill_probe() {
  agent-browser eval '(() => {
    const pill = document.querySelector(".due-pill");
    if (!pill) return JSON.stringify({present: false});
    const cs = getComputedStyle(pill);
    return JSON.stringify({present: true, text: (pill.textContent||"").trim(),
      title: (pill.getAttribute("title")||"").slice(0,70),
      bg: cs.backgroundColor, color: cs.color, border: cs.borderTopColor});
  })()' 2>/dev/null | head -4
}

echo "--- 1. empty srs → pill ABSENT"
set_persist_srs "{}"
agent-browser reload >/dev/null 2>&1
sleep 4
due_pill_probe

echo "--- 2. seed 5 due (3×L1, 2×L2) + 1 future → pill present, count ۵, title درس ۱"
set_persist_srs '{
  "1:ability": {level: 0, dueAt: 1700000000000},
  "1:access": {level: 1, dueAt: 1700000001000},
  "1:achieve": {level: 2, dueAt: 1700000002000},
  "2:accept": {level: 0, dueAt: 1700000003000},
  "2:active": {level: 1, dueAt: 1700000004000},
  "2:actual": {level: 1, dueAt: 9999999999999}
}'
agent-browser reload >/dev/null 2>&1
sleep 4
due_pill_probe

echo "--- 3. click pill → lesson-1 smart tab (flashcards) + header persists"
agent-browser eval '(() => { const p = document.querySelector(".due-pill"); if (!p) return "no-pill"; p.click(); return "clicked"; })()' 2>/dev/null | head -2
sleep 3
agent-browser eval '(() => {
  const flip = document.querySelector("[aria-label=\"برگرداندن کارت\"]");
  const lessonHead = (document.body.textContent||"").includes("Understanding People");
  return JSON.stringify({flipBtn: !!flip, lesson1Heading: lessonHead, pillStill: !!document.querySelector(".due-pill")});
})()' 2>/dev/null | head -3

echo "--- 4. dark flip (app night toggle) → rose bands"
agent-browser eval '(() => { const b = [...document.querySelectorAll("button")].find(x => (x.getAttribute("aria-label")||"") === "حالت شب"); if (!b) return "no-toggle"; b.click(); return "dark-on"; })()' 2>/dev/null | head -2
sleep 1.5
due_pill_probe

echo "--- 5. light back + palette relabel «مرور سریع»"
agent-browser eval '(() => { const b = [...document.querySelectorAll("button")].find(x => (x.getAttribute("aria-label")||"") === "حالت روشن"); if (b) b.click(); return "light"; })()' 2>/dev/null | head -2
sleep 1
agent-browser press Control+k >/dev/null 2>&1
sleep 1
agent-browser eval '(() => {
  const inp = document.querySelector(".command-palette input");
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
  setter.call(inp, "مرور سریع");
  inp.dispatchEvent(new Event("input", { bubbles: true }));
  return "typed";
})()' 2>/dev/null | head -2
sleep 1
agent-browser eval '(() => {
  const opts = [...document.querySelectorAll(".command-palette [role=option]")];
  return JSON.stringify({n: opts.length, first: opts[0]?.textContent?.slice(0, 55) ?? null});
})()' 2>/dev/null | head -3
agent-browser press Escape >/dev/null 2>&1
sleep 0.5

echo "--- 6. mobile 390: compact pill (short label) + overflow 0"
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 1
agent-browser eval '(() => {
  const pill = document.querySelector(".due-pill");
  return JSON.stringify({
    text: pill ? (pill.textContent||"").trim() : null,
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
  });
})()' 2>/dev/null | head -3
agent-browser set viewport 1280 800 >/dev/null 2>&1

echo "--- 7. fresh console after reload"
agent-browser reload >/dev/null 2>&1
sleep 4
agent-browser errors 2>/dev/null | head -4
agent-browser close --all >/dev/null 2>&1

echo "--- DB snapshot AFTER"
node -e '
const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
p.eventDay.findMany({ where: { day: "2026-10-12", name: { in: ["app_open","lesson_open","srs_due_pill","srs_due_review"] } }, orderBy: { name: "asc" } })
  .then(rows => { for (const r of rows) console.log(`${r.name}=${r.count}`); return p.$disconnect(); })
  .catch(e => { console.error(e.message); process.exit(1); });' 2>/dev/null
echo "=== r73 QA end $(date +%T) ==="
