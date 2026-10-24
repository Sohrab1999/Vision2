#!/usr/bin/env bash
# ------------------------------------------------------------------
# r371 — «پرش به پنلِ همسایه» (بندِ ④ پیشنهادِ r370): چیپهایِ «در چرخه/
# سررسید» و چیپِ پلِ کارتِ خطرها حالا دکمههایِ پرشِ واقعیاند — کلیک =
# اسکرولِ نرم به داشبوردِ مرور + پالسِ زمردیِ ۱٫۶ثانیهای.
# تک سشن، بدونِ تزریق — دستورِ داده: هر داده با کنشِ واقعی:
#   A) گاردِ سلامتِ سرور (درسِ r364 — هر اسکریپتی گاردِ خودش را دارد)
#   B) سشنِ تازه + آنبوردینگِ واقعی
#   C) رانِ فلشکارت: «بلدم» رویِ کلِ دستهٔ درس ۱ (رسپیِ اثباتشدهٔ r370 —
#      تقاطعِ خطر×چرخه باید تضمین شود) ⇒ ورودیهایِ srs سطح ۰
#   D) دو رانِ آزمونِ واقعی (انتخابگرهایِ r369) ⇒ قاعدهٔ شاهدِ پیاپا ⇒
#      کارتِ خطر پُر
#   E) حکمِ پیوندِ r370: chips=3 + پل + همسایگیِ پنل
#   E2) حکمِ پرشِ r371 — قلبِ راند:
#      scrollY پیش/بعدِ کلیکِ پل (پنل بالای کارت است — اسکرول به بالا)
#      + data-spotlit=true رویِ خودِ سکشن + حلقهٔ درونی در کلاس
#      + شاتِ لحظهٔ پالس + مرگِ پالس بعدِ ~۲ثانیه (data-spotlit حذف)
#      + پرشِ چیپِ ردیف هم داوری میشود
#   F) EventDay + کنسولِ دوفازی (درسِ r365) + پاکسازیِ r101
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
OUT=/tmp/r371-qa.txt
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
  const skip=[...document.querySelectorAll('button')].find(b=>b.textContent.includes('رد کردن — ناشناس می‌مانم'));
  if(!skip)return 'NO-SKIP-BTN'; skip.click(); return 'ONBOARD-OK';
})()" | tee -a "$OUT"
sleep 1

echo "########## C) رانِ فلشکارت — «بلدم» رویِ کلِ دستهٔ درس ۱ (رسپیِ r370)" | tee -a "$OUT"
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
ev "(()=>{try{const st=JSON.parse(localStorage.getItem('vision2-study-v1')||'{}');const srs=st.state?.srs||{};return 'STORE-SRS='+Object.keys(srs).length+' allLevel0='+Object.values(srs).every(x=>x.level===0);}catch(e){return 'STORE-ERR';}})()" | tee -a "$OUT"

echo "########## D) رانِ آزمون — خطایِ واقعی (انتخابگرهایِ r369)" | tee -a "$OUT"
quiz_pass(){
  local TAG="$1"
  agent-browser open "$BASE" >/dev/null 2>&1; sleep 2.5
  ev "(()=>{
    const btn=[...document.querySelectorAll('button')].find(b=>(b.textContent||'').trim()==='ورود به درس');
    if(!btn)return 'NO-ENTER-LESSON'; btn.click(); return 'LESSON-REENTER-$TAG';
  })()" | tee -a "$OUT"
  sleep 3
  ev "(()=>{
    const tab=[...document.querySelectorAll('button')].find(b=>(b.getAttribute('aria-label')||'').includes('تست‌ها')||(b.textContent||'').trim()==='تست‌ها');
    if(!tab)return 'NO-TESTS-TAB'; tab.click(); return 'TESTS-TAB-$TAG';
  })()" | tee -a "$OUT"
  sleep 2
  ev "(()=>{
    const start=[...document.querySelectorAll('button')].find(b=>/شروع/.test(b.textContent||'')&&!b.disabled);
    if(!start)return 'NO-QUIZ-START'; start.click(); return 'QUIZ-STARTED-$TAG';
  })()" | tee -a "$OUT"
  sleep 2
  WAITS=0
  for i in $(seq 1 40); do
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
}
quiz_pass 1
ev "(()=>{try{const st=JSON.parse(localStorage.getItem('vision2-study-v1')||'{}');const wm=st.state?.wordMistakes||{};const ws=st.state?.wordSeen||{};return 'WORD-MISTAKES='+Object.keys(wm).length+' WORD-SEEN='+Object.keys(ws).length;}catch(e){return 'STORE-ERR';}})()" | tee -a "$OUT"

