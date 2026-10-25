#!/usr/bin/env bash
# Dark/light pixel probe for Step 9 tranche-3a (tone-group consolidation).
# Usage: scripts/qa-probe-tones.sh before|after /tmp/tones-out.json
# Single browser session: open → skip onboarding → night toggle → probe views.
set -e
MODE="${1:?mode before|after}"
OUT="${2:-/tmp/tones-$MODE.json}"
BASE="http://127.0.0.1:3000"
: > "$OUT"

agent-browser close >/dev/null 2>&1 || true
agent-browser open "$BASE" >/dev/null
sleep 4
agent-browser snapshot >/tmp/tones-snap.txt 2>&1 || true
if grep -q 'ناشناس میمانم' /tmp/tones-snap.txt; then
  REF=$(grep -oE 'button "رد کردن — ناشناس میمانم" \[ref=(e[0-9]+)\]' /tmp/tones-snap.txt | grep -oE 'e[0-9]+')
  agent-browser click "$REF" >/dev/null
  sleep 1
fi
LBL=$(agent-browser snapshot 2>/dev/null | grep -oE 'button "(حالت شب|حالت روز)"' | head -1)
if [ "$LBL" = 'button "حالت شب"' ]; then
  REF=$(agent-browser snapshot | grep -oE 'button "حالت شب" \[ref=(e[0-9]+)\]' | grep -oE 'e[0-9]+')
  agent-browser click "$REF" >/dev/null
  sleep 1
fi

probe() {
  echo "===PROBE===" >> "$OUT"
  agent-browser eval "$1" 2>/dev/null >> "$OUT"
}

G='const g=(s,p,i=0)=>{const e=document.querySelectorAll(s)[i];return e?getComputedStyle(e)[p]:null};'

# ---- HOME ----
probe "(()=>{${G} return {
  view:'home', dark:document.documentElement.classList.contains('dark'),
  bgWhite:g('.bg-white','backgroundColor'),
  bgWhite70:g('.bg-white\\\\/70','backgroundColor'),
  srsBorderTeal100:g('.srs-panel .border-teal-100','borderColor'),
  srsBorderTeal200:g('.srs-panel .border-teal-200','borderColor'),
  srsBgRose50:g('.srs-panel .bg-rose-50','backgroundColor'),
  srsBgWhite70:g('.srs-panel .bg-white\\\\/70','backgroundColor'),
  srsBgStone200_70:g('.srs-panel .bg-stone-200\\\\/70','backgroundColor'),
  srsFxBarBg:g('.srs-panel .srs-fx-bar.bg-stone-200\\\\/70','backgroundColor'),
  srsChipRose500:g('.srs-panel .srs-due-chip .text-rose-500','color'),
  srsChipRose600:g('.srs-panel .srs-due-chip .text-rose-600','color'),
  questsBgStone50_60:g('.daily-quests .bg-stone-50\\\\/60','backgroundColor'),
  questsTextStone300:g('.daily-quests .text-stone-300','color'),
  wordDayTextTeal800:g('.word-day .text-teal-800','color'),
  fromAmber400:g('.from-amber-400','backgroundImage')||g('.from-amber-400','--tw-gradient-from'),
  fromAmber300:g('.from-amber-300','--tw-gradient-from'),
  textSky700:g('.text-sky-700','color'),
  textSky800:g('.text-sky-800','color')
};})()"

# ---- SHORTCUTS DIALOG ----
agent-browser snapshot >/tmp/tones-snap2.txt 2>&1 || true
KBREF=$(grep -oE 'button "[^"]*میانبر[^"]*" \[ref=(e[0-9]+)\]' /tmp/tones-snap2.txt | grep -oE 'e[0-9]+' | head -1)
if [ -n "$KBREF" ]; then agent-browser click "$KBREF" >/dev/null 2>&1 || true; fi
sleep 1
probe "(()=>{${G} return {
  view:'shortcuts-dialog',
  dialogBg:g('.shortcuts-dialog','backgroundColor'),
  dialogBorder:g('.shortcuts-dialog','borderColor'),
  kbdBg:g('.shortcuts-dialog kbd','backgroundColor'),
  kbdColor:g('.shortcuts-dialog kbd','color'),
  kbdBorder:g('.shortcuts-dialog kbd','borderColor'),
  kbdShadow:g('.shortcuts-dialog kbd','boxShadow')
};})()"
agent-browser eval '(()=>{document.dispatchEvent(new KeyboardEvent("keydown",{key:"Escape",bubbles:true}));return "esc";})()' >/dev/null 2>&1 || true
sleep 1

