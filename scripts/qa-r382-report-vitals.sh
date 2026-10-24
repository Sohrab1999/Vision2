#!/usr/bin/env bash
# ------------------------------------------------------------------
# r382 — داوریِ زندهٔ «ممیزیِ دوقلوها» (بندِ ②ِ پیشنهادِ r381):
#   A) buildِ تولیدیِ همین راند + ریاستارت + داورِ دستنخورده
#   B) سشنِ واحد: خانه آماده
#   C) بذرِ مخزنِ واقعی در persist (۳ واژه + دو نتیجهٔ ۸۰/۹۰ + تاریخِ
#      دیروز ۱ و امروز ۱۰) ⇒ ری‌لود
#   D) کارنامهٔ من: رکوردها + «جمع کل: ۱۱» (موتورِ report-vitals: ۸+۲+۱)
#      + چهار ستونِ ماهانه + قراردادِ نمره: knownCount=۳ ⇒ «درخشان» ممنوع
#   E) کارنامهٔ رسمی: KPIهایِ صادق — میانگینِ «۸۵٪» (avgPercentOf) و
#      «۱۱» (monthTotal از همان موتور) و «۵ روز» (bestStreak)
#   F) شاتها (کارنامهٔ روشن + رسمیِ تیره) + EventDay + کنسولِ پاک
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
OUT=/tmp/r382-qa.txt
: > "$OUT"

shot(){ agent-browser screenshot "$EV/$1" >/dev/null 2>&1; }
ev(){ agent-browser eval "$1" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

echo "########## A) build + ریاستارت" | tee -a "$OUT"
cd /home/z/my-project
bun run build > /tmp/r382-build.log 2>&1 && echo "BUILD-OK" | tee -a "$OUT" || { echo "BUILD-FAILED" | tee -a "$OUT"; tail -5 /tmp/r382-build.log | tee -a "$OUT"; exit 1; }
pkill -f "bun .next/standalone/server.js" 2>/dev/null; sleep 2
DATABASE_URL="file:/home/z/my-project/db/custom.db" TEACHER_ACCESS_CODE=moallem-1404 \
  setsid nohup bun .next/standalone/server.js > /home/z/my-project/scripts/app-server.log 2>&1 &
C="000"
for i in $(seq 1 30); do sleep 3; C=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/" 2>/dev/null); [ "$C" = "200" ] && break; done
echo "APP-READY code=$C" | tee -a "$OUT"
curl -s -o /dev/null -w "judge:%{http_code}\n" http://127.0.0.1:3003/ 2>/dev/null | tee -a "$OUT"

echo "########## B) سشنِ واحد" | tee -a "$OUT"
agent-browser close >/dev/null 2>&1 || true
pkill -f "agent-browser/browsers" 2>/dev/null; sleep 1
agent-browser open "$BASE" >/dev/null 2>&1
agent-browser set viewport 1280 900 >/dev/null 2>&1
agent-browser wait 'body' >/dev/null 2>&1 || true
for i in $(seq 1 30); do
  R=$(agent-browser eval "(()=>{const t=document.querySelector('[data-slot=\"dialog-title\"]');if(t)return 'ONBOARD';const g=document.querySelector('[aria-label=\"ابزارهای یادگیری\"]');return g?'HOME':'WAIT';})()" 2>/dev/null | tr -d '"')
  [ "$R" = "WAIT" ] || { echo "SURFACE-0=$R" | tee -a "$OUT"; break; }; sleep 3
done
ev "(()=>{const skip=[...document.querySelectorAll('button')].find(b=>(b.innerText||'').includes('ناشناس'));if(skip){skip.click();return 'skipped'}return 'no-onboard';})()" >/dev/null 2>&1
sleep 1.5

echo "########## C) بذرِ مخزن در persist + ری‌لود" | tee -a "$OUT"
ev "(()=>{
  const k=n=>{const d=new Date();d.setDate(d.getDate()-n);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};
  const raw=localStorage.getItem('vision2-study-v1');const j=raw?JSON.parse(raw):{state:{},version:0};
  j.state=j.state||{};
  j.state.onboarded=true;
  j.state.known={'3:accept':true,'3:reject':true,'4:abolish':true};
  j.state.results={'3:1':{percent:80,total:10},'4:1':{percent:90,total:10}};
  j.state.history={[k(0)]:{reviews:8,quizzes:2},[k(1)]:{reviews:1,quizzes:0}};
  j.state.dayStat={day:k(0),reviews:8,quizzes:2,words:0,dictation:0,rush:0,stories:0};
  j.state.streak=2;j.state.bestStreak=5;j.state.userName='';
  localStorage.setItem('vision2-study-v1',JSON.stringify(j));location.reload();return 'seeded';
})()" >/dev/null 2>&1
for i in $(seq 1 30); do
  R=$(agent-browser eval "(()=>{const g=document.querySelector('[aria-label=\"ابزارهای یادگیری\"]');return g?'HOME':'WAIT';})()" 2>/dev/null | tr -d '"')
  [ "$R" = "HOME" ] && { echo "HOME-RELOADED" | tee -a "$OUT"; break; }; sleep 3
