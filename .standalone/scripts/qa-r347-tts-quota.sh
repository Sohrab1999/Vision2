#!/usr/bin/env bash
# ------------------------------------------------------------------
# r347 — داوریِ زندهٔ خانوادهٔ «سقفِ روخوانی» (TTS monthly budget).
#   پاى سرور قبلاً با curl اثبات شد (سقفِ ۶۰ => 429 code:tts_quota +
#   سرشماریِ متر). این اسکریپت پاى کلاینت است — تک سشن:
#   B) ردیفِ «بودجهٔ روخوانیِ ماه» در تنظیمات (نوار + درصد)
#   C) تزریقِ fetchِ tts→429 tts_quota رویِ چیپِ «روخوانی جفت» ⇒
#      توستِ خانوادهٔ شنیدار (r345) + توستِ اختصاصیِ سقف (pwa-layer)
#   D) گاردِ روزانه: کلیدِ localStorage ثبت شده باشد
#   E) پایشِ دو-مسیرهٔ client-errors (بدهیِ r346-②)
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
DIR=/home/z/my-project/scripts
OUT=/tmp/r347-quota.txt
: > "$OUT"

shot(){ agent-browser screenshot "$EV/$1" >/dev/null 2>&1; }
ev(){ agent-browser eval "$1" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
wait_home(){ for i in $(seq 1 30); do
  local R; R=$(agent-browser eval "(()=>{const g=document.querySelector('[aria-label=\"ابزارهای یادگیری\"]');return g?'HOME-OK':'WAIT';})()" 2>/dev/null | tr -d '"')
  [ "$R" = "HOME-OK" ] && { echo "home-ready-${i}x3s" >> "$OUT"; return 0; }; sleep 3
done; echo "HOME-NEVER" | tee -a "$OUT"; return 1; }
seed_guard(){ local R; R=$(agent-browser eval "(()=>{const t=document.body.innerText||'';const hasName=t.includes('آرش-قهرمان');const hasGrid=!!document.querySelector('[aria-label=\"ابزارهای یادگیری\"]');return (hasName&&hasGrid)?'SEED-OK':'SEED-MISS';})()" 2>/dev/null | tr -d '"')
  echo "-- [seed-guard] $R" | tee -a "$OUT"; [ "$R" = "SEED-OK" ]; }

echo "########## A) خانه — seed" | tee -a "$OUT"
agent-browser close >/dev/null 2>&1 || true
pkill -f "agent-browser/browsers" 2>/dev/null; sleep 1
agent-browser open "$BASE" >/dev/null 2>&1
agent-browser set viewport 1280 900 >/dev/null 2>&1
agent-browser wait 'body' >/dev/null 2>&1 || true
sleep 2
node "$DIR/r338-persona.js" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>process.stdout.write(JSON.parse(s).browserEval))" > /tmp/r347-seed-eval.js || { echo "PERSONA-FAIL" | tee -a "$OUT"; agent-browser close >/dev/null 2>&1; exit 1; }
wait_home || { agent-browser close >/dev/null 2>&1; exit 1; }
agent-browser eval "$(cat /tmp/r347-seed-eval.js)" >/dev/null 2>&1
sleep 5
seed_guard || { agent-browser close >/dev/null 2>&1; exit 1; }
agent-browser eval "(()=>{document.documentElement.classList.remove('dark');return 1;})()" >/dev/null 2>&1

echo "########## B) ردیفِ «بودجهٔ روخوانیِ ماه» در تنظیمات" | tee -a "$OUT"
agent-browser eval "(()=>{
  const b=document.querySelector('[aria-label=\"تنظیمات\"]');
  if(!b||b.getBoundingClientRect().width===0)return 'NO-GEAR';
  b.click();return 'gear-clicked';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"
