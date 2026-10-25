#!/usr/bin/env bash
# ------------------------------------------------------------------
# r355 — داوریِ زندهٔ «هشدارِ بودجه در خانوادهٔ هوش مصنوعیِ نبض» — تک سشن:
#   A) خانه (بی persona — دادهٔ واقعیِ خودِ سرور)
#   B) مسیرِ واقعیِ توضیحِ هوشمند: قفسه ⇒ درس ⇒ تست‌ها ⇒ شروع تست ⇒
#      پاسخِ غلط تا ExplainBox ⇒ کلیکِ توضیح ⇒ تولیدِ واقعیِ ai
#      (explain_open + explain_generated واقعی + مترِ +۱)
#   C) متر: GET /api/explain/usage ⇒ used=1 (نردبانِ واقعیِ هزینه)
#   D) تنظیمات ⇒ «نبضِ کامل» ⇒ خانوادهٔ هوش مصنوعی زنده + نوارِ
#      pulse-budget با ارقامِ واقعی («۱ پرسش از ۳۰۰۰»، تنِ آرامِ بنفش)
#   E) تیره + روشن — شاتها
#   F) تازهسازی ⇒ متر دوباره خوانده میشود (نوار زنده میماند)
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
OUT=/tmp/r355-qa.txt
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
ev "(()=>{const b=document.querySelector('[data-pwa-dismiss]');if(b){b.click();return 'pwa-bubble-closed'}return 'no-bubble';})()" >/dev/null 2>&1

echo "########## B) مسیرِ واقعی: درس ← تست‌ها ← پاسخِ غلط ← توضیحِ واقعی" | tee -a "$OUT"
ev "(()=>{
  const shelf=document.querySelector('[aria-label=\"قفسهٔ کتاب\"]');
  const card=shelf?shelf.querySelector('button'):null;
  if(!card||card.getBoundingClientRect().width===0)return 'NO-LESSON-CARD';
  card.click();return 'lesson-opened';})()" | tee -a "$OUT"; echo | tee -a "$OUT"
sleep 3
ev "(()=>{
  const tab=[...document.querySelectorAll('button')].find((b)=>(b.innerText||'').trim()==='تست‌ها'&&b.getBoundingClientRect().width>0);
  if(!tab)return 'NO-TESTS-TAB';
  tab.click();return 'tests-tab-opened';})()" | tee -a "$OUT"; echo | tee -a "$OUT"
sleep 2
ev "(()=>{
  const b=[...document.querySelectorAll('button')].find((x)=>(x.innerText||'').trim()==='شروع تست'&&x.getBoundingClientRect().width>0);
  if(!b)return 'NO-START-BTN';
  b.click();return 'quiz-started';})()" | tee -a "$OUT"; echo | tee -a "$OUT"
sleep 2
# حلقه: تا دکمهٔ توضیح دیده شود — پاسخ غلط + بعد
for i in $(seq 1 14); do
  R=$(agent-browser eval "(()=>{
    const btn=[...document.querySelectorAll('button')].find((x)=>(x.innerText||'').includes('توضیح با هوش مصنوعی')&&x.getBoundingClientRect().width>0);
    if(btn)return 'EXPLAIN-REACHABLE';
    const opts=[...document.querySelectorAll('[data-quiz-option]')].filter(o=>o.getBoundingClientRect().width>0);
    if(opts.length){opts[0].click();return 'answered-'+$i;}
    return 'NO-OPTIONS';})()" 2>/dev/null | tr -d '"')
  echo "loop-$i: $R" >> "$OUT"
  case "$R" in EXPLAIN-REACHABLE) break;; NO-OPTIONS) sleep 2;; *) sleep 1.2;; esac
done
grep -q "EXPLAIN-REACHABLE" "$OUT" || { echo "EXPLAIN-NEVER-REACHED" | tee -a "$OUT"; shot r355-fail.png; agent-browser close >/dev/null 2>&1; exit 1; }
ev "(()=>{
  const btn=[...document.querySelectorAll('button')].find((x)=>(x.innerText||'').includes('توضیح با هوش مصنوعی')&&x.getBoundingClientRect().width>0);
  if(!btn)return 'NO-EXPLAIN-BTN';
  btn.click();return 'explain-clicked-real';})()" | tee -a "$OUT"; echo | tee -a "$OUT"
