#!/usr/bin/env bash
# ------------------------------------------------------------------
# r441 — «شاهدِ موبایلِ نتیجهٔ تمرین: پردهٔ سوم — نمرهٔ ۲۶px و بازخوانی در بندِ ۳۹۰px»
# چهلوششمین مصرفکنندهٔ qa-lib.sh.
# داوریِ ارزش: بندِ ①ِ r440 — حلقهٔ آخرِ همان صفحه (معرفی/اجرا/نتیجه).
#   r439 میزبان را در موبایل دید، r440 معرفی را؛ پردهٔ سوم (نتیجهٔ جلسهٔ
#   کامل) هرگز زیرِ ۱۲۸۰px دیده نشده — نمرهٔ ۲۶px، بازخوانیِ سؤالبهسؤال
#   و ردیفِ دکمهها میتوانستند سرریز کنند. این شاهد جلسهٔ واقعیِ کامل را
#   بازی میکند (۱۰ پرسش — DRILL_SIZE) و نتیجه را در شبِ واقعی و روشن
#   داوری میکند.
# صحنه: میزبانِ افعال → معرفی → شروعِ جلسهٔ واقعی → پاسخِ گزینهٔ ۱ به همهٔ
#   ۱۰ پرسش (بر خوردِ random → نتیجهٔ مخلوطِ درست/غلط — حکمِ خودسازگار:
#   هرچه DOM میگوید باید درونِ خودش سازگار باشد؛ ایدئومِ LEARN-then-LOCK
#   r440) → پردهٔ نتیجه در شب و روشن:
#   ① سرصفحهٔ صادق r401: «نتیجهٔ تمرین» (نه «نتیجهٔ مرور» — isReplay=false)
#   ② نمرهٔ ۲۶px/وزنِ ۹۰۰ + ariaِ «نمرهٔ …٪» همسازگار با متن + «X درست از Y»
#   ③ بازخوانی: شمارشِ li زمردی == درست، li رز == غلط، مجموع == ۱۰؛
#     درصد == round(درست/۱۰×۱۰۰)؛ «پاسخِ تو:» بهازای هر غلط
#   ④ دکمهها: مرورِ اشتباهها (N) فقط با غلط (r401) + ariaِ دقیقِ r401،
#     تمرینِ دوباره، خروجِ «بازگشت به جدول افعال از نتیجه»
#   ⑤ چیدمانِ موبایل: سرریزِ صفرِ سند/سکشن/li + wrapِ ردیفِ دکمهها
#   ⑥ کرنلِ نو (خانوادهٔ شاهدِ تاریک — پردهٔ نتیجه نخستینبار): نمره و
#     liهایِ زمردی/رز در شب و روز سریال میگیرند (آموختنِ زنده، ثبت در worklog)
# درسهایِ ابزاری: r414 (qa_wait_home پسِ هر reload) · r439/r440 (گاردِ
#   موبایل در کتابخانه — qa_seed_guard_mobile) · r419 (یابنده درونِ
#   sectionِ خودش میماند)
# دفترِ صادق: این شاهد یک جلسهٔ واقعی کامل میکند (POST آمار + بانکِ خطایِ
#   شخصیتِ QA) — attempts در پاکسازیِ پایانِ راند صفر میشود؛ پرشِ سررسید
#   ندارد (جلسهٔ عادی، نه «تمرینِ سررسیدها») → drill_due_jump دستنخورده.
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
OUT=/tmp/r441-mobile-result-witness.txt
QA_SEED_FILE=/tmp/r441-witness-seed-eval.js
: > "$OUT"

source /home/z/my-project/scripts/qa-lib.sh

