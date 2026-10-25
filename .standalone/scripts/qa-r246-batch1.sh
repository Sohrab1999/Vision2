#!/bin/bash
# راند ۲۴۶ — QA زندهٔ بندهای ①+② (۱۲۸۰ روشن)
# سرور را داخلِ همین شل زنده نگه می‌دارد (درسِ OOM/reap — سرور بچهٔ شلِ زنده می‌ماند)
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

echo "=== [0] fresh session + seed ==="
ab open "http://127.0.0.1:3000" >/dev/null 2>&1; sleep 3
ab eval "localStorage.clear(); 'cleared'"
ab eval "const rec={scope:'grammar',id:'t-present-simple',title:'حال ساده',hint:'ص ۲۳'}; localStorage.setItem('vision2-bg-last-item',JSON.stringify(rec)); localStorage.setItem('vision2-bg-history',JSON.stringify([{scope:'phonetics',id:'ʌ',title:'/ʌ/',hint:'cup — love'},rec])); 'seeded'"
ab eval "location.reload(); 'reloading'"; sleep 4

echo "=== [1] بند① — درِ ضمیمه از راهنما: پالس + حباب ==="
ab eval "window.dispatchEvent(new CustomEvent('open-shortcuts')); 'guide-open'" >/dev/null
sleep 1
ab eval "(() => { const row=document.querySelector('[data-testid=\"resume-door-appendix\"]'); return row? (row.click(),'clicked') : 'ROW-MISSING'; })()"
sleep 1.5
ab eval "JSON.stringify({view: location.href.slice(-20), pill: !!document.querySelector('[data-testid=\"appendix-resume-pill\"]'), pulsing: document.querySelector('[data-testid=\"appendix-resume-pill\"]')?.getAttribute('data-pulsing'), hint: !!document.querySelector('[data-testid=\"appendix-resume-pill-hint\"]'), hintRole: document.querySelector('[data-testid=\"appendix-resume-pill-hint\"]')?.getAttribute('role'), hintPE: document.querySelector('[data-testid=\"appendix-resume-pill-hint\"]')?.className.includes('pointer-events-none')})"
ab screenshot qa-r246-1-pill-hint-light.png >/dev/null 2>&1 && echo "shot1 saved"

echo "=== [2] انقضای ۳٫۶ثانیه‌ای حباب ==="
sleep 4
ab eval "JSON.stringify({hintAfter3_6s: !!document.querySelector('[data-testid=\"appendix-resume-pill-hint\"]'), pulseAfter4s: document.querySelector('[data-testid=\"appendix-resume-pill\"]')?.getAttribute('data-pulsing')})"

echo "=== [3] رویدادِ زنده + بستنِ با کلیکِ نشانگر ==="
ab eval "window.dispatchEvent(new CustomEvent('pulse-appendix-pill')); 'pulsed'"
sleep 0.6
ab eval "JSON.stringify({hintOnLiveEvent: !!document.querySelector('[data-testid=\"appendix-resume-pill-hint\"]')})"
ab eval "(() => { document.querySelector('[data-testid=\"appendix-resume-pill\"]').click(); return 'pill-clicked'; })()"
sleep 0.6
ab eval "JSON.stringify({hintDismissedByClick: !document.querySelector('[data-testid=\"appendix-resume-pill-hint\"]'), recordIntact: JSON.parse(localStorage.getItem('vision2-bg-last-item')).title})"

echo "=== [4] بند② — درِ «نتایج» از راهنما → تبِ تست‌ها + ردیف ==="
ab eval "window.dispatchEvent(new CustomEvent('open-shortcuts')); 'guide-open-2'" >/dev/null
sleep 1
ab eval "(() => { const row=document.querySelector('[data-testid=\"resume-door-results\"]'); return row? (row.click(),'clicked') : 'ROW-MISSING'; })()"
sleep 1.5
ab eval "JSON.stringify({testsTab: !!Array.from(document.querySelectorAll('h3')).find(h=>h.textContent.includes('تست واژگان — سطح استاندارد')), resumeRow: !!document.querySelector('[data-testid=\"results-resume-row\"]'), rowText: document.querySelector('[data-testid=\"results-resume-row\"]')?.textContent.slice(0,60)})"
ab screenshot qa-r246-2-results-row-light.png >/dev/null 2>&1 && echo "shot2 saved"

echo "=== [5] پرشِ ردیف → ضمیمه (پرش ≠ نوشتن) ==="
ab eval "(() => { const row=document.querySelector('[data-testid=\"results-resume-row\"]'); return row? (row.click(),'row-clicked') : 'ROW-MISSING'; })()"
sleep 1.5
ab eval "JSON.stringify({onAppendix: !!document.querySelector('[data-testid=\"appendix-resume-pill\"]'), recordStill: JSON.parse(localStorage.getItem('vision2-bg-last-item')).title})"

echo "=== [6] فرمان‌یاب: گروهِ «درهای حلقه» = ۵ در (با رکورد) ==="
ab eval "window.dispatchEvent(new CustomEvent('open-command-palette')); 'palette-open'" >/dev/null
sleep 1.2
ab eval "const g=Array.from(document.querySelectorAll('[role=\"group\"]')).find(x=>x.getAttribute('aria-label')==='درهای حلقه'); JSON.stringify({groupFound: !!g, doorOptions: g? g.querySelectorAll('[role=\"option\"]').length : 0, hasResults: g? g.textContent.includes('درِ نتایج') : false, totalOptions: document.querySelectorAll('[role=\"option\"]').length})"
ab screenshot qa-r246-3-palette-doors-light.png >/dev/null 2>&1 && echo "shot3 saved"

echo "=== [7] فرمانِ درِ نتایج در پالت → تبِ تست‌ها ==="
ab eval "(() => { const opts=Array.from(document.querySelectorAll('[role=\"option\"]')); const o=opts.find(x=>x.textContent.includes('درِ نتایج')); return o? (o.click(),'door-results-clicked') : 'OPT-MISSING'; })()"
sleep 1.5
ab eval "JSON.stringify({testsTabAgain: !!Array.from(document.querySelectorAll('h3')).find(h=>h.textContent.includes('تست واژگان — سطح استاندارد')), paletteClosed: !document.querySelector('.command-palette')})"
ab eval "window.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',code:'Escape'})); 'esc'" >/dev/null

echo "=== [8] مینی‌کارتِ پروفایل = ۵ ردیف ==="
ab eval "window.dispatchEvent(new CustomEvent('open-profile')); 'profile-open'" >/dev/null
sleep 1.2
ab eval "JSON.stringify({rows: document.querySelectorAll('[data-testid^=\"profile-resume-door-\"]').length, hasResults: !!document.querySelector('[data-testid=\"profile-resume-door-results\"]')})"
ab eval "window.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',code:'Escape'})); 'esc2'" >/dev/null
sleep 0.5

echo "=== BATCH1 DONE ==="
