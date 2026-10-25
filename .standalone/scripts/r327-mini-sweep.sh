#!/usr/bin/env bash
# r327 — مینی‌سوییپِ پسااصلاح: خانهٔ روشن + خانهٔ تاریک + کارنامه در تاریک
# (سریع — فقط سه مرحلهٔ پرخطر؛ سویپِ کاملِ ۹مرحلهای در r326-contrast هست)
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
DIR=/home/z/my-project/scripts
OUT=/tmp/r327-mini-results.txt
mkdir -p "$EV"; : > "$OUT"

PERSONA=$(node "$DIR/r325-persona.js" | node -e 'let s="";process.stdin.on("data",d=>s+=d);process.stdin.on("end",()=>{const o=JSON.parse(s);o.state.freezeCount=1;console.log(JSON.stringify(o))})')

sweep() { agent-browser eval "$(cat "$DIR/r326-contrast-sweep.js")" 2>&1; }
shot() { agent-browser screenshot "$EV/$1" >/dev/null 2>&1; }
stage() { echo "-- $1" | tee -a "$OUT"; sweep | tee -a "$OUT"; }
set_theme() { agent-browser eval "(()=>{localStorage.setItem('theme','$1');location.reload();return 'theme-$1';})()" >/dev/null 2>&1; sleep 3.5; }

agent-browser open "$BASE" >/dev/null 2>&1
agent-browser set viewport 390 844 >/dev/null 2>&1
agent-browser wait 'body' >/dev/null 2>&1 || true
sleep 2
agent-browser eval "(()=>{localStorage.setItem('vision2-study-v1', JSON.stringify(${PERSONA})); location.reload(); return 'seeded';})()" >/dev/null 2>&1
sleep 4

echo "########## M1. HOME LIGHT 390 ##########" | tee -a "$OUT"
agent-browser eval "(()=>{try{JSON.parse(localStorage.getItem('vision2-study-v1')||'').state.userName||'';return 'storage-ok'}catch(e){return 'storage-BROKEN: '+e.message}})()" 2>&1 | tee -a "$OUT"
stage "home-light-390"
shot r327-mini-home-light.png

echo "########## M2. HOME DARK 390 ##########" | tee -a "$OUT"
set_theme dark
stage "home-dark-390"
shot r327-mini-home-dark.png

echo "########## M3. WEEKLY REPORT DARK 390 ##########" | tee -a "$OUT"
agent-browser eval "(()=>{window.dispatchEvent(new Event('open-report'));return 'weekly-open-dark';})()" >/dev/null 2>&1
sleep 2.5
stage "report-dark-390"
shot r327-mini-report-dark.png
agent-browser press Escape >/dev/null 2>&1 || true
agent-browser eval "(()=>{localStorage.setItem('theme','light');return 'light-back';})()" >/dev/null 2>&1
agent-browser close >/dev/null 2>&1
echo "== done ==" | tee -a "$OUT"
