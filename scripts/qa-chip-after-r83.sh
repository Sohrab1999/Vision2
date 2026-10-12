#!/bin/bash
# Task 83 — AFTER probe: c-chip migration parity check.
# Same rich seed + same snapshot logic as qa-chip-before-r83.sh; the JSON
# must be byte-identical to scripts/r83-chip-baseline.json in BOTH themes.
set -u
cd /home/z/my-project
agent-browser close --all >/dev/null 2>&1
sleep 1
agent-browser open http://127.0.0.1:3000 >/dev/null 2>&1
sleep 4

agent-browser eval '(() => {
  const key = (n) => { const d = new Date(); d.setDate(d.getDate()-n); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; };
  localStorage.setItem("vision2-study-v1", JSON.stringify({ state: {
    streak: 4, bestStreak: 6, freezeCount: 1, freezeSavedDay: "", freezeUsedDays: [key(3)], freezeEarnedDay: key(10),
    goalMetDays: [key(1)], dailyGoal: 10,
    dayHistory: { [key(0)]: { day: key(0), reviews: 4, quizzes: 0, words: 0, dictation: 0, rush: 0 } },
    srs: { "1:ability": { k: "1:ability", level: 2, dueAt: Date.now() - 3600e3, lesson: 1 } }
  }, version: 0 }));
  return "seeded";
})()' 2>/dev/null
agent-browser reload >/dev/null 2>&1
sleep 4

agent-browser eval '(() => {
  const grab = (sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const s = getComputedStyle(el);
    return { border: s.borderTopColor, bg: s.backgroundColor, bgImg: s.backgroundImage, ink: s.color };
  };
  const flamePill = () => {
    const icon = document.querySelector("header .streak-flame");
    if (!icon) return null;
    const s = getComputedStyle(icon.closest("span"));
    return { border: s.borderTopColor, bg: s.backgroundColor, bgImg: s.backgroundImage, ink: s.color };
  };
  const snap = () => ({ goal: grab(".goal-chip"), freeze: grab(".freeze-badge"), due: grab(".due-pill"), flame: flamePill() });
  const light = snap();
  const btn = [...document.querySelectorAll("header button")].find(x => x.getAttribute("aria-label") === "حالت شب");
  btn?.click();
  return new Promise((res) => setTimeout(() => {
    const dark = snap();
    const back = [...document.querySelectorAll("header button")].find(x => x.getAttribute("aria-label") === "حالت روز");
    back?.click();
    res(JSON.stringify({ light, dark }));
  }, 700));
})()' 2>/dev/null > scripts/r83-chip-after.json

echo "--- parity diff (empty = byte-identical in BOTH themes)"
node -e '
const fs = require("fs");
const before = JSON.parse(fs.readFileSync("scripts/r83-chip-baseline.json", "utf8"));
const after = JSON.parse(fs.readFileSync("scripts/r83-chip-after.json", "utf8"));
let diffs = 0;
for (const theme of ["light", "dark"]) {
  for (const chip of ["goal", "freeze", "due", "flame"]) {
    const a = before[theme]?.[chip], b = after[theme]?.[chip];
    if (JSON.stringify(a) !== JSON.stringify(b)) {
      diffs++;
      console.log(`DIFF ${theme}/${chip}:`);
      console.log("  before:", JSON.stringify(a));
      console.log("  after :", JSON.stringify(b));
    }
  }
}
console.log(diffs === 0 ? "PARITY_OK — 8 surfaces byte-identical (4 chips × 2 themes)" : `PARITY_FAILED — ${diffs} diffs`);
'
agent-browser close --all >/dev/null 2>&1
echo "=== r83 AFTER probe end ==="
