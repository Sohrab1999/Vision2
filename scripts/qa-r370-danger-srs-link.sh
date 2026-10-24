#!/usr/bin/env bash
# ------------------------------------------------------------------
# r370 — «پیوندِ دو داشبورد»: چیپهایِ «در چرخه» رویِ ردیفهایِ خطرناک
# (بندِ ④ پیشنهادِ r369). تک سشن، بدونِ تزریق — هر داده با کنشِ واقعی:
#   A) گاردِ سلامتِ سرور (درسِ r364 — هر اسکریپتی گاردِ خودش را دارد)
#   B) سشنِ تازه + آنبوردینگِ واقعی
#   C) رانِ فلشکارت: درس ۱ ⇒ «حالت فلش‌کارت» ⇒ «بلدم» رویِ «کلِ دسته»
#      (نه فقط پنج تا — تقاطع با خطاهایِ آزمون باید تضمین شود) ⇒
#      ورودیهایِ srs سطح ۰ (سررسیدِ +۱۵دقیقه)
#   D) رانِ آزمون (انتخابگرهایِ اثباتشدهٔ r369): پاسخِ گزینهٔ نخست ⇒
#      wordMistakes/wordSeen ⇒ کارتِ خطرناکها پُر
#   E) حکمِ پیوند: در خانه، چیپِ SRS رویِ ردیفهایِ خطر + چیپِ پلِ
#      «X از Y در چرخهٔ مرور» + همسایگیِ داشبوردِ مرور در همان صفحه؛
#      تطبیقِ حسابِ انبار (تقاطعِ کلیدها) با DOM. [واریانتِ «سررسید»
#      زنده داوری نمیشود — انتظارِ واقعیِ ۱۵دقیقه در همین چرخه توسط
#      r369b پرداخت شده است؛ قفلِ jsdomِ آزمونِ ④ جانشینِ صادق است]
#   F) EventDay + کنسولِ دوفازی (درسِ r365) + پاکسازیِ r101
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
OUT=/tmp/r370-qa.txt
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

echo "########## C) رانِ فلشکارت — «بلدم» رویِ کلِ دستهٔ درس ۱" | tee -a "$OUT"
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
agent-browser open "$BASE" >/dev/null 2>&1; sleep 2.5
ev "(()=>{
  const btn=[...document.querySelectorAll('button')].find(b=>(b.textContent||'').trim()==='ورود به درس');
  if(!btn)return 'NO-ENTER-LESSON'; btn.click(); return 'LESSON-REENTER';
})()" | tee -a "$OUT"
sleep 3
ev "(()=>{
  const tab=[...document.querySelectorAll('button')].find(b=>(b.getAttribute('aria-label')||'').includes('تست‌ها')||(b.textContent||'').trim()==='تست‌ها');
  if(!tab)return 'NO-TESTS-TAB'; tab.click(); return 'TESTS-TAB';
})()" | tee -a "$OUT"
sleep 2
ev "(()=>{
  const start=[...document.querySelectorAll('button')].find(b=>/شروع/.test(b.textContent||'')&&!b.disabled);
  if(!start)return 'NO-QUIZ-START'; start.click(); return 'QUIZ-STARTED';
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
ev "(()=>{try{const st=JSON.parse(localStorage.getItem('vision2-study-v1')||'{}');const wm=st.state?.wordMistakes||{};const ws=st.state?.wordSeen||{};return 'WORD-MISTAKES='+Object.keys(wm).length+' WORD-SEEN='+Object.keys(ws).length;}catch(e){return 'STORE-ERR';}})()" | tee -a "$OUT"

