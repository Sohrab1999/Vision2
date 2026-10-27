#!/usr/bin/env bash
# ------------------------------------------------------------------
# r445 — «شاهدِ موبایلِ لانچرِ دیکتهٔ ستاره‌ها (my-words-dictation)»
# پنجاهمین مصرفکنندهٔ qa-lib.sh. بندِ ①ِ r444 — پنجمین لانچرِ «واژههای من»
#   که هرگز در ۳۹۰px دیده نشده بود (خویشاوندِ مستقیمِ لانچرهایِ r443/r444).
# صحنهٔ A (ستارهٔ صفر): زیرعنوانِ دقیقِ «برای شروع دیکته حداقل ۴ واژه نشان کن
#   — الان ۰ داری» (DICTATION_MIN_STARS=۴ — همان کفِ لانچرِ آزمون)، شروعِ
#   غایب، درِ «رفتن به دیکشنری» حاضر؛ قراردادِ درِ زنده: کلیک → دیکشنریِ
#   واقعی (placeholderِ یگانهٔ جستجو).
# صحنهٔ B (چهار ستارهٔ واقعیِ درسِ ۱: ability/absolutely/access/across):
#   زیرعنوانِ «املای شنیداری از همین لیست — ...» + «شروع دیکته» حاضر و درِ
#   غایب؛ ورود به تنظیماتِ جلسه («آزمون دیکته — املای شنیداری» + چیپهایِ
#   ۸/۱۰/۱۵/۲۰ با ۱۰ فعال + هوشمندِ پیشفرض)؛ راندِ واقعیِ ۴واژه‌ای با
#   پاسخهایِ درست (نقشهٔ fa→en از خودِ بانکِ درس ۱ — درسِ r432: پایه از
#   داده میآید) — پردهٔ پایانِ «دیکته تمام شد!» با ۱۰۰٪ و «امتیاز ۴ از ۴»
#   و چیپهایِ کامل/راهنما/غلط؛ قراردادِ خروجِ exitLabel («بازگشت به
#   واژههای من») → لانچرِ سالم.
# داوریها در شبِ واقعی و روشن: متنِ دقیق + سریالهایِ آموختهشده (لانچر/
#   تنظیمات/اجرا/پردهٔ پایان) + سرریزِ صفرِ سکشن/سند + شش شات.
# دفترِ صادق: my_words_dictation_start دقیقاً +۱ (یک کلیکِ لانچر)؛
#   quiz_done +۱ و dictation_done +۱ (از finish)؛ و کشفِ نو: برخلافِ
#   فلشکارت، دیکته POST میزند — یک quizAttempt (lesson=0، category=
#   my-words-dictation) از sendStats؛ ۱۳۱ drill_due_jump دستنخورده.
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
OUT=/tmp/r445-dictation-launcher-witness.txt
QA_SEED_FILE=/tmp/r445-witness-seed-eval.js
: > "$OUT"

source /home/z/my-project/scripts/qa-lib.sh

