#!/bin/bash
# r340 — درایورِ بانک ۵۸ (تایپی دوجای‌خالیِ اسلش‌دار) — الگوی v2ِ r338
set -u
ANSWERS=("rang / was writing" "was sleeping / stole" "went / was waiting" "started / were having" "was sitting" "weren't listening / told" "were studying / called" "doing / working" "wasn't listening")
get_tb() { agent-browser snapshot -c 2>&1 | grep -oE 'textbox "پاسخ تایپی" \[[^]]*ref=(e[0-9]+)\]:?' | grep -oE 'e[0-9]+' | head -1; }
tb_disabled() { agent-browser snapshot -c 2>&1 | grep -oE 'textbox "پاسخ تایپی" \[disabled[^]]*ref=(e[0-9]+)\]:?' | grep -oE 'e[0-9]+' | head -1; }
for i in "${!ANSWERS[@]}"; do
  A="${ANSWERS[$i]}"
  for try in 1 2 3; do
    D=$(tb_disabled); [ -z "$D" ] && break
    agent-browser press Enter >/dev/null 2>&1; sleep 0.8
  done
  REF=$(get_tb)
  if [ -z "$REF" ]; then echo "NO-TEXTBOX at Q$((i+2))"; agent-browser screenshot "/tmp/qa-r340-b58-stuck-q$((i+2)).png" | tail -1; exit 1; fi
  agent-browser fill "@$REF" "$A" >/dev/null 2>&1
  sleep 0.4
  agent-browser press Enter >/dev/null 2>&1
  sleep 0.6
  agent-browser press Enter >/dev/null 2>&1
  sleep 0.6
  CNT=$(agent-browser eval "document.body.innerText.match(/(\d+) \/ 10/)?.[1]" 2>/dev/null | tail -1)
  echo "Q$((i+2)): filled=$A counter=$CNT"
done
echo "DRIVER-DONE"
agent-browser screenshot /tmp/qa-r340-b58-result.png | tail -1
