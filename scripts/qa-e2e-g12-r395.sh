#!/bin/bash
# r395 — QA تک‌سشن: کارتِ دوازدهم با گروهِ تازهٔ «مرورِ تایپیِ نهایی‌ها» (بانکِ l142 — ۲۲ آیتم)
#  + قهرمان‌سازیِ کاملِ ۲۲/۲۲ تایپی (ق۵ با had gotten — عضوِ دومِ دوتایی؛ ق۱۷ با would choose — عضوِ دومِ سه‌گانه)
#  + ۱۶ گروهِ نهاییِ قبلی سرجایش + موبایلِ ۳۹۰px + کنسولِ پاک
set -u
mkdir -p /tmp/qa-r395
cd /home/z/my-project
code=000
if curl -s -o /dev/null --max-time 3 http://127.0.0.1:3000; then code=200; fi
if [ "$code" != "200" ]; then
  setsid env NODE_OPTIONS=--max-old-space-size=1024 node node_modules/.bin/next dev > /tmp/next-r395.log 2>&1 < /dev/null &
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
  const rev = t.includes('مرورِ تایپیِ نهایی‌ها');
  const prev = t.includes('امتحان نهایی — خرداد ۱۳۹۹ خارج از کشور') && t.includes('امتحان نهایی — دی ۱۳۹۸') && t.includes('امتحان نهایی — شهریور ۱۴۰۱') && t.includes('امتحان نهایی — دی ۱۳۹۷');
  const revBtns = [...document.querySelectorAll('button')].map(b=>b.textContent.trim()).filter(x=>x.includes('قسمتِ افعالِ مخزن'));
  return JSON.stringify({rev, prev, revBtns: revBtns.length, revFirst: revBtns[0] || null});
})()"
$AB screenshot /tmp/qa-r395/card.png >/dev/null 2>&1

DRIVER=$(cat scripts/driver-g12-r395.js)
$AB eval "$DRIVER" >/dev/null 2>&1
for i in $(seq 1 600); do
  d=$($AB eval "window.__r395 && window.__r395.phase === 'done' ? '1' : '0'" 2>/dev/null | tr -d '"')
  [ "$d" = "1" ] && break
  sleep 2
done
echo "--- driver result:"
$AB eval "JSON.stringify({ok: window.__r395.b142.ok, miss: window.__r395.b142.miss, score: window.__r395.b142.score, champion: window.__r395.b142.champion, echo: window.__r395.b142.echo || null})"
$AB screenshot /tmp/qa-r395/b142-final.png >/dev/null 2>&1

echo "--- mobile 390px (بازگشت به کارت):"
$AB eval "(() => { const b=[...document.querySelectorAll('button')].find(x=>x.textContent.includes('بازگشت')); if(b){b.click();return 'back'} return 'no-back' })()" >/dev/null 2>&1
sleep 2
$AB set viewport 390 844 >/dev/null 2>&1
sleep 1
$AB eval "(() => { const d=document.documentElement; return JSON.stringify({sw:d.scrollWidth, cw:d.clientWidth, overflow:d.scrollWidth>d.clientWidth}) })()"
$AB screenshot /tmp/qa-r395/mobile-390.png >/dev/null 2>&1

echo "--- console errors:"
$AB errors 2>/dev/null | tail -5
