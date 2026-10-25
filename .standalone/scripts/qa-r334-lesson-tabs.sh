#!/usr/bin/env bash
# ------------------------------------------------------------------
# r334-b — «هفت زبانهٔ درسِ هرگزسنجیده»: مکالمه · ریدینگ · گرامر ·
#   نگارش · دیکته · تست‌ها · مترادف و متضاد — واژگان (r333) و جزوه
#   (r333/r334) پوشیده شدهاند؛ این سویپ هفت زبانهٔ باقیمانده را در
#   L1 (پایهٔ یازدهم) در دو تم با dbg + basis میسنجد — تک سشن.
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
DIR=/home/z/my-project/scripts
OUT=/tmp/r334-tabs.txt
mkdir -p "$EV"; : > "$OUT"

dbg()   { echo "-- [contrast] $1" | tee -a "$OUT"; agent-browser eval "$(cat "$DIR/r328-fails-dbg.js")" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
basis() { echo "-- [basis-zero] $1" | tee -a "$OUT"; agent-browser eval "$(cat "$DIR/r319-basis-zero-audit.js")" 2>&1 | tail -1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
shot()  { agent-browser screenshot "$EV/$1" >/dev/null 2>&1; }
to_dark()  { agent-browser eval "(()=>{localStorage.setItem('theme','dark');document.documentElement.classList.add('dark');return 'd';})()" >/dev/null 2>&1; sleep 1.2; }
to_light() { agent-browser eval "(()=>{localStorage.setItem('theme','light');document.documentElement.classList.remove('dark');return 'l';})()" >/dev/null 2>&1; sleep 1.2; }
click_tab() { # $1 نامِ دقیق — $2 برچسب
  agent-browser eval "(()=>{const nav=[...document.querySelectorAll('nav')].find(n=>(n.getAttribute('aria-label')||'').includes('درس'));const b=[...nav.querySelectorAll('button')].find(x=>x.textContent?.trim()==='$1');if(!b)return 'NO-TAB';b.click();return 'ok';})()" 2>&1 | tee -a "$OUT"
}

echo "########## بذرِ r324 + L1 (روشن ۳۹۰)" | tee -a "$OUT"
agent-browser open "$BASE" >/dev/null 2>&1
agent-browser set viewport 390 844 >/dev/null 2>&1
agent-browser wait 'body' >/dev/null 2>&1 || true
sleep 2
P=$(node "$DIR/r324-persona.js")
agent-browser eval "(()=>{localStorage.setItem('vision2-study-v1', JSON.stringify(${P}));location.reload();return 's';})()" >/dev/null 2>&1
sleep 4
agent-browser eval "(()=>{const s=[...document.querySelectorAll('.book-spine .en-text')].find(x=>x.textContent?.trim()==='L1');if(!s)return 'NO-SPINE';s.closest('button').click();return 'L1';})()" >/dev/null 2>&1
sleep 2.5

run_tab() { # $1 نامِ دقیق — $2 برچسبِ فایل
  echo "########## زبانهٔ $1" | tee -a "$OUT"
  click_tab "$1" "$2"
  sleep 2.4
  dbg "tab-$2-light"
  basis "tab-$2-light"
  shot "r334-tab-$2-light.png"
  to_dark
  dbg "tab-$2-dark"
  shot "r334-tab-$2-dark.png"
  to_light
}

run_tab "مکالمه" conversation
run_tab "ریدینگ" reading
run_tab "گرامر" grammar
run_tab "نگارش" writing
run_tab "دیکته" dictation
run_tab "تست‌ها" tests
run_tab "مترادف و متضاد" synant

echo "########## DONE" | tee -a "$OUT"
agent-browser close >/dev/null 2>&1
echo "log=$OUT"
