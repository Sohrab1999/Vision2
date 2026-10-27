#!/bin/bash
# r393 — QA تک‌سشن: کارتِ دوازدهم با گروهِ تازهٔ «امتحان نهایی — دی ۱۳۹۸» (۱۴ دکمه)
#  + l115 شنیداریِ ترکیبی (۳/۳ قهرمان هدف) + l121 نخستین بانکِ ناهماهنگِ یگانه (۴/۴ قهرمان هدف)
#  + l122 شکلِ فعلِ تایپی با فرمِ دومِ دوبخشی (had learnt — ۴/۴ قهرمان هدف)
#  + l124 مرتب‌کردنِ کلمات با ترتیبِ دومِ ضمیری (۲/۲ قهرمان هدف)
#  + l123 گرامر (ق۱ غلطِ عمدی؛ کلیدِ رسمی had met → ۳/۴ + اکو)
set -u
mkdir -p /tmp/qa-r393
cd /home/z/my-project
code=000
if curl -s -o /dev/null --max-time 3 http://127.0.0.1:3000; then code=200; fi
if [ "$code" != "200" ]; then
  setsid env NODE_OPTIONS=--max-old-space-size=1024 node node_modules/.bin/next dev > /tmp/next-r393.log 2>&1 < /dev/null &
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
  const d98 = t.includes('امتحان نهایی — دی ۱۳۹۸');
  const prev = t.includes('امتحان نهایی — شهریور ۱۳۹۸') && t.includes('امتحان نهایی — خرداد ۱۳۹۸') && t.includes('امتحان نهایی — دی ۱۳۹۷') && t.includes('امتحان نهایی — شهریور ۱۴۰۱');
  const d98Btns = [...document.querySelectorAll('button')].map(b=>b.textContent.trim()).filter(x=>x.includes('دی ۱۳۹۸ —'));
  return JSON.stringify({d98, prev, d98Btns: d98Btns.length, d98First: d98Btns[0] || null, d98Last: d98Btns[d98Btns.length-1] || null});
})()"
$AB screenshot /tmp/qa-r393/card.png >/dev/null 2>&1

DRIVER=$(cat scripts/driver-g12-r393.js)
$AB eval "$DRIVER" >/dev/null 2>&1
for i in $(seq 1 1200); do
  d=$($AB eval "window.__r393 && window.__r393.phase === 'done' ? '1' : '0'" 2>/dev/null | tr -d '"')
  [ "$d" = "1" ] && break
  sleep 2
done
echo "--- driver result:"
$AB eval "JSON.stringify(window.__r393)"
$AB screenshot /tmp/qa-r393/b123-final.png >/dev/null 2>&1

echo "--- mobile 390px (بازگشت به کارت):"
$AB eval "(() => { const b=[...document.querySelectorAll('button')].find(x=>x.textContent.includes('بازگشت')); if(b){b.click();return 'back'} return 'no-back' })()" >/dev/null 2>&1
sleep 2
$AB set viewport 390 844 >/dev/null 2>&1
sleep 1
$AB eval "(() => { const d=document.documentElement; return JSON.stringify({sw:d.scrollWidth, cw:d.clientWidth, overflow:d.scrollWidth>d.clientWidth}) })()"
$AB screenshot /tmp/qa-r393/mobile-390.png >/dev/null 2>&1

echo "--- console errors:"
$AB errors 2>/dev/null | tail -5
