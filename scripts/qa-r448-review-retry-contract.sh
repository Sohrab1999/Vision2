#!/usr/bin/env bash
# ------------------------------------------------------------------
# r448 — «شاهدِ موبایلِ قراردادِ «تلاش مجدد»: بازچرخشِ پردهٔ نتیجه به موتور»
# پنجاهوسومین مصرفکنندهٔ qa-lib.sh. بندِ ①ِ r447 — دری که هرگز رانده نشده بود.
# پیشبینیِ منبع (قفلشده از سورس، اکنون زنده داوری میشود):
#   «تلاش مجدد» → QuizResult.onRestart → useQuizRun.restart() — فقط ماشینِ
#   حالت صفر میشود (finishedRef/idx/selected/answers/finished). موتور
#   unmount نمیشود و start() لانچر دوباره صدا زده نمیشود ←
#   my_words_review_start «هرگز» دوباره شلیک نمیکند (دقیقاً +۱ از شروعِ
#   اول). اما finish() دوم completeQuizRun را دوباره میدود ← attemptِ دوم
#   POST میشود (quiz_done +۲، دو attemptِ my-words).
# صحنهٔ A: هشت ستارهٔ واقعیِ درس ۱ (میراثِ r447) → لانچر → حکمِ گروه (سریالِ
#   قفلشدهٔ r447 — لانچر دستنخورده) → شروع.
# صحنهٔ B: راندِ واقعیِ ۸سؤالیِ immediate (انتخابِ نخستِ تصادفیِ صادقانه،
#   ایدئومِ r441) → پردهٔ نتیجهٔ standardCard؛ سؤالِ اول در window.__r448Q1
#   بایگانی میشود.
# صحنهٔ C (هستهٔ راند): کلیکِ «تلاش مجدد» → داورِ بازگشت به موتور: چیپِ
#   «1 / 8»، چهار گزینه، سؤالِ «همان» سؤالِ اولِ راندِ اول (مقایسه با
#   __r448Q1)، هیچ آرتیفکتِ نتیجه (نه عنوانِ نهایی، نه دکمهٔ تلاش مجدد،
#   نه بازگشت، نه درصد، نه ردیفِ ضمیمه)؛ شب و روشن با سریالِ زمردیِ
#   r437/r438/r446/r447.
# صحنهٔ D: دفترِ میانپروازی — پیش از پایانِ راندِ دوم: my_words_review_start
#   «دقیقاً» ۱ (قراردادِ منبعِ این راند) و attempts=۱.
# صحنهٔ E: راندِ دومِ کامل (۸ پاسخِ صادقانه) → پردهٔ نتیجهٔ دوم + شاتها.
# صحنهٔ F: خروجِ «بازگشت» → لانچرِ سالم.
# صحنهٔ G: دفترِ نهایی — my_words_review_start=۱ (کماکان!)، quiz_done=۲،
#   دو attemptِ my-words با total=۸؛ ۱۳۱ drill_due_jump دستنخورده.
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
OUT=/tmp/r448-retry-witness.txt
QA_SEED_FILE=/tmp/r448-witness-seed-eval.js
: > "$OUT"

source /home/z/my-project/scripts/qa-lib.sh

