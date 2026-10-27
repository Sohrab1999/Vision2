#!/usr/bin/env bash
# r404 E2E part 4 — q4..q11 (fixed ref extraction: "@eNNN" not "@ref=eNNN").
# keys: q4=1 q5=0 q6=1 q7=0 q8=1 q9=0 q10=1 q11=0
set -u
AB="agent-browser"

counter() {
  $AB snapshot 2>/dev/null | rg -m1 -A1 'StaticText "[0-9]+"' | rg -o '[0-9]+' | head -1
}

next_ref() {
  $AB snapshot 2>/dev/null | rg "سؤال بعدی|دیدن نتیجه" | rg -o 'e[0-9]+' | head -1
}

keys=(1 0 1 0 1 0 1 0)
for i in "${!keys[@]}"; do
  qn=$((i+4))
  cur=$(counter)
  $AB click "[data-quiz-option=\"${keys[$i]}\"]" >/dev/null 2>&1
  sleep 0.8
  ref=$(next_ref)
  if [ -z "$ref" ]; then echo "q$qn: NO NEXT REF"; continue; fi
  $AB click "@$ref" >/dev/null 2>&1
  sleep 0.8
  newc=$(counter)
  if [ "$newc" = "$((cur+1))" ]; then
    echo "q$qn: key=${keys[$i]} advanced $cur→$newc"
  else
    $AB click "@$ref" >/dev/null 2>&1
    sleep 0.8
    newc=$(counter)
    echo "q$qn: key=${keys[$i]} retry→ $cur→$newc"
  fi
done

sleep 2
echo "--- final screen ---"
$AB snapshot 2>/dev/null | sed -n '18,55p'
