#!/usr/bin/env bash
# Live QA for deep palette commands (task 67) — single browser session.
# Ctrl+K → group count badges → «دیکتهٔ درس ۲» (1 result) → Enter →
# lesson-2 dictation tab (openLessonTab, no funnel event) → reopen →
# «اخیر» recents group on top → «فلش‌کارت هوشمند درس ۱» → lesson-1
# flashcards (SRS smart intent, fires lesson_open — restored by cleanup)
# → «culture» latin keyword → lesson-3 deep commands → mobile 390 →
# fresh-session console ×2.
set -e
BASE="http://127.0.0.1:3000"

agent-browser close >/dev/null 2>&1 || true
agent-browser open "$BASE" >/dev/null
sleep 5
agent-browser snapshot >/tmp/cp67-snap.txt 2>&1 || true
if grep -q 'ناشناس میمانم' /tmp/cp67-snap.txt; then
  REF=$(grep -oE 'button "رد کردن — ناشناس میمانم" \[ref=(e[0-9]+)\]' /tmp/cp67-snap.txt | grep -oE 'e[0-9]+' | head -1)
  agent-browser click "$REF" >/dev/null
  sleep 1
fi

echo "FRESH_CONSOLE: $(agent-browser console 2>/dev/null | rg -c 'error' || echo 0)"

open_palette() {
  agent-browser press "Control+k" >/dev/null 2>&1 || true
  sleep 1
  if ! agent-browser snapshot 2>/dev/null | grep -q 'combobox'; then
    agent-browser eval '(()=>{window.dispatchEvent(new KeyboardEvent("keydown",{ctrlKey:true,code:"KeyK",key:"k",bubbles:true}));return "ev"})()' >/dev/null 2>&1
    sleep 1
  fi
}

type_query() {
  agent-browser eval "(()=>{const el=document.querySelector('.command-palette input');if(!el)return 'no-input';const set=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;set.call(el,'$1');el.dispatchEvent(new Event('input',{bubbles:true}));return 'typed'})()" 2>/dev/null
}

# ---- 1) open + group count badges + deep group reachable via group search ----
open_palette
agent-browser snapshot >/tmp/cp67-open.txt 2>&1 || true
if grep -q 'combobox' /tmp/cp67-open.txt; then echo "OPEN_CTRLK: OK"; else echo "OPEN_CTRLK: FAIL"; fi
BADGES=$(agent-browser eval '(()=>{const hs=[...document.querySelectorAll(".command-palette [role=group] > div:first-child")];const withCount=hs.filter(h=>/[۰-۹]/.test(h.textContent));return withCount.length+"/"+hs.length})()' 2>/dev/null)
echo "GROUP_COUNT_BADGES: $BADGES"
echo "TYPE_G: $(type_query 'بخش')"
sleep 1
agent-browser snapshot >/tmp/cp67-group.txt 2>&1 || true
echo "DEEP_GROUP_RESULTS: $(grep -c 'درس [۱۲۳]' /tmp/cp67-group.txt || true) rows"
agent-browser press "Escape" >/dev/null; sleep 0.5

# ---- 2) «دیکتهٔ درس ۲» → exactly the deep command → Enter → dictation tab ----
open_palette
echo "TYPE_D: $(type_query 'دیکتهٔ درس ۲')"
sleep 1
agent-browser snapshot >/tmp/cp67-dict.txt 2>&1 || true
if grep -q 'دیکتهٔ درس ۲' /tmp/cp67-dict.txt; then echo "DEEP_MATCH: OK"; else echo "DEEP_MATCH: FAIL"; fi
echo "DEEP_ONLY: $(grep -c 'option' /tmp/cp67-dict.txt || true) option(s)"
agent-browser press "Enter" >/dev/null
sleep 3
agent-browser snapshot >/tmp/cp67-dview.txt 2>&1 || true
if grep -q 'شنیداری' /tmp/cp67-dview.txt || grep -q 'املای شنیداری' /tmp/cp67-dview.txt; then echo "NAV_DICTATION_L2: OK"; else echo "NAV_DICTATION_L2: CHECK"; fi
CLOSED=$(agent-browser eval '(()=>{return document.querySelector(".command-palette")?"still-open":"closed"})()' 2>/dev/null)
echo "CLOSED_AFTER_RUN: $CLOSED"

# ---- 3) recents «اخیر» on top ----
open_palette
agent-browser snapshot >/tmp/cp67-recent.txt 2>&1 || true
if grep -q 'اخیر' /tmp/cp67-recent.txt; then echo "RECENTS_GROUP: OK"; else echo "RECENTS_GROUP: FAIL"; fi
RECFIRST=$(agent-browser eval '(()=>{const g=document.querySelector(".command-palette [role=group]");return g?g.getAttribute("aria-label"):"none"})()' 2>/dev/null)
echo "RECENTS_FIRST: $RECFIRST"
agent-browser press "Escape" >/dev/null; sleep 0.5

# ---- 4) «فلش‌کارت هوشمند درس ۱» → lesson-1 flashcards (SRS intent) ----
open_palette
echo "TYPE_S: $(type_query 'فلش‌کارت هوشمند درس ۱')"
sleep 1
agent-browser press "Enter" >/dev/null
sleep 3
agent-browser snapshot >/tmp/cp67-flash.txt 2>&1 || true
if grep -q 'بلدم' /tmp/cp67-flash.txt; then echo "NAV_SMART_FLASH_L1: OK"; else echo "NAV_SMART_FLASH_L1: CHECK"; fi
LESSON=$(agent-browser eval '(()=>{const h=document.querySelector("h1,h2");return h?h.textContent.slice(0,60):"no-h"})()' 2>/dev/null)
echo "LESSON_HEADING: $LESSON"

# ---- 5) latin keyword «culture» → lesson-3 deep commands ----
open_palette
echo "TYPE_C: $(type_query 'culture')"
sleep 1
agent-browser snapshot >/tmp/cp67-culture.txt 2>&1 || true
echo "CULTURE_ROWS: $(grep -c 'درس ۳' /tmp/cp67-culture.txt || true) rows"
agent-browser press "Escape" >/dev/null; sleep 0.5

# ---- 6) mobile 390 with palette open ----
agent-browser set viewport 390 844 >/dev/null 2>&1 || agent-browser resize 390 844 >/dev/null 2>&1 || true
sleep 2
open_palette
MOB=$(agent-browser eval '(()=>{const d=document.documentElement;return JSON.stringify({sw:d.scrollWidth,iw:window.innerWidth})})()' 2>/dev/null)
echo "MOBILE390: $MOB"
agent-browser press "Escape" >/dev/null
agent-browser close >/dev/null 2>&1 || true

# ---- 7) fresh session console ----
agent-browser open "$BASE" >/dev/null
sleep 5
agent-browser snapshot >/tmp/cp67-fresh.txt 2>&1 || true
if grep -q 'ناشناس میمانم' /tmp/cp67-fresh.txt; then
  REF=$(grep -oE 'button "رد کردن — ناشناس میمانم" \[ref=(e[0-9]+)\]' /tmp/cp67-fresh.txt | grep -oE 'e[0-9]+' | head -1)
  agent-browser click "$REF" >/dev/null
  sleep 1
fi
echo "FRESH_CONSOLE_2: $(agent-browser console 2>/dev/null | rg -c 'error' || echo 0)"
agent-browser close >/dev/null 2>&1 || true
echo "QA_DONE"
