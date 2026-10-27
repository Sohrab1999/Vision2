#!/usr/bin/env bash
# ------------------------------------------------------------------
# r420 — «تقویمِ همهٔ بانکها» — بیستوپنجمین مصرفکنندهٔ qa-lib.sh
#   و داوریِ زندهٔ دکمهٔ همه-بانکیِ هفته‌نامه + شاهدِ تاریکِ میزبانِ
#   r419 (پیشنهادِ ①ِ آن راند) رویِ buildِ راند (تک سشن):
#   ① بذرِ دوبانک در RAWِ localStorage: verbs (go سررسید / come
#     درنفسِ grace1) + phonemes (نمادِ واقعیِ نخستین واک — از خودِ
#     داده با bun — سررسید) → reload.
#   ② کارنامه (open-report): دکمهٔ چهارمِ نوارِ خروجیها با ariaِ
#     «۳ ردیفِ زنده» — دکمههایِ سهگانهٔ کهنه پابرجا.
#   ③ کلیک با دامِ COU: blobِ واقعی — BOM در سرِ بایتها، سرصفحهٔ
#     دهستونی، بلوکِ verbs پیشِ phonemes (ترتیبِ رسمیِ اطلس)،
#     برچسبها از اطلس (go → رفتن) + toastِ موفقیت.
#   ④ reload → hydration: دکمه از استورِ آبشده برمیگردد.
#   ⑤ شاهدِ تاریکِ میزبان: جدولِ افعال در دارک — سه چیپِ میزبانِ
#     r419 (بنفش + زمردی + آسمانی) با کرنلهایِ تاریکِ خانواده.
#   درسِ r414: هر پروبِ پسِ reload با qa_wait_home — بی آن اعتبار ندارد.
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
OUT=/tmp/r420-allbank-calendar-witness.txt
QA_SEED_FILE=/tmp/r420-seed-eval.js
: > "$OUT"

source /home/z/my-project/scripts/qa-lib.sh

