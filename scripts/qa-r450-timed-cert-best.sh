#!/usr/bin/env bash
# ------------------------------------------------------------------
# r450 — «شاهدِ موبایلِ گواهیِ تایمدار + بازخوانیِ رکورد»
# پنجاهوپنجمین مصرفکنندهٔ qa-lib.sh. بندِ ①ِ r449 (گواهیِ تایمدار) +
# بندِ ② (بازخوانیِ «بهترین نتیجهٔ شما» پس از راندِ واقعی) — یک مسیر، دو حکم.
# صحنهٔ A: خانه → آزمون جامع → پایانترم → پایهٔ هفتم (تایمرِ پیشفرضِ روشن —
#   «با تایمر» دست نمیخوریم) → شروع.
# صحنهٔ B: ورودِ موتورِ تایمدار — هشتمین چهرهٔ چیپِ هدر: شمارشِ معکوسِ
#   «7:30» (۴۵۰s = ۱۰×۴۵) با dir=ltr و سریالِ سنگیِ آرام (نه قرمزِ <۶۰ —
#   آن چهره در راندِ واقعیِ ۱۰سؤالی دستنیافتنی است: ثبتِ صادقانه) +
#   زندهبودنِ شمارش: دو خوانش با ۲.۲s فاصله باید متفاوت باشند. شب و روشن.
# صحنهٔ C: ده پاسخِ صادقانه → کارتِ گواهیِ تایمدار با سریالهایِ قفلشدهٔ
#   r449 (کاغذِ شبِ #1c1917 / روزِ سفید) — داوریِ سبکِ تکحالتی (روشن) + شات.
# صحنهٔ D (بازخوانیِ رکورد): خروجِ «بازگشت» → تنظیماتِ پایانترم باید سه
#   راویِ هماهنگ داشته باشد: بنرِ «🎓 بهترین نتیجهٔ شما در آزمون پایان ترم:
#   X٪ (Y از ۱۰)» + کارتِ پایهٔ هفتم «بهترین: X٪» + ModeCard «بهترین نتیجه:
#   X٪» — هر سه با هم برابر و برابر با درصدِ واقعیِ راند (خودسازگاریِ
#   درون-DOM به ایدئومِ r441) + حاشیهٔ بنر با درصدِ خواندهشده همساز باشد
#   (≥۷۰ زمردی، وگرنه کهربایی — خطِ 451).
# صحنهٔ E: دفترِ صادق — exam_done=۱، quiz_done=۱، یک attemptِ final-7 که
#   درصدِ DB آن باید با درصدِ DOM برابر باشد (قفلِ میان-رسانه).
# LEARN_MODE=1: سریالِ چیپِ تایمر را در شب و روز میگیرد. پیشفرض: داوری.
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
OUT=/tmp/r450-timed-witness.txt
QA_SEED_FILE=/tmp/r450-witness-seed-eval.js
: > "$OUT"

source /home/z/my-project/scripts/qa-lib.sh

