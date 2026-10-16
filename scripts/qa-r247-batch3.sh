#!/bin/bash
# راند ۲۴۷ — QA بخش سوم: ۳۹۰ تاریک + بازگردانی + کنسولِ نهایی
cd /home/z/my-project
if ! curl -s -o /dev/null --max-time 4 http://127.0.0.1:3000; then
  setsid nohup bun --smol run dev >> dev.log 2>&1 < /dev/null &
  for i in $(seq 1 40); do curl -s -o /dev/null --max-time 4 http://127.0.0.1:3000 && break; sleep 2; done
fi
ab() { agent-browser "$@"; }
curl -s -o /dev/null -w "server:%{http_code}\n" http://127.0.0.1:3000

echo "=== [3] ۳۹۰ تاریک: حبابِ چیپ ==="
ab set viewport 390 844
ab eval "(() => { const rec={scope:'grammar',id:'t-present-simple',title:'حال ساده',hint:'ص ۲۳'}; localStorage.setItem('vision2-bg-last-item',JSON.stringify(rec)); localStorage.setItem('vision2-bg-history',JSON.stringify([{scope:'verbs',id:'eat',title:'eat — ate — eaten',hint:'خوردن'},rec])); localStorage.setItem('theme','dark'); location.reload(); return 'dark-390'; })()"
sleep 4
ab eval "(() => { window.dispatchEvent(new CustomEvent('open-shortcuts')); return 'guide'; })()" >/dev/null; sleep 0.8
ab eval "(() => { const row=document.querySelector('[data-testid=\"resume-door-appendix\"]'); return row? (row.click(),'ok') : 'MISSING'; })()"
sleep 1.5
ab eval "(() => { const chip=document.querySelector('[data-testid=\"appendix-recent-chip-verbs-eat\"]'); return chip? (chip.scrollIntoView({block:'center'}), chip.click(), 'clicked') : 'MISSING'; })()"
sleep 1
ab eval "(() => { const d=document.documentElement; const h=document.querySelector('[data-testid=\"appendix-recent-chip-hint\"]'); const r=h?.getBoundingClientRect(); return JSON.stringify({hint: !!h, overflowX: d.scrollWidth - d.clientWidth, inViewport: r ? (r.right <= d.clientWidth+1 && r.left >= -1) : null}); })()"
ab screenshot qa-r247-3-chip-hint-390-dark.png >/dev/null 2>&1 && echo "shot-390 saved"

echo "=== [4] بازگردانی کامل ==="
ab eval "(() => { localStorage.removeItem('vision2-bg-last-item'); localStorage.removeItem('vision2-bg-history'); localStorage.removeItem('theme'); const s=JSON.parse(localStorage.getItem('vision2-study-v1')||'{}'); if(s.state){ s.state.results={}; s.state.mistakes={}; localStorage.setItem('vision2-study-v1',JSON.stringify(s)); } location.reload(); return 'restored'; })()"
ab set viewport 1280 900
sleep 4

echo "=== [5] کنسولِ نهایی — reloadِ تازه ==="
ab console clear >/dev/null 2>&1
ab eval "(() => { location.reload(); return 'final'; })()" >/dev/null
sleep 5
ab console 2>/dev/null | grep -cE "\[error\]|\[warn\]" || echo 0
echo "=== BATCH-R247-3 DONE ==="