click_by_label(){ agent-browser eval "(()=>{let b=document.querySelector('[aria-label=\"$1\"]');if(!b||b.getBoundingClientRect().width===0){b=[...document.querySelectorAll('button')].find((x)=>(x.innerText||'').replace(/\s+/g,' ').trim()==='$1'&&x.getBoundingClientRect().width>0);}if(!b)return 'NO-BTN:$1';b.click();return 'CLICKED:$1';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
probe(){ agent-browser eval "$1" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

nav_to_verbs(){
  click_by_label "ضمیمه"; sleep 2.5
  click_by_label "افعال بی‌قاعده"; sleep 2
}

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

echo "########## B) بذرِ دوبانک (نمادِ واک از خودِ داده) → reload" | tee -a "$OUT"
bun -e 'const {vowelPhonemes,consonantPhonemes}=require("/home/z/my-project/src/data/appendix.ts");const p=[...vowelPhonemes,...consonantPhonemes].find((x)=>x.symbol&&x.fa);console.log("window.__r420sym="+JSON.stringify(p.symbol)+";\"SYM-OK:\"+window.__r420sym");' > /tmp/r420-sym.js || { echo "SYM-FAIL" | tee -a "$OUT"; agent-browser close >/dev/null 2>&1; exit 1; }
agent-browser eval "$(cat /tmp/r420-sym.js)" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"
probe "(()=>{const KEY='vision2-study-v1';const raw=JSON.parse(localStorage.getItem(KEY)||'{\"state\":{}}');const iso=(d)=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');const today=iso(new Date());const yesterday=iso(new Date(Date.now()-864e5));raw.state.drillStats={verbs:{sessions:3,correct:15,total:30,bestPercent:70,lastDay:yesterday}};raw.state.drillMistakes={verbs:{go:{wrong:2,ok:0,lastDay:yesterday,lastOkDay:''},come:{wrong:2,ok:1,lastDay:yesterday,lastOkDay:today}},phonemes:{[window.__r420sym]:{wrong:1,ok:0,lastDay:yesterday,lastOkDay:''}}};localStorage.setItem(KEY,JSON.stringify(raw));location.reload();return 'SEEDED:'+today;})()" | tee -a "$OUT"
sleep 4
qa_wait_home || { agent-browser close >/dev/null 2>&1; exit 1; }

echo "########## C) کارنامه — دکمهٔ چهارمِ نوارِ خروجیها" | tee -a "$OUT"
agent-browser eval "(()=>{window.dispatchEvent(new Event('open-report'));return 'OPENED';})()" >/dev/null 2>&1
sleep 2.5
probe "(()=>{const all=document.querySelector('[aria-label^=\"دانلود تقویم مرور همهٔ تمرین‌ها\"]');const old=document.querySelector('[aria-label=\"دانلود جدول CSV پیشرفت\"]');return JSON.stringify({allBtn:all?all.getAttribute('aria-label'):null,oldCsvStillThere:!!old});})()"
qa_shot r420-report-allbank-btn-light.png

echo "########## D) کلیک با دامِ COU — blobِ واقعیِ چندبانکی" | tee -a "$OUT"
probe "(()=>{if(!window.__r420origCOU){window.__r420origCOU=URL.createObjectURL;window.__r420blobs=[];}URL.createObjectURL=(b)=>{window.__r420blobs.push(b);return window.__r420origCOU(b);};const btn=document.querySelector('[aria-label^=\"دانلود تقویم مرور همهٔ تمرین‌ها\"]');if(!btn)return 'NO-BTN';btn.click();return 'CLICKED-ALL-CALENDAR';})()" | tee -a "$OUT"
sleep 1
probe "(async()=>{const blobs=window.__r420blobs||[];if(!blobs.length)return 'NO-BLOB';const buf=await blobs[blobs.length-1].arrayBuffer();const text=new TextDecoder('utf-8',{ignoreBOM:true}).decode(buf);const lines=text.split('\r\n').filter((x)=>x);URL.createObjectURL=window.__r420origCOU;return JSON.stringify({bomFirst:text.charCodeAt(0)===0xFEFF,lineCount:lines.length,header:lines[0],rows:lines.slice(1,5)});})()" | tee -a "$OUT"
probe "(()=>{const t=document.body.innerText||'';return JSON.stringify({toast:t.includes('تقویمِ همهٔ تمرینها ذخیره شد')});})()"
qa_shot r420-after-allcalendar-toast-light.png

echo "########## E) ماندگاری — reload → hydration → دکمه از استورِ آبشده" | tee -a "$OUT"
agent-browser eval "(()=>{location.reload();return 'RELOADING';})()" >/dev/null 2>&1
sleep 4
qa_wait_home || { agent-browser close >/dev/null 2>&1; exit 1; }
agent-browser eval "(()=>{window.dispatchEvent(new Event('open-report'));return 'OPENED';})()" >/dev/null 2>&1
sleep 2.5
probe "(()=>{const all=document.querySelector('[aria-label^=\"دانلود تقویم مرور همهٔ تمرین‌ها\"]');const raw=JSON.parse(localStorage.getItem('vision2-study-v1')||'{\"state\":{}}').state;return JSON.stringify({allBtnAfterReload:all?all.getAttribute('aria-label'):null,bankPersisted:!!(raw.drillMistakes&&raw.drillMistakes.verbs&&raw.drillMistakes.phonemes)});})()" | tee -a "$OUT"

echo "########## F) شاهدِ تاریکِ میزبان — سه چیپِ r419 در دارک (پیشنهادِ ①ِ r419)" | tee -a "$OUT"
# گفت‌وگو (کارنامه) باز است — reload آن را میبندد (استیتِ محلی)؛ درسِ r414: پروب پس از qa_wait_home
agent-browser eval "(()=>{location.reload();return 'RELOADING';})()" >/dev/null 2>&1
sleep 4
qa_wait_home || { agent-browser close >/dev/null 2>&1; exit 1; }
nav_to_verbs
qa_to_dark
sleep 1.5
probe "(()=>{const vio=document.querySelector('[aria-label^=\"پیشرفت این تمرین\"]');const due=document.querySelector('[aria-label^=\"سررسیدهای مرور این تمرین\"]');const grace=document.querySelector('[aria-label^=\"دورهٔ نفس این تمرین\"]');const c=(el)=>el?getComputedStyle(el).backgroundColor+' / '+getComputedStyle(el).color:null;return JSON.stringify({violet:vio?vio.textContent:null,due:due?due.textContent:null,dueColor:due?c(due):null,grace:grace?grace.textContent:null,graceColor:grace?c(grace):null});})()"
qa_shot r420-host-chips-dark.png

echo "########## نتیجهٔ r420" | tee -a "$OUT"
agent-browser close >/dev/null 2>&1 || true
echo "DONE r420" | tee -a "$OUT"
