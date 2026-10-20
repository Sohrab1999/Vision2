#!/usr/bin/env bash
# r405 E2E part 2 — answer all 10 bank-exam questions with option 0 (mixed right/wrong),
# verify counter advances each step, then read the result screen.
set -u
AB="agent-browser"

counter() {
  $AB snapshot 2>/dev/null | rg -m1 -o '[۰-٩0-9]+ از ۱۰' | head -1
}

for i in $(seq 1 10); do
  cur=$(counter)
  $AB click '[data-quiz-option="0"]' >/dev/null 2>&1
  sleep 0.6
  $AB press Enter >/dev/null 2>&1
  sleep 0.9
  newc=$(counter)
  echo "q$i: $cur -> $newc"
done

sleep 2
$AB snapshot 2>/dev/null | rg -n "دیدن نتیجه|نتیجه" | head -3
ref=$($AB snapshot 2>/dev/null | rg '"دیدن نتیجه"' | rg -o 'e[0-9]+' | head -1)
[ -n "$ref" ] && $AB click "@$ref" >/dev/null 2>&1
sleep 2
echo "--- result screen ---"
$AB snapshot 2>/dev/null | rg -n "بانک مرور|درست|اشتباه|درصد" | head -10
$AB screenshot /tmp/qa-r405/result.png >/dev/null 2>&1
echo "--- mistakes in store AFTER ---"
$AB eval "JSON.stringify(Object.fromEntries(Object.entries(JSON.parse(localStorage.getItem('vision2-study-v1')||'{}').state?.mistakes||{}).filter(([,c])=>c>0)))" 2>/dev/null | head -c 500; echo
