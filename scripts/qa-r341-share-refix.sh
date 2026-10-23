#!/usr/bin/env bash
# ------------------------------------------------------------------
# r341-B — بازتاییدِ زندهٔ درمانِ «سکوتِ اشتراک»: کلیکِ share رویِ گواهی
#   باید حالا توستِ صادقانهٔ «خطا در کپی نتیجه» بدهد (کلیپبوردِ بیاجازه)
#   — در دو تم + رگرسیونِ دانلود.
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
DIR=/home/z/my-project/scripts
OUT=/tmp/r341-refix.txt
: > "$OUT"

dbg()   { echo "-- [contrast] $1" | tee -a "$OUT"; agent-browser eval "$(cat "$DIR/r328-fails-dbg.js")" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
shot()  { agent-browser screenshot "$EV/$1" >/dev/null 2>&1; }
tprobe(){ echo "-- [toast-probe] $1" | tee -a "$OUT"; agent-browser eval "$(cat "$DIR/r341-toast-probe.js")" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
to_dark_inplace()   { agent-browser eval "(()=>{document.documentElement.classList.add('dark');return 'd';})()" >/dev/null 2>&1; sleep 1.2; }
back_light_inplace(){ agent-browser eval "(()=>{document.documentElement.classList.remove('dark');return 'l';})()" >/dev/null 2>&1; sleep 1.2; }
click_btn() {
  agent-browser eval "(()=>{const norm=(s)=>(s||'').replace(/\\u200c/g,'');const pat=norm('$1');const b=[...document.querySelectorAll('button')].find(x=>norm(x.textContent).includes(pat)&&x.getBoundingClientRect().width>0);if(!b)return 'NO-BTN:'+pat;b.click();return 'clicked:'+norm(b.textContent).slice(0,24);})()" 2>&1 | tee -a "$OUT"
}
click_tool() {
  agent-browser eval "(()=>{const g=document.querySelector('[aria-label=\"ابزارهای یادگیری\"]');if(!g)return 'NO-GRID';const b=[...g.querySelectorAll('button')].find(x=>(x.textContent||'').replace(/\\u200c/g,'').includes('$1'));if(!b)return 'NO-BTN';b.click();return 'clicked';})()" >> "$OUT" 2>&1
}
start_final() {
  agent-browser eval "(()=>{const norm=(s)=>(s||'').replace(/\\u200c/g,'');const card=[...document.querySelectorAll('button,[role=button],div[class*=cursor-pointer]')].find(x=>norm(x.textContent).includes('پایان ترم'));if(card)card.click();return 'card:'+(card?'ok':'missing');})()" >> "$OUT" 2>&1
  sleep 1.2
  agent-browser eval "(()=>{const norm=(s)=>(s||'').replace(/\\u200c/g,'');const pat=norm('شروع آزمون پایانترم');let b=[...document.querySelectorAll('button')].find(x=>norm(x.textContent).includes(pat));if(!b)b=document.querySelector('button[class*=\"from-amber-700\"][class*=\"to-orange-700\"]');if(!b)return 'NO-START';b.click();return 'started';})()" >> "$OUT" 2>&1
}
answer_all() {
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

agent-browser close >/dev/null 2>&1 || true
agent-browser open "$BASE" >/dev/null 2>&1
agent-browser set viewport 1280 900 >/dev/null 2>&1
agent-browser wait 'body' >/dev/null 2>&1 || true
for i in $(seq 1 30); do
  R=$(agent-browser eval "(()=>{const g=document.querySelector('[aria-label=\"ابزارهای یادگیری\"]');return g?'HOME-OK':'WAIT';})()" 2>/dev/null | tr -d '"')
  [ "$R" = "HOME-OK" ] && { echo "home-ready" >> "$OUT"; break; }
  sleep 3
done
node "$DIR/r338-persona.js" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>process.stdout.write(JSON.parse(s).browserEval))" > /tmp/r341-seed-eval-b.js || { echo "PERSONA-FAIL" | tee -a "$OUT"; agent-browser close >/dev/null 2>&1; exit 1; }
agent-browser eval "$(cat /tmp/r341-seed-eval-b.js)" >/dev/null 2>&1
sleep 5
agent-browser eval "(()=>{document.documentElement.classList.remove('dark');sessionStorage.setItem('vision2-exam-timed-prefill','0');sessionStorage.setItem('vision2-konkur-timed-prefill','0');return 'light+untimed';})()" >/dev/null 2>&1
sleep 1
click_tool "آزمون جامع"; sleep 2
start_final; sleep 3
answer_all 35
sleep 2
agent-browser eval "(()=>{return document.querySelector('.certificate-card')?'CERT':'NONE';})()" 2>/dev/null | tr -d '"' >> "$OUT"; echo >> "$OUT"

echo "-- [B1] share — روشن: انتظارِ توستِ صادقانهٔ خطا" | tee -a "$OUT"
click_btn "اشتراک‌گذاری نتیجه"; sleep 1.4
tprobe "share-fail-toast-light"
dbg "share-fail-toast-light"
shot r341-sharefail-toast-light.png

echo "-- [B2] share — تاریک" | tee -a "$OUT"
to_dark_inplace
click_btn "اشتراک‌گذاری نتیجه"; sleep 1.4
tprobe "share-fail-toast-dark"
dbg "share-fail-toast-dark"
shot r341-sharefail-toast-dark.png

echo "-- [B3] رگرسیونِ دانلود — تاریک" | tee -a "$OUT"
click_btn "دانلود تصویر نتیجه"; sleep 1.4
tprobe "download-toast-dark-after-fix"

echo "########## END" | tee -a "$OUT"
agent-browser close >/dev/null 2>&1 || true
echo "DONE → $OUT"
