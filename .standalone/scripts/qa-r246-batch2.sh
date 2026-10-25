#!/bin/bash
# راند ۲۴۶ — QA زندهٔ بخشِ دوم: ۳۹۰px تاریک + بازگردانی + کنسولِ نهایی
cd /home/z/my-project

ensure_server() {
  if ! curl -s -o /dev/null --max-time 4 http://127.0.0.1:3000; then
    setsid nohup bun --smol run dev >> dev.log 2>&1 < /dev/null &
    for i in $(seq 1 40); do
      curl -s -o /dev/null --max-time 4 http://127.0.0.1:3000 && break
      sleep 2
    done
  fi
  curl -s -o /dev/null -w "server:%{http_code}\n" http://127.0.0.1:3000
}
ensure_server

ab() { agent-browser "$@"; }

echo "=== [9] seed + تمِ تاریک + ۳۹۰px ==="
ab set viewport 390 844
ab eval "(() => { localStorage.setItem('theme','dark'); const rec={scope:'grammar',id:'t-present-simple',title:'حال ساده',hint:'ص ۲۳'}; localStorage.setItem('vision2-bg-last-item',JSON.stringify(rec)); localStorage.setItem('vision2-bg-history',JSON.stringify([{scope:'phonetics',id:'ʌ',title:'/ʌ/',hint:'cup — love'},rec])); location.reload(); return 'dark-390-seeded'; })()"
sleep 4

echo "=== [10] تبِ تست‌ها در ۳۹۰ تاریک: ردیف + سرریزِ صفر ==="
ab eval "window.dispatchEvent(new CustomEvent('open-shortcuts')); 'guide'" >/dev/null; sleep 0.8
ab eval "(() => { const row=document.querySelector('[data-testid=\"resume-door-results\"]'); return row? (row.click(),'ok') : 'MISSING'; })()"; sleep 1.5
ab eval "(() => { const d=document.documentElement; const row=document.querySelector('[data-testid=\"results-resume-row\"]'); return JSON.stringify({resumeRow: !!row, overflowX: d.scrollWidth - d.clientWidth, bodyOverflow: document.body.scrollWidth - document.body.clientWidth}); })()"
ab screenshot qa-r246-4-results-row-390-dark.png >/dev/null 2>&1 && echo "shot4 saved"

echo "=== [11] نشانگر + حباب در ۳۹۰ تاریک ==="
ab eval "(() => { const row=document.querySelector('[data-testid=\"resume-door-appendix\"]'); return row? (row.click(),'ok') : 'MISSING'; })()"; sleep 1.5
ab eval "(() => { const d=document.documentElement; const pill=document.querySelector('[data-testid=\"appendix-resume-pill\"]'); const hint=document.querySelector('[data-testid=\"appendix-resume-pill-hint\"]'); const r=hint?.getBoundingClientRect(); return JSON.stringify({pill: !!pill, pulsing: pill?.getAttribute('data-pulsing'), hint: !!hint, overflowX: d.scrollWidth - d.clientWidth, hintInViewport: r ? (r.right <= d.clientWidth + 1 && r.left >= -1) : null}); })()"
ab screenshot qa-r246-5-pill-hint-390-dark.png >/dev/null 2>&1 && echo "shot5 saved"

echo "=== [12] بازگردانی: تمِ روشن + ۱۲۸۰ + پاک‌سازیِ seedها ==="
ab eval "(() => { localStorage.removeItem('vision2-bg-last-item'); localStorage.removeItem('vision2-bg-history'); localStorage.setItem('theme','light'); location.reload(); return 'restored'; })()"
ab set viewport 1280 900
sleep 4

echo "=== [13] کنسولِ نهایی رویِ reloadِ تازه ==="
ab console clear >/dev/null 2>&1
ab eval "location.reload(); 'final-reload'" >/dev/null
sleep 4
ab errors 2>&1 | head -4
echo "err/warn count:"
ab console 2>/dev/null | grep -cE "\[error\]|\[warn\]" || true
echo "=== BATCH2 DONE ==="
