#!/usr/bin/env bash
# ------------------------------------------------------------------
# r410 — «T در سطح‌های شنیدار» — پانزدهمین مصرفکنندهٔ qa-lib.sh و
#   داوریِ زندهٔ راند رویِ buildِ خودش (تک سشن، کلیدهایِ واقعیِ CDP):
#   ① فلش‌کارت — شاهدِ رفعِ باگ: کلیکِ چیپِ روخوانی دیگر کارت را
#     برنمی‌گرداند (پروبِ پیش از رفع: FLIPPED-AFTER-SPEAK-CLICK=true بود).
#   ② T در فلش‌کارت: چیپ به زمردِ playing میرود؛ Tِ دوم توقفِ خودِ چیپ؛
#     حینِ فلش‌کارت KeyT تم را عوض نمیکند (پرچمِ سطحِ شنیدار)؛ نشانگرِ
#     kbdِ زمردی در ردیفِ میانبرها.
#   ③ رهاسازی: خروج از فلش‌کارت، همان KeyT تم را عوض میکند — پس
#     سکوتِ قبل واقعاً از پرچم بود، نه خرابیِ کلید.
#   ④ جدولِ افعال — بی‌شنیده: KeyT تم را عوض میکند (کنترلِ صادقِ
#     بی‌هدف؛ r236) — بعد برمی‌گردانیم.
#   ⑤ شنیدنِ «go» (چیپ playing + راهنمای صادقِ T)؛ T توقفِ خودِ چیپ؛
#     شنیدنِ «gone»؛ T فقط همان را میگیرد (go زمرد میماند — هدفِ
#     آخرین شنیده).
#   ⑥ جست‌وجوی بی‌نتیجه: چیپها میروند — راهنمای T میپرد، T ساکت
#     (تهیِ صادقانهٔ هدف)؛ پاکِ جست‌وجو، شنیدنِ دوباره، خروج از زیرتاب —
#     T دوباره تم را عوض میکند (رهاسازیِ دوم).
#   ⑦ گروهِ «روخوانی با T» در راهنما (ثبتِ صادق) + شاتِ تاریکِ جدول.
#   درسِ راندهای پیشین: BUILD_ID تازه در HTMLِ سرویسشده، رجکسِ scoped،
#   و شاهدِ «پخش» stateِ چیپ است نه شمارندهٔ fetch (urlCache کور است).
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
OUT=/tmp/r410-witness.txt
QA_SEED_FILE=/tmp/r410-seed-eval.js
QA_REC=__qarec
: > "$OUT"

source /home/z/my-project/scripts/qa-lib.sh

