#!/usr/bin/env bash
# ------------------------------------------------------------------
# qa-lib.sh — r396 — کتابخانهٔ مشترکِ QA (الگویِ دوقلو رویِ خودِ QA)
#
# سرشماری (r396): ۱۰۹ اسکریپتِ qa-r*.sh — wait_home ×۱۸ / seed_guard ×۱۲ /
#   to_dark ×۱۲ / ensure_alive ×۷ / expect_no_toast ×۴ / tts_fail_on ×۴ /
#   toast_identity ×۳ / استابِ صدا ×۱. هشِ چندنمونه «فقط یک جفتِ همسان»
#   داد — اما بازبینیِ چشمی نشان داد تفاوتها «نویزِ قالببندی» است:
#   فاصله، شکستِ خط، کامنت، «home-ready-after-» در برابرِ «home-ready-» —
#   بدنِ معنایی (selector، انکر، آستانه، عددِ تلاش) بایتبهبایت یکی است
#   (r343/r344/r345 سه نسخهٔ عیناً برابر). درسِ r385 دو-نام، نسخهٔ bash:
#   نویزِ قالبی، خانواده را از سرشماریِ بایتی پنهان میکرد.
#
# حکم (r386/r389/r390):
#  ① مالک: این کتابخانه — توابعِ زیرگروهِ همقرارداد، با پیشوندِ qa_
#     (نیمفضایِ نام: تابعِ کتابخانه ≠ گویشِ محلیِ اسکریپت).
#  ② گویشهایِ آزاد (documented no-verdicts):
#     · سناریو و ترتیبِ بخشها (بدنهٔ اسکریپت) سمتِ میزبان میماند.
#     · انکرِ NEEDLE و selector به پارامتر پاس میشوند، هاردکد نمیشوند.
#     · بذرِ شخصیت (آرش-قهرمان + شبکهٔ ابزارها) در همهٔ ۱۲ نسخه یکی است —
#       اگر روزی شخصیت عوض شود، پارامتریسازی REQUIRES-VERDICT است.
#  ③ **انجمادِ اسکریپتهایِ تاریخی:** ۱۰۹ اسکریپتِ qa-r341..r395 مهاجرت
#     نمیشوند — شاهدِ داوریِ راندهایِ خودشان‌اند، در git ثبت شده‌اند،
#     بازنویسیشان فقط هزینهٔ بازاجرا دارد بیسود. مهاجرت «پیشرو» است:
#     از r396 هر اسکریپتِ نو source میکند (نخستین مصرفکننده:
#     qa-r396-playall-healthy.sh).
#  ④ قراردادِ میزبان (هر اسکریپتِ مصرفکننده باید پیشِ source ست کند):
#       OUT            — پروندهٔ خروجیِ شواهد (باید : > "$OUT" شده باشد)
#       EV             — پوشهٔ اسکرینشات (پیشفرض qa-evidence)
#       BASE           — سرویسِ هدف (پیشفرض http://127.0.0.1:3000)
#       QA_SEED_FILE   — پروندهٔ evalِ بذرِ خودِ راند (برایِ revive)
#       QA_REC         — نامِ شیءِ شمارشِ درونصفحهای (پیشفرض __qarec)
#  ⑤ درسهایِ ثبتشدهای که این کتابخانه یکجا میکند:
#       · SCENE-CLEAR (r395): پروبِ «نبایدتوست» پیشِ کلیک، صحنه را پاک
#         میکند — توستِ بازمانده فرزندِ کلیک پنداشته نمیشود.
#       · revive (r395): بازگشاییِ مرورگر window را میشوید — پسِ
#         reseed، شمارنده و wrapper دوباره نصب میشوند.
#       · استابِ صدا (r395): play → resolve برایِ negctlِ سالم؛
#         mode «ended» (r396): پس از resolve رویدادِ ended را هم
#         میپراکند — onendedِ speak.ts میسوزد و توالیِ playAll پیش
#         میرود (شاهدِ توالیِ سالم در هدلس، پیشتر ناممکن بود).
# ------------------------------------------------------------------

