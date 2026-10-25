#!/usr/bin/env bash
# r319-debug — ردیابیِ پرحرفوحوحو: L10 → زبانهٔ جزوه → جزوه
set -uo pipefail
BASE="http://127.0.0.1:3000"
JSF=/home/z/my-project/scripts/r319-basis-zero-audit.js

agent-browser open "$BASE" >/dev/null 2>&1
agent-browser set viewport 390 844 >/dev/null 2>&1
agent-browser wait 'body' >/dev/null 2>&1 || true
sleep 1.5
agent-browser eval "(()=>{localStorage.setItem('vision2-study-v1', JSON.stringify({state:{userName:'آرش-ی', onboarded:true}, version:0}));location.reload();return 'seeded';})()" >/dev/null 2>&1
sleep 4

echo "== spines visible =="
agent-browser eval "JSON.stringify([...document.querySelectorAll('.book-spine .en-text')].map(x=>x.textContent?.trim()).slice(0,14))" 2>&1

echo "== open L10 =="
agent-browser eval "(()=>{const s=[...document.querySelectorAll('.book-spine .en-text')].find(x=>x.textContent?.trim()==='L10');if(!s)return 'NO-SPINE';s.closest('button').click();return 'opened';})()" 2>&1
sleep 2.6

echo "== navs and their labels =="
agent-browser eval "JSON.stringify([...document.querySelectorAll('nav')].map(n=>({label:n.getAttribute('aria-label'), btns:[...n.querySelectorAll('button')].map(b=>b.textContent?.trim()).slice(0,12)})))" 2>&1

echo "== click جزوه =="
agent-browser eval "(()=>{const nav=[...document.querySelectorAll('nav')].find(n=>(n.getAttribute('aria-label')||'').includes('درس'));if(!nav)return 'NO-NAV';const b=[...nav.querySelectorAll('button')].find(x=>x.textContent?.trim()==='جزوه');if(!b)return 'NO-TAB';b.click();return 'clicked';})()" 2>&1
sleep 2.6

echo "== after: min-w-0 count + headings =="
agent-browser eval "JSON.stringify({minw0:document.querySelectorAll('[class*=\"min-w-0\"][class*=\"flex-1\"]').length, h: [...document.querySelectorAll('h1,h2,h3')].map(x=>x.textContent?.trim()).slice(0,8)})" 2>&1
agent-browser eval "$(cat $JSF)" 2>&1

agent-browser close >/dev/null 2>&1
pkill -f "chrome" 2>/dev/null || true
echo "== debug done =="