probe(){ agent-browser eval "$1" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

click_by_label(){ agent-browser eval "(()=>{let b=document.querySelector('[aria-label=\"$1\"]');if(!b||b.getBoundingClientRect().width===0){b=[...document.querySelectorAll('button')].find((x)=>(x.innerText||'').replace(/\s+/g,' ').trim()==='$1'&&x.getBoundingClientRect().width>0);}if(!b)return 'NO-BTN:$1';b.click();return 'CLICKED:$1';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

click_card(){ agent-browser eval "(()=>{const b=[...document.querySelectorAll('button')].find((x)=>(x.innerText||'').includes('$1')&&x.getBoundingClientRect().width>0);if(!b)return 'NO-BTN:$1';b.click();return 'CLICKED:$1';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

dismiss_install(){ probe "(()=>{const b=document.querySelector('[aria-label=\"بستن پیشنهاد نصب\"]');if(b&&b.getBoundingClientRect().width>0){b.click();return 'INSTALL-CARD-DISMISSED';}return 'NO-INSTALL-CARD';})()"; sleep 1; }

# ---- سریالهایِ آموختهشده (رانِ learn‌های ۱/۲؛ رانِ سوم اینها را قفل میکند) ----
#   لانچر: عینِ سریالهایِ لانچرِ فلشکارتِ r444 (زیرعنوانِ سنگیِ بازنگاشته + درِ بنفشِ
#   rgba) + گرادیانِ اوکلابِ دکمهٔ شروع که در هر دو حالت یکسان است؛ تنظیمات: h3یِ
#   بازنگاشتهٔ شب ولی چیپِ بنفشِ lab که بازنگاشتِ شب نمیگیرد (عینِ یافتهٔ r444)؛
#   اجرا: چیپِ پیشرفت = عینِ سریالِ چیپِ بنفشِ شب/روزِ r437/r438؛ پایان: چیپِ کامل =
#   عینِ سریالِ زمردیِ شب/روزِ r437/r438 و درصدِ بنفش (violet-600ِ شب → violet-400)
DARK_SUB_INK="rgb(156, 149, 140)"; DARK_H2_INK="rgb(236, 234, 230)"; DARK_DOOR_BG="rgb(28, 25, 23)"; DARK_DOOR_INK="rgb(196, 181, 253)"; DARK_DOOR_BD="rgba(130, 100, 190, 0.55)"; DARK_START_BG="rgba(0, 0, 0, 0)"; DARK_START_INK="rgb(255, 255, 255)"; DARK_START_BD="lab(100 0 0 / 0.1)"; DARK_START_IMG="linear-gradient(to left in oklab, rgb(139, 92, 246) 0%, rgb(217, 70, 239) 100%)"
LIGHT_SUB_INK="lab(44.2882 2.36151 4.27174)"; LIGHT_H2_INK="lab(15.0353 1.96067 1.53427)"; LIGHT_DOOR_BG="rgb(255, 255, 255)"; LIGHT_DOOR_INK="lab(35.2783 67.9912 -88.793)"; LIGHT_DOOR_BD="lab(76.7419 18.3911 -37.0706)"; LIGHT_START_BG="rgba(0, 0, 0, 0)"; LIGHT_START_INK="rgb(255, 255, 255)"; LIGHT_START_BD="lab(90.952 0 -0.0000119209)"; LIGHT_START_IMG="linear-gradient(to left in oklab, rgb(139, 92, 246) 0%, rgb(217, 70, 239) 100%)"
DARK_SETUP_H3="rgb(236, 234, 230)"; DARK_CHIP10_BG="lab(41.088 68.9966 -91.995)"; DARK_CHIP10_INK="rgb(255, 255, 255)"; LIGHT_SETUP_H3="lab(15.0353 1.96067 1.53427)"; LIGHT_CHIP10_BG="lab(41.088 68.9966 -91.995)"; LIGHT_CHIP10_INK="rgb(255, 255, 255)"
DARK_PROG_BG="rgba(59, 40, 92, 0.35)"; DARK_PROG_INK="rgb(196, 181, 253)"; DARK_FA_INK="rgb(236, 234, 230)"; LIGHT_PROG_BG="lab(96.2416 2.28849 -5.51657)"; LIGHT_PROG_INK="lab(35.2783 67.9912 -88.793)"; LIGHT_FA_INK="lab(15.0353 1.96067 1.53427)"
DARK_DONE_H3="rgb(236, 234, 230)"; DARK_PCT_INK="rgb(167, 139, 250)"; DARK_OKCHIP_BG="rgba(6, 55, 40, 0.35)"; DARK_OKCHIP_INK="rgb(110, 231, 183)"; LIGHT_DONE_H3="lab(15.0353 1.96067 1.53427)"; LIGHT_PCT_INK="lab(41.088 68.9966 -91.995)"; LIGHT_OKCHIP_BG="lab(97.8462 -6.94966 1.85487)"; LIGHT_OKCHIP_INK="lab(44.4871 -41.0396 11.0361)"

# ---- داورِ لانچر (یکخطی — استخراجِ پیشْپرواز با check-r445-judges.sh) ----
# $1 صحنه · $2 DARK|LIGHT · $3 زیرعنوانِ دقیق · $4 START PRESENT|ABSENT · $5 DOOR PRESENT|ABSENT
judge_launcher(){
  local SUB_INK H2_INK DOOR_BG DOOR_INK DOOR_BD START_BG START_INK START_BD START_IMG L="${LEARN_MODE:-0}"
  if [ "$2" = DARK ]; then SUB_INK="$DARK_SUB_INK"; H2_INK="$DARK_H2_INK"; DOOR_BG="$DARK_DOOR_BG"; DOOR_INK="$DARK_DOOR_INK"; DOOR_BD="$DARK_DOOR_BD"; START_BG="$DARK_START_BG"; START_INK="$DARK_START_INK"; START_BD="$DARK_START_BD"; START_IMG="$DARK_START_IMG"; else SUB_INK="$LIGHT_SUB_INK"; H2_INK="$LIGHT_H2_INK"; DOOR_BG="$LIGHT_DOOR_BG"; DOOR_INK="$LIGHT_DOOR_INK"; DOOR_BD="$LIGHT_DOOR_BD"; START_BG="$LIGHT_START_BG"; START_INK="$LIGHT_START_INK"; START_BD="$LIGHT_START_BD"; START_IMG="$LIGHT_START_IMG"; fi
  probe "(()=>{const errs=[];const W=(t,a)=>{if(t!==a)errs.push(t+'!='+a);};const sec=document.querySelector('[aria-label=\"دیکتهٔ واژه‌های نشان‌شده\"]');if(!sec)return 'FAIL-$1:NO-LAUNCHER';const h2=sec.querySelector('h2');if(!h2||(h2.textContent||'').trim()!=='دیکتهٔ ستاره‌ها')errs.push('H2:'+(h2?h2.textContent:'none'));const p=sec.querySelector('p');const sub=(p?p.textContent:'').trim();if(sub!=='$3')errs.push('SUB:'+sub);const start=[...sec.querySelectorAll('button')].find(b=>(b.innerText||'').trim()==='شروع دیکته');if('$4'==='ABSENT'&&start)errs.push('START-PRESENT');if('$4'==='PRESENT'&&!start)errs.push('START-ABSENT');const door=[...sec.querySelectorAll('button')].find(b=>(b.innerText||'').trim()==='رفتن به دیکشنری');if('$5'==='ABSENT'&&door)errs.push('DOOR-PRESENT');if('$5'==='PRESENT'&&!door)errs.push('DOOR-ABSENT');const secOver=sec.scrollWidth>Math.ceil(sec.clientWidth)+1;const docOver=document.documentElement.scrollWidth>window.innerWidth+1;if(secOver)errs.push('SEC-OVERX');if(docOver)errs.push('DOC-OVERX');const pcs=p?getComputedStyle(p):null;const hcs=h2?getComputedStyle(h2):null;const dcs=door?getComputedStyle(door):null;const scs=start?getComputedStyle(start):null;if('$L'==='1'){return 'LEARN-$1:'+JSON.stringify({sub,subInk:pcs?pcs.color:'',subFs:pcs?pcs.fontSize:'',subFw:pcs?pcs.fontWeight:'',h2Ink:hcs?hcs.color:'',doorBg:dcs?dcs.backgroundColor:'',doorInk:dcs?dcs.color:'',doorBd:dcs?dcs.borderTopColor:'',startBg:scs?scs.backgroundColor:'',startInk:scs?scs.color:'',startBd:scs?scs.borderTopColor:'',startImg:scs?scs.backgroundImage:''});}if(pcs)W(pcs.color,'$SUB_INK');if(hcs)W(hcs.color,'$H2_INK');if(dcs){W(dcs.backgroundColor,'$DOOR_BG');W(dcs.color,'$DOOR_INK');W(dcs.borderTopColor,'$DOOR_BD');}if(scs){W(scs.backgroundColor,'$START_BG');W(scs.color,'$START_INK');W(scs.borderTopColor,'$START_BD');W(scs.backgroundImage,'$START_IMG');}return errs.length?('FAIL-$1:'+errs.join('|')):('$1-OK');})()"
}

# ---- داورِ تنظیماتِ جلسه ----
# $1 صحنه · $2 DARK|LIGHT
judge_setup(){
  local H3_INK CHIP_BG CHIP_INK L="${LEARN_MODE:-0}"
  if [ "$2" = DARK ]; then H3_INK="$DARK_SETUP_H3"; CHIP_BG="$DARK_CHIP10_BG"; CHIP_INK="$DARK_CHIP10_INK"; else H3_INK="$LIGHT_SETUP_H3"; CHIP_BG="$LIGHT_CHIP10_BG"; CHIP_INK="$LIGHT_CHIP10_INK"; fi
  probe "(()=>{const errs=[];const W=(t,a)=>{if(t!==a)errs.push(t+'!='+a);};const h3=[...document.querySelectorAll('h3')].find(h=>(h.textContent||'').trim()==='آزمون دیکته — املای شنیداری');if(!h3)return 'FAIL-$1:NO-SETUP';const chips=[...'۸۱۰۱۵۲۰'].length?[...'۸','۱۰','۱۵','۲۰'].map(n=>{const b=[...document.querySelectorAll('button')].find(x=>(x.innerText||'').trim()===n&&x.getBoundingClientRect().width>0);return b?n:'MISS-'+n;}).join(','):'';if(chips!=='۸,۱۰,۱۵,۲۰')errs.push('CHIPS:'+chips);const act=[...document.querySelectorAll('button')].find(x=>(x.innerText||'').trim()==='۱۰'&&x.getBoundingClientRect().width>0&&String(x.className).includes('bg-violet-600'));if(!act)errs.push('NO-ACTIVE-10');const smart=[...document.querySelectorAll('button')].find(x=>(x.innerText||'').includes('اولویت با واژه‌های یادنگرفته و سررسید'));if(!smart)errs.push('NO-SMART');const back=[...document.querySelectorAll('button')].find(x=>(x.innerText||'').trim()==='بازگشت'&&x.getBoundingClientRect().width>0);if(!back)errs.push('NO-BACK');const start=[...document.querySelectorAll('button')].find(x=>(x.innerText||'').trim()==='شروع دیکته'&&x.getBoundingClientRect().width>0);if(!start)errs.push('NO-START');const docOver=document.documentElement.scrollWidth>window.innerWidth+1;if(docOver)errs.push('DOC-OVERX');const hcs=getComputedStyle(h3);const acs=act?getComputedStyle(act):null;if('$L'==='1'){return 'LEARN-$1:'+JSON.stringify({chips,h3Ink:hcs.color,chipBg:acs?acs.backgroundColor:'',chipInk:acs?acs.color:''});}W(hcs.color,'$H3_INK');if(acs){W(acs.backgroundColor,'$CHIP_BG');W(acs.color,'$CHIP_INK');}return errs.length?('FAIL-$1:'+errs.join('|')):('$1-OK');})()"
}

# ---- داورِ ورودِ اجرا ----
# $1 صحنه · $2 DARK|LIGHT
judge_play(){
  local CHIP_BG CHIP_INK FA_INK L="${LEARN_MODE:-0}"
  if [ "$2" = DARK ]; then CHIP_BG="$DARK_PROG_BG"; CHIP_INK="$DARK_PROG_INK"; FA_INK="$DARK_FA_INK"; else CHIP_BG="$LIGHT_PROG_BG"; CHIP_INK="$LIGHT_PROG_INK"; FA_INK="$LIGHT_FA_INK"; fi
  probe "(()=>{const errs=[];const W=(t,a)=>{if(t!==a)errs.push(t+'!='+a);};const t=document.body.innerText||'';if(!t.includes('۱ از ۴'))errs.push('NO-1OF4');if(!t.includes('امتیاز: ۰'))errs.push('NO-SCORE0');const audio=document.querySelector('[aria-label=\"پخش دوبارهٔ کلمه\"]');if(!audio||audio.getBoundingClientRect().width===0)errs.push('NO-AUDIO');const inp=document.querySelector('input[placeholder=\"type the word...\"]');if(!inp)errs.push('NO-INPUT');const btns=[...'بررسی','راهنما','رد کردن'].map(n=>[...document.querySelectorAll('button')].some(x=>(x.innerText||'').includes(n)&&x.getBoundingClientRect().width>0));if(btns.some(v=>!v))errs.push('BTN-MISS');const fa=[...document.querySelectorAll('div')].find(d=>String(d.className).includes('text-2xl')&&String(d.className).includes('font-black')&&d.getBoundingClientRect().width>0);if(!fa)errs.push('NO-FA');const chip=[...document.querySelectorAll('span')].find(s=>(s.textContent||'').includes('از ۴')&&s.getBoundingClientRect().width>0);const fcs=fa?getComputedStyle(fa):null;const ccs=chip?getComputedStyle(chip):null;if('$L'==='1'){return 'LEARN-$1:'+JSON.stringify({fa:fa?(fa.textContent||'').trim():'',faInk:fcs?fcs.color:'',progBg:ccs?ccs.backgroundColor:'',progInk:ccs?ccs.color:''});}if(fcs)W(fcs.color,'$FA_INK');if(ccs){W(ccs.backgroundColor,'$CHIP_BG');W(ccs.color,'$CHIP_INK');}return errs.length?('FAIL-$1:'+errs.join('|')):('$1-OK');})()"
}

# ---- داورِ پردهٔ پایان ----
# $1 صحنه · $2 DARK|LIGHT
judge_done(){
  local H3_INK PCT_INK OK_BG OK_INK L="${LEARN_MODE:-0}"
  if [ "$2" = DARK ]; then H3_INK="$DARK_DONE_H3"; PCT_INK="$DARK_PCT_INK"; OK_BG="$DARK_OKCHIP_BG"; OK_INK="$DARK_OKCHIP_INK"; else H3_INK="$LIGHT_DONE_H3"; PCT_INK="$LIGHT_PCT_INK"; OK_BG="$LIGHT_OKCHIP_BG"; OK_INK="$LIGHT_OKCHIP_INK"; fi
  probe "(()=>{const errs=[];const W=(t,a)=>{if(t!==a)errs.push(t+'!='+a);};const t=document.body.innerText||'';if(!t.includes('دیکته تمام شد!'))errs.push('NO-TITLE');if(!t.includes('۱۰۰٪'))errs.push('NO-100PCT');if(!t.includes('امتیاز ۴ از ۴'))errs.push('NO-SCORE');if(!t.includes('کامل: ۴'))errs.push('NO-FULL4');if(!t.includes('با راهنما: ۰'))errs.push('NO-HALF0');if(!t.includes('غلط: ۰'))errs.push('NO-WRONG0');const nb=[...document.querySelectorAll('button')].find(b=>(b.innerText||'').trim()==='دیکتهٔ جدید');const bs=[...document.querySelectorAll('button')].find(b=>(b.innerText||'').trim()==='بازگشت به تنظیمات');const ex=[...document.querySelectorAll('button')].find(b=>(b.innerText||'').trim()==='بازگشت به واژه‌های من');if(!nb)errs.push('NO-NEW');if(!bs)errs.push('NO-BACKSET');if(!ex)errs.push('NO-EXIT');const pct=[...document.querySelectorAll('p')].find(p=>/٪$/.test((p.textContent||'').trim()));const h3=[...document.querySelectorAll('h3')].find(h=>(h.textContent||'').trim()==='دیکته تمام شد!');const okchip=[...document.querySelectorAll('span')].find(s=>(s.textContent||'').trim()==='کامل: ۴');const pcs=pct?getComputedStyle(pct):null;const hcs=h3?getComputedStyle(h3):null;const ocs=okchip?getComputedStyle(okchip):null;if('$L'==='1'){return 'LEARN-$1:'+JSON.stringify({pctInk:pcs?pcs.color:'',h3Ink:hcs?hcs.color:'',okBg:ocs?ocs.backgroundColor:'',okInk:ocs?ocs.color:''});}if(pcs)W(pcs.color,'$PCT_INK');if(hcs)W(hcs.color,'$H3_INK');if(ocs){W(ocs.backgroundColor,'$OK_BG');W(ocs.color,'$OK_INK');}return errs.length?('FAIL-$1:'+errs.join('|')):('$1-OK');})()"
}

answer_one(){
  agent-browser eval "(()=>{const fa=[...document.querySelectorAll('div')].find(d=>String(d.className).includes('text-2xl')&&String(d.className).includes('font-black')&&d.getBoundingClientRect().width>0);if(!fa)return 'NO-FA';const f=(fa.textContent||'').trim();const MAP=[['توانایی','ability'],['قطعاً','absolutely'],['دسترسی','access'],['از عرض','across']];const hit=MAP.find(m=>f.includes(m[0]));if(!hit)return 'UNMAPPED:'+f;const inp=document.querySelector('input[placeholder=\"type the word...\"]');if(!inp)return 'NO-INPUT';const set=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;set.call(inp,hit[1]);inp.dispatchEvent(new Event('input',{bubbles:true}));const b=[...document.querySelectorAll('button')].find(x=>(x.innerText||'').includes('بررسی')&&x.getBoundingClientRect().width>0&&!x.disabled);if(!b)return 'NO-CHECK';b.click();return 'ANSWERED:'+hit[1]+'<-'+f;})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"
}

ledger(){ node -e "const {PrismaClient}=require('@prisma/client');const db=new PrismaClient();const d=new Date();const key=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');const one=(n)=>db.eventDay.findFirst({where:{name:n,day:key}}).then((r)=>[n,r?r.count:0]);Promise.all([one('my_words_dictation_start'),one('quiz_done'),one('dictation_done')]).then((rows)=>{rows.forEach(([n,c])=>console.log(n.toUpperCase()+'('+key+'):'+c));return db.quizAttempt.count();}).then((a)=>{console.log('ATTEMPTS-NOW:'+a);return db.quizAttempt.findFirst({where:{lesson:0,category:'my-words-dictation'},orderBy:{id:'desc'}});}).then((r)=>{console.log('MYWORDS-DICT-ATTEMPT:'+(r?JSON.stringify({lesson:r.lesson,category:r.category,total:r.total,correct:r.correct,percent:r.percent}):'none'));return db.eventDay.findFirst({where:{name:'drill_due_jump'}});}).then((r)=>{console.log('LEDGER:',JSON.stringify(r?{name:r.name,count:r.count,day:r.day}:null));return db.\$disconnect();}).catch((e)=>{console.log('LEDGER-ERR:'+e.message);process.exit(0);})" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

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

echo "########## A) صفرِ ستاره — پچ + reloadِ واقعی (درسِ r444)" | tee -a "$OUT"
boot
probe "(()=>{const KEY='vision2-study-v1';const raw=JSON.parse(localStorage.getItem(KEY)||'{\"state\":{}}');raw.state.starredWords=[];localStorage.setItem(KEY,JSON.stringify(raw));location.reload();return 'ZERO-STARS-SEEDED';})()" | tee -a "$OUT"
sleep 4
qa_wait_home || { agent-browser close >/dev/null 2>&1; exit 1; }
dismiss_install
click_card "واژه‌های من"; sleep 2.5
probe "(()=>{const sec=document.querySelector('[aria-label=\"دیکتهٔ واژه‌های نشان‌شده\"]');if(!sec)return 'NO-LAUNCHER';const sub=(sec.querySelector('p')||{textContent:''}).textContent.trim();return 'DICT-SUB:'+(sub==='برای شروع دیکته حداقل ۴ واژه نشان کن — الان ۰ داری'?'EMPTY-OK':sub);})()" | tee -a "$OUT"

echo "########## B) حکمِ صحنهٔ A در شب + سریالهایِ آموختهشده" | tee -a "$OUT"
qa_to_dark
probe "(()=>{return document.documentElement.classList.contains('dark')?'DARK-ON':'DARK-OFF';})()"
LEARN_MODE="${LEARN_MODE:-0}" judge_launcher SCENE-A-ZERO-STARS DARK "برای شروع دیکته حداقل ۴ واژه نشان کن — الان ۰ داری" ABSENT PRESENT
qa_wait_toasts_clear
qa_shot r445-mobile-dictation-empty-dark.png

echo "########## C) روشن — همان حکم + پایهٔ lab" | tee -a "$OUT"
qa_to_light
sleep 1
LEARN_MODE="${LEARN_MODE:-0}" judge_launcher SCENE-A-ZERO-STARS-LIGHT LIGHT "برای شروع دیکته حداقل ۴ واژه نشان کن — الان ۰ داری" ABSENT PRESENT
qa_wait_toasts_clear
qa_shot r445-mobile-dictation-empty-light.png
echo "########## C2) برگشت به شب برایِ راندهایِ بعدی (درسِ رانِ اول)" | tee -a "$OUT"
qa_to_dark
sleep 1

echo "########## D) قراردادِ درِ زنده — کلیکِ «رفتن به دیکشنری» در خودِ سکشنِ دیکته" | tee -a "$OUT"
probe "(()=>{const sec=document.querySelector('[aria-label=\"دیکتهٔ واژه‌های نشان‌شده\"]');if(!sec)return 'NO-LAUNCHER';const door=[...sec.querySelectorAll('button')].find(b=>(b.innerText||'').trim()==='رفتن به دیکشنری');if(!door)return 'NO-DOOR';door.click();return 'DOOR-CLICKED';})()" | tee -a "$OUT"
sleep 2
probe "(()=>{const inp=document.querySelector('input[placeholder=\"مثلاً: language یا زبان...\"]');return inp?'DOOR-ARRIVED:dictionary-real':'DOOR-MISS';})()" | tee -a "$OUT"

echo "########## E) صحنهٔ B — چهار ستارهٔ واقعیِ درسِ ۱ → لانچرِ آماده" | tee -a "$OUT"
probe "(()=>{const KEY='vision2-study-v1';const raw=JSON.parse(localStorage.getItem(KEY)||'{\"state\":{}}');raw.state.starredWords=['1:ability','1:absolutely','1:access','1:across'];localStorage.setItem(KEY,JSON.stringify(raw));location.reload();return 'FOUR-STARS-SEEDED';})()" | tee -a "$OUT"
sleep 4
qa_wait_home || { agent-browser close >/dev/null 2>&1; exit 1; }
dismiss_install
click_card "واژه‌های من"; sleep 2.5
probe "(()=>{const sec=document.querySelector('[aria-label=\"دیکتهٔ واژه‌های نشان‌شده\"]');if(!sec)return 'NO-LAUNCHER';const sub=(sec.querySelector('p')||{textContent:''}).textContent.trim();const start=[...sec.querySelectorAll('button')].find(b=>(b.innerText||'').trim()==='شروع دیکته');const door=[...sec.querySelectorAll('button')].find(b=>(b.innerText||'').trim()==='رفتن به دیکشنری');return 'READY:'+(sub==='املای شنیداری از همین لیست — می‌شنوی، معنی را می‌بینی، می‌نویسی؛ مربعِ فیلترها هم اثر می‌کند'?'SUB-READY-OK':sub)+'|start='+(start?'PRESENT':'ABSENT')+'|door='+(door?'PRESENT':'ABSENT');})()" | tee -a "$OUT"

echo "########## F) حکمِ لانچرِ آماده در شب + روشن" | tee -a "$OUT"
qa_to_dark
sleep 1
LEARN_MODE="${LEARN_MODE:-0}" judge_launcher SCENE-B-READY DARK "املای شنیداری از همین لیست — می‌شنوی، معنی را می‌بینی، می‌نویسی؛ مربعِ فیلترها هم اثر می‌کند" PRESENT ABSENT
qa_wait_toasts_clear
qa_shot r445-mobile-dictation-ready-dark.png
qa_to_light
sleep 1
LEARN_MODE="${LEARN_MODE:-0}" judge_launcher SCENE-B-READY-LIGHT LIGHT "املای شنیداری از همین لیست — می‌شنوی، معنی را می‌بینی، می‌نویسی؛ مربعِ فیلترها هم اثر می‌کند" PRESENT ABSENT
qa_wait_toasts_clear
qa_shot r445-mobile-dictation-ready-light.png

echo "########## G) ورود به تنظیماتِ جلسه — داور در شب و روشن (درسِ رانِ اول: qa_to_dark را جا نینداز)" | tee -a "$OUT"
qa_to_dark
sleep 1
click_by_label "شروع دیکته"; sleep 2
LEARN_MODE="${LEARN_MODE:-0}" judge_setup SETUP-DARK DARK
qa_to_light
sleep 1
LEARN_MODE="${LEARN_MODE:-0}" judge_setup SETUP-LIGHT LIGHT
qa_to_dark
sleep 1

echo "########## H) راندِ واقعی — شروعِ موتور + ورودِ اجرا در شب" | tee -a "$OUT"
click_by_label "شروع دیکته"; sleep 2
LEARN_MODE="${LEARN_MODE:-0}" judge_play PLAY-ENTRY DARK
echo "---- چهار واژهٔ واقعی: نقشهٔ fa→en از بانکِ درسِ ۱ ----" | tee -a "$OUT"
for i in 1 2 3 4; do
  answer_one
  sleep 2.6
done
probe "(()=>{const t=document.body.innerText||'';return t.includes('دیکته تمام شد!')?'ROUND-DONE-OK':'NOT-DONE:'+t.slice(0,80);})()" | tee -a "$OUT"

echo "########## I) پردهٔ پایان در شب + شات" | tee -a "$OUT"
qa_wait_toasts_clear
LEARN_MODE="${LEARN_MODE:-0}" judge_done DONE-DARK DARK
qa_shot r445-mobile-dictation-done-dark.png
qa_to_light
sleep 1
LEARN_MODE="${LEARN_MODE:-0}" judge_done DONE-LIGHT LIGHT
qa_wait_toasts_clear
qa_shot r445-mobile-dictation-done-light.png

echo "########## J) قراردادِ خروجِ exitLabel → لانچرِ سالم" | tee -a "$OUT"
click_by_label "بازگشت به واژه‌های من"; sleep 1.5
probe "(()=>{const sec=document.querySelector('[aria-label=\"دیکتهٔ واژه‌های نشان‌شده\"]');if(!sec)return 'NO-LAUNCHER';const sub=(sec.querySelector('p')||{textContent:''}).textContent.trim();const start=[...sec.querySelectorAll('button')].find(b=>(b.innerText||'').trim()==='شروع دیکته');return 'EXIT-LAUNCHER-OK:'+(start?'START-BACK':'START-MISS')+'|sub='+(sub.includes('املای شنیداری از همین لیست')?'READY-STILL':'CHANGED');})()" | tee -a "$OUT"

echo "########## K) دفترِ صادق — SRSِ واقعی + DB ledger" | tee -a "$OUT"
probe "(()=>{const raw=JSON.parse(localStorage.getItem('vision2-study-v1')||'{}');const st=raw.state||{};const srs=st.srs||{};const keys=['1:ability','1:absolutely','1:access','1:across'];const hit=keys.filter(k=>!!srs[k]);return 'STORE-SRS:'+JSON.stringify({srsHits:hit.length,of:keys.length,stars:JSON.stringify(st.starredWords||[])});})()" | tee -a "$OUT"
ledger

agent-browser close >/dev/null 2>&1 || true
echo "########## WITNESS-DONE" | tee -a "$OUT"
