#!/usr/bin/env bash
# ------------------------------------------------------------------
# r433 — «برچسبِ بانک بر خانههایِ آیندهٔ نوار» — سیاوهشتمین مصرفکنندهٔ
# qa-lib.sh. پیشنهادِ ②ِ r432: خانههایِ آیندهٔ نوار تا دیروز فقط «چند»
#   میگفتند؛ این راند نام میگویند — فقط در title/aria (بیِ شلوغیِ بصری).
# داوریِ زندهٔ نوار در روشن و شب:
#   · فردایِ دوبانکی → «فردا — ۲ موردِ بازگشت در ۲ بانک» (گویشِ r425)
#   · تکبانکیِ k=۲/۴ → «[روز] — ۱ موردِ بازگشت — تمرینِ خانوادهٔ واژه‌ها /
#     نشانه‌های اختصاری» (نامِ رسمیِ اطلس از خودِ بانک)
#   · خانهٔ تهی → «بیِ بازگشت» بیِ ariaِ تازه (سکوتِ r422 — r433 برچسب
#     تازهای وعده نمیکند)
#   · خانهٔ امروز دستنخورده: دکمهٔ پرشِ r425 با همان title
# بندِ ①ِ r432 هم همینجاست: شاهدِ دقیقِ کرنلِ شبِ سطرِ مثالِ درسنامه —
#   r431 حلقهٔ شبش را با انتظارِ emerald-700 تبرئه کرد اما پسزمینه را
#   فقط با «۰٫۳» دید؛ این راند عینِ آیینِ r428 برایِ سطرِ خانواده،
#   «رشتهٔ دقیق» میخواهد: bg = rgba(6, 78, 59, 0.3) (emerald-900/30 با
#   عنصرِ مرجعِ همان موتور — درسِ oklab) و ringSeg = inset emerald-700
#   rgb(4, 120, 87) — هم با مرجعِ utility هم با کرنلِ خطیِ لفظی.
# درسهایِ ابزاریِ راندهایِ پیش که اینجا اعمالاند:
#   r427: پالس ۱٫۶ثانیهای است — کلیک + نظرسنجی + خواندنِ پسِ ۶۰۰ms
#   r426: پنجرهٔ JS با هر reload میمیرد — نقشهٔ پایهها دوباره تزریق میشود
#   r428: پروبِ Promiseدار کاملاً گاردشده (try/catch درون و بیرونِ tick)
# پایههایِ واقعیِ داده هرگز به پوسته نشت نمیکنند — از window.__r433.
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
OUT=/tmp/r433-future-labels.txt
QA_SEED_FILE=/tmp/r433-seed-eval.js
: > "$OUT"

source /home/z/my-project/scripts/qa-lib.sh

probe(){ agent-browser eval "$1" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

echo "########## A) خانه — seed + روشنِ ۱۲۸۰" | tee -a "$OUT"
agent-browser close >/dev/null 2>&1 || true
pkill -f "agent-browser/browsers" 2>/dev/null; sleep 1
agent-browser open "$BASE" >/dev/null 2>&1
agent-browser set viewport 1280 900 >/dev/null 2>&1
agent-browser wait 'body' >/dev/null 2>&1 || true
sleep 2
node /home/z/my-project/scripts/r338-persona.js | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>process.stdout.write(JSON.parse(s).browserEval))" > "$QA_SEED_FILE" || { echo "PERSONA-FAIL" | tee -a "$OUT"; agent-browser close >/dev/null 2>&1; exit 1; }
qa_wait_home || { agent-browser close >/dev/null 2>&1; exit 1; }
agent-browser eval "$(cat "$QA_SEED_FILE")" >/dev/null 2>&1
sleep 5
qa_seed_guard || { agent-browser close >/dev/null 2>&1; exit 1; }
qa_to_light

