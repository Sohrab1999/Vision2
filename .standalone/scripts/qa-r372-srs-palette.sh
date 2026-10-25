#!/usr/bin/env bash
# ------------------------------------------------------------------
# r372 — «داشبوردِ مرور در فرمان‌یاب» (بندِ ④ پیشنهادِ r371):
# فرمانِ «داشبورد مرور هوشمند» با گیتِ hasProgress واردِ پالت شد —
# چهارمین مصرفِ focusSrsDashboard. دو مسیرِ رسیدن داوریِ زنده:
#   A) گاردِ سلامتِ سرور (درسِ r364 — هر اسکریپتی گاردِ خودش را دارد)
#   B) سشنِ تازه + آنبوردینگِ واقعی + گرمایشِ فلشکارت (رسپیِ r370:
#      «بلدم» ×۳۰ ⇒ srs سطح ۰ ⇒ hasProgress ⇒ پنل و فرمان زنده)
#   C) پیش از فرمان: پالتِ تازهوارد — نه (قبلاً ثابت شد؛ حالا با داده:
#      فرمان حاضر + آیکونِ CalendarClock + رفعِ آیکونِ معلم = School)
#   D) مسیرِ دور — قلبِ راند: از درس (دنیایِ دیگر) Ctrl+K → تایپِ
#      «مرور» → Enter ⇒ ناوبری به خانه + سکونِ ۴۵۰ms + پرشِ واقعی:
#      data-spotlit=true داخلِ پنجرهٔ پالس (درسِ r371 — probe فوری) +
#      activeElement=سکشن + scrollY تغییر + مرگِ پالس بعدِ ~۲ثانیه
#   E) مسیرِ زنده — رویِ خودِ خانه: دوباره Ctrl+K → Enter ⇒ پرشِ
#      بعد از ۲۶۰ms تحویل؛ پالسِ دوم + شاتِ تیره در لحظهٔ پالس
#   F) EventDay + کنسولِ دوفازی (درسِ r365) + پاکسازیِ r101
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
OUT=/tmp/r372-qa.txt
: > "$OUT"

shot(){ agent-browser screenshot "$EV/$1" >/dev/null 2>&1; }
ev(){ agent-browser eval "$1" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

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

echo "########## B) سشنِ تازه + آنبوردینگ + گرمایشِ فلشکارت" | tee -a "$OUT"
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
  const skip=[...document.querySelectorAll('button')].find(b=>b.textContent.includes('رد کردن — ناشناس می‌مانم'));
  if(!skip)return 'NO-SKIP-BTN'; skip.click(); return 'ONBOARD-OK';
})()" | tee -a "$OUT"
sleep 1
ev "(()=>{
  const btn=[...document.querySelectorAll('button')].find(b=>(b.textContent||'').trim()==='ورود به درس');
  if(!btn)return 'NO-ENTER-LESSON'; btn.click(); return 'LESSON-ENTERED';
})()" | tee -a "$OUT"
sleep 3
ev "(()=>{
  const fb=[...document.querySelectorAll('button')].find(b=>(b.textContent||'').includes('حالت فلش‌کارت'));
  if(!fb)return 'NO-FLASH-MODE-BTN'; fb.click(); return 'FLASH-MODE';
})()" | tee -a "$OUT"
sleep 2
MARKS=0; MISS=0
for i in $(seq 1 40); do
  [ "$MARKS" -ge 30 ] && break
  R=$(agent-browser eval "(()=>{
    const btns=[...document.querySelectorAll('button')].filter(b=>(b.textContent||'').trim()==='بلدم'&&!b.disabled);
    if(btns.length){btns[0].click();return 'KNOWN';}
    return 'WAIT';
  })()" 2>/dev/null | tr -d '"')
  if [ "$R" = "KNOWN" ]; then MARKS=$((MARKS+1)); MISS=0; sleep 0.9; else MISS=$((MISS+1)); [ "$MISS" -ge 3 ] && break; sleep 1; fi
done
echo "FLASH-KNOWN-MARKS=$MARKS" | tee -a "$OUT"
ev "(()=>{try{const st=JSON.parse(localStorage.getItem('vision2-study-v1')||'{}');const srs=st.state?.srs||{};return 'STORE-SRS='+Object.keys(srs).length;}catch(e){return 'STORE-ERR';}})()" | tee -a "$OUT"

