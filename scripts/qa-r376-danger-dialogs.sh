#!/usr/bin/env bash
# ------------------------------------------------------------------
# r376 — «کلاسِ درس، سه دیالوگِ هدفمندِ کارتِ خطرناکها را داوری
# میکند» — بندِ ③ِ معطلِ سه‌راندیِ r372: فلش‌کارت / تمرین / دیکتهٔ
# «همین‌ها» تا امروز هرگز با کنشِ واقعی داوری نشده بودند. تک سشن،
# بدونِ تزریق، همه با کلیک/تایپِ حقیقی:
#   A) گاردِ سلامت (سرورِ standaloneِ همین راند)
#   B) سشنِ تازه + آنبوردینگِ واقعی
#   C) دو رانِ کاملِ آزمونِ ترکیبی (انتخابگرهایِ اثباتشدهٔ r369c) ⇒
#      دادهٔ پیاپا ⇒ QUALIFIED ≥ ۴
#   D) کارتِ خطرناکها پُر رویِ خانه + نقشهٔ fa→en (برایِ دیکتهٔ بیصدا)
#   E) دیالوگِ فلش‌کارت: عنوان + چیپهایِ درس + برگرداندنِ واقعی +
#      «بلدم» + پیشرویِ شمارنده + نوشتنِ SRS رویِ همان کلید
#   F) دیالوگِ تمرین: QuizEngineِ واژه‌های خطرناک — پاسخِ کاملِ همهٔ
#      پرسشها با انتخابگرهایِ r364 ⇒ نتیجه در دیالوگ ⇒ بازگشت
#   G) دیالوگِ دیکته: گیتِ حداقل باز است؛ رانِ واقعی با نگاشتِ fa→en
#      (بیصدا اما درست) ⇒ «آفرین! املا درست است» ⇒ پیشروی؛ بستنِ
#      میانهٔ ران ⇒ بازگشایی ⇒ setupِ تازه ⇒ بازگشت
#   H) شاتهایِ روشن/تیرهٔ هر سه دیالوگ
#   I) EventDay + کنسولِ دوفازیِ پاک
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
OUT=/tmp/r376-qa.txt
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

echo "########## B) سشنِ تازه + آنبوردینگ" | tee -a "$OUT"
agent-browser close >/dev/null 2>&1 || true
pkill -f "agent-browser/browsers" 2>/dev/null; sleep 1
agent-browser open "$BASE" >/dev/null 2>&1
agent-browser set viewport 1280 900 >/dev/null 2>&1
agent-browser wait 'body' >/dev/null 2>&1 || true
for i in $(seq 1 30); do
  R=$(agent-browser eval "(()=>{const t=document.querySelector('[data-slot=\"dialog-title\"]');if(t)return 'ONBOARD';const g=document.querySelector('[aria-label=\"ابزارهای یادگیری\"]');return g?'HOME':'WAIT';})()" 2>/dev/null | tr -d '"')
  [ "$R" = "WAIT" ] || { echo "SURFACE-0=$R" | tee -a "$OUT"; break; }; sleep 3
done
ev "(()=>{const skip=[...document.querySelectorAll('button')].find(b=>b.textContent.includes('رد کردن — ناشناس می‌مانم'));if(!skip)return 'NO-SKIP-BTN';skip.click();return 'ONBOARD-OK';})()" >/dev/null 2>&1
sleep 1

echo "########## C) دو رانِ آزمونِ ترکیبی — دادهٔ پیاپا (r369c)" | tee -a "$OUT"
for RUN in 1 2; do
  ev "(()=>{
    const btn=[...document.querySelectorAll('button')].find(b=>(b.textContent||'').trim()==='ورود به درس');
    if(!btn)return 'NO-ENTER-LESSON'; btn.click(); return 'LESSON-R$RUN';
  })()" >/dev/null 2>&1
  sleep 3
  ev "(()=>{
    const tab=[...document.querySelectorAll('button')].find(b=>(b.textContent||'').trim()==='تست‌ها'||(b.getAttribute('aria-label')||'').includes('تست‌ها'));
    if(!tab)return 'NO-TESTS-TAB'; tab.click(); return 'TESTS-R$RUN';
  })()" >/dev/null 2>&1
  sleep 2
  ev "(()=>{
    const start=[...document.querySelectorAll('button')].find(b=>/شروع تست|تست ترکیبی/.test(b.textContent||'')&&!b.disabled);
    if(!start)return 'NO-QUIZ-START'; start.click(); return 'QUIZ-R$RUN';
  })()" >/dev/null 2>&1
  sleep 2
  WAITS=0
  for i in $(seq 1 45); do
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
  ev "(()=>{try{const st=JSON.parse(localStorage.getItem('vision2-study-v1')||'{}');return 'AFTER-R$RUN mistakes='+Object.keys(st.state?.wordMistakes||{}).length+' seen='+Object.keys(st.state?.wordSeen||{}).length;}catch(e){return 'STORE-ERR';}})()" | tee -a "$OUT"
  agent-browser open "$BASE" >/dev/null 2>&1; sleep 3
