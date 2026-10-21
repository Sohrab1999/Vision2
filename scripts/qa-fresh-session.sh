#!/usr/bin/env bash
# ------------------------------------------------------------------
# r281 — نشستِ تازه و قطعیِ QA در یک فرمان.
# r282 — دو مد:
#   ① نوکار: bash scripts/qa-fresh-session.sh [--base URL]
#      localStorage/sessionStorage پاک → reload → آنبوردینگِ تازه‌کار
#      خروجی: FRESH یا NOT-FRESH (+ریشهٔ علت)
#   ② seed نام‌دار: bash scripts/qa-fresh-session.sh --name "آرش ر"
#      پاک‌سازی + تزریقِ persistِ حداقلی (userName + onboarded) → reload
#      → کاربرِ نام‌دارِ بازگشته، بدونِ رقصِ UI (بندِ ① راندِ ۲۸۱ — شش راند باز بود)
#      خروجی: SEEDED یا SEEDED-FAILED (+ریشهٔ علت)
# r283 — مدِ ③ بازیِ واقعی:
#   ③ bash scripts/qa-fresh-session.sh --name "آرش ر" --play
#      seed نام‌دار → یک دستِ واقعیِ چالش برق‌آسا (پاسخ‌دهندهٔ خودکار روی
#      [data-rush-option]) → پایانِ تایمر → sendStatsِ واقعی → userId از سرور
#      → جشنِ r279 (toastِ «وعده برقرار شد») → reload → ردیفِ «(شما)» در فید.
#      دامنهٔ صادقِ seedِ r282 (userId نمیآید) را پر میکند — بندِ ① راندِ ۲۸۲.
#      --play بدونِ --name معنا ندارد (جشن و ردیفِ خودی هر دو نیازمندِ هویت).
#      خروجی: PLAYED (+toast= · feed-self= · clicks= · score=) یا PLAYED-FAILED (+ریشه)
#      توجه: هر دستِ بازی یک ردیفِ واقعی در DB میسازد — پاک‌سازیِ پایانِ راند حتماً.
# ------------------------------------------------------------------
set -uo pipefail

BASE="http://127.0.0.1:3000"
NAME=""
PLAY=""

# پارسِ آرگومان: --name X → seed نام‌دار؛ --play → یک دستِ واقعی؛ --base URL → مقصد؛ غیرِ -- → BASE (سازگاریِ قدیم)
while [ $# -gt 0 ]; do
  case "$1" in
    --name) NAME="${2:-}"; shift 2 ;;
    --play) PLAY="1"; shift ;;
    --base) BASE="${2:-$BASE}"; shift 2 ;;
    *) BASE="$1"; shift ;;
  esac
done

if [ -n "$PLAY" ] && [ -z "$NAME" ]; then
  echo "result=PLAYED-FAILED"; echo "PLAYED-FAILED: --play needs --name (celebration + self-row both require identity)"; exit 1
fi

agent-browser open "$BASE" > /dev/null 2>&1
sleep 2

if [ -z "$NAME" ]; then
  # ---------- مدِ ①: نشستِ تازه‌کار ----------
  agent-browser eval "(()=>{localStorage.clear(); sessionStorage.clear(); location.reload(); return 'cleared';})()" > /dev/null 2>&1
  sleep 4

  STATE=$(agent-browser eval "(()=>{
    // نکتهٔ r281: Radix Dialog position:fixed است — offsetParent برایِ fixed
    // همیشه null است و فریب میدهد؛ سنجشِ درست computed-style + data-state است.
    const dlg=[...document.querySelectorAll('[role=dialog]')].some(d=>{
      const cs=getComputedStyle(d);
      return d.textContent?.includes('خوش آمدی') && cs.visibility!=='hidden' && cs.display!=='none' && d.getAttribute('data-state')==='open';
    });
    const trig=[...document.querySelectorAll('button')].find(x=>x.getAttribute('aria-label')?.startsWith('پروفایل من'));
    return dlg ? 'FRESH' : 'NOT-FRESH profile=' + (trig?trig.getAttribute('aria-label'):'none');
  })()" 2>/dev/null)

  STATE="${STATE//\"/}"
  case "${STATE}" in
    FRESH*) echo "result=FRESH"; echo "FRESH: onboarding visible — session is a clean new learner" ;;
    *)      echo "result=${STATE}"; echo "NOT-FRESH: onboarding NOT visible — inspect result above" ;;
  esac
  exit 0
