#!/usr/bin/env bash
# ------------------------------------------------------------------
# r423 — «کارتِ تصویریِ تقویمِ هفته» — بیستوهشتمین مصرفکنندهٔ qa-lib.sh
#   داوریِ زندهٔ پیشنهادِ ①ِ r421/r422 رویِ buildِ راند (تک سشن):
#   ① بذرِ نردبان در RAWِ localStorage: verbs (go سررسید / come
#     درنفسِ grace1 / see درنفسِ grace2 / have مسلط / run درنفسِ
#     grace8 — پس از هفته) → reload.
#   ② کارنامه: نوارِ هفتخانهایِ r422 + دکمهٔ نوِ «ذخیرهٔ تصویرِ
#     تقویمِ هفته» درونِ خودِ نوار (ariaِ شمارندهٔ همان نوار).
#   ③ تلهِ COU: کلیکِ دکمه → blobِ image/pngِ واقعی (بومِ زنده — نه
#     تقلب) + توستِ گویشِ خودِ درگاه «🖼 عکسِ تقویمِ هفته ذخیره شد».
#   ④ شاهدِ تاریک: نوارِ دکمهدار در دارک (کرنلهایِ emerald/skyِ
#     r414/r417 در گویشِ خانه — عینِ r422).
#   ⑤ reload → hydration: نوار و دکمه از استورِ آبشده برمیگردند.
#   درسِ r414: هر پروبِ پسِ reload با qa_wait_home — بی آن اعتبار ندارد.
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
OUT=/tmp/r423-week-card-witness.txt
QA_SEED_FILE=/tmp/r423-seed-eval.js
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

echo "########## C) کارنامه — دکمهٔ درونِ نوار (روشن)" | tee -a "$OUT"
agent-browser eval "(()=>{window.dispatchEvent(new Event('open-report'));return 'OPENED';})()" >/dev/null 2>&1
sleep 2.5
probe "(()=>{const btn=document.querySelector('[aria-label^=\"ذخیرهٔ تصویرِ تقویمِ هفته\"]');if(!btn)return 'NO-BTN';const strip=btn.closest('.week-strip');if(!strip)return 'NO-STRIP-HOST';return JSON.stringify({aria:btn.getAttribute('aria-label'),title:btn.getAttribute('title'),inStripHost:true,stripAria:strip.getAttribute('aria-label')});})()"
qa_shot r423-week-card-strip-light.png

echo "########## D) تلهِ COU — کلیک → PNGِ واقعی + توستِ گویشِ خود" | tee -a "$OUT"
probe "(()=>{if(!window.__r423origCOU){window.__r423origCOU=URL.createObjectURL;window.__r423blobs=[];}URL.createObjectURL=(b)=>{window.__r423blobs.push(b);return window.__r423origCOU(b);};const btn=document.querySelector('[aria-label^=\"ذخیرهٔ تصویرِ تقویمِ هفته\"]');if(!btn)return 'NO-BTN';btn.click();return 'CLICKED-WEEK-CARD';})()" | tee -a "$OUT"
sleep 2.5
probe "(()=>{const blobs=window.__r423blobs||[];const pngs=blobs.filter((b)=>b.type==='image/png');const t=document.body.innerText||'';const out={blobs:blobs.length,pngCount:pngs.length,pngSize:pngs.length?pngs[pngs.length-1].size:0,toast:t.includes('عکسِ تقویمِ هفته ذخیره شد'),toastDesc:t.includes('هفت خانهٔ پیشِ رو آمادهٔ فرستادن است')};URL.createObjectURL=window.__r423origCOU;return JSON.stringify(out);})()"
qa_shot r423-week-card-toast-light.png

echo "########## E) شاهدِ تاریکِ نوارِ دکمهدار — کرنلهایِ emerald/sky" | tee -a "$OUT"
qa_to_dark
sleep 1.5
probe "(()=>{const el=document.querySelector('[aria-label^=\"هفتهٔ پیشِ رو —\"]');if(!el)return 'NO-STRIP';const btn=document.querySelector('[aria-label^=\"ذخیرهٔ تصویرِ تقویمِ هفته\"]');const bg=(c)=>c?getComputedStyle(c).backgroundColor:null;const tx=(c)=>c?getComputedStyle(c).color:null;const today=el.querySelector('[title^=\"امروز\"]');const tomorrow=el.querySelector('[title^=\"فردا\"]');return JSON.stringify({darkTodayBg:bg(today),darkTodayText:tx(today),darkTomorrowBg:bg(tomorrow),darkTomorrowText:tx(tomorrow),btnStillThere:!!btn});})()"
qa_shot r423-week-card-dark.png

echo "########## F) ماندگاری — reload → hydration → نوار و دکمه از استورِ آبشده" | tee -a "$OUT"
agent-browser eval "(()=>{location.reload();return 'RELOADING';})()" >/dev/null 2>&1
sleep 4
qa_wait_home || { agent-browser close >/dev/null 2>&1; exit 1; }
agent-browser eval "(()=>{window.dispatchEvent(new Event('open-report'));return 'OPENED';})()" >/dev/null 2>&1
sleep 2.5
probe "(()=>{const el=document.querySelector('[aria-label^=\"هفتهٔ پیشِ رو —\"]');const btn=document.querySelector('[aria-label^=\"ذخیرهٔ تصویرِ تقویمِ هفته\"]');const raw=JSON.parse(localStorage.getItem('vision2-study-v1')||'{\"state\":{}}').state;return JSON.stringify({stripAfterReload:el?el.getAttribute('aria-label'):null,btnAfterReload:!!btn,bankPersisted:!!(raw.drillMistakes&&raw.drillMistakes.verbs)});})()" | tee -a "$OUT"

echo "########## نتیجهٔ r423" | tee -a "$OUT"
agent-browser close >/dev/null 2>&1 || true
echo "DONE r423" | tee -a "$OUT"