done
ev "(()=>{try{const st=JSON.parse(localStorage.getItem('vision2-study-v1')||'{}');const wm=st.state?.wordMistakes||{};const ws=st.state?.wordSeen||{};const q=Object.keys(wm).filter(k=>(ws[k]??0)>=2||(wm[k]??0)>=2);return 'QUALIFIED='+q.length+' seen='+Object.keys(ws).length;}catch(e){return 'STORE-ERR';}})()" | tee -a "$OUT"

echo "########## D) کارتِ پُر + نقشهٔ fa→en" | tee -a "$OUT"
for i in $(seq 1 20); do
  R=$(agent-browser eval "(()=>{const d=document.querySelector('[aria-label=\"واژه‌های خطرناک من\"]');return d?(d.textContent.includes('ثبت نشده')?'EMPTY':'FILLED'):'WAIT';})()" 2>/dev/null | tr -d '"')
  [ "$R" = "FILLED" ] && { echo "DANGER-CARD-FILLED" | tee -a "$OUT"; break; }
  [ "$R" = "EMPTY" ] && { echo "DANGER-CARD-STILL-EMPTY" | tee -a "$OUT"; break; }
  sleep 3
done
ev "(()=>{
  const card=document.querySelector('[aria-label=\"واژه‌های خطرناک من\"]');
  if(!card)return 'NO-CARD';
  const chip=card.querySelector('h2 span');
  const rows=[...card.querySelectorAll('li')].slice(0,12).map(li=>{
    const en=li.querySelector('.en-text');
    const fa=li.querySelector('.truncate:not(.en-text)');
    return en&&fa?(fa.textContent.trim()+'='+en.textContent.trim()):null;
  }).filter(Boolean);
  const dictBtn=[...card.querySelectorAll('button')].find(b=>(b.textContent||'').includes('دیکتهٔ همین‌ها'));
  return JSON.stringify({DANGER-MAP:{chip:chip&&chip.textContent,rows,dictDisabled:dictBtn?dictBtn.disabled:null}});
})()"

echo "########## E) دیالوگِ فلش‌کارت — برگرداندن + بلدم + SRS" | tee -a "$OUT"
SRS_BEFORE=$(agent-browser eval "(()=>{try{const st=JSON.parse(localStorage.getItem('vision2-study-v1')||'{}');return String(Object.keys(st.state?.srs||{}).length);}catch(e){return 'ERR'}})()" 2>/dev/null | tr -d '"')
ev "(()=>{
  const card=document.querySelector('[aria-label=\"واژه‌های خطرناک من\"]');
  const b=[...card.querySelectorAll('button')].find(x=>(x.textContent||'').includes('فلش‌کارت همین‌ها'));
  if(!b)return 'NO-FLASH-BTN'; b.click(); return 'flash-clicked';
})()" >/dev/null 2>&1
sleep 2
ev "(()=>{
  const dlg=document.querySelector('[data-slot=\"dialog-content\"]');
  if(!dlg)return 'NO-DIALOG';
  const title=dlg.querySelector('[data-slot=\"dialog-title\"]');
  const chips=[...dlg.querySelectorAll('button')].filter(b=>/درس/.test(b.textContent||'')).map(b=>b.textContent.trim());
  const counter=[...dlg.querySelectorAll('span')].find(s=>/کارت [۰-۹]+ از/.test(s.textContent||''));
  const flip=dlg.querySelector('[aria-label=\"برگرداندن کارت\"]');
  if(!flip)return 'NO-FLIP';
  const frontEn=dlg.querySelector('.en-text');
  flip.click();
  return JSON.stringify({'FLASH-OPEN':{title:title&&title.textContent,chips,counter:counter&&counter.textContent,front:frontEn&&frontEn.textContent.trim(),flipped:true}});
})()"
sleep 1
shot r376-flashcards-open.png
ev "(()=>{
  const dlg=document.querySelector('[data-slot=\"dialog-content\"]');
  if(!dlg)return 'NO-DIALOG';
  const back=[...dlg.querySelectorAll('div')].find(d=>/معنی|fa/.test(d.className||'')&&d.textContent.trim().length>0);
  const known=[...dlg.querySelectorAll('button')].find(b=>(b.textContent||'').trim()==='بلدم');
  if(!known)return 'NO-KNOWN-BTN';
  known.click();
  return 'known-clicked';
})()" >/dev/null 2>&1
sleep 1.2
ev "(()=>{
  const dlg=document.querySelector('[data-slot=\"dialog-content\"]');
  if(!dlg)return 'DIALOG-GONE-AFTER-KNOWN';
  const counter=[...dlg.querySelectorAll('span')].find(s=>/کارت [۰-۹]+ از/.test(s.textContent||''));
  return 'AFTER-KNOWN counter='+(counter?counter.textContent.trim():'NONE');
})()"
ev "(()=>{try{const st=JSON.parse(localStorage.getItem('vision2-study-v1')||'{}');return 'SRS-KEYS='+Object.keys(st.state?.srs||{}).length;}catch(e){return 'STORE-ERR';}})()" | tee -a "$OUT"
echo "SRS-BEFORE=$SRS_BEFORE" | tee -a "$OUT"
ev "(()=>{const x=document.querySelector('[data-slot=\"dialog-close\"]');if(!x)return 'NO-CLOSE';x.click();return 'closed';})()" >/dev/null 2>&1
sleep 1
ev "(()=>{return document.querySelector('[data-slot=\"dialog-content\"]')?'DIALOG-STILL-OPEN':'FLASH-DIALOG-CLOSED';})()" | tee -a "$OUT"

