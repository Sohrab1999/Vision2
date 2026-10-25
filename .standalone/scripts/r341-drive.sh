#!/usr/bin/env bash
# r341 — رانندهٔ یکپارچه: سرورِ سرد + سویپ در یک فراخوان (درسِ مرگِ خاموشِ سرور)
set -uo pipefail
cd /home/z/my-project

# 0) هر سرورِ کهنهٔ 3000 را ببند (فقط-۳۰۰۰؛ داورِ 3003 دستنخورده)
PIDS=$(pgrep -f "next dev -p 3000" 2>/dev/null || true)
[ -n "$PIDS" ] && kill $PIDS 2>/dev/null; sleep 2
PIDS=$(pgrep -f "next dev -p 3000" 2>/dev/null || true)
[ -n "$PIDS" ] && kill -9 $PIDS 2>/dev/null; sleep 1

# 1) سرورِ سرد
setsid nohup bash -c 'exec node node_modules/.bin/next dev -p 3000 -H 127.0.0.1 >> dev.log 2>&1' >/dev/null 2>&1 &
echo "cold-started"

# 2) صبر برای 200 واقعی
UP=0
for i in $(seq 1 40); do
  sleep 3
  C=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000 --max-time 8 2>/dev/null)
  if [ "$C" = "200" ]; then echo "up-after-${i}x3s"; UP=1; break; fi
done
[ "$UP" = "1" ] || { echo "SERVER-NEVER-UP"; exit 1; }

# 3) سویپِ راند
bash scripts/qa-r341-share-sweep.sh
SW=$?

# 4) سلامتِ پس از سویپ
C2=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000 --max-time 8 2>/dev/null)
echo "SWEEP_EXIT=$SW SERVER_AFTER=$C2"
exit $SW
