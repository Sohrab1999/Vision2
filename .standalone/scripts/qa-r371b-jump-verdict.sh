#!/usr/bin/env bash
# ------------------------------------------------------------------
# r371b — حکمِ پرش با زمان‌بندیِ درست (درسِ رانِ نخست r371: پالسِ
# ۱٫۶ثانیهای پیشِ probeِ +۲ثانیهای میمُرد — داوری باید داخلِ پنجره
# باشد). تک سشن، بدونِ تزریق:
#   A) گاردِ سلامت  B) سشن + آنبوردینگ
#   C) رسپیِ کاملِ دادهٔ r370 (فلشکارتِ کلِ دسته + دو رانِ آزمون)
#   E2) کلیکِ پل ⇒ بلافاصله probe (بدونِ خواب) ⇒ spotlit=insetRing
#       ⇒ شاتِ درونِ پنجره ⇒ مرگِ پالس بعدِ ۲٫۲ثانیه
#   E3) کلیکِ چیپِ ردیف ⇒ بلافاصله probe ⇒ مرگ
#   E4) تاریک: کلیک ⇒ شاتِ فوری + probe ⇒ مرگ
#   F) کنسولِ دوفازی + پاکسازی
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
OUT=/tmp/r371b-qa.txt
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

echo "########## C) رسپیِ r370 — فلشکارت رویِ کلِ دستهٔ درس ۱" | tee -a "$OUT"
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

echo "########## C2) دو رانِ آزمونِ واقعی — شواهدِ پیاپا" | tee -a "$OUT"
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
quiz_pass 2
ev "(()=>{try{const st=JSON.parse(localStorage.getItem('vision2-study-v1')||'{}');const wm=st.state?.wordMistakes||{};const ws=st.state?.wordSeen||{};const srs=st.state?.srs||{};const q=Object.keys(wm).filter(k=>(wm[k]||0)>0&&((ws[k]||0)>=2||(wm[k]||0)>=2));const ic=q.filter(k=>{const it=srs[k];return !!it&&Number.isFinite(it.dueAt)&&Number.isInteger(it.level)&&it.level>=0&&it.level<=5;});return 'DATA-READY qualified='+q.length+' inCycle='+ic.length+' srs='+Object.keys(srs).length;}catch(e){return 'STORE-ERR';}})()" | tee -a "$OUT"

echo "########## E2) پرشِ پل — داوریِ درونِ پنجرهٔ پالس" | tee -a "$OUT"
agent-browser open "$BASE" >/dev/null 2>&1; sleep 3
for i in $(seq 1 20); do
  R=$(agent-browser eval "(()=>{const d=document.querySelector('[aria-label=\"واژه‌های خطرناک من\"]');return d?'DANGER-CARD':'WAIT';})()" 2>/dev/null | tr -d '"')
  [ "$R" = "DANGER-CARD" ] && { echo "DANGER-CARD-RENDERED" | tee -a "$OUT"; break; }; sleep 3
done
agent-browser scrollintoview '[aria-label="واژه‌های خطرناک من"]' >/dev/null 2>&1 || true
sleep 1
ev "(()=>{
  const bridge=document.querySelector('[data-testid=\"danger-srs-bridge\"]');
  if(!bridge)return 'NO-BRIDGE';
  if(bridge.tagName!=='BUTTON')return 'BRIDGE-NOT-BUTTON';
  bridge.click();
  return 'BRIDGE-CLICKED scrollY-before='+Math.round(window.scrollY);
})()" | tee -a "$OUT"
# probeِ فوری — بدونِ خواب؛ باید داخلِ ۱٫۶ثانیه باشد
ev "(()=>{
  const panel=document.querySelector('[aria-label=\"داشبورد مرور هوشمند\"]');
  if(!panel)return 'NO-PANEL';
  return 'JUMP-LIVE spotlit='+(panel.getAttribute('data-spotlit')||'no')+
    ' insetRing='+(panel.className.includes('shadow-[inset_0_0_0_2px]')?'yes':'no')+
    ' afterScrollY='+Math.round(window.scrollY)+
    ' focused='+(document.activeElement===panel?'panel':'other');
})()" | tee -a "$OUT"
shot r371-jump-spotlight-light.png
sleep 2.2
ev "(()=>{
  const panel=document.querySelector('[aria-label=\"داشبورد مرور هوشمند\"]');
  return 'PULSE-DEAD spotlit='+(panel?(panel.getAttribute('data-spotlit')||'gone'):'-')+
    ' ringGone='+(panel&&!panel.className.includes('shadow-[inset_0_0_0_2px]')?'yes':'no');
})()" | tee -a "$OUT"

