#!/usr/bin/env bash
# ------------------------------------------------------------------
# r342 — نخستین داوریِ زندهٔ «شاخهٔ attach» همگامسازیِ کدِ یادگیرنده
#   (پیشنهادِ ②ِ r341 — نمایشِ «آخرین همگامسازی»یِ r338 پیشگیرانه درمان
#   شد ولی هیچ مسیرِ زنده‌ای دیده نشده بود). ماتریسِ زنده:
#   ① ساختِ کد ⇒ توستِ «✓ کد یادگیرنده ساخته شد» + کدِ واقعی + «آخرین
#      همگامسازی»  ② قطع ⇒ توستِ صادقانه  ③ ورود با کدِ غایبِ معتبرقالب
#      ⇒ «بازیابی ناموفق» (شکستِ صادقانه، محدودِ ۱۲/دقیقه)  ④ ورود با
#      کدِ واقعی ⇒ «✓ پیشرفت ادغام شد» + reloadِ ۹۰۰ms  ⑤ پس از reload:
#      کد برجاست + «آخرین همگامسازی» + «بهروزرسانی ابری» ⇒ «✓ روی ابر
#      بهروز شد»  ⑥ copy با کلیپبوردِ بیاجازه ⇒ توستِ «کپی نشد» (r341).
#   پاکسازی: ردیفِ learnerSyncِ QA با کدِ ضبطشده حذف میشود (r342-sync-cleanup).
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
DIR=/home/z/my-project/scripts
OUT=/tmp/r342-sync.txt
: > "$OUT"

shot()  { agent-browser screenshot "$EV/$1" >/dev/null 2>&1; }
tprobe(){ echo "-- [toast-probe] $1" | tee -a "$OUT"; agent-browser eval "$(cat "$DIR/r341-toast-probe.js")" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
clear_toasts(){ agent-browser eval "(()=>{const v=document.querySelector('[data-radix-toast-viewport]');if(v)v.innerHTML='';return 'c';})()" >/dev/null 2>&1; sleep 0.4; }
open_profile() { # زبانهٔ پروفایلِ پاپاُور (همان درِ r338/r339)
  agent-browser eval "(()=>{const t=[...document.querySelectorAll('button')].find(x=>(x.getAttribute('aria-label')||'').startsWith('پروفایل من'));if(!t)return 'NO-TRIGGER';t.click();return 'profile-open';})()" 2>&1 | tee -a "$OUT"
  sleep 1.5
}
sync_click() {
  agent-browser eval "(()=>{const norm=(s)=>(s||'').replace(/\\u200c/g,'');const dlg=[...document.querySelectorAll('[role=dialog]')].find(d=>d.getAttribute('data-state')==='open'&&getComputedStyle(d).visibility!=='hidden');const root=dlg||document;const b=[...root.querySelectorAll('button')].find(x=>norm(x.textContent).includes(norm('$1'))&&x.getBoundingClientRect().width>0);if(!b)return 'NO-BTN:$1';b.click();return 'clicked';})()" 2>&1 | tee -a "$OUT"
}
sync_code_text() { # کدِ منواسپیسِ چسبیده به بخشِ همگامسازی
  agent-browser eval "(()=>{const norm=(s)=>(s||'').replace(/\\u200c/g,'');const dlg=[...document.querySelectorAll('[role=dialog]')].find(d=>d.getAttribute('data-state')==='open'&&getComputedStyle(d).visibility!=='hidden');const root=dlg||document;const el=[...root.querySelectorAll('span[dir=ltr]')].find(x=>/^[A-Z2-9]{4}-?[A-Z2-9]{4}$/.test(x.textContent.trim()));return el?el.textContent.trim():'NO-CODE';})()" 2>&1 | tee -a "$OUT"
}
sync_state() {
  agent-browser eval "(()=>{const norm=(s)=>(s||'').replace(/\\u200c/g,'');const dlg=[...document.querySelectorAll('[role=dialog]')].find(d=>d.getAttribute('data-state')==='open'&&getComputedStyle(d).visibility!=='hidden');const root=dlg||document;const t=norm(root.innerText||'');return JSON.stringify({hasCreate:t.includes('ساخت کد یادگیرنده'),hasCode:/[A-Z2-9]{4}-[A-Z2-9]{4}/.test(t),hasLastSync:t.includes('آخرین همگامسازی'),hasJoin:t.includes('ورود با کد')});})()" 2>&1 | tee -a "$OUT"
}
fill_code() {
  agent-browser eval "(()=>{const dlg=[...document.querySelectorAll('[role=dialog]')].find(d=>d.getAttribute('data-state')==='open'&&getComputedStyle(d).visibility!=='hidden');const root=dlg||document;const i=root.querySelector('input[placeholder*=\"کد موجود\"]');if(!i)return 'NO-INPUT';const set=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;set.call(i,'$1');i.dispatchEvent(new Event('input',{bubbles:true}));return 'filled:$1';})()" 2>&1 | tee -a "$OUT"
}

echo "########## A) seed + پروفایل" | tee -a "$OUT"
agent-browser close >/dev/null 2>&1 || true
agent-browser open "$BASE" >/dev/null 2>&1
agent-browser set viewport 1280 900 >/dev/null 2>&1
agent-browser wait 'body' >/dev/null 2>&1 || true
sleep 2
node "$DIR/r338-persona.js" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>process.stdout.write(JSON.parse(s).browserEval))" > /tmp/r342-seed-eval2.js || { echo "PERSONA-FAIL" | tee -a "$OUT"; agent-browser close >/dev/null 2>&1; exit 1; }
agent-browser eval "$(cat /tmp/r342-seed-eval2.js)" >/dev/null 2>&1
sleep 4
agent-browser eval "(()=>{const g=document.querySelector('[aria-label=\"ابزارهای یادگیری\"]');return g?'HOME-OK':'WAIT';})()" 2>/dev/null | tr -d '"'
open_profile
sync_state

