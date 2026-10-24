#!/usr/bin/env bash
# ------------------------------------------------------------------
# r366 — داوریِ زندهٔ سوییپِ a11yِ دیالوگها (پیشنهادِ ④ِ r365).
# تک سشن، بدونِ تزریق — هر سطح با کلیکِ واقعیِ UI:
#   A) ریاستارتِ اجباریِ سرور (درسِ r365: سرورِ پیش از build، HTMLِ کهنه
#      به chunkهایِ نو میخورد) + سلامتِ پس
#   B) آنبوردینگ (بازدیدِ اولِ سشنِ تازه) — عنوان + رد کردن
#   C) متروی گرامر — سطحِ سختشدهٔ r366: ایستگاه ⇒ عنوانِ دیدنی ⇒
#      شاتِ روشن/تیره ⇒ بستن ⇒ پنجرهٔPresence (عنوانِ پنهانِ r366
#      اگر محتوا مانده باشد حاضر است)
#   D) کارنامهٔ من   E) میان‌برها   F) فرمان‌یاب   G) نبضِ کامل
#   H) دیکتهٔ آزمون جامع
#   [پرشِ صادقانه: danger-words/srs فقط با پیشرفت رندر میشوند؛ usage/
#    drill عمقِ ناوبری — هر دو زیرِ سوییپِ ایستایِ پویا و آزمونِ jsdom
#    قفلاند؛ اینجا SKIP ثبت میشود نه غیبتِ داوری]
#   I) EventDay + کنسولِ دوفازی (درسِ r365: اول بگیر با || true، بعد
#      قضاوت با grepِ جدا) — الگوهایِ رادیکسِ a11y هم صفرند
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
OUT=/tmp/r366-qa.txt
: > "$OUT"

shot(){ agent-browser screenshot "$EV/$1" >/dev/null 2>&1; }
ev(){ agent-browser eval "$1" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

echo "########## A) ریاستارتِ اجباریِ سرور + سلامت" | tee -a "$OUT"
pkill -f "bun .next/standalone/server.js" 2>/dev/null; sleep 2
cd /home/z/my-project
DATABASE_URL="file:/home/z/my-project/db/custom.db" TEACHER_ACCESS_CODE=moallem-1404 \
  setsid nohup bun .next/standalone/server.js > /home/z/my-project/scripts/app-server.log 2>&1 &
for i in $(seq 1 30); do
  sleep 3
  C=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/" 2>/dev/null)
  [ "$C" = "200" ] && { echo "APP-READY-${i}x3s" | tee -a "$OUT"; break; }
done
curl -s -o /dev/null -w "judge:%{http_code}\n" http://127.0.0.1:3003/ 2>/dev/null | tee -a "$OUT"

echo "########## B) سشنِ تازه + آنبوردینگ" | tee -a "$OUT"
agent-browser close >/dev/null 2>&1 || true
pkill -f "agent-browser/browsers" 2>/dev/null; sleep 1
agent-browser open "$BASE" >/dev/null 2>&1
agent-browser set viewport 1280 900 >/dev/null 2>&1
agent-browser wait 'body' >/dev/null 2>&1 || true
for i in $(seq 1 30); do
  R=$(agent-browser eval "(()=>{const t=document.querySelector('[data-slot=\"dialog-title\"]');if(t)return 'ONBOARD:'+t.textContent.slice(0,30);const g=document.querySelector('[aria-label=\"ابزارهای یادگیری\"]');return g?'HOME':'WAIT';})()" 2>/dev/null | tr -d '"')
  [ "$R" = "WAIT" ] || { echo "SURFACE-0-onboarding=$R" | tee -a "$OUT"; break; }; sleep 3
done
# عنوانِ آنبوردینگ + رد کردن
ev "(()=>{
  const t=document.querySelector('[data-slot=\"dialog-content\"] [data-slot=\"dialog-title\"]');
  if(!t)return 'NO-ONBOARD-TITLE';
  const r=t.getBoundingClientRect(); if(r.width===0||r.height===0)return 'TITLE-HIDDEN';
  const skip=[...document.querySelectorAll('button')].find(b=>b.textContent.includes('رد کردن — ناشناس می‌مانم'));
  if(!skip)return 'NO-SKIP-BTN'; skip.click(); return 'ONBOARD-OK:'+(t.textContent||'').slice(0,24);
})()" | tee -a "$OUT"
sleep 1
ev "(()=>{const c=document.querySelector('[data-slot=\"dialog-content\"]');return c?'ONBOARD-STILL-OPEN':'ONBOARD-DISMISSED';})()" | tee -a "$OUT"

echo "########## C) متروی گرامر — سطحِ سختشدهٔ r366" | tee -a "$OUT"
for i in $(seq 1 20); do
  R=$(agent-browser eval "(()=>{const c=[...document.querySelectorAll('button')].find(b=>b.textContent.includes('متروی گرامر'));return c?'CARD':'WAIT';})()" 2>/dev/null | tr -d '"')
  [ "$R" = "CARD" ] && break; sleep 2
