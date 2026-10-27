#!/bin/bash
# r363 — دیباگِ سشنِ تایپی: شمارنده و ورودی
set -u
mkdir -p /tmp/qa-r363
cd /home/z/my-project
code=000
if curl -s -o /dev/null --max-time 3 http://127.0.0.1:3000; then code=200; fi
if [ "$code" != "200" ]; then
  setsid env NODE_OPTIONS=--max-old-space-size=1024 node node_modules/.bin/next dev > /tmp/next-r363.log 2>&1 < /dev/null &
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
$AB find text "پایهٔ نهم" click >/dev/null 2>&1
sleep 3
$AB find text "تمرین مکالمه درس اول" click >/dev/null 2>&1
sleep 4

echo "--- did quiz open? body head:"
$AB eval "(() => { const t=(document.body.textContent||'').replace(/\s+/g,' ').trim(); return JSON.stringify(t.slice(0, 400)) })()"
echo "--- leaf texts (first 40):"
$AB eval "(() => { const t=[...document.querySelectorAll('main *')].filter(e=>e.children.length===0).map(e=>e.textContent.trim()).filter(Boolean).slice(0,40); return JSON.stringify(t) })()"
echo "--- typed input present?"
$AB eval "(() => { const i=document.querySelector('input[data-quiz-typed-input]'); return JSON.stringify({inp: !!i, disabled: i? i.disabled : null, placeholder: i? i.placeholder : null}) })()"
echo "--- all buttons:"
$AB eval "(() => { return JSON.stringify([...document.querySelectorAll('button')].map(b=>({t:(b.textContent||'').trim().slice(0,40), dis:b.disabled})).slice(0,20)) })()"
echo "DEBUG-DONE"
