#!/usr/bin/env bash
# Extract the r443 judge JS body (judge → probe one-liner) and syntax-check
# it with node --check — the r441/r442 pre-flight idiom.
set -euo pipefail
S=/home/z/my-project/scripts/qa-r443-flashcards-passdone.sh

check_line(){
  local LINE="$1"; local NAME="$2"
  JS=$(sed -n "${LINE}p" "$S")
  JS="${JS#*probe \"}"
  JS="${JS%\"}"
  JS="${JS//\$1/MOBILE-PASSDONE-DARK}"
  JS="${JS//\$2/DARK}"
  JS="${JS//\$L/0}"
  JS="${JS//\$PANEL_BG/rgb(0, 0, 0)}"
  JS="${JS//\$PANEL_BORDER/rgb(0, 0, 0)}"
  JS="${JS//\$TITLE_INK/rgb(0, 0, 0)}"
  JS="${JS//\$HANDOFF_BG/rgb(0, 0, 0)}"
  JS="${JS//\$HANDOFF_INK/rgb(0, 0, 0)}"
  JS="${JS//\$HANDOFF_BD/rgb(0, 0, 0)}"
  JS="${JS//\$EXIT_INK/rgb(0, 0, 0)}"
  JS="${JS//\$SVG_INK/rgb(0, 0, 0)}"
  printf '%s' "$JS" > "/tmp/r443-${NAME}-check.js"
  node --check "/tmp/r443-${NAME}-check.js" && echo "${NAME}-SYNTAX-OK" || { echo "${NAME}-SYNTAX-FAIL"; exit 1; }
}

L=$(rg -n 'judge\(\)\{ # \$1 صحنه' "$S" | head -1 | cut -d: -f1)
L=$((L+3)) # سرِ داور = سه سطر بعد از سرِ تابع (local/if/else در همان سطرِ ادامه)
check_line "$L" "passdone"
