#!/usr/bin/env bash
# r343-diag — آیشابِ دقیقِ بخشِ B درایور برای یافتنِ گامِ کُشندهٔ توست.
set -uo pipefail
BASE="http://127.0.0.1:3000"
MODE="${1:-full}"   # full | noshot | noviewport
echo "== MODE=$MODE"
pkill -f "agent-browser/browsers" 2>/dev/null; sleep 1
agent-browser open "$BASE" >/dev/null 2>&1
[ "$MODE" != "noviewport" ] && { agent-browser set viewport 1280 900 >/dev/null 2>&1; agent-browser wait 'body' >/dev/null 2>&1 || true; }
sleep 2
for i in $(seq 1 30); do
  R=$(agent-browser eval "(()=>{const g=document.querySelector('[aria-label=\"ابزارهای یادگیری\"]');return g?'HOME-OK':'WAIT';})()" 2>/dev/null | tr -d '"')
  [ "$R" = "HOME-OK" ] && { echo "home@$i"; break; }; sleep 3
done
agent-browser eval "$(cat /tmp/r343-seed-eval.js)" >/dev/null 2>&1
sleep 5
agent-browser eval "(()=>{document.documentElement.classList.remove('dark');return 1;})()" >/dev/null 2>&1
sleep 1
agent-browser eval "(()=>{window.dispatchEvent(new Event('open-report'));return 1;})()" >/dev/null 2>&1
sleep 4
[ "$MODE" = "full" ] && agent-browser screenshot /home/z/my-project/qa-evidence/r343-diag.png >/dev/null 2>&1
agent-browser eval "(()=>{if(!window.__origCOU)window.__origCOU=URL.createObjectURL.bind(URL);window.__n=0;URL.createObjectURL=function(){window.__n++;throw new TypeError('x');};return 'stub';})()" >/dev/null
agent-browser eval "(()=>{const b=document.querySelector('[aria-label=\"دانلود جدول CSV پیشرفت\"]');if(!b)return 'NO-BTN';b.click();return 'clicked';})()"
for i in $(seq 1 10); do
  sleep 0.5
  agent-browser eval "(()=>{const ol=document.querySelector('ol');const lis=ol?[...ol.querySelectorAll('li')]:[];return JSON.stringify({i:$i,ol:!!ol,lis:lis.length,n:window.__n});})()"
done
echo "== stub fired: $(agent-browser eval "(()=>window.__n)()" 2>/dev/null)"
