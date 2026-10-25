#!/bin/bash
# ------------------------------------------------------------------
# r362 — نگهبانِ بهروزشدهٔ خدمات (جانشینِ r236 که ساعتِ ۱۸:۰۷ بازنشسته شد)
#
# درسِ دیسکِ این راند: processesِ گوشنندهٔ مِیزبانِ ابزار بعد از
# ۳۰ثانیه تا ۱۰دقیقه توسطِ reaper سندباکس درو میشوند (Task 104 —
# علتِ بیرون از اپ)، اما پایشگرهایِ بیگوشننده ساعت‌ها زنده میمانند
# (نگهبانِ r236 چهل ساعت زندگی کرد). پس این نگهبانِ بیگوشننده
# میایستد و دو خدمت را سربلنگ بلند میکند:
#   · اپ (3000): فرمولِ r350 — standaloneِ تازه با DATABASE_URL و
#     TEACHER_ACCESS_CODE (قاعدهٔ سربلنگیِ استانداردِ راندها)
#   · داور (3003): اسکریپتِ رسمیِ scripts/judge-restart.sh — نه
#     دستورِ دستی (دست نزدن به داور یعنی فقط مسیرِ رسمی)
# طولِ زندگی: ۶۰ دور × ۳۰ثانیه ≈ ۳۰ دقیقه — پوششِ پایانِ راند.
# ------------------------------------------------------------------
cd /home/z/my-project

for i in $(seq 1 60); do
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 http://127.0.0.1:3000 2>/dev/null)
  if [ "$code" != "200" ]; then
    echo "[$(date +%H:%M:%S)] app down (code=$code) — restarting standalone" >> keepalive-r362.log
    pkill -f "next dev" 2>/dev/null
    pkill -f ".next/standalone/server.js" 2>/dev/null
    sleep 1
    (export DATABASE_URL="file:/home/z/my-project/db/custom.db" TEACHER_ACCESS_CODE=moallem-1404; exec bun .next/standalone/server.js) >> /tmp/r362-server-keepalive.log 2>&1 &
    disown 2>/dev/null || true
  else
    echo "[$(date +%H:%M:%S)] app ok" >> keepalive-r362.log
  fi
  if ! ss -tlnp 2>/dev/null | grep -q ':3003 '; then
    echo "[$(date +%H:%M:%S)] judge down — canonical restart" >> keepalive-r362.log
    bash scripts/judge-restart.sh >> keepalive-r362.log 2>&1 || true
  fi
  sleep 30
done
echo "[$(date +%H:%M:%S)] keepalive-r362 retired after 60 cycles" >> keepalive-r362.log
