#!/usr/bin/env bash
# ------------------------------------------------------------------
# r431 — «رنگِ حلقهٔ خانواده» — سیاوششممصرفکنندهٔ qa-lib.sh.
# پیشنهادِ ①ِ r430: پالسهایِ خانواده تا دیروز فقط با «هندسه» تبرئه
#   شده بودند؛ این راند **رنگ**ِ حلقه (ringSeg) هر هفت پالسِ پرش
#   (سطرِ فعل/کارتِ واک/کارتِ نشانه/کارتِ واژه/سطرِ خانواده/کارتِ
#   دیکشنری/سطرِ مثالِ نوِ r431) را در روشن و شب داوری میکند —
#   رنگفضا-بیطرف (درسِ oklabِ r427): رنگِ استخراجشده از computed
#   boxShadow با canvas به RGB تبدیل و با رنگِ خانواده سنجیده میشود:
#   روشن = 110, 231, 183 (emerald-300) · شب = 4, 120, 87 (emerald-700/کرنل).
# کشفِ این راند — دزدِ هم-خاصیتیِ bg: سطرِ خانواده (wf-row-pulse) هنگام پالس
#   زبرا را حمل میکرد و در کامپایل، زبرا پسِ bg-emerald-50 میآمد (پالسِ روشن
#   دفن). ترمیم (جایگزین، نه اضافه) اینجا witnessed میشود: bgِ روشنِ
#   سطرِ خانواده باید 236, 253, 245 باشد — نه سفیدِ زبرا نه سنگِ زبرا.
# بندِ ②ِ r430 هم همینجاست: سطرِ مثالِ درسنامه (لنگرِ عمیقِ نو) با
#   RE-PULSE زنده داوری میشود (ایدئومِ r427/r430).
# درسهایِ ابزاریِ راندهایِ پیش که اینجا اعمالاند:
#   r427: پالس ۱٫۶ثانیهای است — کلیک + نظرسنجی + خواندنِ پسِ ۶۰۰ms در
#         یک Promise (پروبِ جداگانه کارتِ خاموش میخواند).
#   r426: پنجرهٔ JS با هر reload میمیرد — نقشهٔ پایهها دوباره تزریق
#         میشود؛ هر مسیر با بازگشتِ خانه (reload) آغاز میشود.
#   r428: پروبِ Promiseدار کاملاً گاردشده (try/catch درون و بیرونِ tick).
# پایههایِ واقعیِ داده هرگز به پوسته نشت نمیکنند — از window.__r431.
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
OUT=/tmp/r431-ring-color.txt
QA_SEED_FILE=/tmp/r431-seed-eval.js
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

echo "########## B) دادهٔ واقعی از خودِ بانکها (bun) — هفت پایه + شناسههایِ پایدارِ سطرها" | tee -a "$OUT"
bun -e '
const {irregularVerbs, vowelPhonemes, consonantPhonemes, abbreviations} = require("/home/z/my-project/src/data/appendix.ts");
const {lessons} = require("/home/z/my-project/src/data/index.ts");
const {WORD_FAMILY_TABLES, wordFamilyTableId} = require("/home/z/my-project/src/data/word-families.ts");
const {BOOKLET_GRAMMAR_TOPICS} = require("/home/z/my-project/src/data/booklet-grammar.ts");
const verb = irregularVerbs.find(v=>v.base&&v.fa).base;
const sym = [...vowelPhonemes, ...consonantPhonemes].find(p=>p.symbol&&p.fa).symbol;
const ab = abbreviations.find(a=>a.sym&&a.fa).sym;
const vocab = lessons[0].vocabulary.find(w=>w.en&&w.fa).en;
let fam = null;
for (const t of WORD_FAMILY_TABLES) {
  const fi = t.families.findIndex(f=>f.noun&&f.verb&&f.adjective&&f.adverb);
  if (fi >= 0) { fam = { row: `wf-row-${wordFamilyTableId(t)}-${fi}`, word: t.families[fi].noun }; break; }
}
const topic = BOOKLET_GRAMMAR_TOPICS.find(t=>(t.examples?.length??0)>=1);
const bgex = { row: `bg-ex-${topic.id}-0`, en: topic.examples[0].en };
const dict = lessons[2].vocabulary.find(w=>w.en&&w.fa).en;
if (!verb||!sym||!ab||!vocab||!fam||!topic||!dict) { console.log("window.__r431={};\"BASES-INCOMPLETE\""); process.exit(0); }
console.log("window.__r431="+JSON.stringify({verb,sym,ab,vocab,fam,bgex,dict})+";\"BASES-OK\"");
' > /tmp/r431-bases.js || { echo "BASES-FAIL" | tee -a "$OUT"; agent-browser close >/dev/null 2>&1; exit 1; }
agent-browser eval "$(cat /tmp/r431-bases.js)" | tee -a "$OUT"
echo | tee -a "$OUT"

