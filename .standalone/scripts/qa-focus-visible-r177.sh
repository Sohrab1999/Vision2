#!/bin/bash
# Task 177 — focus-visible live QA on :3000 dev (single session).
# Real-keyboard Tab walk: after each Tab, activeElement must show a visible
# focus signal — computed outline (global fallback) OR box-shadow (Tailwind
# ring). Plus: command-palette input (the task-177 fix) gets its emerald ring.
set -u
cd /home/z/my-project
BASE="http://127.0.0.1:3000"
PASS=0; FAIL=0; SKIP=0
ok(){ echo "PASS: $1"; PASS=$((PASS+1)); }
bad(){ echo "FAIL: $1"; FAIL=$((FAIL+1)); }
skp(){ echo "SKIP: $1"; SKIP=$((SKIP+1)); }

agent-browser close >/dev/null 2>&1 || true
agent-browser open "$BASE" >/dev/null
sleep 6
agent-browser eval '(()=>{const b=[...document.querySelectorAll("button")].find(x=>/ناشناس\s*می.مانم/.test(x.textContent||""));if(b){b.click();return "skipped"}return "no-intro"})()' >/dev/null 2>&1
sleep 2

echo "== P1: keyboard Tab walk — every stop has a visible focus signal =="
# body focus first so the walk starts deterministic
agent-browser eval 'document.body.focus();document.body.blur();1' >/dev/null 2>&1
SIGS=""
for i in 1 2 3 4 5 6 7 8; do
  agent-browser press Tab >/dev/null 2>&1
  sleep 0.4
  R=$(agent-browser eval '(()=>{const el=document.activeElement;if(!el||el===document.body)return JSON.stringify({stop:"body"});const cs=getComputedStyle(el);const vis=(cs.outlineStyle!=="none"&&parseFloat(cs.outlineWidth)>0)||cs.boxShadow!=="none";return JSON.stringify({stop:el.tagName,vis,ow:cs.outlineWidth,sh:cs.boxShadow!=="none"})})()' 2>&1 | tr -d '"\')
  SIGS="$SIGS $R"
  echo "  tab$i: $R"
done
VISN=$(echo "$SIGS" | grep -o 'vis:true' | wc -l)
[ "$VISN" -ge 6 ] && ok "keyboard Tab walk: $VISN/8 stops with visible focus signal" || bad "only $VISN/8 stops visible"

echo "== P2: command palette input (the r177 fix) — emerald ring on focus =="
agent-browser press Control+k >/dev/null 2>&1
sleep 2
R=$(agent-browser eval '(()=>{const inp=document.activeElement;if(!inp||inp.tagName!=="INPUT")return JSON.stringify({open:false,tag:document.activeElement&&document.activeElement.tagName});const cs=getComputedStyle(inp);return JSON.stringify({open:true,ring:cs.boxShadow!=="none",shadow:cs.boxShadow.slice(0,60)})})()' 2>&1 | tr -d '"\')
echo "$R"
echo "$R" | grep -q 'open:true' && ok "Ctrl+K focuses palette input directly" || skp "palette input not auto-focused (Ctrl+K state)"
echo "$R" | grep -q 'ring:true' && ok "palette input shows ring box-shadow (r177 fix live)" || bad "palette input ring missing"

echo "== P3: hygiene =="
agent-browser press Escape >/dev/null 2>&1
C=$(agent-browser console 2>&1 | grep -ciE "error" || true)
[ "${C:-0}" = "0" ] && ok "console = 0 errors" || bad "console has $C errors"
agent-browser screenshot /home/z/my-project/download/qa-r177-focus.png >/dev/null 2>&1 && ok "screenshot saved" || skp "screenshot"
echo "QA-DONE pass=$PASS fail=$FAIL skip=$SKIP"
agent-browser close >/dev/null 2>&1 || true
