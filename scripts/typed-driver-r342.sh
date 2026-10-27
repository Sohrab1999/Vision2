#!/bin/bash
# r342 — درایورِ v2 برای بانک‌های تایپی (همگام‌سازیِ شمارنده + دو Enter + سنجِ بازخورد)
# usage: bash typed-driver.sh <total> <answer1> <answer2> ...   (از شمارهٔ فعلیِ شمارنده شروع می‌کند)
set -u
TOTAL=$1; shift
ANSWERS=("$@")

ab() { agent-browser "$@" 2>&1; }

get_counter() {
  ab eval "(() => { const m = document.body.innerText.match(/(\d+) \/ $TOTAL/); return m ? m[1] : 'x'; })()" | tail -1 | tr -d '"'
}

wait_feedback() {
  for i in $(seq 1 25); do
    R=$(ab eval "(() => { const t = document.body.innerText; if (t.includes('پاسخ درست')) return 'ok'; if (t.includes('پاسخ نادرست') || t.includes('اشتباه')) return 'WRONG'; return 'wait'; })()" | tail -1 | tr -d '"')
    [ "$R" = "ok" ] && echo 0 && return
    [ "$R" = "WRONG" ] && echo 2 && return
    sleep 0.4
  done
  echo 1
}

echo "=== typed driver v2: ${#ANSWERS[@]} answers, total=$TOTAL ==="
SCORE_OK=0; SCORE_BAD=0
for ans in "${ANSWERS[@]}"; do
  # ۱) همگام‌سازیِ شمارنده
  C=$(get_counter)
  echo "--- Q$C answer: $ans"
  # ۲) fill + Enter (ثبت)
  REF=$(ab snapshot | grep -oE 'textbox "پاسخ تایپی" \[ref=(e[0-9]+)\]' | sed -nE 's/.*\[ref=(e[0-9]+)\].*/\1/p' | head -1)
  if [ -z "$REF" ]; then echo "!! no textbox ref"; exit 9; fi
  ab fill "$REF" "$ans" >/dev/null
  ab press Enter >/dev/null
  FB=$(wait_feedback)
  if [ "$FB" = "0" ]; then SCORE_OK=$((SCORE_OK+1)); echo "    feedback: درست";
  elif [ "$FB" = "2" ]; then SCORE_BAD=$((SCORE_BAD+1)); echo "    feedback: نادرست!";
  else echo "    feedback TIMEOUT"; exit 8; fi
  # ۳) Enter دوم برای گذر از بازخورد
  ab press Enter >/dev/null
  sleep 0.5
done
echo "=== driver done: درست=$SCORE_OK نادرست=$SCORE_BAD ==="
# نتیجهٔ نهاییِ صفحه (درصورتِ پایانِ آزمون)
ab eval "(() => { const t = document.body.innerText; const m = t.match(/\d+ از \d+ درست[^\n]*/); return m ? m[0] : t.includes('قهرمان') ? 'champion-view' : 'no-final-score (still in quiz?)'; })()" | tail -1
