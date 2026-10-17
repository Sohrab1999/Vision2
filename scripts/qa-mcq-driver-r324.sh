#!/bin/bash
# r324 — درایورِ عددی/حرفیِ کندتر با وریفایِ دوره‌ای (الگوی r322/r323 + درسِ آلودگیِ سشن)
# usage: qa-mcq-driver-r324.sh <keys-file> <start> <end>
set -u
KEYS=($(cat "$1"))
START=${2:-2}
END=${3:-40}

for ((n=START; n<=END; n++)); do
  k=${KEYS[$((n-1))]}
  agent-browser press "$k" >/dev/null 2>&1
  sleep 0.9
  if [ "$n" -lt "$END" ]; then
    agent-browser press Enter >/dev/null 2>&1
    sleep 0.9
  fi
  # وریفایِ دوره‌ای هر ۱۰ سؤال
  case $n in
    10|20|30)
      echo "--- verify at Q$n ---"
      agent-browser snapshot 2>&1 | grep -cE "پاسخ درست|سؤال بعدی" || true
      ;;
  esac
done
echo "DONE — result expected"
