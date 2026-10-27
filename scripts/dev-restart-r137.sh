#!/bin/bash
# Task 137 — canonical Next dev (:3000) restart for this sandbox, mirroring
# scripts/judge-restart.sh's survival shape exactly (script-file execution,
# subshell + exec + append redirection + disown — the doodle launched this
# way in task 112 has survived hours; inline tool-shell launches die in
# seconds to the sandbox reaper).
# Usage: bash scripts/dev-restart-r137.sh
set -e
cd /home/z/my-project

if ss -tlnp 2>/dev/null | grep -q ':3000 '; then
  echo "next dev already listening on 3000 — nothing to do"
  exit 0
fi

pkill -f "next dev -p 3000" 2>/dev/null || true
sleep 1

(cd /home/z/my-project && exec node node_modules/.bin/next dev -p 3000 -H 127.0.0.1) \
  >> /home/z/my-project/dev.log 2>&1 &
disown 2>/dev/null || true

for i in $(seq 1 30); do
  sleep 1
  if ss -tlnp 2>/dev/null | grep -q ':3000 '; then
    echo "next dev up (attempt $i)"
    curl -s -o /dev/null -w 'http=%{http_code}\n' --max-time 90 http://127.0.0.1:3000/
    exit 0
  fi
done
echo "DEV-START-FAILED — inspect dev.log"
exit 1
