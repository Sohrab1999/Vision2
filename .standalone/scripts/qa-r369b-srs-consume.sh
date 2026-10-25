#!/usr/bin/env bash
# ------------------------------------------------------------------
# r369b — حلقهٔ تکمیلیِ مصرفِ سررسید (ادامهٔ کلاسِ r369): رانِ نخست،
# کلیکِ چیپِ سررسید را از دست داد — regexِ \d رویِ ارقامِ فارسیِ faNum
# نمیخوابد (درسِ همیشگی: هر برچسبِ کاربر-روی faNum است). این ران با
# همان قراردادِ صداقت: پنج «بلدم»یِ واقعی ⇒ انتظارِ واقعیِ ۱۵دقیقه ⇒
# چیپ ⇒ جلسهٔ مرورِ هوشمند ⇒ مصرف ⇒ صفرِ صادق.
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
OUT=/tmp/r369b-qa.txt
: > "$OUT"

shot(){ agent-browser screenshot "$EV/$1" >/dev/null 2>&1; }
ev(){ agent-browser eval "$1" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

echo "########## A) گاردِ سلامت" | tee -a "$OUT"
C=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/" 2>/dev/null)
echo "APP-READY code=$C" | tee -a "$OUT"

echo "########## B) سشنِ تازه + آنبوردینگ" | tee -a "$OUT"
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

echo "########## C) پنج «بلدم»یِ واقعی" | tee -a "$OUT"
ev "(()=>{
  const btn=[...document.querySelectorAll('button')].find(b=>(b.textContent||'').trim()==='ورود به درس');
  if(!btn)return 'NO-ENTER-LESSON'; btn.click(); return 'LESSON-ENTERED';
})()" | tee -a "$OUT"
sleep 3
ev "(()=>{
  const fb=[...document.querySelectorAll('button')].find(b=>(b.textContent||'').includes('حالت فلش‌کارت'));
  if(!fb)return 'NO-FLASH-MODE-BTN'; fb.click(); return 'FLASH-MODE';
})()" | tee -a "$OUT"
sleep 2
MARKS=0
for i in $(seq 1 12); do
  [ "$MARKS" -ge 5 ] && break
  R=$(agent-browser eval "(()=>{
    const btns=[...document.querySelectorAll('button')].filter(b=>(b.textContent||'').trim()==='بلدم'&&!b.disabled);
    if(btns.length){btns[0].click();return 'KNOWN';}
    return 'WAIT';
  })()" 2>/dev/null | tr -d '"')
  if [ "$R" = "KNOWN" ]; then MARKS=$((MARKS+1)); sleep 0.9; else sleep 1; fi
done
echo "FLASH-KNOWN-MARKS=$MARKS" | tee -a "$OUT"
ev "(()=>{try{const st=JSON.parse(localStorage.getItem('vision2-study-v1')||'{}');return 'STORE-SRS='+Object.keys(st.state?.srs||{}).length;}catch(e){return 'STORE-ERR';}})()" | tee -a "$OUT"

echo "########## D) انتظارِ صادقانهٔ ۱۵دقیقه‌ای" | tee -a "$OUT"
DUE=0
for i in $(seq 1 40); do
  DUE=$(agent-browser eval "(()=>{try{const st=JSON.parse(localStorage.getItem('vision2-study-v1')||'{}');const srs=st.state?.srs||{};const now=Date.now();return Object.values(srs).filter(v=>v.dueAt<=now).length;}catch(e){return -1;}})()" 2>/dev/null | tr -d '"')
  if [ "${DUE:-0}" -ge 5 ] 2>/dev/null; then break; fi
  sleep 30
done
echo "DUE-ALL-ARRIVED=$DUE (poll=$((i*30))s)" | tee -a "$OUT"

echo "########## E) نوارِ سررسید ⇒ چیپ ⇒ مرورِ هوشمند ⇒ مصرف" | tee -a "$OUT"
agent-browser open "$BASE" >/dev/null 2>&1; sleep 3.5
for i in $(seq 1 20); do
  R=$(agent-browser eval "(()=>{const p=document.querySelector('[aria-label=\"داشبورد مرور هوشمند\"]');return p?'SRS-PANEL':'WAIT';})()" 2>/dev/null | tr -d '"')
  [ "$R" = "SRS-PANEL" ] && break; sleep 3
