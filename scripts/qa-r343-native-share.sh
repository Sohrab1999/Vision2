#!/usr/bin/env bash
# ------------------------------------------------------------------
# r343 — ماتریسِ پایِ بومیِ navigator.share رویِ گواهیِ آزمون (quiz-result).
#   r341 پایِ کلیپبورد را درمان کرد ولی پایِ بومیِ share فقط با AbortError
#   سنجیده شده بود؛ پیشنهادِ ②ِ r342: rejectِ غیرانصرافی رویِ shareِ واقعی
#   (بدونِ استابِ canShare — دکمهٔ متن-اشتراکی دروازهٔ canShare ندارد)
#   باید به پایِ کلیپبورد بیفتد: موفق ⇒ «✓ نتیجه کپی شد»، مردود ⇒
#   «خطا در کپی نتیجه». AbortError ⇒ سکوتِ مشروع و دست‌نزدن به کلیپبورد.
#   درسِ راند: کلیک+کاوشِ اتمیک (evalِ await-پرامیس) — بدونِ مسابقهٔ بین-eval.
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
DIR=/home/z/my-project/scripts
OUT=/tmp/r343-native.txt
: > "$OUT"

shot()  { agent-browser screenshot "$EV/$1" >/dev/null 2>&1; }
# اتمیک: نصبِ دو پای + کلیک + نظرسنجیِ توست/رکوردگر در «یک فراخوان»
matrix_click(){ agent-browser eval "(()=>{
  const errName='$1'; const wtMode='$2'; const want='$3';
  navigator.share=async()=>{window.__r343n.share++;const e=new Error('r343-native');e.name=errName;window.__r343n.shareErrs.push(errName);throw e;};
  navigator.clipboard=navigator.clipboard||{};
  navigator.clipboard.writeText=async(t)=>{
    window.__r343n.wt++;
    if(wtMode==='deny'){const e=new DOMException('r343-denied','NotAllowedError');window.__r343n.wtErrs.push('NotAllowedError');throw e;}
    return 'copied';
  };
  const norm=(s)=>(s||'').replace(/\u200c/g,'');
  const btn=[...document.querySelectorAll('button')].find(x=>norm(x.textContent).includes(norm('اشتراک‌گذاری نتیجه'))&&x.getBoundingClientRect().width>0);
  if(!btn)return Promise.resolve('NO-BTN');
  btn.click();
  return new Promise((res)=>{
    let n=0;
    const tick=()=>{
      const lis=[...document.querySelectorAll('ol li')].filter((el)=>el.className.includes('pointer-events-auto')&&el.getBoundingClientRect().height>0);
      const texts=lis.map((l)=>(l.innerText||'').slice(0,40));
      if(want!=='SILENCE'&&texts.some((t)=>t.includes(want)))return res('TOAST-HIT:'+want+' st:'+JSON.stringify({share:window.__r343n.share,wt:window.__r343n.wt}));
      if(++n>=8)return res('RESULT st:'+JSON.stringify({share:window.__r343n.share,wt:window.__r343n.wt,shareErrs:window.__r343n.shareErrs,wtErrs:window.__r343n.wtErrs})+' toasts:'+(texts.join(' | ')||'none'));
      setTimeout(tick,600);
    };
    setTimeout(tick,700);
  });
})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
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
  agent-browser eval "$(cat /tmp/r343n-seed-eval.js)" >/dev/null 2>&1
  sleep 5
  seed_guard || return 1
  return 0
}
start_final(){ agent-browser eval "(()=>{const norm=(s)=>(s||'').replace(/\u200c/g,'');const card=[...document.querySelectorAll('button,[role=button],div[class*=cursor-pointer]')].find(x=>norm(x.textContent).includes('پایان ترم'));if(card)card.click();return 'card:'+(card?'ok':'missing');})()" >> "$OUT" 2>&1
  sleep 1.2
  agent-browser eval "(()=>{const norm=(s)=>(s||'').replace(/\u200c/g,'');let b=[...document.querySelectorAll('button')].find(x=>norm(x.textContent).includes('شروع آزمون پایانترم'));if(!b)b=document.querySelector('button[class*=\"from-amber-700\"][class*=\"to-orange-700\"]');if(!b)return 'NO-START';b.click();return 'started';})()" >> "$OUT" 2>&1; }
