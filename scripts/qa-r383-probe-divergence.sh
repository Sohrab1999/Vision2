#!/bin/bash
# r383 — شاهدِ زندهٔ واگراییِ سرشماری (پیشِ تغییر): بذرِ یخ/هدف/ران در persist،
# بعد شمارشِ گریدِ خانه (۱۹سیگنالی) در برابرِ KPIِ کارنامه (۱۳سیگنالی).
# انتظار: دو عدد متفاوت — واگراییِ واقعی رویِ API راستین.
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
OUT=/tmp/r383-probe.txt
: > "$OUT"
shot(){ agent-browser screenshot "$EV/$1" >/dev/null 2>&1; }
ev(){ agent-browser eval "$1" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

agent-browser open "$BASE" 2>&1 | tail -1 | tee -a "$OUT"
sleep 2

echo "########## بذرِ یخ/هدف/ران (۷ روزِ پیوستهٔ همهفعالیت) + یخِ کامل" | tee -a "$OUT"
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

echo "########## گریدِ خانه — شمارشِ ۱۹سیگنالی" | tee -a "$OUT"
ev "(()=>{
  const body=document.body.textContent||'';
  const m=body.match(/(\S+)\s*از\s*۵۶/);
  return 'GRID_COUNT='+(m?m[1]:'NOTFOUND');
})()" | tee -a "$OUT"

echo "########## کارنامهٔ من — KPIِ نشان (۱۳سیگنالیِ کنونی)" | tee -a "$OUT"
ev "(()=>{window.dispatchEvent(new CustomEvent('open-report'));return 'report-opened';})()" >/dev/null 2>&1
sleep 3
ev "(()=>{
  const rows=[...document.querySelectorAll('*')].filter(e=>e.children.length===0&&(e.textContent||'').includes('نشان کسب‌شده'));
  if(!rows.length) return 'KPI-NOT-FOUND';
  let cell=rows[0];
  for(let i=0;i<4&&cell;i++){cell=cell.parentElement;if(cell&&cell.textContent.includes('نشان کسب‌شده')&&cell.textContent.length<80)break;}
  return 'REPORT_KPI='+(cell?cell.textContent.trim().replace(/\s+/g,' '):'CELL-NOT-FOUND');
})()" | tee -a "$OUT"
shot r383-probe-report-before.png
echo "PROBE-DONE" | tee -a "$OUT"
