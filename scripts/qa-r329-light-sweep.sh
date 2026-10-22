#!/usr/bin/env bash
# ------------------------------------------------------------------
# r329 — تشخیصِ هویتِ گروههایِ مردودِ سویپِ روشن (پیشنهادهایِ ①②③ِ r328)
#   dbgِ r328 (شناسنامهٔ کاملِ هر گروه) رویِ چهار مرحلهٔ نماینده:
#     home-light (۱۳ گروه — مشترک با پاپآور/کارنامهٔ روشن)
#     weekly-light (۱۹ — شش گروهِ اضافه)
#     weekly-dark (۴ — دنبالهدارهایِ تاریک)
#     home-desktop (۳ — سولیدهایِ کهربایی/نارنجیِ زیرِ سفید)
# تکفراخوانی: open → seed → dbg → shot → close
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
DIR=/home/z/my-project/scripts
OUT=/tmp/r329-dbg-results.txt
mkdir -p "$EV"; : > "$OUT"

PERSONA=$(node "$DIR/r325-persona.js" | node -e 'let s="";process.stdin.on("data",d=>s+=d);process.stdin.on("end",()=>{const o=JSON.parse(s);o.state.freezeCount=1;console.log(JSON.stringify(o))})')

dbg() { agent-browser eval "$(cat "$DIR/r328-fails-dbg.js")" 2>&1; }
shot() { agent-browser screenshot "$EV/$1" >/dev/null 2>&1; }
set_theme() { agent-browser eval "(()=>{localStorage.setItem('theme','$1');location.reload();return 'theme-$1';})()" >/dev/null 2>&1; sleep 3.5; }

agent-browser open "$BASE" >/dev/null 2>&1
agent-browser set viewport 390 844 >/dev/null 2>&1
agent-browser wait 'body' >/dev/null 2>&1 || true
sleep 2
agent-browser eval "(()=>{localStorage.setItem('vision2-study-v1', JSON.stringify(${PERSONA})); location.reload(); return 'seeded';})()" >/dev/null 2>&1
sleep 4

echo "########## MOUNT" | tee -a "$OUT"
agent-browser eval "(()=>{const st=JSON.parse(localStorage.getItem('vision2-study-v1')||'{}').state||{};return JSON.stringify({user:st.userName,paper:!!document.querySelector('.report-paper')});})()" 2>&1 | tee -a "$OUT"

echo "########## STAGE1. HOME — LIGHT 390 (dbg)" | tee -a "$OUT"
dbg | tee -a "$OUT"
shot r329-home-light.png

echo "########## STAGE2. WEEKLY — LIGHT 390 (dbg)" | tee -a "$OUT"
agent-browser eval "(()=>{window.dispatchEvent(new Event('open-report'));return 'weekly-open';})()" >/dev/null 2>&1
sleep 2.5
dbg | tee -a "$OUT"
shot r329-weekly-light.png

echo "########## STAGE3. WEEKLY — DARK 390 (dbg)" | tee -a "$OUT"
set_theme dark
agent-browser eval "(()=>{window.dispatchEvent(new Event('open-report'));return 'weekly-open-dark';})()" >/dev/null 2>&1
sleep 2.5
dbg | tee -a "$OUT"
shot r329-weekly-dark.png

echo "########## STAGE4. HOME — DESKTOP 1280 LIGHT (dbg)" | tee -a "$OUT"
set_theme light
agent-browser set viewport 1280 900 >/dev/null 2>&1
sleep 1.5
agent-browser eval "(()=>{location.reload();return 'reload';})()" >/dev/null 2>&1
sleep 3.5
dbg | tee -a "$OUT"
shot r329-home-desktop.png

agent-browser set viewport 390 844 >/dev/null 2>&1
agent-browser close >/dev/null 2>&1
echo "== done ==" | tee -a "$OUT"
