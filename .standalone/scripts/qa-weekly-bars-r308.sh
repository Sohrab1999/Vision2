#!/usr/bin/env bash
# r308 — QAِ زندهٔ «نوارِ ۱۴روزهٔ هفته + برچسبِ ماه‌نامه روی کارتِ PNG»
# seedِ ۱۴روزه (فعالیت + داستان) → مودالِ هفته‌نامه → دُمِ DOM (pipe mode) →
# کلیکِ هر دو دروازهٔ کارتِ هفته‌نامه + عکسِ رسمی → toastها → اسکرین‌شات.
set -u
BASE="${BASE:-http://127.0.0.1:3000}"

echo "== [1] seed ۱۴روزه =="
agent-browser open "$BASE" --viewport 1280x800 > /dev/null 2>&1
sleep 2
agent-browser eval "(()=>{localStorage.clear(); sessionStorage.clear(); return 'cleared';})()" > /dev/null 2>&1
agent-browser eval "(()=>{const k=(n)=>{const d=new Date(); d.setDate(d.getDate()-n); return d.toISOString().slice(0,10);}; const st=(rev,qz,w,di,ru,s)=>({reviews:rev,quizzes:qz,words:w,dictation:di,rush:ru,stories:s}); const h={}; h[k(0)]=st(2,1,3,0,0,1); h[k(1)]=st(0,0,0,0,0,0); h[k(2)]=st(1,2,1,1,0,2); h[k(3)]=st(3,0,2,0,1,1); h[k(5)]=st(1,1,0,0,0,0); h[k(6)]=st(2,2,2,0,0,1); h[k(8)]=st(1,0,1,0,0,2); h[k(10)]=st(2,1,0,1,0,0); h[k(12)]=st(0,1,1,0,1,1); h[k(16)]=st(1,1,1,0,0,3); h[k(20)]=st(0,0,2,0,0,1); h[k(25)]=st(2,0,0,1,0,2); localStorage.setItem('vision2-study-v1', JSON.stringify({state:{userName:'کیانا ب', avatarColor:'emerald', onboarded:true, dayHistory:h}, version:0})); location.reload(); return 'seeded-14d';})()" 2>/dev/null
sleep 4

echo "== [2] بازکردنِ مودالِ هفته‌نامه =="
agent-browser eval "(()=>{window.dispatchEvent(new Event('open-report')); return 'opened';})()" 2>/dev/null
sleep 3

echo "== [3] دُمِ DOM — نوارِ ۱۴روزه + ماه‌نامه (pipe) =="
# a) نوارِ ۱۴روزهٔ DOM: divِ h-16 با ۱۴ بچه
agent-browser eval "(()=>{const strips=[...document.querySelectorAll('div.h-16')]; const s=strips.find(x=>x.children.length===14); return 'bars14='+(s?s.children.length:0);})()" 2>/dev/null
# b) نوارِ ۳۰خانه‌ای: [data-level] داخلِ گریدِ ۳۰ستونی
agent-browser eval "(()=>{const img=[...document.querySelectorAll('[role=img]')].find(x=>(x.getAttribute('aria-label')||'').startsWith('ماه‌نامهٔ خواندن')); return 'cells30='+(img?img.querySelectorAll('[data-level]').length:0)+'|aria='+(img?'yes':'no');})()" 2>/dev/null
# c) چیپِ داستان + سطرِ ماه‌نامه در DOM
agent-browser eval "(()=>{const t=document.body.innerText; return 'monthLine='+(t.includes('ماهِ گذشته')?'yes':'no')+'|storiesChip='+(t.includes('داستان')?'yes':'no');})()" 2>/dev/null

echo "== [4] کلیکِ عکسِ هفته‌نامه (بومِ ۹۲۰px) =="
agent-browser eval "(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.getAttribute('aria-label')==='گرفتن عکس هفته‌نامهٔ پیشرفت'); if(!b) return 'BTN-MISSING'; b.click(); return 'clicked';})()" 2>/dev/null
sleep 3
agent-browser eval "(()=>{const t=document.body.innerText; return 'toastPNG='+(t.includes('عکسِ هفته‌نامه ذخیره شد')?'yes':'no');})()" 2>/dev/null

echo "== [5] کلیکِ هم‌رسانیِ هفته‌نامه (headless → پیامِ صادقانه) =="
agent-browser eval "(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.getAttribute('aria-label')==='هم‌رسانی عکس هفته‌نامهٔ پیشرفت'); if(!b) return 'BTN-MISSING'; b.click(); return 'clicked';})()" 2>/dev/null
sleep 3
agent-browser eval "(()=>{const t=document.body.innerText; return 'shareFailMsg='+(t.includes('هم‌رسانی ممکن نشد')?'yes':'no')+'|shareOk='+(t.includes('هم‌رسانی شد')?'yes':'no');})()" 2>/dev/null

echo "== [6] کارنامهٔ رسمی: عکس =="
agent-browser eval "(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.getAttribute('aria-label')==='گرفتن عکس کارنامهٔ رسمی'); if(!b) return 'BTN-MISSING'; b.click(); return 'clicked';})()" 2>/dev/null
sleep 3
agent-browser eval "(()=>{const t=document.body.innerText; return 'toastOfficial='+(t.includes('عکسِ کارنامه ذخیره شد')?'yes':'no');})()" 2>/dev/null

echo "== [7] اسکرین‌شات + client-errors =="
agent-browser screenshot /tmp/r308-report-desktop.png > /dev/null 2>&1
agent-browser set viewport 390 844 > /dev/null 2>&1
sleep 2
agent-browser eval "(()=>{const d=document.documentElement; return 'mobile docW='+d.scrollWidth+' winW='+window.innerWidth;})()" 2>/dev/null
agent-browser screenshot /tmp/r308-report-mobile.png > /dev/null 2>&1
agent-browser set viewport 1280 800 > /dev/null 2>&1
wc -l client-errors.log
echo "== done =="
