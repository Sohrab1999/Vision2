#!/usr/bin/env bash
# ------------------------------------------------------------------
# r417 — «شفافیتِ ریتم» — بیستودومین مصرفکنندهٔ qa-lib.sh
#   و داوریِ زندهٔ چیپِ آسمانیِ دورهٔ نفس رویِ buildِ راند (تک سشن):
#   ① بذرِ نردبانِ r416 در RAWِ localStorage: یک سررسیدِ ساده (go)،
#     دو درنفس (come با ok:1 — بازگشتِ فردا؛ see با ok:2 — بازگشتِ +۲)،
#     یک مسلط (have)، یک تازهٔ امروزِ بیحق (eat) → reload.
#   ② شاهدِ معرفی: چیپِ زمردی «۱ موردِ سررسید» (go) + چیپِ آسمانیِ نو
#     «۲ مورد در دورهٔ نفس — نزدیکترین بازگشت: فردا» (come نزدیکتر از see)
#     + رزگونِ «۵ ثبتشده» — سه حقیقتِ جدا در یک معرفی.
#   ③ جلسهٔ فقطسررسید رویِ go با پاسخِ درستِ بانکمحور (نقشهٔ appendix از
#     bun — window.__verbAns) تا ok:1 بنشیند.
#   ④ بانکِ پسِ جلسه: go → ok:1/lastOkDayِ امروز = به دورهٔ نفس میپیوندد؛
#     پسِ خروج: زمردی غایب، آسمانی «۳ مورد» — ردیف ناپدید نشد، نفس
#     میکشد (روایتِ راند). رزگونِ ۵ پابرجا.
#   ⑤ reload → hydration: بانکِ ۵ردیفی و چیپِ آسمانیِ ۳ از استورِ آبشده.
#   درسِ r414: هر پروبِ پسِ reload با qa_wait_home — بی آن اعتبار ندارد.
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
OUT=/tmp/r417-grace-chip-witness.txt
QA_SEED_FILE=/tmp/r417-seed-eval.js
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
probe "(()=>{const due=document.querySelector('[aria-label^=\"سررسیدهای مرور این تمرین\"]');const grace=document.querySelector('[aria-label^=\"دورهٔ نفس این تمرین\"]');const mis=document.querySelector('[aria-label^=\"بانک خطاهای این تمرین\"]');return JSON.stringify({dueChip:due?due.getAttribute('aria-label'):null,graceChip:grace?grace.getAttribute('aria-label'):null,graceText:grace?grace.textContent:null,mistakeChip:mis?mis.getAttribute('aria-label'):null});})()"
qa_shot r417-intro-gracechip-light.png

echo "########## C) جلسهٔ فقطسررسید رویِ go — پاسخِ درستِ بانکمحور" | tee -a "$OUT"
bun -e 'const {irregularVerbs}=require("/home/z/my-project/src/data/appendix.ts");const m={};for(const v of irregularVerbs){if(v.base)m[v.base]={fa:v.fa,past:v.past,pp:v.pp};if(v.past)m[v.past]={fa:v.fa,past:v.past,pp:v.pp};if(v.pp)m[v.pp]={fa:v.fa,past:v.past,pp:v.pp};}console.log("window.__verbAns="+JSON.stringify(m)+";\"MAP-OK:\"+Object.keys(window.__verbAns).length");' > /tmp/r417-verbmap.js || { echo "MAP-FAIL" | tee -a "$OUT"; agent-browser close >/dev/null 2>&1; exit 1; }
agent-browser eval "$(cat /tmp/r417-verbmap.js)" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"
click_by_label "تمرینِ سررسیدها (۱)"; sleep 1.5
probe "(()=>{const head=[...document.querySelectorAll('p')].find((x)=>/^سؤال /.test(x.innerText||''));return JSON.stringify({progress:head?head.innerText:''});})()"
qa_shot r417-run-duesession-light.png
probe "(()=>{const h=document.querySelector('h3');const prompt=h?(h.innerText||''):'';const m=prompt.match(/«([^»]+)»/);if(!m)return 'NO-TARGET';const A=window.__verbAns||{};const a=A[m[1]];if(!a)return 'MAP-MISS:'+m[1];let want;if(prompt.startsWith('معنیِ'))want=a.fa;else if(prompt.includes('گذشتهٔ سادهٔ'))want=a.past;else if(prompt.includes('p.p.'))want=a.pp;else want=m[1];const b=[...document.querySelectorAll('button')].find((x)=>{const l=(x.getAttribute('aria-label')||'').replace(/^گزینه [۱-۴]: /,'');return /^گزینه [۱-۴]: /.test(x.getAttribute('aria-label')||'')&&l===want&&x.getBoundingClientRect().width>0&&!x.disabled;});if(!b)return 'OPT-MISS:'+want;b.click();return 'ANSWERED:'+want;})()" | tee -a "$OUT"; echo | tee -a "$OUT"
sleep 0.5
click_by_label "دیدن نتیجهٔ تمرین"; sleep 1.5
probe "(()=>{const t=document.body.innerText||'';const m=t.match(/([۰-۹]+) درست از ([۰-۹]+)/);return JSON.stringify({result:t.includes('نتیجهٔ تمرین'),score:m?m[0]:null});})()"
qa_shot r417-result-duesession-light.png

echo "########## D) بانکِ پسِ جلسه — go به دورهٔ نفس پیوست؛ چیپها پسِ خروج" | tee -a "$OUT"
probe "(()=>{const raw=JSON.parse(localStorage.getItem('vision2-study-v1')||'{\"state\":{}}').state;return JSON.stringify({go:raw.drillMistakes&&raw.drillMistakes.verbs?raw.drillMistakes.verbs.go:null});})()"
click_by_label "بازگشت به جدول افعال از نتیجه"; sleep 1.5
click_by_label "شروع تمرین افعال بی‌قاعده"; sleep 1.5
probe "(()=>{const due=document.querySelector('[aria-label^=\"سررسیدهای مرور این تمرین\"]');const grace=document.querySelector('[aria-label^=\"دورهٔ نفس این تمرین\"]');return JSON.stringify({dueChipAfter:due?due.getAttribute('aria-label'):null,graceChipAfter:grace?grace.getAttribute('aria-label'):null,graceTextAfter:grace?grace.textContent:null});})()"
qa_shot r417-after-exit-grace3-light.png

echo "########## E) ماندگاری — reload → hydration" | tee -a "$OUT"
agent-browser eval "(()=>{location.reload();return 'RELOADING';})()" >/dev/null 2>&1
sleep 4
qa_wait_home || { agent-browser close >/dev/null 2>&1; exit 1; }
nav_to_verbs
click_by_label "شروع تمرین افعال بی‌قاعده"; sleep 1.5
probe "(()=>{const grace=document.querySelector('[aria-label^=\"دورهٔ نفس این تمرین\"]');const raw=JSON.parse(localStorage.getItem('vision2-study-v1')||'{\"state\":{}}').state;return JSON.stringify({graceChipAfterReload:grace?grace.getAttribute('aria-label'):null,bankPersisted:!!(raw.drillMistakes&&raw.drillMistakes.verbs&&Object.keys(raw.drillMistakes.verbs).length===5)});})()"

echo "########## نتیجهٔ r417" | tee -a "$OUT"
agent-browser close >/dev/null 2>&1 || true
echo "DONE r417" | tee -a "$OUT"
