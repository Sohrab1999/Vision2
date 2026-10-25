#!/usr/bin/env bash
# Dark-mode pixel probe for Step 9 tranche-2 (surface tokenization).
# Usage: scripts/qa-probe-dark.sh before|after /tmp/probe-out.json
# Single browser session: open → skip onboarding → night toggle → probe views.
set -e
MODE="${1:?mode before|after}"
OUT="${2:-/tmp/probe-$MODE.json}"
BASE="http://127.0.0.1:3000"

agent-browser close >/dev/null 2>&1 || true
agent-browser open "$BASE" >/dev/null
sleep 3
# skip onboarding if present, else continue
agent-browser snapshot >/tmp/probe-snap.txt 2>&1 || true
if grep -q 'ناشناس میمانم' /tmp/probe-snap.txt; then
  REF=$(grep -oE 'button "رد کردن — ناشناس میمانم" \[ref=(e[0-9]+)\]' /tmp/probe-snap.txt | grep -oE 'e[0-9]+')
  agent-browser click "$REF" >/dev/null
  sleep 1
fi
# turn night mode on (idempotent: if already dark the button label is «حالت روز»)
LBL=$(agent-browser snapshot 2>/dev/null | grep -oE 'button "(حالت شب|حالت روز)"' | head -1)
if [ "$LBL" = 'button "حالت شب"' ]; then
  REF=$(agent-browser snapshot | grep -oE 'button "حالت شب" \[ref=(e[0-9]+)\]' | grep -oE 'e[0-9]+')
  agent-browser click "$REF" >/dev/null
  sleep 1
fi

probe() { # $1 = js expression returning object
  echo "===PROBE===" >> "$OUT"
  agent-browser eval "$1" 2>/dev/null >> "$OUT"
}

# ---- HOME probes ----
probe '(() => {
  const g = (sel, prop, idx=0) => { const el = document.querySelectorAll(sel)[idx]; if (!el) return null; return getComputedStyle(el)[prop]; };
  return {
    view: "home",
    htmlDark: document.documentElement.classList.contains("dark"),
    bodyBg: g("body", "backgroundColor"),
    bgWhite: g(".bg-white", "backgroundColor"),
    textStone800: g(".text-stone-800", "color"),
    textStone500: g(".text-stone-500", "color"),
    textStone400: g(".text-stone-400", "color"),
    borderStone200: g(".border-stone-200", "borderColor"),
    borderStone100: g(".border-stone-100", "borderColor"),
    bgStone50_plain: g(".bg-stone-50", "backgroundColor"),
    bgStone50_70: g(".bg-stone-50\\/70", "backgroundColor"),
    bgStone200_70: g(".bg-stone-200\\/70", "backgroundColor"),
    srsPanelText800: g(".srs-panel .text-stone-800", "color"),
    srsPanelText400: g(".srs-panel .text-stone-400", "color"),
    bookshelfStrip: g(".shelf-strip", "backgroundImage"),
    statBand: g(".stat-band", "backgroundImage"),
    darkBtnStone700: g(".bg-stone-700", "backgroundColor")
  };
})()'

# ---- DICTIONARY probes ----
agent-browser eval '(() => { const b=[...document.querySelectorAll("button")].find(x=>x.textContent.trim()==="دیکشنری"); if(b){b.click(); return "nav-ok";} return "nav-miss"; })()' >/dev/null 2>&1 || true
sleep 2
probe '(() => {
  const g = (sel, prop, idx=0) => { const el = document.querySelectorAll(sel)[idx]; if (!el) return null; return getComputedStyle(el)[prop]; };
  return {
    view: "dictionary",
    chipStone700: g(".bg-stone-700", "backgroundColor"),
    chipStone100: g(".bg-stone-100", "backgroundColor"),
    cardWhite: g(".bg-white", "backgroundColor"),
    textStone600: g(".text-stone-600", "color"),
    borderStone200: g(".border-stone-200", "borderColor")
  };
})()'

# ---- LEADERBOARD probes (navigate via home first) ----
agent-browser eval '(() => { const b=[...document.querySelectorAll("button")].find(x=>x.textContent.trim()==="خانه"); if(b){b.click(); return "ok";} return "miss"; })()' >/dev/null 2>&1 || true
sleep 1
agent-browser eval '(() => { const els=[...document.querySelectorAll("button, a")]; const b=els.find(x=>/جدول|امتیاز/.test(x.textContent)); if(b){b.click(); return "lb-ok:"+b.textContent.trim().slice(0,20);} return "lb-miss"; })()' 2>/dev/null | head -1
sleep 2
probe '(() => {
  const g = (sel, prop, idx=0) => { const el = document.querySelectorAll(sel)[idx]; if (!el) return null; return getComputedStyle(el)[prop]; };
  const d = document.querySelector(".divide-stone-100 > :not(:last-child)");
  return {
    view: "leaderboard",
    divideChildBorder: d ? getComputedStyle(d).borderColor : null,
    bgStone100_80: g(".bg-stone-100\\/80", "backgroundColor"),
    ringOffsetWhite: g(".ring-offset-white", "boxShadow")
  };
})()'

echo "PROBE_MODE=$MODE OUT=$OUT DONE" >&2
