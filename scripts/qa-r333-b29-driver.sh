#!/bin/bash
# r333 — درایورِ رقمیِ بانک ۲۹ (Q2-12): میانبرهای ۱-۴ + Enter با نظرسنجیِ eval (/12)
set -e
cd /home/z/my-project
QN() {
  agent-browser eval "(()=>{const m=document.body.innerText.match(/(\d+)\s*\/\s*12/);return m?m[1]:'0'})()" 2>/dev/null | tr -d '"' | tr -d '\n'
}
KEYS=()
while read -r k; do KEYS+=("$k"); done < scripts/qa-r333-b29-keys.txt
for step in $(seq 1 60); do
  QN1=$(QN)
  if [ -z "$QN1" ] || [ "$QN1" = "0" ]; then echo "unreadable/RESULT"; break; fi
  if [ "$QN1" -gt 12 ]; then echo "DONE ($QN1)"; break; fi
  IDX=$((QN1-2))
  if [ $IDX -lt 0 ] || [ $IDX -ge ${#KEYS[@]} ]; then echo "!! QN1=$QN1 out of range"; break; fi
  K=${KEYS[$IDX]}
  agent-browser key "$K" >/dev/null 2>&1
  sleep 0.9
  agent-browser key "Enter" >/dev/null 2>&1
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
    echo "Q$QN1 (key=$K) extra enter -> ${QN2:-?}"
  else
    echo "Q$QN1 (key=$K) -> $QN2"
  fi
done