answer_all(){ local DONE=0
  for i in $(seq 1 "$1"); do
    [ "$DONE" = "1" ] && break
    local K=1; [ $((i % 2)) -eq 0 ] && K=2
    local OK=0
    for try in 1 2 3 4; do
      local R; R=$(agent-browser eval "(()=>{if(document.body.innerText.includes('نتیجهٔ نهایی')||document.querySelector('.certificate-card'))return 'RESULT';const os=[...document.querySelectorAll('[data-quiz-option]')].filter(o=>o.getBoundingClientRect().width>0);if(!os.length)return 'NO-OPT';os[Math.min($K,os.length-1)].click();return 'opt';})()" 2>/dev/null | tr -d '"')
      if [ "$R" = "RESULT" ]; then DONE=1; break; fi
      if [ "$R" != "NO-OPT" ]; then echo "q$i=$R" >> "$OUT"; OK=1; break; fi
      sleep 1
    done
    [ "$DONE" = "1" ] && break
    [ "$OK" = "0" ] && { echo "q$i=STUCK" >> "$OUT"; continue; }
    sleep 1.1
    local N; N=$(agent-browser eval "(()=>{if(document.body.innerText.includes('نتیجهٔ نهایی')||document.querySelector('.certificate-card'))return 'RESULT';const n=document.querySelector('[data-quiz-next]');if(!n)return 'NO-NEXT';n.click();return 'next';})()" 2>/dev/null | tr -d '"')
    [ "$N" = "RESULT" ] && DONE=1
    sleep 1.1
  done
  echo "loop-done" >> "$OUT"; }

echo "########## A) گواهی — روشنِ ۱۲۸۰" | tee -a "$OUT"
agent-browser close >/dev/null 2>&1 || true
pkill -f "agent-browser/browsers" 2>/dev/null; sleep 1
agent-browser open "$BASE" >/dev/null 2>&1
agent-browser set viewport 1280 900 >/dev/null 2>&1
agent-browser wait 'body' >/dev/null 2>&1 || true
sleep 2
node "$DIR/r338-persona.js" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>process.stdout.write(JSON.parse(s).browserEval))" > /tmp/r343n-seed-eval.js || { echo "PERSONA-FAIL" | tee -a "$OUT"; agent-browser close >/dev/null 2>&1; exit 1; }
wait_home || { agent-browser close >/dev/null 2>&1; exit 1; }
agent-browser eval "$(cat /tmp/r343n-seed-eval.js)" >/dev/null 2>&1
sleep 5
seed_guard || { agent-browser close >/dev/null 2>&1; exit 1; }
agent-browser eval "(()=>{document.documentElement.classList.remove('dark');sessionStorage.setItem('vision2-exam-timed-prefill','0');sessionStorage.setItem('vision2-konkur-timed-prefill','0');return 'light+untimed';})()" >/dev/null 2>&1
sleep 1
agent-browser eval "(()=>{const g=document.querySelector('[aria-label=\"ابزارهای یادگیری\"]');const b=g&&[...g.querySelectorAll('button')].find(x=>(x.textContent||'').replace(/\u200c/g,'').includes('آزمون جامع'));if(!b)return 'NO-TOOL';b.click();return 'ok';})()" >> "$OUT" 2>&1
sleep 2
start_final; sleep 3
answer_all 35
sleep 3
CERT=$(agent-browser eval "(()=>document.querySelector('.certificate-card')?'CERT':(document.body.innerText.includes('نتیجهٔ نهایی')?'RESULT':'NONE'))()" 2>/dev/null | tr -d '"')
echo "-- [done-view] $CERT" | tee -a "$OUT"
[ "$CERT" != "NONE" ] || { agent-browser close >/dev/null 2>&1; exit 1; }
shot r343-cert-light.png
agent-browser eval "(()=>{window.__r343n={share:0,wt:0,shareErrs:[],wtErrs:[]};return 'state-on';})()" >> "$OUT" 2>&1

echo "########## B) S1 — share→AbortError ⇒ سکوتِ مشروع، کلیپبورد دست نخورده" | tee -a "$OUT"
matrix_click "AbortError" "ok" "SILENCE"
shot r343-native-S1-abort.png

echo "########## C) S2 — share→TypeError + کلیپبوردِ سالم ⇒ «✓ نتیجه کپی شد»" | tee -a "$OUT"
matrix_click "TypeError" "ok" "نتیجه کپی شد"
shot r343-native-S2-fallback.png

echo "########## D) S3 — share→TypeError + کلیپبوردِ مردود ⇒ «خطا در کپی نتیجه»" | tee -a "$OUT"
matrix_click "TypeError" "deny" "خطا در کپی نتیجه"
shot r343-native-S3-error.png

echo "########## E) بازگردانی + basis-zeroِ گواهی" | tee -a "$OUT"
agent-browser eval "(()=>{if(window.__origShareFn)navigator.share=window.__origShareFn;else delete navigator.share;if(window.__origWT)navigator.clipboard.writeText=window.__origWT;return 'restored';})()" >> "$OUT" 2>&1
agent-browser eval "$(cat "$DIR/r319-basis-zero-audit.js")" 2>&1 | tail -1 | tee -a "$OUT"
agent-browser close >/dev/null 2>&1
echo "QA-R343-NATIVE-SHARE-DONE" | tee -a "$OUT"
