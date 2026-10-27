#!/usr/bin/env bash
# ------------------------------------------------------------------
# r414 — «SRSِ دریل» — نوزدهمین مصرفکنندهٔ qa-lib.sh و داوریِ زندهٔ
#   حلقهٔ سررسید رویِ buildِ راند (تک سشن):
#   ① بذرِ دستیِ بانکِ خطا در RAWِ localStorage (پسِ seedِ persona، پیشِ
#     هر جلسه): چهار سررسید (go/come/see/run — اشتباهِ دیروز)، یک
#     مسلطدهنده (have: ok=wrong)، یک تازهٔ امروز (eat) → reload → hydration.
#   ② شاهدِ چیپها: زمردیِ «۴ موردِ سررسید» (مسلط و تازهٔ امروز صادقانه
#     بیرون) + رزگونِ «۶ موردِ خطای ثبتشده» (همهٔ ردیفها) — دو حقیقتِ جدا.
#   ③ شاهدِ سهمیه: پرسشِ ۱..۴ جلسه سررسیدها به ترتیبِ اولویتاند
#     (پرامپتِ go/come و run — گونهٔ base لنگرِ گذشته را نشان میدهد).
#   ④ جلسهٔ کامل با گزینهٔ نخست → نتیجهٔ صادق → RAWِ بانک (ok/lastOkDayِ
#     درستها، wrong/lastDayِ نادرستها) گزارش میشود؛ چیپها پسِ خروج
#     بازخوانی و بعد از reload با hydration مقایسه میشوند.
#   درسِ r412: پسِ نوشتنِ رکورد، هیچ reviveای — زنجیره در همین سشن.
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
OUT=/tmp/r414-drill-srs-witness.txt
QA_SEED_FILE=/tmp/r414-seed-eval.js
QA_REC=__qarec
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

echo "########## B) بذرِ بانکِ خطا (۴ سررسید + ۱ مسلط + ۱ تازهٔ امروز) + reload" | tee -a "$OUT"
probe "(()=>{const KEY='vision2-study-v1';const raw=JSON.parse(localStorage.getItem(KEY)||'{\"state\":{}}');const iso=(d)=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');const today=iso(new Date());const yd=new Date(Date.now()-864e5);const yesterday=iso(yd);raw.state.drillMistakes={verbs:{go:{wrong:3,ok:0,lastDay:yesterday,lastOkDay:''},come:{wrong:2,ok:0,lastDay:yesterday,lastOkDay:''},see:{wrong:1,ok:0,lastDay:yesterday,lastOkDay:''},run:{wrong:1,ok:0,lastDay:yesterday,lastOkDay:''},have:{wrong:1,ok:1,lastDay:yesterday,lastOkDay:yesterday},eat:{wrong:1,ok:0,lastDay:today,lastOkDay:''}}};localStorage.setItem(KEY,JSON.stringify(raw));location.reload();return 'SEEDED:'+today;})()" | tee -a "$OUT"
sleep 4
qa_wait_home || { agent-browser close >/dev/null 2>&1; exit 1; }
nav_to_verbs
click_by_label "شروع تمرین افعال بی‌قاعده"; sleep 1.5
probe "(()=>{const due=document.querySelector('[aria-label^=\"سررسیدهای مرور این تمرین\"]');const mis=document.querySelector('[aria-label^=\"بانک خطاهای این تمرین\"]');return JSON.stringify({dueChip:due?due.getAttribute('aria-label'):null,mistakeChip:mis?mis.getAttribute('aria-label'):null});})()"
qa_shot r414-intro-due-light.png

echo "########## C) سهمیهٔ سررسید — چهار پرسشِ نخست به ترتیبِ اولویت" | tee -a "$OUT"
click_by_label "شروع جلسهٔ تمرین فعل"; sleep 1.5
probe "(()=>{const h=document.querySelector('h3');const t=h?h.innerText.replace(/\\s+/g,' '):'';return JSON.stringify({q1:t.slice(0,80),hasGo:t.includes('go'),hasCome:t.includes('come')});})()"
probe "(()=>{const btn=[...document.querySelectorAll('button')].find((x)=>/^گزینه [۱-۴]: /.test(x.getAttribute('aria-label')||''));if(!btn)return 'NO-OPT';btn.click();const h=document.body.innerText;return 'ANSWERED';})()" >/dev/null 2>&1
click_by_label "سؤال بعدی" >/dev/null 2>&1; sleep 0.5
probe "(()=>{const h=document.querySelector('h3');const t=h?h.innerText.replace(/\\s+/g,' '):'';return JSON.stringify({q2:t.slice(0,80)});})()"
for i in 1 2 3 4 5 6 7 8; do
  answer_first >/dev/null 2>&1
  sleep 0.5
  click_by_label "سؤال بعدی" >/dev/null 2>&1
  sleep 0.3
done
answer_first >/dev/null 2>&1
sleep 0.5
click_by_label "دیدن نتیجهٔ تمرین"
sleep 1.5
probe "(()=>{const t=document.body.innerText||'';const m=t.match(/([۰-۹]+) درست از ([۰-۹]+)/);return JSON.stringify({result:t.includes('نتیجهٔ تمرین'),score:m?m[0]:null});})()"
qa_shot r414-result-light.png

echo "########## D) بانک پسِ جلسه — okها و wrongها در RAW؛ چیپها پسِ خروج" | tee -a "$OUT"
probe "(()=>{const raw=JSON.parse(localStorage.getItem('vision2-study-v1')||'{\"state\":{}}').state;return JSON.stringify({rawVerbs:raw.drillMistakes&&raw.drillMistakes.verbs?raw.drillMistakes.verbs:null});})()"
click_by_label "بازگشت به جدول افعال از نتیجه"; sleep 1.5
click_by_label "شروع تمرین افعال بی‌قاعده"; sleep 1.5
probe "(()=>{const due=document.querySelector('[aria-label^=\"سررسیدهای مرور این تمرین\"]');const mis=document.querySelector('[aria-label^=\"بانک خطاهای این تمرین\"]');return JSON.stringify({dueChipAfter:due?due.getAttribute('aria-label'):null,mistakeChipAfter:mis?mis.getAttribute('aria-label'):null});})()"

echo "########## E) ماندگاری — reload → hydration" | tee -a "$OUT"
agent-browser eval "(()=>{location.reload();return 'RELOADING';})()" >/dev/null 2>&1
sleep 4
qa_wait_home || { agent-browser close >/dev/null 2>&1; exit 1; }
nav_to_verbs
click_by_label "شروع تمرین افعال بی‌قاعده"; sleep 1.5
probe "(()=>{const due=document.querySelector('[aria-label^=\"سررسیدهای مرور این تمرین\"]');const raw=JSON.parse(localStorage.getItem('vision2-study-v1')||'{\"state\":{}}').state;return JSON.stringify({dueChipAfterReload:due?due.getAttribute('aria-label'):null,bankPersisted:!!(raw.drillMistakes&&raw.drillMistakes.verbs&&Object.keys(raw.drillMistakes.verbs).length===6)});})()"

echo "########## نتیجهٔ r414" | tee -a "$OUT"
agent-browser close >/dev/null 2>&1 || true
echo "DONE r414" | tee -a "$OUT"
