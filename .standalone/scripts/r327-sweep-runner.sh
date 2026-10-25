#!/bin/bash
# r327 — رانندهٔ خودکفای سویپ: سرور را بالا میآورد، 200 میشود، سویپ را
# میگذارد و خروجیِ زماندار مینویسد — همه در یک نشستِ جدا (setsid).
LOG=/tmp/r327-runner.log
echo "[$(date +%H:%M:%S)] runner start" >> "$LOG"
cd /home/z/my-project
# اگر 3000 زنده است دست نزن، وگرنه بالا بیاور
code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 4 http://127.0.0.1:3000 2>/dev/null)
if [ "$code" != "200" ]; then
  echo "[$(date +%H:%M:%S)] server down (code=$code) — starting" >> "$LOG"
  pkill -f "next dev" 2>/dev/null; pkill -f "next-server" 2>/dev/null
  sleep 1
  setsid nohup bun run dev >> dev.log 2>&1 < /dev/null &
  echo "[$(date +%H:%M:%S)] spawned, waiting for 200" >> "$LOG"
  for i in $(seq 1 30); do
    sleep 4
    code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 6 http://127.0.0.1:3000 2>/dev/null)
    echo "[$(date +%H:%M:%S)] warm try$i code=$code" >> "$LOG"
    [ "$code" = "200" ] && break
  done
fi
code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 6 http://127.0.0.1:3000 2>/dev/null)
if [ "$code" != "200" ]; then
  echo "[$(date +%H:%M:%S)] server still down — ABORT" >> "$LOG"
  exit 1
fi
echo "[$(date +%H:%M:%S)] server up — launching sweep" >> "$LOG"
rm -f /tmp/r326-contrast-results.txt
bash scripts/qa-r326-contrast.sh >> /tmp/r326-sweep-run.log 2>&1
echo "[$(date +%H:%M:%S)] sweep finished rc=$?" >> "$LOG"
# سرور را زنده نگه دار برای ادامهٔ راند (مانند نگهبانِ ۲۳۶ ولی بیپایان)
while true; do
  sleep 25
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 4 http://127.0.0.1:3000 2>/dev/null)
  if [ "$code" != "200" ]; then
    echo "[$(date +%H:%M:%S)] guard: down (code=$code) — restarting" >> "$LOG"
    pkill -f "next dev" 2>/dev/null; pkill -f "next-server" 2>/dev/null
    sleep 1
    setsid nohup bun run dev >> dev.log 2>&1 < /dev/null &
  fi
done
