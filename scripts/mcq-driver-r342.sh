#!/bin/bash
# r342 — درایورِ MCQ v2: pollِ شمارنده + کلیکِ حرفِ گزینه + سنجِ بازخورد + Enterِ گذر
# usage: bash mcq-driver-r342.sh <total> <letter1> <letter2> ...
set -u
TOTAL=$1; shift
LETTERS=("$@")

ab() { agent-browser "$@" 2>&1; }

get_counter() {
  ab eval "(() => { const m = document.body.innerText.match(/(\d+) \/ $TOTAL/); return m ? m[1] : 'x'; })()" | tail -1 | tr -d '"'
}

wait_feedback() {
  for i in $(seq 1 25); do
    R=$(ab eval "(() => { const t = document.body.innerText; if (t.includes('پاسخ درست')) return 'ok'; if (t.includes('پاسخ نادرست') || t.includes('اشتباه') || t.includes('پاسخ شما:')) return 'WRONG'; return 'wait'; })()" | tail -1 | tr -d '"')
    [ "$R" = "ok" ] && echo 0 && return
    [ "$R" = "WRONG" ] && echo 2 && return
    sleep 0.4
  done
  echo 1
}

echo "=== MCQ driver v2: ${#LETTERS[@]} answers, total=$TOTAL ==="
OK=0; BAD=0
for L in "${LETTERS[@]}"; do
  C=$(get_counter)
  echo "--- Q$C → $L"
  REF=$(ab snapshot | grep -oE "button \"[abcd] [^\"]*\" \[ref=(e[0-9]+)\]" | sed -nE "s/.*\[ref=(e[0-9]+)\].*/\1/p" | head -1)
  # گزینهٔ درست: چیپِ حرفِ L — از میانِ چهار چیپ، چیپی که با «$L » آغاز می‌شود
  ALLREFS=$(ab snapshot | grep -oE "button \"[abcd] [^\"]*\" \[ref=(e[0-9]+)\]" | sed -nE "s/.*button \"([abcd]) [^\"]*\" \[ref=(e[0-9]+)\].*/\1 \2/p")
  REF=$(echo "$ALLREFS" | awk -v l="$L" '$1 == l {print $2}' | head -1)
  if [ -z "$REF" ]; then echo "!! no chip ref for $L"; exit 9; fi
  ab click "$REF" >/dev/null
  FB=$(wait_feedback)
  if [ "$FB" = "0" ]; then OK=$((OK+1)); echo "    feedback: درست";
  elif [ "$FB" = "2" ]; then BAD=$((BAD+1)); echo "    feedback: نادرست!";
  else echo "    feedback TIMEOUT"; exit 8; fi
  ab press Enter >/dev/null
  sleep 0.5
done
echo "=== driver done: درست=$OK نادرست=$BAD ==="
ab eval "(() => { const t = document.body.innerText; const m = t.match(/\d+ از \d+ درست[^\n]*/); return m ? m[0] : 'no-final-score'; })()" | tail -1
