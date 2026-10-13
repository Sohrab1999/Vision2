#!/usr/bin/env bash
# Task 94 — single-session browser duel QA: real client + scripted opponent.
# Browser creates a room → bun joiner (r94 joiner plays all 10 instantly) →
# browser auto-answers first option via eval loop → match ends → duel-done
# must show the «رسیدِ امضاشدهٔ داوری» trust chip + honest footer → mobile 390
# overflow 0 → console clean. DB cleanup happens in a separate step.
set -e
BASE="http://127.0.0.1:81"  # duel sockets ride the Caddy XTransformPort proxy

agent-browser close >/dev/null 2>&1 || true
agent-browser open "$BASE" >/dev/null
sleep 5
agent-browser snapshot >/tmp/r94-home.txt 2>&1 || true
if grep -q 'ناشناس میمانم' /tmp/r94-home.txt; then
  REF=$(grep -oE 'button "رد کردن — ناشناس میمانم" \[ref=(e[0-9]+)\]' /tmp/r94-home.txt | grep -oE 'e[0-9]+' | head -1)
  agent-browser click "$REF" >/dev/null
  sleep 1
fi

echo "--- A. open duel view from home card"
DREF=$(agent-browser snapshot 2>/dev/null | grep -B2 -A2 'نبرد دودنفره' | grep -oE 'ref=(e[0-9]+)' | head -1 | grep -oE 'e[0-9]+')
if [ -z "$DREF" ]; then
  # fall back: first clickable ancestor of the duel card text
  DREF=$(agent-browser snapshot 2>/dev/null | grep -oE '\[ref=(e[0-9]+)\][^ ]*[^<]*نبرد دودنفره' | grep -oE 'e[0-9]+' | head -1)
fi
agent-browser click "$DREF" >/dev/null 2>&1 || true
sleep 1.5
agent-browser snapshot >/tmp/r94-duel.txt 2>&1
if ! grep -q 'ساخت اتاق نبرد' /tmp/r94-duel.txt; then
  echo "DUEL-VIEW-OPEN-FAIL"; agent-browser snapshot | grep -i duel | head -5; exit 1
fi
echo "duel setup open ✓"

echo "--- B. create room"
CREF=$(agent-browser snapshot 2>/dev/null | grep -oE 'button "ساخت اتاق نبرد" \[[^]]*ref=(e[0-9]+)\]' | grep -oE 'e[0-9]+' | head -1)
if [ -z "$CREF" ]; then echo "CREATE-BUTTON-NOT-FOUND"; agent-browser snapshot | grep -E 'ساخت اتاق|disabled' | head -4; exit 1; fi
agent-browser click "$CREF" >/dev/null
sleep 2
CODE=$(agent-browser snapshot 2>/dev/null | grep -oE 'کد اتاق [A-Z2-9]{5}' | grep -oE '[A-Z2-9]{5}' | head -1)
if [ -z "$CODE" ]; then echo "ROOM-CODE-FAIL"; exit 1; fi
echo "room created: $CODE ✓"

echo "--- C. scripted opponent joins and plays all 10"
bun scripts/qa-duel-joiner-r94.mjs "$CODE" &

echo "--- D. browser player auto-answers (first option, ~1.15s cadence)"
agent-browser eval 'window.__r94 = setInterval(() => {
  const root = document.querySelector("[class*=duel-play]") || document;
  const btns = [...root.querySelectorAll("button")].filter(b => b.className.includes("border-2") && b.offsetParent !== null && b.textContent.trim().length > 0 && b.textContent.trim().length < 120);
  if (btns.length >= 4) btns[0].click();
}, 1150); "loop-started"'
for i in $(seq 1 40); do
  sleep 3
  agent-browser snapshot >/tmp/r94-done.txt 2>/dev/null || true
  if grep -q 'کارنامهٔ نبرد' /tmp/r94-done.txt; then break; fi
done

echo "--- E. assert receipt chip on duel-done"
if grep -q 'رسیدِ امضاشدهٔ داوری' /tmp/r94-done.txt; then
  echo "RECEIPT-CHIP-LIVE ✓"
else
  echo "RECEIPT-CHIP-MISSING"; grep -A2 'کارنامهٔ نبرد' /tmp/r94-done.txt | head -6; exit 1
fi
agent-browser eval 'clearInterval(window.__r94); "loop-cleared"' >/dev/null
grep -E 'پیروزی در نبرد|مساوی — رقابت نزدیک|این دور را باختی|حریف خارج شد' /tmp/r94-done.txt | head -2

echo "--- F. footer mentions the judge"
agent-browser eval '(() => { const el=[...document.querySelectorAll("p")].find(p=>p.textContent.includes("رسیدِ امضاشدهٔ داور")); return el ? "footer-judge ✓" : "footer-miss"; })()'

echo "--- G. mobile 390 overflow"
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 1.5
agent-browser eval '(() => ({ w: document.documentElement.clientWidth, sw: document.documentElement.scrollWidth }))()' 

echo "--- H. console errors"
agent-browser console 2>/dev/null | grep -iE "error|warn" | grep -v "Download the React DevTools" | head -4
echo "QA-BROWSER-R94-DONE"
