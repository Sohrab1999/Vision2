#!/usr/bin/env bash
# ------------------------------------------------------------------
# r442 — «شاهدِ موبایلِ نتیجهٔ مرور: شاخهٔ isReplay زیرِ ۱۲۸۰px»
# چهلوهفتمین مصرفکنندهٔ qa-lib.sh.
# داوریِ ارزش: بندِ ①ِ r441 — r441 پردهٔ نتیجهٔ «تمرین» را در موبایل دید؛
#   شاخهٔ isReplay=true (زیرجلسهٔ r401 «مرورِ اشتباهها» با سرصفحهٔ صادقِ
#   «نتیجهٔ مرور») هرگز زیرِ ۱۲۸۰px دیده نشده. این شاهد آن را میبندد.
# صحنهٔ قطعی (بی تصادفِ داورشده): جلسهٔ پدر با پاسخِ گزینهٔ ۱ بازی میشود و
#   اندیسِ پاسخِ درستِ هر پرسش از همان آشکارسازیِ aria («— پاسخ درست») آموخته
#   میشود؛ زیرجلسهٔ r401 همان پرسشها را با همان ترتیب و همان گزینهها میسازد
#   (قراردادِ r401) — پس در مرور، اندیسِ آموختهشده کلیک میشود → مرورِ صددرصد.
# داوریها در شبِ واقعی و روشن:
#   ① سرصفحهٔ «نتیجهٔ مرور» — شکافِ صادقِ r401 (نه «نتیجهٔ تمرین»)
#   ② نمرهٔ ۲۶px/۹۰۰ == ۱۰۰٪ + «W درست از W» — خودسازگار و قطعی
#   ③ همهٔ li زمردی، صفر رز، صفر «پاسخِ تو:»
#   ④ دکمهٔ مرورِ اشتباهها غایب (قراردادِ جلسهٔ تهیِ r401 — بیغلط = بیمرور)
#   ⑤ «تمرین دوباره» + خروجِ spec حاضر؛ سرریزِ صفر + wrap
#   ⑥ سریالهایِ خانواده (آموختهٔ r441) — نمره و li زمردی
#   ⑦ r412 در DB واقعی: مرور هرگز دوبارهشماری نمیکند → attempts == ۱ (فقط پدر)
# درسهایِ ابزاری: r441 (کارتِ نصب PWA + پیشْپروازِ نحویِ داور + فقط-شاردِ رانر)
#   · r439/r440 (گاردِ موبایل کتابخانهای) · r419 (یابنده درونِ section)
# دفترِ صادق: پدر یک attempts ثبت میکند (در پاکسازی صفر میشود)؛ مرور هیچ
#   POSTی نمیزند؛ پرشِ سررسید ندارد → drill_due_jump دستنخورده.
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
OUT=/tmp/r442-mobile-replay-witness.txt
QA_SEED_FILE=/tmp/r442-witness-seed-eval.js
: > "$OUT"

source /home/z/my-project/scripts/qa-lib.sh

