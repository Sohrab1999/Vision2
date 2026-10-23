#!/usr/bin/env bash
# ------------------------------------------------------------------
# r351 — داوریِ زندهٔ «برجِ بیدار» + «دفترِ سی‌روزهٔ نبض». تک سشن:
#   A) خانه — seedِ پرسونا (آرش-قهرمان)
#   B) کنترلِ منفی: آخرین نانِ خطا کهنه است (عصرِ r346) ⇒ نقطهٔ برج
#      غایب + titleِ سادهٔ تنظیمات
#   C) تزریقِ نانِ تازه (POST واقعیِ /api/client-error — همان قراردادِ
#      keepalive) ⇒ ریلود ⇒ نقطهٔ کهربایی + titleِ ارتقایافته
#   D) دیالوگِ نبض: کارتِ کهرباییِ برج با نانِ تازه (کلاینت→JSONL→برج،
#      انتها-به-انتها) + دکمهٔ دانلود ⇒ توستِ «دفترِ سی‌روزهٔ نبض ذخیره شد»
#   E) ردیابی: EventDay حالا pulse_csv=1 دارد (کلاینت→/api/event)
#   F) تیره: نقطه و دیالوگ رویِ کرنلِ dark
#   G) پایشِ دو-مسیرهٔ client-errors (روالِ ثابتِ r346-②)
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
DIR=/home/z/my-project/scripts
OUT=/tmp/r351-qa.txt
: > "$OUT"

shot(){ agent-browser screenshot "$EV/$1" >/dev/null 2>&1; }
ev(){ agent-browser eval "$1" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
wait_home(){ for i in $(seq 1 30); do
  local R; R=$(agent-browser eval "(()=>{const g=document.querySelector('[aria-label=\"ابزارهای یادگیری\"]');return g?'HOME-OK':'WAIT';})()" 2>/dev/null | tr -d '"')
  [ "$R" = "HOME-OK" ] && { echo "home-ready-${i}x3s" >> "$OUT"; return 0; }; sleep 3
done; echo "HOME-NEVER" | tee -a "$OUT"; return 1; }
seed_guard(){ local R; R=$(agent-browser eval "(()=>{const t=document.body.innerText||'';const hasName=t.includes('آرش-قهرمان');const hasGrid=!!document.querySelector('[aria-label=\"ابزارهای یادگیری\"]');return (hasName&&hasGrid)?'SEED-OK':'SEED-MISS';})()" 2>/dev/null | tr -d '"')
  echo "-- [seed-guard] $R" | tee -a "$OUT"; [ "$R" = "SEED-OK" ]; }

echo "########## A) خانه — seed" | tee -a "$OUT"
agent-browser close >/dev/null 2>&1 || true
pkill -f "agent-browser/browsers" 2>/dev/null; sleep 1
agent-browser open "$BASE" >/dev/null 2>&1
agent-browser set viewport 1280 900 >/dev/null 2>&1
agent-browser wait 'body' >/dev/null 2>&1 || true
sleep 2
node "$DIR/r338-persona.js" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>process.stdout.write(JSON.parse(s).browserEval))" > /tmp/r351-seed-eval.js || { echo "PERSONA-FAIL" | tee -a "$OUT"; agent-browser close >/dev/null 2>&1; exit 1; }
wait_home || { agent-browser close >/dev/null 2>&1; exit 1; }
agent-browser eval "$(cat /tmp/r351-seed-eval.js)" >/dev/null 2>&1
sleep 5
seed_guard || { agent-browser close >/dev/null 2>&1; exit 1; }
agent-browser eval "(()=>{document.documentElement.classList.remove('dark');return 1;})()" >/dev/null 2>&1
sleep 3

echo "########## B) کنترلِ منفی — نانِ کهنه ⇒ بی‌نشان" | tee -a "$OUT"
ev "(()=>{
  const dot=document.querySelector('[data-testid=\"watchtower-dot\"]');
  const gear=document.querySelector('[aria-label=\"تنظیمات\"]');
  return JSON.stringify({dot: dot? 'DOT-UNEXPECTED':'DOT-ABSENT-OK', title: gear? gear.getAttribute('title'):'NO-GEAR'});
})()"

