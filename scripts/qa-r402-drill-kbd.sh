#!/usr/bin/env bash
# ------------------------------------------------------------------
# r402 — «کیبوردِ دریل» — هفتمین مصرفکنندهٔ qa-lib.sh و داوریِ زندهٔ
#   میانبرهای پاسخ رویِ buildِ راند (تک سشن، کلیدهایِ واقعیِ CDP):
#   ① کیبوردِ دریل: Digit2 گزینه را انتخاب میکند، Enter پیش میرود،
#     ArrowLeft هم همین — بازخوردِ درجا؛ نشانگرهایِ kbdِ ارقامِ فارسی
#     رویِ گزینهها witnessed (چیپهایِ aria-hidden).
#   ② گاردها: Enter پیشِ پاسخ هیچ؛ رقمِ پسِ پاسخ هیچ (هر سؤال یک انتخاب).
#   ③ جلسهٔ کاملِ تمامکیبورد تا نتیجه؛ شاتِ پرسش در روشن و تاریک.
#   درسِ revive (r395/r397/r400/r401): هر بخش ناوبریِ idempotent خودش را دارد.
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
OUT=/tmp/r402-witness.txt
QA_SEED_FILE=/tmp/r402-seed-eval.js
QA_REC=__qarec
: > "$OUT"

source /home/z/my-project/scripts/qa-lib.sh

click_by_label(){ agent-browser eval "(()=>{let b=document.querySelector('[aria-label=\"$1\"]');if(!b||b.getBoundingClientRect().width===0){b=[...document.querySelectorAll('button')].find((x)=>(x.innerText||'').replace(/\s+/g,' ').trim()==='$1'&&x.getBoundingClientRect().width>0);}if(!b)return 'NO-BTN:$1';b.click();return 'CLICKED:$1';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
probe(){ agent-browser eval "$1" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
kb(){ agent-browser press "$1" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; sleep 0.45; }
next_state(){ agent-browser eval "(()=>{const t=document.body.innerText||'';const m=t.match(/سؤال \S+ از \S+/);const nb=[...document.querySelectorAll('button')].find((x)=>(x.getAttribute('aria-label')||'')===\"سؤال بعدی\");return JSON.stringify({q:m?m[0]:null,nextDisabled:nb?nb.disabled:null,chips:[...document.querySelectorAll('[role=\"group\"] span[aria-hidden]')].filter((el)=>el.className.includes('font-mono')).map((c)=>c.textContent)});})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

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

echo "########## B) ورود idempotent به جلسهٔ دریل ##########" | tee -a "$OUT"
click_by_label "ضمیمه"; sleep 2.5
click_by_label "افعال بی‌قاعده"; sleep 2
click_by_label "شروع تمرین افعال بی‌قاعده"; sleep 1.5
click_by_label "شروع جلسهٔ تمرین فعل"; sleep 1.5
next_state

echo "########## C) گاردها: Enter پیشِ پاسخ هیچ ##########" | tee -a "$OUT"
kb "Enter"
next_state

echo "########## D) پاسخِ کیبوردی: Digit2 → Enter → سؤال ۲ ##########" | tee -a "$OUT"
kb "2"
next_state
kb "Enter"
next_state

echo "########## E) نشانگرهایِ kbd + ArrowLeft بهعنوانِ بعدی ##########" | tee -a "$OUT"
kb "3"
kb "ArrowLeft"
next_state

echo "########## F) رقمِ پسِ پاسخ هیچ (هر سؤال یک انتخاب) ##########" | tee -a "$OUT"
kb "4"
next_state
kb "1"
next_state

echo "########## G) جلسهٔ کاملِ تمامکیبورد تا نتیجه ##########" | tee -a "$OUT"
# سرشمارِ سخاوتمند (۱۴ ≥ ۱۰+۴): هر تکرار «۱ + Enter»؛ نتیجه = توقف.
# درسِ off-by-oneِ راند: Enterِ معلقِ سؤالِ پاسخخورده یک تکرار میبلشد.
for i in $(seq 1 14); do
  S=$(agent-browser eval "(()=>{const t=document.body.innerText||'';const hasOpts=!!document.querySelector('[aria-label^=\"گزینه \"]');return (t.includes('نتیجهٔ تمرین')||t.includes('نتیجهٔ مرور')||!hasOpts)?'DONE':'RUN';})()" 2>/dev/null | tr -d '"')
  [ "$S" = "DONE" ] && break
  kb "1"
  kb "Enter"
done
probe "(()=>{const t=document.body.innerText||'';const sc=(t.match(/[۰-۹]+٪/)||[])[0];return JSON.stringify({result:t.includes('نتیجهٔ تمرین')||t.includes('نتیجهٔ مرور'),score:sc,review:!!document.querySelector('[aria-label=\"بازخوانی سؤال‌های تمرین\"]'),replayBtn:!!document.querySelector('[aria-label=\"مرور اشتباههای تمرین\"]')});})()"
qa_shot r402-kbd-result-light.png

echo "########## H) پرسش با چیپهایِ kbd در تمِ تاریک ##########" | tee -a "$OUT"
click_by_label "تمرین دوباره"; sleep 1.5
qa_to_dark
next_state
qa_shot r402-kbd-question-dark.png

agent-browser close >/dev/null 2>&1 || true
echo "########## R402-WITNESS-DONE ##########" | tee -a "$OUT"
