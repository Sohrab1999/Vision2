#!/bin/bash
# r337 — درایورِ fill از سؤالِ جاری تا پایانِ بانک ۳۹ (بخش A)
# ورودی: شمارهٔ سؤالِ جاری به‌عنوان آرگومان اول (پیش‌فرض ۳) — کلیدها از همان‌جا شروع می‌شوند
set -u
START=${1:-3}
ALL=(breakfast carry collects famous moon hunters instead microscope)
KEYS=("${ALL[@]:$((START - 1))}")
for i in "${!KEYS[@]}"; do
  KEY="${KEYS[$i]}"
  EXPECT=$((START + i))
  OK=0
  for attempt in 1 2 3; do
    for w in 1 2 3 4 5 6 7 8 9 10; do
      CUR=$(agent-browser eval "document.querySelector('main').innerText.match(/(\d+) \/ 8/)?.[1] || 'x'" 2>/dev/null | tr -d '"')
      [ "$CUR" = "$EXPECT" ] && break
      sleep 0.5
    done
    CUR=$(agent-browser eval "document.querySelector('main').innerText.match(/(\d+) \/ 8/)?.[1] || 'x'" 2>/dev/null | tr -d '"')
    [ "$CUR" = "$EXPECT" ] || { sleep 1; continue; }
    REF=$(agent-browser snapshot 2>/dev/null | sed -nE 's/.*textbox "پاسخ تایپی" \[ref=(e[0-9]+)\].*/\1/p' | head -1)
    [ -z "$REF" ] && { sleep 0.8; continue; }
    agent-browser fill "$REF" "$KEY" >/dev/null 2>&1
    DIS=$(agent-browser snapshot 2>/dev/null | grep -c 'button "بررسی پاسخ" \[disabled')
    if [ "$DIS" != "0" ]; then sleep 0.6; continue; fi
    agent-browser press Enter >/dev/null 2>&1
    sleep 0.9
    agent-browser press Enter >/dev/null 2>&1
    sleep 0.7
    OK=1
    break
  done
  [ "$OK" = "1" ] || { echo "FAIL at Q$EXPECT ($KEY)"; exit 1; }
done
# صفحهٔ نتیجه
for w in $(seq 1 20); do
  TXT=$(agent-browser eval "document.querySelector('main').innerText" 2>/dev/null)
  echo "$TXT" | grep -q "قهرمان\|۱۰۰\|پایان" && break
  agent-browser press Enter >/dev/null 2>&1
  sleep 0.6
done
agent-browser eval "document.querySelector('main').innerText" 2>/dev/null | tail -25
