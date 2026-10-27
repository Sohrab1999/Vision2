#!/usr/bin/env bash
# ------------------------------------------------------------------
# r447 — «شاهدِ موبایلِ حالتِ ۸+ستارهٔ گروهِ طولِ جلسهٔ مرور»
# پنجاهودومین مصرفکنندهٔ qa-lib.sh. بندِ ①ِ r446 — آنسویِ لبهٔ تزئینیِ ۴ستاره:
#   در r446 با کفِ ۴ستاره، هر دو چیپِ ۸/۱۵ غیرفعال و هیچکدام فشرده نبودند
#   (گروه تزئینی بود). این راند: حالتهایِ واقعاً فعالِ همان گروه.
# صحنهٔ A (۸ ستارهٔ واقعیِ درسِ ۱): شروعِ «شروع مرور (۸ سؤال)» (clamped=min(8,8)=۸)
#   + چیپِ ۸ فعال و فشرده (aria-pressed=true — سریالِ فعالِ کهربایی — نو) +
#   چیپِ ۱۵ غیرفعال (n=8<15 — opacity 0.35) — داوری در شب و روشن.
# صحنهٔ B (راندِ واقعیِ ۸سؤالیِ immediate): ورود به موتور (چیپِ «1 / 8» با
#   ارقامِ لاتین — برادرِ بزرگِ «1 / 4»ِ r446)؛ هشت پاسخِ نخستینگزینهایِ
#   صادقانهٔ تصادفی (ایدئومِ r441) → پردهٔ نتیجهٔ standardCard → خروجِ
#   «بازگشت» → لانچرِ سالم.
# صحنهٔ C (۱۵ ستارهٔ واقعی): هر دو چیپِ ۸/۱۵ فعال — ۸ فشرده (پیشفرض)،
#   ۱۵ فعالِ غیرفشرده — نقطهٔ شیرینِ آنسویِ لبه؛ داوری در شب و روشن.
# داوریها با کلیدِ صریحِ حالت (درسِ r445) + سرریزِ صفرِ سکشن/سند + ۶ شات.
# دفترِ صادق: my_words_review_start دقیقاً +۱ (یک شروعِ آزمون در صحنهٔ B)؛
#   quiz_done +۱ و یک attempt (lesson=0، total=۸، category=my-words)؛
#   ۱۳۱ drill_due_jump دستنخورده.
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
OUT=/tmp/r447-eight-stars-witness.txt
QA_SEED_FILE=/tmp/r447-witness-seed-eval.js
: > "$OUT"

source /home/z/my-project/scripts/qa-lib.sh

