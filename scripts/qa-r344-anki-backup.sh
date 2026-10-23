#!/usr/bin/env bash
# ------------------------------------------------------------------
# r344 — نخستین داوریِ زندهٔ خانوادهٔ «خروجی Anki + پشتیبانِ JSON».
#   درمانِ راند: downloadAnkiTsv آخرین عضوِ بیسنگِ خانوادهٔ دانلود بود —
#   کلیک در شکست کاملاً ساکت (بی‌توست، بی‌رویداد). حالا دوپایه است.
#   سویپ: تزریقِ URL.createObjectURL→throw (رفتارِ واقعیِ «ساختِ ناموفق»)
#   + رکوردگرِ لنگرِ a[download] + negctlِ بازگردانی + ماتریسِ کاملِ
#   بازیابیِ فایلِ پشتیبان (چهار پیامِ فارسیِ parseBackup + اعمالِ موفق +
#   reload) + شکستِ بازیابیِ خودکار + basis-zeroِ دوازدهمین نما (دیکشنری).
#   الگوها: کلیک+کاوشِ اتمیک (r343) · گاردِ seed (r338) · negctl (r339) ·
#   احیایِ ضدِ OOM (r343) · آپلودِ فایلِ واقعی با agent-browser upload.
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
DIR=/home/z/my-project/scripts
OUT=/tmp/r344-anki-backup.txt
: > "$OUT"

