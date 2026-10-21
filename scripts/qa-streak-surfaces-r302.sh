#!/usr/bin/env bash
# ------------------------------------------------------------------
# Task 302 — «رکوردِ زنجیره» — دو سطحِ تازهٔ عرضهٔ استریکِ کتابخوانی:
#   A) سطرِ «زنجیرهٔ خواندن» در نوارِ کتابخانهٔ هفته‌نامه (جاری + رکورد)
#   B) چیپِ استریک در سربرگِ کتابخانه — با گشتِ هندسهٔ زندهٔ r300
# خروجیِ همهٔ evalها: pipe-ای «1|1|...» (درسِ r301 — بدونِ JSON/کوتیشن)
#   ① اطمینانِ سرور
#   ② نشستِ تازه → تازه‌وارد: چیپِ استریک در کتابخانه نیست (بی‌سابقه)
#   ③ seedِ ۵ داستان + سه‌روزه → چیپِ کهرباییِ سربرگ + سطرِ هفته‌نامه + رکورد
#   ④ دوشوزه (امروز خالی) → «۲ روز پیوسته — امروز بخوان» در هر دو سطح
#   ⑤ شکافدار → سربرگِ «شروعِ زنجیرهٔ خواندن» + هفته‌نامهِ «قطع شده»
#   ⑥ موبایلِ ۳۹۰ تاریک: docW=390، h1 فشرده نمیشود (درسِ r300)، چیپها دیدنی
# خروجی: QA-STREAK2 result=...
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
LIBH1="(document.querySelector(\"h1\")||{textContent:\"\"}).textContent.includes(\"کتاب‌خانهٔ داستان‌ها\")"

code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 8 "$BASE" 2>/dev/null)
if [ "$code" != "200" ]; then
  nohup bun run dev > /tmp/dev-server.log 2>&1 &
  for i in 1 2 3 4 5 6; do
    sleep 5
    code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 8 "$BASE" 2>/dev/null)
    [ "$code" = "200" ] && break
  done
fi
[ "$code" = "200" ] || { echo "QA-STREAK2 result=FAILED reason=server-down code=$code"; exit 1; }

agent-browser set viewport 1280 900 >/dev/null 2>&1 || true
agent-browser open "$BASE" >/dev/null 2>&1
sleep 2
wait_dom() {
  for i in 1 2 3 4 5 6 7 8 9 10; do
    R=$(agent-browser eval "(()=>{return document.body && document.body.innerText.length>200 ? 'yes':'no';})()" 2>/dev/null | tr -d '"')
    [ "$R" = "yes" ] && return 0
    sleep 2
  done
  return 0
}

# ---------- ② نشستِ تازه → کتابخانه ----------
agent-browser eval "(()=>{localStorage.clear(); sessionStorage.clear(); location.reload(); return 'cleared';})()" >/dev/null 2>&1
sleep 6
# هویتِ حداقلی — مودالِ خوش‌آمد Ctrl+K را میبندد؛ تازه‌واردِ واقعی = بی‌libraryDone/dayHistory
agent-browser eval "(()=>{const K=\"vision2-study-v1\"; const s=JSON.parse(localStorage.getItem(K)||\"{}\"); const st=s.state||{}; st.userName=\"کیانا ب\"; st.avatarColor=\"emerald\"; st.onboarded=true; s.state=st; localStorage.setItem(K,JSON.stringify(s)); return \"id-ok\";})()" >/dev/null 2>&1
agent-browser open "$BASE" >/dev/null 2>&1; sleep 5
wait_dom
agent-browser press "Control+k" >/dev/null 2>&1; sleep 0.9
agent-browser keyboard type "کتاب‌خانهٔ داستان‌ها" >/dev/null 2>&1; sleep 1
agent-browser press "Enter" >/dev/null 2>&1; sleep 2
for _i in 1 2 3 4 5 6 7 8; do
  _H=$(agent-browser eval "(()=>{const h1=document.querySelector('h1'); return h1&&h1.textContent.includes('کتاب‌خانه')?'yes':'no';})()" 2>/dev/null | tr -d '"')
  [ "$_H" = "yes" ] && break
  sleep 1.5
done
FRESH=$(agent-browser eval "(()=>{const t=document.body.innerText; return [${LIBH1}?1:0, t.includes(\"زنجیرهٔ خواندن\")?1:0, t.includes(\"شروعِ زنجیرهٔ خواندن\")?1:0].join(\"|\");})()" 2>/dev/null | tr -d '"')
echo "step2-fresh-lib: $FRESH"
echo "$FRESH" | rg -q '^1\|0\|0$' || { echo "QA-STREAK2 result=FAILED reason=newcomer-sees-streak-chip got=$FRESH"; exit 1; }

