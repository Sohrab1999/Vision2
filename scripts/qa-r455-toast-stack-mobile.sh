#!/usr/bin/env bash
# ------------------------------------------------------------------
# r455 — «شاهدِ موبایلِ پشتهٔ توستها» — شصتمین مصرفکنندهٔ qa-lib.
# LIMIT=3 (r454) تازه است؛ خانوادهٔ توست هرگز در ۳۹۰×۸۴۴ با بیش از یک
# عضوِ زنده دیده نشده. قراردادِ بصریِ نو که این راند داوری میشود:
#   ① پشتهٔ سهتاییِ راستین (سه جریانِ واقعی: Anki دیکشنری + پشتیبانِ
#      پروفایل + راستکلیکِ رزومهٔ هدر) — فاصله/همپوشانی/viewport
#   ② سرریزِ زنده: توستِ چهارمِ راستین (fileFailToast با COUِ تزریقی —
#      درسِ r344) کهنترین را بیرون میپراند — سقفِ ۳ در DOM واقعی
#   ③ زوجِ رقابتیِ r454 در مرورگر: نتیجهٔ دیکته + وعدهٔ برقرار —
#      اکنون هر دو زنده (روزِ صریح؛ سپس رانِ دوباره-بذرِ شب)
#   ④ سریالهایِ خانواده (variant پیشفرض: bg-background/text-foreground)
#      در دو حالت + خوانایی (fontSize) + قراردادِ viewport
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
OUT=/tmp/r455-toast-stack.txt
QA_SEED_FILE=/tmp/r455-witness-seed-eval.js
: > "$OUT"

source /home/z/my-project/scripts/qa-lib.sh

probe(){ agent-browser eval "$1" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
getvar(){ agent-browser eval "$1" 2>/dev/null | tail -1 | sed -e 's/^"//' -e 's/"$//'; }
shot(){ qa_shot "$1"; echo "SHOT:$1" | tee -a "$OUT"; }

# ---- درسِ r454: مرگهایِ بیصدا — پیشِ بوت، سرور را زنده کن
ensure_server(){ if curl -s -o /dev/null --max-time 3 http://127.0.0.1:3000/ 2>/dev/null; then echo "SERVER-ALIVE"; return 0; fi
  echo "SERVER-DEAD-REVIVING" | tee -a "$OUT"
  if ! pgrep -f "standalone/server.js" >/dev/null 2>&1; then
    setsid env n="file:/home/z/my-project/db/custom.db" TEACHER_ACCESS_CODE=moallem-1404 bun /home/z/my-project/.next/standalone/server.js >> /tmp/r453-watchdog.log 2>&1 &
  fi
  for i in $(seq 1 15); do sleep 2; if curl -s -o /dev/null --max-time 3 http://127.0.0.1:3000/ 2>/dev/null; then echo "SERVER-REVIVED" | tee -a "$OUT"; return 0; fi; done
  echo "FAIL-SERVER-REVIVE" | tee -a "$OUT"; return 1; }

seed_persona(){ node /home/z/my-project/scripts/r338-persona.js | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>process.stdout.write(JSON.parse(s).browserEval))" > "$QA_SEED_FILE" || { echo "PERSONA-FAIL" | tee -a "$OUT"; agent-browser close >/dev/null 2>&1; exit 1; }
  agent-browser eval "$(cat "$QA_SEED_FILE")" >/dev/null 2>&1
  sleep 5
  qa_wait_home || { agent-browser close >/dev/null 2>&1; exit 1; }
  qa_seed_guard_mobile || { agent-browser close >/dev/null 2>&1; exit 1; }
  dismiss_install; }

boot(){ ensure_server || return 1
agent-browser close >/dev/null 2>&1 || true
pkill -f "chrome.*--remote-debugging-port" 2>/dev/null; sleep 1
agent-browser open "$BASE" >/dev/null 2>&1
agent-browser set viewport 390 844 >/dev/null 2>&1
agent-browser wait 'body' >/dev/null 2>&1 || true
sleep 2
seed_persona; }

