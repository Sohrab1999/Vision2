#!/usr/bin/env bash
# r321-probe — تشریحِ ۴ کاندیدایِ سکویِ قهرمانی در زبانهٔ دوئلیِ جدول:
#   چه چیزی دقیقا بیرون میزند؟ (بجِ «شما» / مدال / متنِ نام؟)
#   و آیا افتِ محتوایی هست؟ (نامها truncate دارند — طراحی)
set -uo pipefail
BASE="http://127.0.0.1:3000"
agent-browser --session p1 open "$BASE" >/dev/null 2>&1
agent-browser --session p1 set viewport 390 844 >/dev/null 2>&1
agent-browser --session p1 wait 'body' >/dev/null 2>&1 || true
agent-browser --session p1 eval "(()=>{localStorage.setItem('vision2-study-v1', JSON.stringify({state:{userName:'آرش-د', onboarded:true}, version:0}));location.reload();return 'seeded';})()" >/dev/null 2>&1
sleep 4
echo "== زبانهٔ نبردها =="
agent-browser --session p1 eval "(()=>{const tabs=[...document.querySelectorAll('[aria-label=\"انتخاب نوع جدول\"] button')];const t=tabs.find(x=>x.textContent?.includes('نبرد'));if(t){t.click();return 'duel-tab';}return 'NO-TAB: '+tabs.map(x=>x.textContent?.trim()).join('|');})()" 2>&1
sleep 1.6
echo "== تشریحِ کاندیداها =="
agent-browser --session p1 eval "JSON.stringify((()=>{const els=[...document.querySelectorAll('[class*=\"min-w-0\"][class*=\"flex-1\"]')].filter(el=>{const pcs=el.parentElement?getComputedStyle(el.parentElement):null;if(!pcs||pcs.flexDirection!=='row')return false;if(el.classList.contains('truncate'))return false;return el.scrollWidth>el.clientWidth+1;});return els.map(el=>{const er=el.getBoundingClientRect();const bleeders=[...el.querySelectorAll('*')].filter(k=>{const cs=getComputedStyle(k);if(cs.display==='none')return false;const kr=k.getBoundingClientRect();return kr.left<er.left-1||kr.right>er.right+1;}).map(k=>{const kr=k.getBoundingClientRect();return {tag:k.tagName,cls:String(k.className).slice(0,52),pos:getComputedStyle(k).position,txt:(k.textContent||'').trim().slice(0,14),leftBleed:Math.round(er.left-kr.left),rightBleed:Math.round(kr.right-er.right)};});return {colW:Math.round(er.width),over:el.scrollWidth-el.clientWidth,bleeders, selfText:(el.textContent||'').trim().slice(0,40)};});})())" 2>&1
echo "== کلاسِ ظرفِ پدر (برای داوریِ گپ) =="
agent-browser --session p1 eval "JSON.stringify([...document.querySelectorAll('[class*=\"min-w-0\"][class*=\"flex-1\"]')].filter(el=>{const pcs=el.parentElement?getComputedStyle(el.parentElement):null;return pcs&&pcs.flexDirection==='row'&&!el.classList.contains('truncate')&&el.scrollWidth>el.clientWidth+1;}).slice(0,1).map(el=>({parentCls:String(el.parentElement.className).slice(0,80),gap:getComputedStyle(el.parentElement).gap})))" 2>&1
agent-browser --session p1 screenshot /home/z/my-project/qa-evidence/r321-podium-390.png >/dev/null 2>&1
agent-browser --session p1 close >/dev/null 2>&1
pkill -f "chrome" 2>/dev/null || true
echo "== probe done =="