probe(){ agent-browser eval "$1" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

click_by_label(){ agent-browser eval "(()=>{let b=document.querySelector('[aria-label=\"$1\"]');if(!b||b.getBoundingClientRect().width===0){b=[...document.querySelectorAll('button')].find((x)=>(x.innerText||'').replace(/\s+/g,' ').trim()==='$1'&&x.getBoundingClientRect().width>0);}if(!b)return 'NO-BTN:$1';b.click();return 'CLICKED:$1';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

click_card(){ agent-browser eval "(()=>{const b=[...document.querySelectorAll('button')].find((x)=>(x.innerText||'').includes('$1')&&x.getBoundingClientRect().width>0);if(!b)return 'NO-BTN:$1';b.click();return 'CLICKED:$1';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

dismiss_install(){ probe "(()=>{const b=document.querySelector('[aria-label=\"بستن پیشنهاد نصب\"]');if(b&&b.getBoundingClientRect().width>0){b.click();return 'INSTALL-CARD-DISMISSED';}return 'NO-INSTALL-CARD';})()"; sleep 1; }

result_sec(){ agent-browser eval "(()=>{const sec=[...document.querySelectorAll('section')].find(s=>s.querySelector('[aria-label=\"بازخوانی سؤال‌های تمرین\"]'));return sec?'RESULT-SEC-OK':'NO-RESULT-SEC';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

# ---- بازیِ پدر: گزینهٔ ۱ + آموختنِ اندیسِ درست از آشکارسازیِ aria ----
play_parent(){
  probe "(()=>{window.__r442c=[];window.__r442w=[];const p=document.querySelector('[aria-live=\"polite\"]');return (p&&p.textContent.includes('۱۰'))?'RUN-SIZE-OK':'RUN-SIZE:'+(p?p.textContent:'NO-LIVE');})()"
  for i in $(seq 1 10); do
    R=$(agent-browser eval "(()=>{const o=document.querySelector('button[aria-label^=\"گزینه ۱:\"]');if(!o||o.disabled)return 'NO-OPT-$i';o.click();return 'PICK-$i';})()" 2>&1)
    case "$R" in *PICK-*) : ;; *) echo "ANSWER-FAIL:$R" | tee -a "$OUT"; return 1;; esac
    L=$(agent-browser eval "(()=>{const ok=[...document.querySelectorAll('button[aria-label]')].find((b)=>b.getAttribute('aria-label').includes('— پاسخ درست')&&b.getBoundingClientRect().width>0);if(!ok)return 'NO-REVEAL-$i';const m=(ok.getAttribute('aria-label')||'').match(/^گزینه ([۰-۹]):/);if(!m)return 'BAD-ARIA';const ci='۰۱۲۳۴۵۶۷۸۹'.indexOf(m[1])-1;window.__r442c.push(ci);if(ci!==0)window.__r442w.push(window.__r442c.length-1);return 'LEARN-$i:'+ci;})()" 2>&1)
    case "$L" in *LEARN-*) echo "$L" | tee -a "$OUT" ;; *) echo "LEARN-FAIL:$L" | tee -a "$OUT"; return 1;; esac
    N=$(agent-browser eval "(()=>{const b=document.querySelector('[aria-label=\"سؤال بعدی\"]')||document.querySelector('[aria-label=\"دیدن نتیجهٔ تمرین\"]');if(!b||b.disabled)return 'NO-NEXT-$i';b.click();return 'NEXT-$i';})()" 2>&1)
    case "$N" in *NEXT-*) : ;; *) echo "NEXT-FAIL:$N" | tee -a "$OUT"; return 1;; esac
    sleep 0.4
  done
  echo "PARENT-PLAYED" | tee -a "$OUT"; echo | tee -a "$OUT"
}

# ---- بازیِ مرور: اندیسِ آموختهشده از نقشهٔ پدر (قراردادِ همان گزینههای r401) ----
# $1 = W (شمارِ غلطهایِ پدر)
play_replay(){
  for k in $(seq 1 "$1"); do
    A=$(agent-browser eval "(()=>{const w=window.__r442w||[];const c=window.__r442c||[];const pi=w[$((k-1))];if(pi===undefined)return 'NO-MAP-$k';const ci=c[pi];const fa='۰۱۲۳۴۵۶۷۸۹'[ci+1];const o=document.querySelector('button[aria-label^=\"گزینه '+fa+':\"]');if(!o||o.disabled)return 'NO-OPT-$k';o.click();return 'OK-$k:'+fa;})()" 2>&1)
    case "$A" in *OK-*) echo "$A" | tee -a "$OUT" ;; *) echo "REPLAY-ANSWER-FAIL:$A" | tee -a "$OUT"; return 1;; esac
    N=$(agent-browser eval "(()=>{const b=document.querySelector('[aria-label=\"سؤال بعدی\"]')||document.querySelector('[aria-label=\"دیدن نتیجهٔ تمرین\"]');if(!b||b.disabled)return 'NO-NEXT-$k';b.click();return 'NEXT-$k';})()" 2>&1)
    case "$N" in *NEXT-*) : ;; *) echo "REPLAY-NEXT-FAIL:$N" | tee -a "$OUT"; return 1;; esac
    sleep 0.4
  done
  echo "REPLAY-PLAYED" | tee -a "$OUT"; echo | tee -a "$OUT"
}

