#!/usr/bin/env bash
# ------------------------------------------------------------------
# r428 — «لنگرِ سطریِ خانواده + شاهدِ تاریکِ هفت مقصد» — سیوسومین
# مصرفکنندهٔ qa-lib.sh. دو بندِ یک راند رویِ buildِ راند (تک سشن):
#   A) خانه + بذرِ persona + روشن
#   B) دادهٔ واقعی از خودِ بانکها (bun): واژهٔ خانواده + شناسهٔ جدول +
#      شاخصِ سطر (همان گاردِ عضویتِ چهار-سلولیِ ضمیمه) + پایهٔ هفت بانک
#   C) بندِ ② — روشن: بذرِ سررسیدِ words → کارنامه → کلیکِ خانهٔ امروز
#      («پرش به تمرینِ خانوادهٔ واژه‌ها») → نظرسنجیِ پالسِ سطرِ
#      wf-row-<tid>-<idx> (shadow-emerald-300) + میزبان زیرِ پا + شات
#   D) بندِ ② — شب: reload → تاریک → کلیکِ دوباره → تکپروبِ ترکیبیِ
#      رنگفضا-بیطرف (درسِ oklabِ r427): الفای «0.3» در bg + هندسهٔ
#      «0px 0px 0px 2px inset» در سایه + کلاسهایِ کرنل (روشنِ r234 +
#      wf-row-pulseِ اسکوپشدهٔ شب) + شات. درسِ تازهٔ همین راند: ریمپِ
#      سراسریِ .dark .bg-white بر utilityِ شب غلبه میکرد (زنده خوانده شد
#      rgb(28,25,23)) — کرنلِ شبِ سطر به globals اسکوپشده رفت.
#   E) بندِ ① — شاهدِ تاریکِ هفت مقصد: برایِ هر بانکِ هفگانه: بذرِ
#      سررسیدِ واقعی → کارنامه → کلیک → فرود در میزبانِ خودش در شب +
#      خواندنِ computed bg دکمهٔ «شروع تمرین …» (جامد — بیِ شفافیتِ
#      صفر) + شاتِ تاریکِ هر مسیر
#   F) دفترِ DB — drill_due_jump (ثبتِ صادقِ همهٔ کلیکها)
# درسِ r426: پسِ هر reload نقشهٔ پایهها دوباره تزریق و تاریک دوباره
# روشن میشود؛ درسِ r425: پروبهایِ نوار درونِ .week-strip دامنه دارند.
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
OUT=/tmp/r428-family-row-witness.txt
QA_SEED_FILE=/tmp/r428-seed-eval.js
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

echo "########## B) دادهٔ واقعی از خودِ بانکها (bun)" | tee -a "$OUT"
bun -e '
const {vowelPhonemes,consonantPhonemes,irregularVerbs,abbreviations}=require("/home/z/my-project/src/data/appendix.ts");
const {WORD_FAMILY_TABLES,wordFamilyTableId}=require("/home/z/my-project/src/data/word-families.ts");
const {lessons}=require("/home/z/my-project/src/data/index.ts");
const {BOOKLET_GRAMMAR_TOPICS}=require("/home/z/my-project/src/data/booklet-grammar.ts");
const {flattenBgExamples}=require("/home/z/my-project/src/lib/appendix-bg-example-drill.ts");
const sym=[...vowelPhonemes,...consonantPhonemes].find((x)=>x.symbol&&x.fa).symbol;
const verb=irregularVerbs.find((v)=>v.base&&v.fa).base;
const noun=WORD_FAMILY_TABLES[0].families.find((f)=>f.noun).noun;
let hit=null;
for(const t of WORD_FAMILY_TABLES){
  const i=t.families.findIndex((f)=>[f.noun,f.verb,f.adjective,f.adverb].includes(noun));
  if(i>=0){hit={noun,tid:wordFamilyTableId(t),idx:i};break;}
}
const ab=abbreviations.find((a)=>a.sym&&a.fa).sym;
const lv=lessons[0].vocabulary.find((w)=>w.en&&w.fa).en;
const dv=lessons[1].vocabulary.find((w)=>w.en&&w.fa).en;
const bg=flattenBgExamples(BOOKLET_GRAMMAR_TOPICS).find((e)=>e.en&&e.fa).en;
console.log("window.__r428="+JSON.stringify({row:hit,verbs:verb,phonemes:sym,words:noun,abbrev:ab,"lesson-vocab":lv,"dict-vocab":dv,"bg-examples":bg})+";\"BASES-OK:\"+window.__r428.row.noun+\"@\"+window.__r428.row.tid+\"#\"+window.__r428.row.idx");
' > /tmp/r428-bases.js || { echo "BASES-FAIL" | tee -a "$OUT"; agent-browser close >/dev/null 2>&1; exit 1; }
agent-browser eval "$(cat /tmp/r428-bases.js)" | tee -a "$OUT"
echo | tee -a "$OUT"

