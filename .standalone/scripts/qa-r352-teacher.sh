#!/usr/bin/env bash
# ------------------------------------------------------------------
# r352 — داوریِ زندهٔ «پنلِ معلم». تک سشن:
#   A) خانه — seedِ پرسونا (آرش-قهرمان)
#   B) تنظیمات ⇒ «فهرستِ کلاس» ⇒ گیتِ کد (input password)
#   C) کدِ غلط ⇒ خطایِ صادقِ 403 با retry (جبرانپذیر)
#   D) کدِ درست ⇒ فهرستِ زنده: کارتها (۶۱/۲/۲۵٪)، ردیفهای «—»دارِ
#      بیتلاش، «همین حالا»های فعال — با دادهٔ واقعیِ سرور
#   E) دانلودِ روزنامهٔ کلاس ⇒ توست + EventDay teacher_csv=1
#   F) تیره: گیت و پنل
#   G) فازِ دوم (بیرونِ سشن): ریاستارتِ بی‌کد ⇒ «پنل معلم فعال نیست»
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
DIR=/home/z/my-project/scripts
OUT=/tmp/r352-qa.txt
: > "$OUT"

shot(){ agent-browser screenshot "$EV/$1" >/dev/null 2>&1; }
ev(){ agent-browser eval "$1" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
wait_home(){ for i in $(seq 1 30); do
  local R; R=$(agent-browser eval "(()=>{const g=document.querySelector('[aria-label=\"ابزارهای یادگیری\"]');return g?'HOME-OK':'WAIT';})()" 2>/dev/null | tr -d '"')
  [ "$R" = "HOME-OK" ] && { echo "home-ready-${i}x3s" >> "$OUT"; return 0; }; sleep 3
done; echo "HOME-NEVER" | tee -a "$OUT"; return 1; }

echo "########## A) خانه — seed" | tee -a "$OUT"
agent-browser close >/dev/null 2>&1 || true
pkill -f "agent-browser/browsers" 2>/dev/null; sleep 1
agent-browser open "$BASE" >/dev/null 2>&1
agent-browser set viewport 1280 900 >/dev/null 2>&1
agent-browser wait 'body' >/dev/null 2>&1 || true
sleep 2
node "$DIR/r338-persona.js" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>process.stdout.write(JSON.parse(s).browserEval))" > /tmp/r352-seed-eval.js || { echo "PERSONA-FAIL" | tee -a "$OUT"; agent-browser close >/dev/null 2>&1; exit 1; }
wait_home || { agent-browser close >/dev/null 2>&1; exit 1; }
agent-browser eval "$(cat /tmp/r352-seed-eval.js)" >/dev/null 2>&1
sleep 5
agent-browser eval "(()=>{document.documentElement.classList.remove('dark');return 1;})()" >/dev/null 2>&1

echo "########## B) تنظیمات ⇒ فهرستِ کلاس ⇒ گیت" | tee -a "$OUT"
ev "(()=>{
  const gear=document.querySelector('[aria-label=\"تنظیمات\"]');
  if(!gear)return 'NO-GEAR'; gear.click(); return 'gear-opened';})()" >/dev/null 2>&1
sleep 1.5
ev "(()=>{
  const b=[...document.querySelectorAll('button')].find(x=>x.getAttribute('aria-label')==='گشودن پنل معلم — فهرست کلاس');
  if(!b)return 'NO-TEACHER-BTN'; b.click(); return 'teacher-opened';})()" >/dev/null 2>&1
sleep 2.5
ev "(()=>{
  const gate=document.querySelector('[data-testid=\"teacher-gate\"]');
  const inp=document.querySelector('[data-testid=\"teacher-code-input\"]');
  return JSON.stringify({gate: gate?'GATE-OK':'GATE-MISS', inputType: inp? inp.getAttribute('type'):'-'});
})()"
shot r352-teacher-gate.png

