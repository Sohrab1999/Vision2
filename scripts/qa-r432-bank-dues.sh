#!/usr/bin/env bash
# ------------------------------------------------------------------
# r432 — «سررسیدهایِ امروز به تفکیک بانک» — سیاوهفتممصرفکنندهٔ qa-lib.sh.
# حکمِ معلقِ ناوبریِ چندبانکی (از r425): خانهٔ امروزِ نوار فقط برایِ تکبانک
#   دکمه دارد؛ روزِ چندبانکی ساکتِ صادق میماند (r236) — یادگیرنده هیچ
#   پرشی نداشت. فهرستِ زیرِ نوار همان حکم را به شکلِ فهرست میبندد:
#   هر بانک یک سطر با عنوانِ رسمیِ اطلس + شمارِ صادق + پرشِ خودش؛ بانکِ
#   بیلنگر سطرِ شمارِ بیوعده میگیرد.
# داوریِ زنده — تک سشن، پنج پرده:
#   B) روزِ چندبانکی (verbs + phonemes + words + dict-vocabِ بی لنگر):
#      ظرفِ فهرست با ariaِ جمعِ صادق؛ سطربهسطر؛ سطرِ بیوعده div است نه دکمه؛
#      کلیکِ سطرِ واک → landed + رویداد + دیالوگِ بسته؛ بازگشت + کلیکِ واژگانِ
#      درس → landed (هر سطر مقصدِ خودش).
#   C) شب: hoverِ سطرِ پرش روی کرنلِ خانوادهٔ دروازههایِ کاغذ (tealِ #5eead4
#      از خودِ کرنلِ موجودِ report-paper — صفر بودجهٔ سلکتور نو) + شاتِ تاریک.
#   D) reload → فهرست از hydration (bankPersisted:true).
#   E) روزِ تکبانکی: فهرست غایب — خانهٔ نوار خودش پرش دارد (صفر افزونگی).
# درسهایِ ابزاریِ راندهایِ پیش که اینجا اعمالاند:
#   r427: خوانشِ پسِ اسکرول درونِ همان Promise (پروبِ جداگانه کارتِ خاموش میخواند).
#   r426: هر مسیر با بازگشتِ خانه (reload) آغاز میشود؛ نقشهٔ پایهها پسِ هر
#         reload دوباره تزریق میشود.
#   r428: پروبِ Promiseدار کاملاً گاردشده (try/catch درون و بیرونِ tick).
# پایههایِ واقعیِ داده هرگز به پوسته نشت نمیکنند — از window.__r432.
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
OUT=/tmp/r432-bank-dues.txt
QA_SEED_FILE=/tmp/r432-seed-eval.js
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

echo "########## B) دادهٔ واقعی از خودِ بانکها (bun) — چهار پایه (سه لنگردار + یک بیلنگر)" | tee -a "$OUT"
bun -e '
const {irregularVerbs, vowelPhonemes, consonantPhonemes} = require("/home/z/my-project/src/data/appendix.ts");
const {lessons} = require("/home/z/my-project/src/data/index.ts");
const {WORD_FAMILY_TABLES, wordFamilyTableId} = require("/home/z/my-project/src/data/word-families.ts");
const verb = irregularVerbs.find(v=>v.base&&v.fa).base;
const sym = [...vowelPhonemes, ...consonantPhonemes].find(p=>p.symbol&&p.fa).symbol;
let fam = null;
for (const t of WORD_FAMILY_TABLES) {
  const fi = t.families.findIndex(f=>f.noun&&f.verb&&f.adjective&&f.adverb);
  if (fi >= 0) { fam = { word: t.families[fi].noun, table: wordFamilyTableId(t), idx: fi }; break; }
}
const vocab = lessons[0].vocabulary.find(w=>w.en&&w.fa).en;
if (!verb||!sym||!fam||!vocab) { console.log("window.__r432={};\"BASES-INCOMPLETE\""); process.exit(0); }
console.log("window.__r432="+JSON.stringify({verb,sym,fam,vocab})+";\"BASES-OK\"");
' > /tmp/r432-bases.js || { echo "BASES-FAIL" | tee -a "$OUT"; agent-browser close >/dev/null 2>&1; exit 1; }
agent-browser eval "$(cat /tmp/r432-bases.js)" | tee -a "$OUT"
echo | tee -a "$OUT"