sleep 1.5
agent-browser eval "(()=>new Promise((res)=>{
  let n=0;
  const tick=()=>{
    const t=document.body.innerText||'';
    const row=t.includes('بودجهٔ روخوانیِ ماه');
    const pct=t.match(/(\d+)٪/);
    const line=t.includes('حرفِ سقفِ ماه');
    if(row&&line)return res('BUDGET-ROW-HIT pct:'+(pct?pct[1]:'?'));
    if(++n>=10)return res('ROW-TIMEOUT row:'+row+' line:'+line);
    setTimeout(tick,500);
  };
  setTimeout(tick,400);
}))()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"
shot r347-budget-row.png
agent-browser eval "(()=>{
  const b=document.querySelector('[aria-label=\"تنظیمات\"]');
  if(b)b.click();return 'gear-closed';})()" >/dev/null 2>&1
sleep 1

echo "########## C) تزریقِ 429ِ tts_quota رویِ دیکشنری ⇒ دو توستِ صادق" | tee -a "$OUT"
agent-browser eval "(()=>{
  const b=[...document.querySelectorAll('button')].find((x)=>(x.innerText||'').includes('دیکشنری جستجو')&&x.getBoundingClientRect().width>0);
  if(!b)return 'NO-CARD';b.click();return 'card-clicked';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"
sleep 2.5
agent-browser eval "(()=>{try{localStorage.removeItem('vision2-tts-quota-toast-day')}catch(e){};return 'quota-key-cleared';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"
agent-browser eval "(()=>{
  if(!window.__origFetch)window.__origFetch=window.fetch.bind(window);
  window.fetch=function(input,init){
    const u=typeof input==='string'?input:(input&&input.url)||'';
    if(u.includes('/api/tts')&&!u.includes('/api/tts/usage')){
      return Promise.resolve(new Response(JSON.stringify({ok:false,code:'tts_quota',error:'سقفِ روخوانیِ این ماه پر شده است'}),{status:429,headers:{'Content-Type':'application/json'}}));
    }
    return window.__origFetch(input,init);
  };
  return 'tts-quota-stub-on';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"
agent-browser eval "(()=>{
  const chip=document.querySelector('[title=\"روخوانی جفت\"]');
  if(!chip||chip.getBoundingClientRect().width===0)return 'NO-CHIP';
  chip.click();
  return new Promise((res)=>{
    let n=0; let quota=false; let family=false;
    const tick=()=>{
      const lis=[...document.querySelectorAll('ol li')].filter((el)=>el.className.includes('pointer-events-auto')&&el.getBoundingClientRect().height>0);
      const txt=lis.map((l)=>l.innerText||'').join(' | ');
      if(txt.includes('سقفِ روخوانیِ این ماه پر شد'))quota=true;
      if(txt.includes('پخش صدا ممکن نشد'))family=true;
      if(quota&&family)return res('BOTH-TOASTS-HIT quota+family');
      if(++n>=16)return res('PARTIAL quota:'+quota+' family:'+family+' seen:'+txt.slice(0,80));
      setTimeout(tick,600);
    };
    setTimeout(tick,600);
  });
})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"
shot r347-quota-toasts.png

echo "########## D) گاردِ روزانه — کلیدِ localStorage" | tee -a "$OUT"
ev "(()=>{try{return 'QUOTA-KEY='+(window.localStorage.getItem('vision2-tts-quota-toast-day')||'null')}catch(e){return 'KEY-ERR'}})()"
agent-browser eval "(()=>{if(window.__origFetch)window.fetch=window.__origFetch;return 'restored';})()" >/dev/null 2>&1

echo "########## E) پایشِ دو-مسیرهٔ client-errors (r346-②)" | tee -a "$OUT"
cd /home/z/my-project
R=$(wc -l < client-errors.log 2>/dev/null || echo MISSING)
S=$(ls .next/standalone/client-errors.log >/dev/null 2>&1 && wc -l < .next/standalone/client-errors.log || echo MISSING)
REAL=$(rg -c "089330b197ab1bb1" client-errors.log 2>/dev/null || echo 0)
echo "root-rows=$R standalone-rows=$S real-row-intact=$REAL" | tee -a "$OUT"

echo "########## DONE" | tee -a "$OUT"
agent-browser close >/dev/null 2>&1
