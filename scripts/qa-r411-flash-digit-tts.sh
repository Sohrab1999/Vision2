#!/usr/bin/env bash
# ------------------------------------------------------------------
# r411 — «گاردِ ارقامِ فلش‌کارت و T در آخرین سطح‌های شنیدار» —
#   شانزدهمین مصرفکنندهٔ qa-lib.sh و داوریِ زندهٔ راند رویِ buildِ خودش
#   (تک سشن):
#   ① فلش‌کارت — گاردِ ارقام: رقمِ ۲ حینِ مرور، تب را نمیبُرد
#     (کلاسِ حفرهٔ r407 که r409 برایِ دریل بست — اینک فلش‌کارت)؛
#     جراحیِ پابرجا: KeyD حینِ فلش‌کارت هنوز ناوبری میکند.
#   ② کنترل: بیِ فلش‌کارت، رقمِ ۲ واقعاً تبِ مکالمه را باز میکند.
#   ③ جدولِ تلفظ — بی‌شنیده: T تم را عوض میکند (کنترلِ صادقِ r236).
#   ④ شنیدنِ واکِ æ («cat, black»): چیپ playing + راهنمای صادقِ T؛
#     T توقفِ خودِ چیپ؛ Tِ سوم دوبارهخوانی.
#   ⑤ جست‌وجو که چیپ را میبرد: راهنما میپرد، T به پوسته برمی‌گردد
#     (تهیِ صادقانهٔ هدف — عینِ جدولِ افعالِ r410).
#   ⑥ واژهٔ روز — بی‌شنیده: T تم را عوض میکند؛ شنیدنِ واژه با چیپِ
#     اصلی: playing + راهنمای T؛ T توقف/دوبارهخوانی.
#   ⑦ راهنما: گروهِ «روخوانی با T» چهار سطح را ثبت میکند + ردیفِ
#     ارقامِ «در درس‌ها» سکوتِ حینِ فلش‌کارت را مینویسد.
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
OUT=/tmp/r411-witness.txt
QA_SEED_FILE=/tmp/r411-seed-eval.js
QA_REC=__qarec
: > "$OUT"

source /home/z/my-project/scripts/qa-lib.sh

