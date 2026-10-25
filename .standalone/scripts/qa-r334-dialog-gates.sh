#!/usr/bin/env bash
# ------------------------------------------------------------------
# r334 — سویپِ زندهٔ «درگاههایِ نسنجیدهٔ دیالوگِ کاربرد» (پیشنهادِ ③ِ
#   r333: دیکشنری + WOTD — r333 فقط دروازههایِ درس را سنجید) +
#   جزوههایِ L11/L12 (هشتم/نهم) با اسکرولِ کامل (پیشنهادِ ② — r333
#   فقط L10/هفتم را سنجید). dbgِ r328 + basis-صفرِ r319، دو تم.
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
DIR=/home/z/my-project/scripts
OUT=/tmp/r334-sweep.txt
mkdir -p "$EV"; : > "$OUT"

dbg()   { echo "-- [contrast] $1" | tee -a "$OUT"; agent-browser eval "$(cat "$DIR/r328-fails-dbg.js")" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
basis() { echo "-- [basis-zero] $1" | tee -a "$OUT"; agent-browser eval "$(cat "$DIR/r319-basis-zero-audit.js")" 2>&1 | tail -1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
shot()  { agent-browser screenshot "$EV/$1" >/dev/null 2>&1; }
to_dark()  { agent-browser eval "(()=>{localStorage.setItem('theme','dark');document.documentElement.classList.add('dark');return 'd';})()" >/dev/null 2>&1; sleep 1.2; }
to_light() { agent-browser eval "(()=>{localStorage.setItem('theme','light');document.documentElement.classList.remove('dark');return 'l';})()" >/dev/null 2>&1; sleep 1.2; }
probe() { echo "-- [probe] $1" | tee -a "$OUT"; agent-browser eval "$2" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

echo "########## S0 — بذرِ r324 + خانه (روشن ۳۹۰)" | tee -a "$OUT"
agent-browser open "$BASE" >/dev/null 2>&1
agent-browser set viewport 390 844 >/dev/null 2>&1
agent-browser wait 'body' >/dev/null 2>&1 || true
sleep 2
P=$(node "$DIR/r324-persona.js")
agent-browser eval "(()=>{localStorage.setItem('vision2-study-v1', JSON.stringify(${P}));location.reload();return 's';})()" >/dev/null 2>&1
sleep 4
dbg "home-پایه"

echo "########## S1 — WOTD: چیپِ کاربردِ واژهٔ روز (اگر امروز کاربرد داشته باشد)" | tee -a "$OUT"
probe "wotd-chip" "(()=>{const c=document.querySelector('button[aria-label^=\"کاربرد\"]');if(!c)return JSON.stringify({chip:false,honest:true,wotd:document.body.innerText.includes('واژهٔ روز')});return JSON.stringify({chip:true,label:c.getAttribute('aria-label')});})()"
agent-browser eval "(()=>{const c=document.querySelector('button[aria-label^=\"کاربرد\"]');if(!c)return 'absent';c.click();return 'dialog';})()" >/dev/null 2>&1
sleep 2
probe "wotd-dialog" "(()=>{const d=document.querySelector('[role=\"dialog\"]');return d?JSON.stringify({open:true}):JSON.stringify({open:false});})()"
dbg "wotd-usage-dialog-light"
shot r334-wotd-dialog-light.png
agent-browser press Escape >/dev/null 2>&1; sleep 1

echo "########## S2 — دیکشنری: جستوجویِ communicate + دیالوگِ کاربرد (روشن+تاریک)" | tee -a "$OUT"
agent-browser eval "(()=>{const g=document.querySelector('[aria-label=\"ابزارهای یادگیری\"]');const b=[...g.querySelectorAll('button')].find(x=>(x.textContent||'').replace(/\\u200c/g,'').includes('دیکشنری جستجو'));if(!b)return 'NO-BTN';b.click();return 'dict';})()" >/dev/null 2>&1
sleep 2.4
agent-browser eval "(()=>{const inp=document.querySelector('input[aria-label*=\"جست\"],input[placeholder*=\"جست\"]');if(!inp)return 'NO-INPUT';const s=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;s.call(inp,'communicate');inp.dispatchEvent(new Event('input',{bubbles:true}));return 'typed';})()" >/dev/null 2>&1
sleep 1.8
probe "dict-chip" "(()=>{const c=document.querySelector('[data-testid^=\"usage-chip-\"]');if(!c)return JSON.stringify({chip:false});return JSON.stringify({chip:true,testid:c.getAttribute('data-testid')});})()"
agent-browser eval "(()=>{const c=document.querySelector('[data-testid^=\"usage-chip-\"]');if(!c)return 'absent';c.click();return 'dialog';})()" >/dev/null 2>&1
sleep 2
dbg "dict-usage-dialog-light"
basis "dict-usage-dialog-light"
shot r334-dict-dialog-light.png
to_dark
dbg "dict-usage-dialog-dark"
shot r334-dict-dialog-dark.png
to_light
agent-browser press Escape >/dev/null 2>&1; sleep 1

echo "########## S3 — L11 → جزوهٔ هشتم — اسکرولِ کاملِ پنلها (روشن+تاریک)" | tee -a "$OUT"
agent-browser open "$BASE" >/dev/null 2>&1; sleep 2.5
agent-browser eval "(()=>{const s=[...document.querySelectorAll('.book-spine .en-text')].find(x=>x.textContent?.trim()==='L11');if(!s)return 'NO-SPINE';s.closest('button').click();return 'L11';})()" >/dev/null 2>&1
sleep 2.4
agent-browser eval "(()=>{const nav=[...document.querySelectorAll('nav')].find(n=>(n.getAttribute('aria-label')||'').includes('درس'));const b=[...nav.querySelectorAll('button')].find(x=>x.textContent?.trim()==='جزوه');if(!b)return 'NO-TAB';b.click();return 'booklet';})()" 2>&1 | tee -a "$OUT"
sleep 2.4
probe "l11-scroll" "(()=>{const ps=[...document.querySelectorAll('.max-h-96.overflow-y-auto')];if(!ps.length)return JSON.stringify({panels:0});ps.forEach(p=>p.scrollTop=p.scrollHeight);return JSON.stringify({panels:ps.length});})()"
sleep 1
dbg "booklet-l11-scrolled-light"
basis "booklet-l11-scrolled-light"
shot r334-booklet-l11-light.png
to_dark
dbg "booklet-l11-scrolled-dark"
shot r334-booklet-l11-dark.png
to_light

echo "########## S4 — L12 → جزوهٔ نهم — اسکرولِ کاملِ پنلها (روشن+تاریک)" | tee -a "$OUT"
agent-browser open "$BASE" >/dev/null 2>&1; sleep 2.5
agent-browser eval "(()=>{const s=[...document.querySelectorAll('.book-spine .en-text')].find(x=>x.textContent?.trim()==='L12');if(!s)return 'NO-SPINE';s.closest('button').click();return 'L12';})()" >/dev/null 2>&1
sleep 2.4
agent-browser eval "(()=>{const nav=[...document.querySelectorAll('nav')].find(n=>(n.getAttribute('aria-label')||'').includes('درس'));const b=[...nav.querySelectorAll('button')].find(x=>x.textContent?.trim()==='جزوه');if(!b)return 'NO-TAB';b.click();return 'booklet';})()" 2>&1 | tee -a "$OUT"
sleep 2.4
probe "l12-scroll" "(()=>{const ps=[...document.querySelectorAll('.max-h-96.overflow-y-auto')];if(!ps.length)return JSON.stringify({panels:0});ps.forEach(p=>p.scrollTop=p.scrollHeight);return JSON.stringify({panels:ps.length});})()"
sleep 1
dbg "booklet-l12-scrolled-light"
basis "booklet-l12-scrolled-light"
shot r334-booklet-l12-light.png
to_dark
dbg "booklet-l12-scrolled-dark"
shot r334-booklet-l12-dark.png
to_light

echo "########## DONE" | tee -a "$OUT"
agent-browser close >/dev/null 2>&1
echo "log=$OUT"
