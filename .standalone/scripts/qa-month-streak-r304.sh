#!/usr/bin/env bash
# ------------------------------------------------------------------
# Task 304 — «ماه‌نامهٔ خواندن» — دو سطحِ تازه:
#   A) نوارِ ۳۰روزهٔ خواندن در نوارِ کتاب‌خانهٔ هفته‌نامه (گریدِ ۳۰ستونی؛
#      خانهٔ امروز حلقه‌دار؛ بی‌سابقه مخفی — سیاستِ r302)
#   B) نوارِ رکوردِ زنجیره در کارتِ «ادامهٔ خواندن» (از ۲ روزِ سابقه؛
#      جاری در برابرِ رکورد — «به رکورد رسیدی» یا «N از M روزِ رکورد»)
# خروجیِ evalها pipe-ای (درسِ r301)؛ رشته‌های فارسی از سورسِ همین راند
# کپی شده‌اند (درسِ نیم‌فاصلهٔ r302)؛ چک‌ها \s+-نرمال (درسِ r303).
#   ① اطمینانِ سرور
#   ② نشستِ تازه: نوارِ ماه‌نامه در هفته‌نامه نیست (سیاستِ مخفی)
#   ③ سه‌روزه: باند «ماهِ گذشته: ۳ داستان در ۳ روز» + ۳۰ خانه + حلقهٔ امروز
#      + خانه «به رکورد رسیدی — ۳ روز» + PNG سبز (دودِ canvas)
#   ④ رکورد (جاری ۲ / رکورد ۳، یک روزِ ۲داستانی): «۲ از ۳ روزِ رکورد» +
#      «ماهِ گذشته: ۶ داستان در ۵ روز · پرکارترین: ۲ داستان»
#   ⑤ موبایلِ ۳۹۰ تاریک: docW=390 + خانه‌ها و نوارِ رکورد دیدنی
# خروجی: QA-MONTH result=...
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
DAYFN="function DAY(n){const d=new Date();d.setDate(d.getDate()-n);return d.getFullYear()+\"-\"+String(d.getMonth()+1).padStart(2,\"0\")+\"-\"+String(d.getDate()).padStart(2,\"0\");}"
SEED_LIB="const done={}; for(const id of [\"s1-1\",\"s1-2\",\"s1-3\",\"s1-4\",\"s1-5\"]) done[id]={score:5,total:6,day:DAY(0)}; st.libraryDone=done;"
IDENT="st.userName=\"کیانا ب\"; st.avatarColor=\"emerald\"; st.onboarded=true;"

concheck() {
  agent-browser console 2>/dev/null | rg -i "error" | rg -v "Download the React DevTools|Image with src|third-party" | head -3 | tr '\n' '~'
}

code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 8 "$BASE" 2>/dev/null)
if [ "$code" != "200" ]; then
  nohup bun run dev > /tmp/dev-server.log 2>&1 &
  for i in 1 2 3 4 5 6; do
    sleep 5
    code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 8 "$BASE" 2>/dev/null)
    [ "$code" = "200" ] && break
  done
fi
[ "$code" = "200" ] || { echo "QA-MONTH result=FAILED reason=server-down code=$code"; exit 1; }

agent-browser set viewport 1280 900 >/dev/null 2>&1 || true
agent-browser open "$BASE" >/dev/null 2>&1
sleep 2
agent-browser console --clear >/dev/null 2>&1 || true
wait_dom() {
  for i in 1 2 3 4 5 6 7 8 9 10; do
    R=$(agent-browser eval "(()=>{return document.body && document.body.innerText.length>200 ? 'yes':'no';})()" 2>/dev/null | tr -d '"')
    [ "$R" = "yes" ] && return 0
    sleep 2
  done
  return 0
}
open_report() {
  agent-browser eval "(()=>{const b=[...document.querySelectorAll('button')].find(x=>(x.textContent||'').includes('کارنامهٔ من')); if(b){b.click(); return 'open';} return 'no-btn';})()" >/dev/null 2>&1
  sleep 3
}

