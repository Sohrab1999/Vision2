#!/usr/bin/env bash
# ------------------------------------------------------------------
# r444 — «شاهدِ موبایلِ خانوادهٔ تهیِ فلش‌کارت‌ها + حکمِ دستنیافتنیِ گاردِ دفاعی»
# چهلونهمین مصرفکنندهٔ qa-lib.sh. بندِ ①ِ r443.
# صادقگیریِ ابتدای راند: «کارتی برای مرور نیست» (گاردِ خطچینِ موتور) از
#   هیچ مسیرِ واقعیِ کاربر دستنیافتنی است — لانچرِ «واژههای من» شروعِ دِکِ
#   تهی را میبندد (دکمهٔ شروع فقط با deck.length>0)، sessionِ «واژههای من»
#   منجمد است و واژههایِ خطر هم wordsِ زندهٔ غیرتهی میفرستند — پس گاردِ
#   خطچینِ موتور فقط نگهبانِ ضدکرش است. اعضایِ واقعیِ خانوادهٔ تهی، دو
#   حالتِ تهیِ لانچر + آستانهٔ مرورند — و همینها در ۳۹۰px داوری میشوند.
# صحنهٔ A (ستارهٔ صفر — با reloadِ واقعی): زیرعنوانِ «برای فلش‌کارت حداقل
#   یک واژه نشان کن» + درِ «رفتن به دیکشنری» + نبودِ شروع و نبودِ گروهِ
#   دامنه؛ آستانهٔ مرورِ «حداقل ۴ واژه — الان ۰ داری»؛ قراردادِ درِ زنده:
#   کلیک → دیکشنری واقعی (placeholderِ یگانهٔ جستجو).
# صحنهٔ B (مسیرِ واقعیِ کاربر — بلدشدن از خودِ موتور): یک ستاره → شروعِ
#   فلش‌کارتِ تک‌کارتی → مرورِ هوشمند → «بلدم» (پردهٔ پایانِ منحطِ ۱کارتی —
#   flashcard_done دقیقاً یکبار، قراردادِ r443) → تحویلِ دستی («۱ بلدم»
#   انباشته) → خروج → لانچر → دامنهٔ «بلدم‌نشده» → زیرعنوانِ «عجب!» + شروعِ
#   غایب + درِ حاضر؛ رفتوبرگشتِ دامنه («همه» → شروع برمیگردد).
# داوریها در شبِ واقعی و روشن: متنِ دقیق + سریالهایِ آموختهشده (زیرعنوان/
#   در/چیپِ فعال) + سرریزِ صفرِ سکشن/سند + چهار شات.
# درسِ رانِ اول (ابزاری): پچِ localStorage بیِ reload اثری بر استورِ زنده
#   ندارد (آموزشِ خودِ DOM)؛ و مقصدِ known از مسیرِ UIِ واقعی امن است نه از
#   مسیرِ بذرِ مستقیم — بذرِ مستقیمِ known در چشمِ sanitize دیده نشد.
# دفترِ صادق: flashcard_done دقیقاً +۱ (پاسِ تک‌کارتیِ صحنهٔ B — ۲→۳)؛
#   attempts=۰؛ ۱۳۱ drill_due_jump دستنخورده.
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
OUT=/tmp/r444-empty-family-witness.txt
QA_SEED_FILE=/tmp/r444-witness-seed-eval.js
: > "$OUT"

source /home/z/my-project/scripts/qa-lib.sh