fi

# ---------- مدِ ②: seed نام‌دار ----------
# نام با نقل‌قول/بک‌اسلش/سطرِ نو به فرمانِ eval آسیب میزند — زودتر رد میکنیم
case "$NAME" in
  *"'"*|*\"*|*\\*|*$'\n'*) echo "result=SEEDED-FAILED"; echo "SEEDED-FAILED: name must not contain quote/backslash/newline"; exit 1 ;;
esac
if [ -z "$NAME" ] || [ ${#NAME} -lt 2 ]; then
  echo "result=SEEDED-FAILED"; echo "SEEDED-FAILED: name too short"; exit 1
fi

INITIAL="${NAME:0:1}"
agent-browser eval "(()=>{
  localStorage.clear(); sessionStorage.clear();
  // seedِ حداقلی: zustand persist فقط کلیدهایِ حاضر را رویِ پیش‌فرضها merge میکند؛
  // userName و onboarded هر دو در PERSIST_KEYS هستند (schema.ts:373/420).
  localStorage.setItem('vision2-study-v1', JSON.stringify({state:{userName:'${NAME}', onboarded:true}, version:0}));
  location.reload(); return 'seeded';
})()" > /dev/null 2>&1
sleep 4

STATE=$(agent-browser eval "(()=>{
  const dlg=[...document.querySelectorAll('[role=dialog]')].some(d=>{
    const cs=getComputedStyle(d);
    return d.textContent?.includes('خوش آمدی') && cs.visibility!=='hidden' && cs.display!=='none' && d.getAttribute('data-state')==='open';
  });
  if (dlg) return 'FAILED-REASON=ONBOARDING-STILL-OPEN';
  const trig=[...document.querySelectorAll('button')].find(x=>x.getAttribute('aria-label')?.startsWith('پروفایل من'));
  if (!trig) return 'FAILED-REASON=NO-PROFILE-TRIGGER';
  const initial=trig.textContent?.trim()||'';
  if (!initial.includes('${INITIAL}')) return 'FAILED-REASON=WRONG-INITIAL got=' + initial;
  let stored='';
  try { const raw=localStorage.getItem('vision2-study-v1'); stored = raw ? (JSON.parse(raw)?.state?.userName||'') : ''; } catch {}
  if (stored !== '${NAME}') return 'FAILED-REASON=STORE-MISMATCH got=' + stored;
  return 'SEEDED name=' + stored + ' initial=' + initial;
})()" 2>/dev/null)

STATE="${STATE//\"/}"
case "${STATE}" in
  SEEDED*) echo "result=SEEDED"; echo "${STATE} — named returning learner ready (no onboarding)" ;;
  *)       echo "result=${STATE}"; echo "SEEDED-FAILED: inspect reason above"; exit 1 ;;
esac

if [ -z "$PLAY" ]; then exit 0; fi

# ---------- مدِ ③: یک دستِ واقعیِ چالش برق‌آسا ----------
# زنجیرهٔ قطعی: بنرِ خانه → setup → play → پاسخ‌دهندهٔ خودکار → پایانِ تایمرِ ۶۰ث
# → finish → sendStats → res.ok → جشنِ r279 (سرور userId تازه میدهد چون seed
# localStorage را پاک کرده) → reload → فید با userIdِ دقیق ردیفِ «(شما)» را نشان میدهد.
sleep 1

BANNER=$(agent-browser eval "(()=>{
  const b=[...document.querySelectorAll('.rush-banner button')].find(x=>x.textContent?.includes('شروع چالش'));
  if(!b) return 'NO-BANNER';
  b.click(); return 'BANNER-CLICKED';
})()" 2>/dev/null)
BANNER="${BANNER//\"/}"
if [ "$BANNER" != "BANNER-CLICKED" ]; then
  echo "result=PLAYED-FAILED"; echo "PLAYED-FAILED: $BANNER — rush banner not reachable on home"; exit 1
fi
sleep 2

