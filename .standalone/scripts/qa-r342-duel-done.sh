#!/usr/bin/env bash
# ------------------------------------------------------------------
# r342 — نخستین داوریِ زندهٔ «درگاهِ اشتراکِ نمایِ doneِ نبرد» (پیشنهادِ ③ِ r341)
#   + شکستِ canvasِ کارتِ نبرد + basis-zero رویِ نمایِ واقعیِ done.
#   کلیدِ ساختاری: دکمهٔ «هم‌رسانی» فقط وقتی رندر میشود که canShareImageFiles()
#   true بدهد — پس رکوردگر/استابِ share باید *قبل از mountِ done* نصب شود.
#   ماتریسِ چهار-سرنوشتیِ زنده: shared (resolve) · cancelled-AbortError
#   (سکوتِ مشروع) · cancelled-NotAllowedError (سکوتِ مشروع) · failed
#   (توستِ صادقانهٔ «هم‌رسانی ممکن نشد») + شکستِ toBlob ⇒ «خطا در ساخت تصویر»
#   + بازگردانی ⇒ «🖼 عکسِ این نبرد ذخیره شد» (negctl) + حذفِ استاب ⇒
#   ناپدیدِ خودکارِ دکمه (دروازهٔ صادقِ r102 در تاریکیِ هدلس).
#   درسهایِ نهفته: جوینرِ بلیتیِ r287 · حلقهٔ پاسخِ خودکارِ r94 ·
#   پروبِ mountِ توستِ r341 · استریپِ ZWNJِ r340 · گاردِ seedِ r338.
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
DIR=/home/z/my-project/scripts
OUT=/tmp/r342-duel.txt
: > "$OUT"

basis() { echo "-- [basis-zero] $1" | tee -a "$OUT"; agent-browser eval "$(cat "$DIR/r319-basis-zero-audit.js")" 2>&1 | tail -1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
dbg()   { echo "-- [contrast] $1" | tee -a "$OUT"; agent-browser eval "$(cat "$DIR/r328-fails-dbg.js")" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
shot()  { agent-browser screenshot "$EV/$1" >/dev/null 2>&1; }
tprobe(){ echo "-- [toast-probe] $1" | tee -a "$OUT"; agent-browser eval "$(cat "$DIR/r341-toast-probe.js")" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
to_dark_inplace()   { agent-browser eval "(()=>{document.documentElement.classList.add('dark');return 'd';})()" >/dev/null 2>&1; sleep 1.2; }
back_light_inplace(){ agent-browser eval "(()=>{document.documentElement.classList.remove('dark');return 'l';})()" >/dev/null 2>&1; sleep 1.2; }
norm_click() {
  agent-browser eval "(()=>{const norm=(s)=>(s||'').replace(/\\u200c/g,'');const b=[...document.querySelectorAll('button')].find(x=>norm(x.textContent).includes(norm('$1'))&&x.getBoundingClientRect().width>0);if(!b)return 'NO-BTN:$1';b.click();return 'clicked';})()" 2>&1 | tee -a "$OUT"
}

echo "########## A) seed + اتاقِ نبرد + جوینرِ بلیتی" | tee -a "$OUT"
agent-browser close >/dev/null 2>&1 || true
agent-browser open "$BASE" >/dev/null 2>&1
agent-browser set viewport 1280 900 >/dev/null 2>&1
agent-browser wait 'body' >/dev/null 2>&1 || true
sleep 2
node "$DIR/r338-persona.js" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>process.stdout.write(JSON.parse(s).browserEval))" > /tmp/r342-seed-eval.js || { echo "PERSONA-FAIL" | tee -a "$OUT"; agent-browser close >/dev/null 2>&1; exit 1; }
agent-browser eval "$(cat /tmp/r342-seed-eval.js)" >/dev/null 2>&1
sleep 4
agent-browser eval "(()=>{const g=document.querySelector('[aria-label=\"ابزارهای یادگیری\"]');return g?'HOME-OK':'WAIT';})()" 2>/dev/null | tr -d '"'
agent-browser eval "(()=>{window.dispatchEvent(new CustomEvent('open-duel')); return 'duel-opened';})()" >/dev/null 2>&1
sleep 2.5
CREF=$(agent-browser snapshot 2>/dev/null | grep -oE 'button "ساخت اتاق نبرد" \[[^]]*ref=(e[0-9]+)\]' | grep -oE 'e[0-9]+' | head -1)
if [ -z "$CREF" ]; then echo "CREATE-BUTTON-NOT-FOUND" | tee -a "$OUT"; agent-browser close >/dev/null 2>&1; exit 1; fi
agent-browser click "$CREF" >/dev/null 2>&1
sleep 2
CODE=$(agent-browser snapshot 2>/dev/null | grep -oE 'کد اتاق [A-Z2-9]{5}' | grep -oE '[A-Z2-9]{5}' | head -1)
[ -n "$CODE" ] || { echo "ROOM-CODE-FAIL" | tee -a "$OUT"; agent-browser close >/dev/null 2>&1; exit 1; }
echo "room created: $CODE ✓" | tee -a "$OUT"

# استابِ share — قبل از mountِ done (دکمهٔ هم‌رسانی به canShareِ رندر وابسته است)
agent-browser eval "(()=>{
  window.__r342share={calls:[],canShare:0};
  navigator.canShare=(d)=>{window.__r342share.canShare++;return true;};
  navigator.share=(d)=>{window.__r342share.calls.push({n:window.__r342share.calls.length+1,mode:window.__r342mode||'resolve',files:d&&d.files?d.files.length:0,title:String(d&&d.title||'').slice(0,40),text:String(d&&d.text||'').slice(0,60)});window.__r342share.lastCall=window.__r342share.calls[window.__r342share.calls.length-1];
    const m=window.__r342mode||'resolve';
    if(m==='abort'){const e=new Error('The user aborted a request.');e.name='AbortError';return Promise.reject(e);}
    if(m==='notallowed'){const e=new Error('Not allowed.');e.name='NotAllowedError';return Promise.reject(e);}
    if(m==='boom'){const e=new Error('boom');e.name='TypeError';return Promise.reject(e);}
    return Promise.resolve();};
  window.__r342dl={n:0,name:''};
  document.addEventListener('click',(e)=>{const a=e.target&&e.target.closest?e.target.closest('a[download]'):null;if(a){window.__r342dl.n++;window.__r342dl.name=a.download||'?';}},true);
  if(!window.__origToBlob) window.__origToBlob=HTMLCanvasElement.prototype.toBlob;
  return 'share-stub+dl-recorder installed';
})()" 2>&1 | tee -a "$OUT"

