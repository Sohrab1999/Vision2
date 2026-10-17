#!/bin/bash
# r320 — درایورِ عددیِ E2E برای بانکِ l10 (۲۰ تست، grammar-g12-topic) — الگوی r318/r319
# ورودی: /tmp/l10-keys.txt — دنبالهٔ کلیدهای 1-4 برای سؤال‌های 1..20 (Q1 دستی پاسخ داده شده)
set -u
KEYS=($(cat /tmp/l10-keys.txt))
START=${1:-2}
END=${2:-20}

for ((n=START; n<=END; n++)); do
  k=${KEYS[$((n-1))]}
  agent-browser press "$k" >/dev/null 2>&1
  sleep 0.5
  if [ "$n" -lt "$END" ]; then
    agent-browser press Enter >/dev/null 2>&1
    sleep 0.6
  fi
done
echo "DONE — result button should be visible"
