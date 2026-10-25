#!/usr/bin/env bash
# ------------------------------------------------------------------
# r336 — «سویپِ زندهٔ آزمونکِ ایستگاه و آزمونِ شناختِ خط از درگاهِ خودِ
#   مترو» — QuizEngine از این دو درگاهِ خاص هرگز در حینِ پاسخگویی
#   سنجیده نشده (بازخوردِ ✓/✗، نمایشِ نتیجه، دروازهٔ resumeDoor).
#   + دیالوگِ مترو در دسکتاپِ ۱۲۸۰. تک سشن؛ dbgِ r328 + تاریکِ درجا
#   (الگویِ r330 — نمایِ گذرا با reload میمیرد).
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
DIR=/home/z/my-project/scripts
OUT=/tmp/r336-metro-quiz.txt
mkdir -p "$EV"; : > "$OUT"

dbg()   { echo "-- [contrast] $1" | tee -a "$OUT"; agent-browser eval "$(cat "$DIR/r328-fails-dbg.js")" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
shot()  { agent-browser screenshot "$EV/$1" >/dev/null 2>&1; }
to_dark_inplace()  { agent-browser eval "(()=>{document.documentElement.classList.add('dark');return 'd';})()" >/dev/null 2>&1; sleep 1.2; }
back_light_inplace(){ agent-browser eval "(()=>{document.documentElement.classList.remove('dark');return 'l';})()" >/dev/null 2>&1; sleep 1.2; }

# پاسخگوییِ واقعی: سؤال‌ها را یکییکی با data-quiz-option میزند —
# ایندکسِ ۱/۲ متناوب (ترکیبی از ✓ و ✗) و بعد data-quiz-next.
answer_all() { # $1 = بیشینهٔ سؤال
  for i in $(seq 1 "$1"); do
    local K=1; [ $((i % 2)) -eq 0 ] && K=2
    agent-browser eval "(()=>{const os=[...document.querySelectorAll('[data-quiz-option]')].filter(o=>o.getBoundingClientRect().width>0);if(!os.length)return 'NO-OPT';const t=os[Math.min($K,os.length-1)];t.click();return 'opt'+$K;})()" 2>&1 | tee -a "$OUT"
    sleep 1.4
    agent-browser eval "(()=>{const fb=document.querySelector('[data-quiz-feedback]');if(!fb)return 'NO-FB';const h=fb.querySelector('p');return (h?.textContent||'').slice(0,26);})()" 2>&1 | tee -a "$OUT"
    agent-browser eval "(()=>{const n=document.querySelector('[data-quiz-next]');if(!n)return 'NO-NEXT';n.click();return 'next';})()" >/dev/null 2>&1
    sleep 1.2
  done
}

echo "########## بذرِ r324 + خانه (روشن ۳۹۰ — تحمیلِ صریحِ روشن، درسِ r335)" | tee -a "$OUT"
agent-browser close >/dev/null 2>&1 || true
agent-browser open "$BASE" >/dev/null 2>&1
agent-browser set viewport 390 844 >/dev/null 2>&1
agent-browser wait 'body' >/dev/null 2>&1 || true
sleep 2
P=$(node "$DIR/r324-persona.js")
agent-browser eval "(()=>{localStorage.setItem('vision2-study-v1', JSON.stringify(${P}));localStorage.setItem('theme','light');location.reload();return 's';})()" >/dev/null 2>&1
sleep 4
agent-browser eval "(()=>{document.documentElement.classList.remove('dark');return 'l';})()" >/dev/null 2>&1
sleep 1

agent-browser eval "(()=>{const b=[...document.querySelectorAll('button')].find(x=>(x.getAttribute('aria-label')||x.textContent||'').includes('متروی گرامر'));if(!b)return 'NO-TOOL';b.click();return 'ok';})()" 2>&1 | tee -a "$OUT"
sleep 2.5

echo "########## آزمونکِ ایستگاه — از دیالوگِ ایستگاهِ بازِ نخستین خط (زمرد)" | tee -a "$OUT"
agent-browser eval "(()=>{const sec=document.querySelector('.gmetro-line');if(!sec)return 'NO-LINE';const st=[...sec.querySelectorAll('button')].find(b=>(b.getAttribute('aria-label')||'').startsWith('ایستگاه')&&!(b.getAttribute('aria-label')||'').includes('قفل'));if(!st)return 'NO-STATION';st.click();return 'ok';})()" 2>&1 | tee -a "$OUT"
sleep 1.8
agent-browser eval "(()=>{const b=[...document.querySelectorAll('.gmetro-dialog button')].find(x=>x.textContent?.includes('شروع آزمونک ایستگاه'));if(!b)return 'NO-QUIZ-BTN';b.click();return 'ok';})()" 2>&1 | tee -a "$OUT"
sleep 2.2
agent-browser eval "(()=>{const os=document.querySelectorAll('[data-quiz-option]');const t=document.body.innerText.includes('آزمونک ایستگاه');return JSON.stringify({opts:os.length,isStationQuiz:t});})()" 2>&1 | tee -a "$OUT"
dbg "station-quiz-live-light"
shot "r336-station-quiz-live-light.png"

echo "########## پاسخگوییِ واقعیِ آزمونک ایستگاه (پاسخِ ۲ و ۳ — ✓/✗ آمیخته)" | tee -a "$OUT"
answer_all 6
sleep 1.5
agent-browser eval "(()=>{const res=document.querySelector('[class*=quiz-result]')||document.body.innerText.includes('نتیجه');return JSON.stringify({resultVisible:!!res});})()" 2>&1 | tee -a "$OUT"
dbg "station-quiz-result-light"
shot "r336-station-result-light.png"
to_dark_inplace
dbg "station-quiz-result-dark-inplace"
shot "r336-station-result-dark.png"
back_light_inplace

echo "########## خروج از نتیجه → آزمونِ شناختِ خط (زمرد)" | tee -a "$OUT"
agent-browser eval "(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent?.trim()==='بازگشت'||x.getAttribute('aria-label')?.includes('بازگشت'));if(!b)return 'NO-EXIT';b.click();return 'ok';})()" 2>&1 | tee -a "$OUT"
sleep 1.8
agent-browser eval "(()=>{const b=document.querySelector('.gmetro-probe-btn');if(!b)return 'NO-PROBE-BTN';b.click();return 'ok';})()" 2>&1 | tee -a "$OUT"
sleep 2.2
agent-browser eval "(()=>{const os=document.querySelectorAll('[data-quiz-option]');const t=document.body.innerText.includes('آزمون شناخت');return JSON.stringify({opts:os.length,isProbe:t});})()" 2>&1 | tee -a "$OUT"
dbg "probe-quiz-live-light"
shot "r336-probe-quiz-live-light.png"

echo "########## پاسخگوییِ واقعیِ آزمون شناخت (۵ سؤال)" | tee -a "$OUT"
answer_all 5
sleep 1.5
dbg "probe-result-light"
shot "r336-probe-result-light.png"
to_dark_inplace
dbg "probe-result-dark-inplace"
shot "r336-probe-result-dark.png"
back_light_inplace

echo "########## دیالوگِ مترو در دسکتاپِ ۱۲۸۰" | tee -a "$OUT"
agent-browser eval "(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent?.trim()==='بازگشت'||x.getAttribute('aria-label')?.includes('بازگشت'));if(b)b.click();return 'ok';})()" >/dev/null 2>&1
sleep 1.5
agent-browser set viewport 1280 900 >/dev/null 2>&1
sleep 1.5
agent-browser eval "(()=>{const sec=document.querySelector('.gmetro-line');if(!sec)return 'NO-LINE';const st=[...sec.querySelectorAll('button')].find(b=>(b.getAttribute('aria-label')||'').startsWith('ایستگاه'));if(!st)return 'NO-STATION';st.click();return 'ok';})()" 2>&1 | tee -a "$OUT"
sleep 1.8
dbg "dialog-desktop-1280-light"
shot "r336-dialog-1280-light.png"
to_dark_inplace
dbg "dialog-desktop-1280-dark-inplace"
shot "r336-dialog-1280-dark.png"
back_light_inplace

echo "########## DONE" | tee -a "$OUT"
agent-browser close >/dev/null 2>&1
echo "log=$OUT"
