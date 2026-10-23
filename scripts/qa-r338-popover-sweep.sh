#!/usr/bin/env bash
# ------------------------------------------------------------------
# r338 — «سویپِ زندهٔ دو پاپ‌آورِ هدر در دسکتاپِ ۱۲۸۰» — پیشنهادِ ②ِ r337:
#   SettingsPopover (تنظیمات) و ProfilePopover (پروفایل من) با دادهٔ پُر
#   (شخصیتِ popوور-پُرِ r338: رزومهٔ ضمیمه + تاریخچهٔ ۳تایی + پشتیبانِ خودکار)
#   در دو تم + عبورِ تعاملی (سوییچِ کاهش حرکت در حالتِ checked) + موبایلِ ۳۹۰.
#   dbgِ popوور-scoped (r338-popover-dbg.js — درختِ wrapperِ پورتالشدهٔ رادیکس)
#   در هر مرحله + پروبِ mount (r338-popover-probe.js) تا «صفر» بدونِ mount
#   فریبنده نباشد (درسِ r337).
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
DIR=/home/z/my-project/scripts
OUT=/tmp/r338-sweep.txt
mkdir -p "$EV"; : > "$OUT"

probe() { echo "-- [probe] $1" | tee -a "$OUT"; agent-browser eval "$(cat "$DIR/r338-popover-probe.js")" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
dbg()  { echo "-- [popover-dbg] $1" | tee -a "$OUT"; agent-browser eval "$(cat "$DIR/r338-popover-dbg.js")" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
dbg0() { echo "-- [basis-zero/whole-page] $1" | tee -a "$OUT"; agent-browser eval "$(cat "$DIR/r319-basis-zero-audit.js")" 2>&1 | tail -3 | tee -a "$OUT"; echo | tee -a "$OUT"; }
shot() { agent-browser screenshot "$EV/$1" >/dev/null 2>&1; }
to_dark_inplace()   { agent-browser eval "(()=>{document.documentElement.classList.add('dark');return 'd';})()" >/dev/null 2>&1; sleep 1.2; }
back_light_inplace(){ agent-browser eval "(()=>{document.documentElement.classList.remove('dark');return 'l';})()" >/dev/null 2>&1; sleep 1.2; }
esc() { agent-browser press Escape >/dev/null 2>&1; sleep 0.8;
  # درسِ راند: محتوای Radix در حالِ animate-out رویِ تریگر میماند و کلیکِ
  # واقعیِ Playwright «covered» را رد میکند — بستنهایِ گیرکرده تخلیه میشوند.
  agent-browser eval "(()=>{let n=0;for(let i=0;i<20;i++){const w=[...document.querySelectorAll('[data-radix-popper-content-wrapper]')].filter(x=>x.querySelector('[data-state=\\"closed\\"]'));if(!w.length)break;w.forEach(x=>x.remove());n+=w.length;}return 'cleaned='+n;})()" >/dev/null 2>&1
  sleep 0.3
}
open_until() { # $1 = selector تریگر — با بازرسیِ wrapperِ OPEN تا ۳ بار
  for i in 1 2 3; do
    agent-browser eval "(()=>{[...document.querySelectorAll('[data-radix-popper-content-wrapper]')].filter(x=>x.querySelector('[data-state=\"closed\"]')).forEach(x=>x.remove());return 'pre-clean';})()" >/dev/null 2>&1
    agent-browser click "$1" >/dev/null 2>&1
    sleep 1.5
    local W; W=$(agent-browser eval "[...document.querySelectorAll('[data-radix-popper-content-wrapper]')].filter(x=>x.getBoundingClientRect().width>0 && x.querySelector('[data-state=open]')).length" 2>/dev/null | tr -d '"')
    if [ "$W" != "0" ] && [ -n "$W" ]; then echo "open#$i=OK"; return 0; fi
    sleep 1
  done
  echo "OPEN-FAIL $1"; return 1
}

# کنترلِ منفی (درسِ راند): طبقه‌بندی که حلقهٔ داوری را گم کند «صفرِ» بیارزش
# تولید میکند — گرهِ مردودِ شناختهشده (زمردی۱۰۰ روشن + جوهرِ ۷۰۰ تاریکشده =
# ۱٫۳۴) داخلِ پاپ‌آورِ باز کاشته میشود؛ dbg باید >=۱ مردود بدهد وگرنه ABORT.
negctl() { # $1 = برچسب
  agent-browser eval "(()=>{const w=[...document.querySelectorAll('[data-radix-popper-content-wrapper]')].find(w=>w.getBoundingClientRect().width>0);if(!w)return 'NO-WRAPPER';const d=document.createElement('div');d.id='r338-negctl';d.style.cssText='background:#d1fae5;color:#6ee7b7;font-size:12px;padding:4px';d.textContent='کنترلِ منفیِ r338';w.firstElementChild.appendChild(d);return 'PLANTED';})()" >/dev/null 2>&1
  local RES; RES=$(agent-browser eval "$(cat "$DIR/r338-popover-dbg.js")" 2>/dev/null)
  agent-browser eval "(()=>{document.getElementById('r338-negctl')?.remove();return 'rm';})()" >/dev/null 2>&1
  echo "-- [negctl] $1 → ${RES:0:120}" | tee -a "$OUT"
  if ! echo "$RES" | rg -q 'fails\\?": ?[1-9]'; then
    echo "NEGCTL-FAIL: طبقه‌بند مردودِ شناختهشده را ندید — ابزارِ راند نامعتبر است (درسِ حلقهٔ گمشده)" | tee -a "$OUT"
    return 1
  fi
  echo "-- negctl=OK" | tee -a "$OUT"
}

echo "########## seedِ popوور-پُر + دسکتاپِ ۱۲۸۰ (روشنِ تحمیلی)" | tee -a "$OUT"
agent-browser close >/dev/null 2>&1 || true
agent-browser open "$BASE" >/dev/null 2>&1
agent-browser set viewport 1280 900 >/dev/null 2>&1
agent-browser wait 'body' >/dev/null 2>&1 || true
sleep 2
node "$DIR/r338-persona.js" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>process.stdout.write(JSON.parse(s).browserEval))" > /tmp/r338-seed-eval.js || { echo "PERSONA-FAIL" | tee -a "$OUT"; exit 1; }
agent-browser eval "$(cat /tmp/r338-seed-eval.js)" >/dev/null 2>&1
sleep 4
agent-browser eval "(()=>{document.documentElement.classList.remove('dark');return 'l';})()" >/dev/null 2>&1
sleep 1
echo "-- [probe] header-persona (قبل از بازکردن — گاردِ سختِ seed)" | tee -a "$OUT"
agent-browser eval "(()=>{const v=(s)=>{const e=document.querySelector(s);if(!e)return 0;const r=e.getBoundingClientRect();return r.width>0?1:0;};return JSON.stringify({flame:v('.c-chip-flame'),due:v('.due-pill'),goal:v('.goal-chip'),freeze:v('.freeze-badge'),profileTrigger:v('[aria-label=\"پروفایل من\"]'),settingsTrigger:v('[aria-label=\"تنظیمات\"]')});})()" 2>&1 | tee -a "$OUT"
echo | tee -a "$OUT"
GUARD=$(agent-browser eval "(()=>{const v=(s)=>{const e=document.querySelector(s);if(!e)return 0;const r=e.getBoundingClientRect();return r.width>0?1:0;};return (v('.c-chip-flame')&&v('[aria-label=\"پروفایل من\"]')&&v('.freeze-badge'))?1:0;})()" 2>/dev/null | tr -d '"')
if [ "$GUARD" != "1" ]; then
  echo "SEED-GUARD-FAIL: persona mount نشد (درسِ راند: persist شکلِ {state,version} میخواهد — browserEval را بسنجید)" | tee -a "$OUT"
  agent-browser close >/dev/null 2>&1
  exit 1
fi
echo "-- seed-guard=OK" | tee -a "$OUT"

echo "########## SETTINGS — روشن ۱۲۸۰" | tee -a "$OUT"
open_until '[aria-label="تنظیمات"]' | tee -a "$OUT"
probe "settings-open-light"
negctl "settings-light-1280" || { agent-browser close >/dev/null 2>&1; exit 1; }
dbg "settings-light-1280"
shot "r338-settings-light.png"

echo "########## SETTINGS — تاریکِ درجا" | tee -a "$OUT"
to_dark_inplace
probe "settings-open-dark"
dbg "settings-dark-inplace-1280"
shot "r338-settings-dark.png"

echo "########## SETTINGS — تعامل: سوییچِ کاهش حرکت → checked" | tee -a "$OUT"
agent-browser click '[aria-label="کاهش حرکت و انیمیشن"]' >/dev/null 2>&1
sleep 1
probe "settings-motion-checked-dark"
dbg "settings-motion-checked-dark-1280"
shot "r338-settings-motion-checked-dark.png"
agent-browser click '[aria-label="کاهش حرکت و انیمیشن"]' >/dev/null 2>&1
sleep 0.6
back_light_inplace
esc

echo "########## PROFILE — روشن ۱۲۸۰" | tee -a "$OUT"
open_until '[aria-label="پروفایل من"]' | tee -a "$OUT"
probe "profile-open-light"
negctl "profile-light-1280" || { agent-browser close >/dev/null 2>&1; exit 1; }
dbg "profile-light-1280"
shot "r338-profile-light.png"

echo "########## PROFILE — تاریکِ درجا" | tee -a "$OUT"
to_dark_inplace
probe "profile-open-dark"
dbg "profile-dark-inplace-1280"
shot "r338-profile-dark.png"
back_light_inplace
esc
sleep 0.5

echo "########## موبایلِ ۳۹۰ — هر دو پاپ‌آور، هر دو تم" | tee -a "$OUT"
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 1.2
open_until '[aria-label="تنظیمات"]' | tee -a "$OUT"
probe "settings-390-light"
dbg "settings-390-light"
shot "r338-settings-390-light.png"
to_dark_inplace
dbg "settings-390-dark"
shot "r338-settings-390-dark.png"
back_light_inplace
esc
sleep 0.5
# r338 — کلاسترِ هدر در ۳۹۰ اسکرولِ افقی دارد (اصلاحِ همین راند): تریگرِ
#   پروفایل DOM-آخرِ کلاستر = منتهیالیهٔ چپِ RTL — به چپ اسکرول میکنیم.
echo "-- [scroll-cluster] $(agent-browser eval "(()=>{const c=document.querySelector('header div.overflow-x-auto');if(!c)return 'NO-CLUSTER';c.scrollLeft=-(c.scrollWidth-c.clientWidth);return 'scrolled='+Math.round(c.scrollLeft)+' overflow='+Math.round(c.scrollWidth-c.clientWidth);})()" 2>&1)" | tee -a "$OUT"
sleep 0.5
open_until '[aria-label="پروفایل من"]' | tee -a "$OUT"
probe "profile-390-light"
dbg "profile-390-light"
shot "r338-profile-390-light.png"
to_dark_inplace
dbg "profile-390-dark"
shot "r338-profile-390-dark.png"
back_light_inplace
esc

echo "########## basis-zeroِ صفحهٔ خانه (پس از همه)" | tee -a "$OUT"
dbg0 "home-after-sweep-390"

echo "########## DONE" | tee -a "$OUT"
agent-browser close >/dev/null 2>&1
echo "log=$OUT"