echo "########## B) دادهٔ واقعی از خودِ بانکها (bun) — چهار پایه + شناسهٔ سطرِ مثال" | tee -a "$OUT"
bun -e '
const {irregularVerbs, vowelPhonemes, consonantPhonemes, abbreviations} = require("/home/z/my-project/src/data/appendix.ts");
const {WORD_FAMILY_TABLES} = require("/home/z/my-project/src/data/word-families.ts");
const {BOOKLET_GRAMMAR_TOPICS} = require("/home/z/my-project/src/data/booklet-grammar.ts");
const verb = irregularVerbs.find(v=>v.base&&v.fa).base;
const verb2 = irregularVerbs.filter(v=>v.base&&v.fa&&v.base!==verb)[1].base;
const sym = [...vowelPhonemes, ...consonantPhonemes].find(p=>p.symbol&&p.fa).symbol;
const ab = abbreviations.find(a=>a.sym&&a.fa).sym;
const wf = WORD_FAMILY_TABLES[0].families.find(f=>f.noun).noun;
const topic = BOOKLET_GRAMMAR_TOPICS.find(t=>(t.examples?.length??0)>=1);
const bgex = { row: `bg-ex-${topic.id}-0`, en: topic.examples[0].en };
if (!verb||!verb2||!sym||!ab||!wf||!topic) { console.log("window.__r433={};\"BASES-INCOMPLETE\""); process.exit(0); }
console.log("window.__r433="+JSON.stringify({verb,verb2,sym,ab,wf,bgex})+";\"BASES-OK\"");
' > /tmp/r433-bases.js || { echo "BASES-FAIL" | tee -a "$OUT"; agent-browser close >/dev/null 2>&1; exit 1; }
agent-browser eval "$(cat /tmp/r433-bases.js)" | tee -a "$OUT"
echo | tee -a "$OUT"

# ---- بذرِ هفتهٔ مخلوط: امروزِ تکبانکی + فردایِ دوبانکی + k2/k4 تکبانکی ----
seed_week(){
  probe "(()=>{const KEY='vision2-study-v1';const raw=JSON.parse(localStorage.getItem(KEY)||'{\"state\":{}}');const iso=(d)=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');const ago=(n)=>iso(new Date(Date.now()-n*864e5));const due=(b)=>({wrong:2,ok:0,lastDay:ago(1),lastOkDay:''});const grace=(ok)=>({wrong:ok+1,ok:ok,lastDay:ago(0),lastOkDay:ago(0)});const R=window.__r433||{};if(!R.sym||!R.wf||!R.ab)return 'NO-BASES';raw.state.drillMistakes={verbs:{[R.verb]:due(),[R.verb2]:due()},phonemes:{[R.sym]:grace(1)},'ghost-bank':{zz:grace(1)},words:{[R.wf]:grace(2)},abbrev:{[R.ab]:grace(3)}};localStorage.setItem(KEY,JSON.stringify(raw));location.reload();return 'SEEDED-WEEK';})()"
  sleep 4
  qa_wait_home || { agent-browser close >/dev/null 2>&1; exit 1; }
  agent-browser eval "$(cat /tmp/r433-bases.js)" >/dev/null 2>&1
}

# ---- داورِ نوار — برچسبهایِ خانههایِ آینده در حالتِ جاری ----
judge_strip(){
  local mode="$1" shot="$2"
  echo "---------- داوریِ نوار ($mode)" | tee -a "$OUT"
  probe "(()=>{return new Promise((res)=>{try{
    const strip=document.querySelector('.week-strip');
    if(!strip){res('NO-STRIP-$mode');return;}
    const all=[...strip.querySelectorAll('[title]')];
    if(all.length<7){res('BAD-CELLS-$mode:'+all.length);return;}
    const cells=all.slice(0,7);
    if(cells[0].tagName!=='BUTTON'){res('TODAY-NOT-BTN-$mode:'+cells[0].tagName);return;}
    const btn=cells[0];
    const errs=[];
    const want=(cond,msg)=>{if(!cond)errs.push(msg);};
    want(strip.getAttribute('title').indexOf('خانهٔ آیندهٔ تکبانک نامِ تمرینش را در نشانگر میگوید')>=0,'CONTAINER');
    want(!!btn&&btn.getAttribute('title')==='امروز — ۲ موردِ بازگشت — پرش به تمرینِ افعال بی‌قاعده','TODAY-BTN');
    const k1=cells[1],k2=cells[2],k3=cells[3],k4=cells[4],k5=cells[5],k6=cells[6];
    want(k1.tagName==='DIV'&&k2.tagName==='DIV'&&k6.tagName==='DIV','CELL-TAGS');
    want(k1.getAttribute('title')==='فردا — ۲ موردِ بازگشت در ۲ بانک','K1-MULTI:'+k1.getAttribute('title'));
    want(k1.getAttribute('aria-label')===k1.getAttribute('title'),'K1-ARIA');
    const lab2=k2.querySelector('span').textContent;
    want(k2.getAttribute('title')===lab2+' — ۱ موردِ بازگشت — تمرینِ خانوادهٔ واژه‌ها','K2-WORDS:'+k2.getAttribute('title'));
    want(k2.getAttribute('aria-label')===k2.getAttribute('title'),'K2-ARIA');
    const lab4=k4.querySelector('span').textContent;
    want(k4.getAttribute('title')===lab4+' — ۱ موردِ بازگشت — تمرینِ نشانه‌های اختصاری','K4-ABBREV:'+k4.getAttribute('title'));
    want(k3.getAttribute('title').endsWith('بیِ بازگشت'),'K3-EMPTY:'+k3.getAttribute('title'));
    want(k3.getAttribute('aria-label')===null,'K3-NOARIA');
    want(k5.getAttribute('aria-label')===null&&k6.getAttribute('aria-label')===null,'K56-NOARIA');
    want(k1.textContent==='فردا۲'&&k3.textContent.indexOf('—')>=0,'TEXT-UNTOUCHED');
    res(errs.length?('FAIL-$mode:'+errs.join('|')):'STRIP-OK-$mode');
  }catch(e){res('OUTER-ERR-$mode:'+e.message);}});})()" | tee -a "$OUT"
  if [ -n "$shot" ]; then qa_shot "$shot"; fi
}

