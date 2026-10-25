#!/bin/bash
# راند ۲۳۶ — نگهبانِ سرویسِ Next: اگر 3000 پاسخ نداد، سرور را بالا می‌آورد
cd /home/z/my-project
for i in $(seq 1 60); do
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 4 http://127.0.0.1:3000 2>/dev/null)
  if [ "$code" != "200" ]; then
    echo "[$(date +%H:%M:%S)] down (code=$code) — restarting" >> dev-keepalive.log
    pkill -f "next dev" 2>/dev/null; pkill -f "next-server" 2>/dev/null
    sleep 1
    setsid nohup bun run dev >> dev.log 2>&1 < /dev/null &
    sleep 20
  else
    echo "[$(date +%H:%M:%S)] ok" >> dev-keepalive.log
  fi
  sleep 25
done
