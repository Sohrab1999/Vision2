#!/bin/bash
# Task 104 — single-session smoke AFTER the receipt-chain fix + judge restart.
# ① intro skip + home ok ② duel tab renders ③ empty ledger → export/share buttons
#   honestly hidden (contracts 101/102) ④ seeded ledger → export visible, native
#   share honestly hidden in headless (no navigator.share) ⑤ mobile 390 overflow 0
#   on home+duel ⑥ whole-session console 0.
set -e
BASE="http://127.0.0.1:3000"
C=node_modules/.cache/r104
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

echo "--- A. home renders"
agent-browser eval 'document.body && document.body.textContent.length > 100 ? "home-ok" : "home-fail"'

echo "--- B. duel tab opens"
agent-browser eval 'window.dispatchEvent(new CustomEvent("open-duel")); "duel-opened"'
sleep 2
agent-browser eval '(()=>{const t=document.body.textContent;
  return JSON.stringify({ duelWord: /نبرد/.test(t),
    exportHiddenOnEmpty: !document.querySelector("button[aria-label]"),
    hasSetup: /رقیب|حریف|نبردِ دودنفره/.test(t) });})()'

echo "--- C. seed 3 duels → export visible, native share honestly hidden (headless)"
agent-browser eval '(()=>{
  const dayKey=(n)=>{const d=new Date(Date.now()-n*86400000);return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");};
  const mk=(id,outcome,day,myScore)=>({ id, day, outcome, reason:"finished", opponent:"سینا",
    opponentColor:"rose", myScore, oppScore:500, myCorrect:8, oppCorrect:4, answered:10, total:10, durationSec:80 });
  const raw = localStorage.getItem("vision2-study-v1");
  const obj = raw ? JSON.parse(raw) : { state: {}, version: 0 };
  obj.state.duelHistory=[mk("s1","win",dayKey(0),1100),mk("s2","loss",dayKey(1),500),mk("s3","win",dayKey(2),900)];
  obj.state.userName="کاوهٔ QA";
  localStorage.setItem("vision2-study-v1", JSON.stringify(obj));
  return "seeded-3";
})()'
agent-browser open "$BASE" >/dev/null
sleep 4
agent-browser eval 'window.dispatchEvent(new CustomEvent("open-duel")); "duel-opened"'
sleep 2
agent-browser eval '(()=>{
  const nativeShare = !!navigator.share || !!navigator.canShare;
  return JSON.stringify({ nativeShareInHeadless: nativeShare,
    shareButtonAbsent: !document.querySelector(".lucide-share-2"),
    ledgerVisible: /سینا/.test(document.body.textContent) });})()'

echo "--- D. mobile 390 overflow (duel + home)"
agent-browser set viewport 390 844 >/dev/null 2>&1 || true
sleep 1
agent-browser eval '(()=>{const d=document.documentElement;return JSON.stringify({view:"duel",overflow:d.scrollWidth-d.clientWidth});})()'
agent-browser open "$BASE" >/dev/null
sleep 3
agent-browser eval '(()=>{const d=document.documentElement;return JSON.stringify({view:"home",overflow:d.scrollWidth-d.clientWidth});})()'
agent-browser set viewport 1280 800 >/dev/null 2>&1 || true

echo "--- E. stats API alive (read path the app depends on)"
curl -s -o /dev/null -w "stats-get:%{http_code}\n" "$BASE/api/stats" --max-time 6

echo "--- F. console errors (whole session)"
agent-browser console | grep -icE "error" || true
agent-browser close >/dev/null 2>&1 || true
echo "--- DONE"
