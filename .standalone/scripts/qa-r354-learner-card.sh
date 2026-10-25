#!/usr/bin/env bash
# ------------------------------------------------------------------
# r354 — داوریِ زندهٔ «کارنامهٔ یادگیرنده» — هفتمین عضوِ CSV. تک سشن:
#   A) خانه (بدونِ persona — فهرستِ واقعیِ خودِ سرور میدانِ آزمون است)
#   B) تنظیمات ⇒ «پنلِ معلم» ⇒ کدِ درست ⇒ فهرستِ زنده
#   C) نخستین ردیفِ دکمهای ⇒ دیالوگِ جزئیات (دادهٔ واقعی)
#   D) دکمهٔ CSV کنارِ تازهسازی: testid + aria-label + عنوان
#   E) شکارِ محتوایِ فایل از درونِ صفحه: patchِ createObjectURL ⇒
#      FileReader ⇒ متنِ کامل — BOM/CRLF/بخشها/اعدادِ ASCII
#   F) EventDay: teacher_learner_csv=1 (+ teacher_detail)
#   G) تیره: دیالوگ با دو دکمهٔ آیکنی
#   H) فازِ دوم (بیرونِ سشن): ریاستارتِ بی‌کد ⇒ 404 صادقِ هر دو مسیر
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
OUT=/tmp/r354-qa.txt
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

echo "########## B) تنظیمات ⇒ پنلِ معلم ⇒ کدِ درست" | tee -a "$OUT"
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

echo "########## C) دیالوگِ جزئیات — نخستین ردیفِ دکمهای" | tee -a "$OUT"
ev "(()=>{
  const ready=document.querySelector('[data-testid=\"teacher-ready\"]');
  if(!ready)return 'NO-READY';
  const row=document.querySelector('[data-teacher-open=\"true\"]');
  if(!row)return 'NO-OPENABLE'; row.click(); return 'row-clicked';})()" | tee -a "$OUT"
sleep 3

echo "########## D) دکمهٔ CSV — حضور و قرارداد" | tee -a "$OUT"
ev "(()=>{
  const btn=document.querySelector('[data-testid=\"teacher-detail-csv\"]');
  if(!btn)return 'NO-CSV-BTN';
  const dlg=document.querySelector('[data-testid=\"teacher-detail-dialog\"]');
  const refresh=dlg.querySelector('[aria-label=\"بهروزرسانی جزئیات\"], [aria-label=\"به‌روزرسانی جزئیات\"]');
  return JSON.stringify({
    csv:'CSV-BTN-OK',
    aria:btn.getAttribute('aria-label'),
    title:btn.getAttribute('title'),
    icon:!!btn.querySelector('svg'),
    nextToRefresh:!!refresh
  });
})()" | tee -a "$OUT"
shot r354-dialog-light.png

echo "########## E) شکارِ محتوایِ CSV — بایلتهایِ خامِ blob (اثباتِ BOM بایتی)" | tee -a "$OUT"
ev "(()=>{
  window.__cap=null; window.__bytes=null; window.__bom=null;
  const orig=URL.createObjectURL.bind(URL);
  URL.createObjectURL=(b)=>{
    try{
      window.__bytes=b.size;
      b.arrayBuffer().then((ab)=>{
        const u=new Uint8Array(ab);
        window.__bom=(u[0]===0xEF&&u[1]===0xBB&&u[2]===0xBF)?'BOM-BYTES-OK':'NO-BOM('+u[0]+','+u[1]+','+u[2]+')';
        window.__cap=new TextDecoder('utf-8').decode(u.slice(3));
      });
    }catch(e){}
    return orig(b);
  };
  return 'patched';})()" >/dev/null 2>&1
ev "(()=>{
  const btn=document.querySelector('[data-testid=\"teacher-detail-csv\"]');
  if(!btn)return 'NO-CSV-BTN'; btn.click(); return 'csv-clicked';})()" >/dev/null 2>&1
sleep 2
ev "(()=>{
  const c=window.__cap;
  if(!c)return 'NO-CAPTURE';
  const lines=c.split('\r\n');
  const nonEmpty=lines.filter(l=>l.length>0);
  // سلولِ عددیِ خالص فقط ASCII — ۲ِ برندِ عنوان متن است نه داده
  let badNum=null;
  for(const line of nonEmpty){for(const cell of line.split(',')){if(/^[\d\u06F0-\u06F9]+$/.test(cell)&&!/^\d+$/.test(cell)){badNum=cell;break;}}if(badNum)break;}
  return JSON.stringify({
    blobBytes:window.__bytes,
    bom:window.__bom,
    title:nonEmpty[0],
    summaryHeader:nonEmpty[1],
    summaryRow:nonEmpty[2],
    trendTitle:nonEmpty.indexOf('روندِ 14 روز')>=0?'TREND-OK':'MISS',
    lessonsTitle:nonEmpty.indexOf('پوششِ درسها')>=0?'LESSONS-OK':'MISS',
    skillsTitle:nonEmpty.indexOf('مهارتها — ضعیفترینِ اول')>=0?'SKILLS-OK':'MISS',
    recentTitle:nonEmpty.indexOf('آخرین تلاشها')>=0?'RECENT-OK':'MISS',
    dataRows:nonEmpty.length,
    badNumCell:badNum||'ASCII-OK',
    noUserId:c.includes('userId')?'LEAK!':'CLEAN',
    noSecret:c.includes('secret')?'LEAK!':'CLEAN',
    head:nonEmpty.slice(0,6).join(' || ').slice(0,220)
  });
})()" | tee -a "$OUT"

echo "########## F) EventDay — teacher_learner_csv=1" | tee -a "$OUT"
curl -s "$BASE/api/event" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{const j=JSON.parse(s);const a=(j.events||[]).find(e=>e.name==='teacher_learner_csv');const b=(j.events||[]).find(e=>e.name==='teacher_detail');console.log('TEACHER_LEARNER_CSV='+(a?a.total:'MISS')+' TEACHER_DETAIL='+(b?b.total:'MISS'));})" | tee -a "$OUT"

echo "########## G) تیره — دیالوگ با دو دکمهٔ آیکنی" | tee -a "$OUT"
agent-browser eval "(()=>{document.documentElement.classList.add('dark');return 'dark-on';})()" >/dev/null 2>&1
sleep 1
shot r354-dialog-dark.png
agent-browser eval "(()=>{document.documentElement.classList.remove('dark');return 'dark-off';})()" >/dev/null 2>&1

agent-browser close >/dev/null 2>&1
echo "########## DONE" | tee -a "$OUT"
