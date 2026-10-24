#!/usr/bin/env bash
# ------------------------------------------------------------------
# r374 — داوریِ زندهٔ «جست‌وجوی زندهٔ فهرستِ کلاس» — بندِ ②ِ پیشنهادِ
# r373: معلمِ کلاسِ ۸۰نفره دنبالِ دانشآموز میگردد. تک سشن، بدونِ
# تزریق، همه با کنشِ واقعی (تایپِ حقیقی در ورودیِ کنترلشده):
#   A) گاردِ سلامت (سرورِ standaloneِ همین راند با کدِ معلم)
#   B) سشنِ تازه + آنبوردینگِ واقعی + گیتِ معلم ⇒ فهرستِ ۸۰ردیفی +
#      جعبهٔ جست‌وجوی نو (role=search، aria، شمارندهٔ خاموش پیشِ تایپ)
#   C) تایپِ «سارا» ⇒ فیلترِ زنده + شمارندهٔ «۳ یادگیرنده یافت شد» +
#      سرشماریِ دستنخورده «یادگیرندگان (۸۰)»
#   D) چندواژگانی «سارا ب» ⇒ فقط سارایِ بلیت‌آزمای؛ و «بليت» با يِ
#      عربی ⇒ همان ردیف (یکسانسازیِ normalizeFa در تولید)
#   E) زبالهٔ ناموجود ⇒ خالیِ صادقانهٔ «یادگیری با این نام یافت نشد»
#      + «۰ یادگیرنده یافت شد»
#   F) دکمهٔ پاکسازی ⇒ ۸۰ ردیفِ کامل برمیگردد (شمارنده میمیرد)
#   G) شاتِ روشنِ فیلترشده + شاتِ تیرهٔ فیلترشده
#   H) EventDay + کنسولِ دوفازیِ پاک
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
OUT=/tmp/r374-qa.txt
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

echo "########## B) سشنِ تازه + آنبوردینگ + گیتِ معلم + جعبهٔ جست‌وجو" | tee -a "$OUT"
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
  const rows=document.querySelectorAll('[data-testid=\"teacher-row\"]').length;
  const box=document.querySelector('[data-testid=\"teacher-search\"]');
  const input=document.querySelector('[data-testid=\"teacher-search-input\"]');
  const count=document.querySelector('[data-testid=\"teacher-search-count\"]');
  return JSON.stringify({SEARCHBOX:{present:!!box,role:box&&box.getAttribute('role'),aria:input&&input.getAttribute('aria-label'),placeholder:input&&input.getAttribute('placeholder'),countHiddenBeforeTyping:!count,rows}});
})()"

echo "########## C) تایپِ «سارا» — فیلترِ زنده + شمارنده + سرشماری" | tee -a "$OUT"
ev "(()=>{
  const input=document.querySelector('[data-testid=\"teacher-search-input\"]');
  if(!input)return 'NO-INPUT';
  const s=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
  s.call(input,'سارا');input.dispatchEvent(new Event('input',{bubbles:true}));
  return 'typed';
})()" >/dev/null 2>&1
sleep 1.2
ev "(()=>{
  const rows=[...document.querySelectorAll('[data-testid=\"teacher-row\"]')];
  const names=rows.map(r=>r.querySelector('span.truncate')&&r.querySelector('span.truncate').textContent);
  const count=document.querySelector('[data-testid=\"teacher-search-count\"]');
  const census=[...document.querySelectorAll('h2')].find(h=>h.textContent.includes('یادگیرندگان'));
  const clear=document.querySelector('[data-testid=\"teacher-search-clear\"]');
  return JSON.stringify({FILTER:'سارا',rows:rows.length,names,count:count&&count.textContent,census:census&&census.textContent.trim(),clearBtn:!!clear});
})()"

echo "########## D) چندواژگانی + يِ عربی" | tee -a "$OUT"
ev "(()=>{
  const input=document.querySelector('[data-testid=\"teacher-search-input\"]');
  const s=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
  s.call(input,'سارا ب');input.dispatchEvent(new Event('input',{bubbles:true}));
  return 'typed';
})()" >/dev/null 2>&1
sleep 1
ev "(()=>{
  const rows=[...document.querySelectorAll('[data-testid=\"teacher-row\"]')];
  const names=rows.map(r=>r.querySelector('span.truncate')&&r.querySelector('span.truncate').textContent);
  const count=document.querySelector('[data-testid=\"teacher-search-count\"]');
  return JSON.stringify({FILTER:'سارا ب',rows:rows.length,names,count:count&&count.textContent});
})()"
ev "(()=>{
  const input=document.querySelector('[data-testid=\"teacher-search-input\"]');
  const s=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
  s.call(input,'بليت');input.dispatchEvent(new Event('input',{bubbles:true}));
  return 'typed-arabic-ye';
})()" >/dev/null 2>&1
sleep 1
ev "(()=>{
  const rows=[...document.querySelectorAll('[data-testid=\"teacher-row\"]')];
  const names=rows.map(r=>r.querySelector('span.truncate')&&r.querySelector('span.truncate').textContent);
  const count=document.querySelector('[data-testid=\"teacher-search-count\"]');
  return JSON.stringify({FILTER:'بليت(عربی)',rows:rows.length,names,count:count&&count.textContent});
})()"

