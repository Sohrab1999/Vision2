#!/usr/bin/env bash
# ------------------------------------------------------------------
# r434 — «نامِ نزدیکترینِ پس از هفته» — سیاونههمین مصرفکنندهٔ qa-lib.sh.
# پیشنهادِ ①ِ r433: دنبالهٔ «+N پس از هفته» و نوارِ «این هفته آرام است»
#   تا دیروز فقط «کِی» (و در دنباله فقط «چند») میگفتند؛ این راند «چه»
#   را هم میگویند — فقط در title/aria (صفر شلوغیِ بصری):
#   · دنبالهٔ تکبانکی → «پس از این هفته ۱ موردِ دیگر در راه است —
#     نزدیکترین بازگشتِ ۸ روزِ دیگر: تمرینِ افعال بی‌قاعده»
#   · همروزیِ دوبانکی → «…: ۲ مورد در ۲ بانک» (گویشِ r425) — در روشن و شب
#   · بانکِ ناشناس → «…: ۱ مورد» (r236 — نه کلیدِ خام نه نامِ برساخته)
#   · نوارِ آرامِ هفتهٔ خالی → «نزدیکترین بازگشت: [نام]، [کِی]»
#   · متنِ دیدنیِ دنباله همان «+N پس از هفته» — صفر شلوغیِ نو
#   · خانهٔ امروزِ r425 دستنخورده: پرشِ زنده (+۱ drill_due_jump —
#     دفترِ صادق) با دیالوگِ بسته
# درسهایِ ابزاریِ راندهایِ پیش که اینجا اعمالاند:
#   r426: پنجرهٔ JS با هر reload میمیرد — نقشهٔ پایهها دوباره تزریق میشود
#   r428: پروبِ Promiseدار کاملاً گاردشده (try/catch درون و بیرونِ tick)
#   r433: دنباله با «پیشوندِ» «پس از این هفته» پیدا میشود نه زیررشته —
#         عنوانِ نوارِ آرام هم همین زیررشته را دارد
# پایههایِ واقعیِ داده هرگز به پوسته نشت نمیکنند — از window.__r434.
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
OUT=/tmp/r434-after-week-names.txt
QA_SEED_FILE=/tmp/r434-seed-eval.js
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

echo "########## B) دادهٔ واقعی از خودِ بانکها (bun) — دو فعل + یک واک" | tee -a "$OUT"
bun -e '
const {irregularVerbs, vowelPhonemes, consonantPhonemes} = require("/home/z/my-project/src/data/appendix.ts");
const verb = irregularVerbs.find(v=>v.base&&v.fa).base;
const verb2 = irregularVerbs.filter(v=>v.base&&v.fa&&v.base!==verb)[1].base;
const sym = [...vowelPhonemes, ...consonantPhonemes].find(p=>p.symbol&&p.fa).symbol;
if (!verb||!verb2||!sym) { console.log("window.__r434={};\"BASES-INCOMPLETE\""); process.exit(0); }
console.log("window.__r434="+JSON.stringify({verb,verb2,sym})+";\"BASES-OK\"");
' > /tmp/r434-bases.js || { echo "BASES-FAIL" | tee -a "$OUT"; agent-browser close >/dev/null 2>&1; exit 1; }
agent-browser eval "$(cat /tmp/r434-bases.js)" | tee -a "$OUT"
echo | tee -a "$OUT"

