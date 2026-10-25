#!/usr/bin/env bash
# ------------------------------------------------------------------
# r409 — «میانبرِ T و خاموشیِ حروفِ سراسری» — چهاردهمین مصرفکنندهٔ
#   qa-lib.sh و داوریِ زندهٔ راند رویِ buildِ خودش (تک سشن، کلیدهایِ
#   واقعیِ CDP):
#   ① ورود: ضمیمه → افعال بی‌قاعده → تمرین → شروعِ جلسه.
#   ② T روخوانیِ هدف است: شمارندهٔ TTS (qa_tts_count_on) با T بالا
#     میرود، چیپِ سربرگ به زمردِ playing میرود و Tِ دوم توقفِ خودِ چیپ
#     است — استِ روخوانی نزدِ مالک.
#   ③ گاردِ حینِ جلسه: KeyD هیچ ناوبری نمیکند (جلسهٔ در حالِ پاسخ
#     میمانَد)؛ «؟» راهنما را باز میکند (بالایِ گارد) و Escape میبندد —
#     جلسه سالم.
#   ④ گونهٔ بیچیپ (سؤال ۳ = شکلِ ساده): T ساکت — شمارنده ثابت، چیپ نیست.
#   ⑤ جلسهٔ تمامکیبورد تا نتیجهٔ صادق؛ مرورِ اشتباهها با Tِ زنده (شمارنده
#     دوم بالا میرود) تا «نتیجهٔ مرور».
#   ⑥ کنترلِ رهاسازیِ گارد: پسِ خروج از دریل، همان KeyD به دیکشنری
#     میرود — یعنی سکوتِ بخشِ قبل واقعاً از گاردِ راند بود.
#   ⑦ گاردِ ارقامِ درس: دریلِ واژگانِ درسِ ۱ — رقمِ ۲ حینِ جلسه تب را
#     عوض نمیکند (حفرهٔ r407 بسته شد) و پسِ انصراف همان رقم میبُرد.
#   ⑧ پرسش با نشانگرِ kbdِ T در تمِ تاریک.
#   درسِ r407: رجکسِ نمره به کارتِ نتیجه scope میشود. درسِ revive:
#   هر بخش ناوبریِ idempotent خودش را دارد.
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
OUT=/tmp/r409-witness.txt
QA_SEED_FILE=/tmp/r409-seed-eval.js
QA_REC=__qarec
: > "$OUT"

source /home/z/my-project/scripts/qa-lib.sh