echo "########## C) روشن — بذرِ words → پرشِ خانهٔ امروز → پالسِ سطرِ خانواده" | tee -a "$OUT"
probe "(()=>{const KEY='vision2-study-v1';const raw=JSON.parse(localStorage.getItem(KEY)||'{\"state\":{}}');const iso=(d)=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');const ago=(n)=>iso(new Date(Date.now()-n*864e5));const w=window.__r428.words;raw.state.drillMistakes={'words':{[w]:{wrong:2,ok:0,lastDay:ago(1),lastOkDay:''}}};localStorage.setItem(KEY,JSON.stringify(raw));location.reload();return 'SEEDED:words:'+w;})()" | tee -a "$OUT"
sleep 4
qa_wait_home || { agent-browser close >/dev/null 2>&1; exit 1; }
agent-browser eval "$(cat /tmp/r428-bases.js)" >/dev/null 2>&1
sleep 1
probe "(()=>{window.dispatchEvent(new Event('open-report'));return 'REPORT-OPEN';})()" >/dev/null 2>&1
sleep 2.5
probe "(()=>{const btn=document.querySelector('.week-strip button[aria-label^=\"امروز\"]');if(!btn)return 'NO-JUMP-BTN';const a=btn.getAttribute('aria-label');if(!a.includes('پرش به تمرینِ خانوادهٔ واژه‌ها'))return 'WRONG-TARGET:'+a;return 'READY:'+a;})()" | tee -a "$OUT"
probe "(()=>{const btn=document.querySelector('.week-strip button[aria-label^=\"امروز\"]');if(!btn)return 'NO-BTN';btn.click();return 'CLICKED';})()" >/dev/null 2>&1
# نظرسنجیِ پالسِ سطر — درونِ پنجرهٔ ۱٫۶ثانیهای (درسِ r427)
probe "(()=>{const r=window.__r428.row;return new Promise((res)=>{const t0=Date.now();const tick=()=>{const el=document.getElementById('wf-row-'+r.tid+'-'+r.idx);if(el&&el.className.includes('shadow-emerald-300')){res('ROW-PULSE-OK:'+r.tid+'#'+r.idx);return;}if(Date.now()-t0>6000){res('ROW-PULSE-MISS:'+(el?'no-pulse':'no-row'));return;}setTimeout(tick,250);};tick();});})()" | tee -a "$OUT"
probe "(()=>{const dest=document.querySelector('[aria-label=\"شروع تمرین خانوادهٔ واژه‌ها\"]');const dialogGone=!document.querySelector('.report-dialog');const r=window.__r428.row;const row=!!document.getElementById('wf-row-'+r.tid+'-'+r.idx);return JSON.stringify({landed:!!dest,reportDialogClosed:dialogGone,rowLanded:row});})()" | tee -a "$OUT"
qa_shot r428-row-pulse-light.png

echo "########## D) شب — کرنلِ تاریکِ همان سطر (رنگفضا-بیطرف)" | tee -a "$OUT"
probe "(()=>{location.reload();return 'R';})()" >/dev/null 2>&1
sleep 4
qa_wait_home || { agent-browser close >/dev/null 2>&1; exit 1; }
agent-browser eval "$(cat /tmp/r428-bases.js)" >/dev/null 2>&1
qa_to_dark
probe "(()=>{window.dispatchEvent(new Event('open-report'));return 'REPORT-OPEN-DARK';})()" >/dev/null 2>&1
sleep 2.5
# تکپروبِ ترکیبی: کلیک + نظرسنجیِ پالس + خواندنِ پسِ ۶۰۰ms در یک Promise
probe "(()=>{return new Promise((res)=>{const btn=document.querySelector('.week-strip button[aria-label^=\"امروز\"]');if(!btn){res('NO-BTN');return;}btn.click();const r=(window.__r428||{}).row;if(!r){res('NO-ROWBASE');return;}const t0=Date.now();const tick=()=>{try{const el=document.getElementById('wf-row-'+r.tid+'-'+r.idx);if(el&&el.className.includes('wf-row-pulse')){setTimeout(()=>{try{const cs=getComputedStyle(el);const hasClass=el.className.includes('bg-emerald-50')&&el.className.includes('wf-row-pulse');const bg=cs.backgroundColor;const shadow=cs.boxShadow;const ring=shadow.indexOf('0px 0px 0px 2px inset')>=0;const alpha30=/0\.3\)$/.test(bg);if(ring&&alpha30){res(JSON.stringify({darkRow:hasClass,bg:bg.slice(0,44),innerRing:'2px-inset-oklab'}));return;}if(Date.now()-t0>8000){res('DARK-KERNEL-MISS:ring='+ring+',alpha30='+alpha30+',bg='+bg.slice(0,40));return;}}catch(e){res('READ-ERR:'+e.message);}},600);return;}if(Date.now()-t0>8000){res('DARK-PULSE-MISS');return;}setTimeout(tick,200);}catch(e){res('TICK-ERR:'+e.message);}};setTimeout(tick,300);});})()" | tee -a "$OUT"
qa_shot r428-row-pulse-dark.png

