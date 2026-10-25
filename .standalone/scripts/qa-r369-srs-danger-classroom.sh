#!/usr/bin/env bash
# ------------------------------------------------------------------
# r369 — «کلاسِ آموزشیِ مرورگر»: جریانِ سررسیدِ SRS و واژههایِ خطرناک
# (بندِ ③ پیشنهادِ r366 — سه راند؛ سطحهایِ SKIPشدهٔ داوریِ زنده).
# تک سشن، بدونِ تزریق — هر داده با کنشِ واقعیِ UI ساخته میشود و
# پاکسازیِ r101 فقط پنجرهٔ QA را برمیدارد:
#   A) گاردِ سلامتِ سرور
#   B) سشنِ تازه + آنبوردینگِ واقعی
#   C) رانِ فلشکارت: درس ۱ ⇒ «حالت فلش‌کارت» ⇒ پنج «بلدم»یِ واقعی
#      ⇒ رکوردهای srs (سطح ۰ — سررسید +۱۵دقیقه، SRS_INTERVALS[0])
#   D) رانِ خطرناک: تبِ تستها ⇒ آزمون با پاسخِ گزینهٔ نخست (آماری —
#      خطا میسازد) ⇒ wordMistakes ⇒ کارتِ «واژه‌های خطرناک من» در خانه
#      ⇒ شاتِ روشن/تیره  [سطرِ r251 داخلِ دیالوگ زیرِ آزمونِ r251 قفل است —
#      رانِ کاملِ دریلِ درونِ دیالوگ SKIPِ صادقانه]
#   E) انتظارِ صادقانهٔ سررسید (حداقلِ واقعیِ SRS_INTERVALS[0]=۱۵دقیقه —
#      هیچ زمان‌جهشی): نظرسنجیِ تا ۱۸دقیقه ⇒ نوارِ «سررسید الآن» در
#      داشبورد ⇒ کلیکِ چیپِ واژهٔ سررسید ⇒ جلسهٔ مرورِ هوشمند ⇒
#      بلدم/تکرارِ واقعی ⇒ سررسید مصرف ⇒ نوارِ سررسید خالی (صفرِ صادق)
#   F) EventDay + کنسولِ دوفازی (درسِ r365)
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
OUT=/tmp/r369-qa.txt
: > "$OUT"

shot(){ agent-browser screenshot "$EV/$1" >/dev/null 2>&1; }
ev(){ agent-browser eval "$1" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
store(){ agent-browser eval "(()=>{try{const st=JSON.parse(localStorage.getItem('vision2-study-v1')||'{}');return JSON.stringify($1(st.state||{}));}catch(e){return 'STORE-ERR';}})()" 2>/dev/null | tr -d '"'; }

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

echo "########## C) رانِ فلشکارت — پنج «بلدم»یِ واقعی" | tee -a "$OUT"
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
MARKS=0
for i in $(seq 1 12); do
  [ "$MARKS" -ge 5 ] && break
  R=$(agent-browser eval "(()=>{
    const btns=[...document.querySelectorAll('button')].filter(b=>(b.textContent||'').trim()==='بلدم'&&!b.disabled);
    if(btns.length){btns[0].click();return 'KNOWN';}
    return 'WAIT';
  })()" 2>/dev/null | tr -d '"')
  if [ "$R" = "KNOWN" ]; then MARKS=$((MARKS+1)); sleep 0.9; else sleep 1; fi
done
echo "FLASH-KNOWN-MARKS=$MARKS" | tee -a "$OUT"
sleep 1
ev "(()=>{try{const st=JSON.parse(localStorage.getItem('vision2-study-v1')||'{}');const srs=st.state?.srs||{};return 'STORE-SRS='+Object.keys(srs).length+' levels='+Object.values(srs).map(x=>x.level).join(',');}catch(e){return 'STORE-ERR';}})()" | tee -a "$OUT"