# ---------- ② نشستِ تازه — سیاستِ مخفی ----------
agent-browser eval "(()=>{localStorage.clear(); sessionStorage.clear(); location.reload(); return 'cleared';})()" >/dev/null 2>&1
sleep 6
agent-browser eval "(()=>{const K=\"vision2-study-v1\"; const s=JSON.parse(localStorage.getItem(K)||\"{}\"); const st=s.state||{}; $IDENT s.state=st; localStorage.setItem(K,JSON.stringify(s)); return \"id-ok\";})()" >/dev/null 2>&1
agent-browser open "$BASE" >/dev/null 2>&1; sleep 5
wait_dom
open_report
FRESH=$(agent-browser eval "(()=>{const t=document.body.innerText.replace(/\s+/g,' '); const band=[...document.querySelectorAll('div')].find(x=>x.className&&String(x.className).includes('library-band')); const bt=band?band.innerText.replace(/\s+/g,' '):''; return [bt.includes(\"ماهِ گذشته\")?1:0, bt.includes(\"زنجیرهٔ خواندن\")?1:0, document.querySelectorAll('[data-level]').length].join(\"|\");})()" 2>/dev/null | tr -d '"')
echo "step2-fresh-band: $FRESH"
echo "$FRESH" | rg -q '^0\|0\|0$' || { echo "QA-MONTH result=FAILED reason=fresh-month-visible got=$FRESH"; exit 1; }
agent-browser press "Escape" >/dev/null 2>&1; sleep 1.5

# ---------- ③ سه‌روزه — نوارِ ماه + نوارِ رکورد در خانه ----------
agent-browser eval "(()=>{try{const K=\"vision2-study-v1\"; const raw=localStorage.getItem(K); const s=raw?JSON.parse(raw):{}; const st=s.state||{}; $DAYFN $SEED_LIB st.dayHistory={}; for(const n of [0,1,2]) st.dayHistory[DAY(n)]={day:DAY(n),reviews:0,quizzes:0,words:0,dictation:0,rush:0,stories:1}; $IDENT s.state=st; localStorage.setItem(K,JSON.stringify(s)); return \"seed-ok\";}catch(e){return \"fail:\"+e.message;}})()" >/dev/null 2>&1
agent-browser open "$BASE" >/dev/null 2>&1; sleep 5
wait_dom
H3=$(agent-browser eval "(()=>{const t=document.body.innerText.replace(/\s+/g,' '); const bar=document.querySelector('[aria-label=\"رکوردِ زنجیرهٔ خواندن: ۳ روز\"]'); return [t.includes(\"به رکورد رسیدی — ۳ روز\")?1:0, bar?1:0].join(\"|\");})()" 2>/dev/null | tr -d '"')
echo "step3-home-record: $H3"
echo "$H3" | rg -q '^1\|1$' || { echo "QA-MONTH result=FAILED reason=home-record-3day got=$H3"; exit 1; }
agent-browser screenshot /tmp/r304-home-record.png >/dev/null 2>&1
open_report
M3=$(agent-browser eval "(()=>{const band=[...document.querySelectorAll('div')].find(x=>x.className&&String(x.className).includes('library-band')); const bt=band?band.innerText.replace(/\s+/g,' '):''; const cells=band?band.querySelectorAll('[data-level]').length:0; const today=band?band.querySelectorAll('[data-level][data-today=\"1\"]').length:0; const l2=band?band.querySelectorAll('[data-level=\"1\"]').length:0; return [bt.includes(\"ماهِ گذشته: ۳ داستان در ۳ روز\")?1:0, bt.includes(\"پرکارترین\")?1:0, cells, today, l2].join(\"|\");})()" 2>/dev/null | tr -d '"')
echo "step3-weekly-month: $M3"
echo "$M3" | rg -q '^1\|0\|30\|1\|3$' || { echo "QA-MONTH result=FAILED reason=weekly-month-3day got=$M3"; exit 1; }
agent-browser screenshot /tmp/r304-weekly-month.png >/dev/null 2>&1
# دودِ canvas — دکمهٔ PNG از همین سطح (r303: بهترین تستِ دودِ بوم)
agent-browser eval "(()=>{const b=[...document.querySelectorAll('button')].find(x=>(x.getAttribute('aria-label')||'').includes('عکس هفته‌نامه')); if(b){b.click(); return 'clicked';} return 'no-btn';})()" >/dev/null 2>&1
sleep 3
PNG3=$(agent-browser eval "(()=>{const t=document.body.innerText; return [t.includes(\"عکسِ هفته‌نامه ذخیره شد\")?1:0, t.includes(\"خطا در ساخت تصویر\")?1:0].join(\"|\");})()" 2>/dev/null | tr -d '"')
CC3=$(concheck)
echo "step3-png: $PNG3 console=$CC3"
echo "$PNG3" | rg -q '^1\|0$' || { echo "QA-MONTH result=FAILED reason=png-smoke got=$PNG3 console=$CC3"; exit 1; }
agent-browser press "Escape" >/dev/null 2>&1; sleep 1.5

