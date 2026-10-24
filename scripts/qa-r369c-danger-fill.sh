#!/usr/bin/env bash
# ------------------------------------------------------------------
# r369c — پرکردنِ صادقانهٔ کارتِ خطرناکها: رانِ نخستِ r369 نشان داد
# قاعدهٔ صداقتِ word-risk («یک بدشانسیِ تنها شاهد نیست — seen≥2 یا
# mistakes≥2») کارت را با نویزِ تک‌دیدِ آزمونِ ترکیبی تهی نگه میدارد —
# حکمِ صادق، نه نقص. این ران همان آزمون را دوباره (واقعی) میدهد تا
# واژههایِ پیاپا-خطا از مرزِ شاهد بگذرند و فهرستِ رتبهبندیِ زنده داوری
# شود. [بعد از r369b اجرا میشود]
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
OUT=/tmp/r369c-qa.txt
: > "$OUT"

shot(){ agent-browser screenshot "$EV/$1" >/dev/null 2>&1; }
ev(){ agent-browser eval "$1" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

echo "########## A) سشنِ تازه + آنبوردینگ" | tee -a "$OUT"
agent-browser close >/dev/null 2>&1 || true
pkill -f "agent-browser/browsers" 2>/dev/null; sleep 1
agent-browser open "$BASE" >/dev/null 2>&1
agent-browser set viewport 1280 900 >/dev/null 2>&1
agent-browser wait 'body' >/dev/null 2>&1 || true
for i in $(seq 1 30); do
  R=$(agent-browser eval "(()=>{const t=document.querySelector('[data-slot=\"dialog-title\"]');if(t)return 'ONBOARD';const g=document.querySelector('[aria-label=\"ابزارهای یادگیری\"]');return g?'HOME':'WAIT';})()" 2>/dev/null | tr -d '"')
  [ "$R" = "WAIT" ] || { echo "SURFACE-0=$R" | tee -a "$OUT"; break; }; sleep 3
done
ev "(()=>{
  const skip=[...document.querySelectorAll('button')].find(b=>b.textContent.includes('رد کردن — ناشناس می‌مانم'));
  if(!skip)return 'NO-SKIP-BTN'; skip.click(); return 'ONBOARD-OK';
})()" | tee -a "$OUT"
sleep 1

echo "########## B) دو رانِ کاملِ آزمونِ ترکیبی (پاسخِ گزینهٔ نخست — پیاپا-خطا)" | tee -a "$OUT"
for RUN in 1 2; do
  ev "(()=>{
    const btn=[...document.querySelectorAll('button')].find(b=>(b.textContent||'').trim()==='ورود به درس');
    if(!btn)return 'NO-ENTER-LESSON'; btn.click(); return 'LESSON-ENTERED-R$RUN';
  })()" | tee -a "$OUT"
  sleep 3
  ev "(()=>{
    const tab=[...document.querySelectorAll('button')].find(b=>(b.textContent||'').trim()==='تست‌ها'||(b.getAttribute('aria-label')||'').includes('تست‌ها'));
    if(!tab)return 'NO-TESTS-TAB'; tab.click(); return 'TESTS-TAB-R$RUN';
  })()" | tee -a "$OUT"
  sleep 2
  ev "(()=>{
    const start=[...document.querySelectorAll('button')].find(b=>/شروع تست|تست ترکیبی/.test(b.textContent||'')&&!b.disabled);
    if(!start)return 'NO-QUIZ-START'; start.click(); return 'QUIZ-STARTED-R$RUN';
  })()" | tee -a "$OUT"
  sleep 2
  WAITS=0
  for i in $(seq 1 45); do
    R=$(agent-browser eval "(()=>{
      const next=document.querySelector('[data-quiz-next]');
      if(next&&!next.disabled){next.click(); return 'next';}
      const opts=[...document.querySelectorAll('[data-quiz-option]')].filter(o=>!o.disabled&&o.offsetParent!==null);
      if(opts.length){opts[0].click(); return 'answered';}
      return 'waiting';
    })()" 2>/dev/null | tr -d '"')
    if [ "$R" = "waiting" ]; then WAITS=$((WAITS+1)); [ $WAITS -ge 4 ] && break; else WAITS=0; fi
    sleep 0.7
  done
  ev "(()=>{try{const st=JSON.parse(localStorage.getItem('vision2-study-v1')||'{}');const wm=st.state?.wordMistakes||{};const ws=st.state?.wordSeen||{};return 'AFTER-R$RUN mistakes='+Object.keys(wm).length+' seen='+Object.keys(ws).length;}catch(e){return 'STORE-ERR';}})()" | tee -a "$OUT"
  agent-browser open "$BASE" >/dev/null 2>&1; sleep 3
