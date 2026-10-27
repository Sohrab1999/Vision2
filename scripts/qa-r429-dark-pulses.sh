#!/usr/bin/env bash
# ------------------------------------------------------------------
# r429 — «سوءظنِ نظاممندِ شب» — سیاوممصرفکنندهٔ qa-lib.sh.
# سه پالسِ پرشی که شبشان هنوز داوری نشده بود + داوریِ دوبارهٔ کارتِ واژه:
#   سطرِ فعلِ r234 (#iv-row-<base>) / کارتِ واکِ r235 (#ph-<symbol>) /
#   کارتِ نشانهٔ r235 (#ab-<sym>) / کارتِ واژهٔ r427 (#vocab-row-<en>)
# قراردادِ داوری — رنگفضا-بیطرف (درسِ oklabِ r427):
#   الفایِ «0.3» در bg + هندسهٔ «0px 0px 0px 2px» + inset در سایه +
#   کلاسِ پالس (shadow-emerald-300) + بیِ bg-white در رشتهٔ پالس.
#   فازِ روشن: bgِ جامد (بیِ الفای صفر) + کلاسِ bg-emerald-50.
# درسهایِ ابزاریِ راندهایِ پیش که اینجا اعمالاند:
#   r427: پالس ۱٫۶ثانیهای است — کلیک + نظرسنجی + خواندنِ پسِ ۶۰۰ms در
#         یک Promise (پروبِ جداگانه کارتِ خاموش میخواند).
#   r428: پروبِ Promiseدار کاملاً گاردشده (try/catch درون و بیرونِ tick)؛
#         پسِ هر reload نقشهٔ پایهها دوباره تزریق و تاریک دوباره روشن میشود.
#   r425: پروبهایِ نوار درونِ .week-strip دامنه دارند.
# شناسهٔ المانِ پالس درونِ مرورگر از window.__r429 ساخته میشود (idExpr) —
# پایههایِ واقعیِ داده هرگز به پوسته نشت نمیکنند.
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
OUT=/tmp/r429-dark-pulses.txt
QA_SEED_FILE=/tmp/r429-seed-eval.js
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
const {lessons}=require("/home/z/my-project/src/data/index.ts");
const sym=[...vowelPhonemes,...consonantPhonemes].find((x)=>x.symbol&&x.fa).symbol;
const verb=irregularVerbs.find((v)=>v.base&&v.fa).base;
const ab=abbreviations.find((a)=>a.sym&&a.fa).sym;
const lv=lessons[0].vocabulary.find((w)=>w.en&&w.fa).en;
console.log("window.__r429="+JSON.stringify({verbs:verb,phonemes:sym,abbrev:ab,"lesson-vocab":lv})+";\"BASES-OK:\"+JSON.stringify(window.__r429)");
' > /tmp/r429-bases.js || { echo "BASES-FAIL" | tee -a "$OUT"; agent-browser close >/dev/null 2>&1; exit 1; }
agent-browser eval "$(cat /tmp/r429-bases.js)" | tee -a "$OUT"
echo | tee -a "$OUT"

