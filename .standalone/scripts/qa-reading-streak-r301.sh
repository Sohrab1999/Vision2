#!/usr/bin/env bash
# ------------------------------------------------------------------
# Task 301 — «استریکِ کتابخوانی» — چیپِ زنجیرهٔ روزهای خواندن + چیپِ
# واژه/دقیقه روی کارتِ «ادامهٔ خواندن».
# خروجیِ همهٔ evalها: رشتهٔ سادهٔ جداشده با «|» — بدونِ JSON و بدونِ
# کوتیشن تا tr/rg هرگز قربانیِ escapeِ خروجیِ agent-browser نشود
# (درسِ دو شکستِ پیاپیِ همین اسکریپت).
#   ① اطمینانِ سرور (curl || restart — درسِ OOM)
#   ② نشستِ تازه → تازه‌وارد: کارتِ «ادامهٔ خواندن» اصلاً نیست
#   ③ seedِ ۵ داستان + dayHistoryِ سه‌روزه → «زنجیرهٔ خواندن — ۳ روز»
#      + «N واژه · حدود M دقیقه» + «داستان ۶»
#   ④ seedِ دوشوزه (امروز خالی) → «۲ روز پیوسته — امروز بخوان»
#   ⑤ seedِ شکافدار (فقطِ سه روز پیش) → «شروعِ زنجیرهٔ خواندن»
#   ⑥ موبایلِ ۳۹۰ تاریکِ واقعی → سرریزِ صفر + چیپِ دیدنی + اسکرین‌شات‌ها
# خروجی: QA-STREAK result=... (+ریشهٔ علت در شکست)
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
CARD="(x.getAttribute(\"aria-label\")||\"\")===\"ادامهٔ خواندن داستان‌ها\""
DAYFN="function DAY(n){const d=new Date();d.setDate(d.getDate()-n);return d.getFullYear()+\"-\"+String(d.getMonth()+1).padStart(2,\"0\")+\"-\"+String(d.getDate()).padStart(2,\"0\");}"

# ---------- ① اطمینانِ سرور ----------
code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 8 "$BASE" 2>/dev/null)
if [ "$code" != "200" ]; then
  nohup bun run dev > /tmp/dev-server.log 2>&1 &
  for i in 1 2 3 4 5 6; do
    sleep 5
    code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 8 "$BASE" 2>/dev/null)
    [ "$code" = "200" ] && break
  done
fi
if [ "$code" != "200" ]; then
  echo "QA-STREAK result=FAILED reason=server-down code=$code"
  exit 1
fi

agent-browser set viewport 1280 900 >/dev/null 2>&1 || true
agent-browser open "$BASE" >/dev/null 2>&1
sleep 2

# انتظارِ محتوایی — تا خودِ کارت/هیرو بیاید، نه readyStateِ صفحهٔ کهنه
wait_dom() {
  for i in 1 2 3 4 5 6 7 8 9 10; do
    R=$(agent-browser eval "(()=>{return document.body && document.body.innerText.length>200 ? 'yes' : 'no';})()" 2>/dev/null | tr -d '"')
    [ "$R" = "yes" ] && return 0
    sleep 2
  done
  return 0
}

# ---------- ② نشستِ تازه ----------
agent-browser eval "(()=>{localStorage.clear(); sessionStorage.clear(); location.reload(); return 'cleared';})()" >/dev/null 2>&1
sleep 6
wait_dom

FRESH=$(agent-browser eval "(()=>{const t=document.body.innerText; const sec=[...document.querySelectorAll('section')].some(x=>$CARD); return [sec?1:0, t.includes(\"آموزش زبان\")?1:0].join(\"|\");})()" 2>/dev/null | tr -d '"')
echo "step2-fresh: $FRESH"
echo "$FRESH" | rg -q '^0\|1$' || { echo "QA-STREAK result=FAILED reason=newcomer-card-or-hero-broken got=$FRESH"; exit 1; }

