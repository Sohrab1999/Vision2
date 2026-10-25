#!/usr/bin/env bash
# ------------------------------------------------------------------
# r331-recheck — بازسنجیِ هدفمندِ سه درمان/کشفِ راند:
#   A. هیروِ کنکور پسِ از ارتقایِ white/90→white (روشن ۴٫۳۹→≥۴٫۵)
#   B. جعبهٔ بازخوردِ immediate (کلیکِ واقعیِ [data-quiz-option]) —
#      جفتِ مرزیِ text-rose-600 رویِ stone-50 (محاسبه: دقیقاً ۴٫۵۰)
#   C. چیپِ تایمرِ <60s (bg-rose-100/text-rose-700) تزریقی در دو تم
#   D. چیپهایِ آیکنیِ ModeCard (-600 رویِ -50) — سنجشِ عددیِ غیرمتنِ 3:1
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
DIR=/home/z/my-project/scripts
OUT=/tmp/r331-recheck.txt
mkdir -p "$EV"; : > "$OUT"

dbg()   { echo "-- [contrast] $1" | tee -a "$OUT"; agent-browser eval "$(cat "$DIR/r328-fails-dbg.js")" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
to_dark()  { agent-browser eval "(()=>{localStorage.setItem('theme','dark');document.documentElement.classList.add('dark');return 'dark-inplace';})()" >/dev/null 2>&1; sleep 1.2; }
to_light() { agent-browser eval "(()=>{localStorage.setItem('theme','light');document.documentElement.classList.remove('dark');return 'light-inplace';})()" >/dev/null 2>&1; sleep 1.2; }
click_tool() {
  agent-browser eval "(()=>{const g=document.querySelector('[aria-label=\"ابزارهای یادگیری\"]');if(!g)return 'NO-GRID';const b=[...g.querySelectorAll('button')].find(x=>(x.textContent||'').replace(/\\u200c/g,'').includes('$1'));if(!b)return 'NO-BTN';b.click();return 'clicked';})()" 2>&1
}
pair_probe() {
  agent-browser eval "(()=>{const cv=document.createElement('canvas');cv.width=cv.height=1;const ctx=cv.getContext('2d',{willReadFrequently:true});const toRGBA=(s)=>{ctx.clearRect(0,0,1,1);ctx.fillStyle='#000';ctx.fillStyle=s;ctx.fillRect(0,0,1,1);const d=ctx.getImageData(0,0,1,1).data;return [d[0],d[1],d[2],d[3]/255];};const lum=([r,g,b])=>{const f=(v)=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4);};return 0.2126*f(r)+0.7152*f(g)+0.0722*f(b);};const ratio=(A,B)=>{const l1=lum(A),l2=lum(B);const hi=l1>l2?l1:l2,lo=l1>l2?l2:l1;return Math.round(((hi+0.05)/(lo+0.05))*100)/100;};const t=document.getElementById('__pair__');if(!t)return 'NO-EL';const cs=getComputedStyle(t);const ink=toRGBA(cs.color);const bgRaw=toRGBA(cs.backgroundColor);let base=[255,255,255];const root=getComputedStyle(document.documentElement).backgroundColor;if(root&&root!=='transparent'){const c=toRGBA(root);if(c[3]>0)base=[c[0],c[1],c[2]];}const bg=[0,1,2].map(i=>Math.round(bgRaw[i]*bgRaw[3]+base[i]*(1-bgRaw[3])));const eff=[0,1,2].map(i=>Math.round(ink[i]*ink[3]+bg[i]*(1-ink[3])));return JSON.stringify({ink:cs.color,bg:cs.backgroundColor,cr:ratio(eff,bg),theme:document.documentElement.classList.contains('dark')?'dark':'light'});})()" 2>&1
}

echo "########## A — هیروِ کنکور پسِ از درمان (روشن)" | tee -a "$OUT"
agent-browser open "$BASE" >/dev/null 2>&1
agent-browser set viewport 390 844 >/dev/null 2>&1
agent-browser wait 'body' >/dev/null 2>&1 || true
sleep 2
PERSONA=$(node "$DIR/r324-persona.js")
agent-browser eval "(()=>{localStorage.setItem('vision2-study-v1', JSON.stringify(${PERSONA})); location.reload(); return 'seeded';})()" >/dev/null 2>&1
sleep 4
click_tool "کنکور" >/dev/null 2>&1; sleep 3
dbg "konkur-landing-light-FIXED"
agent-browser screenshot "$EV/r331-konkur-landing-fixed.png" >/dev/null 2>&1

echo "########## B — بازخوردِ immediate (کلیکِ واقعیِ گزینه)" | tee -a "$OUT"
agent-browser open "$BASE" >/dev/null 2>&1; sleep 2.5
click_tool "آزمون جامع" >/dev/null 2>&1; sleep 2.5
agent-browser eval "(()=>{const b=[...document.querySelectorAll('button')].find(x=>(x.textContent||'').includes('مرور اشتباهات آزمون جامع'));if(!b)return 'NO-CTA';b.click();return 'started';})()" >/dev/null 2>&1
sleep 2.5
agent-browser eval "(()=>{const o=document.querySelector('[data-quiz-option=\"0\"]');if(!o)return 'NO-OPT';o.click();return 'answered';})()" | tee -a "$OUT"
sleep 1.6
agent-browser eval "(()=>{const fb=document.querySelector('[data-quiz-feedback]');return JSON.stringify({fb:!!fb,next:!!document.querySelector('[data-quiz-next]'),fbText:fb?fb.textContent.slice(0,40):''});})()" | tee -a "$OUT"
dbg "exam-mistakes-answered-light"
agent-browser screenshot "$EV/r331-mistakes-answered-light.png" >/dev/null 2>&1
to_dark
dbg "exam-mistakes-answered-dark"
agent-browser screenshot "$EV/r331-mistakes-answered-dark.png" >/dev/null 2>&1
to_light

echo "########## C — چیپِ تایمرِ کم در دو تم" | tee -a "$OUT"
INJ="(()=>{let t=document.getElementById('__pair__');if(t)t.remove();const s=document.createElement('span');s.id='__pair__';s.className='rounded-lg px-2.5 py-1 text-[12px] font-black bg-rose-100 text-rose-700';s.textContent='۰:۵۹';s.style.position='fixed';s.style.top='8px';s.style.left='8px';document.body.appendChild(s);return 'injected';})()"
agent-browser eval "$INJ" >/dev/null 2>&1; sleep 0.4
echo "-- timer-low LIGHT" | tee -a "$OUT"; pair_probe | tee -a "$OUT"
to_dark; sleep 0.6
echo "-- timer-low DARK" | tee -a "$OUT"; pair_probe | tee -a "$OUT"
to_light
agent-browser eval "(()=>{const t=document.getElementById('__pair__');if(t)t.remove();return 'ok';})()" >/dev/null 2>&1

echo "########## D — چیپهایِ آیکنیِ ModeCard (عددیِ غیرمتن)" | tee -a "$OUT"
node -e '
const lum=([r,g,b])=>{const f=(v)=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4);};return 0.2126*f(r)+0.7152*f(g)+0.0722*f(b);};
const hex=(h)=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const ratio=(a,b)=>{const l1=lum(hex(a)),l2=lum(hex(b));const hi=l1>l2?l1:l2,lo=l1>l2?l2:l1;return Math.round(((hi+0.05)/(lo+0.05))*100)/100;};
console.log("amber-600/amber-50:",ratio("#d97706","#fffbeb"));
console.log("rose-600/rose-50:",ratio("#e11d48","#fff1f2"));
console.log("emerald-600/emerald-50:",ratio("#059669","#ecfdf5"));
console.log("white/orange-mid(#bb4d00) after fix:",ratio("#ffffff","#bb4d00"));
console.log("rose-600/stone-50:",ratio("#e11d48","#fafaf9"));
console.log("rose-700/stone-50:",ratio("#be123c","#fafaf9"));
' | tee -a "$OUT"

echo "########## DONE" | tee -a "$OUT"
agent-browser close >/dev/null 2>&1
echo "log=$OUT"
