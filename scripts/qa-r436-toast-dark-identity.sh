#!/usr/bin/env bash
# ------------------------------------------------------------------
# r436 — «هویتِ شب و روزِ خودِ توست + ariaِ نامِ دکمهٔ دانلودِ هفته»
# چهلو یکمین مصرفکنندهٔ qa-lib.sh.
# پیشنهادِ ②ِ r435 (داوریِ ارزش: انجام شد) — دکمهٔ CSVِ هفته تنها
#   دروازهٔ خروجی بود که دنبالهٔ پس از هفته را در aria نمگفت؛ این راند
#   ariaِ آن پس از قفلِ r421 («…CSV — N ردیفِ این هفته») جملهٔ
#   «نزدیکترین بازگشت پس از هفته: …» را از هِلپرِ مشترکِ afterWeekNaming
#   میگیرد (تکمن-source با toastِ r435؛ عینِ خانوادهٔ r433/r434) —
#   و بیِ دنباله aria دقیقاً همان r421 میماند.
# و ادامهٔ خانوادهٔ شاهدِ تاریک (r428/r429/r435): خودِ توست تا امروز
#   فقط رفتاری witnessed بود (r435: گویشِ نام) — این راند «هویتِ»
#   آن هم در شب و روز داوری میشود: bg/ink/borderِ توستِ bg-background —
#   توکنِ `--background: oklch(0.145 0 0)` شب و `oklch(1 0 0)` روز که
#   این موتور آنها را lab() سریال میکند (درسِ r427/r433: سریالِ
#   همموتور، نه رنگِ واقعی):
#   · شب: bg=lab(2.75381 0 0) · ink=lab(98.26 0 0) · border=lab(100 0 0 / 0.1)
#   · روز: bg=lab(100 0 0) · ink=lab(2.75381 0 0) · border=lab(90.952 0 -0.0000119209)
# درسهایِ ابزاری که اینجا اعمالاند:
#   r426: پنجرهٔ JS با هر reload میمیرد — نقشهٔ پایهها دوباره تزریق میشود
#   r435: liِ توست در این Radix هیچ role ندارد — یابنده = ایدئومِ
#         qa_toast_identity (ol li با pointer-events-auto و height>0)
#   r435: گویشِ نام در aria و توست — خانوادهٔ مشترکِ afterWeekNaming
# پایههایِ واقعیِ داده هرگز به پوسته نشت نمیکنند — از window.__r436.
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
OUT=/tmp/r436-toast-identity.txt
QA_SEED_FILE=/tmp/r436-seed-eval.js
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
const {irregularVerbs} = require("/home/z/my-project/src/data/appendix.ts");
const verb = irregularVerbs.find(v=>v.base&&v.fa).base;
const verb2 = irregularVerbs.filter(v=>v.base&&v.fa&&v.base!==verb)[1].base;
if (!verb||!verb2) { console.log("window.__r436={};\"BASES-INCOMPLETE\""); process.exit(0); }
console.log("window.__r436="+JSON.stringify({verb,verb2})+";\"BASES-OK\"");
' > /tmp/r436-bases.js || { echo "BASES-FAIL" | tee -a "$OUT"; agent-browser close >/dev/null 2>&1; exit 1; }
agent-browser eval "$(cat /tmp/r436-bases.js)" | tee -a "$OUT"
echo | tee -a "$OUT"

# ---- بذر: verbs = امروز (due) + دورِ ok=4 (grace8 — پس از هفته) ----
seed_tail(){ # $1 = عبارتِ JSONِ بانکها
  probe "(()=>{const KEY='vision2-study-v1';const raw=JSON.parse(localStorage.getItem(KEY)||'{\"state\":{}}');const iso=(d)=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');const ago=(n)=>iso(new Date(Date.now()-n*864e5));const due=()=>({wrong:2,ok:0,lastDay:ago(1),lastOkDay:''});const grace=(ok)=>({wrong:ok+1,ok:ok,lastDay:ago(1),lastOkDay:ago(0)});const R=window.__r436||{};if(!R.verb)return 'NO-BASES';raw.state.drillMistakes=$1;localStorage.setItem(KEY,JSON.stringify(raw));location.reload();return 'SEEDED';})()"
  sleep 4
  qa_wait_home || { agent-browser close >/dev/null 2>&1; exit 1; }
  agent-browser eval "$(cat /tmp/r436-bases.js)" >/dev/null 2>&1
  qa_to_dark
}

open_report(){ probe "(()=>{window.dispatchEvent(new Event('open-report'));return 'REPORT-OPEN';})()" >/dev/null 2>&1; sleep 2.5; }

