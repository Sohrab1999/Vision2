#!/usr/bin/env bash
# r320-probe — بازبینیِ دقیقِ «بازگشت به خانه» از صفحهٔ نتایجِ املا
#   سؤال: آیا دکمه واقعا کلیک‌ناپذیر است (باگ اپ) یا شکستِ لحظهای (کانفتی/انیمیشن)؟
set -uo pipefail
BASE="http://127.0.0.1:3000"
JSF=/home/z/my-project/scripts/r319-basis-zero-audit.js

agent-browser open "$BASE" >/dev/null 2>&1
agent-browser set viewport 390 844 >/dev/null 2>&1
agent-browser wait 'body' >/dev/null 2>&1 || true
sleep 1.5
agent-browser eval "(()=>{localStorage.setItem('vision2-study-v1', JSON.stringify({state:{userName:'آرش-گ', onboarded:true}, version:0}));location.reload();return 'seeded';})()" >/dev/null 2>&1
sleep 4

echo "== banner → setup → املا → start =="
agent-browser eval "(()=>{const b=[...document.querySelectorAll('.rush-banner button')].find(x=>x.textContent?.includes('شروع چالش'));if(!b)return 'NO-BANNER';b.click();return 'clicked';})()" 2>&1
sleep 2.4
agent-browser eval "(()=>{const t=[...document.querySelectorAll('[role=tab]')].find(x=>x.textContent?.includes('املا'));if(!t)return 'NO-TAB';t.click();return 'clicked';})()" 2>&1
sleep 2
agent-browser eval "(()=>{const s=document.querySelector('.rush-start');if(!s)return 'NO-START';s.click();return 'started';})()" 2>&1
sleep 4
echo "== in-play markers =="
agent-browser eval "JSON.stringify({scoreLive:!!document.querySelector('.rush-score-live'), spellInput:!!document.querySelector('input[type=text],input:not([type])'), hearBtn:[...document.querySelectorAll('button')].filter(x=>x.textContent?.includes('دوباره بشنو')).length})" 2>&1

echo "== waiting round end (double-poll ضدِ false-negative) =="
MISS=0
for i in $(seq 1 24); do
  ALIVE=$(agent-browser eval "String(!!document.querySelector('.rush-score-live'))" 2>&1 | tr -d '"' | tr -d '\n')
  echo "   poll#$i ALIVE=[$ALIVE]" 
  if [[ "$ALIVE" == "false" ]]; then
    MISS=$((MISS+1))
    [[ $MISS -ge 2 ]] && break
  else
    MISS=0
  fi
  sleep 4
done
sleep 2
echo "== location after wait =="
agent-browser eval "JSON.stringify({scoreLive:!!document.querySelector('.rush-score-live'), doneHeading:document.body.textContent.includes('چالش تمام شد'), backBtn:[...document.querySelectorAll('button')].filter(x=>x.textContent?.includes('بازگشت به خانه')).length})" 2>&1

echo "== done screen state =="
agent-browser eval "JSON.stringify({doneHeading:document.body.textContent.includes('چالش تمام شد'), confettiNodes:document.querySelectorAll('[class*=confetti]').length, backBtn:[...document.querySelectorAll('button')].filter(x=>x.textContent?.includes('بازگشت به خانه')).length})" 2>&1
echo "== WHERE ARE WE — dump =="
agent-browser eval "JSON.stringify({headings:[...document.querySelectorAll('h1,h2,h3')].map(x=>x.textContent?.trim()).slice(0,6), bodySample:document.body.textContent.replace(/\s+/g,' ').slice(0,260), dialogOpen:!!document.querySelector('[role=dialog]'), tablistPresent:!!document.querySelector('[role=tablist]'), minw0:document.querySelectorAll('[class*=\"min-w-0\"][class*=\"flex-1\"]').length})" 2>&1

echo "== attempt click #1 (بلافاصله) =="
agent-browser eval "(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent?.includes('بازگشت به خانه'));if(!b)return 'NO-BTN';const r=b.getBoundingClientRect();const cx=r.left+r.width/2, cy=r.top+r.height/2;const top=document.elementFromPoint(cx,cy);return JSON.stringify({rect:[Math.round(r.left),Math.round(r.top),Math.round(r.width),Math.round(r.height)], topAtCenter: top? top.tagName+'.'+String(top.className).slice(0,40):null, topIsInsideBtn: b.contains(top)});})()" 2>&1
agent-browser eval "(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent?.includes('بازگشت به خانه'));if(!b)return 'NO-BTN';b.click();return 'clicked';})()" 2>&1
sleep 2.4
agent-browser eval "JSON.stringify({onHome:document.body.textContent.includes('تحلیل مهارتها')||document.body.textContent.includes('تحلیل مهارت‌ها'), bannerHome:document.body.textContent.includes('چالش برقآسا')||document.body.textContent.includes('چالش برق‌آسا'), rushBannerNode:!!document.querySelector('.rush-banner')})" 2>&1

agent-browser close >/dev/null 2>&1
pkill -f "chrome" 2>/dev/null || true
echo "== probe done =="
