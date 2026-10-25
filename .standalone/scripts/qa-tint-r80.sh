#!/bin/bash
# Task 80 live QA — tranche 3b tokens + report color legend, single session
set -u
cd /home/z/my-project
agent-browser close --all >/dev/null 2>&1
sleep 1
agent-browser open http://127.0.0.1:3000 >/dev/null 2>&1
sleep 4

echo "--- A. seed learner + dark via app toggle: legend + flips"
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
agent-browser eval '(() => { const btn = [...document.querySelectorAll("header button")].find(b => b.getAttribute("aria-label") === "حالت شب"); btn?.click(); return btn ? "dark" : "miss"; })()' 2>/dev/null
sleep 1
agent-browser eval '(() => { window.dispatchEvent(new CustomEvent("open-report")); return "opened"; })()' 2>/dev/null
sleep 1
agent-browser eval '(() => {
  const legend = document.querySelector(".report-legend");
  if (!legend) return JSON.stringify({ miss: true });
  const sky = legend.querySelector(".border-sky-500");
  const emerald = legend.querySelector(".border-emerald-600");
  return JSON.stringify({
    label: legend.getAttribute("aria-label"),
    items: legend.textContent.replace(/\s+/g, " ").slice(0, 80),
    skySampleBg: sky ? getComputedStyle(sky).backgroundColor : null,
    emeraldSampleBg: emerald ? getComputedStyle(emerald).backgroundColor : null,
    ledgerIntact: !!document.querySelector(".freeze-ledger"),
    skyMarkBar: !!document.querySelector(".ring-sky-500\\/60"),
    amberDot: (() => { const d = document.querySelector(".goal-dots .bg-amber-200, .bg-amber-200"); return d ? getComputedStyle(d).backgroundColor : "absent"; })()
  });
})()' 2>/dev/null

echo "--- B. flip whitelist: rush-board-me ring now dark-orange (was raw light)"
agent-browser eval '(() => { const b=[...document.querySelectorAll("button")].find(x=>x.textContent?.includes("بستن")); b?.click(); return "closed"; })()' 2>/dev/null
agent-browser eval '(() => { window.dispatchEvent(new CustomEvent("open-command-palette")); return "palette"; })()' 2>/dev/null
sleep 1
agent-browser eval '(() => {
  const inp = document.querySelector(".command-palette input");
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
  setter.call(inp, "برق");
  inp.dispatchEvent(new Event("input", { bubbles: true }));
  return "typed";
})()' 2>/dev/null
sleep 1
agent-browser eval '(() => {
  const opt = [...document.querySelectorAll(".command-palette [role=option]")][0];
  if (!opt) return JSON.stringify({ miss: true });
  opt.click();
  return "dispatched:" + opt.textContent.slice(0, 20);
})()' 2>/dev/null
sleep 2
agent-browser eval '(() => {
  const me = document.querySelector(".rush-board-me");
  if (!me) return JSON.stringify({ boardAbsent: true });
  return JSON.stringify({ meShadow: getComputedStyle(me).boxShadow.slice(0, 90), meBg: getComputedStyle(me).backgroundColor });
})()' 2>/dev/null

echo "--- C. hero glow + fx bar SKIPS unchanged (intentional light)"
agent-browser eval '(() => {
  const glow = document.querySelector(".bg-emerald-200\\/40");
  return JSON.stringify({ glowPresent: !!glow, glowBg: glow ? getComputedStyle(glow).backgroundColor.slice(0, 40) : null });
})()' 2>/dev/null

echo "--- D. mobile 390: report + legend fit, overflow 0"
agent-browser eval '(() => { const b=[...document.querySelectorAll("button")].find(x=>x.textContent?.includes("بستن")); return b ? (b.click(), "closed") : "none"; })()' 2>/dev/null
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 1
agent-browser eval '(() => { window.dispatchEvent(new CustomEvent("open-report")); return "opened"; })()' 2>/dev/null
sleep 1
agent-browser eval '(() => {
  const legend = document.querySelector(".report-legend");
  const dlg = document.querySelector(".report-dialog");
  return JSON.stringify({
    legendW: legend ? Math.round(legend.getBoundingClientRect().width) : 0,
    dlgW: dlg ? Math.round(dlg.getBoundingClientRect().width) : 0,
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
  });
})()' 2>/dev/null
agent-browser set viewport 1280 800 >/dev/null 2>&1

echo "--- E. fresh console after reload (light theme restored)"
agent-browser eval '(() => { const btn = [...document.querySelectorAll("header button")].find(b => b.getAttribute("aria-label") === "حالت روز"); btn?.click(); return "light"; })()' 2>/dev/null
agent-browser reload >/dev/null 2>&1
sleep 4
agent-browser errors 2>/dev/null | head -4
agent-browser close --all >/dev/null 2>&1
echo "=== r80 QA end ==="
