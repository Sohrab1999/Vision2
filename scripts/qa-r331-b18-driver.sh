#!/bin/bash
# r331 — قهرمانِ بانک ۱۸ (۱۶ تایپی) با تایمینگِ امنِ r330 (۱.۱/۱.۳s)
set -e
cd /home/z/my-project
ANSWERS=("museum" "destroying" "endangered" "attention" "injured" "hurt" "killed" "save" "divided" "take care" "increasing" "hunt" "tiger" "zookeeper" "future" "died")
for a in "${ANSWERS[@]}"; do
  agent-browser fill e3541 "$a" >/dev/null 2>&1 || agent-browser type "$a" >/dev/null 2>&1
  agent-browser press Enter >/dev/null 2>&1
  sleep 1.1
  agent-browser press Enter >/dev/null 2>&1
  sleep 1.3
done
echo "driver done"
