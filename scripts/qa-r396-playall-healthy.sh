#!/usr/bin/env bash
# ------------------------------------------------------------------
# r396 — «توالیِ سالمِ کاملِ پخش» — نخستین مصرفکنندهٔ qa-lib.sh و نخستین
#   شاهدِ زندهٔ playAllِ سالمِ سرتاسری در هدلس.
#   پیشتر فقط شکست Witness میشد (r394: نخستین خطا توالی را میایستاند) —
#   چون play در هدلس ذاتاً رد میشد، «توالیِ سالم» اصلاً قابلِ داوری نبود.
#   استابِ ended (qa-lib r396): play → resolve + پراکندنِ رویدادِ ended
#   → onendedِ speak.ts میسوزد → onEnd → resolve → خطِ بعدی — توالیِ
#   واقعی، با fetchهایِ واقعی (بکاندِ زنده)، سرتاسر میدود.
#   شواهدِ راند: LINE-N (۱۹ حبابِ گفتگو) · STARTED · SPEAKING-SEEN ·
#   SEQ-DONE (دکمه به «پخش کل مکالمه» برگشت) · FAIL-TOAST[0] ·
#   stub=۱۹+ended=۱۹ (هر خط play و onendedِ خودش) · tts=۱۹ (هر خط
#   fetchِ واقعی) — سپس کنترلِ مثبتِ r394 زیرِ همان استاب: تزریقِ ۵۰۰ →
#   نخستین خط TOAST-HIT و توالی میایستد.
#   الگوها: گاردِ seed (r338) · کلیک+کاوشِ اتمیک (r343) · SCENE-CLEAR
#   و revive (r395) · تاریکِ درجا (r336) · تک سشن رویِ buildِ راند.
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
OUT=/tmp/r396-playall-healthy.txt
QA_SEED_FILE=/tmp/r396-seed-eval.js
: > "$OUT"

# کتابخانهٔ QA (r396) — نخستین مصرفکننده
source /home/z/my-project/scripts/qa-lib.sh

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
qa_count_reset

echo "########## B) درس ۱ — تبِ مکالمه + شمارشِ حبابهایِ گفتگو" | tee -a "$OUT"
qa_ensure_alive || { agent-browser close >/dev/null 2>&1; exit 1; }
agent-browser eval "(()=>{
  const sp=[...document.querySelectorAll('.book-spine .en-text')].find((x)=>x.textContent.trim()==='L1');
  if(!sp)return 'NO-SPINE';(sp.closest('.book-spine')||sp).click();return 'spine-clicked';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"
sleep 2.5
agent-browser eval "(()=>{
  const b=[...document.querySelectorAll('button')].find((x)=>(x.innerText||'').trim().startsWith('مکالمه')&&x.getBoundingClientRect().width>0);
  if(!b)return 'NO-TAB';b.click();return 'tab-clicked';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"
sleep 2
agent-browser eval "(()=>{const rows=[...document.querySelectorAll('div')].filter((d)=>((d.className||'').toString().includes('max-w-[88%]')));return JSON.stringify({lines:rows.length});})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"

echo "########## C) استابِ ended + شمارندهٔ tts + پاکسازیِ صحنه" | tee -a "$OUT"
qa_audio_stub_on ended
qa_tts_count_on
qa_wait_toasts_clear

echo "########## D) playAllِ سالمِ سرتاسری — توالی باید ۱۴ خط را بپیماید" | tee -a "$OUT"
agent-browser eval "(()=>{
  const b=[...document.querySelectorAll('button')].find((x)=>(x.innerText||'').includes('پخش کل مکالمه')&&x.getBoundingClientRect().width>0);
  if(!b)return 'NO-BTN:playall';b.click();return 'playall-clicked';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"
sleep 1
STARTED=0; SPEAKING=0; FAILT=0; ENDED=0
for i in $(seq 1 100); do
  R=$(agent-browser eval "(()=>{const b=[...document.querySelectorAll('button')].find((x)=>{const t=(x.innerText||'').trim();return t.includes('پخش کل مکالمه')||t.includes('توقف پخش');});const label=b?(b.innerText||'').trim():'';const speaking=[...document.querySelectorAll('div')].some((d)=>{const c=(d.className||'').toString();return c.includes('shadow-md')&&c.includes('max-w-[88%]');});const lis=[...document.querySelectorAll('ol li')].filter((el)=>el.className.includes('pointer-events-auto')&&el.getBoundingClientRect().height>0);const fail=lis.some((el)=>(el.innerText||'').includes('پخش صدا ممکن نشد'));return JSON.stringify({label,speaking,fail});})()" 2>/dev/null)
  echo "$R" | rg -q 'توقف پخش' && STARTED=1
  echo "$R" | rg -q 'speaking.:true' && SPEAKING=1
  echo "$R" | rg -q 'fail.:true' && FAILT=1
  if [ "$STARTED" = "1" ] && echo "$R" | rg -q 'پخش کل مکالمه'; then ENDED=1; echo "SEQ-DONE@tick${i}" | tee -a "$OUT"; break; fi
  sleep 0.3
