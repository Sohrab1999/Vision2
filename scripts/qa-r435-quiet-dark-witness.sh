#!/usr/bin/env bash
# ------------------------------------------------------------------
# r435 — «شاهدِ تاریکِ نوارِ آرام + گویشِ نامِ toastِ دانلودِ هفته»
# چهلمین مصرفکنندهٔ qa-lib.sh.
# پیشنهادِ ①ِ r434: r434 شاهدِ زندهٔ گویشهایِ نو را فقط در روشن دید
#   (جز همروزیِ دوبانکی) — این راند همهٔ گویشها در شبِ واقعی داوری
#   میشوند (خانوادهٔ شاهدِ تاریک — r428/r429):
#   · دنبالهٔ تکبانکی در شب → titleِ «…نزدیکترین بازگشتِ ۸ روزِ دیگر:
#     تمرینِ افعال بی‌قاعده» (متنِ دیدنی همان «+۱ پس از هفته»)
#   · دنبالهٔ بانکِ ناشناس در شب → «…: ۱ مورد» — بیِ کلیدِ خام (r236)
#   · نوارِ آرامِ تکبانکِ شناخته در شب → متن و ariaِ آینه
#   · نوارِ آرامِ بانکِ ناشناس در شب → شمارِ صادق بیِ نشت
#   · کرنلِ شبِ c-veil-60 دقیق: rgba(41, 37, 36, 0.6) — نوارِ آرام زیرِ
#     report-digest زندگی میکند، پس retargetِ شبِ r87 (`.dark .report-digest
#     .c-veil-60 → rgb(41 37 36 / 0.6)`) بر او حاکم است نه پیشفرضِ (28,25,23)
#     — سریالِ همموتورِ کرنلِ globals.css (درسِ r427/r433)
# پیشنهادِ ②ِ r434 (همین راند): toastِ دانلودِ تقویمِ هفته نامِ
#   نزدیکترین را میگوید — زنده پس از کلیکِ دکمهٔ CSV داوری میشود
#   (jsdom منطق را دارد؛ شاهد محصول را داوری میکند — درسِ r429/r434).
# درسهایِ ابزاری که اینجا اعمالاند:
#   r426: پنجرهٔ JS با هر reload میمیرد — نقشهٔ پایهها دوباره تزریق میشود
#   r428: پروبِ Promiseدار کاملاً گاردشده (try/catch درون و بیرونِ tick)
#   r433: دنباله با «پیشوندِ» «پس از این هفته» پیدا میشود نه زیررشته
# پایههایِ واقعیِ داده هرگز به پوسته نشت نمیکنند — از window.__r435.
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
OUT=/tmp/r435-quiet-dark-witness.txt
QA_SEED_FILE=/tmp/r435-seed-eval.js
: > "$OUT"

source /home/z/my-project/scripts/qa-lib.sh

