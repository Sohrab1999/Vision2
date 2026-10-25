#!/usr/bin/env bash
# Task 101 — single-session QA: «کارنامهٔ نبردها» قابلِ هم‌رسانی.
# ① skip intro ② seed 8-record ledger (2 wins vs امیرمحمد/امیر محمد → rival line,
#   2 receipted records → verified, W/L/T variety) + userName «میلاد»
# ③ duel panel: export button present/enabled → click with in-page stubs
#   (URL.createObjectURL + anchor click) → capture blob: name «vision2-duels.png»,
#   byte size sane, decode via createImageBitmap → 1080×640 (real canvas render proof)
# ④ button returns to enabled (promise resolved true path)
# ⑤ mobile 390 overflow 0 (duel + home) ⑥ console clean ⑦ app_open hygiene.
# duel-done live needs a real match end → covered by component tests (r99 precedent).
# Local-only seed — zero server rows.
set -e
BASE="http://127.0.0.1:3000"

agent-browser close >/dev/null 2>&1 || true
agent-browser open "$BASE" >/dev/null
sleep 5
agent-browser snapshot >/tmp/r101-home.txt 2>&1 || true
if grep -q 'ناشناس میمانم' /tmp/r101-home.txt; then
  REF=$(grep -oE 'button "رد کردن — ناشناس میمانم" \[ref=(e[0-9]+)\]' /tmp/r101-home.txt | grep -oE 'e[0-9]+' | head -1)
  agent-browser click "$REF" >/dev/null
  sleep 1
fi

echo "--- A. seed: ledger with rival pair + receipts + userName"
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
  return "seeded-battle-card";
})()'
agent-browser open "$BASE" >/dev/null
sleep 5

echo "--- B. duel panel: export button present + enabled"
agent-browser eval '(()=>{ window.dispatchEvent(new CustomEvent("open-duel")); return "duel-opened"; })()'
sleep 3
agent-browser eval '(()=>{
  const btn=document.querySelector("button[aria-label=\"گرفتن عکس کارنامهٔ نبردها\"]");
  if(!btn) return JSON.stringify({btn:false});
  return JSON.stringify({ btn:true, enabled: !btn.disabled, title: btn.getAttribute("title"),
    panel: !!document.querySelector("section[aria-label=\"تاریخچهٔ نبردها\"]") });
})()'

echo "--- C. stub downloads + click → real PNG blob proof"
agent-browser eval '(()=>{
  window.__blob=null; window.__dl=[];
  const origCreate=URL.createObjectURL.bind(URL);
  URL.createObjectURL=(blob)=>{ window.__blob=blob; return "blob:qa-stub"; };
  window.__restoreCreate=origCreate;
  HTMLAnchorElement.prototype.click=function(){ window.__dl.push(this.getAttribute("download")); };
  const btn=document.querySelector("button[aria-label=\"گرفتن عکس کارنامهٔ نبردها\"]");
  btn.click();
  return "clicked-with-stubs";
})()'
sleep 3
agent-browser eval '(async ()=>{
  const blob=window.__blob;
  if(!blob) return JSON.stringify({blob:false, names:window.__dl});
  let dims=null;
  try { const bmp=await createImageBitmap(blob); dims={w:bmp.width,h:bmp.height}; bmp.close&&bmp.close(); } catch(e){ dims={err:String(e)}; }
  const btn=document.querySelector("button[aria-label=\"گرفتن عکس کارنامهٔ نبردها\"]");
  window.URL.createObjectURL=window.__restoreCreate;
  return JSON.stringify({ names:window.__dl, size:blob.size, type:blob.type, dims, btnEnabledAgain: !btn.disabled });
})()'

echo "--- D. ledger still healthy after export (rows + expander + pills intact)"
agent-browser eval '(()=>{
  const panel=document.querySelector("section[aria-label=\"تاریخچهٔ نبردها\"]");
  const rows=panel.querySelectorAll(".space-y-2 > div").length;
  const exp=!![...panel.querySelectorAll("button")].find(b=>/نمایش همهٔ ۸ نبرد/.test(b.textContent||""));
  const pill=[...panel.querySelectorAll("span")].map(s=>s.textContent).find(t=>t&&/۸ نبرد/.test(t));
  return JSON.stringify({ rows, expander: exp, pill: pill?pill.trim():null });
})()'

echo "--- E. screenshot (duel panel style check)"
agent-browser set viewport 1280 900 >/dev/null 2>&1
sleep 1
agent-browser screenshot /tmp/r101-duel.png >/dev/null 2>&1 && echo "shot-saved"

echo "--- F. mobile 390 overflow (duel + home)"
agent-browser eval '(()=>{ window.dispatchEvent(new CustomEvent("open-duel")); return "duel"; })()' >/dev/null 2>&1
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 1.5
agent-browser eval '(() => ({ view:"duel", w: document.documentElement.clientWidth, sw: document.documentElement.scrollWidth }))()'
agent-browser eval '(()=>{ window.dispatchEvent(new CustomEvent("open-home")); return "home"; })()' >/dev/null 2>&1
sleep 2
agent-browser eval '(() => ({ view:"home", w: document.documentElement.clientWidth, sw: document.documentElement.scrollWidth }))()'

echo "--- G. console"
agent-browser console 2>/dev/null | grep -iE "error|warn" | grep -v "Download the React DevTools" | head -4

echo "--- H. DB hygiene: app_open restore, localStorage-only seed"
agent-browser eval '(()=>{
  const raw=localStorage.getItem("vision2-study-v1");
  const obj=raw?JSON.parse(raw):null;
  if(obj&&obj.state&&typeof obj.state.app_open==="number"){ obj.state.app_open=2; localStorage.setItem("vision2-study-v1",JSON.stringify(obj)); return "app_open->2"; }
  return "no-app_open-field";
})()'
sqlite3 /home/z/my-project/prisma/dev.db "SELECT COUNT(*) FROM QuizAttempt;" 2>/dev/null || echo "no-db-check"
echo "QA-R101-DONE"
