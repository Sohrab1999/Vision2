#!/usr/bin/env bash
# ------------------------------------------------------------------
# r422 — «نوارِ هفتهٔ پیشِ رو» — بیستوهفتمین مصرفکنندهٔ qa-lib.sh
#   داوریِ زندهٔ روایتِ r421 در خودِ نما (پیشنهادِ ②ِ r421) رویِ
#   buildِ راند (تک سشن):
#   ① بذرِ نردبان در RAWِ localStorage: verbs (go سررسید / come
#     درنفسِ grace1 / see درنفسِ grace2 / have مسلط / run درنفسِ
#     grace8 — پس از هفته) → reload.
#   ② کارنامه (open-report): نوارِ هفتخانهای — «امروز» با شمارِ
#     زمردی، «فردا» و روزِ هفته با شمارِ آسمانی، چهار خانهٔ ساکتِ
#     صادق («—») + دنبالهٔ «+۱ پس از هفته» + ariaِ جمع.
#   ③ شاهدِ تاریکِ نوار: کرنلهایِ emerald/sky در گویشِ خانه (عینِ
#     r414/r417) — زنده با getComputedStyle.
#   ④ reload → hydration: نوار از استورِ آبشده برمیگردد.
#   درسِ r414: هر پروبِ پسِ reload با qa_wait_home — بی آن اعتبار ندارد.
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
OUT=/tmp/r422-week-strip-witness.txt
QA_SEED_FILE=/tmp/r422-seed-eval.js
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

echo "########## C) کارنامه — نوارِ هفتهٔ پیشِ رو (روشن)" | tee -a "$OUT"
agent-browser eval "(()=>{window.dispatchEvent(new Event('open-report'));return 'OPENED';})()" >/dev/null 2>&1
sleep 2.5
probe "(()=>{const el=document.querySelector('[aria-label^=\"هفتهٔ پیشِ رو —\"]');if(!el)return 'NO-STRIP';const cells=[...el.querySelectorAll('[title]')].map((c)=>c.textContent+'|'+c.getAttribute('title'));const bg=(c)=>c?getComputedStyle(c).backgroundColor:null;const tx=(c)=>c?getComputedStyle(c).color:null;const today=el.querySelector('[title^=\"امروز\"]');const tomorrow=el.querySelector('[title^=\"فردا\"]');return JSON.stringify({aria:el.getAttribute('aria-label'),cellCount:cells.length,cells:cells.slice(0,5),todayBg:bg(today),todayText:tx(today),tomorrowBg:bg(tomorrow)});})()"
qa_shot r422-week-strip-light.png

echo "########## D) شاهدِ تاریکِ نوار — کرنلهایِ emerald/sky در خانهها" | tee -a "$OUT"
qa_to_dark
sleep 1.5
probe "(()=>{const el=document.querySelector('[aria-label^=\"هفتهٔ پیشِ رو —\"]');if(!el)return 'NO-STRIP';const bg=(c)=>c?getComputedStyle(c).backgroundColor:null;const tx=(c)=>c?getComputedStyle(c).color:null;const today=el.querySelector('[title^=\"امروز\"]');const tomorrow=el.querySelector('[title^=\"فردا\"]');return JSON.stringify({darkTodayBg:bg(today),darkTodayText:tx(today),darkTomorrowBg:bg(tomorrow),darkTomorrowText:tx(tomorrow)});})()"
qa_shot r422-week-strip-dark.png

echo "########## E) ماندگاری — reload → hydration → نوار از استورِ آبشده" | tee -a "$OUT"
agent-browser eval "(()=>{location.reload();return 'RELOADING';})()" >/dev/null 2>&1
sleep 4
qa_wait_home || { agent-browser close >/dev/null 2>&1; exit 1; }
agent-browser eval "(()=>{window.dispatchEvent(new Event('open-report'));return 'OPENED';})()" >/dev/null 2>&1
sleep 2.5
probe "(()=>{const el=document.querySelector('[aria-label^=\"هفتهٔ پیشِ رو —\"]');const raw=JSON.parse(localStorage.getItem('vision2-study-v1')||'{\"state\":{}}').state;return JSON.stringify({stripAfterReload:el?el.getAttribute('aria-label'):null,bankPersisted:!!(raw.drillMistakes&&raw.drillMistakes.verbs)});})()" | tee -a "$OUT"

echo "########## نتیجهٔ r422" | tee -a "$OUT"
agent-browser close >/dev/null 2>&1 || true
echo "DONE r422" | tee -a "$OUT"