echo "########## E3) پرشِ چیپِ ردیف — داوریِ درونِ پنجره" | tee -a "$OUT"
agent-browser scrollintoview '[data-testid^="danger-srs-chip-"]' >/dev/null 2>&1 || true
sleep 1
ev "(()=>{
  const chip=document.querySelector('[data-testid^=\"danger-srs-chip-\"]');
  if(!chip)return 'NO-ROW-CHIP';
  if(chip.tagName!=='BUTTON')return 'CHIP-NOT-BUTTON';
  chip.click();
  return 'ROW-CLICKED label='+(chip.getAttribute('aria-label')||'none');
})()" | tee -a "$OUT"
ev "(()=>{
  const panel=document.querySelector('[aria-label=\"داشبورد مرور هوشمند\"]');
  return 'ROW-JUMP-LIVE spotlit='+(panel?(panel.getAttribute('data-spotlit')||'no'):'-')+
    ' afterScrollY='+Math.round(window.scrollY);
})()" | tee -a "$OUT"
sleep 2.2
ev "(()=>{
  const panel=document.querySelector('[aria-label=\"داشبورد مرور هوشمند\"]');
  return 'ROW-PULSE-DEAD spotlit='+(panel?(panel.getAttribute('data-spotlit')||'gone'):'-');
})()" | tee -a "$OUT"

echo "########## E4) پرش در تاریک — شاتِ فوریِ درونِ پنجره" | tee -a "$OUT"
agent-browser press t >/dev/null 2>&1 || true
sleep 1.5
agent-browser scrollintoview '[data-testid="danger-srs-bridge"]' >/dev/null 2>&1 || true
sleep 1
ev "(()=>{
  const bridge=document.querySelector('[data-testid=\"danger-srs-bridge\"]');
  if(!bridge)return 'NO-BRIDGE-DARK';
  bridge.click(); return 'DARK-CLICKED';
})()" | tee -a "$OUT"
shot r371-jump-spotlight-dark.png
ev "(()=>{
  const panel=document.querySelector('[aria-label=\"داشبورد مرور هوشمند\"]');
  return 'DARK-JUMP-LIVE spotlit='+(panel?(panel.getAttribute('data-spotlit')||'no'):'-')+
    ' darkRing='+(panel&&panel.className.includes('dark:shadow-emerald-600')?'yes':'no');
})()" | tee -a "$OUT"
sleep 2.2
ev "(()=>{
  const panel=document.querySelector('[aria-label=\"داشبورد مرور هوشمند\"]');
  return 'DARK-PULSE-DEAD spotlit='+(panel?(panel.getAttribute('data-spotlit')||'gone'):'-');
})()" | tee -a "$OUT"
agent-browser press t >/dev/null 2>&1 || true
sleep 1

echo "########## F) کنسولِ دوفازی + پاکسازی" | tee -a "$OUT"
CONSOLE_RAW=$(agent-browser console 2>/dev/null || true)
if echo "$CONSOLE_RAW" | grep -qiE "error|warn" ; then
  echo "CONSOLE-DIRTY" | tee -a "$OUT"
  echo "$CONSOLE_RAW" | grep -iE "error|warn" | head -5 | tee -a "$OUT"
else
  echo "CONSOLE-CLEAN" | tee -a "$OUT"
fi
cd /home/z/my-project
node scripts/qa-db-cleanup-r101.cjs --clean 2>&1 | tail -4 | tee -a "$OUT"
echo "########## DONE r371b" | tee -a "$OUT"
