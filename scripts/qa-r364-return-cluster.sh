#!/usr/bin/env bash
# ------------------------------------------------------------------
# r364 — داوریِ زندهٔ «خوشهٔ بازگشت» — درهایِ چهارم (ادامهٔ کنکور) و
# پنجم (بازگشت به میدان). تک سشن مرورگر، بدونِ تزریقِ داده: هر عددی
# که داوری میشود از کنشِ واقعی آمده:
#   A) اتاقکِ تمیز: localStorage پاک → تازهوارد ⇒ هر دو کارت غایب
#   B) رانِ واقعیِ کنکور: شبیهسازِ ۱۰تایی تا نتیجه → خانه ⇒ کارتِ
#      «ادامهٔ کنکور — ۱۰ تستِ بانک را دیدی» (۱۰ ارقامِ فارسی) → پرش
#   C) نبردِ واقعی با داورِ ۳۰۰۳: مرورگر اتاق میسازد، joinerِ r287
#      («سارا») با سوکت میپیوندد و ۱۰ پاسخ میدهد، مرورگر هم پاسخ
#      میدهد → پایانِ داورشده → خانه ⇒ کارتِ «بازگشت به میدان» با
#      حریفِ واقعی → پرش
#   D) تیره + کنسولِ پاک
#   E) EventDay: konkur_start/duel_start/duel_done واقعی
# پاکسازیِ DB در گامِ جدا (qa-db-cleanup-r101 — duel/konkur allowlist).
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:81"   # سوکتِ داور از راهِ Caddy XTransformPort رد میشود — آیدیومِ r94/r287
EV=/home/z/my-project/qa-evidence
OUT=/tmp/r364-qa.txt
: > "$OUT"

# نگهبانِ سلامتِ خودترمیم — سرورِ مستقل در این محیط مستعدِ OOM است (درسِ r362)
ensure_app(){
  local C; C=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/" --max-time 4 2>/dev/null)
  if [ "$C" != "200" ]; then
    echo "APP-DOWN($C) — restarting standalone" | tee -a "$OUT"
    pkill -f "standalone/server.js" 2>/dev/null; sleep 2
    (cd /home/z/my-project && DATABASE_URL="file:/home/z/my-project/db/custom.db" TEACHER_ACCESS_CODE=moallem-1404 setsid nohup bun .next/standalone/server.js > /tmp/r364-qa-server.log 2>&1 &)
    sleep 10
    C=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/" --max-time 4 2>/dev/null)
    [ "$C" = "200" ] || { echo "APP-STILL-DOWN" | tee -a "$OUT"; return 1; }
  fi
  echo "APP-OK" | tee -a "$OUT"; return 0
}

shot(){ agent-browser screenshot "$EV/$1" >/dev/null 2>&1; }
ev(){ agent-browser eval "$1" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
wait_home(){ for i in $(seq 1 30); do
  local R; R=$(agent-browser eval "(()=>{const g=document.querySelector('[aria-label=\"ابزارهای یادگیری\"]');return g?'HOME-OK':'WAIT';})()" 2>/dev/null | tr -d '"')
  [ "$R" = "HOME-OK" ] && { echo "home-ready-${i}x3s" >> "$OUT"; return 0; }; sleep 3
done; echo "HOME-NEVER" | tee -a "$OUT"; return 1; }

echo "########## A) اتاقکِ تمیز — تازهوارد: هر دو کارت غایب" | tee -a "$OUT"
ensure_app || exit 1
agent-browser close >/dev/null 2>&1 || true
pkill -f "agent-browser/browsers" 2>/dev/null; sleep 1
agent-browser open "$BASE" >/dev/null 2>&1
agent-browser set viewport 1280 900 >/dev/null 2>&1
agent-browser wait 'body' >/dev/null 2>&1 || true
sleep 4
ev "(()=>{localStorage.clear(); return 'cleared';})()" >/dev/null 2>&1
agent-browser open "$BASE" >/dev/null 2>&1
sleep 4
# آنبوردینگِ تازهوارد قبل از هر سنجشهای رد میشود — خانه زیرِ دیالوگ رندر نمیشود
ev "(()=>{
  const skip=[...document.querySelectorAll('button')].find(x=>x.textContent.includes('ناشناس'));
  if(skip){skip.click(); return 'onboard-skipped';} return 'no-onboard';})()" | tee -a "$OUT"