dark_guard(){ probe "(()=>{return document.documentElement.classList.contains('dark')?'DARK-ON':'DARK-OFF';})()" ; }

# ---- داورِ هویتِ توست: $1 = برچسبِ صحنه؛ سه سریالِ دقیقِ همموتور ----
toast_identity(){ # $1 صحنه، $2 bg، $3 ink، $4 border
  probe "(()=>{return new Promise((res)=>{try{
  const lis=[...document.querySelectorAll('ol li')].filter((el)=>el.className.includes('pointer-events-auto')&&el.getBoundingClientRect().height>0);
  if(lis.length===0){res('NO-TOAST-$1');return;}
  const cs=getComputedStyle(lis[0]);
  const errs=[];
  if(cs.backgroundColor!=='$2')errs.push('BG:'+cs.backgroundColor);
  if(cs.color!=='$3')errs.push('INK:'+cs.color);
  if(cs.borderColor!=='$4')errs.push('BORDER:'+cs.borderColor);
  res(errs.length?('FAIL-$1:'+errs.join('|')):'IDENTITY-OK-$1');
}catch(e){res('OUTER-ERR-$1:'+e.message);}});})()"
}

echo "########## C) شب — ariaِ نام + هویتِ توستِ شب" | tee -a "$OUT"
seed_tail "{verbs:{[R.verb]:due(),[R.verb2]:grace(4)}}"
open_report
dark_guard
probe "(()=>{const b=document.querySelector('[aria-label^=\"دانلود تقویم هفتهٔ پیشِ رو CSV\"]');if(!b)return 'NO-BTN-C';const al=b.getAttribute('aria-label')||'';const want='دانلود تقویم هفتهٔ پیشِ رو CSV — ۱ ردیفِ این هفته؛ نزدیکترین بازگشت پس از هفته: تمرینِ افعال بی‌قاعده، ۸ روزِ دیگر';return al===want?'ARIA-OK-C':'FAIL-C:'+al;})()" | tee -a "$OUT"
probe "(()=>{const b=document.querySelector('[aria-label^=\"دانلود تقویم هفتهٔ پیشِ رو CSV\"]');if(!b)return 'NO-BTN-C2';b.click();return 'CSV-CLICKED';})()" | tee -a "$OUT"
sleep 1.2
probe "(()=>{return new Promise((res)=>{try{
  const lis=[...document.querySelectorAll('ol li')].filter((el)=>el.className.includes('pointer-events-auto')&&el.getBoundingClientRect().height>0);
  if(lis.length===0){res('NO-TOAST-C');return;}
  const txt=lis.map(t=>t.textContent||'').join(' | ');
  res(txt.indexOf('نزدیکترین بازگشت پس از هفته: تمرینِ افعال بی‌قاعده، ۸ روزِ دیگر.')>=0?'DIALECT-OK-C':'FAIL-C-DIALECT:'+txt);
}catch(e){res('OUTER-ERR-C:'+e.message);}});})()" | tee -a "$OUT"
toast_identity DARK 'lab(2.75381 0 0)' 'lab(98.26 0 0)' 'lab(100 0 0 / 0.1)'
qa_shot r436-toast-dark.png

echo "########## D) روشن — پایهٔ هویتِ توستِ روز" | tee -a "$OUT"
qa_to_light
sleep 1
probe "(()=>{const b=document.querySelector('[aria-label^=\"دانلود تقویم هفتهٔ پیشِ رو CSV\"]');if(!b)return 'NO-BTN-D';b.click();return 'CSV-CLICKED-LIGHT';})()" | tee -a "$OUT"
sleep 1.2
toast_identity LIGHT 'lab(100 0 0)' 'lab(2.75381 0 0)' 'lab(90.952 0 -0.0000119209)'
qa_shot r436-toast-light.png

echo "########## E) دفترِ DB — این شاهد پرشی ندارد؛ دفترِ صادق" | tee -a "$OUT"
node -e "const {PrismaClient}=require('@prisma/client');const db=new PrismaClient();db.eventDay.findFirst({where:{name:'drill_due_jump'}}).then((r)=>{console.log('LEDGER:',JSON.stringify(r?{name:r.name,count:r.count,day:r.day}:null));return db.\$disconnect();}).catch((e)=>{console.log('LEDGER-ERR:'+e.message);process.exit(0);})" 2>&1 | tee -a "$OUT"

agent-browser close >/dev/null 2>&1 || true
echo "########## WITNESS-DONE" | tee -a "$OUT"