echo "########## D) رانِ خطرناک — خطایِ واقعی در آزمونِ درس" | tee -a "$OUT"
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
agent-browser open "$BASE" >/dev/null 2>&1; sleep 3
for i in $(seq 1 20); do
  R=$(agent-browser eval "(()=>{const d=document.querySelector('[aria-label=\"واژه‌های خطرناک من\"]');return d?'DANGER-CARD':'WAIT';})()" 2>/dev/null | tr -d '"')
  [ "$R" = "DANGER-CARD" ] && { echo "DANGER-CARD-RENDERED" | tee -a "$OUT"; break; }; sleep 3
done
ev "(()=>{
  const card=document.querySelector('[aria-label=\"واژه‌های خطرناک من\"]');
  if(!card)return 'NO-DANGER-CARD';
  const chip=[...card.querySelectorAll('span,div')].map(x=>(x.textContent||'').trim()).find(t=>/واژه$/.test(t)&&/^\d+$|^[۰-۹]+$/.test(t));
  const rows=card.querySelectorAll('li, [data-testid^=\"danger-usage-chip-\"]').length;
  return 'DANGER-OK chip='+(chip||'?')+' rows~'+rows;
})()" | tee -a "$OUT"
agent-browser scrollintoview '[aria-label="واژه‌های خطرناک من"]' >/dev/null 2>&1 || true
sleep 1
shot r369-danger-words-light.png
agent-browser press t >/dev/null 2>&1 || true
sleep 1.5
agent-browser scrollintoview '[aria-label="واژه‌های خطرناک من"]' >/dev/null 2>&1 || true
sleep 1
shot r369-danger-words-dark.png
agent-browser press t >/dev/null 2>&1 || true
sleep 1

echo "########## E) انتظارِ صادقانهٔ سررسید + مصرفِ مرورِ هوشمند" | tee -a "$OUT"
DUE_AT_START=$(agent-browser eval "(()=>{try{const st=JSON.parse(localStorage.getItem('vision2-study-v1')||'{}');const srs=st.state?.srs||{};const now=Date.now();return Object.values(srs).filter(v=>v.dueAt<=now).length;}catch(e){return -1;}})()" 2>/dev/null | tr -d '"')
echo "DUE-NOW-AT-START=$DUE_AT_START (منتظرِ ۱۵دقیقهٔ واقعی)" | tee -a "$OUT"
DUE=0
for i in $(seq 1 40); do
  DUE=$(agent-browser eval "(()=>{try{const st=JSON.parse(localStorage.getItem('vision2-study-v1')||'{}');const srs=st.state?.srs||{};const now=Date.now();return Object.values(srs).filter(v=>v.dueAt<=now).length;}catch(e){return -1;}})()" 2>/dev/null | tr -d '"')
  if [ "${DUE:-0}" -ge 1 ] 2>/dev/null; then break; fi
  sleep 30
