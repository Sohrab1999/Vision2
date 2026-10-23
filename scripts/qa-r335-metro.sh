#!/usr/bin/env bash
# ------------------------------------------------------------------
# r335 — «متروی گرامر: بستنِ ۳۱ گروهِ رکوردِ r334» — رکوردِ پیش/پسِ
#   درمان در دو تم + گسترشِ خانواده: دیالوگِ ایستگاه و جریانِ درسِ
#   ۹۰ثانیه‌ای (.glesson — همان پالتِ مشترک LINE_COLORS) که هرگز
#   سنجیده نشده بودند. تک سشن؛ dbgِ r328 + basisِ r319.
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
DIR=/home/z/my-project/scripts
OUT=/tmp/r335-metro.txt
mkdir -p "$EV"; : > "$OUT"

dbg()   { echo "-- [contrast] $1" | tee -a "$OUT"; agent-browser eval "$(cat "$DIR/r328-fails-dbg.js")" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
basis() { echo "-- [basis-zero] $1" | tee -a "$OUT"; agent-browser eval "$(cat "$DIR/r319-basis-zero-audit.js")" 2>&1 | tail -1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
shot()  { agent-browser screenshot "$EV/$1" >/dev/null 2>&1; }
to_dark()  { agent-browser eval "(()=>{localStorage.setItem('theme','dark');document.documentElement.classList.add('dark');return 'd';})()" >/dev/null 2>&1; sleep 1.2; }
to_light() { agent-browser eval "(()=>{localStorage.setItem('theme','light');document.documentElement.classList.remove('dark');return 'l';})()" >/dev/null 2>&1; sleep 1.2; }

echo "########## بذرِ r324 + خانه (روشن ۳۹۰)" | tee -a "$OUT"
agent-browser close >/dev/null 2>&1 || true
agent-browser open "$BASE" >/dev/null 2>&1
agent-browser set viewport 390 844 >/dev/null 2>&1
agent-browser wait 'body' >/dev/null 2>&1 || true
sleep 2
P=$(node "$DIR/r324-persona.js")
agent-browser eval "(()=>{localStorage.setItem('vision2-study-v1', JSON.stringify(${P}));localStorage.setItem('theme','light');location.reload();return 's';})()" >/dev/null 2>&1
sleep 4
# r335-درس: سشنِ بازیافتی میتواند theme=darkِ مانده داشته باشد — رکوردِ
# «روشن» فقط با تحمیلِ صریحِ روشن معتبر است (نه فرضِ پیشفرض).
to_light

open_metro() {
  agent-browser eval "(()=>{const b=[...document.querySelectorAll('button')].find(x=>(x.getAttribute('aria-label')||x.textContent||'').includes('متروی گرامر'));if(!b)return 'NO-TOOL';b.click();return 'ok';})()" 2>&1 | tee -a "$OUT"
  sleep 2.5
}

echo "########## MAP-باز (نقشهٔ کامل)" | tee -a "$OUT"
open_metro
dbg "map-light"
basis "map-light"
shot "r335-map-light.png"
to_dark
dbg "map-dark"
shot "r335-map-dark.png"
to_light

echo "########## دیالوگِ ایستگاهِ بازِ نخستین خطِ آسمان (Passive)" | tee -a "$OUT"
agent-browser eval "(()=>{const sec=[...document.querySelectorAll('.gmetro-line')].find(s=>(s.getAttribute('aria-label')||'').includes('مجهول')||s.querySelector('.gmetro-badge')?.textContent?.includes('Passive'));if(!sec)return 'NO-LINE';const st=[...sec.querySelectorAll('button')].find(b=>(b.getAttribute('aria-label')||'').startsWith('ایستگاه')&&!(b.getAttribute('aria-label')||'').includes('قفل'));if(!st)return 'NO-STATION';st.click();return 'ok';})()" 2>&1 | tee -a "$OUT"
sleep 1.8
agent-browser eval "(()=>{const d=document.querySelector('.gmetro-dialog');return d?'DIALOG-OPEN':'NO-DIALOG';})()" 2>&1 | tee -a "$OUT"
dbg "dialog-light"
shot "r335-dialog-light.png"
to_dark
dbg "dialog-dark"
shot "r335-dialog-dark.png"
to_light

echo "########## جریانِ درسِ ۹۰ثانیه‌ای (glesson) از همان دیالوگ" | tee -a "$OUT"
agent-browser eval "(()=>{const b=[...document.querySelectorAll('.gmetro-dialog button')].find(x=>x.textContent?.includes('درس ۹۰ثانیه‌ای'));if(!b)return 'NO-LESSON-BTN';b.click();return 'ok';})()" 2>&1 | tee -a "$OUT"
sleep 2.2
agent-browser eval "(()=>{const l=document.querySelector('.glesson');return l?'LESSON-OPEN':'NO-LESSON';})()" 2>&1 | tee -a "$OUT"
dbg "glesson-light"
basis "glesson-light"
shot "r335-glesson-light.png"
to_dark
dbg "glesson-dark"
shot "r335-glesson-dark.png"
to_light

echo "########## DONE" | tee -a "$OUT"
agent-browser close >/dev/null 2>&1
echo "log=$OUT"
