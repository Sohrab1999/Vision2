#!/bin/bash
# r384 — QA تک‌سشن: کارتِ دوازدهم با گروهِ تازهٔ «امتحان نهایی — خرداد ۱۴۰۰» (۷ دکمه)
#  + بانکِ l30 گرامر (ق۱ غلطِ عمدی؛ کلیدِ رسمی didn’t they) + بانکِ l35 مرتب‌سازیِ شش‌گزینه‌ای (قهرمان، opts=6)
set -u
mkdir -p /tmp/qa-r384
cd /home/z/my-project
code=000
if curl -s -o /dev/null --max-time 3 http://127.0.0.1:3000; then code=200; fi
if [ "$code" != "200" ]; then
  setsid env NODE_OPTIONS=--max-old-space-size=1024 node node_modules/.bin/next dev > /tmp/next-r384.log 2>&1 < /dev/null &
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
$AB eval "(() => { const el=[...document.querySelectorAll('a,button')].find(x=>(x.textContent||'').trim().startsWith('پایهٔ دوازدهم')); if(el){el.click();return 'ok'} return 'miss' })()" >/dev/null 2>&1
sleep 4

echo "--- g12 card check:"
$AB eval "(() => {
  const t = document.body.textContent;
  const grp = t.includes('امتحان نهایی — خرداد ۱۴۰۰');
  const btns = [...document.querySelectorAll('button')].map(b=>b.textContent.trim()).filter(x=>x.includes('نهایی خرداد ۱۴۰۰'));
  const gsh = t.includes('امتحان نهایی — شهریور ۱۴۰۰');
  const g1401 = t.includes('امتحان نهایی — شهریور ۱۴۰۱');
  const g1402 = t.includes('امتحان نهایی — خرداد ۱۴۰۲');
  const gdey = t.includes('امتحان نهایی — دی ۱۴۰۰');
  return JSON.stringify({grp, gsh, g1401, g1402, gdey, khButtons: btns.length, first: btns[0] || null, last: btns[btns.length-1] || null});
})()"
$AB screenshot /tmp/qa-r384/card.png >/dev/null 2>&1

DRIVER=$(cat scripts/driver-g12-r384.js)
$AB eval "$DRIVER" >/dev/null 2>&1
for i in $(seq 1 600); do
  d=$($AB eval "window.__r384 && window.__r384.phase === 'done' ? '1' : '0'" 2>/dev/null | tr -d '"')
  [ "$d" = "1" ] && break
  sleep 2
done
echo "--- driver result:"
$AB eval "JSON.stringify(window.__r384)"
$AB screenshot /tmp/qa-r384/b35-final.png >/dev/null 2>&1

echo "--- mobile 390px (بازگشت به کارت):"
$AB eval "(() => { const b=[...document.querySelectorAll('button')].find(x=>x.textContent.includes('بازگشت')); if(b){b.click();return 'back'} return 'no-back' })()" >/dev/null 2>&1
sleep 2
$AB set viewport 390 844 >/dev/null 2>&1
sleep 1
$AB eval "(() => { const d=document.documentElement; return JSON.stringify({sw:d.scrollWidth, cw:d.clientWidth, overflow:d.scrollWidth>d.clientWidth}) })()"
$AB screenshot /tmp/qa-r384/mobile-390.png >/dev/null 2>&1

echo "--- console errors:"
$AB errors 2>/dev/null | tail -5
