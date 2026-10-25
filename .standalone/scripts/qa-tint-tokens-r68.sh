#!/usr/bin/env bash
# Live QA for tinted-ink token kernel (task 68, Step 9 tranche-3b) — single
# browser session. Probes the flipped shades' computed colors in DARK vs the
# expected kernel values, verifies LIGHT mode untouched, checks a consumer
# that had NO dark rule before (smart-practice text-amber-800 → contrast fix),
# the report paper stays light, mobile 390 overflow, fresh console.
set -e
BASE="http://127.0.0.1:3000"

agent-browser close >/dev/null 2>&1 || true
agent-browser open "$BASE" >/dev/null
sleep 6
agent-browser snapshot >/tmp/t68-snap.txt 2>&1 || true
if grep -q 'ناشناس میمانم' /tmp/t68-snap.txt; then
  REF=$(grep -oE 'button "رد کردن — ناشناس میمانم" \[ref=(e[0-9]+)\]' /tmp/t68-snap.txt | grep -oE 'e[0-9]+' | head -1)
  agent-browser click "$REF" >/dev/null
  sleep 1
fi
echo "FRESH_CONSOLE: $(agent-browser console 2>/dev/null | rg -c 'error' || echo 0)"

# turn dark ON via the app's own toggle (header Sun/Moon button)
TOG=$(grep -oE 'button "[^"]*(حالت شب|حالت روشن)[^"]*" \[ref=(e[0-9]+)\]' /tmp/t68-snap.txt | grep -oE 'e[0-9]+' | head -1)
if [ -n "$TOG" ]; then agent-browser click "$TOG" >/dev/null; fi
sleep 1.5
DARK=$(agent-browser eval 'document.documentElement.classList.contains("dark")?"dark-on":"dark-off"' 2>/dev/null)
echo "DARK_TOGGLE: $DARK"

# DARK PROBES — home (konkur tool card has text-orange-700/amber-800 sites,
# home banners amber-800), then navigate to views with sky/violet/rose-900
probe() { agent-browser eval "$1" 2>/dev/null; }

# 1) home: any text-orange-700 / text-amber-800 element
P1=$(probe '(()=>{const els=[...document.querySelectorAll("[class*=text-orange-700],[class*=text-amber-800]")];const e=els.find(x=>x.offsetParent);if(!e)return "none-found";return JSON.stringify({cls:e.className.split(" ").filter(c=>c.includes("orange-700")||c.includes("amber-800"))[0],c:getComputedStyle(e).color})})()')
echo "HOME_ORANGE_AMBER_INK: $P1"

# 2) smart-practice view: text-amber-800 (previously UNCOVERED → light brown)
agent-browser eval '(()=>{const b=[...document.querySelectorAll("button,a")].find(x=>/تمرین هوشمند/.test(x.textContent||""));if(b)b.click();return "ok"})()' >/dev/null 2>&1
sleep 2.5
P2=$(probe '(()=>{const e=[...document.querySelectorAll("[class*=text-amber-800]")].find(x=>x.offsetParent);if(!e)return "none-found";return JSON.stringify({c:getComputedStyle(e).color,t:(e.textContent||"").slice(0,24)})})()')
echo "SMART_AMBER800_INK: $P2"

# 3) spell-rush? no — rush view: text-sky-700/800 + orange-700 sites
agent-browser eval '(()=>{location.hash="";const b=[...document.querySelectorAll("button,a")].find(x=>/چالش برق‌آسا|برق‌آسا/.test(x.textContent||""));if(b)b.click();return "ok"})()' >/dev/null 2>&1
sleep 2.5
P3=$(probe '(()=>{const els=[...document.querySelectorAll("[class*=text-sky-700],[class*=text-sky-800],[class*=text-orange-700]")];const e=els.find(x=>x.offsetParent);if(!e)return "none-found";const c=e.className.split(" ").find(c=>/sky|orange/.test(c));return JSON.stringify({cls:c,col:getComputedStyle(e).color})})()')
echo "RUSH_SKY_ORANGE_INK: $P3"

# 4) my-words: text-sky-600
agent-browser eval '(()=>{const b=[...document.querySelectorAll("button,a")].find(x=>/واژه‌های من|واژههای من/.test(x.textContent||""));if(b)b.click();return "ok"})()' >/dev/null 2>&1
sleep 2.5
P4=$(probe '(()=>{const e=[...document.querySelectorAll("[class*=text-sky-600]")].find(x=>x.offsetParent);if(!e)return "none-found";return JSON.stringify({col:getComputedStyle(e).color})})()')
echo "MYWORDS_SKY600_INK: $P4"

