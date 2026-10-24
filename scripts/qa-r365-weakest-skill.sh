#!/usr/bin/env bash
# ------------------------------------------------------------------
# r365 — داوریِ زندهٔ «ضعیفترینِ مهارت در کارنامهٔ یادگیرنده» — همزادِ
# CSVِ نخستینِ ردیفِ بخشِ مهارتها. تک سشن، بدونِ تزریق:
#   A) تنظیمات ⇒ پنلِ معلم ⇒ کدِ درست ⇒ فهرستِ زنده
#   B) نخستین ردیف ⇒ دیالوگ — چیپِ «ضعیفترین: <برچسب> · <P>٪» کنارِ
#      عنوانِ بخشِ مهارتها (data-testid=teacher-detail-weakest)
#   C) سه‌سویِ حقیقت: گزارشِ سرور (curl — bySkill[0]) ↔ چیپِ دیالوگ
#      (ارقامِ فارسی) ↔ سطرِ CSV (ASCII) — هر سه از یک bySkill
#   D) شکارِ بایتیِ CSVِ کارنامه: سطرِ «ضعیفترینِ مهارت» بعد از
#      «پرکارترینِ روز» و قبل از جداکنندهٔ روند
#   E) دفترِ کامل: کارنامهٔ درونش سطر را دارد (قرضِ بایت‌به‌بایت)
#   F) EventDay + تیره + کنسولِ پاک
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
OUT=/tmp/r365-qa.txt
: > "$OUT"

shot(){ agent-browser screenshot "$EV/$1" >/dev/null 2>&1; }
ev(){ agent-browser eval "$1" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
fa_num(){ node -e "const n=parseInt(process.argv[1],10);console.log(String(n).replace(/\d/g,d=>'۰۱۲۳۴۵۶۷۸۹'[d]))" "$1"; }

echo "########## A) پنلِ معلم با کدِ واقعی" | tee -a "$OUT"
agent-browser close >/dev/null 2>&1 || true
pkill -f "agent-browser/browsers" 2>/dev/null; sleep 1
agent-browser open "$BASE" >/dev/null 2>&1
agent-browser set viewport 1280 900 >/dev/null 2>&1
agent-browser wait 'body' >/dev/null 2>&1 || true
for i in $(seq 1 30); do
  R=$(agent-browser eval "(()=>{const g=document.querySelector('[aria-label=\"ابزارهای یادگیری\"]');return g?'HOME-OK':'WAIT';})()" 2>/dev/null | tr -d '"')
  [ "$R" = "HOME-OK" ] && { echo "home-ready-${i}x3s" >> "$OUT"; break; }; sleep 3
done
agent-browser eval "(()=>{document.documentElement.classList.remove('dark');return 1;})()" >/dev/null 2>&1
ev "(()=>{
  const gear=document.querySelector('[aria-label=\"تنظیمات\"]');
  if(!gear)return 'NO-GEAR'; gear.click(); return 'gear-opened';})()" >/dev/null 2>&1
# دکمهٔ معلم — پاپاورِ سرد ممکن است دیر mount شود؛ تا ۱۵ ثانیه صبر
# (فقط اگر محتوایِ پاپاور بسته است دوباره باز میکند — تناوبِ باز/بسته ممنوع)
TEACHER=""
for i in $(seq 1 10); do
  sleep 1.5
  TEACHER=$(agent-browser eval "(()=>{
    const b=[...document.querySelectorAll('button')].find(x=>x.getAttribute('aria-label')==='گشودن پنل معلم — فهرست کلاس');
    if(!b)return 'NO-TEACHER-BTN'; b.click(); return 'teacher-opened';})()" 2>/dev/null | tr -d '"')
  [ "$TEACHER" = "teacher-opened" ] && break
  agent-browser eval "(()=>{
    const open=document.body.textContent.includes('فهرستِ کلاس');
    if(!open){const g=document.querySelector('[aria-label=\"تنظیمات\"]');if(g)g.click();}
    return open?'was-open':'reopened';})()" >/dev/null 2>&1
done
echo "TEACHER-BTN=$TEACHER" | tee -a "$OUT"
sleep 2.5
ev "(()=>{
  const inp=document.querySelector('[data-testid=\"teacher-code-input\"]');
  if(!inp)return 'NO-GATE';
  const setter=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
  setter.call(inp,'moallem-1404'); inp.dispatchEvent(new Event('input',{bubbles:true}));
  inp.closest('form').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));
  return 'submitted';})()" >/dev/null 2>&1
sleep 3

echo "########## B) دیالوگ — چیپِ ضعیفترین" | tee -a "$OUT"
ev "(()=>{
  const ready=document.querySelector('[data-testid=\"teacher-ready\"]');
  if(!ready)return 'NO-READY';
  const row=document.querySelector('[data-teacher-open=\"true\"]');
  if(!row)return 'NO-OPENABLE'; row.click(); return 'row-clicked';})()" | tee -a "$OUT"
sleep 3
ev "(()=>{
  const chip=document.querySelector('[data-testid=\"teacher-detail-weakest\"]');
  const skills=document.querySelector('[data-testid=\"teacher-detail-skills\"]');
  if(!chip)return skills?'NO-CHIP-BUT-SKILLS':'NO-SKILLS-AT-ALL';
  return JSON.stringify({chip:chip.textContent,title:chip.getAttribute('title'),firstRow:skills.querySelector('div.border div')?skills.textContent.slice(0,60):''});
})()" | tee -a "$OUT"
shot r365-dialog-light.png