echo "########## C) نانِ تازه (POST واقعی) ⇒ ریلود ⇒ نقطهٔ کهربایی" | tee -a "$OUT"
ev "(async ()=>{
  const res = await fetch('/api/client-error', { method:'POST', headers:{'content-type':'application/json'},
    body: JSON.stringify({ kind:'boundary', message:'r351-probe — نشانِ برجِ بیدار (QA)', view:'home' }) });
  const j = await res.json().catch(()=>({}));
  return 'POST-'+res.status+' ok:'+(j.ok===true);
})()"
sleep 1
agent-browser open "$BASE" >/dev/null 2>&1
wait_home || true
sleep 3
ev "(()=>{
  const dot=document.querySelector('[data-testid=\"watchtower-dot\"]');
  const gear=document.querySelector('[aria-label=\"تنظیمات\"]');
  return JSON.stringify({dot: dot? 'DOT-FRESH-OK':'DOT-MISSING', pulse: dot? getComputedStyle(dot).backgroundColor:'-',
    title: gear? gear.getAttribute('title'):'NO-GEAR'});
})()"
shot r351-dot-light.png

echo "########## D) دیالوگِ نبض — کارتِ برج + دانلودِ دفتر" | tee -a "$OUT"
ev "(()=>{
  const gear=document.querySelector('[aria-label=\"تنظیمات\"]');
  if(!gear)return 'NO-GEAR'; gear.click(); return 'gear-opened';})()" >/dev/null 2>&1
sleep 1.5
ev "(()=>{
  const full=[...document.querySelectorAll('button')].find(b=>b.textContent.includes('نبضِ کامل'));
  if(!full)return 'NO-FULL-BTN'; full.click(); return 'full-opened';})()" >/dev/null 2>&1
sleep 2.5
ev "(()=>{
  const wt=document.querySelector('[data-testid=\"pulse-watchtower\"]');
  const amber=wt? wt.innerText.replace(/\\n/g,' | ').slice(0,180):'NO-WATCHTOWER';
  return JSON.stringify({watchtower: amber});
})()"
ev "(()=>{
  const dl=document.querySelector('[aria-label=\"دانلود دفترِ سی‌روزهٔ رویدادها (CSV)\"]');
  if(!dl)return 'NO-DL-BTN'; dl.click(); return 'DL-CLICKED';})()"
sleep 2
ev "(()=>{
  const t=[...document.querySelectorAll('[data-sonner-toast]')].map(x=>x.innerText).join(' § ');
  return JSON.stringify({toast: t.includes('دفترِ سی‌روزهٔ نبض ذخیره شد') ? 'LEDGER-TOAST-OK' : (t||'NO-TOAST').slice(0,140)});
})()"
shot r351-pulse-dialog.png

echo "########## E) ردیابیِ pulse_csv در EventDay" | tee -a "$OUT"
ev "(async ()=>{
  const res=await fetch('/api/event',{cache:'no-store'});
  const j=await res.json();
  const row=(j.events||[]).find(e=>e.name==='pulse_csv');
  return 'PULSE_CSV total:'+(row? row.total : 'MISSING')+' label:'+(row? row.label : '-');
})()"

echo "########## F) تیره — نقطه و دیالوگ" | tee -a "$OUT"
ev "(()=>{document.querySelector('[aria-label=\"تنظیمات\"]')?.click();document.documentElement.classList.add('dark');return 'dark-on';})()" >/dev/null 2>&1
sleep 1.5
shot r351-dot-dark.png
ev "(()=>{document.documentElement.classList.remove('dark');return 'light-restored';})()" >/dev/null 2>&1

echo "########## G) پایشِ دو-مسیرهٔ client-errors" | tee -a "$OUT"
echo "root: $(wc -l < /home/z/my-project/client-errors.log 2>/dev/null) rows · standalone: $(wc -l < /home/z/my-project/.next/standalone/client-errors.log 2>/dev/null) rows" | tee -a "$OUT"
tail -1 /home/z/my-project/.next/standalone/client-errors.log 2>/dev/null | head -c 220 | tee -a "$OUT"; echo | tee -a "$OUT"

echo "########## DONE" | tee -a "$OUT"
agent-browser close >/dev/null 2>&1 || true
