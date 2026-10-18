#!/bin/bash
# r338 — درایورِ بانک ۵۶ (MCQ ۲۵تایی): Q2-25 با کلیدهای رقمی ۱-۴ + Enter گذرِ بازخورد
set -u
# کلیدِ هر سؤال به شکلِ ایندکسِ گزینه (1=a, 2=b, 3=c, 4=d) — Q1 دستی جواب داده شد
DIGITS=(1 4 2 2 1 3 4 3 2 3 4 2 3 2 2 4 2 1 3 1 3 2 2 1)

agent-browser press Enter >/dev/null 2>&1; sleep 0.7  # گذر از بازخوردِ Q1ِ دستی

for i in "${!DIGITS[@]}"; do
  D="${DIGITS[$i]}"
  agent-browser press "$D" >/dev/null 2>&1
  sleep 0.5
  agent-browser press Enter >/dev/null 2>&1
  sleep 0.6
  CNT=$(agent-browser eval "document.body.innerText.match(/(\d+) \/ 25/)?.[1]" 2>/dev/null | tail -1)
  echo "Q$((i+2)): digit=$D counter=$CNT"
done
echo "DRIVER-DONE"
agent-browser screenshot /tmp/qa-r338-b56-result.png | tail -1
