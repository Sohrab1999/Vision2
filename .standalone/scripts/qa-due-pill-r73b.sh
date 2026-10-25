#!/bin/bash
# Round 73 live QA — attempt 2: full-persist seeding (zustand persist only
# writes the key after first action; empty sessions have no key to mutate).
set -u
cd /home/z/my-project
echo "=== r73 QA-B start $(date +%T) ==="
agent-browser close --all >/dev/null 2>&1
sleep 1
agent-browser open http://127.0.0.1:3000 >/dev/null 2>&1
sleep 4

seed_persist() {
  agent-browser eval "(() => {
    localStorage.setItem('vision2-study-v1', JSON.stringify({ state: { srs: $1 }, version: 0 }));
    return 'written';
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
seed_persist "{}"
agent-browser reload >/dev/null 2>&1
sleep 4
due_pill_probe

echo "--- 2. seed 5 due (3×L1, 2×L2) + 1 future → pill present, ۵, title درس ۱"
seed_persist '{
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

echo "--- 3. click pill → lesson-1 smart flashcards (flip button) + pill persists"
agent-browser eval '(() => { const p = document.querySelector(".due-pill"); if (!p) return "no-pill"; p.click(); return "clicked"; })()' 2>/dev/null | head -2
sleep 3
agent-browser eval '(() => JSON.stringify({
  flipBtn: !!document.querySelector("[aria-label=\"برگرداندن کارت\"]"),
  pillStill: !!document.querySelector(".due-pill")
}))()' 2>/dev/null | head -3

echo "--- 4. dark flip (app night toggle) → rose bands on pill"
agent-browser eval '(() => { const b = [...document.querySelectorAll("button")].find(x => (x.getAttribute("aria-label")||"") === "حالت شب"); if (!b) return "no-toggle"; b.click(); return "dark-on"; })()' 2>/dev/null | head -2
sleep 1.5
due_pill_probe

echo "--- 5. light back"
agent-browser eval '(() => { const b = [...document.querySelectorAll("button")].find(x => (x.getAttribute("aria-label")||"") === "حالت روشن"); if (b) b.click(); return "light"; })()' 2>/dev/null | head -2
sleep 1

echo "--- 6. mobile 390: compact pill (short ۵) + overflow 0"
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
echo "=== r73 QA-B end $(date +%T) ==="
