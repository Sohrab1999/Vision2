#!/usr/bin/env bash
# ------------------------------------------------------------------
# r346 — نخستین داوریِ زندهٔ خانوادهٔ «کهنگی» (staleness family).
#   شاهدِ واقعی: نخستینِ نانِ خطایِ کلاینت در کلِ تاریخِ پروژه —
#   ChunkLoadError از تبِ واقعیِ یادگیرنده رویِ پروکسیِ preview
#   (kind:"error" — گوکِ window، نه مرزِ React). شفایِ Task 293 فقط
#   مرزی بود؛ این راند دو نیمه دارد:
#   ① شفا در گوک‌های window (error + unhandledrejection) — گزارشِ
#      شواهد اول، بعد ری‌لودِ یک‌باره با پنجرهٔ ۶۰ثانیهای
#   ② توستِ «نسخهٔ تازهٔ وب‌کتاب فعال شد» — واکنشِ صفحه به
#      controllerchangeِ سرویس‌ورکر (ادغامِ بدونِ ری‌لودِ اجباری)
#   به‌علاوهٔ بدهیِ r345-②: speakSpell با تزریقِ واقعیِ TTS→500.
#   الگوها: کلیک+کاوشِ اتمیک (r343) · گاردِ seed (r338) · تزریقِ
#   tts (r345) · احیایِ ضدِ OOM (r343). تک‌سشن روی :3000.
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
DIR=/home/z/my-project/scripts
OUT=/tmp/r346-staleness.txt
: > "$OUT"

shot(){ agent-browser screenshot "$EV/$1" >/dev/null 2>&1; }
ev(){ agent-browser eval "$1" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
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
  agent-browser eval "$(cat /tmp/r346-seed-eval.js)" >/dev/null 2>&1
  sleep 5
  seed_guard || return 1
  return 0
}
# کاوشِ توست — انتظارِ حضور
toast_probe(){ agent-browser eval "(()=>new Promise((res)=>{
  let n=0;
  const tick=()=>{
    const lis=[...document.querySelectorAll('ol li')].filter((el)=>el.className.includes('pointer-events-auto')&&el.getBoundingClientRect().height>0);
    if(lis.some((el)=>(el.innerText||'').includes('$1')))return res('TOAST-HIT:$1');
    if(++n>=14)return res('TOAST-ABSENT[$1] seen:'+(lis.map((l)=>(l.innerText||'').slice(0,24)).join(' | ')||'none'));
    setTimeout(tick,600);
  };
  setTimeout(tick,500);
}))()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
# کاوشِ توست — انتظارِ غیابت (برایِ پاهایِ ساکت)
expect_no_toast(){ agent-browser eval "(()=>new Promise((res)=>{
  let n=0;
  const tick=()=>{
    const lis=[...document.querySelectorAll('ol li')].filter((el)=>el.className.includes('pointer-events-auto')&&el.getBoundingClientRect().height>0);
    if(lis.some((el)=>(el.innerText||'').includes('$1')))return res('TOAST-UNEXPECTED:$1');
    if(++n>=6)return res('TOAST-ABSENT-OK');
    setTimeout(tick,500);
  };
  setTimeout(tick,500);
}))()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
heal_flag(){ ev "(()=>{try{return 'FLAG='+(window.sessionStorage.getItem('vision2-chunk-heal-at')||'null')}catch(e){return 'FLAG-ERR'}})()"; }
sentinel(){ ev "(()=>JSON.stringify({s:(typeof window.__r346==='undefined'?'GONE':'alive:'+window.__r346)}))()"; }
tts_fail_on(){ agent-browser eval "(()=>{
  if(!window.__origFetch)window.__origFetch=window.fetch.bind(window);
  if(!window.__r346rec)window.__r346rec={tts:0};
  window.fetch=function(input,init){
    const u=typeof input==='string'?input:(input&&input.url)||'';
    if(u.includes('/api/tts')){window.__r346rec.tts++;return Promise.resolve(new Response(JSON.stringify({error:'r346-injected'}),{status:500,headers:{'Content-Type':'application/json'}}));}
    return window.__origFetch(input,init);
  };
  return 'tts-fail-on';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
tts_restore(){ agent-browser eval "(()=>{if(window.__origFetch)window.fetch=window.__origFetch;return 'tts-restored';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
tts_count(){ ev "(()=>JSON.stringify(window.__r346rec||{}))()"; }

echo "########## A) خانه — seed + روشنِ ۱۲۸۰" | tee -a "$OUT"
agent-browser close >/dev/null 2>&1 || true
pkill -f "agent-browser/browsers" 2>/dev/null; sleep 1
agent-browser open "$BASE" >/dev/null 2>&1
agent-browser set viewport 1280 900 >/dev/null 2>&1
agent-browser wait 'body' >/dev/null 2>&1 || true
sleep 2
node "$DIR/r338-persona.js" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>process.stdout.write(JSON.parse(s).browserEval))" > /tmp/r346-seed-eval.js || { echo "PERSONA-FAIL" | tee -a "$OUT"; agent-browser close >/dev/null 2>&1; exit 1; }
wait_home || { agent-browser close >/dev/null 2>&1; exit 1; }
agent-browser eval "$(cat /tmp/r346-seed-eval.js)" >/dev/null 2>&1
sleep 5
seed_guard || { agent-browser close >/dev/null 2>&1; exit 1; }
agent-browser eval "(()=>{document.documentElement.classList.remove('dark');return 1;})()" >/dev/null 2>&1
heal_flag

echo "########## B) شفایِ گوکِ window — زبانِ فاجعهٔ واقعیِ ثبت‌شده ⇒ ری‌لودِ یک‌باره" | tee -a "$OUT"
ensure_alive || { agent-browser close >/dev/null 2>&1; exit 1; }
ev "(()=>{try{sessionStorage.removeItem('vision2-chunk-heal-at')}catch(e){}
  window.__r346='sentinel-A';
  window.dispatchEvent(new ErrorEvent('error',{message:'ChunkLoadError: Failed to load chunk /_next/static/chunks/r346qa.js from module 424242'}));
  return 'dispatched-A';})()"