echo "########## F) دیالوگِ تمرین — QuizEngineِ کامل" | tee -a "$OUT"
ev "(()=>{
  const card=document.querySelector('[aria-label=\"واژه‌های خطرناک من\"]');
  const b=[...card.querySelectorAll('button')].find(x=>(x.textContent||'').includes('تمرین همین‌ها'));
  if(!b)return 'NO-PRACTICE-BTN'; b.click(); return 'practice-clicked';
})()" >/dev/null 2>&1
sleep 2.5
ev "(()=>{
  const dlg=document.querySelector('[data-slot=\"dialog-content\"]');
  if(!dlg)return 'NO-DIALOG';
  const title=dlg.querySelector('[data-slot=\"dialog-title\"]');
  const qt=[...dlg.querySelectorAll('div,span,h3')].find(e=>(e.textContent||'').trim()==='واژه‌های خطرناک من');
  const q=dlg.querySelector('[data-quiz-option]');
  return JSON.stringify({'PRACTICE-OPEN':{title:title&&title.textContent,engineTitle:!!qt,hasQuestion:!!q}});
})()"
PROG=0
for i in $(seq 1 40); do
  R=$(agent-browser eval "(()=>{
    const dlg=document.querySelector('[data-slot=\"dialog-content\"]');
    if(!dlg)return 'gone';
    const next=dlg.querySelector('[data-quiz-next]');
    if(next&&!next.disabled){next.click();return 'next';}
    const opts=[...dlg.querySelectorAll('[data-quiz-option]')].filter(o=>!o.disabled&&o.offsetParent!==null);
    if(opts.length){opts[0].click();return 'answered';}
    const back=[...dlg.querySelectorAll('button')].find(b=>(b.textContent||'').trim()==='بازگشت');
    if(back)return 'result';
    return 'waiting';
  })()" 2>/dev/null | tr -d '"')
  if [ "$R" = "result" ]; then echo "PRACTICE-RESULT-REACHED steps=$PROG" | tee -a "$OUT"; break; fi
  if [ "$R" = "waiting" ]; then PROG=$((PROG+1)); [ $PROG -ge 6 ] && { echo "PRACTICE-STALLED" | tee -a "$OUT"; break; }; else PROG=0; fi
  if [ "$R" = "gone" ]; then echo "PRACTICE-DIALOG-GONE" | tee -a "$OUT"; break; fi
  sleep 0.8
done
ev "(()=>{
  const dlg=document.querySelector('[data-slot=\"dialog-content\"]');
  if(!dlg)return 'NO-DIALOG';
  const pct=[...dlg.querySelectorAll('*')].map(e=>e.textContent||'').find(t=>/٪/.test(t)&&t.length<30);
  const back=[...dlg.querySelectorAll('button')].find(b=>(b.textContent||'').trim()==='بازگشت');
  if(!back)return 'NO-BACK-BTN';
  back.click();
  return JSON.stringify({'PRACTICE-RESULT':{pct:!!pct,back:true}});
})()" >/dev/null 2>&1
sleep 1.2
ev "(()=>{return document.querySelector('[data-slot=\"dialog-content\"]')?'PRACTICE-STILL-OPEN':'PRACTICE-DIALOG-CLOSED';})()" | tee -a "$OUT"
ev "(()=>{try{const st=JSON.parse(localStorage.getItem('vision2-study-v1')||'{}');return 'PRACTICE-RESULTS='+JSON.stringify(Object.keys(st.state?.results||{}).filter(k=>k.includes('danger')));}catch(e){return 'STORE-ERR';}})()" | tee -a "$OUT"