click_by_label(){ agent-browser eval "(()=>{let b=document.querySelector('[aria-label=\"$1\"]');if(!b||b.getBoundingClientRect().width===0){b=[...document.querySelectorAll('button')].find((x)=>(x.innerText||'').replace(/\s+/g,' ').trim()==='$1'&&x.getBoundingClientRect().width>0);}if(!b)return 'NO-BTN:$1';b.click();return 'CLICKED:$1';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
probe(){ agent-browser eval "$1" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
kb(){ agent-browser press "$1" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; sleep 0.45; }
dark_q(){ agent-browser eval "(()=>document.documentElement.classList.contains('dark')?'DARK':'LIGHT')()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

echo "########## A) خانه — seed + روشنِ ۱۲۸۰ ##########" | tee -a "$OUT"
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
qa_ensure_alive

echo "########## B) فلش‌کارت — رفعِ باگِ فلیپ + T ##########" | tee -a "$OUT"
click_by_label "شروع یادگیری — درس اول"; sleep 2
click_by_label "حالت فلش‌کارت"; sleep 1.5
probe "(()=>{const c=document.querySelector('.flip-card');const sp=[...document.querySelectorAll('button')].find((b)=>b.title==='روخوانی با هوش مصنوعی');if(!c||!sp)return 'MISS';sp.click();return 'SPEAK-CLICKED flipped-before=true?'+c.classList.contains('flipped');})()"
sleep 1
probe "(()=>{const c=document.querySelector('.flip-card');const sp=[...document.querySelectorAll('button')].find((b)=>b.title==='روخوانی با هوش مصنوعی');return JSON.stringify({FLIPPED_AFTER_SPEAK_CLICK:c.classList.contains('flipped'),playing:sp.className.includes('bg-emerald-700')});})()"
qa_wait_toasts_clear
echo "-- T در فلش‌کارت: روخوانیِ کارت" | tee -a "$OUT"
kb "t"
sleep 0.8
probe "(()=>{const sp=[...document.querySelectorAll('button')].find((b)=>b.title==='روخوانی با هوش مصنوعی');const c=document.querySelector('.flip-card');return JSON.stringify({T_PLAYING:sp.className.includes('bg-emerald-700'),T_FLIPPED:c.classList.contains('flipped')});})()"
echo "-- حینِ فلش‌کارت، KeyT تم را عوض نمیکند (پرچمِ سطحِ شنیدار)" | tee -a "$OUT"
kb "t"
sleep 0.6
probe "(()=>{const sp=[...document.querySelectorAll('button')].find((b)=>b.title==='روخوانی با هوش مصنوعی');return JSON.stringify({T_STOPPED:!sp.className.includes('bg-emerald-700'),THEME_UNCHANGED:!document.documentElement.classList.contains('dark')});})()"
probe "(()=>{const k=[...document.querySelectorAll('kbd')].find((k)=>k.textContent==='T'&&k.className.includes('bg-emerald-50'));return 'KBD-T-HINT:'+!!k;})()"
qa_shot r410-flash-speaking-light.png
echo "-- رهاسازی: خروج از فلش‌کارت، T دوباره تم را عوض میکند" | tee -a "$OUT"
click_by_label "خروج"; sleep 1.5
kb "t"; sleep 0.8
dark_q
kb "t"; sleep 0.8
dark_q

echo "########## C) جدولِ افعال — بی‌شنیده: T تم را عوض میکند ##########" | tee -a "$OUT"
click_by_label "ضمیمه"; sleep 2.5
click_by_label "افعال بی‌قاعده"; sleep 2
probe "(()=>{const h=document.querySelector('[data-testid=verbs-t-hint]');return 'T-HINT-FRESH:'+(h?'ON':'OFF');})()"
kb "t"; sleep 0.8
dark_q
kb "t"; sleep 0.8
dark_q
echo "-- شنیدنِ «go» — پرچم روشن، راهنمایِ صادق ظاهر" | tee -a "$OUT"
probe "(()=>{const ch=[...document.querySelectorAll('td button')].find((b)=>b.getAttribute('aria-label')==='روخوانی متن انگلیسی'&&b.previousElementSibling&&b.previousElementSibling.textContent==='go');if(!ch)return 'NO-GO';ch.click();return 'GO-CLICKED';})()"
sleep 1.2
probe "(()=>{const ch=[...document.querySelectorAll('td button')].find((b)=>b.previousElementSibling&&b.previousElementSibling.textContent==='go');const h=document.querySelector('[data-testid=verbs-t-hint]');return JSON.stringify({GO_PLAYING:ch.className.includes('bg-emerald-700'),T_HINT:!!h});})()"
echo "-- T = توقفِ خودِ چیپِ go" | tee -a "$OUT"
kb "t"; sleep 0.6
probe "(()=>{const ch=[...document.querySelectorAll('td button')].find((b)=>b.previousElementSibling&&b.previousElementSibling.textContent==='go');return 'GO_AFTER_T:'+(ch.className.includes('bg-emerald-700')?'still-playing':'stopped');})()"
echo "-- شنیدنِ «gone» سپس T: فقط آخرین شنیده میگیرد (go زمرد میماند)" | tee -a "$OUT"
probe "(()=>{const ch=[...document.querySelectorAll('td button')].find((b)=>b.previousElementSibling&&b.previousElementSibling.textContent==='gone');if(!ch)return 'NO-GONE';ch.click();return 'GONE-CLICKED';})()"
sleep 1.2
kb "t"; sleep 0.6
probe "(()=>{const g=[...document.querySelectorAll('td button')].find((b)=>b.previousElementSibling&&b.previousElementSibling.textContent==='gone');const go=[...document.querySelectorAll('td button')].find((b)=>b.previousElementSibling&&b.previousElementSibling.textContent==='go');return JSON.stringify({GONE_STOPPED:!g.className.includes('bg-emerald-700'),GO_STILL_PLAYING:go.className.includes('bg-emerald-700')});})()"
qa_to_dark
qa_shot r410-verbs-t-hint-dark.png
qa_to_light
echo "-- جست‌وجوی بی‌نتیجه: هدفِ T صادقانه تهی — راهنما میپرد، T ساکت (تم عوض نمیشود؟! — کنترلِ واقعی)" | tee -a "$OUT"
probe "(()=>{const s=document.querySelector('input[aria-label=\"جست‌وجو در افعال بی‌قاعده\"]');const setter=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;setter.call(s,'zzzq');s.dispatchEvent(new Event('input',{bubbles:true}));return 'SEARCHED';})()"
sleep 1
probe "(()=>{const h=document.querySelector('[data-testid=verbs-t-hint]');return JSON.stringify({HINT_GONE:!h,ROWS_GONE:!document.querySelector('td button')});})()"
kb "t"; sleep 0.8
dark_q
echo "-- پاکِ جست‌وجو، خروج از زیرتاب — رهاسازیِ نهایی: T تم را عوض میکند" | tee -a "$OUT"
click_by_label "پاک‌کردن جست‌وجو"; sleep 1
click_by_label "جدول تلفظ (IPA)"; sleep 1.5
kb "t"; sleep 0.8
dark_q
kb "t"; sleep 0.8
dark_q

echo "########## D) راهنما — گروهِ «روخوانی با T» ##########" | tee -a "$OUT"
click_by_label "افعال بی‌قاعده"; sleep 1.5
kb "?"; sleep 1.2
probe "(()=>{const t=document.body.innerText||'';return JSON.stringify({GUIDE_T_GROUP:t.includes('روخوانی با T — سطح‌های شنیدار'),FLASH_ROW:t.includes('تا فلش‌کارت باز است، T مالِ آن است'),VERBS_ROW:t.includes('دوباره‌شنیدنِ آخرین فعلِ شنیده')});})()"
qa_shot r410-guide-t-group-light.png
kb "Escape"; sleep 1

echo "########## پایان — شمارندهها ##########" | tee -a "$OUT"
qa_rec
agent-browser close >/dev/null 2>&1 || true
echo "R410-WITNESS-DONE" | tee -a "$OUT"