sleep 2
wait_home || { agent-browser close >/dev/null 2>&1; exit 1; }
ev "(()=>{document.documentElement.classList.remove('dark');return 1;})()" >/dev/null 2>&1
ev "(()=>JSON.stringify({
  konkurAbsent:!document.querySelector('[data-konkur-resume]'),
  duelAbsent:!document.querySelector('[data-duel-resume]'),
  home:!!document.querySelector('[aria-label=\"ابزارهای یادگیری\"]')
}))()" | tee -a "$OUT"
shot r364-home-fresh.png

echo "########## B) رانِ واقعیِ کنکور — شبیهسازِ ۱۰تایی" | tee -a "$OUT"
ev "(()=>{
  const b=[...document.querySelectorAll('button')].find(x=>x.textContent.includes('گوشهٔ کنکور'));
  if(!b)return 'NO-KONKUR-CARD'; b.click(); return 'konkur-opened';})()" >/dev/null 2>&1
sleep 2.5
ev "(()=>{
  const ten=[...document.querySelectorAll('button')].find(x=>x.getAttribute('aria-pressed')!==null&&x.textContent.trim()==='۱۰ تست');
  if(ten&&!ten.getAttribute('aria-pressed')){ten.click(); return 'count-10-selected';}
  return ten?'count-10-already':'NO-COUNT-GROUP';})()" >/dev/null 2>&1
# دکمهٔ شروع — ZWNJ-متحمل (شبیه‌ساز) + انتظارِ حاضرشدن (تا ۱۵ ثانیه)
START=""
for i in $(seq 1 10); do
  START=$(agent-browser eval "(()=>{const b=[...document.querySelectorAll('button')].find(x=>/شروع شبیه.?ساز کنکور/.test(x.textContent));if(!b)return 'NO-START';b.click();return 'sim-started';})()" 2>/dev/null | tr -d '"')
  [ "$START" = "sim-started" ] && break
  sleep 1.5
done
echo "SIM-START=$START" | tee -a "$OUT"
sleep 2
# حلقهٔ پاسخگوییِ واقعی: اولین گزینهٔ فعال + «سؤال بعدی/دیدن نتیجه»
# «waiting» سهبارِ پیاپی یعنی پایان (نه شکستِ اولیه — کوئیز هنوز رندر نشده)
WAITS=0
for i in $(seq 1 60); do
  R=$(agent-browser eval "(()=>{
    const next=document.querySelector('[data-quiz-next]');
    if(next&&!next.disabled){next.click(); return 'next';}
    const opts=[...document.querySelectorAll('[data-quiz-option]')].filter(o=>!o.disabled&&o.offsetParent!==null);
    if(opts.length){opts[0].click(); return 'answered';}
    return 'waiting';})()" 2>/dev/null | tr -d '"')
  if [ "$R" = "waiting" ]; then WAITS=$((WAITS+1)); [ $WAITS -ge 4 ] && break; else WAITS=0; fi
  sleep 0.7
