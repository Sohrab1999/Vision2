#!/bin/bash
# r403 — QA تک‌سشن: بانکِ g7-l15 (۶ سؤالِ ۸گزینه‌ای) → حرفِ h → نتیجه → معلمِ کارنامه
set -u
mkdir -p /tmp/qa-r403
cd /home/z/my-project
code=000
if curl -s -o /dev/null --max-time 3 http://127.0.0.1:3000; then code=200; fi
if [ "$code" != "200" ]; then
  setsid env NODE_OPTIONS=--max-old-space-size=1024 node node_modules/.bin/next dev > /tmp/next-r403.log 2>&1 < /dev/null &
  disown
  for i in $(seq 1 30); do
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
sleep 2

echo "--- nav: کتابخانهٔ جزوه‌ها → پایهٔ هفتم:"
$AB eval "(() => { const el=[...document.querySelectorAll('a,button')].find(x=>(x.textContent||'').includes('کتابخانهٔ جزوه‌ها')); if(el){el.click();return 'ok'} return 'miss' })()" >/dev/null 2>&1
sleep 3
$AB eval "(() => { const el=[...document.querySelectorAll('a,button')].find(x=>(x.textContent||'').trim().startsWith('پایهٔ هفتم')); if(el){el.click();return 'ok'} return 'miss' })()" >/dev/null 2>&1
sleep 4

echo "--- g7 card check (بانک l15):"
$AB eval "(() => {
  const t = document.body.textContent;
  const btns = [...document.querySelectorAll('button')].map(b=>b.textContent.trim());
  const l15 = btns.filter(x=>x.includes('درس ششم') && x.includes('ص۹۰'));
  return JSON.stringify({hasBank15: l15.length>0, first: l15[0]||null});
})()"
$AB screenshot /tmp/qa-r403/g7-card.png >/dev/null 2>&1

echo "--- open bank l15:"
$AB eval "(() => { const el=[...document.querySelectorAll('button')].find(x=>(x.textContent||'').includes('درس ششم')&&(x.textContent||'').includes('ص۹۰')); if(el){el.click();return 'ok'} return 'miss' })()" >/dev/null 2>&1
sleep 4

DRIVER=$(cat scripts/driver-g7-l15-r403.js)
$AB eval "$DRIVER" >/dev/null 2>&1
for i in $(seq 1 120); do
  d=$($AB eval "window.__r403a && window.__r403a.done ? '1' : '0'" 2>/dev/null | tr -d '"')
  [ "$d" = "1" ] && break
  sleep 2
done
echo "--- driver result:"
$AB eval "JSON.stringify(window.__r403a)"
sleep 2

echo "--- result screen: letter h + no undefined + result pills:"
$AB eval "(() => {
  // فقط متنِ مرئیِ main — payloadهایِ RSC در اسکریپت‌ها نویزند
  const t = document.querySelector('main').innerText;
  const ix = t.indexOf('undefined');
  return JSON.stringify({
    hasUndefined: ix >= 0,
    undefinedCtx: ix >= 0 ? t.slice(Math.max(0, ix - 60), ix + 60) : null,
    reviewH: /h\\)/.test(t),
    teacherPanel: t.includes('معلمِ کارنامه'),
    typedWrongLabel: t.includes('پاسخ تایپیِ نادرست')
  });
})()"
$AB screenshot /tmp/qa-r403/result.png >/dev/null 2>&1

echo "--- ask the teacher:"
$AB eval "(() => { const b=[...document.querySelectorAll('button')].find(x=>x.textContent.includes('نظرِ معلم را بخواه')); if(b){b.click();return 'clicked'} return 'miss' })()" >/dev/null 2>&1
sleep 18
$AB eval "(() => {
  const t = document.body.textContent;
  const panel = document.querySelector('[data-ai-review]');
  return JSON.stringify({
    review: !!panel,
    offline: t.includes('حالت آفلاین'),
    fresh: t.includes('تازه'),
    cached: t.includes('آماده'),
    sections: t.includes('نقطهٔ قوت') && t.includes('تمرینِ پیشنهادی'),
    error: t.includes('بازخورد ساخته نشد') || t.includes('پاسخ ارسالی نامعتبر')
  });
})()"
$AB screenshot /tmp/qa-r403/teacher.png >/dev/null 2>&1

echo "--- desktop 1280 overflow:"
$AB set viewport 1280 800 >/dev/null 2>&1
sleep 1
$AB eval "(() => { const d=document.documentElement; return JSON.stringify({sw:d.scrollWidth, cw:d.clientWidth, overflow:d.scrollWidth>d.clientWidth}) })()"

echo "--- mobile 390 overflow (result screen):"
$AB set viewport 390 844 >/dev/null 2>&1
sleep 1
$AB eval "(() => { const d=document.documentElement; return JSON.stringify({sw:d.scrollWidth, cw:d.clientWidth, overflow:d.scrollWidth>d.clientWidth}) })()"
$AB screenshot /tmp/qa-r403/mobile-390.png >/dev/null 2>&1

echo "--- console errors:"
$AB errors 2>/dev/null | tail -5
