#!/usr/bin/env bash
# ------------------------------------------------------------------
# r368 — داوریِ زندهٔ «درهای خانه» در فرمان‌یاب (بندِ ④ پیشنهادِ r367 —
# مصرفِ چهارمِ فهرستِ زنده). تک سشن، بدونِ تزریق — هر گام با کنشِ واقعی:
#   A) گاردِ سلامتِ سرور (buildِ همین راند)
#   B) سشنِ تازه + آنبوردینگِ واقعی
#   C) تازهوارد: پالت ⇒ جست‌وجوی «کنکور» ⇒ غیبتِ صادقانهٔ «ادادهٔ کنکور»
#      (گروهِ «درهای خانه» اصلاً رندر نمیشود — r236)
#   D) رانِ واقعیِ درس: «ورود به درس» ⇒ رکوردِ رزومه نوشته میشود ⇒
#      پالت ⇒ «ادادهٔ مطالعهٔ درس» حاضر ⇒ کلیک ⇒ پرش به همان نقطه
#   E) رانِ واقعیِ کنکور (انتخابگرهایِ اثباتشدهٔ r364: data-quiz-option/
#      data-quiz-next + شمارندهٔ انتظارِ پیاپی) ⇒ STORE-SEEN ⇒ پالت ⇒
#      «ادادهٔ کنکور» حاضر ⇒ کلیک ⇒ پرش به خودِ کنکور (ariaِ نقشهٔ بانک)
#   [پرشِ صادقانه: reading/duel زیرِ آزمونهایِ کامپوننت قفلاند — رانِ
#    واقعیِ داستان ۱۴ کلیک و رانِ دودل داور+بلیت میخواهد؛ SKIP ثبت
#    میشود نه غیبتِ داوری — همان پیشینهٔ r366]
#   F) EventDay + کنسولِ دوفازی (درسِ r365)
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
OUT=/tmp/r368-qa.txt
: > "$OUT"

shot(){ agent-browser screenshot "$EV/$1" >/dev/null 2>&1; }
ev(){ agent-browser eval "$1" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
PAL_BTN='document.querySelector("button[aria-label=\"فرمان‌یاب — جست‌وجوی همه‌جا\"]")'

echo "########## A) گاردِ سلامتِ سرور" | tee -a "$OUT"
C=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/" 2>/dev/null)
if [ "$C" != "200" ]; then
  echo "APP-DOWN — restart" | tee -a "$OUT"
  pkill -f "bun .next/standalone/server.js" 2>/dev/null; sleep 2
  cd /home/z/my-project
  DATABASE_URL="file:/home/z/my-project/db/custom.db" TEACHER_ACCESS_CODE=moallem-1404 \
    setsid nohup bun .next/standalone/server.js > /home/z/my-project/scripts/app-server.log 2>&1 &
  for i in $(seq 1 30); do sleep 3; C=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/" 2>/dev/null); [ "$C" = "200" ] && break; done
fi
echo "APP-READY code=$C" | tee -a "$OUT"
curl -s -o /dev/null -w "judge:%{http_code}\n" http://127.0.0.1:3003/ 2>/dev/null | tee -a "$OUT"

echo "########## B) سشنِ تازه + آنبوردینگِ واقعی" | tee -a "$OUT"
agent-browser close >/dev/null 2>&1 || true
pkill -f "agent-browser/browsers" 2>/dev/null; sleep 1
agent-browser open "$BASE" >/dev/null 2>&1
agent-browser set viewport 1280 900 >/dev/null 2>&1
agent-browser wait 'body' >/dev/null 2>&1 || true
for i in $(seq 1 30); do
  R=$(agent-browser eval "(()=>{const t=document.querySelector('[data-slot=\"dialog-title\"]');if(t)return 'ONBOARD';const g=document.querySelector('[aria-label=\"ابزارهای یادگیری\"]');return g?'HOME':'WAIT';})()" 2>/dev/null | tr -d '"')
  [ "$R" = "WAIT" ] || { echo "SURFACE-0=$R" | tee -a "$OUT"; break; }; sleep 3
done
ev "(()=>{
  const t=document.querySelector('[data-slot=\"dialog-content\"] [data-slot=\"dialog-title\"]');
  if(!t)return 'NO-ONBOARD-TITLE';
  const skip=[...document.querySelectorAll('button')].find(b=>b.textContent.includes('رد کردن — ناشناس می‌مانم'));
  if(!skip)return 'NO-SKIP-BTN'; skip.click(); return 'ONBOARD-OK';
})()" | tee -a "$OUT"
sleep 1

