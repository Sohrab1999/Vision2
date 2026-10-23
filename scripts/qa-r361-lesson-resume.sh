#!/usr/bin/env bash
# ------------------------------------------------------------------
# r361 — داوریِ زندهٔ «ادامهٔ خواندنِ درس» — تک سشن، همهچیز با کلیکِ
# واقعی، بدونِ هیچ تزریقی:
#   A) سشنِ تازه ⇒ کارت غایب است (غیبتِ صادقانه)
#   B) ورودِ واقعی به درس ۱ (قفسه) ⇒ خانه ⇒ کارت: «از درسِ ۱ ادامه
#      بده — واژگان» + «لحظاتی پیش»
#   C) کلیکِ کارت ⇒ برگشتِ واقعی به درس ۱ (سطرِ تبهایِ درس حاضر)
#   D) تعویضِ واقعیِ تب به «دیکته» ⇒ خانه ⇒ کارت حالا «— دیکته»
#   E) درس ۲ + تبِ «گرامر» ⇒ خانه ⇒ «درسِ ۲ — گرامر» (نردبان) ⇒
#      ری‌لود ⇒ رکورد پابرجا (localStorage، بیرونِ استور)
#   F) تیره + روشن؛ کنسولِ پاک؛ CLEAN-RUN
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
OUT=/tmp/r361-qa.txt
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

go_home="(()=>{
  const home=[...document.querySelectorAll('button,a')].find(b=>b.getAttribute('aria-label')==='خانه'||b.textContent.trim()==='خانه');
  if(!home)return 'NO-HOME-NAV';
  home.click();return 'HOME';})()"

resume_probe="(()=>{
  const c=document.querySelector('[data-lesson-resume]');
  return JSON.stringify({present:!!c,text:c?(c.textContent||'').trim().slice(0,80):null,lesson:c?c.getAttribute('data-resume-lesson'):null,tab:c?c.getAttribute('data-resume-tab'):null});
})()"

echo "########## A) سشنِ تازه — غیبتِ صادقانه" | tee -a "$OUT"
agent-browser close >/dev/null 2>&1 || true
pkill -f "agent-browser/browsers" 2>/dev/null; sleep 1
bash scripts/qa-fresh-session.sh --name "آرش-ممیزی-۳۶۱" 2>&1 | grep -E "^result=" | tee -a "$OUT"
sleep 1
ev "$resume_probe"
grep -q 'present\\":false\|"present":false' "$OUT" && ok "A-card-absent-for-newcomer" || no "A-card-should-be-absent"

echo "########## B) ورودِ واقعی به درس ۱ ⇒ خانه ⇒ کارت" | tee -a "$OUT"
agent-browser eval "(()=>{
  const shelf=document.querySelector('[aria-label=\"قفسهٔ کتاب\"]');
  const card=shelf?shelf.querySelector('button'):null;
  if(!card||card.getBoundingClientRect().width===0)return 'NO-LESSON-CARD';
  card.click();return 'lesson-opened';})()" | tee -a "$OUT"
sleep 3
ev "(()=>{const t=[...document.querySelectorAll('button')].some(b=>(b.innerText||'').trim()==='دیکته'&&b.getBoundingClientRect().width>0);return JSON.stringify({inLesson:t});})()"
grep -q 'inLesson\\":true\|"inLesson":true' "$OUT" && ok "B-real-lesson-entry" || no "B-lesson-not-open"
ev "$go_home" >/dev/null 2>&1
wait_sel '[data-lesson-resume]' || { shot r361-fail.png; agent-browser close >/dev/null 2>&1; exit 1; }
ev "$resume_probe"
grep -q 'درسِ ۱ ادامه بده — واژگان' "$OUT" && ok "B-card-lesson1-vocab" || no "B-card-text-missing"
grep -q 'لحظاتی پیش' "$OUT" && ok "B-fresh-relative-time" || no "B-time-missing"
grep -q 'lesson\\":\\"1\|"lesson":"1' "$OUT" && ok "B-data-lesson-1" || no "B-data-lesson-missing"
shot r361-resume-card-light.png

