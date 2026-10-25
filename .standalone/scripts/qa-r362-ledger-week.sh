#!/usr/bin/env bash
# ------------------------------------------------------------------
# r362 — داوریِ زندهٔ «هفتهٔ فعال» — تک سشن، دادهٔ واقعی (بدونِ تزریق):
#   A) پنلِ معلم با کدِ واقعی (moallem-1404) ⇒ فهرستِ زنده
#   B) نوارِ هفتروزی: «مجموعِ هفته: ۲» — ارقامِ فارسی از خودِ DBِ واقعی
#   C) کلیکِ دفترِ کامل ⇒ رهگیریِ blob ⇒ سطرهایِ «هفتهٔ فعال» و
#      «پرکارترینِ روز» با ارقامِ ASCIIِ گویشِ خانواده — صادره ←
#      هفته ← جدول؛ BOM؛ CRLF؛ نه handle و نه userId
#   D) سهسویِ حقیقت: گزارشِ سرور (curl) ↔ نوارِ پنل ↔ سطرِ دفتر —
#      هر سه از یک byDay میخوانند و باید مو به مو یکی باشند
#   E) EventDay: teacher_open=۱ + teacher_class_csv=۱ — کلاینت →
#      /api/event → دفتر، انتها-به-انتها
#   F) تیره/روشن — شاتها · G) کنسولِ پاک
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
OUT=/tmp/r362-qa.txt
: > "$OUT"

shot(){ agent-browser screenshot "$EV/$1" >/dev/null 2>&1; }
ev(){ agent-browser eval "$1" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

echo "########## A) گیتِ معلم با کدِ واقعی" | tee -a "$OUT"
agent-browser close >/dev/null 2>&1 || true
pkill -f "agent-browser/browsers" 2>/dev/null; sleep 1
agent-browser open "$BASE" >/dev/null 2>&1
agent-browser set viewport 1280 900 >/dev/null 2>&1
agent-browser wait 'body' >/dev/null 2>&1 || true
sleep 2
ev "(()=>{const b=document.querySelector('[data-pwa-dismiss]');if(b){b.click();return 'pwa-closed'}return 'no-bubble';})()" >/dev/null 2>&1
sleep 1
ev "(()=>{
  const skip=[...document.querySelectorAll('button')].find((b)=>(b.innerText||'').includes('ناشناس'));
  if(!skip)return 'NO-ONBOARDING';
  skip.click();return 'onboarding-skipped';})()" | tee -a "$OUT"; echo | tee -a "$OUT"
sleep 1
ev "(()=>{
  const trigger=document.querySelector('[aria-label=\"تنظیمات\"]');
  if(!trigger)return 'NO-SETTINGS-TRIGGER';
  trigger.click();return 'settings-open';})()" | tee -a "$OUT"; echo | tee -a "$OUT"
sleep 1
ev "(()=>{
  const row=document.querySelector('[aria-label*=\"گشودن پنل معلم\"]');
  if(!row)return 'NO-TEACHER-ROW';
  row.click();return 'teacher-nav';})()" | tee -a "$OUT"; echo | tee -a "$OUT"
sleep 2
ev "(()=>{
  const gate=document.querySelector('[data-testid=\"teacher-gate\"]');
  if(!gate)return 'NO-GATE';
  const input=document.querySelector('[data-testid=\"teacher-code-input\"]');
  const setter=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
  setter.call(input,'moallem-1404');
  input.dispatchEvent(new Event('input',{bubbles:true}));
  return 'CODE-TYPED';})()" | tee -a "$OUT"; echo | tee -a "$OUT"
ev "(()=>{
  const btn=[...document.querySelectorAll('button')].find((b)=>(b.innerText||'').includes('گشودنِ پنل'));
  if(!btn)return 'NO-SUBMIT';
  btn.click();return 'SUBMITTED';})()" | tee -a "$OUT"; echo | tee -a "$OUT"
sleep 2
ev "(()=>{return document.querySelector('[data-testid=\"teacher-ready\"]')?'PANEL-READY':'NOT-READY';})()" | tee -a "$OUT"
grep -q 'PANEL-READY' "$OUT" || { echo "PANEL-NEVER-READY" | tee -a "$OUT"; shot r362-fail.png; agent-browser close >/dev/null 2>&1; exit 1; }

