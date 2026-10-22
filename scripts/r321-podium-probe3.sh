#!/usr/bin/env bash
# r321-probe3 — تشریحِ نهاییِ سرریزِ ستونهایِ نمودارِ هفتگی (یادگیرندهٔ دارایِ پیشرفت)
set -uo pipefail
BASE="http://127.0.0.1:3000"
agent-browser --session p3 open "$BASE" >/dev/null 2>&1
agent-browser --session p3 set viewport 390 844 >/dev/null 2>&1
agent-browser --session p3 wait 'body' >/dev/null 2>&1 || true
agent-browser --session p3 eval "(()=>{localStorage.setItem('vision2-study-v1', JSON.stringify({state:{userName:'آرش-ح', onboarded:true, known:{"book":true}}, version:0}));location.reload();return 'seeded';})()" >/dev/null 2>&1
sleep 8
echo "== نمودار حاضر؟ =="
agent-browser --session p3 eval "JSON.stringify({chartCols:document.querySelectorAll('.flex.h-full.min-w-0.flex-1.flex-col').length, hasProgressHint:document.body.textContent.includes('تحلیل مهارتها')||document.body.textContent.includes('تحلیل مهارت‌ها')})" 2>&1
echo "== کاندیداها: چه چیزی بیرون میزند؟ =="
agent-browser --session p3 eval "JSON.stringify((()=>{const els=[...document.querySelectorAll('[class*=\"min-w-0\"][class*=\"flex-1\"]')].filter(el=>{const pcs=el.parentElement?getComputedStyle(el.parentElement):null;if(!pcs||pcs.flexDirection!=='row')return false;if(el.classList.contains('truncate'))return false;return el.scrollWidth>el.clientWidth+1;});return {count:els.length, items:els.map(el=>{const er=el.getBoundingClientRect();const bleeders=[...el.querySelectorAll(':scope > *')].filter(k=>{const cs=getComputedStyle(k);if(cs.display==='none')return false;const kr=k.getBoundingClientRect();return kr.left<er.left-1||kr.right>er.right+1;}).map(k=>{const kr=k.getBoundingClientRect();return {cls:String(k.className).slice(0,44),txt:(k.textContent||'').trim().slice(0,12),leftB:Math.round(er.left-kr.left),rightB:Math.round(kr.right-er.right)};});return {colW:Math.round(er.width),over:el.scrollWidth-el.clientWidth,bleeders};})};})())" 2>&1
echo "== عرضِ ستونها و پیلهایِ هفتروزه =="
agent-browser --session p3 eval "JSON.stringify([...document.querySelectorAll('.flex.h-full.min-w-0.flex-1.flex-col')].map(c=>({w:Math.round(c.getBoundingClientRect().width),sw:c.scrollWidth,pill:[...c.querySelectorAll(':scope > div')].pop()?.textContent?.trim()})))" 2>&1
agent-browser --session p3 screenshot /home/z/my-project/qa-evidence/r321-weekly-chart-390-after.png >/dev/null 2>&1
agent-browser --session p3 close >/dev/null 2>&1
pkill -f "chrome" 2>/dev/null || true
echo "== probe3 done =="
