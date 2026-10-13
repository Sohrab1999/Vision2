#!/usr/bin/env bash
# Task 106 — live duel E2E over the NEW dev socket bridge (:3000 rewrite).
# r94 rode the Caddy :81 XTransformPort proxy which has since stopped routing
# /socket.io; task 105's NODE_ENV=development rewrite in next.config.ts bridges
# it again. This script re-proves the FULL browser match end-to-end:
#   room create → joiner plays all 10 → browser auto-answers → duel-done
#   → «رسیدِ امضاشدهٔ داوری» chip → mobile 390 overflow 0 → console clean.
# BASE is :3000 (the bridge), NOT :81. Single agent-browser session in ONE call.
set -e
BASE="http://127.0.0.1:3000"

agent-browser close >/dev/null 2>&1 || true
agent-browser open "$BASE" >/dev/null
sleep 5
agent-browser snapshot >/tmp/r106-home.txt 2>&1 || true
if grep -q 'ناشناس میمانم' /tmp/r106-home.txt; then
  REF=$(grep -oE 'button "رد کردن — ناشناس میمانم" \[ref=(e[0-9]+)\]' /tmp/r106-home.txt | grep -oE 'e[0-9]+' | head -1)
  agent-browser click "$REF" >/dev/null
  sleep 1
fi

echo "--- A. open duel view from home card"
DREF=$(agent-browser snapshot 2>/dev/null | grep -B2 -A2 'نبرد دودنفره' | grep -oE 'ref=(e[0-9]+)' | head -1 | grep -oE 'e[0-9]+')
if [ -z "$DREF" ]; then
  DREF=$(agent-browser snapshot 2>/dev/null | grep -oE '\[ref=(e[0-9]+)\][^ ]*[^<]*نبرد دودنفره' | grep -oE 'e[0-9]+' | head -1)
fi
agent-browser click "$DREF" >/dev/null 2>&1 || true
sleep 1.5
agent-browser snapshot >/tmp/r106-duel.txt 2>&1
if ! grep -q 'ساخت اتاق نبرد' /tmp/r106-duel.txt; then
  echo "DUEL-VIEW-OPEN-FAIL"; agent-browser snapshot | grep -i duel | head -5; exit 1
fi
echo "duel setup open ✓"

echo "--- B. socket connection state"
CONN=$(agent-browser eval '(() => { const t=document.body.innerText; return t.includes("متصل به سرور نبرد") ? "CONNECTED" : "NOT-CONNECTED"; })()')
echo "conn: $CONN"

echo "--- C. create room"
CREF=$(agent-browser snapshot 2>/dev/null | grep -oE 'button "ساخت اتاق نبرد" \[[^]]*ref=(e[0-9]+)\]' | grep -oE 'e[0-9]+' | head -1)
if [ -z "$CREF" ]; then echo "CREATE-BUTTON-NOT-FOUND"; agent-browser snapshot | grep -E 'ساخت اتاق|disabled' | head -4; exit 1; fi
agent-browser click "$CREF" >/dev/null
sleep 2
CODE=$(agent-browser snapshot 2>/dev/null | grep -oE 'کد اتاق [A-Z2-9]{5}' | grep -oE '[A-Z2-9]{5}' | head -1)
if [ -z "$CODE" ]; then echo "ROOM-CODE-FAIL"; exit 1; fi
echo "room created: $CODE ✓"

echo "--- D. scripted opponent joins and plays all 10"
bun scripts/qa-duel-joiner-r94.mjs "$CODE" &

echo "--- E. browser player auto-answers (first option, ~1.15s cadence)"
agent-browser eval 'window.__r106 = setInterval(() => {
  const root = document.querySelector("[class*=duel-play]") || document;
  const btns = [...root.querySelectorAll("button")].filter(b => b.className.includes("border-2") && b.offsetParent !== null && b.textContent.trim().length > 0 && b.textContent.trim().length < 120);
  if (btns.length >= 4) btns[0].click();
}, 1150); "loop-started"'
for i in $(seq 1 40); do
  sleep 3
  agent-browser snapshot >/tmp/r106-done.txt 2>/dev/null || true
  if grep -q 'کارنامهٔ نبرد' /tmp/r106-done.txt; then break; fi
done
agent-browser eval 'clearInterval(window.__r106); "loop-cleared"' >/dev/null || true

echo "--- F. assert receipt chip on duel-done"
if grep -q 'رسیدِ امضاشدهٔ داوری' /tmp/r106-done.txt; then
  echo "RECEIPT-CHIP-LIVE ✓"
else
  echo "RECEIPT-CHIP-MISSING"; grep -A2 'کارنامهٔ نبرد' /tmp/r106-done.txt | head -6; exit 1
fi
grep -E 'پیروزی در نبرد|مساوی — رقابت نزدیک|این دور را باختی|حریف خارج شد' /tmp/r106-done.txt | head -2

echo "--- G. footer mentions the judge"
agent-browser eval '(() => { const el=[...document.querySelectorAll("p")].find(p=>p.textContent.includes("رسیدِ امضاشدهٔ داور")); return el ? "footer-judge ✓" : "footer-miss"; })()'

echo "--- G2. think block (task 106) — judge-measured think rhythm"
THINK=$(agent-browser eval '(() => {
  const el = document.querySelector("[aria-label=\"زمانِ فکرِ من در این نبرد\"]");
  if (!el) return JSON.stringify({ present: false });
  const bars = el.querySelectorAll("span[title^=سؤال]").length;
  const chip = [...el.querySelectorAll("span")].map(s => s.textContent).find(t => t && t.includes("ثبت برای")) || "";
  const summary = [...el.querySelectorAll("p")].map(p => p.textContent).join(" ");
  return JSON.stringify({ present: true, bars, chip, summary: summary.slice(0, 120) });
})()')
echo "think: $THINK"
echo "$THINK" | grep -q 'present\\":true' && echo "THINK-BLOCK-LIVE ✓" || echo "THINK-BLOCK-MISSING"

echo "--- H. mobile 390 overflow"
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 1.5
agent-browser eval '(() => ({ w: document.documentElement.clientWidth, sw: document.documentElement.scrollWidth }))()'

echo "--- J. dark-mode think block probe (task 106)"
agent-browser eval 'document.documentElement.classList.add("dark"); "dark-on"' >/dev/null
sleep 1
agent-browser eval '(() => {
  const el = document.querySelector("[aria-label=\"زمانِ فکرِ من در این نبرد\"]");
  if (!el) return JSON.stringify({ present: false });
  const cs = getComputedStyle(el);
  const header = el.querySelector("h2");
  const chip = [...el.querySelectorAll("span")].find(s => s.className.includes("violet"));
  const dot = el.querySelector("span[title*=ثبت-نشده], span[title*=\"ثبت نشده\"]");
  return JSON.stringify({
    present: true,
    bg: cs.backgroundColor,
    border: cs.borderTopColor,
    headerColor: header ? getComputedStyle(header).color : null,
    chipBg: chip ? getComputedStyle(chip).backgroundColor : null,
    dotBg: dot ? getComputedStyle(dot).backgroundColor : null,
  });
})()'
agent-browser eval 'document.documentElement.classList.remove("dark"); "dark-off"' >/dev/null

echo "--- I. console errors"
agent-browser console 2>/dev/null | grep -iE "error|warn" | grep -v "Download the React DevTools" | head -4
echo "QA-LIVE-DUEL-R106-DONE"
