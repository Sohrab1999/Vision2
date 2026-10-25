#!/usr/bin/env bash
# ------------------------------------------------------------------
# r356 — داوریِ زندهٔ «شمارندههای نبض روی سفرِ کشف» — تک سشن، دادهٔ واقعی:
#   A) یک دستِ واقعیِ چالش برق‌آسا (qa-fresh-session --play) ⇒ rush_done
#      واقعی در دفترِ سرور + rushGames محلی — تزریقِ هیچ داده‌ای نیست
#   B) خانه ⇒ کارتِ سفرِ کشف ⇒ چیپِ rush: data-counter-kind=active و
#      «۱ بار این هفته» — انتها-به-انتها: رویدادِ کلاینت → EventDay →
#      GET /api/event → چیپِ زنده
#   C) چیپهایِ کشفنشده (duel/konkur/quiz) بدونِ شمارنده — کارشان پرش است
#   D) ariaِ غنیشده با عددِ واقعی رویِ چیپِ rush
#   E) کنترلِ منفی: قطعِ /api/event ⇒ ری‌لود ⇒ سقوطِ صادق به خطِ ثابتِ
#      r349 («کشف شد — ادامه بده!») + ariaِ یخزده — شمارندهٔ جعلی هیچ‌جا
#   F) تیره + روشن — شاتها
#   G) کنسولِ پاک
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
OUT=/tmp/r356-qa.txt
: > "$OUT"

shot(){ agent-browser screenshot "$EV/$1" >/dev/null 2>&1; }
ev(){ agent-browser eval "$1" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
wait_sel(){ for i in $(seq 1 20); do
  local R; R=$(agent-browser eval "(()=>{return document.querySelector('$1')?'OK':'WAIT';})()" 2>/dev/null | tr -d '"')
  [ "$R" = "OK" ] && { echo "sel-ready-${i}x2s" >> "$OUT"; return 0; }; sleep 2
done; echo "SEL-NEVER:$1" | tee -a "$OUT"; return 1; }

echo "########## A) دستِ واقعیِ برق‌آسا (rush_done واقعی، بدونِ تزریق)" | tee -a "$OUT"
agent-browser close >/dev/null 2>&1 || true
pkill -f "agent-browser/browsers" 2>/dev/null; sleep 1
bash scripts/qa-fresh-session.sh --name "آرش-ممیزی-۳۵۶" --play 2>&1 | grep -E "^result=" | tee -a "$OUT"

echo "########## B) خانه ⇒ کارتِ سفرِ کشف با شمارندهٔ زنده" | tee -a "$OUT"
wait_sel '.discovery-journey' || { shot r356-fail.png; agent-browser close >/dev/null 2>&1; exit 1; }
sleep 1
ev "(()=>{
  const chip=document.querySelector('[data-journey-chip=\"rush\"]');
  if(!chip)return 'NO-RUSH-CHIP';
  const kind=chip.getAttribute('data-journey-state');
  const line=document.querySelector('[data-journey-counter=\"rush\"]');
  return JSON.stringify({state:kind,counterKind:line?line.getAttribute('data-counter-kind'):'MISSING',text:line?line.textContent.trim():null,aria:chip.getAttribute('aria-label')});
})()" | tee -a "$OUT"
ev "(()=>{
  const todos=['duel','konkur','quiz','listening','dictation','mywords','library','flashcards'];
  const withCounter=todos.filter((k)=>document.querySelector('[data-journey-counter=\"'+k+'\"]'));
  const todoCount=document.querySelectorAll('[data-journey-state=\"todo\"]').length;
  return JSON.stringify({todoChips:todoCount,todoWithCounter:withCounter});
})()" | tee -a "$OUT"
grep -q 'counterKind\\":\\"active' "$OUT" || { echo "COUNTER-NOT-ACTIVE" | tee -a "$OUT"; shot r356-fail.png; agent-browser close >/dev/null 2>&1; exit 1; }
grep -q 'بار این هفته — ادامه بده!' "$OUT" || { echo "REAL-COUNT-TEXT-MISSING" | tee -a "$OUT"; agent-browser close >/dev/null 2>&1; exit 1; }
grep -q 'todoWithCounter\\":\[\]' "$OUT" || { echo "TODO-CHIP-HAS-COUNTER" | tee -a "$OUT"; agent-browser close >/dev/null 2>&1; exit 1; }
# ariaِ غنیشده همیشه «کشف شده، » (با ویرگول) دارد — حالتِ plain «کشف شده» بدونِ ویرگول است
grep -q 'کشف شده، ' "$OUT" || { echo "ARIA-NOT-ENRICHED" | tee -a "$OUT"; agent-browser close >/dev/null 2>&1; exit 1; }
shot r356-journey-counts-light.png

