#!/usr/bin/env bash
# ------------------------------------------------------------------
# r419 — «ریتم، پیشِ ورود» — بیستوچهارمین مصرفکنندهٔ qa-lib.sh
#   و داوریِ زندهٔ چیپهایِ SRSِ میزبانها رویِ buildِ راند (تک سشن):
#   ① بذرِ نردبانِ r417 در RAWِ localStorage + رکوردِ drillStatsِ افعال:
#     یک سررسیدِ ساده (go)، دو درنفس (come با ok:1 — بازگشتِ فردا؛
#     see با ok:2 — بازگشتِ +۲)، یک مسلط (have)، یک تازهٔ امروزِ بیحق
#     (eat) → reload.
#   ② شاهدِ میزبان — بدونِ بازکردنِ معرفی: بنفشِ «۳ جلسه · بهترین ۷۰٪»
#     + زمردیِ فشردهٔ «۱ سررسید» + آسمانیِ فشردهٔ «۲ درنفس» — هر سه
#     کنارِ دکمهٔ «تمرین»، پیشِ ورود.
#   ③ معرفی: خانوادههایِ بزرگِ همان دو حقیقت (زمردیِ «در جلسهٔ بعد
#     پیشِ دست»، آسمانی با نزدیکترین بازگشت) — دو گویشِ یک خانواده.
#   ④ جلسهٔ فقطسررسید رویِ go با پاسخِ درستِ بانکمحور (نقشهٔ appendix
#     از bun — window.__verbAns) تا ok:1 بنشیند → بازگشت به میزبان:
#     زمردیِ میزبان غایب، آسمانیِ میزبان «۳ درنفس» — ریتم پیشِ ورود
#     بازشماری میشود؛ بنفش هم جلسهٔ نو را میشمارد.
#   ⑤ reload → hydration: هر سه چیپ از استورِ آبشده برمیگردند.
#   درسِ r414: هر پروبِ پسِ reload با qa_wait_home — بی آن اعتبار ندارد.
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
OUT=/tmp/r419-host-srs-chip-witness.txt
QA_SEED_FILE=/tmp/r419-seed-eval.js
: > "$OUT"

source /home/z/my-project/scripts/qa-lib.sh

