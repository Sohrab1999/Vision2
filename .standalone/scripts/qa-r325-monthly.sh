#!/usr/bin/env bash
# ------------------------------------------------------------------
# r325 — «تقویمِ ۳۰روزهٔ پُر»: نمایِ ماهانهٔ نقشهٔ حرارتی با شخصیتِ ۳۰روزه
#   پیشنهادِ ②ِ r324: رنگآماریِ ۳۰ خانه هرگز در حالتِ پُر سنجیده نشده —
#   r322 در همین نما فقط چهار badge-cardِ درخش را دید (کلاسِ sheen_bleed).
#   ابزار: شخصیتِ r325 (هر ۳۰ روزِ فعال، پوششِ ۷/۸/۸/۷ِ باندها، روزِ
#   سه‌رقمیِ ۱۱۹، سه داستانِ واقعی) + طبقهبندِ r317 + پروبِ basis-صفرِ r319
#   + پروبِ کنتراستِ باند↔جوهرواریِ رقمِ درونِ خانه (نسبتِ WCAG — در هر دو تم)
# تکفراخوانی (الگوی r308/r318/r319/r322/r323): open → seed → سطوح → audit → shot → close
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
DIR=/home/z/my-project/scripts
OUT=/tmp/r325-monthly-results.txt
mkdir -p "$EV"; : > "$OUT"

PERSONA=$(node "$DIR/r325-persona.js")

sweep() { # $1 selector — طبقهبندِ h+v از فایل (قالبِ JS در بش تکخطی نمیشود)
  local JS
  JS=$(sed "s|__SEL__|$1|" "$DIR/r317-sweep.js")
  agent-browser eval "$JS" 2>&1
}
basis() { agent-browser eval "$(cat "$DIR/r319-basis-zero-audit.js")" 2>&1; }
shot() { agent-browser screenshot "$EV/$1" >/dev/null 2>&1; }
stage() { # $1 برچسب — بستهٔ کاملِ ممیزی
  echo "-- $1" | tee -a "$OUT"
  sweep "body" | tee -a "$OUT"
  basis | tee -a "$OUT"
}
month_tab() { # زبانهٔ «۳۰ روزه» — role=tab در tablistِ «بازهٔ نمودار»
  agent-browser eval "(()=>{const tl=document.querySelector('[aria-label=\"بازهٔ نمودار\"]');if(!tl)return 'NO-TABLIST';const b=[...tl.querySelectorAll('[role=tab]')].find(x=>x.textContent?.includes('۳۰ روزه'));if(!b)return 'NO-TAB';b.click();return 'month-on';})()" 2>&1
}
# پروبِ کنتراستِ باند↔جوهر: پسزمینهٔ مؤثر (بالارویِ شفافها) × رنگِ رقم → نسبتِ WCAG
# پروبِ کنتراستِ باند↔جوهر: پسزمینهٔ مؤثر × رنگِ رقم → نسبتِ WCAG.
# درسِ راند: Tailwind v4 رنگها را در computed به lab()/oklch() میدهد — پارسرِ
# rgb-فقط هر دو را سیاه میخواند و حکمِ غلط میدهد (سنجشِ زندهٔ نخست: minCR=21
# در روشن و 2.3 در تاریک — هر دو پژوهشِ ابزاری نه واقعیت). راهحل: بومِ 1×1 —
# fillStyle هر رشتهٔ رنگی CSS را میپذیرد و getImageData معادلِ sRGB میدهد؛
# الفای جوهر (white/90) هم پیش از نسبت رویِ پسزمینه ترکیب میشود.
CONTRAST_JS='(()=>{const cv=document.createElement("canvas");cv.width=cv.height=1;const ctx=cv.getContext("2d",{willReadFrequently:true});const toRGBA=(s)=>{ctx.clearRect(0,0,1,1);ctx.fillStyle="#000";ctx.fillStyle=s;ctx.fillRect(0,0,1,1);const d=ctx.getImageData(0,0,1,1).data;return [d[0],d[1],d[2],d[3]/255];};const lum=([r,g,b])=>{const f=v=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4)};return 0.2126*f(r)+0.7152*f(g)+0.0722*f(b)};const mix=(a,b)=>[0,1,2].map(i=>Math.round(a[i]*a[3]+b[i]*(1-a[3])));const ratio=(A,B)=>{const l1=lum(A),l2=lum(B);const hi=l1>l2?l1:l2,lo=l1>l2?l2:l1;return Math.round(((hi+0.05)/(lo+0.05))*100)/100};const effBg=(el)=>{for(let n=el;n&&n!==document.documentElement;n=n.parentElement){const bg=getComputedStyle(n).backgroundColor;const c=toRGBA(bg);if(c[3]>=0.5)return c}return [255,255,255,1]};const cells=[...document.querySelectorAll(".heat-cell")];const out={cells:cells.length,numbered:0,bands:{},low:[]};for(const c of cells){const span=c.querySelector("span");if(!span)continue;out.numbered++;const bg=effBg(span);const ink=toRGBA(getComputedStyle(span).color);const solid=ink[3]>=0.999?ink.slice(0,3):mix(ink,bg);const cr=ratio(solid,bg.slice(0,3));const band=(c.className.match(/bg-emerald-\d+/)||["bg-stone-100"])[0];if(!out.bands[band])out.bands[band]={n:0,minCR:99};out.bands[band].n++;if(cr<out.bands[band].minCR)out.bands[band].minCR=cr;if(cr<3)out.low.push({band,cr});}return JSON.stringify(out);})()'