click_by_label(){ agent-browser eval "(()=>{let b=document.querySelector('[aria-label=\"$1\"]');if(!b||b.getBoundingClientRect().width===0){b=[...document.querySelectorAll('button')].find((x)=>(x.innerText||'').replace(/\s+/g,' ').trim()==='$1'&&x.getBoundingClientRect().width>0);}if(!b)return 'NO-BTN:$1';b.click();return 'CLICKED:$1';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
probe(){ agent-browser eval "$1" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
kb(){ agent-browser press "$1" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; sleep 0.45; }
tts_count(){ agent-browser eval "(()=>{return 'TTS-COUNT:' + ((window.__qarec && window.__qarec.tts) || 0);})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
next_state(){ agent-browser eval "(()=>{const t=document.body.innerText||'';const m=t.match(/سؤال \S+ از \S+/);const h3=document.querySelector('h3');const chip=h3&&h3.querySelector('.en-text');const hint=[...((h3&&h3.querySelectorAll('span[aria-hidden]'))||[])].find((el)=>el.textContent==='T');const spk=document.querySelector('h3 button[aria-label=\"روخوانی متن انگلیسی\"]');return JSON.stringify({q:m?m[0]:null,chip:chip?chip.textContent:null,tHint:!!hint,playing:!!(spk&&spk.className.includes('bg-emerald-700')),dictOpen:t.includes('دیکشنری واژگان')});})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

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
qa_tts_count_on

echo "########## B) ورود به جلسهٔ دریلِ فعل ##########" | tee -a "$OUT"
click_by_label "ضمیمه"; sleep 2.5
click_by_label "افعال بی‌قاعده"; sleep 2
click_by_label "شروع تمرین افعال بی‌قاعده"; sleep 1.5
click_by_label "شروع جلسهٔ تمرین فعل"; sleep 1.5
next_state

echo "########## C) میانبرِ T: روخوانی + توقف (استِ روخوانی نزدِ چیپ) ##########" | tee -a "$OUT"
kb "t"
sleep 1.2
next_state
tts_count
kb "t"
sleep 0.6
next_state
tts_count
qa_shot r409-tts-question-light.png

echo "########## D) گاردِ حینِ جلسه: KeyD هیچ؛ «؟» راهنما؛ Escape بستن ##########" | tee -a "$OUT"
kb "d"
sleep 0.8
next_state
agent-browser eval "(()=>{window.dispatchEvent(new KeyboardEvent('keydown',{key:'?'}));return 'ASK-DISPATCHED';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; sleep 0.8
probe "(()=>{return JSON.stringify({guideOpen:document.body.innerText.includes('راهنمای میان‌برهای کیبورد')});})()"
kb "Escape"
sleep 0.8
next_state

echo "########## E) تا سؤال ۳ (گونهٔ بیچیپ) — T ساکت، گارد پابرجا ##########" | tee -a "$OUT"
kb "1"; kb "Enter"; kb "1"; kb "Enter"
sleep 0.5
next_state
kb "t"
sleep 0.8
next_state
tts_count
kb "d"
sleep 0.8
next_state

echo "########## F) جلسهٔ تمامکیبورد تا نتیجهٔ صادق ##########" | tee -a "$OUT"
for i in $(seq 1 14); do
  S=$(agent-browser eval "(()=>{const t=document.body.innerText||'';const hasOpts=!!document.querySelector('[aria-label^=\"گزینه \"]');return (t.includes('نتیجهٔ تمرین')||t.includes('نتیجهٔ مرور')||!hasOpts)?'DONE':'RUN';})()" 2>/dev/null | tr -d '"')
  [ "$S" = "DONE" ] && break
  kb "1"
  kb "Enter"
done
probe "(()=>{const sec=[...document.querySelectorAll('section')].find(s=>{const x=s.innerText||'';return x.includes('نتیجهٔ تمرین')||x.includes('نتیجهٔ مرور')});if(!sec)return 'NO-RESULT-SEC';const t=sec.innerText||'';const sc=(t.match(/[۰-۹]+٪/)||[])[0];const rows=[...sec.querySelectorAll('[aria-label=\\\"بازخوانی سؤال‌های تمرین\\\"] li')];const rv=(t.match(/مرور اشتباهها \\(([۰-۹]+)\\)/)||[])[1]||'0';return JSON.stringify({result:true,score:sc,rows:rows.length,replayN:rv});})()"
qa_shot r409-tts-result-light.png

echo "########## G) مرورِ اشتباهها: T در جلسهٔ مرور هم زنده است ##########" | tee -a "$OUT"
# درسِ راند: urlCacheِ speak (کلیدِ eff|text) hitِ تکراری را بی fetch پخش
# میکند — شمارندهٔ fetch کورِ کش است؛ شاهدِ راستینِ T زنده، playingِ چیپ
# در پروبِ سریع (۰٫۳۵ ثانیه — پیش از پایانِ صدای کوتاه) است.
click_by_label "مرور اشتباههای تمرین"; sleep 1.5
kb "t"
sleep 0.35
next_state
sleep 1.6
next_state
tts_count
for i in $(seq 1 14); do
  if agent-browser eval "document.body.innerText.includes('نتیجهٔ مرور')" 2>/dev/null | grep -q true; then echo "REPLAY-RESULT-AT-Q${i}" | tee -a "$OUT"; echo | tee -a "$OUT"; break; fi
  agent-browser eval "(()=>{const b=[...document.querySelectorAll('button')].find((x)=>/^گزینه [۱-۴]: /.test(x.getAttribute('aria-label')||'')&&x.getBoundingClientRect().width>0&&!x.disabled);if(!b)return 'NO-OPT';b.click();return 'ANSWERED-BLIND';})()" >/dev/null 2>&1
  sleep 0.3
  agent-browser eval "(()=>{const b=[...document.querySelectorAll('button')].find((x)=>['سؤال بعدی','دیدن نتیجهٔ تمرین'].includes(x.getAttribute('aria-label')||'')&&x.getBoundingClientRect().width>0&&!x.disabled);if(!b)return 'NO-NEXT';b.click();return 'NEXT';})()" >/dev/null 2>&1
  sleep 0.3
done
probe "(()=>{const t=document.body.innerText||'';const sec=[...document.querySelectorAll('section')].find(s=>(s.innerText||'').includes('نتیجهٔ مرور'));const sc=sec&&((sec.innerText.match(/[۰-۹]+٪/)||[])[0]);return JSON.stringify({replayHeader:t.includes('نتیجهٔ مرور'),score:sc,againBtn:!!document.querySelector('[aria-label=\\\"تمرین دوباره\\\"]')});})()"

echo "########## H) پرسشِ نو با نشانگرِ T در تمِ تاریک ##########" | tee -a "$OUT"
click_by_label "تمرین دوباره"; sleep 1.5
qa_to_dark
next_state
qa_shot r409-tts-question-dark.png
click_by_label "انصراف از تمرین"; sleep 1.5
probe "(()=>{const t=document.body.innerText||'';return JSON.stringify({drillGone:!t.includes('سؤال ۱ از'),tableBack:t.includes('افعال بی‌قاعده'),dark:document.documentElement.classList.contains('dark')});})()"

echo "########## I) کنترلِ رهاسازیِ گارد: پسِ خروج، KeyD ناوبری میکند ##########" | tee -a "$OUT"
kb "d"
sleep 1.2
probe "(()=>{const t=document.body.innerText||'';return JSON.stringify({dictOpen:t.includes('دیکشنری واژگان'),guardReleased:!document.querySelector('h3')||!(document.body.innerText.match(/سؤال \S+ از \S+/))});})()"

echo "########## J) گاردِ ارقامِ درس: دریلِ واژگانِ درس ۱ — رقمِ ۲ تب نمیبُرد ##########" | tee -a "$OUT"
agent-browser eval "(()=>{window.dispatchEvent(new KeyboardEvent('keydown',{key:'h',code:'KeyH'}));return 'HOME-DISPATCHED';})()" >/dev/null 2>&1; sleep 1.2
click_by_label "ورود به درس"; sleep 2.5
click_by_label "شروع تمرین واژگان درس"; sleep 1.5
click_by_label "شروع جلسهٔ تمرین واژگان درس"; sleep 1.5
next_state
kb "2"
sleep 0.8
probe "(()=>{const t=document.body.innerText||'';const m=t.match(/سؤال \S+ از \S+/);const convTab=[...document.querySelectorAll('button')].some((x)=>(x.innerText||'').includes('مکالمه')&&(x.getAttribute('aria-selected')==='true'||x.className.includes('bg-')));return JSON.stringify({stillInDrill:!!m,q:m?m[0]:null});})()"
click_by_label "انصراف از تمرین واژگان"; sleep 1.5
probe "(()=>{return JSON.stringify({exitBack:!!document.querySelector('[aria-label=\"شروع تمرین واژگان درس\"]')});})()"

agent-browser close >/dev/null 2>&1 || true
echo "########## R409-WITNESS-DONE ##########" | tee -a "$OUT"
