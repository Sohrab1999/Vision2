#!/bin/bash
# Task 104 — canonical judge (duel service :3003) restart for this sandbox.
#
# Context: instances launched from tool shells die after 30s–10min (sandbox
# reaper — cause external to the app; the init-launched instance survives).
# Every round's triple-check must therefore: `ss -tlnp | grep 3003` and if
# absent, run this script. The service itself needs no --hot here (code
# changes are followed by explicit restarts; the cwd bug that made restarts
# dangerous was fixed in task 104 — REPO_ROOT now comes from import.meta.dir,
# so any launch cwd yields the same canonical receipt-secret path).
#
# Usage: bash scripts/judge-restart.sh [--wait]
set -e
cd /home/z/my-project

if ss -tlnp 2>/dev/null | grep -q ':3003 '; then
  echo "judge already listening on 3003 — nothing to do"
  exit 0
fi

pkill -f "bun --hot mini-services/challenge-service" 2>/dev/null || true
pkill -f "bun run start" 2>/dev/null || true
sleep 1

# init-style parentage (exec + disown) — same shape as .zscripts/dev.sh boot
(cd /home/z/my-project/mini-services/challenge-service && exec bun run start) \
  >> /home/z/my-project/.zscripts/mini-service-challenge-service.log 2>&1 &
disown 2>/dev/null || true

for i in $(seq 1 10); do
  sleep 1
  if ss -tlnp 2>/dev/null | grep -q ':3003 '; then
    echo "judge up (attempt $i): $(ss -tlnp 2>/dev/null | grep ':3003 ' | grep -oP 'pid=\K[0-9]+' | head -1)"
    curl -s "http://127.0.0.1:3003/socket.io/?EIO=4&transport=polling" --max-time 4 | head -c 40
    echo
    exit 0
  fi
done
echo "JUDGE-START-FAILED — inspect .zscripts/mini-service-challenge-service.log"
exit 1
