#!/bin/bash
# r319 — درایورِ عددیِ E2E برای بانکِ C (۴۰ تست، grammar-g12-topic l7) — الگوی r318
# ورودی: /tmp/c-keys.txt — دنبالهٔ کلیدهای 1-4 برای سؤال‌های 1..40
set -u
KEYS=($(cat /tmp/c-keys.txt))
START=${1:-1}
END=${2:-40}

for ((n=START; n<=END; n++)); do
  k=${KEYS[$((n-1))]}
  agent-browser press "$k" >/dev/null 2>&1
  sleep 0.5
  if [ "$n" -lt "$END" ]; then
    agent-browser press Enter >/dev/null 2>&1
    sleep 0.65
  fi
  if [ $((n % 10)) -eq 0 ]; then
    echo "progress: Q$n done"
  fi
done
echo "DONE — results panel should be visible"
