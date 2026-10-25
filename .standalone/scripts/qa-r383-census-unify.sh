#!/bin/bash
# r383 — داوریِ زندهٔ یکسانسازیِ سرشماری (۱۹سیگنالی):
#   A) buildِ همین راند + ریاستارت ⇒ APP 200، داورِ ۴۰۰ دستنخورده
#   B) بذرِ یخ/هدف/ران در persist (همان بذرِ پروبِ پیشِ تغییر) ⇒ ری‌لود
#   C) شاهدِ یکسانسازی: گریدِ خانه == KPIِ کارنامه == لیستِ رسمی (واگراییِ «۲۰↔۵» مرده)
#   D) کارنامهٔ رسمی نشانهایِ یخ/هدف/ران را با نامِ فارسی فهرست میکند
#   E) شاتها (خانه با گریدِ نشان + کارنامهٔ تیره) + EventDay + کنسولِ پاک
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
OUT=/tmp/r383-qa.txt
: > "$OUT"
shot(){ agent-browser screenshot "$EV/$1" >/dev/null 2>&1; }
ev(){ agent-browser eval "$1" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

echo "########## A) build + ریاستارت" | tee -a "$OUT"
cd /home/z/my-project
bun run build > /tmp/r383-build.log 2>&1 && echo "BUILD-OK" | tee -a "$OUT" || { echo "BUILD-FAILED" | tee -a "$OUT"; tail -5 /tmp/r383-build.log | tee -a "$OUT"; exit 1; }
pkill -f "bun .next/standalone/server.js" 2>/dev/null; sleep 2
(HOSTNAME=127.0.0.1 PORT=3000 bun .next/standalone/server.js > /tmp/r383-server.log 2>&1 &) ; sleep 6
for i in $(seq 1 20); do
  C=$(curl -s -o /dev/null -w "%{http_code}" --max-time 3 "$BASE" 2>/dev/null)
  [ "$C" = "200" ] && { echo "APP=200" | tee -a "$OUT"; break; }; sleep 2
done
curl -s -o /dev/null -w "JUDGE=%{http_code}\n" --max-time 3 http://127.0.0.1:3003 | tee -a "$OUT"

agent-browser open "$BASE" 2>&1 | tail -1 | tee -a "$OUT"
sleep 2

echo "########## B) بذرِ یخ/هدف/ران + ری‌لود" | tee -a "$OUT"
ev "(()=>{
  const k=n=>{const d=new Date();d.setDate(d.getDate()-n);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};
  const raw=localStorage.getItem('vision2-study-v1');const j=raw?JSON.parse(raw):{state:{},version:0};
  j.state=j.state||{};
  j.state.onboarded=true;
  j.state.known={'3:accept':true,'3:reject':true,'4:abolish':true};
  j.state.results={'3:1':{percent:80,total:10},'4:1':{percent:90,total:10}};
  j.state.streak=9;j.state.bestStreak=12;j.state.userName='';
  j.state.freezeCount=2;j.state.freezeEarnedDay=k(0);j.state.freezeUsedDays=[];
  j.state.goalMetDays=[k(0),k(1),k(2),k(3),k(4),k(5),k(6)];
  const dh={};
  for(let i=0;i<35;i++){dh[k(i)]={day:k(i),reviews:9,quizzes:2,words:4,dictation:3,rush:1,stories:0};}
  j.state.dayHistory=dh;
  j.state.dayStat={day:k(0),reviews:9,quizzes:2,words:4,dictation:3,rush:1,stories:0};
  localStorage.setItem('vision2-study-v1',JSON.stringify(j));location.reload();return 'seeded';
})()" >/dev/null 2>&1
for i in $(seq 1 30); do
  R=$(agent-browser eval "(()=>{return document.body&&document.body.textContent.includes('ابزارهای یادگیری')?'HOME':'WAIT';})()" 2>/dev/null | tr -d '"')
  [ "$R" = "HOME" ] && { echo "HOME-RELOADED" | tee -a "$OUT"; break; }; sleep 3
done

echo "########## C) شاهدِ یکسانسازی — سه عدد باید یکی شوند" | tee -a "$OUT"
ev "(()=>{
  const body=document.body.textContent||'';
  const m=body.match(/دستاوردها(\S+)از\s*۵۶/);
  return 'GRID='+((m&&m[1])?m[1]:'NOTFOUND');
})()" | tee -a "$OUT"
ev "(()=>{window.dispatchEvent(new CustomEvent('open-report'));return 'report-opened';})()" >/dev/null 2>&1
sleep 3
ev "(()=>{
  const rows=[...document.querySelectorAll('*')].filter(e=>e.children.length===0&&(e.textContent||'').includes('نشان کسب‌شده'));
  if(!rows.length) return 'KPI-NOT-FOUND';
  let cell=rows[0];
  for(let i=0;i<4&&cell;i++){cell=cell.parentElement;if(cell&&cell.textContent.includes('نشان کسب‌شده')&&cell.textContent.length<80)break;}
  const t=cell?cell.textContent.trim().replace(/\s+/g,' '):'CELL-NOT-FOUND';
  return 'REPORT_KPI='+t;
})()" | tee -a "$OUT"

echo "########## D) کارنامهٔ رسمی — نشانهایِ خانوادههایِ نو فهرست میشوند" | tee -a "$OUT"
ev "(()=>{window.dispatchEvent(new CustomEvent('open-official-report'));return 'official-opened';})()" >/dev/null 2>&1
sleep 4
ev "(()=>{
  const body=document.body.textContent||'';
  const ice=body.includes('یخ‌ساز');
  const goal=body.includes('اولین هدف');
  const run=body.includes('هفتهٔ مرور');
  const m=body.match(/(\S+)\s*از\s*۵۶/);
  return 'OFFICIAL[ice='+ice+' goal='+goal+' run='+run+' count='+(m?m[1]:'?')+']';
})()" | tee -a "$OUT"
shot r383-after-official-dark.png
ev "(()=>{const b=[...document.querySelectorAll('button')].find(x=>(x.getAttribute('aria-label')||'').includes('بستن')||x.textContent.includes('بازگشت'));if(b)b.click();return 'closed-try';})()" >/dev/null 2>&1
sleep 2
ev "(()=>{window.dispatchEvent(new CustomEvent('open-report'));return 'reopened';})()" >/dev/null 2>&1
sleep 2
ev "(()=>{
  const b=[...document.querySelectorAll('button')].find(x=>(x.getAttribute('aria-label')||x.textContent||'').includes('بستن'));
  if(b)b.click();return 'report-closed-try';
})()" >/dev/null 2>&1
sleep 2

echo "########## E) شاتِ خانه + EventDay + کنسول" | tee -a "$OUT"
shot r383-after-home-badges-light.png
ev "(()=>{const errs=(window.__qaErrors||[]).length;return 'CONSOLE_ERRORS='+errs;})()" | tee -a "$OUT"
echo "QA-DONE" | tee -a "$OUT"