dismiss_install(){ probe "(()=>{const b=document.querySelector('[aria-label=\"بستن پیشنهاد نصب\"]');if(b&&b.getBoundingClientRect().width>0){b.click();return 'INSTALL-CARD-DISMISSED';}return 'NO-INSTALL-CARD';})()"; sleep 1; }

# ---- اندازهگیرِ پشته — قلبِ شاهد: هندسه + سریالها + viewport
STACK_PROBE='(()=>{const ol=document.querySelector("ol.fixed");if(!ol)return JSON.stringify({err:"NO-OL"});const vos=getComputedStyle(ol);const or=ol.getBoundingClientRect();const lis=[...ol.querySelectorAll("li")].filter((el)=>el.getBoundingClientRect().height>0&&el.getAttribute("data-state")==="open");const items=lis.map((el)=>{const r=el.getBoundingClientRect();const cs=getComputedStyle(el);return {t:(el.textContent||"").replace(/\s+/g," ").trim().slice(0,22),top:+r.top.toFixed(1),bot:+r.bottom.toFixed(1),h:+r.height.toFixed(1),w:+r.width.toFixed(1),st:el.getAttribute("data-state"),bg:cs.backgroundColor,ink:cs.color,fs:cs.fontSize,rad:cs.borderTopLeftRadius};});items.sort((a,b)=>a.top-b.top);const gaps=[];for(let i=1;i<items.length;i++)gaps.push(+(items[i].top-items[i-1].bot).toFixed(2));return JSON.stringify({n:items.length,gaps,ol:{pos:vos.position,top:+or.top.toFixed(1),pad:vos.paddingTop,dir:vos.flexDirection,maxh:vos.maxHeight,w:+or.width.toFixed(1),olh:+or.height.toFixed(1),rowGap:vos.rowGap},items});})()'
# درسِ همین راند: خروجیِ eval quote-escape دارد — پیشِ پارس باید unescape شود
stack(){ getvar "$STACK_PROBE" | sed -e 's/\\"/"/g'; }

# ---- نظرسنجی تا N توستِ زنده (بیشینهٔ ۸ث)
wait_n(){ getvar "(()=>new Promise((res)=>{let k=0;const tick=()=>{const lis=[...document.querySelectorAll('ol.fixed li')].filter((el)=>el.getBoundingClientRect().height>0&&el.getAttribute('data-state')==='open');if(lis.length>=$1)return res('N-OK:'+lis.length);if(++k>32)return res('N-TIMEOUT:'+lis.length);setTimeout(tick,250);};tick();}))()"; }

# ---- آتشِ جریانهایِ راستین
fire_anki(){ getvar "(()=>{const b=document.querySelector(\"[aria-label^='صادرات']\");if(!b||b.getBoundingClientRect().width===0)return 'NO-ANKI';b.click();return 'ANKI-FIRED';})()"; }
fire_resume_clear(){ getvar "(()=>{const b=document.querySelector('[data-testid=\"header-resume-button\"]');if(!b||b.getBoundingClientRect().width===0)return 'NO-RESUME-BTN';b.dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,cancelable:true,button:2}));return 'RESUME-CTX-FIRED';})()"; }
open_profile(){ getvar "(()=>{window.dispatchEvent(new Event('open-profile'));return 'PROFILE-EVT';})()"; }
fire_backup(){ getvar "(()=>{const b=[...document.querySelectorAll('button')].find((x)=>(x.innerText||'').includes('دانلود پشتیبان')&&x.getBoundingClientRect().width>0);if(!b)return 'NO-BACKUP-BTN';b.click();return 'BACKUP-FIRED';})()"; }
close_profile(){ getvar "(()=>{document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));return 'ESC-DISPATCHED';})()"; }
cou_fail_on(){ getvar "(()=>{if(!window.__origCOU)window.__origCOU=URL.createObjectURL.bind(URL);URL.createObjectURL=function(){throw new TypeError('r455-cou-injected');};return 'COU-FAIL-ON';})()"; }
cou_restore(){ getvar "(()=>{if(window.__origCOU)URL.createObjectURL=window.__origCOU;return 'COU-RESTORED';})()"; }

