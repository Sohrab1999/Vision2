#!/usr/bin/env bash
# QA v2 for tinted-ink tokens (task 68) — reliable dark protocol.
# Dark: token-relative assertion (probe span with var(--color-X) must equal
# the utility element's computed color). Light: values equal the pre-change
# baseline. Single session.
set -e
BASE="http://127.0.0.1:3000"

agent-browser close >/dev/null 2>&1 || true
agent-browser open "$BASE" >/dev/null
sleep 6
agent-browser snapshot >/tmp/t68b-snap.txt 2>&1 || true
if grep -q 'ناشناس میمانم' /tmp/t68b-snap.txt; then
  REF=$(grep -oE 'button "رد کردن — ناشناس میمانم" \[ref=(e[0-9]+)\]' /tmp/t68b-snap.txt | grep -oE 'e[0-9]+' | head -1)
  agent-browser click "$REF" >/dev/null
  sleep 1
fi
echo "FRESH_CONSOLE: $(agent-browser console 2>/dev/null | rg -c 'error' || echo 0)"

click_toggle() { # $1 = exact aria-label
  agent-browser snapshot >/tmp/t68b-tog.txt 2>&1 || true
  REF=$(grep -oE "button \"$1\" \[ref=(e[0-9]+)\]" /tmp/t68b-tog.txt | grep -oE 'e[0-9]+' | head -1)
  [ -n "$REF" ] && agent-browser click "$REF" >/dev/null
  sleep 1.5
}
probe() { agent-browser eval "$1" 2>/dev/null; }

# ---- DARK ON ----
click_toggle "حالت شب"
echo "DARK: $(probe 'document.documentElement.classList.contains("dark")?"on":"off"')"

# token-relative matcher: find a visible element carrying clsPart, compare its
# color to a live span pinned to var(--color-shade)
tokmatch() { # $1 shade var, $2 utility-class substring
  probe "(()=>{const e=[...document.querySelectorAll('[class*=\"$2\"]')].find(x=>x.offsetParent);if(!e)return 'no-el:$2';const p=document.createElement('span');p.style.color='var(--color-$1)';document.body.appendChild(p);const tc=getComputedStyle(p).color;const uc=getComputedStyle(e).color;p.remove();return tc===uc?'MATCH:$2':'DIFF:$2 token='+tc+' util='+uc})()"
}

# home: orange-700 (konkur card) + amber-800 (banners/quests)
echo "D_ORANGE700: $(tokmatch 'orange-700' 'text-orange-700')"
echo "D_AMBER800: $(tokmatch 'amber-800' 'text-amber-800')"

# my-words: sky-600
agent-browser eval '(()=>{const b=[...document.querySelectorAll("button,a")].find(x=>{const t=(x.textContent||"").replace(/\u200c/g,"");return /واژههای من/.test(t)&&x.offsetParent});if(b)b.click();return "nav"})()' >/dev/null 2>&1
sleep 2.5
echo "D_SKY600: $(tokmatch 'sky-600' 'text-sky-600')"
echo "D_SKY700: $(tokmatch 'sky-700' 'text-sky-700')"

# review dashboard: sky-800
agent-browser eval '(()=>{const b=[...document.querySelectorAll("button,a")].find(x=>/داشبورد مرور/.test(x.textContent||"")&&x.offsetParent);if(b)b.click();return "nav"})()' >/dev/null 2>&1
sleep 2.5
echo "D_SKY800: $(tokmatch 'sky-800' 'text-sky-800')"

# appendix: amber-900 + rose-900 (book-content families served by retired globals)
agent-browser eval '(()=>{const b=[...document.querySelectorAll("button,a")].find(x=>/ضمیمه/.test(x.textContent||"")&&x.offsetParent);if(b)b.click();return "nav"})()' >/dev/null 2>&1
sleep 2.5
echo "D_AMBER900: $(tokmatch 'amber-900' 'text-amber-900')"
echo "D_ROSE900: $(tokmatch 'rose-900' 'text-rose-900')"

# slate-500: gmetro (grammar metro view) — text-slate-500 in gmetro-lesson
agent-browser eval '(()=>{const b=[...document.querySelectorAll("button,a")].find(x=>/متروی گرامر/.test(x.textContent||"")&&x.offsetParent);if(b)b.click();return "nav"})()' >/dev/null 2>&1
sleep 2.5
echo "D_SLATE500: $(tokmatch 'slate-500' 'text-slate-500')"

# violet-800 hover (skill panel via report digest?) — probe any [class*=text-violet-800]
echo "D_VIOLET800: $(tokmatch 'violet-800' 'text-violet-800')"

# ---- LIGHT ON (restore) ----
click_toggle "حالت روشن"
echo "LIGHT: $(probe 'document.documentElement.classList.contains("dark")?"still-dark":"light-ok"')"
echo "L_ORANGE700: $(probe '(()=>{const e=[...document.querySelectorAll(\"[class*=text-orange-700]\")].find(x=>x.offsetParent);if(!e)return \"no-el\";return getComputedStyle(e).color})()')"
echo "L_AMBER900: $(probe '(()=>{const e=[...document.querySelectorAll(\"[class*=text-amber-900]\")].find(x=>x.offsetParent);if(!e)return \"no-el\";return getComputedStyle(e).color})()')"

# mobile 390
agent-browser set viewport 390 844 >/dev/null 2>&1 || true
sleep 2
echo "MOBILE390: $(probe 'JSON.stringify({sw:document.documentElement.scrollWidth,iw:window.innerWidth})')"
agent-browser close >/dev/null 2>&1 || true

# fresh session console
agent-browser open "$BASE" >/dev/null
sleep 5
agent-browser snapshot >/tmp/t68b-fresh.txt 2>&1 || true
if grep -q 'ناشناس میمانم' /tmp/t68b-fresh.txt; then
  REF=$(grep -oE 'button "رد کردن — ناشناس میمانم" \[ref=(e[0-9]+)\]' /tmp/t68b-fresh.txt | grep -oE 'e[0-9]+' | head -1)
  agent-browser click "$REF" >/dev/null
  sleep 1
fi
echo "FRESH_CONSOLE_2: $(agent-browser console 2>/dev/null | rg -c 'error' || echo 0)"
agent-browser close >/dev/null 2>&1 || true
echo "QA_DONE"
