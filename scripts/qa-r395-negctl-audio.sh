#!/usr/bin/env bash
# ------------------------------------------------------------------
# r395 — negctlِ درمانشدهٔ صدا: استابِ پخش (بندِ ②ِ ثبتشدهٔ r394) + درسِ
#   پروبِ همین راند: «سابقِ توست» — راندهایِ r394/r345 امضایِ
#   TOAST-UNEXPECTED را در negctl داشتند و بخشی از آن «توستِ
#   بازماندهٔ» بخشِ پیش بود (طولِ عمرِ ۳۵۰۰ms از پنجرهٔ پروبِ کلیکِ
#   بعدی درازتر است) — پروبِ بیخط پایه، بازمانده را فرزندِ کلیک
#   میپندارد. درمانِ پروب: پیشِ هر کلیکِ «نبایدتوست» صحنه پاک میشود
#   (wait_toasts_clear) — پس از آن هر توستِ ظاهرشده حتماً فرزندِ
#   همین کلیک است. بقیهٔ طرح: استابِ HTMLMediaElement.prototype.play
#   «دستگاهِ سالم» را شبیهسازی میکند؛ fetch واقعی میماند (بکاند
#   زنده — curl: 200 + 45KB WAV). صحنهها:
#     C) استاب خاموش — کلیکِ سالم: امضایِ کهنه (توستِ شکست زنده) —
#        سندِ محیطِ پیش از درمان
#     D) استاب روشن — d1 همان چیپ (مسیرِ کش) + d2 چیپِ دوم (fetchِ
#        تازه، پنجرهٔ ۱۰ثانیهای) → پس از پاکسازیِ صحنه: هیچ توستِ نو
#     E) تزریقِ fetch→500 → چیپِ سومِ بکش → TOAST-HIT (مسیرِ شکست
#        زیرِ استاب پنهان نمیماند)
#     F) SpeakButton (دروازهٔ ۱۵فایله، متنِ ability — بی برخوردِ کش)
#     G) بازگردانیِ fetch → پس از پاکسازیِ توستِ F → کلیکِ سالم → ABSENT
#     H) تاریکِ درجا — شناسنامهٔ توستِ شکست (پس از پاکسازی)
#     I) «پخش کل مکالمه» با تزریق — SEQ میایستد
#   درسِ revive (بخشِ B): reopen کلِ window را میشوید — wrapper/count
#   پسِ revive دوباره نصب میشوند (r394 همینجا شمارشش گسسته بود).
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
DIR=/home/z/my-project/scripts
OUT=/tmp/r395-negctl-audio.txt
: > "$OUT"