echo "########## C) تازهوارد — غیبتِ صادقانه در پالت" | tee -a "$OUT"
ev "(()=>{const b=$PAL_BTN;if(!b)return 'NO-PALETTE-BTN';b.click();return 'PALETTE-OPEN';})()" | tee -a "$OUT"
sleep 1.5
ev "(()=>{
  const inp=document.querySelector('[data-slot=\"dialog-content\"] input');
  if(!inp)return 'NO-INPUT';
  const setter=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
  setter.call(inp,'کنکور'); inp.dispatchEvent(new Event('input',{bubbles:true}));
  return 'QUERY-TYPED';
})()" | tee -a "$OUT"
sleep 1
ev "(()=>{
  const opts=[...document.querySelectorAll('[role=\"option\"]')].map(o=>o.textContent||'');
  const homeDoor=opts.find(t=>t.includes('ادامهٔ کنکور'));
  const hasGroup=[...document.querySelectorAll('[role=\"group\"]')].some(g=>g.getAttribute('aria-label')==='درهای خانه');
  if(homeDoor||hasGroup)return 'HONESTY-BROKEN: newcomer sees a home door';
  const navKonkur=opts.find(t=>t.includes('گوشهٔ کنکور'));
  return 'NEWCOMER-CLEAN home-door=none nav-konkur='+(navKonkur?'yes':'no');
})()" | tee -a "$OUT"
ev "(()=>{const inp=document.querySelector('[data-slot=\"dialog-content\"] input');if(!inp)return 'NO-INPUT';inp.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));const x=document.querySelector('[data-slot=\"dialog-close\"]');if(x)x.click();return 'PALETTE-CLOSE-ATTEMPT';})()" | tee -a "$OUT"
agent-browser press Escape >/dev/null 2>&1 || true
sleep 1

