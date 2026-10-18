#!/bin/bash
# r337 — درایورِ fill برای بانک ۳۹ (بخش A) — آیتم‌های ۲-۸
# درس‌های r336: ref = sed؛ تایپ = fill + سنجِ disabled؛ نظرسنجی = شمارندهٔ لاتینِ innerText
set -u
KEYS=(carry collects famous moon hunters instead microscope)
for i in "${!KEYS[@]}"; do
  KEY="${KEYS[$i]}"
  EXPECT=$((i + 2))
  OK=0
  for attempt in 1 2 3; do
    # صبر تا سؤالِ EXPECT
    for w in 1 2 3 4 5 6 7 8 9 10; do
      CUR=$(agent-browser eval "document.querySelector('main').innerText.match(/(\d+) \/ 8/)?.[1] || 'x'" 2>/dev/null | tr -d '"')
      [ "$CUR" = "$EXPECT" ] && break
      sleep 0.5
    done
    CUR=$(agent-browser eval "document.querySelector('main').innerText.match(/(\d+) \/ 8/)?.[1] || 'x'" 2>/dev/null | tr -d '"')
    [ "$CUR" = "$EXPECT" ] || { sleep 1; continue; }
    # refِ تکست‌باکسِ فعال از snapshot
    REF=$(agent-browser snapshot 2>/dev/null | sed -nE 's/.*textbox "پاسخ تایپی" \[ref=(e[0-9]+)\].*/\1/p' | head -1)
    [ -z "$REF" ] && { sleep 0.8; continue; }
    agent-browser fill "$REF" "$KEY" >/dev/null 2>&1
    # سنجِ disabled: اگر دکمه هنوز disabled است، fill ناموفق بوده
    DIS=$(agent-browser snapshot 2>/dev/null | grep -c 'button "بررسی پاسخ" \[disabled')
    if [ "$DIS" != "0" ]; then sleep 0.6; continue; fi
    agent-browser press Enter >/dev/null 2>&1
    sleep 0.9
    # Enter دوم: گذر از بازخورد به سؤال بعدی (r336: بعد از بازخورد، Enter سؤال بعدی)
    agent-browser press Enter >/dev/null 2>&1
    sleep 0.7
    OK=1
    break
  done
  [ "$OK" = "1" ] || { echo "FAIL at Q$EXPECT ($KEY)"; exit 1; }
done
# نتیجهٔ نهایی
for w in 1 2 3 4 5 6 7 8 9 10; do
  TXT=$(agent-browser eval "document.querySelector('main').innerText" 2>/dev/null)
  echo "$TXT" | grep -q "پایان آزمون\|نتیجه\|قهرمان\|8 / 8" && break
  sleep 0.6
done
agent-browser eval "document.querySelector('main').innerText" 2>/dev/null | tail -30
