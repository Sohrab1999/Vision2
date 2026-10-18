#!/bin/bash
# r332 — درایورِ رقمیِ بانک ۲۵ (Q2-40): میانبرهای ۱-۴ + Enter، تایمینگ امن ۱.۱/۱.۳s
set -e
KEYS=/home/z/my-project/scripts/qa-r332-b25-keys.txt
i=0
while read -r k; do
  i=$((i+1))
  agent-browser key "$k" >/dev/null 2>&1
  sleep 1.1
  agent-browser key "Enter" >/dev/null 2>&1
  sleep 1.3
  echo "Q$((i+1)) done (key=$k)"
done < "$KEYS"
echo "ALL DONE"