echo "########## C) فازِ روشن — بذرِ هفتهٔ مخلوط + داوریِ برچسبها" | tee -a "$OUT"
agent-browser eval "(()=>{location.reload();return 'R';})()" >/dev/null 2>&1
sleep 4
qa_wait_home || { agent-browser close >/dev/null 2>&1; exit 1; }
agent-browser eval "$(cat /tmp/r433-bases.js)" >/dev/null 2>&1
qa_to_light
seed_week
probe "(()=>{window.dispatchEvent(new Event('open-report'));return 'REPORT-OPEN';})()" >/dev/null 2>&1
sleep 2.5
judge_strip light r433-future-labels-light.png

echo "########## D) فازِ شب — همان نوار رویِ کاغذِ تاریک" | tee -a "$OUT"
qa_to_dark
sleep 1
judge_strip dark r433-future-labels-dark.png

echo "########## E) شاهدِ دقیقِ کرنلِ شبِ سطرِ مثال — ادامهٔ خانوادهٔ r428" | tee -a "$OUT"
agent-browser eval "(()=>{location.reload();return 'R';})()" >/dev/null 2>&1
sleep 4
qa_wait_home || { agent-browser close >/dev/null 2>&1; exit 1; }
agent-browser eval "$(cat /tmp/r433-bases.js)" >/dev/null 2>&1
qa_to_dark
probe "(()=>{const KEY='vision2-study-v1';const raw=JSON.parse(localStorage.getItem(KEY)||'{\"state\":{}}');const iso=(d)=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');const ago=(n)=>iso(new Date(Date.now()-n*864e5));const R=window.__r433||{};if(!R.bgex)return 'NO-BASES';raw.state.drillMistakes={'bg-examples':{[R.bgex.en]:{wrong:2,ok:0,lastDay:ago(2),lastOkDay:''}}};localStorage.setItem(KEY,JSON.stringify(raw));location.reload();return 'SEEDED-BGEX';})()" | tee -a "$OUT"
sleep 4
qa_wait_home || { agent-browser close >/dev/null 2>&1; exit 1; }
agent-browser eval "$(cat /tmp/r433-bases.js)" >/dev/null 2>&1
qa_to_dark
probe "(()=>{window.dispatchEvent(new Event('open-report'));return 'REPORT-OPEN-BGEX';})()" >/dev/null 2>&1
sleep 2.5
probe "(()=>{const btn=document.querySelector('.week-strip button[aria-label^=\"امروز\"]');if(!btn)return 'NO-BTN-BGEX';const al=btn.getAttribute('aria-label')||'';return al==='امروز — ۱ موردِ بازگشت — پرش به تمرینِ مثال‌های درسنامهٔ جامع'?'BTN-OK':('WRONG-BTN:'+al.slice(0,64));})()" | tee -a "$OUT"
probe "(()=>{return new Promise((res)=>{try{
  const btn=document.querySelector('.week-strip button[aria-label^=\"امروز\"]');
  if(!btn){res('NO-BTN-E');return;}
  btn.click();
  const t0=Date.now();
  const segOf=(el)=>{const s=getComputedStyle(el).boxShadow||'';return s.split(/, (?=[a-z(#])/).find(function(x){return x.indexOf('2px')>=0&&x.indexOf('inset')>=0;})||'';};
  const mk=(cls)=>{const d=document.createElement('div');d.className=cls;document.body.appendChild(d);return d;};
  const refD=mk('shadow-[inset_0_0_0_2px] dark:shadow-emerald-700');
  const refRingDark=segOf(refD);
  const kEl=document.createElement('div');kEl.style.boxShadow='inset 0 0 0 2px rgb(4, 120, 87)';document.body.appendChild(kEl);
  const refKernel=segOf(kEl);
  const refBg=mk('dark:bg-emerald-900/30');
  const refBgVal=getComputedStyle(refBg).backgroundColor;
  [refD,kEl,refBg].forEach(function(n){n.remove();});
  // درسِ oklab (r427/r431): این موتور emerald را oklab سری میکند — حکمِ
  // رنگ = برابریِ رشتهای با مرجعِ همان موتور (utility در برابر utility).
  // کرنلِ خطیِ rgb(4, 120, 87) شاهدِ مستندِ خانواده است: سطرِ خانواده
  // (r428) با کرنلِ اسکوپشدهٔ rgb سری میشود؛ سطرِ مثال با utility —
  // دو سریال، یک خانوادهٔ رنگ. مقایسه با refKernel اشتباهِ راندهاست.
  const judge=(el)=>{try{
    const cs=getComputedStyle(el);
    const seg=segOf(el);
    const bg=cs.backgroundColor||'';
    const dlgGone=!document.querySelector('[role=\"dialog\"]');
    const ringOK=seg===refRingDark&&seg.indexOf('0px 0px 0px 2px')>=0;
    const bgOK=bg===refBgVal&&bg.indexOf('/ 0.3')>=0;
    if(ringOK&&bgOK&&dlgGone){res('EXAMPLE-DARK-EXACT:ring='+seg.slice(0,60)+',bg='+bg+',kernel-doc='+refKernel.slice(0,40));return true;}
    if(Date.now()-t0>9000){res('READ-MISS:ring='+seg.slice(0,60)+',bg='+bg.slice(0,50)+',refRing='+refRingDark.slice(0,60)+',refBg='+refBgVal.slice(0,50));return true;}
    return false;
  }catch(e){res('READ-ERR-E:'+e.message);return true;}};
  const tick=()=>{try{
    const el=document.getElementById(window.__r433&&window.__r433.bgex&&window.__r433.bgex.row);
    if(el&&el.className.includes('shadow-emerald-300')){
      const tryReads=(offs)=>{if(!offs.length){res('READ-EXHAUSTED-E');return;}setTimeout(()=>{if(!judge(el))tryReads(offs.slice(1));},offs[0]);};
      tryReads([150,350,650,950]);
      return;
    }
    if(Date.now()-t0>9000){res('PULSE-MISS-E:'+(el?('class='+el.className.slice(0,72)):'no-element'));return;}
    setTimeout(tick,200);
  }catch(e){res('TICK-ERR-E:'+e.message);}};
  setTimeout(tick,300);
}catch(e){res('OUTER-ERR-E:'+e.message);}});})()" | tee -a "$OUT"
qa_shot r433-example-row-dark.png

echo "########## F) دفترِ DB — پرشهایِ این راند" | tee -a "$OUT"
node -e "const {PrismaClient}=require('@prisma/client');const db=new PrismaClient();db.eventDay.findFirst({where:{name:'drill_due_jump'}}).then((r)=>{console.log('LEDGER:',JSON.stringify(r?{name:r.name,count:r.count,day:r.day}:null));return db.\$disconnect();}).catch((e)=>{console.log('LEDGER-ERR:'+e.message);process.exit(0);})" 2>&1 | tee -a "$OUT"

agent-browser close >/dev/null 2>&1 || true
echo "########## WITNESS-DONE" | tee -a "$OUT"
