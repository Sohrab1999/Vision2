#!/usr/bin/env bash
# ------------------------------------------------------------------
# r326 — «سویپِ کنتراستِ خانوادگی»: متن-روی-رنگ در همهٔ سطوحِ پُرشده
#   پیشنهادِ ②ِ r325: رزولورِ بومیِ r325 (بومِ 1×1) به خانواده گسترش یافت —
#   چیپهای ریسک واژه، بنرهای SRS، نشانها (کارتِ گرادیانی + پاپاَور)،
#   جوهرِ گرادیانیِ هیرو، چیپهای tier هفتهنامه/کارنامه — در دو تم.
#   شخصیت: قهرمانِ r325 (تکمنحه — srsِ سررسیده و واژههای خطرناکِ r323،
#   تقویمِ ۳۰روزه و داستانها و کنکورِ r324/r325 همگی یکجا) + رولایهٔ
#   freezeCount=1 تا چیپِ یخِ هدر هم رندر شود.
# تکفراخوانی: open → seed → سطوح → audit → shot → close
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
DIR=/home/z/my-project/scripts
OUT=/tmp/r326-contrast-results.txt
mkdir -p "$EV"; : > "$OUT"

PERSONA=$(node "$DIR/r325-persona.js" | node -e 'let s="";process.stdin.on("data",d=>s+=d);process.stdin.on("end",()=>{const o=JSON.parse(s);o.state.freezeCount=1;console.log(JSON.stringify(o))})')

sweep() { agent-browser eval "$(cat "$DIR/r326-contrast-sweep.js")" 2>&1; }
shot() { agent-browser screenshot "$EV/$1" >/dev/null 2>&1; }
stage() { echo "-- $1" | tee -a "$OUT"; sweep | tee -a "$OUT"; }
set_theme() { agent-browser eval "(()=>{localStorage.setItem('theme','$1');location.reload();return 'theme-$1';})()" >/dev/null 2>&1; sleep 3.5; }

agent-browser open "$BASE" >/dev/null 2>&1
agent-browser set viewport 390 844 >/dev/null 2>&1
agent-browser wait 'body' >/dev/null 2>&1 || true
sleep 1.5
# تزریقِ قهرمانِ +freeze (JSON داده است نه کد — جایگذاریِ امن)
agent-browser eval "(()=>{localStorage.setItem('vision2-study-v1', JSON.stringify(${PERSONA})); location.reload(); return 'champion+freeze-seeded';})()" >/dev/null 2>&1
sleep 4

echo "########## MOUNT PROBE ##########" | tee -a "$OUT"
agent-browser eval "(()=>{const st=JSON.parse(localStorage.getItem('vision2-study-v1')||'{}').state||{};const t=document.body.innerText;return JSON.stringify({
  user: st.userName,
  duePill: !!document.querySelector('.due-pill'),
  freezeBadge: !!document.querySelector('.freeze-badge'),
  badgesSection: !!document.querySelector('[aria-label=\"نشان‌ها و دستاوردها\"]'),
  srsPanel: !!document.querySelector('.srs-panel'),
  dangerPanel: !!document.querySelector('[aria-label=\"واژه‌های خطرناک من\"]'),
  goalChipDone: !!document.querySelector('.goal-chip.bg-emerald-600'),
  unlockedBadgeCards: document.querySelectorAll('.badge-card.bg-gradient-to-b').length,
});})()" 2>&1 | tee -a "$OUT"

echo "########## H1. HOME — LIGHT 390 ##########" | tee -a "$OUT"
stage "home-light-390"
shot r326-home-light-390.png

echo "########## H2. HOME — DARK 390 ##########" | tee -a "$OUT"
set_theme dark
stage "home-dark-390"
shot r326-home-dark-390.png

echo "########## H3. HOME — DESKTOP 1280 ##########" | tee -a "$OUT"
agent-browser set viewport 1280 900 >/dev/null 2>&1
sleep 1.5
agent-browser eval "(()=>{location.reload();return 'reload';})()" >/dev/null 2>&1
sleep 3.5
stage "home-desktop-1280"
shot r326-home-1280.png

echo "########## B1. BADGE POPOVER — LIGHT 390 ##########" | tee -a "$OUT"
set_theme light
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 2
agent-browser eval "(()=>{const b=document.querySelector('[aria-label^=\"جزئیات نشان\"]');if(!b)return 'NO-BADGE';b.click();return 'popover-open';})()" 2>&1 | tee -a "$OUT"
sleep 1.5
stage "badge-popover-light-390"
shot r326-badge-popover-light-390.png
agent-browser press Escape >/dev/null 2>&1 || true
sleep 1

echo "########## R1. WEEKLY REPORT — LIGHT 390 ##########" | tee -a "$OUT"
agent-browser eval "(()=>{window.dispatchEvent(new Event('open-report'));return 'weekly-open';})()" 2>&1 | tee -a "$OUT"
sleep 2.5
stage "report-weekly-light-390"
shot r326-report-weekly-light-390.png

echo "########## R2. WEEKLY REPORT — DARK 390 ##########" | tee -a "$OUT"
set_theme dark
agent-browser eval "(()=>{window.dispatchEvent(new Event('open-report'));return 'weekly-open-dark';})()" 2>&1 | tee -a "$OUT"
sleep 2.5
stage "report-weekly-dark-390"
shot r326-report-weekly-dark-390.png
agent-browser press Escape >/dev/null 2>&1 || true
sleep 1

echo "########## O1. OFFICIAL REPORT — LIGHT 390 ##########" | tee -a "$OUT"
set_theme light
agent-browser eval "(()=>{window.dispatchEvent(new Event('open-official-report'));return 'official-open';})()" 2>&1 | tee -a "$OUT"
sleep 3
stage "report-official-light-390"
shot r326-report-official-light-390.png

echo "########## O2. OFFICIAL REPORT — DARK 390 ##########" | tee -a "$OUT"
set_theme dark
agent-browser eval "(()=>{window.dispatchEvent(new Event('open-official-report'));return 'official-open-dark';})()" 2>&1 | tee -a "$OUT"
sleep 3
stage "report-official-dark-390"
shot r326-report-official-dark-390.png
agent-browser press Escape >/dev/null 2>&1 || true
agent-browser eval "(()=>{localStorage.setItem('theme','light');return 'light-back';})()" >/dev/null 2>&1

agent-browser close >/dev/null 2>&1
pkill -f "chrome" 2>/dev/null || true
echo "== done ==" | tee -a "$OUT"
echo "== خلاصه در $OUT =="
