#!/bin/bash
# Task 87 — c-veil-60/70 (tranche 4 phase 4) parity probe.
# Usage: bash scripts/qa-veil-probe-r87.sh <out.json>
# Probes computed background-color of every bg-white/60|70 consumer group,
# light+dark, transitions killed (r85 lesson). Works BEFORE and AFTER migration
# (selectors match both the raw utilities and the semantic classes).
set -u
OUT="${1:?usage: qa-veil-probe-r87.sh <out.json>}"
cd /home/z/my-project
agent-browser close --all >/dev/null 2>&1
sleep 1
agent-browser open http://127.0.0.1:3000 >/dev/null 2>&1
sleep 4

# rich learner: goal + freeze + srs due word (due-preview + srs strips render)
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

SWEEP='(async () => {
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  const kill = () => { const st = document.createElement("style"); st.textContent = "*,*::before,*::after{transition:none!important;animation:none!important}"; document.head.appendChild(st); return st; };
  const grab = (sel) => [...document.querySelectorAll(sel)].map(el => getComputedStyle(el).backgroundColor);
  const click = (pred) => { const b = [...document.querySelectorAll("button, a")].find(pred); if (b) { b.click(); return true; } return false; };
  const st = kill();
  const data = {};
  // 1. home: footer(60 default), feed(70 default), srs trio(0.8), due-preview/fx-expand(0.8 own rules)
  data.footer60 = grab(".footer-band");
  data.feed70 = grab("[class*=\"border-emerald-100\"][class*=\"bg-white/70\"], [class*=\"border-emerald-100\"][class*=\"c-veil-70\"]");
  data.srs70 = grab(".srs-panel [class*=\"bg-white/70\"], .srs-panel [class*=\"c-veil-70\"]");
  data.duePreview = grab(".srs-due-preview");
  data.fxExpand = grab(".srs-fx-expand");
  // 2. grammar: lesson-badge(0.6 stone-800 own rule), probe-note(70 default)
  data.navGrammar = click(b => b.textContent?.includes("متروی گرامر"));
  await sleep(1800);
  data.gmetroBadge = grab(".gmetro-lesson-badge");
  data.gmetroNote = grab(".gmetro-probe-note");
  // 3. rush quiz chip(0.85 via rush-hero)
  data.navRush = click(b => b.textContent?.includes("برق‌آسا"));
  await sleep(1800);
  data.rushHero70 = grab(".rush-hero [class*=\"bg-white/70\"], .rush-hero [class*=\"c-veil-70\"]");
  // 4. spell chip(0.85 via rush-hero)
  data.navSpell = click(b => b.getAttribute("role") === "tab" && b.textContent?.includes("املا"));
  await sleep(1800);
  data.spellChip = grab(".spell-chip");
  // 5. report digest strips(0.6 stone-800)
  click(b => b.textContent?.includes("خانه"));
  await sleep(1500);
  window.dispatchEvent(new CustomEvent("open-report"));
  await sleep(1200);
  data.report60 = grab(".report-digest [class*=\"bg-white/60\"], .report-digest [class*=\"c-veil-60\"]");
  data.report70 = grab(".report-digest [class*=\"bg-white/70\"], .report-digest [class*=\"c-veil-70\"]");
  st.remove();
  return JSON.stringify(data);
})()'

echo "--- LIGHT sweep"
agent-browser eval "$SWEEP" 2>/dev/null | tee "${OUT}.light"

# flip dark via header button
agent-browser eval '(() => { const btn = [...document.querySelectorAll("header button")].find(b => b.getAttribute("aria-label") === "حالت شب"); btn?.click(); return btn ? "dark" : "miss"; })()' >/dev/null 2>&1
sleep 2

echo "--- DARK sweep"
agent-browser eval "$SWEEP" 2>/dev/null | tee "${OUT}.dark"

agent-browser close --all >/dev/null 2>&1
echo "PROBE_DONE"
