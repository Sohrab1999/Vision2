#!/bin/bash
# راند ۲۴۷ — QA زندهٔ بخش دوم: حبابِ چیپ با متنِ نو + آزمونِ واقعی + ۳۹۰ تاریک
cd /home/z/my-project
if ! curl -s -o /dev/null --max-time 4 http://127.0.0.1:3000; then
  setsid nohup bun --smol run dev >> dev.log 2>&1 < /dev/null &
  for i in $(seq 1 40); do curl -s -o /dev/null --max-time 4 http://127.0.0.1:3000 && break; sleep 2; done
fi
curl -s -o /dev/null -w "server:%{http_code}\n" http://127.0.0.1:3000
ab() { agent-browser "$@"; }

echo "=== [0] seed ==="
ab open "http://127.0.0.1:3000" >/dev/null; sleep 4
ab eval "(() => { const rec={scope:'grammar',id:'t-present-simple',title:'حال ساده',hint:'ص ۲۳'}; localStorage.setItem('vision2-bg-last-item',JSON.stringify(rec)); localStorage.setItem('vision2-bg-history',JSON.stringify([{scope:'verbs',id:'eat',title:'eat — ate — eaten',hint:'خوردن'},rec])); const s=JSON.parse(localStorage.getItem('vision2-study-v1')||'{}'); if(s.state){s.state.onboarded=true; localStorage.setItem('vision2-study-v1',JSON.stringify(s));} location.reload(); return 'seeded'; })()"
sleep 4

echo "=== [1] حبابِ چیپ با متنِ صادقِ نو ==="
ab eval "(() => { window.dispatchEvent(new CustomEvent('open-shortcuts')); return 'guide'; })()" >/dev/null; sleep 0.8
ab eval "(() => { const row=document.querySelector('[data-testid=\"resume-door-appendix\"]'); return row? (row.click(),'ok') : 'MISSING'; })()"
sleep 1.5
ab eval "(() => { const chip=document.querySelector('[data-testid=\"appendix-recent-chip-verbs-eat\"]'); return chip? (chip.scrollIntoView({block:'center'}), chip.click(), 'chip-clicked') : 'CHIP-MISSING'; })()"
sleep 1
ab eval "(() => { const h=document.querySelector('[data-testid=\"appendix-recent-chip-hint\"]'); return JSON.stringify({hint: !!h, text: h?.textContent, pe: h?.className.includes('pointer-events-none')}); })()"
ab screenshot qa-r247-2-chip-hint-light.png >/dev/null 2>&1 && echo "shot-chip saved"

echo "=== [2] آزمون جامع ۱۰ سوالی — دستیِ قدم‌به‌قدم ==="
ab eval "(() => { const btns=Array.from(document.querySelectorAll('nav button')); const b=btns.find(x=>x.textContent.includes('آزمون جامع')); return b? (b.click(),'nav-exam') : 'NAV-MISSING'; })()"
sleep 2
ab eval "(() => { window.dispatchEvent(new CustomEvent('open-exam-with',{detail:{count:10,timed:false}})); return 'prefilled'; })()"
sleep 0.5
ab eval "(() => { const btns=Array.from(document.querySelectorAll('button')); const b=btns.find(x=>x.textContent.includes('شروع آزمون جامع')); return b? (b.click(),'started') : 'START-MISSING'; })()"
sleep 2
ab eval "(() => { const opts=document.querySelectorAll('[data-quiz]'); const nx=document.querySelector('[data-quiz-next]'); return JSON.stringify({opts: opts.length, next: !!nx, q: document.querySelector('[dir=ltr].en-text')?.textContent?.slice(0,40)}); })()"

echo "--- حلقهٔ پاسخ‌دهی (۱۲ دور با پایش) ---"
ab eval "(async () => { const sleep=(ms)=>new Promise(r=>setTimeout(r,ms)); let clicks=0; for(let i=0;i<12;i++){ const opts=document.querySelectorAll('[data-quiz]'); if(!opts.length){break;} opts[1]?.click(); clicks++; await sleep(180); const nx=document.querySelector('[data-quiz-next]'); if(nx){nx.click(); clicks++;} await sleep(220); } return 'done:'+clicks; })()"
sleep 3
ab eval "(() => { const opts=document.querySelectorAll('[data-quiz]').length; const row=!!document.querySelector('[data-testid=\"results-resume-row\"]'); const prog=document.querySelector('.bg-emerald-50')?.textContent; return JSON.stringify({optsLeft: opts, resultRow: row}); })()"
