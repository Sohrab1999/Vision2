#!/usr/bin/env bash
# ------------------------------------------------------------------
# r332 — سویپِ زندهٔ کنتراستِ کتابخانه/جزوه «در حینِ مطالعه» —
#   پیشنهادِ ②ِ r331: نماهایی که فقط با بازکردنِ داستان/جزوه دیده میشوند
#   (StoryReader با متنِ داستان + واژهنامه + بخشِ A با حالتهایِ
#   درست/غلط/نتیجه + صافیِ فعالِ جستوجو + زبانهٔ جزوه در حالِ خواندن)
#   با dbgِ کنتراستِ r328 + طبقهبندِ basis-صفرِ r319 در دو تم —
#   r331 فقط چیپهایِ شمارندهٔ کتابخانه را سنجیده بود؛ خودِ
#   «صفحهٔ خواندن» هرگز زنده دیده نشده بود.
#   تم: تاریکِ درجا (classList.add رویِ html — الگویِ r330).
#   شخصیت: r324 + libraryDone (پنج داستانِ خواندهٔ کتابِ ۱ → چیپِ
#   «بعدیِ تو»، چیپهایِ done، نوارِ پیشرفت، استریکِ dayHistory).
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
DIR=/home/z/my-project/scripts
OUT=/tmp/r332-library-reading.txt
mkdir -p "$EV"; : > "$OUT"