# ---- بذرِ ترکیبی: بستارِ probe گویشِ بانک را حمل میکند —
# due() = سررسیدِ امروز؛ grace(ok) = درنفسِ نردبانِ 2^(ok-1)روزه
# (grace(4) → daysUntil=۸ — بیرونِ پنجرهٔ ۷روزه = «پس از هفته») ----
seed_far(){ # $1 = عبارتِ JSONِ بانکها — با due/grace/Rِ درونِ بستار
  probe "(()=>{const KEY='vision2-study-v1';const raw=JSON.parse(localStorage.getItem(KEY)||'{\"state\":{}}');const iso=(d)=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');const ago=(n)=>iso(new Date(Date.now()-n*864e5));const due=()=>({wrong:2,ok:0,lastDay:ago(1),lastOkDay:''});const grace=(ok)=>({wrong:ok+1,ok:ok,lastDay:ago(1),lastOkDay:ago(0)});const R=window.__r434||{};if(!R.verb||!R.sym)return 'NO-BASES';raw.state.drillMistakes=$1;localStorage.setItem(KEY,JSON.stringify(raw));location.reload();return 'SEEDED';})()"
  sleep 4
  qa_wait_home || { agent-browser close >/dev/null 2>&1; exit 1; }
  agent-browser eval "$(cat /tmp/r434-bases.js)" >/dev/null 2>&1
}

open_report(){ probe "(()=>{window.dispatchEvent(new Event('open-report'));return 'REPORT-OPEN';})()" >/dev/null 2>&1; sleep 2.5; }

# ---- داورِ دنباله: $1 = صحنه؛ $2 = انتظارِ titleِ کامل ----
tail_probe(){ # $1 صحنه، $2 انتظار — بدونِ qa_shot (صحنهها خودشان شات میگیرند)
  probe "(()=>{return new Promise((res)=>{try{
    const strip=document.querySelector('.week-strip');
    if(!strip){res('NO-STRIP-$1');return;}
    const tail=[...strip.querySelectorAll('[title]')].find(function(el){return (el.getAttribute('title')||'').indexOf('پس از این هفته')===0;});
    if(!tail){res('NO-TAIL-$1');return;}
    res(tail.getAttribute('title')==='$2'?'TAIL-OK-$1':'FAIL-$1:'+(tail.getAttribute('title')||''));
  }catch(e){res('OUTER-ERR-$1:'+e.message);}});})()"
}

echo "########## C) دنبالهٔ تکبانکی — verbs: امروز + دورِ ok=4" | tee -a "$OUT"
seed_far "{verbs:{[R.verb]:due(),[R.verb2]:grace(4)}}"
open_report
probe "(()=>{return new Promise((res)=>{try{
  const strip=document.querySelector('.week-strip');
  if(!strip){res('NO-STRIP-C');return;}
  const tail=[...strip.querySelectorAll('[title]')].find(function(el){return (el.getAttribute('title')||'').indexOf('پس از این هفته')===0;});
  if(!tail){res('NO-TAIL-C');return;}
  const t=tail.getAttribute('title')||'';
  const wantT='پس از این هفته ۱ موردِ دیگر در راه است — نزدیکترین بازگشتِ ۸ روزِ دیگر: تمرینِ افعال بی‌قاعده';
  const errs=[];
  if(t!==wantT)errs.push('TAIL:'+t);
  if(tail.textContent!=='+۱ پس از هفته')errs.push('TEXT:'+tail.textContent);
  if(tail.getAttribute('aria-label')!==null)errs.push('TAIL-ARIA');
  const ct=strip.getAttribute('title')||'';
  if(ct.indexOf('خانهٔ امروز با سررسیدِ تکبانک پرش به تمرین دارد')<0)errs.push('R425-SUB');
  if(ct.indexOf('دنبالهٔ پس از هفته نامِ نزدیکترین بازگشت را میگوید')<0)errs.push('R434-DOC');
  res(errs.length?('FAIL-C:'+errs.join('|')):'TAIL-OK-C');
}catch(e){res('OUTER-ERR-C:'+e.message);}});})()" | tee -a "$OUT"
echo | tee -a "$OUT"
qa_shot r434-tail-single-light.png

