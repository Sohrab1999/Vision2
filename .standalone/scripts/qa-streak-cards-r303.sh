#!/usr/bin/env bash
# ------------------------------------------------------------------
# Task 303 — «استریک روی کارت‌ها» — دو سطحِ تازه:
#   A) خطِ استریکِ کتابخوانی در عکسِ PNG هفته‌نامه (زیرِ حلقهٔ هدف؛
#      گاردهای رسمی: clickِ دکمهٔ PNG = مسیرِ واقعیِ کشیدنِ بوم —
#      خطای رانتایم در toast/کنسول خودش را نشان میدهد)
#   B) آیتمِ «زنجیرهٔ خواندن» در سربرگِ کارنامهٔ رسمی (کنارِ «زنجیرهٔ فعلی»)
# خروجیِ evalها: pipe-ای (درسِ r301)؛ رشته‌های فارسی از اسکریپتِ سبزِ قبلی
# کپی میشوند (درسِ نیم‌فاصلهٔ r302).
#   ① اطمینانِ سرور
#   ② نشستِ تازه: کارنامهٔ رسمی «زنجیرهٔ خواندن» ندارد + PNG سبز (بی‌کتاب‌خانه)
#   ③ سه‌روزه: سربرگِ رسمی «زنجیرهٔ خواندن: ۳ روز» + PNG سبز (با کتاب‌خانه)
#   ④ رکورد (جاری ۲ / رکورد ۴): «زنجیرهٔ خواندن: ۲ روز» + «(رکورد: ۴)»
#   ⑤ موبایلِ ۳۹۰ تاریک: docW=390 + آیتمِ سربرگ دیدنی (flex-wrap امن)
# خروجی: QA-CARDS result=...
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
[ "$code" = "200" ] || { echo "QA-CARDS result=FAILED reason=server-down code=$code"; exit 1; }

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
open_official() {
  open_report
  # داخلِ دیالوگِ هفتگی: «گزارش رسمی چاپی (PDF)» → دیالوگِ رسمی (رویدادِ open-official-report)
  agent-browser eval "(()=>{const b=[...document.querySelectorAll('button')].find(x=>(x.textContent||'').includes('گزارش رسمی چاپی')); if(b){b.click(); return 'official';} return 'no-btn';})()" >/dev/null 2>&1
  sleep 3
  # راستی‌آزماییِ بازشدن: اگر نیامده بود، از پالتِ فرمان (Ctrl+K) مستقیم برو
  OK=$(agent-browser eval "(()=>{return document.body.innerText.includes("کد یادگیرنده")?'yes':'no';})()" 2>/dev/null | tr -d '"')
  if [ "$OK" != "yes" ]; then
    agent-browser press "Escape" >/dev/null 2>&1; sleep 1
    agent-browser press "Control+k" >/dev/null 2>&1; sleep 0.9
    agent-browser keyboard type "گزارش رسمی" >/dev/null 2>&1; sleep 1
    agent-browser press "Enter" >/dev/null 2>&1; sleep 3
  fi
}
click_png() {
  agent-browser eval "(()=>{const b=[...document.querySelectorAll('button')].find(x=>(x.getAttribute('aria-label')||'').includes('عکس هفته‌نامه')); if(b){b.click(); return 'clicked';} return 'no-btn';})()" >/dev/null 2>&1
  sleep 3
}

# ---------- ② نشستِ تازه ----------
agent-browser eval "(()=>{localStorage.clear(); sessionStorage.clear(); location.reload(); return 'cleared';})()" >/dev/null 2>&1
sleep 6
agent-browser eval "(()=>{const K=\"vision2-study-v1\"; const s=JSON.parse(localStorage.getItem(K)||\"{}\"); const st=s.state||{}; $IDENT s.state=st; localStorage.setItem(K,JSON.stringify(s)); return \"id-ok\";})()" >/dev/null 2>&1
agent-browser open "$BASE" >/dev/null 2>&1; sleep 5
wait_dom
open_official
FRESH=$(agent-browser eval "(()=>{const t=document.body.innerText; return [t.includes(\"زنجیرهٔ فعلی\")?1:0, t.includes(\"زنجیرهٔ خواندن\")?1:0, t.includes(\"هفته‌نامهٔ پیشرفت\")?1:0].join(\"|\");})()" 2>/dev/null | tr -d '"')
echo "step2-fresh-report: $FRESH"
echo "$FRESH" | rg -q '^1\|0\|0$' || { echo "QA-CARDS result=FAILED reason=fresh-report-streak got=$FRESH"; exit 1; }
agent-browser press "Escape" >/dev/null 2>&1; sleep 1.5
open_report
click_png
TOAST=$(agent-browser eval "(()=>{const t=document.body.innerText; return [t.includes(\"عکسِ هفته‌نامه ذخیره شد\")?1:0, t.includes(\"خطا در ساخت تصویر\")?1:0].join(\"|\");})()" 2>/dev/null | tr -d '"')
CC=$(concheck)
echo "step2-png: $TOAST console=$CC"
echo "$TOAST" | rg -q '^1\|0$' || { echo "QA-CARDS result=FAILED reason=png-fresh-failed got=$TOAST console=$CC"; exit 1; }

