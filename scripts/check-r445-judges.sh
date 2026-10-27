#!/usr/bin/env bash
# Extract the r445 judge JS bodies (judge_* → probe one-liners) and syntax-check
# them with node --check — the r441..r444 pre-flight idiom.
set -euo pipefail
S=/home/z/my-project/scripts/qa-r445-dictation-launcher.sh

extract_probe(){ # $1 = سطرِ شروعِ probe داخلِ داور
  JS=$(sed -n "${1}p" "$S")
  JS="${JS#*probe \"}"
  JS="${JS%\"}"
  printf '%s' "$JS"
}

# جایگذاریِ متغیرهایِ پوسته‌ای با نمونههایِ نمونه (مثلِ r444)
substitute(){
  JS="$1"
  JS="${JS//\$1/SCENE-X}"
  JS="${JS//\$2/DARK}"
  JS="${JS//\$3/PLACEHOLDER-SUBTITLE}"
  JS="${JS//\$4/PRESENT}"
  JS="${JS//\$5/PRESENT}"
  JS="${JS//\$L/0}"
  for V in SUB_INK H2_INK DOOR_BG DOOR_INK DOOR_BD START_BG START_INK START_BD START_IMG SETUP_H3 CHIP10_BG CHIP10_INK PROG_BG PROG_INK FA_INK DONE_H3 PCT_INK OKCHIP_BG OKCHIP_INK; do
    JS="${JS//\$$V/rgb(0, 0, 0)}"
    JS="${JS//\$\{_$V/rgb(0, 0, 0)}"
  done
  printf '%s' "$JS"
}

check_judge(){ # $1 نامِ داور
  local NAME="$1"
  local START=$(rg -n "^${NAME}\(\)\{" "$S" | head -1 | cut -d: -f1)
  [ -z "$START" ] && { echo "${NAME}-NOT-FOUND"; exit 1; }
  local PROBE_LINE=""
  for ((l=START; l<=START+6; l++)); do
    if sed -n "${l}p" "$S" | rg -q 'probe "'; then PROBE_LINE=$l; break; fi
  done
  [ -z "$PROBE_LINE" ] && { echo "${NAME}-NO-PROBE"; exit 1; }
  JS=$(extract_probe "$PROBE_LINE")
  JS=$(substitute "$JS")
  printf '%s' "$JS" > "/tmp/r445-${NAME}-check.js"
  node --check "/tmp/r445-${NAME}-check.js" && echo "${NAME}-SYNTAX-OK" || { echo "${NAME}-SYNTAX-FAIL"; exit 1; }
}

check_judge judge_launcher
check_judge judge_setup
check_judge judge_play
check_judge judge_done

# داورِ answer_one و probeهایِ یکخطیِ بقیهٔ فایل هم باید سالم بمانند
bash -n "$S" && echo "BASH-SYNTAX-OK"
echo "PREFLIGHT-OK"