# ---- حکمِ پدر (کوچک): سرصفحه + W خودسازگار + کلیکِ مرور ----
parent_judge(){
  probe "(()=>{const sec=[...document.querySelectorAll('section')].find(s=>s.querySelector('[aria-label=\"بازخوانی سؤال‌های تمرین\"]'));if(!sec)return 'NO-RESULT';const h2=(sec.querySelector('h2')||{textContent:''}).textContent.trim();if(h2!=='نتیجهٔ تمرین')return 'H2:'+h2;const lis=[...sec.querySelectorAll('ul[aria-label=\"بازخوانی سؤال‌های تمرین\"] li')];const ro=lis.filter((l)=>String(l.className).includes('bg-rose-50')).length;const em=lis.filter((l)=>String(l.className).includes('bg-emerald-50')).length;const rep=sec.querySelector('[aria-label=\"مرور اشتباههای تمرین\"]');if(!rep)return 'NO-REPLAY-BTN(em='+em+',ro='+ro+')';return 'PARENT-OK:em='+em+',ro='+ro;})()"
}

# ---- حکمِ نتیجهٔ مرور: $1 صحنه، $2 Wِ موردِ انتظار، $3 DARK|LIGHT ----
replay_judge(){ # $1 صحنه، $2 W، $3 DARK|LIGHT
  probe "(()=>{const sec=[...document.querySelectorAll('section')].find(s=>s.querySelector('[aria-label=\"بازخوانی سؤال‌های تمرین\"]'));if(!sec)return 'NO-RESULT-$1';const errs=[];const h2=(sec.querySelector('h2')||{textContent:''}).textContent.trim();if(h2!=='نتیجهٔ مرور')errs.push('H2:'+h2);const sc=sec.querySelector('span[aria-label^=\"نمرهٔ\"]');if(!sc){errs.push('NO-SCORE');return 'FAIL-$1:'+errs.join('|');}const scs=getComputedStyle(sc);if(scs.fontSize!=='26px')errs.push('SCORE-FS:'+scs.fontSize);if(scs.fontWeight!=='900')errs.push('SCORE-FW:'+scs.fontWeight);const aria=sc.getAttribute('aria-label')||'';const pctFa=(sc.textContent||'').trim();if(pctFa!==aria.replace('نمرهٔ ',''))errs.push('SCORE-MISMATCH');const pEl=sc.parentElement;const sub=((pEl&&pEl.textContent)||'').replace(pctFa,'').trim();const fa2en=(s)=>Number(String(s).replace(/[۰-۹]/g,(d)=>String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d))));const m=sub.match(/^([۰-۹]+) درست از ([۰-۹]+)$/);if(!m){errs.push('SUB:'+sub);}else{const c=fa2en(m[1]);const t=fa2en(m[2]);const pct=fa2en(pctFa.replace('٪',''));if(c!==$2)errs.push('C:'+c+'!=$2');if(t!==$2)errs.push('T:'+t+'!=$2');if(pct!==100)errs.push('PCT:'+pct);}const ul=sec.querySelector('ul[aria-label=\"بازخوانی سؤال‌های تمرین\"]');const lis=ul?[...ul.children]:[];const emLis=lis.filter((l)=>String(l.className).includes('bg-emerald-50'));const roLis=lis.filter((l)=>String(l.className).includes('bg-rose-50'));if(lis.length!==$2)errs.push('LI-N:'+lis.length+'!=$2');if(roLis.length!==0)errs.push('RO:'+roLis.length);if(lis.filter((l)=>(l.textContent||'').includes('پاسخِ تو:')).length!==0)errs.push('PT-NONZERO');if(sec.querySelector('[aria-label=\"مرور اشتباههای تمرین\"]'))errs.push('REPLAY-BTN-PRESENT');if(!sec.querySelector('[aria-label=\"تمرین دوباره\"]'))errs.push('NO-AGAIN');if(!sec.querySelector('[aria-label=\"بازگشت به جدول افعال از نتیجه\"]'))errs.push('NO-EXIT');const over=lis.filter((l)=>l.scrollWidth>Math.ceil(l.getBoundingClientRect().width)+1).length;const secOver=sec.scrollWidth>Math.ceil(sec.clientWidth)+1;const docOver=document.documentElement.scrollWidth>window.innerWidth+1;const row=[...sec.querySelectorAll('div')].find((x)=>getComputedStyle(x).display==='flex'&&(x.textContent||'').includes('تمرین دوباره'));const wrap=row?getComputedStyle(row).flexWrap:'none';if(over!==0)errs.push('LI-OVER:'+over);if(secOver)errs.push('SEC-OVERX');if(docOver)errs.push('DOC-OVERX');if(wrap!=='wrap')errs.push('WRAP:'+wrap);const eL=emLis[0];if(!eL){errs.push('NO-EM');return 'FAIL-$1:'+errs.join('|');}const eC=getComputedStyle(eL);const eSvg=eL.querySelector('svg');const D='$3'==='DARK';const W=(t,a)=>{if(t!==a)errs.push(t+'!='+a);};W(scs.color,D?'rgb(196, 181, 253)':'lab(35.2783 67.9912 -88.793)');W(eC.backgroundColor,D?'rgba(6, 55, 40, 0.35)':'lab(97.8462 -6.94966 1.85487)');W(eC.borderTopColor,D?'rgba(30, 110, 80, 0.5)':'lab(90.2247 -31.039 9.47084)');if(eSvg)W(getComputedStyle(eSvg).color,D?'rgb(110, 231, 183)':'lab(44.4871 -41.0396 11.0361)');return errs.length?('FAIL-$1:'+errs.join('|')):('$1-OK:W=$2,LI='+lis.length+',EM='+emLis.length);})()"
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
dismiss_install

echo "########## B) دادهٔ واقعی از خودِ بانک (bun)" | tee -a "$OUT"
bun -e '
const {irregularVerbs} = require("/home/z/my-project/src/data/appendix.ts");
const verb = irregularVerbs.find(v=>v.base&&v.fa).base;
if (!verb) { console.log("window.__r442={};\"BASES-INCOMPLETE\""); process.exit(0); }
console.log("window.__r442="+JSON.stringify({verb})+";\"BASES-OK\"");
' > /tmp/r442-bases.js || { echo "BASES-FAIL" | tee -a "$OUT"; agent-browser close >/dev/null 2>&1; exit 1; }
agent-browser eval "$(cat /tmp/r442-bases.js)" | tee -a "$OUT"
echo | tee -a "$OUT"

echo "########## C) بذرِ نردبانِ r419 + رکوردِ میزبان" | tee -a "$OUT"
probe "(()=>{const KEY='vision2-study-v1';const raw=JSON.parse(localStorage.getItem(KEY)||'{\"state\":{}}');const iso=(d)=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');const today=iso(new Date());const yesterday=iso(new Date(Date.now()-864e5));const m=window.__r442||{};if(!m.verb)return 'NO-BASES';raw.state.drillStats={verbs:{sessions:3,correct:15,total:30,bestPercent:70,lastDay:yesterday}};raw.state.drillMistakes={verbs:{[m.verb]:{wrong:2,ok:0,lastDay:yesterday,lastOkDay:''},[m.verb+'-g1']:{wrong:2,ok:1,lastDay:yesterday,lastOkDay:today},[m.verb+'-g2']:{wrong:3,ok:2,lastDay:'2026-10-01',lastOkDay:today},[m.verb+'-m']:{wrong:1,ok:1,lastDay:yesterday,lastOkDay:yesterday},[m.verb+'-n']:{wrong:1,ok:0,lastDay:today,lastOkDay:''}}};localStorage.setItem(KEY,JSON.stringify(raw));location.reload();return 'SEEDED:'+today;})()" | tee -a "$OUT"
sleep 4
qa_wait_home || { agent-browser close >/dev/null 2>&1; exit 1; }
agent-browser eval "$(cat /tmp/r442-bases.js)" >/dev/null 2>&1
dismiss_install

echo "########## D) میزبان → معرفی → شروعِ جلسهٔ پدر" | tee -a "$OUT"
click_card "ضمیمهٔ کتاب"; sleep 2.5
click_by_label "افعال بی‌قاعده"; sleep 2
click_by_label "شروع تمرین افعال بی‌قاعده"; sleep 2
click_by_label "شروع جلسهٔ تمرین فعل"; sleep 2

echo "########## E) شبِ واقعی — بازیِ پدر + آموختنِ نقشهٔ درست" | tee -a "$OUT"
qa_to_dark
probe "(()=>{return document.documentElement.classList.contains('dark')?'DARK-ON':'DARK-OFF';})()"
play_parent || { agent-browser close >/dev/null 2>&1; exit 1; }
sleep 1.5
result_sec
parent_judge
W=$(agent-browser eval "(()=>{const sec=[...document.querySelectorAll('section')].find(s=>s.querySelector('[aria-label=\"بازخوانی سؤال‌های تمرین\"]'));if(!sec)return '0';const lis=[...sec.querySelectorAll('ul[aria-label=\"بازخوانی سؤال‌های تمرین\"] li')];return String(lis.filter((l)=>String(l.className).includes('bg-rose-50')).length);})()" 2>&1 | tr -d '"')
echo "PARENT-WRONGS=$W" | tee -a "$OUT"; echo | tee -a "$OUT"
if [ "$W" = "0" ] || [ -z "$W" ]; then echo "NO-WRONGS-RETRY-NEEDED" | tee -a "$OUT"; agent-browser close >/dev/null 2>&1; exit 1; fi

echo "########## F) زیرجلسهٔ r401 — کلیکِ مرورِ اشتباهها ($W) + بازیِ قطعیِ صددرصد" | tee -a "$OUT"
click_by_label "مرور اشتباههای تمرین"; sleep 2
probe "(()=>{const p=document.querySelector('[aria-live=\"polite\"]');const fa='۰۱۲۳۴۵۶۷۸۹';const w='$W';const faW=w.replace(/\d/g,(d)=>fa[Number(d)]);return (p&&p.textContent.includes(faW))?'REPLAY-SIZE-OK('+faW+')':'REPLAY-SIZE:'+(p?p.textContent:'NO-LIVE');})()"
play_replay "$W" || { agent-browser close >/dev/null 2>&1; exit 1; }
sleep 1.5
result_sec

echo "########## G) حکمِ «نتیجهٔ مرور» در شب — سرصفحهٔ صادق + مرورِ صددرصد + سریالهایِ r441" | tee -a "$OUT"
replay_judge MOBILE-REPLAY-DARK "$W" DARK
qa_wait_toasts_clear
qa_shot r442-mobile-replay-dark.png

echo "########## H) روشن — همان قفلها + سریالِ lab" | tee -a "$OUT"
qa_to_light
sleep 1
result_sec
replay_judge MOBILE-REPLAY-LIGHT "$W" LIGHT
qa_wait_toasts_clear
qa_shot r442-mobile-replay-light.png

echo "########## I) دفترِ صادق — r412 در استورِ واقعی: مرور دوبارهشماری نمیکند (sessions ۳→۴؛ best ۷۰ و صددرصدِ مرور نباید best را بالا ببرد)" | tee -a "$OUT"
probe "(()=>{const raw=JSON.parse(localStorage.getItem('vision2-study-v1')||'{}');const ds=(raw.state&&raw.state.drillStats&&raw.state.drillStats.verbs)||{};const ok=(ds.sessions===4&&ds.bestPercent===70)?' (R412-OK: replay never re-counted)':' (R412-SUSPECT)';return 'DRILLSTATS:sessions='+(ds.sessions??'-')+',best='+(ds.bestPercent??'-')+',last='+ds.correct+'/'+ds.total+ok;})()"
node -e "const {PrismaClient}=require('@prisma/client');const db=new PrismaClient();db.quizAttempt.count().then((a)=>{console.log('ATTEMPTS-NOW:'+a+' (drill هرگز POST نمیزند — مسیرِ DB مالِ کوئیز/آزمون است)');return db.eventDay.findFirst({where:{name:'drill_due_jump'}});}).then((r)=>{console.log('LEDGER:',JSON.stringify(r?{name:r.name,count:r.count,day:r.day}:null));return db.\$disconnect();}).catch((e)=>{console.log('LEDGER-ERR:'+e.message);process.exit(0);})" 2>&1 | tee -a "$OUT"

agent-browser close >/dev/null 2>&1 || true
echo "########## WITNESS-DONE" | tee -a "$OUT"