echo "########## C) کدِ غلط ⇒ خطایِ صادق" | tee -a "$OUT"
ev "(()=>{
  const inp=document.querySelector('[data-testid=\"teacher-code-input\"]');
  const setter=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
  setter.call(inp,'wrong-code'); inp.dispatchEvent(new Event('input',{bubbles:true}));
  const form=inp.closest('form');
  form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));
  return 'submitted-wrong';})()" >/dev/null 2>&1
sleep 1.5
ev "(()=>{
  const err=document.querySelector('[data-testid=\"teacher-auth-error\"]');
  return err? 'AUTH-ERROR-OK: '+err.innerText.trim() : 'NO-AUTH-ERROR';
})()"

echo "########## D) کدِ درست ⇒ فهرستِ زنده (دادهٔ واقعی)" | tee -a "$OUT"
ev "(()=>{
  const inp=document.querySelector('[data-testid=\"teacher-code-input\"]');
  if(!inp)return 'NO-INPUT';
  const setter=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
  setter.call(inp,'moallem-1404'); inp.dispatchEvent(new Event('input',{bubbles:true}));
  inp.closest('form').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));
  return 'submitted-right';})()" >/dev/null 2>&1
sleep 3
ev "(()=>{
  const ready=document.querySelector('[data-testid=\"teacher-ready\"]');
  if(!ready)return 'NOT-READY';
  const cards=[...document.querySelectorAll('[data-testid=\"teacher-cards\"] > div')].map(c=>c.innerText.replace(/\\n/g,'|'));
  const rows=[...document.querySelectorAll('[data-testid=\"teacher-row\"]')];
  const first=rows[0]? rows[0].innerText.replace(/\\n/g,' | ').slice(0,150):'-';
  const dashRows=rows.filter(r=>r.textContent.includes('—')).length;
  return JSON.stringify({cards: cards, rows: rows.length, first: first, dashRows: dashRows});
})()"
shot r352-teacher-roster.png

echo "########## E) روزنامهٔ کلاس ⇒ توست + EventDay" | tee -a "$OUT"
ev "(()=>{
  const dl=document.querySelector('[aria-label=\"دانلود روزنامهٔ کلاس (CSV)\"]');
  if(!dl)return 'NO-CSV-BTN'; dl.click(); return 'CSV-CLICKED';})()" >/dev/null 2>&1
sleep 1.5
ev "(()=>{
  const lis=[...document.querySelectorAll('ol li')].filter(el=>el.className.includes('pointer-events-auto')&&el.getBoundingClientRect().height>0);
  const t=lis.map(l=>l.innerText).join(' § ');
  return t.includes('روزنامهٔ کلاس ذخیره شد')?'CLASS-CSV-TOAST-OK':(t||'EMPTY').slice(0,120);
})()"
ev "(async ()=>{
  const res=await fetch('/api/event',{cache:'no-store'});
  const j=await res.json();
  const t=(j.events||[]).find(e=>e.name==='teacher_csv');
  const o=(j.events||[]).find(e=>e.name==='teacher_open');
  return 'EVENTS teacher_open:'+(o? o.total:'MISS')+' teacher_csv:'+(t? t.total:'MISS');
})()"

echo "########## F) تیره — پنلِ زنده و گیت" | tee -a "$OUT"
ev "(()=>{document.documentElement.classList.add('dark');return 'dark-on';})()" >/dev/null 2>&1
sleep 1
shot r352-teacher-dark.png
ev "(()=>{document.documentElement.classList.remove('dark');return 'light-restored';})()" >/dev/null 2>&1

echo "########## G) پایشِ دو-مسیرهٔ client-errors" | tee -a "$OUT"
echo "root: $(wc -l < /home/z/my-project/client-errors.log 2>/dev/null) rows · standalone: $(wc -l < /home/z/my-project/.next/standalone/client-errors.log 2>/dev/null) rows" | tee -a "$OUT"

echo "########## DONE" | tee -a "$OUT"
agent-browser close >/dev/null 2>&1 || true
