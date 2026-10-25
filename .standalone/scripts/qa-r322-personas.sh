#!/usr/bin/env bash
# ------------------------------------------------------------------
# r322 — «شخصیت‌های داده»: ممیزیِ پنل‌های hasProgress در حالتِ پُر.
#   درسِ r321: پنل‌های شرطیِ «دارای پیشرفت» با seedِ تازه نامرئی‌اند؛
#   r319 home-progress فقط known:{book:true} داد (حالتِ خالی). این راننده
#   شخصیتِ «قهرمان» را تزریق میکند (۳۰ واژه + نتایج + SRS سرآمد + واژه‌های
#   خطرناک + هفت روزِ تاریخچه) تا هر پنج پنل با دادهٔ واقعی سنجیده شوند:
#     WeeklyChart (هفتگی + ۳۰روزه) · VocabDonut · SrsPanel · SkillPanel · DangerWords
#   ابزار: طبقهبندِ r317 (پنج کلاسِ مشروع h+v) + پروبِ basis-صفرِ r319.
#   سه فاز: روشنِ ۳۹۰ (خانه + ماهانه + دیالوگِ فلش‌کارتِ خطر) / تاریکِ ۳۹۰ /
#   دسکتاپِ ۱۲۸۰.
# تکفراخوانی (الگویِ r308/r318/r319): open → seed → سطوح → audit → shot → close
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
DIR=/home/z/my-project/scripts
OUT=/tmp/r322-personas-results.txt
mkdir -p "$EV"; : > "$OUT"

PERSONA=$(node "$DIR/r322-persona.js" champion)

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

agent-browser open "$BASE" >/dev/null 2>&1
agent-browser set viewport 390 844 >/dev/null 2>&1
agent-browser wait 'body' >/dev/null 2>&1 || true
sleep 1.5
# تزریقِ شخصیتِ قهرمان (JSON داده است نه کد — جایگذاریِ امن)
agent-browser eval "(()=>{localStorage.setItem('vision2-study-v1', JSON.stringify(${PERSONA})); location.reload(); return 'champion-seeded';})()" >/dev/null 2>&1
sleep 4

echo "########## MOUNT PROBE ##########" | tee -a "$OUT"
agent-browser eval "(()=>{const t=document.body.innerText;return JSON.stringify({
  user: (JSON.parse(localStorage.getItem('vision2-study-v1')||'{}').state||{}).userName,
  weekly: !!document.querySelector('[aria-label=\"فعالیت هفتگی\"]'),
  donut: !!document.querySelector('[aria-label=\"پیشرفت واژگان\"]'),
  srs: !!document.querySelector('[aria-label=\"داشبورد مرور هوشمند\"]'),
  skill: !!document.querySelector('[aria-label=\"تحلیل مهارت‌ها\"]'),
  danger: t.includes('واژه‌های خطرناک'),
  starter: !!document.querySelector('[class*=\"home-starter\"]'),
});})()" 2>&1 | tee -a "$OUT"

echo "########## LIGHT 390 ##########" | tee -a "$OUT"
stage "home-champion"
shot r322-home-champion-390.png

# نمای ماهانه — نقشهٔ حرارتیِ ۳۰روزه با سه خالِ دور (هرگز با داده سنجیده نشده)
agent-browser eval "(()=>{const tl=document.querySelector('[aria-label=\"بازهٔ نمودار\"]');if(!tl)return 'NO-TABLIST';const b=[...tl.querySelectorAll('[role=tab]')].find(x=>x.textContent?.includes('۳۰ روزه'));if(!b)return 'NO-TAB';b.click();return 'month-on';})()" 2>&1 | tee -a "$OUT"
sleep 1.2
stage "home-month"
shot r322-home-month-390.png
agent-browser eval "(()=>{const tl=document.querySelector('[aria-label=\"بازهٔ نمودار\"]');const b=[...tl.querySelectorAll('[role=tab]')].find(x=>x.textContent?.includes('هفتگی'));if(b)b.click();return 'week-back';})()" >/dev/null 2>&1
sleep 1

# دیالوگِ فلش‌کارتِ واژه‌های خطرناک — پنجرهٔ واقعیِ تمرین با داده
agent-browser eval "(()=>{const t=document.body.innerText;if(!t.includes('واژه‌های خطرناک'))return 'NO-DANGER';const b=[...document.querySelectorAll('button')].find(x=>x.textContent?.includes('فلش‌کارت همین‌ها'));if(!b)return 'NO-CTA';b.click();return 'flash-open';})()" 2>&1 | tee -a "$OUT"
sleep 2.2
stage "danger-flashcards"
shot r322-danger-flash-390.png
agent-browser press Escape >/dev/null 2>&1
sleep 0.8

echo "########## DARK 390 ##########" | tee -a "$OUT"
agent-browser eval "(()=>{localStorage.setItem('theme','dark');location.reload();return 'dark-set';})()" >/dev/null 2>&1
sleep 4
stage "home-champion-dark"
shot r322-home-champion-dark-390.png
agent-browser eval "(()=>{localStorage.setItem('theme','light');return 'light-back';})()" >/dev/null 2>&1

echo "########## DESKTOP 1280 ##########" | tee -a "$OUT"
agent-browser set viewport 1280 900 >/dev/null 2>&1
sleep 2
agent-browser eval "(()=>{location.reload();return 'reload';})()" >/dev/null 2>&1
sleep 4
stage "home-champion-desktop"
shot r322-home-champion-1280.png

agent-browser close >/dev/null 2>&1
pkill -f "chrome" 2>/dev/null || true
echo "== done ==" | tee -a "$OUT"
echo "== خلاصه در $OUT =="