probe(){ agent-browser eval "$1" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

click_by_label(){ agent-browser eval "(()=>{let b=document.querySelector('[aria-label=\"$1\"]');if(!b||b.getBoundingClientRect().width===0){b=[...document.querySelectorAll('button')].find((x)=>(x.innerText||'').replace(/\s+/g,' ').trim()==='$1'&&x.getBoundingClientRect().width>0);}if(!b)return 'NO-BTN:$1';b.click();return 'CLICKED:$1';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

click_card(){ agent-browser eval "(()=>{const b=[...document.querySelectorAll('button')].find((x)=>(x.innerText||'').includes('$1')&&x.getBoundingClientRect().width>0);if(!b)return 'NO-BTN:$1';b.click();return 'CLICKED:$1';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

dismiss_install(){ probe "(()=>{const b=document.querySelector('[aria-label=\"بستن پیشنهاد نصب\"]');if(b&&b.getBoundingClientRect().width>0){b.click();return 'INSTALL-CARD-DISMISSED';}return 'NO-INSTALL-CARD';})()"; sleep 1; }

# ---- سریالهایِ آموختهشده:
#   لانچر = عینِ خانوادهٔ کهرباییِ r446 (زیرعنوانِ سنگیِ بازنگاشتهٔ شب، گرادیانِ
#   کهربایی-نارنجی با stopِ دومِ بازنگاشته)؛ چیپِ ۸ فعال و چیپِ ۱۵ از رانِ
#   learn این راند قفل میشوند؛ موتور: چیپِ «1 / 8» = عینِ زمردیِ r437/r438/r446.
DARK_SUB_INK="rgb(156, 149, 140)"; DARK_H2_INK="rgb(236, 234, 230)"; DARK_START_BG="rgba(0, 0, 0, 0)"; DARK_START_INK="rgb(255, 255, 255)"; DARK_START_IMG="linear-gradient(to left, lab(47.2709 42.9082 69.2966) 0%, rgb(194, 65, 12) 100%)"; DARK_C8_BG="rgba(87, 62, 14, 0.5)"; DARK_C8_INK="rgb(251, 191, 36)"; DARK_C8_BD="rgba(180, 130, 20, 0.6)"; DARK_C8_OP="1"; DARK_C15_BG="rgb(28, 25, 23)"; DARK_C15_INK="rgb(156, 149, 140)"; DARK_C15_BD="rgb(55, 49, 43)"; DARK_C15_OP="0.35"; DARK_C15E_OP="1"; DARK_TITLE_INK="rgb(236, 234, 230)"; DARK_PROG_BG="rgba(6, 55, 40, 0.35)"; DARK_PROG_INK="rgb(110, 231, 183)"
LIGHT_SUB_INK="lab(44.2882 2.36151 4.27174)"; LIGHT_H2_INK="lab(15.0353 1.96067 1.53427)"; LIGHT_START_BG="rgba(0, 0, 0, 0)"; LIGHT_START_INK="rgb(255, 255, 255)"; LIGHT_START_IMG="linear-gradient(to left, lab(47.2709 42.9082 69.2966) 0%, lab(46.4615 57.7275 70.8507) 100%)"; LIGHT_C8_BG="lab(95.916 -1.21653 23.111)"; LIGHT_C8_INK="lab(47.2709 42.9082 69.2966)"; LIGHT_C8_BD="lab(80.1641 16.6016 99.2089)"; LIGHT_C8_OP="1"; LIGHT_C15_BG="rgb(255, 255, 255)"; LIGHT_C15_INK="lab(44.2882 2.36151 4.27174)"; LIGHT_C15_BD="lab(91.055 0.663072 0.865579)"; LIGHT_C15_OP="0.35"; LIGHT_C15E_OP="1"; LIGHT_TITLE_INK="lab(15.0353 1.96067 1.53427)"; LIGHT_PROG_BG="lab(97.8462 -6.94966 1.85487)"; LIGHT_PROG_INK="lab(44.4871 -41.0396 11.0361)"

# ---- داورِ گروهِ طولِ جلسه در حالتِ فعال (هستهٔ این راند) ----
# $1 صحنه · $2 DARK|LIGHT · $3 C15 DISABLED|ENABLED · $4 متنِ دقیقِ دکمهٔ شروع
judge_group(){
  local SUB_INK H2_INK START_BG START_INK START_IMG C8_BG C8_INK C8_BD C8_OP C15_BG C15_INK C15_BD C15_OP C15E_OP L="${LEARN_MODE:-0}"
  if [ "$2" = DARK ]; then SUB_INK="$DARK_SUB_INK"; H2_INK="$DARK_H2_INK"; START_BG="$DARK_START_BG"; START_INK="$DARK_START_INK"; START_IMG="$DARK_START_IMG"; C8_BG="$DARK_C8_BG"; C8_INK="$DARK_C8_INK"; C8_BD="$DARK_C8_BD"; C8_OP="$DARK_C8_OP"; C15_BG="$DARK_C15_BG"; C15_INK="$DARK_C15_INK"; C15_BD="$DARK_C15_BD"; C15_OP="$DARK_C15_OP"; C15E_OP="$DARK_C15E_OP"; else SUB_INK="$LIGHT_SUB_INK"; H2_INK="$LIGHT_H2_INK"; START_BG="$LIGHT_START_BG"; START_INK="$LIGHT_START_INK"; START_IMG="$LIGHT_START_IMG"; C8_BG="$LIGHT_C8_BG"; C8_INK="$LIGHT_C8_INK"; C8_BD="$LIGHT_C8_BD"; C8_OP="$LIGHT_C8_OP"; C15_BG="$LIGHT_C15_BG"; C15_INK="$LIGHT_C15_INK"; C15_BD="$LIGHT_C15_BD"; C15_OP="$LIGHT_C15_OP"; C15E_OP="$LIGHT_C15E_OP"; fi
  probe "(()=>{const errs=[];const W=(t,a)=>{if(t!==a)errs.push(t+'!='+a);};const sec=document.querySelector('[aria-label=\"مرور واژه‌های نشان‌شده\"]');if(!sec)return 'FAIL-$1:NO-LAUNCHER';const h2=sec.querySelector('h2');if(!h2||(h2.textContent||'').trim()!=='مرور نشان‌شده‌ها')errs.push('H2:'+(h2?h2.textContent:'none'));const p=sec.querySelector('p');const sub=(p?p.textContent:'').trim();if(sub!=='آزمونی از همین لیست — سؤال‌های رسمی بانک + تمرین دوطرفه؛ مربعِ فیلترها هم اثر می‌کند')errs.push('SUB:'+sub);const door=[...sec.querySelectorAll('button')].find(b=>(b.innerText||'').trim()==='رفتن به دیکشنری');if(door)errs.push('DOOR-PRESENT');const grp=sec.querySelector('[role=\"group\"]');if(!grp)errs.push('NO-GROUP');if(grp&&(grp.getAttribute('aria-label')||'')!=='طول جلسهٔ مرور')errs.push('GROUP-ARIA:'+(grp.getAttribute('aria-label')||'none'));let c8=null,c15=null;if(grp){c8=[...grp.querySelectorAll('button')].find(b=>(b.innerText||'').trim()==='۸');c15=[...grp.querySelectorAll('button')].find(b=>(b.innerText||'').trim()==='۱۵');if(!c8)errs.push('NO-CHIP8');if(!c15)errs.push('NO-CHIP15');if(c8&&c8.disabled)errs.push('CHIP8-DISABLED');if(c8&&c8.getAttribute('aria-pressed')!=='true')errs.push('CHIP8-NOT-PRESSED:'+(c8.getAttribute('aria-pressed')||'none'));if(c15){if('$3'==='DISABLED'&&!c15.disabled)errs.push('CHIP15-ENABLED-AT-8');if('$3'==='ENABLED'&&c15.disabled)errs.push('CHIP15-DISABLED-AT-15');if(c15.getAttribute('aria-pressed')!=='false')errs.push('CHIP15-PRESSED-UNEXPECTED');}}const start=[...sec.querySelectorAll('button')].find(b=>(b.innerText||'').includes('شروع مرور'));if(!start)errs.push('NO-START');const startTxt=start?(start.innerText||'').replace(/\s+/g,' ').trim():'';if(startTxt!=='$4')errs.push('START-TXT:'+startTxt);const secOver=sec.scrollWidth>Math.ceil(sec.clientWidth)+1;const docOver=document.documentElement.scrollWidth>window.innerWidth+1;if(secOver)errs.push('SEC-OVERX');if(docOver)errs.push('DOC-OVERX');const pcs=p?getComputedStyle(p):null;const hcs=h2?getComputedStyle(h2):null;const c8s=c8?getComputedStyle(c8):null;const c15s=c15?getComputedStyle(c15):null;const scs=start?getComputedStyle(start):null;if('$L'==='1'){return 'LEARN-$1:'+JSON.stringify({sub,subInk:pcs?pcs.color:'',h2Ink:hcs?hcs.color:'',c8Bg:c8s?c8s.backgroundColor:'',c8Ink:c8s?c8s.color:'',c8Bd:c8s?c8s.borderTopColor:'',c8Op:c8s?c8s.opacity:'',c15Bg:c15s?c15s.backgroundColor:'',c15Ink:c15s?c15s.color:'',c15Bd:c15s?c15s.borderTopColor:'',c15Op:c15s?c15s.opacity:'',startBg:scs?scs.backgroundColor:'',startInk:scs?scs.color:'',startImg:scs?scs.backgroundImage:''});}if(pcs)W(pcs.color,'$SUB_INK');if(hcs)W(hcs.color,'$H2_INK');if(c8s){W(c8s.backgroundColor,'$C8_BG');W(c8s.color,'$C8_INK');W(c8s.borderTopColor,'$C8_BD');W(c8s.opacity,'$C8_OP');}if(c15s){W(c15s.backgroundColor,'$C15_BG');W(c15s.color,'$C15_INK');W(c15s.borderTopColor,'$C15_BD');W(c15s.opacity,'$3'==='DISABLED'?'$C15_OP':'$C15E_OP');}if(scs){W(scs.backgroundColor,'$START_BG');W(scs.color,'$START_INK');W(scs.backgroundImage,'$START_IMG');}return errs.length?('FAIL-$1:'+errs.join('|')):('$1-OK');})()"
}

# ---- داورِ ورودِ موتور ($3 = متنِ چیپِ پیشرفت) ----
judge_engine(){
  local TITLE_INK PROG_BG PROG_INK L="${LEARN_MODE:-0}"
  if [ "$2" = DARK ]; then TITLE_INK="$DARK_TITLE_INK"; PROG_BG="$DARK_PROG_BG"; PROG_INK="$DARK_PROG_INK"; else TITLE_INK="$LIGHT_TITLE_INK"; PROG_BG="$LIGHT_PROG_BG"; PROG_INK="$LIGHT_PROG_INK"; fi
  probe "(()=>{const errs=[];const W=(t,a)=>{if(t!==a)errs.push(t+'!='+a);};const title=[...document.querySelectorAll('span')].find(s=>(s.textContent||'').trim()==='مرور واژه‌های نشان‌شده'&&s.getBoundingClientRect().width>0);if(!title)errs.push('NO-TITLE');const chip=[...document.querySelectorAll('span')].find(s=>(s.textContent||'').trim()==='$3'&&s.getBoundingClientRect().width>0);if(!chip)errs.push('NO-CHIP:$3');const opts=[...document.querySelectorAll('[data-quiz-option]')].filter(b=>b.getBoundingClientRect().width>0);if(opts.length!==4)errs.push('OPTS:'+opts.length);const nxt=document.querySelector('[data-quiz-next]');if(nxt)errs.push('NEXT-EARLY');const q=document.querySelector('p.en-text');if(!q||!(q.textContent||'').trim())errs.push('NO-QUESTION');const docOver=document.documentElement.scrollWidth>window.innerWidth+1;if(docOver)errs.push('DOC-OVERX');const tcs=title?getComputedStyle(title):null;const ccs=chip?getComputedStyle(chip):null;if('$L'==='1'){return 'LEARN-$1:'+JSON.stringify({titleInk:tcs?tcs.color:'',progBg:ccs?ccs.backgroundColor:'',progInk:ccs?ccs.color:'',q:(q?q.textContent||'':'').slice(0,40)});}if(tcs)W(tcs.color,'$TITLE_INK');if(ccs){W(ccs.backgroundColor,'$PROG_BG');W(ccs.color,'$PROG_INK');}return errs.length?('FAIL-$1:'+errs.join('|')):('$1-OK');})()"
}

# ---- داورِ ساختاریِ پردهٔ نتیجه (سریالهایِ نتیجه از آنِ r441/r446 است) ----
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

EIGHT_STARS="['1:ability','1:absolutely','1:access','1:across','1:action','1:add','1:additional','1:afraid']"
FIFTEEN_STARS="['1:ability','1:absolutely','1:access','1:across','1:action','1:add','1:additional','1:afraid','1:age','1:always','1:amazing','1:amount','1:appear','1:appropriate','1:artist']"

echo "########## A) هشت ستارهٔ واقعیِ درسِ ۱ — پچ + reloadِ واقعی (درسِ r444/r445/r446)" | tee -a "$OUT"
boot
probe "(()=>{const KEY='vision2-study-v1';const raw=JSON.parse(localStorage.getItem(KEY)||'{\"state\":{}}');raw.state.starredWords=$EIGHT_STARS;localStorage.setItem(KEY,JSON.stringify(raw));location.reload();return 'EIGHT-STARS-SEEDED';})()" | tee -a "$OUT"
sleep 4
qa_wait_home || { agent-browser close >/dev/null 2>&1; exit 1; }
dismiss_install
click_card "واژه‌های من"; sleep 2.5
probe "(()=>{const sec=document.querySelector('[aria-label=\"مرور واژه‌های نشان‌شده\"]');if(!sec)return 'NO-LAUNCHER';const start=[...sec.querySelectorAll('button')].find(b=>(b.innerText||'').includes('شروع مرور'));return 'READY8:'+(start?(start.innerText||'').replace(/\s+/g,' ').trim():'START-MISS');})()" | tee -a "$OUT"

echo "########## B) حکمِ گروه در حالتِ ۸ستاره — شب (کلیدِ صریحِ حالت — درسِ r445)" | tee -a "$OUT"
qa_to_dark
probe "(()=>{return document.documentElement.classList.contains('dark')?'DARK-ON':'DARK-OFF';})()" | tee -a "$OUT"
LEARN_MODE="${LEARN_MODE:-0}" judge_group SCENE-A-8STARS DARK DISABLED "شروع مرور (۸ سؤال)"
qa_wait_toasts_clear
qa_shot r447-mobile-review-8stars-dark.png

echo "########## C) روشن — همان حکم + پایهٔ lab" | tee -a "$OUT"
qa_to_light
sleep 1
LEARN_MODE="${LEARN_MODE:-0}" judge_group SCENE-A-8STARS-LIGHT LIGHT DISABLED "شروع مرور (۸ سؤال)"
qa_wait_toasts_clear
qa_shot r447-mobile-review-8stars-light.png

echo "########## D) ورود به موتورِ آزمونِ ۸سؤالی — داورِ ورود در روز و شب (کلیدِ صریحِ حالت)" | tee -a "$OUT"
click_card "شروع مرور"; sleep 2
LEARN_MODE="${LEARN_MODE:-0}" judge_engine ENGINE-ENTRY-8Q-LIGHT LIGHT "1 / 8"
qa_to_dark
sleep 1
LEARN_MODE="${LEARN_MODE:-0}" judge_engine ENGINE-ENTRY-8Q-DARK DARK "1 / 8"

echo "########## E) راندِ واقعیِ ۸سؤالیِ immediate (انتخابِ نخست — صادقانهٔ تصادفی، ایدئومِ r441)" | tee -a "$OUT"
for i in 1 2 3 4 5 6 7 8; do
  answer_q
  sleep 1
  next_q
  sleep 1.2
done
probe "(()=>{const ttl=[...document.querySelectorAll('span')].find(s=>(s.textContent||'').trim()==='مرور واژه‌های نشان‌شده — نتیجهٔ نهایی'&&s.getBoundingClientRect().width>0);const opts=document.querySelector('[data-quiz-option]');return (ttl&&!opts)?'RESULT-REACHED-OK':'NOT-RESULT:'+JSON.stringify({ttl:!!ttl,opts:!!opts});})()" | tee -a "$OUT"

echo "########## F) پردهٔ نتیجه — داورِ ساختاری در شب و روشن + شاتها" | tee -a "$OUT"
qa_wait_toasts_clear
LEARN_MODE="${LEARN_MODE:-0}" judge_result RESULT-8Q-DARK
qa_shot r447-mobile-review-8q-result-dark.png
qa_to_light
sleep 1
LEARN_MODE="${LEARN_MODE:-0}" judge_result RESULT-8Q-LIGHT
qa_wait_toasts_clear
qa_shot r447-mobile-review-8q-result-light.png

echo "########## G) قراردادِ خروجِ «بازگشت» → لانچرِ سالم" | tee -a "$OUT"
click_by_label "بازگشت"; sleep 1.5
probe "(()=>{const sec=document.querySelector('[aria-label=\"مرور واژه‌های نشان‌شده\"]');if(!sec)return 'NO-LAUNCHER';const start=[...sec.querySelectorAll('button')].find(b=>(b.innerText||'').includes('شروع مرور'));return 'EXIT-LAUNCHER-OK:'+(start?'START-BACK':'START-MISS');})()" | tee -a "$OUT"

echo "########## H) صحنهٔ C — پانزده ستارهٔ واقعی — هر دو چیپ فعال (نقطهٔ شیرین)" | tee -a "$OUT"
probe "(()=>{const KEY='vision2-study-v1';const raw=JSON.parse(localStorage.getItem(KEY)||'{\"state\":{}}');raw.state.starredWords=$FIFTEEN_STARS;localStorage.setItem(KEY,JSON.stringify(raw));location.reload();return 'FIFTEEN-STARS-SEEDED';})()" | tee -a "$OUT"
sleep 4
qa_wait_home || { agent-browser close >/dev/null 2>&1; exit 1; }
dismiss_install
click_card "واژه‌های من"; sleep 2.5
qa_to_dark
sleep 1
LEARN_MODE="${LEARN_MODE:-0}" judge_group SCENE-C-15STARS DARK ENABLED "شروع مرور (۸ سؤال)"
qa_wait_toasts_clear
qa_shot r447-mobile-review-15stars-dark.png
qa_to_light
sleep 1
LEARN_MODE="${LEARN_MODE:-0}" judge_group SCENE-C-15STARS-LIGHT LIGHT ENABLED "شروع مرور (۸ سؤال)"
qa_wait_toasts_clear
qa_shot r447-mobile-review-15stars-light.png

echo "########## I) دفترِ صادق — DB ledger" | tee -a "$OUT"
ledger

agent-browser close >/dev/null 2>&1 || true
echo "########## WITNESS-DONE" | tee -a "$OUT"