QA_EV="${EV:-/home/z/my-project/qa-evidence}"
QA_BASE="${BASE:-http://127.0.0.1:3000}"
QA_RECNAME="${QA_REC:-__qarec}"
QA_SEED="${QA_SEED_FILE:?qa-lib: QA_SEED_FILE must be set by the host script}"

qa_shot(){ agent-browser screenshot "$QA_EV/$1" >/dev/null 2>&1; }

qa_rec(){ agent-browser eval "(()=>JSON.stringify(window.$QA_RECNAME||{}))()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

qa_count_reset(){ agent-browser eval "(()=>{window.$QA_RECNAME={tts:0};return 'rec-on';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

qa_wait_home(){ # انکرِ اختیاری؛ پیشفرض: شبکهٔ ابزارهای یادگیری (۱۶/۱۸ نسخهٔ تاریخی)
  local ANCHOR="${1:-ابزارهای یادگیری}"
  for i in $(seq 1 30); do
    local R; R=$(agent-browser eval "(()=>{const g=document.querySelector('[aria-label=\"$ANCHOR\"]');return g?'HOME-OK':'WAIT';})()" 2>/dev/null | tr -d '"')
    [ "$R" = "HOME-OK" ] && { echo "home-ready-${i}x3s" >> "$OUT"; return 0; }
    sleep 3
  done
  echo "HOME-NEVER" | tee -a "$OUT"; return 1
}

qa_seed_guard(){ local R; R=$(agent-browser eval "(()=>{const t=document.body.innerText||'';const hasName=t.includes('آرش-قهرمان');const hasGrid=!!document.querySelector('[aria-label=\"ابزارهای یادگیری\"]');return (hasName&&hasGrid)?'SEED-OK':'SEED-MISS';})()" 2>/dev/null | tr -d '"')
  echo "-- [seed-guard] $R" | tee -a "$OUT"; [ "$R" = "SEED-OK" ]
}

qa_ensure_alive(){
  local R; R=$(agent-browser eval "(()=>JSON.stringify({len:(document.body.innerText||'').length}))()" 2>/dev/null)
  echo "$R" | rg -q '"len"' && return 0
  echo "-- [revive] blank-browser — reopening+reseeding (درسِ r395: window نو = ابزارِ مرده)" | tee -a "$OUT"
  agent-browser close >/dev/null 2>&1 || true
  agent-browser open "$QA_BASE" >/dev/null 2>&1
  agent-browser set viewport 1280 900 >/dev/null 2>&1
  qa_wait_home || return 1
  agent-browser eval "$(cat "$QA_SEED")" >/dev/null 2>&1
  sleep 5
  qa_seed_guard || return 1
  # درسِ r395: ابزارهایِ درونصفحهایِ راند پسِ revive دوباره نصب
  qa_count_reset >/dev/null 2>&1
  qa_tts_count_on >/dev/null 2>&1
  return 0
}

qa_to_dark(){ agent-browser eval "(()=>{document.documentElement.classList.add('dark');return 1;})()" >/dev/null 2>&1; sleep 1.2; }
qa_to_light(){ agent-browser eval "(()=>{document.documentElement.classList.remove('dark');return 1;})()" >/dev/null 2>&1; sleep 1.2; }

qa_toast_identity(){ agent-browser eval "(()=>{const lis=[...document.querySelectorAll('ol li')].filter((el)=>el.className.includes('pointer-events-auto')&&el.getBoundingClientRect().height>0);const l=lis[0];if(!l)return 'NO-LIVE';const cs=getComputedStyle(l);return JSON.stringify({live:true,bg:cs.backgroundColor,ink:cs.color});})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

# اتمیک: کلیک + نظرسنجیِ توستِ موردانتظار (HIT) تا ~۹ثانیه
# درسِ r397 (نخستین مصرفکنندهٔ بیرونی): selector باید «با نقلقولِ JS» بیاید —
#   بدنه، $1 را بعد از `const sel=` درج میکند؛ یعنی فراخوانیِ درست:
#   qa_click_toast_q "'[aria-label=\"…\"]'" 0 'نیل'
qa_click_toast_q(){ agent-browser eval "(()=>{
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

# پاکسازیِ صحنه: صبر تا مرگِ همهٔ توستهایِ باز (درسِ r395 — توستِ بازمانده)
qa_wait_toasts_clear(){ agent-browser eval "(()=>new Promise((res)=>{
  let n=0;
  const tick=()=>{
    const lis=[...document.querySelectorAll('ol li')].filter((el)=>el.className.includes('pointer-events-auto')&&el.getBoundingClientRect().height>0);
    if(lis.length===0)return res('SCENE-CLEAR');
    if(++n>=14)return res('SCENE-STUCK:'+lis.length);
    setTimeout(tick,500);
  };
  tick();
}))()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

# کلیک + پاکسازی + پروبِ «نبایدتوست» — پسِ SCENE-CLEAR هر توست، فرزندِ همین کلیک است
qa_click_expect_no_toast(){ agent-browser eval "(()=>new Promise((res)=>{
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

# ---------- شمارندهٔ tts (فقط میشمارد؛ fetch واقعی میگذرد) ----------
qa_tts_count_on(){ agent-browser eval "(()=>{
  if(!window.__origFetch)window.__origFetch=window.fetch.bind(window);
  if(!window.$QA_RECNAME)window.$QA_RECNAME={tts:0};
  window.fetch=function(input,init){
    const u=typeof input==='string'?input:(input&&input.url)||'';
    if(u.includes('/api/tts'))window.$QA_RECNAME.tts++;
    return window.__origFetch(input,init);
  };
  return 'tts-count-on';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

qa_tts_fail_on(){ agent-browser eval "(()=>{
  if(!window.__origFetch)window.__origFetch=window.fetch.bind(window);
  if(!window.$QA_RECNAME)window.$QA_RECNAME={tts:0};
  window.fetch=function(input,init){
    const u=typeof input==='string'?input:(input&&input.url)||'';
    if(u.includes('/api/tts')){window.$QA_RECNAME.tts++;return Promise.resolve(new Response(JSON.stringify({error:'injected'}),{status:500,headers:{'Content-Type':'application/json'}}));}
    return window.__origFetch(input,init);
  };
  return 'tts-fail-on';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

qa_tts_restore(){ agent-browser eval "(()=>{if(window.__origFetch)window.fetch=window.__origFetch;window.__origFetch=null;return 'tts-restored';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

# ---------- استابِ پخش (r395) + حالتِ ended (r396) ----------
# plain: play → resolve («دستگاهِ سالم» — negctlِ سالم)
# ended: play → resolve + پراکندنِ رویدادِ ended در میکروتسک —
#        onendedِ speak.ts میسوزد، onEnd صدا میخورد، توالیِ playAll
#        واقعاً پیش میرود (شاهدِ «توالیِ سالمِ کامل» در هدلس)
qa_audio_stub_on(){ local MODE="${1:-plain}"; agent-browser eval "(()=>{
  if(window.__playOrig)return 'stub-already';
  window.__playOrig=HTMLMediaElement.prototype.play;
  window.__stubCount=0;
  if('$MODE'==='ended')window.__endedCount=0;
  HTMLMediaElement.prototype.play=function(){
    window.__stubCount++;
    const el=this;
    if('$MODE'==='ended'){Promise.resolve().then(()=>{window.__endedCount=(window.__endedCount||0)+1;el.dispatchEvent(new Event('ended'));});}
    return Promise.resolve();
  };
  return 'stub-on:'+'$MODE';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

qa_audio_stub_off(){ agent-browser eval "(()=>{
  if(!window.__playOrig)return 'stub-not-on';
  HTMLMediaElement.prototype.play=window.__playOrig;
  delete window.__playOrig;
  return 'stub-off-restored';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

qa_stub_count(){ agent-browser eval "(()=>JSON.stringify({stub:window.__stubCount||0,ended:window.__endedCount||0}))()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
