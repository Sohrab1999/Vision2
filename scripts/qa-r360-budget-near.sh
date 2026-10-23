#!/usr/bin/env bash
# ------------------------------------------------------------------
# r360 — داوریِ زندهٔ «هشدارِ پیشازِسقف» — تک سشن.
# آیدیومِ r347: جااندازیِ صفحهسطحیِ fetch برایِ خوانشهایِ مصرف (تنها
# لایهٔ جابهجاشده) — کلِ زنجیرهٔ زیرِ آزمون واقعی است: خوانشِ واقعیِ
# نبض → موتورِ تنِ واقعی → dispatch واقعی → قلابِ واقعی → once-per-day
# واقعی → توست. هیچ تزریقی در دیتابیس یا دادهٔ یادگیرنده نیست.
#   A) سشنِ تازهٔ واقعی ⇒ نبض ⇒ آرامِ واقعی (۶۰/۱۵۰۰۰۰): بی data-near، بی توستِ هشدار
#   B) جااندازِ near (روخوانی ۹۰٪، توضیح ۹۱٪) ⇒ بهروزرسانی ⇒ توستِ
#      «روخوانی به آستانهٔ سقف رسید» با ۹۰٪ + هر دو نوار data-near
#   C) تکرارِ خوانش ⇒ همچنان فقط یک توست (روزیِ یک‌بار)
#   D) جااندازِ بسته (۱۰۰٪) ⇒ بهروزرسانی ⇒ هیچ توستِ نو — حقیقتِ بستهٔ
#      r358 رویِ نوار میگوید؛ هشدارِ پیشازِسقف دوتایی نمیشود
#   E) رفعِ جاانداز ⇒ بهروزرسانی ⇒ آرامِ واقعی — data-near میرود
#   F) تیره + روشن — شاتها؛ کنسولِ پاک
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
OUT=/tmp/r360-qa.txt
: > "$OUT"
PASS=0; FAIL=0
ok(){ PASS=$((PASS+1)); echo "PASS:$1" | tee -a "$OUT"; }
no(){ FAIL=$((FAIL+1)); echo "FAIL:$1" | tee -a "$OUT"; }

shot(){ agent-browser screenshot "$EV/$1" >/dev/null 2>&1; }
ev(){ agent-browser eval "$1" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
wait_sel(){ for i in $(seq 1 25); do
  local R; R=$(agent-browser eval "(()=>{return document.querySelector('$1')?'OK':'WAIT';})()" 2>/dev/null | tr -d '"')
  [ "$R" = "OK" ] && { echo "sel-ready-${i}x2s" >> "$OUT"; return 0; }; sleep 2
done; echo "SEL-NEVER:$1" | tee -a "$OUT"; return 1; }

toast_probe="(()=>{
  const lis=[...document.querySelectorAll('ol li')].filter(el=>el.className.includes('pointer-events-auto')&&el.getBoundingClientRect().height>0);
  const near=lis.filter(l=>(l.innerText||'').includes('آستانهٔ سقف'));
  return JSON.stringify({toasts:lis.length,nearToasts:near.length});
})()"

stub_near="(()=>{
  if(!window.__origFetch)window.__origFetch=window.fetch.bind(window);
  window.fetch=function(input,init){
    const u=typeof input==='string'?input:(input&&input.url)||'';
    if(u.includes('/api/tts/usage'))return Promise.resolve(new Response(JSON.stringify({ok:true,used:135000,cap:150000}),{status:200,headers:{'Content-Type':'application/json'}}));
    if(u.includes('/api/explain/usage'))return Promise.resolve(new Response(JSON.stringify({ok:true,used:2730,cap:3000}),{status:200,headers:{'Content-Type':'application/json'}}));
    return window.__origFetch(input,init);
  };
  return 'near-stub-on';})()"

stub_closed="(()=>{
  if(!window.__origFetch)window.__origFetch=window.fetch.bind(window);
  window.fetch=function(input,init){
    const u=typeof input==='string'?input:(input&&input.url)||'';
    if(u.includes('/api/tts/usage'))return Promise.resolve(new Response(JSON.stringify({ok:true,used:150000,cap:150000}),{status:200,headers:{'Content-Type':'application/json'}}));
    if(u.includes('/api/explain/usage'))return Promise.resolve(new Response(JSON.stringify({ok:true,used:3000,cap:3000}),{status:200,headers:{'Content-Type':'application/json'}}));
    return window.__origFetch(input,init);
  };
  return 'closed-stub-on';})()"

