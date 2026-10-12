#!/bin/bash
# Task 89 — BEFORE probe: stone-50/60|70 computed values (light+dark), all sites
# + r88 sentinels (no-regression) + smoke nav + fresh console.
# Usage: bash scripts/qa-stone-before-r89.sh <out.json>
set -u
OUT="${1:?usage: qa-stone-before-r89.sh <out.json>}"
cd /home/z/my-project
agent-browser close --all >/dev/null 2>&1
sleep 1
agent-browser open http://127.0.0.1:3000 >/dev/null 2>&1
sleep 4

# minimal learner: home + srs due word (skill panel) + day history
agent-browser eval '(() => {
  const key = (n) => { const d = new Date(); d.setDate(d.getDate()-n); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; };
  localStorage.setItem("vision2-study-v1", JSON.stringify({ state: {
    streak: 4, bestStreak: 6, dailyGoal: 10,
    dayHistory: { [key(0)]: { day: key(0), reviews: 4, quizzes: 0, words: 0, dictation: 0, rush: 0 } },
    srs: { "1:ability": { k: "1:ability", level: 2, dueAt: Date.now() - 3600e3, lesson: 1 } }
  }, version: 0 }));
  return "seeded";
})()' >/dev/null 2>&1
agent-browser reload >/dev/null 2>&1
sleep 4

SWEEP='(async () => {
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  const kill = () => { const st = document.createElement("style"); st.textContent = "*,*::before,*::after{transition:none!important;animation:none!important}"; document.head.appendChild(st); return st; };
  const grab = (sel) => [...document.querySelectorAll(sel)].map(el => getComputedStyle(el).backgroundColor);
  const click = (pred) => { const b = [...document.querySelectorAll("button, a")].find(pred); if (b) { b.click(); return true; } return false; };
  const st = kill();
  const data = {};
  click(b => b.textContent?.includes("خانه"));
  await sleep(1500);
  // global sweep — every stone-50 alpha site currently mounted on home/settings/srs
  data.allStone60 = grab("[class*=\"bg-stone-50/60\"]");
  data.allStone70 = grab("[class*=\"bg-stone-50/70\"]");
  // r88 sentinels (phase 5 must stay byte-identical)
  data.sentinelBanner80 = grab(".rush-banner [class*=\"c-veil-80\"]");
  data.sentinelDonut = grab(".srs-donut");
  // skill-panel stone-50/60 (scoped dark 28,25,23/0.6)
  data.skillStone60 = grab(".skill-panel [class*=\"bg-stone-50/60\"]");
  await sleep(400);
  st.remove();
  return JSON.stringify(data);
})()'

echo "--- LIGHT sweep"
agent-browser eval "$SWEEP" 2>/dev/null | tee "${OUT}.light"

agent-browser eval '(() => { const btn = [...document.querySelectorAll("header button")].find(b => b.getAttribute("aria-label") === "حالت شب"); btn?.click(); return btn ? "dark" : "miss"; })()' >/dev/null 2>&1
sleep 2

echo "--- DARK sweep"
agent-browser eval "$SWEEP" 2>/dev/null | tee "${OUT}.dark"

agent-browser close --all >/dev/null 2>&1
echo "PROBE_DONE"
