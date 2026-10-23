#!/usr/bin/env bash
# ------------------------------------------------------------------
# r339 — «نخستین داوریِ زندهٔ دو دیالوگِ ثالث در دسکتاپِ ۱۲۸۰» — پیشنهادِ ③ِ r338:
#   ShortcutGuide (راهنمای میان‌برها) و CommandPalette (فرمان‌یاب) با دادهٔ پُر
#   (شخصیتِ r338: رزومه + تاریخچه + پشتیبانِ خودکار → درها و بخشِ حلقه mount)
#   در دو تم + حالتهایِ تعاملیِ فرمان‌یاب (تایپ/خالی) + hoverِ درِ راهنما + ۳۹۰.
#   درسِ ساختاریِ راند: این دو Dialogِ رادیکس‌اند نه Popover — دامنهٔ dbg =
#   DialogContentِ data-state=open (.shortcuts-dialog / .command-palette).
#   negctlِ دائمیِ r338 + پروبِ mountِ r337 در هر صحنه.
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
DIR=/home/z/my-project/scripts
OUT=/tmp/r339-sweep.txt
mkdir -p "$EV"; : > "$OUT"

probe() { echo "-- [probe] $1" | tee -a "$OUT"; agent-browser eval "$(cat "$DIR/r339-dialog-probe.js")" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
dbg()  { echo "-- [dialog-dbg] $1" | tee -a "$OUT"; agent-browser eval "$(cat "$DIR/r339-dialog-dbg.js")" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
dbg0() { echo "-- [basis-zero/whole-page] $1" | tee -a "$OUT"; agent-browser eval "$(cat "$DIR/r319-basis-zero-audit.js")" 2>&1 | tail -3 | tee -a "$OUT"; echo | tee -a "$OUT"; }
shot() { agent-browser screenshot "$EV/$1" >/dev/null 2>&1; }
to_dark_inplace()   { agent-browser eval "(()=>{document.documentElement.classList.add('dark');return 'd';})()" >/dev/null 2>&1; sleep 1.2; }
back_light_inplace(){ agent-browser eval "(()=>{document.documentElement.classList.remove('dark');return 'l';})()" >/dev/null 2>&1; sleep 1.2; }
# درسِ r338 — بستنهایِ گیرکرده تخلیه میشوند: پورتالِ دیالوگِ بی‌محتوایِ open حذف.
esc() { agent-browser press Escape >/dev/null 2>&1; sleep 0.8;
  agent-browser eval "(()=>{let n=0;for(let i=0;i<20;i++){const ps=[...document.querySelectorAll('[data-slot=\"dialog-portal\"]')].filter(p=>!p.querySelector('[data-state=\"open\"]'));if(!ps.length)break;ps.forEach(p=>p.remove());n+=ps.length;}return 'cleaned='+n;})()" >/dev/null 2>&1
  sleep 0.3
}
negctl() { # $1 = سلکتورِ دیالوگِ باز (با نقطه)، $2 = برچسب — درسِ r338: طبقه‌بندِ بیحلقه صفرِ بیارزش میدهد
  #  درسِ همین راند: چکِ «fails>=1» کافی نیست — مردودِ واقعیِ صحنه چک را میگذراند؛
  #  جوهرِ کاشتهشده (rgb(110, 231, 183) = ۱٫۳۴) باید خودش در failsList دیده شود.
  agent-browser eval "(()=>{const d=document.querySelector('$1[data-state=\"open\"]');if(!d)return 'NO-DIALOG';const n=document.createElement('div');n.id='r339-negctl';n.style.cssText='background:#d1fae5;color:#6ee7b7;font-size:12px;padding:4px';n.textContent='کنترلِ منفیِ r339';d.firstElementChild?d.firstElementChild.appendChild(n):d.appendChild(n);return 'PLANTED';})()" >/dev/null 2>&1
  local RES; RES=$(agent-browser eval "$(cat "$DIR/r339-dialog-dbg.js")" 2>/dev/null)
  agent-browser eval "(()=>{document.getElementById('r339-negctl')?.remove();return 'rm';})()" >/dev/null 2>&1
  echo "-- [negctl] $2 → ${RES:0:120}" | tee -a "$OUT"
  if ! echo "$RES" | rg -q '110, 231, 183'; then
    echo "NEGCTL-FAIL: مردودِ کاشتهشده (۱٫۳۴) در failsList نیست — ابزارِ راند نامعتبر است" | tee -a "$OUT"
    return 1
  fi
  echo "-- negctl=OK" | tee -a "$OUT"
}
hover_pair() { # $1 = سلکتورِ ردیف — مرزِ ابزاریِ ثابتشده در این راند: matchMedia(hover:hover)=false در هدلس
  #  → هیچ hover-variantی با این ابزار سنجیدنی نیست؛ خروجیِ زیر = حالتِ پایه است (سندِ مرز، نه حکمِ hover).
  agent-browser hover "$1" >/dev/null 2>&1; sleep 0.8
  agent-browser eval "(()=>{const r=document.querySelector('$1');if(!r)return 'NO-ROW';const cs=getComputedStyle(r);const cv=document.createElement('canvas');cv.width=cv.height=1;const cx=cv.getContext('2d');const toRGB=(s)=>{cx.clearRect(0,0,1,1);cx.fillStyle='#000';cx.fillStyle=s;cx.fillRect(0,0,1,1);return [...cx.getImageData(0,0,1,1).data.slice(0,3)];};const lum=(c)=>{const f=(v)=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4);};return 0.2126*f(c[0])+0.7152*f(c[1])+0.0722*f(c[2]);};let bg=toRGB(cs.backgroundColor),node=r;while(node&&node!==document.documentElement){const o=parseFloat(getComputedStyle(node).opacity);const b=toRGB(getComputedStyle(node).backgroundColor);if(b&&getComputedStyle(node).backgroundColor!=='rgba(0, 0, 0, 0)'){bg=bg.map((v,i)=>Math.round(v*1+b[i]*0));break;}node=node.parentElement;}const cr=Math.round(((Math.max(lum(toRGB(cs.color)),lum(bg))+0.05)/(Math.min(lum(toRGB(cs.color)),lum(bg))+0.05))*100)/100;return JSON.stringify({hoverBg:cs.backgroundColor,ink:cs.color,cr});})()" 2>&1 | tee -a "$OUT"
  echo | tee -a "$OUT"
}
open_ev() { # $1 = رویداد، $2 = سلکتورِ دیالوگ (با نقطه!) — درسِ ابزاریِ راند: سلکتورِ بینقطه «دروغِ OPEN-FAIL» تولید کرد
  for i in 1 2 3; do
    agent-browser eval "(()=>{let n=0;document.querySelectorAll('[data-slot=\"dialog-portal\"]').forEach(p=>{if(!p.querySelector('[data-state=\"open\"]')){p.remove();n++;}});return 'pre-clean='+n;})()" >/dev/null 2>&1
    agent-browser eval "(()=>{window.dispatchEvent(new CustomEvent('$1'));return 'ev';})()" >/dev/null 2>&1
    sleep 1.5
    local O; O=$(agent-browser eval "(()=>{const d=document.querySelector('$2[data-state=\"open\"]');if(!d)return 0;const r=d.getBoundingClientRect();return r.width>0?1:0;})()" 2>/dev/null | tr -d '"')
    if [ "$O" = "1" ]; then echo "open#$i=OK"; return 0; fi
    sleep 1
  done
  echo "OPEN-FAIL $1"; return 1
}

echo "########## seedِ شخصیتِ r338 + دسکتاپِ ۱۲۸۰ (روشنِ تحمیلی)" | tee -a "$OUT"
agent-browser close >/dev/null 2>&1 || true
agent-browser open "$BASE" >/dev/null 2>&1
agent-browser set viewport 1280 900 >/dev/null 2>&1
agent-browser wait 'body' >/dev/null 2>&1 || true
sleep 2
node "$DIR/r338-persona.js" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>process.stdout.write(JSON.parse(s).browserEval))" > /tmp/r339-seed-eval.js || { echo "PERSONA-FAIL" | tee -a "$OUT"; exit 1; }
agent-browser eval "$(cat /tmp/r339-seed-eval.js)" >/dev/null 2>&1
sleep 4
agent-browser eval "(()=>{document.documentElement.classList.remove('dark');return 'l';})()" >/dev/null 2>&1
sleep 1
GUARD=$(agent-browser eval "(()=>{const v=(s)=>{const e=document.querySelector(s);if(!e)return 0;const r=e.getBoundingClientRect();return r.width>0?1:0;};return (v('.c-chip-flame')&&v('[aria-label=\"پروفایل من\"]')&&v('.freeze-badge'))?1:0;})()" 2>/dev/null | tr -d '"')
if [ "$GUARD" != "1" ]; then
  echo "SEED-GUARD-FAIL: persona mount نشد" | tee -a "$OUT"
  agent-browser close >/dev/null 2>&1
  exit 1
fi
echo "-- seed-guard=OK" | tee -a "$OUT"

echo "########## GUIDE — روشن ۱۲۸۰" | tee -a "$OUT"
open_ev "open-shortcuts" ".shortcuts-dialog" | tee -a "$OUT"
probe "guide-open-light"
negctl ".shortcuts-dialog" "guide-light-1280" || { agent-browser close >/dev/null 2>&1; exit 1; }
dbg "guide-light-1280"
shot "r339-guide-light.png"

echo "########## GUIDE — hoverِ درِ هدر (روشن) — مرزِ ابزار: hover:hover=false؛ خوانش = پایه" | tee -a "$OUT"
hover_pair 'button[data-testid^="resume-door-"]:not([disabled])'
dbg "guide-door-hover-light-1280"
shot "r339-guide-hover-light.png"

echo "########## GUIDE — hoverِ درِ هدر (تاریک) — مرزِ ابزار: hover:hover=false؛ خوانش = پایه" | tee -a "$OUT"
to_dark_inplace
dbg "guide-dark-inplace-1280"
shot "r339-guide-dark.png"
hover_pair 'button[data-testid^="resume-door-"]:not([disabled])'
dbg "guide-door-hover-dark-1280"
shot "r339-guide-hover-dark.png"
agent-browser hover 'body' >/dev/null 2>&1
sleep 0.5
back_light_inplace
esc

echo "########## PALETTE — روشن ۱۲۸۰" | tee -a "$OUT"
open_ev "open-command-palette" ".command-palette" | tee -a "$OUT"
probe "palette-open-light"
negctl ".command-palette" "palette-light-1280" || { agent-browser close >/dev/null 2>&1; exit 1; }
dbg "palette-light-1280"
shot "r339-palette-light.png"
back_light_inplace 2>/dev/null

echo "########## PALETTE — تاریکِ درجا" | tee -a "$OUT"
to_dark_inplace
dbg "palette-dark-inplace-1280"
shot "r339-palette-dark.png"

echo "########## PALETTE — تعامل: تایپ «آزمون» (تاریک)" | tee -a "$OUT"
agent-browser fill '.command-palette input[role="combobox"]' 'آزمون' >/dev/null 2>&1
sleep 0.8
probe "palette-typed-dark"
dbg "palette-typed-dark-1280"
shot "r339-palette-typed-dark.png"

echo "########## PALETTE — حالتِ خالی (تاریک)" | tee -a "$OUT"
agent-browser fill '.command-palette input[role="combobox"]' 'زززز۹۹۹' >/dev/null 2>&1
sleep 0.8
probe "palette-empty-dark"
dbg "palette-empty-dark-1280"
shot "r339-palette-empty-dark.png"
agent-browser fill '.command-palette input[role="combobox"]' '' >/dev/null 2>&1
sleep 0.5
back_light_inplace
esc

echo "########## PALETTE — ۳۹۰ روشن" | tee -a "$OUT"
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 1.2
open_ev "open-command-palette" ".command-palette" | tee -a "$OUT"
probe "palette-390-light"
dbg "palette-390-light"
shot "r339-palette-390-light.png"
esc

echo "########## GUIDE — ۳۹۰ روشن + تاریک" | tee -a "$OUT"
open_ev "open-shortcuts" ".shortcuts-dialog" | tee -a "$OUT"
probe "guide-390-light"
dbg "guide-390-light"
shot "r339-guide-390-light.png"
to_dark_inplace
dbg "guide-390-dark"
shot "r339-guide-390-dark.png"
back_light_inplace
esc

echo "########## basis-zeroِ صفحهٔ خانه (پس از همه)" | tee -a "$OUT"
dbg0 "home-after-sweep-390"

echo "########## DONE" | tee -a "$OUT"
agent-browser close >/dev/null 2>&1
echo "log=$OUT"
