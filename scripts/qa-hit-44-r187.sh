#!/bin/bash
# Task 187 — P9 hit-area live QA (unslop F9 / KR-3 hard).
# Measures REAL interactive-element rects in the sticky header + the
# back-to-top FAB at mobile 390 AND tablet/desktop 900, expecting every
# hit area >= 44x44 (the plan's stated verification: header small:[]).
# Also: page hygiene (console errors = 0, no horizontal overflow at 390)
# + screenshot evidence. Main-content sweep is REPORT-ONLY (the plan's
# census targets chrome; content cards own their larger surfaces).
set -u
cd /home/z/my-project
BASE="http://127.0.0.1:3000"
PASS=0; FAIL=0
ok(){ echo "PASS: $1"; PASS=$((PASS+1)); }
bad(){ echo "FAIL: $1"; FAIL=$((FAIL+1)); }

MEASURE='(()=>{
  const sel="button, [role=\"button\"], a[href], input, select, textarea";
  const els=[...document.querySelectorAll(sel)];
  const vis=e=>{const r=e.getBoundingClientRect();const s=getComputedStyle(e);return r.width>0&&r.height>0&&s.visibility!=="hidden"&&s.display!=="none";};
  const out={header:[],fab:[],main:[]};
  for(const e of els){
    if(!vis(e))continue;
    const r=e.getBoundingClientRect();
    const item={w:Math.round(r.width),h:Math.round(r.height),l:(e.getAttribute("aria-label")||e.textContent||"").trim().slice(0,24)};
    if(e.closest("header"))out.header.push(item);
    else if((e.getAttribute("aria-label")||"")==="بازگشت به بالای صفحه")out.fab.push(item);
    else if(r.top<844)out.main.push(item);
  }
  const small=a=>a.filter(x=>x.w<44||x.h<44);
  return JSON.stringify({hs:small(out.header),fs:small(out.fab),ms:small(out.main).length,mss:small(out.main).slice(0,6),hc:out.header.length});
})()'

echo "== P0: service up =="
CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE")
[ "$CODE" = "200" ] && ok "GET / -> 200" || bad "GET / -> $CODE"

agent-browser close >/dev/null 2>&1 || true

for W in 390 900; do
  H=844; [ "$W" = "900" ] && H=780
  echo "== P1@${W}px: header + FAB hit areas =="
  agent-browser set viewport $W $H >/dev/null 2>&1
  agent-browser open "$BASE" >/dev/null
  sleep 7
  # onboarding skip (ZWNJ-tolerant) — same idiom as prior QA scripts
  agent-browser eval '(()=>{const b=[...document.querySelectorAll("button")].find(x=>/ناشناس\s*می.مانم/.test(x.textContent||""));if(b){b.click();return 1}return 0})()' >/dev/null 2>&1
  sleep 1
  R=$(agent-browser eval "$MEASURE" 2>&1 | tr -d '"\\')
  echo "$R" | head -c 700; echo
  echo "$R" | grep -q 'hs:\[\]' && ok "header small:[] @${W}" || bad "header sub-44 @${W}: $R"
  echo "$R" | grep -q 'fs:\[\]' && ok "FAB >=44 @${W}" || bad "FAB sub-44 @${W}"
done

echo "== P3: hygiene @390 — console errors + overflow + evidence =="
agent-browser set viewport 390 844 >/dev/null 2>&1
agent-browser open "$BASE" >/dev/null
sleep 6
agent-browser eval '(()=>{const b=[...document.querySelectorAll("button")].find(x=>/ناشناس\s*می.مانم/.test(x.textContent||""));if(b)b.click();return 1})()' >/dev/null 2>&1
sleep 1
OW=$(agent-browser eval 'document.documentElement.scrollWidth' 2>&1 | tr -d '"\\')
echo "scrollWidth=$OW"
[ "$OW" -le 390 ] 2>/dev/null && ok "no horizontal overflow @390 ($OW)" || bad "overflow @390: $OW"
ERRS=$(agent-browser console 2>&1 | grep -ci error || true)
[ "$ERRS" = "0" ] && ok "console errors = 0" || bad "console errors = $ERRS"
agent-browser screenshot download/qa-r187-hit44.png >/dev/null 2>&1 && ok "screenshot download/qa-r187-hit44.png" || bad "screenshot failed"

agent-browser close >/dev/null 2>&1 || true
echo "== RESULT: $PASS PASS / $FAIL FAIL =="
[ "$FAIL" = "0" ]
