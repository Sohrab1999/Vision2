#!/usr/bin/env bash
# r323-debug2 — چرا دکمههای پایه «بهترین» ندارند؟ پروبِ مستقیمِ final-exam-card
set -uo pipefail
BASE="http://127.0.0.1:3000"
DIR=/home/z/my-project/scripts
PERSONA=$(node "$DIR/r323-persona.js" champion)

agent-browser open "$BASE" >/dev/null 2>&1
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 1.5
agent-browser eval "(()=>{localStorage.setItem('vision2-study-v1', JSON.stringify(${PERSONA})); location.reload(); return 'seeded';})()" >/dev/null 2>&1
sleep 4
agent-browser eval "(()=>{const g=document.querySelector('[aria-label=\"ابزارهای یادگیری\"]');const b=[...g.querySelectorAll('button')].find(x=>(x.textContent||'').replace(/\u200c/g,'').includes('آزمون جامع'));b.click();return 'clicked';})()" >/dev/null 2>&1
sleep 2.2
agent-browser eval "(()=>{const card=document.querySelector('.final-exam-card');if(!card)return 'NO-CARD';const btns=[...card.querySelectorAll('button[aria-pressed]')];return JSON.stringify({n:btns, texts:btns.map(b=>b.innerText.replace(/\n/g,' | ').slice(0,70))});})()" 2>&1
agent-browser close >/dev/null 2>&1
pkill -f "chrome" 2>/dev/null || true
echo "== done =="