# ---------- ③ seedِ ۵ داستان + زنجیرهٔ سه‌روزه ----------
SEED=$(agent-browser eval "(()=>{try{
  const K=\"vision2-study-v1\"; const raw=localStorage.getItem(K);
  const s=raw?JSON.parse(raw):{}; const st=s.state||{};
  $DAYFN
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

CH1=$(agent-browser eval "(()=>{const sec=[...document.querySelectorAll('section')].find(x=>$CARD); if(!sec) return \"0|0|0|NO-CARD\"; const t=sec.innerText; const m=t.match(/واژه · حدود [۰-۹]+ دقیقه/); return [1, t.includes(\"زنجیرهٔ خواندن — ۳ روز\")?1:0, m?m[0]:\"NONE\", t.includes(\"داستان ۶\")?1:0].join(\"|\");})()" 2>/dev/null | tr -d '"')
echo "step3-chip: $CH1"
echo "$CH1" | rg -q '^1\|1\|' || { echo "QA-STREAK result=FAILED reason=streak-chip-3d-missing got=$CH1"; exit 1; }
echo "$CH1" | rg -q '\|NONE' && { echo "QA-STREAK result=FAILED reason=words-chip-missing got=$CH1"; exit 1; }
echo "$CH1" | rg -q '\|1$' || { echo "QA-STREAK result=FAILED reason=next-story-6-missing got=$CH1"; exit 1; }
agent-browser screenshot /tmp/r301-card-3day.png >/dev/null 2>&1

# ---------- ④ زنجیرهٔ زنده: دیروز و پریروز، امروز خالی ----------
agent-browser eval "(()=>{const K=\"vision2-study-v1\"; const s=JSON.parse(localStorage.getItem(K)); const st=s.state; $DAYFN; delete st.dayHistory[DAY(0)]; localStorage.setItem(K,JSON.stringify(s)); return \"ok\";})()" >/dev/null 2>&1
agent-browser open "$BASE" >/dev/null 2>&1; sleep 5
wait_dom

CH2=$(agent-browser eval "(()=>{const sec=[...document.querySelectorAll('section')].find(x=>$CARD); if(!sec) return \"0\"; return [1, sec.innerText.includes(\"۲ روز پیوسته — امروز بخوان\")?1:0].join(\"|\");})()" 2>/dev/null | tr -d '"')
echo "step4-alive: $CH2"
echo "$CH2" | rg -q '^1\|1$' || { echo "QA-STREAK result=FAILED reason=alive-chip-missing got=$CH2"; exit 1; }

# ---------- ⑤ شکاف: فقط سه روز پیش ----------
agent-browser eval "(()=>{const K=\"vision2-study-v1\"; const s=JSON.parse(localStorage.getItem(K)); const st=s.state; $DAYFN; st.dayHistory={}; st.dayHistory[DAY(3)]={day:DAY(3),reviews:0,quizzes:0,words:0,dictation:0,rush:0,stories:2}; localStorage.setItem(K,JSON.stringify(s)); return \"ok\";})()" >/dev/null 2>&1
agent-browser open "$BASE" >/dev/null 2>&1; sleep 5
wait_dom

CH3=$(agent-browser eval "(()=>{const sec=[...document.querySelectorAll('section')].find(x=>$CARD); if(!sec) return \"0\"; return [1, sec.innerText.includes(\"شروعِ زنجیرهٔ خواندن\")?1:0].join(\"|\");})()" 2>/dev/null | tr -d '"')
echo "step5-gap: $CH3"
echo "$CH3" | rg -q '^1\|1$' || { echo "QA-STREAK result=FAILED reason=zero-chip-missing got=$CH3"; exit 1; }
agent-browser screenshot /tmp/r301-card-gap.png >/dev/null 2>&1

# ---------- ⑥ موبایلِ ۳۹۰ تاریکِ واقعی ----------
agent-browser set viewport 390 844 >/dev/null 2>&1 || true
sleep 2
agent-browser eval "(()=>{document.documentElement.classList.add(\"dark\"); return \"dark\";})()" >/dev/null 2>&1
sleep 2
M=$(agent-browser eval "(()=>{const sec=[...document.querySelectorAll('section')].find(x=>$CARD); if(!sec) return \"0|0|0|0\"; const chip=[...sec.querySelectorAll(\"span\")].find(s=>s.textContent.includes(\"زنجیره\")||s.textContent.includes(\"شروع\")); const cr=chip?chip.getBoundingClientRect():null; return [document.documentElement.scrollWidth, window.innerWidth, cr?Math.round(cr.width):0, cr&&cr.width>0&&cr.height>0?1:0].join(\"|\");})()" 2>/dev/null | tr -d '"')
echo "step6-mobile: $M"
echo "$M" | rg -q '^390\|390\|' || { echo "QA-STREAK result=FAILED reason=mobile-overflow got=$M"; exit 1; }
echo "$M" | rg -q '\|1$' || { echo "QA-STREAK result=FAILED reason=chip-invisible-mobile got=$M"; exit 1; }
agent-browser screenshot /tmp/r301-card-mobile-dark.png >/dev/null 2>&1

echo "QA-STREAK result=PASS"
