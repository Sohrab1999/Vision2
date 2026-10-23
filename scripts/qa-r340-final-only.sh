#!/usr/bin/env bash
# ------------------------------------------------------------------
# r340-C — بازرانِ فقط-صحنهٔ «آزمون پایانترم» — درسِ v2: الگویِ ZWNJدارِ
#   خودِ اسکریپت هم میتواند سکوت کند؛ استریپِ دوطرفه + fallbackِ کلاسی
#   (دکمهٔ from-amber-700.to-orange-700 یکتاست —免疫 به ZWNJ).
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
DIR=/home/z/my-project/scripts
OUT=/tmp/r340-final.txt
: > "$OUT"

dbg()   { echo "-- [contrast] $1" | tee -a "$OUT"; agent-browser eval "$(cat "$DIR/r328-fails-dbg.js")" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
basis() { echo "-- [basis-zero] $1" | tee -a "$OUT"; agent-browser eval "$(cat "$DIR/r319-basis-zero-audit.js")" 2>&1 | tail -1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
shot()  { agent-browser screenshot "$EV/$1" >/dev/null 2>&1; }
probe() { echo "-- [result-probe] $1" | tee -a "$OUT"; agent-browser eval "$(cat "$DIR/r340-result-probe.js")" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
to_dark_inplace()   { agent-browser eval "(()=>{document.documentElement.classList.add('dark');return 'd';})()" >/dev/null 2>&1; sleep 1.2; }
back_light_inplace(){ agent-browser eval "(()=>{document.documentElement.classList.remove('dark');return 'l';})()" >/dev/null 2>&1; sleep 1.2; }
negctl() {
  agent-browser eval "(()=>{const n=document.createElement('div');n.id='r340-negctl';n.style.cssText='position:fixed;top:4px;right:4px;z-index:99999;background:#d1fae5;color:#6ee7b7;font-size:12px;padding:4px';n.textContent='کنترلِ منفیِ r340';document.body.appendChild(n);return 'PLANTED';})()" >/dev/null 2>&1
  local RES; RES=$(agent-browser eval "$(cat "$DIR/r328-fails-dbg.js")" 2>/dev/null)
  agent-browser eval "(()=>{document.getElementById('r340-negctl')?.remove();return 'rm';})()" >/dev/null 2>&1
  echo "-- [negctl] $1 → ${RES:0:100}" | tee -a "$OUT"
  if ! echo "$RES" | rg -q '110, 231, 183'; then echo "NEGCTL-FAIL" | tee -a "$OUT"; return 1; fi
  echo "-- negctl=OK" | tee -a "$OUT"
}
click_tool() {
  agent-browser eval "(()=>{const g=document.querySelector('[aria-label=\"ابزارهای یادگیری\"]');if(!g)return 'NO-GRID';const b=[...g.querySelectorAll('button')].find(x=>(x.textContent||'').replace(/\\u200c/g,'').includes('$1'));if(!b)return 'NO-BTN';b.click();return 'clicked';})()" >> "$OUT" 2>&1
}
start_final() { # گام ۱: ModeCardِ «پایان ترم» (پنلِ پایانترم زیرِ mode==='final' است — درسِ بازران) + گام ۲: دکمهٔ کهربایی (استریپِ دوطرفه + fallbackِ کلاسی)
  agent-browser eval "(()=>{const norm=(s)=>(s||'').replace(/\\u200c/g,'');const card=[...document.querySelectorAll('button,[role=button],div[class*=cursor-pointer]')].find(x=>norm(x.textContent).includes('پایان ترم'));if(card)card.click();return 'card:'+(card?'ok':'missing');})()" >> "$OUT" 2>&1
  sleep 1.2
  agent-browser eval "(()=>{const norm=(s)=>(s||'').replace(/\\u200c/g,'');const pat=norm('شروع آزمون پایانترم');let b=[...document.querySelectorAll('button')].find(x=>norm(x.textContent).includes(pat));if(!b)b=document.querySelector('button[class*=\"from-amber-700\"][class*=\"to-orange-700\"]');if(!b)return 'NO-START';b.click();return 'started:'+(b.textContent||'').slice(0,30);})()" >> "$OUT" 2>&1
}
result_visible() {
  agent-browser eval "(()=>{return (document.body.innerText.includes('نتیجهٔ نهایی')||document.querySelector('.certificate-card'))?1:0;})()" 2>/dev/null | tr -d '"'
}
answer_all() { # $1 = بیشینهٔ سؤال — شرطِ پایان: نتیجه یا گواهی
  local DONE=0
  for i in $(seq 1 "$1"); do
    [ "$DONE" = "1" ] && break
    local K=1; [ $((i % 2)) -eq 0 ] && K=2
    local OK=0
    for try in 1 2 3 4; do
      local R; R=$(agent-browser eval "(()=>{if(document.body.innerText.includes('نتیجهٔ نهایی')||document.querySelector('.certificate-card'))return 'RESULT';const os=[...document.querySelectorAll('[data-quiz-option]')].filter(o=>o.getBoundingClientRect().width>0);if(!os.length)return 'NO-OPT';const t=os[Math.min($K,os.length-1)];t.click();return 'opt'+$K;})()" 2>/dev/null | tr -d '"')
      if [ "$R" = "RESULT" ]; then DONE=1; break; fi
      if [ "$R" != "NO-OPT" ]; then echo "q$i/$try=$R" >> "$OUT"; OK=1; break; fi
      sleep 1
    done
    [ "$DONE" = "1" ] && break
    [ "$OK" = "0" ] && { echo "q$i=STUCK" >> "$OUT"; continue; }
    sleep 1.1
    local N; N=$(agent-browser eval "(()=>{if(document.body.innerText.includes('نتیجهٔ نهایی')||document.querySelector('.certificate-card'))return 'RESULT';const n=document.querySelector('[data-quiz-next]');if(!n)return 'NO-NEXT';n.click();return 'next';})()" 2>/dev/null | tr -d '"')
    if [ "$N" = "RESULT" ]; then DONE=1; break; fi
    echo "adv=$N" >> "$OUT"
    sleep 1.1
  done
  echo "loop-done" >> "$OUT"
}

echo "########## C-بازران) آزمون پایانترم — مسیرِ گواهی (روشن ۱۲۸۰)" | tee -a "$OUT"
agent-browser close >/dev/null 2>&1 || true
agent-browser open "$BASE" >/dev/null 2>&1
agent-browser set viewport 1280 900 >/dev/null 2>&1
agent-browser wait 'body' >/dev/null 2>&1 || true
sleep 2
node "$DIR/r338-persona.js" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>process.stdout.write(JSON.parse(s).browserEval))" > /tmp/r340-seed-eval2.js || { echo "PERSONA-FAIL" | tee -a "$OUT"; exit 1; }
agent-browser eval "$(cat /tmp/r340-seed-eval2.js)" >/dev/null 2>&1
sleep 4
agent-browser eval "(()=>{document.documentElement.classList.remove('dark');sessionStorage.setItem('vision2-exam-timed-prefill','0');sessionStorage.setItem('vision2-konkur-timed-prefill','0');return 'l+untimed';})()" >/dev/null 2>&1
sleep 1
click_tool "آزمون جامع"; sleep 2
start_final; sleep 2.5
answer_all 35
sleep 2
probe "final-done-light"
negctl "final-light-1280" || { agent-browser close >/dev/null 2>&1; exit 1; }
dbg "final-cert-done-light-1280"
basis "final-cert-done-light-1280"
shot "r340-final-cert-done-light.png"
to_dark_inplace
dbg "final-cert-done-dark-1280"
shot "r340-final-cert-done-dark.png"
back_light_inplace
agent-browser close >/dev/null 2>&1
echo "log=$OUT"
