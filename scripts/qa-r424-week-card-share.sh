#!/usr/bin/env bash
# ------------------------------------------------------------------
# r424 — «هم‌رسانیِ بومیِ کارتِ تقویمِ هفته» — بیستونهمین مصرفکنندهٔ
# qa-lib.sh. داوریِ زندهٔ پیشنهادِ ②ِ r423 رویِ buildِ راند (تک سشن):
#   ① بذرِ نردبان در RAWِ localStorage (عینِ r423): verbs (go سررسید /
#     come درنفسِ grace1 / see درنفسِ grace2 / have مسلط / run درنفسِ
#     grace8 — پس از هفته) → reload.
#   ② کارنامه: دو دروازهٔ یک ارزیابی درونِ خودِ نوار — «ذخیرهٔ تصویرِ
#     تقویمِ هفته» (r423) و «هم‌رسانی تصویرِ تقویمِ هفته» (r424،
#     کنارِ خواهر) — ariaِ شمارندهٔ یکسان، یک میزبانِ week-strip.
#   ③ کلیکِ هم‌رسانی در دسکتاپِ بیِ navigator.share → blob ساخته
#     میشود (رویدادِ gated بر blob)، شیت پشتیبانی نمیشود → «failed» →
#     پیامِ صادقانهٔ «هم‌رسانی ممکن نشد» (قراردادِ share-card).
#   ④ دفترِ DB: رویدادِ week_calendar_share واقعی در EventDay ثبت شده —
#     گواهِ زندهٔ «رویداد بر blob است، نه بر نتیجهٔ شیت» (r306).
#   ⑤ reload → hydration: هر دو دکمه از استورِ آبشده برمیگردند.
#   درسِ r414: هر پروبِ پسِ reload با qa_wait_home — بی آن اعتبار ندارد.
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
OUT=/tmp/r424-week-card-share-witness.txt
QA_SEED_FILE=/tmp/r424-seed-eval.js
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

echo "########## B) بذرِ نردبان → reload" | tee -a "$OUT"
probe "(()=>{const KEY='vision2-study-v1';const raw=JSON.parse(localStorage.getItem(KEY)||'{\"state\":{}}');const iso=(d)=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');const today=iso(new Date());const ago=(n)=>iso(new Date(Date.now()-n*864e5));raw.state.drillMistakes={verbs:{go:{wrong:2,ok:0,lastDay:ago(1),lastOkDay:''},come:{wrong:2,ok:1,lastDay:ago(1),lastOkDay:today},see:{wrong:3,ok:2,lastDay:ago(1),lastOkDay:today},have:{wrong:1,ok:1,lastDay:ago(1),lastOkDay:ago(1)},run:{wrong:5,ok:4,lastDay:ago(1),lastOkDay:today}}};localStorage.setItem(KEY,JSON.stringify(raw));location.reload();return 'SEEDED:'+today;})()" | tee -a "$OUT"
sleep 4
qa_wait_home || { agent-browser close >/dev/null 2>&1; exit 1; }

echo "########## C) کارنامه — دو دروازه در یک نوار (روشن)" | tee -a "$OUT"
agent-browser eval "(()=>{window.dispatchEvent(new Event('open-report'));return 'OPENED';})()" >/dev/null 2>&1
sleep 2.5
probe "(()=>{const save=document.querySelector('[aria-label^=\"ذخیرهٔ تصویرِ تقویمِ هفته\"]');const share=document.querySelector('[aria-label^=\"هم‌رسانی تصویرِ تقویمِ هفته\"]');if(!save||!share)return 'NO-PAIR';const strip=share.closest('.week-strip');if(!strip)return 'NO-STRIP-HOST';if(save.closest('.week-strip')!==strip)return 'SPLIT-HOSTS';return JSON.stringify({saveAria:save.getAttribute('aria-label'),shareAria:share.getAttribute('aria-label'),shareTitle:share.getAttribute('title'),shareDisabled:share.hasAttribute('disabled'),oneStripHost:true,stripAria:strip.getAttribute('aria-label')});})()"
qa_shot r424-strip-pair-light.png

echo "########## D) کلیکِ هم‌رسانی — دسکتاپِ بیِ navigator.share → پیامِ صادقانه" | tee -a "$OUT"
probe "(()=>{const share=document.querySelector('[aria-label^=\"هم‌رسانی تصویرِ تقویمِ هفته\"]');if(!share)return 'NO-BTN';const navSupport=!!(navigator.canShare&&navigator.share);share.click();return 'CLICKED-SHARE;navSupport='+navSupport;})()" | tee -a "$OUT"
sleep 2.5
probe "(()=>{const t=document.body.innerText||'';const share=document.querySelector('[aria-label^=\"هم‌رسانی تصویرِ تقویمِ هفته\"]');const save=document.querySelector('[aria-label^=\"ذخیرهٔ تصویرِ تقویمِ هفته\"]');return JSON.stringify({honestToast:t.includes('هم‌رسانی ممکن نشد'),honestDesc:t.includes('می‌توانی عکس را ذخیره کنی و خودت بفرستی'),shareEnabledAgain:share?!share.hasAttribute('disabled'):null,saveEnabledAgain:save?!save.hasAttribute('disabled'):null});})()"
qa_shot r424-share-honest-toast-light.png

echo "########## E) دفترِ DB — رویدادِ gated بر blob، زنده ثبت شد" | tee -a "$OUT"
node -e "const {PrismaClient}=require('@prisma/client');const db=new PrismaClient();db.eventDay.findFirst({where:{name:'week_calendar_share'}}).then((r)=>{console.log('LEDGER:',JSON.stringify(r?{name:r.name,count:r.count,day:r.day}:null));return db.\$disconnect();}).catch((e)=>{console.log('LEDGER-ERR:'+e.message);process.exit(0);})" 2>&1 | tee -a "$OUT"

echo "########## F) ماندگاری — reload → hydration → دو دروازه از استورِ آبشده" | tee -a "$OUT"
agent-browser eval "(()=>{location.reload();return 'RELOADING';})()" >/dev/null 2>&1
sleep 4
qa_wait_home || { agent-browser close >/dev/null 2>&1; exit 1; }
agent-browser eval "(()=>{window.dispatchEvent(new Event('open-report'));return 'OPENED';})()" >/dev/null 2>&1
sleep 2.5
probe "(()=>{const save=document.querySelector('[aria-label^=\"ذخیرهٔ تصویرِ تقویمِ هفته\"]');const share=document.querySelector('[aria-label^=\"هم‌رسانی تصویرِ تقویمِ هفته\"]');const raw=JSON.parse(localStorage.getItem('vision2-study-v1')||'{\"state\":{}}').state;return JSON.stringify({saveAfterReload:!!save,shareAfterReload:!!share,bankPersisted:!!(raw.drillMistakes&&raw.drillMistakes.verbs)});})()" | tee -a "$OUT"

echo "########## نتیجهٔ r424" | tee -a "$OUT"
agent-browser close >/dev/null 2>&1 || true
echo "DONE r424" | tee -a "$OUT"
