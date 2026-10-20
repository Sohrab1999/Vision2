#!/usr/bin/env bash
# r405 E2E part 3 v2 — stem anchor: the paragraph right before button "a ".
set -u
AB="agent-browser"

for i in $(seq 1 12); do
  snap=$($AB snapshot 2>/dev/null)
  # stop when the result screen appears
  echo "$snap" | rg -q '"دانلود تصویر نتیجه"' && { echo "RESULT SCREEN reached at loop $i"; break; }
  # stem = paragraph text just above the first option button
  stem=$(echo "$snap" | rg -B3 'button "a ' | rg 'StaticText "' | tail -1 | sed 's/.*StaticText "//; s/"$//')
  frag=$(echo "$stem" | cut -c1-34)
  key=""
  if [ -n "$frag" ]; then
    key=$(rg -m1 -F "$frag" /tmp/konkur-stems.tsv 2>/dev/null | awk -F'\t' '{print $3}')
  fi
  if [ -z "$key" ]; then
    echo "q$i: NO KEY stem='${stem:0:60}'"; break
  fi
  $AB click "[data-quiz-option=\"$key\"]" >/dev/null 2>&1
  sleep 0.8
  ref=$($AB snapshot 2>/dev/null | rg '"سؤال بعدی|"دیدن نتیجه' | rg -o 'e[0-9]+' | head -1)
  if [ -n "$ref" ]; then $AB click "@$ref" >/dev/null 2>&1; else $AB press Enter >/dev/null 2>&1; fi
  sleep 1.0
  echo "q$i: key=$key stem='${frag}'"
done

sleep 2
echo "--- review result ---"
$AB snapshot 2>/dev/null | rg -n "درصد|فوق‌العاده|قهرمان|عالی" | head -5
$AB screenshot /tmp/qa-r405/review-result.png >/dev/null 2>&1
echo "--- mistakes store after review ---"
$AB eval "JSON.stringify(Object.fromEntries(Object.entries(JSON.parse(localStorage.getItem('vision2-study-v1')||'{}').state?.mistakes||{}).filter(([,c])=>c>0)))" 2>/dev/null | head -c 300; echo