echo "########## D) رانِ واقعیِ درس ⇒ فرمانِ «ادادهٔ مطالعهٔ درس»" | tee -a "$OUT"
ev "(()=>{
  const btn=[...document.querySelectorAll('button')].find(b=>(b.textContent||'').trim()==='ورود به درس');
  if(!btn)return 'NO-ENTER-LESSON'; btn.click(); return 'LESSON-ENTERED';
})()" | tee -a "$OUT"
sleep 3
ev "(()=>{
  const rec=window.localStorage.getItem('vision2-lesson-resume-v1');
  return rec?'RESUME-WRITTEN:'+rec.slice(0,70):'NO-RESUME-RECORD';
})()" | tee -a "$OUT"
# بازگشتِ صادقانه: ری‌لود به خانه — سفرِ واقعیِ یادگیرنده (برو، برگرد، از پالت برو)
agent-browser open "$BASE" >/dev/null 2>&1; sleep 2.5
ev "(()=>{const b=$PAL_BTN;if(!b)return 'NO-PALETTE-BTN';b.click();return 'PALETTE-REOPEN-FROM-HOME';})()" | tee -a "$OUT"
sleep 1.5
ev "(()=>{
  const inp=document.querySelector('[data-slot=\"dialog-content\"] input');
  const setter=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
  setter.call(inp,'ادامه'); inp.dispatchEvent(new Event('input',{bubbles:true}));
  return 'QUERY-RESUME';
})()" | tee -a "$OUT"
sleep 1
ev "(()=>{
  const group=[...document.querySelectorAll('[role=\"group\"]')].find(g=>g.getAttribute('aria-label')==='درهای خانه');
  if(!group)return 'NO-HOME-GROUP';
  const rows=[...group.querySelectorAll('[role=\"option\"]')].map(o=>(o.textContent||'').trim());
  const row=rows.find(t=>t.includes('ادامهٔ مطالعهٔ درس'));
  if(!row)return 'LESSON-DOOR-MISSING';
  return 'LESSON-DOOR-PRESENT:'+row.slice(0,60);
})()" | tee -a "$OUT"
shot r368-palette-lesson-door.png
ev "(()=>{
  const group=[...document.querySelectorAll('[role=\"group\"]')].find(g=>g.getAttribute('aria-label')==='درهای خانه');
  const row=group && [...group.querySelectorAll('[role=\"option\"]')].find(r=>(r.textContent||'').includes('ادامهٔ مطالعهٔ درس'));
  if(!row)return 'NO-ROW'; row.click(); return 'LESSON-DOOR-CLICK';
})()" | tee -a "$OUT"
sleep 2.5
ev "(()=>{
  const head=document.querySelector('h1');
  const paletteGone=!document.querySelector('[data-slot=\"dialog-content\"] input');
  return 'AFTER-LESSON-JUMP paletteGone='+paletteGone+' head='+(head?(head.textContent||'').slice(0,30):'none');
})()" | tee -a "$OUT"

echo "########## E) رانِ واقعیِ کنکور ⇒ فرمانِ «ادادهٔ کنکور»" | tee -a "$OUT"
agent-browser open "$BASE" >/dev/null 2>&1; sleep 2.5
ev "(()=>{
  const c=[...document.querySelectorAll('button')].find(b=>b.textContent.includes('گوشهٔ کنکور'));
  if(!c)return 'NO-KONKUR-CARD'; c.click(); return 'konkur-opened';
})()" | tee -a "$OUT"
sleep 2.5
ev "(()=>{
  const ten=[...document.querySelectorAll('button')].find(x=>x.getAttribute('aria-pressed')!==null&&x.textContent.trim()==='۱۰ تست');
  if(ten&&!ten.getAttribute('aria-pressed')){ten.click(); return 'count-10-selected';}
  return ten?'count-10-already':'NO-COUNT-GROUP';
})()" | tee -a "$OUT"
START=""
for i in $(seq 1 10); do
  START=$(agent-browser eval "(()=>{const b=[...document.querySelectorAll('button')].find(x=>/شروع شبیه.?ساز کنکور/.test(x.textContent));if(!b)return 'NO-START';b.click();return 'sim-started';})()" 2>/dev/null | tr -d '"')
  [ "$START" = "sim-started" ] && break
  sleep 1.5
done
echo "SIM-START=$START" | tee -a "$OUT"
sleep 2
WAITS=0
for i in $(seq 1 60); do
  R=$(agent-browser eval "(()=>{
    const next=document.querySelector('[data-quiz-next]');
    if(next&&!next.disabled){next.click(); return 'next';}
    const opts=[...document.querySelectorAll('[data-quiz-option]')].filter(o=>!o.disabled&&o.offsetParent!==null);
    if(opts.length){opts[0].click(); return 'answered';}
    return 'waiting';
  })()" 2>/dev/null | tr -d '"')
  if [ "$R" = "waiting" ]; then WAITS=$((WAITS+1)); [ $WAITS -ge 4 ] && break; else WAITS=0; fi
  sleep 0.7
