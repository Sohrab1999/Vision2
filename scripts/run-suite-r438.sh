#!/usr/bin/env bash
# r438 — سوئیتِ کامل در شاردهایِ ترتیبی — ادامهٔ ایدئومِ r416/r437: شمارِ
# شارد از شمارِ فایلها حساب میشود (Q=98 ثابت با ۴ شاردِ خشک، فایلهایِ
# آخرِ سوئیتِ رشدکرده را بیِ اجرا میگذاشت). سقفِ شارد پویاست.
set -uo pipefail
cd /home/z/my-project
FILES=($(ls tests/*.test.* tests/*.component.* 2>/dev/null | sort -u))
Q=98
TOTAL=${#FILES[@]}
N=$(( (TOTAL + Q - 1) / Q ))
FAIL=0
echo "=== $TOTAL files -> $N sequential shards (Q=$Q) ==="
for ((i=0; i<N; i++)); do
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
