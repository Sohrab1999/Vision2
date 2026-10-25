#!/usr/bin/env bash
# ------------------------------------------------------------------
# r331 — سویپِ کنتراستِ زندهٔ سطوحِ آزمون/کنکور «در حینِ پاسخگویی» —
#   پیشنهادِ ②ِ r330: سطوحی که فقط با شروعِ واقعیِ جلسه باز میشوند
#   (QuizEngine زنده + پنلهایِModeCard + هیروِ کنکور) با dbgِ کنتراستِ
#   r328 + طبقهبندِ basis-صفرِ r319 سنجیده میشوند — هرگز زنده دیده
#   نشده بودند (r324 فقط طبقهبندِ h+v داشت؛ کنتراستِ زنده از r326).
#   تم: تاریکِ درجا (classList.add رویِ html — الگویِ r330؛ reload
#   جلسهٔ React را میکُشد).
#   نقطهٔ پرچمگذاریشدهٔ ثابت: konkur-view:604 چیپهایِ آیکنیِ -600 رویِ
#   تینتِ -50 + تلفیقِ جدید: via-orange-700ِ هیروِ کنکور زیرِ سفید در
#   تاریک (توکنِ تینتِ #fdba74 — تلهٔ r330 رویِ استاپِ via).
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
DIR=/home/z/my-project/scripts
OUT=/tmp/r331-exam-konkur.txt
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
pair_probe() { # سنجشِ هدفمندِ یک عنصرِ تزریقی — نسبتِ واقعیِ جوهر/زمینه در تمِ جاری
  agent-browser eval "(()=>{const cv=document.createElement('canvas');cv.width=cv.height=1;const ctx=cv.getContext('2d',{willReadFrequently:true});const toRGBA=(s)=>{ctx.clearRect(0,0,1,1);ctx.fillStyle='#000';ctx.fillStyle=s;ctx.fillRect(0,0,1,1);const d=ctx.getImageData(0,0,1,1).data;return [d[0],d[1],d[2],d[3]/255];};const lum=([r,g,b])=>{const f=(v)=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4);};return 0.2126*f(r)+0.7152*f(g)+0.0722*f(b);};const ratio=(A,B)=>{const l1=lum(A),l2=lum(B);const hi=l1>l2?l1:l2,lo=l1>l2?l2:l1;return Math.round(((hi+0.05)/(lo+0.05))*100)/100;};const t=document.getElementById('__pair__');if(!t)return 'NO-EL';const cs=getComputedStyle(t);const ink=toRGBA(cs.color);const bgRaw=toRGBA(cs.backgroundColor);let base=[255,255,255];const root=getComputedStyle(document.documentElement).backgroundColor;if(root&&root!=='transparent'){const c=toRGBA(root);if(c[3]>0)base=[c[0],c[1],c[2]];}const bg=[0,1,2].map(i=>Math.round(bgRaw[i]*bgRaw[3]+base[i]*(1-bgRaw[3])));const eff=[0,1,2].map(i=>Math.round(ink[i]*(ink[3])+bg[i]*(1-ink[3])));return JSON.stringify({ink:cs.color,bg:cs.backgroundColor,cr:ratio(eff,bg),theme:document.documentElement.classList.contains('dark')?'dark':'light'});})()" 2>&1
}
inject_timer_low() { # چیپِ تایمرِ <60s — وضعیتی که زنده فقط پسِ از ~۶ دقیقه میآید
  agent-browser eval "(()=>{let t=document.getElementById('__pair__');if(t)t.remove();const s=document.createElement('span');s.id='__pair__';s.className='rounded-lg px-2.5 py-1 text-[12px] font-black bg-rose-100 text-rose-700';s.textContent='۰:۵۹';s.style.position='fixed';s.style.top='8px';s.style.left='8px';document.body.appendChild(s);return 'injected';})()" >/dev/null 2>&1
}
clear_inject() { agent-browser eval "(()=>{const t=document.getElementById('__pair__');if(t)t.remove();return 'cleared';})()" >/dev/null 2>&1; }

echo "########## S0 — بذر + خانه (روشن ۳۹۰)" | tee -a "$OUT"
agent-browser open "$BASE" >/dev/null 2>&1
agent-browser set viewport 390 844 >/dev/null 2>&1
agent-browser wait 'body' >/dev/null 2>&1 || true
sleep 2
PERSONA=$(node "$DIR/r324-persona.js")
agent-browser eval "(()=>{localStorage.setItem('vision2-study-v1', JSON.stringify(${PERSONA})); location.reload(); return 'r331-seeded';})()" >/dev/null 2>&1
sleep 4
dbg "home-پایه"

echo "########## S1 — ساحلهٔ آزمون جامع (روشن)" | tee -a "$OUT"
click_tool "آزمون جامع" >/dev/null 2>&1; sleep 2.5
dbg "exam-landing-light"
basis "exam-landing-light"
shot r331-exam-landing-light.png