# ---- داورِ رنگِ حلقه — برایِ یک بانک در یک حالت (شب یا روشن) ----
# $1 mode · $2 bank · $3 aria-fragment · $4 find-expr · $5 base-expr · $6 shot (خالی = بیشات)
run_ring(){
  local mode="$1" bank="$2" aria="$3" findExpr="$4" bexpr="$5" shot="${6:-}"
  echo "---------- پرشِ $bank → داوریِ رنگِ حلقه ($mode)" | tee -a "$OUT"
  agent-browser eval "(()=>{location.reload();return 'R';})()" >/dev/null 2>&1
  sleep 4
  qa_wait_home || { agent-browser close >/dev/null 2>&1; exit 1; }
  agent-browser eval "$(cat /tmp/r431-bases.js)" >/dev/null 2>&1
  if [ "$mode" = "dark" ]; then qa_to_dark; else qa_to_light; fi
  probe "(()=>{const KEY='vision2-study-v1';const raw=JSON.parse(localStorage.getItem(KEY)||'{\"state\":{}}');const iso=(d)=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');const ago=(n)=>iso(new Date(Date.now()-n*864e5));const b=($bexpr);if(!b)return 'NO-BASE';raw.state.drillMistakes={'$bank':{[b]:{wrong:2,ok:0,lastDay:ago(1),lastOkDay:''}}};localStorage.setItem(KEY,JSON.stringify(raw));location.reload();return 'SEEDED:$bank';})()" | tee -a "$OUT"
  sleep 4
  qa_wait_home || { agent-browser close >/dev/null 2>&1; exit 1; }
  agent-browser eval "$(cat /tmp/r431-bases.js)" >/dev/null 2>&1
  if [ "$mode" = "dark" ]; then qa_to_dark; else qa_to_light; fi
  probe "(()=>{window.dispatchEvent(new Event('open-report'));return 'REPORT-OPEN-$mode-$bank';})()" >/dev/null 2>&1
  sleep 2.5
  probe "(()=>{return new Promise((res)=>{try{
    const MODE='$mode'; const BANK='$bank'; const ARIA='$aria';
    const FIND=()=>($findExpr);
    const toRGB=(css)=>{try{const c=document.createElement('canvas');c.width=1;c.height=1;const x=c.getContext('2d');x.fillStyle='#000';x.fillStyle=css;x.fillRect(0,0,1,1);const d=x.getImageData(0,0,1,1).data;return d[0]+', '+d[1]+', '+d[2];}catch(e){return 'RGBERR:'+e.message;}};
    const btn=document.querySelector('.week-strip button[aria-label^=\"امروز\"]');
    if(!btn){res('NO-BTN-'+MODE+'-'+BANK);return;}
    const al=btn.getAttribute('aria-label')||'';
    if(al.indexOf(ARIA)<0){res('WRONG-TARGET-'+BANK+':'+al.slice(0,72));return;}
    btn.click();
    const t0=Date.now();
    const mk=(cls)=>{const d=document.createElement('div');d.className=cls;document.body.appendChild(d);return d;};
    const segOf=(el)=>{const s=getComputedStyle(el).boxShadow||'';return s.split(/, (?=[a-z(#])/).find(function(x){return x.indexOf('2px')>=0&&x.indexOf('inset')>=0;})||'';};
    const refL=mk('shadow-[inset_0_0_0_2px] shadow-emerald-300');
    const refRing=segOf(refL); // رنگِ مرجعِ خانواده در همین موتور و همین حالت — بیتعصبِ رنگفضا
    const refBgEl=mk('bg-emerald-50');
    const refBgEmerald=getComputedStyle(refBgEl).backgroundColor;
    const refBgW=mk('bg-white');
    const whiteBg=getComputedStyle(refBgW).backgroundColor;
    const refBgS=mk('bg-stone-50');
    const stoneBg=getComputedStyle(refBgS).backgroundColor;
    const refD=mk('shadow-[inset_0_0_0_2px] dark:shadow-emerald-700');
    const refRingDark=segOf(refD);
    const kEl=document.createElement('div');kEl.style.boxShadow='inset 0 0 0 2px rgb(4, 120, 87)';document.body.appendChild(kEl);
    const refKernel=segOf(kEl);
    [refL,refBgEl,refBgW,refBgS,refD,kEl].forEach(function(n){n.remove();});
    const judge=(el,foundAt)=>{try{
      const cs=getComputedStyle(el);
      const sh=cs.boxShadow||'';
      const seg=segOf(el);
      const ringGeom=seg.indexOf('0px 0px 0px 2px')>=0;
      const bg=cs.backgroundColor||'';
      const dlgGone=!document.querySelector('[role="dialog"]');
      const expectedRing=(MODE==='light')?refRing:(BANK==='words'?refKernel:refRingDark);
      if(MODE==='light'){
        if(ringGeom&&seg===refRing&&bg===refBgEmerald&&bg!==whiteBg&&bg!==stoneBg&&dlgGone){res(JSON.stringify({mode:MODE,bank:BANK,ring:'2px-inset',ringSeg:seg.slice(0,56),bgOK:true,dialogClosed:true,at:foundAt}));return true;}
        return false;
      }
      const alpha30=/0\.3\)/.test(bg)||bg.indexOf('0.3')>=0;
      const notStone=!(bg.indexOf('28, 25, 23')>=0||bg.indexOf('28,25,23')>=0);
      if(ringGeom&&seg===expectedRing&&alpha30&&notStone&&dlgGone){res(JSON.stringify({mode:MODE,bank:BANK,ring:'2px-inset',ringSeg:seg.slice(0,56),bg:bg.slice(0,44),dialogClosed:true,at:foundAt}));return true;}
      return false;
    }catch(e){res('READ-ERR-'+BANK+':'+e.message);return true;}};
    const tick=()=>{try{
      const el=FIND();
      if(el&&el.className&&el.className.includes('shadow-emerald-300')){
        const foundAt=Date.now()-t0;
        const tryReads=(offs)=>{if(!offs.length){const cs2=getComputedStyle(el);res('RING-MISS-'+BANK+':found@'+foundAt+',lastRead='+(Date.now()-t0)+',seg='+segOf(el).slice(0,56)+',bg='+cs2.backgroundColor.slice(0,40)+',refRing='+refRing.slice(0,44));return;}setTimeout(()=>{if(judge(el,foundAt))return;tryReads(offs.slice(1));},offs[0]);};
        tryReads([150,350,650,950]);
        return;
      }
      if(Date.now()-t0>9000){res('PULSE-MISS-'+BANK+':'+(el?('class='+el.className.slice(0,72)):'no-element'));return;}
      setTimeout(tick,200);
    }catch(e){res('TICK-ERR-'+BANK+':'+e.message);}};
    setTimeout(tick,300);
  }catch(e){res('OUTER-ERR:'+e.message);}});})()" | tee -a "$OUT"
  if [ -n "$shot" ]; then qa_shot "$shot"; fi
}

