#!/bin/bash
# Task 112 — «بلیتِ ورود» browser end-to-end QA (single agent-browser session).
# Seed the QA identity (from the CLI probes) into the persisted store → re-open
# (skipHydration store never re-reads mid-session — r108 lesson) → duel setup →
# click create → busy label «در حالِ گرفتنِ بلیت…» → waiting view renders with a
# 5-char room code (PROOF: UI minted via /api/duel-ticket AND the judge consumed
# it) → leave → mobile 390 overflow 0 → console 0 → strip the seed.
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

echo "--- A. seed QA identity into persisted store → re-open"
UID_QA=$(node -e 'console.log(require("./node_modules/.cache/r112-creds.json").userId)')
SECRET_QA=$(node -e 'console.log(require("./node_modules/.cache/r112-creds.json").secret)')
agent-browser eval "localStorage.setItem('r112-creds', JSON.stringify({userId:'$UID_QA', secret:'$SECRET_QA'}))" >/dev/null
agent-browser eval '(()=>{
  const raw=localStorage.getItem("vision2-study-v1");
  const obj=raw?JSON.parse(raw):{state:{},version:0};
  const creds=JSON.parse(localStorage.getItem("r112-creds")||"null");
  if(!creds) return "NO-CREDS";
  obj.state.userId=creds.userId;
  obj.state.userSecret=creds.secret;
  obj.state.userName="بلیت‌آزمای";
  localStorage.setItem("vision2-study-v1",JSON.stringify(obj));
  return "seeded";
})()'
agent-browser open "$BASE" >/dev/null
sleep 5
agent-browser eval '(()=>{const s=JSON.parse(localStorage.getItem("vision2-study-v1")||"{}").state||{};return JSON.stringify({uid:!!s.userId,sec:!!s.userSecret,name:s.userName});})()'

echo "--- B. open duel setup → create room via ticket"
agent-browser eval '(()=>{window.dispatchEvent(new CustomEvent("open-duel"));return "dispatched";})()'
sleep 2
agent-browser snapshot > $C-setup.txt 2>&1 || true
CREATE_REF=$(grep -oE 'button "[^"]*ساخت اتاق نبرد[^"]*" \[ref=(e[0-9]+)\]' $C-setup.txt | grep -oE 'e[0-9]+' | head -1)
echo "create-ref:$CREATE_REF"
agent-browser click "$CREATE_REF" >/dev/null
# catch the honest busy label quickly (mint round-trip is fast on loopback)
agent-browser eval '(()=>{const b=[...document.querySelectorAll("button")].find(x=>/گرفتنِ بلیت/.test(x.textContent||""));return b?("BUSY-LABEL:"+b.textContent.trim()):"BUSY-NOT-OBSERVED";})()' || true
sleep 4
echo "--- C. waiting view = judge accepted the UI-minted ticket"
agent-browser eval '(()=>{
  const codeBtn=document.querySelector("button[aria-label^=\"کد اتاق\"]");
  const m=codeBtn?codeBtn.getAttribute("aria-label").match(/[A-Z0-9]{5}/):null;
  const twoUp=/این کد را برای حریفت بفرست/.test(document.body.innerText||"");
  return JSON.stringify({waiting:twoUp,code:m?m[0]:null});
})()'

echo "--- D. leave room → back to setup"
agent-browser snapshot > $C-waiting.txt 2>&1 || true
LEAVE_REF=$(grep -oE 'button "[^"]*"[^>]*\[ref=(e[0-9]+)\]' $C-waiting.txt | grep -B0 -A0 'e[0-9]' | head -1 || true)
agent-browser eval '(()=>{
  const b=[...document.querySelectorAll("button")].find(x=>/خروج|ترک|بازگشت/.test(x.textContent||"")||/خروج|ترک|بازگشت/.test(x.getAttribute("aria-label")||""));
  if(b){b.click();return "left:"+((b.getAttribute("aria-label"))||b.textContent.trim());}
  return "NO-LEAVE-BTN";
})()'
sleep 2

echo "--- E. mobile 390 overflow"
agent-browser set viewport 390 844 >/dev/null 2>&1 || agent-browser resize 390 844 >/dev/null 2>&1 || true
sleep 2
agent-browser eval '(()=>{const d=document.documentElement;return JSON.stringify({overflowX:d.scrollWidth>d.clientWidth,sw:d.scrollWidth,cw:d.clientWidth});})()'

echo "--- F. console errors whole session"
agent-browser console
echo "BROWSER-QA-DONE"
agent-browser eval '(()=>{const raw=localStorage.getItem("vision2-study-v1");if(!raw)return"no-key";const obj=JSON.parse(raw);delete obj.state.userId;delete obj.state.userSecret;localStorage.setItem("vision2-study-v1",JSON.stringify(obj));localStorage.removeItem("r112-creds");return "stripped";})()'
agent-browser close >/dev/null 2>&1 || true