echo "########## D2) رانِ دومِ آزمون — شواهدِ پیاپا (درسِ r369c)" | tee -a "$OUT"
quiz_pass 2
ev "(()=>{try{const st=JSON.parse(localStorage.getItem('vision2-study-v1')||'{}');const wm=st.state?.wordMistakes||{};const ws=st.state?.wordSeen||{};const q=Object.keys(wm).filter(k=>(wm[k]||0)>0&&((ws[k]||0)>=2||(wm[k]||0)>=2));return 'QUALIFIED-WORDS='+q.length+' of seen='+Object.keys(ws).length;}catch(e){return 'STORE-ERR';}})()" | tee -a "$OUT"

echo "########## E) حکمِ پیوندِ r370 — پیشِنیارِ پرش" | tee -a "$OUT"
agent-browser open "$BASE" >/dev/null 2>&1; sleep 3
for i in $(seq 1 20); do
  R=$(agent-browser eval "(()=>{const d=document.querySelector('[aria-label=\"واژه‌های خطرناک من\"]');return d?'DANGER-CARD':'WAIT';})()" 2>/dev/null | tr -d '"')
  [ "$R" = "DANGER-CARD" ] && { echo "DANGER-CARD-RENDERED" | tee -a "$OUT"; break; }; sleep 3
done
ev "(()=>{
  try{
    const dom=document.querySelector('[aria-label=\"واژه‌های خطرناک من\"]');
    if(!dom)return 'NO-DANGER-CARD';
    const chips=[...dom.querySelectorAll('[data-testid^=\"danger-srs-chip-\"]')];
    const bridge=document.querySelector('[data-testid=\"danger-srs-bridge\"]');
    const panel=document.querySelector('[aria-label=\"داشبورد مرور هوشمند\"]');
    return 'LINK chips='+chips.length+
      ' bridge='+(bridge?bridge.textContent.trim().replace(/\s+/g,' '):'none')+
      ' bridgeIsButton='+(bridge?bridge.tagName:'-')+
      ' neighborPanel='+(panel?'yes':'no')+
      ' firstChip='+(chips[0]?chips[0].tagName+':'+chips[0].textContent.trim().replace(/\s+/g,' '):'-');
  }catch(e){return 'EVAL-ERR '+e.message;}
})()" | tee -a "$OUT"

echo "########## E2) حکمِ پرشِ r371 — کلیکِ واقعی رویِ چیپِ پل" | tee -a "$OUT"
# چیپِ پل در سرِ کارتِ خطر است؛ داشبوردِ مرور بالای کارت — پرش باید
# صفحه را به بالا ببرد + پالس روشن شود + بعدِ ~۲ثانیه خاموش.
agent-browser scrollintoview '[aria-label="واژه‌های خطرناک من"]' >/dev/null 2>&1 || true
sleep 1
ev "(()=>{
  const before=window.scrollY;
  const bridge=document.querySelector('[data-testid=\"danger-srs-bridge\"]');
  if(!bridge)return 'NO-BRIDGE';
  if(bridge.tagName!=='BUTTON')return 'BRIDGE-NOT-BUTTON';
  bridge.click();
  return 'BEFORE-CLICK scrollY='+Math.round(before);
})()" | tee -a "$OUT"
sleep 2  # اسکرولِ نرم تمام شود
ev "(()=>{
  const panel=document.querySelector('[aria-label=\"داشبورد مرور هوشمند\"]');
  if(!panel)return 'NO-PANEL';
  return 'JUMP-BRIDGE afterScrollY='+Math.round(window.scrollY)+
    ' spotlit='+(panel.getAttribute('data-spotlit')||'no')+
    ' insetRing='+(panel.className.includes('shadow-[inset_0_0_0_2px]')?'yes':'no')+
    ' focused='+(document.activeElement===panel?'panel':'other');
})()" | tee -a "$OUT"
shot r371-jump-spotlight-light.png
sleep 2  # پالسِ ۱٫۶ثانیهای بمیرد
ev "(()=>{
  const panel=document.querySelector('[aria-label=\"داشبورد مرور هوشمند\"]');
  return 'PULSE-AFTER-2S spotlit='+(panel?(panel.getAttribute('data-spotlit')||'gone'):'-')+
    ' ringGone='+(panel&&!panel.className.includes('shadow-[inset_0_0_0_2px]')?'yes':'no');
})()" | tee -a "$OUT"

