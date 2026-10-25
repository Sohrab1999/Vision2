#!/usr/bin/env bash
# ------------------------------------------------------------------
# r367 — داوریِ زندهٔ «خوشهٔ بازگشت» در کارتِ راهنما (پیشنهادِ ③ِ r366 —
# ثِ r364: سه راند). تک سشن، بدونِ تزریق — هر گام با کنشِ واقعی:
#   A) گاردِ سلامتِ سرور (این buildِ راند است — r365: سرورِ کهنه ممنوع)
#   B) سشنِ تازه + آنبوردینگِ واقعی (عنوان + «رد کردن»)
#   C) باز کردنِ راهنما با دکمهٔ واقعیِ کیبوردِ هدر ⇒ بخشِ «خوشهٔ بازگشت»:
#      پنج درِ زنده از RETURN_CLUSTER_DOORS + شمارشِ «۵ در» + gateHintهای
#      دیدنی + tooltipِ مشترک ⇒ شاتِ روشن
#   D) شاتِ تیره (Tِ واقعی بیرونِ دیالوگ + بازکردنِ دوباره) — صفرِ CSS:
#      پینترِ darkِ .shortcuts-dialog باید همان بخش را هم بپوشاند
#   E) پرشِ واقعی و دیدنی: D ⇒ دیکشنری (سطحِ بیرونِ خانه) ⇒ راهنما ⇒
#      کلیکِ return-door-konkur ⇒ خانه (نه کنکور!) — درها فقط رویِ خانهاند
#   F) EventDay + کنسولِ دوفازی (درسِ r365: اول بگیر با || true، بعد
#      قضاوت با grepِ جدا)
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
OUT=/tmp/r367-qa.txt
: > "$OUT"

shot(){ agent-browser screenshot "$EV/$1" >/dev/null 2>&1; }
ev(){ agent-browser eval "$1" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

echo "########## A) گاردِ سلامتِ سرور (buildِ همین راند)" | tee -a "$OUT"
C=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/" 2>/dev/null)
if [ "$C" != "200" ]; then
  echo "APP-DOWN — restart" | tee -a "$OUT"
  pkill -f "bun .next/standalone/server.js" 2>/dev/null; sleep 2
  cd /home/z/my-project
  DATABASE_URL="file:/home/z/my-project/db/custom.db" TEACHER_ACCESS_CODE=moallem-1404 \
    setsid nohup bun .next/standalone/server.js > /home/z/my-project/scripts/app-server.log 2>&1 &
  for i in $(seq 1 30); do sleep 3; C=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/" 2>/dev/null); [ "$C" = "200" ] && break; done
fi
echo "APP-READY code=$C" | tee -a "$OUT"
curl -s -o /dev/null -w "judge:%{http_code}\n" http://127.0.0.1:3003/ 2>/dev/null | tee -a "$OUT"

echo "########## B) سشنِ تازه + آنبوردینگِ واقعی" | tee -a "$OUT"
agent-browser close >/dev/null 2>&1 || true
pkill -f "agent-browser/browsers" 2>/dev/null; sleep 1
agent-browser open "$BASE" >/dev/null 2>&1
agent-browser set viewport 1280 900 >/dev/null 2>&1
agent-browser wait 'body' >/dev/null 2>&1 || true
for i in $(seq 1 30); do
  R=$(agent-browser eval "(()=>{const t=document.querySelector('[data-slot=\"dialog-title\"]');if(t)return 'ONBOARD';const g=document.querySelector('[aria-label=\"ابزارهای یادگیری\"]');return g?'HOME':'WAIT';})()" 2>/dev/null | tr -d '"')
  [ "$R" = "WAIT" ] || { echo "SURFACE-0=$R" | tee -a "$OUT"; break; }; sleep 3
done
ev "(()=>{
  const t=document.querySelector('[data-slot=\"dialog-content\"] [data-slot=\"dialog-title\"]');
  if(!t)return 'NO-ONBOARD-TITLE';
  const skip=[...document.querySelectorAll('button')].find(b=>b.textContent.includes('رد کردن — ناشناس می‌مانم'));
  if(!skip)return 'NO-SKIP-BTN'; skip.click(); return 'ONBOARD-OK';
})()" | tee -a "$OUT"
sleep 1

echo "########## C) راهنما با دکمهٔ واقعیِ هدر + بخشِ خوشهٔ بازگشت" | tee -a "$OUT"
ev "(()=>{
  const b=document.querySelector('button[aria-label=\"راهنمای میان‌برهای کیبورد\"]');
  if(!b)return 'NO-GUIDE-BTN'; b.click(); return 'GUIDE-CLICK';
})()" | tee -a "$OUT"
sleep 1.5
ev "(()=>{
  const s=document.querySelector('[data-testid=\"shortcut-guide-return-cluster\"]');
  if(!s)return 'NO-SECTION';
  const ids=['appendix','lesson','reading','konkur','duel'];
  const missing=ids.filter(i=>!s.querySelector('[data-testid=\"return-door-'+i+'\"]'));
  if(missing.length)return 'MISSING:'+missing.join(',');
  const head=[...s.querySelectorAll('h3')].map(h=>h.textContent||'').join(' ');
  if(!head.includes('۵ در'))return 'HEAD-COUNT-BAD:'+head.slice(0,40);
  if(!s.textContent.includes('بی‌رکورد، هیچ'))return 'NO-HONEST-FOOTER';
  const tip=s.querySelector('[data-testid=\"return-door-appendix\"]').getAttribute('title');
  if(tip!=='رفتن به خانه — همهٔ درهایِ بازگشت آن‌جاست')return 'TIP-BAD:'+tip;
  return 'CLUSTER-OK rows=5 tip-ok footer-ok';
})()" | tee -a "$OUT"
ev "(()=>{
  const s=document.querySelector('[data-testid=\"shortcut-guide-return-cluster\"]');
  if(!s)return 'NO-SECTION';
  const hints=[...s.querySelectorAll('li p')].map(p=>(p.textContent||'').trim());
  const withFirst=hints.filter(h=>h.startsWith('با نخستین')).length;
  return 'GATEHINTS='+withFirst+'/5 sample='+hints[2];
})()" | tee -a "$OUT"
agent-browser scrollintoview '[data-testid="shortcut-guide-return-cluster"]' >/dev/null 2>&1 || true
sleep 1
shot r367-return-cluster-light.png
ev "(()=>{const x=document.querySelector('[data-slot=\"dialog-close\"]');if(!x)return 'NO-CLOSE';x.click();return 'GUIDE-CLOSED';})()" | tee -a "$OUT"
sleep 1

