#!/usr/bin/env bash
# ------------------------------------------------------------------
# r348 — داوریِ زندهٔ خانوادهٔ «سقفِ توضیحِ هوشمند» (explain monthly
# budget — همزادِ r347). پاى سرور قبلاً با curl اثبات شد (سقفِ ۱ =>
# 200 ai + مترِ ۱ · 429 code:explain_quota · usage used=1). این اسکریپت
# پاى کلاینت است — تک سشن:
#   B) هر دو ردیفِ بودجه در تنظیمات (روخوانیِ r347 + توضیحِ r348 —
#      ردیفِ توضیح باید مصرفِ واقعیِ «۱ پرسش از ۳۰۰۰» را نشان دهد)
#   C) مسیرِ واقعی: درس ← تست‌ها ← تست واژگان ← پاسخِ غلط ← دکمهٔ ExplainBox
#   D) تزریقِ fetchِ explain→429 explain_quota ⇒ حالتِ درونخطیِ سقف
#      (بدونِ «تلاش دوباره») + توستِ روزانهٔ pwa-layer
#   E) گاردِ روزانه: کلیدِ localStorage ثبت شده باشد
#   F) پایشِ دو-مسیرهٔ client-errors (روالِ ثابتِ r346-②)
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
DIR=/home/z/my-project/scripts
OUT=/tmp/r348-quota.txt
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
node "$DIR/r338-persona.js" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>process.stdout.write(JSON.parse(s).browserEval))" > /tmp/r348-seed-eval.js || { echo "PERSONA-FAIL" | tee -a "$OUT"; agent-browser close >/dev/null 2>&1; exit 1; }
wait_home || { agent-browser close >/dev/null 2>&1; exit 1; }
agent-browser eval "$(cat /tmp/r348-seed-eval.js)" >/dev/null 2>&1
sleep 5
seed_guard || { agent-browser close >/dev/null 2>&1; exit 1; }
agent-browser eval "(()=>{document.documentElement.classList.remove('dark');return 1;})()" >/dev/null 2>&1

echo "########## B) هر دو ردیفِ بودجه در تنظیمات" | tee -a "$OUT"
agent-browser eval "(()=>{
  const b=document.querySelector('[aria-label=\"تنظیمات\"]');
  if(!b||b.getBoundingClientRect().width===0)return 'NO-GEAR';
  b.click();return 'gear-clicked';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"
sleep 1.5
agent-browser eval "(()=>new Promise((res)=>{
  let n=0;
  const tick=()=>{
    const t=document.body.innerText||'';
    const ttsRow=t.includes('بودجهٔ روخوانیِ ماه');
    const xRow=t.includes('بودجهٔ توضیح هوشمند');
    const xLine=t.includes('پرسشِ سقفِ ماه');
    // used=1 از داوریِ سرور — مصرفِ واقعی باید در ردیف دیده شود
    const used1=t.includes('۱ پرسش از');
    if(ttsRow&&xRow&&xLine)return res('BOTH-ROWS-HIT explain-used1:'+used1);
    if(++n>=10)return res('ROW-TIMEOUT tts:'+ttsRow+' x:'+xRow+' line:'+xLine);
    setTimeout(tick,500);
  };
  setTimeout(tick,400);
}))()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"
shot r348-budget-rows.png
agent-browser eval "(()=>{
  const b=document.querySelector('[aria-label=\"تنظیمات\"]');
  if(b)b.click();return 'gear-closed';})()" >/dev/null 2>&1
sleep 1

echo "########## C) مسیرِ واقعی: درس ← تست‌ها ← تست واژگان" | tee -a "$OUT"
agent-browser eval "(()=>{
  const shelf=document.querySelector('[aria-label=\"قفسهٔ کتاب\"]');
  const card=shelf?shelf.querySelector('button'):null;
  if(!card||card.getBoundingClientRect().width===0)return 'NO-LESSON-CARD';
  card.click();return 'lesson-opened';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"
sleep 3
agent-browser eval "(()=>{
  const tab=[...document.querySelectorAll('button')].find((b)=>(b.innerText||'').trim()==='تست‌ها'&&b.getBoundingClientRect().width>0);
  if(!tab)return 'NO-TESTS-TAB';
  tab.click();return 'tests-tab-opened';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"