# ---- دیکته: ورود + ۸ ردِ دستی (الگویِ r454)
go_dict_g7(){ agent-browser eval "(()=>{const b=[...document.querySelectorAll('button')].find((x)=>(x.innerText||'').includes('آزمون جامع')&&x.getBoundingClientRect().width>0);if(!b)return 'NO-EXAM';b.click();return 'EXAM-CLICKED';})()" >/dev/null 2>&1; sleep 2.5
agent-browser eval "(()=>{const c=document.querySelector('.exam-dict-cta');if(!c||c.getBoundingClientRect().width===0)return 'NO-CTA';c.click();return 'CTA-CLICKED';})()" >/dev/null 2>&1; sleep 2
getvar "(()=>{const dlg=document.querySelector('[role=\"dialog\"]');if(!dlg)return 'NO-DIALOG';const grp=dlg.querySelector('[aria-label=\"دامنهٔ دیکته\"]');if(!grp)return 'NO-GROUP';const b=[...grp.querySelectorAll('button')].find((x)=>(x.innerText||'').includes('پایهٔ هفتم'));if(!b)return 'NO-CHIP';b.click();return 'CHIP-G7';})()" >/dev/null 2>&1; sleep 1.5
getvar "(()=>{const dlg=document.querySelector('[role=\"dialog\"]');if(!dlg)return 'NO-DIALOG';let b=[...dlg.querySelectorAll('button')].find((x)=>(x.innerText||'').trim()==='۸'&&x.getBoundingClientRect().width>0);if(!b)return 'NO-COUNT';b.click();return 'COUNT-8';})()" >/dev/null 2>&1; sleep 0.8
getvar "(()=>{const dlg=document.querySelector('[role=\"dialog\"]');if(!dlg)return 'NO-DIALOG';let b=[...dlg.querySelectorAll('button')].find((x)=>(x.innerText||'').includes('شروع دیکته')&&x.getBoundingClientRect().width>0);if(!b)return 'NO-START';b.click();return 'DICT-STARTED';})()" >/dev/null 2>&1; sleep 2.5
getvar "(()=>new Promise((res)=>{let n=0;const tick=()=>{const row=[...document.querySelectorAll('[role=\"dialog\"] div')].find((d)=>(d.textContent||'').includes('روخوانی در دسترس نیست'));if(row)return res('AUDIO-ROW-READY');if(++n>20)return res('AUDIO-ROW-TIMEOUT');setTimeout(tick,280);};tick();}))()" >/dev/null 2>&1; }

drive_skip(){ getvar "(()=>new Promise((res)=>{const dlg=document.querySelector('[role=\"dialog\"]');if(!dlg)return res('NO-DIALOG');const b=[...dlg.querySelectorAll('button')].find((x)=>(x.innerText||'').trim()==='رد کردن');if(!b)return res('NO-SKIP');b.click();setTimeout(()=>{const nxt=[...dlg.querySelectorAll('button')].find((x)=>(x.innerText||'').includes('واژهٔ بعدی'));if(!nxt)return res('NO-NEXT-BTN');nxt.click();setTimeout(()=>res('SKIP-OK'),650);},550);}))()"; }

wait_pair(){ getvar "(()=>new Promise((res)=>{let k=0;const tick=()=>{const lis=[...document.querySelectorAll('ol.fixed li')].filter((el)=>el.getBoundingClientRect().height>0&&el.getAttribute('data-state')==='open');const res_t=lis.find((el)=>(el.textContent||'').includes('با تمرین بهتر'));const pr=lis.find((el)=>(el.textContent||'').includes('وعده برقرار'));if(res_t&&pr)return res('PAIR-OK:2');if(++k>32)return res('PAIR-TIMEOUT:RESULT='+(res_t?1:0)+'|PROMISE='+(pr?1:0)+'|N='+lis.length);setTimeout(tick,250);};tick();}))()"; }

