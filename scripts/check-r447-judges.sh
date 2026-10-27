#!/usr/bin/env bash
# Extract the r447 judge JS bodies (judge_* → probe one-liners) and syntax-check
# them with node --check — the r441..r446 pre-flight idiom.
set -euo pipefail
S=/home/z/my-project/scripts/qa-r447-review-eight-stars.sh

extract_probe(){ # $1 = سطرِ شروعِ probe داخلِ داور
  JS=$(sed -n "${1}p" "$S")
  JS="${JS#*probe \"}"
  JS="${JS%\"}"
  printf '%s' "$JS"
}

substitute(){
  JS="$1"
  JS="${JS//\$1/SCENE-X}"
  JS="${JS//\$2/DARK}"
  JS="${JS//\$3/DISABLED}"
  JS="${JS//\$4/شروع مرور (۸ سؤال)}"
  JS="${JS//\$L/0}"
  for V in SUB_INK H2_INK START_BG START_INK START_IMG C8_BG C8_INK C8_BD C8_OP C15_BG C15_INK C15_BD C15_OP C15E_OP TITLE_INK PROG_BG PROG_INK; do
    JS="${JS//\$$V/rgb(0, 0, 0)}"
  done
  printf '%s' "$JS"
}

check_judge(){ # $1 نامِ داور  $2 شمارهٔ سطرِ probe
  local NAME="$1" LINE="$2"
  JS=$(extract_probe "$LINE")
  JS=$(substitute "$JS")
  printf '%s' "$JS" > /tmp/r447-judge-body.js
  if node --check /tmp/r447-judge-body.js 2>/tmp/r447-judge-err.txt; then
    echo "JUDGE-$NAME: SYNTAX-OK"
  else
    echo "JUDGE-$NAME: SYNTAX-FAIL"
    cat /tmp/r447-judge-err.txt
    exit 1
  fi
}

# judge_group → probe سطرِ بعد از تعریف متغیرهای محلی (خط `probe "(()=>{const errs...` در judge_group)
G=$(grep -n 'probe "(()=>{const errs' "$S" | head -1 | cut -d: -f1)
check_judge GROUP "$G"
E=$(grep -n 'probe "(()=>{const errs' "$S" | sed -n 2p | cut -d: -f1)
check_judge ENGINE "$E"
R=$(grep -n 'probe "(()=>{const errs' "$S" | sed -n 3p | cut -d: -f1)
check_judge RESULT "$R"

# bash syntax of the whole script
bash -n "$S" && echo "SCRIPT: BASH-SYNTAX-OK"
echo "R447-PREFLIGHT-DONE"
