#!/usr/bin/env bash
# ------------------------------------------------------------------
# r377 — داوریِ زندهٔ «روزنامه هم میشمارد؛ دیالوگ هرگز نمیمیرد»:
#   A) ریاستارتِ بیقیدوشرط رویِ standaloneِ همین راند (buildِ نهایی —
#      قراردادِ r374: داوری همان buildی است که ساخته میشود)
#   B) سشنِ تازه + آنبوردینگِ واقعی + گیتِ معلم ⇒ پنلِ ۸۰ردیفی
#   C) کارتِ آمارِ «فعال در ۲۴ ساعت» پنل + دکمهٔ روزنامه حاضرند
#   D) شاهدِ بایتیِ نو: رهگیرِ createObjectURL — بایت‌هایِ واقعیِ CSVِ
#      روزنامه درونِ مرورگر خوانده میشود (سربرگِ ۹ستونی + سطرِ فعال)
#   E) انتظارِ داده‌محورِ ستونِ ۲۴ساعت از reportِ سرور (تعدادِ
#      یادگیرندههایِ active در پنجرهٔ لغزان) — بدونِ حدس
#   F) دیالوگِ جزئیات رویِ یادگیرندهٔ واقعی: نوارِ ۱۴ستونی + «مجموعِ
#      دو هفته» — مسیرِ سالمشدهٔ byDay رویِ APIِ راستین
#   G) شاتِ روشن + تیرهٔ پنل
#   H) EventDay + کنسولِ دوفازیِ پاک
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
OUT=/tmp/r377-qa.txt
: > "$OUT"

shot(){ agent-browser screenshot "$EV/$1" >/dev/null 2>&1; }
ev(){ agent-browser eval "$1" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

echo "########## A) ریاستارتِ بیقیدوشرط رویِ buildِ همین راند" | tee -a "$OUT"
pkill -f "bun .next/standalone/server.js" 2>/dev/null; sleep 2
cd /home/z/my-project
DATABASE_URL="file:/home/z/my-project/db/custom.db" TEACHER_ACCESS_CODE=moallem-1404 \
  setsid nohup bun .next/standalone/server.js > /home/z/my-project/scripts/app-server.log 2>&1 &
C="000"
for i in $(seq 1 30); do sleep 3; C=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/" 2>/dev/null); [ "$C" = "200" ] && break; done
echo "APP-READY code=$C" | tee -a "$OUT"
curl -s -o /dev/null -w "judge:%{http_code}\n" http://127.0.0.1:3003/ 2>/dev/null | tee -a "$OUT"

echo "########## B) سشنِ تازه + آنبوردینگ + گیتِ معلم" | tee -a "$OUT"
agent-browser close >/dev/null 2>&1 || true
pkill -f "agent-browser/browsers" 2>/dev/null; sleep 1
agent-browser open "$BASE" >/dev/null 2>&1
agent-browser set viewport 1280 900 >/dev/null 2>&1
agent-browser wait 'body' >/dev/null 2>&1 || true
for i in $(seq 1 30); do
  R=$(agent-browser eval "(()=>{const t=document.querySelector('[data-slot=\"dialog-title\"]');if(t)return 'ONBOARD';const g=document.querySelector('[aria-label=\"ابزارهای یادگیری\"]');return g?'HOME':'WAIT';})()" 2>/dev/null | tr -d '"')
  [ "$R" = "WAIT" ] || { echo "SURFACE-0=$R" | tee -a "$OUT"; break; }; sleep 3
done
ev "(()=>{const skip=[...document.querySelectorAll('button')].find(b=>(b.innerText||'').includes('ناشناس'));if(skip){skip.click();return 'onboard-skipped'}return 'no-onboard';})()" >/dev/null 2>&1
sleep 1.5
ev "(()=>{const g=document.querySelector('[aria-label=\"تنظیمات\"]');if(!g)return 'NO-GEAR';g.click();return 'gear';})()" >/dev/null 2>&1
sleep 1.5
ev "(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.getAttribute('aria-label')==='گشودن پنل معلم — فهرست کلاس');if(!b)return 'NO-TEACHER-BTN';b.click();return 'teacher';})()" >/dev/null 2>&1
sleep 2
ev "(()=>{const inp=document.querySelector('[data-testid=\"teacher-code-input\"]');if(!inp)return 'NO-INPUT';const s=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;s.call(inp,'moallem-1404');inp.dispatchEvent(new Event('input',{bubbles:true}));inp.closest('form').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));return 'submitted';})()" >/dev/null 2>&1
sleep 3.5
ev "(()=>{
  const ready=document.querySelector('[data-testid=\"teacher-ready\"]');
  if(!ready)return 'NOT-READY';
  const rows=document.querySelectorAll('[data-testid=\"teacher-row\"]').length;
  return JSON.stringify({PANEL:{ready:true,rows}});
})()"

