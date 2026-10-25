#!/usr/bin/env bash
# Controlled hydration experiment r69
set -u
AB="bunx agent-browser"

echo "=== STEP 1: load with current (old) profile ==="
$AB open http://127.0.0.1:3000 >/dev/null 2>&1
sleep 3
$AB console --level error 2>&1 | grep -ci "hydrat" || true

echo "=== STEP 2: wipe storage, fresh load ==="
$AB eval "(()=>{localStorage.clear(); sessionStorage.clear(); return 'wiped'})()" 2>&1
$AB open http://127.0.0.1:3000 >/dev/null 2>&1
sleep 3
$AB console --level error 2>&1 | grep -ci "hydrat" || true

echo "=== STEP 3: seed returning-learner state (streak 4, dark theme, onboarded), reload ==="
$AB eval "(()=>{localStorage.setItem('vision2-study-v1', JSON.stringify({state:{streak:4,onboarded:true,lastActive:new Date().toISOString().slice(0,10)},version:0})); localStorage.setItem('theme','dark'); return 'seeded'})()" 2>&1
$AB open http://127.0.0.1:3000 >/dev/null 2>&1
sleep 3
echo "-- hydration error count:"
$AB console --level error 2>&1 | grep -ci "hydrat" || true

echo "=== STEP 4: same seed but navigate to dictionary first (persist nothing on view), reload ==="
$AB eval "(()=>{const btn=[...document.querySelectorAll('nav button')].find(b=>(b.textContent||'').includes('دیکشنری'));if(btn){btn.click();return 'nav-clicked'};return 'no-nav'})()" 2>&1
sleep 2
$AB open http://127.0.0.1:3000 >/dev/null 2>&1
sleep 3
echo "-- hydration error count:"
$AB console --level error 2>&1 | grep -ci "hydrat" || true
echo "=== DONE ==="
