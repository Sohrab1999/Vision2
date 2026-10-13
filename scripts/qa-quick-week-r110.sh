#!/bin/bash
# Task 110 — «هفتهٔ چابک» — single-session live QA (localStorage-only, DB untouched).
# ① intro skip ② scenario A: quick week 0.8s → silver+gold tiles shine + chip ۳ از ۵۲
# ③ scenario B: 1.2s week → silver shines, gold locked «۱٫۲ از ۱ ثانیه» + chip ۲ از ۵۲
# ④ scenario C: fast-but-sloppy week (rate 0.7) → both locked, count honest ۳ از ۳
# ⑤ legacy no-think ledger → both locked ۰ از ۳ ⑥ mobile 390 overflow 0 ⑦ console 0.
set -e
BASE="http://127.0.0.1:3000"
C=node_modules/.cache/r110
mkdir -p node_modules/.cache

tile_state() { # $1 = tile title; prints JSON {shine,hint}
  agent-browser eval "(()=>{
    const cards=[...document.querySelectorAll('.badge-card')];
    const t=cards.find(c=>c.textContent.includes('$1'));
    if(!t) return 'TILE-MISSING';
    const hint=[...t.querySelectorAll('span')].map(s=>s.textContent.trim()).find(x=>/از |ثانیه/.test(x)&&!/نشان/.test(x));
    return JSON.stringify({shine:t.className.includes('badge-shine'),hint:hint||''});
  })()" | tr -d '"\\'
}

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

# ---- Scenario A: quick week 0.8s (three consecutive days, distinct rivals)
agent-browser eval "(()=>{
  const d=(n)=>{const dt=new Date(Date.now()-n*86400000);
    return dt.getFullYear()+'-'+String(dt.getMonth()+1).padStart(2,'0')+'-'+String(dt.getDate()).padStart(2,'0');};
  const mk=(id,day,opp,avg,myCorrect)=>({ id, day, outcome:'win', reason:'finished', opponent:opp, opponentColor:'rose',
    myScore:1200, oppScore:950, myCorrect, oppCorrect:5, answered:10, total:10, durationSec:80,
    think:{avgMs:avg,minMs:200,maxMs:1500,seen:10,total:10} });
  const raw=localStorage.getItem('vision2-study-v1');
  const obj=raw?JSON.parse(raw):{state:{},version:0};
  obj.state.userName='کاوهٔ QA';
  obj.state.duelHistory=[mk('a1',d(0),'حریفِ یکم',800,9),mk('a2',d(1),'حریفِ دوم',800,9),mk('a3',d(2),'حریفِ سوم',800,9)];
  localStorage.setItem('vision2-study-v1',JSON.stringify(obj));
  return 'seeded-A';
})()" | tr -d '"\\'
agent-browser open "$BASE" >/dev/null
sleep 4
echo "--- A: tiles (expect week shine, bolt shine, glance shine, chip ۳ از ۵۲)"
tile_state "هفتهٔ چابک"
tile_state "هفتهٔ برق"
agent-browser eval "(()=>{const chip=[...document.querySelectorAll('span')].map(s=>s.textContent.trim()).find(x=>/از ۵۲\$/.test(x));return chip||CHIP-MISS;})()" | tr -d '"\\'

# ---- Scenario B: 1.2s week → silver only
agent-browser eval "(()=>{
  const d=(n)=>{const dt=new Date(Date.now()-n*86400000);
    return dt.getFullYear()+'-'+String(dt.getMonth()+1).padStart(2,'0')+'-'+String(dt.getDate()).padStart(2,'0');};
  const mk=(id,day,opp,avg,myCorrect)=>({ id, day, outcome:'win', reason:'finished', opponent:opp, opponentColor:'rose',
    myScore:1200, oppScore:950, myCorrect, oppCorrect:5, answered:10, total:10, durationSec:80,
    think:{avgMs:avg,minMs:200,maxMs:1500,seen:10,total:10} });
  const raw=localStorage.getItem('vision2-study-v1');
  const obj=raw?JSON.parse(raw):{state:{},version:0};
  obj.state.duelHistory=[mk('b1',d(0),'حریفِ یکم',1200,9),mk('b2',d(1),'حریفِ دوم',1200,9),mk('b3',d(2),'حریفِ سوم',1200,9)];
  localStorage.setItem('vision2-study-v1',JSON.stringify(obj));
  return 'seeded-B';
})()" | tr -d '"\\'
agent-browser open "$BASE" >/dev/null
sleep 4
echo "--- B: tiles (expect week shine, bolt locked with ۱٫۲ از ۱ ثانیه, chip ۲ از ۵۲)"
tile_state "هفتهٔ چابک"
tile_state "هفتهٔ برق"
agent-browser eval "(()=>{const chip=[...document.querySelectorAll('span')].map(s=>s.textContent.trim()).find(x=>/از ۵۲\$/.test(x));return chip||CHIP-MISS;})()" | tr -d '"\\'