# ---------- ④ رکورد: جاری ۲ (روز ۱و۲) / رکورد ۳ (روز ۴و۵و۶؛ روزِ ۴ = ۲ داستان) ----------
agent-browser eval "(()=>{try{const K=\"vision2-study-v1\"; const s=JSON.parse(localStorage.getItem(K)); const st=s.state; $DAYFN st.dayHistory={}; st.dayHistory[DAY(1)]={day:DAY(1),reviews:0,quizzes:0,words:0,dictation:0,rush:0,stories:1}; st.dayHistory[DAY(2)]={day:DAY(2),reviews:0,quizzes:0,words:0,dictation:0,rush:0,stories:1}; st.dayHistory[DAY(4)]={day:DAY(4),reviews:0,quizzes:0,words:0,dictation:0,rush:0,stories:2}; st.dayHistory[DAY(5)]={day:DAY(5),reviews:0,quizzes:0,words:0,dictation:0,rush:0,stories:1}; st.dayHistory[DAY(6)]={day:DAY(6),reviews:0,quizzes:0,words:0,dictation:0,rush:0,stories:1}; s.state=st; localStorage.setItem(K,JSON.stringify(s)); return \"ok\";}catch(e){return \"fail:\"+e.message;}})()" >/dev/null 2>&1
agent-browser open "$BASE" >/dev/null 2>&1; sleep 5
wait_dom
H4=$(agent-browser eval "(()=>{const t=document.body.innerText.replace(/\s+/g,' '); return [t.includes(\"۲ از ۳ روزِ رکورد\")?1:0, t.includes(\"به رکورد رسیدی\")?1:0].join(\"|\");})()" 2>/dev/null | tr -d '"')
echo "step4-home-chase: $H4"
echo "$H4" | rg -q '^1\|0$' || { echo "QA-MONTH result=FAILED reason=home-chase got=$H4"; exit 1; }
open_report
M4=$(agent-browser eval "(()=>{const band=[...document.querySelectorAll('div')].find(x=>x.className&&String(x.className).includes('library-band')); const bt=band?band.innerText.replace(/\s+/g,' '):''; const l2=band?band.querySelectorAll('[data-level=\"2\"]').length:0; const l3=band?band.querySelectorAll('[data-level=\"3\"]').length:0; return [bt.includes(\"ماهِ گذشته: ۶ داستان در ۵ روز · پرکارترین: ۲ داستان\")?1:0, l2, l3].join(\"|\");})()" 2>/dev/null | tr -d '"')
echo "step4-weekly-month: $M4"
echo "$M4" | rg -q '^1\|1\|0$' || { echo "QA-MONTH result=FAILED reason=weekly-month-record got=$M4"; exit 1; }
agent-browser screenshot /tmp/r304-weekly-record.png >/dev/null 2>&1
agent-browser press "Escape" >/dev/null 2>&1; sleep 1.5

# ---------- ⑤ موبایلِ ۳۹۰ تاریک ----------
agent-browser set viewport 390 844 >/dev/null 2>&1 || true
sleep 2
agent-browser eval "(()=>{document.documentElement.classList.add(\"dark\"); return \"dark\";})()" >/dev/null 2>&1
sleep 2
MOB=$(agent-browser eval "(()=>{const bar=document.querySelector('[aria-label=\"رکوردِ زنجیرهٔ خواندن: ۳ روز\"]'); const r=bar?bar.getBoundingClientRect():null; return [document.documentElement.scrollWidth, window.innerWidth, r&&r.width>0&&r.height>0?1:0].join(\"|\");})()" 2>/dev/null | tr -d '"')
echo "step5-mobile-home: $MOB"
echo "$MOB" | rg -q '^390\|390\|1$' || { echo "QA-MONTH result=FAILED reason=mobile-home got=$MOB"; exit 1; }
agent-browser screenshot /tmp/r304-mobile-dark-home.png >/dev/null 2>&1
open_report
STRIP=$(agent-browser eval "(()=>{const band=[...document.querySelectorAll('div')].find(x=>x.className&&String(x.className).includes('library-band')); const cell=band?band.querySelector('[data-level]'):null; const cr=cell?cell.getBoundingClientRect():null; return [document.documentElement.scrollWidth, window.innerWidth, cr&&cr.width>0&&cr.height>0?1:0].join(\"|\");})()" 2>/dev/null | tr -d '"')
echo "step5-mobile-strip: $STRIP"
echo "$STRIP" | rg -q '^390\|390\|1$' || { echo "QA-MONTH result=FAILED reason=mobile-strip got=$STRIP"; exit 1; }
agent-browser screenshot /tmp/r304-mobile-dark-weekly.png >/dev/null 2>&1

echo "QA-MONTH result=PASS"
