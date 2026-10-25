#!/bin/bash
# Task 102 — single-session QA smoke (task 101 handoff verify: share buttons visible, no errors)
set -u
URL="http://127.0.0.1:3000"
echo "== open home =="
agent-browser open "$URL" && sleep 3
echo "== console errors (pristine load) =="
agent-browser console | grep -iE "error|warn" | grep -v "Download the React DevTools" | head -10
echo "== console count =="
agent-browser console | grep -icE "error" || true
echo "== page title =="
agent-browser get title
echo "== snapshot head (home markers) =="
agent-browser snapshot 2>/dev/null | head -60
echo "== mobile 390 overflow check (home) =="
agent-browser eval "(() => { const d=document.documentElement; return {sw: d.scrollWidth, cw: d.clientWidth, overflow: d.scrollWidth - d.clientWidth}; })()"
