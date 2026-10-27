#!/usr/bin/env bash
# ------------------------------------------------------------------
# r451 — «شاهدِ موبایلِ مرورِ اشتباهاتِ آزمونِ جامع» (kind=exam-mistakes)
# پنجاهوششمین مصرفکنندهٔ qa-lib.sh — بندِ ①ِ r450 (نهمین چهرهٔ خانوادهٔ
# آزمون که هرگز در ۳۹۰ دیده نشده) — با حلقهٔ آموزشیِ کامل و صادقانه:
#   صحنهٔ A: بانکِ بذرِ پرسونا — r324 عمداً دو خطایِ بانک میکارد
#     (mistakes["0:x-5"]=3 و mistakes["0:x-23"]=2 — «CTAِ مرورِ اشتباهات
#     بدونِ این حاضر نمیشود») — پسِ صفرِ مطلقِ من در رانِ learn، خودِ DOM
#     معلّم شد: CTAِ رزگون در بوت باید با شمارشِ «۲» حاضر باشد و بانکِ RAW
#     دقیقاً {0:x-5، 0:x-23} — بذرِ واقعی، نه جعل.
#   (درسِ دیگرِ رانِ learn: چیپِ «N سؤال به بانک…» عددِ خامِ لاتین رندر
#     میکند — {wrongIds.length} بدونِ faNum — داورِ اول فقط ارقامِ فارسی
#     میپذیرفت و W=۰ جعلی چاپ کرد؛ اکنون هر دو رقمپوش پذیرفته میشوند.)
#   صحنهٔ B: راندِ واقعیِ آزمونِ جامع (۱۰ سؤال، بدون تایمر — ده پاسخِ
#     صادقانهٔ گزینهٔ نخست با تأییدِ پیشرویِ چیپ در هر گام) → نادرستهایِ
#     واقعی به بانکِ صفر میروند (addMistakes(0, ids) در quiz-finish خطِ
#     102) — چیپِ «N سؤال به بانک مرور اشتباهات اضافه شد» خوانده میشود،
#     نه حدس. ورودِ موتورِ exam (immediate=false): راهنمایِ «پاسخ‌ها در
#     پایان نمایش داده می‌شوند» + دکمهٔ «بعدی» از همان ورود — شب و روشن.
#   صحنهٔ C: پسِ «بازگشت» CTAِ رزگون با شمارشِ برابرِ بانکِ RAW حاضر است
#     (قفلِ میان-رسانه: ۲ بذری + ۸ تازه = N) — سریالهایِ خانوادهٔ رزِ CTA
#     (نو — learn/lock دوحالته) → «شروع مرور» → ورودِ موتورِ immediate:
#     امضایِ نهمین چهره = بدون data-quiz-next در ورود (برخلاف exam)،
#     بدون تایمر، چیپِ «1 / N» با سریالِ زمردیِ میراثِ r437/…/r448 — شب و روشن.
#   صحنهٔ D: راندِ مرورِ ۱ — هر سؤال: گزینهٔ نخست → بازخوردِ لحظهای
#     (data-quiz-feedback فوری — امضایِ immediate) + شاخصِ درست از ردیفِ
#     border-emerald-500 گرفته و در window.__r451[متنِ سؤال] بایگانى
#     میشود (یادگیریِ واقعی از بازخورد) → نتیجه: چیپِ «N1 سؤال به بانک…»
#     و بانکِ پسماندِ RAW باید با آن برابر باشد (قفلِ میان-رسانه).
#   صحنهٔ E: راندِ مرورِ ۲ — همان سؤالهایِ پسماند با پاسخهایِ «یادگرفتهشده»
#     (از بازخوردِ راندِ ۱ — رفتارِ واقعیِ یادگیرنده) → همه ✓ → نتیجهٔ
#     ۱۰۰٪ بدونِ چیپِ خطا → بانکِ RAW خالی → «بازگشت» → CTA غایب —
#     «مروری که بانکِ خودش را خالی میکند» بسته شد.
#   صحنهٔ F: دفترِ صادق — exam_done=۱ (فقطِ راندِ exam؛ review آن را
#     نمیزند)، quiz_done=۲ یا ۳، attemptهایِ category=exam/mistakes،
#     my_words_review_start=۰ (خانوادهٔ آزمون دستش را وار نمیزند).
# LEARN_MODE=1: سریالهایِ CTAِ رز و بازخورد را در شب و روز میگیرد.
# درسِ r448/r450: پیشِ هر داوریِ شب، qa_to_darkِ صریح + sleep.
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
OUT=/tmp/r451-mistakes-witness.txt
QA_SEED_FILE=/tmp/r451-witness-seed-eval.js
: > "$OUT"

