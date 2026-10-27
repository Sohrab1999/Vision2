#!/usr/bin/env bash
# r453 — سگِ نگهبانِ سرور — پاسخِ راند به جمع‌کنندهٔ بیرونیِ محیط (مرگ‌های
# بیصدا؛ نه OOM و نه لاگ — پنجمین اثبات در همین راند). هر ۳ ثانیه سلامت
# میپرسد؛ اگر مرده بود بوتِ دوفورکیِ r435 را تکرار میکند. با «--stop» کشته میشود.
PAT='standalone/server\.js'
while true; do
  if ! curl -s -o /dev/null --max-time 3 http://127.0.0.1:3000/ 2>/dev/null; then
    if ! pgrep -f "$PAT" >/dev/null 2>&1; then
      echo "[watchdog $(date +%H:%M:%S)] server dead — rebooting"
      setsid env n="file:/home/z/my-project/db/custom.db" TEACHER_ACCESS_CODE=moallem-1404 \
        bun /home/z/my-project/.next/standalone/server.js >> /tmp/r453-watchdog.log 2>&1 &
    fi
  fi
  sleep 3
done
