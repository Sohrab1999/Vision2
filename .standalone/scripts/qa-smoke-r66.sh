#!/usr/bin/env bash
# Round-66 smoke QA — single browser session.
# Fresh session: home renders, console errors, mobile 390 overflow, dark probe.
set -e
BASE="http://127.0.0.1:3000"

agent-browser close >/dev/null 2>&1 || true
agent-browser open "$BASE" >/dev/null
sleep 4

# ---- skip onboarding if present ----
agent-browser snapshot >/tmp/r66-snap.txt 2>&1 || true
if grep -q 'ناشناس میمانم' /tmp/r66-snap.txt; then
  REF=$(grep -oE 'button "رد کردن — ناشناس میمانم" \[ref=(e[0-9]+)\]' /tmp/r66-snap.txt | grep -oE 'e[0-9]+' | head -1)
  agent-browser click "$REF" >/dev/null
  sleep 1
fi

# ---- console errors (fresh session) ----
echo "CONSOLE_ERRORS: $(agent-browser console 2>/dev/null | rg -c 'error' || echo 0)"

# ---- home landmarks ----
agent-browser snapshot >/tmp/r66-home.txt 2>&1 || true
for kw in 'جست‌وجو' 'واژه‌های من' 'راش'; do
  if grep -q "$kw" /tmp/r66-home.txt; then echo "LANDMARK[$kw]: OK"; else echo "LANDMARK[$kw]: MISSING"; fi
done

# ---- mobile 390 overflow ----
agent-browser set viewport 390 844 >/dev/null 2>&1 || agent-browser resize 390 844 >/dev/null 2>&1 || true
sleep 2
OVER=$(agent-browser eval '(()=>{const d=document.documentElement;return JSON.stringify({sw:d.scrollWidth,iw:window.innerWidth})})()' 2>/dev/null)
echo "MOBILE390: $OVER"

# ---- dark probe ----
agent-browser eval '(()=>{document.documentElement.classList.add("dark");return "dark-on"})()' >/dev/null 2>&1
sleep 1
DARK=$(agent-browser eval '(()=>{const b=getComputedStyle(document.body).backgroundColor;return JSON.stringify({bodyBg:b})})()' 2>/dev/null)
echo "DARK: $DARK"

agent-browser close >/dev/null 2>&1 || true
echo "SMOKE_DONE"
