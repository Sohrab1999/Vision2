#!/usr/bin/env bash
# r311 — QAِ تک‌فراخوانی: هر دو کارتِ PNG (هفته‌نامه با سطرِ «این هفته» +
# کارنامهٔ رسمی با نوارِ ۱۴روزه زیرِ KPIها) رندر و اسکرین‌شات میشوند و در
# پایان کروم کشته میشود. (سرورِ بینِ فراخوانها تضمینی نیست — یک نفس.)
set -u
cd /home/z/my-project

echo "== [1] server up (فقط اگر سرد است — دومی نساز) =="
code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 4 http://127.0.0.1:3000 2>/dev/null)
if [ "$code" != "200" ]; then
  nohup bun run dev > /tmp/next-dev-r311.log 2>&1 &
  for i in $(seq 1 30); do
    code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 4 http://127.0.0.1:3000 2>/dev/null)
    [ "$code" = "200" ] && break
    sleep 2
  done
fi
echo "server=$code"

echo "== [2] open + seed (پخشِ ۱۴روزه برایِ نوار) =="
agent-browser open http://127.0.0.1:3000 --viewport 1280x800 > /dev/null 2>&1
sleep 4
agent-browser eval "(()=>{const k=(n)=>{const d=new Date(); d.setDate(d.getDate()-n); return d.toISOString().slice(0,10);}; const st=(rev,qz,w,di,ru,s)=>({reviews:rev,quizzes:qz,words:w,dictation:di,rush:ru,stories:s}); const h={}; h[k(0)]=st(2,1,3,0,0,1); h[k(2)]=st(1,2,1,1,0,2); h[k(3)]=st(3,0,2,0,1,1); h[k(6)]=st(2,2,2,0,0,1); h[k(8)]=st(1,0,1,0,0,2); h[k(10)]=st(2,1,0,1,0,0); h[k(16)]=st(1,1,1,0,0,3); h[k(20)]=st(0,0,2,0,0,1); h[k(25)]=st(2,0,0,1,0,2); const hist={}; for(const [d,v] of Object.entries(h)){hist[d]={reviews:v.reviews,quizzes:v.quizzes};} localStorage.setItem('vision2-study-v1', JSON.stringify({state:{userName:'کیانا ب', avatarColor:'emerald', onboarded:true, dayHistory:h, history:hist}, version:0})); location.reload(); return 'reseeded';})()" 2>/dev/null
sleep 4

echo "== [3] hook canvas =="
agent-browser eval "(()=>{window.__canvases=[]; const orig=document.createElement.bind(document); document.createElement=function(tag){const el=orig(tag); if(tag==='canvas'){window.__canvases.push(el);} return el;}; return 'hooked';})()" 2>/dev/null

echo "== [4] weekly card: open modal + click PNG + show =="
agent-browser eval "(()=>{window.dispatchEvent(new Event('open-report')); return 'opened';})()" 2>/dev/null
sleep 3
agent-browser eval "(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.getAttribute('aria-label')==='گرفتن عکس هفته‌نامهٔ پیشرفت'); if(!b) return 'BTN-MISSING'; b.click(); return 'clicked';})()" 2>/dev/null
sleep 4
agent-browser eval "(()=>{const cs=(window.__canvases||[]).filter(c=>c.width===1080&&c.height===920); if(!cs.length) return 'NO-CARD'; const c=cs[cs.length-1]; let img=document.getElementById('r311-card-view'); if(!img){img=document.createElement('img'); img.id='r311-card-view'; img.style.cssText='position:fixed;top:0;left:0;z-index:99999;width:900px;background:#fff;box-shadow:0 0 30px #000'; document.body.appendChild(img);} img.src=c.toDataURL('image/png'); return 'WEEKLY-SHOWN n='+cs.length;})()" 2>/dev/null
sleep 2
agent-browser set viewport 1000 1500 > /dev/null 2>&1
sleep 1
agent-browser screenshot /tmp/r311-weekly-card.png > /dev/null 2>&1
echo "weekly screenshot saved"

echo "== [5] official card: open modal + click PNG + show =="
agent-browser eval "(()=>{window.dispatchEvent(new Event('open-official-report')); return 'opened';})()" 2>/dev/null
sleep 3
agent-browser eval "(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.getAttribute('aria-label')==='گرفتن عکس کارنامهٔ رسمی'); if(!b) return 'BTN-MISSING'; b.click(); return 'clicked';})()" 2>/dev/null
sleep 4
agent-browser eval "(()=>{const cs=(window.__canvases||[]).filter(c=>c.width===1080&&c.height===854); if(!cs.length) return 'NO-CARD-832'; const c=cs[cs.length-1]; let img=document.getElementById('r311-card-view'); if(!img){img=document.createElement('img'); img.id='r311-card-view'; img.style.cssText='position:fixed;top:0;left:0;z-index:99999;width:900px;background:#fff;box-shadow:0 0 30px #000'; document.body.appendChild(img);} img.src=c.toDataURL('image/png'); return 'OFFICIAL-SHOWN n='+cs.length;})()" 2>/dev/null
sleep 2
agent-browser screenshot /tmp/r311-official-card.png > /dev/null 2>&1
echo "official screenshot saved"

echo "== [6] DOM probes + toast + client-errors =="
agent-browser eval "(()=>{const t=document.body.innerText; return 'toastW='+(t.includes('عکسِ هفته‌نامه ذخیره شد')?'yes':'no')+' toastO='+(t.includes('عکسِ کارنامه ذخیره شد')?'yes':'no');})()" 2>/dev/null
wc -l client-errors.log

echo "== [7] pkill chrome =="
pkill chrome 2>/dev/null; sleep 2
echo "done"
