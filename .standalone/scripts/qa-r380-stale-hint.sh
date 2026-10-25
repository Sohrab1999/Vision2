#!/usr/bin/env bash
# ------------------------------------------------------------------
# r380 — داوریِ زندهٔ «درِ صداقتِ کهنگیِ گزارش» (بندِ ②ِ پیشنهادِ r379):
#   A) buildِ تولیدیِ همین راند (سورس عوض شده) + ریاستارت + داورِ دستنخورده
#   B) پنلِ تازه: گزارشِ رسیده < ۵ دقیقه ⇒ هشدارِ کهنگی غایب — رضایتِ
#      داده‌محور با سنِ واقعیِ generatedAtِ سرور
#   C) پیرشدنِ واقعی: پنلِ بیطرف ۶ دقیقه — تیکِ مؤدبِ ۶۰ث برچسب را نو
#      میکند؛ پیمایشِ هر ۲۰ث تا ظهورِ هشدار با متنِ دقیقش
#   D) شاتِ روشن + شاتِ تیره با هشدارِ زنده
#   E) رفرشِ گزارش ⇒ هشدارِ فوریِ خاموش — شیءِ نو، درِ نو
#   F) EventDay (فقط teacher_open — تیکِ ۶۰ث صفر رویداد) + کنسولِ پاک
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
OUT=/tmp/r380-qa.txt
: > "$OUT"

shot(){ agent-browser screenshot "$EV/$1" >/dev/null 2>&1; }
ev(){ agent-browser eval "$1" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

echo "########## A) buildِ تولیدیِ همین راند + ریاستارت" | tee -a "$OUT"
cd /home/z/my-project
bun run build > /tmp/r380-build.log 2>&1 && echo "BUILD-OK" | tee -a "$OUT" || { echo "BUILD-FAILED" | tee -a "$OUT"; tail -5 /tmp/r380-build.log | tee -a "$OUT"; exit 1; }
pkill -f "bun .next/standalone/server.js" 2>/dev/null; sleep 2
DATABASE_URL="file:/home/z/my-project/db/custom.db" TEACHER_ACCESS_CODE=moallem-1404 \
  setsid nohup bun .next/standalone/server.js > /home/z/my-project/scripts/app-server.log 2>&1 &
C="000"
for i in $(seq 1 30); do sleep 3; C=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/" 2>/dev/null); [ "$C" = "200" ] && break; done
echo "APP-READY code=$C" | tee -a "$OUT"
curl -s -o /dev/null -w "judge:%{http_code}\n" http://127.0.0.1:3003/ 2>/dev/null | tee -a "$OUT"

echo "########## B) پنلِ تازه — گزارشِ تازه ⇒ هشدارِ غایب" | tee -a "$OUT"
agent-browser close >/dev/null 2>&1 || true
pkill -f "agent-browser/browsers" 2>/dev/null; sleep 1
agent-browser open "$BASE" >/dev/null 2>&1
agent-browser set viewport 1280 900 >/dev/null 2>&1
agent-browser wait 'body' >/dev/null 2>&1 || true
for i in $(seq 1 30); do
  R=$(agent-browser eval "(()=>{const t=document.querySelector('[data-slot=\"dialog-title\"]');if(t)return 'ONBOARD';const g=document.querySelector('[aria-label=\"ابزارهای یادگیری\"]');return g?'HOME':'WAIT';})()" 2>/dev/null | tr -d '"')
  [ "$R" = "WAIT" ] || { echo "SURFACE-0=$R" | tee -a "$OUT"; break; }; sleep 3
done
ev "(()=>{const skip=[...document.querySelectorAll('button')].find(b=>(b.innerText||'').includes('ناشناس'));if(skip){skip.click();return 'skipped'}return 'no-onboard';})()" >/dev/null 2>&1
sleep 1.5
ev "(()=>{const g=document.querySelector('[aria-label=\"تنظیمات\"]');if(!g)return 'NO-GEAR';g.click();return 'gear';})()" >/dev/null 2>&1
sleep 1.5
ev "(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.getAttribute('aria-label')==='گشودن پنل معلم — فهرست کلاس');if(!b)return 'NO-BTN';b.click();return 'teacher';})()" >/dev/null 2>&1
sleep 2
ev "(()=>{const inp=document.querySelector('[data-testid=\"teacher-code-input\"]');if(!inp)return 'NO-INPUT';const s=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;s.call(inp,'moallem-1404');inp.dispatchEvent(new Event('input',{bubbles:true}));inp.closest('form').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));return 'submitted';})()" >/dev/null 2>&1
sleep 3.5
ev "(async ()=>{
  const ready=document.querySelector('[data-testid=\"teacher-ready\"]');
  if(!ready)return 'NOT-READY';
  const res=await fetch('/api/teacher/report',{cache:'no-store',headers:{'x-teacher-code':'moallem-1404'}});
  const j=await res.json();
  const ageMin=Math.round((Date.now()-Date.parse(j.generatedAt))/60000*10)/10;
  const hint=document.querySelector('[data-testid=\"teacher-stale-hint\"]');
  const rows=document.querySelectorAll('[data-testid=\"teacher-row\"]').length;
  return JSON.stringify({FRESH:{reportAgeMin:ageMin,hintAbsent:!hint,rows}});
})()"

