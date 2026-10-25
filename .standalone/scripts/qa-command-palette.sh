#!/usr/bin/env bash
# Live QA for «فرمان‌یاب» command palette (task 66) — single browser session.
# Ctrl+K opens → light panel probe → type «دیکشنری» (native-setter, React
# controlled input) → Enter → dictionary view → Ctrl+K → «شب» → Enter →
# dark ON → dark probes (panel #1c1917 / placeholder #8a8580 / dark active
# row) → arrow navigation + Enter runs 3rd command (آزمون جامع) → Esc →
# header button opens → empty state «فرمانی یافت نشد» → report modal via
# palette (کارنامه) → mobile 390 overflow → fresh-session console.
set -e
BASE="http://127.0.0.1:3000"

agent-browser close >/dev/null 2>&1 || true
agent-browser open "$BASE" >/dev/null
sleep 5
agent-browser snapshot >/tmp/cp66-snap.txt 2>&1 || true
if grep -q 'ناشناس میمانم' /tmp/cp66-snap.txt; then
  REF=$(grep -oE 'button "رد کردن — ناشناس میمانم" \[ref=(e[0-9]+)\]' /tmp/cp66-snap.txt | grep -oE 'e[0-9]+' | head -1)
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

# ---- 1) open + light probe ----
open_palette
agent-browser snapshot >/tmp/cp66-open.txt 2>&1 || true
if grep -q 'combobox' /tmp/cp66-open.txt; then echo "OPEN_CTRLK: OK"; else echo "OPEN_CTRLK: FAIL"; fi
echo "GROUPS: $(grep -c 'ناوبری\|درس‌ها\|تمرین و چالش' /tmp/cp66-open.txt) header hits"
LIGHT=$(agent-browser eval '(()=>{const p=document.querySelector(".command-palette");if(!p)return "no-panel";const bg=getComputedStyle(p).backgroundColor;return bg})()' 2>/dev/null)
echo "LIGHT_PANEL_BG: $LIGHT"

# ---- 2) search «دیکشنری» → Enter → dictionary view ----
echo "TYPE1: $(type_query 'دیکشنری')"
sleep 1
agent-browser snapshot >/tmp/cp66-dict.txt 2>&1 || true
if grep -q 'option "دیکشنری واژگان' /tmp/cp66-dict.txt; then echo "MATCH_DICT: OK"; else echo "MATCH_DICT: FAIL"; fi
agent-browser press "Enter" >/dev/null
sleep 3
agent-browser snapshot >/tmp/cp66-view.txt 2>&1 || true
if grep -q 'مثلاً: language' /tmp/cp66-view.txt; then echo "NAV_DICTIONARY: OK"; else echo "NAV_DICTIONARY: FAIL"; fi
CLOSED=$(agent-browser eval '(()=>{return document.querySelector(".command-palette")?"still-open":"closed"})()' 2>/dev/null)
echo "CLOSED_AFTER_RUN: $CLOSED"

# ---- 3) «شب» → dark ON ----
open_palette
echo "TYPE2: $(type_query 'شب')"
sleep 1
agent-browser press "Enter" >/dev/null
sleep 2
DARK=$(agent-browser eval '(()=>{return document.documentElement.classList.contains("dark")?"dark-on":"dark-off"})()' 2>/dev/null)
echo "THEME_TOGGLE: $DARK"

# ---- 4) dark probes (palette open in dark) ----
open_palette
type_query 'واژه' >/dev/null
sleep 1
DARKP=$(agent-browser eval '(()=>{const p=document.querySelector(".command-palette");if(!p)return "no-panel";const cs=getComputedStyle(p);const ph=getComputedStyle(document.querySelector(".command-palette input"),"::placeholder").color;const row=document.querySelector("[data-active=true]");const rowBg=row?getComputedStyle(row).backgroundColor:"no-row";return JSON.stringify({panel:cs.backgroundColor,border:cs.borderColor,ph,rowBg})})()' 2>/dev/null)
echo "DARK_PROBE: $DARKP"

