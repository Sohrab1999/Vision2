#!/usr/bin/env bash
# ------------------------------------------------------------------
# r340 — «سویپِ زندهٔ نمایهایِ نتیجهٔ آزمون در دسکتاپِ ۱۲۸۰» (نسخهٔ ۲)
#   پیشنهادِ ③ِ r339. درسِ نسخهٔ ۱: آزمون پیشفرضِ زماندار است (۴۵ث/سؤال)
#   و تایمر وسطِ رانندگی اتوسابمیت کرد؛ و «شبیه‌ساز» ZWNJ دارد — شروعِ
#   بی‌استریپ سکوت کرد. این نسخه: سه جلسهٔ کاملاً کنترلشدهٔ بیزمان
#   (prefillِ flag=0) با تطبیقِ ZWNJ-امن — آزمون واژگان + شبیهساز کنکور +
#   آزمون پایانترم (مسیرِ certificate که هرگز سنجیده نشده) — هر کدام تا
#   نمایِ نتیجه در دو تم.
#   dbgِ کلصفحه (r328-fails-dbg.js) + basis-zero + negctlِ تقویتشدهٔ r339.
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
DIR=/home/z/my-project/scripts
OUT=/tmp/r340-results2.txt
mkdir -p "$EV"; : > "$OUT"

