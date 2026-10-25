#!/usr/bin/env bash
# ------------------------------------------------------------------
# r321 — ممیزیِ دودستگاهیِ نبردِ چندنفره: اولین دوئلِ واقعیِ دوکلاینتی
#   (میزبانِ آرش-د + مهمانِ آرش-ذ رویِ داورِ :3003) + ممیزیِ min-w-0 در
#   مراحلی که فقط بعدِ یک دوئلِ واقعی محتوا میگیرند:
#     · duel-PLAY-live: HUDِ دوبدسته موقعِ بازی
#     · duel-DONE: هر دو کلاینت
#     · leaderboard-دوئلی: زبانهٔ «رتبهبندی نبردها» با ردیفِ واقعی
#     · duel-setup-بعدازدور: ردیفهایِ تاریخچه (duel-setup:615) که r319 با
#       تاریخچهٔ خالی سنجیده بود (total:1)
#   سشنها: agent-browser --session dA / dB (دو کرومِ همزمان).
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
JSF=/home/z/my-project/scripts/r319-basis-zero-audit.js
OUT=/tmp/r321-duel-audit-results.txt
A=(agent-browser --session dA)
B=(agent-browser --session dB)
mkdir -p "$EV"; : > "$OUT"

audit() { # $1 session-name  $2 برچسب
  echo "-- [$1] $2" | tee -a "$OUT"
  agent-browser --session "$1" eval "$(cat "$JSF")" 2>&1 | tee -a "$OUT"
  echo | tee -a "$OUT"
}
shot() { agent-browser --session "$1" screenshot "$EV/$2" >/dev/null 2>&1; }

seed() { # $1 session  $2 name
  agent-browser --session "$1" open "$BASE" >/dev/null 2>&1
  agent-browser --session "$1" set viewport 390 844 >/dev/null 2>&1
  agent-browser --session "$1" wait 'body' >/dev/null 2>&1 || true
  agent-browser --session "$1" eval "(()=>{localStorage.setItem('vision2-study-v1', JSON.stringify({state:{userName:'$2', onboarded:true}, version:0}));location.reload();return 'seeded';})()" >/dev/null 2>&1
  sleep 4
}

echo "########## LIGHT 390 — دوکلاینتی ##########" | tee -a "$OUT"
seed dA آرش-د
seed dB آرش-ذ

# ===== میزبان: اتاق بساز (ریتمِ سریع) =====
agent-browser --session dA eval "window.dispatchEvent(new Event('open-duel')); 'ok'" >/dev/null 2>&1
sleep 2.2
agent-browser --session dA eval "(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent?.trim()==='سریع');if(b)b.click();return b?'fast':'pace-default';})()" >/dev/null 2>&1
agent-browser --session dA eval "(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent?.includes('ساخت اتاق نبرد'));if(!b)return 'NO-CREATE';b.click();return 'created';})()" 2>&1 | tee -a "$OUT"
CODE=""
for i in $(seq 1 12); do
  CODE=$(agent-browser --session dA eval "(()=>{const c=document.querySelector('.duel-code');if(!c)return '';const m=(c.getAttribute('aria-label')||'').match(/([A-Z0-9]{5})/);return m?m[1]:'';})()" 2>&1 | tr -d '"\n')
  [[ -n "$CODE" ]] && break
  sleep 2
done
echo "room_code=$CODE" | tee -a "$OUT"
[[ -z "$CODE" ]] && { echo "NO-CODE — abort" | tee -a "$OUT"; agent-browser close --all >/dev/null 2>&1; exit 1; }

# ===== مهمان: با کد بپیوند =====
agent-browser --session dB eval "window.dispatchEvent(new Event('open-duel')); 'ok'" >/dev/null 2>&1
sleep 2.2
agent-browser --session dB eval "(()=>{const i=document.querySelector('input[aria-label=\"کد اتاق مسابقه\"]');if(!i)return 'NO-INPUT';const set=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;set.call(i,'$CODE');i.dispatchEvent(new Event('input',{bubbles:true}));return 'filled';})()" 2>&1 | tee -a "$OUT"
agent-browser --session dB eval "(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent?.includes('پیوستن'));if(!b)return 'NO-JOIN';b.click();return 'joined';})()" 2>&1 | tee -a "$OUT"

