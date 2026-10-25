#!/usr/bin/env bash
# ------------------------------------------------------------------
# r394 — بازداوریِ زندهٔ خانوادهٔ «شکستِ صدا» پس از مالکِ نامدار.
#   حکمِ راند: سهگانهٔ توستِ خانواده (🔇 + توصیه + ۳۵۰۰) از ۹ سایتِ
#   دستکپی به speakFailToast (speak.ts) رفت — رفتار باید بایت به بایت
#   همان بماند. تزریق: fetchِ /api/tts → 500 (دو تلاش + ۷۰۰ms درونی).
#   صحنه: چیپِ «روخوانی جفت» + SpeakButton (دیکشنری) + «پخش کل مکالمه».
#   الگوها: کلیک+کاوشِ اتمیک (r343) · گاردِ seed (r338) · negctl (r339) ·
#   احیایِ ضدِ OOM (r343) · تاریکِ درجا (r336).
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
DIR=/home/z/my-project/scripts
OUT=/tmp/r394-speak-fail.txt
: > "$OUT"

shot(){ agent-browser screenshot "$EV/$1" >/dev/null 2>&1; }
rec(){ agent-browser eval "(()=>JSON.stringify(window.__r394rec||{}))()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
# اتمیک: کلیک با selector + نظرسنجیِ درون-صفحهایِ توست تا ~۸ثانیه
click_toast_q(){ agent-browser eval "(()=>{
  const b=document.querySelector($1);
  if(!b||b.getBoundingClientRect().width===0)return Promise.resolve('NO-BTN:'+$1);
  b.click();
  return new Promise((res)=>{
    let n=0;
    const tick=()=>{
      const lis=[...document.querySelectorAll('ol li')].filter((el)=>el.className.includes('pointer-events-auto')&&el.getBoundingClientRect().height>0);
      if(lis.some((el)=>(el.innerText||'').includes('$2')))return res('TOAST-HIT:$2');
      if(++n>=18)return res('TOAST-TIMEOUT[$2] seen:'+(lis.map((l)=>(l.innerText||'').slice(0,30)).join(' | ')||'none'));
      setTimeout(tick,500);
    };
    setTimeout(tick,600);
  });
})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
# پروبِ توستِ خطا با سقفِ کوتاه (برایِ negctl — انتظار: ABSENT)
expect_no_toast(){ agent-browser eval "(()=>new Promise((res)=>{
  let n=0;
  const tick=()=>{
    const lis=[...document.querySelectorAll('ol li')].filter((el)=>el.className.includes('pointer-events-auto')&&el.getBoundingClientRect().height>0);
    if(lis.some((el)=>(el.innerText||'').includes('$1')))return res('TOAST-UNEXPECTED:$1');
    if(++n>=6)return res('TOAST-ABSENT-OK');
    setTimeout(tick,500);
  };
  setTimeout(tick,600);
}))()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
tts_fail_on(){ agent-browser eval "(()=>{
  if(!window.__origFetch)window.__origFetch=window.fetch.bind(window);
  if(!window.__r394rec)window.__r394rec={tts:0};
  window.fetch=function(input,init){
    const u=typeof input==='string'?input:(input&&input.url)||'';
    if(u.includes('/api/tts')){window.__r394rec.tts++;return Promise.resolve(new Response(JSON.stringify({error:'r394-injected'}),{status:500,headers:{'Content-Type':'application/json'}}));}
    return window.__origFetch(input,init);
  };
  return 'tts-fail-on';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
tts_restore(){ agent-browser eval "(()=>{if(window.__origFetch)window.fetch=window.__origFetch;return 'tts-restored';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
to_dark(){ agent-browser eval "(()=>{document.documentElement.classList.add('dark');return 1;})()" >/dev/null 2>&1; sleep 1.2; }
to_light(){ agent-browser eval "(()=>{document.documentElement.classList.remove('dark');return 1;})()" >/dev/null 2>&1; sleep 1.2; }
toast_identity(){ agent-browser eval "(()=>{const lis=[...document.querySelectorAll('ol li')].filter((el)=>el.className.includes('pointer-events-auto')&&el.getBoundingClientRect().height>0);const l=lis[0];if(!l)return 'NO-LIVE';const cs=getComputedStyle(l);return JSON.stringify({live:true,bg:cs.backgroundColor,ink:cs.color});})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
console_errors(){ agent-browser eval "(()=>{return 'CONSOLE-WITNESSED';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
wait_home(){ for i in $(seq 1 30); do
  local R; R=$(agent-browser eval "(()=>{const g=document.querySelector('[aria-label=\"ابزارهای یادگیری\"]');return g?'HOME-OK':'WAIT';})()" 2>/dev/null | tr -d '"')
  [ "$R" = "HOME-OK" ] && { echo "home-ready-${i}x3s" >> "$OUT"; return 0; }; sleep 3
done; echo "HOME-NEVER" | tee -a "$OUT"; return 1; }
seed_guard(){ local R; R=$(agent-browser eval "(()=>{const t=document.body.innerText||'';const hasName=t.includes('آرش-قهرمان');const hasGrid=!!document.querySelector('[aria-label=\"ابزارهای یادگیری\"]');return (hasName&&hasGrid)?'SEED-OK':'SEED-MISS';})()" 2>/dev/null | tr -d '"')
  echo "-- [seed-guard] $R" | tee -a "$OUT"; [ "$R" = "SEED-OK" ]; }
ensure_alive(){
  local R; R=$(agent-browser eval "(()=>JSON.stringify({len:(document.body.innerText||'').length}))()" 2>/dev/null)
  echo "$R" | rg -q '"len"' && return 0
  echo "-- [revive] blank-browser — reopening+reseeding" | tee -a "$OUT"
  agent-browser close >/dev/null 2>&1 || true
  agent-browser open "$BASE" >/dev/null 2>&1
  agent-browser set viewport 1280 900 >/dev/null 2>&1
  wait_home || return 1
  agent-browser eval "$(cat /tmp/r394-seed-eval.js)" >/dev/null 2>&1
  sleep 5
  seed_guard || return 1
  return 0
}

echo "########## A) خانه — seed + روشنِ ۱۲۸۰" | tee -a "$OUT"
agent-browser close >/dev/null 2>&1 || true
pkill -f "agent-browser/browsers" 2>/dev/null; sleep 1
agent-browser open "$BASE" >/dev/null 2>&1
agent-browser set viewport 1280 900 >/dev/null 2>&1
agent-browser wait 'body' >/dev/null 2>&1 || true
sleep 2
node "$DIR/r338-persona.js" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>process.stdout.write(JSON.parse(s).browserEval))" > /tmp/r394-seed-eval.js || { echo "PERSONA-FAIL" | tee -a "$OUT"; agent-browser close >/dev/null 2>&1; exit 1; }
wait_home || { agent-browser close >/dev/null 2>&1; exit 1; }
agent-browser eval "$(cat /tmp/r394-seed-eval.js)" >/dev/null 2>&1
sleep 5
seed_guard || { agent-browser close >/dev/null 2>&1; exit 1; }
agent-browser eval "(()=>{document.documentElement.classList.remove('dark');return 1;})()" >/dev/null 2>&1
agent-browser eval "(()=>{window.__r394rec={tts:0};return 'rec-on';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"

echo "########## B) دیکشنری — صحنهٔ مشترکِ چیپ و دکمهٔ روخوانی" | tee -a "$OUT"
ensure_alive || { agent-browser close >/dev/null 2>&1; exit 1; }
agent-browser eval "(()=>{
  const b=[...document.querySelectorAll('button')].find((x)=>(x.innerText||'').includes('دیکشنری جستجو')&&x.getBoundingClientRect().width>0);
  if(!b)return 'NO-CARD';b.click();return 'card-clicked';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"
sleep 2.5
agent-browser eval "(()=>{const chip=document.querySelector('[title=\"روخوانی جفت\"]');const sp=document.querySelector('[aria-label=\"روخوانی متن انگلیسی\"]');return JSON.stringify({chip:!!chip&&chip.getBoundingClientRect().width>0,speak:!!sp&&sp.getBoundingClientRect().width>0});})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"

echo "########## C) negctl — صدای سالم: هیچ توستِ خطا نباید بیاید" | tee -a "$OUT"
agent-browser eval "(()=>{const c=document.querySelector('[title=\"روخوانی جفت\"]');if(!c)return 'NO-CHIP';c.click();return 'chip-clicked';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"
expect_no_toast "پخش صدا ممکن نشد"

echo "########## D) چیپِ «روخوانی جفت» — تزریقِ TTS→500 (اتمیک)" | tee -a "$OUT"
tts_fail_on
click_toast_q "'[title=\"روخوانی جفت\"]'" "پخش صدا ممکن نشد" || true
rec
shot r394-chip-fail-light.png

echo "########## E) SpeakButton — همان تزریق (دروازهٔ ۱۵فایله)" | tee -a "$OUT"
click_toast_q "'[aria-label=\"روخوانی متن انگلیسی\"]'" "پخش صدا ممکن نشد" || true
rec

echo "########## F) تاریکِ درجا — شناسنامهٔ توست + اسکرینشات" | tee -a "$OUT"
to_dark
click_toast_q "'[title=\"روخوانی جفت\"]'" "پخش صدا ممکن نشد" || true
toast_identity
shot r394-chip-fail-dark.png
to_light

echo "########## G) negctlِ بازگردانی — دوباره صدای سالم" | tee -a "$OUT"
tts_restore
agent-browser eval "(()=>{const c=document.querySelector('[title=\"روخوانی جفت\"]');if(!c)return 'NO-CHIP';c.click();return 'chip-clicked';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"
expect_no_toast "پخش صدا ممکن نشد"
rec

echo "########## H) مکالمه — «پخش کل مکالمه» با تزریق: توالی میایستد" | tee -a "$OUT"
ensure_alive || { agent-browser close >/dev/null 2>&1; exit 1; }
agent-browser eval "(()=>{
  const sp=[...document.querySelectorAll('.book-spine .en-text')].find((x)=>x.textContent.trim()==='L1');
  if(!sp)return 'NO-SPINE';(sp.closest('.book-spine')||sp).click();return 'spine-clicked';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"
sleep 2.5
agent-browser eval "(()=>{
  const b=[...document.querySelectorAll('button')].find((x)=>(x.innerText||'').trim().startsWith('مکالمه')&&x.getBoundingClientRect().width>0);
  if(!b)return 'NO-TAB';b.click();return 'tab-clicked';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"
sleep 2
tts_fail_on
agent-browser eval "(()=>{
  const b=[...document.querySelectorAll('button')].find((x)=>(x.innerText||'').includes('پخش کل مکالمه')&&x.getBoundingClientRect().width>0);
  if(!b)return Promise.resolve('NO-BTN:playall');
  b.click();
  return new Promise((res)=>{
    let n=0;
    const tick=()=>{
      const lis=[...document.querySelectorAll('ol li')].filter((el)=>el.className.includes('pointer-events-auto')&&el.getBoundingClientRect().height>0);
      if(lis.some((el)=>(el.innerText||'').includes('پخش صدا ممکن نشد')))return res('TOAST-HIT');
      if(++n>=18)return res('TOAST-TIMEOUT');
      setTimeout(tick,500);
    };
    setTimeout(tick,600);
  });
})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"
sleep 2
agent-browser eval "(()=>{const b=[...document.querySelectorAll('button')].find((x)=>(x.innerText||'').includes('پخش کل مکالمه')||((x.innerText||'').includes('توقف پخش')));return b?('SEQ-STATE:'+(b.innerText||'').trim()):'NO-BTN';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"
rec
shot r394-conversation-fail.png
tts_restore

echo "########## DONE" | tee -a "$OUT"
agent-browser close >/dev/null 2>&1 || true
echo "OUT=$OUT"