# 5) skill-panel (report digest?) — violet-800 via grammar metro? Use review view text-sky-800:
agent-browser eval '(()=>{const b=[...document.querySelectorAll("button,a")].find(x=>/داشبورد مرور/.test(x.textContent||""));if(b)b.click();return "ok"})()' >/dev/null 2>&1
sleep 2.5
P5=$(probe '(()=>{const e=[...document.querySelectorAll("[class*=text-sky-800]")].find(x=>x.offsetParent);if(!e)return "none-found";return JSON.stringify({col:getComputedStyle(e).color})})()')
echo "REVIEW_SKY800_INK: $P5"

# 6) lesson content: book HTML text-amber-900/rose-900 (global rules retired → token must serve)
agent-browser eval '(()=>{const b=[...document.querySelectorAll("button,a,[role=button]")].find(x=>/درس ۱/.test(x.textContent||"")&&x.offsetParent);if(b)b.click();return "ok"})()' >/dev/null 2>&1
sleep 3
P6=$(probe '(()=>{const e=[...document.querySelectorAll("[class*=text-amber-900],[class*=text-rose-900]")].find(x=>x.offsetParent);if(!e)return "none-found";const c=e.className.split(" ").find(c=>/amber|rose/.test(c));return JSON.stringify({cls:c,col:getComputedStyle(e).color})})()')
echo "LESSON_TINT_INK: $P6"

# 7) report paper stays light (scope-token patch, light paper under html.dark)
agent-browser eval '(()=>{window.dispatchEvent(new CustomEvent("open-official-report"));return "ok"})()' >/dev/null 2>&1
sleep 2.5
P7=$(probe '(()=>{const p=document.querySelector(".official-report,.official-chrome");if(!p)return "no-paper";return JSON.stringify({bg:getComputedStyle(p).backgroundColor})})()')
echo "REPORT_PAPER: $P7"
agent-browser press "Escape" >/dev/null 2>&1; sleep 1

# 8) LIGHT mode untouched: toggle back and re-probe home orange/amber + lesson tint
TOG2=$(agent-browser snapshot 2>/dev/null | grep -oE 'button "[^"]*(حالت شب|حالت روشن)[^"]*" \[ref=(e[0-9]+)\]' | grep -oE 'e[0-9]+' | head -1)
if [ -n "$TOG2" ]; then agent-browser click "$TOG2" >/dev/null; fi
sleep 1.5
LIGHT=$(agent-browser eval 'document.documentElement.classList.contains("dark")?"dark-on":"light-ok"' 2>/dev/null)
echo "LIGHT_TOGGLE: $LIGHT"
P8=$(probe '(()=>{const e=[...document.querySelectorAll("[class*=text-amber-900],[class*=text-rose-900],[class*=text-orange-700],[class*=text-amber-800]")].find(x=>x.offsetParent);if(!e)return "none-on-home";return JSON.stringify({col:getComputedStyle(e).color})})()')
echo "LIGHT_INK_SAMPLE: $P8"

# 9) mobile 390 overflow
agent-browser set viewport 390 844 >/dev/null 2>&1 || true
sleep 2
MOB=$(probe 'JSON.stringify({sw:document.documentElement.scrollWidth,iw:window.innerWidth})')
echo "MOBILE390: $MOB"
agent-browser close >/dev/null 2>&1 || true

# 10) fresh session console
agent-browser open "$BASE" >/dev/null
sleep 5
agent-browser snapshot >/tmp/t68-fresh.txt 2>&1 || true
if grep -q 'ناشناس میمانم' /tmp/t68-fresh.txt; then
  REF=$(grep -oE 'button "رد کردن — ناشناس میمانم" \[ref=(e[0-9]+)\]' /tmp/t68-fresh.txt | grep -oE 'e[0-9]+' | head -1)
  agent-browser click "$REF" >/dev/null
  sleep 1
fi
echo "FRESH_CONSOLE_2: $(agent-browser console 2>/dev/null | rg -c 'error' || echo 0)"
agent-browser close >/dev/null 2>&1 || true
echo "QA_DONE"
