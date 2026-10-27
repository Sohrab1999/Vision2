#!/usr/bin/env bash
# ------------------------------------------------------------------
# r449 — «شاهدِ موبایلِ کارتِ گواهیِ آزمونِ جامع: خانوادهٔ دیپلم در بندِ ۳۹۰px»
# پنجاهوچهارمین مصرفکنندهٔ qa-lib.sh. بندِ ①ِ r448 — خانوادهٔ دیپلم
# (certificate=true) هرگز زیرِ ۱۲۸۰ دیده نشده بود.
# مسیر: خانه → کارتِ «آزمون جامع» → ModeCardِ «آزمون جامع پایان ترم» →
#   پایهٔ هفتم (کوتاهترین استخرِ واقعی: ۱۰ سؤال از درس ۱۰) → «بدون تایمر»
#   → شروع. immediate=false (حالتِ آزمون: «پاسخ‌ها در پایان نمایش داده
#   میشوند» + دکمهٔ «بعدی/پایان و نتیجه»). گواهی: کاغذِ سفید با مُهرِ
#   چرخیده (cert-seal)، نامِ شخصی، حلقهٔ درصد، قرصِ گرادیانی، ردیفِ
#   شکستِ بانک (درس دهم)، چهار دکمه و ردیفِ ضمیمه (resumeDoor).
# کشفِ منبعی برایِ داوریِ زنده: «pink» (accentِ پایهٔ هفتم) در
#   CERT_ACCENTS عضو نیست ← سقوطِ امردیِ مستند (خطِ fallback).
# قراردادِ رویدادِ منبع: آزمونِ پایانترم «رویدادِ شروع» ندارد؛ اما
#   هر پایان exam_done میشلیکد (resultKeyStr با «final-» آغاز میشود) و
#   attemptِ امضاشده با category=final-7 POST میشود.
# صحنهٔ E (قراردادِ r448 رویِ میزبانِ گواهی): «تلاش مجدد» → موتورِ «1 / 10»
#   بیِ هیچ شلیکِ نو؛ راندِ دوم کامل → attemptِ دوم.
# LEARN_MODE=1: سریالهایِ کارتِ گواهی را در شب و روز میگیرد (رانِ learn).
# پیشفرض (۰): با سریالهایِ قفلشده داوری میکند (رانِ lock).
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
OUT=/tmp/r449-cert-witness.txt
QA_SEED_FILE=/tmp/r449-witness-seed-eval.js
: > "$OUT"

source /home/z/my-project/scripts/qa-lib.sh