done
ev "(()=>{try{const st=JSON.parse(localStorage.getItem('vision2-study-v1')||'{}');const wm=st.state?.wordMistakes||{};const ws=st.state?.wordSeen||{};const qualified=Object.keys(wm).filter(k=>(ws[k]??0)>=2||(wm[k]??0)>=2);return 'QUALIFIED-WORDS='+qualified.length+' of seen='+Object.keys(ws).length;}catch(e){return 'STORE-ERR';}})()" | tee -a "$OUT"

echo "########## C) کارتِ خطرناکها — فهرستِ رتبهبندیِ زنده" | tee -a "$OUT"
for i in $(seq 1 20); do
  R=$(agent-browser eval "(()=>{const d=document.querySelector('[aria-label=\"واژه‌های خطرناک من\"]');return d?(d.textContent.includes('ثبت نشده')?'EMPTY':'FILLED'):'WAIT';})()" 2>/dev/null | tr -d '"')
  [ "$R" = "FILLED" ] && { echo "DANGER-CARD-FILLED" | tee -a "$OUT"; break; }
  [ "$R" = "EMPTY" ] && { echo "DANGER-CARD-STILL-EMPTY" | tee -a "$OUT"; break; }
  sleep 3
done
ev "(()=>{
  const card=document.querySelector('[aria-label=\"واژه‌های خطرناک من\"]');
  if(!card)return 'NO-CARD';
  const count=([...card.querySelectorAll('span,div')].map(x=>(x.textContent||'').trim()).find(t=>/^[۰-۹]+\s*واژه$/.test(t)))||'?');
  const stars=[...card.querySelectorAll('button')].filter(b=>(b.getAttribute('aria-label')||'').includes('واژه‌های من')).length;
  return 'DANGER-FILLED count='+count+' starBtns='+stars;
})()" | tee -a "$OUT"
agent-browser scrollintoview '[aria-label="واژه‌های خطرناک من"]' >/dev/null 2>&1 || true
sleep 1
shot r369c-danger-filled-light.png
agent-browser press t >/dev/null 2>&1 || true
sleep 1.5
agent-browser scrollintoview '[aria-label="واژه‌های خطرناک من"]' >/dev/null 2>&1 || true
sleep 1
shot r369c-danger-filled-dark.png
agent-browser press t >/dev/null 2>&1 || true
sleep 1

echo "########## D) EventDay + کنسولِ دوفازی" | tee -a "$OUT"
CONSOLE_OUT=$(agent-browser console 2>&1 || true)
echo "$CONSOLE_OUT" | tee -a "$OUT" | grep -v "Download the React DevTools" > /tmp/r369c-console-filtered.txt
if grep -qiE "requires a \`DialogTitle\`|Missing \`Description\`|error|warn" /tmp/r369c-console-filtered.txt; then
  echo "CONSOLE-DIRTY" | tee -a "$OUT"; agent-browser close >/dev/null 2>&1; exit 1
fi
echo "RADIX-A11Y-CLEAN + CONSOLE-CLEAN" | tee -a "$OUT"
echo "########## CLEAN-RUN" | tee -a "$OUT"
agent-browser close >/dev/null 2>&1 || true
echo "r369c DONE — فهرستِ رتبهبندیِ خطرناکها با شواهدِ پیاپا داوری شد" | tee -a "$OUT"