echo "########## PRE) boot + seed" | tee -a "$OUT"
boot || { echo "FAIL-BOOT" | tee -a "$OUT"; agent-browser close >/dev/null 2>&1; exit 1; }
echo "BOOT-OK" | tee -a "$OUT"

echo "########## S-B) پشتهٔ راستین در ۳۹۰ — دیکشنری: Anki + پشتیبان + رزومه" | tee -a "$OUT"
getvar "(()=>{const b=[...document.querySelectorAll('button')].find((x)=>(x.innerText||'').includes('دیکشنری جستجو')&&x.getBoundingClientRect().width>0);if(!b)return 'NO-DICT-CARD';b.click();return 'DICT-CLICKED';})()" >/dev/null 2>&1
sleep 2.5
probe "(()=>{const b=document.querySelector(\"[aria-label^='صادرات']\");return (b&&b.getBoundingClientRect().width>0)?'ANKI-BTN-OPEN':'ANKI-BTN-MISS';})()"
probe "(()=>{const b=document.querySelector('[data-testid=\"header-resume-button\"]');return (b&&b.getBoundingClientRect().width>0)?'RESUME-IN-DICT-VISIBLE':'RESUME-IN-DICT-MISS';})()"

# درسِ بازتولید: پاپاورِ پروفایل باید mount شود (نظرسنجی)، بعد آتش
# درسِ مرگبار: «Escape در میانهٔ پشته ممنوع» — document-level Escape
# همهٔ توستهایِ زنده را dismiss میکند (بازتولیدِ زنده: BEFORE-ESC:1 → AFTER-ESC:0)
# پس: رزومه اول (بیپاپاور)، Anki دوم، پاپاور آخر و باز میماند — بدونِ Escape
F3=$(fire_resume_clear); echo "F3(Resume-ctx): $F3" | tee -a "$OUT"; echo "W-A: $(wait_n 1)" | tee -a "$OUT"
F1=$(fire_anki);   echo "F1(Anki): $F1"   | tee -a "$OUT"; echo "W-C: $(wait_n 2)" | tee -a "$OUT"
open_profile >/dev/null 2>&1
BP=''; for k in 1 2 3 4 5 6 7 8; do BP=$(getvar "(()=>{const b=[...document.querySelectorAll('button')].find((x)=>(x.innerText||'').includes('دانلود پشتیبان')&&x.getBoundingClientRect().width>0);return b?'OPEN':'CLOSED';})()"); [ "$BP" = "OPEN" ] && break; sleep 0.5; done
echo "POPOVER: $BP (after ${k}x0.5s)" | tee -a "$OUT"
F2=$(fire_backup); echo "F2(Backup): $F2" | tee -a "$OUT"
echo "W3: $(wait_n 3)" | tee -a "$OUT"
R_TRIPLE=$(stack); echo "TRIPLE>> $R_TRIPLE" | tee -a "$OUT"
echo "$R_TRIPLE" | rg -q '"n":3' && echo "TRIPLE-LIGHT-OK" | tee -a "$OUT" || echo "FAIL-TRIPLE-LIGHT" | tee -a "$OUT"
echo "$R_TRIPLE" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{try{const j=JSON.parse(s);const neg=j.gaps.some(g=>g<-0.5);console.log((neg?'FAIL-OVERLAP':'NO-OVERLAP-OK')+'|GAPS='+JSON.stringify(j.gaps)+'|ROWGAP='+j.ol.rowGap+'|OL='+JSON.stringify(j.ol));}catch(e){console.log('FAIL-PARSE:'+e.message);}})" <<< "$R_TRIPLE" | tail -1 | tee -a "$OUT"
shot r455-triple-light.png

