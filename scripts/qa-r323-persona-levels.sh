#!/usr/bin/env bash
# ------------------------------------------------------------------
# r323 — «قهرمان در سطح‌هایِ دیگر»: شخصیتِ r322 + دفترچهٔ نبرد + سابقهٔ آزمون
#   در سه سطحی که تا امروز فقط «خالی» دیده بودند:
#     A. duel-setup با دفترچهٔ واقعی (۶ رکورد: برد/باخت/مساوی/فورفیت، ۳ داورگواه،
#        یک رکوردِ فکردار) — کارتِ کارنامه + رقیبِ همیشگی + نشان‌های نبردی +
#        دفترچهٔ قابلِ کاویدن (جست‌وجوی نرمال‌شده + فیلتر + فقطِ داورگواه + مرتب‌سازی)
#     B. آزمونِ جامع با سابقه (results["exam"]/["final"]/کلیدهایِ پایه)
#     C. واژه‌های منِ پُر (۳۰ واژهٔ known + واژه‌های خطرناک — ردیف‌های واقعی)
#   ابزار: طبقهبندِ r317 (شش کلاسِ مشروع h+v) + پروبِ basis-صفرِ r319.
#   درسِ r321: fillِ React-سازگار (setterِ prototype) برایِ جست‌وجوی دفترچه.
#   درسِ ZWNJ: انتخابگر با includes('تاریخچه') — نیمفاصله تایپی در انتخابگر نمیآید.
# تکفراخوانی (الگوی r308/r318/r319/r322): open → seed → سطوح → audit → shot → close
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
DIR=/home/z/my-project/scripts
OUT=/tmp/r323-persona-levels-results.txt
mkdir -p "$EV"; : > "$OUT"

PERSONA=$(node "$DIR/r323-persona.js" champion)

sweep() { # $1 selector — طبقهبندِ h+v از فایل (درسِ r317: قالبِ JS در بش تکخطی نمیشود)
  local JS
  JS=$(sed "s|__SEL__|$1|" "$DIR/r317-sweep.js")
  agent-browser eval "$JS" 2>&1
}
basis() { agent-browser eval "$(cat "$DIR/r319-basis-zero-audit.js")" 2>&1; }
shot() { agent-browser screenshot "$EV/$1" >/dev/null 2>&1; }
stage() { # $1 برچسب — بستهٔ کاملِ ممیزی
  echo "-- $1" | tee -a "$OUT"
  sweep "body" | tee -a "$OUT"
  basis | tee -a "$OUT"
}

click_tool() { # $1 عنوانِ کارتِ ابزار — تطبیقِ بی‌نیمفاصله (درسِ r319: ZWNJ تایپی در انتخابگر نمیآید)
  agent-browser eval "(()=>{const g=document.querySelector('[aria-label=\"ابزارهای یادگیری\"]');if(!g)return 'NO-GRID';const b=[...g.querySelectorAll('button')].find(x=>(x.textContent||'').replace(/\\u200c/g,'').includes('$1'));if(!b)return 'NO-BTN';b.click();return 'clicked';})()" 2>&1
}
dispatch() { agent-browser eval "window.dispatchEvent(new Event(\"$1\")); 'ok'" >/dev/null 2>&1; }
back_home() { agent-browser eval "window.dispatchEvent(new Event('open-duel')); window.dispatchEvent(new Event('close-duel')); 'ok'" >/dev/null 2>&1; }

agent-browser open "$BASE" >/dev/null 2>&1
agent-browser set viewport 390 844 >/dev/null 2>&1
agent-browser wait 'body' >/dev/null 2>&1 || true
sleep 1.5
# تزریقِ شخصیتِ قهرمان+دفترچه (JSON داده است نه کد — جایگذاریِ امن)
agent-browser eval "(()=>{localStorage.setItem('vision2-study-v1', JSON.stringify(${PERSONA})); location.reload(); return 'champion-duel-seeded';})()" >/dev/null 2>&1
sleep 4

