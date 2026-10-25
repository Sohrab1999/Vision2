#!/usr/bin/env bash
# Task 101 — capture the real ledger card PNG to disk for visual review.
set -e
BASE="http://127.0.0.1:3000"
agent-browser close >/dev/null 2>&1 || true
agent-browser open "$BASE" >/dev/null
sleep 5
agent-browser snapshot >/tmp/r101b-home.txt 2>&1 || true
if grep -q 'ناشناس میمانم' /tmp/r101b-home.txt; then
  REF=$(grep -oE 'button "رد کردن — ناشناس میمانم" \[ref=(e[0-9]+)\]' /tmp/r101b-home.txt | grep -oE 'e[0-9]+' | head -1)
  agent-browser click "$REF" >/dev/null
  sleep 1
fi
agent-browser eval '(()=>{
  const raw = localStorage.getItem("vision2-study-v1");
  const obj = raw ? JSON.parse(raw) : { state: {}, version: 0 };
  const now = Date.now();
  const dayKey=(n)=>{const d=new Date(now-n*86400000);return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");};
  const mk=(id,outcome,opponent,myScore,oppScore,myCorrect,sig)=>({ id, day:dayKey(0), outcome, reason:"finished", opponent,
    opponentColor:"rose", myScore, oppScore, myCorrect, oppCorrect:3, answered:10, total:10, durationSec:80, ...(sig?{receiptSig:sig}:{}) });
  obj.state.userName="میلاد";
  obj.state.duelWins=5; obj.state.duelLosses=2; obj.state.duelTies=1;
  obj.state.duelHistory=[
    mk("r1","win","امیرمحمد",1200,500,8,"a".repeat(64)),
    mk("r2","win","امیر محمد",1100,400,8),
    mk("r3","loss","سینا",300,900,3,"b".repeat(64)),
    mk("r4","win","پریسا",950,100,6),
    mk("r5","tie","نیما",1000,1000,6),
    mk("r6","loss","سینا",200,800,2),
    mk("r7","win","امیرمحمد",1300,600,9),
    mk("r8","win","پریسا",850,300,6)
  ];
  localStorage.setItem("vision2-study-v1", JSON.stringify(obj));
  return "seeded";
})()'
agent-browser open "$BASE" >/dev/null
sleep 5
agent-browser eval '(()=>{ window.dispatchEvent(new CustomEvent("open-duel")); return "duel"; })()' >/dev/null
sleep 3
agent-browser eval '(()=>{
  window.__b64=null;
  URL.createObjectURL=(blob)=>{
    const r=new FileReader();
    r.onload=()=>{ window.__b64=String(r.result).split(",")[1]; };
    r.readAsDataURL(blob);
    return "blob:qa";
  };
  HTMLAnchorElement.prototype.click=function(){};
  document.querySelector("button[aria-label=\"گرفتن عکس کارنامهٔ نبردها\"]").click();
  return "clicked";
})()'
sleep 4
agent-browser eval '(()=>JSON.stringify({ready: !!window.__b64, len: window.__b64 ? window.__b64.length : 0}))()'
agent-browser eval '(()=>window.__b64 || "EMPTY")()' > /tmp/r101-card.b64.txt
node -e "const fs=require('fs');const s=fs.readFileSync('/tmp/r101-card.b64.txt','utf8').trim().replace(/^\"|\"$/g,'');if(s==='EMPTY'||s.length<1000){console.log('BAD:',s.slice(0,80));process.exit(1)}fs.writeFileSync('/tmp/r101-card.png',Buffer.from(s,'base64'));console.log('PNG bytes:',fs.statSync('/tmp/r101-card.png').size)"
agent-browser close >/dev/null 2>&1 || true