echo "########## C) کارتِ آمارِ ۲۴ساعت + دکمهٔ روزنامه" | tee -a "$OUT"
ev "(()=>{
  const card=[...document.querySelectorAll('p')].find(p=>p.textContent.trim()==='فعال در ۲۴ ساعت');
  if(!card)return 'NO-24H-CARD';
  const val=card.parentElement.querySelector('p[dir]');
  const csvBtn=document.querySelector('button[aria-label=\"دانلود روزنامهٔ کلاس (CSV)\"]');
  const ledgerBtn=document.querySelector('[data-testid=\"teacher-ledger\"]');
  return JSON.stringify({'24H-CARD':{present:true,value:val&&val.textContent},csvBtn:!!csvBtn,ledgerBtn:!!ledgerBtn});
})()"

echo "########## D) شاهدِ بایتی — خواندنِ CSVِ واقعی از createObjectURL" | tee -a "$OUT"
ev "(async ()=>{
  return await new Promise((resolve)=>{
    let captured=null;
    const orig=URL.createObjectURL.bind(URL);
    URL.createObjectURL=function(blob){
      const u=orig(blob);
      blob.text().then(t=>{captured=t.split('\r\n').filter(l=>l.length>0).slice(0,4);});
      URL.createObjectURL=orig;
      return u;
    };
    const btn=document.querySelector('button[aria-label=\"دانلود روزنامهٔ کلاس (CSV)\"]');
    if(!btn){URL.createObjectURL=orig;return resolve('NO-BTN');}
    btn.click();
    setTimeout(()=>{
      if(!captured)return resolve('CSV-NOT-CAPTURED');
      resolve(JSON.stringify({CSV_HEADER:captured[0],CSV_ROW1:captured[1],COLS:captured[0].split(',').length}));
    },1500);
  });
})()"

echo "########## E) انتظارِ داده‌محورِ ستونِ ۲۴ساعت از سرور" | tee -a "$OUT"
ev "(async ()=>{
  const res=await fetch('/api/teacher/report',{cache:'no-store',headers:{'x-teacher-code':'moallem-1404'}});
  if(!res.ok)return 'REPORT-HTTP-'+res.status;
  const j=await res.json();
  const now=Date.now();
  const active=j.roster.filter(r=>r.lastActive&&(Date.parse(r.lastActive)>=now-86400000)).length;
  const withAttempts=j.roster.filter(r=>r.attempts>0).length;
  return JSON.stringify({CSV24_EXPECTED_LEARNERS:active,LEARNERS_WITH_ATTEMPTS:withAttempts,PANEL_CARD_ATTEMPT_COUNT:j.summary.last24h});
})()"

echo "########## F) دیالوگِ جزئیات — نوارِ ۱۴ستونی رویِ APIِ راستین" | tee -a "$OUT"
ev "(()=>{
  const row=[...document.querySelectorAll('[data-testid=\"teacher-row\"]')].find(el=>el.getAttribute('data-teacher-open')==='true');
  if(!row)return 'NO-OPENABLE-ROW';
  row.click();return 'row-clicked';
})()" >/dev/null 2>&1
sleep 3
ev "(()=>{
  const dlg=document.querySelector('[data-testid=\"teacher-detail-dialog\"]');
  if(!dlg)return 'NO-DIALOG';
  const loading=document.querySelector('[data-testid=\"teacher-detail-loading\"]');
  const strip=document.querySelector('[data-testid=\"teacher-detail-strip\"]');
  const cols=strip?strip.querySelectorAll('div.flex.h-14 > div').length:-1;
  const labels=strip?strip.querySelectorAll('div.mt-1 > span').length:-1;
  const total=document.querySelector('[data-testid=\"teacher-detail-week-total\"]');
  const cards=document.querySelector('[data-testid=\"teacher-detail-cards\"]');
  return JSON.stringify({DIALOG:{ready:!loading,stripCols:cols,stripLabels:labels,weekTotal:total&&total.textContent,cardsOk:!!cards,loadingGone:!loading}});
})()"
shot r377-detail-strip.png
ev "(()=>{const b=document.querySelector('[data-testid=\"teacher-detail-dialog\"]');if(!b)return 'NO-DIALOG';b.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));return 'esc';})()" >/dev/null 2>&1
sleep 1.5

echo "########## G) شاتهایِ پنل (روشن + تیره)" | tee -a "$OUT"
shot r377-panel-light.png
ev "(()=>{document.documentElement.classList.add('dark');return 'dark-on';})()" >/dev/null 2>&1
sleep 1
shot r377-panel-dark.png
ev "(()=>{document.documentElement.classList.remove('dark');return 'light';})()" >/dev/null 2>&1

echo "########## H) EventDay + کنسولِ دوفازی" | tee -a "$OUT"
ev "(async ()=>{
  const res=await fetch('/api/event',{cache:'no-store'});
  const j=await res.json();
  const names=['teacher_open','teacher_csv','teacher_class_csv','teacher_detail'];
  const out={};
  for(const n of names){const e=(j.events||[]).find(x=>x.name===n);out[n]=e?e.total:0;}
  return 'EVENTS '+JSON.stringify(out);
})()"
agent-browser logs 2>/dev/null | grep -iE "error|warn" | grep -vE "Download the React DevTools|hydrat" > /tmp/r377-console.log || true
if [ -s /tmp/r377-console.log ]; then echo "CONSOLE-DIRTY: $(head -3 /tmp/r377-console.log)" | tee -a "$OUT"; else echo "CONSOLE-CLEAN" | tee -a "$OUT"; fi

echo "########## DONE" | tee -a "$OUT"
