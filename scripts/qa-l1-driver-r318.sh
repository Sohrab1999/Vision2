#!/bin/bash
# r318 — درایورِ عددیِ E2E برای بانکِ l1 (۱۰۰ تست) — الگوی r317 (transition-safe)
# ورودی: /tmp/l1-keys.txt — دنبالهٔ کلیدهای 1-4 برای سؤال‌های 1..100
# وضعیت: سؤالِ ۱ پاسخ داده شده و در سؤالِ ۲ هستیم (Q1: key=2 زده شد)
set -u
KEYS=($(cat /tmp/l1-keys.txt))
START=${1:-2}   # از سؤالِ شمارهٔ START شروع کن (Q1 انجام شده)
END=${2:-100}

for ((n=START; n<=END; n++)); do
  k=${KEYS[$((n-1))]}
  agent-browser press "$k" >/dev/null 2>&1
  sleep 0.55
  if [ "$n" -lt "$END" ]; then
    agent-browser press Enter >/dev/null 2>&1
    sleep 0.75
  fi
  if [ $((n % 25)) -eq 0 ]; then
    echo "progress: Q$n done"
  fi
done
echo "DONE — results panel should be visible"