echo "########## S2 — پاسخگوییِ زندهٔ آزمون جامع (روشن)" | tee -a "$OUT"
agent-browser eval "(()=>{const b=[...document.querySelectorAll('button')].find(x=>(x.textContent||'').trim()==='شروع آزمون جامع');if(!b)return 'NO-START';b.click();return 'started';})()" >/dev/null 2>&1
sleep 2.5
probe "live-mount" "(()=>{const t=document.body.innerText;return JSON.stringify({q:(t.includes('پاسخ‌ها در پایان نمایش داده می‌شوند')||t.includes('بعدی')),counter:(t.match(/۱ \/ \d+/)||[])[0]||'',next:!!document.querySelector('[data-quiz-next]')});})()"
dbg "exam-live-light"
basis "exam-live-light"
shot r331-exam-live-light.png
to_dark
dbg "exam-live-dark"
shot r331-exam-live-dark.png
inject_timer_low; sleep 0.4
probe "timer-low-chip" "$(pair_probe | sed 's/^"//;s/"$//' >/dev/null; echo '')"
clear_inject
to_light

echo "########## S3 — مرورِ اشتباهات (immediate — وضعیتهایِ درست/غلطِ زنده)" | tee -a "$OUT"
agent-browser open "$BASE" >/dev/null 2>&1; sleep 2.5
click_tool "آزمون جامع" >/dev/null 2>&1; sleep 2.5
agent-browser eval "(()=>{const b=[...document.querySelectorAll('button')].find(x=>(x.textContent||'').includes('مرور اشتباهات آزمون جامع'));if(!b)return 'NO-CTA';b.click();return 'started';})()" >/dev/null 2>&1
sleep 2.5
agent-browser eval "(()=>{const o=document.querySelectorAll('[data-quiz] button,[data-quiz]');if(o.length<2)return 'NO-OPT';const btns=[...document.querySelectorAll('button')].filter(x=>x.closest('[class*=c-card]')&&x.textContent?.length<80&&x.className.includes('w-full'));(btns[0]||document.querySelector('button')).click();return 'answered';})()" >/dev/null 2>&1
sleep 1.6
probe "feedback-mount" "(()=>JSON.stringify({fb:!!document.querySelector('[data-quiz-feedback]'),next:!!document.querySelector('[data-quiz-next]')}))"
dbg "exam-mistakes-live-light"
shot r331-exam-mistakes-light.png
to_dark
dbg "exam-mistakes-live-dark"
shot r331-exam-mistakes-dark.png
to_light

echo "########## S4 — گوشهٔ کنکور (روشن) — ModeCards + هیرو" | tee -a "$OUT"
agent-browser open "$BASE" >/dev/null 2>&1; sleep 2.5
KT=$(click_tool "کنکور"); echo "click_tool=$KT" | tee -a "$OUT"; sleep 3
dbg "konkur-landing-light"
basis "konkur-landing-light"
shot r331-konkur-landing-light.png
to_dark
dbg "konkur-landing-dark"
shot r331-konkur-landing-dark.png
to_light

echo "########## S5 — پنلِ تستهای سخت (روشن+تاریک)" | tee -a "$OUT"
agent-browser eval "(()=>{const c=[...document.querySelectorAll('button[aria-pressed]')].find(x=>(x.textContent||'').replace(/\\u200c/g,'').includes('سخت'));if(!c)return 'NO-CARD';c.click();return 'hard-panel';})()" >/dev/null 2>&1
sleep 2
dbg "konkur-hard-light"
shot r331-konkur-hard-light.png
to_dark
dbg "konkur-hard-dark"
shot r331-konkur-hard-dark.png
to_light

echo "########## S6 — شبیهسازِ کنکورِ زنده (روشن+تاریک)" | tee -a "$OUT"
agent-browser eval "(()=>{const c=[...document.querySelectorAll('button[aria-pressed]')].find(x=>(x.textContent||'').replace(/\\u200c/g,'').includes('شبیه‌ساز'));if(!c)return 'NO-CARD';c.click();return 'sim-panel';})()" >/dev/null 2>&1
sleep 1.5
agent-browser eval "(()=>{const b=[...document.querySelectorAll('button')].find(x=>(x.textContent||'').includes('شروع شبیه‌ساز کنکور'));if(!b)return 'NO-START';b.click();return 'started';})()" >/dev/null 2>&1
sleep 2.5
probe "sim-live-mount" "(()=>{const t=document.body.innerText;return JSON.stringify({counter:(t.match(/۱ \/ \d+/)||[])[0]||'',title:t.includes('شبیه‌ساز کنکور')});})()"
dbg "konkur-sim-live-light"
basis "konkur-sim-live-light"
shot r331-konkur-sim-live-light.png
to_dark
dbg "konkur-sim-live-dark"
shot r331-konkur-sim-live-dark.png

echo "########## S7 — دسکتاپِ ۱۲۸۰ (لندینگِ کنکور تاریک + پاسخگوییِ آزمون روشن)" | tee -a "$OUT"
agent-browser open "$BASE" >/dev/null 2>&1
agent-browser set viewport 1280 800 >/dev/null 2>&1; sleep 2
click_tool "کنکور" >/dev/null 2>&1; sleep 3
to_dark
dbg "konkur-landing-dark-1280"
to_light
agent-browser open "$BASE" >/dev/null 2>&1; sleep 2
click_tool "آزمون جامع" >/dev/null 2>&1; sleep 2.5
agent-browser eval "(()=>{const b=[...document.querySelectorAll('button')].find(x=>(x.textContent||'').trim()==='شروع آزمون جامع');if(!b)return 'NO-START';b.click();return 'started';})()" >/dev/null 2>&1
sleep 2.5
dbg "exam-live-light-1280"
shot r331-exam-live-light-1280.png

echo "########## DONE" | tee -a "$OUT"
agent-browser close >/dev/null 2>&1
echo "log=$OUT"
