#!/usr/bin/env bash
# r308 — QAِ تک‌فراخوانی: سرور در همین فراخوان بالا میآید، کارتِ واقعیِ PNG
# رندر و اسکرین‌شات میشود و در پایان کروم برایِ گیتها کشته میشود.
# (پسزمینهٔ بینِ فراخوانها جمع میشود — همهچیز باید در یک call تمام شود.)
set -u
cd /home/z/my-project

echo "== [1] server up =="
nohup bun run dev > /tmp/next-dev-r308c.log 2>&1 &
SRV=$!
for i in $(seq 1 30); do
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 4 http://127.0.0.1:3000 2>/dev/null)
  [ "$code" = "200" ] && break
  sleep 2
done
echo "server=$code"

echo "== [2] open + seed check =="
agent-browser open http://127.0.0.1:3000 --viewport 1280x800 > /dev/null 2>&1
sleep 4
agent-browser eval "(()=>{const raw=localStorage.getItem('vision2-study-v1'); const has=raw&&JSON.parse(raw)?.state?.dayHistory?Object.keys(JSON.parse(raw).state.dayHistory).length:0; if(has>0){localStorage.removeItem('r308-reseed'); return 'seedDays='+has;} return 'seedDays=0';})()" 2>/dev/null

echo "== [3] seed if empty (سرور تازه، localStorage دستنخورده اما محتاط) =="
agent-browser eval "(()=>{const raw=localStorage.getItem('vision2-study-v1'); if(raw&&JSON.parse(raw)?.state?.dayHistory) return 'keep'; const k=(n)=>{const d=new Date(); d.setDate(d.getDate()-n); return d.toISOString().slice(0,10);}; const st=(rev,qz,w,di,ru,s)=>({reviews:rev,quizzes:qz,words:w,dictation:di,rush:ru,stories:s}); const h={}; h[k(0)]=st(2,1,3,0,0,1); h[k(2)]=st(1,2,1,1,0,2); h[k(3)]=st(3,0,2,0,1,1); h[k(6)]=st(2,2,2,0,0,1); h[k(8)]=st(1,0,1,0,0,2); h[k(10)]=st(2,1,0,1,0,0); h[k(16)]=st(1,1,1,0,0,3); h[k(20)]=st(0,0,2,0,0,1); h[k(25)]=st(2,0,0,1,0,2); localStorage.setItem('vision2-study-v1', JSON.stringify({state:{userName:'کیانا ب', avatarColor:'emerald', onboarded:true, dayHistory:h}, version:0})); location.reload(); return 'reseeded';})()" 2>/dev/null
sleep 4

echo "== [4] open report + hook canvas =="
agent-browser eval "(()=>{window.dispatchEvent(new Event('open-report')); return 'opened';})()" 2>/dev/null
sleep 3
agent-browser eval "(()=>{window.__canvases=[]; const orig=document.createElement.bind(document); document.createElement=function(tag){const el=orig(tag); if(tag==='canvas'){window.__canvases.push(el);} return el;}; return 'hooked';})()" 2>/dev/null

echo "== [5] click PNG + show real card =="
agent-browser eval "(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.getAttribute('aria-label')==='گرفتن عکس هفته‌نامهٔ پیشرفت'); if(!b) return 'BTN-MISSING'; b.click(); return 'clicked';})()" 2>/dev/null
sleep 4
agent-browser eval "(()=>{const cs=(window.__canvases||[]).filter(c=>c.width===1080&&c.height===920); if(!cs.length) return 'NO-CARD'; const c=cs[cs.length-1]; let img=document.getElementById('r308-card-view'); if(!img){img=document.createElement('img'); img.id='r308-card-view'; img.style.cssText='position:fixed;top:0;left:0;z-index:99999;width:920px;background:#fff;box-shadow:0 0 30px #000'; document.body.appendChild(img);} img.src=c.toDataURL('image/png'); return 'CARD-SHOWN n='+cs.length;})()" 2>/dev/null
sleep 2
agent-browser set viewport 1000 1400 > /dev/null 2>&1
sleep 1
agent-browser screenshot /tmp/r308-card-visual3.png > /dev/null 2>&1
echo "screenshot saved"

echo "== [6] toast double-check + client-errors =="
agent-browser eval "(()=>{const t=document.body.innerText; return 'toastPNG='+(t.includes('عکسِ هفته‌نامه ذخیره شد')?'yes':'no');})()" 2>/dev/null
wc -l client-errors.log

echo "== [7] pkill chrome برایِ گیتها =="
pkill chrome 2>/dev/null; sleep 2
echo "chrome killed; done"