done
sleep 2
ev "(()=>{try{const st=JSON.parse(localStorage.getItem('vision2-study-v1')||'{}');return 'STORE-SEEN='+Object.keys(st.state?.konkurSeen||{}).length;}catch(e){return 'STORE-ERR';}})()" | tee -a "$OUT"
# بازگشتِ صادقانه: ری‌لود — کارت باید از persistِ خودِ استور رندر شود (اثباتِ پابرجایی)
agent-browser open "$BASE" >/dev/null 2>&1
sleep 3
wait_home || { agent-browser close >/dev/null 2>&1; exit 1; }
ev "(()=>{
  const c=document.querySelector('[data-konkur-resume]');
  if(!c)return 'NO-KONKUR-CARD-AFTER-REAL-DRIVE';
  return JSON.stringify({
    seen:c.getAttribute('data-konkur-seen'),
    wrong:c.getAttribute('data-konkur-wrong'),
    title:c.textContent.match(/ادامهٔ کنکور[^—]*— [^ت]*تستِ بانک را دیدی/)?.[0]||'TITLE-SHAPE-BAD',
    titleHas10:c.textContent.includes('۱۰ تستِ بانک را دیدی')
  });})()" | tee -a "$OUT"
shot r364-konkur-card.png
ev "(()=>{
  const c=document.querySelector('[data-konkur-resume]');
  if(!c)return 'NO-CARD'; c.click(); return 'jumped';})()" >/dev/null 2>&1
sleep 2
ev "(()=>JSON.stringify({backInKonkur:document.body.textContent.includes('نقشهٔ پیشرفت بانک')}))()" | tee -a "$OUT"

echo "########## C) نبردِ واقعی با داورِ ۳۰۰۳ — joinerِ بلیتآگاهِ r287 (سارا)" | tee -a "$OUT"
ensure_app || exit 1
# بازگشت به خانه از کنکور: ری‌لود (view در persist نیست — ری‌لود یعنی خانه)
agent-browser open "$BASE" >/dev/null 2>&1
sleep 3
wait_home || { agent-browser close >/dev/null 2>&1; exit 1; }
ev "(()=>{
  const b=[...document.querySelectorAll('button')].find(x=>x.textContent.includes('نبرد دودنفره'));
  if(!b)return 'NO-DUEL-CARD'; b.click(); return 'duel-opened';})()" >/dev/null 2>&1
sleep 2.5
# ساخت اتاق — دکمه تا آنلاینشدنِ سوکت disabled است؛ تا ۲۰ ثانیه صبر
CREATE=""
for i in $(seq 1 10); do
  CREATE=$(agent-browser eval "(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent.includes('ساخت اتاق نبرد'));if(!b)return 'NO-CREATE';if(b.disabled)return 'DISABLED';b.click();return 'room-creating';})()" 2>/dev/null | tr -d '"')
  [ "$CREATE" = "room-creating" ] && break
  sleep 2
done
echo "CREATE=$CREATE" | tee -a "$OUT"
sleep 3
CODE=$(agent-browser eval "(()=>{
  const el=document.querySelector('.duel-code');
  if(!el)return 'NO-CODE';
  const m=(el.getAttribute('aria-label')||'').match(/کد اتاق ([A-Z0-9]{5})/);
  return m?m[1]:'CODE-MISS';})()" 2>/dev/null | tr -d '"')
echo "ROOM-CODE=$CODE" | tee -a "$OUT"
[ "$CODE" = "NO-CODE" ] || [ "$CODE" = "CODE-MISS" ] || [ -z "$CODE" ] && { echo "ROOM-CODE-FAIL" | tee -a "$OUT"; agent-browser close >/dev/null 2>&1; exit 1; }
bun scripts/qa-duel-joiner-r287.mjs "$CODE" >/tmp/r364-joiner.log 2>&1 &
agent-browser eval 'window.__r364 = setInterval(() => {
  const opts=[...document.querySelectorAll("[data-duel-option]")].filter(o=>!o.disabled&&o.offsetParent!==null);
  if(opts.length) opts[0].click();
}, 1100); "loop-started"' >/dev/null 2>&1
DONE=0
for i in $(seq 1 45); do
  sleep 3
  S=$(agent-browser eval "(()=>document.body.textContent.includes('کارنامهٔ نبرد')||document.body.textContent.includes('رسیدِ امضاشدهٔ داور')?'DONE':'WAIT')()" 2>/dev/null | tr -d '"')
  [ "$S" = "DONE" ] && { DONE=1; break; }
