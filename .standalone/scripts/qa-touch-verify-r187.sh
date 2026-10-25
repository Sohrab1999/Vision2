#!/bin/bash
# Task 187 — INDEPENDENT VERIFICATION of unslop plan P9 (44px touch targets).
# A parallel executor applied the P9 class sweep (h-11 w-11 / min-h-11 on the
# census interactive elements); this script re-runs the AUDIT's own live
# measurement (F9: mobile 390 header census) per the plan's Verification
# section: zero interactive elements in the header measure below 44x44,
# the named 67x32 progress-pill offender measures >= 44 tall, hygiene clean.
# Read-only role: this verifier edits NO source files (parallel-execution
# protocol — fast-commit beats rewrite wars, house lesson f19c63a).
set -u
cd /home/z/my-project
BASE="http://127.0.0.1:3000"
PASS=0; FAIL=0
ok(){ echo "PASS: $1"; PASS=$((PASS+1)); }
bad(){ echo "FAIL: $1"; FAIL=$((FAIL+1)); }

agent-browser close >/dev/null 2>&1 || true
agent-browser open "$BASE" >/dev/null
sleep 6
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 2
# skip onboarding if it photobombs (ZWNJ-tolerant, house pattern)
agent-browser eval '(()=>{const b=[...document.querySelectorAll("button")].find(x=>/ناشناس\s*می.مانم/.test(x.textContent||""));if(b)b.click();return 1})()' >/dev/null 2>&1
sleep 1

echo "== P1: header census — the audit's measurement eval, re-run =="
R=$(agent-browser eval '(()=>{
  const h=document.querySelector("header");
  if(!h)return JSON.stringify({err:"no-header"});
  const els=[...h.querySelectorAll("button,a,[role=button]")];
  const small=[],all=[];
  for(const e of els){
    const r=e.getBoundingClientRect();
    if(r.width===0&&r.height===0)continue;
    const label=(e.getAttribute("aria-label")||e.textContent||"?").trim().slice(0,16);
    all.push(label+" "+Math.round(r.width)+"x"+Math.round(r.height));
    if(r.width<44||r.height<44)small.push(label+" "+Math.round(r.width)+"x"+Math.round(r.height));
  }
  return JSON.stringify({count:els.length,small:small,measured:all})})()' 2>&1 | tr -d '"\\')
echo "$R"
# NOTE: output passes through tr -d quotes — match the QUOTE-FREE form
# (the 185 lesson: assert against the ACTUAL serialized format)
echo "$R" | grep -q 'small:\[\]' && ok "header: zero interactive elements below 44px (F9 eval small=[])" || bad "header small targets remain: $R"

echo "== P2: the named F9 offenders, re-measured =="
echo "$R" | grep -o '"measured":\[[^]]*\]' | tr ',' '\n' | sed 's/\["\?/\n/;s/"\?]//' | grep -v '^\s*$' || true
# the named 67x32 offender is the goal/progress chip; it renders in the
# header at zero-due too — find it by its Persian label, not by class
D=$(agent-browser eval '(()=>{const els=[...document.querySelectorAll("header button, header a, header span")];const p=els.find(x=>/فعالیت/.test((x.getAttribute("aria-label")||"")+" "+(x.textContent||"")));if(!p)return JSON.stringify({pill:false});const r=p.getBoundingClientRect();return JSON.stringify({pill:true,w:Math.round(r.width),h:Math.round(r.height)})})()' 2>&1 | tr -d '"\\')
echo "$D"
echo "$D" | grep -q 'pill:true' && echo "$D" | grep -Eq 'h:(4[4-9]|[5-9][0-9])' && ok "progress pill >= 44 tall (was 67x32)" || bad "progress pill: $D"

echo "== P3: hygiene =="
E=$(agent-browser errors 2>&1)
echo "$E" | rg -qi "error" && bad "console errors: $E" || ok "console clean"
SW=$(agent-browser eval 'window.innerWidth+"sw"+document.documentElement.scrollWidth' 2>&1 | tr -d '"')
echo "$SW" | grep -q "390sw390" && ok "390 viewport no overflow" || bad "overflow: $SW"
agent-browser screenshot /home/z/my-project/download/qa-r187-touch-390.png >/dev/null 2>&1 || true
agent-browser set viewport 1280 800 >/dev/null 2>&1

echo "== RESULT: PASS=$PASS FAIL=$FAIL =="
[ "$FAIL" -eq 0 ]
