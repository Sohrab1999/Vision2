#!/usr/bin/env bash
# ------------------------------------------------------------------
# r426 — «داوریِ هفت‌مسیرهٔ پرش» — سیاویکمین مصرفکنندهٔ qa-lib.sh.
# r425 فقط verbs و چندبانکی را زنده دید؛ این راند هر هفت مسیرِ لنگر
# را رویِ buildِ راند (تک سشن) زنده داوری میکند:
#   برایِ هر بانک: بذرِ یک سررسید واقعی از خودِ داده (bun) → reload →
#   کارنامه → دکمهٔ امروز باید عنوانِ همان بانک را بگوید → کلیک →
#   مقصد: دکمهٔ «شروع تمرین …»ِ همان میزبان + دیالوگِ کارنامه بسته.
#   verbs  → شروع تمرین افعال بی‌قاعده (لنگرِ سطرِ فعل — r234)
#   phonemes → شروع تمرین جدول تلفظ (لنگرِ کارتِ واک — r235)
#   words  → شروع تمرین خانوادهٔ واژه‌ها (لنگرِ جدولِ pos — r224)
#   abbrev → شروع تمرین نشانه‌های اختصاری (لنگرِ کارتِ نشانه — r235)
#   lesson-vocab → شروع تمرین واژگان درس (تبِ واژگانِ درسِ مالک — r407)
#   dict-vocab → شروع تمرین واژگان دیکشنری (نمایِ دیکشنری — r408)
#   bg-examples → شروع تمرین مثال‌های درسنامه (لنگرِ موضوع — r221/r406)
# درسِ r425: پروبهایِ نوار درونِ .week-strip دامنه دارند.
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
OUT=/tmp/r426-seven-paths-witness.txt
QA_SEED_FILE=/tmp/r426-seed-eval.js
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

echo "########## B) پایههایِ واقعیِ هفت بانک از خودِ داده (bun)" | tee -a "$OUT"
bun -e '
const {vowelPhonemes,consonantPhonemes,irregularVerbs,abbreviations}=require("/home/z/my-project/src/data/appendix.ts");
const {WORD_FAMILY_TABLES}=require("/home/z/my-project/src/data/word-families.ts");
const {lessons}=require("/home/z/my-project/src/data/index.ts");
const {BOOKLET_GRAMMAR_TOPICS}=require("/home/z/my-project/src/data/booklet-grammar.ts");
const {flattenBgExamples}=require("/home/z/my-project/src/lib/appendix-bg-example-drill.ts");
const sym=[...vowelPhonemes,...consonantPhonemes].find((x)=>x.symbol&&x.fa).symbol;
const verb=irregularVerbs.find((v)=>v.base&&v.fa).base;
const noun=WORD_FAMILY_TABLES[0].families.find((f)=>f.noun).noun;
const ab=abbreviations.find((a)=>a.sym&&a.fa).sym;
const lv=lessons[0].vocabulary.find((w)=>w.en&&w.fa).en;
const dv=lessons[1].vocabulary.find((w)=>w.en&&w.fa).en;
const bg=flattenBgExamples(BOOKLET_GRAMMAR_TOPICS).find((e)=>e.en&&e.fa).en;
console.log("window.__r426bases="+JSON.stringify({verbs:verb,phonemes:sym,words:noun,abbrev:ab,"lesson-vocab":lv,"dict-vocab":dv,"bg-examples":bg})+";\"BASES-OK:\"+Object.keys(window.__r426bases).length");
' > /tmp/r426-bases.js || { echo "BASES-FAIL" | tee -a "$OUT"; agent-browser close >/dev/null 2>&1; exit 1; }
agent-browser eval "$(cat /tmp/r426-bases.js)" | tee -a "$OUT"
echo | tee -a "$OUT"