probe(){ agent-browser eval "$1" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

echo "########## A) خانه — seed + پایهها + شبِ واقعی" | tee -a "$OUT"
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
qa_to_dark

echo "########## B) دادهٔ واقعی از خودِ بانکها (bun)" | tee -a "$OUT"
bun -e '
const {irregularVerbs, vowelPhonemes, consonantPhonemes} = require("/home/z/my-project/src/data/appendix.ts");
const verb = irregularVerbs.find(v=>v.base&&v.fa).base;
const verb2 = irregularVerbs.filter(v=>v.base&&v.fa&&v.base!==verb)[1].base;
const sym = [...vowelPhonemes, ...consonantPhonemes].find(p=>p.symbol&&p.fa).symbol;
if (!verb||!verb2||!sym) { console.log("window.__r435={};\"BASES-INCOMPLETE\""); process.exit(0); }
console.log("window.__r435="+JSON.stringify({verb,verb2,sym})+";\"BASES-OK\"");
' > /tmp/r435-bases.js || { echo "BASES-FAIL" | tee -a "$OUT"; agent-browser close >/dev/null 2>&1; exit 1; }
agent-browser eval "$(cat /tmp/r435-bases.js)" | tee -a "$OUT"
echo | tee -a "$OUT"

# ---- بذرِ ترکیبی: due() = سررسیدِ امروز؛ grace(ok) = درنفسِ نردبانِ
# 2^(ok-1)روزه (grace(4) → daysUntil=۸ — بیرونِ پنجرهٔ ۷روزه) ----
seed_far(){ # $1 = عبارتِ JSONِ بانکها
  probe "(()=>{const KEY='vision2-study-v1';const raw=JSON.parse(localStorage.getItem(KEY)||'{\"state\":{}}');const iso=(d)=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');const ago=(n)=>iso(new Date(Date.now()-n*864e5));const due=()=>({wrong:2,ok:0,lastDay:ago(1),lastOkDay:''});const grace=(ok)=>({wrong:ok+1,ok:ok,lastDay:ago(1),lastOkDay:ago(0)});const R=window.__r435||{};if(!R.verb||!R.sym)return 'NO-BASES';raw.state.drillMistakes=$1;localStorage.setItem(KEY,JSON.stringify(raw));location.reload();return 'SEEDED';})()"
  sleep 4
  qa_wait_home || { agent-browser close >/dev/null 2>&1; exit 1; }
  agent-browser eval "$(cat /tmp/r435-bases.js)" >/dev/null 2>&1
  qa_to_dark
}

open_report(){ probe "(()=>{window.dispatchEvent(new Event('open-report'));return 'REPORT-OPEN';})()" >/dev/null 2>&1; sleep 2.5; }

dark_guard(){ probe "(()=>{return document.documentElement.classList.contains('dark')?'DARK-ON':'DARK-OFF';})()" ; }

echo "########## C) دنبالهٔ تکبانکی در شب — verbs: امروز + دورِ ok=4" | tee -a "$OUT"
seed_far "{verbs:{[R.verb]:due(),[R.verb2]:grace(4)}}"
open_report
dark_guard
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
  res(errs.length?('FAIL-C:'+errs.join('|')):'TAIL-OK-C');
}catch(e){res('OUTER-ERR-C:'+e.message);}});})()" | tee -a "$OUT"
echo | tee -a "$OUT"
qa_shot r435-tail-single-dark.png

echo "########## D) toastِ دانلودِ هفته در شب — گویشِ نامِ r435 زنده" | tee -a "$OUT"
probe "(()=>{const btn=document.querySelector('[aria-label^=\"دانلود تقویم هفتهٔ پیشِ رو CSV\"]');if(!btn)return 'NO-CSV-BTN';btn.click();return 'CSV-CLICKED';})()" | tee -a "$OUT"
sleep 1.5
probe "(()=>{return new Promise((res)=>{try{
  const lis=[...document.querySelectorAll('ol li')].filter((el)=>el.className.includes('pointer-events-auto')&&el.getBoundingClientRect().height>0);
  if(lis.length===0){res('NO-TOAST');return;}
  const txt=lis.map(t=>t.textContent||'').join(' | ');
  const want='نزدیکترین بازگشت پس از هفته: تمرینِ افعال بی‌قاعده، ۸ روزِ دیگر.';
  res(txt.indexOf(want)>=0?'TOAST-OK-D':'FAIL-D:'+txt);
}catch(e){res('OUTER-ERR-D:'+e.message);}});})()" | tee -a "$OUT"
echo | tee -a "$OUT"

