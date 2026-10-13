#!/bin/bash
# Task 112 — baseline smoke: home + duel view + console + mobile 390 (single session, localStorage-only).
set -e
BASE="http://127.0.0.1:3000"
C=node_modules/.cache/r112
mkdir -p node_modules/.cache

agent-browser close >/dev/null 2>&1 || true
agent-browser open "$BASE" >/dev/null
sleep 5
agent-browser snapshot > $C-home.txt 2>&1 || true
if grep -q 'ناشناس میمانم' $C-home.txt; then
  REF=$(grep -oE 'button "رد کردن — ناشناس میمانم" \[ref=(e[0-9]+)\]' $C-home.txt | grep -oE 'e[0-9]+' | head -1)
  agent-browser click "$REF" >/dev/null
  sleep 1
fi
echo "P1 intro-skipped"

echo "--- A. home sanity: hero book + study button present"
agent-browser eval '(()=>{
  const cover=!!document.querySelector("button.hero-book");
  const ring=document.querySelector("svg[aria-label^=\"گنجینهٔ واژگانِ تو\"]");
  return JSON.stringify({cover,ringPresent:!!ring});
})()'

echo "--- B. duel view opens (open-duel custom event) + setup renders"
agent-browser eval '(()=>{
  window.dispatchEvent(new CustomEvent("open-duel"));
  return "dispatched";
})()'
sleep 3
agent-browser eval '(()=>{
  const t=document.body.innerText||"";
  return JSON.stringify({hasDuelText:/نبرد/.test(t),hasCreateOrJoin:/(ساختن|پیوستن|اتاق)/.test(t)});
})()'

echo "--- C. mobile 390 overflow check"
agent-browser set viewport 390 844 >/dev/null 2>&1 || agent-browser resize 390 844 >/dev/null 2>&1 || true
sleep 2
agent-browser eval '(()=>{
  const d=document.documentElement;
  return JSON.stringify({overflowX:d.scrollWidth>d.clientWidth,sw:d.scrollWidth,cw:d.clientWidth});
})()'

echo "--- D. console errors whole session"
agent-browser console
echo "SMOKE-DONE"
agent-browser close >/dev/null 2>&1 || true
