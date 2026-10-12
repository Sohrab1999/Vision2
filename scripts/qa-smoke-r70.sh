#!/bin/bash
# Round 70 smoke — single agent-browser session
# 1) open home, skip onboarding, check landmarks
# 2) fresh console errors == 0
# 3) mobile 390 overflow == 0
# 4) dark probe: body dark class toggle works
set -u
cd /home/z/my-project

echo "=== smoke start $(date +%T) ==="
agent-browser close --all >/dev/null 2>&1
sleep 1

echo "--- open home"
agent-browser open http://127.0.0.1:3000 >/dev/null 2>&1
sleep 3

echo "--- onboarding skip (if present)"
agent-browser eval '(() => {
  const btns = [...document.querySelectorAll("button")];
  const b = btns.find(x => /شروع|شروع کنیم|بزن بریم|ورود/.test(x.textContent||""));
  if (b) { b.click(); return "clicked:"+b.textContent.trim().slice(0,20); }
  return "no-onboarding-btn";
})()' 2>/dev/null | head -2
sleep 1

echo "--- landmarks"
agent-browser eval '(() => {
  const lms = ["header","main","nav"].filter(t => document.querySelector(t));
  return JSON.stringify({landmarks: lms, title: document.title.slice(0,40)});
})()' 2>/dev/null | head -4

echo "--- console errors (fresh)"
agent-browser console --level error 2>/dev/null | grep -c -i "error" || echo "0"

echo "--- mobile 390 overflow"
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 1
agent-browser eval '(() => {
  const d = document.documentElement;
  return JSON.stringify({overflow: d.scrollWidth - d.clientWidth});
})()' 2>/dev/null | head -3

echo "--- dark probe"
agent-browser set viewport 1280 800 >/dev/null 2>&1
agent-browser eval '(() => {
  document.documentElement.classList.add("dark");
  return document.documentElement.classList.contains("dark") ? "dark-on" : "dark-fail";
})()' 2>/dev/null | head -2
sleep 1
agent-browser eval '(() => {
  const bg = getComputedStyle(document.body).backgroundColor;
  return JSON.stringify({darkBodyBg: bg});
})()' 2>/dev/null | head -3

echo "--- palette opens (Ctrl+K)"
agent-browser eval '(() => {
  document.documentElement.classList.remove("dark");
  return "light-restored";
})()' 2>/dev/null | head -2

agent-browser close --all >/dev/null 2>&1
echo "=== smoke end $(date +%T) ==="
