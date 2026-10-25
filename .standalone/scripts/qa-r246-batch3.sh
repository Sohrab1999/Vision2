#!/bin/bash
cd /home/z/my-project
if ! curl -s -o /dev/null --max-time 4 http://127.0.0.1:3000; then
  setsid nohup bun --smol run dev >> dev.log 2>&1 < /dev/null &
  for i in $(seq 1 40); do curl -s -o /dev/null --max-time 4 http://127.0.0.1:3000 && break; sleep 2; done
fi
curl -s -o /dev/null -w "server:%{http_code}\n" http://127.0.0.1:3000
ab() { agent-browser "$@"; }
echo "=== [11b] حباب در ۳۹۰ تاریک — با بازکردنِ درستِ راهنما ==="
ab set viewport 390 844
ab eval "(() => { localStorage.setItem('theme','dark'); const rec={scope:'grammar',id:'t-present-simple',title:'حال ساده',hint:'ص ۲۳'}; localStorage.setItem('vision2-bg-last-item',JSON.stringify(rec)); localStorage.setItem('vision2-bg-history',JSON.stringify([{scope:'phonetics',id:'ʌ',title:'/ʌ/',hint:'cup — love'},rec])); location.href='http://127.0.0.1:3000/'; return 'seeded'; })()"
sleep 5
ab eval "(() => { window.dispatchEvent(new CustomEvent('open-shortcuts')); return 'guide-open'; })()" >/dev/null
sleep 0.8
ab eval "(() => { const row=document.querySelector('[data-testid=\"resume-door-appendix\"]'); return row? (row.click(),'ok') : 'MISSING'; })()"
sleep 1.5
ab eval "(() => { const d=document.documentElement; const pill=document.querySelector('[data-testid=\"appendix-resume-pill\"]'); const hint=document.querySelector('[data-testid=\"appendix-resume-pill-hint\"]'); const r=hint?.getBoundingClientRect(); return JSON.stringify({pill: !!pill, pulsing: pill?.getAttribute('data-pulsing'), hint: !!hint, hintRole: hint?.getAttribute('role'), overflowX: d.scrollWidth - d.clientWidth, hintInViewport: r ? (r.right <= d.clientWidth + 1 && r.left >= -1) : null}); })()"
ab screenshot qa-r246-5-pill-hint-390-dark.png >/dev/null 2>&1 && echo "shot5 saved"
echo "=== [12b] بازگردانی کامل ==="
ab eval "(() => { localStorage.removeItem('vision2-bg-last-item'); localStorage.removeItem('vision2-bg-history'); localStorage.removeItem('theme'); location.reload(); return 'restored-clean'; })()"
ab set viewport 1280 900
sleep 4
echo "=== [13b] کنسولِ نهایی — daemon تازه + reloadِ تازه ==="
ab console clear >/dev/null 2>&1
ab eval "(() => { location.reload(); return 'final'; })()" >/dev/null
sleep 5
ab console 2>/dev/null | grep -cE "\[error\]|\[warn\]" || echo 0
echo "=== BATCH3 DONE ==="
