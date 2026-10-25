#!/usr/bin/env bash
# ------------------------------------------------------------------
# r342 — نخستین زندهسنجیِ «مسیرِ شکستِ canvas» رویِ گواهیِ پایانترم.
#   r341 دانلود/اشتراک را زنده سنجید ولی همیشه در مسیرِ *موفق*؛ توستِ
#   صادقانهٔ «خطا در ساخت تصویر» (شش درگاه) از آغازِ تاریخ هیچگاه زنده
#   تولید نشده بود. درمانِ سنجشی: تزریقِ toBlob→null (رفتارِ واقعیِ
#   «کدگذاریِ ناموفق» — قراردادِ downloadResultImage: blobِ null ⇒ false
#   ⇒ توستِ خطا) در دو تم + negctlِ بازگردانی (بعد از restore باید توستِ
#   موفقیت و لنگرِ download واقعی بیاید) + رکوردگرِ لنگر.
#   درسهایِ نهفته: prefillِ بیزمان (Task 71) · ModeCardِ پایانترم (r340) ·
#   گاردِ seed (r338) · negctlِ دقیق (r339) · پروبِ mountِ توست (r341).
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
DIR=/home/z/my-project/scripts
OUT=/tmp/r342-cert.txt
: > "$OUT"

dbg()   { echo "-- [contrast] $1" | tee -a "$OUT"; agent-browser eval "$(cat "$DIR/r328-fails-dbg.js")" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
shot()  { agent-browser screenshot "$EV/$1" >/dev/null 2>&1; }
tprobe(){ echo "-- [toast-probe] $1" | tee -a "$OUT"; agent-browser eval "$(cat "$DIR/r341-toast-probe.js")" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
to_dark_inplace()   { agent-browser eval "(()=>{document.documentElement.classList.add('dark');return 'd';})()" >/dev/null 2>&1; sleep 1.2; }
back_light_inplace(){ agent-browser eval "(()=>{document.documentElement.classList.remove('dark');return 'l';})()" >/dev/null 2>&1; sleep 1.2; }

# تزریقِ شکستِ کدگذاری — قبل از کلیکِ دانلود نصب میشود؛ رفتارِ واقعیِ
# toBlob حفظ میشود (رفتارِ اصلی ذخیره و بازگردانی میشود — الگویِ رکوردگرِ r341)
install_fail() {
  agent-browser eval "(()=>{
    if(!window.__origToBlob) window.__origToBlob=HTMLCanvasElement.prototype.toBlob;
    window.__r342fail={n:0,dl:0,name:''};
    HTMLCanvasElement.prototype.toBlob=function(cb,...rest){window.__r342fail.n++;setTimeout(()=>cb(null),0);};
    document.addEventListener('click',(e)=>{const a=e.target&&e.target.closest?e.target.closest('a[download]'):null;if(a){window.__r342fail.dl++;window.__r342fail.name=a.download||'?';}},true);
    return 'fail-injected';
  })()" 2>&1 | tee -a "$OUT"
}
restore_ok() {
  agent-browser eval "(()=>{
    if(window.__origToBlob) HTMLCanvasElement.prototype.toBlob=window.__origToBlob;
    return 'restored:'+(window.__r342fail?window.__r342fail.n:0);
  })()" 2>&1 | tee -a "$OUT"
}
fail_state() { agent-browser eval "(()=>JSON.stringify(window.__r342fail||{}))()" 2>&1 | tee -a "$OUT"; }
click_btn() {
  agent-browser eval "(()=>{const norm=(s)=>(s||'').replace(/\\u200c/g,'');const b=[...document.querySelectorAll('button')].find(x=>norm(x.textContent).includes(norm('$1'))&&x.getBoundingClientRect().width>0);if(!b)return 'NO-BTN:$1';b.click();return 'clicked';})()" 2>&1 | tee -a "$OUT"
}
wait_home() {
  for i in $(seq 1 30); do
    local R; R=$(agent-browser eval "(()=>{const g=document.querySelector('[aria-label=\"ابزارهای یادگیری\"]');return g?'HOME-OK':'WAIT';})()" 2>/dev/null | tr -d '"')
    [ "$R" = "HOME-OK" ] && { echo "home-ready-${i}x3s" >> "$OUT"; return 0; }
    sleep 3
  done
  echo "HOME-NEVER" | tee -a "$OUT"; return 1
}
seed_guard() {
  local R; R=$(agent-browser eval "(()=>{const t=document.body.innerText||'';const hasName=t.includes('آرش-قهرمان');const hasGrid=!!document.querySelector('[aria-label=\"ابزارهای یادگیری\"]');return (hasName&&hasGrid)?'SEED-OK':'SEED-MISS';})()" 2>/dev/null | tr -d '"')
  echo "-- [seed-guard] $R" | tee -a "$OUT"
  [ "$R" = "SEED-OK" ]
}
start_final() {
  agent-browser eval "(()=>{const norm=(s)=>(s||'').replace(/\\u200c/g,'');const card=[...document.querySelectorAll('button,[role=button],div[class*=cursor-pointer]')].find(x=>norm(x.textContent).includes('پایان ترم'));if(card)card.click();return 'card:'+(card?'ok':'missing');})()" >> "$OUT" 2>&1
  sleep 1.2
  agent-browser eval "(()=>{const norm=(s)=>(s||'').replace(/\\u200c/g,'');let b=[...document.querySelectorAll('button')].find(x=>norm(x.textContent).includes('شروع آزمون پایانترم'));if(!b)b=document.querySelector('button[class*=\"from-amber-700\"][class*=\"to-orange-700\"]');if(!b)return 'NO-START';b.click();return 'started';})()" >> "$OUT" 2>&1
}
answer_all() {
  local DONE=0
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
  echo "loop-done" >> "$OUT"
}

