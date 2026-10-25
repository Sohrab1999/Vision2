#!/usr/bin/env bash
# ------------------------------------------------------------------
# r359 — داوریِ زندهٔ «شمارندهٔ سفر رویِ کارتِ ادامهٔ خواندن» — تک سشن،
# دادهٔ واقعی، بدونِ هیچ تزریقی:
#   A) سشنِ تازهٔ واقعی (بدونِ --play) ⇒ کارتِ «ادامهٔ خواندن» برایِ
#      تازهوارد نیست (گیتِ doneCount>0) — حالتِ «پیش»
#   B) دو داستانِ واقعی از کتابخانه خوانده میشود (هر پاسخِ درست/نادرست با
#      کلیکِ واقعی) ⇒ library_story_done واقعی در دفترِ سرور
#   C) خانه ⇒ کارت با چیپِ زنده: data-counter-kind=active و
#      «۱ داستان این هفته» — انتها-به-انتها: رویدادِ کلاینت → EventDay →
#      GET /api/event → چیپِ زنده (همان نردبانِ r356)
#   D) داستانِ دوم ⇒ «۲ داستان این هفته» — نردبانِ واقعی
#   E) کنترلِ منفی: قطعِ /api/event ⇒ ری‌لود ⇒ چیپِ شمارنده پنهان اما
#      کارتِ زنده (قاعدهٔ نوارهایِ نبض)؛ unroute ⇒ بازگشتِ چیپ
#   F) تیره + روشن — شاتها
#   G) کنسولِ پاک + شمارشِ CLEAN-RUN
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
OUT=/tmp/r359-qa.txt
: > "$OUT"
PASS=0; FAIL=0
ok(){ PASS=$((PASS+1)); echo "PASS:$1" | tee -a "$OUT"; }
no(){ FAIL=$((FAIL+1)); echo "FAIL:$1" | tee -a "$OUT"; }

shot(){ agent-browser screenshot "$EV/$1" >/dev/null 2>&1; }
ev(){ agent-browser eval "$1" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
wait_sel(){ for i in $(seq 1 25); do
  local R; R=$(agent-browser eval "(()=>{return document.querySelector('$1')?'OK':'WAIT';})()" 2>/dev/null | tr -d '"')
  [ "$R" = "OK" ] && { echo "sel-ready-${i}x2s" >> "$OUT"; return 0; }; sleep 2
done; echo "SEL-NEVER:$1" | tee -a "$OUT"; return 1; }

# پاسخدادنِ همهٔ جملههایِ درست/نادرست با کلیکِ واقعیِ DOM (idiomِ r355:
# snapshot-refها برایِ دیالوگها سالم نیستند — کلیک با eval)
answer_all(){
  for i in $(seq 1 12); do
    R=$(agent-browser eval "(()=>{
      const sec=document.querySelector('[aria-label=\"بخش صحیح یا نادرست\"]');
      if(!sec)return 'NO-SEC';
      const btns=[...sec.querySelectorAll('button')].filter(b=>!b.disabled&&b.textContent.trim()==='درست');
      if(btns.length===0)return 'DONE';
      btns[0].click();
      return 'CLICKED';
    })()" 2>/dev/null | tr -d '"')
    [ "$R" = "DONE" ] && { echo "answer-all-done-${i}" >> "$OUT"; return 0; }
    sleep 1
  done
  echo "ANSWER-NEVER-DONE" | tee -a "$OUT"; return 1
}

read_story(){
  local N="$1" ID="$2"
  wait_sel "button[aria-label^=\"داستان ${N}:\"]" || return 1
  agent-browser eval "(()=>{document.querySelector('button[aria-label^=\"داستان ${N}:\"]').click();return 'OPENED';})()" >/dev/null 2>&1
  sleep 2
  wait_sel '[aria-label="بخش صحیح یا نادرست"]' || return 1
  answer_all || return 1
  sleep 2
  ev "(()=>{
    const t=document.body.textContent||'';
    return JSON.stringify({storyDoneToast:t.includes('داستان تمام شد!'),story:'${ID}'});
  })()"
}

echo "########## A) سشنِ تازه — حالتِ «پیش»: کارت برایِ تازهوارد نیست" | tee -a "$OUT"
agent-browser close >/dev/null 2>&1 || true
pkill -f "agent-browser/browsers" 2>/dev/null; sleep 1
bash scripts/qa-fresh-session.sh --name "آرش-ممیزی-۳۵۹" 2>&1 | grep -E "^result=" | tee -a "$OUT"
sleep 1
ev "(()=>{return JSON.stringify({cardBefore:!!document.querySelector('[aria-label=\"ادامهٔ خواندن داستان‌ها\"]')});})()"
grep -q 'cardBefore\\":false' "$OUT" && ok "A-card-hidden-for-newcomer" || no "A-card-should-be-hidden"

echo "########## B) داستانِ اول — خواندنِ واقعی با کلیک" | tee -a "$OUT"
ev "(()=>{
  const cards=[...document.querySelectorAll('button')];
  const lib=cards.find(b=>b.textContent.includes('کتاب‌خانهٔ داستان‌ها'));
  if(!lib)return 'NO-LIB-TOOL';
  lib.click();return 'LIB-OPEN';
})()"
sleep 2
read_story "۱" "s1-1" | tee -a "$OUT"
grep -q 'storyDoneToast\\":true' "$OUT" && ok "B-story1-read-real" || no "B-story1-failed"

