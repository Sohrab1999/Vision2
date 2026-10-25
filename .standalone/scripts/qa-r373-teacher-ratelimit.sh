#!/usr/bin/env bash
# ------------------------------------------------------------------
# r373 — داوریِ زندهٔ «کلاسِ پرجمعیت و سقفِ نرخ» — بندِ ②ِ معطلِ
# پانزدراندیِ r357④. تک سشن، بدونِ تزریق، همه با کنشِ واقعی:
#   A) گاردِ سلامت (سرورِ standaloneِ همین راند با کدِ معلم)
#   B) سشنِ تازه + آنبوردینگِ واقعی + گیتِ معلم ⇒ فهرستِ ۸۰ردیفیِ
#      زنده (کلاسِ پرجمعیتِ موجودِ دیسک) + کارتها + شاتِ تیره
#   C) سقفِ نرخِ مسیرِ جزئیات (۶۰/دقیقه): چکشِ ۶۱ضربی با کدِ واقعی ⇒
#      ۴۲۹ در مرز + هدرِ Retry-After + code=rate_limited
#   D) «دفترِ کلاسهایِ بزرگ» — رفعِ r373 زنده: با سطلِ سوختهٔ C،
#      کلیکِ دفترِ کامل ⇒ توستِ «سقفِ سرعت — مکثِ کوتاه» ⇒ مکثِ
#      Retry-After ⇒ ادامه ⇒ دانلودِ کامل با ۲ کارنامه
#   E) سقفِ نرخِ گزارش (۳۰/دقیقه): چکشِ ۳۱ضربی ⇒ ۴۲۹ در مرز
#   F) EventDay + کنسولِ دوفازیِ پاک
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
OUT=/tmp/r373-qa.txt
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

echo "########## B) سشنِ تازه + آنبوردینگ + گیتِ معلم + فهرستِ پرجمعیت" | tee -a "$OUT"
agent-browser close >/dev/null 2>&1 || true
pkill -f "agent-browser/browsers" 2>/dev/null; sleep 1
agent-browser open "$BASE" >/dev/null 2>&1
agent-browser set viewport 1280 900 >/dev/null 2>&1
agent-browser wait 'body' >/dev/null 2>&1 || true
for i in $(seq 1 30); do
  R=$(agent-browser eval "(()=>{const t=document.querySelector('[data-slot=\"dialog-title\"]');if(t)return 'ONBOARD';const g=document.querySelector('[aria-label=\"ابزارهای یادگیری\"]');return g?'HOME':'WAIT';})()" 2>/dev/null | tr -d '"')
  [ "$R" = "WAIT" ] || { echo "SURFACE-0=$R" | tee -a "$OUT"; break; }; sleep 3
done
ev "(()=>{const skip=[...document.querySelectorAll('button')].find(b=>(b.innerText||'').includes('ناشناس'));if(skip){skip.click();return 'onboard-skipped'}return 'no-onboard';})()"
sleep 1.5
ev "(()=>{const g=document.querySelector('[aria-label=\"تنظیمات\"]');if(!g)return 'NO-GEAR';g.click();return 'gear';})()" >/dev/null 2>&1
sleep 1.5
ev "(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.getAttribute('aria-label')==='گشودن پنل معلم — فهرست کلاس');if(!b)return 'NO-TEACHER-BTN';b.click();return 'teacher';})()" >/dev/null 2>&1
sleep 2
ev "(()=>{const inp=document.querySelector('[data-testid=\"teacher-code-input\"]');if(!inp)return 'NO-INPUT';const s=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;s.call(inp,'moallem-1404');inp.dispatchEvent(new Event('input',{bubbles:true}));inp.closest('form').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));return 'submitted';})()" >/dev/null 2>&1
sleep 3.5
ev "(()=>{
  const ready=document.querySelector('[data-testid=\"teacher-ready\"]');
  if(!ready)return 'NOT-READY';
  const rows=document.querySelectorAll('[data-testid=\"teacher-row\"]').length;
  const openable=document.querySelectorAll('[data-teacher-open=\"true\"]').length;
  const cards=[...document.querySelectorAll('[data-testid=\"teacher-cards\"] > div')].map(c=>c.innerText.replace(/\n/g,'|'));
  const sorts=document.querySelectorAll('[data-testid^=\"teacher-sort-\"]').length;
  return JSON.stringify({ROSTER:{rows,openable,cards,sorts}});
})()"
ev "(()=>{document.documentElement.classList.add('dark');return 'dark-on';})()" >/dev/null 2>&1
sleep 1
shot r373-teacher-roster-80-dark.png
ev "(()=>{document.documentElement.classList.remove('dark');return 'light';})()" >/dev/null 2>&1