echo "########## C) پالت با داده — فرمانِ نو + دو آیکون" | tee -a "$OUT"
agent-browser press Control+k >/dev/null 2>&1
sleep 1.2
ev "(()=>{
  const dlg=document.querySelector('.command-palette');
  if(!dlg)return 'NO-PALETTE';
  const rows=[...dlg.querySelectorAll('[role=\"option\"]')];
  const srs=rows.find(r=>r.textContent.includes('داشبورد مرور هوشمند'));
  const teacher=rows.find(r=>r.textContent.includes('پنل معلم'));
  return 'PALETTE-DATA srs='+(srs?'yes':'NO')+
    ' srsIcon='+(srs?(srs.querySelector('svg')?.getAttribute('class')||'-').includes('lucide-calendar-clock')?'calendar-clock':'WRONG':'-')+
    ' teacherIcon='+(teacher?(teacher.querySelector('svg')?.getAttribute('class')||'-').includes('lucide-school')?'school':'WRONG':'-');
})()" | tee -a "$OUT"
agent-browser press Escape >/dev/null 2>&1; sleep 1

echo "########## D) مسیرِ دور — از درس: Ctrl+K → «مرور» → Enter" | tee -a "$OUT"
# الان در نمایِ درسیم (دنیایِ دیگر) — دقیقاً سناریویِ پرچم + ناوبری
agent-browser press Control+k >/dev/null 2>&1
sleep 1
agent-browser type "داشبورد" >/dev/null 2>&1 || agent-browser eval "(()=>{const i=document.querySelector('.command-palette input');if(!i)return 'NO-INPUT';const s=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;s.call(i,'داشبورد');i.dispatchEvent(new Event('input',{bubbles:true}));return 'TYPED';})()" >/dev/null 2>&1
sleep 1.2
ev "(()=>{
  const dlg=document.querySelector('.command-palette');
  if(!dlg)return 'NO-PALETTE-2';
  const act=dlg.querySelector('[data-active=\"true\"]');
  return 'FILTERED first='+(act?act.textContent.trim().replace(/\s+/g,' ').slice(0,60):'-');
})()" | tee -a "$OUT"
# Enter رویِ فرمان — اگر اولینِ فعال «داشبورد مرور» بود
ev "(()=>{
  const dlg=document.querySelector('.command-palette');
  const act=dlg&&dlg.querySelector('[data-active=\"true\"]');
  if(!act||!act.textContent.includes('داشبورد مرور هوشمند'))return 'NOT-FIRST — abort';
  return 'TARGET-LOCKED';
})()" | tee -a "$OUT"
BEFORE=$(agent-browser eval "window.scrollY" 2>/dev/null | tr -d '"')
agent-browser press Enter >/dev/null 2>&1
# probeِ فوریِ داخلِ پنجرهٔ پالس (درسِ r371) — سکونِ ۴۵۰ms + اسکرولِ نرم
# [درسِ راندِ اول: درخواستِ «مرور» اول «مرور سریع خطاها» را میآورد —
# تطابقِ سرِ برچسب؛ درخواستِ «داشبورد» تکروندهٔ فرمانِ نو است]
DEAD=0
for i in $(seq 1 14); do
  R=$(agent-browser eval "(()=>{
    const s=document.getElementById('srs-dashboard');
    if(!s)return 'WAIT-PANEL';
    return 'spotlit='+(s.getAttribute('data-spotlit')==='true')+
      ' focused='+(document.activeElement===s)+
      ' scrollY='+Math.round(window.scrollY);
  })()" 2>/dev/null | tr -d '"')
  echo "PROBE-$i: $R" | tee -a "$OUT"
  case "$R" in *spotlit=true*focused=true*) ALIVE=1; break;; esac
  sleep 0.35
done
if [ "${ALIVE:-0}" = "1" ]; then echo "CROSS-VIEW-JUMP-LIVE" | tee -a "$OUT"; shot r372-cross-jump-pulse.png; else echo "CROSS-VIEW-JUMP-MISSED" | tee -a "$OUT"; DEAD=1; fi
sleep 2.4
ev "(()=>{
  const s=document.getElementById('srs-dashboard');
  return 'PULSE-DEAD spotlit='+(s&&s.hasAttribute('data-spotlit')?'still-on':'gone');
})()" | tee -a "$OUT"