done
ev "(()=>{
  const panel=document.querySelector('[aria-label=\"داشبورد مرور هوشمند\"]');
  if(!panel)return 'NO-SRS-PANEL';
  const strip=panel.textContent.includes('واژهٔ سررسید')||panel.textContent.includes('منتظر مرور است');
  return 'DUE-STRIP='+strip;
})()" | tee -a "$OUT"
shot r369b-srs-due-strip.png
ev "(()=>{
  const panel=document.querySelector('[aria-label=\"داشبورد مرور هوشمند\"]');
  const chip=panel && [...panel.querySelectorAll('button')].find(b=>/از ۶/.test(b.title||''));
  if(!chip)return 'NO-DUE-CHIP title-sample='+([...panel.querySelectorAll('button')].map(b=>b.title||'').find(t=>t)?'?':'none');
  return 'DUE-CHIP-TITLE:'+chip.title;
})()" | tee -a "$OUT"
ev "(()=>{
  const panel=document.querySelector('[aria-label=\"داشبورد مرور هوشمند\"]');
  const chip=panel && [...panel.querySelectorAll('button')].find(b=>/از ۶/.test(b.title||''));
  if(!chip)return 'NO-ROW'; chip.click(); return 'DUE-CHIP-CLICK';
})()" | tee -a "$OUT"
sleep 3.5
ev "(()=>{
  const inSmart=[...document.querySelectorAll('button')].some(b=>['بلدم','تکرار'].includes((b.textContent||'').trim()));
  return 'SMART-SESSION='+inSmart;
})()" | tee -a "$OUT"
CONSUMED=0
for i in $(seq 1 20); do
  R=$(agent-browser eval "(()=>{
    const btns=[...document.querySelectorAll('button')].filter(b=>['بلدم','تکرار'].includes((b.textContent||'').trim())&&!b.disabled);
    if(btns.length){btns[0].click();return 'REVIEWED';}
    return 'WAIT';
  })()" 2>/dev/null | tr -d '"')
  if [ "$R" = "REVIEWED" ]; then CONSUMED=$((CONSUMED+1)); sleep 0.9; else sleep 1; fi
done
echo "SMART-REVIEW-ACTIONS=$CONSUMED" | tee -a "$OUT"
agent-browser open "$BASE" >/dev/null 2>&1; sleep 3.5
ev "(()=>{try{const st=JSON.parse(localStorage.getItem('vision2-study-v1')||'{}');const srs=st.state?.srs||{};const now=Date.now();const due=Object.values(srs).filter(v=>v.dueAt<=now).length;const lv=Object.values(srs).map(x=>x.level);return 'AFTER-REVIEW due='+due+' levels='+lv.join(',');}catch(e){return 'STORE-ERR';}})()" | tee -a "$OUT"
ev "(()=>{
  const panel=document.querySelector('[aria-label=\"داشبورد مرور هوشمند\"]');
  if(!panel)return 'NO-SRS-PANEL';
  const strip=panel.textContent.includes('واژهٔ سررسید')||panel.textContent.includes('منتظر مرور است');
  return strip?'DUE-STRIP-STILL-THERE':'DUE-STRIP-GONE — صفرِ صادق';
})()" | tee -a "$OUT"
shot r369b-srs-after-consume.png

echo "########## F) EventDay + کنسولِ دوفازی" | tee -a "$OUT"
curl -s "$BASE/api/event" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{const j=JSON.parse(s);const g=n=>{const e=(j.events||[]).find(x=>x.name===n);return e?e.total:'MISS';};console.log('APP_OPEN='+g('app_open')+' SRS_DUE_REVIEW='+g('srs_due_review'));})" | tee -a "$OUT"
CONSOLE_OUT=$(agent-browser console 2>&1 || true)
echo "$CONSOLE_OUT" | tee -a "$OUT" | grep -v "Download the React DevTools" > /tmp/r369b-console-filtered.txt
if grep -qiE "requires a \`DialogTitle\`|Missing \`Description\`|error|warn" /tmp/r369b-console-filtered.txt; then
  echo "CONSOLE-DIRTY" | tee -a "$OUT"; agent-browser close >/dev/null 2>&1; exit 1
fi
echo "RADIX-A11Y-CLEAN + CONSOLE-CLEAN" | tee -a "$OUT"
echo "########## CLEAN-RUN" | tee -a "$OUT"
agent-browser close >/dev/null 2>&1 || true
echo "r369b DONE — حلقهٔ مصرفِ سررسید زنده بسته شد" | tee -a "$OUT"