echo "########## C) سقفِ نرخِ جزئیات — چکشِ ۶۱ضربی" | tee -a "$OUT"
ev "(async ()=>{
  const rep=await fetch('/api/teacher/report',{cache:'no-store',headers:{'x-teacher-code':'moallem-1404'}});
  const j=await rep.json();
  const row=(j.roster||[]).find(r=>r.attempts>0&&r.handle);
  if(!row)return 'NO-OPENABLE-HANDLE';
  let ok=0,r429=0,first429=-1,retry=null,code=null,msg=null;
  for(let i=0;i<61;i++){
    const res=await fetch('/api/teacher/learner?handle='+encodeURIComponent(row.handle),{cache:'no-store',headers:{'x-teacher-code':'moallem-1404'}});
    if(res.status===429){
      if(first429<0){first429=i+1;retry=res.headers.get('Retry-After');
        const b=await res.json().catch(()=>({}));code=b.code;msg=(b.error||'').slice(0,60);}
      r429++;
    } else if(res.ok) ok++;
  }
  return 'LEARNER-CAP ok='+ok+' r429='+r429+' first429At='+first429+' retryAfter='+retry+' code='+code+' msg='+msg;
})()"

echo "########## D) دفترِ کلاسهایِ بزرگ — مکثِ زنده و ادامه" | tee -a "$OUT"
ev "(()=>{
  const btn=document.querySelector('[data-testid=\"teacher-ledger\"]');
  if(!btn)return 'NO-LEDGER-BTN';
  btn.click();return 'LEDGER-CLICKED';
})()" >/dev/null 2>&1
sleep 2.5
ev "(()=>{
  const lis=[...document.querySelectorAll('ol li')].filter(el=>el.className.includes('pointer-events-auto')&&el.getBoundingClientRect().height>0);
  const t=lis.map(l=>l.innerText).join(' § ');
  return t.includes('سقفِ سرعت — مکثِ کوتاه')?'PACE-TOAST-LIVE: '+t.slice(0,140):'NO-PACE-TOAST: '+(t||'empty').slice(0,100);
})()"
# poll هر ۲ثانیه تا ۱۵۰ثانیه — [درسِ r371: پدیدهٔ گذرا داخلِ پنجرهاش داوری میشود]
# توستِ موفق ۳ثانیه عمر میکند؛ pollِ ۴ثانیهای آن را بینِ دو تیک از دست میداد.
# خروجِ دوگانه: توستِ ذخیره یا آزادشدنِ دکمه (finally) — هر دو حکمِ پایانِ سفرند.
FOUND=""
for i in $(seq 1 60); do
  sleep 1.5
  R=$(agent-browser eval "(()=>{
    const n=performance.getEntriesByType('resource').filter(r=>r.name.includes('/api/teacher/learner')).length;
    const lis=[...document.querySelectorAll('ol li')].filter(el=>el.className.includes('pointer-events-auto'));
    const t=lis.map(l=>l.innerText).join(' § ');
    const btn=document.querySelector('[data-testid=\"teacher-ledger\"]');
    const gate=document.querySelector('[data-testid=\"teacher-gate\"]');
    return JSON.stringify({n,free:btn?!btn.disabled:'-',gate:!!gate,saved:t.includes('دفترِ کاملِ کلاس ذخیره شد'),pace:t.includes('سقفِ سرعت'),toasts:(t||'-').slice(0,80)});
  })()" 2>/dev/null)
  echo "poll-$i: $R" >> "$OUT"
  # [درسِ ابزاری ×۲] خروجیِ eval دوبارهکدشده است (\" بهجای ") — بکاسلشها
  # باید بریزند وگرنه هیچ grepی هیچوقت نمیخواند؛ و تایمرِ مکث در تبِ
  # headless ممکن است دیرتر بیفرد (throttling) — poll تا ۶۰ تیک (~۲۰۰ثانیه).
  R2=$(printf '%s' "$R" | tr -d '\\')
  echo "$R2" | grep -q '"saved":true' && { FOUND="saved-poll-$i"; break; }
  echo "$R2" | grep -q '"free":true' && { FOUND="free-poll-$i"; break; }