echo "########## E) مسیرِ زنده — رویِ خودِ خانه + شاتِ تیره" | tee -a "$OUT"
# برو بالای صفحه تا پرشِ دوم اسکرولِ واقعی بسازد
agent-browser eval "window.scrollTo(0,0)" >/dev/null 2>&1; sleep 1
agent-browser press Control+k >/dev/null 2>&1
sleep 1
agent-browser type "داشبورد" >/dev/null 2>&1 || true
sleep 1
agent-browser press Enter >/dev/null 2>&1
for i in $(seq 1 14); do
  R=$(agent-browser eval "(()=>{
    const s=document.getElementById('srs-dashboard');
    if(!s)return 'WAIT-PANEL';
    return 'spotlit='+(s.getAttribute('data-spotlit')==='true')+' scrollY='+Math.round(window.scrollY);
  })()" 2>/dev/null | tr -d '"')
  echo "LIVE-PROBE-$i: $R" | tee -a "$OUT"
  case "$R" in *spotlit=true*) ALIVE2=1; break;; esac
  sleep 0.35
done
if [ "${ALIVE2:-0}" = "1" ]; then echo "HOME-LIVE-JUMP-OK" | tee -a "$OUT"; shot r372-home-jump-pulse.png; else echo "HOME-LIVE-JUMP-MISSED" | tee -a "$OUT"; fi
# شاتِ تیره در لحظهٔ پالسِ نو
agent-browser eval "(()=>{const t=[...document.querySelectorAll('button')].find(b=>(b.getAttribute('aria-label')||'').includes('حالت شب')||(b.title||'').includes('شب'));if(t){t.click();return 'DARK-ON';}return 'NO-TOGGLE';})()" >/dev/null 2>&1
sleep 1.2
agent-browser press Control+k >/dev/null 2>&1; sleep 0.8
agent-browser type "داشبورد" >/dev/null 2>&1 || true; sleep 0.8
agent-browser press Enter >/dev/null 2>&1
for i in $(seq 1 14); do
  R=$(agent-browser eval "(()=>{const s=document.getElementById('srs-dashboard');return s&&s.getAttribute('data-spotlit')==='true'?'SPOT':'wait';})()" 2>/dev/null | tr -d '"')
  [ "$R" = "SPOT" ] && { echo "DARK-JUMP-LIVE" | tee -a "$OUT"; shot r372-dark-jump-pulse.png; break; }
  sleep 0.35
done
sleep 2
agent-browser eval "(()=>{const t=[...document.querySelectorAll('button,[role=\"menuitem\"]')].find(b=>(b.getAttribute('aria-label')||'').includes('حالت روشن')||(b.title||'').includes('روشن'));if(t){t.click();return 'LIGHT-ON';}return 'NO-TOGGLE';})()" >/dev/null 2>&1
sleep 1

echo "########## F) EventDay + کنسولِ دوفازی" | tee -a "$OUT"
ev "(()=>{try{const st=JSON.parse(localStorage.getItem('vision2-study-v1')||'{}');const srs=st.state?.srs||{};return 'FINAL-SRS='+Object.keys(srs).length+' appOpen='+(st.state?.appOpenCount??'-');}catch(e){return 'STORE-ERR';}})()" | tee -a "$OUT"
agent-browser logs 2>/dev/null | grep -iE "error|warn" | grep -vE "Download the React DevTools|hydrat" > /tmp/r372-console.log || true
if [ -s /tmp/r372-console.log ]; then echo "CONSOLE-DIRTY: $(head -3 /tmp/r372-console.log)" | tee -a "$OUT"; else echo "CONSOLE-CLEAN" | tee -a "$OUT"; fi

echo "########## خلاصهٔ حکم" | tee -a "$OUT"
grep -E "APP-READY|judge:|FLASH-KNOWN-MARKS|STORE-SRS|PALETTE-DATA|TARGET-LOCKED|CROSS-VIEW-JUMP|PULSE-DEAD|HOME-LIVE-JUMP|DARK-JUMP-LIVE|FINAL-SRS|CONSOLE" "$OUT" | tail -14