agent-browser open "$BASE" >/dev/null 2>&1
agent-browser set viewport 390 844 >/dev/null 2>&1
agent-browser wait 'body' >/dev/null 2>&1 || true
sleep 1.5
# تزریقِ شخصیتِ ۳۰روزه (JSON داده است نه کد — جایگذاریِ امن)
agent-browser eval "(()=>{localStorage.setItem('vision2-study-v1', JSON.stringify(${PERSONA})); location.reload(); return 'champion30-seeded';})()" >/dev/null 2>&1
sleep 4

echo "########## MOUNT PROBE ##########" | tee -a "$OUT"
agent-browser eval "(()=>{const st=JSON.parse(localStorage.getItem('vision2-study-v1')||'{}').state||{};const t=document.body.innerText;return JSON.stringify({
  user: st.userName,
  historyDays: Object.keys(st.history||{}).length,
  weeklyPanel: !!document.querySelector('[aria-label=\"فعالیت هفتگی\"]'),
  monthTab: !!document.querySelector('[aria-label=\"بازهٔ نمودار\"]'),
  storyChip: t.includes('داستان'),
});})()" 2>&1 | tee -a "$OUT"

echo "########## A. MONTH VIEW — LIGHT 390 ##########" | tee -a "$OUT"
MT=$(month_tab); echo "month_tab=$MT" | tee -a "$OUT"
sleep 1.6
# پروبِ حرارتی: تعدادِ خانهها، باندِ هر خانه، رقمها، حلقهٔ امروز، لجند، میانگین، چیپها
agent-browser eval "(()=>{const t=document.body.innerText;const cells=[...document.querySelectorAll('.heat-cell')];const byBand={};let numbered=0;for(const c of cells){const band=(c.className.match(/bg-emerald-\d+/)||['bg-stone-100'])[0];byBand[band]=(byBand[band]||0)+1;if(c.querySelector('span'))numbered++;}const ringed=cells.filter(c=>c.className.includes('ring-cyan')).length;const legend=[...document.querySelectorAll('.mt-3 span.bg-stone-100,.mt-3 span[class*=bg-emerald]')].length;return JSON.stringify({
  cells: cells.length, byBand, numbered, ringed, legend,
  heatTitle: t.includes('نقشهٔ حرارتی ۳۰ روز'),
  avg: (t.match(/میانگین روزانه: (\S+)/)||[])[1]||null,
  chipQuiz: t.includes('آزمون این ماه'), chipReview: t.includes('مرور این ماه'),
  chipStory: t.includes('داستان ۳۰روزه'), storyCount: (t.match(/(\S+)\s*داستان ۳۰روزه/)||[])[1]||null, chipActive: t.includes('روز فعال'),
});})()" 2>&1 | tee -a "$OUT"
stage "month-light-390"
shot r325-month-light-390.png

echo "########## A2. CONTRAST PROBE — LIGHT ##########" | tee -a "$OUT"
agent-browser eval "$CONTRAST_JS" 2>&1 | tee -a "$OUT"

echo "########## A3. THREE-DIGIT EDGE — «۱۱۹» in ~29px cell ##########" | tee -a "$OUT"
agent-browser eval "(()=>{const cells=[...document.querySelectorAll('.heat-cell')];const hit=cells.find(c=>{const s=c.querySelector('span');return s&&s.textContent?.includes('۱۱۹');});if(!hit)return JSON.stringify({found:false});const cr=hit.getBoundingClientRect();const span=hit.querySelector('span');const range=document.createRange();range.selectNodeContents(span);const tr=range.getBoundingClientRect();return JSON.stringify({found:true,cellW:Math.round(cr.width*10)/10,textW:Math.round(tr.width*10)/10,fit:tr.width<=cr.width+0.5,overlapRight:tr.right>cr.right+0.5,overlapLeft:tr.left<cr.left-0.5});})()" 2>&1 | tee -a "$OUT"

echo "########## B. MONTH VIEW — DARK 390 ##########" | tee -a "$OUT"
agent-browser open "$BASE" >/dev/null 2>&1; sleep 2.4
agent-browser eval "(()=>{localStorage.setItem('theme','dark');location.reload();return 'dark-set';})()" >/dev/null 2>&1
sleep 4
month_tab >/dev/null 2>&1
sleep 1.6
stage "month-dark-390"
shot r325-month-dark-390.png
echo "########## B2. CONTRAST PROBE — DARK (نگاشتِ وارونهٔ باندها) ##########" | tee -a "$OUT"
agent-browser eval "$CONTRAST_JS" 2>&1 | tee -a "$OUT"
agent-browser eval "(()=>{localStorage.setItem('theme','light');return 'light-back';})()" >/dev/null 2>&1

echo "########## C. MONTH VIEW — DESKTOP 1280 ##########" | tee -a "$OUT"
agent-browser set viewport 1280 900 >/dev/null 2>&1
sleep 2
agent-browser eval "(()=>{location.reload();return 'reload';})()" >/dev/null 2>&1
sleep 4
month_tab >/dev/null 2>&1
sleep 1.6
stage "month-desktop-1280"
shot r325-month-1280.png
agent-browser eval "$CONTRAST_JS" 2>&1 | tee -a "$OUT" | sed 's/^/desktop-contrast: /'

agent-browser close >/dev/null 2>&1
pkill -f "chrome" 2>/dev/null || true
echo "== done ==" | tee -a "$OUT"
echo "== خلاصه در $OUT =="
