#!/usr/bin/env bash
# ------------------------------------------------------------------
# r324 — «قهرمان در گوشهٔ کنکور»: شخصیتِ r323 + دادهٔ کاملِ بانکِ ۳۶۰تایی
#   در سه کورسویی که تا امروز فقط «خالی» دیده بودند (پیشنهادِ ②ِ r323):
#     A. گوشهٔ کنکور با bestCover/bestHard — ۵ KPIِ hero (پوششِ ۹۶/۳۶۰، تسلط،
#        خطایِ بازِ ۸، مرورِ سررسیدِ ۲، رکوردِ ۹۳٪) + نقشهٔ ۳۶۰خانهای + لجند +
#        رکوردِ سه ModeCard + پنلِ «تست‌های سخت من» با بنرِ SRSِ سررسید
#     B. CTAِ «مرور اشتباهات آزمون جامع» — mistakes["0:x-5"/"0:x-23"] روشنش میکند
#     C. زبانهٔ «آزمون» درس — کارتهایِ دسته با «بهترین نتیجه» (L1: واژگان/دستور/
#        املای ۸۵/۸۰/۶۰ — L3: واژگان/مترادف ۸۰/۵۰)
#   ابزار: طبقهبندِ r317 (شش کلاسِ مشروع h+v) + پروبِ basis-صفرِ r319.
#   درسِ ZWNJ: هر تطبیقی با replace(\u200c) — نیمفاصله تایپی در انتخابگر نمیآید.
# تکفراخوانی (الگوی r322/r323): open → seed → سطوح → audit → shot → close
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
DIR=/home/z/my-project/scripts
OUT=/tmp/r324-corners-results.txt
mkdir -p "$EV"; : > "$OUT"

PERSONA=$(node "$DIR/r324-persona.js")

sweep() { # $1 selector — طبقهبندِ h+v از فایل (درسِ r317: قالبِ JS در بش تکخطی نمیشود)
  local JS
  JS=$(sed "s|__SEL__|$1|" "$DIR/r317-sweep.js")
  agent-browser eval "$JS" 2>&1
}
basis() { agent-browser eval "$(cat "$DIR/r319-basis-zero-audit.js")" 2>&1; }
shot() { agent-browser screenshot "$EV/$1" >/dev/null 2>&1; }
stage() { # $1 برچسب — بستهٔ کاملِ ممیزی
  echo "-- $1" | tee -a "$OUT"
  sweep "body" | tee -a "$OUT"
  basis | tee -a "$OUT"
}

click_tool() { # $1 عنوانِ کارتِ ابزار — تطبیقِ بی‌نیمفاصله (درسِ r319)
  agent-browser eval "(()=>{const g=document.querySelector('[aria-label=\"ابزارهای یادگیری\"]');if(!g)return 'NO-GRID';const b=[...g.querySelectorAll('button')].find(x=>(x.textContent||'').replace(/\\u200c/g,'').includes('$1'));if(!b)return 'NO-BTN';b.click();return 'clicked';})()" 2>&1
}
open_spine() { # $1 برچسبِ قفسه (L1..L12) — تطبیقِ دقیقِ en-text (نه L1 داخلِ L10)
  agent-browser eval "(()=>{const s=[...document.querySelectorAll('.book-spine .en-text')].find(x=>x.textContent?.trim()==='$1');if(!s)return 'NO-SPINE';const b=s.closest('button');if(!b)return 'NO-BTN';b.click();return 'clicked';})()" 2>&1
}
click_tab_safe() { # $1 متنِ زبانه — تطبیقِ بی‌نیمفاصله (زبانهٔ «تست‌ها» نیمفاصله دارد — درسِ ZWNJ)
  agent-browser eval "(()=>{const nav=[...document.querySelectorAll('nav')].find(n=>(n.getAttribute('aria-label')||'').includes('درس'));if(!nav)return 'NO-NAV';const b=[...nav.querySelectorAll('button')].find(x=>(x.textContent||'').replace(/\\u200c/g,'').trim()==='$1');if(!b)return 'NO-TAB';b.click();return 'clicked';})()" 2>&1
}
probe() { agent-browser eval "$1" 2>&1; }
go_home() { agent-browser open "$BASE" >/dev/null 2>&1; sleep 2.5; }

