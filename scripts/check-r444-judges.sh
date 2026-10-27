#!/usr/bin/env bash
# Extract the r444 judge JS body (judge → probe one-liner) and syntax-check
# it with node --check — the r441/r442/r443 pre-flight idiom.
set -euo pipefail
S=/home/z/my-project/scripts/qa-r444-empty-family.sh

check_line(){
  local LINE="$1"; local NAME="$2"
  JS=$(sed -n "${LINE}p" "$S")
  JS="${JS#*probe \"}"
  JS="${JS%\"}"
  JS="${JS//\$1/SCENE-A-ZERO-STARS}"
  JS="${JS//\$2/DARK}"
  JS="${JS//\$3/PLACEHOLDER-SUBTITLE}"
  JS="${JS//\$4/ABSENT}"
  JS="${JS//\$5/ABSENT}"
  JS="${JS//\$L/0}"
  JS="${JS//\$SUB_INK/rgb(0, 0, 0)}"
  JS="${JS//\$DOOR_BG/rgb(0, 0, 0)}"
  JS="${JS//\$DOOR_INK/rgb(0, 0, 0)}"
  JS="${JS//\$DOOR_BD/rgb(0, 0, 0)}"
  JS="${JS//\$CHIP_BG/rgb(0, 0, 0)}"
  JS="${JS//\$CHIP_INK/rgb(0, 0, 0)}"
  printf '%s' "$JS" > "/tmp/r444-${NAME}-check.js"
  node --check "/tmp/r444-${NAME}-check.js" && echo "${NAME}-SYNTAX-OK" || { echo "${NAME}-SYNTAX-FAIL"; exit 1; }
}

L=$(rg -n 'judge\(\)\{ # \$1 صحنه' "$S" | head -1 | cut -d: -f1)
L=$((L+3)) # سرِ داور = سه سطر بعد از سرِ تابع (local/if/else در همان سطرِ ادامه)
check_line "$L" "empty-family"
