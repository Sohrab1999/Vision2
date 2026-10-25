#!/usr/bin/env bash
# r323-debug3 — رسیدنِ مطمئن به نمای آزمون + پروبِ دکمههای پایه
set -uo pipefail
BASE="http://127.0.0.1:3000"
DIR=/home/z/my-project/scripts
PERSONA=$(node "$DIR/r323-persona.js" champion)

agent-browser open "$BASE" >/dev/null 2>&1
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 1.5
agent-browser eval "(()=>{localStorage.setItem('vision2-study-v1', JSON.stringify(${PERSONA})); location.reload(); return 'seeded';})()" >/dev/null 2>&1
sleep 4.5
R=$(agent-browser eval "(()=>{const g=document.querySelector('[aria-label=\"ابزارهای یادگیری\"]');if(!g)return 'NO-GRID';const b=[...g.querySelectorAll('button')].find(x=>(x.textContent||'').replace(/\u200c/g,'').includes('آزمون جامع'));if(!b)return 'NO-BTN';b.click();return 'clicked';})()" 2>&1)
echo "click=$R"
sleep 2.6
agent-browser eval "(()=>{const t=document.body.innerText;return JSON.stringify({
  onExam: t.includes('بهترین نتیجه') || t.includes('آزمون جامع پایان ترم'),
  finalHead: t.includes('آزمون جامع پایان ترم'),
  has76: t.includes('۷۶'), has88: t.includes('۸۸'),
  modeTabs: [...document.querySelectorAll('[role=tablist]')].map(tl=>tl.getAttribute('aria-label')).slice(0,4),
});})()" 2>&1
agent-browser eval "(()=>{const card=document.querySelector('.final-exam-card');if(!card)return JSON.stringify({card:false, examHead: document.body.innerText.split('\n').slice(0,8)});const btns=[...card.querySelectorAll('button[aria-pressed]')];return JSON.stringify({card:true, n:btns.length, texts:btns.map(b=>b.innerText.replace(/\n/g,' | ').slice(0,70))});})()" 2>&1
agent-browser close >/dev/null 2>&1
pkill -f "chrome" 2>/dev/null || true
echo "== done =="
