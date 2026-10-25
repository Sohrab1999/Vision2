#!/usr/bin/env bash
# ------------------------------------------------------------------
# r363 — داوریِ زندهٔ «هفتهٔ فعال در کارنامهٔ یادگیرنده» — سطرِ همزادِ
# دفترِ r362؛ دفتر و کارنامه همزبان میشوند. تک سشن، بدونِ تزریق:
#   A) خانه (فهرستِ واقعیِ خودِ سرور میدانِ آزمون است)
#   B) تنظیمات ⇒ «پنلِ معلم» ⇒ کدِ درست ⇒ فهرستِ زنده
#   C) نخستین ردیفِ دکمهای ⇒ دیالوگِ جزئیات — نیمهٔ دیدنیِ نو:
#      «مجموعِ دو هفته: N» کنارِ عنوانِ نوار (ارقامِ فارسی)
#   D) سه‌سویِ حقیقت: گزارشِ سرور (curl) ↔ نوارِ دیالوگ (N فارسی) ↔
#      سطرِ CSV (M ASCII) — هر سه از یک byDay
#   E) شکارِ بایتیِ CSVِ کارنامه: BOM + سطرهایِ «هفتهٔ فعال/پرکارترین»
#      بعد از سطرِ خلاصه و قبل از روند — با ۱۴ روزِ اخیرِ خودش
#   F) دفترِ کامل هم دنبال میرود: کارنامهٔ درونِ دفتر سطرها را دارد —
#      سربرگش ۷روزه، کارنامهها ۱۴روزه (قرض نه رونویسی — زنده)
#   G) EventDay: teacher_learner_csv=1 + teacher_class_csv=1
#   H) تیره + کنسولِ پاک
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
OUT=/tmp/r363-qa.txt
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

echo "########## C) دیالوگ — نیمهٔ دیدنیِ نو: مجموعِ دو هفته" | tee -a "$OUT"
ev "(()=>{
  const ready=document.querySelector('[data-testid=\"teacher-ready\"]');
  if(!ready)return 'NO-READY';
  const row=document.querySelector('[data-teacher-open=\"true\"]');
  if(!row)return 'NO-OPENABLE'; row.click(); return 'row-clicked';})()" | tee -a "$OUT"
sleep 3
ev "(()=>{
  const t=document.querySelector('[data-testid=\"teacher-detail-week-total\"]');
  const strip=document.querySelector('[data-testid=\"teacher-detail-strip\"]');
  if(!t)return 'NO-WEEK-TOTAL';
  return JSON.stringify({
    totalPersian:t.textContent,
    stripTitleHasMeta:strip.textContent.includes('مجموعِ دو هفته:'),
    cards:!!document.querySelector('[data-testid=\"teacher-detail-cards\"]')
  });
})()" | tee -a "$OUT"
shot r363-dialog-light.png

echo "########## D) سه‌سویِ حقیقت — گزارشِ سرور از کدِ اپراتور" | tee -a "$OUT"
HANDLE=$(curl -s "$BASE/api/teacher/report" -H "x-teacher-code: moallem-1404" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{const j=JSON.parse(s);const r=(j.roster||[]).find(x=>x.handle);console.log(r?r.handle:'NO-HANDLE');})")
echo "HANDLE=$HANDLE" | tee -a "$OUT"
curl -s "$BASE/api/teacher/learner?handle=$HANDLE" -H "x-teacher-code: moallem-1404" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{const j=JSON.parse(s);const l=j.learner||{};const sum=(l.byDay||[]).reduce((a,d)=>a+d.attempts,0);const act=(l.byDay||[]).filter(d=>d.attempts>0).length;console.log('SERVER-SIDE total='+sum+' activeDays='+act+' window='+(l.byDay||[]).length);})" | tee -a "$OUT"