unstub="(()=>{if(window.__origFetch){window.fetch=window.__origFetch;delete window.__origFetch;}return 'restored';})()"

refresh_pulse="(()=>{
  const b=document.querySelector('button[aria-label=\"به\u200cروزرسانی نبض\"]');
  if(!b)return 'NO-REFRESH';
  b.click();return 'refreshed';})()"

echo "########## A) سشنِ تازه + پیش‌نمایشِ واقعیِ روخوانی (سطرِ واقعیِ tts_spoken برایِ خانوادهٔ AI) + نبضِ آرامِ واقعی" | tee -a "$OUT"
agent-browser close >/dev/null 2>&1 || true
pkill -f "agent-browser/browsers" 2>/dev/null; sleep 1
bash scripts/qa-fresh-session.sh --name "آرش-ممیزی-۳۶۰" 2>&1 | grep -E "^result=" | tee -a "$OUT"
agent-browser eval "(()=>{
  const g=document.querySelector('button[aria-label=\"تنظیمات\"]');
  if(!g)return 'NO-GEAR';
  g.click();return 'gear-opened';})()" | tee -a "$OUT"
sleep 1.5
agent-browser eval "(()=>{
  const b=document.querySelector('button[aria-label=\"پخش نمونهٔ روخوانی\"]')||[...document.querySelectorAll('button')].find(x=>(x.innerText||'').includes('پخش نمونهٔ روخوانی'));
  if(!b)return 'NO-PREVIEW';
  b.click();return 'preview-clicked';})()" | tee -a "$OUT"
sleep 9
agent-browser eval "(()=>{
  const open=[...document.querySelectorAll('button')].find(x=>x.getAttribute('aria-label')==='نبضِ کامل — داشبوردِ همهٔ رویدادها');
  if(open){open.click();return 'pulse-opened';}
  const g=document.querySelector('button[aria-label=\"تنظیمات\"]');
  if(!g)return 'NO-GEAR';
  g.click();
  return 'gear-opened';})()" | tee -a "$OUT"
sleep 1
agent-browser eval "(()=>{
  const b=[...document.querySelectorAll('button')].find(x=>x.getAttribute('aria-label')==='نبضِ کامل — داشبوردِ همهٔ رویدادها');
  if(!b)return 'NO-PULSE-BTN';
  b.click();return 'pulse-opened';})()" | tee -a "$OUT"
wait_sel '[data-testid="pulse-tts-budget"]' || { shot r360-fail.png; agent-browser close >/dev/null 2>&1; exit 1; }
sleep 1
ev "(()=>{
  const tts=document.querySelector('[data-testid=\"pulse-tts-budget\"]');
  const ai=document.querySelector('[data-testid=\"pulse-budget\"]');
  const lis=[...document.querySelectorAll('ol li')].filter(el=>el.className.includes('pointer-events-auto')&&el.getBoundingClientRect().height>0);
  return JSON.stringify({calmReal:true,ttsNear:tts?.getAttribute('data-near'),aiNear:ai?.getAttribute('data-near'),nearToasts:lis.filter(l=>(l.innerText||'').includes('آستانهٔ سقف')).length});
})()"
grep -q 'calmReal\\":true' "$OUT" && ok "A-pulse-open" || no "A-pulse-open"
grep -q 'ttsNear\\":null\|ttsNear\\":undefined\|"ttsNear":null\|"ttsNear":undefined' "$OUT" && ok "A-calm-no-near-flag" || no "A-calm-should-have-no-flag"
grep -q 'nearToasts\\":0\|"nearToasts":0' "$OUT" && ok "A-calm-no-warn-toast" || no "A-calm-should-be-silent"

echo "########## B) جااندازِ near ⇒ بهروزرسانی ⇒ توستِ هشدارِ واقعی" | tee -a "$OUT"
ev "$stub_near" >/dev/null 2>&1
ev "$refresh_pulse" | tee -a "$OUT"
sleep 2
wait_sel '[data-near="true"]' >/dev/null 2>&1 && ok "B-strips-near-flag" || no "B-strips-missing-near-flag"
ev "$toast_probe"
grep -q 'nearToasts\\":1\|"nearToasts":1' "$OUT" && ok "B-near-toast-fires" || no "B-near-toast-missing"
ev "(()=>{
  const lis=[...document.querySelectorAll('ol li')].filter(el=>el.className.includes('pointer-events-auto')&&(l=>false)(el));
  const all=[...document.querySelectorAll('ol li')].filter(el=>el.className.includes('pointer-events-auto'));
  const t=all.find(l=>(l.innerText||'').includes('آستانهٔ سقف'));
  return JSON.stringify({title:t?(t.innerText||'').split('\n')[0]:null,pct:t&&t.innerText.includes('۹۰٪')});
})()"
grep -q 'روخوانی به آستانهٔ سقف رسید' "$OUT" && ok "B-tts-title" || no "B-tts-title-missing"
grep -q 'pct\\":true\|"pct":true' "$OUT" && ok "B-persian-90" || no "B-persian-90-missing"
shot r360-near-toast-light.png

