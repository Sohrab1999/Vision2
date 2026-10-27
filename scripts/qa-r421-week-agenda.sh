#!/usr/bin/env bash
# ------------------------------------------------------------------
# r421 — «تقویمِ هفتهٔ پیشِ رو» — بیستوششمین مصرفکنندهٔ qa-lib.sh
#   داوریِ زندهٔ دکمهٔ پنجمِ نوارِ خروجیها (برشِ ۷روزهٔ اطلسِ r420)
#   + شاهدِ تاریکِ دکمهٔ همه-بانکی (پیشنهادِ ③ِ همین راند) رویِ
#   buildِ راند (تک سشن):
#   ① بذرِ نردبان + دورترها در RAWِ localStorage: verbs (go سررسید /
#     come درنفسِ grace1 / see درنفسِ grace2 / have مسلط / run درنفسِ
#     grace8 — بیرونِ پنجره) + phonemes (نمادِ واقعیِ نخستین واک —
#     از خودِ داده با bun — درنفسِ grace6، لبهٔ درونِ پنجره) → reload.
#   ② کارنامه (open-report): دکمهٔ پنجم با ariaِ «۴ ردیفِ این هفته»
#     (فقط درونِ پنجره) کنارِ دکمهٔ همه-بانکیِ «۵ ردیفِ زنده» —
#     سهگانهٔ کهنه پابرجا.
#   ③ کلیک با دامِ COU: blobِ واقعی — BOM در سرِ بایتها، سرصفحهٔ
#     دهستونی، سطرهایِ «جمعِ روز» پیشِ ردیفهایِ هر روز (روزهایِ
#     ۰/۱/۲/۶)، دنبالهٔ «پس از هفته» برایِ run (۸) + toastِ موفقیت.
#   ④ reload → hydration: هر دو دکمه از استورِ آبشده برمیگردند.
#   ⑤ شاهدِ تاریکِ همه-بانکی: نوارِ خروجیها در دارک — پنج دکمه با
#     همخانوادگیِ بصری (کرنلِ stone/teal در گویشِ تاریک).
#   درسِ r414: هر پروبِ پسِ reload با qa_wait_home — بی آن اعتبار ندارد.
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
OUT=/tmp/r421-week-agenda-witness.txt
QA_SEED_FILE=/tmp/r421-seed-eval.js
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

echo "########## B) بذرِ نردبان + دورترها (نمادِ واک از خودِ داده) → reload" | tee -a "$OUT"
bun -e 'const {vowelPhonemes,consonantPhonemes}=require("/home/z/my-project/src/data/appendix.ts");const p=[...vowelPhonemes,...consonantPhonemes].find((x)=>x.symbol&&x.fa);console.log("window.__r421sym="+JSON.stringify(p.symbol)+";\"SYM-OK:\"+window.__r421sym");' > /tmp/r421-sym.js || { echo "SYM-FAIL" | tee -a "$OUT"; agent-browser close >/dev/null 2>&1; exit 1; }
agent-browser eval "$(cat /tmp/r421-sym.js)" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"
probe "(()=>{const KEY='vision2-study-v1';const raw=JSON.parse(localStorage.getItem(KEY)||'{\"state\":{}}');const iso=(d)=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');const today=iso(new Date());const ago=(n)=>iso(new Date(Date.now()-n*864e5));raw.state.drillMistakes={verbs:{go:{wrong:2,ok:0,lastDay:ago(1),lastOkDay:''},come:{wrong:2,ok:1,lastDay:ago(1),lastOkDay:today},see:{wrong:3,ok:2,lastDay:ago(1),lastOkDay:today},have:{wrong:1,ok:1,lastDay:ago(1),lastOkDay:ago(1)},run:{wrong:5,ok:4,lastDay:ago(1),lastOkDay:today}},phonemes:{[window.__r421sym]:{wrong:5,ok:4,lastDay:ago(3),lastOkDay:ago(2)}}};localStorage.setItem(KEY,JSON.stringify(raw));location.reload();return 'SEEDED:'+today;})()" | tee -a "$OUT"
sleep 4
qa_wait_home || { agent-browser close >/dev/null 2>&1; exit 1; }

