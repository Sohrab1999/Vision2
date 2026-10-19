#!/bin/bash
# r371 — QA تک‌سشن: کارتِ هفتم با ۴ گروه/۱۰ دکمه + سه بانکِ تازه
#  (۴ MCQِ ستونِ مشترکِ en/ten + هفت‌گزینه‌ایِ بانکِ واژه با غلطِ عمدیِ هرگز-کلید + ۷ دوگزینه‌ایِ He/She)
set -u
mkdir -p /tmp/qa-r371
cd /home/z/my-project
code=000
if curl -s -o /dev/null --max-time 3 http://127.0.0.1:3000; then code=200; fi
if [ "$code" != "200" ]; then
  setsid env NODE_OPTIONS=--max-old-space-size=1024 node node_modules/.bin/next dev > /tmp/next-r371.log 2>&1 < /dev/null &
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
$AB eval "(() => { const el=[...document.querySelectorAll('a,button')].find(x=>(x.textContent||'').trim().startsWith('پایهٔ هفتم')); if(el){el.click();return 'ok'} return 'miss' })()" >/dev/null 2>&1
sleep 4

echo "--- g7 card check:"
$AB eval "(() => {
  const t = document.body.textContent;
  const groups = ['سؤالات امتحانی درس اول','سؤالات امتحانی درس دوم','سؤالات امتحانی درس سوم','سؤالات امتحانی درس چهارم'].map(g=>t.includes(g));
  const btns = [...document.querySelectorAll('button')].map(b=>b.textContent.trim()).filter(x=>x.includes('امتحانی درس'));
  return JSON.stringify({groups, examButtons: btns.length, samples: btns});
})()"
$AB screenshot /tmp/qa-r371/card.png >/dev/null 2>&1

DRIVER=$(cat scripts/driver-g7-r371.js)
$AB eval "$DRIVER" >/dev/null 2>&1
for i in $(seq 1 200); do
  d=$($AB eval "window.__r371 && window.__r371.phase === 'done' ? '1' : '0'" 2>/dev/null | tr -d '"')
  [ "$d" = "1" ] && break
  sleep 2
done
echo "--- driver result:"
$AB eval "JSON.stringify(window.__r371)"
echo "--- b9 echo (پاسخ درست echo):"
$AB eval "(() => { const t=document.body.textContent||''; const i=t.indexOf('پاسخ درست'); return JSON.stringify(i>=0 ? t.slice(Math.max(0,i-160), i+220) : 'no-echo') })()"
$AB screenshot /tmp/qa-r371/b10-final.png >/dev/null 2>&1

echo "--- mobile 390px (بازگشت به کارت):"
$AB eval "(() => { const b=[...document.querySelectorAll('button')].find(x=>x.textContent.includes('بازگشت')); if(b){b.click();return 'back'} return 'no-back' })()" >/dev/null 2>&1
sleep 2
$AB set viewport 390 844 >/dev/null 2>&1
sleep 1
$AB eval "(() => { const d=document.documentElement; return JSON.stringify({sw:d.scrollWidth, cw:d.clientWidth, overflow:d.scrollWidth>d.clientWidth}) })()"
$AB screenshot /tmp/qa-r371/mobile-390.png >/dev/null 2>&1

echo "--- console errors:"
$AB errors 2>/dev/null | tail -5
$AB console 2>/dev/null | grep -viE "fast refresh|hmr|download the react devtools" | tail -6