echo "########## B) نوارِ هفتروزی: مجموعِ هفته با ارقامِ فارسی" | tee -a "$OUT"
ev "(()=>{
  const el=document.querySelector('[data-testid=\"teacher-week-total\"]');
  if(!el)return 'NO-WEEK-TOTAL';
  const strip=document.querySelector('[data-testid=\"teacher-strip\"]');
  return JSON.stringify({total:el.textContent, stripHasLabel:strip?strip.textContent.includes('مجموعِ هفته'):false});})()" | tee -a "$OUT"; echo | tee -a "$OUT"
grep -qF 'total\":\"۲\"' "$OUT" || { echo "STRIP-WEEK-TOTAL-WRONG" | tee -a "$OUT"; shot r362-fail-strip.png; agent-browser close >/dev/null 2>&1; exit 1; }
grep -q 'stripHasLabel\\":true' "$OUT" || { echo "STRIP-LABEL-MISSING" | tee -a "$OUT"; agent-browser close >/dev/null 2>&1; exit 1; }

echo "########## C) رهگیریِ blob + کلیکِ دفترِ کامل" | tee -a "$OUT"
ev "(()=>{
  window.__r362blob=null;
  const o=URL.createObjectURL.bind(URL);
  URL.createObjectURL=(b)=>{window.__r362blob=b;return o(b);};
  const btn=document.querySelector('[data-testid=\"teacher-ledger\"]');
  if(!btn)return 'NO-LEDGER-BTN';
  btn.click();return 'LEDGER-CLICKED';})()" | tee -a "$OUT"; echo | tee -a "$OUT"
sleep 3
ev "(async()=>{
  if(!window.__r362blob)return 'NO-BLOB-CAPTURED';
  const buf=new Uint8Array(await window.__r362blob.arrayBuffer());
  const txt=new TextDecoder('utf-8').decode(buf);
  const lines=txt.split('\r\n');
  const weekIdx=lines.findIndex((l)=>l.startsWith('هفتهٔ فعال,'));
  const busyIdx=lines.findIndex((l)=>l.startsWith('پرکارترینِ روز,'));
  const issuedIdx=lines.findIndex((l)=>l.startsWith('صادره,'));
  const classIdx=lines.findIndex((l)=>l.startsWith('نام,رنگ,تلاش'));
  return JSON.stringify({
    bytes:buf.length,
    bomBytes:[buf[0],buf[1],buf[2]].join(',')==='239,187,191',
    title:txt.includes('ویژن ۲ — دفترِ کلاسِ کامل'),
    weekRow:lines[weekIdx]||'MISSING',
    busiestRow:lines[busyIdx]||'MISSING',
    orderOk:issuedIdx>-1&&weekIdx>issuedIdx&&busyIdx>weekIdx&&classIdx>busyIdx,
    crlfOnly:!/(?<!\r)\n/.test(txt),
    noHandle:!txt.includes('aaaa')&&!txt.includes('handle'),
    noUserId:!txt.includes('userId')
  });
})()" | tee -a "$OUT"; echo | tee -a "$OUT"
grep -q 'bomBytes\\":true' "$OUT" || { echo "BOM-MISSING" | tee -a "$OUT"; agent-browser close >/dev/null 2>&1; exit 1; }
grep -q 'orderOk\\":true' "$OUT" || { echo "ORDER-BROKEN" | tee -a "$OUT"; agent-browser close >/dev/null 2>&1; exit 1; }
grep -q 'crlfOnly\\":true' "$OUT" || { echo "CRLF-BROKEN" | tee -a "$OUT"; agent-browser close >/dev/null 2>&1; exit 1; }
grep -q 'noHandle\\":true' "$OUT" || { echo "HANDLE-LEAK" | tee -a "$OUT"; agent-browser close >/dev/null 2>&1; exit 1; }
grep -q 'noUserId\\":true' "$OUT" || { echo "USERID-LEAK" | tee -a "$OUT"; agent-browser close >/dev/null 2>&1; exit 1; }
# دادهٔ واقعیِ این سرور: دو تلاشِ واقعیِ ۲۰۲۶-۱۰-۲۳ — سطرها باید موبهمو همین باشند
grep -q 'هفتهٔ فعال,2 تلاش در 7 روزِ اخیر · 1 روزِ فعال' "$OUT" || { echo "WEEK-ROW-WRONG" | tee -a "$OUT"; agent-browser close >/dev/null 2>&1; exit 1; }
grep -q 'پرکارترینِ روز,2026-10-23 · 2 تلاش' "$OUT" || { echo "BUSIEST-ROW-WRONG" | tee -a "$OUT"; agent-browser close >/dev/null 2>&1; exit 1; }