shot()  { agent-browser screenshot "$EV/$1" >/dev/null 2>&1; }
rec(){ agent-browser eval "(()=>JSON.stringify(window.__r344rec||{}))()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
# اتمیک: کلیک با selector + نظرسنجیِ درون-صفحهایِ توست تا ~۸ثانیه
click_toast_q(){ agent-browser eval "(()=>{
  const b=document.querySelector($1);
  if(!b||b.getBoundingClientRect().width===0)return Promise.resolve('NO-BTN:'+$1);
  b.click();
  return new Promise((res)=>{
    let n=0;
    const tick=()=>{
      const lis=[...document.querySelectorAll('ol li')].filter((el)=>el.className.includes('pointer-events-auto')&&el.getBoundingClientRect().height>0);
      if(lis.some((el)=>(el.innerText||'').includes('$2')))return res('TOAST-HIT:$2');
      if(++n>=16)return res('TOAST-TIMEOUT[$2] seen:'+(lis.map((l)=>(l.innerText||'').slice(0,30)).join(' | ')||'none'));
      setTimeout(tick,500);
    };
    setTimeout(tick,600);
  });
})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
# کلیکِ متنی (دکمههایِ بدونِ aria-label) + پروبِ توست
click_toast_text(){ agent-browser eval "(()=>{
  const b=[...document.querySelectorAll('button')].find((x)=>(x.innerText||'').includes('$1')&&x.getBoundingClientRect().width>0);
  if(!b)return Promise.resolve('NO-BTN:$1');
  b.click();
  return new Promise((res)=>{
    let n=0;
    const tick=()=>{
      const lis=[...document.querySelectorAll('ol li')].filter((el)=>el.className.includes('pointer-events-auto')&&el.getBoundingClientRect().height>0);
      if(lis.some((el)=>(el.innerText||'').includes('$2')))return res('TOAST-HIT:$2');
      if(++n>=16)return res('TOAST-TIMEOUT[$2] seen:'+(lis.map((l)=>(l.innerText||'').slice(0,30)).join(' | ')||'none'));
      setTimeout(tick,500);
    };
    setTimeout(tick,600);
  });
})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
# پروبِ بدونِ کلیک (برای مسیرهای آپلودِ فایل)
poll_toast(){ agent-browser eval "(()=>new Promise((res)=>{
  let n=0;
  const tick=()=>{
    const lis=[...document.querySelectorAll('ol li')].filter((el)=>el.className.includes('pointer-events-auto')&&el.getBoundingClientRect().height>0);
    if(lis.some((el)=>(el.innerText||'').includes('$1')))return res('TOAST-HIT:$1');
    if(++n>=16)return res('TOAST-TIMEOUT[$1] seen:'+(lis.map((l)=>(l.innerText||'').slice(0,30)).join(' | ')||'none'));
    setTimeout(tick,500);
  };
  setTimeout(tick,600);
}))()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
install_recorders(){ agent-browser eval "(()=>{
  if(!window.__origCOU)window.__origCOU=URL.createObjectURL.bind(URL);
  if(!window.__r344rec){window.__r344rec={cou:0,dl:0,names:[]};
    document.addEventListener('click',(e)=>{const a=e.target&&e.target.closest?e.target.closest('a[download]'):null;if(a){window.__r344rec.dl++;window.__r344rec.names.push(a.download||'?');}},true);}
  return 'recorders-on';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
cou_fail_on(){ agent-browser eval "(()=>{URL.createObjectURL=function(){window.__r344rec.cou++;throw new TypeError('r344-cou-injected');};return 'cou-fail-on';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
cou_restore(){ agent-browser eval "(()=>{if(window.__origCOU)URL.createObjectURL=window.__origCOU;return 'cou-restored';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
to_dark(){ agent-browser eval "(()=>{document.documentElement.classList.add('dark');return 1;})()" >/dev/null 2>&1; sleep 1.2; }
to_light(){ agent-browser eval "(()=>{document.documentElement.classList.remove('dark');return 1;})()" >/dev/null 2>&1; sleep 1.2; }
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
  agent-browser eval "$(cat /tmp/r344-seed-eval.js)" >/dev/null 2>&1
  sleep 5
  seed_guard || return 1
  install_recorders >/dev/null 2>&1
  return 0
}
# پروفایل باید باز باشد (درگاهِ آپلودِ فایل در آن زندگی میکند) — بعدِ احیا حتماً بازِ دوباره
ensure_profile(){
  local i R
  for i in $(seq 1 20); do
    R=$(agent-browser eval "(()=>{const b=[...document.querySelectorAll('button')].find((x)=>(x.innerText||'').includes('دانلود پشتیبان')&&x.getBoundingClientRect().width>0);return b?'OPEN':'CLOSED';})()" 2>/dev/null | tr -d '"')
    [ "$R" = "OPEN" ] && return 0
    agent-browser eval "(()=>{window.dispatchEvent(new Event('open-profile'));return 'evt';})()" >/dev/null 2>&1
    sleep 2
  done
  echo "PROFILE-NEVER" | tee -a "$OUT"; return 1
}

echo "########## A) خانه — seed + روشنِ ۱۲۸۰ + رکوردگرها" | tee -a "$OUT"
agent-browser close >/dev/null 2>&1 || true
pkill -f "agent-browser/browsers" 2>/dev/null; sleep 1
agent-browser open "$BASE" >/dev/null 2>&1
agent-browser set viewport 1280 900 >/dev/null 2>&1
agent-browser wait 'body' >/dev/null 2>&1 || true
sleep 2
node "$DIR/r338-persona.js" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>process.stdout.write(JSON.parse(s).browserEval))" > /tmp/r344-seed-eval.js || { echo "PERSONA-FAIL" | tee -a "$OUT"; agent-browser close >/dev/null 2>&1; exit 1; }
wait_home || { agent-browser close >/dev/null 2>&1; exit 1; }
agent-browser eval "$(cat /tmp/r344-seed-eval.js)" >/dev/null 2>&1
sleep 5
seed_guard || { agent-browser close >/dev/null 2>&1; exit 1; }
agent-browser eval "(()=>{document.documentElement.classList.remove('dark');return 1;})()" >/dev/null 2>&1
install_recorders
sleep 1

echo "########## B) دیکشنری — دوازدهمین نمایِ basis-zero" | tee -a "$OUT"
ensure_alive || { agent-browser close >/dev/null 2>&1; exit 1; }
agent-browser eval "(()=>{
  const b=[...document.querySelectorAll('button')].find((x)=>(x.innerText||'').includes('دیکشنری جستجو')&&x.getBoundingClientRect().width>0);
  if(!b)return 'NO-CARD';b.click();return 'card-clicked';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"
sleep 2.5
agent-browser eval "(()=>{const b=document.querySelector(\"[aria-label^='صادرات']\");return (b&&b.getBoundingClientRect().width>0)?'ANKI-BTN-OPEN':'ANKI-BTN-MISS';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"
agent-browser eval "$(cat "$DIR/r319-basis-zero-audit.js")" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"

echo "########## C) Anki — شکستِ ساخت: COU→throw (اتمیک) — درمانِ راند" | tee -a "$OUT"
cou_fail_on
click_toast_q "\"[aria-label^='صادرات']\"" "خطا در ساخت فایل" || true
rec
shot r344-anki-fail-light.png

echo "########## D) تاریکِ درجا — همان درگاه + شناسنامهٔ توست" | tee -a "$OUT"
to_dark
click_toast_q "\"[aria-label^='صادرات']\"" "خطا در ساخت فایل" || true
agent-browser eval "(()=>{const lis=[...document.querySelectorAll('ol li')].filter((el)=>el.className.includes('pointer-events-auto')&&el.getBoundingClientRect().height>0);const l=lis[0];if(!l)return 'NO-LIVE';const cs=getComputedStyle(l);return JSON.stringify({live:true,cls:(l.className.match(/(?:bg|text)-[a-z-]+[\d]*/g)||[]).join(','),bg:cs.backgroundColor,ink:cs.color});})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"
shot r344-anki-fail-dark.png
to_light

echo "########## E) negctl — بازگردانیِ COU ⇒ توستِ موفقیت + لنگرِ vision2-anki.txt" | tee -a "$OUT"
cou_restore
click_toast_q "\"[aria-label^='صادرات']\"" "خروجی Anki آماده شد" || true
rec
shot r344-anki-success.png

echo "########## F) پشتیبانِ خودکار — تضمینِ وجودِ snapshot برایِ بازیابی" | tee -a "$OUT"
agent-browser eval "(()=>{const raw=localStorage.getItem('vision2-study-v1');if(!raw)return 'NO-STATE';
 if(localStorage.getItem('vision2-auto-backup'))return 'AUTO-EXISTS';
 const st=JSON.parse(raw).state||{};
 const cnt={known:Object.values(st.known||{}).filter(Boolean).length,results:Object.keys(st.results||{}).length,srs:Object.keys(st.srs||{}).length,mistakes:Object.keys(st.mistakes||{}).length,history:Object.keys(st.history||{}).length,dayHistory:Object.keys(st.dayHistory||{}).length,konkur:0,duel:(st.duelWins||0)+(st.duelLosses||0)+(st.duelTies||0)};
 localStorage.setItem('vision2-auto-backup',JSON.stringify({savedAt:new Date().toISOString(),counts:cnt,data:st}));
 return 'AUTO-WRITTEN';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"

echo "########## G) پروفایل — خروجیِ پشتیبان: شکست (COU→throw) — پایِ هرگزندیده" | tee -a "$OUT"
ensure_alive || { agent-browser close >/dev/null 2>&1; exit 1; }
agent-browser eval "(()=>{window.dispatchEvent(new Event('open-profile'));return 'evt';})()" >> "$OUT" 2>&1
sleep 2
agent-browser eval "(()=>{const b=[...document.querySelectorAll('button')].find((x)=>(x.innerText||'').includes('دانلود پشتیبان')&&x.getBoundingClientRect().width>0);return b?'PROFILE-OPEN':'PROFILE-MISS';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"
cou_fail_on
click_toast_text "دانلود پشتیبان" "خطا در پشتیبان‌گیری" || true
rec
shot r344-backup-fail.png

echo "########## H) negctl — بازگردانی ⇒ ✓ پشتیبان دانلود شد + لنگرِ JSON" | tee -a "$OUT"
cou_restore
click_toast_text "دانلود پشتیبان" "پشتیبان دانلود شد" || true
rec

echo "########## I) بازیابیِ خودکار — شکستِ اعمال: خرابِ اتمیکِ vision2-study-v1" | tee -a "$OUT"
agent-browser eval "(()=>{
  const raw=localStorage.getItem('vision2-study-v1');
  window.__r344state=raw;
  localStorage.setItem('vision2-study-v1','r344-corrupt-not-json');
  const b=document.querySelector(\"[title='بازگرداندن آخرین پشتیبان خودکار مرورگر']\");
  if(!b||b.getBoundingClientRect().width===0){localStorage.setItem('vision2-study-v1',raw||'');return 'NO-BTN';}
  b.click();
  return new Promise((res)=>{
    let n=0;
    const tick=()=>{
      const lis=[...document.querySelectorAll('ol li')].filter((el)=>el.className.includes('pointer-events-auto')&&el.getBoundingClientRect().height>0);
      if(lis.some((el)=>(el.innerText||'').includes('بازیابی ناموفق')))return res('TOAST-HIT:بازیابی ناموفق');
      if(++n>=16)return res('TOAST-TIMEOUT[بازیابی ناموفق] seen:'+(lis.map((l)=>(l.innerText||'').slice(0,30)).join(' | ')||'none'));
      setTimeout(tick,500);
    };
    setTimeout(tick,600);
  });
})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"
agent-browser eval "(()=>{if(window.__r344state!==null&&window.__r344state!==undefined)localStorage.setItem('vision2-study-v1',window.__r344state);return 'state-restored';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"

