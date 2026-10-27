#!/usr/bin/env bash
# r449 — سوئیتِ کامل در شاردهایِ ترتیبی — ادامهٔ ایدئومِ r416/r438..r441:
# شمارِ شارد از شمارِ فایلهایِ یکتا حساب میشود (sort -u)؛ Q=98 ثابتِ
# خانواده؛ PIPESTATUS جمع میشود؛ ONLY=پارامترِ رانِ شاردِ تنها (درسِ r440).
set -uo pipefail
cd /home/z/my-project
FILES=($(ls tests/*.test.* tests/*.component.* 2>/dev/null | sort -u))
Q=98
TOTAL=${#FILES[@]}
N=$(( (TOTAL + Q - 1) / Q ))
FAIL=0
ONLY=${1:-0}
echo "=== $TOTAL files -> $N sequential shards (Q=$Q) only=$ONLY ==="
for ((i=0; i<N; i++)); do
  if [ "$ONLY" != "0" ] && [ "$ONLY" != "$((i+1))" ]; then continue; fi
  START=$((i*Q))
  SLICE=("${FILES[@]:$START:$Q}")
  [ ${#SLICE[@]} -eq 0 ] && continue
  echo "=== SHARD $((i+1))/$N — ${#SLICE[@]} files ==="
  bunx vitest run "${SLICE[@]}" --reporter=dot 2>&1 | rg "Test Files|Tests " | head -2
  RC=${PIPESTATUS[0]}
  echo "shard $((i+1)) exit=$RC"
  [ "$RC" -ne 0 ] && FAIL=1
done
echo "SUITE-FAIL=$FAIL"
exit $FAIL