echo "########## E) دنبالهٔ بانکِ ناشناس در شب — شمارِ صادق (r236)" | tee -a "$OUT"
seed_far "{verbs:{[R.verb]:due()},'ghost-bank':{zz:grace(4)}}"
open_report
dark_guard
probe "(()=>{return new Promise((res)=>{try{
  const strip=document.querySelector('.week-strip');
  if(!strip){res('NO-STRIP-E');return;}
  const tail=[...strip.querySelectorAll('[title]')].find(function(el){return (el.getAttribute('title')||'').indexOf('پس از این هفته')===0;});
  if(!tail){res('NO-TAIL-E');return;}
  const t=tail.getAttribute('title')||'';
  const wantT='پس از این هفته ۱ موردِ دیگر در راه است — نزدیکترین بازگشتِ ۸ روزِ دیگر: ۱ مورد';
  if(t!==wantT)return res('FAIL-E:'+t);
  if(t.indexOf('ghost')>=0||t.indexOf('zz')>=0)return res('KEY-LEAK-E');
  res('TAIL-OK-E');
}catch(e){res('OUTER-ERR-E:'+e.message);}});})()" | tee -a "$OUT"
echo | tee -a "$OUT"
qa_shot r435-tail-ghost-dark.png

echo "########## F) نوارِ آرامِ تکبانکِ شناخته در شب + کرنلِ دقیقِ c-veil" | tee -a "$OUT"
seed_far "{verbs:{[R.verb2]:grace(4)}}"
open_report
dark_guard
probe "(()=>{return new Promise((res)=>{try{
  const q=document.querySelector('.week-strip-quiet');
  if(!q){res('NO-QUIET-F');return;}
  const txt=q.textContent||'';
  const al=q.getAttribute('aria-label')||'';
  const wantT='این هفته آرام است — نزدیکترین بازگشت: تمرینِ افعال بی‌قاعده، ۸ روزِ دیگر';
  const wantA='هفتهٔ پیشِ رو — این هفته چیزی برنمیگردد؛ نزدیکترین بازگشت تمرینِ افعال بی‌قاعده، ۸ روزِ دیگر';
  const errs=[];
  if(txt!==wantT)errs.push('TXT:'+txt);
  if(al!==wantA)errs.push('ARIA:'+al);
  const bg=getComputedStyle(q).backgroundColor||'';
  if(bg!=='rgba(41, 37, 36, 0.6)')errs.push('KERNEL:'+bg);
  res(errs.length?('FAIL-F:'+errs.join('|')):'QUIET-OK-F');
}catch(e){res('OUTER-ERR-F:'+e.message);}});})()" | tee -a "$OUT"
echo | tee -a "$OUT"
qa_shot r435-quiet-known-dark.png

echo "########## G) نوارِ آرامِ بانکِ ناشناس در شب — بیِ نشتِ کلید" | tee -a "$OUT"
seed_far "{'ghost-bank':{zz:grace(4)}}"
open_report
dark_guard
probe "(()=>{return new Promise((res)=>{try{
  const q=document.querySelector('.week-strip-quiet');
  if(!q){res('NO-QUIET-G');return;}
  const txt=q.textContent||'';
  const wantT='این هفته آرام است — نزدیکترین بازگشت: ۱ مورد، ۸ روزِ دیگر';
  if(txt!==wantT)return res('FAIL-G:'+txt);
  if((q.getAttribute('aria-label')||'').indexOf('zz')>=0)return res('KEY-LEAK-G');
  res('QUIET-OK-G');
}catch(e){res('OUTER-ERR-G:'+e.message);}});})()" | tee -a "$OUT"
echo | tee -a "$OUT"
qa_shot r435-quiet-ghost-dark.png

echo "########## H) دفترِ DB — این شاهد پرشی ندارد؛ دفترِ صادق" | tee -a "$OUT"
node -e "const {PrismaClient}=require('@prisma/client');const db=new PrismaClient();db.eventDay.findFirst({where:{name:'drill_due_jump'}}).then((r)=>{console.log('LEDGER:',JSON.stringify(r?{name:r.name,count:r.count,day:r.day}:null));return db.\$disconnect();}).catch((e)=>{console.log('LEDGER-ERR:'+e.message);process.exit(0);})" 2>&1 | tee -a "$OUT"

agent-browser close >/dev/null 2>&1 || true
echo "########## WITNESS-DONE" | tee -a "$OUT"
