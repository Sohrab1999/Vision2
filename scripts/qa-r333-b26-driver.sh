#!/bin/bash
# r333 — درایورِ تایپیِ بانک ۲۶ (Q2-15): keyboard type + Enter با نظرسنجیِ eval
set -e
cd /home/z/my-project
QN() {
  agent-browser eval "(()=>{const m=document.body.innerText.match(/(\d+)\s*\/\s*15/);return m?m[1]:'0'})()" 2>/dev/null | tr -d '"' | tr -d '\n'
}
i=1
while read -r ans; do
  i=$((i+1))
  QN1=$(QN)
  agent-browser keyboard type "$ans" >/dev/null 2>&1
  sleep 0.7
  agent-browser press Enter >/dev/null 2>&1
  OK=0
  for poll in 1 2 3 4 5 6 7 8 9 10; do
    sleep 0.6
    QN2=$(QN)
    if [ -n "$QN2" ] && [ "$QN2" -gt "$QN1" ]; then OK=1; break; fi
  done
  if [ $OK -eq 0 ]; then
    agent-browser press Enter >/dev/null 2>&1
    sleep 1.2
    QN2=$(QN)
    echo "Q$QN1 ($ans) extra enter -> ${QN2:-?}"
  else
    echo "Q$QN1 ($ans) -> $QN2"
  fi
done < scripts/qa-r333-b26-keys.txt