echo "########## D) پرشِ زندهٔ امروزِ r425 — قفلِ رفتاری در همان نوار" | tee -a "$OUT"
probe "(()=>{const btn=document.querySelector('.week-strip button[aria-label^=\"امروز\"]');if(!btn)return 'NO-BTN-D';return btn.getAttribute('aria-label')==='امروز — ۱ موردِ بازگشت — پرش به تمرینِ افعال بی‌قاعده'?'BTN-OK':('WRONG-BTN:'+btn.getAttribute('aria-label'));})()" | tee -a "$OUT"
probe "(()=>{const btn=document.querySelector('.week-strip button[aria-label^=\"امروز\"]');if(!btn)return 'NO-BTN-D2';btn.click();return 'JUMPED';})()" | tee -a "$OUT"
sleep 3
probe "(()=>{const dlg=document.querySelector('[role=\"dialog\"]');return dlg?'DIALOG-STILL-OPEN':'DIALOG-CLOSED-OK';})()" | tee -a "$OUT"

echo "########## E) همروزیِ دوبانکی — گویشِ «در ۲ بانک» در روشن و شب" | tee -a "$OUT"
seed_far "{phonemes:{[R.sym]:grace(4)},verbs:{[R.verb]:due(),[R.verb2]:grace(4)}}"
open_report
tail_probe E 'پس از این هفته ۲ موردِ دیگر در راه است — نزدیکترین بازگشتِ ۸ روزِ دیگر: ۲ مورد در ۲ بانک'
echo | tee -a "$OUT"
qa_shot r434-tail-multi-light.png
qa_to_dark
sleep 1
tail_probe E-DARK 'پس از این هفته ۲ موردِ دیگر در راه است — نزدیکترین بازگشتِ ۸ روزِ دیگر: ۲ مورد در ۲ بانک'
echo | tee -a "$OUT"
qa_shot r434-tail-multi-dark.png

echo "########## F) نوارِ آرام — تکبانکِ شناخته" | tee -a "$OUT"
qa_to_light
seed_far "{verbs:{[R.verb2]:grace(4)}}"
open_report
probe "(()=>{const q=document.querySelector('.week-strip-quiet');if(!q)return 'NO-QUIET-F';const txt=q.textContent||'';const al=q.getAttribute('aria-label')||'';const wantT='این هفته آرام است — نزدیکترین بازگشت: تمرینِ افعال بی‌قاعده، ۸ روزِ دیگر';const wantA='هفتهٔ پیشِ رو — این هفته چیزی برنمیگردد؛ نزدیکترین بازگشت تمرینِ افعال بی‌قاعده، ۸ روزِ دیگر';return (txt===wantT&&al===wantA)?'QUIET-OK-F':('FAIL-F:txt='+txt+'|al='+al);})()" | tee -a "$OUT"
echo | tee -a "$OUT"
qa_shot r434-quiet-known-light.png

echo "########## G) نوارِ آرامِ بانکِ ناشناس — شمارِ صادق (r236)" | tee -a "$OUT"
seed_far "{'ghost-bank':{zz:grace(4)}}"
open_report
probe "(()=>{const q=document.querySelector('.week-strip-quiet');if(!q)return 'NO-QUIET-G';const txt=q.textContent||'';const al=q.getAttribute('aria-label')||'';const wantT='این هفته آرام است — نزدیکترین بازگشت: ۱ مورد، ۸ روزِ دیگر';if(txt!==wantT)return 'FAIL-G:txt='+txt;if(al.indexOf('ghost')>=0||al.indexOf('zz')>=0)return 'KEY-LEAK-G:'+al;return 'QUIET-OK-G';})()" | tee -a "$OUT"
echo | tee -a "$OUT"
qa_shot r434-quiet-ghost-light.png

echo "########## H) دفترِ DB — پرشِ این راند" | tee -a "$OUT"
node -e "const {PrismaClient}=require('@prisma/client');const db=new PrismaClient();db.eventDay.findFirst({where:{name:'drill_due_jump'}}).then((r)=>{console.log('LEDGER:',JSON.stringify(r?{name:r.name,count:r.count,day:r.day}:null));return db.\$disconnect();}).catch((e)=>{console.log('LEDGER-ERR:'+e.message);process.exit(0);})" 2>&1 | tee -a "$OUT"

agent-browser close >/dev/null 2>&1 || true
echo "########## WITNESS-DONE" | tee -a "$OUT"
