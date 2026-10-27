#!/usr/bin/env bash
# ------------------------------------------------------------------
# r415 — «تمرینِ سررسیدها» — بیستمین مصرفکنندهٔ qa-lib.sh و داوریِ زندهٔ
#   جلسهٔ فقطسررسید رویِ buildِ راند (تک سشن):
#   ① بذرِ دستیِ بانکِ خطا در RAWِ localStorage (پسِ seedِ persona، پیشِ
#     هر جلسه): سه سررسید (go wrong:۳ / come wrong:۲ / see wrong:۱ —
#     اشتباهِ دیروز)، یک مسلطدهنده (have)، یک تازهٔ امروز (eat) → reload.
#   ② شاهدِ معرفی: چیپِ زمردیِ «۳ موردِ سررسید» + رزگونِ «۵ موردِ خطای
#     ثبتشده» + دکمهٔ نوِ «تمرینِ سررسیدها (۳)» — هر سه با عددهای صادق.
#   ③ جلسهٔ فقطسررسید: طولِ صادق «سؤال ۱ از ۳» و پرسشها به ترتیبِ
#     اولویت (go → come → see — بانکِ کامل وارد جلسه نمیشود).
#   ④ جلسهٔ کامل با گزینهٔ نخست → نتیجهٔ صادق → RAWِ بانک گزارش میشود؛
#     چیپها پسِ خروج: سررسیدِ صفر (همهٔ سررسیدها امروز پاسخ داده شدند —
#     درست ok میگیرد، نادرست lastDayِ امروز) و ردیفها ماندگار؛ دکمهٔ
#     تمرینِ سررسیدها صادقانه غایب.
#   ⑤ reload → hydration: بانکِ ۵ردیفی میماند، چیپ/دکمه سررسید تهی.
#   درسِ r414: هر پروبِ پسِ reload با qa_wait_home — بی آن اعتبار ندارد.
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
OUT=/tmp/r415-mistake-session-witness.txt
QA_SEED_FILE=/tmp/r415-seed-eval.js
: > "$OUT"

source /home/z/my-project/scripts/qa-lib.sh

