#!/usr/bin/env bash
# ------------------------------------------------------------------
# r324 — مرحلهٔ D: «رتبه‌بندی نبردها با دادهٔ واقعی» (پیشنهادِ ②ِ r323).
#   پیش‌نیاز: qa-r321-duel-audit.sh رانده شده (دوئلِ واقعیِ دوکلاینتی رویِ
#   داورِ :3003 — ردیفهایِ واقعی در /api/leaderboard و /api/rush-leaderboard).
#   شخصیتِ قهرمان (r324-persona: دفترچهٔ نبرد + هفت روزِ تاریخچه) تزریق میشود
#   تا پنلهایِ hasProgress (فعالیت هفتگی و همتایانش) در زبانهٔ نبردها زنده باشند
#   و ردیفهایِ واقعیِ دوتنِ دوئل سنجیده شوند.
#   ابزار: طبقهبندِ r317 + پروبِ basis-صفرِ r319.
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
DIR=/home/z/my-project/scripts
OUT=/tmp/r324-leaderboard-results.txt
mkdir -p "$EV"; : > "$OUT"

PERSONA=$(node "$DIR/r324-persona.js")

sweep() {
  local JS
  JS=$(sed "s|__SEL__|$1|" "$DIR/r317-sweep.js")
  agent-browser eval "$JS" 2>&1
}
basis() { agent-browser eval "$(cat "$DIR/r319-basis-zero-audit.js")" 2>&1; }
shot() { agent-browser screenshot "$EV/$1" >/dev/null 2>&1; }
stage() {
  echo "-- $1" | tee -a "$OUT"
  sweep "body" | tee -a "$OUT"
  basis | tee -a "$OUT"
}
probe() { agent-browser eval "$1" 2>&1; }
click_lb() { # $1 برچسبِ زبانهٔ جدول — تطبیقِ بی‌نیمفاصله داخلِ tablist
  agent-browser eval "(()=>{const tl=document.querySelector('[role=\"tablist\"][aria-label=\"انتخاب نوع جدول\"]');if(!tl)return 'NO-TABLIST';const b=[...tl.querySelectorAll('button')].find(x=>(x.textContent||'').replace(/\\u200c/g,'').includes('$1'));if(!b)return 'NO-TAB';b.click();return 'clicked';})()" 2>&1
}

agent-browser open "$BASE" >/dev/null 2>&1
agent-browser set viewport 390 844 >/dev/null 2>&1
agent-browser wait 'body' >/dev/null 2>&1 || true
sleep 1.5
agent-browser eval "(()=>{localStorage.setItem('vision2-study-v1', JSON.stringify(${PERSONA})); location.reload(); return 'champion-lb-seeded';})()" >/dev/null 2>&1
sleep 5

echo "########## STAGE D — رتبه‌بندی با دادهٔ واقعی ##########" | tee -a "$OUT"
echo "########## EXAMS TAB PROBE ##########" | tee -a "$OUT"
probe "(()=>{const t=document.body.innerText;const tl=document.querySelector('[aria-label=\"انتخاب نوع جدول\"]');return JSON.stringify({
  tablist: !!tl,
  podiumOrRows: t.includes('میانگین') || t.includes('آزمون'),
  emptyExams: t.includes('هنوز کسی در جدول نیست'),
});})()" | tee -a "$OUT"
stage "leaderboard-exams-real-390"
shot r324-leaderboard-exams-390.png

DT=$(click_lb "نبردهای دودنفره")
echo "duels-tab=$DT" | tee -a "$OUT"
sleep 2.5
echo "########## DUELS TAB PROBE ##########" | tee -a "$OUT"
probe "(()=>{const t=document.body.innerText;return JSON.stringify({
  realDuelers: !t.includes('هنوز نبردی ثبت نشده'),
  weekly: !!document.querySelector('[aria-label=\"فعالیت هفتگی\"]'),
  emptyGone: !t.includes('تاریخ‌ساز باش'),
});})()" | tee -a "$OUT"
stage "leaderboard-duels-real-390"
shot r324-leaderboard-duels-390.png

agent-browser close >/dev/null 2>&1
echo "DONE r324 leaderboard" | tee -a "$OUT"
