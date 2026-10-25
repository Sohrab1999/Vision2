#!/bin/bash
set -u
URL="http://127.0.0.1:3000"
echo "== open (session persists profile) =="
agent-browser open "$URL" && sleep 2
echo "== skip onboarding if present =="
agent-browser eval "(() => { const b=[...document.querySelectorAll('button')].find(x=>/ناشناس/.test(x.textContent||'')); if(b){b.click(); return 'skipped';} return 'no-dialog'; })()"
sleep 1
echo "== navigate to duel view =="
agent-browser eval "(() => { const b=[...document.querySelectorAll('button,a')].find(x=>/نبرد|دودل/.test(x.textContent||'')); if(b){b.click(); return 'clicked:'+(b.textContent||'').trim().slice(0,30);} return 'not-found'; })()"
sleep 2
echo "== duel view markers =="
agent-browser eval "(() => { const t=document.body.innerText; return { hasRoomJoin: /اتاق/.test(t), hasLedger: /آخرین نبردها|دفترچه/.test(t), hasExport: !!document.querySelector('button[title*=عکس], button[aria-label*=عکس]'), exportBtnText: ([...document.querySelectorAll('button')].map(b=>(b.getAttribute('title')||'')+'|'+(b.getAttribute('aria-label')||'')).filter(s=>/عکس/.test(s))).slice(0,4) }; })()"
echo "== console errors so far =="
agent-browser console | grep -icE "error" || true
echo "== resize mobile 390 =="
agent-browser set viewport 390 844 2>/dev/null || agent-browser viewport 390 844 2>/dev/null || echo "viewport cmd?"
sleep 1
agent-browser eval "(() => { const d=document.documentElement; return {sw: d.scrollWidth, cw: d.clientWidth, overflow: d.scrollWidth - d.clientWidth}; })()"
