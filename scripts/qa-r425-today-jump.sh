#!/usr/bin/env bash
# ------------------------------------------------------------------
# r425 — «پرشِ خانهٔ امروز» — سیامین مصرفکنندهٔ qa-lib.sh. داوریِ زندهٔ
# پیشنهادِ ②ِ r422 + شاهدِ تاریکِ جفتِ دو دروازه (پیشنهادِ ②ِ r424) رویِ
# buildِ راند (تک سشن):
#   ① بذرِ نردبان در RAWِ localStorage (عینِ r424): verbs (go سررسید /
#     come درنفسِ grace1 / see درنفسِ grace2 / run درنفسِ grace8 — پس
#     از هفته) → reload.
#   ② کارنامه: خانهٔ «امروز» حالا دکمهٔ پرش است — ariaِ کاملِ خودگویش
#     («امروز — ۱ موردِ بازگشت — پرش به تمرینِ افعال بی‌قاعده»)، کرنلِ
#     زمردیِ خانوادهٔ r414، درونِ همان نوارِ دهعضویِ r424.
#   ③ کلیکِ خانه → «پرش ≠ نوشتن»: کارنامه بسته میشود، view به ضمیمه
#     با لنگرِ سطرِ go میپرد (دکمهٔ «شروع تمرین افعال بی‌قاعده» زنده)،
#     هیچ جلسهای خودکار شروع نمیشود.
#   ④ دفترِ DB: رویدادِ drill_due_jump واقعی ثبت شده (count=۱).
#   ⑤ شاهدِ تاریکِ جفت: baseِ زمردیِ شب + hoverِ عمیقترِ today-jump
#     (rgba(6,55,40,.55)) + جوهرِ hoverِ شبِ دو دروازه (#5eead4 —
#     خانوادهٔ tealِ r425) + کمربندِ disabled (opacity .۵).
#   ⑥ امروزِ چندبانکی (بذرِ واک همزاد): خانه ساکتِ صادق میماند —
#     «در ۲ بانک — هر بانک در میزبانِ خودش تمرین میشود».
#   ⑦ reload → hydration: نوار و مقصدِ چندبانکی از استورِ آبشده.
#   درسِ r414: هر پروبِ پسِ reload با qa_wait_home — بی آن اعتبار ندارد.
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
OUT=/tmp/r425-today-jump-witness.txt
QA_SEED_FILE=/tmp/r425-seed-eval.js
: > "$OUT"

source /home/z/my-project/scripts/qa-lib.sh

probe(){ agent-browser eval "$1" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

echo "########## A) خانه — seed + روشنِ ۱۲۸۰" | tee -a "$OUT"
agent-browser close >/dev/null 2>&1 || true
pkill -f "agent-browser/browsers" 2>/dev/null; sleep 1
agent-browser open "$BASE" >/dev/null 2>&1
agent-browser set viewport 1280 900 >/dev/null 2>&1
agent-browser wait 'body' >/dev/null 2>&1 || true
sleep 2
node /home/z/my-project/scripts/r338-persona.js | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>process.stdout.write(JSON.parse(s).browserEval))" > "$QA_SEED_FILE" || { echo "PERSONA-FAIL" | tee -a "$OUT"; agent-browser close >/dev/null 2>&1; exit 1; }
qa_wait_home || { agent-browser close >/dev/null 2>&1; exit 1; }
agent-browser eval "$(cat "$QA_SEED_FILE")" >/dev/null 2>&1
sleep 5
qa_seed_guard || { agent-browser close >/dev/null 2>&1; exit 1; }
qa_to_light