echo "########## D) سهسویِ حقیقت: گزارشِ سرور ↔ نوار ↔ دفتر" | tee -a "$OUT"
WEEK_FROM_SERVER=$(curl -s -H "x-teacher-code: moallem-1404" "$BASE/api/teacher/report" --max-time 15 | python3 -c "
import json,sys
d=json.load(sys.stdin)
b=d['summary']['byDay']
print(sum(x['attempts'] for x in b))")
echo "SERVER-WEEK-TOTAL=$WEEK_FROM_SERVER" | tee -a "$OUT"
grep -q 'SERVER-WEEK-TOTAL=2' "$OUT" || { echo "SERVER-WEEK-MISMATCH" | tee -a "$OUT"; agent-browser close >/dev/null 2>&1; exit 1; }
# نوار «۲» فارسی (بند B) و دفتر «2» ASCII (بند C) هر دو همین ۲ را میگویند — سهسو یکی

echo "########## E) توست + EventDay" | tee -a "$OUT"
ev "(()=>{
  const toasts=[...document.querySelectorAll('ol li')].map((t)=>t.textContent||'').join(' | ');
  return toasts?('TOASTS:'+toasts):'NO-TOAST';})()" | tee -a "$OUT"
grep -q 'دفترِ کاملِ کلاس ذخیره شد' "$OUT" || { echo "SUCCESS-TOAST-MISSING" | tee -a "$OUT"; agent-browser close >/dev/null 2>&1; exit 1; }
sleep 1
curl -s "$BASE/api/event" | python3 -c "
import json,sys
d=json.load(sys.stdin)
row={e['name']:e['total'] for e in d['events'] if e['name'] in ('teacher_open','teacher_class_csv')}
print('EVENTDAY='+json.dumps(row))" | tee -a "$OUT"
grep -qE 'EVENTDAY=.*"teacher_class_csv": [1-9]' "$OUT" || { echo "EVENTDAY-LEDGER-MISSING" | tee -a "$OUT"; agent-browser close >/dev/null 2>&1; exit 1; }
grep -qE 'EVENTDAY=.*"teacher_open": [1-9]' "$OUT" || { echo "EVENTDAY-OPEN-MISSING" | tee -a "$OUT"; agent-browser close >/dev/null 2>&1; exit 1; }

echo "########## F) تیره/روشن" | tee -a "$OUT"
ev "(()=>{const el=document.querySelector('[data-testid=\"teacher-cards\"]');if(!el)return 'NO-CARDS';el.scrollIntoView({block:'start'});document.documentElement.classList.add('dark');return 'dark';})()" >/dev/null 2>&1
sleep 1
shot r362-strip-dark.png
ev "(()=>{document.documentElement.classList.remove('dark');return 'light';})()" >/dev/null 2>&1
sleep 1
shot r362-strip-light.png
ev "(()=>{const el=document.querySelector('[data-testid=\"teacher-strip\"]');if(!el)return 'NO-STRIP';el.scrollIntoView({block:'center'});return 'strip-in-view';})()" >/dev/null 2>&1
sleep 1
shot r362-week-total.png

echo "########## G) کنسولِ پاک" | tee -a "$OUT"
agent-browser console 2>&1 | tee -a "$OUT" | grep -qiE "error|warn" && { echo "CONSOLE-DIRTY" | tee -a "$OUT"; agent-browser close >/dev/null 2>&1; exit 1; }
echo "CONSOLE-CLEAN" | tee -a "$OUT"

echo "########## CLEAN-RUN" | tee -a "$OUT"
agent-browser close >/dev/null 2>&1 || true
echo "r362 QA DONE — همهٔ دروازههایِ هفتهٔ فعال سبز" | tee -a "$OUT"