echo "########## C) کلیکِ کارت ⇒ برگشتِ واقعی به درس" | tee -a "$OUT"
agent-browser eval "(()=>{document.querySelector('[data-lesson-resume]').click();return 'jumped';})()" >/dev/null 2>&1
sleep 2.5
ev "(()=>{const t=[...document.querySelectorAll('button')].some(b=>(b.innerText||'').trim()==='دیکته'&&b.getBoundingClientRect().width>0);const shelfGone=!document.querySelector('[aria-label=\"قفسهٔ کتاب\"]');return JSON.stringify({inLesson:t,shelfGone:shelfGone});})()"
grep -q 'inLesson\\":true\|"inLesson":true' "$OUT" && ok "C-jump-back-in-lesson" || no "C-jump-failed"

echo "########## D) تعویضِ واقعیِ تب به دیکته ⇒ خانه ⇒ کارت بهروزشده" | tee -a "$OUT"
agent-browser eval "(()=>{
  const tab=[...document.querySelectorAll('button')].find((b)=>(b.innerText||'').trim()==='دیکته'&&b.getBoundingClientRect().width>0);
  if(!tab)return 'NO-TAB';
  tab.click();return 'tab-opened';})()" >/dev/null 2>&1
sleep 1.5
ev "$go_home" >/dev/null 2>&1
wait_sel '[data-lesson-resume]' >/dev/null 2>&1 || { echo "CARD-LOST-AFTER-TAB" | tee -a "$OUT"; agent-browser close >/dev/null 2>&1; exit 1; }
ev "$resume_probe"
grep -q '— دیکته' "$OUT" && ok "D-tab-updated" || no "D-tab-not-reflected"

echo "########## E) درس ۲ + تبِ گرامر ⇒ نردبان + پابرجایِ ری‌لود" | tee -a "$OUT"
agent-browser eval "(()=>{
  const shelf=document.querySelector('[aria-label=\"قفسهٔ کتاب\"]');
  const spines=shelf?shelf.querySelectorAll('button'):[];
  if(spines.length<2)return 'NO-SPINE2';
  spines[1].click();return 'lesson2-opened';})()" >/dev/null 2>&1
sleep 3
agent-browser eval "(()=>{
  const tab=[...document.querySelectorAll('button')].find((b)=>(b.innerText||'').trim()==='گرامر'&&b.getBoundingClientRect().width>0);
  if(!tab)return 'NO-GRAMMAR-TAB';
  tab.click();return 'tab-opened';})()" >/dev/null 2>&1
sleep 1.5
ev "$go_home" >/dev/null 2>&1
wait_sel '[data-lesson-resume]' >/dev/null 2>&1 || { echo "CARD-LOST-AFTER-L2" | tee -a "$OUT"; agent-browser close >/dev/null 2>&1; exit 1; }
ev "$resume_probe"
grep -q 'درسِ ۲ ادامه بده — گرامر' "$OUT" && ok "E-ladder-lesson2-grammar" || no "E-ladder-broken"
agent-browser reload >/dev/null 2>&1
sleep 3
wait_sel '[data-lesson-resume]' >/dev/null 2>&1 || { echo "CARD-LOST-AFTER-RELOAD" | tee -a "$OUT"; agent-browser close >/dev/null 2>&1; exit 1; }
ev "$resume_probe"
grep -q 'درسِ ۲ ادامه بده — گرامر' "$OUT" && ok "E-persists-after-reload" || no "E-record-lost"
shot r361-resume-after-reload.png

echo "########## F) تیره + روشن + کنسول" | tee -a "$OUT"
agent-browser eval "(()=>{document.documentElement.classList.add('dark');return 'DARK';})()" >/dev/null 2>&1
sleep 1
shot r361-resume-dark.png
agent-browser eval "(()=>{document.documentElement.classList.remove('dark');return 'LIGHT';})()" >/dev/null 2>&1
sleep 1
shot r361-resume-light2.png
CONS=$(agent-browser console 2>&1 | grep -ci "error" || true)
[ "${CONS:-0}" = "0" ] && ok "F-console-clean" || no "F-console-has-errors"

agent-browser close >/dev/null 2>&1 || true
echo "########## CLEAN-RUN: $PASS/$FAIL" | tee -a "$OUT"
[ "$FAIL" = "0" ] && echo "QA-R361-CLEAN" || echo "QA-R361-DIRTY"