done
agent-browser eval 'clearInterval(window.__r364); "loop-cleared"' >/dev/null 2>&1
[ "$DONE" = "1" ] && echo "DUEL-ENDED-ARBITRATED ✓" | tee -a "$OUT" || { echo "DUEL-TIMEOUT" | tee -a "$OUT"; cat /tmp/r364-joiner.log >> "$OUT"; }
sleep 1.5
ev "(()=>{try{const st=JSON.parse(localStorage.getItem('vision2-study-v1')||'{}');return 'STORE-DUELS='+Object.keys(st.state?.duelHistory||{}).length;}catch(e){return 'STORE-ERR';}})()" | tee -a "$OUT"
# بازگشت از پایانِ نبرد: ری‌لود — رکوردِ دفترچه از persist میآید
agent-browser open "$BASE" >/dev/null 2>&1
sleep 3
wait_home || { agent-browser close >/dev/null 2>&1; exit 1; }
ev "(()=>{
  const c=document.querySelector('[data-duel-resume]');
  if(!c)return 'NO-DUEL-CARD-AFTER-REAL-DUEL';
  return JSON.stringify({
    outcome:c.getAttribute('data-duel-outcome'),
    opponent:c.getAttribute('data-duel-opponent'),
    title:c.textContent.includes('بازگشت به میدان — آخرین مصاف با سارا'),
    scorePersian:/\d+–\d+/.test(c.textContent.replace(/[۰-۹]/g,d=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d))),
    timeAgo:c.textContent.includes('پیش')
  });})()" | tee -a "$OUT"
shot r364-duel-card.png
ev "(()=>{
  const c=document.querySelector('[data-duel-resume]');
  if(!c)return 'NO-CARD'; c.click(); return 'jumped';})()" >/dev/null 2>&1
sleep 2
ev "(()=>JSON.stringify({backInArena:document.body.textContent.includes('ساخت اتاق نبرد')}))()" | tee -a "$OUT"

echo "########## D) تیره" | tee -a "$OUT"
ev "(()=>{
  const home=[...document.querySelectorAll('button,a')].find(x=>x.getAttribute('aria-label')==='خانه');
  if(home){home.click();} return 'to-home';})()" >/dev/null 2>&1
sleep 2
agent-browser eval "(()=>{document.documentElement.classList.add('dark');return 'dark-on';})()" >/dev/null 2>&1
sleep 1
shot r364-cluster-dark.png
agent-browser eval "(()=>{document.documentElement.classList.remove('dark');return 'dark-off';})()" >/dev/null 2>&1

echo "########## E) EventDay — رویدادهایِ واقعیِ این سشن" | tee -a "$OUT"
curl -s "$BASE/api/event" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{const j=JSON.parse(s);const g=n=>{const e=(j.events||[]).find(x=>x.name===n);return e?e.total:'MISS';};console.log('KONKUR_START='+g('konkur_start')+' DUEL_START='+g('duel_start')+' DUEL_DONE='+g('duel_done')+' QUIZ_DONE='+g('quiz_done'));})" | tee -a "$OUT"

echo "########## F) کنسول" | tee -a "$OUT"
agent-browser console 2>&1 | tee -a "$OUT" | grep -qiE "error|warn" && { echo "CONSOLE-DIRTY" | tee -a "$OUT"; agent-browser close >/dev/null 2>&1; exit 1; }
echo "CONSOLE-CLEAN" | tee -a "$OUT"

echo "########## CLEAN-RUN" | tee -a "$OUT"
agent-browser close >/dev/null 2>&1 || true
echo "r364 QA DONE — خوشهٔ بازگشت با دادهٔ کاملاً واقعی داوری شد" | tee -a "$OUT"
