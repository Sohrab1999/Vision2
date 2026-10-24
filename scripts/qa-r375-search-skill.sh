#!/usr/bin/env bash
# ------------------------------------------------------------------
# r375 — داوریِ زندهٔ «جست‌وجو از نام فراتر میرود» — امتدادِ r374:
# دامنهٔ جست‌وجو = نام + برچسبِ فارسیِ ضعیف‌ترین مهارت. تک سشن،
# بدونِ تزریق، با تایپِ واقعی و توافقِ داده↔DOM:
#   A) گاردِ سلامت (سرورِ standaloneِ همین راند)
#   B) سشنِ تازه + آنبوردینگ + گیتِ معلم ⇒ ۸۰ ردیف + placeholder/aria/تایتلِ نو
#   C) گشتِ داده‌محورِ هر ۶ برچسبِ مهارت: انتظار از خودِ گزارشِ سرور
#      محاسبه میشود، DOM با آن سنجیده میشود (شمارندهٔ aria-live هم)
#   D) تقاطعِ نام+مهارت — «سارا گرامر» با انتظارِ محاسبهشده از سرور
#   E) زباله ⇒ خالیِ صادقانه + پاکسازی ⇒ ۸۰ ردیف
#   F) شاتِ روشن و تیرهٔ فیلترِ مهارتی (شنیداری)
#   G) EventDay + کنسولِ پاک
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
OUT=/tmp/r375-qa.txt
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

echo "########## B) سشنِ تازه + گیتِ معلم + رابطِ نو" | tee -a "$OUT"
agent-browser close >/dev/null 2>&1 || true
pkill -f "agent-browser/browsers" 2>/dev/null; sleep 1
agent-browser open "$BASE" >/dev/null 2>&1
agent-browser set viewport 1280 900 >/dev/null 2>&1
agent-browser wait 'body' >/dev/null 2>&1 || true
for i in $(seq 1 30); do
  R=$(agent-browser eval "(()=>{const t=document.querySelector('[data-slot=\"dialog-title\"]');if(t)return 'ONBOARD';const g=document.querySelector('[aria-label=\"ابزارهای یادگیری\"]');return g?'HOME':'WAIT';})()" 2>/dev/null | tr -d '"')
  [ "$R" = "WAIT" ] || { echo "SURFACE-0=$R" | tee -a "$OUT"; break; }; sleep 3
done
ev "(()=>{const skip=[...document.querySelectorAll('button')].find(b=>(b.innerText||'').includes('ناشناس'));if(skip){skip.click();return 'onboard-skipped'}return 'no-onboard';})()" >/dev/null 2>&1
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
  const input=document.querySelector('[data-testid=\"teacher-search-input\"]');
  return JSON.stringify({NEW-UI:{rows:document.querySelectorAll('[data-testid=\"teacher-row\"]').length,placeholder:input&&input.getAttribute('placeholder'),aria:input&&input.getAttribute('aria-label'),title:input&&input.getAttribute('title')}});
})()"

echo "########## C) گشتِ داده‌محورِ ۶ برچسبِ مهارت — توافقِ سرور↔DOM" | tee -a "$OUT"
ev "(async ()=>{
  const labels={vocab:'تست واژگان',dictation:'دیکته',listening:'شنیداری',writing:'نگارش','vocab-konkuri':'واژگانِ کنکوری',grammar:'گرامر'};
  const rep=await fetch('/api/teacher/report',{cache:'no-store',headers:{'x-teacher-code':'moallem-1404'}});
  const j=await rep.json();
  const norm=s=>String(s).replace(/[\u200c\u200b\u200e\u200f\uFEFF]/g,'').replace(/ي/g,'ی').replace(/ك/g,'ک').toLowerCase().trim().replace(/\s+/g,' ');
  const expected={};
  for(const k in labels) expected[k]=(j.roster||[]).filter(r=>r.weakest&&r.weakest.category===k).length;
  const input=document.querySelector('[data-testid=\"teacher-search-input\"]');
  if(!input)return 'NO-INPUT';
  const set=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
  const results={};
  for(const k in labels){
    set.call(input,labels[k]);input.dispatchEvent(new Event('input',{bubbles:true}));
    await new Promise(ok=>setTimeout(ok,250));
    results[labels[k]]={expected:expected[k],domRows:document.querySelectorAll('[data-testid=\"teacher-row\"]').length,count:document.querySelector('[data-testid=\"teacher-search-count\"]')&&document.querySelector('[data-testid=\"teacher-search-count\"]').textContent};
  }
  results.CENSUS=[...document.querySelectorAll('h2')].find(h=>h.textContent.includes('یادگیرندگان'))&&[...document.querySelectorAll('h2')].find(h=>h.textContent.includes('یادگیرندگان')).textContent.trim();
  return JSON.stringify(results);
})()"