dbg()   { echo "-- [contrast] $1" | tee -a "$OUT"; agent-browser eval "$(cat "$DIR/r328-fails-dbg.js")" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
basis() { echo "-- [basis-zero] $1" | tee -a "$OUT"; agent-browser eval "$(cat "$DIR/r319-basis-zero-audit.js")" 2>&1 | tail -1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
shot()  { agent-browser screenshot "$EV/$1" >/dev/null 2>&1; }
to_dark()  { agent-browser eval "(()=>{localStorage.setItem('theme','dark');document.documentElement.classList.add('dark');return 'dark-inplace';})()" >/dev/null 2>&1; sleep 1.2; }
to_light() { agent-browser eval "(()=>{localStorage.setItem('theme','light');document.documentElement.classList.remove('dark');return 'light-inplace';})()" >/dev/null 2>&1; sleep 1.2; }
probe() { echo "-- [probe] $1" | tee -a "$OUT"; agent-browser eval "$2" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

click_tool() { # $1 — تطبیقِ بی‌نیمفاصله (درسِ ZWNJِ r319)
  agent-browser eval "(()=>{const g=document.querySelector('[aria-label=\"ابزارهای یادگیری\"]');if(!g)return 'NO-GRID';const b=[...g.querySelectorAll('button')].find(x=>(x.textContent||'').replace(/\\u200c/g,'').includes('$1'));if(!b)return 'NO-BTN';b.click();return 'clicked';})()" 2>&1
}
click_tab_safe() { # $1 متنِ دقیقِ زبانه — nav با includes
  agent-browser eval "(()=>{const nav=[...document.querySelectorAll('nav')].find(n=>(n.getAttribute('aria-label')||'').includes('درس'));if(!nav)return 'NO-NAV';const b=[...nav.querySelectorAll('button')].find(x=>x.textContent?.trim()==='$1');if(!b)return 'NO-TAB';b.click();return 'clicked';})()" 2>&1
}

echo "########## S0 — بذرِ شخصیتِ کتابخوان + خانه (روشن ۳۹۰)" | tee -a "$OUT"
agent-browser open "$BASE" >/dev/null 2>&1
agent-browser set viewport 390 844 >/dev/null 2>&1
agent-browser wait 'body' >/dev/null 2>&1 || true
sleep 2
PERSONA=$(node "$DIR/r324-persona.js")
agent-browser eval "(()=>{const p=JSON.stringify(${PERSONA});const st=JSON.parse(p);st.state.libraryDone={'s1-1':{score:5,total:5,day:'2026-10-22'},'s1-2':{score:4,total:5,day:'2026-10-22'},'s1-3':{score:5,total:5,day:'2026-10-21'},'s1-4':{score:3,total:5,day:'2026-10-21'},'s1-5':{score:4,total:5,day:'2026-10-20'}};localStorage.setItem('vision2-study-v1', JSON.stringify(st));location.reload();return 'r332-seeded';})()" >/dev/null 2>&1
sleep 4
dbg "home-پایه"

echo "########## S1 — کتابخانه (روشن) — فهرست + چیپهایِ done + بعدیِ تو" | tee -a "$OUT"
click_tool "کتابخانهٔ داستانها" >/dev/null 2>&1; sleep 2.5
probe "library-mount" "(()=>{const t=document.body.innerText;return JSON.stringify({title:t.includes('کتاب‌خانهٔ داستان‌ها'),streak:t.includes('زنجیرهٔ خواندن'),next:t.includes('بعدیِ تو'),progress:t.includes('داستان')});})()"
dbg "library-landing-light"
basis "library-landing-light"
shot r332-library-light.png
to_dark
dbg "library-landing-dark"
shot r332-library-dark.png
to_light

echo "########## S2 — StoryReader (روشن) — صفحهٔ خواندنِ واقعی" | tee -a "$OUT"
agent-browser eval "(()=>{const b=document.querySelector('button[aria-label^=\"داستان\"]');if(!b)return 'NO-STORY';b.click();return 'opened';})()" >/dev/null 2>&1
sleep 2.5
probe "reader-mount" "(()=>{const t=document.body.innerText;return JSON.stringify({glossary:t.includes('واژه‌نامه'),sectionA:t.includes('درست یا نادرست'),sectionB:t.includes('تشریحی'),speak:!!document.querySelector('[aria-label=\"بخوان\"]')});})()"
dbg "reader-light"
basis "reader-light"
shot r332-reader-light.png

echo "########## S3 — پاسخگوییِ بخشِ A (درست/غلطِ واقعی → بازخورد + کارتِ نتیجه)" | tee -a "$OUT"
agent-browser eval "(()=>{const sec=document.querySelector('[aria-label=\"بخش صحیح یا نادرست\"]');if(!sec)return 'NO-SEC';const lis=[...sec.querySelectorAll('ol > li')];let n=0;lis.forEach((li,i)=>{const btns=[...li.querySelectorAll('button')].filter(b=>!b.disabled);const b=btns.find(x=>x.textContent.trim()===(i%2===0?'درست':'نادرست'));if(b){b.click();n++;}});return 'answered='+n+'/'+lis.length;})()" >/dev/null 2>&1
sleep 1.8
probe "feedback-mount" "(()=>{const t=document.body.innerText;return JSON.stringify({correct:t.includes('درست!'),wrong:t.includes('پاسخ درست'),result:t.includes('نمرهٔ تو'),again:!!document.querySelector('button')&&[...document.querySelectorAll('button')].some(b=>b.textContent.includes('دوباره'))});})()"
dbg "reader-answered-light"
shot r332-reader-answered-light.png
to_dark
dbg "reader-answered-dark"
shot r332-reader-answered-dark.png
to_light

echo "########## S4 — بازگشت + جستوجو/صافیِ فعال (روشن+تاریک)" | tee -a "$OUT"
agent-browser eval "(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent.includes('بازگشت به فهرست'));if(!b)return 'NO-BACK';b.click();return 'back';})()" >/dev/null 2>&1
sleep 2
agent-browser eval "(()=>{const inp=document.querySelector('input[aria-label*=\"جست\"]');if(!inp)return 'NO-INPUT';const setter=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;setter.call(inp,'jones');inp.dispatchEvent(new Event('input',{bubbles:true}));return 'typed';})()" >/dev/null 2>&1
agent-browser eval "(()=>{const c=[...document.querySelectorAll('button[aria-pressed]')].find(x=>x.textContent.includes('خوانده‌شده'));if(!c)return 'NO-CHIP';c.click();return 'filtered';})()" >/dev/null 2>&1
sleep 1.6
probe "search-mount" "(()=>{const t=document.body.innerText;return JSON.stringify({found:t.includes('یافته‌شده'),empty:t.includes('داستانی پیدا نشد')});})()"
dbg "library-search-light"
shot r332-library-search-light.png
to_dark
dbg "library-search-dark"
shot r332-library-search-dark.png
to_light

echo "########## S5 — جزوهٔ L1 در حالِ خواندن (روشن+تاریک)" | tee -a "$OUT"
agent-browser open "$BASE" >/dev/null 2>&1; sleep 2.5
agent-browser eval "(()=>{const s=[...document.querySelectorAll('.book-spine .en-text')].find(x=>x.textContent?.trim()==='L1');if(!s)return 'NO-SPINE';s.closest('button').click();return 'opened';})()" >/dev/null 2>&1
sleep 2.4
CT=$(click_tab_safe "جزوه"); echo "click_tab=$CT" | tee -a "$OUT"
sleep 2.4
dbg "booklet-light"
basis "booklet-light"
shot r332-booklet-light.png
to_dark
dbg "booklet-dark"
shot r332-booklet-dark.png
to_light

echo "########## S6 — دسکتاپِ ۱۲۸۰ — صفحهٔ خواندن (روشن)" | tee -a "$OUT"
agent-browser open "$BASE" >/dev/null 2>&1
agent-browser set viewport 1280 800 >/dev/null 2>&1; sleep 2
click_tool "کتابخانهٔ داستانها" >/dev/null 2>&1; sleep 2.5
agent-browser eval "(()=>{const b=document.querySelector('button[aria-label^=\"داستان\"]');if(!b)return 'NO-STORY';b.click();return 'opened';})()" >/dev/null 2>&1
sleep 2.5
dbg "reader-light-1280"
shot r332-reader-light-1280.png

echo "########## DONE" | tee -a "$OUT"
agent-browser close >/dev/null 2>&1
echo "log=$OUT"