echo "########## MOUNT PROBE ##########" | tee -a "$OUT"
agent-browser eval "(()=>{const st=JSON.parse(localStorage.getItem('vision2-study-v1')||'{}').state||{};const t=document.body.innerText;return JSON.stringify({
  user: st.userName,
  duels: (st.duelHistory||[]).length,
  weekly: !!document.querySelector('[aria-label=\"فعالیت هفتگی\"]'),
  skill: !!document.querySelector('[aria-label=\"تحلیل مهارت‌ها\"]'),
  danger: t.includes('واژه‌های خطرناک'),
  examBest: t.includes('بهترین نتیجه'),
});})()" 2>&1 | tee -a "$OUT"

echo "########## A. DUEL-SETUP WITH LEDGER (light 390) ##########" | tee -a "$OUT"
dispatch "open-duel"
sleep 2.4
# پروبِ دفترچه: ردیفها + رسیدِ داور + رقیبِ همیشگی + آمار + نشان‌ها
agent-browser eval "(()=>{const t=document.body.innerText;const imgs=[...document.querySelectorAll('.duel-card [role=\"img\"]')].map(x=>x.getAttribute('aria-label'));return JSON.stringify({
  duelCard: !!document.querySelector('.duel-card'),
  ledgerRows: t.includes('نبرد یافت شد') || t.includes('نبردِ آخر'),
  careerCard: t.includes('برد متوالی') || t.includes('بهترین امتیاز'),
  perennial: t.includes('رقیب'),
  verifiedFootnote: t.includes('با رسیدِ امضاشدهٔ داور'),
  thinkChip: imgs.some(a=>a&&a.includes('فکرِ میانگین')),
  forfeitChip: t.includes('ضربهٔ فنی'),
  verifiedChips: imgs.filter(a=>a==='داورگواه').length,
});})()" 2>&1 | tee -a "$OUT"
stage "duel-ledger-light-390"
shot r323-duel-ledger-390.png

echo "########## A2. CAVE — search «امیرمحمد» (نرمال‌شده: ۲ رکورد) ##########" | tee -a "$OUT"
agent-browser eval "(()=>{const inp=[...document.querySelectorAll('.duel-card input')].find(i=>(i.getAttribute('aria-label')||'').includes('تاریخچه'));if(!inp)return 'NO-SEARCH';const setter=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;setter.call(inp,'امیرمحمد');inp.dispatchEvent(new Event('input',{bubbles:true}));return 'filled';})()" 2>&1 | tee -a "$OUT"
sleep 1.4
agent-browser eval "(()=>{const t=document.body.innerText;const m=t.match(/(\S+)\s*نبرد یافت شد/);return JSON.stringify({found: m?m[1]:null, hasClear: t.includes('پاک‌کردن فیلترها')});})()" 2>&1 | tee -a "$OUT"
stage "duel-cave-search"
shot r323-duel-cave-search-390.png
agent-browser eval "(()=>{const b=[...document.querySelectorAll('.duel-card button')].find(x=>x.textContent?.includes('پاک‌کردن فیلترها'));if(b)b.click();return 'cleared';})()" >/dev/null 2>&1
sleep 1

echo "########## A3. CAVE — «فقط داورگواه» (۳ رکورد) + مرتب‌سازی «بیشترین امتیاز» ##########" | tee -a "$OUT"
agent-browser eval "(()=>{const b=[...document.querySelectorAll('.duel-card button')].find(x=>(x.getAttribute('title')||'').includes('رسیدِ امضاشده'));if(!b)return 'NO-VERIF';b.click();return 'verified-on';})()" 2>&1 | tee -a "$OUT"
agent-browser eval "(()=>{const g=document.querySelector('[aria-label=\"مرتب‌سازی نبردها\"]');if(!g)return 'NO-SORTGROUP';const b=[...g.querySelectorAll('button')].find(x=>x.textContent?.includes('بیشترین امتیاز'));if(!b)return 'NO-SORT';b.click();return 'sorted';})()" >/dev/null 2>&1
sleep 1.4
agent-browser eval "(()=>{const t=document.body.innerText;const m=t.match(/(\S+)\s*نبرد یافت شد/);return JSON.stringify({found: m?m[1]:null, top: t.includes('۱۲۴۰')});})()" 2>&1 | tee -a "$OUT"
stage "duel-cave-verified-sorted"
shot r323-duel-cave-verified-390.png
agent-browser eval "(()=>{const b=[...document.querySelectorAll('.duel-card button')].find(x=>x.textContent?.includes('پاک‌کردن فیلترها'));if(b)b.click();return 'cleared';})()" >/dev/null 2>&1
sleep 1