source /home/z/my-project/scripts/qa-lib.sh

probe(){ agent-browser eval "$1" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
# درسِ رانِ learn: خروجیِ eval رشتهها را JSON-quoted چاپ میکند ("ADV:2 / 10")
# — نقلِ قولِ دور باید بریزد وگرنه مقایسهٔ گامها جعلی FAIL میخورد
getvar(){ agent-browser eval "$1" 2>/dev/null | tail -1 | sed -e 's/^"//' -e 's/"$//'; }

click_by_label(){ agent-browser eval "(()=>{let b=document.querySelector('[aria-label=\"$1\"]');if(!b||b.getBoundingClientRect().width===0){b=[...document.querySelectorAll('button')].find((x)=>(x.innerText||'').replace(/\s+/g,' ').trim()==='$1'&&x.getBoundingClientRect().width>0);}if(!b)return 'NO-BTN:$1';b.click();return 'CLICKED:$1';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

click_card(){ agent-browser eval "(()=>{const b=[...document.querySelectorAll('button')].find((x)=>(x.innerText||'').includes('$1')&&x.getBoundingClientRect().width>0);if(!b)return 'NO-BTN:$1';b.click();return 'CLICKED:$1';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

# درسِ رانِ learn3: «شروع مرور» SPAN است نه دکمه — خودِ .mistakes-cta کلیک میشود
click_cta(){ agent-browser eval "(()=>{const c=document.querySelector('.mistakes-cta');if(!c||c.getBoundingClientRect().width===0)return 'NO-CTA';c.click();return 'CTA-CLICKED';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

dismiss_install(){ probe "(()=>{const b=document.querySelector('[aria-label=\"بستن پیشنهاد نصب\"]');if(b&&b.getBoundingClientRect().width>0){b.click();return 'INSTALL-CARD-DISMISSED';}return 'NO-INSTALL-CARD';})()"; sleep 1; }

# ---- سریالهایِ زمردیِ میراث (r437/…/r448 — چیپ و عنوانِ موتور):
DARK_TITLE_INK="rgb(236, 234, 230)"; DARK_PROG_BG="rgba(6, 55, 40, 0.35)"; DARK_PROG_INK="rgb(110, 231, 183)"
LIGHT_TITLE_INK="lab(15.0353 1.96067 1.53427)"; LIGHT_PROG_BG="lab(97.8462 -6.94966 1.85487)"; LIGHT_PROG_INK="lab(44.4871 -41.0396 11.0361)"
# ---- خانوادهٔ رزِ CTA + بازخورد (جایگاهِ قفل — پسِ رانِ learn پر میشود):
LOCK_CTA_BORDER_L="lab(76.6339 38.3549 9.68835)"; LOCK_CTA_BORDER_D="rgba(150, 50, 65, 0.55)"
LOCK_ICON_BG_L="lab(41.1651 71.6251 30.3087)"; LOCK_ICON_BG_D="lab(41.1651 71.6251 30.3087)"
LOCK_PILL_BG_L="lab(49.1882 81.577 36.0311)"; LOCK_PILL_BG_D="lab(49.1882 81.577 36.0311)"
LOCK_CTA_IMG_L="linear-gradient(to left, lab(96.2369 4.94155 1.28011) 0%, lab(96.5005 4.18508 1.52328) 100%)"; LOCK_CTA_IMG_D="linear-gradient(270deg, rgba(88, 18, 30, 0.5), rgba(24, 21, 18, 0.92))"
LOCK_FB_OK_L="rgb(4, 120, 87)"; LOCK_FB_OK_D="TBD"
LOCK_FB_ERR_L="rgb(190, 18, 60)"; LOCK_FB_ERR_D="TBD"

# ---- داورِ ورودِ موتور ($1 صحنه · $2 MODE · $3 چیپِ موردانتظار ·
# $4 عنوانِ موردانتظار · $5 IMMED=1|0) — سریالِ زمردیِ میراث در هر دو حالت
judge_engine(){
  local TITLE_INK PROG_BG PROG_INK L="${LEARN_MODE:-0}"
  if [ "$2" = DARK ]; then TITLE_INK="$DARK_TITLE_INK"; PROG_BG="$DARK_PROG_BG"; PROG_INK="$DARK_PROG_INK"; else TITLE_INK="$LIGHT_TITLE_INK"; PROG_BG="$LIGHT_PROG_BG"; PROG_INK="$LIGHT_PROG_INK"; fi
  probe "(()=>{const errs=[];const W=(t,a)=>{if(t!==a)errs.push(t+'!='+a);};const title=[...document.querySelectorAll('span')].find(s=>(s.textContent||'').trim()==='$4'&&s.getBoundingClientRect().width>0);if(!title)errs.push('NO-TITLE');const chip=[...document.querySelectorAll('span')].find(s=>(s.textContent||'').trim()==='$3'&&s.getBoundingClientRect().width>0);if(!chip)errs.push('NO-CHIP:$3');const opts=[...document.querySelectorAll('[data-quiz-option]')].filter(b=>b.getBoundingClientRect().width>0);if(opts.length!==4)errs.push('OPTS:'+opts.length);const q=document.querySelector('p.en-text');if(!q||!(q.textContent||'').trim())errs.push('NO-QUESTION');const fb=document.querySelector('[data-quiz-feedback]');if(fb)errs.push('FEEDBACK-AT-ENTRY');const tmr=[...document.querySelectorAll('span')].find(s=>/^\\d+:\\d{2}$/.test((s.textContent||'').trim())&&s.getBoundingClientRect().width>0);if(tmr)errs.push('TIMER-PRESENT-UNTIMED');const bar=[...document.querySelectorAll('div')].find(d=>d.style&&String(d.className).includes('rounded-full')&&d.getBoundingClientRect().height>0&&d.getBoundingClientRect().height<12&&d.getBoundingClientRect().width>0);const barW=bar?bar.style.width:'';if(barW&&barW!=='0%'&&barW!=='0px')errs.push('BAR-NOT-ZERO:'+barW);if('$5'==='1'){const nxt=document.querySelector('[data-quiz-next]');if(nxt)errs.push('NEXT-AT-IMMEDIATE-ENTRY');window.__r451Q1=q?(q.textContent||'').trim():'';}else{const hint=[...document.querySelectorAll('span')].find(s=>(s.textContent||'').includes('پاسخ‌ها در پایان نمایش داده می‌شوند'));if(!hint)errs.push('NO-HINT');const nxt=document.querySelector('[data-quiz-next]');if(!nxt)errs.push('NO-NEXT');if(nxt&&!(nxt.textContent||'').includes('بعدی'))errs.push('NEXT-LABEL:'+((nxt.textContent||'').trim()));}const docOver=document.documentElement.scrollWidth>window.innerWidth+1;if(docOver)errs.push('DOC-OVERX');const tcs=title?getComputedStyle(title):null;const ccs=chip?getComputedStyle(chip):null;if('$L'==='1'){return 'LEARN-$1:'+JSON.stringify({titleInk:tcs?tcs.color:'',progBg:ccs?ccs.backgroundColor:'',progInk:ccs?ccs.color:'',q1:((q?q.textContent||'':'').trim().slice(0,60))});}if(tcs)W(tcs.color,'$TITLE_INK');if(ccs){W(ccs.backgroundColor,'$PROG_BG');W(ccs.color,'$PROG_INK');}return errs.length?('FAIL-$1:'+errs.join('|')):('$1-OK');})()"
}

# ---- داورِ پردهٔ نتیجه ($1 صحنه · $2 پیشوندِ عنوان) — PCT و چیپِ خطا
# را در window میگذارد و توکنهایِ W=/PCT= را چاپ میکند
judge_result(){
  probe "(()=>{const errs=[];const fa='۰۱۲۳۴۵۶۷۸۹';const toEn=(s)=>String(s).replace(/[۰-۹]/g,(c)=>fa.indexOf(c));const title=[...document.querySelectorAll('span')].find(s=>(s.textContent||'').includes('$2')&&(s.textContent||'').includes('نتیجهٔ نهایی')&&s.getBoundingClientRect().width>0);if(!title)errs.push('NO-TITLE');const pct=[...document.querySelectorAll('div')].find(d=>String(d.className).includes('text-2xl')&&/٪$/.test((d.textContent||'').trim())&&d.getBoundingClientRect().width>0);if(!pct)errs.push('NO-PCT');const counter=[...document.querySelectorAll('div')].find(d=>/^\\d+\\/\\d+$/.test((d.textContent||'').trim()));if(!counter)errs.push('NO-COUNTER');const resume=document.querySelector('[data-testid=\"results-resume-row\"]');if(!resume)errs.push('NO-RESUME-ROW');const opts=document.querySelector('[data-quiz-option]');if(opts)errs.push('ENGINE-STILL-THERE');const wchip=[...document.querySelectorAll('span')].find(s=>(s.textContent||'').includes('سؤال به بانک مرور اشتباهات اضافه شد'));const wtxt=wchip?(wchip.textContent||''):'';const wm=wtxt.match(/([۰-۹\d]+)\\s*سؤال/);const wv=wm?+toEn(wm[1]):0;window.__r451w=wv;const pv=pct?+toEn((pct.textContent||'').replace('٪','')):null;window.__r451pct=pv;const docOver=document.documentElement.scrollWidth>window.innerWidth+1;if(docOver)errs.push('DOC-OVERX');return errs.length?('FAIL-$1:'+errs.join('|')):('$1-OK|W='+wv+'|PCT='+pv+'|COUNTER='+(counter?(counter.textContent||'').trim():'')+'|WTXT='+wtxt.slice(0,30));})()"
}

# ---- داورِ CTAِ رزگون ($1 صحنه · $2 MODE) — شمارش + خانوادهٔ رز
judge_cta(){
  local L="${LEARN_MODE:-0}"
  local CB IG PB CI
  if [ "$2" = DARK ]; then CB="$LOCK_CTA_BORDER_D"; IG="$LOCK_ICON_BG_D"; PB="$LOCK_PILL_BG_D"; CI="$LOCK_CTA_IMG_D"; else CB="$LOCK_CTA_BORDER_L"; IG="$LOCK_ICON_BG_L"; PB="$LOCK_PILL_BG_L"; CI="$LOCK_CTA_IMG_L"; fi
  probe "(()=>{const errs=[];const W=(t,a)=>{if(t!==a)errs.push(t+'!='+a);};const fa='۰۱۲۳۴۵۶۷۸۹';const toEn=(s)=>String(s).replace(/[۰-۹]/g,(c)=>fa.indexOf(c));const cta=document.querySelector('.mistakes-cta');if(!cta)return 'FAIL-$1:NO-CTA';const cn=(cta.textContent||'').match(/([۰-۹\d]+)\\s*سؤال از بانک/);if(!cn)errs.push('CTA-COUNT-FMT');const n=cn?+toEn(cn[1]):null;window.__r451cta=n;const icon=[...cta.querySelectorAll('span')].find(s=>String(s.className).includes('bg-rose-700'));if(!icon)errs.push('NO-ICON-BOX');const pill=[...cta.querySelectorAll('span')].find(s=>(s.textContent||'').trim()==='شروع مرور');if(!pill)errs.push('NO-PILL');const docOver=document.documentElement.scrollWidth>window.innerWidth+1;if(docOver)errs.push('DOC-OVERX');const ccs=getComputedStyle(cta);const ics=icon?getComputedStyle(icon):null;const pcs=pill?getComputedStyle(pill):null;if('$L'==='1'){return 'LEARN-$1:'+JSON.stringify({n,border:ccs.borderTopColor,img:ccs.backgroundImage,iconBg:ics?ics.backgroundColor:'',pillBg:pcs?pcs.backgroundColor:'',pillInk:pcs?pcs.color:''});}const cn2=(cta.textContent||'').match(/([۰-۹]+)\\s*سؤال از بانک/);if(cn2&&!(cta.textContent||'').includes('که اشتباه جواب داده‌ای'))errs.push('CTA-SUB-FMT');W(ccs.borderTopColor,'$CB');W(ccs.backgroundImage,'$CI');if(ics)W(ics.backgroundColor,'$IG');if(pcs)W(pcs.backgroundColor,'$PB');return errs.length?('FAIL-$1:'+errs.join('|')):('$1-OK|N='+n);})()"
}

# ---- داورِ غیابِ CTA ($1 صحنه) — صفرِ صادق یا بستهشدنِ حلقه
judge_cta_absent(){
  probe "(()=>{const cta=document.querySelector('.mistakes-cta');const raw=JSON.parse(localStorage.getItem('vision2-study-v1')||'{\"state\":{}}').state;const m=raw.mistakes||{};const ks=Object.keys(m).filter(k=>k.startsWith('0:'));const errs=[];if(cta&&cta.getBoundingClientRect().width>0)errs.push('CTA-STILL-THERE');if(ks.length>0)errs.push('BANK-NOT-EMPTY:'+ks.length);return errs.length?('FAIL-$1:'+errs.join('|')):('$1-OK|BANK=0');})()"
}

# ---- بانکِ RAW (کلیدهایِ «0:») — راویِ دومِ میان-رسانه — توکنِ ساده (درسِ
# رانِ learn2: JSON.stringify در خروجیِ eval escape میشود و parse را میشکند)
bank_raw(){
  getvar "(()=>{const raw=JSON.parse(localStorage.getItem('vision2-study-v1')||'{\"state\":{}}').state;const m=raw.mistakes||{};const ks=Object.keys(m).filter(k=>k.startsWith('0:')).sort();return 'BANK-N:'+ks.length+'|KS:'+ks.join(',');})()" | tee -a "$OUT"; echo | tee -a "$OUT"
}

# ---- گامِ راندِ exam (auto-advance): گزینهٔ نخست → چیپِ تازه یا FINISHED
drive_exam_q(){
  getvar "(()=>new Promise((res)=>{const b=document.querySelector('[data-quiz-option=\"0\"]');if(!b||b.getBoundingClientRect().width===0||b.disabled)return res('NO-OPT');b.click();setTimeout(()=>{const chip=[...document.querySelectorAll('span')].find(s=>/^\\d+ \\/ \\d+$/.test((s.textContent||'').trim())&&s.getBoundingClientRect().width>0);if(chip)return res('ADV:'+(chip.textContent||'').trim());const pct=[...document.querySelectorAll('div')].find(d=>String(d.className).includes('text-2xl')&&/٪$/.test((d.textContent||'').trim()));if(pct)return res('FINISHED');res('UNKNOWN');},900);}))()"
}

# ---- گامِ یادگیری (immediate): گزینهٔ نخست → بازخوردِ فوری + شاخصِ درست
drive_learn_q(){
  getvar "(()=>new Promise((res)=>{const opts=[...document.querySelectorAll('[data-quiz-option]')].filter(b=>b.getBoundingClientRect().width>0&&!b.disabled);if(opts.length!==4)return res('OPTS:'+opts.length);const q=document.querySelector('p.en-text');const key=((q?q.textContent||'':'').trim()).slice(0,60);opts[0].click();setTimeout(()=>{const fb=document.querySelector('[data-quiz-feedback]');if(!fb)return res('NO-FEEDBACK');const ok=!![...fb.querySelectorAll('p')].find(p=>(p.textContent||'').startsWith('✓'));const corr=[...document.querySelectorAll('[data-quiz-option]')].find(b=>String(b.className).includes('border-emerald-500')&&b.getBoundingClientRect().width>0);const ci=corr?corr.getAttribute('data-quiz-option'):null;const wrongRow=!![...document.querySelectorAll('[data-quiz-option]')].find(b=>String(b.className).includes('border-rose-400')&&b.getBoundingClientRect().width>0);const dims=[...document.querySelectorAll('[data-quiz-option]')].filter(b=>String(b.className).includes('opacity-60')).length;const nxt=document.querySelector('[data-quiz-next]');const nl=nxt?(nxt.textContent||'').trim():'';window.__r451=window.__r451||{};if(ci!==null)window.__r451[key]=+ci;const fp=[...fb.querySelectorAll('p')][0];const fcs=fp?getComputedStyle(fp):null;res(JSON.stringify({st:ok?'R':'W',ci:ci,wr:wrongRow,dims:dims,nl:nl.slice(0,12),ink:fcs?fcs.color:'',key:key.slice(0,36)}));},700);}))()"
}

# ---- گامِ پاسخِ یادگرفتهشده: شاخصِ بایگانی‌شده از بازخوردِ راندِ ۱
drive_learned_q(){
  getvar "(()=>new Promise((res)=>{const q=document.querySelector('p.en-text');const key=((q?q.textContent||'':'').trim()).slice(0,60);const ci=(window.__r451||{})[key];if(ci===undefined)return res('NO-LEARNED:'+key.slice(0,30));const b=document.querySelector('[data-quiz-option=\"'+ci+'\"]');if(!b||b.getBoundingClientRect().width===0||b.disabled)return res('NO-OPT');b.click();setTimeout(()=>{const fb=document.querySelector('[data-quiz-feedback]');const ok=fb&&!![...fb.querySelectorAll('p')].find(p=>(p.textContent||'').startsWith('✓'));res(JSON.stringify({st:ok?'R':'W',ci:ci}));},700);}))()"
}

# ---- گامِ بعدی (immediate): «سؤال بعدی»/«دیدن نتیجه» → چیپ یا RESULT
drive_next(){
  getvar "(()=>new Promise((res)=>{const b=document.querySelector('[data-quiz-next]');if(!b||b.getBoundingClientRect().width===0)return res('NO-NEXT');b.click();setTimeout(()=>{const chip=[...document.querySelectorAll('span')].find(s=>/^\\d+ \\/ \\d+$/.test((s.textContent||'').trim())&&s.getBoundingClientRect().width>0);if(chip)return res('NEXT:'+(chip.textContent||'').trim());const pct=[...document.querySelectorAll('div')].find(d=>String(d.className).includes('text-2xl')&&/٪$/.test((d.textContent||'').trim()));if(pct)return res('RESULT');res('UNKNOWN');},800);}))()"
}

ledger(){ node -e "const {PrismaClient}=require('@prisma/client');const db=new PrismaClient();const d=new Date();const key=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');const one=(n)=>db.eventDay.findFirst({where:{name:n,day:key}}).then((r)=>[n,r?r.count:0]);Promise.all([one('exam_done'),one('quiz_done'),one('my_words_review_start')]).then((rows)=>{rows.forEach(([n,c])=>console.log(n.toUpperCase()+'('+key+'):'+c));return db.quizAttempt.findMany({where:{category:{in:['exam','mistakes']}},orderBy:{id:'asc'}});}).then((rows)=>{console.log('ATTEMPTS:'+JSON.stringify(rows.map((r)=>({cat:r.category,lesson:r.lesson,total:r.total,correct:r.correct,percent:r.percent}))));return db.eventDay.findFirst({where:{name:'drill_due_jump'}});}).then((r)=>{console.log('LEDGER:',JSON.stringify(r?{name:r.name,count:r.count,day:r.day}:null));return db.\$disconnect();}).catch((e)=>{console.log('LEDGER-ERR:'+e.message);process.exit(0);})" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

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

echo "########## A) بانکِ بذرِ پرسونا — CTA با «۲» و بانکِ {x-5، x-23}" | tee -a "$OUT"
boot
click_card "آزمون جامع"; sleep 2.5
LEARN_MODE="${LEARN_MODE:-0}" judge_cta CTA-SEEDED LIGHT
bank_raw
probe "(()=>{const raw=JSON.parse(localStorage.getItem('vision2-study-v1')||'{\"state\":{}}').state;const m=raw.mistakes||{};const ks=Object.keys(m).filter(k=>k.startsWith('0:')).sort();const exact=JSON.stringify(ks)===JSON.stringify(['0:x-23','0:x-5']);return exact?'SEED-KEYS-EXACT':'SEED-KEYS-BAD:'+JSON.stringify(ks);})()"
qa_shot r451-cta-seeded-light.png

echo "########## B) راندِ واقعیِ آزمون (۱۰ سؤال، بدون تایمر) — تغذیهٔ بانک" | tee -a "$OUT"
click_by_label "بدون تایمر"; sleep 0.8
click_by_label "شروع آزمون جامع"; sleep 2.5
qa_to_dark; sleep 1
LEARN_MODE="${LEARN_MODE:-0}" judge_engine EXAM-ENTRY-DARK DARK "1 / 10" "آزمون جامع واژگان (10 تست)" 0
qa_shot r451-exam-entry-dark.png
qa_to_light; sleep 1
LEARN_MODE="${LEARN_MODE:-0}" judge_engine EXAM-ENTRY-LIGHT LIGHT "1 / 10" "آزمون جامع واژگان (10 تست)" 0
qa_shot r451-exam-entry-light.png
for i in 1 2 3 4 5 6 7 8 9 10; do
  R=$(drive_exam_q)
  if [ "$i" -lt 10 ]; then EXP="ADV:$((i+1)) / 10"; else EXP="FINISHED"; fi
  echo "EXAM-STEP-$i: $R (expect $EXP)" | tee -a "$OUT"
  if [ "$R" != "$EXP" ]; then echo "FAIL-EXAM-DRIVE-STEP-$i" | tee -a "$OUT"; fi
  sleep 0.3
done
qa_wait_toasts_clear
judge_result EXAM-RESULT "آزمون جامع واژگان (10 تست)"
qa_shot r451-exam-result-light.png
bank_raw
NW=$(rg -o 'EXAM-RESULT-OK\|W=[0-9]+' "$OUT" | tail -1 | grep -o '[0-9]*$')
NB=$(rg -o 'BANK-N:[0-9]+' "$OUT" | tail -1 | grep -o '[0-9]*$')
echo "BANK-FEED: wrongs=$NW bankAfter=$NB (۲ بذری + نادرستهایِ تازه − پاکشدههایِ درست)" | tee -a "$OUT"
click_by_label "بازگشت"; sleep 1.5

if [ "${NB:-0}" -eq 0 ] 2>/dev/null || [ -z "${NB:-}" ]; then
  echo "########## لبهٔ صادق: بانک خالی — C/E ناممکن" | tee -a "$OUT"
  judge_cta_absent ZERO-BANK-EDGE
  agent-browser close >/dev/null 2>&1 || true
  echo "########## WITNESS-DONE (EDGE)" | tee -a "$OUT"
  exit 0
fi
W="$NB"

echo "########## C) CTAِ رزگون — شمارشِ همسان با بانک ($W) + خانوادهٔ رز — دو حالت" | tee -a "$OUT"
LEARN_MODE="${LEARN_MODE:-0}" judge_cta CTA-PRESENT-LIGHT LIGHT
CN=$(rg -o 'CTA-PRESENT-LIGHT-OK\|N=[0-9]+' "$OUT" | tail -1 | grep -o '[0-9]*$')
if [ "${CN:-0}" != "$W" ]; then echo "FAIL-CTA-COUNT-MISMATCH:CTA=$CN BANK=$W" | tee -a "$OUT"; fi
qa_shot r451-cta-present-light.png
qa_to_dark; sleep 1
LEARN_MODE="${LEARN_MODE:-0}" judge_cta CTA-PRESENT-DARK DARK
qa_shot r451-cta-present-dark.png
qa_to_light; sleep 1
click_cta; sleep 2.5
qa_to_dark; sleep 1
LEARN_MODE="${LEARN_MODE:-0}" judge_engine REVIEW-ENTRY-DARK DARK "1 / $W" "مرور اشتباهات آزمون جامع" 1
qa_shot r451-review-entry-dark.png
qa_to_light; sleep 1
LEARN_MODE="${LEARN_MODE:-0}" judge_engine REVIEW-ENTRY-LIGHT LIGHT "1 / $W" "مرور اشتباهات آزمون جامع" 1
qa_shot r451-review-entry-light.png

echo "########## D) راندِ مرورِ ۱ — گزینهٔ نخست + یادگیری از بازخورد" | tee -a "$OUT"
for i in $(seq 1 "$W"); do
  L=$(drive_learn_q)
  echo "LEARN-STEP-$i: $L" | tee -a "$OUT"
  N=$(drive_next)
  if [ "$i" -lt "$W" ]; then EXP="NEXT:$((i+1)) / $W"; else EXP="RESULT"; fi
  echo "NEXT-STEP-$i: $N (expect $EXP)" | tee -a "$OUT"
  if [ "$N" != "$EXP" ]; then echo "FAIL-NEXT-STEP-$i" | tee -a "$OUT"; fi
  sleep 0.3
done
qa_wait_toasts_clear
judge_result REVIEW1-RESULT "مرور اشتباهات آزمون جامع"
qa_shot r451-review1-result-light.png
bank_raw
N1=$(rg -o 'REVIEW1-RESULT-OK\|W=[0-9]+' "$OUT" | tail -1 | grep -o '[0-9]*$')
echo "ROUND1-FEED: N1=${N1:-0} (خطاهایِ همانِ راند — بانکِ پسماند)" | tee -a "$OUT"
click_by_label "بازگشت"; sleep 1.5

if [ "${N1:-0}" -eq 0 ] 2>/dev/null; then
  echo "########## راندِ ۱ همهٔ بانک را پاک کرد — بستهشدنِ مستقیم" | tee -a "$OUT"
  judge_cta_absent CLOSED-DIRECT
else
  echo "########## E) راندِ مرورِ ۲ — پاسخهایِ «یادگرفتهشده» از بازخوردِ ۱" | tee -a "$OUT"
  LEARN_MODE="${LEARN_MODE:-0}" judge_cta CTA-R2 LIGHT
  CR=$(rg -o 'CTA-R2-OK\|N=[0-9]+' "$OUT" | tail -1 | grep -o '[0-9]*$')
  if [ "${CR:-0}" != "$N1" ]; then echo "FAIL-CTA-R2-COUNT-MISMATCH:CTA=$CR BANK=$N1" | tee -a "$OUT"; fi
  click_cta; sleep 2.5
  LEARN_MODE="${LEARN_MODE:-0}" judge_engine REVIEW2-ENTRY LIGHT "1 / $N1" "مرور اشتباهات آزمون جامع" 1
  for i in $(seq 1 "$N1"); do
    L=$(drive_learned_q)
    echo "LEARNED-STEP-$i: $L" | tee -a "$OUT"
    N=$(drive_next)
    if [ "$i" -lt "$N1" ]; then EXP="NEXT:$((i+1)) / $N1"; else EXP="RESULT"; fi
    echo "NEXT2-STEP-$i: $N (expect $EXP)" | tee -a "$OUT"
    if [ "$N" != "$EXP" ]; then echo "FAIL-NEXT2-STEP-$i" | tee -a "$OUT"; fi
    sleep 0.3
  done
  qa_wait_toasts_clear
  judge_result REVIEW2-RESULT "مرور اشتباهات آزمون جامع"
  qa_shot r451-review2-result-light.png
  bank_raw
  click_by_label "بازگشت"; sleep 1.5
  judge_cta_absent CLOSED-LOOP
fi
qa_shot r451-closed-zero-light.png

echo "########## F) دفترِ نهایی — DOM٪ در برابر DB٪" | tee -a "$OUT"
probe "(()=>{return 'DOM-EXAM-PCT:'+(typeof window.__r451pct!=='undefined'?window.__r451pct:'?')+'|LAST-W:'+(typeof window.__r451w!=='undefined'?window.__r451w:'?');})()"
ledger

agent-browser close >/dev/null 2>&1 || true
echo "########## WITNESS-DONE" | tee -a "$OUT"
