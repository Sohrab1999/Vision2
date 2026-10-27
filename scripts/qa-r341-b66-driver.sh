#!/bin/bash
# r341 — درایورِ رقمیِ بانک ۶۶ (Q2-20): رقم ۱-۴ + Enterِ گذر
# الگوی r339/r340: خواندنِ تازهٔ counter در سرِ حلقه، سنجِ بازخوردِ پیش از ثبت، رقم + سنجِ بازخورد، Enterِ گذر
KEYS="3 2 1 2 2 1 2 3 1 3 3 4 3 2 2 4 1 1 2"  # Q2..Q20 (یک-مبنا)
i=0
for k in $KEYS; do
  i=$((i+1))
  # خواندنِ تازهٔ شمارندهٔ سؤالِ فعلی
  CNT=$(agent-browser eval "(() => { const m = document.body.innerText.match(/سؤال (\d+) از ۲۰/); return m ? m[1] : '?'; })()" 2>/dev/null | tr -d '"' | tail -1)
  # ثبتِ پاسخ با میان‌برِ رقمی
  agent-browser press "$k" >/dev/null 2>&1
  sleep 0.35
  # سنجِ بازخورد
  FB=$(agent-browser eval "(() => { const t = document.body.innerText; return (t.includes('پاسخ درست') || t.includes('پاسخ نادرست')) ? 'OK' : 'NOFEEDBACK'; })()" 2>/dev/null | tr -d '"' | tail -1)
  echo "Q$((i+1)) [cnt=$CNT digit=$k feedback=$FB]"
  if [ "$FB" != "OK" ]; then
    echo "DRIVER-STOP: no feedback at Q$((i+1))"
    exit 1
  fi
  # Enterِ گذر (بستنِ بازخورد → سؤال بعد)
  agent-browser press Enter >/dev/null 2>&1
  sleep 0.3
done
echo "DRIVER-DONE: 19/19 registered"