probe(){ agent-browser eval "$1" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

click_by_label(){ agent-browser eval "(()=>{let b=document.querySelector('[aria-label=\"$1\"]');if(!b||b.getBoundingClientRect().width===0){b=[...document.querySelectorAll('button')].find((x)=>(x.innerText||'').replace(/\s+/g,' ').trim()==='$1'&&x.getBoundingClientRect().width>0);}if(!b)return 'NO-BTN:$1';b.click();return 'CLICKED:$1';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

click_card(){ agent-browser eval "(()=>{const b=[...document.querySelectorAll('button')].find((x)=>(x.innerText||'').includes('$1')&&x.getBoundingClientRect().width>0);if(!b)return 'NO-BTN:$1';b.click();return 'CLICKED:$1';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

# یابندهٔ پردهٔ نتیجه: sectionِ حاویِ ulِ بازخوانی (ariaِ یکتا در سند) —
# یابنده همیشه درونِ خودِ نتیجه میماند (درسِ r419).
result_sec(){ agent-browser eval "(()=>{const sec=[...document.querySelectorAll('section')].find(s=>s.querySelector('[aria-label=\"بازخوانی سؤال‌های تمرین\"]'));return sec?'RESULT-SEC-OK':'NO-RESULT-SEC';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

# ---- بازیِ جلسه: ۱۰ پرسش × (گزینهٔ ۱ + بعدی/نتیجه) ----
play_session(){
  probe "(()=>{const p=document.querySelector('[aria-live=\"polite\"]');return (p&&p.textContent.includes('۱۰'))?'RUN-SIZE-OK':'RUN-SIZE:'+(p?p.textContent:'NO-LIVE');})()"
  for i in $(seq 1 10); do
    R=$(agent-browser eval "(()=>{const o=document.querySelector('button[aria-label^=\"گزینه ۱:\"]');if(!o||o.disabled)return 'NO-OPT-$i';o.click();return 'PICK-$i';})()" 2>&1)
    case "$R" in *PICK-*) : ;; *) echo "ANSWER-FAIL:$R" | tee -a "$OUT"; return 1;; esac
    N=$(agent-browser eval "(()=>{const b=document.querySelector('[aria-label=\"سؤال بعدی\"]')||document.querySelector('[aria-label=\"دیدن نتیجهٔ تمرین\"]');if(!b||b.disabled)return 'NO-NEXT-$i';b.click();return (b.getAttribute('aria-label')==='دیدن نتیجهٔ تمرین')?'FIN-$i':'NEXT-$i';})()" 2>&1)
    case "$N" in *NEXT-*|*FIN-*) : ;; *) echo "NEXT-FAIL:$N" | tee -a "$OUT"; return 1;; esac
    sleep 0.4
  done
  echo "SESSION-PLAYED" | tee -a "$OUT"; echo | tee -a "$OUT"
}

