#!/bin/bash
# Task 103 — single-session QA: بلوکِ «نبردهای واژگانی» در هفته‌نامه.
# ① skip intro ② seed 3 duels this week + 1 last week (localStorage-only)
# ③ open report → duel-week block renders: «۳ نبرد این هفته», chips ۲ برد/۰ باخت/۱ مساوی,
#   «هفتهٔ پیش: ۱», «نرخِ برد ۶۷٪», «بهترین امتیازِ همین هفته»
# ④ truncate variant: 15 same-week → «۱۵+» + «حداقلی» footnote
# ⑤ empty ledger → block absent ⑥ mobile 390 overflow 0 ⑦ console 0.
set -e
BASE="http://127.0.0.1:3000"

agent-browser close >/dev/null 2>&1 || true
agent-browser open "$BASE" >/dev/null
sleep 5
agent-browser snapshot >/tmp/r103-home.txt 2>&1 || true
if grep -q 'ناشناس میمانم' /tmp/r103-home.txt; then
  REF=$(grep -oE 'button "رد کردن — ناشناس میمانم" \[ref=(e[0-9]+)\]' /tmp/r103-home.txt | grep -oE 'e[0-9]+' | head -1)
  agent-browser click "$REF" >/dev/null
  sleep 1
fi

echo "--- A. seed: 3 duels this week + 1 nine days ago"
agent-browser eval '(()=>{
  const raw = localStorage.getItem("vision2-study-v1");
  const obj = raw ? JSON.parse(raw) : { state: {}, version: 0 };
  const dayKey=(n)=>{const d=new Date(Date.now()-n*86400000);return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");};
  const mk=(id,outcome,day,myScore)=>({ id, day, outcome, reason:"finished", opponent:"سینا",
    opponentColor:"rose", myScore, oppScore:500, myCorrect:8, oppCorrect:4, answered:10, total:10, durationSec:80 });
  obj.state.duelHistory=[
    mk("w1","win",dayKey(0),1100),
    mk("w2","win",dayKey(1),900),
    mk("w3","loss",dayKey(2),500),
    mk("w4","tie",dayKey(9),700)
  ];
  localStorage.setItem("vision2-study-v1", JSON.stringify(obj));
  return "seeded-4";
})()'
agent-browser open "$BASE" >/dev/null
sleep 5
agent-browser eval 'window.dispatchEvent(new CustomEvent("open-report")); "report-opened"'
sleep 3

echo "--- B. duel-week block content"
agent-browser eval '(()=>{
  const b = document.querySelector("div[aria-label^=\"نبردهای واژگانی\"]");
  if(!b) return JSON.stringify({block:false});
  const t = b.textContent;
  return JSON.stringify({ block:true,
    chip: /۳ نبرد این هفته/.test(t), win: /۲ برد/.test(t), loss: /۰ باخت/.test(t), tie: /۰ مساوی/.test(t),
    lastWeek: /هفتهٔ پیش: ۱/.test(t), rate: /نرخِ برد ۶۷٪/.test(t), best: /بهترین امتیازِ همین هفته: ۱۱۰۰/.test(t),
    noPlus: !t.includes("+"), noTrunc: !/حداقلی/.test(t) });
})()'

echo "--- C. truncate variant: 15 same-week duels → ۱۵+ و پانوشت"
agent-browser eval '(()=>{
  const dayKey=(n)=>{const d=new Date(Date.now()-n*86400000);return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");};
  const mk=(id,day)=>({ id, day, outcome:"win", reason:"finished", opponent:"سینا",
    opponentColor:"rose", myScore:1000, oppScore:500, myCorrect:8, oppCorrect:4, answered:10, total:10, durationSec:80 });
  const raw = JSON.parse(localStorage.getItem("vision2-study-v1"));
  raw.state.duelHistory = Array.from({length:15},(_,i)=>mk("t"+i, dayKey(i%7)));
  localStorage.setItem("vision2-study-v1", JSON.stringify(raw));
  return "seeded-15";
})()'
agent-browser open "$BASE" >/dev/null
sleep 4
agent-browser eval 'window.dispatchEvent(new CustomEvent("open-report")); "report-opened"'
sleep 3
agent-browser eval '(()=>{
  const b = document.querySelector("div[aria-label^=\"نبردهای واژگانی\"]");
  if(!b) return JSON.stringify({block:false});
  const t = b.textContent;
  return JSON.stringify({ chip15: /۱۵\+ نبرد این هفته/.test(t), footnote: /این شمارش حداقلی است/.test(t) });
})()'

echo "--- D. empty ledger → block absent"
agent-browser eval '(()=>{
  const raw = JSON.parse(localStorage.getItem("vision2-study-v1"));
  raw.state.duelHistory = [];
  localStorage.setItem("vision2-study-v1", JSON.stringify(raw));
  return "cleared";
})()'
agent-browser open "$BASE" >/dev/null
sleep 4
agent-browser eval 'window.dispatchEvent(new CustomEvent("open-report")); "report-opened"'
sleep 3
agent-browser eval 'JSON.stringify({ blockAbsent: !document.querySelector("div[aria-label^=\"نبردهای واژگانی\"]") })'

echo "--- E. seed again for mobile overflow probe"
agent-browser eval '(()=>{
  const raw = JSON.parse(localStorage.getItem("vision2-study-v1"));
  const dayKey=(n)=>{const d=new Date(Date.now()-n*86400000);return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");};
  const mk=(id,outcome,day,myScore)=>({ id, day, outcome, reason:"finished", opponent:"سینا",
    opponentColor:"rose", myScore, oppScore:500, myCorrect:8, oppCorrect:4, answered:10, total:10, durationSec:80 });
  raw.state.duelHistory=[mk("w1","win",dayKey(0),1100),mk("w2","win",dayKey(1),900),mk("w3","loss",dayKey(2),500),mk("w4","tie",dayKey(9),700)];
  localStorage.setItem("vision2-study-v1", JSON.stringify(raw));
  return "reseeded";
})()'
agent-browser open "$BASE" >/dev/null
sleep 4
agent-browser eval 'window.dispatchEvent(new CustomEvent("open-report")); "opened"'
sleep 3
agent-browser set viewport 390 844 >/dev/null 2>&1 || true
sleep 1
agent-browser eval '(()=>{ const d=document.documentElement; return JSON.stringify({ sw: d.scrollWidth, cw: d.clientWidth, overflow: d.scrollWidth - d.clientWidth }); })()'
agent-browser set viewport 1280 800 >/dev/null 2>&1 || true

echo "--- F. console errors (whole session)"
agent-browser console | grep -icE "error" || true
agent-browser close >/dev/null 2>&1 || true
echo "--- DONE"