click_by_label(){ agent-browser eval "(()=>{let b=document.querySelector('[aria-label=\"$1\"]');if(!b||b.getBoundingClientRect().width===0){b=[...document.querySelectorAll('button')].find((x)=>(x.innerText||'').replace(/\s+/g,' ').trim()==='$1'&&x.getBoundingClientRect().width>0);}if(!b)return 'NO-BTN:$1';b.click();return 'CLICKED:$1';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
probe(){ agent-browser eval "$1" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

nav_to_verbs(){
  click_by_label "ضمیمه"; sleep 2.5
  click_by_label "افعال بی‌قاعده"; sleep 2
}

# پروبِ سه چیپِ میزبان — بدونِ بازکردنِ معرفی (قلبِ داوریِ راند)
host_chips(){ probe "(()=>{const vio=document.querySelector('[aria-label^=\"پیشرفت این تمرین\"]');const due=document.querySelector('[aria-label^=\"سررسیدهای مرور این تمرین\"]');const grace=document.querySelector('[aria-label^=\"دورهٔ نفس این تمرین\"]');return JSON.stringify({violet:vio?vio.textContent:null,violetAria:vio?vio.getAttribute('aria-label'):null,due:due?due.textContent:null,dueAria:due?due.getAttribute('aria-label'):null,grace:grace?grace.textContent:null,graceAria:grace?grace.getAttribute('aria-label'):null});})()"; }

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

echo "########## B) بذرِ نردبان + رکوردِ میزبان → reload → میزبانِ افعال (پیشِ ورود)" | tee -a "$OUT"
probe "(()=>{const KEY='vision2-study-v1';const raw=JSON.parse(localStorage.getItem(KEY)||'{\"state\":{}}');const iso=(d)=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');const today=iso(new Date());const yesterday=iso(new Date(Date.now()-864e5));raw.state.drillStats={verbs:{sessions:3,correct:15,total:30,bestPercent:70,lastDay:yesterday}};raw.state.drillMistakes={verbs:{go:{wrong:2,ok:0,lastDay:yesterday,lastOkDay:''},come:{wrong:2,ok:1,lastDay:yesterday,lastOkDay:today},see:{wrong:3,ok:2,lastDay:'2026-10-01',lastOkDay:today},have:{wrong:1,ok:1,lastDay:yesterday,lastOkDay:yesterday},eat:{wrong:1,ok:0,lastDay:today,lastOkDay:''}}};localStorage.setItem(KEY,JSON.stringify(raw));location.reload();return 'SEEDED:'+today;})()" | tee -a "$OUT"
sleep 4
qa_wait_home || { agent-browser close >/dev/null 2>&1; exit 1; }
nav_to_verbs
echo "--- میزبان: هر سه چیپ کنارِ دکمهٔ «تمرین» — معرفی هنوز بسته است" | tee -a "$OUT"
host_chips
qa_shot r419-host-chips-light.png

echo "########## C) معرفی — خانوادههایِ بزرگِ همان دو حقیقت" | tee -a "$OUT"
click_by_label "شروع تمرین افعال بی‌قاعده"; sleep 1.5
probe "(()=>{const due=document.querySelector('[aria-label^=\"سررسیدهای مرور این تمرین\"]');const grace=document.querySelector('[aria-label^=\"دورهٔ نفس این تمرین\"]');return JSON.stringify({introDue:due?due.textContent:null,introGrace:grace?grace.textContent:null});})()"
qa_shot r419-intro-chips-light.png
click_by_label "بازگشت به جدول افعال از معرفی"; sleep 1.5

echo "########## D) جلسهٔ فقطسررسید رویِ go — پاسخِ درستِ بانکمحور" | tee -a "$OUT"
bun -e 'const {irregularVerbs}=require("/home/z/my-project/src/data/appendix.ts");const m={};for(const v of irregularVerbs){if(v.base)m[v.base]={fa:v.fa,past:v.past,pp:v.pp};if(v.past)m[v.past]={fa:v.fa,past:v.past,pp:v.pp};if(v.pp)m[v.pp]={fa:v.fa,past:v.past,pp:v.pp};}console.log("window.__verbAns="+JSON.stringify(m)+";\"MAP-OK:\"+Object.keys(window.__verbAns).length");' > /tmp/r419-verbmap.js || { echo "MAP-FAIL" | tee -a "$OUT"; agent-browser close >/dev/null 2>&1; exit 1; }
agent-browser eval "$(cat /tmp/r419-verbmap.js)" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"
click_by_label "شروع تمرین افعال بی‌قاعده"; sleep 1.5
click_by_label "تمرینِ سررسیدها (۱)"; sleep 1.5
probe "(()=>{const head=[...document.querySelectorAll('p')].find((x)=>/^سؤال /.test(x.innerText||''));return JSON.stringify({progress:head?head.innerText:''});})()"
probe "(()=>{const h=document.querySelector('h3');const prompt=h?(h.innerText||''):'';const m=prompt.match(/«([^»]+)»/);if(!m)return 'NO-TARGET';const A=window.__verbAns||{};const a=A[m[1]];if(!a)return 'MAP-MISS:'+m[1];let want;if(prompt.startsWith('معنیِ'))want=a.fa;else if(prompt.includes('گذشتهٔ سادهٔ'))want=a.past;else if(prompt.includes('p.p.'))want=a.pp;else want=m[1];const b=[...document.querySelectorAll('button')].find((x)=>{const l=(x.getAttribute('aria-label')||'').replace(/^گزینه [۱-۴]: /,'');return /^گزینه [۱-۴]: /.test(x.getAttribute('aria-label')||'')&&l===want&&x.getBoundingClientRect().width>0&&!x.disabled;});if(!b)return 'OPT-MISS:'+want;b.click();return 'ANSWERED:'+want;})()" | tee -a "$OUT"; echo | tee -a "$OUT"
sleep 0.5
click_by_label "دیدن نتیجهٔ تمرین"; sleep 1.5
probe "(()=>{const raw=JSON.parse(localStorage.getItem('vision2-study-v1')||'{\"state\":{}}').state;return JSON.stringify({go:raw.drillMistakes&&raw.drillMistakes.verbs?raw.drillMistakes.verbs.go:null});})()"
click_by_label "بازگشت به جدول افعال از نتیجه"; sleep 1.5
echo "--- میزبان پسِ خروج: زمردیِ غایب + آسمانیِ «۳ درنفس» + بنفشِ بازشماریشده" | tee -a "$OUT"
host_chips
qa_shot r419-host-after-exit-light.png

echo "########## E) ماندگاری — reload → hydration → هر سه چیپ از استورِ آبشده" | tee -a "$OUT"
agent-browser eval "(()=>{location.reload();return 'RELOADING';})()" >/dev/null 2>&1
sleep 4
qa_wait_home || { agent-browser close >/dev/null 2>&1; exit 1; }
nav_to_verbs
host_chips
probe "(()=>{const raw=JSON.parse(localStorage.getItem('vision2-study-v1')||'{\"state\":{}}').state;return JSON.stringify({bankPersisted:!!(raw.drillMistakes&&raw.drillMistakes.verbs&&Object.keys(raw.drillMistakes.verbs).length===5),statPersisted:!!(raw.drillStats&&raw.drillStats.verbs&&raw.drillStats.verbs.sessions===4)});})()"
qa_shot r419-host-after-reload-light.png

echo "########## نتیجهٔ r419" | tee -a "$OUT"
agent-browser close >/dev/null 2>&1 || true
echo "DONE r419" | tee -a "$OUT"
