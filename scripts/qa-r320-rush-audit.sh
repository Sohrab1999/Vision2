#!/usr/bin/env bash
# ------------------------------------------------------------------
# r320 — ممیزیِ دامِ basis-صفر در خانوادهٔ برقآسا (نماهایِ زندهٔ spell/rush)
#   نسخهٔ نهایی — درسهایِ سه اجرا:
#   [۱] دورِ تمامشده با «چالش دوباره» مستقیم بازی میشود؛ زبانهها فقط در ستآپند
#       → ترتیبِ درست: املا اول (زبانه در ستآپ)، بعد با «حالت چهارگزینه‌ای» به ستآپِ کوییز.
#   [۲] نشانگرِ پایانِ دورِ املا، عنوانِ خودش است: «دیکتهٔ برقآسا تمام شد!»
#       (نه «چالش تمام شد» که مالِ کوییز است)؛ دکمهٔ خانهٔ املا فقط وقتی onExit نباشد
#       رندر میشود — با onExit، دکمهٔ «حالت چهارگزینه‌ای» جایگزینِ آن است.
#   [۳] انتظارِ پایان با double-poll (دو پایشِ متوالیِ false) — یک falseِ تنها
#       میتواند false-negativeِ لحظهٔ رندر باشد.
#   طبقهبند همان r319 (r319-basis-zero-audit.js). تکفراخوانی.
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
JSF=/home/z/my-project/scripts/r319-basis-zero-audit.js
OUT=/tmp/r320-rush-audit-results.txt
mkdir -p "$EV"; : > "$OUT"

audit() { echo "-- $1" | tee -a "$OUT"; agent-browser eval "$(cat "$JSF")" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
shot() { agent-browser screenshot "$EV/$1" >/dev/null 2>&1; }
wait_round_end() { # double-poll: دو falseِ متوالی = پایانِ واقعی
  local MISS=0 ALIVE
  for i in $(seq 1 24); do
    ALIVE=$(agent-browser eval "String(!!document.querySelector('.rush-score-live'))" 2>&1 | tr -d '"\n')
    if [[ "$ALIVE" == "false" ]]; then
      MISS=$((MISS+1)); [[ $MISS -ge 2 ]] && return 0
    else
      MISS=0
    fi
    sleep 4
  done
  return 0
}

agent-browser open "$BASE" >/dev/null 2>&1
agent-browser set viewport 390 844 >/dev/null 2>&1
agent-browser wait 'body' >/dev/null 2>&1 || true
sleep 1.5
agent-browser eval "(()=>{localStorage.setItem('vision2-study-v1', JSON.stringify({state:{userName:'آرش-ک', onboarded:true}, version:0}));location.reload();return 'seeded';})()" >/dev/null 2>&1
sleep 4

echo "########## LIGHT 390 — خانوادهٔ برقآسا ##########" | tee -a "$OUT"
audit "home"

# ===== املا: ستآپ → دورِ واقعی → HUDِ زنده → صفحهٔ تمامشدِ خودش =====
agent-browser eval "(()=>{const b=[...document.querySelectorAll('.rush-banner button')].find(x=>x.textContent?.includes('شروع چالش'));if(!b)return 'NO-BANNER';b.click();return 'clicked';})()" 2>&1 | tee -a "$OUT"
sleep 2.4
audit "quiz-setup (با زبانهها)"
agent-browser eval "(()=>{const t=[...document.querySelectorAll('[role=tab]')].find(x=>x.textContent?.includes('املا'));if(!t)return 'NO-TAB';t.click();return 'clicked';})()" 2>&1 | tee -a "$OUT"
sleep 2.2
audit "spell-setup"
agent-browser eval "(()=>{const s=document.querySelector('.rush-start');if(!s)return 'NO-START';s.click();return 'started';})()" 2>&1 | tee -a "$OUT"
sleep 4
audit "spell-PLAY-live (HUDِ زنده)"
shot r320-spell-live-390.png
wait_round_end; sleep 2
audit "spell-DONE («دیکتهٔ برقآسا تمام شد»)"
shot r320-spell-results-390.png

# ===== کوییز: از دکمهٔ «حالت چهارگزینه‌ای» به ستآپ → دورِ واقعی → HUD → تمامشد =====
agent-browser eval "(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent?.includes('حالت چهارگزینه‌ای'));if(!b)return 'NO-BTN';b.click();return 'clicked';})()" 2>&1 | tee -a "$OUT"
sleep 2.2
agent-browser eval "(()=>{const s=document.querySelector('.rush-start');if(!s)return 'NO-START';s.click();return 'started';})()" 2>&1 | tee -a "$OUT"
sleep 4
audit "rush-PLAY-live (HUDِ زنده)"
shot r320-rush-live-390.png
wait_round_end; sleep 2
audit "rush-DONE («چالش تمام شد»)"
shot r320-rush-results-390.png
agent-browser eval "(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent?.includes('بازگشت به خانه'));if(!b)return 'NO-BTN';b.click();return 'clicked';})()" 2>&1 | tee -a "$OUT"
sleep 2.4
audit "home-بازگشت (حلقهٔ کامل)"

agent-browser close >/dev/null 2>&1
pkill -f "chrome" 2>/dev/null || true
echo "== done ==" | tee -a "$OUT"
echo "== خلاصه در $OUT =="