dbg()   { echo "-- [contrast] $1" | tee -a "$OUT"; agent-browser eval "$(cat "$DIR/r328-fails-dbg.js")" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
basis() { echo "-- [basis-zero] $1" | tee -a "$OUT"; agent-browser eval "$(cat "$DIR/r319-basis-zero-audit.js")" 2>&1 | tail -1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
shot()  { agent-browser screenshot "$EV/$1" >/dev/null 2>&1; }
probe() { echo "-- [result-probe] $1" | tee -a "$OUT"; agent-browser eval "$(cat "$DIR/r340-result-probe.js")" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
to_dark_inplace()   { agent-browser eval "(()=>{document.documentElement.classList.add('dark');return 'd';})()" >/dev/null 2>&1; sleep 1.2; }
back_light_inplace(){ agent-browser eval "(()=>{document.documentElement.classList.remove('dark');return 'l';})()" >/dev/null 2>&1; sleep 1.2; }

negctl() { # درسِ r339: جوهرِ کاشتهشده باید خودش در failsList بیاید
  agent-browser eval "(()=>{const n=document.createElement('div');n.id='r340-negctl';n.style.cssText='position:fixed;top:4px;right:4px;z-index:99999;background:#d1fae5;color:#6ee7b7;font-size:12px;padding:4px';n.textContent='کنترلِ منفیِ r340';document.body.appendChild(n);return 'PLANTED';})()" >/dev/null 2>&1
  local RES; RES=$(agent-browser eval "$(cat "$DIR/r328-fails-dbg.js")" 2>/dev/null)
  agent-browser eval "(()=>{document.getElementById('r340-negctl')?.remove();return 'rm';})()" >/dev/null 2>&1
  echo "-- [negctl] $1 → ${RES:0:100}" | tee -a "$OUT"
  if ! echo "$RES" | rg -q '110, 231, 183'; then
    echo "NEGCTL-FAIL: مردودِ کاشتهشده دیده نشد — ابزارِ راند نامعتبر است" | tee -a "$OUT"
    return 1
  fi
  echo "-- negctl=OK" | tee -a "$OUT"
}

click_tool() { # تطبیقِ ZWNJ-امن (درسِ r319)
  agent-browser eval "(()=>{const g=document.querySelector('[aria-label=\"ابزارهای یادگیری\"]');if(!g)return 'NO-GRID';const b=[...g.querySelectorAll('button')].find(x=>(x.textContent||'').replace(/\\u200c/g,'').includes('$1'));if(!b)return 'NO-BTN';b.click();return 'clicked';})()" >> "$OUT" 2>&1
}
start_btn() { # درسِ نسخهٔ ۱: استریپِ ZWNJ از هر دو طرف — «شبیه‌ساز» بی‌استریپ سکوت کرد
  agent-browser eval "(()=>{const b=[...document.querySelectorAll('button')].find(x=>(x.textContent||'').replace(/\\u200c/g,'').trim().includes('$1'));if(!b)return 'NO-START';b.click();return 'started';})()" >> "$OUT" 2>&1
}
result_visible() {
  agent-browser eval "(()=>{return document.body.innerText.includes('نتیجهٔ نهایی')?1:0;})()" 2>/dev/null | tr -d '"'
}
# پاسخگوییِ واقعی — الگویِ r336 + تحملِ گیر: تا ۴ تلاشِ هر سؤال؛ اگر نتیجه
# آمد (سابمیتِ هر مسیر دیگر) زودتر بیرون — صادقانه ثبت میشود.
answer_all() { # $1 = بیشینهٔ سؤال
  local DONE=0
  for i in $(seq 1 "$1"); do
    [ "$DONE" = "1" ] && break
    local K=1; [ $((i % 2)) -eq 0 ] && K=2
    local OK=0
    for try in 1 2 3 4; do
      local R; R=$(agent-browser eval "(()=>{if(document.body.innerText.includes('نتیجهٔ نهایی'))return 'RESULT';const os=[...document.querySelectorAll('[data-quiz-option]')].filter(o=>o.getBoundingClientRect().width>0);if(!os.length)return 'NO-OPT';const t=os[Math.min($K,os.length-1)];t.click();return 'opt'+$K;})()" 2>/dev/null | tr -d '"')
      if [ "$R" = "RESULT" ]; then DONE=1; break; fi
      if [ "$R" != "NO-OPT" ]; then echo "q$i/$try=$R" >> "$OUT"; OK=1; break; fi
      sleep 1
    done
    [ "$DONE" = "1" ] && break
    [ "$OK" = "0" ] && { echo "q$i=STUCK" >> "$OUT"; continue; }
    sleep 1.1
    local N; N=$(agent-browser eval "(()=>{if(document.body.innerText.includes('نتیجهٔ نهایی'))return 'RESULT';const n=document.querySelector('[data-quiz-next]');if(!n)return 'NO-NEXT';n.click();return 'next';})()" 2>/dev/null | tr -d '"')
    if [ "$N" = "RESULT" ]; then DONE=1; break; fi
    echo "adv=$N" >> "$OUT"
    sleep 1.1
  done
  echo "loop-done" >> "$OUT"
}
go_home() {
  agent-browser eval "(()=>{location.reload();return 'reloading';})()" >/dev/null 2>&1
  sleep 4
  agent-browser eval "(()=>{window.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyH',key:'h',bubbles:true}));return 'KeyH';})()" >/dev/null 2>&1
  sleep 1.5
}
no_timer() { # prefillِ flag=0 — درسِ نسخهٔ ۱: آزمون پیشفرضِ زماندار اتوسابمیت کرد
  agent-browser eval "(()=>{sessionStorage.setItem('vision2-exam-timed-prefill','0');sessionStorage.setItem('vision2-konkur-timed-prefill','0');return 'untimed';})()" >/dev/null 2>&1
}

echo "########## seedِ شخصیتِ r338 + دسکتاپِ ۱۲۸۰ (روشنِ تحمیلی)" | tee -a "$OUT"
agent-browser close >/dev/null 2>&1 || true
agent-browser open "$BASE" >/dev/null 2>&1
agent-browser set viewport 1280 900 >/dev/null 2>&1
agent-browser wait 'body' >/dev/null 2>&1 || true
sleep 2
node "$DIR/r338-persona.js" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>process.stdout.write(JSON.parse(s).browserEval))" > /tmp/r340-seed-eval.js || { echo "PERSONA-FAIL" | tee -a "$OUT"; exit 1; }
agent-browser eval "$(cat /tmp/r340-seed-eval.js)" >/dev/null 2>&1
sleep 4
agent-browser eval "(()=>{document.documentElement.classList.remove('dark');return 'l';})()" >/dev/null 2>&1
sleep 1
GUARD=$(agent-browser eval "(()=>{const v=(s)=>{const e=document.querySelector(s);if(!e)return 0;const r=e.getBoundingClientRect();return r.width>0?1:0;};return (v('.c-chip-flame')&&v('[aria-label=\"پروفایل من\"]'))?1:0;})()" 2>/dev/null | tr -d '"')
if [ "$GUARD" != "1" ]; then echo "SEED-GUARD-FAIL" | tee -a "$OUT"; agent-browser close >/dev/null 2>&1; exit 1; fi
echo "-- seed-guard=OK" | tee -a "$OUT"

echo "########## A) آزمون واژگان — ۱۰تاییِ بیزمان تا نتیجه (روشن)" | tee -a "$OUT"
no_timer
click_tool "آزمون جامع"; sleep 2
start_btn "شروع آزمون جامع"; sleep 2.5
answer_all 10
sleep 2
probe "exam-vocab-done-light"
negctl "exam-light-1280" || { agent-browser close >/dev/null 2>&1; exit 1; }
dbg "exam-vocab-done-light-1280"
basis "exam-vocab-done-light-1280"
shot "r340-exam-vocab-done-light.png"
to_dark_inplace
dbg "exam-vocab-done-dark-1280"
shot "r340-exam-vocab-done-dark.png"
back_light_inplace

echo "########## B) شبیهساز کنکور — ۱۰تاییِ بیزمان تا نتیجه (روشن)" | tee -a "$OUT"
go_home
no_timer
click_tool "گوشهٔ کنکور"; sleep 2
start_btn "شروع شبیهساز کنکور"; sleep 2.5
answer_all 10
sleep 2
probe "konkur-done-light"
negctl "konkur-light-1280" || { agent-browser close >/dev/null 2>&1; exit 1; }
dbg "konkur-done-light-1280"
basis "konkur-done-light-1280"
shot "r340-konkur-done-light.png"
to_dark_inplace
dbg "konkur-done-dark-1280"
shot "r340-konkur-done-dark.png"
back_light_inplace

echo "########## C) آزمون پایانترم — مسیرِ گواهی (روشن)" | tee -a "$OUT"
go_home
no_timer
click_tool "آزمون جامع"; sleep 2
start_btn "شروع آزمون پایانترم"; sleep 2.5
answer_all 10
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

echo "########## basis-zeroِ خانه (پس از همه)" | tee -a "$OUT"
go_home
basis "home-after-sweep-1280"

echo "########## DONE" | tee -a "$OUT"
agent-browser close >/dev/null 2>&1
echo "log=$OUT"
