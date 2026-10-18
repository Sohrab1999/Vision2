#!/bin/bash
# r362 — QA تک‌سشن: سرور + مرورگر در یک فراخوانی (درسِ r362: ابزار بینِ فراخوانی‌ها بچه‌ها را می‌کشد)
set -u
mkdir -p /tmp/qa-r362
cd /home/z/my-project

# ——— ۱) سرور ———
if ! curl -s -o /dev/null --max-time 3 http://127.0.0.1:3000; then
  setsid env NODE_OPTIONS=--max-old-space-size=1024 node node_modules/.bin/next dev > /tmp/next-r362.log 2>&1 < /dev/null &
  disown
fi
for i in $(seq 1 20); do
  sleep 3
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 http://127.0.0.1:3000 2>/dev/null)
  [ "$code" = "200" ] && break
done
echo "server=$code"
[ "$code" = "200" ] || { echo "SERVER-FAIL"; exit 1; }

AB="agent-browser"

# ——— ۲) خانه → کتابخانه → پایهٔ نهم ———
$AB open http://127.0.0.1:3000 >/dev/null 2>&1
$AB wait --load networkidle >/dev/null 2>&1
$AB find text "کتابخانهٔ جزوه‌ها" click >/dev/null 2>&1
sleep 2
$AB find text "پایهٔ نهم" click >/dev/null 2>&1
sleep 3

# ——— ۳) کارتِ نهم: گروه‌ها و دکمه‌ها ———
echo "--- g9 card:"
$AB eval "(() => {
  const t = document.body.textContent;
  const btns = [...document.querySelectorAll('button')].map(b=>b.textContent.trim()).filter(x=>x.includes('تست'));
  const groups = ['تست گرامری','تست واژگان'].map(g=>t.includes(g));
  const b1 = btns.find(x=>x.includes('تست گرامری (ص۲۸)'));
  const b2 = btns.find(x=>x.includes('تست واژگان ۵۰تایی'));
  return JSON.stringify({groups, b1: !!b1, b2: !!b2, b1txt: b1||null, b2txt: b2||null});
})()"

$AB screenshot /tmp/qa-r362/g9-card.png >/dev/null 2>&1

# ——— ۴) بانک ۱: گرامر (۳ MCQ + ۴ تایپی) ———
$AB find text "تست گرامری (ص۲۸)" click >/dev/null 2>&1
sleep 3
$AB eval "fetch('/jozve/tests-g9.json').then(r=>r.text())" >/dev/null 2>&1 || true
node -e "console.log('bank1 driver injected')"
# درایور از طریق فایل
DRIVER1=$(cat scripts/driver-g9-l1-r362.js)
$AB eval "$DRIVER1" >/dev/null 2>&1
sleep 2
for i in $(seq 1 30); do
  done1=$($AB eval "window.__r362b1 && window.__r362b1.done ? '1' : '0'" 2>/dev/null | tr -d '"')
  [ "$done1" = "1" ] && break
  sleep 2
done
echo "--- bank1 result:"
$AB eval "JSON.stringify(window.__r362b1)"
$AB eval "document.body.textContent.includes('قهرمان') ? 'CHAMPION' : 'NOT-CHAMPION'"
$AB screenshot /tmp/qa-r362/g9-bank1-final.png >/dev/null 2>&1

# ——— ۵) بازگشت به فهرست و بانک ۲ ———
$AB find text "فهرست درس‌ها" click >/dev/null 2>&1 || true
sleep 2
# اگر دکمهٔ بازگشت نبود، از طریق هدر/خانه
$AB eval "(() => { const b=[...document.querySelectorAll('button')].find(x=>x.textContent.includes('فهرست درس‌ها')); if(b){b.click();return 'back-ok'} return 'no-back' })()"
sleep 2
$AB find text "تست واژگان ۵۰تایی" click >/dev/null 2>&1
sleep 3
DRIVER2=$(cat scripts/driver-g9-l2-r362.js)
$AB eval "$DRIVER2" >/dev/null 2>&1
sleep 2
for i in $(seq 1 60); do
  done2=$($AB eval "window.__r362b2 && window.__r362b2.done ? '1' : '0'" 2>/dev/null | tr -d '"')
  [ "$done2" = "1" ] && break
  sleep 2
done
echo "--- bank2 result:"
$AB eval "JSON.stringify(window.__r362b2)"
$AB eval "document.body.textContent.includes('قهرمان') ? 'CHAMPION' : 'NOT-CHAMPION'"
$AB screenshot /tmp/qa-r362/g9-bank2-final.png >/dev/null 2>&1

# ——— ۶) موبایل ۳۹۰px ———
$AB set viewport 390 844 >/dev/null 2>&1
sleep 1
$AB eval "(() => { const b=[...document.querySelectorAll('button')].find(x=>x.textContent.includes('فهرست درس‌ها')); if(b){b.click();return 'back-ok'} return 'no-back' })()" >/dev/null 2>&1
sleep 2
echo "--- mobile 390px:"
$AB eval "(() => { const d=document.documentElement; return JSON.stringify({sw:d.scrollWidth, cw:d.clientWidth, overflow:d.scrollWidth>d.clientWidth}) })()"
$AB screenshot /tmp/qa-r362/g9-mobile-390.png >/dev/null 2>&1

# ——— ۷) کنسول ———
echo "--- console errors:"
$AB errors 2>/dev/null | tail -5
$AB console 2>/dev/null | grep -viE "fast refresh|hmr|download the react devtools" | tail -8
echo "QA-DONE"
