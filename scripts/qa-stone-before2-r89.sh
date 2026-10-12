#!/bin/bash
# Task 89 — BEFORE probe round 2: dark-mode computed values in popovers/report/my-words
# (the 13 files with zero targeted stone-50 dark rules).
set -u
cd /home/z/my-project
agent-browser close --all >/dev/null 2>&1
sleep 1
agent-browser open http://127.0.0.1:3000 >/dev/null 2>&1
sleep 4
agent-browser eval '(() => {
  const key = (n) => { const d = new Date(); d.setDate(d.getDate()-n); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; };
  localStorage.setItem("vision2-study-v1", JSON.stringify({ state: {
    streak: 4, bestStreak: 6, dailyGoal: 10,
    dayHistory: { [key(0)]: { day: key(0), reviews: 4, quizzes: 0, words: 0, dictation: 0, rush: 0 } }
  }, version: 0 }));
  return "seeded";
})()' >/dev/null 2>&1
agent-browser reload >/dev/null 2>&1
sleep 4

# go dark FIRST
agent-browser eval '(() => { const btn = [...document.querySelectorAll("header button")].find(b => b.getAttribute("aria-label") === "حالت شب"); btn?.click(); return btn ? "dark" : "miss"; })()' >/dev/null 2>&1
sleep 2

agent-browser eval '(async () => {
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  const kill = () => { const st = document.createElement("style"); st.textContent = "*,*::before,*::after{transition:none!important;animation:none!important}"; document.head.appendChild(st); return st; };
  const grab = (sel) => [...document.querySelectorAll(sel)].map(el => getComputedStyle(el).backgroundColor);
  const click = (pred) => { const b = [...document.querySelectorAll("button, a")].find(pred); if (b) { b.click(); return true; } return false; };
  const st = kill();
  const data = {};
  data.isDark = document.documentElement.classList.contains("dark");
  // settings popover: gear button (aria-label تنظیمات?)
  data.gear = click(b => (b.getAttribute("aria-label")||"").includes("تنظیم"));
  await sleep(1200);
  data.settingsStone = grab("[class*=\"bg-stone-50/6\"], [class*=\"bg-stone-50/7\"]");
  // close popover (Escape)
  document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  await sleep(600);
  // profile popover
  data.profileBtn = click(b => (b.getAttribute("aria-label")||"").includes("پروفایل") || (b.getAttribute("aria-label")||"").includes("کاربر"));
  await sleep(1200);
  data.profileStone = grab("[class*=\"bg-stone-50/6\"], [class*=\"bg-stone-50/7\"]");
  st.remove();
  return JSON.stringify(data);
})()'

agent-browser close --all >/dev/null 2>&1
echo "PROBE2_DONE"