echo "########## B. EXAM WITH HISTORY (light 390) ##########" | tee -a "$OUT"
agent-browser open "$BASE" >/dev/null 2>&1; sleep 2.4
click_tool "آزمون جامع"
sleep 2.2
# فازِ ۱ — صفحهٔ اصلیِ آزمون: دو ModeCard با بهترینِ هر مد (exam ۹۰٪ / final ۸۴٪)
agent-browser eval "(()=>{const t=document.body.innerText;return JSON.stringify({
  vocabBest: t.includes('بهترین نتیجه: ۹۰٪'),
  finalBest: t.includes('بهترین نتیجه: ۸۴٪'),
});})()" 2>&1 | tee -a "$OUT"
stage "exam-main-390"
shot r323-exam-main-390.png
# فازِ ۲ — مودِ «پایان ترم»: دکمههای پایه فقط اینجا بهترینِ خود را دارند
agent-browser eval "(()=>{const b=[...document.querySelectorAll('button')].find(x=>(x.textContent||'').includes('آزمون جامع پایان ترم'));if(!b)return 'NO-FINALCARD';b.click();return 'final-mode';})()" 2>&1 | tee -a "$OUT"
sleep 1.6
agent-browser eval "(()=>{const card=document.querySelector('.final-exam-card');if(!card)return JSON.stringify({card:false});const btns=[...card.querySelectorAll('button[aria-pressed]')];const bests=btns.filter(b=>b.innerText.includes('بهترین')).map(b=>b.innerText.replace(/\\s+/g,' ').trim().slice(0,34));return JSON.stringify({card:true, gradeBtns:btns.length, bests});})()" 2>&1 | tee -a "$OUT"
stage "exam-final-mode-390"
shot r323-exam-final-mode-390.png

echo "########## C. MY-WORDS FULL (light 390) ##########" | tee -a "$OUT"
agent-browser open "$BASE" >/dev/null 2>&1; sleep 2.4
CT=$(click_tool "واژههای من")
echo "click_tool=$CT" | tee -a "$OUT"
sleep 2.2
agent-browser eval "(()=>{const t=document.body.innerText;const stars=[...document.querySelectorAll('button[aria-label*=\"حذف\"]')].length;return JSON.stringify({
  onMyWords: t.includes('واژه‌نامهٔ شخصی') || stars>0,
  starRows: stars,
  count30: t.includes('۳۰'),
});})()" 2>&1 | tee -a "$OUT"
stage "my-words-full-390"
shot r323-my-words-full-390.png

echo "########## A4. DUEL LEDGER — DARK 390 ##########" | tee -a "$OUT"
agent-browser open "$BASE" >/dev/null 2>&1; sleep 2.4
agent-browser eval "(()=>{localStorage.setItem('theme','dark');location.reload();return 'dark-set';})()" >/dev/null 2>&1
sleep 4
dispatch "open-duel"
sleep 2.4
stage "duel-ledger-dark-390"
shot r323-duel-ledger-dark-390.png
agent-browser eval "(()=>{localStorage.setItem('theme','light');return 'light-back';})()" >/dev/null 2>&1

echo "########## A5. DUEL LEDGER — DESKTOP 1280 ##########" | tee -a "$OUT"
agent-browser set viewport 1280 900 >/dev/null 2>&1
sleep 2
agent-browser eval "(()=>{location.reload();return 'reload';})()" >/dev/null 2>&1
sleep 4
dispatch "open-duel"
sleep 2.4
stage "duel-ledger-desktop-1280"
shot r323-duel-ledger-1280.png

agent-browser close >/dev/null 2>&1
pkill -f "chrome" 2>/dev/null || true
echo "== done ==" | tee -a "$OUT"
echo "== خلاصه در $OUT =="
