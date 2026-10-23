#!/usr/bin/env bash
# ------------------------------------------------------------------
# r341 — سویپِ زندهٔ «مسیرِ تصویرِ نتیجه و اشتراک» — دنبالهٔ طبیعیِ r340:
#   دکمههایِ دانلود/اشتراک رویِ نمایهایِ done سنجیده شده بودند ولی
#   *مسیرِ واقعیِ* هرگز: canvasِ downloadResultImage (توستِ موفقیت/خطا)،
#   fallbackِ کلیپبوردِ share (توستِ «نتیجه کپی شد» یا سکوتِ مخروبه)،
#   و خودِ توستهایِ رادیکس بهعنوانِ سطحِ UI در دو تم.
#   درسهایِ نهفته: استریپِ دوسویهٔ ZWNJ (r340) · prefillِ بیزمان (Task 71) ·
#   ModeCardِ پایانترم (r340) · negctlِ دقیق (r339) · گاردِ seed (r338).
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
DIR=/home/z/my-project/scripts
OUT=/tmp/r341-share.txt
: > "$OUT"

dbg()   { echo "-- [contrast] $1" | tee -a "$OUT"; agent-browser eval "$(cat "$DIR/r328-fails-dbg.js")" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
basis() { echo "-- [basis-zero] $1" | tee -a "$OUT"; agent-browser eval "$(cat "$DIR/r319-basis-zero-audit.js")" 2>&1 | tail -1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
shot()  { agent-browser screenshot "$EV/$1" >/dev/null 2>&1; }
probe() { echo "-- [result-probe] $1" | tee -a "$OUT"; agent-browser eval "$(cat "$DIR/r340-result-probe.js")" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
tprobe(){ echo "-- [toast-probe] $1" | tee -a "$OUT"; agent-browser eval "$(cat "$DIR/r341-toast-probe.js")" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
to_dark_inplace()   { agent-browser eval "(()=>{document.documentElement.classList.add('dark');return 'd';})()" >/dev/null 2>&1; sleep 1.2; }
back_light_inplace(){ agent-browser eval "(()=>{document.documentElement.classList.remove('dark');return 'l';})()" >/dev/null 2>&1; sleep 1.2; }
negctl() { # negctlِ دقیقِ r339: جوهرِ کاشتهشده باید در failsList دیده شود
  agent-browser eval "(()=>{const n=document.createElement('div');n.id='r341-negctl';n.style.cssText='position:fixed;top:4px;right:4px;z-index:99999;background:#d1fae5;color:#6ee7b7;font-size:12px;padding:4px';n.textContent='کنترلِ منفیِ r341';document.body.appendChild(n);return 'PLANTED';})()" >/dev/null 2>&1
  local RES; RES=$(agent-browser eval "$(cat "$DIR/r328-fails-dbg.js")" 2>/dev/null)
  agent-browser eval "(()=>{document.getElementById('r341-negctl')?.remove();return 'rm';})()" >/dev/null 2>&1
  echo "-- [negctl] $1 → ${RES:0:80}" | tee -a "$OUT"
  if ! echo "$RES" | rg -q '110, 231, 183'; then echo "NEGCTL-FAIL" | tee -a "$OUT"; return 1; fi
  echo "-- negctl=OK" | tee -a "$OUT"
}
# رکوردِ مسیرِ دانلود و کلیپبورد — رفتارِ واقعی حفظ میشود (rethrow)
install_recorders() {
  agent-browser eval "(()=>{
    window.__r341dl={n:0,name:''};
    document.addEventListener('click',(e)=>{const a=e.target&&e.target.closest?e.target.closest('a[download]'):null;if(a){window.__r341dl.n++;window.__r341dl.name=a.download||'?';}},true);
    window.__r341share={called:0,ok:0,err:'',text:'',hasShare:typeof navigator.share==='function',hasCb:!!(navigator.clipboard&&navigator.clipboard.writeText)};
    if(window.__r341share.hasCb){const orig=navigator.clipboard.writeText.bind(navigator.clipboard);
      navigator.clipboard.writeText=async(t)=>{window.__r341share.called++;window.__r341share.text=String(t).slice(0,140);
        try{const r=await orig(t);window.__r341share.ok++;return r;}
        catch(e){window.__r341share.err=String(e&&(e.message||e)||e).slice(0,90);throw e;}};}
    return 'recorders:'+window.__r341share.hasShare+':'+window.__r341share.hasCb;
  })()" 2>&1 | tee -a "$OUT"
}
rec_state() { agent-browser eval "(()=>JSON.stringify({dl:window.__r341dl,sh:{c:window.__r341share.called,ok:window.__r341share.ok,e:window.__r341share.err,tx:window.__r341share.text.slice(0,50)}}))()" 2>&1 | tee -a "$OUT"; }
click_btn() { # $1=کلیدِ متن (پس از استریپِ ZWNJ) — دکمهٔ مرئیِ نخستین
  agent-browser eval "(()=>{const norm=(s)=>(s||'').replace(/\\u200c/g,'');const pat=norm('$1');const b=[...document.querySelectorAll('button')].find(x=>norm(x.textContent).includes(pat)&&x.getBoundingClientRect().width>0);if(!b)return 'NO-BTN:'+pat;b.click();return 'clicked:'+norm(b.textContent).slice(0,24);})()" 2>&1 | tee -a "$OUT"
}
click_tool() {
  agent-browser eval "(()=>{const g=document.querySelector('[aria-label=\"ابزارهای یادگیری\"]');if(!g)return 'NO-GRID';const b=[...g.querySelectorAll('button')].find(x=>(x.textContent||'').replace(/\\u200c/g,'').includes('$1'));if(!b)return 'NO-BTN';b.click();return 'clicked';})()" >> "$OUT" 2>&1
}
wait_home() { # سرورِ سردِ راند — نشانهٔ خانه تا ۹۰ثانیه (درسِ اجرایِ اولِ r341)
  for i in $(seq 1 30); do
    local R; R=$(agent-browser eval "(()=>{const g=document.querySelector('[aria-label=\"ابزارهای یادگیری\"]');return g?'HOME-OK':'WAIT';})()" 2>/dev/null | tr -d '"')
    [ "$R" = "HOME-OK" ] && { echo "home-ready-after-${i}x3s" >> "$OUT"; return 0; }
    sleep 3
  done
  echo "HOME-NEVER" | tee -a "$OUT"; return 1
}
seed_guard() { # گاردِ سختِ seed (درسِ r338) — شعله/پروفایل باید mount باشند
  local R; R=$(agent-browser eval "(()=>{const t=document.body.innerText||'';const hasName=t.includes('آرش-قهرمان');const hasGrid=!!document.querySelector('[aria-label=\"ابزارهای یادگیری\"]');return (hasName&&hasGrid)?'SEED-OK':'SEED-MISS:'+hasName+':'+hasGrid;})()" 2>/dev/null | tr -d '"')
  echo "-- [seed-guard] $R" | tee -a "$OUT"
  [ "$R" = "SEED-OK" ]
}
dump_state() { echo "-- [dump] $1" | tee -a "$OUT"; agent-browser eval "(()=>{const t=(document.body.innerText||'').replace(/\\s+/g,' ').slice(0,200);return 'URL:'+location.pathname+' BODY:'+t;})()" 2>&1 | tee -a "$OUT"; }
start_final() { # ModeCardِ «پایان ترم» + دکمهٔ کهربایی (fallbackِ کلاسیِ یکتا)
  agent-browser eval "(()=>{const norm=(s)=>(s||'').replace(/\\u200c/g,'');const card=[...document.querySelectorAll('button,[role=button],div[class*=cursor-pointer]')].find(x=>norm(x.textContent).includes('پایان ترم'));if(card)card.click();return 'card:'+(card?'ok':'missing');})()" >> "$OUT" 2>&1
  sleep 1.2
  agent-browser eval "(()=>{const norm=(s)=>(s||'').replace(/\\u200c/g,'');const pat=norm('شروع آزمون پایانترم');let b=[...document.querySelectorAll('button')].find(x=>norm(x.textContent).includes(pat));if(!b)b=document.querySelector('button[class*=\"from-amber-700\"][class*=\"to-orange-700\"]');if(!b)return 'NO-START';b.click();return 'started';})()" >> "$OUT" 2>&1
}
start_vocab() { # درسِ اجرایِ سومِ r341: mode در exam-view میماند — ModeCardِ واژگانِ صریح + دکمهٔ زمردیِ «شروع آزمون جامع»
  agent-browser eval "(()=>{const norm=(s)=>(s||'').replace(/\\u200c/g,'');const card=[...document.querySelectorAll('button,[role=button],div[class*=cursor-pointer]')].find(x=>norm(x.textContent).includes('آزمون جامع واژگان'));if(card)card.click();return 'mode:'+(card?'vocab':'missing');})()" >> "$OUT" 2>&1
  sleep 1.2
  agent-browser eval "(()=>{const norm=(s)=>(s||'').replace(/\\u200c/g,'');let b=[...document.querySelectorAll('button')].find(x=>norm(x.textContent).includes('شروع آزمون جامع')&&x.getBoundingClientRect().width>0);if(!b)b=document.querySelector('button[class*=\"bg-emerald-700\"]');if(!b)return 'NO-START';b.click();return 'started:'+(b.textContent||'').slice(0,20);})()" >> "$OUT" 2>&1
}
result_visible() {
  agent-browser eval "(()=>{return (document.body.innerText.includes('نتیجهٔ نهایی')||document.querySelector('.certificate-card'))?1:0;})()" 2>/dev/null | tr -d '"'
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

echo "########## A) گواهیِ پایانترم — روشنِ ۱۲۸۰: مسیرِ دانلود/اشتراک" | tee -a "$OUT"
agent-browser close >/dev/null 2>&1 || true
agent-browser open "$BASE" >/dev/null 2>&1
agent-browser set viewport 1280 900 >/dev/null 2>&1
agent-browser wait 'body' >/dev/null 2>&1 || true
sleep 2
node "$DIR/r338-persona.js" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>process.stdout.write(JSON.parse(s).browserEval))" > /tmp/r341-seed-eval.js || { echo "PERSONA-FAIL" | tee -a "$OUT"; agent-browser close >/dev/null 2>&1; exit 1; }
wait_home || { agent-browser close >/dev/null 2>&1; exit 1; }
agent-browser eval "$(cat /tmp/r341-seed-eval.js)" >/dev/null 2>&1
sleep 5
seed_guard || { dump_state "seed-failed"; agent-browser close >/dev/null 2>&1; exit 1; }
agent-browser eval "(()=>{document.documentElement.classList.remove('dark');sessionStorage.setItem('vision2-exam-timed-prefill','0');sessionStorage.setItem('vision2-konkur-timed-prefill','0');return 'light+untimed';})()" >/dev/null 2>&1
sleep 1
click_tool "آزمون جامع"; sleep 2
start_final; sleep 3
answer_all 35
sleep 3
agent-browser eval "(()=>{return document.querySelector('.certificate-card')?'CERT':(document.body.innerText.includes('نتیجهٔ نهایی')?'RESULT':'NONE');})()" 2>/dev/null | tr -d '"' >> "$OUT"
echo >> "$OUT"
agent-browser eval "(()=>{if(document.querySelector('.certificate-card')||document.body.innerText.includes('نتیجهٔ نهایی'))return 'ok';const b=[...document.querySelectorAll('button')].find(x=>(x.textContent||'').replace(/\\u200c/g,'').includes('نتیجه')&&x.getBoundingClientRect().width>0);if(b){b.click();return 'result-btn-clicked';}return 'no-result-btn';})()" >> "$OUT" 2>&1
sleep 2
probe "cert-done-light"; shot r341-cert-done-light.png
negctl "cert-light-1280" || { agent-browser close >/dev/null 2>&1; exit 1; }
install_recorders
echo "-- [A1] دانلودِ پرمیوم (canvasِ تاریک) — روشن" | tee -a "$OUT"
click_btn "دانلود تصویر نتیجه"; sleep 1.4
rec_state; tprobe "toast-after-download-light"; dbg "toast-img-saved-light"; shot r341-toast-download-light.png
echo "-- [A2] اشتراک (fallbackِ کلیپبورد در هدلس) — روشن" | tee -a "$OUT"
click_btn "اشتراک‌گذاری نتیجه"; sleep 1.4
rec_state; tprobe "toast-after-share-light"; dbg "toast-copied-light"; shot r341-toast-share-light.png

echo "########## B) گواهی — تاریکِ درجا: همان دو مسیر" | tee -a "$OUT"
to_dark_inplace
negctl "cert-dark-1280" || true
echo "-- [B1] دانلودِ پرمیوم — تاریک" | tee -a "$OUT"
click_btn "دانلود تصویر نتیجه"; sleep 1.4
rec_state; tprobe "toast-after-download-dark"; dbg "toast-img-saved-dark"; shot r341-toast-download-dark.png
echo "-- [B2] اشتراک — تاریک" | tee -a "$OUT"
click_btn "اشتراک‌گذاری نتیجه"; sleep 1.4
rec_state; tprobe "toast-after-share-dark"; dbg "toast-copied-dark"; shot r341-toast-share-dark.png

echo "########## C) نتیجهٔ استاندارد (واژگان) — روشن: دانلودِ سبک" | tee -a "$OUT"
back_light_inplace
agent-browser eval "(()=>{const b=[...document.querySelectorAll('button')].find(x=>(x.textContent||'').replace(/\\u200c/g,'').includes('بازگشت'));if(b)b.click();return 'back';})()" >/dev/null 2>&1
sleep 2.5
# «بازگشت» به لندینگِ خودِ آزمون میرود نه خانه (درسِ اجرایِ دومِ r341) — اگر خانه شدیم، ابزار را باز کن
agent-browser eval "(()=>{const norm=(s)=>(s||'').replace(/\\u200c/g,'');const g=document.querySelector('[aria-label=\"ابزارهای یادگیری\"]');if(g){const b=[...g.querySelectorAll('button')].find(x=>norm(x.textContent).includes('آزمون جامع'));if(b){b.click();return 'grid→exam';}return 'grid-no-btn';}return 'exam-landing';})()" >> "$OUT" 2>&1
sleep 2
agent-browser eval "(()=>{document.documentElement.classList.remove('dark');sessionStorage.setItem('vision2-exam-timed-prefill','0');return 'light';})()" >/dev/null 2>&1
sleep 1
start_vocab; sleep 3
answer_all 30
sleep 3
agent-browser eval "(()=>{if(document.body.innerText.includes('نتیجهٔ نهایی')||document.querySelector('.certificate-card'))return 'ok';const b=[...document.querySelectorAll('button')].find(x=>(x.textContent||'').replace(/\\u200c/g,'').includes('نتیجه')&&x.getBoundingClientRect().width>0);if(b){b.click();return 'result-btn-clicked';}return 'no-result-btn';})()" >> "$OUT" 2>&1
sleep 2
probe "std-done-light"; shot r341-std-done-light.png
install_recorders
click_btn "دانلود تصویر نتیجه"; sleep 1.4
rec_state; tprobe "toast-after-download-std-light"; dbg "toast-img-saved-std-light"; shot r341-toast-download-std-light.png

echo "########## D) توست در ۳۹۰ — دانلودِ استاندارد رویِ موبایل" | tee -a "$OUT"
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 1
click_btn "دانلود تصویر نتیجه"; sleep 1.4
rec_state; tprobe "toast-download-390"; shot r341-toast-download-390.png

echo "########## E) خانه — بازگشت و basis-zero نهایی" | tee -a "$OUT"
agent-browser eval "(()=>{const b=[...document.querySelectorAll('button')].find(x=>(x.textContent||'').replace(/\\u200c/g,'').includes('بازگشت'));if(b)b.click();return 'back';})()" >/dev/null 2>&1
sleep 2
agent-browser eval "(()=>{const g=document.querySelector('[aria-label=\"ابزارهای یادگیری\"]');if(!g){const b=[...document.querySelectorAll('button')].find(x=>(x.textContent||'').replace(/\\u200c/g,'').includes('بازگشت'));if(b)b.click();}return 'home-seek';})()" >/dev/null 2>&1
sleep 2
basis "home-after-all"
echo "########## END" | tee -a "$OUT"
agent-browser close >/dev/null 2>&1 || true
echo "DONE → $OUT"
