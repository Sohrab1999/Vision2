#!/bin/bash
# Task 88 — phase 5 alpha veil (bg-white/80|50|95) parity probe.
# Usage: bash scripts/qa-veil5-probe-r88.sh <out.json>
# Light+dark computed background-color of every phase-5 consumer group,
# transitions killed. Selectors match raw utilities AND c-veil classes.
set -u
OUT="${1:?usage: qa-veil5-probe-r88.sh <out.json>}"
cd /home/z/my-project
agent-browser close --all >/dev/null 2>&1
sleep 1
agent-browser open http://127.0.0.1:3000 >/dev/null 2>&1
sleep 4

# learner with rushBest (banner chip) + srs due word (donut + due-chip)
agent-browser eval '(() => {
  const key = (n) => { const d = new Date(); d.setDate(d.getDate()-n); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; };
  localStorage.setItem("vision2-study-v1", JSON.stringify({ state: {
    streak: 4, bestStreak: 6, rushBest: 120, rushBestCorrect: 8, rushGames: 3, dailyGoal: 10,
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
  // deterministic start: back home
  click(b => b.textContent?.includes("خانه"));
  await sleep(1500);
  // home: rush-banner record chip (80, scoped 0.85), srs donut (50 own dark), srs due-chip (50 own dark), srs raw 50s
  data.bannerChip80 = grab(".rush-banner [class*=\"bg-white/80\"], .rush-banner [class*=\"c-veil-80\"]");
  data.srsDonut = grab(".srs-donut");
  data.srsDueChip = grab(".srs-due-chip");
  data.srsPlain50 = grab(".srs-panel [class*=\"bg-white/50\"], .srs-panel [class*=\"c-veil-50\"]");
  // rush view: hero instruction rows (80, scoped 0.85)
  data.navRush = click(b => b.textContent?.includes("شروع چالش"));
  await sleep(1800);
  data.rushHero80 = grab(".rush-hero [class*=\"bg-white/80\"], .rush-hero [class*=\"c-veil-80\"]");
  // spell view: same rows
  data.navSpell = click(b => b.getAttribute("role") === "tab" && b.textContent?.includes("املا"));
  await sleep(1800);
  data.spellHero80 = grab(".rush-hero [class*=\"bg-white/80\"], .rush-hero [class*=\"c-veil-80\"]");
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