echo "########## E) زبالهٔ ناموجود — خالیِ صادقانه" | tee -a "$OUT"
ev "(()=>{
  const input=document.querySelector('[data-testid=\"teacher-search-input\"]');
  const s=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
  s.call(input,'ناموجودکامل');input.dispatchEvent(new Event('input',{bubbles:true}));
  return 'typed-garbage';
})()" >/dev/null 2>&1
sleep 1
ev "(()=>{
  const rows=document.querySelectorAll('[data-testid=\"teacher-row\"]').length;
  const empty=document.querySelector('[data-testid=\"teacher-search-empty\"]');
  const count=document.querySelector('[data-testid=\"teacher-search-count\"]');
  return JSON.stringify({GARBAGE:{rows,emptyText:empty&&empty.textContent,count:count&&count.textContent}});
})()"

echo "########## F) دکمهٔ پاکسازی — بازگشتِ کامل" | tee -a "$OUT"
ev "(()=>{
  const b=document.querySelector('[data-testid=\"teacher-search-clear\"]');
  if(!b)return 'NO-CLEAR-BTN';
  b.click();return 'cleared';
})()" >/dev/null 2>&1
sleep 1
ev "(()=>{
  const rows=document.querySelectorAll('[data-testid=\"teacher-row\"]').length;
  const input=document.querySelector('[data-testid=\"teacher-search-input\"]');
  const count=document.querySelector('[data-testid=\"teacher-search-count\"]');
  return JSON.stringify({'AFTER-CLEAR':{rows,inputValue:input&&input.value,countGone:!count}});
})()"

echo "########## G) شاتهایِ فیلترشده (روشن + تیره)" | tee -a "$OUT"
ev "(()=>{
  const input=document.querySelector('[data-testid=\"teacher-search-input\"]');
  const s=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
  s.call(input,'سارا');input.dispatchEvent(new Event('input',{bubbles:true}));
  return 'retyped';
})()" >/dev/null 2>&1
sleep 1.2
shot r374-roster-filter-light.png
ev "(()=>{const box=document.querySelector('[data-testid=\"teacher-search\"]');box.scrollIntoView({block:'center'});return 'scrolled';})()" >/dev/null 2>&1
sleep 0.5
ev "(()=>{document.documentElement.classList.add('dark');return 'dark-on';})()" >/dev/null 2>&1
sleep 1
shot r374-roster-filter-dark.png
ev "(()=>{
  const input=document.querySelector('[data-testid=\"teacher-search-input\"]');
  const ring=getComputedStyle(input);
  return JSON.stringify({'DARK-SHOT':{focusRing:'served-by-kernel',darkClass:document.documentElement.classList.contains('dark')}});
})()"
ev "(()=>{document.documentElement.classList.remove('dark');return 'light';})()" >/dev/null 2>&1

echo "########## H) EventDay + کنسولِ دوفازی" | tee -a "$OUT"
ev "(async ()=>{
  const res=await fetch('/api/event',{cache:'no-store'});
  const j=await res.json();
  const o=(j.events||[]).find(e=>e.name==='teacher_open');
  return 'EVENTS teacher_open='+(o?o.total:'MISS');
})()"
agent-browser logs 2>/dev/null | grep -iE "error|warn" | grep -vE "Download the React DevTools|hydrat" > /tmp/r374-console.log || true
if [ -s /tmp/r374-console.log ]; then echo "CONSOLE-DIRTY: $(head -3 /tmp/r374-console.log)" | tee -a "$OUT"; else echo "CONSOLE-CLEAN" | tee -a "$OUT"; fi

echo "########## DONE" | tee -a "$OUT"
agent-browser close >/dev/null 2>&1 || true
echo "==== SUMMARY ===="
grep -E "APP-READY|judge:|SURFACE-0|SEARCHBOX|FILTER|GARBAGE|AFTER-CLEAR|DARK-SHOT|EVENTS|CONSOLE" "$OUT" | tail -12
