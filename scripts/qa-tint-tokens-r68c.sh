#!/usr/bin/env bash
# QA v3 — navigate via the command palette (proven path) and probe the
# remaining shades dark (token-relative) + light (baseline lab values).
set -e
BASE="http://127.0.0.1:3000"

agent-browser close >/dev/null 2>&1 || true
agent-browser open "$BASE" >/dev/null
sleep 6
agent-browser snapshot >/tmp/t68c-snap.txt 2>&1 || true
if grep -q 'ناشناس میمانم' /tmp/t68c-snap.txt; then
  REF=$(grep -oE 'button "رد کردن — ناشناس میمانم" \[ref=(e[0-9]+)\]' /tmp/t68c-snap.txt | grep -oE 'e[0-9]+' | head -1)
  agent-browser click "$REF" >/dev/null
  sleep 1
fi

click_toggle() {
  agent-browser snapshot >/tmp/t68c-tog.txt 2>&1 || true
  REF=$(grep -oE "button \"$1\" \[ref=(e[0-9]+)\]" /tmp/t68c-tog.txt | grep -oE 'e[0-9]+' | head -1)
  [ -n "$REF" ] && agent-browser click "$REF" >/dev/null
  sleep 1.5
}
palette_go() { # open palette, type query, Enter
  agent-browser press "Control+k" >/dev/null 2>&1 || true
  sleep 1
  if ! agent-browser snapshot 2>/dev/null | grep -q 'combobox'; then
    agent-browser eval '(()=>{window.dispatchEvent(new KeyboardEvent("keydown",{ctrlKey:true,code:"KeyK",key:"k",bubbles:true}));return "ev"})()' >/dev/null 2>&1
    sleep 1
  fi
  agent-browser eval "(()=>{const el=document.querySelector('.command-palette input');if(!el)return 'no-input';const set=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;set.call(el,'$1');el.dispatchEvent(new Event('input',{bubbles:true}));return 'typed'})()" >/dev/null 2>&1
  sleep 0.8
  agent-browser press "Enter" >/dev/null
  sleep 2.5
}
probe() { agent-browser eval "$1" 2>/dev/null; }
tokmatch() {
  probe "(()=>{const e=[...document.querySelectorAll('[class*=\"$2\"]')].find(x=>x.offsetParent);if(!e)return 'no-el:$2';const p=document.createElement('span');p.style.color='var(--color-$1)';document.body.appendChild(p);const tc=getComputedStyle(p).color;const uc=getComputedStyle(e).color;p.remove();return tc===uc?'MATCH:$2':'DIFF:$2 token='+tc+' util='+uc})()"
}

click_toggle "حالت شب"
echo "DARK: $(probe 'document.documentElement.classList.contains("dark")?"on":"off"')"

palette_go 'واژههای من'
echo "MYWORDS: $(probe '(document.body.innerText.match(/واژههای من|فلش/?"in-mywords":"?")')"
echo "D_SKY600: $(tokmatch 'sky-600' 'text-sky-600')"

palette_go 'داشبورد مرور'
echo "D_SKY800: $(tokmatch 'sky-800' 'text-sky-800')"
echo "D_SKY700: $(tokmatch 'sky-700' 'text-sky-700')"

palette_go 'ضمیمه'
echo "APPENDIX: $(probe '(document.body.innerText.match(/بی‌قاعده|بیقاعده|آواها/)?"in-appendix":"?")')"
echo "D_AMBER900: $(tokmatch 'amber-900' 'text-amber-900')"
echo "D_ROSE900: $(tokmatch 'rose-900' 'text-rose-900')"

palette_go 'متروی گرامر'
echo "GMETRO: $(probe '(document.body.innerText.match(/مترو|ایستگاه/)?"in-gmetro":"?")')"
echo "D_SLATE500: $(tokmatch 'slate-500' 'text-slate-500')"
echo "D_VIOLET800: $(tokmatch 'violet-800' 'text-violet-800')"

# ---- back to light: baseline values must be untouched ----
click_toggle "حالت روشن"
echo "LIGHT: $(probe 'document.documentElement.classList.contains("dark")?"still-dark":"light-ok"')"
palette_go 'گوشهٔ کنکور'
echo "L_ORANGE700: $(probe '(()=>{const e=[...document.querySelectorAll("[class*=text-orange-700]")].find(x=>x.offsetParent);return e?getComputedStyle(e).color:"no-el"})()')"
palette_go 'ضمیمه'
echo "L_AMBER900: $(probe '(()=>{const e=[...document.querySelectorAll("[class*=text-amber-900]")].find(x=>x.offsetParent);return e?getComputedStyle(e).color:"no-el"})()')"
echo "L_ROSE900: $(probe '(()=>{const e=[...document.querySelectorAll("[class*=text-rose-900]")].find(x=>x.offsetParent);return e?getComputedStyle(e).color:"no-el"})()')"

agent-browser close >/dev/null 2>&1 || true
echo "QA_DONE"
