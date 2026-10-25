#!/usr/bin/env bash
# r411 — سوئیتِ کامل در ۴ شاردِ ترتیبی (عینِ آیینِ راندهای پیشین)
set -uo pipefail
cd /home/z/my-project
FILES=($(ls tests/*.test.* tests/*.component.* 2>/dev/null | sort))
Q=97
FAIL=0
for i in 0 1 2 3; do
  START=$((i*Q))
  SLICE=("${FILES[@]:$START:$Q}")
  [ ${#SLICE[@]} -eq 0 ] && continue
  echo "=== SHARD $((i+1)) — ${#SLICE[@]} files ==="
  bunx vitest run "${SLICE[@]}" --reporter=dot 2>&1 | tail -6
  RC=${PIPESTATUS[0]}
  echo "shard $((i+1)) exit=$RC"
  [ "$RC" -ne 0 ] && FAIL=1
done
echo "SUITE-FAIL=$FAIL"
exit $FAIL
