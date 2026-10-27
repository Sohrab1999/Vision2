#!/bin/bash
# r331 — قهرمانِ بانک ۱۸ با ریفِ پویا در هر گام (درس r330: تایید snapshot در هر گام)
cd /home/z/my-project
ANSWERS=("destroying" "endangered" "attention" "injured" "hurt" "killed" "save" "divided" "take care" "increasing" "hunt" "tiger" "zookeeper" "future" "died")
i=2
for a in "${ANSWERS[@]}"; do
  REF=$(agent-browser snapshot 2>/dev/null | grep -oE 'textbox "[^"]*" \[ref=e[0-9]+\]' | head -1 | grep -oE 'e[0-9]+' | tail -1)
  if [ -z "$REF" ]; then echo "step $i: no textbox (quiz ended?)"; break; fi
  agent-browser fill "$REF" "$a" >/dev/null 2>&1
  agent-browser press Enter >/dev/null 2>&1
  sleep 1.2
  agent-browser press Enter >/dev/null 2>&1
  sleep 1.4
  echo "step $i: $a via $REF"
  i=$((i+1))
done
echo done
