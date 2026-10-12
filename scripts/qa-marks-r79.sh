#!/bin/bash
# Task 79 live QA — freeze-day marks on the report (strip ring + saved dot), single session
set -u
cd /home/z/my-project
agent-browser close --all >/dev/null 2>&1
sleep 1
agent-browser open http://127.0.0.1:3000 >/dev/null 2>&1
sleep 4

open_report='(() => { window.dispatchEvent(new CustomEvent("open-report")); return "opened"; })()'
close_report='(() => { const b=[...document.querySelectorAll("button")].find(x=>x.textContent?.includes("بستن")); b?.click(); return "closed"; })()'

echo "--- A. fresh: NO sky marks anywhere, ledger still present (full picture)"
agent-browser eval "$open_report" 2>/dev/null
sleep 1
agent-browser eval '(() => JSON.stringify({
  skyBars: document.querySelectorAll(".ring-sky-500\\/60").length,
  skyDots: document.querySelectorAll(".border-sky-500").length,
  todayEmerald: document.querySelectorAll(".ring-emerald-500\\/60").length,
  ledger: !!document.querySelector(".freeze-ledger"),
  goalDots: document.querySelectorAll(".report-digest span[title^=\"یکشنبه\"], .report-digest span[title^=\"دوشنبه\"], .report-digest span[title^=\"سه‌شنبه\"], .report-digest span[title^=\"چهارشنبه\"], .report-digest span[title^=\"پنجشنبه\"], .report-digest span[title^=\"جمعه\"], .report-digest span[title^=\"شنبه\"]").length
}))()' 2>/dev/null
agent-browser eval "$close_report" 2>/dev/null

echo "--- B. seed rescue 3d ago (1 in stock): sky bar + sky dot + titles + ledger chip"
agent-browser eval '(() => {
  const key = (n) => { const d = new Date(); d.setDate(d.getDate()-n); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; };
  localStorage.setItem("vision2-study-v1", JSON.stringify({ state: {
    streak: 4, bestStreak: 6, freezeCount: 1, freezeSavedDay: "", freezeUsedDays: [key(3)], freezeEarnedDay: key(10), goalMetDays: [key(1), key(2)]
  }, version: 0 }));
  return "seeded";
})()' 2>/dev/null
agent-browser reload >/dev/null 2>&1
sleep 4
agent-browser eval "$open_report" 2>/dev/null
sleep 1
agent-browser eval '(() => {
  const bar = document.querySelector(".ring-sky-500\\/60");
  const dots = [...document.querySelectorAll(".border-sky-500")];
  const today = document.querySelector(".ring-emerald-500\\/60");
  const ledger = document.querySelector(".freeze-ledger");
  return JSON.stringify({
    barTitle: bar?.getAttribute("title") ?? "MISS",
    barH: bar ? Math.round(bar.getBoundingClientRect().height) : 0,
    skyDotCount: dots.length,
    dotTitle: dots[0]?.getAttribute("title") ?? "MISS",
    emeraldDots: document.querySelectorAll(".border-emerald-600").length,
    todayNoSky: today ? !today.className.includes("ring-sky") : false,
    todayTitle: today?.getAttribute("title") ?? "MISS",
    ledgerHasRescue: (ledger?.textContent ?? "").includes("۱ نجاتِ زنجیره در ۷ روزِ گذشته")
  });
})()' 2>/dev/null

echo "--- C. dark via app toggle: saved dot bands (bg global rule + raw saturated border)"
agent-browser eval '(() => { const btn = [...document.querySelectorAll("header button")].find(b => b.getAttribute("aria-label") === "حالت شب"); btn?.click(); return btn ? "dark-toggled" : "btn-miss"; })()' 2>/dev/null
sleep 1
agent-browser eval '(() => {
  const dot = document.querySelector(".border-sky-500");
  const bar = document.querySelector(".ring-sky-500\\/60");
  if (!dot) return JSON.stringify({ miss: true });
  const cs = getComputedStyle(dot);
  return JSON.stringify({
    theme: document.documentElement.className,
    dotBg: cs.backgroundColor,
    dotBorder: cs.borderTopColor,
    barRing: bar ? getComputedStyle(bar).boxShadow.slice(0, 80) : "MISS"
  });
})()' 2>/dev/null

echo "--- D. mobile 390: report fits, marks visible, overflow 0"
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 1
agent-browser eval '(() => {
  const dlg = document.querySelector(".report-dialog");
  return JSON.stringify({
    skyMarks: document.querySelectorAll(".ring-sky-500\\/60, .border-sky-500").length,
    dlgW: dlg ? Math.round(dlg.getBoundingClientRect().width) : 0,
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
  });
})()' 2>/dev/null
agent-browser set viewport 1280 800 >/dev/null 2>&1

echo "--- E. fresh console after reload (light again)"
agent-browser eval '(() => { const btn = [...document.querySelectorAll("header button")].find(b => b.getAttribute("aria-label") === "حالت روز"); btn?.click(); return "light"; })()' 2>/dev/null
agent-browser reload >/dev/null 2>&1
sleep 4
agent-browser errors 2>/dev/null | head -4
agent-browser close --all >/dev/null 2>&1
echo "=== r79 marks QA end ==="
