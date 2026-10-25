#!/usr/bin/env bash
# r323-debug — سه ابهامِ اجرایِ اول: ① NO-BTNِ واژههای من ② gradeChips=0 ③ thinkChip
set -uo pipefail
BASE="http://127.0.0.1:3000"
DIR=/home/z/my-project/scripts
PERSONA=$(node "$DIR/r323-persona.js" champion)

agent-browser open "$BASE" >/dev/null 2>&1
agent-browser set viewport 390 844 >/dev/null 2>&1
agent-browser wait 'body' >/dev/null 2>&1 || true
sleep 1.5
agent-browser eval "(()=>{localStorage.setItem('vision2-study-v1', JSON.stringify(${PERSONA})); location.reload(); return 'seeded';})()" >/dev/null 2>&1
sleep 4

echo "== ① tool grid buttons =="
agent-browser eval "(()=>{const g=document.querySelector('[aria-label=\"ابزارهای یادگیری\"]');if(!g)return 'NO-GRID';return JSON.stringify([...g.querySelectorAll('button')].map(b=>b.textContent?.trim().slice(0,24)));})()" 2>&1

echo "== ② results after persist (grade keys) =="
agent-browser eval "(()=>{const st=JSON.parse(localStorage.getItem('vision2-study-v1')||'{}').state||{};const r=st.results||{};return JSON.stringify(Object.fromEntries(Object.entries(r).filter(([k])=>k.startsWith('final')||k.startsWith('exam')).map(([k,v])=>[k,!!v])));})()" 2>&1
agent-browser eval "(()=>{const w=window.__NEXT_HYDRATED__||'n/a';const st=(JSON.parse(localStorage.getItem('vision2-study-v1')||'{}').state||{});return 'localStorage keys: '+Object.keys(st.results||{}).filter(k=>k.includes('final')).join(',');})()" 2>&1

echo "== ③ exam view: grade buttons with results =="
agent-browser eval "(()=>{const g=document.querySelector('[aria-label=\"ابزارهای یادگیری\"]');const b=[...g.querySelectorAll('button')].find(x=>x.textContent?.includes('آزمون'));b.click();return 'clicked';})()" >/dev/null 2>&1
sleep 2.2
agent-browser eval "(()=>{const t=document.body.innerText;const btns=[...document.querySelectorAll('button[aria-pressed]')].map(b=>({p:b.getAttribute('aria-pressed'),tx:b.textContent?.replace(/\s+/g,' ').trim().slice(0,40)})).filter(x=>x.tx&&x.tx.includes('بهترین'));return JSON.stringify({finalHead:t.includes('آزمون جامع پایان ترم'),gradeBtns:btns,has84:t.includes('۸۴'),lines:t.split('\n').filter(l=>l.includes('بهترین')).slice(0,6)});})()" 2>&1

echo "== ④ duel think chip (attribute probe) =="
agent-browser open "$BASE" >/dev/null 2>&1; sleep 2.4
agent-browser eval "window.dispatchEvent(new Event('open-duel')); 'ok'" >/dev/null 2>&1
sleep 2.2
agent-browser eval "(()=>{const chip=document.querySelector('.duel-card [role=\"img\"][aria-label]');const all=[...document.querySelectorAll('.duel-card [role=\"img\"]')].map(x=>x.getAttribute('aria-label'));return JSON.stringify({first:chip?chip.getAttribute('aria-label'):null, all});})()" 2>&1

agent-browser close >/dev/null 2>&1
pkill -f "chrome" 2>/dev/null || true
echo "== debug done =="
