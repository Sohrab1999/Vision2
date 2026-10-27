#!/usr/bin/env bash
# ------------------------------------------------------------------
# r418 — «صادرِ تقویمِ مرور» — بیستوسومین مصرفکنندهٔ qa-lib.sh
#   و داوریِ زندهٔ دکمهٔ «تقویمِ مرور (CSV)» رویِ buildِ راند (تک سشن):
#   ① بذرِ نردبانِ r417 در RAWِ localStorage: یک سررسیدِ ساده (go)،
#     دو درنفس (come با ok:1 — بازگشتِ فردا؛ see با ok:2 — بازگشتِ +۲)،
#     یک مسلط (have)، یک تازهٔ امروزِ بیحق (eat) → reload.
#   ② شاهدِ معرفی: سه چیپ (رزگونِ ۵ / زمردیِ ۱ / آسمانیِ ۲) + دکمهٔ نوِ
#     «تقویمِ مرور (CSV)» با ariaِ دوحقیقتی (۱ سررسید و ۲ درنفس).
#   ③ کلیکِ دکمه با دامِ COU — blobِ واقعیِ دانلود گرفته میشود؛ محتوای
#     زندهٔ CSV خوانده میشود (درسِ r401: arrayBuffer + ignoreBOM —
#     blob.text() جوابِ BOM را میبلعد): BOM در سرِ بایتها + سرصفحهٔ
#     ۹ستونی + ترتیبِ SRS (سررسیدها به اولویت، درنفسها به نزدیکترین)
#     + معنیِ میزبان + غیبتِ صادقِ مسلط/تازهٔ امروز.
#   ④ toastِ موفقیتِ خودگویش + بازگرداندنِ COU (پاکسازیِ دام).
#   ⑤ reload → hydration: بانکِ ۵ردیفی و دکمه همچنان زنده.
#   درسِ r414: هر پروبِ پسِ reload با qa_wait_home — بی آن اعتبار ندارد.
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
OUT=/tmp/r418-calendar-witness.txt
QA_SEED_FILE=/tmp/r418-seed-eval.js
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

echo "########## B) بذرِ نردبان (۱ سررسید + ۲ درنفس + ۱ مسلط + ۱ تازهٔ بیحق) + reload" | tee -a "$OUT"
probe "(()=>{const KEY='vision2-study-v1';const raw=JSON.parse(localStorage.getItem(KEY)||'{\"state\":{}}');const iso=(d)=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');const today=iso(new Date());const yesterday=iso(new Date(Date.now()-864e5));raw.state.drillMistakes={verbs:{go:{wrong:2,ok:0,lastDay:yesterday,lastOkDay:''},come:{wrong:2,ok:1,lastDay:yesterday,lastOkDay:today},see:{wrong:3,ok:2,lastDay:'2026-10-01',lastOkDay:today},have:{wrong:1,ok:1,lastDay:yesterday,lastOkDay:yesterday},eat:{wrong:1,ok:0,lastDay:today,lastOkDay:''}}};localStorage.setItem(KEY,JSON.stringify(raw));location.reload();return 'SEEDED:'+today;})()" | tee -a "$OUT"
sleep 4
qa_wait_home || { agent-browser close >/dev/null 2>&1; exit 1; }
nav_to_verbs
click_by_label "شروع تمرین افعال بی‌قاعده"; sleep 1.5
probe "(()=>{const due=document.querySelector('[aria-label^=\"سررسیدهای مرور این تمرین\"]');const grace=document.querySelector('[aria-label^=\"دورهٔ نفس این تمرین\"]');const mis=document.querySelector('[aria-label^=\"بانک خطاهای این تمرین\"]');const cal=document.querySelector('[aria-label^=\"دانلود تقویم مرور این تمرین\"]');return JSON.stringify({dueChip:due?due.getAttribute('aria-label'):null,graceChip:grace?grace.getAttribute('aria-label'):null,mistakeChip:mis?mis.getAttribute('aria-label'):null,calendarBtn:cal?cal.getAttribute('aria-label'):null,calendarText:cal?cal.textContent:null});})()"
qa_shot r418-intro-calendar-light.png

echo "########## C) کلیکِ تقویم با دامِ COU — محتوایِ زندهٔ CSV" | tee -a "$OUT"
probe "(()=>{if(!window.__r418origCOU){window.__r418origCOU=URL.createObjectURL;window.__r418blobs=[];}URL.createObjectURL=(b)=>{window.__r418blobs.push(b);return window.__r418origCOU(b);};const btn=[...document.querySelectorAll('button')].find((x)=>(x.innerText||'').includes('تقویمِ مرور')&&x.getBoundingClientRect().width>0);if(!btn)return 'NO-BTN';btn.click();return 'CLICKED-CALENDAR';})()" | tee -a "$OUT"
sleep 1
probe "(async()=>{const blobs=window.__r418blobs||[];if(!blobs.length)return 'NO-BLOB';const buf=await blobs[blobs.length-1].arrayBuffer();const text=new TextDecoder('utf-8',{ignoreBOM:true}).decode(buf);const lines=text.split('\r\n').filter((x)=>x);URL.createObjectURL=window.__r418origCOU;return JSON.stringify({bomFirst:text.charCodeAt(0)===0xFEFF,lineCount:lines.length,header:lines[0],rows:lines.slice(1)});})()" | tee -a "$OUT"
probe "(()=>{const t=document.body.innerText||'';return JSON.stringify({toast:t.includes('تقویم مرور ذخیره شد')});})()"
qa_shot r418-after-calendar-toast-light.png

echo "########## D) ماندگاری — reload → hydration" | tee -a "$OUT"
agent-browser eval "(()=>{location.reload();return 'RELOADING';})()" >/dev/null 2>&1
sleep 4
qa_wait_home || { agent-browser close >/dev/null 2>&1; exit 1; }
nav_to_verbs
click_by_label "شروع تمرین افعال بی‌قاعده"; sleep 1.5
probe "(()=>{const cal=document.querySelector('[aria-label^=\"دانلود تقویم مرور این تمرین\"]');const raw=JSON.parse(localStorage.getItem('vision2-study-v1')||'{\"state\":{}}').state;return JSON.stringify({calendarBtnAfterReload:cal?cal.getAttribute('aria-label'):null,bankPersisted:!!(raw.drillMistakes&&raw.drillMistakes.verbs&&Object.keys(raw.drillMistakes.verbs).length===5)});})()"
qa_shot r418-intro-after-reload-light.png

echo "########## نتیجهٔ r418" | tee -a "$OUT"
agent-browser close >/dev/null 2>&1 || true
echo "DONE r418" | tee -a "$OUT"
