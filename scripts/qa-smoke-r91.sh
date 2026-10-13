#!/bin/bash
# Task 85 smoke QA — entry sanity after r84, single session
set -u
cd /home/z/my-project
agent-browser close --all >/dev/null 2>&1
sleep 1
agent-browser open http://127.0.0.1:3000 >/dev/null 2>&1
sleep 4

echo "--- A. home loads: header + today section visible"
agent-browser eval '(() => {
  const header = document.querySelector("header") || document.querySelector("body");
  const txt = header ? header.textContent?.slice(0, 120) : null;
  return JSON.stringify({ hasHeader: !!header, sample: txt?.replace(/\s+/g, " ").slice(0, 80) });
})()' 2>/dev/null

echo "--- B. badges section: «۰ از ۳۸» on fresh learner + 32 tiles"
agent-browser eval '(() => {
  const sec = document.querySelector(".badge-section");
  if (!sec) return JSON.stringify({ secFound: false });
  const count = [...sec.querySelectorAll("span")].map(s => s.textContent).find(t => t?.includes("از ۳۸"));
  const tiles = sec.querySelectorAll(".badge-card").length;
  return JSON.stringify({ secFound: true, count, tiles });
})()' 2>/dev/null

echo "--- C. report opens via palette event + legend present with 6 samples"
agent-browser eval '(() => {
  window.dispatchEvent(new CustomEvent("open-report"));
  return "opened";
})()' 2>/dev/null
sleep 3
agent-browser eval '(() => {
  const legend = document.querySelector(".report-legend");
  const samples = legend ? legend.querySelectorAll("[class*=from-teal-600], [class*=bg-stone-300], [class*=ring-emerald]").length : 0;
  const bars = document.querySelectorAll("[data-day-bar], .report-paper").length;
  return JSON.stringify({ legendFound: !!legend, samples, reportSurface: bars });
})()' 2>/dev/null

echo "--- D. mobile 390 viewport overflow check"
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 2
agent-browser eval '(() => {
  const doc = document.documentElement;
  return JSON.stringify({ overflowX: doc.scrollWidth - doc.clientWidth, w: doc.clientWidth });
})()' 2>/dev/null

echo "--- E. console errors fresh"
agent-browser console 2>/dev/null | grep -iE "error|warn" | grep -v "Download the React DevTools" | head -5
echo "CONSOLE_END"