echo "########## C) خانه ⇒ کارت با شمارندهٔ زنده «۱ داستان این هفته»" | tee -a "$OUT"
agent-browser eval "(()=>{
  const tabs=[...document.querySelectorAll('button,a')];
  const home=tabs.find(b=>b.getAttribute('aria-label')==='خانه'||b.textContent.trim()==='خانه');
  if(!home)return 'NO-HOME-NAV';
  home.click();return 'HOME';
})()" | tee -a "$OUT"
wait_sel '[aria-label="ادامهٔ خواندن داستان‌ها"]' || { shot r359-fail.png; agent-browser close >/dev/null 2>&1; exit 1; }
sleep 2
ev "(()=>{
  const card=document.querySelector('[aria-label=\"ادامهٔ خواندن داستان‌ها\"]');
  const chip=document.querySelector('[data-reading-counter]');
  return JSON.stringify({
    card:!!card,
    kind:chip?chip.getAttribute('data-counter-kind'):'HIDDEN',
    text:chip?chip.textContent.trim():null,
    aria:chip?chip.getAttribute('aria-label'):null,
    cls:chip?chip.className:null
  });
})()"
grep -q 'kind\\":\\"active' "$OUT" && ok "C-counter-active" || no "C-counter-not-active"
grep -q '۱ داستان این هفته' "$OUT" && ok "C-real-week-1" || no "C-week1-text-missing"
grep -q '۱ داستان این هفته خواندی' "$OUT" && ok "C-aria-enriched" || no "C-aria-missing"
shot r359-reading-counter-light.png

echo "########## D) داستانِ دوم ⇒ نردبانِ واقعی «۲ داستان این هفته»" | tee -a "$OUT"
ev "(()=>{
  const cards=[...document.querySelectorAll('button')];
  const lib=cards.find(b=>b.textContent.includes('کتاب‌خانهٔ داستان‌ها'));
  if(!lib)return 'NO-LIB-TOOL';
  lib.click();return 'LIB-OPEN';
})()" >/dev/null 2>&1
sleep 2
read_story "۲" "s1-2" | tee -a "$OUT"
grep -q 'storyDoneToast\\":true' "$OUT" && ok "D-story2-read-real" || no "D-story2-failed"
agent-browser eval "(()=>{
  const tabs=[...document.querySelectorAll('button,a')];
  const home=tabs.find(b=>b.getAttribute('aria-label')==='خانه'||b.textContent.trim()==='خانه');
  if(!home)return 'NO-HOME-NAV';
  home.click();return 'HOME';
})()" >/dev/null 2>&1
wait_sel '[aria-label="ادامهٔ خواندن داستان‌ها"]' || { shot r359-fail.png; agent-browser close >/dev/null 2>&1; exit 1; }
sleep 2
ev "(()=>{
  const chip=document.querySelector('[data-reading-counter]');
  return JSON.stringify({kind:chip?chip.getAttribute('data-counter-kind'):'HIDDEN',text:chip?chip.textContent.trim():null});
})()"
grep -q '۲ داستان این هفته' "$OUT" && ok "D-ladder-week-2" || no "D-ladder-broken"

echo "########## E) کنترلِ منفی: قطعِ /api/event ⇒ چیپ پنهان، کارتِ زنده" | tee -a "$OUT"
agent-browser network route "**/api/event*" --abort >/dev/null 2>&1
agent-browser reload >/dev/null 2>&1
wait_sel '[aria-label="ادامهٔ خواندن داستان‌ها"]' || { echo "CARD-DISAPPEARED-AFTER-ABORT" | tee -a "$OUT"; agent-browser network unroute >/dev/null 2>&1 || true; agent-browser close >/dev/null 2>&1; exit 1; }
sleep 2
ev "(()=>{
  const card=document.querySelector('[aria-label=\"ادامهٔ خواندن داستان‌ها\"]');
  const chip=document.querySelector('[data-reading-counter]');
  return JSON.stringify({cardAlive:!!card,chipHidden:!chip,cta:!![...document.querySelectorAll('button')].find(b=>b.textContent.includes('بخوان و جواب بزن'))});
})()"
grep -q 'cardAlive\\":true' "$OUT" && ok "E-card-alive" || no "E-card-dead"
grep -q 'chipHidden\\":true' "$OUT" && ok "E-chip-honest-hidden" || no "E-chip-fake-visible"
shot r359-reading-counter-fallback.png
agent-browser network unroute >/dev/null 2>&1 || true
agent-browser reload >/dev/null 2>&1
wait_sel '[data-reading-counter]' >/dev/null 2>&1 && ok "E-chip-recovers" || no "E-chip-no-recovery"

echo "########## F) تیره + روشن" | tee -a "$OUT"
agent-browser eval "(()=>{document.documentElement.classList.add('dark');return 'DARK';})()" >/dev/null 2>&1
sleep 1
shot r359-reading-counter-dark.png
agent-browser eval "(()=>{document.documentElement.classList.remove('dark');return 'LIGHT';})()" >/dev/null 2>&1
sleep 1
shot r359-reading-counter-light2.png

echo "########## G) کنسول" | tee -a "$OUT"
agent-browser console 2>&1 | tail -5 | tee -a "$OUT"
CONS=$(agent-browser console 2>&1 | grep -ci "error" || true)
[ "${CONS:-0}" = "0" ] && ok "G-console-clean" || no "G-console-has-errors"

agent-browser close >/dev/null 2>&1 || true
echo "########## CLEAN-RUN: $PASS/$FAIL" | tee -a "$OUT"
[ "$FAIL" = "0" ] && echo "QA-R359-CLEAN" || echo "QA-R359-DIRTY"