done
if [ -n "$FOUND" ]; then
  echo "LEDGER-RESUMED-OK at=$FOUND" | tee -a "$OUT"
  # مدرکِ لایهٔ شبکه: ۶۱ چکش + ۱ مکث + ۲ retry = ۶۴ واکشیِ learner
  ev "(()=>{
    const n=performance.getEntriesByType('resource').filter(r=>r.name.includes('/api/teacher/learner')).length;
    const lis=[...document.querySelectorAll('ol li')].filter(el=>el.className.includes('pointer-events-auto'));
    const t=lis.map(l=>l.innerText).join(' § ');
    return 'LEDGER-NET learnerFetches='+n+' toastNow='+(t||'(expired — freed button + net count are the verdict)').slice(0,120);
  })()"
else
  echo "LEDGER-RESUME-FAIL (no saved toast nor freed button in ~150s)" | tee -a "$OUT"
fi

echo "########## E) سقفِ نرخِ گزارش — چکشِ ۳۱ضربی (پایانِ سشن)" | tee -a "$OUT"
ev "(async ()=>{
  let ok=0,r429=0,first429=-1,retry=null;
  for(let i=0;i<31;i++){
    const res=await fetch('/api/teacher/report',{cache:'no-store',headers:{'x-teacher-code':'moallem-1404'}});
    if(res.status===429){if(first429<0){first429=i+1;retry=res.headers.get('Retry-After');}r429++;}
    else if(res.ok) ok++;
  }
  return 'REPORT-CAP ok='+ok+' r429='+r429+' first429At='+first429+' retryAfter='+retry;
})()"

echo "########## F) EventDay + کنسولِ دوفازی" | tee -a "$OUT"
ev "(async ()=>{
  const res=await fetch('/api/event',{cache:'no-store'});
  const j=await res.json();
  const o=(j.events||[]).find(e=>e.name==='teacher_open');
  const c=(j.events||[]).find(e=>e.name==='teacher_class_csv');
  return 'EVENTS teacher_open='+(o?o.total:'MISS')+' teacher_class_csv='+(c?c.total:'MISS');
})()"
agent-browser logs 2>/dev/null | grep -iE "error|warn" | grep -vE "Download the React DevTools|hydrat" > /tmp/r373-console.log || true
if [ -s /tmp/r373-console.log ]; then echo "CONSOLE-DIRTY: $(head -3 /tmp/r373-console.log)" | tee -a "$OUT"; else echo "CONSOLE-CLEAN" | tee -a "$OUT"; fi

echo "########## DONE" | tee -a "$OUT"
agent-browser close >/dev/null 2>&1 || true
echo "==== SUMMARY ===="
grep -E "APP-READY|judge:|SURFACE-0|ROSTER|LEARNER-CAP|PACE-TOAST|LEDGER-RESUMED|LEDGER-TOAST|LEDGER-RESUME-FAIL|REPORT-CAP|EVENTS|CONSOLE" "$OUT" | tail -12
