#!/bin/bash
# Task 89 — AFTER probe: c-stone computed values (light+dark) vs BEFORE matrix
# + r88 sentinels. Light must equal BEFORE raw (oklab 0.984998.../α);
# dark must equal BEFORE (kernel oklab 0.187941.../α or scoped deviating painters).
set -u
OUT="${1:?usage: qa-stone-after-r89.sh <out.json>}"
cd /home/z/my-project
agent-browser close --all >/dev/null 2>&1
sleep 1
agent-browser open http://127.0.0.1:3000 >/dev/null 2>&1
sleep 4

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
  data.allStone60 = grab("[class*=\"c-stone-60\"]");
  data.allStone70 = grab("[class*=\"c-stone-70\"]");
  data.sentinelBanner80 = grab(".rush-banner [class*=\"c-veil-80\"]");
  data.sentinelDonut = grab(".srs-donut");
  data.skillStone60 = grab(".skill-panel [class*=\"c-stone-60\"]");
  // settings popover (5 sections) — portal, kernel dark default
  data.gear = click(b => (b.getAttribute("aria-label")||"").includes("تنظیم"));
  await sleep(1200);
  data.settingsStone = grab("[data-radix-popper-content-wrapper] [class*=\"c-stone-60\"]");
  document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  await sleep(600);
  // report view (report-week/month/digest scoped + kernel)
  data.navReport = click(b => b.textContent?.includes("گزارش"));
  await sleep(1800);
  data.reportStone = grab(".report-week [class*=\"c-stone-70\"], .report-week[class*=\"c-stone-70\"], .report-digest[class*=\"c-stone-70\"], [class*=\"c-stone-60\"], [class*=\"c-stone-70\"]");
  await sleep(300);
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