echo "########## D) شاتِ تیره — پینترِ darkِ همان دیالوگ باید بپوشاند" | tee -a "$OUT"
agent-browser press t >/dev/null 2>&1 || true
sleep 1
ev "(()=>{
  const b=document.querySelector('button[aria-label=\"راهنمای میان‌برهای کیبورد\"]');
  if(!b)return 'NO-GUIDE-BTN'; b.click(); return 'GUIDE-REOPEN';
})()" | tee -a "$OUT"
sleep 1.5
agent-browser scrollintoview '[data-testid="shortcut-guide-return-cluster"]' >/dev/null 2>&1 || true
sleep 1
shot r367-return-cluster-dark.png
ev "(()=>{
  const s=document.querySelector('[data-testid=\"shortcut-guide-return-cluster\"]');
  if(!s)return 'NO-SECTION-DARK';
  const row=document.querySelector('[data-testid=\"return-door-duel\"]');
  const bg=getComputedStyle(row).backgroundColor;
  return 'DARK-ROW-BG='+bg;
})()" | tee -a "$OUT"
ev "(()=>{const x=document.querySelector('[data-slot=\"dialog-close\"]');if(!x)return 'NO-CLOSE';x.click();return 'GUIDE-CLOSED';})()" | tee -a "$OUT"
agent-browser press t >/dev/null 2>&1 || true
sleep 1

echo "########## E) پرشِ واقعی و دیدنی: دیکشنری ⇒ کلیکِ درِ کنکور ⇒ خانه" | tee -a "$OUT"
agent-browser press d >/dev/null 2>&1 || true
sleep 2
ev "(()=>{
  const d=document.querySelector('[aria-label=\"رفتن به واژه‌های من\"]');
  return d?'AT-DICTIONARY':'NOT-DICTIONARY';
})()" | tee -a "$OUT"
ev "(()=>{
  const b=document.querySelector('button[aria-label=\"راهنمای میان‌برهای کیبورد\"]');
  if(!b)return 'NO-GUIDE-BTN-FROM-DICT'; b.click(); return 'GUIDE-FROM-DICT';
})()" | tee -a "$OUT"
sleep 1.5
ev "(()=>{
  const row=document.querySelector('[data-testid=\"return-door-konkur\"]');
  if(!row)return 'NO-KONKUR-ROW'; row.click(); return 'KONKUR-ROW-CLICK';
})()" | tee -a "$OUT"
sleep 2
ev "(()=>{
  const home=document.querySelector('[aria-label=\"باز کردن کتاب\"]');
  const dict=document.querySelector('[aria-label=\"رفتن به واژه‌های من\"]');
  const guide=document.querySelector('[data-testid=\"shortcut-guide-return-cluster\"]');
  const konkur=document.querySelector('[aria-label=\"نقشهٔ پیشرفت بانک کنکور\"]');
  if(guide)return 'GUIDE-STILL-OPEN';
  if(!home)return 'NOT-HOME';
  if(dict)return 'DICT-STILL-HERE';
  if(konkur)return 'KONKUR-VIEW-UNEXPECTED';
  return 'JUMP-OK home-yes dict-no konkur-no';
})()" | tee -a "$OUT"
shot r367-after-jump-home.png

echo "########## F) EventDay + کنسولِ دوفازی" | tee -a "$OUT"
curl -s "$BASE/api/event" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{const j=JSON.parse(s);const g=n=>{const e=(j.events||[]).find(x=>x.name===n);return e?e.total:'MISS';};console.log('APP_OPEN='+g('app_open'));})" | tee -a "$OUT"

CONSOLE_OUT=$(agent-browser console 2>&1 || true)
echo "$CONSOLE_OUT" | tee -a "$OUT" | grep -v "Download the React DevTools" > /tmp/r367-console-filtered.txt
if grep -qiE "requires a \`DialogTitle\`|Missing \`Description\`" /tmp/r367-console-filtered.txt; then
  echo "RADIX-A11Y-DIRTY" | tee -a "$OUT"; agent-browser close >/dev/null 2>&1; exit 1
fi
echo "RADIX-A11Y-CLEAN" | tee -a "$OUT"
if grep -qiE "error|warn" /tmp/r367-console-filtered.txt; then
  echo "CONSOLE-DIRTY" | tee -a "$OUT"; agent-browser close >/dev/null 2>&1; exit 1
fi
echo "CONSOLE-CLEAN" | tee -a "$OUT"

echo "########## CLEAN-RUN" | tee -a "$OUT"
agent-browser close >/dev/null 2>&1 || true
echo "r367 QA DONE — خوشهٔ بازگشت رویِ راهنمایِ زنده پنجدره شد" | tee -a "$OUT"
