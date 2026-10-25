#!/bin/bash
# Task 83 — BEFORE probe v2: baseline computed styles of the 4 header chips
# (goal / freeze / due / flame) in light + dark, one rich seed, ONE eval.
set -u
cd /home/z/my-project
agent-browser close --all >/dev/null 2>&1
sleep 1
agent-browser open http://127.0.0.1:3000 >/dev/null 2>&1
sleep 4

echo "--- seed rich learner (all 4 chips visible)"
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

echo "--- ONE-eval probe: light → dark → restore"
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
})()' 2>/dev/null > scripts/r83-chip-baseline.json
cat scripts/r83-chip-baseline.json | head -c 1500; echo ""

echo "--- console sanity (fresh reload)"
agent-browser reload >/dev/null 2>&1
sleep 3
agent-browser errors 2>/dev/null | head -4
agent-browser close --all >/dev/null 2>&1
echo "=== r83 BEFORE probe end ==="
