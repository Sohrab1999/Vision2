#!/bin/bash
# راند ۲۴۷ — QA زندهٔ بندهای ①+② (۱۲۸۰ روشن)
# سرور بچهٔ همین شلِ زنده می‌ماند (درسِ OOMِ r246)
cd /home/z/my-project
if ! curl -s -o /dev/null --max-time 4 http://127.0.0.1:3000; then
  setsid nohup bun --smol run dev >> dev.log 2>&1 < /dev/null &
  for i in $(seq 1 40); do curl -s -o /dev/null --max-time 4 http://127.0.0.1:3000 && break; sleep 2; done
fi
curl -s -o /dev/null -w "server:%{http_code}\n" http://127.0.0.1:3000
ab() { agent-browser "$@"; }

echo "=== [0] seed (رکورد + تاریخچه + آنبوردینگِ بسته) ==="
ab open "http://127.0.0.1:3000" >/dev/null; sleep 4
ab eval "(() => { const rec={scope:'grammar',id:'t-present-simple',title:'حال ساده',hint:'ص ۲۳'}; localStorage.setItem('vision2-bg-last-item',JSON.stringify(rec)); localStorage.setItem('vision2-bg-history',JSON.stringify([{scope:'verbs',id:'eat',title:'eat — ate — eaten',hint:'خوردن'},rec])); const s=JSON.parse(localStorage.getItem('vision2-study-v1')||'{}'); if(s.state){s.state.onboarded=true; localStorage.setItem('vision2-study-v1',JSON.stringify(s));} location.reload(); return 'seeded'; })()"
sleep 4

echo "=== [1] بند② — حبابِ چیپِ «مسیر اخیر» ==="
ab eval "(() => { window.dispatchEvent(new CustomEvent('open-shortcuts')); return 'guide'; })()" >/dev/null; sleep 0.8
ab eval "(() => { const row=document.querySelector('[data-testid=\"resume-door-appendix\"]'); return row? (row.click(),'ok') : 'MISSING'; })()"
sleep 1.5
ab eval "(() => { const chip=document.querySelector('[data-testid=\"appendix-recent-chip-verbs-eat\"]'); return chip? (chip.scrollIntoView({block:'center'}),'chip-found') : 'CHIP-MISSING'; })()"
sleep 0.5
ab eval "(() => { const chip=document.querySelector('[data-testid=\"appendix-recent-chip-verbs-eat\"]'); return chip? (chip.click(),'chip-clicked') : 'CHIP-MISSING'; })()"
sleep 1
ab eval "(() => { const h=document.querySelector('[data-testid=\"appendix-recent-chip-hint\"]'); const pill=document.querySelector('[data-testid=\"appendix-resume-pill\"]'); const r=h?.getBoundingClientRect(); const d=document.documentElement; return JSON.stringify({hint: !!h, role: h?.getAttribute('role'), pe: h?.className.includes('pointer-events-none'), text: h?.textContent.slice(0,50), pillStill: pill?.textContent.slice(0,30), overflowX: d.scrollWidth - d.clientWidth, inViewport: r ? (r.right <= d.clientWidth+1 && r.left >= -1) : null}); })()"
ab screenshot qa-r247-2-chip-hint-light.png >/dev/null 2>&1 && echo "shot-chip saved"
ab eval "(() => { const rec=JSON.parse(localStorage.getItem('vision2-bg-last-item')); return JSON.stringify({recordIntact: rec.title}); })()"

echo "=== [2] بند① — آزمون جامع واقعی ۱۰ سوالی تا نتیجه ==="
ab eval "(() => { const btns=Array.from(document.querySelectorAll('nav button')); const b=btns.find(x=>x.textContent.includes('آزمون جامع')); return b? (b.click(),'nav-exam') : 'NAV-MISSING'; })()"
sleep 2
ab eval "(() => { window.dispatchEvent(new CustomEvent('open-exam-with',{detail:{count:10,timed:false}})); return 'prefilled-10'; })()"
sleep 0.5
ab eval "(() => { const btns=Array.from(document.querySelectorAll('button')); const b=btns.find(x=>x.textContent.includes('شروع آزمون جامع')); return b? (b.click(),'exam-started') : 'START-MISSING'; })()"
sleep 2
ab eval "(async () => { const sleep=(ms)=>new Promise(r=>setTimeout(r,ms)); for(let i=0;i<14;i++){ const opts=document.querySelectorAll('[data-quiz]'); if(!opts.length) break; opts[0].click(); await sleep(140); const nx=document.querySelector('[data-quiz-next]'); if(nx){nx.click(); await sleep(140);} } return 'answer-loop-done'; })()" >/dev/null
for i in $(seq 1 20); do
  R=$(ab eval "(() => ({row: !!document.querySelector('[data-testid=\"results-resume-row\"]'), cert: !!document.querySelector('[data-testid=\"cert-seal\"]'), card: document.body.textContent.includes('نتیجهٔ نهایی') || document.body.textContent.includes('گواهی')}))()" 2>/dev/null)
  echo "$R" | grep -q '"row":true' && break
  sleep 1
done
ab eval "(() => { const row=document.querySelector('[data-testid=\"results-resume-row\"]'); row?.scrollIntoView({block:'center'}); const d=document.documentElement; return JSON.stringify({row: !!row, rowText: row?.textContent.slice(0,45), overflowX: d.scrollWidth - d.clientWidth}); })()"
sleep 0.5
ab screenshot qa-r247-1-exam-result-row-light.png >/dev/null 2>&1 && echo "shot-exam saved"

echo "=== [3] پرشِ ردیف از نتیجهٔ آزمون → ضمیمه ==="
ab eval "(() => { const row=document.querySelector('[data-testid=\"results-resume-row\"]'); return row? (row.click(),'row-clicked') : 'ROW-MISSING'; })()"
sleep 1.5
ab eval "(() => { const pill=document.querySelector('[data-testid=\"appendix-resume-pill\"]'); const rec=JSON.parse(localStorage.getItem('vision2-bg-last-item')); return JSON.stringify({onAppendix: !!pill, recordStill: rec.title}); })()"

echo "=== BATCH-R247-1 DONE ==="