echo "########## E3) پرشِ چیپِ ردیف — از میانهٔ کارت به داشبورد" | tee -a "$OUT"
agent-browser scrollintoview '[data-testid^="danger-srs-chip-"]' >/dev/null 2>&1 || true
sleep 1
ev "(()=>{
  const chip=document.querySelector('[data-testid^=\"danger-srs-chip-\"]');
  if(!chip)return 'NO-ROW-CHIP';
  if(chip.tagName!=='BUTTON')return 'CHIP-NOT-BUTTON';
  const before=window.scrollY;
  chip.click();
  return 'ROW-CLICK before='+Math.round(before)+' label='+(chip.getAttribute('aria-label')||'none');
})()" | tee -a "$OUT"
sleep 2
ev "(()=>{
  const panel=document.querySelector('[aria-label=\"داشبورد مرور هوشمند\"]');
  return 'JUMP-ROW afterScrollY='+Math.round(window.scrollY)+
    ' spotlit='+(panel?(panel.getAttribute('data-spotlit')||'no'):'-');
})()" | tee -a "$OUT"
sleep 2.5  # پالس بمیرد پیشِ تاریک

agent-browser press t >/dev/null 2>&1 || true
sleep 1.5
# پرشِ سوم در تاریک — شاتِ پالسِ زمردی رویِ پوستهٔ تیره
ev "(()=>{
  const bridge=document.querySelector('[data-testid=\"danger-srs-bridge\"]');
  if(!bridge)return 'NO-BRIDGE-DARK';
  bridge.click(); return 'DARK-CLICK-OK';
})()" | tee -a "$OUT"
sleep 2
ev "(()=>{
  const panel=document.querySelector('[aria-label=\"داشبورد مرور هوشمند\"]');
  return 'DARK-JUMP spotlit='+(panel?(panel.getAttribute('data-spotlit')||'no'):'-')+
    ' darkRing='+(panel&&panel.className.includes('dark:shadow-emerald-600')?'yes':'no');
})()" | tee -a "$OUT"
agent-browser scrollintoview '[aria-label="داشبورد مرور هوشمند"]' >/dev/null 2>&1 || true
sleep 1
shot r371-jump-spotlight-dark.png
agent-browser press t >/dev/null 2>&1 || true
sleep 1

echo "########## F) EventDay + کنسولِ دوفازی" | tee -a "$OUT"
curl -s "$BASE/api/event" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{const j=JSON.parse(s);const g=n=>{const e=(j.events||[]).find(x=>x.name===n);return e?e.total:'MISS';};console.log('APP_OPEN='+g('app_open')+' LESSON_OPEN='+g('lesson_open')+' QUIZ_DONE='+g('quiz_done'));})" | tee -a "$OUT"
CONSOLE_RAW=$(agent-browser console 2>/dev/null || true)
if echo "$CONSOLE_RAW" | grep -qiE "error|warn" ; then
  echo "CONSOLE-DIRTY" | tee -a "$OUT"
  echo "$CONSOLE_RAW" | grep -iE "error|warn" | head -5 | tee -a "$OUT"
else
  echo "CONSOLE-CLEAN" | tee -a "$OUT"
fi

echo "########## پاکسازیِ r101" | tee -a "$OUT"
cd /home/z/my-project
node scripts/qa-db-cleanup-r101.cjs --clean 2>&1 | tail -4 | tee -a "$OUT"
echo "########## DONE r371" | tee -a "$OUT"