# ---- 5) arrow navigation: ↓ ×2 → Enter = 3rd command (آزمون جامع) ----
agent-browser press "ArrowDown" >/dev/null; sleep 0.3
agent-browser press "ArrowDown" >/dev/null; sleep 0.3
agent-browser press "Enter" >/dev/null
sleep 3
agent-browser snapshot >/tmp/cp66-exam.txt 2>&1 || true
if grep -q 'آزمون جامع' /tmp/cp66-exam.txt && grep -q 'شروع' /tmp/cp66-exam.txt; then echo "ARROW_NAV_EXAM: OK"; else echo "ARROW_NAV_EXAM: CHECK"; fi

# ---- 6) Esc closes ----
open_palette
agent-browser press "Escape" >/dev/null
sleep 1
ESC=$(agent-browser eval '(()=>{return document.querySelector(".command-palette")?"open":"closed"})()' 2>/dev/null)
echo "ESC_CLOSE: $ESC"

# ---- 7) header button opens ----
agent-browser snapshot >/tmp/cp66-hdr.txt 2>&1 || true
HREF=$(grep -oE 'button "[^"]*فرمان[^"]*" \[ref=(e[0-9]+)\]' /tmp/cp66-hdr.txt | grep -oE 'e[0-9]+' | head -1)
if [ -n "$HREF" ]; then agent-browser click "$HREF" >/dev/null; fi
sleep 1
HB=$(agent-browser eval '(()=>{return document.querySelector(".command-palette")?"open":"closed"})()' 2>/dev/null)
echo "HEADER_BUTTON: $HB"

# ---- 8) empty state ----
type_query 'زززز' >/dev/null
sleep 1
agent-browser snapshot >/tmp/cp66-empty.txt 2>&1 || true
if grep -q 'فرمانی یافت نشد' /tmp/cp66-empty.txt; then echo "EMPTY_STATE: OK"; else echo "EMPTY_STATE: FAIL"; fi
agent-browser press "Escape" >/dev/null; sleep 0.5

# ---- 9) report modal via palette (گزارش‌ها group) ----
open_palette
type_query 'کارنامه' >/dev/null
sleep 1
agent-browser press "Enter" >/dev/null
sleep 4
agent-browser snapshot >/tmp/cp66-rep.txt 2>&1 || true
if grep -q 'dialog' /tmp/cp66-rep.txt; then echo "REPORT_VIA_PALETTE: OK"; else echo "REPORT_VIA_PALETTE: CHECK"; fi
agent-browser press "Escape" >/dev/null; sleep 1
agent-browser press "Escape" >/dev/null; sleep 1

# ---- 10) mobile 390 ----
agent-browser set viewport 390 844 >/dev/null 2>&1 || agent-browser resize 390 844 >/dev/null 2>&1 || true
sleep 2
open_palette
MOB=$(agent-browser eval '(()=>{const d=document.documentElement;const p=document.querySelector(".command-palette");const pr=p?getComputedStyle(p).overflow:"no";return JSON.stringify({sw:d.scrollWidth,iw:window.innerWidth,panel:pr})})()' 2>/dev/null)
echo "MOBILE390: $MOB"
agent-browser press "Escape" >/dev/null

agent-browser close >/dev/null 2>&1 || true

# ---- 11) fresh session console ----
agent-browser open "$BASE" >/dev/null
sleep 5
agent-browser snapshot >/tmp/cp66-fresh.txt 2>&1 || true
if grep -q 'ناشناس میمانم' /tmp/cp66-fresh.txt; then
  REF=$(grep -oE 'button "رد کردن — ناشناس میمانم" \[ref=(e[0-9]+)\]' /tmp/cp66-fresh.txt | grep -oE 'e[0-9]+' | head -1)
  agent-browser click "$REF" >/dev/null
  sleep 1
fi
echo "FRESH_CONSOLE_2: $(agent-browser console 2>/dev/null | rg -c 'error' || echo 0)"
agent-browser close >/dev/null 2>&1 || true
echo "QA_DONE"
