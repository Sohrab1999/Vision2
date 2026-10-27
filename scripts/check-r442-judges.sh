#!/usr/bin/env bash
# Extract both r442 judge JS bodies (parent_judge + replay_judge) and
# syntax-check each with node --check — the r441 pre-flight idiom.
set -euo pipefail
S=/home/z/my-project/scripts/qa-r442-mobile-replay-result.sh

check_line(){
  local LINE="$1"; local NAME="$2"
  JS=$(sed -n "${LINE}p" "$S")
  JS="${JS#*probe \"}"
  JS="${JS%\"}"
  JS="${JS//\$1/MOBILE-REPLAY-DARK}"
  JS="${JS//\$2/3}"
  JS="${JS//\$3/DARK}"
  printf '%s' "$JS" > "/tmp/r442-${NAME}-check.js"
  node --check "/tmp/r442-${NAME}-check.js" && echo "${NAME}-SYNTAX-OK" || { echo "${NAME}-SYNTAX-FAIL"; exit 1; }
}

L1=$(rg -n 'probe "\(\(\)=>\{const sec=\[\.\.\.document\.querySelectorAll\(.section.\)\]\.find\(s=>s\.querySelector\(.{2}aria-label=.{2}بازخوانی' "$S" | head -1 | cut -d: -f1)
check_line "$L1" "parent"

L2=$(rg -n 'replay_judge\(\)' "$S" | head -1 | cut -d: -f1)
L2=$((L2+1))
check_line "$L2" "replay"