shot(){ agent-browser screenshot "$EV/$1" >/dev/null 2>&1; }
rec(){ agent-browser eval "(()=>JSON.stringify(window.__r395rec||{}))()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
# اتمیک: کلیک با selector+اندیس + نظرسنجیِ توست تا ~۹ثانیه (انتظارِ HIT)
click_toast_q(){ agent-browser eval "(()=>{
  const sel=$1; const idx=$2||0;
  const b=[...document.querySelectorAll(sel)][idx];
  if(!b||b.getBoundingClientRect().width===0)return Promise.resolve('NO-BTN:'+sel+'#'+idx);
  b.click();
  return new Promise((res)=>{
    let n=0;
    const tick=()=>{
      const lis=[...document.querySelectorAll('ol li')].filter((el)=>el.className.includes('pointer-events-auto')&&el.getBoundingClientRect().height>0);
      if(lis.some((el)=>(el.innerText||'').includes('$3')))return res('TOAST-HIT:$3');
      if(++n>=18)return res('TOAST-TIMEOUT[$3]');
      setTimeout(tick,500);
    };
    setTimeout(tick,600);
  });
})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
# پاکسازیِ صحنه: صبر تا مرگِ همهٔ توستهایِ باز (پروبِ بیخط پایه)
wait_toasts_clear(){ agent-browser eval "(()=>new Promise((res)=>{
  let n=0;
  const tick=()=>{
    const lis=[...document.querySelectorAll('ol li')].filter((el)=>el.className.includes('pointer-events-auto')&&el.getBoundingClientRect().height>0);
    if(lis.length===0)return res('SCENE-CLEAR');
    if(++n>=14)return res('SCENE-STUCK:'+lis.length);
    setTimeout(tick,500);
  };
  tick();
}))()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
# کلیک + پاکسازی + پروبِ «نبایدتوست» — بعد از SCENE-CLEAR هر توست، فرزندِ همین کلیک است
click_expect_no_toast(){ agent-browser eval "(()=>new Promise((res)=>{
  const sel=$1; const idx=$2||0;
  const b=[...document.querySelectorAll(sel)][idx];
  if(!b||b.getBoundingClientRect().width===0)return res('NO-BTN:'+sel+'#'+idx);
  b.click();
  let n=0;
  const tick=()=>{
    const lis=[...document.querySelectorAll('ol li')].filter((el)=>el.className.includes('pointer-events-auto')&&el.getBoundingClientRect().height>0);
    if(lis.some((el)=>(el.innerText||'').includes('$3')))return res('TOAST-NEW:$3');
    if(++n>=20)return res('TOAST-ABSENT-OK');
    setTimeout(tick,500);
  };
  setTimeout(tick,600);
}))()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
tts_count_on(){ agent-browser eval "(()=>{
  if(!window.__origFetch)window.__origFetch=window.fetch.bind(window);
  if(!window.__r395rec)window.__r395rec={tts:0};
  window.fetch=function(input,init){
    const u=typeof input==='string'?input:(input&&input.url)||'';
    if(u.includes('/api/tts'))window.__r395rec.tts++;
    return window.__origFetch(input,init);
  };
  return 'tts-count-on';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
tts_fail_on(){ agent-browser eval "(()=>{
  if(!window.__origFetch)window.__origFetch=window.fetch.bind(window);
  if(!window.__r395rec)window.__r395rec={tts:0};
  window.fetch=function(input,init){
    const u=typeof input==='string'?input:(input&&input.url)||'';
    if(u.includes('/api/tts')){window.__r395rec.tts++;return Promise.resolve(new Response(JSON.stringify({error:'r395-injected'}),{status:500,headers:{'Content-Type':'application/json'}}));}
    return window.__origFetch(input,init);
  };
  return 'tts-fail-on';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
tts_restore(){ agent-browser eval "(()=>{if(window.__origFetch)window.fetch=window.__origFetch;window.__origFetch=null;return 'tts-restored';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
# ---------- قلبِ راند: استابِ پخش ----------
audio_stub_on(){ agent-browser eval "(()=>{
  if(window.__playOrig)return 'stub-already';
  window.__playOrig=HTMLMediaElement.prototype.play;
  window.__stubCount=0;
  HTMLMediaElement.prototype.play=function(){window.__stubCount++;return Promise.resolve();};
  return 'stub-on';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
audio_stub_off(){ agent-browser eval "(()=>{
  if(!window.__playOrig)return 'stub-not-on';
  HTMLMediaElement.prototype.play=window.__playOrig;
  delete window.__playOrig;
  return 'stub-off-restored';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
stub_count(){ agent-browser eval "(()=>JSON.stringify({stub:window.__stubCount||0}))()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
to_dark(){ agent-browser eval "(()=>{document.documentElement.classList.add('dark');return 1;})()" >/dev/null 2>&1; sleep 1.2; }
to_light(){ agent-browser eval "(()=>{document.documentElement.classList.remove('dark');return 1;})()" >/dev/null 2>&1; sleep 1.2; }
toast_identity(){ agent-browser eval "(()=>{const lis=[...document.querySelectorAll('ol li')].filter((el)=>el.className.includes('pointer-events-auto')&&el.getBoundingClientRect().height>0);const l=lis[0];if(!l)return 'NO-LIVE';const cs=getComputedStyle(l);return JSON.stringify({live:true,bg:cs.backgroundColor,ink:cs.color});})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
wait_home(){ for i in $(seq 1 30); do
  local R; R=$(agent-browser eval "(()=>{const g=document.querySelector('[aria-label=\"ابزارهای یادگیری\"]');return g?'HOME-OK':'WAIT';})()" 2>/dev/null | tr -d '"')
  [ "$R" = "HOME-OK" ] && { echo "home-ready-${i}x3s" >> "$OUT"; return 0; }; sleep 3
done; echo "HOME-NEVER" | tee -a "$OUT"; return 1; }
seed_guard(){ local R; R=$(agent-browser eval "(()=>{const t=document.body.innerText||'';const hasName=t.includes('آرش-قهرمان');const hasGrid=!!document.querySelector('[aria-label=\"ابزارهای یادگیری\"]');return (hasName&&hasGrid)?'SEED-OK':'SEED-MISS';})()" 2>/dev/null | tr -d '"')
  echo "-- [seed-guard] $R" | tee -a "$OUT"; [ "$R" = "SEED-OK" ]; }
ensure_alive(){
  local R; R=$(agent-browser eval "(()=>JSON.stringify({len:(document.body.innerText||'').length}))()" 2>/dev/null)
  echo "$R" | rg -q '"len"' && return 0
  echo "-- [revive] blank-browser — reopening+reseeding" | tee -a "$OUT"
  agent-browser close >/dev/null 2>&1 || true
  agent-browser open "$BASE" >/dev/null 2>&1
  agent-browser set viewport 1280 900 >/dev/null 2>&1
  wait_home || return 1
  agent-browser eval "$(cat /tmp/r395-seed-eval.js)" >/dev/null 2>&1
  sleep 5
  seed_guard || return 1
  # درسِ revive: window نو یعنی ابزارهایِ راند مردهاند — دوباره نصب
  agent-browser eval "(()=>{window.__r395rec={tts:0};return 'rec-on';})()" >/dev/null 2>&1
  tts_count_on >/dev/null 2>&1
  return 0
}

echo "########## A) خانه — seed + روشنِ ۱۲۸۰" | tee -a "$OUT"
agent-browser close >/dev/null 2>&1 || true
pkill -f "agent-browser/browsers" 2>/dev/null; sleep 1
agent-browser open "$BASE" >/dev/null 2>&1
agent-browser set viewport 1280 900 >/dev/null 2>&1
agent-browser wait 'body' >/dev/null 2>&1 || true
sleep 2
node "$DIR/r338-persona.js" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>process.stdout.write(JSON.parse(s).browserEval))" > /tmp/r395-seed-eval.js || { echo "PERSONA-FAIL" | tee -a "$OUT"; agent-browser close >/dev/null 2>&1; exit 1; }
wait_home || { agent-browser close >/dev/null 2>&1; exit 1; }
agent-browser eval "$(cat /tmp/r395-seed-eval.js)" >/dev/null 2>&1
sleep 5
seed_guard || { agent-browser close >/dev/null 2>&1; exit 1; }
agent-browser eval "(()=>{document.documentElement.classList.remove('dark');return 1;})()" >/dev/null 2>&1
agent-browser eval "(()=>{window.__r395rec={tts:0};return 'rec-on';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"
tts_count_on

echo "########## B) دیکشنری — صحنهٔ مشترکِ چیپ و دکمهٔ روخوانی" | tee -a "$OUT"
ensure_alive || { agent-browser close >/dev/null 2>&1; exit 1; }
agent-browser eval "(()=>{
  const b=[...document.querySelectorAll('button')].find((x)=>(x.innerText||'').includes('دیکشنری جستجو')&&x.getBoundingClientRect().width>0);
  if(!b)return 'NO-CARD';b.click();return 'card-clicked';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"
sleep 2.5
agent-browser eval "(()=>{const chips=[...document.querySelectorAll('[title=\"روخوانی جفت\"]')].filter((c)=>c.getBoundingClientRect().width>0);const sp=document.querySelector('[aria-label=\"روخوانی متن انگلیسی\"]');return JSON.stringify({chips:chips.length,speak:!!sp&&sp.getBoundingClientRect().width>0});})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"

echo "########## C) پیش از درمان — استاب خاموش: امضایِ کهنه (سندِ محیط)" | tee -a "$OUT"
click_toast_q "'[title=\"روخوانی جفت\"]'" 0 "پخش صدا ممکن نشد" || true
rec
echo "-- پاکسازی: توستِ C باید بمیرد تا صحنهٔ D بیخط شود" | tee -a "$OUT"
wait_toasts_clear

echo "########## D) درمان — استابِ پخش روشن: negctlِ واقعاً کنترل" | tee -a "$OUT"
audio_stub_on
echo "-- d1: همان چیپ (مسیرِ کش یا fetchِ تازه) — هیچ توستِ نو نباید بیاید" | tee -a "$OUT"
click_expect_no_toast "'[title=\"روخوانی جفت\"]'" 0 "پخش صدا ممکن نشد"
stub_count
echo "-- d2: چیپِ دوم — fetchِ تازهٔ واقعی + استاب (پنجرهٔ ۱۰ثانیهای)" | tee -a "$OUT"
click_expect_no_toast "'[title=\"روخوانی جفت\"]'" 1 "پخش صدا ممکن نشد"
stub_count
rec
shot r395-negctl-healed-light.png

echo "########## E) کنترلِ مثبت — تزریقِ fetch→500 زیرِ استاب: چیپِ سومِ بکش" | tee -a "$OUT"
tts_fail_on
click_toast_q "'[title=\"روخوانی جفت\"]'" 2 "پخش صدا ممکن نشد" || true
rec

echo "########## F) SpeakButton — دروازهٔ ۱۵فایله زیرِ استاب (متنِ ability — بی برخوردِ کش)" | tee -a "$OUT"
click_toast_q "'[aria-label=\"روخوانی متن انگلیسی\"]'" 0 "پخش صدا ممکن نشد" || true
rec

echo "########## G) بازگردانیِ fetch (استاب روشن) — پسِ پاکسازیِ توستِ F" | tee -a "$OUT"
tts_restore
tts_count_on
wait_toasts_clear
click_expect_no_toast "'[title=\"روخوانی جفت\"]'" 0 "پخش صدا ممکن نشد"
rec

echo "########## H) تاریکِ درجا — شناسنامهٔ توستِ شکست زیرِ استاب (پسِ پاکسازی)" | tee -a "$OUT"
wait_toasts_clear
to_dark
tts_fail_on
click_toast_q "'[title=\"روخوانی جفت\"]'" 2 "پخش صدا ممکن نشد" || true
toast_identity
shot r395-negctl-fail-dark.png
tts_restore
tts_count_on
to_light

echo "########## I) مکالمه — «پخش کل مکالمه» با تزریق زیرِ استاب: توالی میایستد" | tee -a "$OUT"
ensure_alive || { agent-browser close >/dev/null 2>&1; exit 1; }
agent-browser eval "(()=>{
  const sp=[...document.querySelectorAll('.book-spine .en-text')].find((x)=>x.textContent.trim()==='L1');
  if(!sp)return 'NO-SPINE';(sp.closest('.book-spine')||sp).click();return 'spine-clicked';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"
sleep 2.5
agent-browser eval "(()=>{
  const b=[...document.querySelectorAll('button')].find((x)=>(x.innerText||'').trim().startsWith('مکالمه')&&x.getBoundingClientRect().width>0);
  if(!b)return 'NO-TAB';b.click();return 'tab-clicked';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"
sleep 2
tts_fail_on
agent-browser eval "(()=>{
  const b=[...document.querySelectorAll('button')].find((x)=>(x.innerText||'').includes('پخش کل مکالمه')&&x.getBoundingClientRect().width>0);
  if(!b)return Promise.resolve('NO-BTN:playall');
  b.click();
  return new Promise((res)=>{
    let n=0;
    const tick=()=>{
      const lis=[...document.querySelectorAll('ol li')].filter((el)=>el.className.includes('pointer-events-auto')&&el.getBoundingClientRect().height>0);
      if(lis.some((el)=>(el.innerText||'').includes('پخش صدا ممکن نشد')))return res('TOAST-HIT');
      if(++n>=18)return res('TOAST-TIMEOUT');
      setTimeout(tick,500);
    };
    setTimeout(tick,600);
  });
})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"
sleep 2
agent-browser eval "(()=>{const b=[...document.querySelectorAll('button')].find((x)=>(x.innerText||'').includes('پخش کل مکالمه')||((x.innerText||'').includes('توقف پخش')));return b?('SEQ-STATE:'+(b.innerText||'').trim()):'NO-BTN';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"
stub_count
rec
shot r395-conversation-fail.png
tts_restore

echo "########## J) بازگردانیِ نهاییِ استاب (بهداشتِ سشن)" | tee -a "$OUT"
audio_stub_off

echo "########## DONE" | tee -a "$OUT"
agent-browser close >/dev/null 2>&1 || true
echo "OUT=$OUT"