echo "########## J) بازیابیِ فایلِ پشتیبان — پیامِ ۱: JSONِ نامعتبر" | tee -a "$OUT"
ensure_alive || { agent-browser close >/dev/null 2>&1; exit 1; }
ensure_profile || { agent-browser close >/dev/null 2>&1; exit 1; }
agent-browser eval "(()=>{const i=document.querySelector('input[type=\"file\"]');return (i&&i.getBoundingClientRect().width>=0&&i.isConnected)?'INPUT-MOUNTED':'INPUT-MISS';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"
printf 'این یک JSON نیست' > /tmp/r344-bad.json
agent-browser upload 'input[type="file"]' /tmp/r344-bad.json >/dev/null 2>&1 || echo "UPLOAD-ERR" | tee -a "$OUT"
poll_toast "فایل پشتیبان نامعتبر" || true
shot r344-import-invalid.png

echo "########## K) پیامِ ۲: appِ بیگانه" | tee -a "$OUT"
ensure_profile || true
printf '{"app":"other-app","version":1}' > /tmp/r344-wrongapp.json
agent-browser upload 'input[type="file"]' /tmp/r344-wrongapp.json >/dev/null 2>&1 || echo "UPLOAD-ERR" | tee -a "$OUT"
poll_toast "این فایل پشتیبانِ وب‌کتاب ویژن ۲ نیست" || true