sleep 3
echo "-- [sentinel بعد از شفای A] (انتظار: GONE = صفحه ری‌لود شد)" | tee -a "$OUT"
sentinel
echo "-- [پرچمِ شفا بعد از A] (انتظار: timestamp تازه)" | tee -a "$OUT"
heal_flag
wait_home || { agent-browser close >/dev/null 2>&1; exit 1; }
seed_guard || true

echo "########## C) پنجرهٔ ۶۰ثانیهای — دومین حادثه در همان پنجره ⇒ هیچ ری‌لودی" | tee -a "$OUT"
ensure_alive || { agent-browser close >/dev/null 2>&1; exit 1; }
ev "(()=>{window.__r346='sentinel-B';
  window.dispatchEvent(new ErrorEvent('error',{message:'ChunkLoadError: Failed to load chunk /_next/static/chunks/r346qa-b.js from module 424243'}));
  return 'dispatched-B';})()"
sleep 3
echo "-- [sentinel بعد از B] (انتظار: alive:sentinel-B = گاردِ پنجره نگه داشت)" | tee -a "$OUT"
sentinel
heal_flag

echo "########## D) پاى rejection — import()ِ شکستخورده بدونِ مرز ⇒ شفا و ری‌لود" | tee -a "$OUT"
ensure_alive || { agent-browser close >/dev/null 2>&1; exit 1; }
ev "(()=>{try{sessionStorage.removeItem('vision2-chunk-heal-at')}catch(e){}
  window.__r346='sentinel-C';
  const rej=new Event('unhandledrejection');
  rej.reason=new Error('Failed to fetch dynamically imported module: /_next/static/chunks/r346qa2.js');
  window.dispatchEvent(rej);
  return 'dispatched-C';})()"
sleep 3
echo "-- [sentinel بعد از C] (انتظار: GONE = شفایِ rejection)" | tee -a "$OUT"
sentinel
heal_flag
wait_home || { agent-browser close >/dev/null 2>&1; exit 1; }

echo "########## E) کنترلِ منفی — خطایِ معمولی هرگز شفا نمیخواهد" | tee -a "$OUT"
ensure_alive || { agent-browser close >/dev/null 2>&1; exit 1; }
ev "(()=>{window.__r346='sentinel-D';
  window.dispatchEvent(new ErrorEvent('error',{message:'TypeError: r346-control-no-heal is not a function'}));
  return 'dispatched-D';})()"
sleep 3
echo "-- [sentinel بعد از D] (انتظار: alive:sentinel-D = تطبیقگر فقط زبانِ chunk)" | tee -a "$OUT"
sentinel

