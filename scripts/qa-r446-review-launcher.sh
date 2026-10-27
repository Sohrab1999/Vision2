#!/usr/bin/env bash
# ------------------------------------------------------------------
# r446 — «شاهدِ موبایلِ لانچرِ آزمونِ «واژههای من» (مرور نشان‌شده‌ها)»
# پنجاهویکمین مصرفکنندهٔ qa-lib.sh. بندِ ①ِ r445 — ششمین لانچرِ «واژههای من»
#   (خویشاوندِ مستقیمِ دیکتهٔ r445). حالتِ تهیِ آن در r444 دیده شده بود
#   (آستانهٔ مرور)؛ این راندِ نو: حالتِ آماده + گروهِ طولِ جلسه + راندِ واقعی.
# صحنهٔ A (ستارهٔ صفر): زیرعنوانِ دقیقِ «برای شروع مرور حداقل ۴ واژه نشان کن
#   — الان ۰ داری» (MIN_STARS=۴)، شروعِ غایب، گروهِ طولِ جلسه غایب، درِ
#   «رفتن به دیکشنری»یِ کهربایی حاضر؛ قراردادِ درِ زنده → دیکشنریِ واقعی.
# صحنهٔ B (چهار ستارهٔ واقعیِ درسِ ۱): زیرعنوانِ «آزمونی از همین لیست — ...» +
#   شروعِ «شروع مرور (۴ سؤال)» — **قراردادِ کلمپ** (پیشفرضِ ۸ → min(8,4)=۴ در
#   متنِ دکمه) + گروهِ طولِ جلسه با ۸ فعال و **۱۵ غیرفعال** (n > stars.length
#   — لبهٔ صادقِ disabled:opacity-35)؛ ورود به موتورِ آزمون (عنوانِ «مرور
#   واژه‌های نشان‌شده» + چیپِ «1 / 4» با ارقامِ لاتین + چهار گزینه)؛ راندِ
#   واقعیِ ۴سؤالیِ immediate (انتخابِ گزینهٔ نخست — صادقانهٔ تصادفی، ایدئومِ
#   r441) → پردهٔ نتیجه (pillِ گواهی با عنوانِ موتور + دو «بازگشت») → خروج →
#   لانچرِ سالم.
# داوریها در شبِ واقعی و روشن (درسِ r445: کلیدِ صریحِ حالت پیش از هر داوری):
#   متنِ دقیق + سریالهایِ آموختهشده + سرریزِ صفرِ سکشن/سند + پنج شات.
# دفترِ صادق: my_words_review_start دقیقاً +۱ (یک کلیکِ لانچر)؛ quiz_done +۱
#   و یک attempt (lesson=0، category=my-words — همان POSTِ امضاشدهٔ دیکته؛
#   خطِ لولهٔ identity دوباره یک پروفایلِ بوت ثبت میکند — جراحیِ r101 پاک
#   میکند)؛ ۱۳۱ drill_due_jump دستنخورده.
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
OUT=/tmp/r446-review-launcher-witness.txt
QA_SEED_FILE=/tmp/r446-witness-seed-eval.js
: > "$OUT"

source /home/z/my-project/scripts/qa-lib.sh

