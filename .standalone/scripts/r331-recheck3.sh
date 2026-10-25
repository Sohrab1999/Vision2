#!/usr/bin/env bash
# ------------------------------------------------------------------
# r331-recheck3 — وارسیِ زندهٔ درمانهایِ دوم:
#   A. تمرین هوشمند: چیپِ درصدِ ۷۰۰شده + CTA با توکنِ arcade-from (روشن+تاریک)
#   B. فیدبکِ immediate با ✗ رویِ صفحه (بدونِ next — تکشلیک)
#   C. دیکته: تایپِ غلط → حروفِ خطخوردهٔ ۷۰۰شده + you typed (روشن+تاریک)
#   D. جریانِ دستور: کارتِ «غلط کلاسیک» (۷۰۰شده) — بهترینِ تلاش
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
DIR=/home/z/my-project/scripts
OUT=/tmp/r331-recheck3.txt
mkdir -p "$EV"; : > "$OUT"

dbg()   { echo "-- [contrast] $1" | tee -a "$OUT"; agent-browser eval "$(cat "$DIR/r328-fails-dbg.js")" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
to_dark()  { agent-browser eval "(()=>{localStorage.setItem('theme','dark');document.documentElement.classList.add('dark');return 'dark';})()" >/dev/null 2>&1; sleep 1.2; }
to_light() { agent-browser eval "(()=>{localStorage.setItem('theme','light');document.documentElement.classList.remove('dark');return 'light';})()" >/dev/null 2>&1; sleep 1.2; }
click_tool() {
  agent-browser eval "(()=>{const g=document.querySelector('[aria-label=\"ابزارهای یادگیری\"]');if(!g)return 'NO-GRID';const b=[...g.querySelectorAll('button')].find(x=>(x.textContent||'').replace(/\\u200c/g,'').includes('$1'));if(!b)return 'NO-BTN';b.click();return 'clicked';})()" 2>&1
}
open_spine() {
  agent-browser eval "(()=>{const s=[...document.querySelectorAll('.book-spine .en-text')].find(x=>x.textContent?.trim()==='$1');if(!s)return 'NO-SPINE';const b=s.closest('button');if(!b)return 'NO-BTN';b.click();return 'clicked';})()" 2>&1
}

echo "########## A — تمرین هوشمند پسِ از درمان" | tee -a "$OUT"
agent-browser open "$BASE" >/dev/null 2>&1
agent-browser set viewport 390 844 >/dev/null 2>&1
agent-browser wait 'body' >/dev/null 2>&1 || true
sleep 2
PERSONA=$(node "$DIR/r324-persona.js")
agent-browser eval "(()=>{localStorage.setItem('vision2-study-v1', JSON.stringify(${PERSONA})); location.reload(); return 'seeded';})()" >/dev/null 2>&1
sleep 4
click_tool "تمرین هوشمند" >/dev/null 2>&1; sleep 2.5
dbg "smart-landing-light-FIXED"
agent-browser screenshot "$EV/r331-smart-landing-fixed.png" >/dev/null 2>&1
to_dark
dbg "smart-landing-dark-FIXED"
to_light

echo "########## B — فیدبکِ immediate با ✗ (تکشلیک، بدونِ next)" | tee -a "$OUT"
for TRY in 1 2; do
  agent-browser open "$BASE" >/dev/null 2>&1; sleep 2.5
  click_tool "آزمون جامع" >/dev/null 2>&1; sleep 2.5
  agent-browser eval "(()=>{const b=[...document.querySelectorAll('button')].find(x=>(x.textContent||'').includes('مرور اشتباهات آزمون جامع'));if(!b)return 'NO-CTA';b.click();return 'ok';})()" >/dev/null 2>&1
  sleep 2.5
  # گزینهٔ ۳ (d) — شانسِ غلطِ بالاتر
  agent-browser eval "(()=>{const o=document.querySelector('[data-quiz-option=\"3\"]')||document.querySelector('[data-quiz-option=\"2\"]');if(!o)return 'NO-OPT';o.click();return 'answered';})()" >/dev/null 2>&1
  sleep 1.6
  MARK=$(agent-browser eval "(()=>{const p=document.querySelector('[data-quiz-feedback] p');return p?p.textContent.slice(0,1):'NO-FB';})()" 2>&1)
  echo "try=$TRY mark=$MARK" | tee -a "$OUT"
  [[ "$MARK" == "✗" ]] && break
done
dbg "mistakes-fb-rose-light-FIXED"
agent-browser screenshot "$EV/r331-mistakes-fb-fixed.png" >/dev/null 2>&1
to_dark
dbg "mistakes-fb-rose-dark-FIXED"
to_light

echo "########## C — دیکته: تایپِ غلط" | tee -a "$OUT"
agent-browser open "$BASE" >/dev/null 2>&1; sleep 2.5
open_spine "L1" >/dev/null 2>&1; sleep 2.5
agent-browser eval "(()=>{const nav=[...document.querySelectorAll('nav')].find(n=>(n.getAttribute('aria-label')||'').includes('درس'));if(!nav)return 'NO-NAV';const b=[...nav.querySelectorAll('button')].find(x=>(x.textContent||'').replace(/\\u200c/g,'').trim()==='دیکته');if(!b)return 'NO-TAB';b.click();return 'dictation';})()" | tee -a "$OUT"
sleep 2.5
agent-browser eval "(()=>{const i=document.querySelector('input[type=text],input:not([type])');if(!i)return 'NO-INPUT';const set=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;set.call(i,'xxxxx');i.dispatchEvent(new Event('input',{bubbles:true}));return 'typed';})()" >/dev/null 2>&1
agent-browser eval "(()=>{const b=[...document.querySelectorAll('button')].find(x=>(x.textContent||'').includes('بررسی'));if(!b)return 'NO-CHECK';b.click();return 'checked';})()" >/dev/null 2>&1
sleep 2
agent-browser eval "(()=>{const t=document.body.innerText;return JSON.stringify({wrongLetters:t.includes('␣')||!!document.querySelector('.line-through'),youTyped:t.includes('you typed')});})()" | tee -a "$OUT"
dbg "dictation-wrong-light-FIXED"
agent-browser screenshot "$EV/r331-dictation-wrong-fixed.png" >/dev/null 2>&1
to_dark
dbg "dictation-wrong-dark-FIXED"
to_light

echo "########## D — جریانِ دستور: کارتِ غلط کلاسیک" | tee -a "$OUT"
agent-browser open "$BASE" >/dev/null 2>&1; sleep 2.5
open_spine "L1" >/dev/null 2>&1; sleep 2.5
agent-browser eval "(()=>{const nav=[...document.querySelectorAll('nav')].find(n=>(n.getAttribute('aria-label')||'').includes('درس'));if(!nav)return 'NO-NAV';const b=[...nav.querySelectorAll('button')].find(x=>(x.textContent||'').replace(/\\u200c/g,'').trim()==='دستور');if(!b)return 'NO-TAB';b.click();return 'grammar';})()" | tee -a "$OUT"
sleep 2.5
agent-browser eval "(()=>{const g=document.querySelector('.glesson-mistake');if(!g)return 'NO-MISTAKE-CARD';const t=g.getBoundingClientRect();return JSON.stringify({found:true,top:Math.round(t.top)});})()" | tee -a "$OUT"
dbg "grammar-mistake-light-FIXED"
to_dark
dbg "grammar-mistake-dark-FIXED"
to_light

echo "########## DONE" | tee -a "$OUT"
agent-browser close >/dev/null 2>&1
echo "log=$OUT"
