#!/bin/bash
# r332 — درایورِ همگام‌شونده: پس از هر Enter شمارهٔ سؤال چک می‌شود؛ در صورت توقف، retry
# کلیدها بر اساس شمارهٔ سؤالِ زنده از qa-r332-b25-keys.txt (اندیس n-2 برای Q2..40)
set -e
cd /home/z/my-project
get_qnum() {
  agent-browser snapshot 2>/dev/null | grep -B4 " / " | grep -E '^\s+- StaticText "[0-9]+"$' | tail -1 | grep -oE '[0-9]+'
}
KEYS=()
while read -r k; do KEYS+=("$k"); done < scripts/qa-r332-b25-keys.txt
# KEYS[i] = کلیدِ سؤال i+2
for attempt_seq in $(seq 1 200); do
  QN=$(get_qnum)
  if [ -z "$QN" ]; then echo "!! cannot read question number"; sleep 2; continue; fi
  if [ "$QN" -gt 40 ]; then echo "REACHED $QN — done"; break; fi
  IDX=$((QN-2))
  if [ $IDX -lt 0 ] || [ $IDX -ge ${#KEYS[@]} ]; then echo "!! QN=$QN out of range"; break; fi
  K=${KEYS[$IDX]}
  agent-browser key "$K" >/dev/null 2>&1
  sleep 1.1
  agent-browser key "Enter" >/dev/null 2>&1
  sleep 1.3
  QN2=$(get_qnum)
  if [ -z "$QN2" ] || [ "$QN2" -le "$QN" ]; then
    # شاید فیدبک هنوز باز است — یک Enter دیگر
    agent-browser key "Enter" >/dev/null 2>&1
    sleep 1.3
    QN2=$(get_qnum)
    echo "Q$QN stalled (key=$K) -> retry-enter -> now ${QN2:-?}"
  else
    echo "Q$QN ok (key=$K) -> $QN2"
  fi
done