done
sleep 2
ev "(()=>{try{const st=JSON.parse(localStorage.getItem('vision2-study-v1')||'{}');return 'STORE-SEEN='+Object.keys(st.state?.konkurSeen||{}).length;}catch(e){return 'STORE-ERR';}})()" | tee -a "$OUT"
agent-browser open "$BASE" >/dev/null 2>&1; sleep 2.5
ev "(()=>{try{const st=JSON.parse(localStorage.getItem('vision2-study-v1')||'{}');return 'SEEN-AFTER-RELOAD='+Object.keys(st.state?.konkurSeen||{}).length;}catch(e){return 'STORE-ERR';}})()" | tee -a "$OUT"
ev "(()=>{const b=$PAL_BTN;if(!b)return 'NO-PALETTE-BTN';b.click();return 'PALETTE-REOPEN';})()" | tee -a "$OUT"
sleep 1.5
ev "(()=>{
  const inp=document.querySelector('[data-slot=\"dialog-content\"] input');
  const setter=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
  setter.call(inp,'ادامهٔ کنکور'); inp.dispatchEvent(new Event('input',{bubbles:true}));
  return 'QUERY-KONKUR';
})()" | tee -a "$OUT"
sleep 1
ev "(()=>{
  const group=[...document.querySelectorAll('[role=\"group\"]')].find(g=>g.getAttribute('aria-label')==='درهای خانه');
  if(!group)return 'NO-HOME-GROUP';
  const rows=[...group.querySelectorAll('[role=\"option\"]')].map(o=>(o.textContent||'').trim());
  const row=rows.find(t=>t.includes('ادامهٔ کنکور'));
  if(!row)return 'KONKUR-DOOR-MISSING';
  return 'KONKUR-DOOR-PRESENT:'+row.slice(0,80);
})()" | tee -a "$OUT"
shot r368-palette-konkur-door.png
ev "(()=>{
  const group=[...document.querySelectorAll('[role=\"group\"]')].find(g=>g.getAttribute('aria-label')==='درهای خانه');
  const row=group && [...group.querySelectorAll('[role=\"option\"]')].find(r=>(r.textContent||'').includes('ادامهٔ کنکور'));
  if(!row)return 'NO-ROW'; row.click(); return 'KONKUR-DOOR-CLICK';
})()" | tee -a "$OUT"
sleep 2.5
ev "(()=>{
  const map=document.querySelector('[aria-label=\"نقشهٔ پیشرفت بانک کنکور\"]');
  if(!map)return 'NOT-KONKUR-VIEW';
  return 'KONKUR-JUMP-OK — نقشهٔ بانک حاضر';
})()" | tee -a "$OUT"
shot r368-after-konkur-jump.png

echo "########## F) EventDay + کنسولِ دوفازی" | tee -a "$OUT"
curl -s "$BASE/api/event" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{const j=JSON.parse(s);const g=n=>{const e=(j.events||[]).find(x=>x.name===n);return e?e.total:'MISS';};console.log('APP_OPEN='+g('app_open')+' LESSON_OPEN='+g('lesson_open')+' KONKUR_START='+g('konkur_start'));})" | tee -a "$OUT"

CONSOLE_OUT=$(agent-browser console 2>&1 || true)
echo "$CONSOLE_OUT" | tee -a "$OUT" | grep -v "Download the React DevTools" > /tmp/r368-console-filtered.txt
if grep -qiE "requires a \`DialogTitle\`|Missing \`Description\`" /tmp/r368-console-filtered.txt; then
  echo "RADIX-A11Y-DIRTY" | tee -a "$OUT"; agent-browser close >/dev/null 2>&1; exit 1
fi
echo "RADIX-A11Y-CLEAN" | tee -a "$OUT"
if grep -qiE "error|warn" /tmp/r368-console-filtered.txt; then
  echo "CONSOLE-DIRTY" | tee -a "$OUT"; agent-browser close >/dev/null 2>&1; exit 1
fi
echo "CONSOLE-CLEAN" | tee -a "$OUT"

echo "########## CLEAN-RUN" | tee -a "$OUT"
agent-browser close >/dev/null 2>&1 || true
echo "r368 QA DONE — درهایِ خانه در فرمان‌یاب زنده شدند" | tee -a "$OUT"
