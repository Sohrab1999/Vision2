#!/usr/bin/env bash
# r331-verify-final — وارسیِ زندهٔ حذفِ آلفاها در چیپهایِ واژگان و کتابخانه
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
DIR=/home/z/my-project/scripts
OUT=/tmp/r331-verify-final.txt
mkdir -p "$EV"; : > "$OUT"
dbg()   { echo "-- [contrast] $1" | tee -a "$OUT"; agent-browser eval "$(cat "$DIR/r328-fails-dbg.js")" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
to_dark()  { agent-browser eval "(()=>{localStorage.setItem('theme','dark');document.documentElement.classList.add('dark');return 'dark';})()" >/dev/null 2>&1; sleep 1.2; }
to_light() { agent-browser eval "(()=>{localStorage.setItem('theme','light');document.documentElement.classList.remove('dark');return 'light';})()" >/dev/null 2>&1; sleep 1.2; }
click_tool() {
  agent-browser eval "(()=>{const g=document.querySelector('[aria-label=\"ابزارهای یادگیری\"]');if(!g)return 'NO-GRID';const b=[...g.querySelectorAll('button')].find(x=>(x.textContent||'').replace(/\\u200c/g,'').includes('$1'));if(!b)return 'NO-BTN';b.click();return 'clicked';})()" 2>&1
}
open_spine() {
  agent-browser eval "(()=>{const s=[...document.querySelectorAll('.book-spine .en-text')].find(x=>x.textContent?.trim()==='$1');if(!s)return 'NO-SPINE';const b=s.closest('button');if(!b)return 'NO-BTN';b.click();return 'clicked';})()" 2>&1
}

agent-browser open "$BASE" >/dev/null 2>&1
agent-browser set viewport 390 844 >/dev/null 2>&1
agent-browser wait 'body' >/dev/null 2>&1 || true
sleep 2
PERSONA=$(node "$DIR/r324-persona.js")
agent-browser eval "(()=>{localStorage.setItem('vision2-study-v1', JSON.stringify(${PERSONA})); location.reload(); return 'seeded';})()" >/dev/null 2>&1
sleep 4

echo "## A — واژگانِ L1 (چیپهایِ فیلتر بیآلفا)" | tee -a "$OUT"
open_spine "L1" >/dev/null 2>&1; sleep 2.5
dbg "vocab-chips-light"
agent-browser screenshot "$EV/r331-vocab-chips-light.png" >/dev/null 2>&1
to_dark
dbg "vocab-chips-dark"
to_light

echo "## B — کتابخانه (چیپهایِ شمارنده بیآلفا)" | tee -a "$OUT"
click_tool "کتابخانه" >/dev/null 2>&1; sleep 2.5
dbg "library-chips-light"
agent-browser screenshot "$EV/r331-library-chips-light.png" >/dev/null 2>&1
to_dark
dbg "library-chips-dark"
to_light

agent-browser close >/dev/null 2>&1
echo "log=$OUT"