click_by_label(){ agent-browser eval "(()=>{let b=document.querySelector('[aria-label=\"$1\"]');if(!b||b.getBoundingClientRect().width===0){b=[...document.querySelectorAll('button')].find((x)=>(x.innerText||'').replace(/\s+/g,' ').trim()==='$1'&&x.getBoundingClientRect().width>0);}if(!b)return 'NO-BTN:$1';b.click();return 'CLICKED:$1';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
probe(){ agent-browser eval "$1" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
answer_first(){ agent-browser eval "(()=>{const b=[...document.querySelectorAll('button')].find((x)=>/^گزینه [۱-۴]: /.test(x.getAttribute('aria-label')||'')&&x.getBoundingClientRect().width>0&&!x.disabled);if(!b)return 'NO-OPT';b.click();return 'ANSWERED';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

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

echo "########## B) بذرِ بانکِ خطا (۳ سررسید + ۱ مسلط + ۱ تازهٔ امروز) + reload" | tee -a "$OUT"
probe "(()=>{const KEY='vision2-study-v1';const raw=JSON.parse(localStorage.getItem(KEY)||'{\"state\":{}}');const iso=(d)=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');const today=iso(new Date());const yesterday=iso(new Date(Date.now()-864e5));raw.state.drillMistakes={verbs:{go:{wrong:3,ok:0,lastDay:yesterday,lastOkDay:''},come:{wrong:2,ok:0,lastDay:yesterday,lastOkDay:''},see:{wrong:1,ok:0,lastDay:yesterday,lastOkDay:''},have:{wrong:1,ok:1,lastDay:yesterday,lastOkDay:yesterday},eat:{wrong:1,ok:0,lastDay:today,lastOkDay:''}}};localStorage.setItem(KEY,JSON.stringify(raw));location.reload();return 'SEEDED:'+today;})()" | tee -a "$OUT"
sleep 4
qa_wait_home || { agent-browser close >/dev/null 2>&1; exit 1; }
nav_to_verbs
click_by_label "شروع تمرین افعال بی‌قاعده"; sleep 1.5
probe "(()=>{const due=document.querySelector('[aria-label^=\"سررسیدهای مرور این تمرین\"]');const mis=document.querySelector('[aria-label^=\"بانک خطاهای این تمرین\"]');const btn=[...document.querySelectorAll('button')].find((x)=>/شروع جلسهٔ تمرین فقط از سررسیدها/.test(x.getAttribute('aria-label')||''));return JSON.stringify({dueChip:due?due.getAttribute('aria-label'):null,mistakeChip:mis?mis.getAttribute('aria-label'):null,mistakeBtn:btn?btn.getAttribute('aria-label'):null,btnText:btn?(btn.innerText||'').replace(/\\s+/g,' '):null});})()"
qa_shot r415-intro-mistake-light.png

echo "########## C) جلسهٔ فقطسررسید — طولِ صادق ۳ و اولویتِ go→come→see" | tee -a "$OUT"
click_by_label "تمرینِ سررسیدها (۳)"; sleep 1.5
probe "(()=>{const head=[...document.querySelectorAll('p')].find((x)=>/^سؤال /.test(x.innerText||''));const h=document.querySelector('h3');return JSON.stringify({progress:head?head.innerText:'',q1:h?h.innerText.replace(/\\s+/g,' ').slice(0,80):'',hasGo:h?h.innerText.includes('go'):false});})()"
qa_shot r415-run-duesession-light.png
for i in 1 2 3; do
  answer_first >/dev/null 2>&1
  sleep 0.5
  if [ "$i" -lt 3 ]; then
    click_by_label "سؤال بعدی" >/dev/null 2>&1
    probe "(()=>{const head=[...document.querySelectorAll('p')].find((x)=>/^سؤال /.test(x.innerText||''));const h=document.querySelector('h3');return JSON.stringify({q$((i+1)):h?h.innerText.replace(/\\s+/g,' ').slice(0,60):'',progress:head?head.innerText:''});})()"
  else
    click_by_label "دیدن نتیجهٔ تمرین" >/dev/null 2>&1
  fi
  sleep 0.3
done
sleep 1.5
probe "(()=>{const t=document.body.innerText||'';const m=t.match(/([۰-۹]+) درست از ([۰-۹]+)/);const opts=[...document.querySelectorAll('li')].filter((x)=>x.className.includes('rounded-xl')).length;return JSON.stringify({result:t.includes('نتیجهٔ تمرین'),score:m?m[0]:null,rows:opts});})()"
qa_shot r415-result-duesession-light.png

echo "########## D) بانک پسِ جلسه — رخدادهایِ واقعی در RAW؛ چیپها پسِ خروج" | tee -a "$OUT"
probe "(()=>{const raw=JSON.parse(localStorage.getItem('vision2-study-v1')||'{\"state\":{}}').state;return JSON.stringify({rawVerbs:raw.drillMistakes&&raw.drillMistakes.verbs?raw.drillMistakes.verbs:null,sessions:raw.drillStats&&raw.drillStats.verbs?raw.drillStats.verbs.sessions:null});})()"
click_by_label "بازگشت به جدول افعال از نتیجه"; sleep 1.5
click_by_label "شروع تمرین افعال بی‌قاعده"; sleep 1.5
probe "(()=>{const due=document.querySelector('[aria-label^=\"سررسیدهای مرور این تمرین\"]');const mis=document.querySelector('[aria-label^=\"بانک خطاهای این تمرین\"]');const btn=[...document.querySelectorAll('button')].find((x)=>/شروع جلسهٔ تمرین فقط از سررسیدها/.test(x.getAttribute('aria-label')||''));return JSON.stringify({dueChipAfter:due?due.getAttribute('aria-label'):null,mistakeChipAfter:mis?mis.getAttribute('aria-label'):null,mistakeBtnAfter:btn?btn.getAttribute('aria-label'):null});})()"

echo "########## E) ماندگاری — reload → hydration" | tee -a "$OUT"
agent-browser eval "(()=>{location.reload();return 'RELOADING';})()" >/dev/null 2>&1
sleep 4
qa_wait_home || { agent-browser close >/dev/null 2>&1; exit 1; }
nav_to_verbs
click_by_label "شروع تمرین افعال بی‌قاعده"; sleep 1.5
probe "(()=>{const due=document.querySelector('[aria-label^=\"سررسیدهای مرور این تمرین\"]');const mis=document.querySelector('[aria-label^=\"بانک خطاهای این تمرین\"]');const raw=JSON.parse(localStorage.getItem('vision2-study-v1')||'{\"state\":{}}').state;return JSON.stringify({dueChipAfterReload:due?due.getAttribute('aria-label'):null,mistakeChipAfterReload:mis?mis.getAttribute('aria-label'):null,bankPersisted:!!(raw.drillMistakes&&raw.drillMistakes.verbs&&Object.keys(raw.drillMistakes.verbs).length===5)});})()"

echo "########## نتیجهٔ r415" | tee -a "$OUT"
agent-browser close >/dev/null 2>&1 || true
echo "DONE r415" | tee -a "$OUT"