echo "########## A) گواهیِ پایانترم — روشنِ ۱۲۸۰" | tee -a "$OUT"
agent-browser close >/dev/null 2>&1 || true
agent-browser open "$BASE" >/dev/null 2>&1
agent-browser set viewport 1280 900 >/dev/null 2>&1
agent-browser wait 'body' >/dev/null 2>&1 || true
sleep 2
node "$DIR/r338-persona.js" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>process.stdout.write(JSON.parse(s).browserEval))" > /tmp/r342-seed-eval.js || { echo "PERSONA-FAIL" | tee -a "$OUT"; agent-browser close >/dev/null 2>&1; exit 1; }
wait_home || { agent-browser close >/dev/null 2>&1; exit 1; }
agent-browser eval "$(cat /tmp/r342-seed-eval.js)" >/dev/null 2>&1
sleep 5
seed_guard || { agent-browser close >/dev/null 2>&1; exit 1; }
agent-browser eval "(()=>{document.documentElement.classList.remove('dark');sessionStorage.setItem('vision2-exam-timed-prefill','0');sessionStorage.setItem('vision2-konkur-timed-prefill','0');return 'light+untimed';})()" >/dev/null 2>&1
sleep 1
agent-browser eval "(()=>{const g=document.querySelector('[aria-label=\"ابزارهای یادگیری\"]');const b=g&&[...g.querySelectorAll('button')].find(x=>(x.textContent||'').replace(/\\u200c/g,'').includes('آزمون جامع'));if(!b)return 'NO-TOOL';b.click();return 'ok';})()" >> "$OUT" 2>&1
sleep 2
start_final; sleep 3
answer_all 35
sleep 3
CERT=$(agent-browser eval "(()=>document.querySelector('.certificate-card')?'CERT':(document.body.innerText.includes('نتیجهٔ نهایی')?'RESULT':'NONE'))()" 2>/dev/null | tr -d '"')
echo "-- [done-view] $CERT" | tee -a "$OUT"
[ "$CERT" != "NONE" ] || { agent-browser close >/dev/null 2>&1; exit 1; }
shot r342-cert-light.png

echo "########## B) شکستِ کدگذاری — روشن: toBlob→null" | tee -a "$OUT"
install_fail
click_btn "دانلود تصویر نتیجه"; sleep 1.6
fail_state
tprobe "fail-toast-light"
dbg "cert-fail-light"; shot r342-toast-fail-light.png

echo "########## C) شکست — تاریکِ درجا: همان دکمه" | tee -a "$OUT"
to_dark_inplace
click_btn "دانلود تصویر نتیجه"; sleep 1.6
fail_state
tprobe "fail-toast-dark"
dbg "cert-fail-dark"; shot r342-toast-fail-dark.png

echo "########## D) negctl — بازگردانیِ toBlob ⇒ موفقیتِ کامل" | tee -a "$OUT"
back_light_inplace
restore_ok
click_btn "دانلود تصویر نتیجه"; sleep 1.6
fail_state
tprobe "success-toast-negctl-light"
dbg "cert-ok-light"; shot r342-toast-ok-light.png

echo "########## E) خانه — basis-zero نهایی" | tee -a "$OUT"
agent-browser eval "$(cat "$DIR/r319-basis-zero-audit.js")" 2>&1 | tail -1 | tee -a "$OUT"
agent-browser close >/dev/null 2>&1
echo "QA-R342-CERT-FAILPATH-DONE" | tee -a "$OUT"
