#!/usr/bin/env bash
# ------------------------------------------------------------------
# r332-pass3 — کشفِ ابزاریِ راند: personaِ r322/r324 فقط state.history
#   (فرمتِ کهنه) را میکارد و dayHistory خالی میماند — چیپِ استریکِ
#   کتابخانه (aria-label="زنجیرهٔ روزهای خواندن داستان") در هیچ QAِ
#   شخصیت‌داری بیدار نشده بود. این پاس، dayHistory را هم تزریق میکند
#   و چیپ را زندهسنجیده میکند (روشن+تاریک).
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
DIR=/home/z/my-project/scripts
OUT=/tmp/r332-pass3.txt
: > "$OUT"

dbg()   { echo "-- [contrast] $1" | tee -a "$OUT"; agent-browser eval "$(cat "$DIR/r328-fails-dbg.js")" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
to_dark()  { agent-browser eval "(()=>{localStorage.setItem('theme','dark');document.documentElement.classList.add('dark');return 'dark-inplace';})()" >/dev/null 2>&1; sleep 1.2; }
to_light() { agent-browser eval "(()=>{localStorage.setItem('theme','light');document.documentElement.classList.remove('dark');return 'light-inplace';})()" >/dev/null 2>&1; sleep 1.2; }
probe() { echo "-- [probe] $1" | tee -a "$OUT"; agent-browser eval "$2" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
click_tool() {
  agent-browser eval "(()=>{const g=document.querySelector('[aria-label=\"ابزارهای یادگیری\"]');if(!g)return 'NO-GRID';const b=[...g.querySelectorAll('button')].find(x=>(x.textContent||'').replace(/\\u200c/g,'').includes('$1'));if(!b)return 'NO-BTN';b.click();return 'clicked';})()" 2>&1
}

agent-browser open "$BASE" >/dev/null 2>&1
agent-browser set viewport 390 844 >/dev/null 2>&1
agent-browser wait 'body' >/dev/null 2>&1 || true
sleep 2
PERSONA=$(node "$DIR/r324-persona.js")
agent-browser eval "(()=>{const p=JSON.stringify(${PERSONA});const st=JSON.parse(p);st.state.libraryDone={'s1-1':{score:5,total:5,day:'2026-10-22'},'s1-2':{score:4,total:5,day:'2026-10-22'},'s1-3':{score:5,total:5,day:'2026-10-21'},'s1-4':{score:3,total:5,day:'2026-10-21'},'s1-5':{score:4,total:5,day:'2026-10-20'}};st.state.dayHistory=st.state.history;localStorage.setItem('vision2-study-v1', JSON.stringify(st));location.reload();return 'r332-pass3-seeded';})()" >/dev/null 2>&1
sleep 4
click_tool "کتابخانهٔ داستانها" >/dev/null 2>&1; sleep 2.5
probe "streak-chip" "(()=>{const chip=document.querySelector('[aria-label=\"زنجیرهٔ روزهای خواندن داستان\"]');return JSON.stringify({mounted:!!chip,text:chip?chip.textContent.trim():''});})()"
dbg "library-streak-light"
shot r332-library-streak-light.png
to_dark
probe "streak-chip-dark" "(()=>{const chip=document.querySelector('[aria-label=\"زنجیرهٔ روزهای خواندن داستان\"]');return JSON.stringify({mounted:!!chip,text:chip?chip.textContent.trim():''});})()"
dbg "library-streak-dark"
shot r332-library-streak-dark.png
to_light

echo "########## DONE" | tee -a "$OUT"
agent-browser close >/dev/null 2>&1
echo "log=$OUT"