# ---- داورِ پالس — برایِ هر بانک: شب یا روشن ----
# پارامترها: bank / destTitle / idExpr (عبارتِ JSِ شناسهٔ المان) / mode / shot
run_pulse(){
  local bank="$1" title="$2" idExpr="$3" mode="$4" shot="$5"
  echo "---------- پالسِ $bank → ($mode)" | tee -a "$OUT"
  agent-browser eval "(()=>{location.reload();return 'R';})()" >/dev/null 2>&1
  sleep 4
  qa_wait_home || { agent-browser close >/dev/null 2>&1; exit 1; }
  agent-browser eval "$(cat /tmp/r429-bases.js)" >/dev/null 2>&1
  if [ "$mode" = "dark" ]; then qa_to_dark; else qa_to_light; fi
  probe "(()=>{const KEY='vision2-study-v1';const raw=JSON.parse(localStorage.getItem(KEY)||'{\"state\":{}}');const iso=(d)=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');const ago=(n)=>iso(new Date(Date.now()-n*864e5));const b=window.__r429['$bank'];if(!b)return 'NO-BASE';raw.state.drillMistakes={'$bank':{[b]:{wrong:2,ok:0,lastDay:ago(1),lastOkDay:''}}};localStorage.setItem(KEY,JSON.stringify(raw));location.reload();return 'SEEDED:$bank:'+b;})()" | tee -a "$OUT"
  sleep 4
  qa_wait_home || { agent-browser close >/dev/null 2>&1; exit 1; }
  agent-browser eval "$(cat /tmp/r429-bases.js)" >/dev/null 2>&1
  if [ "$mode" = "dark" ]; then qa_to_dark; else qa_to_light; fi
  probe "(()=>{window.dispatchEvent(new Event('open-report'));return 'REPORT-OPEN-$mode';})()" >/dev/null 2>&1
  sleep 2.5
  probe "(()=>{const btn=document.querySelector('.week-strip button[aria-label^=\"امروز\"]');if(!btn)return 'NO-JUMP-BTN';const a=btn.getAttribute('aria-label');if(!a.includes('پرش به تمرینِ $title'))return 'WRONG-TARGET:'+a;return 'READY:'+a;})()" | tee -a "$OUT"
  # تکپروبِ ترکیبی: کلیک + نظرسنجیِ پالس + خواندنِ پسِ ۶۰۰ms در یک Promise (درسِ r427)
  probe "(()=>{return new Promise((res)=>{try{const btn=document.querySelector('.week-strip button[aria-label^=\"امروز\"]');if(!btn){res('NO-BTN');return;}btn.click();const t0=Date.now();const elId=()=>$idExpr;const tick=()=>{try{const el=document.getElementById(elId());if(el&&el.className.includes('shadow-emerald-300')&&el.className.includes('bg-emerald-50')){setTimeout(()=>{try{const cs=getComputedStyle(el);const bg=cs.backgroundColor;const shadow=cs.boxShadow;const ringGeom=shadow.includes('inset')&&shadow.includes('0px 0px 0px 2px');const cls=el.className;const noBgWhite=!cls.includes('bg-white');if('$mode'==='dark'){const alpha30=/0\\.3\\)$/.test(bg);if(ringGeom&&alpha30&&noBgWhite){res(JSON.stringify({mode:'dark',pulse:true,bg:bg.slice(0,46),ring:'2px-inset',noBgWhite:true}));return;}if(Date.now()-t0>8000){res('DARK-KERNEL-MISS:ring='+ringGeom+',alpha30='+alpha30+',noBgWhite='+noBgWhite+',bg='+bg.slice(0,42));return;}}else{const solid=!/0\\)$/.test(bg)&&bg!=='transparent'&&bg!=='rgba(0, 0, 0, 0)';if(ringGeom&&solid&&noBgWhite){res(JSON.stringify({mode:'light',pulse:true,bg:bg.slice(0,46),ring:'2px-inset',noBgWhite:true}));return;}if(Date.now()-t0>8000){res('LIGHT-KERNEL-MISS:ring='+ringGeom+',solid='+solid+',bg='+bg.slice(0,42));return;}}}catch(e){res('READ-ERR:'+e.message);}},600);return;}if(Date.now()-t0>8000){const el2=document.getElementById(elId());res('PULSE-MISS:'+(el2?('class='+el2.className.slice(0,80)):'no-element'));return;}setTimeout(tick,200);}catch(e){res('TICK-ERR:'+e.message);}};setTimeout(tick,300);}catch(e){res('OUTER-ERR:'+e.message);}});})()" | tee -a "$OUT"
  qa_shot "$shot"
}

echo "########## C) شب — داوریِ چهار پالسِ پرش" | tee -a "$OUT"
run_pulse "verbs" "افعال بی‌قاعده" "('iv-row-'+window.__r429['verbs'])" dark r429-verb-pulse-dark.png
run_pulse "phonemes" "جدول تلفظ" "('ph-'+window.__r429['phonemes'])" dark r429-phoneme-pulse-dark.png
run_pulse "abbrev" "نشانه‌های اختصاری" "('ab-'+window.__r429['abbrev'])" dark r429-abbrev-pulse-dark.png
run_pulse "lesson-vocab" "واژگان درس" "('vocab-row-'+window.__r429['lesson-vocab'].replace(/\\s+/g,'-'))" dark r429-wordcard-pulse-dark.png

echo "########## D) روشن — داوریِ همان چهار پالس (شاهدِ پایه)" | tee -a "$OUT"
run_pulse "verbs" "افعال بی‌قاعده" "('iv-row-'+window.__r429['verbs'])" light r429-verb-pulse-light.png
run_pulse "phonemes" "جدول تلفظ" "('ph-'+window.__r429['phonemes'])" light r429-phoneme-pulse-light.png
run_pulse "abbrev" "نشانه‌های اختصاری" "('ab-'+window.__r429['abbrev'])" light r429-abbrev-pulse-light.png
run_pulse "lesson-vocab" "واژگان درس" "('vocab-row-'+window.__r429['lesson-vocab'].replace(/\\s+/g,'-'))" light r429-wordcard-pulse-light.png

echo "########## E) دفترِ DB — پرشهایِ این راند" | tee -a "$OUT"
node -e "const {PrismaClient}=require('@prisma/client');const db=new PrismaClient();db.eventDay.findFirst({where:{name:'drill_due_jump'}}).then((r)=>{console.log('LEDGER:',JSON.stringify(r?{name:r.name,count:r.count,day:r.day}:null));return db.\$disconnect();}).catch((e)=>{console.log('LEDGER-ERR:'+e.message);process.exit(0);})" 2>&1 | tee -a "$OUT"

agent-browser close >/dev/null 2>&1 || true
echo "########## WITNESS-DONE" | tee -a "$OUT"