agent-browser open "$BASE" >/dev/null 2>&1
agent-browser set viewport 390 844 >/dev/null 2>&1
agent-browser wait 'body' >/dev/null 2>&1 || true
sleep 1.5
# تزریقِ شخصیتِ قهرمان+کنکور (JSON داده است نه کد — جایگذاریِ امن)
agent-browser eval "(()=>{localStorage.setItem('vision2-study-v1', JSON.stringify(${PERSONA})); location.reload(); return 'champion-konkur-seeded';})()" >/dev/null 2>&1
sleep 4

echo "########## STAGE A — گوشهٔ کنکور ##########" | tee -a "$OUT"
KT=$(click_tool "کنکور")
echo "click_tool=$KT" | tee -a "$OUT"
sleep 3

echo "########## MOUNT PROBE (konkur) ##########" | tee -a "$OUT"
probe "(()=>{const t=document.body.innerText;const map=document.querySelector('[role=\"img\"][aria-label*=\"نقشهٔ پیشرفت بانک کنکور\"]');return JSON.stringify({
  hero: t.includes('پوشش بانک') && t.includes('۹۶ از ۳۶۰'),
  mastery: t.includes('تسلط'),
  wrongKpi: t.includes('خطای باز') && t.includes('۸'),
  dueKpi: t.includes('مرور سررسید') && t.includes('۲'),
  simBest: t.includes('رکورد شبیه‌ساز') && t.includes('۹۳٪'),
  mapLabel: (map?.getAttribute('aria-label')||'').includes('۹۶ دیده‌شده از ۳۶۰'),
  legend: t.includes('مسلط (۸۸)') && t.includes('غلط اخیر (۸)') && t.includes('دیده‌نشده (۲۶۴)'),
  cells: document.querySelectorAll('[role=\"img\"][aria-label*=\"نقشهٔ پیشرفت\"] div[title]').length,
  recSim: t.includes('رکورد: ۹۳٪'), recHard: t.includes('رکورد: ۵۸٪'), recCover: t.includes('رکورد: ۹۵٪'),
  hardBadge: t.includes('تست‌های سخت من'),
});})()" | tee -a "$OUT"

stage "konkur-light-390"
shot r324-konkur-light-390.png

# — پنلِ «تست‌های سخت من» (ModeCard دوم — تنها دکمهای که «من» دارد) —
HP=$(probe "(()=>{const b=[...document.querySelectorAll('button')].find(x=>(x.textContent||'').replace(/\\u200c/g,'').includes('تستهای سخت من'));if(!b)return 'NO-HARDCARD';b.click();return 'clicked';})()")
echo "hard-card=$HP" | tee -a "$OUT"
sleep 2
echo "########## HARD PANEL PROBE ##########" | tee -a "$OUT"
probe "(()=>{const t=document.body.innerText;return JSON.stringify({
  openBanner: t.includes('۸ تست سختِ باز داری'),
  srsBanner: t.includes('۲ تست سررسیدِ مرور دارد'),
  startBtn: t.includes('شروع مرور تست‌های سخت (۸ تست)'),
});})()" | tee -a "$OUT"
stage "konkur-hard-panel-390"
shot r324-konkur-hard-390.png

# — تاریک —
agent-browser eval "(()=>{localStorage.setItem('theme','dark');location.reload();return 'dark-set';})()" >/dev/null 2>&1
sleep 4
KT2=$(click_tool "کنکور"); sleep 3
echo "dark reenter=$KT2" | tee -a "$OUT"
stage "konkur-dark-390"
shot r324-konkur-dark-390.png
agent-browser eval "(()=>{localStorage.setItem('theme','light');location.reload();return 'light-back';})()" >/dev/null 2>&1
sleep 4