probe(){ agent-browser eval "$1" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

click_by_label(){ agent-browser eval "(()=>{let b=document.querySelector('[aria-label=\"$1\"]');if(!b||b.getBoundingClientRect().width===0){b=[...document.querySelectorAll('button')].find((x)=>(x.innerText||'').replace(/\s+/g,' ').trim()==='$1'&&x.getBoundingClientRect().width>0);}if(!b)return 'NO-BTN:$1';b.click();return 'CLICKED:$1';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

click_card(){ agent-browser eval "(()=>{const b=[...document.querySelectorAll('button')].find((x)=>(x.innerText||'').includes('$1')&&x.getBoundingClientRect().width>0);if(!b)return 'NO-BTN:$1';b.click();return 'CLICKED:$1';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

dismiss_install(){ probe "(()=>{const b=document.querySelector('[aria-label=\"بستن پیشنهاد نصب\"]');if(b&&b.getBoundingClientRect().width>0){b.click();return 'INSTALL-CARD-DISMISSED';}return 'NO-INSTALL-CARD';})()"; sleep 1; }

# ---- سریالهایِ قفلشدهٔ موتور (میراثِ r446/r447 — چیپِ زمردیِ خانواده):
DARK_PROG_BG="rgba(6, 55, 40, 0.35)"; DARK_PROG_INK="rgb(110, 231, 183)"
LIGHT_PROG_BG="lab(97.8462 -6.94966 1.85487)"; LIGHT_PROG_INK="lab(44.4871 -41.0396 11.0361)"
# ---- سریالهایِ گواهی (قفلشده در رانهایِ learn این راند): «کاغذ» در شب تیره میشود —
#      .dark .certificate-card { background-color:#1c1917 } در globals.css (مکانیزمِ منبعی).
LOCK_CERT_BG_D="rgb(28, 25, 23)"; LOCK_CERT_BG_L="rgb(255, 255, 255)"
LOCK_HEAD_INK_D="rgb(231, 229, 228)"; LOCK_HEAD_INK_L="lab(2.75381 0 0)"
LOCK_NAME_INK_D="rgb(252, 211, 77)"; LOCK_NAME_INK_L="lab(37.8822 37.1699 52.2718)"
LOCK_PCT_INK_D="rgb(236, 234, 230)"; LOCK_PCT_INK_L="lab(15.0353 1.96067 1.53427)"
LOCK_SEAL_IMG_D="linear-gradient(to right bottom in oklab, rgb(146, 64, 14) 0%, rgb(194, 65, 12) 100%)"
LOCK_SEAL_IMG_L="linear-gradient(to right bottom, rgb(146, 64, 14) 0%, lab(46.4615 57.7275 70.8507) 100%)"
LOCK_PILL_IMG_D="linear-gradient(to left in oklab, rgb(146, 64, 14) 0%, rgb(194, 65, 12) 100%)"
LOCK_PILL_IMG_L="linear-gradient(to left, rgb(146, 64, 14) 0%, lab(46.4615 57.7275 70.8507) 100%)"
LOCK_TITLE_INK_D=""; LOCK_TITLE_INK_L=""

# ---- داورِ ورودِ موتور در حالتِ آزمون (immediate=false — $1 صحنه · $2 DARK|LIGHT) ----
judge_exam_engine(){
  local PROG_BG PROG_INK L="${LEARN_MODE:-0}" TITLE_INK
  if [ "$2" = DARK ]; then PROG_BG="$DARK_PROG_BG"; PROG_INK="$DARK_PROG_INK"; else PROG_BG="$LIGHT_PROG_BG"; PROG_INK="$LIGHT_PROG_INK"; fi
  probe "(()=>{const errs=[];const W=(t,a)=>{if(t!==a)errs.push(t+'!='+a);};const title=[...document.querySelectorAll('span')].find(s=>(s.textContent||'').trim()==='آزمون پایان‌ترم پایهٔ هفتم'&&s.getBoundingClientRect().width>0);if(!title)errs.push('NO-TITLE');const chip=[...document.querySelectorAll('span')].find(s=>(s.textContent||'').trim()==='1 / 10'&&s.getBoundingClientRect().width>0);if(!chip)errs.push('NO-CHIP:1/10');const hint=[...document.querySelectorAll('span')].find(s=>(s.textContent||'').includes('پاسخ‌ها در پایان نمایش داده می‌شوند')&&s.getBoundingClientRect().width>0);if(!hint)errs.push('NO-EXAM-HINT');const opts=[...document.querySelectorAll('[data-quiz-option]')].filter(b=>b.getBoundingClientRect().width>0);if(opts.length!==4)errs.push('OPTS:'+opts.length);const nxt=[...document.querySelectorAll('[data-quiz-next]')].find(b=>b.getBoundingClientRect().width>0);if(!nxt)errs.push('NO-NEXT');else{const t=(nxt.innerText||'').trim();if(!t.includes('بعدی'))errs.push('NEXT-TXT:'+t);}const fb=document.querySelector('[data-quiz-feedback]');if(fb)errs.push('FEEDBACK-IN-EXAM-MODE');const q=document.querySelector('p.en-text');if(!q||!(q.textContent||'').trim())errs.push('NO-QUESTION');const docOver=document.documentElement.scrollWidth>window.innerWidth+1;if(docOver)errs.push('DOC-OVERX');const ccs=chip?getComputedStyle(chip):null;const tcs=title?getComputedStyle(title):null;if('$L'==='1'){return 'LEARN-$1:'+JSON.stringify({titleInk:tcs?tcs.color:'',progBg:ccs?ccs.backgroundColor:'',progInk:ccs?ccs.color:'',q:(q?q.textContent||'':'').slice(0,40)});}if(ccs){W(ccs.backgroundColor,'$PROG_BG');W(ccs.color,'$PROG_INK');}return errs.length?('FAIL-$1:'+errs.join('|')):('$1-OK');})()"
}

# ---- داورِ کارتِ گواهی (هستهٔ راند — $1 صحنه · $2 DARK|LIGHT) ----
judge_cert(){
  local CERT_BG HEAD_INK NAME_INK PCT_INK SEAL_IMG PILL_IMG L="${LEARN_MODE:-0}"
  if [ "$2" = DARK ]; then CERT_BG="$LOCK_CERT_BG_D"; HEAD_INK="$LOCK_HEAD_INK_D"; NAME_INK="$LOCK_NAME_INK_D"; PCT_INK="$LOCK_PCT_INK_D"; SEAL_IMG="$LOCK_SEAL_IMG_D"; PILL_IMG="$LOCK_PILL_IMG_D"; else CERT_BG="$LOCK_CERT_BG_L"; HEAD_INK="$LOCK_HEAD_INK_L"; NAME_INK="$LOCK_NAME_INK_L"; PCT_INK="$LOCK_PCT_INK_L"; SEAL_IMG="$LOCK_SEAL_IMG_L"; PILL_IMG="$LOCK_PILL_IMG_L"; fi
  probe "(()=>{const errs=[];const W=(t,a)=>{if(t!==a)errs.push(t+'!='+a);};const card=document.querySelector('.certificate-card');if(!card)return 'FAIL-$1:NO-CERT-CARD';const seal=card.querySelector('[data-testid=\"cert-seal\"]');if(!seal)errs.push('NO-SEAL');else{const sr=getComputedStyle(seal);const rot=(sr.rotate&&sr.rotate!=='none')?sr.rotate:(sr.transform||'none');if(!/matrix|rotate|deg/.test(rot)||rot==='none')errs.push('SEAL-NOT-ROTATED:'+rot);const rad=parseFloat(sr.borderTopLeftRadius);if(!(rad>1000))errs.push('SEAL-NOT-ROUND:'+sr.borderTopLeftRadius);}const head=[...card.querySelectorAll('div')].find(d=>(d.textContent||'').includes('WEBBOOK CERTIFICATE')&&(d.textContent||'').includes('وب‌کتاب ویژن دو'));if(!head)errs.push('NO-HEADER');const name=card.querySelector('[data-testid=\"cert-name\"]');if(!name)errs.push('NO-NAME');else{const nt=(name.textContent||'').trim();if(!nt.startsWith('گواهیِ عملکردِ آرش-قهرمان'))errs.push('NAME-TXT:'+nt);}const pct=[...card.querySelectorAll('div')].find(d=>String(d.className).includes('text-2xl')&&/٪$/.test((d.textContent||'').trim()));if(!pct)errs.push('NO-PCT');const counter=[...card.querySelectorAll('div')].find(d=>/^\d+\/10$/.test((d.textContent||'').trim()));if(!counter)errs.push('NO-COUNTER');const pill=[...card.querySelectorAll('div')].find(d=>(d.textContent||'').trim()==='آزمون پایان‌ترم پایهٔ هفتم');if(!pill)errs.push('NO-PILL');const footer=[...card.querySelectorAll('p')].find(p=>(p.textContent||'').includes('تاریخ اخذ:'));if(!footer)errs.push('NO-FOOTER');else if(!((footer.textContent||'').includes('پایهٔ هفتم')))errs.push('FOOTER-GRADE-MISS');const group=[...card.querySelectorAll('div')].find(d=>(d.textContent||'').includes('درس دهم')&&String(d.className).includes('border-stone-100'));if(!group)errs.push('NO-GROUP-ROW');const share=[...card.querySelectorAll('button')].find(b=>(b.innerText||'').includes('اشتراک‌گذاری نتیجه'));if(!share)errs.push('NO-SHARE');const dl=[...card.querySelectorAll('button')].find(b=>(b.innerText||'').includes('دانلود تصویر نتیجه'));if(!dl)errs.push('NO-DOWNLOAD');const retry=[...card.querySelectorAll('button')].find(b=>(b.innerText||'').trim()==='تلاش مجدد');if(!retry)errs.push('NO-RETRY');const back=[...card.querySelectorAll('button')].find(b=>(b.innerText||'').trim()==='بازگشت');if(!back)errs.push('NO-BACK');const resume=document.querySelector('[data-testid=\"results-resume-row\"]');if(!resume)errs.push('NO-RESUME-ROW');const rev=[...document.querySelectorAll('div')].find(d=>String(d.className).includes('max-h-[46vh]')&&String(d.className).includes('overflow-y-auto'));const reviewQs=rev?[...rev.querySelectorAll('p.en-text')].filter(p=>p.getBoundingClientRect().width>0):[];if(reviewQs.length!==10)errs.push('REVIEW-QS:'+reviewQs.length);const docOver=document.documentElement.scrollWidth>window.innerWidth+1;if(docOver)errs.push('DOC-OVERX');const ccs=card?getComputedStyle(card):null;const hcs=head?getComputedStyle(head):null;const ncs=name?getComputedStyle(name):null;const pcs=pct?getComputedStyle(pct):null;const scs=seal?getComputedStyle(seal):null;const glcs=pill?getComputedStyle(pill):null;if('$L'==='1'){return 'LEARN-$1:'+JSON.stringify({certBg:ccs?ccs.backgroundColor:'',headInk:hcs?hcs.color:'',nameInk:ncs?ncs.color:'',pctInk:pcs?pcs.color:'',sealImg:scs?scs.backgroundImage:'',pillImg:glcs?glcs.backgroundImage:'',pct:(pct?pct.textContent:'').trim(),counter:(counter?counter.textContent:'').trim(),groups:(group?group.textContent:'').slice(0,60)});}if(ccs)W(ccs.backgroundColor,'$CERT_BG');if(hcs)W(hcs.color,'$HEAD_INK');if(ncs)W(ncs.color,'$NAME_INK');if(pcs)W(pcs.color,'$PCT_INK');if(scs)W(scs.backgroundImage,'$SEAL_IMG');if(glcs)W(glcs.backgroundImage,'$PILL_IMG');return errs.length?('FAIL-$1:'+errs.join('|')):('$1-OK'+(resume?'|RESUME-OK':''));})()"
}

# ---- داورِ بازگشتِ «تلاش مجدد» به موتور (قراردادِ r448 رویِ میزبانِ گواهی) ----
judge_retry_exam(){
  local PROG_BG PROG_INK L="${LEARN_MODE:-0}"
  if [ "$2" = DARK ]; then PROG_BG="$DARK_PROG_BG"; PROG_INK="$DARK_PROG_INK"; else PROG_BG="$LIGHT_PROG_BG"; PROG_INK="$LIGHT_PROG_INK"; fi
  probe "(()=>{const errs=[];const W=(t,a)=>{if(t!==a)errs.push(t+'!='+a);};const seal=document.querySelector('.certificate-card');if(seal&&seal.getBoundingClientRect().width>0)errs.push('CERT-STILL-THERE');const back=[...document.querySelectorAll('button')].find(b=>(b.innerText||'').trim()==='بازگشت'&&b.getBoundingClientRect().width>0);if(back)errs.push('BACK-STILL-THERE');const title=[...document.querySelectorAll('span')].find(s=>(s.textContent||'').trim()==='آزمون پایان‌ترم پایهٔ هفتم'&&s.getBoundingClientRect().width>0);if(!title)errs.push('NO-TITLE');const chip=[...document.querySelectorAll('span')].find(s=>(s.textContent||'').trim()==='1 / 10'&&s.getBoundingClientRect().width>0);if(!chip)errs.push('NO-CHIP:1/10');const opts=[...document.querySelectorAll('[data-quiz-option]')].filter(b=>b.getBoundingClientRect().width>0);if(opts.length!==4)errs.push('OPTS:'+opts.length);const hint=[...document.querySelectorAll('span')].find(s=>(s.textContent||'').includes('پاسخ‌ها در پایان نمایش داده می‌شوند'));if(!hint)errs.push('NO-HINT');const q=document.querySelector('p.en-text');if(!q)errs.push('NO-QUESTION');const bar=[...document.querySelectorAll('div')].find(d=>d.style&&d.style.width!==''&&String(d.className).includes('rounded-full')&&d.getBoundingClientRect().height>0&&d.getBoundingClientRect().height<12);const barW=bar?bar.style.width:'';if(barW&&barW!=='0%'&&barW!=='0px')errs.push('PROGRESS-NOT-RESET:'+barW);const docOver=document.documentElement.scrollWidth>window.innerWidth+1;if(docOver)errs.push('DOC-OVERX');const ccs=chip?getComputedStyle(chip):null;if('$L'==='1'){return 'LEARN-$1:'+JSON.stringify({progBg:ccs?ccs.backgroundColor:'',progInk:ccs?ccs.color:''});}if(ccs){W(ccs.backgroundColor,'$PROG_BG');W(ccs.color,'$PROG_INK');}return errs.length?('FAIL-$1:'+errs.join('|')):('$1-OK');})()"
}

# ---- داورِ تنظیماتِ پایانترم ($2 = G11-DEFAULT | G7) ----
judge_final_config(){ # $1 صحنه · $2 حالت
  local WANT G7_PRESSED G11_PRESSED MODE="${2:-G7}"
  if [ "$MODE" = "G11-DEFAULT" ]; then WANT="پایهٔ یازدهم"; G7_PRESSED="false"; G11_PRESSED="true"; else WANT="پایهٔ هفتم"; G7_PRESSED="true"; G11_PRESSED="false"; fi
  probe "(()=>{const errs=[];const h1=[...document.querySelectorAll('h1')].find(h=>(h.textContent||'').trim()==='آزمون جامع پایان ترم'&&h.getBoundingClientRect().width>0);if(!h1)errs.push('NO-H1');const start=[...document.querySelectorAll('button')].find(b=>(b.innerText||'').includes('شروع آزمون پایان‌ترم '+('$MODE'==='G11-DEFAULT'?'پایهٔ یازدهم':'پایهٔ هفتم'))&&b.getBoundingClientRect().width>0);if(!start)errs.push('NO-START:$WANT');const g7=[...document.querySelectorAll('button')].find(b=>(b.innerText||'').includes('پایهٔ هفتم')&&b.getAttribute('aria-pressed')!==null);if(!g7)errs.push('NO-G7-CARD');else if(g7.getAttribute('aria-pressed')!=='$G7_PRESSED')errs.push('G7-PRESSED:'+g7.getAttribute('aria-pressed'));const g11=[...document.querySelectorAll('button')].find(b=>(b.innerText||'').includes('پایهٔ یازدهم')&&b.getAttribute('aria-pressed')!==null);if(!g11)errs.push('NO-G11-CARD');else if(g11.getAttribute('aria-pressed')!=='$G11_PRESSED')errs.push('G11-PRESSED:'+g11.getAttribute('aria-pressed'));const docOver=document.documentElement.scrollWidth>window.innerWidth+1;if(docOver)errs.push('DOC-OVERX');return errs.length?('FAIL-$1:'+errs.join('|')):('$1-OK');})()"
}

answer_q(){ agent-browser eval "(()=>{const b=document.querySelector('[data-quiz-option=\"0\"]');if(!b||b.getBoundingClientRect().width===0)return 'NO-OPT';b.click();return 'CHOSEN';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

next_q(){ agent-browser eval "(()=>{const b=document.querySelector('[data-quiz-next]');if(!b||b.getBoundingClientRect().width===0)return 'NO-NEXT';b.click();return 'NEXT';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

run_exam(){ for i in 1 2 3 4 5 6 7 8 9 10; do answer_q; sleep 0.9; next_q; sleep 1.1; done; }

ledger(){ node -e "const {PrismaClient}=require('@prisma/client');const db=new PrismaClient();const d=new Date();const key=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');const one=(n)=>db.eventDay.findFirst({where:{name:n,day:key}}).then((r)=>[n,r?r.count:0]);Promise.all([one('exam_done'),one('quiz_done')]).then((rows)=>{rows.forEach(([n,c])=>console.log(n.toUpperCase()+'('+key+'):'+c));return db.quizAttempt.count();}).then((a)=>{console.log('ATTEMPTS-NOW:'+a);return db.quizAttempt.findMany({where:{category:'final-7'},orderBy:{id:'asc'}});}).then((rows)=>{console.log('FINAL7-ATTEMPTS:'+JSON.stringify(rows.map((r)=>({lesson:r.lesson,category:r.category,total:r.total,percent:r.percent}))));return db.eventDay.findFirst({where:{name:'drill_due_jump'}});}).then((r)=>{console.log('LEDGER:',JSON.stringify(r?{name:r.name,count:r.count,day:r.day}:null));return db.\$disconnect();}).catch((e)=>{console.log('LEDGER-ERR:'+e.message);process.exit(0);})" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

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

SECOND_ROUND="${SECOND_ROUND:-0}"

echo "########## PRE) دفترِ آغازین" | tee -a "$OUT"
ledger

echo "########## A) خانه → آزمون جامع → تنظیماتِ پایانترم → پایهٔ هفتم + بدونِ تایمر" | tee -a "$OUT"
boot
click_card "آزمون جامع"; sleep 2.5
click_card "آزمون جامع پایان ترم"; sleep 1.5
judge_final_config CONFIG-G11-DEFAULT G11-DEFAULT
click_card "پایهٔ هفتم"; sleep 1
click_card "بدون تایمر"; sleep 1
judge_final_config CONFIG-G7-SELECTED
qa_wait_toasts_clear

echo "########## B) ورود به موتورِ آزمونِ ۱۰سؤالی (حالتِ آزمون — شب و روشن)" | tee -a "$OUT"
click_card "شروع آزمون پایان‌ترم"; sleep 2.5
qa_to_dark
sleep 1
LEARN_MODE="${LEARN_MODE:-0}" judge_exam_engine EXAM-ENTRY-DARK DARK
qa_wait_toasts_clear
qa_to_light
sleep 1
LEARN_MODE="${LEARN_MODE:-0}" judge_exam_engine EXAM-ENTRY-LIGHT LIGHT

echo "########## C) ده پاسخِ صادقانهٔ راندِ اول (انتخابِ نخستِ تصادفی — ایدئومِ r441)" | tee -a "$OUT"
run_exam
probe "(()=>{const seal=document.querySelector('.certificate-card');const opts=document.querySelector('[data-quiz-option]');return (seal&&!opts)?'CERT-REACHED-OK':'NOT-CERT:'+JSON.stringify({seal:!!seal,opts:!!opts});})()" | tee -a "$OUT"

echo "########## D) کارتِ گواهی — داورِ ساختاری + سریالها (شب و روشن)" | tee -a "$OUT"
qa_to_dark
sleep 1
LEARN_MODE="${LEARN_MODE:-0}" judge_cert CERT-DARK DARK
qa_wait_toasts_clear
qa_shot r449-certificate-dark.png
qa_to_light
sleep 1
LEARN_MODE="${LEARN_MODE:-0}" judge_cert CERT-LIGHT LIGHT
qa_wait_toasts_clear
qa_shot r449-certificate-light.png

if [ "$SECOND_ROUND" = "1" ]; then
  echo "########## E) قراردادِ r448 رویِ میزبانِ گواهی — «تلاش مجدد» (شب)" | tee -a "$OUT"
  qa_to_dark
  sleep 1
  click_by_label "تلاش مجدد"; sleep 2
  LEARN_MODE="${LEARN_MODE:-0}" judge_retry_exam RETRY-EXAM-DARK DARK
  qa_wait_toasts_clear
  qa_shot r449-retry-exam-dark.png
  echo "########## F) دفترِ میانپروازی — exam_done باید «کماکان» ۱ باشد" | tee -a "$OUT"
  ledger
  echo "########## G) راندِ دومِ کامل → گواهیِ دوم" | tee -a "$OUT"
  run_exam
  probe "(()=>{const seal=document.querySelector('.certificate-card');const opts=document.querySelector('[data-quiz-option]');return (seal&&!opts)?'CERT2-REACHED-OK':'NOT-CERT2:'+JSON.stringify({seal:!!seal,opts:!!opts});})()" | tee -a "$OUT"
  qa_wait_toasts_clear
  LEARN_MODE="${LEARN_MODE:-0}" judge_cert CERT2-DARK DARK
  qa_shot r449-certificate-round2-dark.png
  qa_to_light
  sleep 1
  LEARN_MODE="${LEARN_MODE:-0}" judge_cert CERT2-LIGHT LIGHT
  qa_shot r449-certificate-round2-light.png
fi

echo "########## H) خروجِ «بازگشت» → تنظیماتِ پایانترمِ سالم" | tee -a "$OUT"
click_by_label "بازگشت"; sleep 1.5
judge_final_config EXIT-CONFIG-OK G7

echo "########## I) دفترِ نهایی" | tee -a "$OUT"
ledger

agent-browser close >/dev/null 2>&1 || true
echo "########## WITNESS-DONE" | tee -a "$OUT"