echo "########## L) پیامِ ۳: نسخهٔ ناشناخته" | tee -a "$OUT"
ensure_profile || true
printf '{"app":"vision2-webbook","version":99}' > /tmp/r344-badver.json
agent-browser upload 'input[type="file"]' /tmp/r344-badver.json >/dev/null 2>&1 || echo "UPLOAD-ERR" | tee -a "$OUT"
poll_toast "نسخهٔ فایل پشتیبان پشتیبانی نمی‌شود" || true

echo "########## M) پایِ سبزِ بازیابی: پشتیبانِ معتبر ⇒ توست + reload" | tee -a "$OUT"
ensure_profile || true
printf '{"app":"vision2-webbook","version":1,"exportedAt":"2026-10-23T08:00:00.000Z","data":{"known":{},"results":{},"srs":{},"mistakes":{},"history":{},"dayHistory":{},"duelWins":0,"duelLosses":0,"duelTies":0}}' > /tmp/r344-valid.json
agent-browser eval "(()=>{window.__r344flag=1;localStorage.setItem('vision2-r344-pre','1');return 'flag-set';})()" >/dev/null 2>&1
agent-browser upload 'input[type="file"]' /tmp/r344-valid.json >/dev/null 2>&1 || echo "UPLOAD-ERR" | tee -a "$OUT"
poll_toast "پشتیبان بازیابی شد" || true
sleep 4
agent-browser eval "(()=>JSON.stringify({flag:window.__r344flag===undefined?'GONE-RELOADED':'STILL',pre:localStorage.getItem('vision2-r344-pre')}))()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"
shot r344-import-valid.png

echo "########## N) جمعبندی — رکوردگرِ نهایی" | tee -a "$OUT"
rec
agent-browser close >/dev/null 2>&1 || true
echo "R344-DRIVER-DONE" | tee -a "$OUT"