done
echo "STARTED[$STARTED] SPEAKING-SEEN[$SPEAKING] FAIL-TOAST[$FAILT] SEQ-DONE[$ENDED]" | tee -a "$OUT"
echo "-- سخنِ راند: ended=N شاهدِ سختِ «هر خط onended خودش» است؛ SPEAKING-SEEN شاهدِ ضعیفِ بیارادهای — پنجرهٔ speaking با کشِ گرم ~۳۵۰ms است و پروبِ ۳۰۰ms هم ممکن است بگريزد (نخیرِ ضبط‌شده، نه شکست)" | tee -a "$OUT"
qa_stub_count
qa_rec
qa_shot r396-playall-healthy.png

echo "########## E) reload + تزریقِ ۵۰۰: نخستین خطِ بیکش — توالی میایستد (r394 زیرِ استاب)" | tee -a "$OUT"
# درسِ راند: (الف) کشِ URL همهٔ ۱۴ خطِ L1 را دارد و تزریقِ fetch رویِ خطِ کشی خنثی است
# (توالی از کش سالم میدود) — (ب) book-spine فقط در خانه است. درمان: reload —
# کشِ ماژولِ speak.ts پاک میشود (خطِ نخست «بیکش»)، localStorage (بذر) میماند.
qa_wait_toasts_clear
agent-browser eval "(()=>{location.reload();return 'reloading';})()" >/dev/null 2>&1
sleep 6
# window نو — ابزارها دوباره نصب (درسِ revive، اینبارreload دستی)
qa_count_reset >/dev/null 2>&1
qa_tts_count_on >/dev/null 2>&1
qa_audio_stub_on ended >/dev/null 2>&1
# اگر در خانه‌ایم (ویدیو پایدار نشده) L1 را باز کن؛ اگر خودِ درس هستیم مستقیم
agent-browser eval "(()=>{const sp=[...document.querySelectorAll('.book-spine .en-text')].find((x)=>x.textContent.trim()==='L1');if(sp){(sp.closest('.book-spine')||sp).click();return 'spine-L1';}return 'already-in-lesson';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"
sleep 2.5
agent-browser eval "(()=>{
  const b=[...document.querySelectorAll('button')].find((x)=>(x.innerText||'').trim().startsWith('مکالمه')&&x.getBoundingClientRect().width>0);
  if(!b)return 'NO-TAB';b.click();return 'tab-clicked';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"
sleep 2
qa_tts_fail_on
# دکمهٔ playAll aria-label ندارد — با متنِ خودش پیدا میشود (اتمیک: کلیک+پروب)
agent-browser eval "(()=>{
  const b=[...document.querySelectorAll('button')].find((x)=>(x.innerText||'').includes('پخش کل مکالمه')&&x.getBoundingClientRect().width>0);
  if(!b)return Promise.resolve('NO-BTN:playall');
  b.click();
  return new Promise((res)=>{
    let n=0;
    const tick=()=>{
      const lis=[...document.querySelectorAll('ol li')].filter((el)=>el.className.includes('pointer-events-auto')&&el.getBoundingClientRect().height>0);
      if(lis.some((el)=>(el.innerText||'').includes('پخش صدا ممکن نشد')))return res('TOAST-HIT');
      if(++n>=18)return res('TOAST-TIMEOUT');
      setTimeout(tick,500);
    };
    setTimeout(tick,600);
  });
})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"
sleep 1
agent-browser eval "(()=>{const b=[...document.querySelectorAll('button')].find((x)=>{const t=(x.innerText||'').trim();return t.includes('پخش کل مکالمه')||t.includes('توقف پخش');});return b?('SEQ-STATE:'+(b.innerText||'').trim()):'NO-BTN';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"
qa_rec
qa_tts_restore
qa_shot r396-playall-fail.png

echo "########## F) بهداشتِ سشن — خاموشیِ استاب" | tee -a "$OUT"
qa_audio_stub_off
echo "########## DONE" | tee -a "$OUT"
agent-browser close >/dev/null 2>&1 || true
echo "OUT=$OUT"