echo "########## B) ساختِ کد ⇒ توست + کد + «آخرین همگامسازی»" | tee -a "$OUT"
sync_click "ساخت کد یادگیرنده"; sleep 2.2
tprobe "create-toast"; shot r342-sync-created.png
CODE=$(sync_code_text | tr -d '"' | grep -oE '[A-Z2-9]{4}-?[A-Z2-9]{4}' | head -1)
echo "-- [code] ${CODE:-NONE}" | tee -a "$OUT"
[ -n "$CODE" ] || { echo "SYNC-CODE-FAIL" | tee -a "$OUT"; agent-browser close >/dev/null 2>&1; exit 1; }
sync_state
clear_toasts

echo "########## C) قطعِ همگامسازی ⇒ توستِ صادقانه" | tee -a "$OUT"
sync_click "قطع همگامسازی این دستگاه"; sleep 1.6
tprobe "disconnect-toast"
sync_state
clear_toasts

echo "########## D) شکستِ صادقانه — کدِ معتبرقالبِ غایب در ابر" | tee -a "$OUT"
fill_code "K7QM-34XP"; sleep 0.5
sync_click "ورود با کد"; sleep 2.2
tprobe "join-fail-toast"; shot r342-sync-joinfail.png
clear_toasts
agent-browser eval "(()=>{const dlg=[...document.querySelectorAll('[role=dialog]')].find(d=>d.getAttribute('data-state')==='open');if(dlg){const i=dlg.querySelector('input[placeholder*=\"کد موجود\"]');if(i){const set=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;set.call(i,'');i.dispatchEvent(new Event('input',{bubbles:true}));}}return 'cleared';})()" >/dev/null 2>&1

echo "########## E) attach — ورود با کدِ واقعی ⇒ ادغام + reload" | tee -a "$OUT"
fill_code "$CODE"; sleep 0.5
sync_click "ورود با کد"; sleep 2.2
tprobe "merge-toast-before-reload"; shot r342-sync-merged.png
echo "-- [reload-wait]" | tee -a "$OUT"
sleep 4
agent-browser eval "(()=>{const g=document.querySelector('[aria-label=\"ابزارهای یادگیری\"]');return g?'HOME-OK-AFTER-RELOAD':'WAIT';})()" 2>/dev/null | tr -d '"'
open_profile
sync_state
tprobe "attached-after-reload"; shot r342-sync-attached.png

echo "########## F) pushِ ابری + copyِ بیاجازه" | tee -a "$OUT"
sync_click "بهروزرسانی ابری"; sleep 2.0
tprobe "push-toast"
clear_toasts
sync_click "کپی"; sleep 1.4
tprobe "copy-fail-toast"   # کلیپبوردِ هدلس بیاجازه ⇒ «کپی نشد» (قراردادِ r341)
agent-browser eval "(()=>JSON.stringify({lsAt:localStorage.getItem('vision2-sync-at')||'none',code:useStudy&&useStudy.getState?useStudy.getState().syncCode:'n/a'}))()" 2>&1 | tee -a "$OUT"

echo "########## G) basis-zeroِ پاپاُورِ پروفایل (مجموعهٔ زندهٔ r319)" | tee -a "$OUT"
agent-browser eval "$(cat "$DIR/r319-basis-zero-audit.js")" 2>&1 | tail -1 | tee -a "$OUT"
agent-browser close >/dev/null 2>&1
echo "CODE-FOR-CLEANUP=$CODE" | tee -a "$OUT"
echo "QA-R342-SYNC-ATTACH-DONE" | tee -a "$OUT"
