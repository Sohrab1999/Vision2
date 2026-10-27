#!/usr/bin/env bash
# ------------------------------------------------------------------
# r454 — «شکارِ ریشهٔ دومِ توستِ آلوده» — بازتولیدِ زنده + بایسِکتِ
# زنجیرهٔ dispatch→render در مرورگرِ واقعی (۳۹۰×۸۴۴).
#   بازوی P (آلوده): ۷ واژه با تایپِ واقعی → auto-advanceِ تایمریِ ۱۵۰۰ms
#     (۷ تایمر) → واژهٔ ۸ با ردِ دستی → finish → توست.
#   بازوی F (تازه): reload → صفرِ تایمرِ پیشین → ۸ ردِ دستی → finish → توست.
#   کاوشگرها در لحظهٔ finish:
#     FIBER  — خواندنِ زندهٔ آرایهٔ toasts از hooks کامپوننت Toaster
#              (uSES snapshot) با پیمایشِ fiber از olِ viewport
#     LOG    — MutationObserver روی olِ viewport (+LI/-LI با مُهرِ زمان)
#     ANN    — ناحیهٔ زندهٔ polite (راویِ announcer — اثباتِ رندرِ Toaster)
#     DOM    — حضورِ متنِ توست در کلِ body
#     TOAST  — نظرسنجیِ capture_toastِ کلاسیک (ol li با ارتفاع>۰)
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
OUT=/tmp/r454-toast-root2.txt
QA_SEED_FILE=/tmp/r454-witness-seed-eval.js
: > "$OUT"

source /home/z/my-project/scripts/qa-lib.sh

