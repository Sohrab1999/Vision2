#!/usr/bin/env bash
# ------------------------------------------------------------------
# r331-recheck2 — وارسیِ زندهٔ چهار درمان:
#   A. هیروِ کنکور (روشن — انتظار: ۰ مردود)
#   B. بازخوردِ immediate با جوهرِ ✗ (حلقهٔ تلاش تا غلطِ واقعی) + نمایِ
#      نتیجه با چیپِ رزِ درمانشده (روشن+تاریک)
#   C. بازخوردِ listen («بشنو و انتخاب کن») با جوهرِ ✗
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
DIR=/home/z/my-project/scripts
OUT=/tmp/r331-recheck2.txt
mkdir -p "$EV"; : > "$OUT"

dbg()   { echo "-- [contrast] $1" | tee -a "$OUT"; agent-browser eval "$(cat "$DIR/r328-fails-dbg.js")" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
to_dark()  { agent-browser eval "(()=>{localStorage.setItem('theme','dark');document.documentElement.classList.add('dark');return 'dark';})()" >/dev/null 2>&1; sleep 1.2; }
to_light() { agent-browser eval "(()=>{localStorage.setItem('theme','light');document.documentElement.classList.remove('dark');return 'light';})()" >/dev/null 2>&1; sleep 1.2; }
click_tool() {
  agent-browser eval "(()=>{const g=document.querySelector('[aria-label=\"ابزارهای یادگیری\"]');if(!g)return 'NO-GRID';const b=[...g.querySelectorAll('button')].find(x=>(x.textContent||'').replace(/\\u200c/g,'').includes('$1'));if(!b)return 'NO-BTN';b.click();return 'clicked';})()" 2>&1
}

echo "########## A — هیروِ کنکور پسِ از درمان" | tee -a "$OUT"
agent-browser open "$BASE" >/dev/null 2>&1
agent-browser set viewport 390 844 >/dev/null 2>&1
agent-browser wait 'body' >/dev/null 2>&1 || true
sleep 2
PERSONA=$(node "$DIR/r324-persona.js")
agent-browser eval "(()=>{localStorage.setItem('vision2-study-v1', JSON.stringify(${PERSONA})); location.reload(); return 'seeded';})()" >/dev/null 2>&1
sleep 4
click_tool "کنکور" >/dev/null 2>&1; sleep 3
dbg "konkur-landing-light"

echo "########## B — مرورِ اشتباهات: حلقه تا ✗ + نتیجه" | tee -a "$OUT"
SEEN_X=0
for TRY in 1 2 3; do
  agent-browser open "$BASE" >/dev/null 2>&1; sleep 2.5
  click_tool "آزمون جامع" >/dev/null 2>&1; sleep 2.5
  agent-browser eval "(()=>{const b=[...document.querySelectorAll('button')].find(x=>(x.textContent||'').includes('مرور اشتباهات آزمون جامع'));if(!b)return 'NO-CTA';b.click();return 'ok';})()" >/dev/null 2>&1
  sleep 2.5
  # پاسخ به همهٔ سؤالهای جلسه با گزینهٔ صفر — حلقه تا دکمهٔ بعدی ناپدید شود
  for i in $(seq 1 30); do
    agent-browser eval "(()=>{const o=document.querySelector('[data-quiz-option=\"0\"]');if(o){o.click();return 1;}return 0;})()" >/dev/null 2>&1
    sleep 1.5
    agent-browser eval "(()=>{const n=document.querySelector('[data-quiz-next]');if(n){n.click();return 1;}return 0;})()" >/dev/null 2>&1
    sleep 1.2
    STILL=$(agent-browser eval "String(!!document.querySelector('[data-quiz-option=\"0\"]'))" 2>&1 | tr -d '"\n')
    [[ "$STILL" == "false" ]] && break
  done
  FB=$(agent-browser eval "(()=>{const p=document.querySelector('[data-quiz-feedback] p');return p?p.textContent.slice(0,2):'NO-FB';})()" 2>&1)
  echo "try=$TRY last-fb=$FB" | tee -a "$OUT"
  # اگر آخرین بازخورد ✓ بود، نتیجه هم چیپِ رز نخواهد داشت — تلاشِ دوباره
  [[ "$FB" == "✗" ]] && SEEN_X=1 && break
done
if [[ $SEEN_X -eq 1 ]]; then
  dbg "mistakes-answered-rose-light"
  agent-browser screenshot "$EV/r331-mistakes-rose-light.png" >/dev/null 2>&1
  to_dark
  dbg "mistakes-answered-rose-dark"
  to_light
else
  echo "WARN: rose feedback never mounted in 3 tries" | tee -a "$OUT"
fi
# نمایِ نتیجه (چه با ✗ چه ✓) — چیپِ رز فقط با wrongIds>0
agent-browser eval "(()=>{const b=[...document.querySelectorAll('button')].find(x=>(x.textContent||'').includes('دیدن نتیجه'));if(!b)return 'NO-FINISH';b.click();return 'ok';})()" >/dev/null 2>&1
sleep 2.5
agent-browser eval "(()=>{const t=document.body.innerText;return JSON.stringify({result:t.includes('نتیجهٔ نهایی'),roseChip:t.includes('به بانک مرور اشتباهات اضافه شد')});})()" | tee -a "$OUT"
dbg "mistakes-result-light"
agent-browser screenshot "$EV/r331-mistakes-result-light.png" >/dev/null 2>&1

echo "########## C — listen: بشنو و انتخاب کن" | tee -a "$OUT"
agent-browser open "$BASE" >/dev/null 2>&1; sleep 2.5
click_tool "تمرین هوشمند" >/dev/null 2>&1; sleep 2.5
agent-browser eval "(()=>{const b=[...document.querySelectorAll('button')].find(x=>(x.textContent||'').includes('بشنو و انتخاب کن'));if(!b)return 'NO-CTA';b.click();return 'listen';})()" | tee -a "$OUT"
sleep 2.5
agent-browser eval "(()=>{const o=document.querySelector('[data-listen-option=\"0\"]');if(!o)return 'NO-OPT';o.click();return 'answered';})()" | tee -a "$OUT"
sleep 1.8
agent-browser eval "(()=>{const fb=document.querySelector('[data-listen-feedback]');const p=fb&&fb.querySelector('p');return JSON.stringify({fb:!!fb,mark:p?p.textContent.slice(0,2):''});})()" | tee -a "$OUT"
dbg "listen-answered-light"
agent-browser screenshot "$EV/r331-listen-answered-light.png" >/dev/null 2>&1

echo "########## DONE" | tee -a "$OUT"
agent-browser close >/dev/null 2>&1
echo "log=$OUT"