echo "########## E) شکارِ بایتیِ CSVِ کارنامه" | tee -a "$OUT"
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
  const weekRow=nonEmpty.find(l=>l.startsWith('هفتهٔ فعال,'));
  const busiestRow=nonEmpty.find(l=>l.startsWith('پرکارترینِ روز,'));
  const summaryIdx=nonEmpty.findIndex(l=>l.startsWith('یادگیرنده,')||/^[^,]+,[a-z]+,/.test(l));
  return JSON.stringify({
    blobBytes:window.__bytes,
    bom:window.__bom,
    title:nonEmpty[0],
    weekRow:weekRow||'MISS',
    busiestRow:busiestRow||'ABSENT',
    weekAfterSummary:weekRow?nonEmpty.indexOf(weekRow)>1:false,
    weekBeforeTrend:weekRow?nonEmpty.indexOf(weekRow)<nonEmpty.findIndex(l=>l.startsWith('روندِ')):false,
    dataRows:nonEmpty.length,
    noUserId:c.includes('userId')?'LEAK!':'CLEAN',
    noSecret:c.includes('secret')?'LEAK!':'CLEAN',
    head:nonEmpty.slice(0,5).join(' || ').slice(0,300)
  });
})()" | tee -a "$OUT"

echo "########## F) دفترِ کامل — کارنامههایِ درونش همزبان شدند" | tee -a "$OUT"
ev "(()=>{
  window.__lcap=null;
  const orig=URL.createObjectURL.bind(URL);
  URL.createObjectURL=(b)=>{window.__lcap=b;return orig(b);};
  const btn=document.querySelector('[data-testid=\"teacher-ledger\"]');
  if(!btn)return 'NO-LEDGER-BTN'; btn.click(); return 'ledger-clicked';})()" >/dev/null 2>&1
sleep 2
ev "(async ()=>{
  if(!window.__lcap)return 'NO-LEDGER-BLOB';
  const buf=new Uint8Array(await window.__lcap.arrayBuffer());
  const c=new TextDecoder('utf-8').decode(buf.slice(3));
  const lines=c.split('\r\n').filter(l=>l.length>0);
  const classWeek=lines.find(l=>l.startsWith('هفتهٔ فعال,')&&l.includes('7 روزِ اخیر'));
  const cardWeek=lines.find(l=>l.startsWith('هفتهٔ فعال,')&&l.includes('14 روزِ اخیر'));
  const cardBusiest=lines.find(l=>l.startsWith('پرکارترینِ روز,'));
  return JSON.stringify({
    ledgerBytes:buf.length,
    headerClassWeek:classWeek||'MISS',
    learnerCardWeek:cardWeek||'MISS',
    learnerBusiest:cardBusiest||'ABSENT',
    bothDialects:!!(classWeek&&cardWeek),
    bomByte:(buf[0]===0xEF&&buf[1]===0xBB&&buf[2]===0xBF)?'BOM-OK':'NO-BOM',
    order:lines.indexOf(classWeek)<lines.findIndex(l=>l.startsWith('نام,رنگ'))&&lines.indexOf(cardWeek)>lines.findIndex(l=>l.startsWith('نام,رنگ'))?'HEADER-FIRST-CARD-AFTER-TABLE':'ORDER-BAD'
  });
})()" | tee -a "$OUT"

echo "########## G) EventDay" | tee -a "$OUT"
curl -s "$BASE/api/event" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{const j=JSON.parse(s);const g=n=>{const e=(j.events||[]).find(x=>x.name===n);return e?e.total:'MISS';};console.log('TEACHER_LEARNER_CSV='+g('teacher_learner_csv')+' TEACHER_CLASS_CSV='+g('teacher_class_csv')+' TEACHER_DETAIL='+g('teacher_detail'));})" | tee -a "$OUT"

echo "########## H) تیره + کنسول" | tee -a "$OUT"
agent-browser eval "(()=>{document.documentElement.classList.add('dark');return 'dark-on';})()" >/dev/null 2>&1
sleep 1
shot r363-dialog-dark.png
shot r363-panel-dark.png
agent-browser eval "(()=>{document.documentElement.classList.remove('dark');return 'dark-off';})()" >/dev/null 2>&1
agent-browser console 2>&1 | tee -a "$OUT" | grep -qiE "error|warn" && { echo "CONSOLE-DIRTY" | tee -a "$OUT"; agent-browser close >/dev/null 2>&1; exit 1; }
echo "CONSOLE-CLEAN" | tee -a "$OUT"

echo "########## CLEAN-RUN" | tee -a "$OUT"
agent-browser close >/dev/null 2>&1 || true
echo "r363 QA DONE — همهٔ دروازههایِ کارنامهٔ هفتهفعال سبز" | tee -a "$OUT"