# ---- حکمِ خودسازگارِ پردهٔ نتیجه: $1 صحنه، $2 = LEARN | DARK | LIGHT ----
# قفلهایِ ساختاری/حسابی همیشه (خودسازگار — بُر خوردِ جلسه تصادفی است)؛
# در DARK/LIGHT سریالهایِ پیشبینیشده از خودِ globals.css داوری میشوند؛
# در LEARN فقط چاپِ سریالهایِ واقعی (ایدئومِ آموختنِ پیشِ چشم r427/r440).
result_judge(){ # $1 صحنه، $2 LEARN|DARK|LIGHT
  probe "(()=>{const sec=[...document.querySelectorAll('section')].find(s=>s.querySelector('[aria-label=\"بازخوانی سؤال‌های تمرین\"]'));if(!sec)return 'NO-RESULT-$1';const errs=[];const h2=sec.querySelector('h2');if(!h2)return 'NO-H2-$1';const ht=(h2.textContent||'').trim();if(ht!=='نتیجهٔ تمرین')errs.push('H2:'+ht);const sc=sec.querySelector('span[aria-label^=\"نمرهٔ\"]');if(!sc){errs.push('NO-SCORE');return 'FAIL-$1:'+errs.join('|');}const scs=getComputedStyle(sc);if(scs.fontSize!=='26px')errs.push('SCORE-FS:'+scs.fontSize);if(scs.fontWeight!=='900')errs.push('SCORE-FW:'+scs.fontWeight);const aria=sc.getAttribute('aria-label')||'';const pctFa=(sc.textContent||'').trim();if(!/^نمرهٔ [۰-۹]+٪$/.test(aria))errs.push('SCORE-ARIA:'+aria);if(pctFa!==aria.replace('نمرهٔ ',''))errs.push('SCORE-MISMATCH:'+pctFa);const pEl=sc.parentElement;const sub=((pEl&&pEl.textContent)||'').replace(pctFa,'').trim();const m=sub.match(/^([۰-۹]+) درست از ([۰-۹]+)$/);if(!m){errs.push('SUB:'+sub);return 'FAIL-$1:'+errs.join('|');}const fa2en=(s)=>Number(String(s).replace(/[۰-۹]/g,(d)=>String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d))));const en2fa=(n)=>String(n).replace(/\d/g,(d)=>'۰۱۲۳۴۵۶۷۸۹'[Number(d)]);const correct=fa2en(m[1]);const total=fa2en(m[2]);const pct=fa2en(pctFa.replace('٪',''));if(correct>total)errs.push('C>T');if(Math.round(correct*100/total)!==pct)errs.push('PCT:'+pct+'!='+Math.round(correct*100/total));const ul=sec.querySelector('ul[aria-label=\"بازخوانی سؤال‌های تمرین\"]');const lis=ul?[...ul.children]:[];const emLis=lis.filter((l)=>String(l.className).includes('bg-emerald-50'));const roLis=lis.filter((l)=>String(l.className).includes('bg-rose-50'));if(lis.length!==10)errs.push('LI-N:'+lis.length);if(emLis.length!==correct)errs.push('EM:'+emLis.length+'!='+correct);if(roLis.length!==total-correct)errs.push('RO:'+roLis.length+'!='+(total-correct));const pt=lis.filter((l)=>(l.textContent||'').includes('پاسخِ تو:')).length;if(pt!==roLis.length)errs.push('PT:'+pt+'!='+roLis.length);const rep=sec.querySelector('[aria-label=\"مرور اشتباههای تمرین\"]');if(roLis.length>0){if(!rep)errs.push('NO-REPLAY');else{const rt=(rep.textContent||'').trim();if(rt!=='مرور اشتباهها ('+en2fa(roLis.length)+')')errs.push('REP-TXT:'+rt);}}else if(rep)errs.push('REPLAY-WITH-0');if(!sec.querySelector('[aria-label=\"تمرین دوباره\"]'))errs.push('NO-AGAIN');const exit=sec.querySelector('[aria-label=\"بازگشت به جدول افعال از نتیجه\"]');if(!exit)errs.push('NO-EXIT');else if((exit.textContent||'').trim()!=='جدول افعال')errs.push('EXIT-TXT');const over=lis.filter((l)=>l.scrollWidth>Math.ceil(l.getBoundingClientRect().width)+1).length;const secOver=sec.scrollWidth>Math.ceil(sec.clientWidth)+1;const docOver=document.documentElement.scrollWidth>window.innerWidth+1;const row=[...sec.querySelectorAll('div')].find((x)=>getComputedStyle(x).display==='flex'&&(x.textContent||'').includes('تمرین دوباره'));const wrap=row?getComputedStyle(row).flexWrap:'none';if(over!==0)errs.push('LI-OVER:'+over);if(secOver)errs.push('SEC-OVERX:'+sec.scrollWidth);if(docOver)errs.push('DOC-OVERX:'+document.documentElement.scrollWidth);if(wrap!=='wrap')errs.push('WRAP:'+wrap);const eL=emLis[0];const rL=roLis[0];if(emLis.length+roLis.length===0){errs.push('EMPTY-SESSION');return 'FAIL-$1:'+errs.join('|');}const eC=eL?getComputedStyle(eL):null;const rC=rL?getComputedStyle(rL):null;const eSvg=eL?eL.querySelector('svg'):null;const rSvg=rL?rL.querySelector('svg'):null;const learn=['SCORE:INK='+scs.color,eL?('EM:BG='+eC.backgroundColor+',BD='+eC.borderTopColor+',INK='+getComputedStyle(eSvg).color):'EM:-',rL?('RO:BG='+rC.backgroundColor+',BD='+rC.borderTopColor+',INK='+getComputedStyle(rSvg).color):'RO:-'];if('$2'!=='LEARN'){const D='$2'==='DARK';const W=(t,a)=>{if(t!==a)errs.push(t+'!='+a);};W(scs.color,D?'rgb(196, 181, 253)':'lab(35.2783 67.9912 -88.793)');if(eC){W(eC.backgroundColor,D?'rgba(6, 55, 40, 0.35)':'lab(97.8462 -6.94966 1.85487)');W(eC.borderTopColor,D?'rgba(30, 110, 80, 0.5)':'lab(90.2247 -31.039 9.47084)');if(eSvg)W(getComputedStyle(eSvg).color,D?'rgb(110, 231, 183)':'lab(44.4871 -41.0396 11.0361)');}if(rC){W(rC.backgroundColor,D?'rgba(80, 18, 28, 0.35)':'lab(96.2369 4.94155 1.28011)');W(rC.borderTopColor,D?'rgba(140, 40, 55, 0.5)':'lab(86.806 19.1909 4.07754)');if(rSvg)W(getComputedStyle(rSvg).color,D?'rgb(253, 164, 175)':'lab(41.1651 71.6251 30.3087)');}}return errs.length?('FAIL-$1:'+errs.join('|')):('$1-OK ['+learn.join(' | ')+']');})()"
}

echo "########## A) خانه — seed + پایهها (بندِ موبایل ۳۹۰×۸۴۴)" | tee -a "$OUT"
agent-browser close >/dev/null 2>&1 || true
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
# درسِ r441: کارتِ شناورِ «پیشنهاد نصب وب‌کتاب» (ariaِ یکتا) با تأخیر بالا میآید و
# پردهٔ نتیجه را میپوشاند — بستنِ واقعی (X) با کوپنِ ۷روزه؛ عینِ مسیرِ کاربرِ واقعی.
dismiss_install(){ probe "(()=>{const b=document.querySelector('[aria-label=\"بستن پیشنهاد نصب\"]');if(b&&b.getBoundingClientRect().width>0){b.click();return 'INSTALL-CARD-DISMISSED';}return 'NO-INSTALL-CARD';})()"; sleep 1; }
dismiss_install

