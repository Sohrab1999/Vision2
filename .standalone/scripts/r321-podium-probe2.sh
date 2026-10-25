#!/usr/bin/env bash
# r321-probe2 — سنجشِ صبورترِ نمودارِ هفتگی: انتظارِ داده + شمارشِ کامل
set -uo pipefail
BASE="http://127.0.0.1:3000"
agent-browser --session p2 open "$BASE" >/dev/null 2>&1
agent-browser --session p2 set viewport 390 844 >/dev/null 2>&1
agent-browser --session p2 wait 'body' >/dev/null 2>&1 || true
agent-browser --session p2 eval "(()=>{localStorage.setItem('vision2-study-v1', JSON.stringify({state:{userName:'آرش-د', onboarded:true}, version:0}));location.reload();return 'seeded';})()" >/dev/null 2>&1
sleep 6
echo "== آیا نمودار هفتگی در صفحه است؟ =="
agent-browser --session p2 eval "JSON.stringify({chartCols:document.querySelectorAll('.flex.h-full.min-w-0.flex-1.flex-col').length, weeklyPresent:!!document.querySelector('[class*=weekly]'), minw0total:document.querySelectorAll('[class*=\"min-w-0\"][class*=\"flex-1\"]').length})" 2>&1
echo "== کاندیداها با جزئیاتِ سرریز =="
agent-browser --session p2 eval "JSON.stringify((()=>{const els=[...document.querySelectorAll('[class*=\"min-w-0\"][class*=\"flex-1\"]')].filter(el=>{const pcs=el.parentElement?getComputedStyle(el.parentElement):null;if(!pcs||pcs.flexDirection!=='row')return false;if(el.classList.contains('truncate'))return false;return el.scrollWidth>el.clientWidth+1;});return {count:els.length, items:els.map(el=>{const er=el.getBoundingClientRect();const bleeders=[...el.querySelectorAll(':scope > *')].filter(k=>{const cs=getComputedStyle(k);if(cs.display==='none')return false;const kr=k.getBoundingClientRect();return kr.left<er.left-1||kr.right>er.right+1;}).map(k=>{const kr=k.getBoundingClientRect();return {cls:String(k.className).slice(0,40),txt:(k.textContent||'').trim().slice(0,10),leftB:Math.round(er.left-kr.left),rightB:Math.round(kr.right-er.right)};});return {colW:Math.round(er.width),over:el.scrollWidth-el.clientWidth,bleeders};})};})())" 2>&1
echo "== متنِ یک ستونِ نمونه =="
agent-browser --session p2 eval "JSON.stringify((()=>{const c=document.querySelector('.flex.h-full.min-w-0.flex-1.flex-col');if(!c)return 'NO-COL';return {w:Math.round(c.getBoundingClientRect().width),sw:c.scrollWidth,texts:[...c.querySelectorAll('*')].map(k=>({cls:String(k.className).slice(0,30),txt:(k.textContent||'').trim().slice(0,12),kw:Math.round(k.getBoundingClientRect().width),ksw:k.scrollWidth}))};})())" 2>&1
agent-browser --session p2 screenshot /home/z/my-project/qa-evidence/r321-weekly-chart-390.png >/dev/null 2>&1
agent-browser --session p2 close >/dev/null 2>&1
pkill -f "chrome" 2>/dev/null || true
echo "== probe2 done =="