probe(){ agent-browser eval "$1" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
getvar(){ agent-browser eval "$1" 2>/dev/null | tail -1 | sed -e 's/^"//' -e 's/"$//'; }

click_in_dialog(){ agent-browser eval "(()=>{const dlg=document.querySelector('[role=\"dialog\"]');if(!dlg)return 'NO-DIALOG';let b=[...dlg.querySelectorAll('button')].find((x)=>(x.innerText||'').replace(/\s+/g,' ').trim()==='$1'&&x.getBoundingClientRect().width>0);if(!b)return 'NO-BTN-IN-DIALOG:$1';b.click();return 'CLICKED:$1';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

click_scope_chip(){ agent-browser eval "(()=>{const dlg=document.querySelector('[role=\"dialog\"]');if(!dlg)return 'NO-DIALOG';const grp=dlg.querySelector('[aria-label=\"دامنهٔ دیکته\"]');if(!grp)return 'NO-GROUP';const b=[...grp.querySelectorAll('button')].find((x)=>(x.innerText||'').includes('$1'));if(!b)return 'NO-CHIP:$1';b.click();return 'CLICKED-CHIP:$1';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

dismiss_install(){ probe "(()=>{const b=document.querySelector('[aria-label=\"بستن پیشنهاد نصب\"]');if(b&&b.getBoundingClientRect().width>0){b.click();return 'INSTALL-CARD-DISMISSED';}return 'NO-INSTALL-CARD';})()"; sleep 1; }

# ---- درسِ r454: مرگهایِ بیصدا در دلِ ران — پیشِ بوت، سرور را زنده کن
ensure_server(){ if curl -s -o /dev/null --max-time 3 http://127.0.0.1:3000/ 2>/dev/null; then echo "SERVER-ALIVE"; return 0; fi
  echo "SERVER-DEAD-REVIVING" | tee -a "$OUT"
  if ! pgrep -f "standalone/server.js" >/dev/null 2>&1; then
    setsid env n="file:/home/z/my-project/db/custom.db" TEACHER_ACCESS_CODE=moallem-1404 bun /home/z/my-project/.next/standalone/server.js >> /tmp/r453-watchdog.log 2>&1 &
  fi
  for i in $(seq 1 15); do sleep 2; if curl -s -o /dev/null --max-time 3 http://127.0.0.1:3000/ 2>/dev/null; then echo "SERVER-REVIVED" | tee -a "$OUT"; return 0; fi; done
  echo "FAIL-SERVER-REVIVE" | tee -a "$OUT"; return 1; }

boot(){ ensure_server || return 1
agent-browser close >/dev/null 2>&1 || true
pkill -f "chrome.*--remote-debugging-port" 2>/dev/null; sleep 1
agent-browser open "$BASE" >/dev/null 2>&1
agent-browser set viewport 390 844 >/dev/null 2>&1
agent-browser wait 'body' >/dev/null 2>&1 || true
sleep 2
node /home/z/my-project/scripts/r338-persona.js | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>process.stdout.write(JSON.parse(s).browserEval))" > "$QA_SEED_FILE" || { echo "PERSONA-FAIL" | tee -a "$OUT"; agent-browser close >/dev/null 2>&1; exit 1; }
qa_wait_home || { agent-browser close >/dev/null 2>&1; exit 1; }
agent-browser eval "$(cat "$QA_SEED_FILE")" >/dev/null 2>&1
sleep 5
qa_seed_guard_mobile || { agent-browser close >/dev/null 2>&1; exit 1; }
dismiss_install; }

hint_step(){ getvar "(()=>{const dlg=document.querySelector('[role=\"dialog\"]');if(!dlg)return 'NO-DIALOG';const inp=dlg.querySelector('input[placeholder=\"type the word...\"]');if(!inp)return 'NO-INPUT';const h=[...dlg.querySelectorAll('button')].find((b)=>(b.textContent||'').trim()==='راهنما');if(!h)return 'NO-HINT';h.click();return 'LEN:'+inp.value.length+':'+inp.value;})()"; }

react_type(){ getvar "(()=>{const dlg=document.querySelector('[role=\"dialog\"]');if(!dlg)return 'NO-DIALOG';const inp=dlg.querySelector('input[placeholder=\"type the word...\"]');if(!inp)return 'NO-INPUT';const val=inp.value;if(!val)return 'EMPTY-NO-HINT';const setter=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;setter.call(inp,'');inp.dispatchEvent(new Event('input',{bubbles:true}));let i=0;return new Promise((res)=>{const tick=()=>{if(i>=val.length)return res('TYPED:'+i+'|W:'+val);setter.call(inp,val.slice(0,++i));inp.dispatchEvent(new Event('input',{bubbles:true}));setTimeout(tick,30);};tick();});})()"; }

drive_check(){ getvar "(()=>new Promise((res)=>{const dlg=document.querySelector('[role=\"dialog\"]');if(!dlg)return res('NO-DIALOG');const b=[...dlg.querySelectorAll('button')].find((x)=>(x.innerText||'').trim()==='بررسی');if(!b)return res('NO-CHECK');if(b.disabled)return res('CHECK-DISABLED');b.click();setTimeout(()=>{const ok=[...dlg.querySelectorAll('div')].find((d)=>(d.textContent||'').includes('آفرین! املا درست است'));if(!ok)return res('NO-CORRECT-ROW');res('OK-R');},650);}))()"; }

drive_skip(){ getvar "(()=>new Promise((res)=>{const dlg=document.querySelector('[role=\"dialog\"]');if(!dlg)return res('NO-DIALOG');const b=[...dlg.querySelectorAll('button')].find((x)=>(x.innerText||'').trim()==='رد کردن');if(!b)return res('NO-SKIP');b.click();setTimeout(()=>{const nxt=[...dlg.querySelectorAll('button')].find((x)=>(x.innerText||'').includes('واژهٔ بعدی'));if(!nxt)return res('NO-NEXT-BTN');nxt.click();setTimeout(()=>{const done=[...dlg.querySelectorAll('h3')].find((s)=>(s.textContent||'').trim()==='دیکته تمام شد!');const chip=[...dlg.querySelectorAll('span')].find((s)=>/^([۰-۹]+) از ۸$/.test((s.textContent||'').trim()));res('SKIP-OK|DONE:'+(done?1:0)+'|CHIP:'+(chip?(chip.textContent||'').trim():'none'));},700);},600);}))()"; }

wait_audio_row(){ getvar "(()=>{return new Promise((res)=>{let n=0;const tick=()=>{const row=[...document.querySelectorAll('[role=\"dialog\"] div')].find((d)=>(d.textContent||'').includes('روخوانی در دسترس نیست'));if(row)return res('AUDIO-ROW-READY');if(++n>28)return res('AUDIO-ROW-TIMEOUT');setTimeout(tick,280);};tick();});})()" >/dev/null 2>&1; }

# ---- کاوشگرِ fiber: آرایهٔ toasts از hooks کامپوننت Toaster
fiber_probe(){ getvar "(()=>{const ol=document.querySelector('ol.fixed');if(!ol)return 'NO-OL';const fk=Object.keys(ol).find((k)=>k.startsWith('__reactFiber$'));if(!fk)return 'NO-FIBER-KEY';let f=ol[fk],hops=0,toaster=null;while(f&&hops<120){const t=f.type;if(t&&typeof t==='function'&&t.name==='Toaster'){toaster=f;break;}f=f.return;hops++;}if(!toaster)return 'NO-TOASTER-FIBER|hops='+hops;let h=toaster.memoizedState,out=[],i=0;while(h&&i<24){const v=h.memoizedState;if(v&&typeof v==='object'){if(Array.isArray(v.toasts))out.push('H'+i+':STATE['+v.toasts.length+']='+v.toasts.map(t=>t.id+'@'+(t.open?'open':'closed')).join(','));else if(v.value&&typeof v.value==='object'&&Array.isArray(v.value.toasts))out.push('H'+i+':USES['+v.value.toasts.length+']='+v.value.toasts.map(t=>t.id+'@'+(t.open?'open':'closed')).join(','));}h=h.next;i++;}return 'FIBER(hops='+hops+')['+(out.join(' || ')||'no-toasts-hooks')+']';})()"; }

# ---- سلاح‌سازی: MutationObserver روی ol + ناحیهٔ announcer
arm_observer(){ probe "(()=>{const ol=document.querySelector('ol.fixed');if(!ol)return 'NO-OL';window.__r454log=[];const st=()=>Date.now()%1000000;window.__r454mo=new MutationObserver((ms)=>{for(const m of ms){for(const n of m.addedNodes)if(n.nodeType===1&&n.tagName==='LI')window.__r454log.push('+LI@'+st()+'|'+(n.textContent||'').replace(/\s+/g,' ').slice(0,70));for(const n of m.removedNodes)if(n.nodeType===1&&n.tagName==='LI')window.__r454log.push('-LI@'+st());}});window.__r454mo.observe(ol,{childList:true});const pol=document.querySelector('[role=\"status\"][aria-live=\"polite\"]');window.__r454ann=pol?(pol.textContent||''):'NO-REGION';if(pol){window.__r454mo2=new MutationObserver(()=>{window.__r454ann=(pol.textContent||'');});window.__r454mo2.observe(pol,{childList:true,characterData:true,subtree:true});}return 'ARMED|OL:'+(ol?1:0)+'|REGION:'+(pol?1:0);})()"; }

read_log(){ probe "(()=>{const L=window.__r454log||['NO-LOG'];return 'LOG['+L.length+']:'+L.slice(0,12).join(' ; ');})()"; }
read_ann(){ probe "(()=>{return 'ANN:'+(window.__r454ann!==undefined?String(window.__r454ann).slice(0,140):'UNDEF');})()"; }
dom_probe(){ probe "(()=>{const has=document.body.innerHTML.includes('دیکتهٔ پایهٔ هفتم:');const li=[...document.querySelectorAll('ol.fixed li')].map((el)=>((el.textContent||'').replace(/\s+/g,' ').slice(0,60)+'|h='+el.getBoundingClientRect().height+'|st='+el.getAttribute('data-state')));return 'DOM-TEXT:'+has+'|OL-LI['+li.length+']:'+li.join(' ;; ');})()"; }

capture_toast(){ getvar "(()=>{return new Promise((res)=>{let n=0;const tick=()=>{const li=[...document.querySelectorAll('ol.fixed li')].find((el)=>el.getBoundingClientRect().height>0&&(el.textContent||'').includes('دیکتهٔ پایهٔ هفتم'));if(li)return res('TOAST-OK|'+(li.textContent||'').replace(/\s+/g,' ').trim().slice(0,120));if(++n>40)return res('NO-TOAST');setTimeout(tick,250);};tick();});})()" | tee -a "$OUT"; echo | tee -a "$OUT"; }

go_dict_g7_count8(){ agent-browser eval "(()=>{const b=[...document.querySelectorAll('button')].find((x)=>(x.innerText||'').includes('آزمون جامع')&&x.getBoundingClientRect().width>0);if(!b)return 'NO-EXAM';b.click();return 'EXAM-CLICKED';})()" >/dev/null 2>&1; sleep 2.5
agent-browser eval "(()=>{const c=document.querySelector('.exam-dict-cta');if(!c||c.getBoundingClientRect().width===0)return 'NO-CTA';c.click();return 'CTA-CLICKED';})()" >/dev/null 2>&1; sleep 2
click_scope_chip "پایهٔ هفتم" >/dev/null 2>&1; sleep 1.5
click_in_dialog "۸" >/dev/null 2>&1; sleep 0.8
click_in_dialog "شروع دیکته" >/dev/null 2>&1; sleep 2.5
wait_audio_row
agent-browser eval "(()=>{window.__r454g7Words=[];return 'G7-CAP-ARMED';})()" >/dev/null 2>&1; }

drive_word(){ local i="$1"
  PREV=-1; CUR=0; VAL=""; for t in $(seq 1 30); do
    R=$(hint_step)
    CUR=$(echo "$R" | rg -o '^LEN:[0-9]+' | rg -o '[0-9]+' | tail -1)
    VAL=$(echo "$R" | sed -n 's/^LEN:[0-9]*://p')
    if [ "${CUR:-0}" = "$PREV" ]; then break; fi
    PREV="${CUR:-0}"; sleep 0.18
  done
  echo "WORD-$i hint-len=$CUR word=$VAL" | tee -a "$OUT"
  if [ "${CUR:-0}" = "0" ]; then echo "FAIL-HINT-WALK-WORD-$i: $R" | tee -a "$OUT"; fi
  VAL_ESC=$(printf '%s' "$VAL" | sed "s/'/\\\\'/g")
  agent-browser eval "(()=>{(window.__r454g7Words=window.__r454g7Words||[]).push('$VAL_ESC');return 'PUSHED';})()" >/dev/null 2>&1
  T=$(react_type)
  echo "WORD-$i typed: $T" | tee -a "$OUT"
  if [[ "$T" != TYPED:* ]]; then echo "FAIL-TYPE-WORD-$i" | tee -a "$OUT"; fi
  C=$(drive_check)
  echo "WORD-$i check: $C" | tee -a "$OUT"
  if [[ "$C" != OK-R* ]]; then echo "FAIL-CHECK-WORD-$i: $C" | tee -a "$OUT"; fi
}

echo "########## بازوی P — آلوده (۷ تایمرِ پیشروی + ردِ دستیِ ۸)" | tee -a "$OUT"
echo "########## PRE) boot + دفترِ آغازین" | tee -a "$OUT"
boot || { echo "FAIL-BOOT" | tee -a "$OUT"; agent-browser close >/dev/null 2>&1; exit 1; }
go_dict_g7_count8
arm_observer
fiber_probe

for i in 1 2 3 4 5 6 7; do
  drive_word "$i"
  sleep 2.1
  C=$(getvar "(()=>{const chip=[...document.querySelectorAll('[role=\"dialog\"] span')].find((s)=>/^([۰-۹]+) از ۸$/.test((s.textContent||'').trim()));const done=[...document.querySelectorAll('[role=\"dialog\"] h3')].find((s)=>(s.textContent||'').trim()==='دیکته تمام شد!');return chip?('CHIP:'+(chip.textContent||'').trim()):(done?'DONE':'NONE');})()")
  echo "WORD-$i advance: $C (expect ~CHIP:$((i+1)) از ۸)" | tee -a "$OUT"
  if [[ "$C" == DONE* ]]; then echo "UNEXPECTED-DONE-AT-$i" | tee -a "$OUT"; break; fi
done

read_log
echo "########## واژهٔ ۸ — ردِ دستی → finish → توست" | tee -a "$OUT"
S=$(drive_skip)
echo "SKIP-8: $S" | tee -a "$OUT"
T=$(capture_toast)
echo "TOAST-CAPTURE: $T" | tee -a "$OUT"
fiber_probe
read_log
read_ann
dom_probe
qa_shot r454-poisoned-done.png

echo "########## بازوی F — تازه (reload؛ صفرِ تایمر؛ ۸ ردِ دستی)" | tee -a "$OUT"
agent-browser open "$BASE" >/dev/null 2>&1; sleep 2
qa_wait_home >/dev/null 2>&1 || { echo "FAIL-RELOAD-HOME" | tee -a "$OUT"; }
qa_seed_guard_mobile || { echo "FAIL-SEED-GUARD-F" | tee -a "$OUT"; }
dismiss_install
go_dict_g7_count8
arm_observer
fiber_probe
for i in 1 2 3 4 5 6 7 8; do
  S=$(drive_skip)
  echo "F-SKIP-$i: $S" | tee -a "$OUT"
  if [[ "$S" != SKIP-OK* ]]; then echo "FAIL-F-SKIP-$i" | tee -a "$OUT"; break; fi
  sleep 0.6
done
T=$(capture_toast)
echo "F-TOAST-CAPTURE: $T" | tee -a "$OUT"
fiber_probe
read_log
read_ann
dom_probe
qa_shot r454-fresh-done.png

echo "########## حکمِ جمعی" | tee -a "$OUT"
PT=$(rg -q -F "TOAST-OK" <(sed -n '/بازوی P/,/بازوی F/p' "$OUT") && echo RENDERED || echo MISSING)
FT=$(rg -q -F "TOAST-OK" <(sed -n '/بازوی F/,$p' "$OUT") && echo RENDERED || echo MISSING)
echo "ARM-P-TOAST: $PT | ARM-F-TOAST: $FT" | tee -a "$OUT"
case "$PT" in
  RENDERED) echo "ROOT2-VERDICT: poisoned-context toast RENDERS with TOAST_LIMIT=3 — the 37ms وعده race still fires (LOG: +LI result then +LI وعده, NO -LI between) but STACKS instead of evicting; OL-LI[2] both open. Root #2 = LIMIT=1 eviction by the r279 celebration toast (killed pre-fix, 6/6)" | tee -a "$OUT" ;;
  MISSING)
    if rg -q "FIBER.*@open" <(sed -n '/بازوی P/,/بازوی F/p' "$OUT"); then
      echo "ROOT2-VERDICT: toasts[] holds an OPEN toast yet no visible li — render/presence-side break" | tee -a "$OUT"
    elif rg -q "ANN:دیکتهٔ" <(sed -n '/بازوی P/,/بازوی F/p' "$OUT"); then
      echo "ROOT2-VERDICT: announcer fired (Toaster rendered) but toasts[]/li verdict split — inspect LOG" | tee -a "$OUT"
    else
      echo "ROOT2-VERDICT: toasts[] has NO open toast — dispatch-to-store-side break (uSES not reached)" | tee -a "$OUT"
    fi ;;
esac
agent-browser close >/dev/null 2>&1 || true
echo "########## HUNT-DONE" | tee -a "$OUT"