probe(){ agent-browser eval "$1" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

click_by_label(){ agent-browser eval "(()=>{let b=document.querySelector('[aria-label=\"$1\"]');if(!b||b.getBoundingClientRect().width===0){b=[...document.querySelectorAll('button')].find((x)=>(x.innerText||'').replace(/\s+/g,' ').trim()==='$1'&&x.getBoundingClientRect().width>0);}if(!b)return 'NO-BTN:$1';b.click();return 'CLICKED:$1';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

click_card(){ agent-browser eval "(()=>{const b=[...document.querySelectorAll('button')].find((x)=>(x.innerText||'').includes('$1')&&x.getBoundingClientRect().width>0);if(!b)return 'NO-BTN:$1';b.click();return 'CLICKED:$1';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

dismiss_install(){ probe "(()=>{const b=document.querySelector('[aria-label=\"بستن پیشنهاد نصب\"]');if(b&&b.getBoundingClientRect().width>0){b.click();return 'INSTALL-CARD-DISMISSED';}return 'NO-INSTALL-CARD';})()"; sleep 1; }

# ---- سریالهایِ آموختهشده در رانِ LEARN (قفلشده — ایدئومِ r427/r433/r436/r443) ----
# شب: زیرعنوانِ سنگیِ rgb(156,149,140)؛ درِ بنفش با مرکِ rgb(196,181,253)
#   (عینِ تحویلِ r443 و نمرهٔ r441/r442) و حاشیهٔ rgba(130,100,190,0.55) —
#   مکانیزمِ rgbaیِ واقعی برایِ borderِ بنفشِ شب؛ چیپِ فعالِ violet-100 با
#   lab(93.0838…) که در هر دو حالت یکسان است (بازنگاشتِ شب نمیگیرد).
# روز: درِ سفید با مرکِ lab(35.2783 67.9912 -88.793) — عینِ بنفشِ r437/r438/r443
#   بیتْمَند؛ حاشیهٔ lab(76.7419…) = violet-300.
DARK_SUB_INK="rgb(156, 149, 140)"; DARK_DOOR_BG="rgb(28, 25, 23)"; DARK_DOOR_INK="rgb(196, 181, 253)"; DARK_DOOR_BD="rgba(130, 100, 190, 0.55)"; DARK_CHIP_BG="lab(93.0838 4.35197 -9.88284)"; DARK_CHIP_INK="rgb(196, 181, 253)"
LIGHT_SUB_INK="lab(44.2882 2.36151 4.27174)"; LIGHT_DOOR_BG="rgb(255, 255, 255)"; LIGHT_DOOR_INK="lab(35.2783 67.9912 -88.793)"; LIGHT_DOOR_BD="lab(76.7419 18.3911 -37.0706)"; LIGHT_CHIP_BG="lab(93.0838 4.35197 -9.88284)"; LIGHT_CHIP_INK="lab(35.2783 67.9912 -88.793)"

# ---- داورِ خانوادهٔ تهی (یکخطی — استخراجِ پیشْپرواز با check-r444-judges.sh) ----
# $1 صحنه · $2 DARK|LIGHT · $3 زیرعنوانِ دقیق · $4 START PRESENT|ABSENT · $5 SCOPE PRESENT|ABSENT
judge(){ # $1 صحنه، $2 DARK|LIGHT، $3 زیرعنوان، $4 START، $5 SCOPE
  local SUB_INK DOOR_BG DOOR_INK DOOR_BD CHIP_BG CHIP_INK L="${LEARN_MODE:-0}"
  if [ "$2" = DARK ]; then SUB_INK="$DARK_SUB_INK"; DOOR_BG="$DARK_DOOR_BG"; DOOR_INK="$DARK_DOOR_INK"; DOOR_BD="$DARK_DOOR_BD"; CHIP_BG="$DARK_CHIP_BG"; CHIP_INK="$DARK_CHIP_INK"; else SUB_INK="$LIGHT_SUB_INK"; DOOR_BG="$LIGHT_DOOR_BG"; DOOR_INK="$LIGHT_DOOR_INK"; DOOR_BD="$LIGHT_DOOR_BD"; CHIP_BG="$LIGHT_CHIP_BG"; CHIP_INK="$LIGHT_CHIP_INK"; fi
  probe "(()=>{const errs=[];const W=(t,a)=>{if(t!==a)errs.push(t+'!='+a);};const sec=document.querySelector('[aria-label=\"فلش‌کارت واژه‌های من\"]');if(!sec)return 'FAIL-$1:NO-LAUNCHER';const p=sec.querySelector('p');const sub=(p?p.textContent:'').trim();if(sub!=='$3')errs.push('SUB:'+sub);const start=[...sec.querySelectorAll('button')].find(b=>(b.innerText||'').includes('شروع فلش‌کارت'));if('$4'==='ABSENT'&&start)errs.push('START-PRESENT');if('$4'==='PRESENT'&&!start)errs.push('START-ABSENT');const door=[...sec.querySelectorAll('button')].find(b=>(b.innerText||'').trim()==='رفتن به دیکشنری');if('$4'==='ABSENT'&&!door)errs.push('NO-DOOR');if('$4'==='PRESENT'&&door)errs.push('DOOR-PRESENT');const grp=sec.querySelector('[role=\"group\"]');if('$5'==='ABSENT'&&grp)errs.push('SCOPE-PRESENT');if('$5'==='PRESENT'&&!grp)errs.push('SCOPE-ABSENT');const secOver=sec.scrollWidth>Math.ceil(sec.clientWidth)+1;const docOver=document.documentElement.scrollWidth>window.innerWidth+1;if(secOver)errs.push('SEC-OVERX');if(docOver)errs.push('DOC-OVERX');const cs=p?getComputedStyle(p):null;const dcs=door?getComputedStyle(door):null;let act=null;if(grp){act=[...grp.querySelectorAll('button')].find(b=>String(b.className).includes('border-violet-400'))||null;}const acs=act?getComputedStyle(act):null;if('$L'==='1'){return 'LEARN-$1:'+JSON.stringify({sub,subInk:cs?cs.color:'',subFs:cs?cs.fontSize:'',subFw:cs?cs.fontWeight:'',doorBg:dcs?dcs.backgroundColor:'',doorInk:dcs?dcs.color:'',doorBd:dcs?dcs.borderTopColor:'',chipBg:acs?acs.backgroundColor:'',chipInk:acs?acs.color:''});}if(cs)W(cs.color,'$SUB_INK');if(dcs){W(dcs.backgroundColor,'$DOOR_BG');W(dcs.color,'$DOOR_INK');W(dcs.borderTopColor,'$DOOR_BD');}if(acs){W(acs.backgroundColor,'$CHIP_BG');W(acs.color,'$CHIP_INK');}return errs.length?('FAIL-$1:'+errs.join('|')):('$1-OK');})()"
}

ledger(){ node -e "const {PrismaClient}=require('@prisma/client');const db=new PrismaClient();const d=new Date();const key=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');db.eventDay.findFirst({where:{name:'flashcard_done',day:key}}).then((r)=>{console.log('FLASHCARD-DONE('+key+'):'+(r?r.count:0));return db.quizAttempt.count();}).then((a)=>{console.log('ATTEMPTS-NOW:'+a);return db.eventDay.findFirst({where:{name:'drill_due_jump'}});}).then((r)=>{console.log('LEDGER:',JSON.stringify(r?{name:r.name,count:r.count,day:r.day}:null));return db.\$disconnect();}).catch((e)=>{console.log('LEDGER-ERR:'+e.message);process.exit(0);})" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

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

echo "########## A) صفرِ ستاره — پچ + reloadِ واقعی (درسِ رانِ اول)" | tee -a "$OUT"
boot
probe "(()=>{const KEY='vision2-study-v1';const raw=JSON.parse(localStorage.getItem(KEY)||'{\"state\":{}}');raw.state.starredWords=[];localStorage.setItem(KEY,JSON.stringify(raw));location.reload();return 'ZERO-STARS-SEEDED';})()" | tee -a "$OUT"
sleep 4
qa_wait_home || { agent-browser close >/dev/null 2>&1; exit 1; }
dismiss_install
click_card "واژه‌های من"; sleep 2.5
probe "(()=>{const sec=document.querySelector('[aria-label=\"فلش‌کارت واژه‌های من\"]');if(!sec)return 'NO-LAUNCHER';const sub=(sec.querySelector('p')||{textContent:''}).textContent.trim();const rv=document.querySelector('[aria-label=\"مرور واژه‌های نشان‌شده\"]');const rvp=rv?(rv.querySelector('p')||{textContent:''}).textContent.trim():'';const expRv='برای شروع مرور حداقل ۴ واژه نشان کن — الان ۰ داری';return 'FLASH-SUB:'+(sub==='برای فلش‌کارت حداقل یک واژه نشان کن'?'EMPTY-OK':sub)+' | REVIEW-SUB:'+(rvp===expRv?'THRESHOLD-0-OK':rvp);})()" | tee -a "$OUT"

echo "########## B) حکمِ صحنهٔ A در شب + سریالهایِ آموختهشده" | tee -a "$OUT"
qa_to_dark
probe "(()=>{return document.documentElement.classList.contains('dark')?'DARK-ON':'DARK-OFF';})()"
LEARN_MODE="${LEARN_MODE:-0}" judge SCENE-A-ZERO-STARS DARK "برای فلش‌کارت حداقل یک واژه نشان کن" ABSENT ABSENT
qa_wait_toasts_clear
qa_shot r444-mobile-launcher-empty-dark.png

echo "########## C) روشن — همان حکم + پایهٔ lab" | tee -a "$OUT"
qa_to_light
sleep 1
LEARN_MODE="${LEARN_MODE:-0}" judge SCENE-A-ZERO-STARS-LIGHT LIGHT "برای فلش‌کارت حداقل یک واژه نشان کن" ABSENT ABSENT
qa_wait_toasts_clear
qa_shot r444-mobile-launcher-empty-light.png

echo "########## D) قراردادِ درِ زنده — کلیکِ «رفتن به دیکشنری» در خودِ سکشنِ فلش‌کارت" | tee -a "$OUT"
probe "(()=>{const sec=document.querySelector('[aria-label=\"فلش‌کارت واژه‌های من\"]');if(!sec)return 'NO-LAUNCHER';const door=[...sec.querySelectorAll('button')].find(b=>(b.innerText||'').trim()==='رفتن به دیکشنری');if(!door)return 'NO-DOOR';door.click();return 'DOOR-CLICKED';})()" | tee -a "$OUT"
sleep 2
probe "(()=>{const inp=document.querySelector('input[placeholder=\"مثلاً: language یا زبان...\"]');return inp?'DOOR-ARRIVED:dictionary-real':'DOOR-MISS';})()" | tee -a "$OUT"

echo "########## E) صحنهٔ B — یک ستاره؛ بلدشدن از خودِ موتور (مسیرِ واقعیِ کاربر)" | tee -a "$OUT"
probe "(()=>{const KEY='vision2-study-v1';const raw=JSON.parse(localStorage.getItem(KEY)||'{\"state\":{}}');raw.state.starredWords=['1:ability'];localStorage.setItem(KEY,JSON.stringify(raw));location.reload();return 'ONE-STAR-SEEDED';})()" | tee -a "$OUT"
sleep 4
qa_wait_home || { agent-browser close >/dev/null 2>&1; exit 1; }
dismiss_install
click_card "واژه‌های من"; sleep 2.5
probe "(()=>{const sec=document.querySelector('[aria-label=\"فلش‌کارت واژه‌های من\"]');if(!sec)return 'NO-LAUNCHER';const t=(sec.querySelector('p')||{textContent:''}).textContent.trim();const start=[...sec.querySelectorAll('button')].find(b=>(b.innerText||'').includes('شروع فلش‌کارت'));const grp=!!sec.querySelector('[role=\"group\"]');return 'ALL-SCOPE:'+(t==='مرور سریع بدون نمره — هر درسی که بلد نیستی می‌ماند تا وقتی بلد شوی'?'SUB-ALL-OK':t)+'|start='+(start?'PRESENT':'ABSENT')+'|scope='+(grp?'PRESENT':'ABSENT');})()" | tee -a "$OUT"
echo "---- موتورِ تک‌کارتی: شروع → هوشمند → بلدم → پردهٔ پایانِ منحطِ ۱کارتی ----" | tee -a "$OUT"
click_card "شروع فلش‌کارت"; sleep 1.5
probe "(()=>{const t=document.body.innerText||'';return t.includes('کارت ۱ از ۱')?'ONE-CARD-OK':'ONE-CARD:'+t.slice(0,60);})()" | tee -a "$OUT"
click_by_label "مرور هوشمند"; sleep 1
probe "(()=>{const t=document.body.innerText||'';return t.includes('۱ کارتِ باقی‌مانده')?'SMART-1-OK':'SMART-1-MISS';})()" | tee -a "$OUT"
A=$(agent-browser eval "(()=>{const b=[...document.querySelectorAll('button')].find(x=>(x.innerText||'').trim()==='بلدم');if(!b)return 'NO-BTN';b.click();return 'KNOWN';})()" 2>&1)
case "$A" in *KNOWN*) echo "ANSWER-1-OK" | tee -a "$OUT"; echo | tee -a "$OUT";; *) echo "ANSWER-FAIL:$A" | tee -a "$OUT"; agent-browser close >/dev/null 2>&1; exit 1;; esac
sleep 1
probe "(()=>{const t=document.body.innerText||'';const panel=t.includes('پاسِ مرورِ هوشمند تمام شد — همهٔ کارت‌هایِ سررسید مرور شدند');const noFlip=!document.querySelector('[aria-label=\"برگرداندن کارت\"]');return (panel&&noFlip)?'PASSDONE-1CARD-OK (گاردِ ۲۷۴ در لبهٔ منحط — بدونِ نمره و لیست، عینِ r443)':'PASSDONE:'+JSON.stringify({panel,noFlip});})()" | tee -a "$OUT"
click_by_label "ادامهٔ مرورِ دستی — همهٔ کارت‌ها"; sleep 1.2
probe "(()=>{const t=document.body.innerText||'';const manual=t.includes('کارت ۱ از ۱');const chip=t.includes('۱ بلدم');return (manual&&chip)?'HANDOFF-1-OK:manual+۱بلدم':'HANDOFF-1:'+JSON.stringify({manual,chip});})()" | tee -a "$OUT"
click_by_label "خروج"; sleep 1.2
probe "(()=>{const sec=document.querySelector('[aria-label=\"فلش‌کارت واژه‌های من\"]');return sec?'BACK-TO-LAUNCHER-OK':'NO-LAUNCHER';})()" | tee -a "$OUT"

echo "########## F) دامنهٔ بلدم‌نشده → «عجب!» + آستانهٔ مرورِ ۱تایی" | tee -a "$OUT"
click_by_label "بلدم‌نشده"; sleep 1
probe "(()=>{const rv=document.querySelector('[aria-label=\"مرور واژه‌های نشان‌شده\"]');const rvp=rv?(rv.querySelector('p')||{textContent:''}).textContent.trim():'';const expRv='برای شروع مرور حداقل ۴ واژه نشان کن — الان ۱ داری';return 'REVIEW-SUB:'+(rvp===expRv?'THRESHOLD-1-OK':rvp);})()" | tee -a "$OUT"

echo "########## G) حکمِ صحنهٔ B در شب + رفتوبرگشتِ دامنه" | tee -a "$OUT"
qa_to_dark
sleep 1
LEARN_MODE="${LEARN_MODE:-0}" judge SCENE-B-UNMASTERED-DONE DARK "همهٔ واژه‌های نشان‌شده را بلدی — عجب! به حالت «همه» برگرد یا واژهٔ تازه نشان کن" ABSENT PRESENT
click_by_label "همه"; sleep 1
probe "(()=>{const sec=document.querySelector('[aria-label=\"فلش‌کارت واژه‌های من\"]');if(!sec)return 'NO-LAUNCHER';const start=[...sec.querySelectorAll('button')].find(b=>(b.innerText||'').includes('شروع فلش‌کارت'));const door=[...sec.querySelectorAll('button')].find(b=>(b.innerText||'').trim()==='رفتن به دیکشنری');return 'SCOPE-ROUNDTRIP:'+(start&&!door?'START-BACK-OK':'MISMATCH');})()" | tee -a "$OUT"
click_by_label "بلدم‌نشده"; sleep 1
LEARN_MODE="${LEARN_MODE:-0}" judge SCENE-B-UNMASTERED-DONE-AGAIN DARK "همهٔ واژه‌های نشان‌شده را بلدی — عجب! به حالت «همه» برگرد یا واژهٔ تازه نشان کن" ABSENT PRESENT
qa_wait_toasts_clear
qa_shot r444-mobile-unmastered-done-dark.png

echo "########## H) روشن — همان قفلها + پایهٔ lab" | tee -a "$OUT"
qa_to_light
sleep 1
LEARN_MODE="${LEARN_MODE:-0}" judge SCENE-B-UNMASTERED-DONE-LIGHT LIGHT "همهٔ واژه‌های نشان‌شده را بلدی — عجب! به حالت «همه» برگرد یا واژهٔ تازه نشان کن" ABSENT PRESENT
qa_wait_toasts_clear
qa_shot r444-mobile-unmastered-done-light.png

echo "########## I) دفترِ صادق — flashcard_done باید ۳ باشد (+۱ از پاسِ تک‌کارتی) + استورِ بلدمِ واقعی" | tee -a "$OUT"
probe "(()=>{const raw=JSON.parse(localStorage.getItem('vision2-study-v1')||'{}');const st=raw.state||{};return 'STORE:stars='+JSON.stringify(st.starredWords||[])+',knownAbility='+(st.known&&st.known['1:ability']?'yes':'no')+' (مسیرِ UIِ واقعی)';})()" | tee -a "$OUT"
ledger

agent-browser close >/dev/null 2>&1 || true
echo "########## WITNESS-DONE" | tee -a "$OUT"
