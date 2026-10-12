#!/bin/bash
# Tranche 3b probe — computed styles of tokenized-shade consumers in dark mode.
# Usage: bash scripts/qa-tint-probe-r80.sh /tmp/tint-before.json
set -u
OUT="${1:?usage: qa-tint-probe-r80.sh <out.json>}"
cd /home/z/my-project
agent-browser close --all >/dev/null 2>&1
sleep 1
agent-browser open http://127.0.0.1:3000 >/dev/null 2>&1
sleep 4
# seed a rich learner (srs panel + goal chip + freeze badge + due pill + partial dot)
agent-browser eval '(() => {
  const key = (n) => { const d = new Date(); d.setDate(d.getDate()-n); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; };
  localStorage.setItem("vision2-study-v1", JSON.stringify({ state: {
    streak: 4, bestStreak: 6, freezeCount: 1, freezeSavedDay: "", freezeUsedDays: [key(3)], freezeEarnedDay: key(10),
    goalMetDays: [key(1)], dailyGoal: 10,
    dayHistory: { [key(0)]: { day: key(0), reviews: 4, quizzes: 0, words: 0, dictation: 0, rush: 0 } },
    srs: { "1:ability": { k: "1:ability", level: 2, dueAt: Date.now() - 3600e3, lesson: 1 } }
  }, version: 0 }));
  return "seeded";
})()' >/dev/null 2>&1
agent-browser reload >/dev/null 2>&1
sleep 4
agent-browser eval '(() => { const btn = [...document.querySelectorAll("header button")].find(b => b.getAttribute("aria-label") === "حالت شب"); btn?.click(); return btn ? "dark" : "miss"; })()' >/dev/null 2>&1
sleep 1
agent-browser eval '(() => {
  const grab = (sel, props) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const cs = getComputedStyle(el);
    const out = {};
    for (const p of props) out[p] = cs.getPropertyValue(p);
    return out;
  };
  const data = {
    freezeBadgeBg: grab(".freeze-badge", ["background-color"]),
    freezeBadgeBorder: grab(".freeze-badge", ["border-top-color"]),
    goalChipBg: grab(".goal-chip", ["background-color"]),
    emeraldBorder: grab("[class*=\"border-emerald-200\"]", ["border-top-color"]),
    duePill: grab(".due-pill", ["border-top-color"]),
    amberDot: grab(".bg-amber-200", ["background-color"]),
    heroGlow: grab(".bg-emerald-200\\/40", ["background-color"]),
    srsRose: grab(".srs-panel .bg-rose-50", ["background-color"]),
    srsAmber: grab(".srs-panel .bg-amber-50", ["background-color"]),
    srsEmerald: grab(".srs-panel .bg-emerald-50", ["background-color"]),
    srsFxBar: grab(".srs-fx-bar", ["background-image"]),
    ledgerChip: grab(".freeze-ledger span.bg-sky-50", ["background-color"]),
    tealKeep: grab(".srs-panel .border-teal-200", ["border-top-color"])
  };
  // report dialog: open + probe ledger chip too
  window.dispatchEvent(new CustomEvent("open-report"));
  return JSON.stringify(data);
})()' 2>/dev/null > "$OUT"
sleep 1
agent-browser eval '(() => {
  const el = document.querySelector(".freeze-ledger span.bg-sky-50");
  const cs = el ? getComputedStyle(el) : null;
  return JSON.stringify({ reportLedgerChipBg: cs ? cs.backgroundColor : null });
})()' 2>/dev/null >> "$OUT"
agent-browser close --all >/dev/null 2>&1
echo "probe written: $OUT"
