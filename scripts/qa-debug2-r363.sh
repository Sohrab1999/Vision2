#!/bin/bash
# r363 — دیباگِ ۲: کلیکِ مستقیمِ دکمه + وضعیتِ fetch
set -u
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
AB="agent-browser"
$AB open http://127.0.0.1:3000 >/dev/null 2>&1
$AB wait --load networkidle >/dev/null 2>&1
$AB eval "(() => { const el=[...document.querySelectorAll('a,button')].find(x=>(x.textContent||'').includes('کتابخانهٔ جزوه‌ها')); if(el){el.click();return 'ok'} return 'miss' })()" >/dev/null 2>&1
sleep 3
$AB find text "پایهٔ نهم" click >/dev/null 2>&1
sleep 3

echo "--- fetch status from page:"
$AB eval "fetch('/jozve/tests-g9.json').then(r=>r.text()).then(t=>{const j=JSON.parse(t); return JSON.stringify({bytes:t.length, banks:j.lessons.length, lessons:j.lessons.map(x=>x.lesson)})})"

echo "--- direct button click:"
$AB eval "(() => {
  const btns=[...document.querySelectorAll('button')].filter(b=>(b.textContent||'').includes('تمرین مکالمه درس اول'));
  if(!btns.length) return 'no-btn';
  const b=btns[0];
  const r=b.getBoundingClientRect();
  b.click();
  return JSON.stringify({clicked:true, text:b.textContent.trim(), rect:[Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)], disabled:b.disabled});
})()"
sleep 4
echo "--- input after click:"
$AB eval "(() => { const i=document.querySelector('input[data-quiz-typed-input]'); const t=(document.body.textContent||'').replace(/\s+/g,' '); return JSON.stringify({inp:!!i, ph:i?i.placeholder:null, hasS: t.includes('سؤال'), around:(t.match(/سؤال[^|]{0,40}/)||['none'])[0]}) })()"
echo "--- console tail:"
$AB console 2>/dev/null | grep -viE "fast refresh|hmr|devtools" | tail -8
echo "DEBUG2-DONE"