echo "########## B) دادهٔ واقعی از خودِ بانک (bun)" | tee -a "$OUT"
bun -e '
const {irregularVerbs} = require("/home/z/my-project/src/data/appendix.ts");
const verb = irregularVerbs.find(v=>v.base&&v.fa).base;
if (!verb) { console.log("window.__r441={};\"BASES-INCOMPLETE\""); process.exit(0); }
console.log("window.__r441="+JSON.stringify({verb})+";\"BASES-OK\"");
' > /tmp/r441-bases.js || { echo "BASES-FAIL" | tee -a "$OUT"; agent-browser close >/dev/null 2>&1; exit 1; }
agent-browser eval "$(cat /tmp/r441-bases.js)" | tee -a "$OUT"
echo | tee -a "$OUT"

echo "########## C) بذرِ نردبانِ r419 + رکوردِ میزبان" | tee -a "$OUT"
probe "(()=>{const KEY='vision2-study-v1';const raw=JSON.parse(localStorage.getItem(KEY)||'{\"state\":{}}');const iso=(d)=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');const today=iso(new Date());const yesterday=iso(new Date(Date.now()-864e5));const m=window.__r441||{};if(!m.verb)return 'NO-BASES';raw.state.drillStats={verbs:{sessions:3,correct:15,total:30,bestPercent:70,lastDay:yesterday}};raw.state.drillMistakes={verbs:{[m.verb]:{wrong:2,ok:0,lastDay:yesterday,lastOkDay:''},[m.verb+'-g1']:{wrong:2,ok:1,lastDay:yesterday,lastOkDay:today},[m.verb+'-g2']:{wrong:3,ok:2,lastDay:'2026-10-01',lastOkDay:today},[m.verb+'-m']:{wrong:1,ok:1,lastDay:yesterday,lastOkDay:yesterday},[m.verb+'-n']:{wrong:1,ok:0,lastDay:today,lastOkDay:''}}};localStorage.setItem(KEY,JSON.stringify(raw));location.reload();return 'SEEDED:'+today;})()" | tee -a "$OUT"
sleep 4
qa_wait_home || { agent-browser close >/dev/null 2>&1; exit 1; }
agent-browser eval "$(cat /tmp/r441-bases.js)" >/dev/null 2>&1

echo "########## D) میزبان → معرفی → شروعِ جلسهٔ واقعی (اجرا)" | tee -a "$OUT"
click_card "ضمیمهٔ کتاب"; sleep 2.5
click_by_label "افعال بی‌قاعده"; sleep 2
click_by_label "شروع تمرین افعال بی‌قاعده"; sleep 2
probe "(()=>{const sec=[...document.querySelectorAll('section')].find(s=>s.querySelector('[aria-label^=\"سررسیدهای مرور\"]'));return sec?'INTRO-SEC-OK':'NO-INTRO-SEC';})()"
click_by_label "شروع جلسهٔ تمرین فعل"; sleep 2

echo "########## E) شبِ واقعی — بازیِ جلسهٔ کامل (۱۰ پرسش)" | tee -a "$OUT"
qa_to_dark
probe "(()=>{return document.documentElement.classList.contains('dark')?'DARK-ON':'DARK-OFF';})()"
play_session || { agent-browser close >/dev/null 2>&1; exit 1; }
sleep 1.5
result_sec

echo "########## F) حکمِ نتیجه در شب — سریالهایِ پیشبینیشده + قفلهایِ ساختاری" | tee -a "$OUT"
dismiss_install
result_judge MOBILE-RESULT-DARK DARK
qa_wait_toasts_clear
qa_shot r441-mobile-result-dark.png

echo "########## G) روشن — همان قفلها + سریالِ labِ همان حکم" | tee -a "$OUT"
qa_to_light
sleep 1
result_sec
result_judge MOBILE-RESULT-LIGHT LIGHT
qa_wait_toasts_clear
qa_shot r441-mobile-result-light.png

echo "########## H) دفترِ DB — پرشِ سررسید ندارد؛ جلسهٔ واقعیِ کامل (attempts در پاکسازی صفر میشود)" | tee -a "$OUT"
node -e "const {PrismaClient}=require('@prisma/client');const db=new PrismaClient();db.eventDay.findFirst({where:{name:'drill_due_jump'}}).then((r)=>{console.log('LEDGER:',JSON.stringify(r?{name:r.name,count:r.count,day:r.day}:null));return db.\$disconnect();}).catch((e)=>{console.log('LEDGER-ERR:'+e.message);process.exit(0);})" 2>&1 | tee -a "$OUT"

agent-browser close >/dev/null 2>&1 || true
echo "########## WITNESS-DONE" | tee -a "$OUT"