echo "########## B) جوینرِ بلیتی + پاسخِ خودکار تا done" | tee -a "$OUT"
bun "$DIR/qa-duel-joiner-r287.mjs" "$CODE" > /tmp/r342-joiner.txt 2>&1 &
agent-browser eval "(()=>{window.__r94=setInterval(()=>{const root=document.querySelector('[class*=duel-play]')||document;const btns=[...root.querySelectorAll('button')].filter(b=>b.className.includes('border-2')&&b.offsetParent!==null&&b.textContent.trim().length>0&&b.textContent.trim().length<120);if(btns.length>=4)btns[0].click();},1150);return 'loop';})()" >/dev/null 2>&1
DONE=0
for i in $(seq 1 40); do
  sleep 3
  agent-browser snapshot >/tmp/r342-done.txt 2>/dev/null || true
  if grep -q 'کارنامهٔ نبرد' /tmp/r342-done.txt; then DONE=1; break; fi
done
agent-browser eval "(()=>{clearInterval(window.__r94);return 'cleared';})()" >/dev/null 2>&1
[ "$DONE" = "1" ] || { echo "DUEL-DONE-MISSING" | tee -a "$OUT"; tail -3 /tmp/r342-joiner.txt | tee -a "$OUT"; agent-browser close >/dev/null 2>&1; exit 1; }
echo "DUEL-DONE-REACHED ✓" | tee -a "$OUT"
sleep 1.5
agent-browser eval "(()=>{const b=[...document.querySelectorAll('button')].map(x=>(x.textContent||'').replace(/\\u200c/g,'').trim()).filter(t=>t.includes('همرسانی')||t.includes('عکس')||t.includes('نبرد دوباره'));return JSON.stringify({btns:b.slice(0,6)});})()" 2>&1 | tee -a "$OUT"

echo "########## C) ماتریسِ اشتراک — سرنوشتِ سرنوشت" | tee -a "$OUT"
echo "-- [C1] resolve ⇒ shared ⇒ توستِ «📨 نبرد همرسانی شد»" | tee -a "$OUT"
norm_click "هم‌رسانی"; sleep 1.6
agent-browser eval "(()=>JSON.stringify({calls:(window.__r342share.calls||[]).length,last:window.__r342share.lastCall||null}))()" 2>&1 | tee -a "$OUT"
tprobe "share-shared-light"; shot r342-duel-share-shared.png
agent-browser eval "(()=>{const v=document.querySelector('[data-radix-toast-viewport]');if(v)v.innerHTML='';return 'viewport-cleared';})()" >/dev/null 2>&1

