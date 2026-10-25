#!/usr/bin/env bash
set -u
AB="bunx agent-browser"
OUT=/tmp/hyd-r69
mkdir -p $OUT

$AB eval "(()=>{localStorage.clear(); sessionStorage.clear(); return 'wiped'})()" >/dev/null 2>&1
$AB open http://127.0.0.1:3000 >/dev/null 2>&1
sleep 3
$AB console --level error > $OUT/fresh.txt 2>&1
echo "fresh-load mismatch-URL count: $(grep -c 'hydration-mismatch' $OUT/fresh.txt || true)"

$AB eval "(()=>{localStorage.setItem('vision2-study-v1', JSON.stringify({state:{streak:4,onboarded:true,lastActive:new Date().toISOString().slice(0,10)},version:0})); localStorage.setItem('theme','dark'); return 'seeded'})()" >/dev/null 2>&1
$AB open http://127.0.0.1:3000 >/dev/null 2>&1
sleep 3
$AB console --level error > $OUT/seeded.txt 2>&1
echo "seeded-load mismatch-URL count: $(grep -c 'hydration-mismatch' $OUT/seeded.txt || true)"

# navigate to dictionary (real click), wait for auto-backup debounce to flush, reload
$AB eval "(()=>{const btn=[...document.querySelectorAll('nav button')].find(b=>(b.textContent||'').includes('دیکشنری'));if(btn){btn.click();return 'nav-clicked'};return 'no-nav'})()" >/dev/null 2>&1
sleep 5
$AB eval "(()=>{return JSON.stringify(Object.keys(localStorage))})()" 2>&1
$AB open http://127.0.0.1:3000 >/dev/null 2>&1
sleep 3
$AB console --level error > $OUT/afternav.txt 2>&1
echo "afternav-load mismatch-URL count: $(grep -c 'hydration-mismatch' $OUT/afternav.txt || true)"
echo "--- diff fresh vs afternav (first 40 lines) ---"
diff $OUT/fresh.txt $OUT/afternav.txt | head -40 || true
