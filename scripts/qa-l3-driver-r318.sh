#!/bin/bash
# r318 — درایورِ عددیِ E2E برای بانکِ l3 (۱۰۰ تست، رگرسیونِ رندِ r317)
# ورودی: /tmp/l3-keys.txt — از سؤالِ ۱ شروع می‌شود
set -u
KEYS=($(cat /tmp/l3-keys.txt))
START=${1:-1}
END=${2:-100}
for ((n=START; n<=END; n++)); do
  k=${KEYS[$((n-1))]}
  agent-browser press "$k" >/dev/null 2>&1
  sleep 0.55
  if [ "$n" -lt "$END" ]; then
    agent-browser press Enter >/dev/null 2>&1
    sleep 0.75
  fi
  if [ $((n % 25)) -eq 0 ]; then echo "progress: Q$n"; fi
done
echo "DONE-l3"
