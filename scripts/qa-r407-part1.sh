#!/bin/bash
# r407 — QA مرورگرِ E2E تک‌سشن: خانه → قفسه → کتاب دهم → درسِ دارایِ نثرِ ترمیم‌شده
set -e
cd /home/z/my-project
OUT=/tmp/qa-r407
mkdir -p $OUT

echo "=== 1) home load ==="
agent-browser open http://127.0.0.1:3000 >/dev/null 2>&1 || true
sleep 3
agent-browser snapshot 2>/dev/null | head -40 > $OUT/home-snap.txt
grep -c "button" $OUT/home-snap.txt || true

echo "=== 2) console check (fresh load) ==="
agent-browser console 2>/dev/null | grep -v "\[HMR\]" | grep -v "DevTools" | grep -v "Download the React DevTools" > $OUT/console.txt || true
echo "console-lines(after filter): $(wc -l < $OUT/console.txt)"
head -5 $OUT/console.txt

echo "=== 3) mobile 390 overflow ==="
agent-browser set viewport 390 844 >/dev/null 2>&1 || true
sleep 1
agent-browser eval "(() => { const d = document.documentElement; return JSON.stringify({w: d.scrollWidth, c: d.clientWidth, overflow: d.scrollWidth > d.clientWidth}); })()" 2>/dev/null | head -3

echo "=== 4) desktop 1280 overflow ==="
agent-browser set viewport 1280 800 >/dev/null 2>&1 || true
sleep 1
agent-browser eval "(() => { const d = document.documentElement; return JSON.stringify({w: d.scrollWidth, c: d.clientWidth, overflow: d.scrollWidth > d.clientWidth}); })()" 2>/dev/null | head -3

echo "=== 5) done ==="