echo "########## S-B2) سرریزِ زنده — توستِ چهارم (COU تزریقی → fileFailToast)" | tee -a "$OUT"
cou_fail_on
F4=$(fire_anki); echo "F4(Anki-fail): $F4" | tee -a "$OUT"
sleep 0.5
R_EV=$(stack); echo "EVICT>> $R_EV" | tee -a "$OUT"
echo "$R_EV" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{try{const j=JSON.parse(s);const titles=j.items.map(x=>x.t).join('§');const ok=j.n===3&&titles.includes('خطا در ساخت')&&!titles.includes('ادامهٔ مطالعه');console.log(ok?'EVICT-OK|N=3|OLDEST-RESUME-GONE|GAPS='+JSON.stringify(j.gaps):'FAIL-EVICT|N='+j.n+'|'+titles);}catch(e){console.log('FAIL-PARSE:'+e.message);}})" <<< "$R_EV" | tail -1 | tee -a "$OUT"
cou_restore
shot r455-evict-light.png

echo "########## S-B3) سریالهایِ شبِ پشته (بازماندگان)" | tee -a "$OUT"
qa_to_dark
R_DK=$(stack); echo "STACK-DARK>> $R_DK" | tee -a "$OUT"
echo "$R_DK" | rg -q '"n":[1-3]' && echo "STACK-DARK-OK" | tee -a "$OUT" || echo "FAIL-STACK-DARK" | tee -a "$OUT"
shot r455-stack-dark.png
qa_to_light

echo "########## S-A) زوجِ رقابتیِ r454 — روزِ صریح (بذرِ تازه → نشانِ وعده پاک)" | tee -a "$OUT"
seed_persona
WP=$(wait_n 0 >/dev/null 2>&1; echo "cleaned")
go_dict_g7
SKIPS=""; for i in 1 2 3 4 5 6 7 8; do S=$(drive_skip); SKIPS="$SKIPS$i:$S "; done
echo "SKIPS: $SKIPS" | tee -a "$OUT"
PA=$(wait_pair); echo "PAIR: $PA" | tee -a "$OUT"
R_PL=$(stack); echo "PAIR-LIGHT>> $R_PL" | tee -a "$OUT"
echo "$PA" | rg -q 'PAIR-OK:2' && echo "PAIR-LIGHT-OK" | tee -a "$OUT" || echo "FAIL-PAIR-LIGHT:$PA" | tee -a "$OUT"
shot r455-pair-light.png

echo "########## S-E) زوجِ رقابتی در شبِ صریح (بذرِ تازه + qa_to_dark)" | tee -a "$OUT"
seed_persona
qa_to_dark
go_dict_g7
SKIPS=""; for i in 1 2 3 4 5 6 7 8; do S=$(drive_skip); SKIPS="$SKIPS$i:$S "; done
echo "SKIPS-DARK: $SKIPS" | tee -a "$OUT"
PD=$(wait_pair); echo "PAIR-DARK: $PD" | tee -a "$OUT"
R_PD=$(stack); echo "PAIR-DARK>> $R_PD" | tee -a "$OUT"
echo "$PD" | rg -q 'PAIR-OK:2' && echo "PAIR-DARK-OK" | tee -a "$OUT" || echo "FAIL-PAIR-DARK:$PD" | tee -a "$OUT"
shot r455-pair-dark.png
qa_to_light

echo "########## JUDGE) جمعبندی" | tee -a "$OUT"
for T in TRIPLE-LIGHT-OK NO-OVERLAP-OK EVICT-OK STACK-DARK-OK PAIR-LIGHT-OK PAIR-DARK-OK; do
  if rg -q "$T" "$OUT"; then echo "TOKEN-GREEN: $T" | tee -a "$OUT"; else echo "TOKEN-MISSING: $T" | tee -a "$OUT"; fi
done
agent-browser close >/dev/null 2>&1 || true
echo "DONE-R455" | tee -a "$OUT"
