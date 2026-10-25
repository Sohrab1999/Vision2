#!/usr/bin/env bash
# ------------------------------------------------------------------
# r358 — «هشدارِ بودجهٔ روخوانی در نبض» — live judgment, ONE session.
# Chain: anonymous onboarding → settings → REAL TTS preview (a cache
# miss = the ONLY thing that costs) → the pulse dialog → the new
# pulse-tts-budget strip must show the REAL month meter + the fresh
# «روخوانیِ تازه» row in the AI family, beside its explain sibling.
# Lesson of r356/r357 (repeated): agent-browser eval prints ESCAPED
# JSON — grep must hunt `key\\":value`, not `key":"value`.
# ------------------------------------------------------------------
set -uo pipefail
APP="http://127.0.0.1:3000"
SHOT_DIR="/home/z/my-project/download/qa-r358"
mkdir -p "$SHOT_DIR"
PASS=0; FAIL=0
ok(){ echo "PASS: $1"; PASS=$((PASS+1)); }
bad(){ echo "FAIL: $1"; FAIL=$((FAIL+1)); }

echo "=== 0) services ==="
CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$APP")
[ "$CODE" = "200" ] && ok "app 200" || bad "app http $CODE"

echo "=== 1) fresh single session — anonymous first (the r357 lesson) ==="
agent-browser open "$APP" >/dev/null 2>&1; sleep 3
SNAP=$(agent-browser snapshot 2>/dev/null)
if echo "$SNAP" | grep -q "ناشناس میمانم"; then
  agent-browser snapshot 2>/dev/null | grep -o 'ref=e[0-9]*' >/dev/null
  REF=$(agent-browser snapshot 2>/dev/null | grep -B0 "ناشناس میمانم" | grep -o 'ref=e[0-9]*' | head -1 | sed 's/ref=//')
  agent-browser click "$REF" >/dev/null 2>&1; sleep 2
  ok "onboarding skipped (anonymous)"
else
  ok "no onboarding gate (session warm)"
fi

echo "=== 2) settings → REAL TTS synthesis (the paid path) ==="
REF=$(agent-browser snapshot 2>/dev/null | grep 'button "تنظیمات"' | grep -o 'ref=e[0-9]*' | head -1 | sed 's/ref=//')
agent-browser click "$REF" >/dev/null 2>&1; sleep 1.5
REF=$(agent-browser snapshot 2>/dev/null | grep 'پخش نمونهٔ روخوانی' | grep -o 'ref=e[0-9]*' | head -1 | sed 's/ref=//')
if [ -n "$REF" ]; then
  agent-browser click "$REF" >/dev/null 2>&1
  echo "  preview clicked — waiting for real synthesis…"
  sleep 9
  ok "TTS preview clicked (cache-miss synthesis expected)"
else
  bad "TTS preview button not found"
fi

echo "=== 3) open the pulse dialog (the r355 eval-DOM recipe — snapshot refs go stale) ==="
# idiom: the popover may ALREADY be open (step 2 clicked the preview inside
# it) — a blind gear click would TOGGLE it closed. Open only if needed.
R=$(agent-browser eval "(()=>{const open=[...document.querySelectorAll('button')].find(x=>x.getAttribute('aria-label')==='نبضِ کامل — داشبوردِ همهٔ رویدادها');if(open){open.click();return 'pulse-opened';}const g=document.querySelector('button[aria-label=\"تنظیمات\"]');if(!g)return 'NO-GEAR';g.click();return 'gear-opened';})()" 2>/dev/null)
if ! echo "$R" | grep -q "pulse-opened"; then
  sleep 1.5
  R=$(agent-browser eval "(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.getAttribute('aria-label')==='نبضِ کامل — داشبوردِ همهٔ رویدادها');if(!b)return 'NO-PULSE-BTN';b.click();return 'pulse-opened';})()" 2>/dev/null)
fi
echo "$R" | grep -q "pulse-opened" && ok "pulse dialog opened (DOM click)" || bad "pulse open: $R"
sleep 4

echo "=== 4) the TTS budget strip — live assertions (eval-DOM, the honest probe) ==="
E=$(agent-browser eval "(()=>{const s=document.querySelector('[data-testid=\"pulse-tts-budget\"]');if(!s)return 'NO-TTS-STRIP';const fam=s.parentElement.querySelector(':scope > div > h3');return JSON.stringify({title:s.textContent.includes('بودجهٔ روخوانیِ همین ماه'),family:fam?fam.textContent:null,freshRow:document.body.textContent.includes('روخوانیِ تازه'),emerald:!!s.querySelector('.from-emerald-400'),aiStrip:!!document.querySelector('[data-testid=\"pulse-budget\"]'),closed:pct=>s.textContent.includes('سقفِ این ماه پر شده')});})()" 2>/dev/null)
echo "  strip: $E" | head -c 400; echo
echo "$E" | grep -q 'title\\":true' && ok "TTS strip title live" || bad "TTS strip title missing"
echo "$E" | grep -q 'هوش مصنوعی' && ok "rides the derived AI family" || bad "family missing"
echo "$E" | grep -q 'freshRow\\":true' && ok "fresh «روخوانیِ تازه» event row" || bad "tts_spoken row missing"
echo "$E" | grep -q 'emerald\\":true' && ok "calm = emerald (TTS brand)" || bad "emerald missing"
echo "$E" | grep -q 'aiStrip\\":true' && ok "AI sibling strip alive beside it" || bad "AI strip missing"
agent-browser screenshot "$SHOT_DIR/pulse-light.png" >/dev/null 2>&1 && ok "light screenshot"

echo "=== 5) byte-level: the meter endpoint carries the real synthesis ==="
EVAL=$(agent-browser eval "fetch('/api/tts/usage').then(r=>r.json()).then(d=>JSON.stringify(d))" 2>/dev/null)
echo "  raw eval: $EVAL" | head -c 300; echo
if echo "$EVAL" | grep -q 'ok\\":true' || echo "$EVAL" | grep -q '"ok":true'; then
  ok "usage ok:true (escaped or plain JSON — the r356 lesson)"
else
  bad "usage ok missing"
fi
USED=$(echo "$EVAL" | grep -oE '(used\\":|"used":)[0-9]*' | grep -oE '[0-9]+$' | head -1)
if [ -n "$USED" ] && [ "$USED" -ge 40 ] 2>/dev/null; then ok "meter used=$USED (≥ preview text length)"; else bad "meter used=$USED too low"; fi
echo "$EVAL" | grep -qE '(cap\\":|"cap":)150000' && ok "cap=150000 (TTS_CAP_DEFAULT)" || bad "cap mismatch"

echo "=== 6) dark mode + console ==="
agent-browser eval "document.documentElement.classList.add('dark')" >/dev/null 2>&1; sleep 1
agent-browser screenshot "$SHOT_DIR/pulse-dark.png" >/dev/null 2>&1 && ok "dark screenshot"
agent-browser eval "document.documentElement.classList.remove('dark')" >/dev/null 2>&1
CONSOLE=$(agent-browser console 2>/dev/null | grep -iE "error|uncaught" | grep -v "404" | head -3)
[ -z "$CONSOLE" ] && ok "console clean" || bad "console: $CONSOLE"

echo
echo "=== RESULT: PASS=$PASS FAIL=$FAIL ==="
[ "$FAIL" = "0" ] && echo "CLEAN-RUN" || echo "HAS-FAILURES"