probe(){ agent-browser eval "$1" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

click_by_label(){ agent-browser eval "(()=>{let b=document.querySelector('[aria-label=\"$1\"]');if(!b||b.getBoundingClientRect().width===0){b=[...document.querySelectorAll('button')].find((x)=>(x.innerText||'').replace(/\s+/g,' ').trim()==='$1'&&x.getBoundingClientRect().width>0);}if(!b)return 'NO-BTN:$1';b.click();return 'CLICKED:$1';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

click_card(){ agent-browser eval "(()=>{const b=[...document.querySelectorAll('button')].find((x)=>(x.innerText||'').includes('$1')&&x.getBoundingClientRect().width>0);if(!b)return 'NO-BTN:$1';b.click();return 'CLICKED:$1';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

dismiss_install(){ probe "(()=>{const b=document.querySelector('[aria-label=\"بستن پیشنهاد نصب\"]');if(b&&b.getBoundingClientRect().width>0){b.click();return 'INSTALL-CARD-DISMISSED';}return 'NO-INSTALL-CARD';})()"; sleep 1; }

# ---- سریالهایِ آموختهشده (رانِ learn؛ رانِ دوم اینها را قفل میکند):
#   لانچرِ مرور = خانوادهٔ کهرباییِ نو — درِ کهربایی با مکانیزمِ rgbaیِ خودش
#   (rgba(180,130,20,0.55)|rgb(251,191,36) در شب — قرینهٔ rgbaیِ بنفشِ r444)؛
#   گرادیانِ شروعِ کهربایی-نارنجی: stopِ اولِ amber-700 در شب بازنگاشت نمیشود
#   ولی stopِ دومِ orange-700 میشود (lab→rgb) — برخلافِ گرادیانِ اوکلابِ r445
#   که هیچ stopاش بازنگاشت نمیشد؛ چیپِ فعالِ ۸ = سفیدِ بازنگاشتهٔ شب؛
#   موتور: چیپِ «1 / 4» = عینِ سریالِ زمردیِ r437/r438 (سومین عضوِ خانواده)
DARK_SUB_INK="rgb(156, 149, 140)"; DARK_H2_INK="rgb(236, 234, 230)"; DARK_DOOR_BG="rgb(28, 25, 23)"; DARK_DOOR_INK="rgb(251, 191, 36)"; DARK_DOOR_BD="rgba(180, 130, 20, 0.55)"; DARK_START_BG="rgba(0, 0, 0, 0)"; DARK_START_INK="rgb(255, 255, 255)"; DARK_START_IMG="linear-gradient(to left, lab(47.2709 42.9082 69.2966) 0%, rgb(194, 65, 12) 100%)"; DARK_CHIP_BG="rgb(28, 25, 23)"; DARK_CHIP_INK="rgb(156, 149, 140)"; DARK_CHIP_BD="rgb(55, 49, 43)"; DARK_TITLE_INK="rgb(236, 234, 230)"; DARK_PROG_BG="rgba(6, 55, 40, 0.35)"; DARK_PROG_INK="rgb(110, 231, 183)"
LIGHT_SUB_INK="lab(44.2882 2.36151 4.27174)"; LIGHT_H2_INK="lab(15.0353 1.96067 1.53427)"; LIGHT_DOOR_BG="rgb(255, 255, 255)"; LIGHT_DOOR_INK="lab(47.2709 42.9082 69.2966)"; LIGHT_DOOR_BD="lab(86.4156 6.13147 78.3961)"; LIGHT_START_BG="rgba(0, 0, 0, 0)"; LIGHT_START_INK="rgb(255, 255, 255)"; LIGHT_START_IMG="linear-gradient(to left, lab(47.2709 42.9082 69.2966) 0%, lab(46.4615 57.7275 70.8507) 100%)"; LIGHT_CHIP_BG="rgb(255, 255, 255)"; LIGHT_CHIP_INK="lab(44.2882 2.36151 4.27174)"; LIGHT_CHIP_BD="lab(91.055 0.663072 0.865579)"; LIGHT_TITLE_INK="lab(15.0353 1.96067 1.53427)"; LIGHT_PROG_BG="lab(97.8462 -6.94966 1.85487)"; LIGHT_PROG_INK="lab(44.4871 -41.0396 11.0361)"

# ---- داورِ لانچرِ مرور (یکخطی — استخراجِ پیشْپرواز با check-r446-judges.sh) ----
# $1 صحنه · $2 DARK|LIGHT · $3 زیرعنوانِ دقیق · $4 START PRESENT|ABSENT · $5 DOOR PRESENT|ABSENT · $6 GROUP PRESENT|ABSENT
judge_launcher(){
  local SUB_INK H2_INK DOOR_BG DOOR_INK DOOR_BD START_BG START_INK START_IMG CHIP_BG CHIP_INK CHIP_BD L="${LEARN_MODE:-0}"
  if [ "$2" = DARK ]; then SUB_INK="$DARK_SUB_INK"; H2_INK="$DARK_H2_INK"; DOOR_BG="$DARK_DOOR_BG"; DOOR_INK="$DARK_DOOR_INK"; DOOR_BD="$DARK_DOOR_BD"; START_BG="$DARK_START_BG"; START_INK="$DARK_START_INK"; START_IMG="$DARK_START_IMG"; CHIP_BG="$DARK_CHIP_BG"; CHIP_INK="$DARK_CHIP_INK"; CHIP_BD="$DARK_CHIP_BD"; else SUB_INK="$LIGHT_SUB_INK"; H2_INK="$LIGHT_H2_INK"; DOOR_BG="$LIGHT_DOOR_BG"; DOOR_INK="$LIGHT_DOOR_INK"; DOOR_BD="$LIGHT_DOOR_BD"; START_BG="$LIGHT_START_BG"; START_INK="$LIGHT_START_INK"; START_IMG="$LIGHT_START_IMG"; CHIP_BG="$LIGHT_CHIP_BG"; CHIP_INK="$LIGHT_CHIP_INK"; CHIP_BD="$LIGHT_CHIP_BD"; fi
  probe "(()=>{const errs=[];const W=(t,a)=>{if(t!==a)errs.push(t+'!='+a);};const sec=document.querySelector('[aria-label=\"مرور واژه‌های نشان‌شده\"]');if(!sec)return 'FAIL-$1:NO-LAUNCHER';const h2=sec.querySelector('h2');if(!h2||(h2.textContent||'').trim()!=='مرور نشان‌شده‌ها')errs.push('H2:'+(h2?h2.textContent:'none'));const p=sec.querySelector('p');const sub=(p?p.textContent:'').trim();if(sub!=='$3')errs.push('SUB:'+sub);const start=[...sec.querySelectorAll('button')].find(b=>(b.innerText||'').includes('شروع مرور'));if('$4'==='ABSENT'&&start)errs.push('START-PRESENT');if('$4'==='PRESENT'&&!start)errs.push('START-ABSENT');const door=[...sec.querySelectorAll('button')].find(b=>(b.innerText||'').trim()==='رفتن به دیکشنری');if('$5'==='ABSENT'&&door)errs.push('DOOR-PRESENT');if('$5'==='PRESENT'&&!door)errs.push('DOOR-ABSENT');const grp=sec.querySelector('[role=\"group\"]');if('$6'==='ABSENT'&&grp)errs.push('GROUP-PRESENT');if('$6'==='PRESENT'&&!grp)errs.push('GROUP-ABSENT');if(grp&&(grp.getAttribute('aria-label')||'')!=='طول جلسهٔ مرور')errs.push('GROUP-ARIA:'+(grp.getAttribute('aria-label')||'none'));let c8=null,c15=null;if(grp){c8=[...grp.querySelectorAll('button')].find(b=>(b.innerText||'').trim()==='۸');c15=[...grp.querySelectorAll('button')].find(b=>(b.innerText||'').trim()==='۱۵');if(!c8)errs.push('NO-CHIP8');if(!c15)errs.push('NO-CHIP15');if(c8&&c8.getAttribute('aria-pressed')!=='false')errs.push('CHIP8-PRESSED-UNEXPECTED');if(c8&&!c8.disabled)errs.push('CHIP8-ENABLED-AT-4');if(c15&&!c15.disabled)errs.push('CHIP15-ENABLED-AT-4');}const secOver=sec.scrollWidth>Math.ceil(sec.clientWidth)+1;const docOver=document.documentElement.scrollWidth>window.innerWidth+1;if(secOver)errs.push('SEC-OVERX');if(docOver)errs.push('DOC-OVERX');const pcs=p?getComputedStyle(p):null;const hcs=h2?getComputedStyle(h2):null;const dcs=door?getComputedStyle(door):null;const scs=start?getComputedStyle(start):null;const ccs=c8?getComputedStyle(c8):null;if('$L'==='1'){return 'LEARN-$1:'+JSON.stringify({sub,subInk:pcs?pcs.color:'',h2Ink:hcs?hcs.color:'',doorBg:dcs?dcs.backgroundColor:'',doorInk:dcs?dcs.color:'',doorBd:dcs?dcs.borderTopColor:'',startBg:scs?scs.backgroundColor:'',startInk:scs?scs.color:'',startImg:scs?scs.backgroundImage:'',chipBg:ccs?ccs.backgroundColor:'',chipInk:ccs?ccs.color:'',chipBd:ccs?ccs.borderTopColor:''});}if(pcs)W(pcs.color,'$SUB_INK');if(hcs)W(hcs.color,'$H2_INK');if(dcs){W(dcs.backgroundColor,'$DOOR_BG');W(dcs.color,'$DOOR_INK');W(dcs.borderTopColor,'$DOOR_BD');}if(scs){W(scs.backgroundColor,'$START_BG');W(scs.color,'$START_INK');W(scs.backgroundImage,'$START_IMG');}if(ccs){W(ccs.backgroundColor,'$CHIP_BG');W(ccs.color,'$CHIP_INK');W(ccs.borderTopColor,'$CHIP_BD');}return errs.length?('FAIL-$1:'+errs.join('|')):('$1-OK');})()"
}

# ---- داورِ ورودِ موتور ----
# $1 صحنه · $2 DARK|LIGHT
judge_engine(){
  local TITLE_INK PROG_BG PROG_INK L="${LEARN_MODE:-0}"
  if [ "$2" = DARK ]; then TITLE_INK="$DARK_TITLE_INK"; PROG_BG="$DARK_PROG_BG"; PROG_INK="$DARK_PROG_INK"; else TITLE_INK="$LIGHT_TITLE_INK"; PROG_BG="$LIGHT_PROG_BG"; PROG_INK="$LIGHT_PROG_INK"; fi
  probe "(()=>{const errs=[];const W=(t,a)=>{if(t!==a)errs.push(t+'!='+a);};const title=[...document.querySelectorAll('span')].find(s=>(s.textContent||'').trim()==='مرور واژه‌های نشان‌شده'&&s.getBoundingClientRect().width>0);if(!title)errs.push('NO-TITLE');const chip=[...document.querySelectorAll('span')].find(s=>(s.textContent||'').trim()==='1 / 4'&&s.getBoundingClientRect().width>0);if(!chip)errs.push('NO-CHIP-1OF4');const opts=[...document.querySelectorAll('[data-quiz-option]')].filter(b=>b.getBoundingClientRect().width>0);if(opts.length!==4)errs.push('OPTS:'+opts.length);const nxt=document.querySelector('[data-quiz-next]');if(nxt)errs.push('NEXT-EARLY');const q=document.querySelector('p.en-text');if(!q||!(q.textContent||'').trim())errs.push('NO-QUESTION');const docOver=document.documentElement.scrollWidth>window.innerWidth+1;if(docOver)errs.push('DOC-OVERX');const tcs=title?getComputedStyle(title):null;const ccs=chip?getComputedStyle(chip):null;if('$L'==='1'){return 'LEARN-$1:'+JSON.stringify({titleInk:tcs?tcs.color:'',progBg:ccs?ccs.backgroundColor:'',progInk:ccs?ccs.color:'',q:(q?q.textContent||'':'').slice(0,40)});}if(tcs)W(tcs.color,'$TITLE_INK');if(ccs){W(ccs.backgroundColor,'$PROG_BG');W(ccs.color,'$PROG_INK');}return errs.length?('FAIL-$1:'+errs.join('|')):('$1-OK');})()"
}

# ---- داورِ ساختاریِ پردهٔ نتیجه (سریالهایِ نتیجه از آنِ r441 است) ----
judge_result(){ # $1 صحنه
  probe "(()=>{const errs=[];const back=[...document.querySelectorAll('button')].filter(b=>(b.innerText||'').trim()==='بازگشت'&&b.getBoundingClientRect().width>0);if(back.length<1)errs.push('NO-BACK:'+back.length);const retry=[...document.querySelectorAll('button')].find(b=>(b.innerText||'').trim()==='تلاش مجدد'&&b.getBoundingClientRect().width>0);if(!retry)errs.push('NO-RETRY');const dl=[...document.querySelectorAll('button')].find(b=>(b.innerText||'').includes('دانلود تصویر نتیجه'));if(!dl)errs.push('NO-DOWNLOAD');const ttl=[...document.querySelectorAll('span')].find(s=>(s.textContent||'').trim()==='مرور واژه‌های نشان‌شده — نتیجهٔ نهایی'&&s.getBoundingClientRect().width>0);if(!ttl)errs.push('NO-TITLE-FINAL');const chip=[...document.querySelectorAll('span')].find(s=>(s.textContent||'').includes('تمرین هدفمند انجام شد'));if(!chip)errs.push('NO-TARGETED-CHIP');const pct=[...document.querySelectorAll('div')].find(d=>String(d.className).includes('text-2xl')&&/٪$/.test((d.textContent||'').trim()));if(!pct)errs.push('NO-PCT');const opts=document.querySelector('[data-quiz-option]');if(opts)errs.push('OPTS-STILL-THERE');const resume=document.querySelector('[data-testid=\"results-resume-row\"]');const docOver=document.documentElement.scrollWidth>window.innerWidth+1;if(docOver)errs.push('DOC-OVERX');return errs.length?('FAIL-$1:'+errs.join('|')):('$1-OK'+(resume?'|RESUME-ROW-PRESENT':'|RESUME-ROW-ABSENT(BI-REKORD)'));})()"
}

answer_q(){ agent-browser eval "(()=>{const b=document.querySelector('[data-quiz-option=\"0\"]');if(!b||b.getBoundingClientRect().width===0)return 'NO-OPT';b.click();return 'CHOSEN';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

next_q(){ agent-browser eval "(()=>{const b=document.querySelector('[data-quiz-next]');if(!b||b.getBoundingClientRect().width===0)return 'NO-NEXT';b.click();return 'NEXT';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

ledger(){ node -e "const {PrismaClient}=require('@prisma/client');const db=new PrismaClient();const d=new Date();const key=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');const one=(n)=>db.eventDay.findFirst({where:{name:n,day:key}}).then((r)=>[n,r?r.count:0]);Promise.all([one('my_words_review_start'),one('quiz_done'),one('my_words_open')]).then((rows)=>{rows.forEach(([n,c])=>console.log(n.toUpperCase()+'('+key+'):'+c));return db.quizAttempt.count();}).then((a)=>{console.log('ATTEMPTS-NOW:'+a);return db.quizAttempt.findFirst({where:{category:'my-words'},orderBy:{id:'desc'}});}).then((r)=>{console.log('MYWORDS-QUIZ-ATTEMPT:'+(r?JSON.stringify({lesson:r.lesson,category:r.category,total:r.total,correct:r.correct,percent:r.percent}):'none'));return db.eventDay.findFirst({where:{name:'drill_due_jump'}});}).then((r)=>{console.log('LEDGER:',JSON.stringify(r?{name:r.name,count:r.count,day:r.day}:null));return db.\$disconnect();}).catch((e)=>{console.log('LEDGER-ERR:'+e.message);process.exit(0);})" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

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

echo "########## A) صفرِ ستاره — پچ + reloadِ واقعی (درسِ r444/r445)" | tee -a "$OUT"
boot
probe "(()=>{const KEY='vision2-study-v1';const raw=JSON.parse(localStorage.getItem(KEY)||'{\"state\":{}}');raw.state.starredWords=[];localStorage.setItem(KEY,JSON.stringify(raw));location.reload();return 'ZERO-STARS-SEEDED';})()" | tee -a "$OUT"
sleep 4
qa_wait_home || { agent-browser close >/dev/null 2>&1; exit 1; }
dismiss_install
click_card "واژه‌های من"; sleep 2.5
probe "(()=>{const sec=document.querySelector('[aria-label=\"مرور واژه‌های نشان‌شده\"]');if(!sec)return 'NO-LAUNCHER';const sub=(sec.querySelector('p')||{textContent:''}).textContent.trim();return 'REVIEW-SUB:'+(sub==='برای شروع مرور حداقل ۴ واژه نشان کن — الان ۰ داری'?'EMPTY-OK':sub);})()" | tee -a "$OUT"

echo "########## B) حکمِ صحنهٔ A در شب + سریالها (کلیدِ صریحِ حالت — درسِ r445)" | tee -a "$OUT"
qa_to_dark
probe "(()=>{return document.documentElement.classList.contains('dark')?'DARK-ON':'DARK-OFF';})()"
LEARN_MODE="${LEARN_MODE:-0}" judge_launcher SCENE-A-ZERO-STARS DARK "برای شروع مرور حداقل ۴ واژه نشان کن — الان ۰ داری" ABSENT PRESENT ABSENT
qa_wait_toasts_clear
qa_shot r446-mobile-review-empty-dark.png

echo "########## C) روشن — همان حکم + پایهٔ lab" | tee -a "$OUT"
qa_to_light
sleep 1
LEARN_MODE="${LEARN_MODE:-0}" judge_launcher SCENE-A-ZERO-STARS-LIGHT LIGHT "برای شروع مرور حداقل ۴ واژه نشان کن — الان ۰ داری" ABSENT PRESENT ABSENT
qa_wait_toasts_clear
qa_shot r446-mobile-review-empty-light.png

echo "########## D) قراردادِ درِ زنده — درِ کهرباییِ خودِ سکشنِ مرور" | tee -a "$OUT"
probe "(()=>{const sec=document.querySelector('[aria-label=\"مرور واژه‌های نشان‌شده\"]');if(!sec)return 'NO-LAUNCHER';const door=[...sec.querySelectorAll('button')].find(b=>(b.innerText||'').trim()==='رفتن به دیکشنری');if(!door)return 'NO-DOOR';door.click();return 'DOOR-CLICKED';})()" | tee -a "$OUT"
sleep 2
probe "(()=>{const inp=document.querySelector('input[placeholder=\"مثلاً: language یا زبان...\"]');return inp?'DOOR-ARRIVED:dictionary-real':'DOOR-MISS';})()" | tee -a "$OUT"

echo "########## E) صحنهٔ B — چهار ستارهٔ واقعیِ درسِ ۱ → لانچرِ آماده + کلمپِ ۸→۴" | tee -a "$OUT"
probe "(()=>{const KEY='vision2-study-v1';const raw=JSON.parse(localStorage.getItem(KEY)||'{\"state\":{}}');raw.state.starredWords=['1:ability','1:absolutely','1:access','1:across'];localStorage.setItem(KEY,JSON.stringify(raw));location.reload();return 'FOUR-STARS-SEEDED';})()" | tee -a "$OUT"
sleep 4
qa_wait_home || { agent-browser close >/dev/null 2>&1; exit 1; }
dismiss_install
click_card "واژه‌های من"; sleep 2.5
probe "(()=>{const sec=document.querySelector('[aria-label=\"مرور واژه‌های نشان‌شده\"]');if(!sec)return 'NO-LAUNCHER';const sub=(sec.querySelector('p')||{textContent:''}).textContent.trim();const start=[...sec.querySelectorAll('button')].find(b=>(b.innerText||'').includes('شروع مرور'));const door=[...sec.querySelectorAll('button')].find(b=>(b.innerText||'').trim()==='رفتن به دیکشنری');const grp=!!sec.querySelector('[role=\"group\"]');const startTxt=start?(start.innerText||'').replace(/\s+/g,' ').trim():'';return 'READY:'+(sub==='آزمونی از همین لیست — سؤال‌های رسمی بانک + تمرین دوطرفه؛ مربعِ فیلترها هم اثر می‌کند'?'SUB-READY-OK':sub)+'|start='+(start?'PRESENT:'+startTxt:'ABSENT')+'|door='+(door?'PRESENT':'ABSENT')+'|group='+(grp?'PRESENT':'ABSENT');})()" | tee -a "$OUT"

echo "########## F) حکمِ لانچرِ آماده در شب + روشن" | tee -a "$OUT"
qa_to_dark
sleep 1
LEARN_MODE="${LEARN_MODE:-0}" judge_launcher SCENE-B-READY DARK "آزمونی از همین لیست — سؤال‌های رسمی بانک + تمرین دوطرفه؛ مربعِ فیلترها هم اثر می‌کند" PRESENT ABSENT PRESENT
qa_wait_toasts_clear
qa_shot r446-mobile-review-ready-dark.png
qa_to_light
sleep 1
LEARN_MODE="${LEARN_MODE:-0}" judge_launcher SCENE-B-READY-LIGHT LIGHT "آزمونی از همین لیست — سؤال‌های رسمی بانک + تمرین دوطرفه؛ مربعِ فیلترها هم اثر می‌کند" PRESENT ABSENT PRESENT
qa_wait_toasts_clear
qa_shot r446-mobile-review-ready-light.png

echo "########## G) ورود به موتورِ آزمون — داورِ ورود در روز و شب (کلیدِ صریحِ حالت)" | tee -a "$OUT"
click_card "شروع مرور"; sleep 2
LEARN_MODE="${LEARN_MODE:-0}" judge_engine ENGINE-ENTRY-LIGHT LIGHT
qa_to_dark
sleep 1
LEARN_MODE="${LEARN_MODE:-0}" judge_engine ENGINE-ENTRY-DARK DARK

echo "########## H) راندِ واقعیِ ۴سؤالیِ immediate (انتخابِ نخست — صادقانهٔ تصادفی، ایدئومِ r441)" | tee -a "$OUT"
for i in 1 2 3 4; do
  answer_q
  sleep 1
  next_q
  sleep 1.2
done
probe "(()=>{const ttl=[...document.querySelectorAll('span')].find(s=>(s.textContent||'').trim()==='مرور واژه‌های نشان‌شده — نتیجهٔ نهایی'&&s.getBoundingClientRect().width>0);const opts=document.querySelector('[data-quiz-option]');return (ttl&&!opts)?'RESULT-REACHED-OK':'NOT-RESULT:'+JSON.stringify({ttl:!!ttl,opts:!!opts});})()" | tee -a "$OUT"

echo "########## I) پردهٔ نتیجه — داورِ ساختاری در شب و روشن + شاتها" | tee -a "$OUT"
qa_wait_toasts_clear
LEARN_MODE="${LEARN_MODE:-0}" judge_result RESULT-DARK
qa_shot r446-mobile-review-result-dark.png
qa_to_light
sleep 1
LEARN_MODE="${LEARN_MODE:-0}" judge_result RESULT-LIGHT
qa_wait_toasts_clear
qa_shot r446-mobile-review-result-light.png

echo "########## J) قراردادِ خروجِ «بازگشت» → لانچرِ سالم" | tee -a "$OUT"
click_by_label "بازگشت"; sleep 1.5
probe "(()=>{const sec=document.querySelector('[aria-label=\"مرور واژه‌های نشان‌شده\"]');if(!sec)return 'NO-LAUNCHER';const sub=(sec.querySelector('p')||{textContent:''}).textContent.trim();const start=[...sec.querySelectorAll('button')].find(b=>(b.innerText||'').includes('شروع مرور'));return 'EXIT-LAUNCHER-OK:'+(start?'START-BACK':'START-MISS')+'|sub='+(sub.includes('آزمونی از همین لیست')?'READY-STILL':'CHANGED');})()" | tee -a "$OUT"

echo "########## K) دفترِ صادق — DB ledger" | tee -a "$OUT"
ledger

agent-browser close >/dev/null 2>&1 || true
echo "########## WITNESS-DONE" | tee -a "$OUT"
