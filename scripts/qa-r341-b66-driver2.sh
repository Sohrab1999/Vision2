#!/bin/bash
# r341 v2 — درایورِ رقمیِ بانک ۶۶ (Q2-20) با همگام‌سازیِ eval-polling (الگوی r334/r335)
# درسِ راند: درایورِ کور (بدونِ سنجِ شمارنده) با ری‌رندرِ React می‌رَسد — همیشه تا دیدنِ «N / 20» صبر کن
KEYS=(3 2 1 2 2 1 2 3 1 3 3 4 3 2 2 4 1 1 2)  # Q2..Q20 (یک-مبنا)
get_text() {
  agent-browser eval "document.body.innerText" 2>/dev/null | python3 -c "import sys,json
raw=sys.stdin.read().strip()
try:
    v=json.loads(raw)
    print(v if isinstance(v,str) else raw)
except Exception:
    print(raw)" 2>/dev/null
}
for i in $(seq 0 18); do
  QN=$((i+2))
  K=${KEYS[$i]}
  # ۱) همگام: صبر تا شمارندهٔ «QN / 20» (رقمِ لاتین — درسِ r339)
  SYNCED=0
  for t in $(seq 1 40); do
    if get_text | grep -qE "^${QN} / 20"; then SYNCED=1; break; fi
    # اگر در بازخورد گیر کرده‌ایم، Enterِ گذر
    agent-browser press Enter >/dev/null 2>&1 || true
    sleep 0.45
  done
  if [ "$SYNCED" != "1" ]; then echo "Q$QN: SYNC FAIL — abort"; exit 1; fi
  # ۲) ثبتِ پاسخ با میان‌برِ رقمی
  agent-browser press "$K" >/dev/null 2>&1 || true
  sleep 0.9
  # ۳) سنجِ بازخورد
  FB=$(get_text | grep -cE "پاسخ درست|پاسخ نادرست" || true)
  # ۴) Enterِ گذر
  agent-browser press Enter >/dev/null 2>&1 || true
  sleep 1.1
  echo "Q$QN key=$K fb=$FB"
done
echo "DRIVER-V2-DONE"
