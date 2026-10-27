#!/bin/bash
# r378 — QA تک‌سشن: کارتِ هشتمِ هفت‌گروهه (۷ گروه/۱۶ دکمه — کامل) + بانکِ پایانیِ ۱۶
#  (جدولِ ترجمهٔ دوروییِ ص۷۲ — gym از دیالوگِ ص۶۲؛ نخستین گزینه‌های فارسیِ کارتِ هشتم در ق۴-۶)
set -u
mkdir -p /tmp/qa-r378
cd /home/z/my-project
code=000
if curl -s -o /dev/null --max-time 3 http://127.0.0.1:3000; then code=200; fi
if [ "$code" != "200" ]; then
  setsid env NODE_OPTIONS=--max-old-space-size=1024 node node_modules/.bin/next dev > /tmp/next-r378.log 2>&1 < /dev/null &
  disown
  for i in $(seq 1 25); do
    sleep 3
    code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 http://127.0.0.1:3000 2>/dev/null)
    [ "$code" = "200" ] && break
  done
fi
echo "server=$code"
[ "$code" = "200" ] || { echo "SERVER-FAIL"; exit 1; }

AB="agent-browser"
$AB open http://127.0.0.1:3000 >/dev/null 2>&1
$AB wait --load networkidle >/dev/null 2>&1
$AB eval "(() => { const el=[...document.querySelectorAll('a,button')].find(x=>(x.textContent||'').includes('کتابخانهٔ جزوه‌ها')); if(el){el.click();return 'ok'} return 'miss' })()" >/dev/null 2>&1
sleep 3
$AB eval "(() => { const el=[...document.querySelectorAll('a,button')].find(x=>(x.textContent||'').trim().startsWith('پایهٔ هشتم')); if(el){el.click();return 'ok'} return 'miss' })()" >/dev/null 2>&1
sleep 4

echo "--- g8 card check (۷ گروه/۱۶ دکمه):"
$AB eval "(() => {
  const t = document.body.textContent;
  const g7 = t.includes('سؤالات امتحانی درس هفتم');
  const btns = [...document.querySelectorAll('button')].map(b=>b.textContent.trim()).filter(x=>x.includes('امتحانی درس'));
  const l16 = btns.find(x=>x.includes('هفتم')) || null;
  return JSON.stringify({g7, examButtons: btns.length, l16});
})()"
$AB screenshot /tmp/qa-r378/card.png >/dev/null 2>&1

DRIVER=$(cat scripts/driver-g8-r378.js)
$AB eval "$DRIVER" >/dev/null 2>&1
for i in $(seq 1 400); do
  d=$($AB eval "window.__r378 && window.__r378.phase === 'done' ? '1' : '0'" 2>/dev/null | tr -d '"')
  [ "$d" = "1" ] && break
  sleep 2
done
echo "--- driver result:"
$AB eval "JSON.stringify(window.__r378)"
$AB screenshot /tmp/qa-r378/b16-final.png >/dev/null 2>&1

echo "--- mobile 390px (بازگشت به کارت):"
$AB eval "(() => { const b=[...document.querySelectorAll('button')].find(x=>x.textContent.includes('بازگشت')); if(b){b.click();return 'back'} return 'no-back' })()" >/dev/null 2>&1
sleep 2
$AB set viewport 390 844 >/dev/null 2>&1
sleep 1
$AB eval "(() => { const d=document.documentElement; return JSON.stringify({sw:d.scrollWidth, cw:d.clientWidth, overflow:d.scrollWidth>d.clientWidth}) })()"
$AB screenshot /tmp/qa-r378/mobile-390.png >/dev/null 2>&1

echo "--- console errors:"
$AB errors 2>/dev/null | tail -5
