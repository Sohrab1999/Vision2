#!/usr/bin/env bash
# r328 — بازسنجیِ مرحلهٔ O2 (کارنامهٔ رسمی در تاریک) رویِ سرِ فعلی
#   سویپِ r327 پیش از ترمیم بود؛ گروههایِ نارنجی/برنزی در r327 بسته شدند —
#   این اجرا فقط O2 را دوباره میسنجد تا دُمِ واقعیِ r328 مشخص شود.
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
DIR=/home/z/my-project/scripts
OUT=/tmp/r328-o2-results.txt
mkdir -p "$EV"; : > "$OUT"

PERSONA=$(node "$DIR/r325-persona.js" | node -e 'let s="";process.stdin.on("data",d=>s+=d);process.stdin.on("end",()=>{const o=JSON.parse(s);o.state.freezeCount=1;console.log(JSON.stringify(o))})')

sweep() { agent-browser eval "$(cat "$DIR/r326-contrast-sweep.js")" 2>&1; }
shot() { agent-browser screenshot "$EV/$1" >/dev/null 2>&1; }
set_theme() { agent-browser eval "(()=>{localStorage.setItem('theme','$1');location.reload();return 'theme-$1';})()" >/dev/null 2>&1; sleep 3.5; }

agent-browser open "$BASE" >/dev/null 2>&1
agent-browser set viewport 390 844 >/dev/null 2>&1
agent-browser wait 'body' >/dev/null 2>&1 || true
sleep 2
agent-browser eval "(()=>{localStorage.setItem('vision2-study-v1', JSON.stringify(${PERSONA})); location.reload(); return 'seeded';})()" >/dev/null 2>&1
sleep 4

echo "-- MOUNT" | tee -a "$OUT"
agent-browser eval "(()=>{const st=JSON.parse(localStorage.getItem('vision2-study-v1')||'{}').state||{};return JSON.stringify({user:st.userName, paper:!!document.querySelector('.report-paper')});})()" 2>&1 | tee -a "$OUT"

echo "########## O2-LIVE. OFFICIAL REPORT — DARK 390 ##########" | tee -a "$OUT"
set_theme dark
agent-browser eval "(()=>{window.dispatchEvent(new Event('open-official-report'));return 'official-open-dark';})()" 2>&1 | tee -a "$OUT"
sleep 3
echo "-- report-official-dark-390" | tee -a "$OUT"
sweep | tee -a "$OUT"
shot r328-o2-official-dark.png

agent-browser press Escape >/dev/null 2>&1 || true
agent-browser eval "(()=>{localStorage.setItem('theme','light');return 'light-back';})()" >/dev/null 2>&1
agent-browser close >/dev/null 2>&1
echo "== done ==" | tee -a "$OUT"
