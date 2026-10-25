#!/usr/bin/env bash
# ------------------------------------------------------------------
# r413 — «بانکِ خطایِ ماندگارِ دریلها» — هجدهمین مصرفکنندهٔ qa-lib.sh و
#   داوریِ زندهٔ بانکِ خطا رویِ buildِ راند (تک سشن):
#   ① شاهدِ صفرِ صادق: پیش از هر جلسه، چیپِ رزگونِ بانکِ خطا در معرفی
#     وجود ندارد و drillMistakes در RAWِ localStorage نیست.
#   ② جلسهٔ کامل: ۱۰ پرسش × گزینهٔ نخست (نادرستهایِ واقعیِ همان جلسه —
#     شمارش از خودِ صفحهٔ نتیجه خوانده میشود، نه از فرض).
#   ③ رکورد: چیپِ رزگونِ «N موردِ خطای ثبتشده» در معرفی + چیپِ پیشرفتِ
#     r412 پابرجا + drillMistakes.verbs در RAWِ localStorage («vision2-study-v1»)
#     — شاهدِ مستقیمِ سفرِ ردیفِ سیویکمِ SyncField. کلیدها باید از
#     بانکِ افعال باشند (هیچ پایهٔ ساختهشدهای نیست).
#   ④ ماندگاری: reload → چیپِ خطا با همان شمارش از hydration پابرجا.
#   درسِ r412 (نوشتهشده در سربرگِ اسکریپتِ خودش): پسِ نوشتنِ رکورد،
#   هیچ ensure_aliveای (که revive + reseed دارد) زده نمیشود — زنجیرهٔ
#   شاهدهایِ پسازرکورد بی‌وقفه در همان سشن زنده میرود.
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
OUT=/tmp/r413-drill-mistakes-witness.txt
QA_SEED_FILE=/tmp/r413-seed-eval.js
QA_REC=__qarec
: > "$OUT"

source /home/z/my-project/scripts/qa-lib.sh

click_by_label(){ agent-browser eval "(()=>{let b=document.querySelector('[aria-label=\"$1\"]');if(!b||b.getBoundingClientRect().width===0){b=[...document.querySelectorAll('button')].find((x)=>(x.innerText||'').replace(/\s+/g,' ').trim()==='$1'&&x.getBoundingClientRect().width>0);}if(!b)return 'NO-BTN:$1';b.click();return 'CLICKED:$1';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
probe(){ agent-browser eval "$1" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
answer_first(){ agent-browser eval "(()=>{const b=[...document.querySelectorAll('button')].find((x)=>/^گزینه [۱-۴]: /.test(x.getAttribute('aria-label')||'')&&x.getBoundingClientRect().width>0&&!x.disabled);if(!b)return 'NO-OPT';b.click();return 'ANSWERED';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

# ناوبریِ idempotent: خانه → ضمیمه → زیرتبِ افعال (تا جدولِ زنده) — درسِ r400
nav_to_verbs(){
  click_by_label "ضمیمه"; sleep 2.5
  click_by_label "افعال بی‌قاعده"; sleep 2
}
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

echo "########## B) ضمیمه → افعال — شاهدِ صفرِ صادق (بی خطا، بی چیپِ رزگون)" | tee -a "$OUT"
qa_ensure_alive || { agent-browser close >/dev/null 2>&1; exit 1; }
nav_to_verbs
probe "(()=>{const raw=JSON.parse(localStorage.getItem('vision2-study-v1')||'{\"state\":{}}').state;const chip=document.querySelector('[aria-label^=\"بانک خطاهای این تمرین\"]');return JSON.stringify({honestZero:!chip,rawDrillMistakes:raw.drillMistakes||null});})()"
click_by_label "شروع تمرین افعال بی‌قاعده"; sleep 1.5
probe "(()=>{return JSON.stringify({introNoMistakeChip:!document.querySelector('[aria-label^=\"بانک خطاهای این تمرین\"]'),introLive:document.body.innerText.includes('شروع تمرین')});})()"

echo "########## C) جلسهٔ کامل — ۱۰ پرسش، گزینهٔ نخست؛ نادرستها از خودِ نتیجه" | tee -a "$OUT"
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
probe "(()=>{const t=document.body.innerText||'';const m=t.match(/([۰-۹]+) درست از ([۰-۹]+)/);return JSON.stringify({result:t.includes('نتیجهٔ تمرین'),score:m?m[0]:null});})()"
qa_shot r413-drill-result-light.png

echo "########## D) رکوردِ خطا — چیپِ رزگونِ معرفی + RAWِ localStorage + چیپِ پیشرفتِ r412" | tee -a "$OUT"
# درسِ r412: پسِ این نقطه هیچ reviveای — زنجیره در همین سشن زنده میرود
click_by_label "بازگشت به جدول افعال از نتیجه"; sleep 1.5
click_by_label "شروع تمرین افعال بی‌قاعده"; sleep 1.5
probe "(()=>{const chip=document.querySelector('[aria-label^=\"بانک خطاهای این تمرین\"]');const raw=JSON.parse(localStorage.getItem('vision2-study-v1')||'{\"state\":{}}').state;const stat=document.querySelector('[aria-label^=\"پیشرفت این تمرین\"]');return JSON.stringify({mistakeChip:chip?chip.getAttribute('aria-label'):null,mistakeText:chip?chip.innerText.replace(/\\s+/g,' ').trim():null,statChip:stat?stat.getAttribute('aria-label'):null,rawVerbs:raw.drillMistakes&&raw.drillMistakes.verbs?raw.drillMistakes.verbs:null});})()"
qa_shot r413-intro-mistakes-light.png

echo "########## E) ماندگاری — reload → hydration → چیپِ خطا با همان شمارش" | tee -a "$OUT"
# شمارشِ پیش از reload در خروجیِ همین پروب ثبت میشود (window پسِ reload میمُرد —
# مقایسه با ردیفِ chipAfterReload در همین لاگ انجام میگیرد)
probe "(()=>{const c=document.querySelector('[aria-label^=\"بانک خطاهای این تمرین\"]');return JSON.stringify({savedBeforeReload:c?c.getAttribute('aria-label'):null});})()"
agent-browser eval "(()=>{location.reload();return 'RELOADING';})()" >/dev/null 2>&1
sleep 4
qa_wait_home || { agent-browser close >/dev/null 2>&1; exit 1; }
nav_to_verbs
click_by_label "شروع تمرین افعال بی‌قاعده"; sleep 1.5
probe "(()=>{const chip=document.querySelector('[aria-label^=\"بانک خطاهای این تمرین\"]');const raw=JSON.parse(localStorage.getItem('vision2-study-v1')||'{\"state\":{}}').state;return JSON.stringify({chipAfterReload:chip?chip.getAttribute('aria-label'):null,persisted:!!(raw.drillMistakes&&raw.drillMistakes.verbs&&Object.keys(raw.drillMistakes.verbs).length>0)});})()"

echo "########## نتیجهٔ r413" | tee -a "$OUT"
agent-browser close >/dev/null 2>&1 || true
echo "DONE r413" | tee -a "$OUT"