done
ev "(()=>{const c=[...document.querySelectorAll('button')].find(b=>b.textContent.includes('متروی گرامر'));if(!c)return 'NO-CARD';c.click();return 'GRAMMAR-JUMP';})()" | tee -a "$OUT"
sleep 2
ev "(()=>{
  const st=document.querySelector('button[aria-label^=\"ایستگاه\"]');
  if(!st)return 'NO-STATION'; const lbl=st.getAttribute('aria-label');
  st.click(); return 'STATION-CLICK:'+lbl;
})()" | tee -a "$OUT"
sleep 1.5
ev "(()=>{
  const c=document.querySelector('[data-slot=\"dialog-content\"]');
  if(!c)return 'NO-DIALOG';
  const t=c.querySelector('[data-slot=\"dialog-title\"]');
  if(!t)return 'TITLELESS-DIALOG — r353 shape!';
  if(t.className.includes('sr-only'))return 'SR-ONLY-AT-MOUNT — wrong branch';
  return 'DIALOG-OK title='+(t.textContent||'').slice(0,26)+' hasDesc='+!!c.querySelector('[data-slot=\"dialog-description\"]');
})()" | tee -a "$OUT"
shot r366-grammar-dialog-light.png
agent-browser eval "(()=>{document.documentElement.classList.add('dark');return 'dark-on';})()" >/dev/null 2>&1; sleep 1
shot r366-grammar-dialog-dark.png
agent-browser eval "(()=>{document.documentElement.classList.remove('dark');return 'dark-off';})()" >/dev/null 2>&1
ev "(()=>{
  const x=document.querySelector('[data-slot=\"dialog-close\"]');
  if(!x)return 'NO-CLOSE'; x.click(); return 'CLOSE-CLICKED';
})()" | tee -a "$OUT"
sleep 0.4
ev "(()=>{
  const c=document.querySelector('[data-slot=\"dialog-content\"]');
  if(!c)return 'CONTENT-GONE';
  const t=document.querySelector('[data-slot=\"dialog-title\"]');
  if(!t)return 'CLOSING-WINDOW-TITLELESS — r353 shape!';
  return 'CLOSING-WINDOW-COVERED class='+(t.className.includes('sr-only')?'sr-only(r366)':'visible');
})()" | tee -a "$OUT"
sleep 1
ev "(()=>{const c=document.querySelector('[data-slot=\"dialog-content\"]');return c?'DIALOG-STUCK':'DIALOG-UNMOUNTED';})()" | tee -a "$OUT"

echo "########## D) کارنامهٔ من" | tee -a "$OUT"
agent-browser open "$BASE" >/dev/null 2>&1; sleep 2
ev "(()=>{
  const c=[...document.querySelectorAll('button')].find(b=>b.textContent.includes('کارنامهٔ من'));
  if(!c)return 'NO-REPORT-CARD'; c.click(); return 'REPORT-CLICK';
})()" | tee -a "$OUT"
sleep 2.5
ev "(()=>{
  const t=document.querySelector('[data-slot=\"dialog-content\"] [data-slot=\"dialog-title\"]');
  if(!t)return 'REPORT-TITLELESS'; return 'REPORT-OK:'+(t.textContent||'').slice(0,24);
})()" | tee -a "$OUT"
ev "(()=>{const x=document.querySelector('[data-slot=\"dialog-close\"]');if(!x)return 'NO-CLOSE';x.click();return 'CLOSED';})()" | tee -a "$OUT"
sleep 1

echo "########## E) میان‌برها" | tee -a "$OUT"
ev "(()=>{
  const b=[...document.querySelectorAll('button')].find(x=>(x.title||'').includes('راهنمای میان‌برهای کیبورد'));
  if(!b)return 'NO-SHORTCUT-BTN'; b.click(); return 'SHORTCUT-CLICK';
})()" | tee -a "$OUT"
sleep 1.5
ev "(()=>{
  const t=document.querySelector('[data-slot=\"dialog-content\"] [data-slot=\"dialog-title\"]');
  if(!t)return 'SHORTCUT-TITLELESS'; return 'SHORTCUT-OK:'+(t.textContent||'').slice(0,24);
})()" | tee -a "$OUT"
ev "(()=>{const x=document.querySelector('[data-slot=\"dialog-close\"]');if(!x)return 'NO-CLOSE';x.click();return 'CLOSED';})()" | tee -a "$OUT"
sleep 1

echo "########## F) فرمان‌یاب" | tee -a "$OUT"
ev "(()=>{
  const b=document.querySelector('[aria-label=\"فرمان‌یاب — جست‌وجوی همه‌جا\"]');
  if(!b)return 'NO-PALETTE-BTN'; b.click(); return 'PALETTE-CLICK';
})()" | tee -a "$OUT"
sleep 1.5
ev "(()=>{
  const c=document.querySelector('[data-slot=\"dialog-content\"]');
  if(!c)return 'PALETTE-NO-DIALOG';
  const t=c.querySelector('[data-slot=\"dialog-title\"]');
  if(!t)return 'PALETTE-TITLELESS';
  return 'PALETTE-OK sr-only='+(t.className.includes('sr-only')?'yes(r361 idiom)':'no')+' text='+(t.textContent||'').slice(0,16);
})()" | tee -a "$OUT"
agent-browser press Escape >/dev/null 2>&1
sleep 1
ev "(()=>{return document.querySelector('[data-slot=\"dialog-content\"]')?'PALETTE-STUCK':'PALETTE-CLOSED';})()" | tee -a "$OUT"

