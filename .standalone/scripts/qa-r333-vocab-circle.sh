#!/usr/bin/env bash
# ------------------------------------------------------------------
# r333 — سویپِ زندهٔ «دایرهٔ واژگانِ درس» — پیشنهادِ ②ِ r332:
#   سطوحی که فقط در دلِ مرورِ فلشکارت/روخوانی/دیالوگِ کاربرد دیده
#   میشوند: تبِ واژگان (فهرست + چیپهایِ بلدم/ستاره/کاربرد)، حالتِ
#   فلشکارت (پشتِ برگرداندهشده: روخوانی + جفت + چیپِ کاربرد)،
#   دیالوگِ کاربردِ واژه (از پشتِ کارت و از فهرست)، و پنلِ
#   اسکرولبلندِ جزوه (max-h-96 با اسکرولِ واقعی تا ته).
#   ابزار: dbgِ کنتراستِ r328 + طبقهبندِ basis-صفرِ r319 —
#   دو تم با فلیپِ درجایِ html.dark (الگویِ r330/r332)، موبایلِ ۳۹۰
#   + یک مرحلهٔ دسکتاپِ ۱۲۸۰ برایِ دیالوگ.
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
DIR=/home/z/my-project/scripts
OUT=/tmp/r333-vocab-circle.txt
mkdir -p "$EV"; : > "$OUT"

