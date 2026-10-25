#!/usr/bin/env bash
# ------------------------------------------------------------------
# r353 — داوریِ زندهٔ «عمقِ پنلِ معلم». تک سشن:
#   A) خانه (بدونِ persona — فهرستِ واقعیِ خودِ سرور میدانِ آزمون است)
#   B) تنظیمات ⇒ «فهرستِ کلاس» ⇒ کدِ درست ⇒ فهرستِ زنده
#   C) پیشفرضِ مرتبسازی: چهار چیپ + ردیفهایِ دکمهایِ دارایِ تلاش
#   D) کلیکِ نخستین ردیفِ دکمهای ⇒ دیالوگِ جزئیات با دادهٔ واقعی:
#      کارتها / نوارِ ۱۴روزه / درسِ ۰ِ خارجی / rush / آخرین تلاش
#   E) مرتبسازیِ «نام» ⇒ تغییرِ قطعیِ رأسِ فهرست + aria-pressed
#   F) EventDay: teacher_detail=1
#   G) تیره: فهرست + دیالوگ
#   H) فازِ دوم (بیرونِ سشن): ریاستارتِ بی‌کد ⇒ 404 صادق
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
OUT=/tmp/r353-qa.txt
: > "$OUT"

shot(){ agent-browser screenshot "$EV/$1" >/dev/null 2>&1; }
ev(){ agent-browser eval "$1" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
wait_home(){ for i in $(seq 1 30); do
  local R; R=$(agent-browser eval "(()=>{const g=document.querySelector('[aria-label=\"ابزارهای یادگیری\"]');return g?'HOME-OK':'WAIT';})()" 2>/dev/null | tr -d '"')
  [ "$R" = "HOME-OK" ] && { echo "home-ready-${i}x3s" >> "$OUT"; return 0; }; sleep 3
done; echo "HOME-NEVER" | tee -a "$OUT"; return 1; }

echo "########## A) خانه" | tee -a "$OUT"
agent-browser close >/dev/null 2>&1 || true
pkill -f "agent-browser/browsers" 2>/dev/null; sleep 1
agent-browser open "$BASE" >/dev/null 2>&1
agent-browser set viewport 1280 900 >/dev/null 2>&1
agent-browser wait 'body' >/dev/null 2>&1 || true
sleep 2
wait_home || { agent-browser close >/dev/null 2>&1; exit 1; }
agent-browser eval "(()=>{document.documentElement.classList.remove('dark');return 1;})()" >/dev/null 2>&1

echo "########## B) تنظیمات ⇒ فهرستِ کلاس ⇒ کدِ درست" | tee -a "$OUT"
ev "(()=>{
  const gear=document.querySelector('[aria-label=\"تنظیمات\"]');
  if(!gear)return 'NO-GEAR'; gear.click(); return 'gear-opened';})()" >/dev/null 2>&1
sleep 1.5
ev "(()=>{
  const b=[...document.querySelectorAll('button')].find(x=>x.getAttribute('aria-label')==='گشودن پنل معلم — فهرست کلاس');
  if(!b)return 'NO-TEACHER-BTN'; b.click(); return 'teacher-opened';})()" >/dev/null 2>&1
sleep 2.5
ev "(()=>{
  const inp=document.querySelector('[data-testid=\"teacher-code-input\"]');
  if(!inp)return 'NO-GATE';
  const setter=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
  setter.call(inp,'moallem-1404'); inp.dispatchEvent(new Event('input',{bubbles:true}));
  inp.closest('form').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));
  return 'submitted';})()" >/dev/null 2>&1
sleep 3

echo "########## C) فهرستِ زنده — چیپها و ردیفهایِ دکمهای" | tee -a "$OUT"
ev "(()=>{
  const ready=document.querySelector('[data-testid=\"teacher-ready\"]');
  if(!ready)return 'NO-READY';
  const sort=document.querySelector('[data-testid=\"teacher-sort\"]');
  const chips=sort? sort.querySelectorAll('button').length : 0;
  const pressed=sort? [...sort.querySelectorAll('button')].filter(b=>b.getAttribute('aria-pressed')==='true').length : 0;
  const rows=[...document.querySelectorAll('[data-testid=\"teacher-row\"]')];
  const openable=rows.filter(r=>r.getAttribute('data-teacher-open')==='true').length;
  const first=rows[0]? rows[0].innerText.split('\n')[0] : '-';
  return JSON.stringify({ready:'READY-OK',chips,pressedDefault:pressed,rows:rows.length,openable,firstRow:first});
})()"
shot r353-roster-light.png