# ---------- ③ سه‌روزه ----------
SEED3=$(agent-browser eval "(()=>{try{const K=\"vision2-study-v1\"; const raw=localStorage.getItem(K); const s=raw?JSON.parse(raw):{}; const st=s.state||{}; $DAYFN $SEED_LIB st.dayHistory={}; for(const n of [0,1,2]) st.dayHistory[DAY(n)]={day:DAY(n),reviews:0,quizzes:0,words:0,dictation:0,rush:0,stories:1}; $IDENT s.state=st; localStorage.setItem(K,JSON.stringify(s)); return \"seed-ok\";}catch(e){return \"fail:\"+e.message;}})()" 2>/dev/null | tr -d '"')
echo "step3-seed: $SEED3"
agent-browser open "$BASE" >/dev/null 2>&1; sleep 5
wait_dom
open_official
R3=$(agent-browser eval "(()=>{const info=[...document.querySelectorAll('div')].find(x=>String(x.className).includes('or-kpi-neutral')&&(x.innerText||'').includes('نام:')); const t=(info?info.innerText:'').replace(/\s+/g,' '); return [t.includes(\"زنجیرهٔ خواندن: ۳ روز\")?1:0, t.includes(\"رکورد\")?1:0].join(\"|\");})()" 2>/dev/null | tr -d '"')
echo "step3-report-3day: $R3"
echo "$R3" | rg -q '^1\|0$' || { echo "QA-CARDS result=FAILED reason=report-3day got=$R3"; exit 1; }
# weekly dialog: band line + PNG from the weekly surface
agent-browser press "Escape" >/dev/null 2>&1; sleep 1.5
open_report
WK3=$(agent-browser eval "(()=>{const band=[...document.querySelectorAll('div')].find(x=>x.className&&String(x.className).includes('library-band')); const bt=band?band.innerText:''; return [bt.includes(\"زنجیرهٔ خواندن — ۳ روز\")?1:0, bt.includes(\"۵ داستان این هفته\")?1:0].join(\"|\");})()" 2>/dev/null | tr -d '"')
echo "step3-weekly-band: $WK3"
echo "$WK3" | rg -q '^1\|1$' || { echo "QA-CARDS result=FAILED reason=weekly-band-3day got=$WK3"; exit 1; }
click_png
TOAST3=$(agent-browser eval "(()=>{const t=document.body.innerText; return [t.includes(\"عکسِ هفته‌نامه ذخیره شد\")?1:0, t.includes(\"خطا در ساخت تصویر\")?1:0].join(\"|\");})()" 2>/dev/null | tr -d '"')
CC3=$(concheck)
echo "step3-png: $TOAST3 console=$CC3"
echo "$TOAST3" | rg -q '^1\|0$' || { echo "QA-CARDS result=FAILED reason=png-3day-failed got=$TOAST3 console=$CC3"; exit 1; }
agent-browser screenshot /tmp/r303-report-3day.png >/dev/null 2>&1

# ---------- ④ رکورد: جاری ۲ + رکورد ۴ ----------
agent-browser eval "(()=>{try{const K=\"vision2-study-v1\"; const s=JSON.parse(localStorage.getItem(K)); const st=s.state; $DAYFN st.dayHistory={}; for(const n of [1,2,4,5,6,7]) st.dayHistory[DAY(n)]={day:DAY(n),reviews:0,quizzes:0,words:0,dictation:0,rush:0,stories:1}; s.state=st; localStorage.setItem(K,JSON.stringify(s)); return \"ok\";}catch(e){return \"fail:\"+e.message;}})()" >/dev/null 2>&1
agent-browser open "$BASE" >/dev/null 2>&1; sleep 5
wait_dom
open_official
R4=$(agent-browser eval "(()=>{const info=[...document.querySelectorAll('div')].find(x=>String(x.className).includes('or-kpi-neutral')&&(x.innerText||'').includes('نام:')); const t=(info?info.innerText:'').replace(/\s+/g,' '); return [t.includes(\"زنجیرهٔ خواندن: ۲ روز\")?1:0, t.includes(\"(رکورد: ۴)\")?1:0].join(\"|\");})()" 2>/dev/null | tr -d '"')
echo "step4-report-record: $R4"
echo "$R4" | rg -q '^1\|1$' || { echo "QA-CARDS result=FAILED reason=report-record got=$R4"; exit 1; }
agent-browser screenshot /tmp/r303-report-record.png >/dev/null 2>&1

# ---------- ⑤ موبایلِ ۳۹۰ تاریک ----------
agent-browser set viewport 390 844 >/dev/null 2>&1 || true
sleep 2
agent-browser eval "(()=>{document.documentElement.classList.add(\"dark\"); return \"dark\";})()" >/dev/null 2>&1
sleep 2
M=$(agent-browser eval "(()=>{const item=[...document.querySelectorAll('span')].find(s=>s.textContent.includes(\"زنجیرهٔ خواندن\")); const r=item?item.getBoundingClientRect():null; return [document.documentElement.scrollWidth, window.innerWidth, r&&r.width>0&&r.height>0?1:0].join(\"|\");})()" 2>/dev/null | tr -d '"')
echo "step5-mobile: $M"
echo "$M" | rg -q '^390\|390\|1$' || { echo "QA-CARDS result=FAILED reason=mobile got=$M"; exit 1; }
agent-browser screenshot /tmp/r303-report-mobile-dark.png >/dev/null 2>&1

echo "QA-CARDS result=PASS"