echo "########## B) بذرِ نردبان (تکبانکِ امروز) → reload" | tee -a "$OUT"
probe "(()=>{const KEY='vision2-study-v1';const raw=JSON.parse(localStorage.getItem(KEY)||'{\"state\":{}}');const iso=(d)=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');const today=iso(new Date());const ago=(n)=>iso(new Date(Date.now()-n*864e5));raw.state.drillMistakes={verbs:{go:{wrong:2,ok:0,lastDay:ago(1),lastOkDay:''},come:{wrong:2,ok:1,lastDay:ago(1),lastOkDay:today},see:{wrong:3,ok:2,lastDay:ago(1),lastOkDay:today},run:{wrong:5,ok:4,lastDay:ago(1),lastOkDay:today}}};localStorage.setItem(KEY,JSON.stringify(raw));location.reload();return 'SEEDED:'+today;})()" | tee -a "$OUT"
sleep 4
qa_wait_home || { agent-browser close >/dev/null 2>&1; exit 1; }

echo "########## C) کارنامه — خانهٔ امروز دکمهٔ پرش است (روشن)" | tee -a "$OUT"
agent-browser eval "(()=>{window.dispatchEvent(new Event('open-report'));return 'OPENED';})()" >/dev/null 2>&1
sleep 2.5
probe "(()=>{const btn=document.querySelector('button[aria-label^=\"امروز — \"]');if(!btn)return 'NO-JUMP-BTN';const strip=btn.closest('.week-strip');if(!strip)return 'NO-STRIP-HOST';return JSON.stringify({todayAria:btn.getAttribute('aria-label'),todayTitle:btn.getAttribute('title'),stripAria:strip.getAttribute('aria-label'),kernelLight:getComputedStyle(btn).backgroundColor,inkLight:getComputedStyle(btn).color});})()"
qa_shot r425-today-jump-btn-light.png

echo "########## D) کلیکِ خانهٔ امروز — پرش به میزبان، نه جلسهٔ ساختگی" | tee -a "$OUT"
probe "(()=>{const btn=document.querySelector('button[aria-label^=\"امروز — \"]');if(!btn)return 'NO-BTN';btn.click();return 'CLICKED-JUMP';})()" | tee -a "$OUT"
sleep 3
probe "(()=>{const start=document.querySelector('[aria-label=\"شروع تمرین افعال بی‌قاعده\"]');const dialogGone=!document.querySelector('.report-dialog');return JSON.stringify({drillStartBtn:!!start,reportDialogClosed:dialogGone,jumpLandedAtHost:!!start&&dialogGone});})()"
qa_shot r425-after-jump-appendix-light.png

echo "########## E) دفترِ DB — drill_due_jump ثبت شد" | tee -a "$OUT"
node -e "const {PrismaClient}=require('@prisma/client');const db=new PrismaClient();db.eventDay.findFirst({where:{name:'drill_due_jump'}}).then((r)=>{console.log('LEDGER:',JSON.stringify(r?{name:r.name,count:r.count,day:r.day}:null));return db.\$disconnect();}).catch((e)=>{console.log('LEDGER-ERR:'+e.message);process.exit(0);})" 2>&1 | tee -a "$OUT"

echo "########## F) شاهدِ تاریکِ جفت — base و hover و disabled" | tee -a "$OUT"
agent-browser eval "(()=>{window.dispatchEvent(new Event('open-report'));return 'OPENED';})()" >/dev/null 2>&1
sleep 2.5
qa_to_dark
sleep 1
probe "(()=>{const btn=document.querySelector('button[aria-label^=\"امروز — \"]');const share=document.querySelector('[aria-label^=\"هم‌رسانی تصویرِ تقویمِ هفته\"]');if(!btn||!share)return 'NO-PAIR';return JSON.stringify({todayKernelDark:getComputedStyle(btn).backgroundColor,todayInkDark:getComputedStyle(btn).color,shareBaseInkDark:getComputedStyle(share).color});})()"
agent-browser hover '.today-jump' >/dev/null 2>&1 || true
sleep 1
probe "(()=>{const btn=document.querySelector('.today-jump');if(!btn)return 'NO-BTN';return JSON.stringify({todayHoverKernelDark:getComputedStyle(btn).backgroundColor});})()"
agent-browser hover '[aria-label^="هم‌رسانی تصویرِ تقویمِ هفته"]' >/dev/null 2>&1 || true
sleep 1
probe "(()=>{const share=document.querySelector('[aria-label^=\"هم‌رسانی تصویرِ تقویمِ هفته\"]');if(!share)return 'NO-BTN';return JSON.stringify({shareHoverInkDark:getComputedStyle(share).color});})()"
probe "(()=>{const share=document.querySelector('[aria-label^=\"هم‌رسانی تصویرِ تقویمِ هفته\"]');if(!share)return 'NO-BTN';share.disabled=true;const op=getComputedStyle(share).opacity;share.disabled=false;return JSON.stringify({disabledKernelOpacity:op});})()"
qa_shot r425-strip-pair-dark.png