# ---- BADGE POPOVER (profile) ----
agent-browser snapshot >/tmp/tones-snap3.txt 2>&1 || true
PREF=$(grep -oE 'button "[^"]*پروفایل[^"]*" \[ref=(e[0-9]+)\]' /tmp/tones-snap3.txt | grep -oE 'e[0-9]+' | head -1)
if [ -n "$PREF" ]; then agent-browser click "$PREF" >/dev/null 2>&1 || true; fi
sleep 1
probe "(()=>{${G} return {
  view:'badge-popover',
  popBg:g('.badge-popover','backgroundColor'),
  popBorder:g('.badge-popover','borderColor')
};})()"
agent-browser eval '(()=>{document.dispatchEvent(new KeyboardEvent("keydown",{key:"Escape",bubbles:true}));return "esc";})()' >/dev/null 2>&1 || true
sleep 1

# ---- DICTIONARY ----
agent-browser eval '(()=>{const b=[...document.querySelectorAll("button")].find(x=>x.textContent.trim()==="دیکشنری"); if(b){b.click();return "ok";} return "miss";})()' >/dev/null 2>&1 || true
sleep 2
probe "(()=>{${G} return {
  view:'dictionary',
  bgWhite:g('.bg-white','backgroundColor'),
  textStone600:g('.text-stone-600','color'),
  textSky700:g('.text-sky-700','color'),
  borderStone200:g('.border-stone-200','borderColor')
};})()"

# ---- RUSH ENTRY (rush-hero) ----
agent-browser eval '(()=>{const b=[...document.querySelectorAll("button")].find(x=>x.textContent.trim()==="خانه"); if(b){b.click();return "ok";} return "miss";})()' >/dev/null 2>&1 || true
sleep 1
agent-browser eval '(()=>{const b=[...document.querySelectorAll("button")].find(x=>/چالش برق|راش|برقآسا/.test(x.textContent)); if(b){b.click();return "rush-ok";} return "rush-miss";})()' >/dev/null 2>&1 || true
sleep 2
probe "(()=>{${G} return {
  view:'rush-entry',
  heroBgOrange100:g('.rush-hero .bg-orange-100','backgroundColor'),
  heroBorderOrange200:g('.rush-hero .border-orange-200','borderColor'),
  heroBgWhite80:g('.rush-hero .bg-white\\\\/80','backgroundColor'),
  bannerBgWhite80:g('.rush-banner .bg-white\\\\/80','backgroundColor'),
  heroTextOrange600:g('.rush-hero .text-orange-600','color'),
  boardBgOrange100_80:g('.rush-board .bg-orange-100\\\\/80','backgroundColor'),
  boardBorderOrange200:g('.rush-board .border-orange-200','borderColor'),
  boardBgWhite70:g('.rush-board .bg-white\\\\/70','backgroundColor')
};})()"

# ---- DUEL ENTRY (duel-hero / leaderboard duel-mode) ----
agent-browser eval '(()=>{const b=[...document.querySelectorAll("button")].find(x=>x.textContent.trim()==="خانه"); if(b){b.click();return "ok";} return "miss";})()' >/dev/null 2>&1 || true
sleep 1
agent-browser eval '(()=>{const b=[...document.querySelectorAll("button")].find(x=>/نبرد|دودل|duel/i.test(x.textContent)); if(b){b.click();return "duel-ok";} return "duel-miss";})()' >/dev/null 2>&1 || true
sleep 2
probe "(()=>{${G} return {
  view:'duel-entry',
  heroBgWhite15:g('.duel-hero .bg-white\\\\/15','backgroundColor'),
  heroTextWhite85:g('.duel-hero .text-white\\\\/85','color'),
  cardTextFuchsia700:g('.duel-card .text-fuchsia-700','color'),
  cardTextFuchsia600:g('.duel-card .text-fuchsia-600','color'),
  hudBorderFuchsia200:g('.duel-hud .border-fuchsia-200','borderColor')
};})()"

# ---- MY WORDS ----
agent-browser eval '(()=>{const b=[...document.querySelectorAll("button")].find(x=>x.textContent.trim()==="خانه"); if(b){b.click();return "ok";} return "miss";})()' >/dev/null 2>&1 || true
sleep 1
agent-browser eval '(()=>{const b=[...document.querySelectorAll("button")].find(x=>x.textContent.includes("واژه‌های من")); if(b){b.click();return "mw-ok";} return "mw-miss";})()' >/dev/null 2>&1 || true
sleep 2
probe "(()=>{${G} return {
  view:'my-words',
  bgWhite:g('.bg-white','backgroundColor'),
  bgWhite70:g('.bg-white\\\\/70','backgroundColor'),
  textAmber600:g('.text-amber-600','color'),
  textRose600:g('.text-rose-600','color'),
  textEmerald700:g('.text-emerald-700','color')
};})()"

echo "PROBE_MODE=$MODE OUT=$OUT DONE" >&2