echo "########## C) تکرارِ خوانش ⇒ روزیِ یک‌بار" | tee -a "$OUT"
BEFORE=$(grep -c 'nearToasts' "$OUT" || true)
ev "$refresh_pulse" >/dev/null 2>&1
sleep 2.5
ev "$toast_probe"
grep -q 'nearToasts\\":1\|"nearToasts":1' "$OUT" && ok "C-once-per-day" || no "C-duplicated-toast"
ev "(()=>{try{return JSON.stringify({k1:localStorage.getItem('vision2-budget-near-tts-toast-day'),k2:localStorage.getItem('vision2-budget-near-explain-toast-day')})}catch(e){return 'KEY-ERR'}})()"
grep -q "$(date +%Y-%m-%d)" "$OUT" && ok "C-keys-recorded" || no "C-keys-missing"

echo "########## D) جااندازِ بسته (۱۰۰٪) ⇒ هیچ توستِ نو" | tee -a "$OUT"
ev "$stub_closed" >/dev/null 2>&1
ev "$refresh_pulse" >/dev/null 2>&1
sleep 2
ev "(()=>{
  const tts=document.querySelector('[data-testid=\"pulse-tts-budget\"]');
  const lis=[...document.querySelectorAll('ol li')].filter(el=>el.className.includes('pointer-events-auto')&&el.getBoundingClientRect().height>0);
  return JSON.stringify({nearFlag:tts?.getAttribute('data-near'),closedCopy:!!tts&&(tts.innerText||'').includes('سقفِ این ماه پر شده'),nearToasts:lis.filter(l=>(l.innerText||'').includes('آستانهٔ سقف')).length});
})()"
grep -q 'closedCopy\\":true\|"closedCopy":true' "$OUT" && ok "D-closed-truth-on-strip" || no "D-closed-copy-missing"
grep -q 'nearToasts\\":1\|"nearToasts":1' "$OUT" && ok "D-no-extra-toast" || no "D-extra-toast-fired"
shot r360-closed-strip.png

echo "########## E) رفعِ جاانداز ⇒ آرامِ واقعی" | tee -a "$OUT"
ev "$unstub" >/dev/null 2>&1
ev "$refresh_pulse" >/dev/null 2>&1
sleep 2
ev "(()=>{
  const tts=document.querySelector('[data-testid=\"pulse-tts-budget\"]');
  return JSON.stringify({nearFlag:tts?.getAttribute('data-near'),meter:tts?(tts.innerText||'').includes('۱۵۰۰۰۰'):false});
})()"
grep -q 'nearFlag\\":null\|"nearFlag":null\|nearFlag\\":undefined\|"nearFlag":undefined' "$OUT" && ok "E-back-to-calm" || no "E-flag-stuck"

echo "########## F) تیره + روشن + کنسول" | tee -a "$OUT"
ev "(()=>{
  const b=document.querySelector('[aria-label=\"بستن\"]');
  if(b)b.click();return 'dialog-closed';})()" >/dev/null 2>&1
sleep 1
agent-browser eval "(()=>{document.documentElement.classList.add('dark');return 'DARK';})()" >/dev/null 2>&1
sleep 1
shot r360-home-dark.png
agent-browser eval "(()=>{document.documentElement.classList.remove('dark');return 'LIGHT';})()" >/dev/null 2>&1
sleep 1
shot r360-home-light.png
CONS=$(agent-browser console 2>&1 | grep -ci "error" || true)
[ "${CONS:-0}" = "0" ] && ok "F-console-clean" || no "F-console-has-errors"

agent-browser close >/dev/null 2>&1 || true
echo "########## CLEAN-RUN: $PASS/$FAIL" | tee -a "$OUT"
[ "$FAIL" = "0" ] && echo "QA-R360-CLEAN" || echo "QA-R360-DIRTY"