echo "-- [C2] AbortError ⇒ cancelled ⇒ سکوتِ مشروع (توستِ صفر)" | tee -a "$OUT"
agent-browser eval "(()=>{window.__r342mode='abort';return 'mode-abort';})()" >/dev/null 2>&1
norm_click "هم‌رسانی"; sleep 1.6
tprobe "share-abort-silence"
agent-browser eval "(()=>{const v=document.querySelector('[data-radix-toast-viewport]');if(v)v.innerHTML='';return 'c';})()" >/dev/null 2>&1

echo "-- [C3] NotAllowedError ⇒ cancelled ⇒ سکوتِ مشروع" | tee -a "$OUT"
agent-browser eval "(()=>{window.__r342mode='notallowed';return 'mode-na';})()" >/dev/null 2>&1
norm_click "هم‌رسانی"; sleep 1.6
tprobe "share-notallowed-silence"
agent-browser eval "(()=>{const v=document.querySelector('[data-radix-toast-viewport]');if(v)v.innerHTML='';return 'c';})()" >/dev/null 2>&1

echo "-- [C4] TypeErrorِ غیرانصرافی ⇒ failed ⇒ توستِ صادقانه" | tee -a "$OUT"
agent-browser eval "(()=>{window.__r342mode='boom';return 'mode-boom';})()" >/dev/null 2>&1
norm_click "هم‌رسانی"; sleep 1.6
tprobe "share-failed-light"; shot r342-duel-share-failed.png

echo "########## D) شکستِ canvasِ کارتِ نبرد — روشن" | tee -a "$OUT"
agent-browser eval "(()=>{const v=document.querySelector('[data-radix-toast-viewport]');if(v)v.innerHTML='';HTMLCanvasElement.prototype.toBlob=function(cb){setTimeout(()=>cb(null),0);};return 'toblob-null';})()" >/dev/null 2>&1
norm_click "عکسِ این نبرد"; sleep 1.8
agent-browser eval "(()=>JSON.stringify({dl:window.__r342dl}))()" 2>&1 | tee -a "$OUT"
tprobe "duel-fail-toast-light"; dbg "duel-done-light-fail"; shot r342-duel-fail-light.png

echo "########## E) تاریکِ درجا — شکستِ canvas و بازگردانیِ negctl" | tee -a "$OUT"
to_dark_inplace
norm_click "عکسِ این نبرد"; sleep 1.8
tprobe "duel-fail-toast-dark"; shot r342-duel-fail-dark.png
back_light_inplace
agent-browser eval "(()=>{HTMLCanvasElement.prototype.toBlob=window.__origToBlob;return 'restored';})()" >/dev/null 2>&1
norm_click "عکسِ این نبرد"; sleep 2.2
agent-browser eval "(()=>JSON.stringify({dl:window.__r342dl}))()" 2>&1 | tee -a "$OUT"
tprobe "duel-success-negctl-light"; shot r342-duel-ok-light.png

echo "########## F) حذفِ استاب ⇒ دروازهٔ صادقِ r102 (دکمه ناپدید میشود)" | tee -a "$OUT"
agent-browser eval "(()=>{delete navigator.canShare; delete navigator.share; window.dispatchEvent(new Event('resize'));return 'stub-removed';})()" >/dev/null 2>&1
sleep 1
agent-browser eval "(()=>{const norm=(s)=>(s||'').replace(/\\u200c/g,'');const b=[...document.querySelectorAll('button')].find(x=>norm(x.textContent).includes('همرسانی')&&x.getBoundingClientRect().width>0);return JSON.stringify({shareBtnStillVisible:!!b});})()" 2>&1 | tee -a "$OUT"

echo "########## G) basis-zero رویِ نمایِ واقعیِ done + تاریک" | tee -a "$OUT"
basis "duel-done-light-real"
to_dark_inplace
basis "duel-done-dark-real"
dbg "duel-done-dark"; shot r342-duel-done-dark.png
agent-browser eval "(()=>{const v=document.querySelector('[data-radix-toast-viewport]');if(v)v.innerHTML='';document.documentElement.classList.remove('dark');return 'l';})()" >/dev/null 2>&1

echo "########## H) ۳۹۰ — نمایِ done در موبایل (DOC-OVERFLOW)" | tee -a "$OUT"
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 1.5
agent-browser eval "(()=>{const ofl=document.documentElement.scrollWidth>window.innerWidth;return JSON.stringify({'DOC-OVERFLOW':ofl,w:window.innerWidth,sw:document.documentElement.scrollWidth});})()" 2>&1 | tee -a "$OUT"
shot r342-duel-done-390.png
agent-browser close >/dev/null 2>&1
echo "QA-R342-DUEL-DONE-SHARE-DONE" | tee -a "$OUT"
