#!/usr/bin/env bash
# ------------------------------------------------------------------
# r400 — «تمرین افعال بی‌قاعده» — پنجمین مصرفکنندهٔ qa-lib.sh و داوریِ
#   زندهٔ ویژگیِ دریلِ ضمیمه رویِ buildِ راند (تک سشن):
#   ① مسیرِ ورود: خانه → ضمیمه → زیرتبِ «افعال بی‌قاعده» → دکمهٔ «تمرین»
#     کنارِ جدول — جدول پابرجا، لنگرِ عمیق دستنخورده.
#   ② جلسهٔ کامل: ۱۰ پرسش × ۴ گزینه؛ بازخوردِ درجا؛ «بعدی» تا نتیجه.
#   ③ نتیجهٔ صادق: درصدِ فارسی (aria-label «نمرهٔ») + بازخوانیِ ۱۰سطری.
#   ④ تمرینِ دوباره → پرسشِ تازه؛ شاتِ پرسش در تمِ تاریک؛ «انصراف» به جدول.
#   درسِ revive (r395/r397): بازگشاییِ مرورگر state را تا خانه میبُرد —
#   پس هر بخش ناوبریِ کاملِ خودش را دارد (idempotent از هر حالتی —
#   سرصفحه همیشه زنده است).
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
OUT=/tmp/r400-drill-witness.txt
QA_SEED_FILE=/tmp/r400-seed-eval.js
QA_REC=__qarec
: > "$OUT"

source /home/z/my-project/scripts/qa-lib.sh

# کلیکِ اتمیک: نخست aria-label، وگرنه innerTextِ نرمالشده (الگوی r398؛
# درسِ r397 — selector با نقلقولِ JS)
click_by_label(){ agent-browser eval "(()=>{let b=document.querySelector('[aria-label=\"$1\"]');if(!b||b.getBoundingClientRect().width===0){b=[...document.querySelectorAll('button')].find((x)=>(x.innerText||'').replace(/\s+/g,' ').trim()==='$1'&&x.getBoundingClientRect().width>0);}if(!b)return 'NO-BTN:$1';b.click();return 'CLICKED:$1';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
probe(){ agent-browser eval "$1" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
answer_first(){ agent-browser eval "(()=>{const b=[...document.querySelectorAll('button')].find((x)=>/^گزینه [۱-۴]: /.test(x.getAttribute('aria-label')||'')&&x.getBoundingClientRect().width>0&&!x.disabled);if(!b)return 'NO-OPT';b.click();return 'ANSWERED';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

# ناوبریِ کاملِ idempotent: از هر حالتی (حتی پسِ revive) تا جلسهٔ در حالِ اجرا
nav_to_drill_run(){
  click_by_label "ضمیمه"; sleep 2.5
  click_by_label "افعال بی‌قاعده"; sleep 2
  click_by_label "شروع تمرین افعال بی‌قاعده"; sleep 1.5
  click_by_label "شروع جلسهٔ تمرین فعل"; sleep 1.5
  probe "(()=>{const t=document.body.innerText||'';return JSON.stringify({q1:t.includes('سؤال ۱ از ۱۰'),opts:document.querySelectorAll('[aria-label^=\"گزینه \"]').length});})()"
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

echo "########## B) ضمیمه → زیرتبِ افعال → دکمهٔ «تمرین» → معرفی" | tee -a "$OUT"
qa_ensure_alive || { agent-browser close >/dev/null 2>&1; exit 1; }
click_by_label "ضمیمه"; sleep 2.5
click_by_label "افعال بی‌قاعده"; sleep 2
probe "(()=>{const t=document.body.innerText||'';return JSON.stringify({tableLive:!!document.querySelector('input[placeholder^="جست‌وجو"]'),drillBtn:!!document.querySelector('[aria-label="شروع تمرین افعال بی‌قاعده"]')});})()"
click_by_label "شروع تمرین افعال بی‌قاعده"; sleep 1.5
probe "(()=>{const t=document.body.innerText||'';return JSON.stringify({drillIntro:t.includes('شروع تمرین')&&t.includes('جدول افعال'),tableGone:!t.includes('جست‌وجو: انگلیسی یا فارسی…')});})()"
qa_shot r400-drill-intro-light.png

echo "########## C) جلسهٔ کامل — ۱۰ پرسش، پاسخِ گزینهٔ نخست، نتیجهٔ صادق" | tee -a "$OUT"
qa_ensure_alive || { agent-browser close >/dev/null 2>&1; exit 1; }
nav_to_drill_run
for i in 1 2 3 4 5 6 7 8 9; do
  answer_first >/dev/null 2>&1
  sleep 0.6
  click_by_label "سؤال بعدی" >/dev/null 2>&1
  sleep 0.4
done
answer_first >/dev/null 2>&1
sleep 0.6
click_by_label "دیدن نتیجهٔ تمرین"
sleep 1.5
probe "(()=>{const t=document.body.innerText||'';const rows=document.querySelectorAll('[aria-label=\"بازخوانی سؤال‌های تمرین\"] > li').length;const sc=document.querySelector('[aria-label^=\"نمرهٔ\"]');return JSON.stringify({result:t.includes('نتیجهٔ تمرین'),reviewRows:rows,score:sc?sc.getAttribute('aria-label'):null});})()"
qa_shot r400-drill-result-light.png

echo "########## D) تمرینِ دوباره → پرسشِ تازه در تمِ تاریک + بازگشتِ انصراف" | tee -a "$OUT"
qa_ensure_alive || { agent-browser close >/dev/null 2>&1; exit 1; }
nav_to_drill_run >/dev/null 2>&1
for i in 1 2 3 4 5 6 7 8 9; do answer_first >/dev/null 2>&1; sleep 0.5; click_by_label "سؤال بعدی" >/dev/null 2>&1; sleep 0.3; done
answer_first >/dev/null 2>&1; sleep 0.5
click_by_label "دیدن نتیجهٔ تمرین" >/dev/null 2>&1
sleep 1.2
click_by_label "تمرین دوباره"
sleep 1.5
probe "(()=>{const t=document.body.innerText||'';return JSON.stringify({freshQ:t.includes('سؤال ۱ از ۱۰'),opts:document.querySelectorAll('[aria-label^=\"گزینه \"]').length});})()"
qa_to_dark
sleep 1.2
qa_shot r400-drill-question-dark.png
qa_to_light
click_by_label "انصراف از تمرین"
sleep 1.2
probe "(()=>{return JSON.stringify({backToTable:!!document.querySelector('input[placeholder^=\"جست‌وجو\"]'),drillBtnBack:!!document.querySelector('[aria-label=\"شروع تمرین افعال بی‌قاعده\"]'),drillGone:!document.body.innerText.includes('سؤال ۱ از ۱۰')});})()"

echo "########## نتیجهٔ r400" | tee -a "$OUT"
agent-browser close >/dev/null 2>&1 || true
echo "DONE r400" | tee -a "$OUT"
