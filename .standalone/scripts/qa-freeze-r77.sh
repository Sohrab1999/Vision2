#!/bin/bash
# Task 77 live QA — freeze badge (header) + earn micro-bar (home), single session
set -u
cd /home/z/my-project
agent-browser close --all >/dev/null 2>&1
sleep 1
agent-browser open http://127.0.0.1:3000 >/dev/null 2>&1
sleep 4

echo "--- A. fresh learner: no freeze → badge absent (zero noise)"
agent-browser eval '(() => {
  const badge = document.querySelector(".freeze-badge");
  return JSON.stringify({ badgeAbsent: !badge, flamePresent: !!document.querySelector(".streak-flame") });
})()' 2>/dev/null

echo "--- B. seed stock 2 freezes + streak 5 → sky badge next to flame, aria==title"
agent-browser eval '(() => {
  const t = new Date();
  const day = `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,"0")}-${String(t.getDate()).padStart(2,"0")}`;
  localStorage.setItem("vision2-study-v1", JSON.stringify({ state: {
    streak: 5, bestStreak: 5, freezeCount: 2, freezeSavedDay: "", freezeUsedDays: [], freezeEarnedDay: "", goalMetDays: []
  }, version: 0 }));
  return "seeded";
})()' 2>/dev/null
agent-browser reload >/dev/null 2>&1
sleep 4
agent-browser eval '(() => {
  const badge = document.querySelector(".freeze-badge");
  return JSON.stringify({
    text: badge?.textContent?.trim(),
    aria: badge?.getAttribute("aria-label"),
    ariaEqTitle: badge?.getAttribute("aria-label") === badge?.getAttribute("title"),
    skyBand: badge?.classList?.contains("bg-sky-50") && badge?.classList?.contains("text-sky-600"),
    flameNext: !!document.querySelector(".streak-flame")
  });
})()' 2>/dev/null

echo "--- C. seed saved-today (freeze rescued the chain) → «نجات شد»"
agent-browser eval '(() => {
  const t = new Date();
  const day = `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,"0")}-${String(t.getDate()).padStart(2,"0")}`;
  localStorage.setItem("vision2-study-v1", JSON.stringify({ state: {
    streak: 5, bestStreak: 5, freezeCount: 0, freezeSavedDay: day, freezeUsedDays: [], freezeEarnedDay: "", goalMetDays: []
  }, version: 0 }));
  return "seeded";
})()' 2>/dev/null
agent-browser reload >/dev/null 2>&1
sleep 4
agent-browser eval '(() => {
  const badge = document.querySelector(".freeze-badge");
  return JSON.stringify({
    text: badge?.textContent?.trim(),
    title: badge?.getAttribute("title")?.slice(0, 60),
    ariaEqTitle: badge?.getAttribute("aria-label") === badge?.getAttribute("title")
  });
})()' 2>/dev/null

echo "--- D. seed 1 freeze + 2 goal-met days → tap badge → home + earn micro-bar «۲ از ۳»"
agent-browser eval '(() => {
  const t = new Date();
  const key = (n) => { const d = new Date(); d.setDate(d.getDate()-n); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; };
  localStorage.setItem("vision2-study-v1", JSON.stringify({ state: {
    streak: 5, bestStreak: 5, freezeCount: 1, freezeSavedDay: "", freezeUsedDays: [], freezeEarnedDay: "", goalMetDays: [key(1), key(2)]
  }, version: 0 }));
  return "seeded";
})()' 2>/dev/null
agent-browser reload >/dev/null 2>&1
sleep 4
agent-browser eval '(() => document.querySelector(".freeze-badge")?.textContent?.trim() || "miss")()' 2>/dev/null
agent-browser eval '(() => { document.querySelector(".freeze-badge")?.click(); return "clicked"; })()' 2>/dev/null
sleep 1
agent-browser eval '(() => {
  const earn = document.querySelector(".freeze-earn");
  const bars = earn ? [...earn.querySelectorAll("span[aria-hidden] > span")] : [];
  return JSON.stringify({
    onHome: !!document.querySelector("[aria-label=\"برنامهٔ امروز\"]"),
    earnText: earn?.textContent?.trim(),
    earnTitle: earn?.getAttribute("title")?.slice(0, 70),
    barsTotal: bars.length,
    barsFilled: bars.filter(b => b.classList.contains("bg-sky-500")).length
  });
})()' 2>/dev/null

echo "--- E. dark mode: global sky bands (zero new dark rules)"
agent-browser eval '(() => {
  const t = new Date();
  const day = `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,"0")}-${String(t.getDate()).padStart(2,"0")}`;
  localStorage.setItem("vision2-study-v1", JSON.stringify({ state: {
    streak: 5, bestStreak: 5, freezeCount: 2, freezeSavedDay: "", freezeUsedDays: [], freezeEarnedDay: "", goalMetDays: []
  }, version: 0 }));
  return "seeded";
})()' 2>/dev/null
agent-browser reload >/dev/null 2>&1
sleep 4
agent-browser eval '(() => {
  const btn = [...document.querySelectorAll("header button")].find(b => b.getAttribute("aria-label") === "حالت شب");
  btn?.click(); return btn ? "dark-toggled" : "btn-miss";
})()' 2>/dev/null
sleep 1
agent-browser eval '(() => {
  const badge = document.querySelector(".freeze-badge");
  const cs = getComputedStyle(badge);
  return JSON.stringify({
    theme: document.documentElement.className,
    bg: cs.backgroundColor,
    ink: cs.color,
    border: cs.borderTopColor
  });
})()' 2>/dev/null

echo "--- F. mobile 390: badge display:none (sm breakpoint, computed), overflow 0"
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 1
agent-browser eval '(() => {
  const badge = document.querySelector(".freeze-badge");
  return JSON.stringify({
    display: badge ? getComputedStyle(badge).display : "absent",
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
  });
})()' 2>/dev/null
agent-browser set viewport 1280 800 >/dev/null 2>&1

echo "--- G. fresh console after reload"
agent-browser reload >/dev/null 2>&1
sleep 4
agent-browser errors 2>/dev/null | head -4
agent-browser close --all >/dev/null 2>&1
echo "=== r77 QA end ==="