START=$(agent-browser eval "(()=>{
  const s=document.querySelector('.rush-start');
  if(!s) return 'NO-START';
  s.click(); return 'PLAY-STARTED';
})()" 2>/dev/null)
START="${START//\"/}"
if [ "$START" != "PLAY-STARTED" ]; then
  echo "result=PLAYED-FAILED"; echo "PLAYED-FAILED: $START — rush setup start button not found"; exit 1
fi
sleep 2

# پاسخ‌دهندهٔ خودکار + نمونه‌بردارِ جشن: هر ۱٫۳ث اولین گزینهٔ فعال (نرخِ درستِ
# تصادفی ~۲۵٪ کافی است؛ فاصله از حداکثرِ پیشرویِ ۸۵۰ms بزرگ‌تر است)؛ و یک
# نمونه‌بردارِ ۴۰۰ms با دو سیگنالِ مستقل:
#   __celebrated  ← «وعده برقرار شد» (جشنِ r279)
#   __ftoast      ← «پاسخ درست از» (toastِ پایانِ راند — همیشه، مستقل از امتیاز)
# درسِ راندِ ۲۸۴: در گلیچِ ۱-در-۵ (فقط اولینِ دستِ مرورگرِ سرد) جشن نیامد ولی
# پرچم نشست — این دوجمله‌ای حکمِ ریشه را میدهد: جشن-نیامد+پایان-آمد = شکافِ
# dispatch→handler؛ هر-دو-نیامد = مرگِ لولهٔ toast در همان لحظه.
agent-browser eval "(()=>{
  window.__rushClicks=0; window.__celebrated=false; window.__ftoast=false;
  if(window.__rushTimer) clearInterval(window.__rushTimer);
  if(window.__celebTimer) clearInterval(window.__celebTimer);
  window.__rushTimer=setInterval(()=>{
    const opts=[...document.querySelectorAll('[data-rush-option]')].filter(o=>!o.disabled);
    if(opts.length){ opts[0].click(); window.__rushClicks++; }
  },1300);
  window.__celebTimer=setInterval(()=>{
    const rs=()=>[...document.querySelectorAll('[role=status]')].map(d=>d.textContent||'').join(' ');
    const all=rs();
    if(!window.__celebrated && all.includes('وعده برقرار شد')) window.__celebrated=true;
    if(!window.__ftoast && all.includes('پاسخ درست از')) window.__ftoast=true;
  },400);
  return 'AUTO-ANSWERER-ON';
})()" > /dev/null 2>&1

# راند ۶۰ ثانیه است — از ثانیهٔ ۵۸ هر ۲ث پیمایش تا done؛ بعدش پنجرهٔ بخششِ پیوستهٔ ۸ثانیه‌ای (ر285) toastِ تأخیری را هم میگیرد.
sleep 58
TOAST="no"; FTOAST="no"; DONE="no"; SCORE="?"; CLICKS="?"
for i in 1 2 3 4 5 6 7 8; do
  P=$(agent-browser eval "(()=>{
    const done=!!document.querySelector('.rush-done');
    const all=[...document.querySelectorAll('[role=status]')].map(d=>d.textContent||'').join(' ');
    const toast=(all.includes('وعده برقرار شد')||window.__celebrated)?'yes':'no';
    const ft=(all.includes('پاسخ درست از')||window.__ftoast)?'yes':'no';
    const score=document.querySelector('.rush-score')?.textContent?.trim()||'?';
    return (done?'DONE':'PLAYING')+' toast='+toast+' ftoast='+ft+' clicks='+(window.__rushClicks||0)+' score='+score;
  })()" 2>/dev/null)
  P="${P//\"/}"
  case "$P" in *toast=yes*) TOAST="yes" ;; esac
  case "$P" in *ftoast=yes*) FTOAST="yes" ;; esac
  CLICKS=$(echo "$P" | sed -n 's/.*clicks=\([0-9]*\).*/\1/p')
  SC=$(echo "$P" | sed -n 's/.*score=\([^ ]*\).*/\1/p')
  [ -n "$SC" ] && [ "$SC" != "?" ] && SCORE="$SC"
  case "$P" in DONE*) DONE="yes"; break ;; esac
  sleep 2