echo "########## D) دیالوگِ جزئیات — نخستین ردیفِ دکمهای (دادهٔ واقعی)" | tee -a "$OUT"
ev "(()=>{
  const row=document.querySelector('[data-teacher-open=\"true\"]');
  if(!row)return 'NO-OPENABLE'; row.click(); return 'row-clicked';})()" >/dev/null 2>&1
sleep 3
ev "(()=>{
  const dlg=document.querySelector('[data-testid=\"teacher-detail-dialog\"]');
  if(!dlg)return 'NO-DIALOG';
  const cards=document.querySelector('[data-testid=\"teacher-detail-cards\"]');
  const strip=document.querySelector('[data-testid=\"teacher-detail-strip\"]');
  const lessons=document.querySelector('[data-testid=\"teacher-detail-lessons\"]');
  const skills=document.querySelector('[data-testid=\"teacher-detail-skills\"]');
  const recent=document.querySelector('[data-testid=\"teacher-detail-recent\"]');
  const l0=[...dlg.querySelectorAll('*')].find(e=>e.children.length===0&&e.textContent.trim()==='درسِ ۰');
  const txt=dlg.innerText;
  return JSON.stringify({
    dialog:'DIALOG-OK',
    cards: cards? cards.innerText.replace(/\n/g,' | ').slice(0,80):'MISS',
    strip14: strip? strip.querySelectorAll('[class*=\"c-track-80\"]').length+'zero-tracks':'MISS',
    lessonTiles: lessons? lessons.querySelectorAll('.rounded-xl').length : 0,
    externalL0: l0? 'L0-PRESENT':'MISS',
    skills: skills? skills.innerText.replace(/\n/g,' | ').slice(0,60):'MISS',
    recent: recent? recent.innerText.replace(/\n/g,' | ').slice(0,60):'MISS',
    noUserId: txt.includes('userId')?'LEAK!':'CLEAN',
    noSecret: txt.includes('secret')?'LEAK!':'CLEAN'
  });
})()"
shot r353-detail-light.png

echo "########## E) مرتبسازیِ «نام» — تغییرِ قطعیِ رأس" | tee -a "$OUT"
ev "(()=>{
  const bg=document.querySelector('[data-testid=\"teacher-detail-dialog\"] [aria-label=\"Close\"]') 
    || [...document.querySelectorAll('[data-testid=\"teacher-detail-dialog\"] button')].find(b=>b.querySelector('svg')&&b.getAttribute('aria-label')==='');
  if(bg){bg.click();}
  return 'close-attempted';})()" >/dev/null 2>&1
sleep 1
agent-browser press Escape >/dev/null 2>&1
sleep 1.5
ev "(()=>{
  const before=[...document.querySelectorAll('[data-testid=\"teacher-row\"]')][0]?.innerText.split('\n')[0]||'-';
  const chip=document.querySelector('[data-testid=\"teacher-sort-name\"]');
  if(!chip)return 'NO-NAME-CHIP'; chip.click(); return 'name-clicked:'+before;})()" >/dev/null 2>&1
sleep 1.5
ev "(()=>{
  const rows=[...document.querySelectorAll('[data-testid=\"teacher-row\"]')];
  const first=rows[0]?.innerText.split('\n')[0]||'-';
  const pressed=document.querySelector('[data-testid=\"teacher-sort-name\"]')?.getAttribute('aria-pressed');
  return JSON.stringify({afterNameSort:{first,pressed},rows:rows.length});
})()"
shot r353-roster-sorted.png

echo "########## F) EventDay — teacher_detail=1" | tee -a "$OUT"
curl -s "$BASE/api/event" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{const j=JSON.parse(s);const t=(j.events||[]).find(e=>e.name==='teacher_detail');console.log('TEACHER_DETAIL='+(t?t.total:'MISS'));})" | tee -a "$OUT"

echo "########## G) تیره — فهرست" | tee -a "$OUT"
agent-browser eval "(()=>{document.documentElement.classList.add('dark');return 'dark-on';})()" >/dev/null 2>&1
sleep 1
shot r353-roster-dark.png
agent-browser eval "(()=>{document.documentElement.classList.remove('dark');return 'dark-off';})()" >/dev/null 2>&1

agent-browser close >/dev/null 2>&1
echo "########## DONE" | tee -a "$OUT"