echo "########## C) پیرشدنِ واقعی — ۶ دقیقه بیطرفی؛ تیکِ ۶۰ث مؤدب" | tee -a "$OUT"
echo "(idle 360s — polling from 330s)" | tee -a "$OUT"
sleep 330
FOUND="no"
for i in $(seq 1 12); do
  R=$(agent-browser eval "(()=>{const h=document.querySelector('[data-testid=\"teacher-stale-hint\"]');return h?('HINT:'+(h.textContent||'').trim()):'NO-HINT';})()" 2>/dev/null | tr -d '"')
  echo "poll#$i $R" | tee -a "$OUT"
  case "$R" in HINT:*) FOUND="yes"; break ;; esac
  sleep 20
done
echo "STALE-HINT-APPEARED=$FOUND" | tee -a "$OUT"

echo "########## D) شاتهایِ هشدارِ زنده (روشن + تیره)" | tee -a "$OUT"
shot r380-stale-hint-light.png
ev "(()=>{document.documentElement.classList.add('dark');return 'dark';})()" >/dev/null 2>&1
sleep 1.2
shot r380-stale-hint-dark.png
ev "(()=>{document.documentElement.classList.remove('dark');return 'light';})()" >/dev/null 2>&1
sleep 1

echo "########## E) رفرش ⇒ هشدارِ فوریِ خاموش" | tee -a "$OUT"
ev "(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.getAttribute('aria-label')==='به‌روزرسانی گزارش');if(!b)return 'NO-REFRESH';b.click();return 'refresh-clicked';})()" >/dev/null 2>&1
sleep 3
ev "(async ()=>{
  const hint=document.querySelector('[data-testid=\"teacher-stale-hint\"]');
  const ready=document.querySelector('[data-testid=\"teacher-ready\"]');
  const res=await fetch('/api/teacher/report',{cache:'no-store',headers:{'x-teacher-code':'moallem-1404'}});
  const j=await res.json();
  const ageMin=Math.round((Date.now()-Date.parse(j.generatedAt))/60000*10)/10;
  const rows=document.querySelectorAll('[data-testid=\"teacher-row\"]').length;
  return JSON.stringify({AFTER_REFRESH:{hintGone:!hint,ready:!!ready,newReportAgeMin:ageMin,rows}});
})()"

echo "########## F) EventDay + کنسولِ پاک" | tee -a "$OUT"
ev "(async ()=>{
  const res=await fetch('/api/event',{cache:'no-store'});
  const j=await res.json();
  const names=['teacher_open','teacher_csv','teacher_detail'];
  const out={};
  for(const n of names){const e=(j.events||[]).find(x=>x.name===n);out[n]=e?e.total:0;}
  return 'EVENTS '+JSON.stringify(out);
})()"
agent-browser logs 2>/dev/null | grep -iE "error|warn" | grep -vE "Download the React DevTools|hydrat" > /tmp/r380-console.log || true
if [ -s /tmp/r380-console.log ]; then echo "CONSOLE-DIRTY: $(head -3 /tmp/r380-console.log)" | tee -a "$OUT"; else echo "CONSOLE-CLEAN" | tee -a "$OUT"; fi

echo "########## DONE" | tee -a "$OUT"