echo "########## G) امروزِ چندبانکی — ساکتِ صادق (بذرِ واکِ همزاد)" | tee -a "$OUT"
qa_to_light
bun -e 'const {vowelPhonemes,consonantPhonemes}=require("/home/z/my-project/src/data/appendix.ts");const p=[...vowelPhonemes,...consonantPhonemes].find((x)=>x.symbol&&x.fa);console.log("window.__r425sym="+JSON.stringify(p.symbol)+";\"SYM-OK:\"+window.__r425sym");' > /tmp/r425-sym.js || { echo "SYM-FAIL" | tee -a "$OUT"; agent-browser close >/dev/null 2>&1; exit 1; }
agent-browser eval "$(cat /tmp/r425-sym.js)" >/dev/null 2>&1
probe "(()=>{const KEY='vision2-study-v1';const raw=JSON.parse(localStorage.getItem(KEY)||'{\"state\":{}}');const iso=(d)=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');const today=iso(new Date());const ago=(n)=>iso(new Date(Date.now()-n*864e5));raw.state.drillMistakes.phonemes={[window.__r425sym]:{wrong:2,ok:0,lastDay:ago(1),lastOkDay:''}};localStorage.setItem(KEY,JSON.stringify(raw));return 'PHONEME-SEEDED:'+window.__r425sym;})()" | tee -a "$OUT"
agent-browser eval "(()=>{location.reload();return 'RELOADING';})()" >/dev/null 2>&1
sleep 4
qa_wait_home || { agent-browser close >/dev/null 2>&1; exit 1; }
agent-browser eval "(()=>{window.dispatchEvent(new Event('open-report'));return 'OPENED';})()" >/dev/null 2>&1
sleep 2.5
probe "(()=>{const today=document.querySelector('.week-strip [title^=\"امروز\"]');if(!today)return 'NO-TODAY-CELL';const btn=document.querySelector('button[aria-label^=\"امروز — \"]');return JSON.stringify({tag:today.tagName,multiTitle:today.getAttribute('title'),jumpBtnGone:!btn});})()"
qa_shot r425-multi-bank-quiet-light.png

echo "########## H) ماندگاری — reload → hydration" | tee -a "$OUT"
agent-browser eval "(()=>{location.reload();return 'RELOADING';})()" >/dev/null 2>&1
sleep 4
qa_wait_home || { agent-browser close >/dev/null 2>&1; exit 1; }
agent-browser eval "(()=>{window.dispatchEvent(new Event('open-report'));return 'OPENED';})()" >/dev/null 2>&1
sleep 2.5
probe "(()=>{const today=document.querySelector('.week-strip [title^=\"امروز\"]');const raw=JSON.parse(localStorage.getItem('vision2-study-v1')||'{\"state\":{}}').state;return JSON.stringify({multiTitleAfterReload:today?today.getAttribute('title'):null,bankPersisted:!!(raw.drillMistakes&&raw.drillMistakes.verbs&&raw.drillMistakes.phonemes)});})()" | tee -a "$OUT"

agent-browser close >/dev/null 2>&1 || true
echo "########## WITNESS-DONE" | tee -a "$OUT"