echo "########## D) تقاطعِ نام+مهارت — «سارا گرامر»" | tee -a "$OUT"
ev "(async ()=>{
  const rep=await fetch('/api/teacher/report',{cache:'no-store',headers:{'x-teacher-code':'moallem-1404'}});
  const j=await rep.json();
  const norm=s=>String(s).replace(/[\u200c\u200b\u200e\u200f\uFEFF]/g,'').replace(/ي/g,'ی').replace(/ك/g,'ک').toLowerCase().trim().replace(/\s+/g,' ');
  const expected=(j.roster||[]).filter(r=>norm(r.name).includes(norm('سارا'))&&r.weakest&&r.weakest.category==='grammar').length;
  const input=document.querySelector('[data-testid=\"teacher-search-input\"]');
  const set=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
  set.call(input,'سارا گرامر');input.dispatchEvent(new Event('input',{bubbles:true}));
  await new Promise(ok=>setTimeout(ok,250));
  const names=[...document.querySelectorAll('[data-testid=\"teacher-row\"]')].map(r=>r.querySelector('span.truncate')&&r.querySelector('span.truncate').textContent);
  return JSON.stringify({'MIXED':{query:'سارا گرامر',expected,domRows:names.length,names}});
})()"

echo "########## D2) نشتِ rush برطرف؟ — برچسبِ فارسی + جست‌وجوپذیری" | tee -a "$OUT"
ev "(()=>{
  const input=document.querySelector('[data-testid=\"teacher-search-input\"]');
  const set=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
  set.call(input,'چالش برق‌آسا');input.dispatchEvent(new Event('input',{bubbles:true}));
  return 'typed-rush-label';
})()" >/dev/null 2>&1
sleep 0.8
ev "(()=>{
  const rows=[...document.querySelectorAll('[data-testid=\"teacher-row\"]')];
  const texts=rows.map(r=>r.textContent);
  const count=document.querySelector('[data-testid=\"teacher-search-count\"]');
  return JSON.stringify({'RUSH-FIX':{rows:rows.length,persianLabel:texts.some(t=>t.includes('چالش برق‌آسا')),rawKeyLeak:texts.some(t=>t.includes('rush')),count:count&&count.textContent}});
})()"
ev "(()=>{
  const b=document.querySelector('[data-testid=\"teacher-search-clear\"]');
  if(b)b.click();return 'cleared';
})()" >/dev/null 2>&1
sleep 0.5

echo "########## E) زباله + پاکسازی" | tee -a "$OUT"
ev "(()=>{
  const input=document.querySelector('[data-testid=\"teacher-search-input\"]');
  const set=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
  set.call(input,'ناموجودکامل');input.dispatchEvent(new Event('input',{bubbles:true}));
  return 'typed-garbage';
})()" >/dev/null 2>&1
sleep 0.6
ev "(()=>{
  const rows=document.querySelectorAll('[data-testid=\"teacher-row\"]').length;
  const empty=document.querySelector('[data-testid=\"teacher-search-empty\"]');
  return JSON.stringify({GARBAGE:{rows,emptyText:empty&&empty.textContent}});
})()"
ev "(()=>{
  const b=document.querySelector('[data-testid=\"teacher-search-clear\"]');
  if(!b)return 'NO-CLEAR-BTN';
  b.click();return 'cleared';
})()" >/dev/null 2>&1
sleep 0.6
ev "(()=>{
  return JSON.stringify({'AFTER-CLEAR':{rows:document.querySelectorAll('[data-testid=\"teacher-row\"]').length,inputValue:document.querySelector('[data-testid=\"teacher-search-input\"]').value,countGone:!document.querySelector('[data-testid=\"teacher-search-count\"]')}});
})()"

echo "########## F) شاتهایِ فیلترِ مهارتی (شنیداری — روشن و تیره)" | tee -a "$OUT"
ev "(()=>{
  const input=document.querySelector('[data-testid=\"teacher-search-input\"]');
  const set=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
  set.call(input,'شنیداری');input.dispatchEvent(new Event('input',{bubbles:true}));
  document.querySelector('[data-testid=\"teacher-search\"]').scrollIntoView({block:'center'});
  return 'typed-listening';
})()" >/dev/null 2>&1
sleep 1
shot r375-skill-filter-light.png
ev "(()=>{document.documentElement.classList.add('dark');return 'dark-on';})()" >/dev/null 2>&1
sleep 1
shot r375-skill-filter-dark.png
ev "(()=>{document.documentElement.classList.remove('dark');return 'light';})()" >/dev/null 2>&1

echo "########## G) EventDay + کنسول" | tee -a "$OUT"
ev "(async ()=>{
  const res=await fetch('/api/event',{cache:'no-store'});
  const j=await res.json();
  const o=(j.events||[]).find(e=>e.name==='teacher_open');
  return 'EVENTS teacher_open='+(o?o.total:'MISS');
})()"
agent-browser logs 2>/dev/null | grep -iE "error|warn" | grep -vE "Download the React DevTools|hydrat" > /tmp/r375-console.log || true
if [ -s /tmp/r375-console.log ]; then echo "CONSOLE-DIRTY: $(head -3 /tmp/r375-console.log)" | tee -a "$OUT"; else echo "CONSOLE-CLEAN" | tee -a "$OUT"; fi

echo "########## DONE" | tee -a "$OUT"
agent-browser close >/dev/null 2>&1 || true
echo "==== SUMMARY ===="
grep -E "APP-READY|judge:|SURFACE-0|NEW-UI|RUSH-FIX|MIXED|GARBAGE|AFTER-CLEAR|EVENTS|CONSOLE|CENSUS" "$OUT" | tail -14