echo "########## E) کنترلِ منفی: قطعِ /api/event ⇒ سقوطِ صادق به خطِ r349" | tee -a "$OUT"
agent-browser network route "**/api/event*" --abort >/dev/null 2>&1
agent-browser reload >/dev/null 2>&1
wait_sel '.discovery-journey' >/dev/null 2>&1 || { echo "CARD-DISAPPEARED-AFTER-ABORT" | tee -a "$OUT"; agent-browser network unroute >/dev/null 2>&1 || true; agent-browser close >/dev/null 2>&1; exit 1; }
sleep 1
ev "(()=>{
  const line=document.querySelector('[data-journey-counter=\"rush\"]');
  const chip=document.querySelector('[data-journey-chip=\"rush\"]');
  return JSON.stringify({counterKind:line?line.getAttribute('data-counter-kind'):'MISSING',text:line?line.textContent.trim():null,aria:chip?chip.getAttribute('aria-label'):null});
})()" | tee -a "$OUT"
grep -q 'counterKind\\":\\"plain' "$OUT" || { echo "FALLBACK-NOT-PLAIN" | tee -a "$OUT"; agent-browser network unroute >/dev/null 2>&1 || true; agent-browser close >/dev/null 2>&1; exit 1; }
grep -q 'کشف شد — ادامه بده!' "$OUT" || { echo "FALLBACK-TEXT-MISSING" | tee -a "$OUT"; agent-browser network unroute >/dev/null 2>&1 || true; agent-browser close >/dev/null 2>&1; exit 1; }
shot r356-journey-fallback.png
agent-browser network unroute >/dev/null 2>&1 || true

echo "########## F) بازیابیِ زنده بعد از رفعِ قطع + تیره" | tee -a "$OUT"
agent-browser reload >/dev/null 2>&1
wait_sel '.discovery-journey' >/dev/null 2>&1
sleep 1
ev "(()=>{
  const line=document.querySelector('[data-journey-counter=\"rush\"]');
  return line?('RECOVERED:'+line.getAttribute('data-counter-kind')+':'+line.textContent.trim()):'NOT-RECOVERED';
})()" | tee -a "$OUT"
grep -q 'RECOVERED:active' "$OUT" || { echo "NOT-RECOVERED" | tee -a "$OUT"; agent-browser close >/dev/null 2>&1; exit 1; }
ev "(()=>{document.documentElement.classList.add('dark');return 'dark-on';})()" >/dev/null 2>&1
sleep 1
shot r356-journey-counts-dark.png
ev "(()=>{document.documentElement.classList.remove('dark');return 'dark-off';})()" >/dev/null 2>&1

echo "########## G) کنسول" | tee -a "$OUT"
agent-browser console 2>&1 | tail -5 | tee -a "$OUT"

echo "================ VERDICT" | tee -a "$OUT"
if grep -q 'counterKind\\":\\"active' "$OUT" && grep -q 'بار این هفته' "$OUT" \
   && grep -q 'counterKind\\":\\"plain' "$OUT" && grep -q 'RECOVERED:active' "$OUT" \
   && grep -q 'todoWithCounter\\":\[\]' "$OUT" && grep -q '^result=PLAYED' "$OUT"; then
  echo "R356-JOURNEY-COUNTS-ALL-OK" | tee -a "$OUT"
else
  echo "R356-VERDICT-FAILED" | tee -a "$OUT"
fi
agent-browser close >/dev/null 2>&1 || true
