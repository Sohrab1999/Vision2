#!/bin/bash
# Task 120 entry smoke — single session, read-only
set -u
cd /home/z/my-project
agent-browser close --all >/dev/null 2>&1
sleep 1
agent-browser open http://127.0.0.1:3000 >/dev/null 2>&1
sleep 4

echo "--- A. home loads"
agent-browser eval '(() => {
  const t = document.body.textContent || "";
  return "HAS-TODAY|" + (/امروز/.test(t) ? "OK" : "FAIL") + "|LEN|" + t.length;
})()' 2>/dev/null

echo "--- B. shelf via h2 (SPA has no hrefs — r117 lesson)"
agent-browser eval '(() => {
  const t = document.body.textContent || "";
  return "SHELF|" + (/قفسهٔ کتاب/.test(t) ? "OK" : "FAIL");
})()' 2>/dev/null

echo "--- C. dark round-trip (aria-label flips to حالت روشن in dark — r117 lesson)"
agent-browser eval '(() => {
  const btn = document.querySelector("button[aria-label*=حالت]");
  return "TOGGLE|" + (btn ? (btn.getAttribute("aria-label") || "").trim() : "MISSING");
})()' 2>/dev/null

echo "--- D. duel surface"
agent-browser eval '(() => {
  const ev = new CustomEvent("vision-command", { detail: "duel" });
  window.dispatchEvent(ev);
  return "dispatched";
})()' 2>/dev/null
sleep 2
agent-browser eval '(() => {
  const t = document.body.textContent || "";
  return "DUEL|" + (/نبرد دودنفره/.test(t) ? "OK" : "FAIL") + "|JOIN|" + (/پیوستن|ساخت اتاق/.test(t) ? "OK" : "FAIL");
})()' 2>/dev/null

echo "--- E. weekly band exists (week-teacher host) — back home first"
agent-browser eval '(() => { window.dispatchEvent(new CustomEvent("vision-command", { detail: "home" })); return "nav"; })()' 2>/dev/null
sleep 2
agent-browser eval '(() => {
  const t = document.body.textContent || "";
  return "WEEK-HOST|" + (/هفته|گزارش/.test(t) ? "OK" : "FAIL");
})()' 2>/dev/null

echo "--- F. mobile 390 overflow"
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 2
agent-browser eval '(() => {
  const d = document.documentElement;
  return "MOBILE390|OVERFLOW|" + (d.scrollWidth - d.clientWidth) + "|W|" + d.clientWidth;
})()' 2>/dev/null

echo "--- G. console fresh"
agent-browser console 2>/dev/null | grep -iE "error|warn" | grep -v "Download the React DevTools" | head -5
echo "CONSOLE_END"
echo "SMOKE120_END"