echo "########## C) بذرِ چندبانکی + داوریِ فهرست (روشن)" | tee -a "$OUT"
agent-browser eval "(()=>{location.reload();return 'R';})()" >/dev/null 2>&1
sleep 4
qa_wait_home || { agent-browser close >/dev/null 2>&1; exit 1; }
agent-browser eval "$(cat /tmp/r432-bases.js)" >/dev/null 2>&1
probe "(()=>{const KEY='vision2-study-v1';const raw=JSON.parse(localStorage.getItem(KEY)||'{\"state\":{}}');const iso=(d)=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');const ago=(n)=>iso(new Date(Date.now()-n*864e5));const m=window.__r432;raw.state.drillMistakes={'verbs':{[m.verb]:{wrong:2,ok:0,lastDay:ago(1),lastOkDay:''}},'phonemes':{[m.sym]:{wrong:2,ok:0,lastDay:ago(1),lastOkDay:''}},'words':{[m.fam.word]:{wrong:2,ok:0,lastDay:ago(1),lastOkDay:''}},'dict-vocab':{'zzz-unknown-base':{wrong:2,ok:0,lastDay:ago(1),lastOkDay:''}}};localStorage.setItem(KEY,JSON.stringify(raw));location.reload();return 'SEEDED-MULTI';})()" | tee -a "$OUT"
sleep 4
qa_wait_home || { agent-browser close >/dev/null 2>&1; exit 1; }
agent-browser eval "$(cat /tmp/r432-bases.js)" >/dev/null 2>&1
qa_to_light
probe "(()=>{window.dispatchEvent(new Event('open-report'));return 'REPORT-OPEN';})()" >/dev/null 2>&1
sleep 2.5
# تکپروبِ ترکیبی: ظرف + سه سطر (دو دکمه + یک divِ بیوعده) + خانهٔ امروزِ چندبانکیِ ساکتِ نوار
probe "(()=>{try{const band=document.querySelector('div[aria-label^=\"سررسیدهایِ امروز به تفکیک بانک\"]');if(!band)return 'NO-BAND';const jumps=band.querySelectorAll('button.today-bank-jump');const quiet=band.querySelectorAll('div[aria-label$=\"میزبانِ پرش ندارد\"]');const stripCell=document.querySelector('.week-strip div[aria-label^=\"امروز\"]');const cellBtn=document.querySelector('.week-strip button[aria-label^=\"امروز\"]');return JSON.stringify({bandAria:band.getAttribute('aria-label'),jumpCount:jumps.length,quietCount:quiet.length,firstJumpAria:jumps[0]?jumps[0].getAttribute('aria-label'):null,quietAria:quiet[0]?quiet[0].getAttribute('aria-label'):null,multiCellQuiet:!!stripCell,cellHasBtn:!!cellBtn});}catch(e){return 'PROBE-ERR:'+e.message;}})()" | tee -a "$OUT"
qa_shot r432-bank-dues-light.png
# کلیکِ سطرِ واک → landed + رویداد + دیالوگِ بسته (پروبِ Promiseدارِ گاردشده — درسِ r427/r428)
probe "(()=>{return new Promise((res)=>{try{const band=document.querySelector('div[aria-label^=\"سررسیدهایِ امروز به تفکیک بانک\"]');if(!band){res('NO-BAND-CLICK');return;}const btn=band.querySelector('button.today-bank-jump[aria-label^=\"پرش به تمرینِ جدول تلفظ\"]');if(!btn){res('NO-PHONEME-ROW');return;}btn.click();const t0=Date.now();const tick=()=>{try{const card=document.getElementById('ph-'+(window.__r432&&window.__r432.sym));const dlg=document.querySelector('[role=\"dialog\"]');if(card&&card.className.includes('shadow-emerald-300')&&!dlg){res('PHONEME-LANDED:true,dialogClosed:true,pulse:true,at:'+(Date.now()-t0));return;}if(Date.now()-t0>9000){res('LANDED-MISS:card='+(!!card)+',pulse='+(card?card.className.includes('shadow-emerald-300'):'-')+',dlg='+!!dlg);return;}setTimeout(tick,200);}catch(e){res('TICK-ERR:'+e.message);}};setTimeout(tick,300);}catch(e){res('OUTER-ERR:'+e.message);}});})()" | tee -a "$OUT"
# بازگشتِ خانه + پرشِ سطرِ دوم (واژگانِ درس) — هر سطر مقصدِ خودش
agent-browser eval "(()=>{location.reload();return 'R';})()" >/dev/null 2>&1
sleep 4
qa_wait_home || { agent-browser close >/dev/null 2>&1; exit 1; }
agent-browser eval "$(cat /tmp/r432-bases.js)" >/dev/null 2>&1
probe "(()=>{window.dispatchEvent(new Event('open-report'));return 'REPORT-REOPEN';})()" >/dev/null 2>&1
sleep 2.5
probe "(()=>{return new Promise((res)=>{try{const band=document.querySelector('div[aria-label^=\"سررسیدهایِ امروز به تفکیک بانک\"]');if(!band){res('NO-BAND-2');return;}const btn=band.querySelector('button.today-bank-jump[aria-label^=\"پرش به تمرینِ خانوادهٔ واژه\u200cها\"]');if(!btn){res('NO-FAMILY-ROW');return;}btn.click();const t0=Date.now();const tick=()=>{try{const row=document.getElementById('wf-row-'+(window.__r432&&window.__r432.fam.table)+'-'+(window.__r432&&window.__r432.fam.idx));const dlg=document.querySelector('[role=\"dialog\"]');if(row&&row.className.includes('wf-row-pulse')&&!dlg){res('FAMILY-LANDED:true,dialogClosed:true,rowPulse:true,at:'+(Date.now()-t0));return;}if(Date.now()-t0>9000){res('FAMILY-MISS:row='+(!!row)+',pulse='+(row?row.className.includes('wf-row-pulse'):'-')+',dlg='+!!dlg);return;}setTimeout(tick,200);}catch(e){res('TICK-ERR:'+e.message);}};setTimeout(tick,300);}catch(e){res('OUTER-ERR:'+e.message);}});})()" | tee -a "$OUT"