echo "########## G) دیالوگِ دیکته — نگاشتِ fa→en بیصدا اما درست" | tee -a "$OUT"
ev "(()=>{
  const card=document.querySelector('[aria-label=\"واژه‌های خطرناک من\"]');
  const b=[...card.querySelectorAll('button')].find(x=>(x.textContent||'').includes('دیکتهٔ همین‌ها'));
  if(!b)return 'NO-DICT-BTN';
  if(b.disabled)return 'DICT-DISABLED';
  b.click();return 'dict-clicked';
})()" >/dev/null 2>&1
sleep 2
ev "(()=>{
  const dlg=document.querySelector('[data-slot=\"dialog-content\"]');
  if(!dlg)return 'NO-DIALOG';
  const title=dlg.querySelector('[data-slot=\"dialog-title\"]');
  const h3=[...dlg.querySelectorAll('h3')].find(e=>(e.textContent||'').includes('آزمون دیکته'));
  const start=[...dlg.querySelectorAll('button')].find(b=>(b.textContent||'').includes('شروع دیکته'));
  if(!start)return 'NO-START';
  start.click();
  return JSON.stringify({'DICT-SETUP':{title:title&&title.textContent,setup:h3?h3.textContent.trim():null,started:true}});
})()"
sleep 2.5
ev "(()=>{
  const dlg=document.querySelector('[data-slot=\"dialog-content\"]');
  if(!dlg)return 'NO-DIALOG';
  const inp=dlg.querySelector('input');
  const audioErr=[...dlg.querySelectorAll('div')].find(d=>(d.textContent||'').includes('روخوانی در دسترس نیست'));
  const faEl=[...dlg.querySelectorAll('div.text-2xl')];
  const fa=faEl.length?faEl[0].textContent.trim():null;
  const prog=[...dlg.querySelectorAll('span')].find(s=>/از/.test(s.textContent||'')&&/[۰-۹]/.test(s.textContent||''));
  return JSON.stringify({'DICT-PLAY':{hasInput:!!inp,honestAudioError:!!audioErr,faMeaning:fa,progress:prog&&prog.textContent.trim()}});
})()"