probe(){ agent-browser eval "$1" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

click_by_label(){ agent-browser eval "(()=>{let b=document.querySelector('[aria-label=\"$1\"]');if(!b||b.getBoundingClientRect().width===0){b=[...document.querySelectorAll('button')].find((x)=>(x.innerText||'').replace(/\s+/g,' ').trim()==='$1'&&x.getBoundingClientRect().width>0);}if(!b)return 'NO-BTN:$1';b.click();return 'CLICKED:$1';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

click_card(){ agent-browser eval "(()=>{const b=[...document.querySelectorAll('button')].find((x)=>(x.innerText||'').includes('$1')&&x.getBoundingClientRect().width>0);if(!b)return 'NO-BTN:$1';b.click();return 'CLICKED:$1';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

dismiss_install(){ probe "(()=>{const b=document.querySelector('[aria-label=\"بستن پیشنهاد نصب\"]');if(b&&b.getBoundingClientRect().width>0){b.click();return 'INSTALL-CARD-DISMISSED';}return 'NO-INSTALL-CARD';})()"; sleep 1; }

# ---- سریالهایِ قفلشده (میراثِ r447 — لانچر و موتور دستنخوردهاند):
DARK_SUB_INK="rgb(156, 149, 140)"; DARK_START_IMG="linear-gradient(to left, lab(47.2709 42.9082 69.2966) 0%, rgb(194, 65, 12) 100%)"
LIGHT_SUB_INK="lab(44.2882 2.36151 4.27174)"; LIGHT_START_IMG="linear-gradient(to left, lab(47.2709 42.9082 69.2966) 0%, lab(46.4615 57.7275 70.8507) 100%)"
DARK_TITLE_INK="rgb(236, 234, 230)"; DARK_PROG_BG="rgba(6, 55, 40, 0.35)"; DARK_PROG_INK="rgb(110, 231, 183)"
LIGHT_TITLE_INK="lab(15.0353 1.96067 1.53427)"; LIGHT_PROG_BG="lab(97.8462 -6.94966 1.85487)"; LIGHT_PROG_INK="lab(44.4871 -41.0396 11.0361)"

# ---- داورِ لانچر (عینِ r447 — ۸ستاره، چیپِ ۸ فشرده، چیپِ ۱۵ غیرفعال) ----
judge_group(){
  local SUB_INK START_IMG L="${LEARN_MODE:-0}"
  if [ "$2" = DARK ]; then SUB_INK="$DARK_SUB_INK"; START_IMG="$DARK_START_IMG"; else SUB_INK="$LIGHT_SUB_INK"; START_IMG="$LIGHT_START_IMG"; fi
  probe "(()=>{const errs=[];const W=(t,a)=>{if(t!==a)errs.push(t+'!='+a);};const sec=document.querySelector('[aria-label=\"مرور واژه‌های نشان‌شده\"]');if(!sec)return 'FAIL-$1:NO-LAUNCHER';const h2=sec.querySelector('h2');if(!h2||(h2.textContent||'').trim()!=='مرور نشان‌شده‌ها')errs.push('H2');const p=sec.querySelector('p');const pcs=p?getComputedStyle(p):null;const grp=sec.querySelector('[role=\"group\"]');if(!grp)errs.push('NO-GROUP');let c8=null,c15=null;if(grp){c8=[...grp.querySelectorAll('button')].find(b=>(b.innerText||'').trim()==='۸');c15=[...grp.querySelectorAll('button')].find(b=>(b.innerText||'').trim()==='۱۵');if(!c8||!c15)errs.push('NO-CHIPS');if(c8&&(c8.disabled||c8.getAttribute('aria-pressed')!=='true'))errs.push('CHIP8-BAD');if(c15&&!c15.disabled)errs.push('CHIP15-ENABLED-AT-8');}const start=[...sec.querySelectorAll('button')].find(b=>(b.innerText||'').includes('شروع مرور'));if(!start)errs.push('NO-START');const startTxt=start?(start.innerText||'').replace(/\s+/g,' ').trim():'';if(startTxt!=='شروع مرور (۸ سؤال)')errs.push('START-TXT:'+startTxt);const docOver=document.documentElement.scrollWidth>window.innerWidth+1;if(docOver)errs.push('DOC-OVERX');const scs=start?getComputedStyle(start):null;if('$L'==='1'){return 'LEARN-$1:'+JSON.stringify({subInk:pcs?pcs.color:'',startImg:scs?scs.backgroundImage:''});}if(pcs)W(pcs.color,'$SUB_INK');if(scs)W(scs.backgroundImage,'$START_IMG');return errs.length?('FAIL-$1:'+errs.join('|')):('$1-OK');})()"
}

# ---- داورِ موتورِ فعال (سریالِ زمردیِ r437/…؛ $1 صحنه · $2 DARK|LIGHT) ----
judge_engine(){
  local TITLE_INK PROG_BG PROG_INK L="${LEARN_MODE:-0}"
  if [ "$2" = DARK ]; then TITLE_INK="$DARK_TITLE_INK"; PROG_BG="$DARK_PROG_BG"; PROG_INK="$DARK_PROG_INK"; else TITLE_INK="$LIGHT_TITLE_INK"; PROG_BG="$LIGHT_PROG_BG"; PROG_INK="$LIGHT_PROG_INK"; fi
  probe "(()=>{const errs=[];const W=(t,a)=>{if(t!==a)errs.push(t+'!='+a);};const title=[...document.querySelectorAll('span')].find(s=>(s.textContent||'').trim()==='مرور واژه‌های نشان‌شده'&&s.getBoundingClientRect().width>0);if(!title)errs.push('NO-TITLE');const chip=[...document.querySelectorAll('span')].find(s=>(s.textContent||'').trim()==='1 / 8'&&s.getBoundingClientRect().width>0);if(!chip)errs.push('NO-CHIP:1/8');const opts=[...document.querySelectorAll('[data-quiz-option]')].filter(b=>b.getBoundingClientRect().width>0);if(opts.length!==4)errs.push('OPTS:'+opts.length);const nxt=document.querySelector('[data-quiz-next]');if(nxt)errs.push('NEXT-EARLY');const q=document.querySelector('p.en-text');if(!q||!(q.textContent||'').trim())errs.push('NO-QUESTION');const docOver=document.documentElement.scrollWidth>window.innerWidth+1;if(docOver)errs.push('DOC-OVERX');const tcs=title?getComputedStyle(title):null;const ccs=chip?getComputedStyle(chip):null;if('$L'==='1'){return 'LEARN-$1:'+JSON.stringify({titleInk:tcs?tcs.color:'',progBg:ccs?ccs.backgroundColor:'',progInk:ccs?ccs.color:'',q:(q?q.textContent||'':'').slice(0,50)});}if(tcs)W(tcs.color,'$TITLE_INK');if(ccs){W(ccs.backgroundColor,'$PROG_BG');W(ccs.color,'$PROG_INK');}return errs.length?('FAIL-$1:'+errs.join('|')):('$1-OK');})()"
}

# ---- داورِ هستهٔ راند: «بازگشتِ «تلاش مجدد» به موتور» ----
# $1 صحنه · $2 DARK|LIGHT — همان داورِ موتور + حکمِ اکیدِ «هیچ آرتیفکتِ
# نتیجه» + سؤالِ اول = عینِ سؤالِ بایگانیشدهٔ راندِ اول (window.__r448Q1).
judge_retry_entry(){
  local TITLE_INK PROG_BG PROG_INK L="${LEARN_MODE:-0}"
  if [ "$2" = DARK ]; then TITLE_INK="$DARK_TITLE_INK"; PROG_BG="$DARK_PROG_BG"; PROG_INK="$DARK_PROG_INK"; else TITLE_INK="$LIGHT_TITLE_INK"; PROG_BG="$LIGHT_PROG_BG"; PROG_INK="$LIGHT_PROG_INK"; fi
  probe "(()=>{const errs=[];const W=(t,a)=>{if(t!==a)errs.push(t+'!='+a);};const final=[...document.querySelectorAll('span')].find(s=>(s.textContent||'').trim()==='مرور واژه‌های نشان‌شده — نتیجهٔ نهایی'&&s.getBoundingClientRect().width>0);if(final)errs.push('FINAL-TITLE-STILL-THERE');const retry=[...document.querySelectorAll('button')].find(b=>(b.innerText||'').trim()==='تلاش مجدد'&&b.getBoundingClientRect().width>0);if(retry)errs.push('RETRY-BTN-STILL-THERE');const back=[...document.querySelectorAll('button')].find(b=>(b.innerText||'').trim()==='بازگشت'&&b.getBoundingClientRect().width>0);if(back)errs.push('BACK-BTN-STILL-THERE');const pct=[...document.querySelectorAll('div')].find(d=>String(d.className).includes('text-2xl')&&/٪$/.test((d.textContent||'').trim())&&d.getBoundingClientRect().width>0);if(pct)errs.push('PCT-STILL-THERE');const resume=document.querySelector('[data-testid=\"results-resume-row\"]');if(resume)errs.push('RESUME-ROW-STILL-THERE');const title=[...document.querySelectorAll('span')].find(s=>(s.textContent||'').trim()==='مرور واژه‌های نشان‌شده'&&s.getBoundingClientRect().width>0);if(!title)errs.push('NO-TITLE');const chip=[...document.querySelectorAll('span')].find(s=>(s.textContent||'').trim()==='1 / 8'&&s.getBoundingClientRect().width>0);if(!chip)errs.push('NO-CHIP:1/8');const opts=[...document.querySelectorAll('[data-quiz-option]')].filter(b=>b.getBoundingClientRect().width>0);if(opts.length!==4)errs.push('OPTS:'+opts.length);const q=document.querySelector('p.en-text');if(!q||!(q.textContent||'').trim())errs.push('NO-QUESTION');const same=(q&&window.__r448Q1)?(q.textContent||'').trim()===window.__r448Q1:null;if(same===false)errs.push('Q1-CHANGED');if(same===null)errs.push('NO-Q1-ARCHIVE');const bar=[...document.querySelectorAll('div')].find(d=>d.style&&d.style.width!==''&&d.style.width!==undefined&&String(d.className).includes('rounded-full')&&d.getBoundingClientRect().height>0&&d.getBoundingClientRect().height<12&&d.getBoundingClientRect().width>0);const barW=bar?bar.style.width:'';if(barW&&barW!=='0%'&&barW!=='0px')errs.push('PROGRESS-NOT-RESET:'+barW);const docOver=document.documentElement.scrollWidth>window.innerWidth+1;if(docOver)errs.push('DOC-OVERX');const tcs=title?getComputedStyle(title):null;const ccs=chip?getComputedStyle(chip):null;if('$L'==='1'){return 'LEARN-$1:'+JSON.stringify({titleInk:tcs?tcs.color:'',progBg:ccs?ccs.backgroundColor:'',progInk:ccs?ccs.color:'',same,sameQ:(q?q.textContent||'':'').slice(0,50),barW});}if(tcs)W(tcs.color,'$TITLE_INK');if(ccs){W(ccs.backgroundColor,'$PROG_BG');W(ccs.color,'$PROG_INK');}return errs.length?('FAIL-$1:'+errs.join('|')):('$1-OK'+(same===true?'|Q1-IDENTICAL':''));})()"
}

# ---- داورِ ساختاریِ پردهٔ نتیجه (سریالِ r441/r446/r447) ----
judge_result(){ # $1 صحنه
  probe "(()=>{const errs=[];const back=[...document.querySelectorAll('button')].filter(b=>(b.innerText||'').trim()==='بازگشت'&&b.getBoundingClientRect().width>0);if(back.length<1)errs.push('NO-BACK:'+back.length);const retry=[...document.querySelectorAll('button')].find(b=>(b.innerText||'').trim()==='تلاش مجدد'&&b.getBoundingClientRect().width>0);if(!retry)errs.push('NO-RETRY');const dl=[...document.querySelectorAll('button')].find(b=>(b.innerText||'').includes('دانلود تصویر نتیجه'));if(!dl)errs.push('NO-DOWNLOAD');const ttl=[...document.querySelectorAll('span')].find(s=>(s.textContent||'').trim()==='مرور واژه‌های نشان‌شده — نتیجهٔ نهایی'&&s.getBoundingClientRect().width>0);if(!ttl)errs.push('NO-TITLE-FINAL');const chip=[...document.querySelectorAll('span')].find(s=>(s.textContent||'').includes('تمرین هدفمند انجام شد'));if(!chip)errs.push('NO-TARGETED-CHIP');const pct=[...document.querySelectorAll('div')].find(d=>String(d.className).includes('text-2xl')&&/٪$/.test((d.textContent||'').trim()));if(!pct)errs.push('NO-PCT');const opts=document.querySelector('[data-quiz-option]');if(opts)errs.push('OPTS-STILL-THERE');const resume=document.querySelector('[data-testid=\"results-resume-row\"]');const docOver=document.documentElement.scrollWidth>window.innerWidth+1;if(docOver)errs.push('DOC-OVERX');return errs.length?('FAIL-$1:'+errs.join('|')):('$1-OK'+(resume?'|RESUME-ROW-PRESENT':'|RESUME-ROW-ABSENT(BI-REKORD)'));})()"
}

archive_q1(){ probe "(()=>{const q=document.querySelector('p.en-text');if(!q||!(q.textContent||'').trim())return 'ARCHIVE-FAIL:NO-Q';window.__r448Q1=(q.textContent||'').trim();return 'Q1-ARCHIVED:'+(q.textContent||'').slice(0,40);})()"; }

answer_q(){ agent-browser eval "(()=>{const b=document.querySelector('[data-quiz-option=\"0\"]');if(!b||b.getBoundingClientRect().width===0)return 'NO-OPT';b.click();return 'CHOSEN';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

next_q(){ agent-browser eval "(()=>{const b=document.querySelector('[data-quiz-next]');if(!b||b.getBoundingClientRect().width===0)return 'NO-NEXT';b.click();return 'NEXT';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

run_round(){ for i in 1 2 3 4 5 6 7 8; do answer_q; sleep 1; next_q; sleep 1.2; done; }

ledger(){ node -e "const {PrismaClient}=require('@prisma/client');const db=new PrismaClient();const d=new Date();const key=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');const one=(n)=>db.eventDay.findFirst({where:{name:n,day:key}}).then((r)=>[n,r?r.count:0]);Promise.all([one('my_words_review_start'),one('quiz_done'),one('my_words_open')]).then((rows)=>{rows.forEach(([n,c])=>console.log(n.toUpperCase()+'('+key+'):'+c));return db.quizAttempt.count();}).then((a)=>{console.log('ATTEMPTS-NOW:'+a);return db.quizAttempt.findMany({where:{category:'my-words'},orderBy:{id:'asc'}});}).then((rows)=>{console.log('MYWORDS-ATTEMPTS:'+JSON.stringify(rows.map((r)=>({lesson:r.lesson,total:r.total,correct:r.correct,percent:r.percent}))));return db.eventDay.findFirst({where:{name:'drill_due_jump'}});}).then((r)=>{console.log('LEDGER:',JSON.stringify(r?{name:r.name,count:r.count,day:r.day}:null));return db.\$disconnect();}).catch((e)=>{console.log('LEDGER-ERR:'+e.message);process.exit(0);})" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

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

EIGHT_STARS="['1:ability','1:absolutely','1:access','1:across','1:action','1:add','1:additional','1:afraid']"

echo "########## PRE) دفترِ آغازین — baselineِ امروز" | tee -a "$OUT"
ledger

echo "########## A) هشت ستارهٔ واقعیِ درس ۱ → لانچر (حکمِ پیوستگیِ سریالِ r447)" | tee -a "$OUT"
boot
probe "(()=>{const KEY='vision2-study-v1';const raw=JSON.parse(localStorage.getItem(KEY)||'{\"state\":{}}');raw.state.starredWords=$EIGHT_STARS;localStorage.setItem(KEY,JSON.stringify(raw));location.reload();return 'EIGHT-STARS-SEEDED';})()" | tee -a "$OUT"
sleep 4
qa_wait_home || { agent-browser close >/dev/null 2>&1; exit 1; }
dismiss_install
click_card "واژه‌های من"; sleep 2.5
qa_to_dark
sleep 1
LEARN_MODE="${LEARN_MODE:-0}" judge_group LAUNCHER-8STARS-DARK DARK
qa_wait_toasts_clear
qa_to_light
sleep 1
LEARN_MODE="${LEARN_MODE:-0}" judge_group LAUNCHER-8STARS-LIGHT LIGHT
click_card "شروع مرور"; sleep 2

echo "########## B) راندِ اول — ورود به موتور + بایگانیِ سؤالِ اول (شب — کلیدِ صریحِ حالت)" | tee -a "$OUT"
qa_to_dark
sleep 1
LEARN_MODE="${LEARN_MODE:-0}" judge_engine ROUND1-ENTRY-DARK DARK
archive_q1
probe "(()=>{const chip=[...document.querySelectorAll('span')].find(s=>(s.textContent||'').trim()==='1 / 8'&&s.getBoundingClientRect().width>0);return chip?'CHIP-1/8-OK':'CHIP-MISS';})()" | tee -a "$OUT"

echo "########## C) هشت پاسخِ صادقانهٔ راندِ اول → پردهٔ نتیجهٔ اول" | tee -a "$OUT"
run_round
probe "(()=>{const ttl=[...document.querySelectorAll('span')].find(s=>(s.textContent||'').trim()==='مرور واژه‌های نشان‌شده — نتیجهٔ نهایی'&&s.getBoundingClientRect().width>0);const opts=document.querySelector('[data-quiz-option]');return (ttl&&!opts)?'RESULT1-REACHED-OK':'NOT-RESULT:'+JSON.stringify({ttl:!!ttl,opts:!!opts});})()" | tee -a "$OUT"
qa_wait_toasts_clear
qa_to_dark
sleep 1
judge_result RESULT1-DARK
qa_shot r448-result-round1-dark.png

echo "########## D) هستهٔ راند — کلیکِ «تلاش مجدد» → بازگشت به موتور (شب)" | tee -a "$OUT"
click_by_label "تلاش مجدد"; sleep 2
LEARN_MODE="${LEARN_MODE:-0}" judge_retry_entry RETRY-ENTRY-DARK DARK
qa_wait_toasts_clear
qa_shot r448-retry-entry-dark.png

echo "########## E) همان حکم در روشن (کلیدِ صریحِ حالت — درسِ r445)" | tee -a "$OUT"
qa_to_light
sleep 1
LEARN_MODE="${LEARN_MODE:-0}" judge_retry_entry RETRY-ENTRY-LIGHT LIGHT
qa_wait_toasts_clear
qa_shot r448-retry-entry-light.png

echo "########## F) دفترِ میانپروازی — قراردادِ منبع: شروعِ دوباره «نمی‌شلیکد»" | tee -a "$OUT"
ledger

echo "########## G) راندِ دومِ کامل (همان ۸ سؤال، پاسخهایِ صادقانهٔ نو) → پردهٔ نتیجهٔ دوم" | tee -a "$OUT"
run_round
probe "(()=>{const ttl=[...document.querySelectorAll('span')].find(s=>(s.textContent||'').trim()==='مرور واژه‌های نشان‌شده — نتیجهٔ نهایی'&&s.getBoundingClientRect().width>0);const opts=document.querySelector('[data-quiz-option]');return (ttl&&!opts)?'RESULT2-REACHED-OK':'NOT-RESULT2:'+JSON.stringify({ttl:!!ttl,opts:!!opts});})()" | tee -a "$OUT"
qa_wait_toasts_clear
qa_to_dark
sleep 1
judge_result RESULT2-DARK
qa_shot r448-result-round2-dark.png
qa_to_light
sleep 1
judge_result RESULT2-LIGHT
qa_wait_toasts_clear
qa_shot r448-result-round2-light.png

echo "########## H) خروجِ «بازگشت» → لانچرِ سالم" | tee -a "$OUT"
click_by_label "بازگشت"; sleep 1.5
probe "(()=>{const sec=document.querySelector('[aria-label=\"مرور واژه‌های نشان‌شده\"]');if(!sec)return 'NO-LAUNCHER';const start=[...sec.querySelectorAll('button')].find(b=>(b.innerText||'').includes('شروع مرور'));return 'EXIT-LAUNCHER-OK:'+(start?'START-BACK':'START-MISS');})()" | tee -a "$OUT"

echo "########## I) دفترِ نهایی — my_words_review_start باید «کماکان» ۱ باشد" | tee -a "$OUT"
ledger

agent-browser close >/dev/null 2>&1 || true
echo "########## WITNESS-DONE" | tee -a "$OUT"