echo "########## C) کارنامه — دکمهٔ پنجمِ نوارِ خروجیها (شمارِ درونِ پنجره)" | tee -a "$OUT"
agent-browser eval "(()=>{window.dispatchEvent(new Event('open-report'));return 'OPENED';})()" >/dev/null 2>&1
sleep 2.5
probe "(()=>{const week=document.querySelector('[aria-label^=\"دانلود تقویم هفتهٔ پیشِ رو\"]');const all=document.querySelector('[aria-label^=\"دانلود تقویم مرور همهٔ تمرین‌ها\"]');const old=document.querySelector('[aria-label=\"دانلود جدول CSV پیشرفت\"]');return JSON.stringify({weekBtn:week?week.getAttribute('aria-label'):null,allBtn:all?all.getAttribute('aria-label'):null,oldCsvStillThere:!!old});})()"
qa_shot r421-report-week-btn-light.png

echo "########## D) کلیک با دامِ COU — blobِ واقعیِ روزبهروز" | tee -a "$OUT"
probe "(()=>{if(!window.__r421origCOU){window.__r421origCOU=URL.createObjectURL;window.__r421blobs=[];}URL.createObjectURL=(b)=>{window.__r421blobs.push(b);return window.__r421origCOU(b);};const btn=document.querySelector('[aria-label^=\"دانلود تقویم هفتهٔ پیشِ رو\"]');if(!btn)return 'NO-BTN';btn.click();return 'CLICKED-WEEK-AGENDA';})()" | tee -a "$OUT"
sleep 1
probe "(async()=>{const blobs=window.__r421blobs||[];if(!blobs.length)return 'NO-BLOB';const buf=await blobs[blobs.length-1].arrayBuffer();const text=new TextDecoder('utf-8',{ignoreBOM:true}).decode(buf);const lines=text.split('\r\n').filter((x)=>x);URL.createObjectURL=window.__r421origCOU;return JSON.stringify({bomFirst:text.charCodeAt(0)===0xFEFF,lineCount:lines.length,header:lines[0].slice(1),hasDayTotal:lines.some((l)=>l.startsWith('جمعِ روز')),hasAfterWeek:lines.some((l)=>l.startsWith('پس از هفته')),dayTotalCount:lines.filter((l)=>l.startsWith('جمعِ روز')).length,rows:lines.slice(1,6)});})()" | tee -a "$OUT"
probe "(()=>{const t=document.body.innerText||'';return JSON.stringify({toast:t.includes('تقویمِ هفتهٔ پیشِ رو ذخیره شد')});})()"
qa_shot r421-after-weekagenda-toast-light.png

echo "########## E) ماندگاری — reload → hydration → هر دو دکمه از استورِ آبشده" | tee -a "$OUT"
agent-browser eval "(()=>{location.reload();return 'RELOADING';})()" >/dev/null 2>&1
sleep 4
qa_wait_home || { agent-browser close >/dev/null 2>&1; exit 1; }
agent-browser eval "(()=>{window.dispatchEvent(new Event('open-report'));return 'OPENED';})()" >/dev/null 2>&1
sleep 2.5
probe "(()=>{const week=document.querySelector('[aria-label^=\"دانلود تقویم هفتهٔ پیشِ رو\"]');const all=document.querySelector('[aria-label^=\"دانلود تقویم مرور همهٔ تمرین‌ها\"]');const raw=JSON.parse(localStorage.getItem('vision2-study-v1')||'{\"state\":{}}').state;return JSON.stringify({weekBtnAfterReload:week?week.getAttribute('aria-label'):null,allBtnAfterReload:all?all.getAttribute('aria-label'):null,bankPersisted:!!(raw.drillMistakes&&raw.drillMistakes.verbs&&raw.drillMistakes.phonemes)});})()" | tee -a "$OUT"

echo "########## F) شاهدِ تاریکِ همه-بانکی — نوارِ خروجیها در دارک (پیشنهادِ ③ِ r421)" | tee -a "$OUT"
# گفت‌وگو (کارنامه) باز است — qa_to_dark بدونِ reload است (کلاسِ dark)؛ درسِ r414: پروب پس از qa_wait_home
qa_to_dark
sleep 1.5
probe "(()=>{const all=document.querySelector('[aria-label^=\"دانلود تقویم مرور همهٔ تمرین‌ها\"]');const week=document.querySelector('[aria-label^=\"دانلود تقویم هفتهٔ پیشِ رو\"]');const c=(el)=>el?getComputedStyle(el).color:null;const bg=(el)=>el?getComputedStyle(el).backgroundColor:null;return JSON.stringify({allBtnColor:all?c(all):null,allBtnBg:all?bg(all):null,weekBtnColor:week?c(week):null,toolbarCount:document.querySelectorAll('[aria-label^=\"دانلود\"]').length});})()"
qa_shot r421-toolbar-dark.png

echo "########## نتیجهٔ r421" | tee -a "$OUT"
agent-browser close >/dev/null 2>&1 || true
echo "DONE r421" | tee -a "$OUT"