done

echo "########## D) کارنامهٔ من — موتور رویِ DOM" | tee -a "$OUT"
ev "(()=>{window.dispatchEvent(new CustomEvent('open-report'));return 'report-opened';})()" >/dev/null 2>&1
sleep 3
ev "(async ()=>{
  await new Promise(r=>setTimeout(r,800));
  const dlg=[...document.querySelectorAll('[data-slot=\"dialog-title\"]')].map(d=>d.textContent).find(t=>(t||'').includes('کارنامه'));
  const body=document.body.textContent||'';
  const knownLabel=[...document.querySelectorAll('*')].find(e=>e.children.length===0&&(e.textContent||'').trim()==='واژهٔ آموخته');
  let knownCell=null;
  if(knownLabel){let a=knownLabel;for(let i=0;i<4&&a;i++){a=a.parentElement;if(a&&a.textContent&&a.textContent.includes('واژهٔ آموخته')&&/۳/.test(a.textContent)&&a.textContent.length<40){knownCell=a.textContent.trim().replace(/\s+/g,' ');break;}}}
  const totalChip=[...document.querySelectorAll('span')].find(s=>(s.textContent||'').includes('جمع کل'));
  const band=totalChip?(totalChip.closest('div[class*=\"rounded\"]')||totalChip.parentElement):null;
  const bars=band?band.querySelectorAll('div[dir=\"ltr\"] > div').length:-1;
  const totalTxt=totalChip?(totalChip.textContent||'').replace(/\s+/g,' ').trim():null;
  return JSON.stringify({DIALOG:dlg||null,KNOWN_CELL:knownCell,TOTAL:totalTxt,BARS:bars,BRILLIANT_FORBIDDEN:!body.includes('کارنامهٔ درخشان')});
})()" | tee -a "$OUT"
shot r382-report-card-light.png

echo "########## E) کارنامهٔ رسمی — KPIهایِ موتور" | tee -a "$OUT"
ev "(()=>{const btn=[...document.querySelectorAll('button')].find(b=>(b.getAttribute('aria-label')||'').includes('بستن')||(b.textContent||'').includes('بستن'));if(btn){btn.click();return 'closed'}return 'no-close-btn';})()" >/dev/null 2>&1
sleep 1.5
ev "(()=>{window.dispatchEvent(new CustomEvent('open-official-report'));return 'official-opened';})()" >/dev/null 2>&1
sleep 3
ev "(async ()=>{
  await new Promise(r=>setTimeout(r,800));
  const kpis=[...document.querySelectorAll('.or-kpi-value')].map(e=>(e.textContent||'').trim());
  const body=document.body.textContent||'';
  return JSON.stringify({KPIS:kpis,HAS_AVG85:kpis.some(t=>t.includes('۸۵')&&t.includes('٪')),HAS_TOTAL11:kpis.some(t=>t.trim()==='۱۱'),HAS_STREAK5:kpis.some(t=>t.includes('۵')&&t.includes('روز')),BADGE_BAND:body.includes('از')&&body.includes('نشان')});
})()" | tee -a "$OUT"
ev "(()=>{document.documentElement.classList.add('dark');return 'dark';})()" >/dev/null 2>&1
sleep 1
shot r382-official-report-dark.png
ev "(()=>{document.documentElement.classList.remove('dark');return 'light';})()" >/dev/null 2>&1

echo "########## F) EventDay + کنسولِ پاک" | tee -a "$OUT"
ev "(async ()=>{
  const res=await fetch('/api/event',{cache:'no-store'});
  const j=await res.json();
  const names=['app_open','teacher_open','quiz_done','rush_done'];
  const out={};
  for(const n of names){const e=(j.events||[]).find(x=>x.name===n);out[n]=e?e.total:0;}
  return 'EVENTS '+JSON.stringify(out);
})()" | tee -a "$OUT"
agent-browser logs 2>/dev/null | grep -iE "error|warn" | grep -vE "Download the React DevTools|hydrat" > /tmp/r382-console.log || true
if [ -s /tmp/r382-console.log ]; then echo "CONSOLE-DIRTY: $(head -3 /tmp/r382-console.log)" | tee -a "$OUT"; else echo "CONSOLE-CLEAN" | tee -a "$OUT"; fi

echo "########## DONE" | tee -a "$OUT"