echo "########## G2) پاسخِ درستِ واقعی — fa→en از نقشهٔ کارت" | tee -a "$OUT"
ev "(()=>{
  const dlg=document.querySelector('[data-slot=\"dialog-content\"]');
  if(!dlg)return 'NO-DIALOG';
  const faEl=dlg.querySelector('div.text-2xl');
  if(!faEl)return 'NO-FA';
  const fa=faEl.textContent.trim();
  const card=document.querySelector('[aria-label=\"واژه‌های خطرناک من\"]');
  let en=null;
  for(const li of card.querySelectorAll('li')){
    const e=li.querySelector('.en-text');const f=li.querySelector('.truncate:not(.en-text)');
    if(e&&f&&f.textContent.trim()===fa){en=e.textContent.trim();break;}
  }
  if(!en)return 'NO-MAP-FOR:'+fa;
  const inp=dlg.querySelector('input');
  if(!inp)return 'NO-INPUT';
  const set=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
  set.call(inp,en);inp.dispatchEvent(new Event('input',{bubbles:true}));
  const check=[...dlg.querySelectorAll('button')].find(b=>(b.textContent||'').includes('بررسی'));
  if(!check)return 'NO-CHECK'; check.click();
  return 'TYPED='+en;
})()" | tee -a "$OUT"
sleep 1
ev "(()=>{
  const dlg=document.querySelector('[data-slot=\"dialog-content\"]');
  if(!dlg)return 'NO-DIALOG';
  const ok=[...dlg.querySelectorAll('div')].find(d=>(d.textContent||'').includes('آفرین! املا درست است'));
  const half=[...dlg.querySelectorAll('span')].find(s=>(s.textContent||'').includes('با راهنما'));
  return JSON.stringify({'DICT-CORRECT':{praised:!!ok,halfCredit:!!half}});
})()"
shot r376-dictation-correct.png
sleep 1.5
ev "(()=>{
  const dlg=document.querySelector('[data-slot=\"dialog-content\"]');
  if(!dlg)return 'NO-DIALOG';
  const prog=[...dlg.querySelectorAll('span')].find(s=>/از/.test(s.textContent||'')&&/[۰-۹]/.test(s.textContent||''));
  return 'AFTER-ADVANCE progress='+(prog?prog.textContent.trim():'NONE');
})()" | tee -a "$OUT"
ev "(()=>{const x=document.querySelector('[data-slot=\"dialog-close\"]');if(!x)return 'NO-CLOSE';x.click();return 'closed-mid-round';})()" >/dev/null 2>&1
sleep 1
ev "(()=>{
  const gone=!document.querySelector('[data-slot=\"dialog-content\"]');
  if(!gone)return 'STILL-OPEN';
  const card=document.querySelector('[aria-label=\"واژه‌های خطرناک من\"]');
  const b=[...card.querySelectorAll('button')].find(x=>(x.textContent||'').includes('دیکتهٔ همین‌ها'));
  b.click();
  return 'reopened';
})()" >/dev/null 2>&1
sleep 1.5
ev "(()=>{
  const dlg=document.querySelector('[data-slot=\"dialog-content\"]');
  if(!dlg)return 'NO-DIALOG';
  const h3=[...dlg.querySelectorAll('h3')].find(e=>(e.textContent||'').includes('آزمون دیکته'));
  const back=[...dlg.querySelectorAll('button')].find(b=>(b.textContent||'').trim()==='بازگشت');
  if(!back)return 'NO-BACK';
  back.click();
  return JSON.stringify({'DICT-REOPEN':{freshSetup:!!h3,backExits:true}});
})()"
sleep 1
ev "(()=>{return document.querySelector('[data-slot=\"dialog-content\"]')?'DICT-STILL-OPEN':'DICT-DIALOG-CLOSED';})()" | tee -a "$OUT"

echo "########## H) شاتهایِ تیرهٔ دیالوگِ تمرین" | tee -a "$OUT"
ev "(()=>{
  const card=document.querySelector('[aria-label=\"واژه‌های خطرناک من\"]');
  const b=[...card.querySelectorAll('button')].find(x=>(x.textContent||'').includes('تمرین همین‌ها'));
  if(!b)return 'NO-PRACTICE-BTN'; b.click(); return 'reopened';
})()" >/dev/null 2>&1
sleep 2
ev "(()=>{document.documentElement.classList.add('dark');return 'dark-on';})()" >/dev/null 2>&1
sleep 1
shot r376-practice-dark.png
ev "(()=>{const x=document.querySelector('[data-slot=\"dialog-close\"]');if(x)x.click();return 'closed';})()" >/dev/null 2>&1
ev "(()=>{document.documentElement.classList.remove('dark');return 'light';})()" >/dev/null 2>&1

echo "########## I) EventDay + کنسول" | tee -a "$OUT"
ev "(async ()=>{
  const res=await fetch('/api/event',{cache:'no-store'});
  const j=await res.json();
  const names=['danger_flashcards','danger_practice','danger_dictation_start'];
  return 'EVENTS '+names.map(n=>{const e=(j.events||[]).find(x=>x.name===n);return n+'='+(e?e.total:'MISS');}).join(' ');
})()"
agent-browser logs 2>/dev/null | grep -iE "error|warn" | grep -vE "Download the React DevTools|hydrat" > /tmp/r376-console.log || true
if [ -s /tmp/r376-console.log ]; then echo "CONSOLE-DIRTY: $(head -5 /tmp/r376-console.log)" | tee -a "$OUT"; else echo "CONSOLE-CLEAN" | tee -a "$OUT"; fi

echo "########## DONE" | tee -a "$OUT"
agent-browser close >/dev/null 2>&1 || true
echo "==== SUMMARY ===="
grep -E "APP-READY|judge:|SURFACE-0|AFTER-R|QUALIFIED|DANGER-CARD|DANGER-MAP|FLASH-OPEN|AFTER-KNOWN|SRS-KEYS|SRS-BEFORE|FLASH-DIALOG-CLOSED|PRACTICE-OPEN|PRACTICE-RESULT|PRACTICE-DIALOG-CLOSED|PRACTICE-RESULTS|DICT-SETUP|DICT-PLAY|TYPED|DICT-CORRECT|AFTER-ADVANCE|DICT-REOPEN|DICT-DIALOG-CLOSED|EVENTS|CONSOLE" "$OUT" | tail -24