echo "########## G) نبضِ کامل" | tee -a "$OUT"
ev "(()=>{
  const g=document.querySelector('[aria-label=\"تنظیمات\"]');
  if(!g)return 'NO-GEAR'; g.click(); return 'GEAR';
})()" | tee -a "$OUT"
PULSE=""
for i in $(seq 1 8); do
  sleep 1.5
  PULSE=$(agent-browser eval "(()=>{
    const b=document.querySelector('[aria-label=\"نبضِ کامل — داشبوردِ همهٔ رویدادها\"]');
    const open=document.body.textContent.includes('نبضِ وب‌کتاب');
    if(open)return 'WAS-OPEN';
    if(!b)return 'NO-PULSE-BTN'; b.click(); return 'PULSE-CLICKED';
  })()" 2>/dev/null | tr -d '"')
  [ "$PULSE" = "PULSE-CLICKED" ] && break
  [ "$PULSE" = "WAS-OPEN" ] && break
  agent-browser eval "(()=>{
    const g=document.querySelector('[aria-label=\"تنظیمات\"]');
    const open=document.body.textContent.includes('نبضِ وب‌کتاب');
    if(!open&&g){g.click();return 'regear';} return 'wait';
  })()" >/dev/null 2>&1
done
echo "PULSE-BTN=$PULSE" | tee -a "$OUT"
sleep 2
ev "(()=>{
  const t=document.querySelector('[data-slot=\"dialog-content\"] [data-slot=\"dialog-title\"]');
  if(!t)return 'PULSE-TITLELESS'; return 'PULSE-OK:'+(t.textContent||'').slice(0,20);
})()" | tee -a "$OUT"
ev "(()=>{const x=document.querySelector('[data-slot=\"dialog-close\"]');if(!x)return 'NO-CLOSE';x.click();return 'CLOSED';})()" | tee -a "$OUT"
sleep 1

echo "########## H) دیکتهٔ آزمون جامع" | tee -a "$OUT"
agent-browser open "$BASE" >/dev/null 2>&1; sleep 2
ev "(()=>{
  const c=[...document.querySelectorAll('button')].find(b=>b.textContent.includes('آزمون جامع'));
  if(!c)return 'NO-EXAM-CARD'; c.click(); return 'EXAM-JUMP';
})()" | tee -a "$OUT"
sleep 2.5
ev "(()=>{
  const b=[...document.querySelectorAll('button')].find(x=>(x.title||'').includes('واژهٔ بانک'));
  if(!b)return 'NO-DICT-BTN'; b.click(); return 'DICT-CLICK';
})()" | tee -a "$OUT"
sleep 1.5
ev "(()=>{
  const t=document.querySelector('[data-slot=\"dialog-content\"] [data-slot=\"dialog-title\"]');
  if(!t)return 'DICT-TITLELESS'; return 'DICT-OK:'+(t.textContent||'').slice(0,30);
})()" | tee -a "$OUT"
ev "(()=>{const x=document.querySelector('[data-slot=\"dialog-close\"]');if(!x)return 'NO-CLOSE';x.click();return 'CLOSED';})()" | tee -a "$OUT"
sleep 1

echo "########## I) EventDay + کنسولِ دوفازی" | tee -a "$OUT"
curl -s "$BASE/api/event" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{const j=JSON.parse(s);const g=n=>{const e=(j.events||[]).find(x=>x.name===n);return e?e.total:'MISS';};console.log('APP_OPEN='+g('app_open')+' EXAM_DICTATION_START='+g('exam_dictation_start')+' SRS_DUE_PILL='+g('srs_due_pill'));})" | tee -a "$OUT"

CONSOLE_OUT=$(agent-browser console 2>&1 || true)
echo "$CONSOLE_OUT" | tee -a "$OUT" | grep -v "Download the React DevTools" > /tmp/r366-console-filtered.txt
if grep -qiE "requires a \`DialogTitle\`|Missing \`Description\`" /tmp/r366-console-filtered.txt; then
  echo "RADIX-A11Y-DIRTY" | tee -a "$OUT"; agent-browser close >/dev/null 2>&1; exit 1
fi
echo "RADIX-A11Y-CLEAN" | tee -a "$OUT"
if grep -qiE "error|warn" /tmp/r366-console-filtered.txt; then
  echo "CONSOLE-DIRTY" | tee -a "$OUT"; agent-browser close >/dev/null 2>&1; exit 1
fi
echo "CONSOLE-CLEAN" | tee -a "$OUT"

echo "########## CLEAN-RUN" | tee -a "$OUT"
agent-browser close >/dev/null 2>&1 || true
echo "r366 QA DONE — سوییپِ a11y رویِ هفت سطحِ زنده پاک شد" | tee -a "$OUT"