echo "########## D) شب — hoverِ سطرِ پرش روی کرنلِ خانوادهٔ دروازههایِ کاغذ" | tee -a "$OUT"
agent-browser eval "(()=>{location.reload();return 'R';})()" >/dev/null 2>&1
sleep 4
qa_wait_home || { agent-browser close >/dev/null 2>&1; exit 1; }
agent-browser eval "$(cat /tmp/r432-bases.js)" >/dev/null 2>&1
qa_to_dark
probe "(()=>{window.dispatchEvent(new Event('open-report'));return 'REPORT-DARK';})()" >/dev/null 2>&1
sleep 2.5
probe "(()=>{try{const band=document.querySelector('div[aria-label^=\"سررسیدهایِ امروز به تفکیک بانک\"]');if(!band)return 'NO-BAND-DARK';const btn=band.querySelector('button.today-bank-jump');if(!btn)return 'NO-BTN-DARK';btn.dispatchEvent(new MouseEvent('mouseover',{bubbles:true}));const styleBtn=btn;return JSON.stringify({bandPresent:true,cls:styleBtn.className.includes('hover:text-teal-600'),note:'hover kernel = .report-paper .hover:text-teal-600 (globals r425) — same family, zero new selectors'});}catch(e){return 'DARK-ERR:'+e.message;}})()" | tee -a "$OUT"
qa_shot r432-bank-dues-dark.png
probe "(()=>{const band=document.querySelector('div[aria-label^=\"سررسیدهایِ امروز به تفکیک بانک\"]');if(!band)return 'NO-BAND-AFTER-DARK';const bg=getComputedStyle(band).backgroundColor;return JSON.stringify({veilDark:bg.slice(0,40)});})()" | tee -a "$OUT"

echo "########## E) روزِ تکبانکی — فهرست غایب، خانهٔ نوار پرش دارد" | tee -a "$OUT"
agent-browser eval "(()=>{location.reload();return 'R';})()" >/dev/null 2>&1
sleep 4
qa_wait_home || { agent-browser close >/dev/null 2>&1; exit 1; }
agent-browser eval "$(cat /tmp/r432-bases.js)" >/dev/null 2>&1
probe "(()=>{const KEY='vision2-study-v1';const raw=JSON.parse(localStorage.getItem(KEY)||'{\"state\":{}}');const iso=(d)=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');const ago=(n)=>iso(new Date(Date.now()-n*864e5));const m=window.__r432;raw.state.drillMistakes={'verbs':{[m.verb]:{wrong:2,ok:0,lastDay:ago(1),lastOkDay:''}}};localStorage.setItem(KEY,JSON.stringify(raw));location.reload();return 'SEEDED-SINGLE';})()" | tee -a "$OUT"
sleep 4
qa_wait_home || { agent-browser close >/dev/null 2>&1; exit 1; }
agent-browser eval "$(cat /tmp/r432-bases.js)" >/dev/null 2>&1
probe "(()=>{window.dispatchEvent(new Event('open-report'));return 'REPORT-SINGLE';})()" >/dev/null 2>&1
sleep 2.5
probe "(()=>{try{const band=document.querySelector('div[aria-label^=\"سررسیدهایِ امروز به تفکیک بانک\"]');const cellBtn=document.querySelector('.week-strip button[aria-label^=\"امروز\"]');return JSON.stringify({bandAbsent:!band,todayCellIsButton:!!cellBtn,cellAria:cellBtn?cellBtn.getAttribute('aria-label').slice(0,60):null});}catch(e){return 'SINGLE-ERR:'+e.message;}})()" | tee -a "$OUT"

echo "########## F) دفترِ DB — پرشهایِ این راند" | tee -a "$OUT"
node -e "const {PrismaClient}=require('@prisma/client');const db=new PrismaClient();db.eventDay.findFirst({where:{name:'drill_due_jump'}}).then((r)=>{console.log('LEDGER:',JSON.stringify(r?{name:r.name,count:r.count,day:r.day}:null));return db.\$disconnect();}).catch((e)=>{console.log('LEDGER-ERR:'+e.message);process.exit(0);})" 2>&1 | tee -a "$OUT"

agent-browser close >/dev/null 2>&1 || true
echo "########## WITNESS-DONE" | tee -a "$OUT"