probe(){ agent-browser eval "$1" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

click_by_label(){ agent-browser eval "(()=>{let b=document.querySelector('[aria-label=\"$1\"]');if(!b||b.getBoundingClientRect().width===0){b=[...document.querySelectorAll('button')].find((x)=>(x.innerText||'').replace(/\s+/g,' ').trim()==='$1'&&x.getBoundingClientRect().width>0);}if(!b)return 'NO-BTN:$1';b.click();return 'CLICKED:$1';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

click_card(){ agent-browser eval "(()=>{const b=[...document.querySelectorAll('button')].find((x)=>(x.innerText||'').includes('$1')&&x.getBoundingClientRect().width>0);if(!b)return 'NO-BTN:$1';b.click();return 'CLICKED:$1';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

dismiss_install(){ probe "(()=>{const b=document.querySelector('[aria-label=\"بستن پیشنهاد نصب\"]');if(b&&b.getBoundingClientRect().width>0){b.click();return 'INSTALL-CARD-DISMISSED';}return 'NO-INSTALL-CARD';})()"; sleep 1; }

# ---- سریالهایِ چیپِ تایمر (قفلشده در رانِ learn — چهرهٔ سنگیِ آرام):
LOCK_TMR_BG_D="rgb(40, 36, 31)"; LOCK_TMR_BG_L="lab(96.5286 -0.0991821 0.364268)"
LOCK_TMR_INK_D="rgb(168, 162, 155)"; LOCK_TMR_INK_L="lab(35.5168 1.08604 4.07829)"
# ---- سریالهایِ گواهی (میراثِ قفلشدهٔ r449):
LOCK_CERT_BG_L="rgb(255, 255, 255)"
LOCK_NAME_INK_L="lab(37.8822 37.1699 52.2718)"

# ---- داورِ ورودِ موتورِ تایمدار ($1 صحنه · $2 DARK|LIGHT) ----
# چیپِ تایمر = span با متنِ m:ss و dir=ltr؛ حکمِ زندهبودن: متنِ لحظهٔ
# داوری نباید «7:30»ی بایگانیشده باشد (span.__r450t0).
judge_timed_engine(){
  local TMR_BG TMR_INK L="${LEARN_MODE:-0}"
  if [ "$2" = DARK ]; then TMR_BG="$LOCK_TMR_BG_D"; TMR_INK="$LOCK_TMR_INK_D"; else TMR_BG="$LOCK_TMR_BG_L"; TMR_INK="$LOCK_TMR_INK_L"; fi
  probe "(()=>{const errs=[];const W=(t,a)=>{if(t!==a)errs.push(t+'!='+a);};const title=[...document.querySelectorAll('span')].find(s=>(s.textContent||'').trim()==='آزمون پایان‌ترم پایهٔ هفتم'&&s.getBoundingClientRect().width>0);if(!title)errs.push('NO-TITLE');const tmr=[...document.querySelectorAll('span')].find(s=>/^\\d+:\\d{2}$/.test((s.textContent||'').trim())&&s.getAttribute('dir')==='ltr'&&s.getBoundingClientRect().width>0);if(!tmr)errs.push('NO-TIMER-CHIP');const t0=(tmr?(tmr.textContent||'').trim():'');const tp=t0.split(':');const tsec=(tp.length===2)?(+tp[0])*60+(+tp[1]):-1;if(!(tsec>0&&tsec<=450))errs.push('TMR-NOT-FRESH:'+t0);window.__r450t0=t0;const chip=[...document.querySelectorAll('span')].find(s=>(s.textContent||'').trim()==='1 / 10'&&s.getBoundingClientRect().width>0);if(!chip)errs.push('NO-CHIP:1/10');const hint=[...document.querySelectorAll('span')].find(s=>(s.textContent||'').includes('پاسخ‌ها در پایان نمایش داده می‌شوند'));if(!hint)errs.push('NO-HINT');const opts=[...document.querySelectorAll('[data-quiz-option]')].filter(b=>b.getBoundingClientRect().width>0);if(opts.length!==4)errs.push('OPTS:'+opts.length);const nxt=document.querySelector('[data-quiz-next]');if(!nxt)errs.push('NO-NEXT');const fb=document.querySelector('[data-quiz-feedback]');if(fb)errs.push('FEEDBACK-IN-EXAM');const docOver=document.documentElement.scrollWidth>window.innerWidth+1;if(docOver)errs.push('DOC-OVERX');const tcs=tmr?getComputedStyle(tmr):null;if('$L'==='1'){return 'LEARN-$1:'+JSON.stringify({tmrBg:tcs?tcs.backgroundColor:'',tmrInk:tcs?tcs.color:'',t0});}if(tcs){W(tcs.backgroundColor,'$TMR_BG');W(tcs.color,'$TMR_INK');}return errs.length?('FAIL-$1:'+errs.join('|')):('$1-OK');})()"
}

# ---- حکمِ زندهبودنِ شمارش (دترمینیستیک — درونِ یک eval با Promiseِ ۱۶۰۰ms؛
# درسِ رانِ learn: دو evalِ پشتسرهم میتوانند در همان ثانیه بیفتند — مسابق*X)
judge_timer_alive(){
  probe "(()=>new Promise((res)=>{const find=()=>[...document.querySelectorAll('span')].find(s=>/^\\d+:\\d{2}$/.test((s.textContent||'').trim())&&s.getAttribute('dir')==='ltr'&&s.getBoundingClientRect().width>0);const a=find();if(!a)return res('NO-TIMER-NOW');const t0=(a.textContent||'').trim();setTimeout(()=>{const b=find();if(!b)return res('NO-TIMER-AFTER');const now=(b.textContent||'').trim();res((now!==t0)?('TIMER-TICKING-OK:'+t0+'->'+now):('TIMER-FROZEN:'+now));},1600);}))()"
}

# ---- داورِ سبکِ کارتِ گواهی (سریالهایِ r449 — حالتِ روشن) ----
judge_cert_light(){
  probe "(()=>{const errs=[];const W=(t,a)=>{if(t!==a)errs.push(t+'!='+a);};const card=document.querySelector('.certificate-card');if(!card)return 'FAIL-$1:NO-CERT-CARD';const seal=card.querySelector('[data-testid=\"cert-seal\"]');if(!seal)errs.push('NO-SEAL');const name=card.querySelector('[data-testid=\"cert-name\"]');if(!name||!(name.textContent||'').startsWith('گواهیِ عملکردِ آرش-قهرمان'))errs.push('NAME-BAD');const pct=[...card.querySelectorAll('div')].find(d=>String(d.className).includes('text-2xl')&&/٪$/.test((d.textContent||'').trim()));if(!pct)errs.push('NO-PCT');const counter=[...card.querySelectorAll('div')].find(d=>/^\\d+\\/10$/.test((d.textContent||'').trim()));if(!counter)errs.push('NO-COUNTER');const resume=document.querySelector('[data-testid=\"results-resume-row\"]');if(!resume)errs.push('NO-RESUME-ROW');const tmr=[...document.querySelectorAll('span')].find(s=>/^\\d+:\\d{2}$/.test((s.textContent||'').trim())&&s.getBoundingClientRect().width>0);if(tmr)errs.push('TIMER-STILL-THERE');const docOver=document.documentElement.scrollWidth>window.innerWidth+1;if(docOver)errs.push('DOC-OVERX');const ccs=card?getComputedStyle(card):null;const ncs=name?getComputedStyle(name):null;if(ccs)W(ccs.backgroundColor,'$LOCK_CERT_BG_L');if(ncs)W(ncs.color,'$LOCK_NAME_INK_L');window.__r450pct=(pct?(pct.textContent||'').trim():'');return errs.length?('FAIL-$1:'+errs.join('|')):('$1-OK|PCT='+window.__r450pct);})()"
}

# ---- داورِ بازخوانیِ رکورد (سه راویِ هماهنگ + حاشیهٔ همساز) ----
judge_best_recap(){ # $1 صحنه
  probe "(()=>{const errs=[];const fa='۰۱۲۳۴۵۶۷۸۹';const toEn=(s)=>String(s).replace(/[۰-۹]/g,(c)=>fa.indexOf(c));const banner=[...document.querySelectorAll('p')].find(p=>(p.textContent||'').includes('بهترین نتیجهٔ شما در آزمون پایان ترم'));if(!banner)errs.push('NO-BANNER');const bp=(banner?(banner.textContent||''):'').match(/ترم:\\s*([۰-۹]+)٪\\s*\\(([۰-۹]+)\\s*از\\s*([۰-۹]+)\\)/);if(!bp)errs.push('BANNER-FMT:'+((banner?banner.textContent:'').slice(0,70)));const g7card=[...document.querySelectorAll('button')].find(b=>(b.innerText||'').includes('پایهٔ هفتم')&&(b.innerText||'').includes('بهترین:'));if(!g7card)errs.push('NO-G7-BEST-LINE');const g7p=g7card?(g7card.innerText||'').match(/بهترین:\\s*([۰-۹]+)٪/):null;if(!g7p)errs.push('G7-BEST-FMT');const mode=[...document.querySelectorAll('button')].find(b=>(b.innerText||'').includes('آزمون جامع پایان ترم')&&(b.innerText||'').includes('بهترین نتیجه:'));if(!mode)errs.push('NO-MODECARD-BEST');const mp=mode?(mode.innerText||'').match(/بهترین نتیجه:\\s*([۰-۹]+)٪/):null;if(!mp)errs.push('MODE-BEST-FMT');if(bp&&g7p&&mp){const a=+toEn(bp[1]),b2=+toEn(g7p[1]),c=+toEn(mp[1]);if(!(a===b2&&b2===c))errs.push('RAVIES-DISAGREE:'+a+'/'+b2+'/'+c);window.__r450best=a;}const bwrap=banner?banner.closest('div'):null;const bcls=bwrap?String(bwrap.className):'';if(bp){const pv=+toEn(bp[1]);const emerald=bcls.includes('border-emerald-200');if(pv>=70&&!emerald)errs.push('BANNER-BORDER-NOT-EMERALD-AT-'+pv);if(pv<70&&!bcls.includes('border-amber-200'))errs.push('BANNER-BORDER-NOT-AMBER-AT-'+pv);}const g7pressed=[...document.querySelectorAll('button')].find(b=>(b.innerText||'').includes('پایهٔ هفتم')&&b.getAttribute('aria-pressed')==='true');if(!g7pressed)errs.push('G7-NOT-PRESSED');const docOver=document.documentElement.scrollWidth>window.innerWidth+1;if(docOver)errs.push('DOC-OVERX');return errs.length?('FAIL-$1:'+errs.join('|')):('$1-OK|BEST='+((typeof window.__r450best!=='undefined')?window.__r450best:'?')+'٪');})()"
}

answer_q(){ agent-browser eval "(()=>{const b=document.querySelector('[data-quiz-option=\"0\"]');if(!b||b.getBoundingClientRect().width===0)return 'NO-OPT';b.click();return 'CHOSEN';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

next_q(){ agent-browser eval "(()=>{const b=document.querySelector('[data-quiz-next]');if(!b||b.getBoundingClientRect().width===0)return 'NO-NEXT';b.click();return 'NEXT';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

ledger(){ node -e "const {PrismaClient}=require('@prisma/client');const db=new PrismaClient();const d=new Date();const key=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');const one=(n)=>db.eventDay.findFirst({where:{name:n,day:key}}).then((r)=>[n,r?r.count:0]);Promise.all([one('exam_done'),one('quiz_done')]).then((rows)=>{rows.forEach(([n,c])=>console.log(n.toUpperCase()+'('+key+'):'+c));return db.quizAttempt.findMany({where:{category:'final-7'},orderBy:{id:'asc'}});}).then((rows)=>{console.log('FINAL7-ATTEMPTS:'+JSON.stringify(rows.map((r)=>({lesson:r.lesson,total:r.total,percent:r.percent}))));return db.eventDay.findFirst({where:{name:'drill_due_jump'}});}).then((r)=>{console.log('LEDGER:',JSON.stringify(r?{name:r.name,count:r.count,day:r.day}:null));return db.\$disconnect();}).catch((e)=>{console.log('LEDGER-ERR:'+e.message);process.exit(0);})" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

boot(){ agent-browser close >/dev/null 2>&1 || true
pkill -f "agent-browser/browsers" 2>/dev/null; sleep 1
agent-browser open "$BASE" >/dev/null 2>&1
agent-browser set viewport 390 844 >/dev/null 2>&1
agent-browser wait 'body' >/dev/null 2>&1 || true
sleep 2
node /home/z/my-project/scripts/r338-persona.js | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>process.stdout.write(JSON.parse(s).browserEval))" > "$QA_SEED_FILE" || { echo "PERSONA-FAIL" | tee -a "$OUT"; agent-browser close >/dev/null 2>&1; exit 1; }
qa_wait_home || { agent-browser close >/dev/null 2>&1; exit 1; }
agent-browser eval "$(cat "$QA_SEED_FILE")" >/dev/null 2>&1
sleep 5
qa_seed_guard_mobile || { agent-browser close >/dev/null 2>&1; exit 1; }
dismiss_install; }

echo "########## PRE) دفترِ آغازین" | tee -a "$OUT"
ledger

echo "########## A) خانه → آزمون جامع → پایانترم → پایهٔ هفتم (تایمرِ پیشفرضِ روشن)" | tee -a "$OUT"
boot
click_card "آزمون جامع"; sleep 2.5
click_card "آزمون جامع پایان ترم"; sleep 1.5
click_card "پایهٔ هفتم"; sleep 1
probe "(()=>{const banner=[...document.querySelectorAll('p')].find(p=>(p.textContent||'').includes('بهترین نتیجهٔ شما در آزمون پایان ترم'));const g7=[...document.querySelectorAll('button')].find(b=>(b.innerText||'').includes('پایهٔ هفتم')&&b.getAttribute('aria-pressed')==='true');return JSON.stringify({freshNoBanner:!banner,g7Pressed:!!g7});})()" | tee -a "$OUT"
qa_wait_toasts_clear

echo "########## B) ورودِ موتورِ تایمدار — چیپِ «7:30» + زندهبودن (شب و روشن)" | tee -a "$OUT"
click_card "شروع آزمون پایان‌ترم"; sleep 2.5
qa_to_dark
sleep 1
LEARN_MODE="${LEARN_MODE:-0}" judge_timed_engine TIMED-ENTRY-DARK DARK
judge_timer_alive
qa_wait_toasts_clear
qa_shot r450-timed-entry-dark.png
qa_to_light
sleep 1
LEARN_MODE="${LEARN_MODE:-0}" judge_timed_engine TIMED-ENTRY-LIGHT LIGHT
judge_timer_alive
qa_wait_toasts_clear
qa_shot r450-timed-entry-light.png

echo "########## C) ده پاسخِ صادقانه → گواهیِ تایمدار (روشن — سریالِ r449)" | tee -a "$OUT"
for i in 1 2 3 4 5 6 7 8 9 10; do answer_q; sleep 0.9; next_q; sleep 1.1; done
probe "(()=>{const card=document.querySelector('.certificate-card');const opts=document.querySelector('[data-quiz-option]');return (card&&!opts)?'CERT-REACHED-OK':'NOT-CERT:'+JSON.stringify({card:!!card,opts:!!opts});})()" | tee -a "$OUT"
qa_wait_toasts_clear
judge_cert_light CERT-TIMED-LIGHT
qa_shot r450-certificate-timed-light.png

echo "########## D) خروجِ «بازگشت» → بازخوانیِ رکورد (سه راویِ هماهنگ)" | tee -a "$OUT"
click_by_label "بازگشت"; sleep 1.5
judge_best_recap BEST-RECAP
qa_wait_toasts_clear
qa_shot r450-best-recap-light.png

echo "########## E) دفترِ نهایی — درصدِ DB باید با DOM برابر باشد" | tee -a "$OUT"
ledger
probe "(()=>{const fa='۰۱۲۳۴۵۶۷۸۹';const toEn=(s)=>String(s).replace(/[۰-۹]/g,(c)=>fa.indexOf(c));const banner=[...document.querySelectorAll('p')].find(p=>(p.textContent||'').includes('بهترین نتیجهٔ شما در آزمون پایان ترم'));const bp=banner?+toEn((banner.textContent||'').match(/ترم:\\s*([۰-۹]+)٪/)[1]):null;return 'DOM-PERCENT:'+bp;})()" | tee -a "$OUT"

agent-browser close >/dev/null 2>&1 || true
echo "########## WITNESS-DONE" | tee -a "$OUT"
