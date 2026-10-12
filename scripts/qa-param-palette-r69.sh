#!/usr/bin/env bash
# Task 69 — QA تک‌سشن فرمان‌های پارامتری + میان‌برهای زیرپنل
set -u
AB="bunx agent-browser"
PASS=0; FAIL=0
ok(){ echo "PASS: $1"; PASS=$((PASS+1)); }
bad(){ echo "FAIL: $1"; FAIL=$((FAIL+1)); }

# session isolation: fresh console, then seed onboarding
$AB close --all >/dev/null 2>&1; sleep 1
$AB open http://127.0.0.1:3000 >/dev/null 2>&1; sleep 2
$AB eval "(()=>{localStorage.clear(); sessionStorage.clear(); localStorage.setItem('vision2-study-v1', JSON.stringify({state:{onboarded:true},version:0})); localStorage.removeItem('vision2-cmd-recent'); return 'seeded'})()" >/dev/null 2>&1
$AB close --all >/dev/null 2>&1; sleep 1
$AB open http://127.0.0.1:3000 >/dev/null 2>&1; sleep 3

# helper: open palette, type query via native setter, press Enter
pq(){ $AB press Control+k >/dev/null 2>&1; sleep 0.8; \
  $AB eval "(()=>{const inp=document.querySelector('.command-palette input');if(!inp)return 'no-input';const st=Object.getPrototypeOf(inp);const set=Object.getOwnPropertyDescriptor(st,'value').set;set.call(inp,'$1');inp.dispatchEvent(new Event('input',{bubbles:true}));return 'typed'})()" >/dev/null 2>&1; sleep 0.8; }

echo "=== 1) «آزمون ۲۰» → prefill exam ==="
pq "آزمون ۲۰"
R=$($AB eval "(()=>{const opts=[...document.querySelectorAll('[role=option]')].map(o=>o.textContent||'');const ex=opts.filter(t=>t.includes('سؤالی'));return JSON.stringify({n:opts.length,exam:ex.length?ex[0].slice(0,40):null})})()" 2>&1)
echo "  options: $R"
echo "$R" | grep -q 'سؤالی' && ok "فرمان پارامتری آزمون در لیست" || bad "فرمان پارامتری آزمون غایب"
$AB press Enter >/dev/null 2>&1; sleep 3
R=$($AB eval "(()=>{const chips=[...document.querySelectorAll('button')].filter(b=>(b.textContent||'').includes('تست'));const act=chips.find(b=>(b.className||'').includes('border-emerald-500'));const h2=[...document.querySelectorAll('h1,h2')].map(h=>h.textContent).join('|');return JSON.stringify({active:act?act.textContent.trim():null,examPage:h2.includes('آزمون')})})()" 2>&1)
echo "  exam: $R"
echo "$R" | grep -q '"active":"۲۰ تست"' && ok "پیش‌انتخاب ۲۰ (prefill مسیر cold-mount)" || bad "پیش‌انتخاب ۲۰ شکست: $R"

echo "=== 2) روی نمای باز: «آزمون ۳۰» مسیر رویداد ==="
pq "آزمون ۳۰"
$AB press Enter >/dev/null 2>&1; sleep 1.5
R=$($AB eval "(()=>{const chips=[...document.querySelectorAll('button')].filter(b=>(b.textContent||'').includes('تست'));const act=chips.find(b=>(b.className||'').includes('border-emerald-500'));return JSON.stringify({active:act?act.textContent.trim():null})})()" 2>&1)
echo "$R" | grep -q '"active":"۳۰ تست"' && ok "رویداد open-exam-with روی نمای باز" || bad "مسیر رویداد شکست: $R"

echo "=== 3) «کنکور ۲۰» → شبیه‌ساز ==="
pq "کنکور ۲۰"
$AB press Enter >/dev/null 2>&1; sleep 3
R=$($AB eval "(()=>{const chips=[...document.querySelectorAll('button')].filter(b=>(b.textContent||'').includes('تست'));const act=chips.find(b=>(b.className||'').includes('border-amber-500'));const body=document.body.innerText;return JSON.stringify({active:act?act.textContent.trim():null,konkur:body.includes('شبیه‌ساز کنکور')||body.includes('شبیهساز')})})()" 2>&1)
echo "  konkur: $R"
echo "$R" | grep -q '"active":"۲۰ تست"' && ok "شبیه‌ساز ۲۰ پیش‌انتخاب" || bad "شبیه‌ساز شکست: $R"