echo "########## C) فازِ روشن — رنگِ حلقهٔ هر هفت پالس (شاهدِ پایه + ترمیمِ زبرا)" | tee -a "$OUT"
run_ring light verbs      'پرش به تمرینِ افعال بی‌قاعده'      "document.getElementById('iv-row-'+(window.__r431&&window.__r431.verb))" "window.__r431.verb" r431-verb-row-light.png
run_ring light phonemes   'پرش به تمرینِ جدول تلفظ'           "document.getElementById('ph-'+(window.__r431&&window.__r431.sym))" "window.__r431.sym"
run_ring light abbrev     'پرش به تمرینِ نشانه‌های اختصاری'   "document.getElementById('ab-'+(window.__r431&&window.__r431.ab))" "window.__r431.ab"
run_ring light lesson-vocab 'پرش به تمرینِ واژگان درس'        "document.getElementById('vocab-row-'+((window.__r431&&window.__r431.vocab)||'').replace(/\\s+/g,'-'))" "window.__r431.vocab"
run_ring light words      'پرش به تمرینِ خانوادهٔ واژه‌ها'    "document.getElementById(window.__r431&&window.__r431.fam&&window.__r431.fam.row)" "window.__r431.fam.word" r431-family-row-light.png
run_ring light dict-vocab 'پرش به تمرینِ واژگان دیکشنری'      "Array.from(document.querySelectorAll('[data-dict-word]')).find(function(n){return window.__r431&&n.getAttribute('data-dict-word')===window.__r431.dict})" "window.__r431.dict"
run_ring light bg-examples 'پرش به تمرینِ مثال‌های درسنامهٔ جامع' "document.getElementById(window.__r431&&window.__r431.bgex&&window.__r431.bgex.row)" "window.__r431.bgex.en" r431-example-row-light.png

