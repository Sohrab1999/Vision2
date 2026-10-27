#!/bin/bash
# r333 — درایورِ تایپیِ همگام: در هر گام refِ تازهٔ textbox → fill → Enter → نظرسنجیِ eval
set -e
cd /home/z/my-project
QN() {
  agent-browser eval "(()=>{const m=document.body.innerText.match(/(\d+)\s*\/\s*15/);return m?m[1]:'0'})()" 2>/dev/null | tr -d '"' | tr -d '\n'
}
while true; do
  QN1=$(QN)
  if [ -z "$QN1" ] || [ "$QN1" = "0" ]; then echo "RESULT screen or unreadable"; break; fi
  if [ "$QN1" -gt 15 ]; then echo "DONE ($QN1)"; break; fi
  # سطرِ متناظر از فایل کلید (Q2=سطر۱ …)
  ROW=$((QN1-1))
  ANS=$(sed -n "${ROW}p" scripts/qa-r333-b26-keys.txt)
  REF=$(agent-browser snapshot 2>/dev/null | grep -oE 'textbox "پاسخ تایپی" \[ref=e[0-9]+\]' | grep -oE 'e[0-9]+' | head -1)
  if [ -z "$REF" ]; then echo "!! Q$QN1 no textbox ref"; sleep 1.5; continue; fi
  agent-browser fill "@$REF" "$ANS" >/dev/null 2>&1
  sleep 0.5
  agent-browser press Enter >/dev/null 2>&1
  OK=0
  for poll in 1 2 3 4 5 6 7 8 9 10 11 12; do
    sleep 0.55
    QN2=$(QN)
    if [ -n "$QN2" ] && [ "$QN2" -gt "$QN1" ]; then OK=1; break; fi
  done
  if [ $OK -eq 0 ]; then
    agent-browser press Enter >/dev/null 2>&1
    sleep 1.2
    QN2=$(QN)
    echo "Q$QN1 ($ANS) extra enter -> ${QN2:-?}"
  else
    echo "Q$QN1 ($ANS) -> $QN2"
  fi
done
