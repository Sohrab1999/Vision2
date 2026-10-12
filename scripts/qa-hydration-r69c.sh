#!/usr/bin/env bash
set -u
AB="bunx agent-browser"

echo "=== A: fresh learner (no storage) ==="
$AB close --all >/dev/null 2>&1; sleep 1
$AB open http://127.0.0.1:3000 >/dev/null 2>&1; sleep 2
$AB eval "(()=>{localStorage.clear(); sessionStorage.clear(); return 'wiped'})()" >/dev/null 2>&1
$AB close --all >/dev/null 2>&1; sleep 1
$AB open http://127.0.0.1:3000 >/dev/null 2>&1; sleep 3
echo "hydration errors: $($AB console --level error 2>&1 | grep -c 'hydration-mismatch' || true)"

echo "=== B: returning learner (streak=4 + dark + onboarded) ==="
$AB eval "(()=>{localStorage.setItem('vision2-study-v1', JSON.stringify({state:{streak:4,onboarded:true,lastActive:new Date().toISOString().slice(0,10)},version:0})); localStorage.setItem('theme','dark'); return 'seeded'})()" >/dev/null 2>&1
$AB close --all >/dev/null 2>&1; sleep 1
$AB open http://127.0.0.1:3000 >/dev/null 2>&1; sleep 3
echo "hydration errors: $($AB console --level error 2>&1 | grep -c 'hydration-mismatch' || true)"
$AB console --level error 2>&1 | grep -A3 'aria-controls' | head -8

echo "=== C: returning learner after nav to dictionary (backup flushed) ==="
$AB eval "(()=>{const btn=[...document.querySelectorAll('nav button')].find(b=>(b.textContent||'').includes('دیکشنری'));if(btn){btn.click();return 'nav'};return 'no'})()" >/dev/null 2>&1
sleep 5
$AB eval "(()=>{return JSON.stringify(Object.keys(localStorage))})()" 2>&1
$AB close --all >/dev/null 2>&1; sleep 1
$AB open http://127.0.0.1:3000 >/dev/null 2>&1; sleep 3
echo "hydration errors: $($AB console --level error 2>&1 | grep -c 'hydration-mismatch' || true)"
$AB console --level error 2>&1 | grep -B1 -A1 'aria-controls' | head -8