dbg()   { echo "-- [contrast] $1" | tee -a "$OUT"; agent-browser eval "$(cat "$DIR/r328-fails-dbg.js")" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
basis() { echo "-- [basis-zero] $1" | tee -a "$OUT"; agent-browser eval "$(cat "$DIR/r319-basis-zero-audit.js")" 2>&1 | tail -1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
shot()  { agent-browser screenshot "$EV/$1" >/dev/null 2>&1; }
to_dark()  { agent-browser eval "(()=>{localStorage.setItem('theme','dark');document.documentElement.classList.add('dark');return 'dark-inplace';})()" >/dev/null 2>&1; sleep 1.2; }
to_light() { agent-browser eval "(()=>{localStorage.setItem('theme','light');document.documentElement.classList.remove('dark');return 'light-inplace';})()" >/dev/null 2>&1; sleep 1.2; }
probe() { echo "-- [probe] $1" | tee -a "$OUT"; agent-browser eval "$2" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
close_dialog() { agent-browser press Escape >/dev/null 2>&1; sleep 1; }
click_tab_safe() {
  agent-browser eval "(()=>{const nav=[...document.querySelectorAll('nav')].find(n=>(n.getAttribute('aria-label')||'').includes('درس'));if(!nav)return 'NO-NAV';const b=[...nav.querySelectorAll('button')].find(x=>x.textContent?.trim()==='$1');if(!b)return 'NO-TAB';b.click();return 'clicked';})()" 2>&1
}

echo "########## S0 — بذرِ r324 + خانه (روشن ۳۹۰)" | tee -a "$OUT"
agent-browser open "$BASE" >/dev/null 2>&1
agent-browser set viewport 390 844 >/dev/null 2>&1
agent-browser wait 'body' >/dev/null 2>&1 || true
sleep 2
PERSONA=$(node "$DIR/r324-persona.js")
agent-browser eval "(()=>{localStorage.setItem('vision2-study-v1', JSON.stringify(${PERSONA}));location.reload();return 'r333-seeded';})()" >/dev/null 2>&1
sleep 4
dbg "home-پایه"

echo "########## S1 — تبِ واژگانِ L1 — فهرست + چیپها (روشن)" | tee -a "$OUT"
agent-browser eval "(()=>{const s=[...document.querySelectorAll('.book-spine .en-text')].find(x=>x.textContent?.trim()==='L1');if(!s)return 'NO-SPINE';s.closest('button').click();return 'opened';})()" >/dev/null 2>&1
sleep 2.4
CT=$(click_tab_safe "واژگان"); echo "click_tab=$CT" | tee -a "$OUT"
sleep 2
probe "vocab-list-mount" "(()=>{const t=document.body.innerText;return JSON.stringify({search:t.includes('جستجو در واژگان'),flashBtn:t.includes('حالت فلش'),census:t.includes('واژه در جزوه'),filters:t.includes('یاد نگرفته'),knownChip:t.includes('بلدم')});})()"
dbg "vocab-list-light"
basis "vocab-list-light"
shot r333-vocab-list-light.png
to_dark
dbg "vocab-list-dark"
shot r333-vocab-list-dark.png
to_light

echo "########## S2 — حالتِ فلشکارت — رویِ کارت (روشن)" | tee -a "$OUT"
agent-browser eval "(()=>{const b=[...document.querySelectorAll('button')].find(x=>(x.textContent||'').replace(/\\u200c/g,'').includes('حالت فلشکارت'));if(!b)return 'NO-FLASHBTN';b.click();return 'entered';})()" >/dev/null 2>&1
sleep 2.2
probe "flash-front-mount" "(()=>{const b=document.querySelector('button[aria-label=\"برگرداندن کارت\"]');return JSON.stringify({flipBtn:!!b,w:b?b.getBoundingClientRect().width:0});})()"
dbg "flash-front-light"
basis "flash-front-light"
shot r333-flash-front-light.png

echo "########## S3 — پشتِ کارتِ برگرداندهشده — روخوانی + جفت + چیپِ کاربرد" | tee -a "$OUT"
agent-browser eval "(()=>{const b=document.querySelector('button[aria-label=\"برگرداندن کارت\"]');if(!b)return 'NO-FLIP';b.click();return 'flipped';})()" >/dev/null 2>&1
sleep 1.8
probe "flash-back-mount" "(()=>{const t=document.body.innerText;const speak=!!document.querySelector('button[aria-label=\"روخوانی\"]');const usage=!!document.querySelector('button[aria-label^=\"کاربرد\"]');const pair=!!document.querySelector('button[aria-label*=\"روخوانی\"][aria-label^=\"مترادف\"],button[aria-label*=\"روخوانی\"][aria-label^=\"متضاد\"]');return JSON.stringify({speak,usage,pair,hasEn:t.length>0});})()"
dbg "flash-back-light"
basis "flash-back-light"
shot r333-flash-back-light.png
to_dark
dbg "flash-back-dark"
shot r333-flash-back-dark.png
to_light

echo "########## S4 — دیالوگِ کاربردِ واژه از پشتِ کارت (روشن+تاریک)" | tee -a "$OUT"
agent-browser eval "(()=>{const b=document.querySelector('button[aria-label^=\"کاربرد\"]');if(!b)return 'NO-CHIP';b.click();return 'dialog-open';})()" >/dev/null 2>&1
sleep 2
probe "usage-dialog-mount" "(()=>{const dlg=document.querySelector('[role=\"dialog\"]');if(!dlg)return 'NO-DIALOG';const t=dlg.textContent||'';return JSON.stringify({open:true,title:t.includes('در مکالمه‌ها')||t.includes('کاربرد'),sites:t.length>0,goBtn:!!dlg.querySelector('button[aria-label^=\"رفتن به واژه‌های\"]')});})()"
dbg "usage-dialog-light"
basis "usage-dialog-light"
shot r333-usage-dialog-light.png
to_dark
dbg "usage-dialog-dark"
shot r333-usage-dialog-dark.png
to_light
close_dialog

echo "########## S5 — خروج از فلشکارت + کنشهایِ فهرست (بلدم/ستاره/چیپِ کاربرد)" | tee -a "$OUT"
agent-browser eval "(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent.includes('خروج')||x.textContent.includes('پایان'));if(b){b.click();return 'exited='+x;}const t=[...document.querySelectorAll('button')].map(x=>x.textContent.trim()).slice(0,20);return 'NO-EXIT:'+JSON.stringify(t);})()" 2>&1 | tail -1 | tee -a "$OUT"
sleep 2
agent-browser eval "(()=>{const b=document.querySelector('button[aria-label*=\"کلیک: بلدمکردن\"],button[aria-label*=\"بلدمکردن\"]');if(!b)return 'NO-KNOWN';b.click();return 'known-toggled';})()" >/dev/null 2>&1
sleep 1
agent-browser eval "(()=>{const b=document.querySelector('button[aria-label^=\"افزودن\"]');if(!b)return 'NO-STAR';b.click();return 'starred';})()" >/dev/null 2>&1
sleep 1
agent-browser eval "(()=>{const b=document.querySelector('button[aria-label^=\"کاربرد\"]');if(!b)return 'NO-USAGE-CHIP';b.click();return 'dialog-open';})()" >/dev/null 2>&1
sleep 2
probe "usage-dialog-from-list" "(()=>{const dlg=document.querySelector('[role=\"dialog\"]');return dlg?JSON.stringify({open:true}):'NO-DIALOG';})()"
dbg "usage-dialog-list-light"
shot r333-usage-dialog-list-light.png
close_dialog
basis "vocab-list-after-actions"

echo "########## S6 — جزوهٔ L1 — پنلِ اسکرولبلندِ max-h-96 تا تهِ اسکرول" | tee -a "$OUT"
agent-browser eval "(()=>{const nav=[...document.querySelectorAll('nav')].find(n=>(n.getAttribute('aria-label')||'').includes('درس'));if(!nav)return 'NO-NAV';const b=[...nav.querySelectorAll('button')].find(x=>x.textContent?.trim()==='جزوه');if(!b)return 'NO-TAB';b.click();return 'clicked';})()" >/dev/null 2>&1
sleep 2.4
probe "booklet-scroll-panels" "(()=>{const panels=[...document.querySelectorAll('.max-h-96.overflow-y-auto')];if(!panels.length)return JSON.stringify({panels:0});const p=panels[0];const before=p.scrollTop;const ratio=p.scrollHeight/p.clientHeight;p.scrollTop=p.scrollHeight;const after=p.scrollTop;return JSON.stringify({panels:panels.length,ratio:+ratio.toFixed(2),scrolled:before+'->'+after});})()"
sleep 1
dbg "booklet-scrolled-bottom-light"
shot r333-booklet-scrolled-light.png
to_dark
dbg "booklet-scrolled-bottom-dark"
shot r333-booklet-scrolled-dark.png
to_light

echo "########## S7 — دسکتاپِ ۱۲۸۰ — دیالوگِ کاربرد از فهرست (روشن)" | tee -a "$OUT"
agent-browser set viewport 1280 800 >/dev/null 2>&1; sleep 2
CT=$(click_tab_safe "واژگان"); echo "click_tab=$CT" | tee -a "$OUT"
sleep 2.2
agent-browser eval "(()=>{const b=document.querySelector('button[aria-label^=\"کاربرد\"]');if(!b)return 'NO-CHIP';b.click();return 'dialog-open';})()" >/dev/null 2>&1
sleep 2
probe "usage-dialog-1280" "(()=>{const dlg=document.querySelector('[role=\"dialog\"]');if(!dlg)return 'NO-DIALOG';const r=dlg.getBoundingClientRect();return JSON.stringify({open:true,w:Math.round(r.width),overflowX:document.documentElement.scrollWidth>window.innerWidth+2});})()"
dbg "usage-dialog-1280-light"
shot r333-usage-dialog-1280-light.png

echo "########## DONE" | tee -a "$OUT"
agent-browser close >/dev/null 2>&1
echo "log=$OUT"
