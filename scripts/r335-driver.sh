#!/bin/bash
# r335 — in-driver: Q2-Q45 of bank 31 (keys 1-4, eval-polling sync)
# keys (1-based digits): from print key pp267-271
KEYS=(2 4 2 4 3 1 4 2 1 3 4 1 4 2 3 1 2 1 1 1 2 4 1 4 3 3 3 4 3 1 4 2 2 3 1 2 1 3 1 4 3 4 1 4 2)
set -e
cd /home/z/my-project
# wait for Q2
for i in $(seq 1 20); do
  T=$(agent-browser eval "document.body.innerText" 2>/dev/null | python3 -c "import sys,json; print(json.loads(sys.stdin.read()))" 2>/dev/null | grep -oE "۲ / ۴۵|2 / 45" | head -1)
  [ -n "$T" ] && break
  sleep 0.5
done
echo "Q2 detected"
for q in $(seq 2 45); do
  K=${KEYS[$((q-1))]}
  # poll: is question q visible? (Persian digits)
  QFA=$(python3 -c "print('$q'.translate(str.maketrans('0123456789','۰۱۲۳۴۵۶۷۸۹')))")
  for try in 1 2 3 4 5 6 7 8 9 10; do
    CUR=$(agent-browser eval "document.body.innerText" 2>/dev/null | python3 -c "import sys,json; print(json.loads(sys.stdin.read()))" 2>/dev/null | grep -oE "$QFA / ۴۵" | head -1)
    [ -n "$CUR" ] && break
    # else press Enter to advance from feedback
    agent-browser press Enter >/dev/null 2>&1 || true
    sleep 0.55
  done
  agent-browser press "$K" >/dev/null 2>&1 || true
  sleep 1.05
  # advance past feedback
  agent-browser press Enter >/dev/null 2>&1 || true
  sleep 1.25
  echo "Q$q key=$K done"
done
echo "DRIVER COMPLETE"