echo "########## D) فازِ شب — رنگِ حلقه در تاریکی (کرنلِ utility یا اسکوپشده)" | tee -a "$OUT"
run_ring dark verbs      'پرش به تمرینِ افعال بی‌قاعده'      "document.getElementById('iv-row-'+(window.__r431&&window.__r431.verb))" "window.__r431.verb"
run_ring dark phonemes   'پرش به تمرینِ جدول تلفظ'           "document.getElementById('ph-'+(window.__r431&&window.__r431.sym))" "window.__r431.sym"
run_ring dark abbrev     'پرش به تمرینِ نشانه‌های اختصاری'   "document.getElementById('ab-'+(window.__r431&&window.__r431.ab))" "window.__r431.ab"
run_ring dark lesson-vocab 'پرش به تمرینِ واژگان درس'        "document.getElementById('vocab-row-'+((window.__r431&&window.__r431.vocab)||'').replace(/\\s+/g,'-'))" "window.__r431.vocab"
run_ring dark words      'پرش به تمرینِ خانوادهٔ واژه‌ها'    "document.getElementById(window.__r431&&window.__r431.fam&&window.__r431.fam.row)" "window.__r431.fam.word" r431-family-row-dark.png
run_ring dark dict-vocab 'پرش به تمرینِ واژگان دیکشنری'      "Array.from(document.querySelectorAll('[data-dict-word]')).find(function(n){return window.__r431&&n.getAttribute('data-dict-word')===window.__r431.dict})" "window.__r431.dict"
run_ring dark bg-examples 'پرش به تمرینِ مثال‌های درسنامهٔ جامع' "document.getElementById(window.__r431&&window.__r431.bgex&&window.__r431.bgex.row)" "window.__r431.bgex.en" r431-example-row-dark.png

echo "########## E) پرشِ دوبارهٔ سطرِ مثال — مصرفِ لنگر زنده میماند (ایدئومِ r427/r430)" | tee -a "$OUT"
agent-browser eval "(()=>{location.reload();return 'R';})()" >/dev/null 2>&1
sleep 4
qa_wait_home || { agent-browser close >/dev/null 2>&1; exit 1; }
agent-browser eval "$(cat /tmp/r431-bases.js)" >/dev/null 2>&1
qa_to_light
probe "(()=>{window.dispatchEvent(new Event('open-report'));return 'REPORT-REOPEN';})()" >/dev/null 2>&1
sleep 2.5
probe "(()=>{return new Promise((res)=>{try{const btn=document.querySelector('.week-strip button[aria-label^=\"امروز\"]');if(!btn){res('NO-BTN-RE');return;}btn.click();const t0=Date.now();const FIND=()=>document.getElementById(window.__r431&&window.__r431.bgex&&window.__r431.bgex.row);const tick=()=>{try{const el=FIND();if(el&&el.className.includes('shadow-emerald-300')){res('RE-PULSE-OK');return;}if(Date.now()-t0>8000){res('RE-PULSE-MISS:'+(el?('class='+el.className.slice(0,64)):'no-element'));return;}setTimeout(tick,200);}catch(e){res('TICK-ERR:'+e.message);}};setTimeout(tick,300);}catch(e){res('OUTER-ERR:'+e.message);}});})()" | tee -a "$OUT"

echo "########## F) دفترِ DB — پرشهایِ این راند" | tee -a "$OUT"
node -e "const {PrismaClient}=require('@prisma/client');const db=new PrismaClient();db.eventDay.findFirst({where:{name:'drill_due_jump'}}).then((r)=>{console.log('LEDGER:',JSON.stringify(r?{name:r.name,count:r.count,day:r.day}:null));return db.\$disconnect();}).catch((e)=>{console.log('LEDGER-ERR:'+e.message);process.exit(0);})" 2>&1 | tee -a "$OUT"

agent-browser close >/dev/null 2>&1 || true
echo "########## WITNESS-DONE" | tee -a "$OUT"