# مسیرِ هر بانک: بانک، عنوانِ بانک (در ariaِ دکمهٔ پرش)، دکمهٔ «شروع تمرین»ِ میزبان
# درسِ این راند: reload پنجرهٔ جدید است — __r426bases باید پسِ هر reload دوباره
# تزریق شود، و هر مسیر با بازگشتِ خانه آغاز میشود (پرشِ مسیرِ قبل، نما را در میزبان رها میکند).
run_path(){
  local bank="$1" title="$2" btn="$3" shot="$4"
  echo "########## مسیرِ $bank → $btn" | tee -a "$OUT"
  agent-browser eval "(()=>{location.reload();return 'R';})()" >/dev/null 2>&1
  sleep 4
  qa_wait_home || { agent-browser close >/dev/null 2>&1; exit 1; }
  agent-browser eval "$(cat /tmp/r426-bases.js)" >/dev/null 2>&1
  sleep 1
  probe "(()=>{const KEY='vision2-study-v1';const raw=JSON.parse(localStorage.getItem(KEY)||'{\"state\":{}}');const iso=(d)=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');const ago=(n)=>iso(new Date(Date.now()-n*864e5));const b=window.__r426bases['$bank'];if(!b)return 'NO-BASE';raw.state.drillMistakes={'$bank':{[b]:{wrong:2,ok:0,lastDay:ago(1),lastOkDay:''}}};localStorage.setItem(KEY,JSON.stringify(raw));location.reload();return 'SEEDED:$bank:'+b;})()" | tee -a "$OUT"
  sleep 4
  qa_wait_home || { agent-browser close >/dev/null 2>&1; exit 1; }
  agent-browser eval "(()=>{window.dispatchEvent(new Event('open-report'));return 'OPENED';})()" >/dev/null 2>&1
  sleep 2.5
  probe "(()=>{const btn=document.querySelector('button[aria-label^=\"امروز — \"]');if(!btn)return 'NO-JUMP-BTN';const strip=btn.closest('.week-strip');const a=btn.getAttribute('aria-label');if(!a.includes('پرش به تمرینِ $title'))return 'WRONG-TARGET:'+a;if(!strip)return 'NO-STRIP';return 'READY:'+a;})()" | tee -a "$OUT"
  probe "(()=>{const btn=document.querySelector('button[aria-label^=\"امروز — \"]');if(!btn)return 'NO-BTN';btn.click();return 'CLICKED';})()" >/dev/null 2>&1
  sleep 3
  probe "(()=>{const dest=document.querySelector('[aria-label=\"$btn\"]');const dialogGone=!document.querySelector('.report-dialog');return JSON.stringify({landed:!!dest,reportDialogClosed:dialogGone});})()" | tee -a "$OUT"
  qa_shot "$shot"
}

run_path "verbs" "افعال بی‌قاعده" "شروع تمرین افعال بی‌قاعده" r426-path-verbs-light.png
run_path "phonemes" "جدول تلفظ" "شروع تمرین جدول تلفظ" r426-path-phonemes-light.png
run_path "words" "خانوادهٔ واژه‌ها" "شروع تمرین خانوادهٔ واژه‌ها" r426-path-words-light.png
run_path "abbrev" "نشانه‌های اختصاری" "شروع تمرین نشانه‌های اختصاری" r426-path-abbrev-light.png
run_path "lesson-vocab" "واژگان درس" "شروع تمرین واژگان درس" r426-path-lesson-vocab-light.png
run_path "dict-vocab" "واژگان دیکشنری" "شروع تمرین واژگان دیکشنری" r426-path-dict-vocab-light.png
run_path "bg-examples" "مثال‌های درسنامهٔ جامع" "شروع تمرین مثال‌های درسنامه" r426-path-bg-examples-light.png

echo "########## دفترِ DB — هفت پرشِ تازه رویِ حکابِ r425" | tee -a "$OUT"
node -e "const {PrismaClient}=require('@prisma/client');const db=new PrismaClient();db.eventDay.findFirst({where:{name:'drill_due_jump'}}).then((r)=>{console.log('LEDGER:',JSON.stringify(r?{name:r.name,count:r.count,day:r.day}:null));return db.\$disconnect();}).catch((e)=>{console.log('LEDGER-ERR:'+e.message);process.exit(0);})" 2>&1 | tee -a "$OUT"

agent-browser close >/dev/null 2>&1 || true
echo "########## WITNESS-DONE" | tee -a "$OUT"
