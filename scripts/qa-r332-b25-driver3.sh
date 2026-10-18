#!/bin/bash
# r332 — درایورِ قهرمانِ بانک ۲۵: نظرسنجیِ eval (سریع) — پس از هر Enter تا پیشرفتِ شمارهٔ سؤال صبر می‌کند
set -e
cd /home/z/my-project
QN() {
  agent-browser eval "(()=>{const m=document.body.innerText.match(/(\d+)\s*\/\s*40/);return m?m[1]:'0'})()" 2>/dev/null | tr -d '"' | tr -d '\n'
}
KEYS=()
while read -r k; do KEYS+=("$k"); done < scripts/qa-r332-b25-keys.txt
START=$(QN)
echo "start at Q${START}"
for step in $(seq 1 300); do
  QN1=$(QN)
  [ "$QN1" -gt 40 ] && { echo "DONE at $QN1"; break; }
  IDX=$((QN1-2))
  [ $IDX -lt 0 ] && { echo "!! QN1=$QN1"; sleep 1; continue; }
  K=${KEYS[$IDX]}
  agent-browser key "$K" >/dev/null 2>&1
  sleep 0.9
  agent-browser key "Enter" >/dev/null 2>&1
  # صبر برای پیشرفت (حداکثر ۸ ثانیه، هر ۰.۶s)
  OK=0
  for poll in 1 2 3 4 5 6 7 8 9 10 11 12; do
    sleep 0.6
    QN2=$(QN)
    if [ -n "$QN2" ] && [ "$QN2" -gt "$QN1" ]; then OK=1; break; fi
  done
  if [ $OK -eq 0 ]; then
    agent-browser key "Enter" >/dev/null 2>&1
    sleep 1.2
    QN2=$(QN)
    echo "Q$QN1 (key=$K) needed extra enter -> $QN2"
  else
    echo "Q$QN1 (key=$K) -> $QN2"
  fi
done