sleep 2
agent-browser eval "(()=>{
  // card labels are descriptions; the ACTION button is «شروع تست» —
  // the first of the three = vocab standard session (categoryInfo[0])
  const b=[...document.querySelectorAll('button')].find((x)=>(x.innerText||'').trim()==='شروع تست'&&x.getBoundingClientRect().width>0);
  if(!b)return 'NO-START-BTN';
  b.click();return 'quiz-started';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"
sleep 2

echo "########## D) پاسخِ غلط تا ExplainBox + تزریقِ 429ِ explain_quota" | tee -a "$OUT"
agent-browser eval "(()=>{try{localStorage.removeItem('vision2-explain-quota-toast-day')}catch(e){};return 'quota-key-cleared';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"
agent-browser eval "(()=>{
  if(!window.__origFetch)window.__origFetch=window.fetch.bind(window);
  window.fetch=function(input,init){
    const u=typeof input==='string'?input:(input&&input.url)||'';
    if(u.includes('/api/explain')&&!u.includes('/api/explain/usage')){
      return Promise.resolve(new Response(JSON.stringify({ok:false,code:'explain_quota',error:'سقفِ توضیحِ هوشمندِ این ماه پر شده است — ماهِ بعد دوباره در دسترس است'}),{status:429,headers:{'Content-Type':'application/json'}}));
    }
    return window.__origFetch(input,init);
  };
  return 'explain-quota-stub-on';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"
agent-browser eval "(()=>new Promise((res)=>{
  let tries=0;
  const step=()=>{
    const opts=document.querySelectorAll('[data-quiz-option]');
    if(opts.length===0){ if(++tries>=10)return res('NO-OPTIONS'); return setTimeout(step,500); }
    opts[0].click();
    setTimeout(()=>{
      const t=document.body.innerText||'';
      if(t.includes('✗ پاسخ درست')){
        const ask=[...document.querySelectorAll('button')].find((x)=>(x.innerText||'').includes('چرا این پاسخ درست است؟'));
        if(ask){ ask.click();
          let n=0;
          const probe=()=>{
            const bt=document.body.innerText||'';
            const inline=bt.includes('سقفِ توضیحِ هوشمندِ این ماه پر شده است');
            const lis=[...document.querySelectorAll('ol li')].filter((el)=>el.className.includes('pointer-events-auto')&&el.getBoundingClientRect().height>0);
            const toast=lis.some((l)=>(l.innerText||'').includes('سقفِ توضیحِ هوشمندِ این ماه پر شد'));
            if(inline&&toast)return res('QUOTA-HIT inline+toast');
            if(++n>=12)return res('PARTIAL inline:'+inline+' toast:'+toast);
            setTimeout(probe,600);
          };
          setTimeout(probe,600);
          return;
        }
        return res('WRONG-BUT-NO-ASK');
      }
      const nxt=document.querySelector('[data-quiz-next]');
      if(nxt){ nxt.click(); setTimeout(step,500); return; }
      if(++tries>=8)return res('NO-WRONG-FOUND');
      setTimeout(step,500);
    },700);
  };
  setTimeout(step,600);
}))()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"
shot r348-quota-inline.png

echo "########## E) گاردِ روزانه — کلیدِ localStorage" | tee -a "$OUT"
ev "(()=>{try{return 'EXPLAIN-QUOTA-KEY='+(window.localStorage.getItem('vision2-explain-quota-toast-day')||'null')}catch(e){return 'KEY-ERR'}})()"
agent-browser eval "(()=>{if(window.__origFetch)window.fetch=window.__origFetch;return 'restored';})()" >/dev/null 2>&1

echo "########## F) پایشِ دو-مسیرهٔ client-errors (r346-②)" | tee -a "$OUT"
cd /home/z/my-project
R=$(wc -l < client-errors.log 2>/dev/null || echo MISSING)
S=$(ls .next/standalone/client-errors.log >/dev/null 2>&1 && wc -l < .next/standalone/client-errors.log || echo MISSING)
REAL=$(rg -c "089330b197ab1bb1" client-errors.log 2>/dev/null || echo 0)
echo "root-rows=$R standalone-rows=$S real-row-intact=$REAL" | tee -a "$OUT"

echo "########## DONE" | tee -a "$OUT"
agent-browser close >/dev/null 2>&1