echo "########## F) توستِ «نسخهٔ تازه» — ادعایِ نخستِ نصب (null→controller) باید ساکت باشد" | tee -a "$OUT"
ensure_alive || { agent-browser close >/dev/null 2>&1; exit 1; }
ev "(()=>{if(!('serviceWorker' in navigator))return 'NO-SW-BRIDGE';
  navigator.serviceWorker.dispatchEvent(new Event('controllerchange'));
  return 'cc-1-dispatched';})()"
expect_no_toast "نسخهٔ تازهٔ وب‌کتاب"

echo "########## G) توستِ «نسخهٔ تازه» — واگذاریِ میانهٔ نشست ⇒ توستِ خانواده" | tee -a "$OUT"
agent-browser eval "(()=>{navigator.serviceWorker.dispatchEvent(new Event('controllerchange'));return 'cc-2-dispatched';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"
toast_probe "نسخهٔ تازهٔ وب‌کتاب فعال شد"
shot r346-update-toast.png

echo "########## H) اکشنِ «تازه‌سازی» — دستِ یادگیرنده ⇒ ری‌لود" | tee -a "$OUT"
agent-browser eval "(()=>{
  const btn=[...document.querySelectorAll('button')].find((b)=>(b.innerText||'').trim()==='تازه‌سازی'&&b.getBoundingClientRect().width>0);
  if(!btn)return 'NO-ACTION-BTN';
  btn.click();
  return 'action-clicked';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"
sleep 3
echo "-- [sentinel بعد از H] (انتظار: GONE = اکشن ری‌لود کرد)" | tee -a "$OUT"
sentinel
wait_home || { agent-browser close >/dev/null 2>&1; exit 1; }

echo "########## I) بدهیِ r345-② — speakSpellِ زنده با تزریقِ TTS→500 ⇒ نشانگرِ کهربایِ درونخطی" | tee -a "$OUT"
ensure_alive || { agent-browser close >/dev/null 2>&1; exit 1; }
agent-browser eval "(()=>{
  const shelf=document.querySelector('[aria-label=\"قفسهٔ کتاب\"]');
  const card=shelf?shelf.querySelector('button'):null;
  if(!card||card.getBoundingClientRect().width===0)return 'NO-LESSON-CARD';
  card.click();return 'lesson-opened';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"
sleep 3
agent-browser eval "(()=>{
  const tab=[...document.querySelectorAll('button')].find((b)=>(b.innerText||'').trim()==='دیکته'&&b.getBoundingClientRect().width>0);
  if(!tab)return 'NO-DICTATION-TAB';
  tab.click();return 'tab-opened';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"
sleep 2
agent-browser eval "(()=>{
  const b=[...document.querySelectorAll('button')].find((x)=>(x.innerText||'').includes('شروع دیکته')&&x.getBoundingClientRect().width>0);
  if(!b)return 'NO-START';
  b.click();return 'round-started';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"
sleep 2.5
tts_fail_on
agent-browser eval "(()=>{
  const b=document.querySelector('[title=\"شنیدن املای حرف‌به‌حرف (نیم‌امتیاز)\"]');
  if(!b||b.getBoundingClientRect().width===0)return 'NO-SPELL-BTN';
  b.click();
  return new Promise((res)=>{
    let n=0;
    const tick=()=>{
      if((document.body.innerText||'').includes('روخوانی در دسترس نیست'))return res('SPELL-MARKER-HIT');
      if(++n>=18)return res('MARKER-TIMEOUT tts:'+((window.__r346rec||{}).tts||0));
      setTimeout(tick,600);
    };
    setTimeout(tick,700);
  });
})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"
tts_count
tts_restore
shot r346-spell-marker.png

echo "########## J) شواهدِ سروری — نانِ خطاها رشد کرده و ردیفِ واقعی سالم" | tee -a "$OUT"
if [ -f client-errors.log ]; then
  echo "rows-total=$(wc -l < client-errors.log)  rows-r346qa=$(rg -c 'r346qa' client-errors.log 2>/dev/null || echo 0)  real-row-intact=$(rg -c '089330b197ab1bb1' client-errors.log 2>/dev/null || echo 0)" | tee -a "$OUT"
else
  echo "NO-LOG-FILE" | tee -a "$OUT"
fi

echo "########## DONE" | tee -a "$OUT"
agent-browser close >/dev/null 2>&1
