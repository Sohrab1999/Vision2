#!/bin/bash
# r322 — درایورِ عددیِ پارامتری برای بانک‌های MCQ (الگوی r320 با فایلِ کلیدِ پارامتری)
# usage: qa-mcq-driver-r322.sh <keys-file> <start> <end>
set -u
KEYS=($(cat "$1"))
START=${2:-2}
END=${3:-20}

for ((n=START; n<=END; n++)); do
  k=${KEYS[$((n-1))]}
  agent-browser press "$k" >/dev/null 2>&1
  sleep 0.5
  if [ "$n" -lt "$END" ]; then
    agent-browser press Enter >/dev/null 2>&1
    sleep 0.6
  fi
done
echo "DONE — result button expected"