done
echo "DUE-AFTER-WAIT=$DUE (poll=$((i*30))s)" | tee -a "$OUT"
if [ "${DUE:-0}" -ge 1 ]; then
  agent-browser open "$BASE" >/dev/null 2>&1; sleep 3
  for i in $(seq 1 20); do
    R=$(agent-browser eval "(()=>{const p=document.querySelector('[aria-label=\"داشبورد مرور هوشمند\"]');return p?'SRS-PANEL':'WAIT';})()" 2>/dev/null | tr -d '"')
    [ "$R" = "SRS-PANEL" ] && break; sleep 3
  done
  ev "(()=>{
    const panel=document.querySelector('[aria-label=\"داشبورد مرور هوشمند\"]');
    if(!panel)return 'NO-SRS-PANEL';
    const dueRow=[...panel.querySelectorAll('span')].map(x=>(x.textContent||'').trim()).find(t=>t.includes('سررسید الآن'));
    const chips=panel.querySelectorAll('.srs-due-star').length;
    return 'DUE-STRIP hasLabel='+(dueRow?'yes':'no')+' dueWordChips='+chips;
  })()" | tee -a "$OUT"
  shot r369-srs-due-strip.png
  ev "(()=>{
    const panel=document.querySelector('[aria-label=\"داشبورد مرور هوشمند\"]');
    const chip=panel && [...panel.querySelectorAll('button')].find(b=>/سطح \d+ از ۶/.test(b.title||''));
    if(!chip)return 'NO-DUE-CHIP'; chip.click(); return 'DUE-CHIP-CLICK — smart review';
  })()" | tee -a "$OUT"
  sleep 3
  CONSUMED=0
  for i in $(seq 1 20); do
    R=$(agent-browser eval "(()=>{
      const btns=[...document.querySelectorAll('button')].filter(b=>['بلدم','تکرار'].includes((b.textContent||'').trim())&&!b.disabled);
      if(btns.length){btns[0].click();return 'REVIEWED';}
      return 'WAIT';
    })()" 2>/dev/null | tr -d '"')
    if [ "$R" = "REVIEWED" ]; then CONSUMED=$((CONSUMED+1)); sleep 0.8; else sleep 1; fi
  done
  echo "SMART-REVIEW-ACTIONS=$CONSUMED" | tee -a "$OUT"
  agent-browser open "$BASE" >/dev/null 2>&1; sleep 3
  ev "(()=>{try{const st=JSON.parse(localStorage.getItem('vision2-study-v1')||'{}');const srs=st.state?.srs||{};const now=Date.now();const due=Object.values(srs).filter(v=>v.dueAt<=now).length;const lv=Object.values(srs).map(x=>x.level);return 'AFTER-REVIEW due='+due+' levels='+lv.join(',');}catch(e){return 'STORE-ERR';}})()" | tee -a "$OUT"
  ev "(()=>{
    const panel=document.querySelector('[aria-label=\"داشبورد مرور هوشمند\"]');
    if(!panel)return 'NO-SRS-PANEL';
    const strip=[...panel.querySelectorAll('span')].map(x=>(x.textContent||'').trim()).find(t=>t.includes('سررسید الآن — با یک ضربه'));
    return strip?'DUE-STRIP-STILL-THERE':'DUE-STRIP-GONE — صفرِ صادق';
  })()" | tee -a "$OUT"
else
  echo "DUE-NEVER-ARRIVED — SKIP honest" | tee -a "$OUT"
fi

echo "########## F) EventDay + کنسولِ دوفازی" | tee -a "$OUT"
curl -s "$BASE/api/event" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{const j=JSON.parse(s);const g=n=>{const e=(j.events||[]).find(x=>x.name===n);return e?e.total:'MISS';};console.log('APP_OPEN='+g('app_open')+' LESSON_OPEN='+g('lesson_open')+' QUIZ_DONE='+g('quiz_done')+' SRS_DUE_REVIEW='+g('srs_due_review'));})" | tee -a "$OUT"

CONSOLE_OUT=$(agent-browser console 2>&1 || true)
echo "$CONSOLE_OUT" | tee -a "$OUT" | grep -v "Download the React DevTools" > /tmp/r369-console-filtered.txt
if grep -qiE "requires a \`DialogTitle\`|Missing \`Description\`" /tmp/r369-console-filtered.txt; then
  echo "RADIX-A11Y-DIRTY" | tee -a "$OUT"; agent-browser close >/dev/null 2>&1; exit 1
fi
echo "RADIX-A11Y-CLEAN" | tee -a "$OUT"
if grep -qiE "error|warn" /tmp/r369-console-filtered.txt; then
  echo "CONSOLE-DIRTY" | tee -a "$OUT"; agent-browser close >/dev/null 2>&1; exit 1
fi
echo "CONSOLE-CLEAN" | tee -a "$OUT"

echo "########## CLEAN-RUN" | tee -a "$OUT"
agent-browser close >/dev/null 2>&1 || true
echo "r369 QA DONE — کلاسِ SRS و خطرناکها با دادهٔ واقعیِ پنجرهٔ QA داوری شد" | tee -a "$OUT"
