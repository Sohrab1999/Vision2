#!/usr/bin/env bash
# ------------------------------------------------------------------
# r337 — «سویپِ زندهٔ هدرِ شخصیت‌دار در دسکتاپِ ۱۲۸۰» — پیشنهادِ ②ِ r336:
#   چهار عضوِ دیگرِ خانوادهٔ c-chip (due/goal/goal-done/freeze) با دادهٔ
#   پُر در دو تم، بهعلاوهٔ حالتِ خالی (rookie) و موبایلِ ۳۹۰.
#   dbgِ هدر-scoped (r337-header-dbg.js — فقط درختِ header) در هر مرحله.
#   کشفِ مسیرِ ساختِ persona: حبهٔ مرور کلیدِ واژه میخواهد نه "q:" (F11)
#   → در هیچ persona-sویپی قبلی mount نشده بود.
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
DIR=/home/z/my-project/scripts
OUT=/tmp/r337-header-sweep.txt
mkdir -p "$EV"; : > "$OUT"

dbg()  { echo "-- [header-dbg] $1" | tee -a "$OUT"; agent-browser eval "$(cat "$DIR/r337-header-dbg.js")" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
dbg0() { echo "-- [basis-zero/whole-page] $1" | tee -a "$OUT"; agent-browser eval "$(cat "$DIR/r319-basis-zero-audit.js")" 2>&1 | tail -3 | tee -a "$OUT"; echo | tee -a "$OUT"; }
shot() { agent-browser screenshot "$EV/$1" >/dev/null 2>&1; }
to_dark_inplace()   { agent-browser eval "(()=>{document.documentElement.classList.add('dark');return 'd';})()" >/dev/null 2>&1; sleep 1.2; }
back_light_inplace(){ agent-browser eval "(()=>{document.documentElement.classList.remove('dark');return 'l';})()" >/dev/null 2>&1; sleep 1.2; }

# seed واریانت + reload (تحمیلِ صریحِ روشن — درسِ r335)
seed() { # $1 = variant
  local P; P=$(node "$DIR/r337-persona.js" "$1") || return 1
  agent-browser eval "(()=>{localStorage.setItem('vision2-study-v1', JSON.stringify(${P}));localStorage.setItem('theme','light');location.reload();return 's';})()" >/dev/null 2>&1
  sleep 4
  agent-browser eval "(()=>{document.documentElement.classList.remove('dark');return 'l';})()" >/dev/null 2>&1
  sleep 1
}

# پروبِ سوارشدنِ خانوادهٔ c-chip + متنِ هر عضو
probe_chips() {
  agent-browser eval "(()=>{
    const vis=(s)=>{const e=document.querySelector(s);if(!e)return 0;const r=e.getBoundingClientRect();return r.width>0&&r.height>0?1:0;};
    const txt=(s)=>{const e=document.querySelector(s);return e?(e.textContent||'').trim().slice(0,22):'-';};
    return JSON.stringify({
      flame:vis('.c-chip-flame'),flameTxt:txt('.c-chip-flame'),
      due:vis('.due-pill'),dueTxt:txt('.due-pill'),dueAria:(document.querySelector('.due-pill')?.getAttribute('aria-label')||'-').slice(0,40),
      goal:vis('.goal-chip'),goalTxt:txt('.goal-chip'),goalDone:!!document.querySelector('.goal-chip.bg-emerald-700'),
      freeze:vis('.freeze-badge'),freezeTxt:txt('.freeze-badge'),freezeAria:(document.querySelector('.freeze-badge')?.getAttribute('aria-label')||'-').slice(0,40),
      resume:vis('[class*=resume]' )
    });})()" 2>&1 | tee -a "$OUT"
}

echo "########## واریانتِ full — دسکتاپِ ۱۲۸۰ (روشن، تحمیلِ صریح)" | tee -a "$OUT"
agent-browser close >/dev/null 2>&1 || true
agent-browser open "$BASE" >/dev/null 2>&1
agent-browser set viewport 1280 900 >/dev/null 2>&1
agent-browser wait 'body' >/dev/null 2>&1 || true
sleep 2
seed full || { echo "SEED-FAIL" | tee -a "$OUT"; agent-browser close >/dev/null 2>&1; exit 1; }
echo "-- chips:" | tee -a "$OUT"; probe_chips
dbg "header-full-light-1280"
shot "r337-header-full-light.png"
dbg0 "basis-zero-home-1280-light"

echo "########## full — تاریکِ درجا" | tee -a "$OUT"
to_dark_inplace
echo "-- chips:" | tee -a "$OUT"; probe_chips
dbg "header-full-dark-inplace-1280"
shot "r337-header-full-dark.png"
back_light_inplace

echo "########## واریانتِ goal-done — هدفِ ۱۰/۱۰ (شاخهٔ توپرِ زمردی)" | tee -a "$OUT"
seed goal-done
echo "-- chips:" | tee -a "$OUT"; probe_chips
dbg "header-goal-done-light-1280"
shot "r337-header-goal-done-light.png"
to_dark_inplace
dbg "header-goal-done-dark-inplace-1280"
shot "r337-header-goal-done-dark.png"
back_light_inplace

echo "########## واریانتِ freeze-saved — «نجات شد»" | tee -a "$OUT"
seed freeze-saved
echo "-- chips:" | tee -a "$OUT"; probe_chips
dbg "header-freeze-saved-light-1280"
shot "r337-header-freeze-saved-light.png"
to_dark_inplace
dbg "header-freeze-saved-dark-inplace-1280"
shot "r337-header-freeze-saved-dark.png"
back_light_inplace

echo "########## واریانتِ empty — rookie (تنها GoalChip «۰ از ۱۰»)" | tee -a "$OUT"
seed empty
echo "-- chips:" | tee -a "$OUT"; probe_chips
dbg "header-empty-light-1280"
shot "r337-header-empty-light.png"
to_dark_inplace
dbg "header-empty-dark-inplace-1280"
shot "r337-header-empty-dark.png"
back_light_inplace

echo "########## full در موبایلِ ۳۹۰ — شعله/یخ مخفی، حبه/هدف کوتاه" | tee -a "$OUT"
seed full
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 1.5
echo "-- chips:" | tee -a "$OUT"; probe_chips
dbg "header-full-light-390"
shot "r337-header-full-390-light.png"
to_dark_inplace
dbg "header-full-dark-inplace-390"
shot "r337-header-full-390-dark.png"
back_light_inplace

echo "########## DONE" | tee -a "$OUT"
agent-browser close >/dev/null 2>&1
echo "log=$OUT"
