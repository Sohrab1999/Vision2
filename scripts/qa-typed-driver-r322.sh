#!/bin/bash
# r322 — درایورِ تایپیِ E2E برای بانک‌های kind=typed (الگوی r321 با ریفِ تازه در هر گام)
# ورودی: فایلِ کلماتِ accepted (یک کلمه در هر سطر، به ترتیبِ سؤال‌ها) + شروع/پایان
# هر گام: snapshot → استخراجِ ریفِ textbox «پاسخ تایپی» → type → Enter (بررسی) → Enter (بعدی)
set -u
WORDS=($(cat "$1"))
START=${2:-1}
END=${3:-20}

for ((n=START; n<=END; n++)); do
  w=${WORDS[$((n-1))]}
  ref=$(agent-browser snapshot 2>/dev/null | rg 'textbox "پاسخ تایپی"' | sed 's/.*\[ref=\(e[0-9]*\)\].*/\1/' | head -1)
  if [ -z "$ref" ]; then echo "Q$n: textbox ref NOT FOUND"; exit 1; fi
  agent-browser type "$ref" "$w" >/dev/null 2>&1
  agent-browser press Enter >/dev/null 2>&1
  sleep 0.7
  if [ "$n" -lt "$END" ]; then
    agent-browser press Enter >/dev/null 2>&1
    sleep 0.7
  fi
  echo "Q$n: $w ✓"
done
echo "DONE — result panel expected"
