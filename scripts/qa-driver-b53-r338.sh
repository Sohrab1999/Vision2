#!/bin/bash
# r338 — درایورِ بانک ۵۳ (تایپیِ بانک‌واژه) v2 — درسِ همین راند:
# پس از ثبتِ typed، textbox DISABLED می‌شود و «سؤال بعدی» می‌آید → Enter دومِ ر337 همان گذر است
# اما اگر درایور در حالتِ بازخورد شروع شود باید اول یک Enter گذر بزند و بعد fill کند
set -u
ANSWERS=(inventions medicines lives try developed experiments possible translate knowledge published passed thousands cradle solve inventors)

get_tb() {
  agent-browser snapshot -c 2>&1 | grep -oE 'textbox "پاسخ تایپی" \[[^]]*ref=(e[0-9]+)\]:?' | grep -oE 'e[0-9]+' | head -1
}
tb_disabled() {
  agent-browser snapshot -c 2>&1 | grep -oE 'textbox "پاسخ تایپی" \[disabled[^]]*ref=(e[0-9]+)\]:?' | grep -oE 'e[0-9]+' | head -1
}

# گامِ صفر: اگر در بازخوردِ Q1 هستیم، یک Enter گذر بزن
if [ -n "$(tb_disabled)" ]; then
  agent-browser press Enter >/dev/null 2>&1; sleep 0.8
  echo "advanced past feedback"
fi

for i in "${!ANSWERS[@]}"; do
  A="${ANSWERS[$i]}"
  # اگر هنوز disabled (بازخوردِ سؤالِ قبلی)، Enter گذر
  for try in 1 2 3; do
    D=$(tb_disabled)
    [ -z "$D" ] && break
    agent-browser press Enter >/dev/null 2>&1; sleep 0.8
  done
  REF=$(get_tb)
  if [ -z "$REF" ]; then echo "NO-TEXTBOX at Q$((i+2))"; agent-browser screenshot "/tmp/qa-r338-b53-stuck-q$((i+2)).png" | tail -1; exit 1; fi
  agent-browser fill "@$REF" "$A" >/dev/null 2>&1
  sleep 0.4
  agent-browser press Enter >/dev/null 2>&1  # ثبت
  sleep 0.6
  agent-browser press Enter >/dev/null 2>&1  # گذرِ بازخورد
  sleep 0.6
  CNT=$(agent-browser eval "document.body.innerText.match(/(\d+) \/ 16/)?.[1]" 2>/dev/null | tail -1)
  echo "Q$((i+2)): filled=$A counter=$CNT"
done
echo "DRIVER-DONE"
agent-browser screenshot /tmp/qa-r338-b53-result.png | tail -1