done

# پنجرهٔ بخششِ پیوسته (r285): جشن فقط پس از res.okِ sendStats میآید و رویِ سرورِ سردِ
# آغازِ راند (کامپایلِ مسیر پس از بیکاری) همان fetch میتواند ۱-۳ث طول بکشد —
# تک‌خوانیِ ۲ثانیهایِ پیشین درست در همین پنجره کور میشد؛ هر سه فاشیلیِ تاریخ
# (run1ِ راندهای ۲۸۳/۲۸۴/۲۸۵) با امضایِ toast=no ftoast=no feed-self=1 از همینجا میآمد
# در حالی که نشانِ «اولین دیده‌شدن» ماندگار باز شده بود (محصول سالم، سنجش کور).
# حالا ۸ثانیه × ۵۰۰ms میخوانیم؛ تأخیرِ واقعی در TOAST_DELAY ثبت میشود و اگر پس از
# ۸ثانیه هم هیچ نرسید، حکمِ «مرگِ لوله» با شواهدِ هوادار صادر میشود.
TOAST_DELAY="0"
if [ "$DONE" = "yes" ] && [ "$TOAST" != "yes" ]; then
  for j in 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16; do
    sleep 0.5
    G=$(agent-browser eval "(()=>{const all=[...document.querySelectorAll('[role=status]')].map(d=>d.textContent||'').join(' ');return ((window.__celebrated||all.includes('وعده برقرار شد'))?'yes':'no')+' '+((window.__ftoast||all.includes('پاسخ درست از'))?'yes':'no');})()" 2>/dev/null)
    G="${G//\"/}"
    case "$G" in yes*) TOAST="yes"; TOAST_DELAY="$(awk "BEGIN{printf \"%.1f\", $j*0.5}")s" ;; esac
    case "$G" in *yes) FTOAST="yes" ;; esac
    [ "$TOAST" = "yes" ] && break
  done
fi

agent-browser eval "(()=>{ if(window.__rushTimer) clearInterval(window.__rushTimer); if(window.__celebTimer) clearInterval(window.__celebTimer); return 'ok'; })()" > /dev/null 2>&1

if [ "$DONE" != "yes" ]; then
  echo "result=PLAYED-FAILED"; echo "PLAYED-FAILED: rush-done never appeared in 74s — clicks=$CLICKS toast=$TOAST"; exit 1
fi

sleep 1
agent-browser reload > /dev/null 2>&1
sleep 4
FEED=$(agent-browser eval "(()=>{
  const me=[...document.querySelectorAll('li')].filter(l=>l.textContent?.includes('(شما)'));
  return 'SELF-ROWS='+me.length;
})()" 2>/dev/null)
FEED="${FEED//\"/}"
SELFN=$(echo "$FEED" | sed -n 's/.*SELF-ROWS=\([0-9]*\).*/\1/p')
[ -z "$SELFN" ] && SELFN="0"

echo "result=PLAYED name=${NAME} toast=${TOAST} toastDelay=${TOAST_DELAY} ftoast=${FTOAST} feed-self=${SELFN} clicks=${CLICKS:-?} score=${SCORE}"
if [ "$TOAST" = "yes" ] && [ "$SELFN" -ge 1 ]; then
  echo "PLAYED: real hand closed the full chain — r279 celebration + feed self-row (userId from server)"
elif [ "$TOAST" = "no" ] && [ "$FTOAST" = "yes" ] && [ "$SELFN" -ge 1 ]; then
  echo "PLAYED (known-anomaly): finish toast fired but celebration did NOT — dispatch→handler gap (r279 1-in-N, see worklog 284)"
elif [ "$TOAST" = "no" ] && [ "$FTOAST" = "no" ]; then
  echo "PLAYED (degraded): NO toast even after the 8s continuous grace window — real pipeline death (r285-grade evidence; see worklog 284/285)"
elif [ "$TOAST" = "yes" ] && [ "$SELFN" = "0" ]; then
  echo "PLAYED (partial): celebration ok but feed self-row missing — inspect /api/stats recent payload"
else
  echo "PLAYED (degraded): round finished but chain incomplete — inspect identity/server"
fi