# ===== انتظارِ بازی (countdown → سؤال) در هر دو =====
for s in dA dB; do
  for i in $(seq 1 20); do
    INPLAY=$(agent-browser --session "$s" eval "String(document.querySelectorAll('[data-duel-option]').length > 0)" 2>&1 | tr -d '"\n')
    [[ "$INPLAY" == "true" ]] && break
    sleep 2
  done
done
echo "== play reached ==" | tee -a "$OUT"

# ===== HUDِ زنده در هر دو =====
sleep 2
audit dA "duel-PLAY-live (میزبان)"
audit dB "duel-PLAY-live (مهمان)"
shot dA r321-duel-live-host-390.png

# ===== حلقهٔ پاسخگوییِ هر دو (حداکثر ~۳ دقیقه) =====
DONE_A=0; DONE_B=0
for i in $(seq 1 60); do
  if [[ $DONE_A -eq 0 ]]; then
    agent-browser --session dA eval "(()=>{const o=document.querySelectorAll('[data-duel-option]');if(o.length>0){o[0].click();return 'answered';}return 'no-q';})()" >/dev/null 2>&1
    DA=$(agent-browser --session dA eval "String(['پیروزی در نبرد','این دور را باختی','مساوی — رقابت نزدیک'].some(t=>document.body.textContent.includes(t)))" 2>&1 | tr -d '"\n')
    [[ "$DA" == "true" ]] && DONE_A=1
  fi
  if [[ $DONE_B -eq 0 ]]; then
    agent-browser --session dB eval "(()=>{const o=document.querySelectorAll('[data-duel-option]');if(o.length>0){o[0].click();return 'answered';}return 'no-q';})()" >/dev/null 2>&1
    DB=$(agent-browser --session dB eval "String(['پیروزی در نبرد','این دور را باختی','مساوی — رقابت نزدیک'].some(t=>document.body.textContent.includes(t)))" 2>&1 | tr -d '"\n')
    [[ "$DB" == "true" ]] && DONE_B=1
  fi
  [[ $DONE_A -eq 1 && $DONE_B -eq 1 ]] && break
  sleep 3
done
echo "done_A=$DONE_A done_B=$DONE_B" | tee -a "$OUT"

# ===== صفحهٔ تمامشد در هر دو =====
sleep 2
audit dA "duel-DONE (میزبان)"
audit dB "duel-DONE (مهمان)"
shot dA r321-duel-done-host-390.png
shot dB r321-duel-done-guest-390.png

# ===== بعد از دورِ واقعی: زبانهٔ دوئلیِ جدول + ستآپِ با تاریخچه (میزبان) =====
agent-browser --session dA eval "(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent?.includes('بازگشت')||x.textContent?.includes('خانه')||x.textContent?.includes('لابی'));if(b)b.click();return b?'nav':'stay';})()" >/dev/null 2>&1
sleep 2.5
agent-browser --session dA eval "(()=>{const tabs=[...document.querySelectorAll('[aria-label=\"انتخاب نوع جدول\"] button')];const t=tabs.find(x=>x.textContent?.includes('نبرد'));if(t){t.click();return 'duel-tab';}return 'NO-TAB';})()" >/dev/null 2>&1
sleep 1.6
audit dA "leaderboard-دوئلی (ردیفِ واقعی)"
shot dA r321-leaderboard-duel-390.png

agent-browser --session dA eval "window.dispatchEvent(new Event('open-duel')); 'ok'" >/dev/null 2>&1
sleep 2.4
audit dA "duel-setup-بعدازدور (تاریخچهٔ واقعی)"
shot dA r321-duel-setup-after-390.png

agent-browser close --all >/dev/null 2>&1
pkill -f "chrome" 2>/dev/null || true
echo "== done ==" | tee -a "$OUT"
echo "== خلاصه در $OUT =="