echo "########## C) سه‌سویِ حقیقت — گزارشِ سرور" | tee -a "$OUT"
HANDLE=$(curl -s "$BASE/api/teacher/report" -H "x-teacher-code: moallem-1404" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{const j=JSON.parse(s);const r=(j.roster||[]).find(x=>x.handle);console.log(r?r.handle:'NO-HANDLE');})")
echo "HANDLE=$HANDLE" | tee -a "$OUT"
SERVER_JSON=$(curl -s "$BASE/api/teacher/learner?handle=$HANDLE" -H "x-teacher-code: moallem-1404")
echo "$SERVER_JSON" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{const j=JSON.parse(s);const bs=j.learner?.bySkill||[];const w=bs.length?bs.reduce((a,b)=>b.avgPercent<a.avgPercent||(b.avgPercent===a.avgPercent&&b.category<a.category)?b:a):null;console.log('SERVER-WEAK='+(w?w.category+' avg='+w.avgPercent+' attempts='+w.attempts:'NONE'));})" | tee -a "$OUT"
SERVER_AVG=$(echo "$SERVER_JSON" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{const j=JSON.parse(s);const bs=j.learner?.bySkill||[];const w=bs.length?bs.reduce((a,b)=>b.avgPercent<a.avgPercent||(b.avgPercent===a.avgPercent&&b.category<a.category)?b:a):null;console.log(w?w.avgPercent:'NONE');})")
if [ "$SERVER_AVG" != "NONE" ] && [ -n "$SERVER_AVG" ]; then
  FA=$(fa_num "$SERVER_AVG")
  ev "(()=>{
    const chip=document.querySelector('[data-testid=\"teacher-detail-weakest\"]');
    if(!chip)return 'NO-CHIP';
    return JSON.stringify({chipHasPersianAvg:chip.textContent.includes('$FA٪'),chipText:chip.textContent});
  })()" | tee -a "$OUT"
fi

echo "########## D) شکارِ بایتیِ CSVِ کارنامه" | tee -a "$OUT"
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
  const weakest=nonEmpty.find(l=>l.startsWith('ضعیفترینِ مهارت,'));
  const busiestIdx=nonEmpty.findIndex(l=>l.startsWith('پرکارترینِ روز,'));
  const weakestIdx=nonEmpty.findIndex(l=>l.startsWith('ضعیفترینِ مهارت,'));
  const trendIdx=nonEmpty.findIndex(l=>l.startsWith('روندِ'));
  return JSON.stringify({
    blobBytes:window.__bytes,
    bom:window.__bom,
    weakestRow:weakest||'ABSENT',
    order:weakest&&busiestIdx>=0&&weakestIdx>busiestIdx&&weakestIdx<trendIdx?'BUSIEST-THEN-WEAKEST-THEN-TREND':'ORDER-BAD('+busiestIdx+','+weakestIdx+','+trendIdx+')',
    dataRows:nonEmpty.length,
    noUserId:c.includes('userId')?'LEAK!':'CLEAN',
    noSecret:c.includes('secret')?'LEAK!':'CLEAN',
    head:nonEmpty.slice(0,6).join(' || ').slice(0,340)
  });
})()" | tee -a "$OUT"

echo "########## E) دفترِ کامل — کارنامههایِ درونش سطر را گرفتند" | tee -a "$OUT"
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
  const weakestRows=lines.filter(l=>l.startsWith('ضعیفترینِ مهارت,'));
  const classTableIdx=lines.findIndex(l=>l.startsWith('نام,رنگ'));
  return JSON.stringify({
    ledgerBytes:buf.length,
    embeddedWeakest:weakestRows[0]||'MISS',
    embeddedCount:weakestRows.length,
    afterClassTable:weakestRows.length?lines.indexOf(weakestRows[0])>classTableIdx:false,
    bomByte:(buf[0]===0xEF&&buf[1]===0xBB&&buf[2]===0xBF)?'BOM-OK':'NO-BOM'
  });
})()" | tee -a "$OUT"

echo "########## F) EventDay" | tee -a "$OUT"
curl -s "$BASE/api/event" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{const j=JSON.parse(s);const g=n=>{const e=(j.events||[]).find(x=>x.name===n);return e?e.total:'MISS';};console.log('TEACHER_DETAIL='+g('teacher_detail')+' TEACHER_LEARNER_CSV='+g('teacher_learner_csv')+' TEACHER_CLASS_CSV='+g('teacher_class_csv'));})" | tee -a "$OUT"

echo "########## G) تیره + کنسول" | tee -a "$OUT"
agent-browser eval "(()=>{document.documentElement.classList.add('dark');return 'dark-on';})()" >/dev/null 2>&1
sleep 1
shot r365-dialog-dark.png
agent-browser eval "(()=>{document.documentElement.classList.remove('dark');return 'dark-off';})()" >/dev/null 2>&1
# [درسِ r365 — خطایِ مثبتِ کاذبِ pipefail]: exitِ غیرصفرِ خودِ `console`
# کلِ خط لوله را خراب میکرد و grepِ یابندهٔ خطا خاموش میماند — CLEANهای
# کاذبِ r363/r364 از همینجا بود. نخست بگیر، بعد قضاوت کن (خروجیِ جدا).
CONSOLE_OUT=$(agent-browser console 2>&1 || true)
echo "$CONSOLE_OUT" | tee -a "$OUT" | grep -v "Download the React DevTools" > /tmp/r365-console-filtered.txt
if grep -qiE "error|warn" /tmp/r365-console-filtered.txt; then
  echo "CONSOLE-DIRTY" | tee -a "$OUT"; agent-browser close >/dev/null 2>&1; exit 1
fi
echo "CONSOLE-CLEAN" | tee -a "$OUT"

echo "########## CLEAN-RUN" | tee -a "$OUT"
agent-browser close >/dev/null 2>&1 || true
echo "r365 QA DONE — ضعیفترینِ مهارت در هر سه سطح همزبان شد" | tee -a "$OUT"
