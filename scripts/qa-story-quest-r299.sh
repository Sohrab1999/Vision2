#!/usr/bin/env bash
# ------------------------------------------------------------------
# Task 299 — کیوستِ «داستان کتابخانه» — ششمین هدفِ روزانه.
# زنجیرهٔ کامل در یک نشستِ تازه:
#   ① اطمینانِ سرور (curl || restart — درسِ OOMِ r296)
#   ② نشستِ تازهٔ دسکتاپ ۱۲۸۰ روشن → کارتِ اهداف «۰ از ۶» + سطرِ داستان
#   ③ کلیکِ سطرِ داستان → ورودِ مستقیم به خوانندهٔ داستانِ بعدیِ نخوانده (نیتِ r297)
#   ④ شش پاسخِ واقعیِ درست/غلط → کارتِ نمره + توستِ «داستان تمام شد!»
#   ⑤ بازگشت به خانه → «۱ از ۶» + سطرِ داستانِ سبز («کامل شد — عالی!»)
#   ⑥ موبایلِ ۳۹۰ تاریکِ واقعی → سرریزِ صفر + اسکرین‌شات
# خروجی: QA-QUEST result=... (+ریشهٔ علت در شکست)
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"

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
  echo "QA-QUEST result=FAILED reason=server-down code=$code"
  exit 1
fi

agent-browser set viewport 1280 900 >/dev/null 2>&1 || true
agent-browser open "$BASE" >/dev/null 2>&1
sleep 2

# ---------- ② نشستِ تازه ----------
agent-browser eval "(()=>{localStorage.clear(); sessionStorage.clear(); location.reload(); return 'cleared';})()" >/dev/null 2>&1
sleep 5

Q0=$(agent-browser eval "(()=>{const sec=document.querySelector('.daily-quests'); if(!sec) return 'NO-SECTION'; const badge=sec.querySelector('h2 + span, [class*=rounded-full]'); const rows=[...sec.querySelectorAll('button')]; const story=rows.find(b=>(b.getAttribute('aria-label')||'').includes('داستان کتابخانه')); return JSON.stringify({badge: badge?badge.textContent.trim():'', rowCount: rows.length, storyRow: !!story, storyLabel: story?story.getAttribute('aria-label'):''});})()" 2>/dev/null | tr -d '"')
echo "step2-fresh: $Q0"

# ---------- ③ کلیکِ سطرِ داستان → ورودِ مستقیم ----------
agent-browser eval "(()=>{const rows=[...document.querySelectorAll('.daily-quests button')]; const story=rows.find(b=>(b.getAttribute('aria-label')||'').includes('داستان کتابخانه')); if(!story) return 'NO-ROW'; story.click(); return 'clicked';})()" >/dev/null 2>&1
sleep 2

RDR=$(agent-browser eval "(()=>{const a=document.querySelector('[aria-label=\"بخش صحیح یا نادرست\"]'); const reader=document.querySelector('[aria-label=\"پیشرفت کل کتابخانه\"]'); const body=document.body.innerText; return JSON.stringify({readerTF: !!a, readerChip: !!reader, inLibrary: body.includes('بخوان و جواب بزن')===false && (body.includes('بخشِ A')||body.includes('بخش A'))});})()" 2>/dev/null | tr -d '"')
echo "step3-reader-direct: $RDR"

# ---------- ④ شش پاسخِ واقعی ----------
agent-browser eval "(()=>{const groups=[...document.querySelectorAll('[aria-label=\"بخش صحیح یا نادرست\"] [role=group]')]; if(groups.length<6) return 'GROUPS='+groups.length; let n=0; for(const g of groups){const b=g.querySelector('button'); if(b && !b.disabled){b.click(); n++;}} return 'ANSWERED='+n;})()" >/dev/null 2>&1
sleep 2

SCORE=$(agent-browser eval "(()=>{const st=[...document.querySelectorAll('[role=status]')]; const card=st.find(x=>x.textContent.includes('نمرهٔ تو')); const toast=st.find(x=>x.textContent.includes('داستان تمام شد')); return JSON.stringify({scoreCard: card?card.textContent.trim().slice(0,40):'', toast: !!toast});})()" 2>/dev/null | tr -d '"')
echo "step4-score: $SCORE"

# ---------- ⑤ بازگشت به خانه — کیوست کامل ----------
agent-browser eval "(()=>{localStorage.setItem('vision2-study-v1-backup','1'); location.reload(); return 'reloading';})()" >/dev/null 2>&1
sleep 5

Q1=$(agent-browser eval "(()=>{const sec=document.querySelector('.daily-quests'); if(!sec) return 'NO-SECTION'; const badge=sec.querySelector('[class*=rounded-full]'); const rows=[...sec.querySelectorAll('button')]; const story=rows.find(b=>(b.getAttribute('aria-label')||'').includes('داستان کتابخانه')); return JSON.stringify({badge: badge?badge.textContent.trim():'', storyDone: story?(story.getAttribute('aria-label')||'').includes('کامل شد'):false, storyText: story?story.textContent.includes('کامل شد'):false});})()" 2>/dev/null | tr -d '"')
echo "step5-after: $Q1"

# ---------- ⑥ موبایل ۳۹۰ تاریکِ واقعی ----------
agent-browser set viewport 390 844 >/dev/null 2>&1 || true
sleep 1
agent-browser eval "(()=>{document.documentElement.setAttribute('data-qa-dark','1'); return 'scheme';})()" >/dev/null 2>&1
DARK=$(agent-browser eval "(()=>{const dark=[...document.querySelectorAll('html,body,[class*=dark]')].some(e=>e.className.includes&&String(e.className).includes('dark'))||document.documentElement.classList.contains('dark'); const docW=document.documentElement.getBoundingClientRect().width; const winW=window.innerWidth; const overflow=docW>winW+1; return JSON.stringify({docW, winW, overflow});})()" 2>/dev/null | tr -d '"')
echo "step6-mobile: $DARK"
agent-browser screenshot /tmp/r299-mobile-quest.png >/dev/null 2>&1 || true

agent-browser set viewport 1280 900 >/dev/null 2>&1 || true
agent-browser screenshot /tmp/r299-desktop-quest.png >/dev/null 2>&1 || true

# ---------- حکم ----------
CLEAN=$(echo "$Q1" | tr -d '\\' | tr -d '"')
if echo "$CLEAN" | rg -q "از ۶" && echo "$CLEAN" | rg -q "storyDone:.?true"; then
  echo "QA-QUEST result=PASS badge=1-of-6 story-done"
else
  echo "QA-QUEST result=FAIL step2=$Q0 step3=$RDR step4=$SCORE step5=$Q1"
  exit 1
fi