# ---- Scenario C: fast-but-sloppy (rate 27/40=0.675... make it (9*3+1)/40=0.7)
agent-browser eval "(()=>{
  const d=(n)=>{const dt=new Date(Date.now()-n*86400000);
    return dt.getFullYear()+'-'+String(dt.getMonth()+1).padStart(2,'0')+'-'+String(dt.getDate()).padStart(2,'0');};
  const mk=(id,day,opp,avg,myCorrect)=>({ id, day, outcome: myCorrect>5?'win':'loss', reason:'finished', opponent:opp, opponentColor:'rose',
    myScore:1200, oppScore:950, myCorrect, oppCorrect:5, answered:10, total:10, durationSec:80,
    think:{avgMs:avg,minMs:200,maxMs:1500,seen:10,total:10} });
  const raw=localStorage.getItem('vision2-study-v1');
  const obj=raw?JSON.parse(raw):{state:{},version:0};
  obj.state.duelHistory=[mk('c1',d(0),'حریفِ یکم',800,9),mk('c2',d(1),'حریفِ دوم',800,9),mk('c3',d(2),'حریفِ سوم',800,9),
    { id:'c4', day:d(1), outcome:'loss', reason:'finished', opponent:'حریفِ چهارم', opponentColor:'stone',
      myScore:150, oppScore:950, myCorrect:1, oppCorrect:5, answered:10, total:10, durationSec:80 }];
  localStorage.setItem('vision2-study-v1',JSON.stringify(obj));
  return 'seeded-C';
})()" | tr -d '"\\'
agent-browser open "$BASE" >/dev/null
sleep 4
echo "--- C: tiles (expect both locked; week hint ۳ از ۳; bolt no از-۱-ثانیه; chip ۱ از ۵۲)"
tile_state "هفتهٔ چابک"
tile_state "هفتهٔ برق"
agent-browser eval "(()=>{const chip=[...document.querySelectorAll('span')].map(s=>s.textContent.trim()).find(x=>/از ۵۲\$/.test(x));return chip||CHIP-MISS;})()" | tr -d '"\\'

# ---- Scenario D: legacy no-think ledger
agent-browser eval "(()=>{
  const d=(n)=>{const dt=new Date(Date.now()-n*86400000);
    return dt.getFullYear()+'-'+String(dt.getMonth()+1).padStart(2,'0')+'-'+String(dt.getDate()).padStart(2,'0');};
  const mk=(id,day,opp)=>({ id, day, outcome:'win', reason:'finished', opponent:opp, opponentColor:'rose',
    myScore:1200, oppScore:950, myCorrect:8, oppCorrect:5, answered:10, total:10, durationSec:80 });
  const raw=localStorage.getItem('vision2-study-v1');
  const obj=raw?JSON.parse(raw):{state:{},version:0};
  obj.state.duelHistory=Array.from({length:12},(_,i)=>mk('l'+i,d(i%7),'حریفِ '+i));
  localStorage.setItem('vision2-study-v1',JSON.stringify(obj));
  return 'seeded-D';
})()" | tr -d '"\\'
agent-browser open "$BASE" >/dev/null
sleep 4
echo "--- D: legacy (expect both locked ۰ از ۳; bolt no از-۱-ثانیه; chip ۰ از ۵۲)"
tile_state "هفتهٔ چابک"
tile_state "هفتهٔ برق"
agent-browser eval "(()=>{const chip=[...document.querySelectorAll('span')].map(s=>s.textContent.trim()).find(x=>/از ۵۲\$/.test(x));return chip||CHIP-MISS;})()" | tr -d '"\\'

# ---- E: mobile 390 overflow (home, seeded ledger still present)
agent-browser set viewport 390 844 >/dev/null 2>&1 || true
sleep 1
agent-browser eval "(()=>{const d=document.documentElement;return JSON.stringify({view:'home-mobile390',overflow:d.scrollWidth-d.clientWidth});})()" | tr -d '"\\'
agent-browser set viewport 1280 800 >/dev/null 2>&1 || true

# ---- F: console errors (whole session)
echo "--- F: console error count (expect 0)"
agent-browser console | grep -icE "error" || true
agent-browser close >/dev/null 2>&1 || true
echo "--- DONE (localStorage-only QA — DB untouched)"
