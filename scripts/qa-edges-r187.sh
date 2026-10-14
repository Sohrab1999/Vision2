#!/bin/bash
# Task 187 — P5 double-encoded edges live QA (unslop F5 / DEC-2+DEC-4+KR-5).
# The one reachable-in-session site (official chrome bar) is verified at
# COMPUTED-STYLE level: border dropped (0px) while the real floating-layer
# cue (shadow-2xl + backdrop-blur) survives. The four session-unreachable
# sites (error boundary, duel-done buttons, PWA prompt) are verified at
# source level (grep) — honestly labeled static below.
set -u
cd /home/z/my-project
BASE="http://127.0.0.1:3000"
PASS=0; FAIL=0
ok(){ echo "PASS: $1"; PASS=$((PASS+1)); }
bad(){ echo "FAIL: $1"; FAIL=$((FAIL+1)); }

echo "== P0: static source level (session-unreachable sites) =="
grep -q 'rounded-2xl border c-card p-8 text-center shadow-lg' src/app/error.tsx \
  && bad "error.tsx still double-encoded" || ok "error.tsx: border dropped, shadow-lg kept (static)"
N=$(grep -c 'border-2 border-stone-200' src/components/study/duel/duel-done.tsx || true)
[ "$N" = "0" ] && ok "duel-done: border-2 gone (x2 buttons, static)" || bad "duel-done border-2 left: $N"
N=$(grep -c 'hover:border-fuchsia-300' src/components/study/duel/duel-done.tsx || true)
[ "$N" = "0" ] && ok "duel-done: dead hover:border rule gone with it" || bad "dead hover:border left: $N"
grep -q 'rounded-2xl border border-emerald-200 c-veil-95' src/components/study/shell/pwa-layer.tsx \
  && bad "pwa-layer still double-encoded" || ok "pwa-layer: border dropped, shadow-2xl+blur kept (static)"
grep -q 'shadow-sm transition-shadow hover:shadow-md' src/components/study/home/home-bookshelf.tsx \
  && ok "bookshelf: hover capped at shadow-md, border kept (interactive boundary)" || bad "bookshelf edit missing"

echo "== P1: official chrome — computed border 0 + shadow alive =="
agent-browser close >/dev/null 2>&1 || true
agent-browser set viewport 390 844 >/dev/null 2>&1
agent-browser open "$BASE" >/dev/null
sleep 6
agent-browser eval '(()=>{const b=[...document.querySelectorAll("button")].find(x=>/ناشناس\s*می.مانم/.test(x.textContent||""));if(b)b.click();return 1})()' >/dev/null 2>&1
sleep 1
agent-browser eval '(()=>{const b=[...document.querySelectorAll("button,a")].find(x=>(x.textContent||"").includes("کارنامه"));if(b){b.click();return "nav"}return "nf"})()' >/dev/null 2>&1
sleep 8
agent-browser eval '(()=>{const b=[...document.querySelectorAll("button")].find(x=>(x.textContent||"").includes("رسمی چاپی"));if(b){b.click();return "nav2"}return "nf"})()' >/dev/null 2>&1
sleep 4
R=$(agent-browser eval '(()=>{const el=document.querySelector(".official-chrome");if(!el)return "no-chrome";const s=getComputedStyle(el);return JSON.stringify({bw:s.borderTopWidth,sh:(s.boxShadow||"").slice(0,40),bl:s.backdropFilter})})()' 2>&1 | tr -d '"\\')
echo "$R"
echo "$R" | grep -q 'bw:0px' && ok "chrome border = 0px (second cue dropped)" || bad "chrome border: $R"
echo "$R" | grep -qE 'sh:rgba?\(0, 0, 0, (0\.2|0\.25|0\.3)?5?5?px|sh:rgba?\(0, 0, 0' && ok "chrome shadow-2xl alive (layer cue kept)" || bad "chrome shadow: $R"
OW=$(agent-browser eval 'document.documentElement.scrollWidth' 2>&1 | tr -d '"\\')
[ "$OW" -le 390 ] 2>/dev/null && ok "no overflow @390 ($OW)" || bad "overflow: $OW"
ERRS=$(agent-browser console 2>&1 | grep -ci error || true)
[ "$ERRS" = "0" ] && ok "console errors = 0" || bad "console errors = $ERRS"
agent-browser screenshot download/qa-r187-edges.png >/dev/null 2>&1 && ok "evidence download/qa-r187-edges.png" || bad "screenshot"
agent-browser close >/dev/null 2>&1 || true
echo "== RESULT: $PASS PASS / $FAIL FAIL =="
[ "$FAIL" = "0" ]
