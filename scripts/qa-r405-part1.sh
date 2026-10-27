#!/usr/bin/env bash
# r405 E2E — konkur mistakes: record (exam bank session) → quick review chip (بانک کنکور دهم)
# → resolve in review session → bank empty. Single fresh session, verify each step.
set -u
AB="agent-browser"
BASE="http://127.0.0.1:3000"

step() { echo "== $1"; }

step "open fresh home"
$AB open "$BASE" >/dev/null 2>&1
sleep 6
$AB snapshot >/tmp/qa-r405/home.snap 2>/dev/null
rg -c "مرور سریع" /tmp/qa-r405/home.snap >/dev/null && echo "home ok: quick-review tile present"

step "mistakes in store BEFORE"
$AB eval "JSON.stringify(Object.fromEntries(Object.entries(JSON.parse(localStorage.getItem('vision2-study-v1')||'{}').state?.mistakes||{}).filter(([,c])=>c>0)))" 2>/dev/null | head -c 300; echo

step "go to exam corner (header nav)"
ref=$($AB snapshot 2>/dev/null | rg '"آزمون جامع"' | rg -o 'e[0-9]+' | head -1)
echo "nav ref=$ref"
$AB click "@$ref" >/dev/null 2>&1
sleep 2

step "open konkur10 card"
ref=$($AB snapshot 2>/dev/null | rg '"بانک کنکوری پایهٔ دهم"' | rg -o 'e[0-9]+' | head -1)
echo "card ref=$ref"
$AB click "@$ref" >/dev/null 2>&1
sleep 2
$AB snapshot >/tmp/qa-r405/konkur10.snap 2>/dev/null
rg -c "شروع آزمون بانک دهم" /tmp/qa-r405/konkur10.snap >/dev/null && echo "konkur10 config ok"

step "start bank exam (10 questions, untimed)"
ref=$($AB snapshot 2>/dev/null | rg '"شروع آزمون بانک دهم"' | rg -o 'e[0-9]+' | head -1)
$AB click "@$ref" >/dev/null 2>&1
sleep 2
# choose untimed if visible
ref=$($AB snapshot 2>/dev/null | rg '"بدون تایمر"' | rg -o 'e[0-9]+' | head -1)
[ -n "$ref" ] && $AB click "@$ref" >/dev/null 2>&1
ref=$($AB snapshot 2>/dev/null | rg '"شروع آزمون بانک دهم"' | rg -o 'e[0-9]+' | head -1)
[ -n "$ref" ] && $AB click "@$ref" >/dev/null 2>&1
sleep 2
$AB snapshot | rg -m2 'StaticText "[0-9٠-٩]+ / |۱۰' | head -2
echo "quiz opened"