click_by_label(){ agent-browser eval "(()=>{let b=document.querySelector('[aria-label=\"$1\"]');if(!b||b.getBoundingClientRect().width===0){b=[...document.querySelectorAll('button')].find((x)=>(x.innerText||'').replace(/\s+/g,' ').trim()==='$1'&&x.getBoundingClientRect().width>0);}if(!b)return 'NO-BTN:$1';b.click();return 'CLICKED:$1';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
probe(){ agent-browser eval "$1" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
kb(){ agent-browser press "$1" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; sleep 0.45; }
dark_q(){ agent-browser eval "(()=>document.documentElement.classList.contains('dark')?'DARK':'LIGHT')()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
sel_tab(){ probe "(()=>document.querySelector('[role=tab][aria-selected=true]')?.textContent||'NO-TAB')()"; }
# r411 — درسِ راندهایِ پیشین پخته شد: شاهدِ «پخش» stateِ چیپ است — ولی
# واکشیِ TTS در این محیط ۲-۳ثانیهای است؛ پروبِ ثانیهای حالتِ loading را
# میبیند. وضعیت تا پایداری پول میشود (تا ۸ثانیه): PLAY/IDLE/STUCK.
await_state(){ local FINDER="$1" WANT="$2"; for i in $(seq 1 16); do local R=$(agent-browser eval "(()=>{const ch=$FINDER;if(!ch)return 'GONE';return ch.className.includes('bg-emerald-700')?'PLAYING':'IDLE';})()" 2>/dev/null); [[ "$R" == *"$WANT"* ]] && { echo "$WANT-STABLE(i=$i)" | tee -a "$OUT"; echo | tee -a "$OUT"; return 0; }; sleep 0.5; done; echo "STUCK-want=$WANT last=$R" | tee -a "$OUT"; echo | tee -a "$OUT"; return 1; }

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

echo "########## B) فلش‌کارت — گاردِ ارقام + جراحیِ پابرجا ##########" | tee -a "$OUT"
click_by_label "شروع یادگیری — درس اول"; sleep 2
click_by_label "حالت فلش‌کارت"; sleep 1.5
probe "(()=>{const c=document.querySelector('.flip-card');return 'FLASHCARD-OPEN:'+!!c;})()"
echo "-- رقمِ ۲ حینِ فلش‌کارت: هیچ — مرور نمیبُرد" | tee -a "$OUT"
kb "2"
sleep 1
probe "(()=>{const c=document.querySelector('.flip-card');return JSON.stringify({FLIP_CARD_STILL:!!c});})()"
sel_tab
echo "-- جراحیِ پابرجا: KeyD حینِ فلش‌کارت هنوز ناوبری میکند" | tee -a "$OUT"
kb "d"
sleep 1.5
probe "(()=>{const h=document.body.innerText||'';return JSON.stringify({DICT_OPEN:h.includes('دیکشنری واژگان'),FLIP_CARD_GONE:!document.querySelector('.flip-card')});})()"
echo "-- بازگشت: خانه ← درس ← فلش‌کارت؛ خروج؛ کنترلِ رقمِ ۲" | tee -a "$OUT"
kb "h"; sleep 1.5
click_by_label "شروع یادگیری — درس اول"; sleep 2
click_by_label "حالت فلش‌کارت"; sleep 1.5
click_by_label "خروج"; sleep 1.5
probe "(()=>{const c=document.querySelector('.flip-card');return 'AFTER-EXIT-FLIP-GONE:'+(!c);})()"
kb "2"
sleep 1
probe "(()=>{const t=document.body.innerText||'';return JSON.stringify({CONV_OPEN:t.includes('مکالمه')||!!document.querySelector('[aria-label*=پخش]'),FLIP_STILL_GONE:!document.querySelector('.flip-card')});})()"
sel_tab

echo "########## C) جدولِ تلفظ — T آخرین واکِ شنیده ##########" | tee -a "$OUT"
click_by_label "ضمیمه"; sleep 2.5
click_by_label "جدول تلفظ (IPA)"; sleep 2
probe "(()=>{const h=document.querySelector('[data-testid=phonetics-t-hint]');return 'T-HINT-FRESH:'+(h?'ON':'OFF');})()"
echo "-- بی‌شنیده: T تم را عوض میکند (کنترلِ صادق — r236)" | tee -a "$OUT"
kb "t"; sleep 0.8
dark_q
kb "t"; sleep 0.8
dark_q
echo "-- شنیدنِ واکِ æ («cat, black»)" | tee -a "$OUT"
probe "(()=>{const ch=[...document.querySelectorAll('button')].find((b)=>b.getAttribute('aria-label')==='روخوانی متن انگلیسی'&&b.previousElementSibling&&b.previousElementSibling.textContent==='cat, black');if(!ch)return 'NO-AE';ch.click();return 'AE-CLICKED';})()"
AE="[...document.querySelectorAll('button')].find((b)=>b.previousElementSibling&&b.previousElementSibling.textContent==='cat, black')"
await_state "$AE" PLAYING
probe "(()=>{const h=document.querySelector('[data-testid=phonetics-t-hint]');return 'T-HINT:'+(h?'ON':'OFF');})()"
echo "-- T = توقفِ خودِ چیپ (پول تا idle)؛ Tِ سوم = دوبارهخوانی (پول تا playingِ دوم)" | tee -a "$OUT"
kb "t"
await_state "$AE" IDLE
kb "t"
await_state "$AE" PLAYING
qa_to_dark
qa_shot r411-phonetics-t-hint-dark.png
qa_to_light
echo "-- جست‌وجو که چیپِ æ را میبرد: هدفِ T صادقانه تهی — T به پوسته برمی‌گردد" | tee -a "$OUT"
probe "(()=>{const s=document.querySelector('input[aria-label=\"جست‌وجو در جدول تلفظ\"]');const setter=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;setter.call(s,'arm');s.dispatchEvent(new Event('input',{bubbles:true}));return 'SEARCHED';})()"
sleep 1
probe "(()=>{const h=document.querySelector('[data-testid=phonetics-t-hint]');const gone=!([...document.querySelectorAll('button')].some((b)=>b.previousElementSibling&&b.previousElementSibling.textContent==='cat, black'));return JSON.stringify({HINT_GONE:!h,AE_GONE:gone});})()"
kb "t"; sleep 0.8
dark_q
kb "t"; sleep 0.8
dark_q

echo "########## D) واژهٔ روز — T آخرین شنیدهٔ خانه ##########" | tee -a "$OUT"
kb "h"; sleep 1.5
probe "(()=>{const s=document.querySelector('section[aria-label=\"واژهٔ امروز\"]');const h=document.querySelector('[data-testid=wotd-t-hint]');return JSON.stringify({WOTD_HERE:!!s,T_HINT_FRESH:!!h});})()"
echo "-- بی‌شنیده: T تم را عوض میکند (کنترلِ صادق)" | tee -a "$OUT"
kb "t"; sleep 0.8
dark_q
kb "t"; sleep 0.8
dark_q
echo "-- شنیدنِ واژهٔ روز با چیپِ اصلی" | tee -a "$OUT"
probe "(()=>{const ch=document.querySelector('section[aria-label=\"واژهٔ امروز\"] button[title=\"روخوانی با هوش مصنوعی\"]');if(!ch)return 'NO-WOTD-CHIP';ch.click();return 'WOTD-CLICKED';})()"
WT="document.querySelector('section[aria-label=\"واژهٔ امروز\"] button[title=\"روخوانی با هوش مصنوعی\"]')"
await_state "$WT" PLAYING
probe "(()=>{const h=document.querySelector('[data-testid=wotd-t-hint]');return 'WOTD-T-HINT:'+(h?'ON':'OFF');})()"
echo "-- T = توقف؛ Tِ سوم = دوبارهخوانی؛ Tِ چهارم = توقفِ نهایی" | tee -a "$OUT"
kb "t"
await_state "$WT" IDLE
kb "t"
await_state "$WT" PLAYING
kb "t"
await_state "$WT" IDLE
qa_shot r411-wotd-t-hint-light.png

echo "########## E) راهنما — ثبتِ صادقِ چهار سطح و گاردِ ارقام ##########" | tee -a "$OUT"
kb "?"; sleep 1.2
probe "(()=>{const t=document.body.innerText||'';return JSON.stringify({T_GROUP:t.includes('روخوانی با T — سطح‌های شنیدار'),PHON_ROW:t.includes('دوباره‌شنیدنِ آخرین واکِ شنیده'),WOTD_ROW:t.includes('واژهٔ روز (خانه): دوباره‌شنیدنِ واژهٔ روز'),DIGIT_ROW:t.includes('تا فلش‌کارت باز است خاموش')});})()"
qa_shot r411-guide-rows-light.png
kb "Escape"; sleep 1

echo "########## پایان — شمارندهها ##########" | tee -a "$OUT"
qa_rec
agent-browser close >/dev/null 2>&1 || true
echo "R411-WITNESS-DONE" | tee -a "$OUT"
