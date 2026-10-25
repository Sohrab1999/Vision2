#!/usr/bin/env bash
# ------------------------------------------------------------------
# r332-recheck — بازسنجیِ پساترمیمِ سویپِ کتابخانه/جزوه:
#   درمانِ راند: جداکنندهٔ «|» واژه‌نامهٔ StoryReader stone-300 → stone-500.
#   probeهایِ اصلاحشده (درسِ r331 — انتخابگرِ نادرست یافته را پنهان میکرد):
#     · دکمهٔ روخوانی aria-label="روخوانی متن انگلیسی" (نه «بخوان»)
#     · چیپِ استریک با aria-label="زنجیرهٔ روزهای خواندن داستان"
#       (برچسبِ بدونِ خواندنِ امروز: «N روز پیوسته»)
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
DIR=/home/z/my-project/scripts
OUT=/tmp/r332-recheck.txt
: > "$OUT"

dbg()   { echo "-- [contrast] $1" | tee -a "$OUT"; agent-browser eval "$(cat "$DIR/r328-fails-dbg.js")" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
basis() { echo "-- [basis-zero] $1" | tee -a "$OUT"; agent-browser eval "$(cat "$DIR/r319-basis-zero-audit.js")" 2>&1 | tail -1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
shot()  { agent-browser screenshot "$EV/$1" >/dev/null 2>&1; }
to_dark()  { agent-browser eval "(()=>{localStorage.setItem('theme','dark');document.documentElement.classList.add('dark');return 'dark-inplace';})()" >/dev/null 2>&1; sleep 1.2; }
to_light() { agent-browser eval "(()=>{localStorage.setItem('theme','light');document.documentElement.classList.remove('dark');return 'light-inplace';})()" >/dev/null 2>&1; sleep 1.2; }
probe() { echo "-- [probe] $1" | tee -a "$OUT"; agent-browser eval "$2" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

click_tool() {
  agent-browser eval "(()=>{const g=document.querySelector('[aria-label=\"ابزارهای یادگیری\"]');if(!g)return 'NO-GRID';const b=[...g.querySelectorAll('button')].find(x=>(x.textContent||'').replace(/\\u200c/g,'').includes('$1'));if(!b)return 'NO-BTN';b.click();return 'clicked';})()" 2>&1
}

echo "########## R1 — کتابخانه (روشن) — با probeهایِ اصلاحشده" | tee -a "$OUT"
agent-browser open "$BASE" >/dev/null 2>&1
agent-browser set viewport 390 844 >/dev/null 2>&1
agent-browser wait 'body' >/dev/null 2>&1 || true
sleep 2
PERSONA=$(node "$DIR/r324-persona.js")
agent-browser eval "(()=>{const p=JSON.stringify(${PERSONA});const st=JSON.parse(p);st.state.libraryDone={'s1-1':{score:5,total:5,day:'2026-10-22'},'s1-2':{score:4,total:5,day:'2026-10-22'},'s1-3':{score:5,total:5,day:'2026-10-21'},'s1-4':{score:3,total:5,day:'2026-10-21'},'s1-5':{score:4,total:5,day:'2026-10-20'}};localStorage.setItem('vision2-study-v1', JSON.stringify(st));location.reload();return 'r332-recheck-seeded';})()" >/dev/null 2>&1
sleep 4
click_tool "کتابخانهٔ داستانها" >/dev/null 2>&1; sleep 2.5
probe "library-mount-v2" "(()=>{const chip=document.querySelector('[aria-label=\"زنجیرهٔ روزهای خواندن داستان\"]');const t=document.body.innerText;return JSON.stringify({streakChip:!!chip,streakText:chip?chip.textContent.trim().slice(0,30):'',next:t.includes('بعدیِ تو'),done:t.includes('خوانده‌شده')});})()"
dbg "library-landing-light-v2"
shot r332-recheck-library-light.png

echo "########## R2 — StoryReader + پاسخگویی (روشن) — جداکنندهٔ ترمیمشده" | tee -a "$OUT"
agent-browser eval "(()=>{const b=document.querySelector('button[aria-label^=\"داستان\"]');if(!b)return 'NO-STORY';b.click();return 'opened';})()" >/dev/null 2>&1
sleep 2.5
probe "reader-mount-v2" "(()=>{const t=document.body.innerText;return JSON.stringify({glossary:t.includes('واژه‌نامه'),speak:!!document.querySelector('[aria-label=\"روخوانی متن انگلیسی\"]'),pipes:document.querySelectorAll('[aria-label=\"بخش صحیح یا نادرست\"], [aria-hidden]').length>0});})()"
dbg "reader-light-v2"
basis "reader-light-v2"
shot r332-recheck-reader-light.png

agent-browser eval "(()=>{const sec=document.querySelector('[aria-label=\"بخش صحیح یا نادرست\"]');if(!sec)return 'NO-SEC';const lis=[...sec.querySelectorAll('ol > li')];let n=0;lis.forEach((li,i)=>{const btns=[...li.querySelectorAll('button')].filter(b=>!b.disabled);const b=btns.find(x=>x.textContent.trim()===(i%2===0?'درست':'نادرست'));if(b){b.click();n++;}});return 'answered='+n+'/'+lis.length;})()" >/dev/null 2>&1
sleep 1.8
dbg "reader-answered-light-v2"
to_dark
dbg "reader-answered-dark-v2"
shot r332-recheck-reader-answered-dark.png
to_light

echo "########## R3 — جزوهٔ L1 (روشن+تاریک) — رگرسیون" | tee -a "$OUT"
agent-browser open "$BASE" >/dev/null 2>&1; sleep 2.5
agent-browser eval "(()=>{const s=[...document.querySelectorAll('.book-spine .en-text')].find(x=>x.textContent?.trim()==='L1');if(!s)return 'NO-SPINE';s.closest('button').click();return 'opened';})()" >/dev/null 2>&1
sleep 2.4
agent-browser eval "(()=>{const nav=[...document.querySelectorAll('nav')].find(n=>(n.getAttribute('aria-label')||'').includes('درس'));if(!nav)return 'NO-NAV';const b=[...nav.querySelectorAll('button')].find(x=>x.textContent?.trim()==='جزوه');if(!b)return 'NO-TAB';b.click();return 'clicked';})()" >/dev/null 2>&1
sleep 2.4
dbg "booklet-light-v2"
to_dark
dbg "booklet-dark-v2"
to_light

echo "########## DONE" | tee -a "$OUT"
agent-browser close >/dev/null 2>&1
echo "log=$OUT"