echo "=== 4) «هدف روزانه ۱۵» → فوری بدون جابه‌جایی ==="
pq "هدف روزانه ۱۵"
$AB press Enter >/dev/null 2>&1; sleep 1
R=$($AB eval "(()=>{const raw=localStorage.getItem('vision2-study-v1');const g=raw?JSON.parse(raw).state.dailyGoal:null;const body=document.body.innerText;return JSON.stringify({goal:g,stillKonkur:body.includes('کنکور')})})()" 2>&1)
echo "  goal: $R"
echo "$R" | grep -q '"goal":15' && ok "هدف ۱۵ فوری در store" || bad "هدف شکست: $R"

echo "=== 5) «تنظیمات» → زیرپنل ==="
pq "تنظیمات"
$AB press Enter >/dev/null 2>&1; sleep 1
R=$($AB eval "(()=>{const trig=document.querySelector('button[aria-label=تنظیمات]');const open=trig&&trig.getAttribute('aria-expanded')==='true';const hdr=document.body.innerText.includes('تنظیمات وب‌کتاب');return JSON.stringify({open,hdr})})()" 2>&1)
echo "  settings: $R"
echo "$R" | grep -q '"open":true' && ok "زیرپنل تنظیمات باز شد" || bad "تنظیمات شکست: $R"
$AB press Escape >/dev/null 2>&1; sleep 0.6

echo "=== 6) «پروفایل» → زیرپنل ==="
pq "پروفایل"
$AB press Enter >/dev/null 2>&1; sleep 1
R=$($AB eval "(()=>{const dlg=[...document.querySelectorAll('[data-state=open]')].some(d=>(d.textContent||'').includes('پشتیبان'));return JSON.stringify({profileOpen:dlg})})()" 2>&1)
echo "$R" | grep -q '"profileOpen":true' && ok "زیرپنل پروفایل باز شد" || bad "پروفایل شکست: $R"
$AB press Escape >/dev/null 2>&1; sleep 0.6

echo "=== 7) «اخیر» فرمان پارامتری را زنده می‌کند ==="
$AB press Control+k >/dev/null 2>&1; sleep 1
R=$($AB eval "(()=>{const groups=[...document.querySelectorAll('[role=group]')].map(g=>g.getAttribute('aria-label'));const first=groups[0];const opts=[...document.querySelectorAll('[role=option]')].map(o=>(o.textContent||'').slice(0,30));return JSON.stringify({first,opts:opts.slice(0,6)})})()" 2>&1)
echo "  recents: $R"
echo "$R" | grep -q '"first":"اخیر"' && ok "گروه اخیر اول" || bad "اخیر اول نیست: $R"
echo "$R" | grep -q 'سؤالی' && ok "فرمان پارامتری از شناسه زنده شد" || bad "احیای پارامتری شکست: $R"
$AB press Escape >/dev/null 2>&1; sleep 0.5

echo "=== 8) دارک: پنل + قاعدهٔ گرم ==="
$AB eval "(()=>{const btn=[...document.querySelectorAll('button')].find(b=>b.getAttribute('aria-label')==='حالت شب');if(btn){btn.click();return 'to-dark'}return 'no-btn'})()" >/dev/null 2>&1; sleep 1
$AB press Control+k >/dev/null 2>&1; sleep 1
R=$($AB eval "(()=>{const p=document.querySelector('.command-palette');if(!p)return 'no-palette';const cs=getComputedStyle(p);return JSON.stringify({bg:cs.backgroundColor,border:cs.borderColor})})()" 2>&1)
echo "  dark: $R"
echo "$R" | grep -q 'rgb(28, 25, 23)' && ok "دارک پنل #1c1917" || bad "دارک پنل: $R"
$AB press Escape >/dev/null 2>&1; sleep 0.5
$AB eval "(()=>{const btn=[...document.querySelectorAll('button')].find(b=>b.getAttribute('aria-label')==='حالت روشن');if(btn){btn.click();return 'to-light'}return 'no-btn'})()" >/dev/null 2>&1; sleep 0.8

echo "=== 9) موبایل ۳۹۰ سرریز ==="
$AB set viewport 390 844 >/dev/null 2>&1; sleep 1
R=$($AB eval "(()=>{const d=document.documentElement;return JSON.stringify({sw:d.scrollWidth,overflow:d.scrollWidth>d.clientWidth+1})})()" 2>&1)
echo "$R" | grep -q '"overflow":false' && ok "موبایل ۳۹۰ بدون سرریز" || bad "سرریز موبایل: $R"
$AB set viewport 1280 800 >/dev/null 2>&1; sleep 0.8

echo "=== 10) کنسول تازه ==="
R=$($AB console --level error 2>&1 | grep -c '\[error\]' || true)
if [ "$R" = "0" ]; then ok "کنسول صفر خطا"; else bad "کنسول: $R خطا"; $AB console --level error 2>&1 | head -8; fi

echo "=============================="
echo "PASS=$PASS FAIL=$FAIL"