# انتظارِ تولیدِ واقعی — تا ۴۵ ثانیه
DONE=""
for i in $(seq 1 15); do
  sleep 3
  DONE=$(agent-browser eval "(()=>{
    const boxes=document.querySelectorAll('[data-ai-explain]');
    if(!boxes.length)return 'WAIT';
    const t=boxes[boxes.length-1].textContent||'';
    if(t.includes('توضیح هوشمند')&&t.length>40)return 'REAL-GENERATED';
    if(t.includes('در دسترس نشد'))return 'FELLBACK';
    return 'WAIT';})()" 2>/dev/null | tr -d '"')
  [ "$DONE" = "REAL-GENERATED" ] && break
  [ "$DONE" = "FELLBACK" ] && break
done
echo "explain-state: $DONE" | tee -a "$OUT"

echo "########## C) مترِ واقعی" | tee -a "$OUT"
curl -s "$BASE/api/explain/usage" | tee -a "$OUT"; echo | tee -a "$OUT"

echo "########## D) نبضِ کامل — نوارِ بودجه با دادهٔ واقعی" | tee -a "$OUT"
ev "(()=>{
  const gear=document.querySelector('[aria-label=\"تنظیمات\"]');
  if(!gear)return 'NO-GEAR'; gear.click(); return 'gear-opened';})()" >/dev/null 2>&1
sleep 1.5
ev "(()=>{
  const b=[...document.querySelectorAll('button')].find(x=>x.getAttribute('aria-label')==='نبضِ کامل — داشبوردِ همهٔ رویدادها');
  if(!b)return 'NO-PULSE-BTN'; b.click(); return 'pulse-opened';})()" | tee -a "$OUT"; echo | tee -a "$OUT"
sleep 3
ev "(()=>{
  const strip=document.querySelector('[data-testid=\"pulse-budget\"]');
  if(!strip)return 'NO-STRIP';
  const famDiv=strip.parentElement;
  const h3=famDiv&&famDiv.querySelector(':scope > div > h3');
  const rows=famDiv?famDiv.querySelectorAll('[data-testid=\"pulse-row\"]').length:0;
  const bar=strip.querySelector('div > div');
  return JSON.stringify({
    aiFamilyHeader: h3?h3.textContent:'NONE',
    familyRows: rows,
    text: strip.textContent.slice(0,160),
    calmViolet: !!(bar&&bar.className.includes('from-violet-400')),
    insideFamily: !!(h3&&h3.textContent==='هوش مصنوعی')
  });})()" | tee -a "$OUT"; echo | tee -a "$OUT"
shot r355-pulse-budget-light.png

echo "########## E) تیره" | tee -a "$OUT"
ev "(()=>{document.documentElement.classList.add('dark');return 'dark-on';})()" >/dev/null 2>&1
sleep 1
shot r355-pulse-budget-dark.png
ev "(()=>{document.documentElement.classList.remove('dark');return 'dark-off';})()" >/dev/null 2>&1

echo "########## F) تازهسازی — متر دوباره خوانده میشود" | tee -a "$OUT"
ev "(()=>{
  const r=[...document.querySelectorAll('button')].find(b=>b.getAttribute('aria-label')==='به‌روزرسانی نبض');
  if(!r)return 'NO-REFRESH'; r.click(); return 'refresh-clicked';})()" | tee -a "$OUT"; echo | tee -a "$OUT"
sleep 3
ev "(()=>{
  const strip=document.querySelector('[data-testid=\"pulse-budget\"]');
  return strip?('STRIP-ALIVE: '+strip.textContent.slice(0,80)):'STRIP-GONE';})()" | tee -a "$OUT"; echo | tee -a "$OUT"

echo "########## G) کنسول" | tee -a "$OUT"
agent-browser console 2>&1 | tail -5 | tee -a "$OUT" || true
echo "DONE r355" | tee -a "$OUT"
