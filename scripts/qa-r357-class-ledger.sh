#!/usr/bin/env bash
# ------------------------------------------------------------------
# r357 — داوریِ زندهٔ «دفترِ کلاسِ کامل» — تک سشن، دادهٔ واقعی:
#   A) پنلِ معلم با کدِ واقعی (moallem-1404) ⇒ فهرستِ زنده
#   B) کلیکِ دفترِ کامل ⇒ واکشِ پیاپیِ کارنامههایِ ردیفهایِ دارایِ
#      تلاش (به ترتیبِ فهرست) ⇒ دانلود ⇒ توستِ موفق
#   C) اثباتِ بایتی: blobیِ دانلودشده همان لحظه رهگیری میشود — BOMِ
#      EF BB BF، عنوانِ دفتر، تعدادِ کارنامهها، نامهایِ واقعی، نه
#      handle و نه userId
#   D) EventDay: teacher_class_csv=۱ — کلاینت → /api/event → دفتر،
#      انتها-به-انتها
#   E) تیره/روشن — شاتها · F) کنسولِ پاک
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
OUT=/tmp/r357-qa.txt
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
# تازهوارد ⇒ جریانِ شخصیسازی اول بسته میشود (درسِ دیسک: تنظیمات زیرِ آنبوردینگ باز نمیشود)
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
# ردیفِ معلم با aria-label (متنیِ ردیف «فهرستِ کلاس» است — ZWNJِ برچسبِ فارسیِ نما grep را میشکند)
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
grep -q 'PANEL-READY' "$OUT" || { echo "PANEL-NEVER-READY" | tee -a "$OUT"; shot r357-fail.png; agent-browser close >/dev/null 2>&1; exit 1; }

echo "########## B) رهگیریِ blob + کلیکِ دفترِ کامل" | tee -a "$OUT"
ev "(()=>{
  window.__r357blob=null; window.__r357revoke=URL.revokeObjectURL;
  URL.revokeObjectURL=()=>{};
  const o=URL.createObjectURL.bind(URL);
  URL.createObjectURL=(b)=>{window.__r357blob=b;return o(b);};
  const btn=document.querySelector('[data-testid=\"teacher-ledger\"]');
  if(!btn)return 'NO-LEDGER-BTN';
  btn.click();return 'LEDGER-CLICKED';})()" | tee -a "$OUT"; echo | tee -a "$OUT"
sleep 3
ev "(async()=>{
  if(!window.__r357blob)return 'NO-BLOB-CAPTURED';
  // درسِ r354: Blob.text() خودِ BOM را میبلعد — اثبات فقط بایتی است
  const buf=new Uint8Array(await window.__r357blob.arrayBuffer());
  const txt=new TextDecoder('utf-8').decode(buf);
  const cards=(txt.match(/کارنامهٔ یادگیرنده/g)||[]).length;
  return JSON.stringify({
    bytes:buf.length,
    bomBytes:[buf[0],buf[1],buf[2]].join(',')==='239,187,191',
    title:txt.includes('ویژن ۲ — دفترِ کلاسِ کامل'),
    issued:txt.includes('صادره,'),
    rosterHeader:txt.includes('نام,رنگ,تلاش,میانگین'),
    cards:cards,
    crlfOnly:!/(?<!\r)\n/.test(txt),
    noHandle:!txt.includes('aaaa')&&!txt.includes('handle'),
    noUserId:!txt.includes('userId')
  });
})()" | tee -a "$OUT"; echo | tee -a "$OUT"
grep -q 'bomBytes\\":true' "$OUT" || { echo "BOM-MISSING" | tee -a "$OUT"; agent-browser close >/dev/null 2>&1; exit 1; }
grep -q 'title\\":true' "$OUT" || { echo "TITLE-MISSING" | tee -a "$OUT"; agent-browser close >/dev/null 2>&1; exit 1; }
grep -q 'rosterHeader\\":true' "$OUT" || { echo "ROSTER-HEADER-MISSING" | tee -a "$OUT"; agent-browser close >/dev/null 2>&1; exit 1; }
grep -q 'crlfOnly\\":true' "$OUT" || { echo "CRLF-BROKEN" | tee -a "$OUT"; agent-browser close >/dev/null 2>&1; exit 1; }
grep -q 'noHandle\\":true' "$OUT" || { echo "HANDLE-LEAK" | tee -a "$OUT"; agent-browser close >/dev/null 2>&1; exit 1; }
grep -q 'noUserId\\":true' "$OUT" || { echo "USERID-LEAK" | tee -a "$OUT"; agent-browser close >/dev/null 2>&1; exit 1; }

echo "########## C) توست + EventDay" | tee -a "$OUT"
ev "(()=>{
  const toasts=[...document.querySelectorAll('ol li')].map((t)=>t.textContent||'').join(' | ');
  return toasts?('TOASTS:'+toasts):'NO-TOAST';})()" | tee -a "$OUT"
grep -q 'دفترِ کاملِ کلاس ذخیره شد' "$OUT" || { echo "SUCCESS-TOAST-MISSING" | tee -a "$OUT"; agent-browser close >/dev/null 2>&1; exit 1; }
sleep 1
curl -s "http://127.0.0.1:3000/api/event" | python3 -c "
import json,sys
d=json.load(sys.stdin)
row=[e for e in d['events'] if e['name']=='teacher_class_csv']
print('EVENTDAY-teacher_class_csv='+json.dumps(row))" | tee -a "$OUT"
grep -qE 'teacher_class_csv.*"total": [1-9]+' "$OUT" || { echo "EVENTDAY-MISSING" | tee -a "$OUT"; agent-browser close >/dev/null 2>&1; exit 1; }

echo "########## D) تیره/روشن" | tee -a "$OUT"
agent-browser eval "(()=>{const el=document.querySelector('[data-testid=\"teacher-ledger\"]');if(!el)return 'NO-BTN';el.scrollIntoView({block:'center'});document.documentElement.classList.remove('dark');return 'light';})()" >/dev/null 2>&1
sleep 1
shot r357-ledger-light.png
agent-browser eval "(()=>{document.documentElement.classList.add('dark');return 'dark';})()" >/dev/null 2>&1
sleep 1
shot r357-ledger-dark.png
agent-browser eval "(()=>{document.documentElement.classList.remove('dark');return 'light-again';})()" >/dev/null 2>&1

echo "########## E) کنسول" | tee -a "$OUT"
agent-browser console 2>&1 | tail -4 | tee -a "$OUT"

echo "================ VERDICT" | tee -a "$OUT"
if grep -q 'bomBytes\\":true' "$OUT" && grep -q 'crlfOnly\\":true' "$OUT" && grep -q 'noHandle\\":true' "$OUT" \
   && grep -q 'دفترِ کاملِ کلاس ذخیره شد' "$OUT" && grep -q 'EVENTDAY-teacher_class_csv' "$OUT" \
   && { grep -qE 'teacher_class_csv.*"total": [1-9]+' "$OUT"; }; then
  echo "R357-LEDGER-ALL-OK" | tee -a "$OUT"
else
  echo "R357-VERDICT-FAILED" | tee -a "$OUT"
fi
agent-browser close >/dev/null 2>&1 || true