# رانِ دومِ همان آزمون (واقعی) — درسِ r369c: قاعدهٔ شاهدِ خطر «شواهدِ پیاپا»
# میخواهد؛ یک بدشانسیِ تنها شاهد نیست. رانِ دوم همان واژهها را از مرز میگذراند.
echo "########## D2) رانِ دومِ آزمون — شواهدِ پیاپا" | tee -a "$OUT"
agent-browser open "$BASE" >/dev/null 2>&1; sleep 2.5
ev "(()=>{
  const btn=[...document.querySelectorAll('button')].find(b=>(b.textContent||'').trim()==='ورود به درس');
  if(!btn)return 'NO-ENTER-LESSON'; btn.click(); return 'LESSON-REENTER2';
})()" | tee -a "$OUT"
sleep 3
ev "(()=>{
  const tab=[...document.querySelectorAll('button')].find(b=>(b.getAttribute('aria-label')||'').includes('تست‌ها')||(b.textContent||'').trim()==='تست‌ها');
  if(!tab)return 'NO-TESTS-TAB'; tab.click(); return 'TESTS-TAB2';
})()" | tee -a "$OUT"
sleep 2
ev "(()=>{
  const start=[...document.querySelectorAll('button')].find(b=>/شروع/.test(b.textContent||'')&&!b.disabled);
  if(!start)return 'NO-QUIZ-START'; start.click(); return 'QUIZ-STARTED2';
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
ev "(()=>{try{const st=JSON.parse(localStorage.getItem('vision2-study-v1')||'{}');const wm=st.state?.wordMistakes||{};const ws=st.state?.wordSeen||{};const q=Object.keys(wm).filter(k=>(wm[k]||0)>0&&((ws[k]||0)>=2||(wm[k]||0)>=2));return 'QUALIFIED-WORDS='+q.length+' of seen='+Object.keys(ws).length;}catch(e){return 'STORE-ERR';}})()" | tee -a "$OUT"

echo "########## E) حکمِ پیوند — دو داشبورد در یک صفحه حرف میزنند" | tee -a "$OUT"
agent-browser open "$BASE" >/dev/null 2>&1; sleep 3
for i in $(seq 1 20); do
  R=$(agent-browser eval "(()=>{const d=document.querySelector('[aria-label=\"واژه‌های خطرناک من\"]');return d?'DANGER-CARD':'WAIT';})()" 2>/dev/null | tr -d '"')
  [ "$R" = "DANGER-CARD" ] && { echo "DANGER-CARD-RENDERED" | tee -a "$OUT"; break; }; sleep 3
done
ev "(()=>{
  try{
    const st=JSON.parse(localStorage.getItem('vision2-study-v1')||'{}').state||{};
    const wm=st.wordMistakes||{}, ws=st.wordSeen||{}, srs=st.srs||{};
    const danger=Object.keys(wm).filter(k=>(wm[k]||0)>0&&((ws[k]||0)>=2||(wm[k]||0)>=2));
    const inCycle=danger.filter(k=>{const it=srs[k];return !!it&&Number.isFinite(it.dueAt)&&Number.isInteger(it.level)&&it.level>=0&&it.level<=5;});
    const dom=document.querySelector('[aria-label=\"واژه‌های خطرناک من\"]');
    if(!dom)return 'NO-DANGER-CARD';
    const chips=dom.querySelectorAll('[data-testid^=\"danger-srs-chip-\"]').length;
    const bridge=document.querySelector('[data-testid=\"danger-srs-bridge\"]');
    const panel=document.querySelector('[aria-label=\"داشبورد مرور هوشمند\"]');
    const firstChip=dom.querySelector('[data-testid^=\"danger-srs-chip-\"]');
    return 'LINK danger='+danger.length+' inCycle='+inCycle.length+' chips='+chips+
      ' bridge='+(bridge?bridge.textContent.trim().replace(/\s+/g,' '):'none')+
      ' neighborPanel='+(panel?'yes':'no')+
      ' firstChipText='+(firstChip?firstChip.textContent.trim().replace(/\s+/g,' '):'-');
  }catch(e){return 'EVAL-ERR '+e.message;}
})()" | tee -a "$OUT"
agent-browser scrollintoview '[aria-label="واژه‌های خطرناک من"]' >/dev/null 2>&1 || true
sleep 1
shot r370-danger-srs-link-light.png
agent-browser press t >/dev/null 2>&1 || true
sleep 1.5
agent-browser scrollintoview '[aria-label="واژه‌های خطرناک من"]' >/dev/null 2>&1 || true
sleep 1
shot r370-danger-srs-link-dark.png
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
echo "########## DONE r370" | tee -a "$OUT"
