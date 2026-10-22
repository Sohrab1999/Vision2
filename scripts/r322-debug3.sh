#!/usr/bin/env bash
# r322-debug3 — چشمِ پسااصلاح: پنلهایِ hasProgress در حالتِ پُر (اسکرولِ خانه) +
#   داوریِ v_candها: پیلهایِ r321 (over=2) · اعدادِ leading-none (over=2) ·
#   نقطهٔ ping (over=3) · ردیفِ رسانهٔ فلشکارت (over=6)
set -uo pipefail
BASE="http://127.0.0.1:3000"
DIR=/home/z/my-project/scripts
EV=/home/z/my-project/qa-evidence
PERSONA=$(node "$DIR/r322-persona.js" champion)

agent-browser open "$BASE" >/dev/null 2>&1
agent-browser set viewport 390 844 >/dev/null 2>&1
agent-browser wait 'body' >/dev/null 2>&1 || true
sleep 1.5
agent-browser eval "(()=>{localStorage.setItem('vision2-study-v1', JSON.stringify(${PERSONA})); location.reload(); return 'seeded';})()" >/dev/null 2>&1
sleep 4.5

# اسکرول به نمودار هفتگی + عکس
agent-browser eval "(()=>{document.querySelector('[aria-label=\"فعالیت هفتگی\"]')?.scrollIntoView({block:'start'});return 'scrolled';})()" >/dev/null 2>&1
sleep 1.2
agent-browser screenshot "$EV/r322-weekly-390.png" >/dev/null 2>&1

# اسکرول به SRS + مهارت + خطرناک
agent-browser eval "(()=>{document.querySelector('[aria-label=\"داشبورد مرور هوشمند\"]')?.scrollIntoView({block:'start'});return 'scrolled';})()" >/dev/null 2>&1
sleep 1.2
agent-browser screenshot "$EV/r322-srs-390.png" >/dev/null 2>&1

# پنل خطرناکها (پسااصلاحِ wrap)
agent-browser eval "(()=>{const t=document.querySelector('[aria-label=\"واژه‌های خطرناک من\"]');t?.scrollIntoView({block:'center'});return 'scrolled';})()" >/dev/null 2>&1
sleep 1.2
agent-browser screenshot "$EV/r322-danger-390.png" >/dev/null 2>&1

# دسکتاپ — chipِ SRS پسااصلاح (مستحکم در lg)
agent-browser set viewport 1280 900 >/dev/null 2>&1
sleep 1.5
agent-browser eval "(()=>{document.querySelector('[aria-label=\"داشبورد مرور هوشمند\"]')?.scrollIntoView({block:'center'});return 'scrolled';})()" >/dev/null 2>&1
sleep 1.2
agent-browser screenshot "$EV/r322-srs-1280.png" >/dev/null 2>&1

agent-browser close >/dev/null 2>&1
pkill -f "chrome" 2>/dev/null || true
echo "== done =="
