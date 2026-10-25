#!/usr/bin/env bash
# r329 — اسکرین‌شاتهایِ شاهدِ پساترمیم
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
DIR=/home/z/my-project/scripts

PERSONA=$(node "$DIR/r325-persona.js" | node -e 'let s="";process.stdin.on("data",d=>s+=d);process.stdin.on("end",()=>{const o=JSON.parse(s);o.state.freezeCount=1;console.log(JSON.stringify(o))})')

agent-browser open "$BASE" >/dev/null 2>&1
agent-browser set viewport 390 844 >/dev/null 2>&1
agent-browser wait 'body' >/dev/null 2>&1 || true
sleep 2
agent-browser eval "(()=>{localStorage.setItem('vision2-study-v1', JSON.stringify(${PERSONA})); location.reload(); return 'seeded';})()" >/dev/null 2>&1
sleep 4
agent-browser screenshot "$EV/r329-home-light-fixed.png" >/dev/null 2>&1
agent-browser eval "(()=>{window.dispatchEvent(new Event('open-report'));return 'weekly';})()" >/dev/null 2>&1
sleep 2.5
agent-browser screenshot "$EV/r329-weekly-light-fixed.png" >/dev/null 2>&1
agent-browser eval "(()=>{localStorage.setItem('theme','dark');location.reload();return 'dark';})()" >/dev/null 2>&1
sleep 3.5
agent-browser eval "(()=>{window.dispatchEvent(new Event('open-report'));return 'weekly-dark';})()" >/dev/null 2>&1
sleep 2.5
agent-browser screenshot "$EV/r329-weekly-dark-fixed.png" >/dev/null 2>&1
agent-browser press Escape >/dev/null 2>&1 || true
agent-browser eval "(()=>{localStorage.setItem('theme','light');return 'back';})()" >/dev/null 2>&1
agent-browser close >/dev/null 2>&1
echo "evidence saved"
