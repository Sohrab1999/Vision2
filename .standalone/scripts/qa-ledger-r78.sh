#!/bin/bash
# Task 78 live QA — freeze ledger in the weekly report, single session
set -u
cd /home/z/my-project
agent-browser close --all >/dev/null 2>&1
sleep 1
agent-browser open http://127.0.0.1:3000 >/dev/null 2>&1
sleep 4

open_report='(() => { window.dispatchEvent(new CustomEvent("open-report")); return "opened"; })()'
read_ledger='(() => {
  const l = document.querySelector(".freeze-ledger");
  return JSON.stringify({
    present: !!l,
    text: l?.textContent?.replace(/\s+/g, " ")?.slice(0, 140),
    ariaEqTitle: !l || l.getAttribute("aria-label") === l.getAttribute("title"),
    bars: l ? l.querySelectorAll(".bg-sky-500").length : -1
  });
})()'

echo "--- A. fresh learner: ledger «بی‌یخ» + «۰ از ۳» (report = full picture)"
agent-browser eval "$open_report" 2>/dev/null
sleep 1
agent-browser eval "$read_ledger" 2>/dev/null
agent-browser eval '(() => { document.querySelector("[aria-label=\"بستن\"]")?.click(); const b=[...document.querySelectorAll("button")].find(x=>x.textContent?.includes("بستن")); b?.click(); return "closed"; })()' 2>/dev/null

echo "--- B. seed stock 2 + 2 goal-met days → «۲ یخ در انبار» + «۲ از ۳» + 2 bars"
agent-browser eval '(() => {
  const key = (n) => { const d = new Date(); d.setDate(d.getDate()-n); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; };
  localStorage.setItem("vision2-study-v1", JSON.stringify({ state: {
    streak: 4, bestStreak: 6, freezeCount: 2, freezeSavedDay: "", freezeUsedDays: [], freezeEarnedDay: "", goalMetDays: [key(1), key(2)]
  }, version: 0 }));
  return "seeded";
})()' 2>/dev/null
agent-browser reload >/dev/null 2>&1
sleep 4
agent-browser eval "$open_report" 2>/dev/null
sleep 1
agent-browser eval "$read_ledger" 2>/dev/null

echo "--- C. seed rescue 3 days ago (1 freeze left) → rescue chip + goal dots intact"
agent-browser eval '(() => {
  const key = (n) => { const d = new Date(); d.setDate(d.getDate()-n); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; };
  localStorage.setItem("vision2-study-v1", JSON.stringify({ state: {
    streak: 4, bestStreak: 6, freezeCount: 1, freezeSavedDay: "", freezeUsedDays: [key(3)], freezeEarnedDay: key(10), goalMetDays: [key(1), key(2), key(4)]
  }, version: 0 }));
  return "seeded";
})()' 2>/dev/null
agent-browser reload >/dev/null 2>&1
sleep 4
agent-browser eval "$open_report" 2>/dev/null
sleep 1
agent-browser eval "$read_ledger" 2>/dev/null
agent-browser eval '(() => {
  const dots = document.querySelectorAll(".report-digest span[title]");
  return JSON.stringify({ goalDots: dots.length });
})()' 2>/dev/null

echo "--- D. dark: global sky bands on ledger chips (zero new dark rules)"
agent-browser eval '(() => {
  const btn = [...document.querySelectorAll("header button")].find(b => b.getAttribute("aria-label") === "حالت شب");
  btn?.click(); return btn ? "dark-toggled" : "btn-miss";
})()' 2>/dev/null
sleep 1
agent-browser eval '(() => {
  const chip = document.querySelector(".freeze-ledger span.bg-sky-50");
  if (!chip) return JSON.stringify({ miss: true });
  const cs = getComputedStyle(chip);
  return JSON.stringify({ theme: document.documentElement.className, bg: cs.backgroundColor, ink: cs.color, border: cs.borderTopColor });
})()' 2>/dev/null

echo "--- E. mobile 390: dialog fits, ledger wraps, page overflow 0"
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 1
agent-browser eval '(() => {
  const l = document.querySelector(".freeze-ledger");
  const dlg = document.querySelector(".report-dialog");
  return JSON.stringify({
    ledgerPresent: !!l,
    ledgerW: l ? Math.round(l.getBoundingClientRect().width) : 0,
    dlgW: dlg ? Math.round(dlg.getBoundingClientRect().width) : 0,
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
  });
})()' 2>/dev/null
agent-browser set viewport 1280 800 >/dev/null 2>&1

echo "--- F. fresh console after reload"
agent-browser reload >/dev/null 2>&1
sleep 4
agent-browser errors 2>/dev/null | head -4
agent-browser close --all >/dev/null 2>&1
echo "=== r78 QA end ==="