# — دسکتاپ (نقشه: grid-cols-20) —
agent-browser set viewport 1280 800 >/dev/null 2>&1
sleep 1.5
KT3=$(click_tool "کنکور"); sleep 3
echo "desktop reenter=$KT3" | tee -a "$OUT"
stage "konkur-desktop-1280"
shot r324-konkur-desktop-1280.png
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 1.5

echo "########## STAGE B — CTAِ مرور اشتباهات آزمون جامع ##########" | tee -a "$OUT"
go_home
ET=$(click_tool "آزمون جامع")
echo "click_tool=$ET" | tee -a "$OUT"
sleep 2.5
echo "########## EXAM MISTAKES PROBE ##########" | tee -a "$OUT"
probe "(()=>{const t=document.body.innerText;return JSON.stringify({
  cta: t.includes('مرور اشتباهات آزمون جامع'),
  count: t.includes('۲ سؤال از بانک ۳۶۰ تستی که اشتباه جواب داده‌ای') || t.includes('سؤال از بانک ۳۶۰'),
  bestExam: t.includes('۹۰٪'),
});})()" | tee -a "$OUT"
stage "exam-mistakes-cta-390"
shot r324-exam-mistakes-cta-390.png

echo "########## STAGE C — زبانهٔ آزمونِ درس ##########" | tee -a "$OUT"
go_home
echo "spine L1: $(open_spine L1)" | tee -a "$OUT"
sleep 2.6
echo "tab: $(click_tab_safe 'تستها')" | tee -a "$OUT"
sleep 2
echo "########## L1 TESTS PROBE ##########" | tee -a "$OUT"
# درسِ کشفِ راند: زبانهٔ «تست‌ها» فقط سه دسته دارد (vocab / vocab-konkuri / grammar) —
# نتیجهٔ دیکته اینجا کارت ندارد (زبانهٔ دیکته موتورِ تمرین است نه کارنامه)
probe "(()=>{const t=document.body.innerText;return JSON.stringify({
  bestVocab: t.includes('بهترین نتیجه: 85٪ (17/20)'),
  bestGrammar: t.includes('بهترین نتیجه: 80٪ (8/10)'),
  bestCount: (t.match(/بهترین نتیجه/g)||[]).length,
  konkuriCard: t.includes('سطح کنکوری'),
  mistakeReview: t.includes('مرور اشتباهات'),
  mixed: t.includes('تست ترکیبی'),
});})()" | tee -a "$OUT"
stage "lesson1-tests-390"
shot r324-lesson1-tests-390.png

go_home
echo "spine L3: $(open_spine L3)" | tee -a "$OUT"
sleep 2.6
echo "tab: $(click_tab_safe 'تستها')" | tee -a "$OUT"
sleep 2
echo "########## L3 TESTS PROBE ##########" | tee -a "$OUT"
probe "(()=>{const t=document.body.innerText;return JSON.stringify({
  bestVocab: t.includes('بهترین نتیجه: 80٪ (12/15)'),
  bestCount: (t.match(/بهترین نتیجه/g)||[]).length,
});})()" | tee -a "$OUT"
stage "lesson3-tests-390"
shot r324-lesson3-tests-390.png

# — زبانهٔ «مترادف و متضاد» L3 — چیپِ «بهترین نتیجه» با faNum (برخلافِ کارتِ تست که لاتین است) —
echo "tab-synant: $(click_tab_safe 'مترادف و متضاد')" | tee -a "$OUT"
sleep 2
echo "########## L3 SYNANT PROBE ##########" | tee -a "$OUT"
probe "(()=>{const t=document.body.innerText;return JSON.stringify({
  bestFa: t.includes('بهترین نتیجه: ۵۰٪'),
  counts: t.includes('مترادف:') || t.includes('متضاد:'),
});})()" | tee -a "$OUT"
stage "lesson3-synant-390"
shot r324-lesson3-synant-390.png

agent-browser close >/dev/null 2>&1
echo "DONE r324 corners" | tee -a "$OUT"