echo "########## E) شاهدِ تاریکِ هفت مقصد — هر بانک به میزبانِ خودش در شب" | tee -a "$OUT"
run_path(){
  local bank="$1" title="$2" btn="$3" shot="$4"
  echo "---------- مسیرِ $bank → $btn (شب)" | tee -a "$OUT"
  agent-browser eval "(()=>{location.reload();return 'R';})()" >/dev/null 2>&1
  sleep 4
  qa_wait_home || { agent-browser close >/dev/null 2>&1; exit 1; }
  agent-browser eval "$(cat /tmp/r428-bases.js)" >/dev/null 2>&1
  qa_to_dark
  probe "(()=>{const KEY='vision2-study-v1';const raw=JSON.parse(localStorage.getItem(KEY)||'{\"state\":{}}');const iso=(d)=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');const ago=(n)=>iso(new Date(Date.now()-n*864e5));const b=window.__r428['$bank'];if(!b)return 'NO-BASE';raw.state.drillMistakes={'$bank':{[b]:{wrong:2,ok:0,lastDay:ago(1),lastOkDay:''}}};localStorage.setItem(KEY,JSON.stringify(raw));location.reload();return 'SEEDED:$bank:'+b;})()" | tee -a "$OUT"
  sleep 4
  qa_wait_home || { agent-browser close >/dev/null 2>&1; exit 1; }
  agent-browser eval "$(cat /tmp/r428-bases.js)" >/dev/null 2>&1
  qa_to_dark
  probe "(()=>{window.dispatchEvent(new Event('open-report'));return 'OPENED';})()" >/dev/null 2>&1
  sleep 2.5
  probe "(()=>{const btn=document.querySelector('.week-strip button[aria-label^=\"امروز\"]');if(!btn)return 'NO-JUMP-BTN';const a=btn.getAttribute('aria-label');if(!a.includes('پرش به تمرینِ $title'))return 'WRONG-TARGET:'+a;return 'READY:'+a;})()" | tee -a "$OUT"
  probe "(()=>{const btn=document.querySelector('.week-strip button[aria-label^=\"امروز\"]');if(!btn)return 'NO-BTN';btn.click();return 'CLICKED';})()" >/dev/null 2>&1
  sleep 3
  probe "(()=>{const dest=document.querySelector('[aria-label=\"$btn\"]');const dialogGone=!document.querySelector('.report-dialog');if(!dest)return JSON.stringify({landed:false,reportDialogClosed:dialogGone});const cs=getComputedStyle(dest);const bg=cs.backgroundColor;const solid=bg!=='transparent'&&!/,\s*0\)$/.test(bg)&&!/\/\s*0\)$/.test(bg);return JSON.stringify({landed:true,reportDialogClosed:dialogGone,kernelBg:bg.slice(0,44),solid});})()" | tee -a "$OUT"
  qa_shot "$shot"
}
run_path "verbs" "افعال بی‌قاعده" "شروع تمرین افعال بی‌قاعده" r428-path-verbs-dark.png
run_path "phonemes" "جدول تلفظ" "شروع تمرین جدول تلفظ" r428-path-phonemes-dark.png
run_path "words" "خانوادهٔ واژه‌ها" "شروع تمرین خانوادهٔ واژه‌ها" r428-path-words-dark.png
run_path "abbrev" "نشانه‌های اختصاری" "شروع تمرین نشانه‌های اختصاری" r428-path-abbrev-dark.png
run_path "lesson-vocab" "واژگان درس" "شروع تمرین واژگان درس" r428-path-lesson-vocab-dark.png
run_path "dict-vocab" "واژگان دیکشنری" "شروع تمرین واژگان دیکشنری" r428-path-dict-vocab-dark.png
run_path "bg-examples" "مثال‌های درسنامهٔ جامع" "شروع تمرین مثال‌های درسنامه" r428-path-bg-examples-dark.png

echo "########## F) دفترِ DB — پرشهایِ این راند" | tee -a "$OUT"
node -e "const {PrismaClient}=require('@prisma/client');const db=new PrismaClient();db.eventDay.findFirst({where:{name:'drill_due_jump'}}).then((r)=>{console.log('LEDGER:',JSON.stringify(r?{name:r.name,count:r.count,day:r.day}:null));return db.\$disconnect();}).catch((e)=>{console.log('LEDGER-ERR:'+e.message);process.exit(0);})" 2>&1 | tee -a "$OUT"

agent-browser close >/dev/null 2>&1 || true
echo "########## WITNESS-DONE" | tee -a "$OUT"
