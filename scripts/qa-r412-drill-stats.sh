#!/usr/bin/env bash
# ------------------------------------------------------------------
# r412 — «دریلها واردِ استور میشوند» — هفدهمین مصرفکنندهٔ qa-lib.sh و
#   داوریِ زندهٔ ماندگاریِ پیشرفتِ تمرین رویِ buildِ راند (تک سشن):
#   ① شاهدِ صفرِ صادق: پیش از هر جلسه، چیپِ میزبان و خطِ معرفی وجود
#     ندارند و رکوردی در localStorage نیست.
#   ② جلسهٔ کامل: ۱۰ پرسش × گزینهٔ نخست → نتیجهٔ صادق.
#   ③ رکورد: چیپِ میزبان «۱ جلسه · بهترین X٪» کنارِ دکمهٔ «تمرین» +
#     خطِ معرفی؛ dayStat.quizzes دقیقاً +۱؛ drillStats در RAWِ
#     localStorage («vision2-study-v1») — شاهدِ مستقیمِ سفرِ SyncField.
#   ④ ماندگاری: reload → چیپ پابرجا (همان رکورد از hydration).
#   درسِ revive (r395/r397): هر بخش ناوبریِ کاملِ خودش را دارد.
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
OUT=/tmp/r412-drill-stats-witness.txt
QA_SEED_FILE=/tmp/r412-seed-eval.js
QA_REC=__qarec
: > "$OUT"

source /home/z/my-project/scripts/qa-lib.sh

click_by_label(){ agent-browser eval "(()=>{let b=document.querySelector('[aria-label=\"$1\"]');if(!b||b.getBoundingClientRect().width===0){b=[...document.querySelectorAll('button')].find((x)=>(x.innerText||'').replace(/\s+/g,' ').trim()==='$1'&&x.getBoundingClientRect().width>0);}if(!b)return 'NO-BTN:$1';b.click();return 'CLICKED:$1';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
probe(){ agent-browser eval "$1" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
answer_first(){ agent-browser eval "(()=>{const b=[...document.querySelectorAll('button')].find((x)=>/^گزینه [۱-۴]: /.test(x.getAttribute('aria-label')||'')&&x.getBoundingClientRect().width>0&&!x.disabled);if(!b)return 'NO-OPT';b.click();return 'ANSWERED';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

# ناوبریِ idempotent: خانه → ضمیمه → زیرتبِ افعال (تا جدولِ زنده)
nav_to_verbs(){
  click_by_label "ضمیمه"; sleep 2.5
  click_by_label "افعال بی‌قاعده"; sleep 2
}
# درسِ r400: هر بخش ناوبریِ کاملِ خودش را دارد — revive هرگز جلسه را نجات نمیدهد
nav_full_run(){
  nav_to_verbs
  click_by_label "شروع تمرین افعال بی‌قاعده"; sleep 1.5
  click_by_label "شروع جلسهٔ تمرین فعل"; sleep 1.5
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

echo "########## B) ضمیمه → افعال — شاهدِ صفرِ صادق (بی رکورد، بی چیپ)" | tee -a "$OUT"
qa_ensure_alive || { agent-browser close >/dev/null 2>&1; exit 1; }
nav_to_verbs
probe "(()=>{const raw=JSON.parse(localStorage.getItem('vision2-study-v1')||'{\"state\":{}}').state;window.__q12quizzes=(raw.dayStat&&raw.dayStat.quizzes)||0;const chip=document.querySelector('[aria-label^=\"پیشرفت این تمرین\"]');return JSON.stringify({honestZero:!chip,rawDrillStats:raw.drillStats||null,beforeQuizzes:window.__q12quizzes});})()"
click_by_label "شروع تمرین افعال بی‌قاعده"; sleep 1.5
probe "(()=>{return JSON.stringify({introNoClaim:!document.querySelector('[aria-label^=\"پیشرفت این تمرین\"]'),introLive:document.body.innerText.includes('شروع تمرین')});})()"
click_by_label "شروع جلسهٔ تمرین فعل"; sleep 1.5

echo "########## C) جلسهٔ کامل — ۱۰ پرسش، گزینهٔ نخست، نتیجهٔ صادق" | tee -a "$OUT"
qa_ensure_alive || { agent-browser close >/dev/null 2>&1; exit 1; }
nav_full_run
for i in 1 2 3 4 5 6 7 8 9; do
  answer_first >/dev/null 2>&1
  sleep 0.5
  click_by_label "سؤال بعدی" >/dev/null 2>&1
  sleep 0.3
done
answer_first >/dev/null 2>&1
sleep 0.5
click_by_label "دیدن نتیجهٔ تمرین"
sleep 1.5
probe "(()=>{const t=document.body.innerText||'';return JSON.stringify({result:t.includes('نتیجهٔ تمرین')});})()"
qa_shot r412-drill-result-light.png

echo "########## D) رکورد — چیپِ میزبان + خطِ معرفی + RAWِ localStorage + فعالیتِ روز" | tee -a "$OUT"
# درسِ این راند: revive + reseedِ persona کلِ vision2-study-v1 را بازنویسی
# میکند — پس از نوشتنِ رکورد، هیچ ensure_aliveای (که revive دارد) زده
# نمیشود؛ زنجیرهٔ شاهدها بی‌وقفه در همان سشن زنده میرود.
click_by_label "بازگشت به جدول افعال از نتیجه"; sleep 1.5
probe "(()=>{const chip=document.querySelector('[aria-label^=\"پیشرفت این تمرین\"]');const raw=JSON.parse(localStorage.getItem('vision2-study-v1')||'{\"state\":{}}').state;return JSON.stringify({hostChip:chip?chip.getAttribute('aria-label'):null,chipText:chip?chip.innerText.replace(/\s+/g,' ').trim():null,rawVerbs:raw.drillStats&&raw.drillStats.verbs?raw.drillStats.verbs:null,quizzesDelta:((raw.dayStat&&raw.dayStat.quizzes)||0)-window.__q12quizzes});})()"
click_by_label "شروع تمرین افعال بی‌قاعده"; sleep 1.5
probe "(()=>{const line=document.querySelector('[aria-label^=\"پیشرفت این تمرین\"]');return JSON.stringify({introLine:line?line.getAttribute('aria-label'):null,introText:line?line.innerText.replace(/\s+/g,' ').trim():null});})()"
qa_shot r412-intro-stat-light.png

echo "########## E) ماندگاری — reload → hydration → چیپِ همان رکورد" | tee -a "$OUT"
# reload بذر نمیزند (persona از راندِ A در localStorage زنده است) —
# اپ پسِ hydration همان drillStats را از رکوردِ SyncField برمیگرداند.
agent-browser eval "(()=>{location.reload();return 'RELOADING';})()" >/dev/null 2>&1
sleep 4
qa_wait_home || { agent-browser close >/dev/null 2>&1; exit 1; }
nav_to_verbs
probe "(()=>{const chip=document.querySelector('[aria-label^=\"پیشرفت این تمرین\"]');const raw=JSON.parse(localStorage.getItem('vision2-study-v1')||'{\"state\":{}}').state;return JSON.stringify({chipAfterReload:chip?chip.getAttribute('aria-label'):null,rawVerbsAfterReload:raw.drillStats&&raw.drillStats.verbs?raw.drillStats.verbs:null});})()"

echo "########## نتیجهٔ r412" | tee -a "$OUT"
agent-browser close >/dev/null 2>&1 || true
echo "DONE r412" | tee -a "$OUT"