# ---------- ③ seedِ ۵ داستان + سه‌روزه ----------
SEED=$(agent-browser eval "(()=>{try{
  const K=\"vision2-study-v1\"; const raw=localStorage.getItem(K);
  const s=raw?JSON.parse(raw):{}; const st=s.state||{};
  function DAY(n){const d=new Date();d.setDate(d.getDate()-n);return d.getFullYear()+\"-\"+String(d.getMonth()+1).padStart(2,\"0\")+\"-\"+String(d.getDate()).padStart(2,\"0\");}
  const done={};
  for(const id of [\"s1-1\",\"s1-2\",\"s1-3\",\"s1-4\",\"s1-5\"]) done[id]={score:5,total:6,day:DAY(0)};
  st.libraryDone=done; st.dayHistory={};
  for(const n of [0,1,2]) st.dayHistory[DAY(n)]={day:DAY(n),reviews:0,quizzes:0,words:0,dictation:0,rush:0,stories:1};
  st.userName=\"کیانا ب\"; st.avatarColor=\"emerald\"; st.onboarded=true;
  s.state=st; localStorage.setItem(K,JSON.stringify(s)); return \"seed-ok\";
}catch(e){ return \"fail:\"+e.message; }})()" 2>/dev/null | tr -d '"')
echo "step3-seed: $SEED"
agent-browser open "$BASE" >/dev/null 2>&1; sleep 5
wait_dom
agent-browser press "Control+k" >/dev/null 2>&1; sleep 0.9
agent-browser keyboard type "کتاب‌خانهٔ داستان‌ها" >/dev/null 2>&1; sleep 1
agent-browser press "Enter" >/dev/null 2>&1; sleep 3

CH=$(agent-browser eval "(()=>{const t=document.body.innerText; const h1=document.querySelector(\"h1\"); const hr=h1?h1.getBoundingClientRect():null; const chip=[...document.querySelectorAll('span')].find(s=>s.textContent.includes(\"زنجیرهٔ خواندن — ۳ روز\")); const cr=chip?chip.getBoundingClientRect():null; return [t.includes(\"زنجیرهٔ خواندن — ۳ روز\")?1:0, cr?Math.round(cr.width):0, hr?Math.round(hr.width):0].join(\"|\");})()" 2>/dev/null | tr -d '"')
echo "step3-lib-header: $CH"
echo "$CH" | rg -q '^1\|[1-9][0-9]*\|[1-9][0-9]*$' || { echo "QA-STREAK2 result=FAILED reason=header-chip-missing got=$CH"; exit 1; }
agent-browser screenshot /tmp/r302-lib-header-3day.png >/dev/null 2>&1

# هفته‌نامه: سطرِ زنجیره در نوارِ کتابخانه — با رکورد (بلندترین=۳=جاری → بدونِ رکورد)
agent-browser press "Control+k" >/dev/null 2>&1; sleep 0.9
agent-browser keyboard type "جلد کتاب" >/dev/null 2>&1; sleep 1
agent-browser press "Enter" >/dev/null 2>&1; sleep 3
# کارنامهٔ من → دیالوگِ هفته‌نامه (نوارِ کتابخانه داخلِ همین دیالوگ است)
agent-browser eval "(()=>{const b=[...document.querySelectorAll('button')].find(x=>(x.textContent||'').includes('کارنامهٔ من')); if(b){b.click(); return 'open';} return 'no-btn';})()" >/dev/null 2>&1
sleep 3
WK=$(agent-browser eval "(()=>{const t=document.body.innerText; const band=[...document.querySelectorAll('div')].find(x=>x.className&&String(x.className).includes('library-band')); const bt=band?band.innerText:''; return [bt.includes(\"کتاب‌خانهٔ داستان‌ها\")?1:0, bt.includes(\"زنجیرهٔ خواندن — ۳ روز\")?1:0, bt.includes(\"رکورد\")?1:0].join(\"|\");})()" 2>/dev/null | tr -d '"')
echo "step3-weekly-band: $WK"
echo "$WK" | rg -q '^1\|1\|0$' || { echo "QA-STREAK2 result=FAILED reason=weekly-streak-line got=$WK"; exit 1; }
agent-browser screenshot /tmp/r302-weekly-band-3day.png >/dev/null 2>&1

# ---------- ④ دوشوزه: امشب خالی — «امروز بخوان» + رکوردِ ۳ در هفته‌نامه ----------
agent-browser eval "(()=>{const K=\"vision2-study-v1\"; const s=JSON.parse(localStorage.getItem(K)); const st=s.state; function DAY(n){const d=new Date();d.setDate(d.getDate()-n);return d.getFullYear()+\"-\"+String(d.getMonth()+1).padStart(2,\"0\")+\"-\"+String(d.getDate()).padStart(2,\"0\");} st.dayHistory={}; for(const n of [1,2,4,5,6,7]) st.dayHistory[DAY(n)]={day:DAY(n),reviews:0,quizzes:0,words:0,dictation:0,rush:0,stories:1}; s.state=st; localStorage.setItem(K,JSON.stringify(s)); return \"ok\";})()" >/dev/null 2>&1
agent-browser open "$BASE" >/dev/null 2>&1; sleep 5
wait_dom
AL=$(agent-browser eval "(()=>{const t=document.body.innerText; return [t.includes(\"۲ روز پیوسته — امروز بخوان\")?1:0, t.includes(\"زنجیرهٔ خواندن — ۳ روز\")?1:0].join(\"|\");})()" 2>/dev/null | tr -d '"')
echo "step4-alive: $AL"
echo "$AL" | rg -q '^1\|0$' || { echo "QA-STREAK2 result=FAILED reason=alive-label got=$AL"; exit 1; }
agent-browser eval "(()=>{const b=[...document.querySelectorAll('button')].find(x=>(x.textContent||'').includes('کارنامهٔ من')); if(b){b.click(); return 'open';} return 'no-btn';})()" >/dev/null 2>&1; sleep 3
WK2=$(agent-browser eval "(()=>{const band=[...document.querySelectorAll('div')].find(x=>x.className&&String(x.className).includes('library-band')); const bt=band?band.innerText:''; return [bt.includes(\"امروز بخوان تا ننشیند\")?1:0, bt.includes(\"رکورد: ۴ روز\")?1:0].join(\"|\");})()" 2>/dev/null | tr -d '"')
echo "step4-weekly-record: $WK2"
echo "$WK2" | rg -q '^1\|1$' || { echo "QA-STREAK2 result=FAILED reason=weekly-alive-record got=$WK2"; exit 1; }

# ---------- ⑤ شکافدار: فقط سه روز پیش ----------
agent-browser eval "(()=>{const K=\"vision2-study-v1\"; const s=JSON.parse(localStorage.getItem(K)); const st=s.state; function DAY(n){const d=new Date();d.setDate(d.getDate()-n);return d.getFullYear()+\"-\"+String(d.getMonth()+1).padStart(2,\"0\")+\"-\"+String(d.getDate()).padStart(2,\"0\");} st.dayHistory={}; st.dayHistory[DAY(3)]={day:DAY(3),reviews:0,quizzes:0,words:0,dictation:0,rush:0,stories:2}; s.state=st; localStorage.setItem(K,JSON.stringify(s)); return \"ok\";})()" >/dev/null 2>&1
agent-browser open "$BASE" >/dev/null 2>&1; sleep 5
wait_dom
agent-browser eval "(()=>{const b=[...document.querySelectorAll('button,a')].find(x=>(x.textContent||'').includes('کتابخانه')); if(b){b.click(); return 'nav';} return 'no-nav';})()" >/dev/null 2>&1; sleep 3
GAP=$(agent-browser eval "(()=>{const t=document.body.innerText; return [t.includes(\"شروعِ زنجیرهٔ خواندن\")?1:0, t.includes(\"زنجیرهٔ خواندن — ۳ روز\")?1:0].join(\"|\");})()" 2>/dev/null | tr -d '"')
echo "step5-gap: $GAP"
echo "$GAP" | rg -q '^1\|0$' || { echo "QA-STREAK2 result=FAILED reason=gap-label got=$GAP"; exit 1; }

# ---------- ⑥ موبایلِ ۳۹۰ تاریک + هندسهٔ h1 ----------
agent-browser set viewport 390 844 >/dev/null 2>&1 || true
sleep 2
agent-browser eval "(()=>{document.documentElement.classList.add(\"dark\"); return \"dark\";})()" >/dev/null 2>&1
sleep 2
M=$(agent-browser eval "(()=>{const h1=document.querySelector(\"h1\"); const hr=h1?h1.getBoundingClientRect():null; const chips=[...document.querySelectorAll('span')].filter(s=>s.textContent.includes(\"از ۵۱ داستان\")||s.textContent.includes(\"شروعِ زنجیرهٔ خواندن\")); const vis=chips.filter(c=>{const r=c.getBoundingClientRect(); return r.width>0&&r.height>0;}); return [document.documentElement.scrollWidth, window.innerWidth, hr?Math.round(hr.width):0, vis.length].join(\"|\");})()" 2>/dev/null | tr -d '"')
echo "step6-mobile: $M"
echo "$M" | rg -q '^390\|390\|' || { echo "QA-STREAK2 result=FAILED reason=mobile-overflow got=$M"; exit 1; }
echo "$M" | rg -q '\|2$' || { echo "QA-STREAK2 result=FAILED reason=chips-invisible got=$M"; exit 1; }
H1W=$(echo "$M" | cut -d'|' -f3)
[ "$H1W" -ge 150 ] || { echo "QA-STREAK2 result=FAILED reason=h1-squeezed w=$H1W"; exit 1; }
agent-browser screenshot /tmp/r302-lib-mobile-dark.png >/dev/null 2>&1

echo "QA-STREAK2 result=PASS"
