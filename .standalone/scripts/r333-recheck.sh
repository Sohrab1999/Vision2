#!/usr/bin/env bash
# r333-recheck — بازسنجیِ درمانهایِ راند: پشتِ فلشکارت (gradientDeep +
#   حجابِ تیره) و دیالوگِ کاربرد (تاریکِ درس-چیپ) + این‌بار جزوهٔ L10
#   (زبانهٔ جزوه فقط برای درسهای ۱۰-۱۲ است — اشتباهِ L1 در سویپِ اصلی).
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
DIR=/home/z/my-project/scripts
OUT=/tmp/r333-recheck.txt
: > "$OUT"

dbg()   { echo "-- [contrast] $1" | tee -a "$OUT"; agent-browser eval "$(cat "$DIR/r328-fails-dbg.js")" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
basis() { echo "-- [basis-zero] $1" | tee -a "$OUT"; agent-browser eval "$(cat "$DIR/r319-basis-zero-audit.js")" 2>&1 | tail -1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
shot()  { agent-browser screenshot "$EV/$1" >/dev/null 2>&1; }
to_dark()  { agent-browser eval "(()=>{localStorage.setItem('theme','dark');document.documentElement.classList.add('dark');return 'd';})()" >/dev/null 2>&1; sleep 1.2; }
to_light() { agent-browser eval "(()=>{localStorage.setItem('theme','light');document.documentElement.classList.remove('dark');return 'l';})()" >/dev/null 2>&1; sleep 1.2; }

echo "########## R1 — L1 → فلشکارت → پشتِ کارت (روشن)" | tee -a "$OUT"
agent-browser open "$BASE" >/dev/null 2>&1
agent-browser set viewport 390 844 >/dev/null 2>&1
agent-browser wait 'body' >/dev/null 2>&1 || true
sleep 2
P=$(node "$DIR/r324-persona.js")
agent-browser eval "(()=>{localStorage.setItem('vision2-study-v1', JSON.stringify(${P}));location.reload();return 'seeded';})()" >/dev/null 2>&1
sleep 4
agent-browser eval "(()=>{const s=[...document.querySelectorAll('.book-spine .en-text')].find(x=>x.textContent?.trim()==='L1');if(!s)return 'NO-SPINE';s.closest('button').click();return 'L1';})()" >/dev/null 2>&1
sleep 2.4
agent-browser eval "(()=>{const nav=[...document.querySelectorAll('nav')].find(n=>(n.getAttribute('aria-label')||'').includes('درس'));const b=[...nav.querySelectorAll('button')].find(x=>x.textContent?.trim()==='واژگان');b.click();return 'vocab';})()" >/dev/null 2>&1
sleep 2
agent-browser eval "(()=>{const b=[...document.querySelectorAll('button')].find(x=>(x.textContent||'').replace(/\\u200c/g,'').includes('حالت فلشکارت'));if(!b)return 'NO-FLASHBTN';b.click();return 'flash';})()" >/dev/null 2>&1
sleep 2.2
agent-browser eval "(()=>{const b=document.querySelector('button[aria-label=\"برگرداندن کارت\"]');if(!b)return 'NO-FLIP';b.click();return 'flipped';})()" >/dev/null 2>&1
sleep 1.8
dbg "flash-back-fixed-light"
basis "flash-back-fixed-light"
shot r333-recheck-flash-back-light.png
to_dark
dbg "flash-back-fixed-dark"
shot r333-recheck-flash-back-dark.png
to_light

echo "########## R2 — دیالوگِ کاربرد از پشتِ کارت (روشن+تاریک)" | tee -a "$OUT"
agent-browser eval "(()=>{const b=document.querySelector('button[aria-label^=\"کاربرد\"]');if(!b)return 'NO-CHIP';b.click();return 'dialog';})()" >/dev/null 2>&1
sleep 2
dbg "usage-dialog-fixed-light"
to_dark
dbg "usage-dialog-fixed-dark"
shot r333-recheck-usage-dialog-dark.png
to_light
agent-browser press Escape >/dev/null 2>&1; sleep 1

echo "########## R3 — L10 → زبانهٔ جزوه + پنلِ max-h-96 تا تهِ اسکرول (روشن+تاریک)" | tee -a "$OUT"
agent-browser open "$BASE" >/dev/null 2>&1; sleep 2.5
agent-browser eval "(()=>{const s=[...document.querySelectorAll('.book-spine .en-text')].find(x=>x.textContent?.trim()==='L10');if(!s)return 'NO-SPINE';s.closest('button').click();return 'L10';})()" >/dev/null 2>&1
sleep 2.4
agent-browser eval "(()=>{const nav=[...document.querySelectorAll('nav')].find(n=>(n.getAttribute('aria-label')||'').includes('درس'));const b=[...nav.querySelectorAll('button')].find(x=>x.textContent?.trim()==='جزوه');if(!b)return 'NO-TAB';b.click();return 'booklet';})()" 2>&1 | tee -a "$OUT"
sleep 2.4
agent-browser eval "(()=>{const panels=[...document.querySelectorAll('.max-h-96.overflow-y-auto')];if(!panels.length)return JSON.stringify({panels:0});const out=[];panels.forEach(p=>{p.scrollTop=p.scrollHeight;out.push(Math.round(p.clientHeight)+'/'+p.scrollHeight)});return JSON.stringify({panels:panels.length,scrolled:out});})()" 2>&1 | tee -a "$OUT"
sleep 1
dbg "booklet-l10-scrolled-light"
basis "booklet-l10-scrolled-light"
shot r333-recheck-booklet-l10-light.png
to_dark
dbg "booklet-l10-scrolled-dark"
shot r333-recheck-booklet-l10-dark.png
to_light

echo "########## DONE" | tee -a "$OUT"
agent-browser close >/dev/null 2>&1
echo "log=$OUT"
