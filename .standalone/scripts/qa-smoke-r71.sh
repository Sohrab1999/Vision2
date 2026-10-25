#!/bin/bash
# Round 71 smoke — single agent-browser session
set -u
cd /home/z/my-project
echo "=== smoke start $(date +%T) ==="
agent-browser close --all >/dev/null 2>&1
sleep 1
agent-browser open http://127.0.0.1:3000 >/dev/null 2>&1
sleep 4
agent-browser eval '(() => {
  const btns = [...document.querySelectorAll("button")];
  const skip = btns.find(x => /رد شدن|بعدا|بستن|skip/i.test(x.textContent||x.getAttribute("aria-label")||""));
  if (skip) { skip.click(); return "skipped"; }
  return document.querySelector("[role=dialog]") ? "onboarding-no-skip" : "no-onboarding";
})()' 2>/dev/null | head -2
sleep 1
agent-browser eval '(() => {
  const lms = ["header","main","nav"].filter(t => document.querySelector(t));
  return JSON.stringify({landmarks: lms, hasPaletteBtn: !!document.querySelector("button[aria-label*=\"جست\"], button[title*=\"جست\"]")});
})()' 2>/dev/null | head -3
echo "--- palette Ctrl+K + deep command quick check"
agent-browser press Control+k >/dev/null 2>&1
sleep 1
agent-browser eval '(() => {
  const pal = document.querySelector(".command-palette");
  const opts = pal ? pal.querySelectorAll("[role=option]").length : 0;
  return JSON.stringify({paletteOpen: !!pal, topOptions: opts});
})()' 2>/dev/null | head -3
agent-browser press Escape >/dev/null 2>&1
sleep 1
echo "--- mobile 390 overflow"
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 1
agent-browser eval '(() => JSON.stringify({overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth}))()' 2>/dev/null | head -3
agent-browser set viewport 1280 800 >/dev/null 2>&1
echo "--- fresh console errors"
agent-browser console --level error 2>/dev/null | grep -ci "error" || echo "0"
agent-browser close --all >/dev/null 2>&1
echo "=== smoke end $(date +%T) ==="
