#!/usr/bin/env bash
# ------------------------------------------------------------------
# r439 — «شاهدِ در-بافتِ موبایل: چیپهایِ مشترک در چهار میزبان در بندِ ۳۹۰px»
# چهلوچهارمین مصرفکنندهٔ qa-lib.sh — ادامهٔ خانوادهٔ r438 + تکمیلِ نقشهٔ گپ.
# موتیف: r438 در-بافتِ سه میزبان را در ۱۲۸۰px داوری کرد و میزبانِ ضمیمه
#   (r419) همیشه در ۱۲۸۰ داوری شده. اما یادگیرندهٔ واقعی رویِ تلفن است —
#   سطرِ میزبان flex است (r438) و flex-wrap در سطر دیده نشده؛ دکمهٔ ورود +
#   سه چیپ در ۳۹۰px میتواند سرریزِ افقی بسازد. این شاهد هر چهار میزبان را
#   در بندِ موبایل داوری میکند: نشانه + گویش + کرنلِ دقیق (عینِ r437/r438)
#   + رفتارِ چیدمان (گپ/چرخش سطر/سرریزِ افقیِ سطر و سند).
# نقشهٔ گپِ چهارمیزبانی — کامل (r438 سه میزبان + میزبانِ ضمیمه که این راند
#   پیشِ چشم آموخت و پروبِ زودگذرش حذف شد — درسِ r437):
#   ضمیمه=۸px · vocab=۱۲px · dict=۸px · booklet=۶px — سطرها شفاف و flex.
# حکمِ موبایلِ این راند (شب و روشن، هر چهار میزبان):
#   · هیچ سرریزِ افقی — نه در سطر و نه در سند (rowOverX=false، docOverX=false)
#   · مکانیزمِ چرخش هر میزبان مالِ خودش: ضمیمه/vocab=nowrap (بیخطر —
#     پوشِ چیپ خودش flex-wrap دارد)، dict/booklet=wrap
#   · کرنل و گویش در موبایل عینِ r437/r438 — مستقل از بندِ نمایش
# دو درسِ ابزاریِ موبایل که اینجا اعمالاند:
#   · گاردِ بذر: نامِ یادگیرنده زیرِ ۴۲۰px از متنِ صفحه پنهان است
#     (header-resume-button: hidden … min-[420px]:inline) — گاردِ موبایل
#     نام را از RAWِ خودِ حالت (state.userName) میگیرد نه از متنِ پنهان
#   · ناوبری: «ضمیمه» در ناوبریِ دسکتاپ زیرِ ۴۲۰px نیست — درِ موبایلِ
#     ضمیمه، کارتِ «ضمیمهٔ کتاب» در شبکهٔ ابزارهای یادگیری است
# گویشهایِ aria — بنفش با اعدادِ خودِ میزبان، زمردی/آسمانی ثابتِ خانواده:
#   verbs         «پیشرفت این تمرین: ۳ جلسهٔ کامل، بهترین ۷۰٪»
#   lesson-vocab  «پیشرفت این تمرین: ۴ جلسهٔ کامل، بهترین ۸۰٪»
#   dict-vocab    «پیشرفت این تمرین: ۲ جلسهٔ کامل، بهترین ۵۵٪»
#   bg-examples   «پیشرفت این تمرین: ۵ جلسهٔ کامل، بهترین ۹۰٪»
# درسهایِ ابزاری که اینجا اعمالاند:
#   r414: هر پروبِ پسِ reload با qa_wait_home
#   r437: سریالها اول زنده آموخته، بعد قفل — کرنلهایِ چیپ از r437/r438
#         به فرضِ «مستقل از بندِ نمایش» میآیند و همینجا در موبایل محک
#         میخورند
# پایههایِ واقعیِ داده هرگز به پوسته نشت نمیکنند — از window.__r439.
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
OUT=/tmp/r439-mobile-host-context.txt
QA_SEED_FILE=/tmp/r439-witness-seed-eval.js
: > "$OUT"

source /home/z/my-project/scripts/qa-lib.sh

probe(){ agent-browser eval "$1" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

# درسِ r439 که از r440 به مالکِ کتابخانه رفت (qa_seed_guard_mobile):
# زیرِ ۴۲۰px نامِ یادگیرنده از متنِ صفحه پنهان است (hidden … min-[420px]:inline
# در header-resume-button) — گاردِ موبایل نام را از RAWِ حالت میخواند نه متنِ پنهان.

click_by_label(){ agent-browser eval "(()=>{let b=document.querySelector('[aria-label=\"$1\"]');if(!b||b.getBoundingClientRect().width===0){b=[...document.querySelectorAll('button')].find((x)=>(x.innerText||'').replace(/\s+/g,' ').trim()==='$1'&&x.getBoundingClientRect().width>0);}if(!b)return 'NO-BTN:$1';b.click();return 'CLICKED:$1';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

click_card(){ agent-browser eval "(()=>{const b=[...document.querySelectorAll('button')].find((x)=>(x.innerText||'').includes('$1')&&x.getBoundingClientRect().width>0);if(!b)return 'NO-BTN:$1';b.click();return 'CLICKED:$1';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

host_present(){ # $1 صحنه، $2 ariaِ دکمهٔ ورودِ میزبان
  probe "(()=>{const b=document.querySelector('[aria-label=\"$2\"]');if(!b||b.getBoundingClientRect().width===0)return 'NO-HOST-$1';return 'HOST-OK-$1';})()"
}

dialects_host(){ # $1 صحنه، $2 ariaِ بنفش، $3 متنِ بنفش
  probe "(()=>{const v=document.querySelector('[aria-label^=\"پیشرفت این تمرین\"]');const d=document.querySelector('[aria-label^=\"سررسیدهای مرور این تمرین\"]');const g=document.querySelector('[aria-label^=\"دورهٔ نفس این تمرین\"]');if(!v||!d||!g)return 'MISSING-$1:'+JSON.stringify({v:!!v,d:!!d,g:!!g});const ev='$2';const ed='سررسیدهای مرور این تمرین: ۱ مورد';const eg='دورهٔ نفس این تمرین: ۲ مورد در استراحت، نزدیکترین بازگشت ۱ روز دیگر';const errs=[];if((v.getAttribute('aria-label')||'')!==ev)errs.push('V-ARIA:'+v.getAttribute('aria-label'));if((d.getAttribute('aria-label')||'')!==ed)errs.push('D-ARIA:'+d.getAttribute('aria-label'));if((g.getAttribute('aria-label')||'')!==eg)errs.push('G-ARIA:'+g.getAttribute('aria-label'));const tv=(v.textContent||'').trim();const td=(d.textContent||'').trim();const tg=(g.textContent||'').trim();if(tv!=='$3')errs.push('V-TXT:'+tv);if(td!=='۱ سررسید')errs.push('D-TXT:'+td);if(tg!=='۲ درنفس')errs.push('G-TXT:'+tg);return errs.length?('FAIL-$1:'+errs.join('|')):'DIALECT-OK-$1';})()"
}

chip_identity(){ # $1 صحنه، $2 بنفش، $3 زمردی، $4 آسمانی — هر یک "bg|ink"
  probe "(()=>{const pick=(sel)=>{const el=document.querySelector(sel);if(!el)return null;const cs=getComputedStyle(el);return {bg:cs.backgroundColor,color:cs.color,font:cs.fontWeight};};const v=pick('[aria-label^=\"پیشرفت این تمرین\"]');const d=pick('[aria-label^=\"سررسیدهای مرور این تمرین\"]');const g=pick('[aria-label^=\"دورهٔ نفس این تمرین\"]');if(!v||!d||!g)return 'MISSING-$1';const errs=[];const want=[['V','$2'],['D','$3'],['G','$4']];const got={V:v,D:d,G:g};for(const [k,w] of want){const [bg,ink]=w.split('|');if(got[k].bg!==bg)errs.push(k+'-BG:'+got[k].bg);if(got[k].color!==ink)errs.push(k+'-INK:'+got[k].color);if(got[k].font!=='900')errs.push(k+'-FONT:'+got[k].font);}return errs.length?('FAIL-$1:'+errs.join('|')):'IDENTITY-OK-$1';})()"
}

# ---- چیدمانِ موبایل — قفلِ بیتْمَند: $1 صحنه، $2 گپ، $3 wrapِ موردِ انتظار
# (ضمیمه/vocab=nowrap، dict/booklet=wrap) + حکمِ سرریزِ صفر برای سطر و سند.
mobile_layout_lock(){ # $1 صحنه، $2 گپ، $3 wrap
  probe "(()=>{const chip=document.querySelector('[aria-label^=\"پیشرفت این تمرین\"]');if(!chip)return 'NO-CHIP-$1';const row=chip.parentElement.parentElement;const rcs=getComputedStyle(row);const doc=document.documentElement;const rowOver=row.scrollWidth>Math.ceil(row.clientWidth)+1;const docOver=doc.scrollWidth>window.innerWidth+1;const errs=[];if(rcs.gap!=='$2')errs.push('GAP:'+rcs.gap);if(rcs.flexWrap!=='$3')errs.push('WRAP:'+rcs.flexWrap);if(rowOver)errs.push('ROW-OVERX:'+row.scrollWidth+'>'+row.clientWidth);if(docOver)errs.push('DOC-OVERX:'+doc.scrollWidth+'>'+window.innerWidth);if(window.innerWidth!==390)errs.push('VW:'+window.innerWidth);return errs.length?('FAIL-$1:'+errs.join('|')):'MOBILE-OK-$1';})()"
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

echo "########## B) دادهٔ واقعی از خودِ داده (bun) — چهار بانک" | tee -a "$OUT"
bun -e '
const {irregularVerbs}=require("/home/z/my-project/src/data/appendix.ts");
const {lessons}=require("/home/z/my-project/src/data/index.ts");
const {BOOKLET_GRAMMAR_TOPICS}=require("/home/z/my-project/src/data/booklet-grammar.ts");
const {flattenBgExamples}=require("/home/z/my-project/src/lib/appendix-bg-example-drill.ts");
const verb=irregularVerbs.find((v)=>v.base&&v.fa).base;
const lv=lessons[0].vocabulary.find((w)=>w.en&&w.fa).en;
const dv=lessons[1].vocabulary.find((w)=>w.en&&w.fa).en;
const bg=flattenBgExamples(BOOKLET_GRAMMAR_TOPICS).find((e)=>e.en&&e.fa).en;
if(!verb||!lv||!dv||!bg){console.log("window.__r439={};\"BASES-INCOMPLETE\"");process.exit(0);}
console.log("window.__r439="+JSON.stringify({verb,lv,dv,bg})+";\"BASES-OK\"");
' > /tmp/r439-bases.js || { echo "BASES-FAIL" | tee -a "$OUT"; agent-browser close >/dev/null 2>&1; exit 1; }
agent-browser eval "$(cat /tmp/r439-bases.js)" | tee -a "$OUT"
echo | tee -a "$OUT"

echo "########## C) بذرِ چهار بانک — نردبانِ صادق + آمارِ متمایزِ هر میزبان" | tee -a "$OUT"
probe "(()=>{const KEY='vision2-study-v1';const raw=JSON.parse(localStorage.getItem(KEY)||'{\"state\":{}}');const iso=(d)=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');const today=iso(new Date());const yesterday=iso(new Date(Date.now()-864e5));const m=window.__r439;if(!m||!m.verb||!m.lv||!m.dv||!m.bg)return 'NO-BASES';const L=(base)=>({[base]:{wrong:2,ok:0,lastDay:yesterday,lastOkDay:''},[base+'-g1']:{wrong:2,ok:1,lastDay:yesterday,lastOkDay:today},[base+'-g2']:{wrong:3,ok:2,lastDay:'2026-10-01',lastOkDay:today},[base+'-m']:{wrong:1,ok:1,lastDay:yesterday,lastOkDay:yesterday},[base+'-n']:{wrong:1,ok:0,lastDay:today,lastOkDay:''}});raw.state.drillMistakes={'verbs':L(m.verb),'lesson-vocab':L(m.lv),'dict-vocab':L(m.dv),'bg-examples':L(m.bg)};raw.state.drillStats={'verbs':{sessions:3,correct:15,total:30,bestPercent:70,lastDay:yesterday},'lesson-vocab':{sessions:4,correct:20,total:40,bestPercent:80,lastDay:yesterday},'dict-vocab':{sessions:2,correct:11,total:20,bestPercent:55,lastDay:yesterday},'bg-examples':{sessions:5,correct:35,total:50,bestPercent:90,lastDay:yesterday}};localStorage.setItem(KEY,JSON.stringify(raw));location.reload();return 'SEEDED-FOUR:'+today;})()" | tee -a "$OUT"
sleep 4
qa_wait_home || { agent-browser close >/dev/null 2>&1; exit 1; }
agent-browser eval "$(cat /tmp/r439-bases.js)" >/dev/null 2>&1

echo "########## D) میزبانِ ۱ — ضمیمه/افعال (verbs) — گپِ آموختنیِ این راند" | tee -a "$OUT"
# مسیرِ موبایل (درسِ رانِ اول): «ضمیمه» در ناوبریِ دسکتاپ زیرِ ۴۲۰px نیست؛
# در home، کارتِ «ضمیمهٔ کتاب» شبکهٔ ابزارها درِ ضمیمه است.
click_card "ضمیمهٔ کتاب"; sleep 2.5
click_by_label "افعال بی‌قاعده"; sleep 2
host_present VERBS "شروع تمرین افعال بی‌قاعده"
echo "--- شبِ واقعی ---" | tee -a "$OUT"
qa_to_dark
probe "(()=>{return document.documentElement.classList.contains('dark')?'DARK-ON':'DARK-OFF';})()"
dialects_host VERBS-DARK "پیشرفت این تمرین: ۳ جلسهٔ کامل، بهترین ۷۰٪" "۳ جلسه · بهترین ۷۰٪"
chip_identity VERBS-DARK 'rgba(59, 40, 92, 0.35)|rgb(196, 181, 253)' 'rgba(6, 55, 40, 0.35)|rgb(110, 231, 183)' 'rgba(8, 47, 60, 0.45)|rgb(125, 211, 252)'
mobile_layout_lock VERBS-DARK "8px" nowrap
qa_shot r439-mobile-appendix-dark.png
echo "--- روشن ---" | tee -a "$OUT"
qa_to_light
sleep 1
dialects_host VERBS-LIGHT "پیشرفت این تمرین: ۳ جلسهٔ کامل، بهترین ۷۰٪" "۳ جلسه · بهترین ۷۰٪"
chip_identity VERBS-LIGHT 'lab(96.2416 2.28849 -5.51657)|lab(35.2783 67.9912 -88.793)' 'lab(97.8462 -6.94966 1.85487)|lab(44.4871 -41.0396 11.0361)' 'lab(97.3623 -2.33802 -4.13098)|lab(41.6013 -9.10804 -42.5647)'
mobile_layout_lock VERBS-LIGHT "8px" nowrap
qa_shot r439-mobile-appendix-light.png

echo "########## E) میزبانِ ۲ — vocab-tab (lesson-vocab)" | tee -a "$OUT"
agent-browser eval "(()=>{location.reload();return 'R';})()" >/dev/null 2>&1
sleep 4
qa_wait_home || { agent-browser close >/dev/null 2>&1; exit 1; }
agent-browser eval "$(cat /tmp/r439-bases.js)" >/dev/null 2>&1
click_by_label "ورود به درس"; sleep 2.5
host_present VOCAB "شروع تمرین واژگان درس"
echo "--- شبِ واقعی ---" | tee -a "$OUT"
qa_to_dark
dialects_host VOCAB-DARK "پیشرفت این تمرین: ۴ جلسهٔ کامل، بهترین ۸۰٪" "۴ جلسه · بهترین ۸۰٪"
chip_identity VOCAB-DARK 'rgba(59, 40, 92, 0.35)|rgb(196, 181, 253)' 'rgba(6, 55, 40, 0.35)|rgb(110, 231, 183)' 'rgba(8, 47, 60, 0.45)|rgb(125, 211, 252)'
mobile_layout_lock VOCAB-DARK "12px" nowrap
qa_shot r439-mobile-vocab-dark.png
echo "--- روشن ---" | tee -a "$OUT"
qa_to_light
sleep 1
dialects_host VOCAB-LIGHT "پیشرفت این تمرین: ۴ جلسهٔ کامل، بهترین ۸۰٪" "۴ جلسه · بهترین ۸۰٪"
chip_identity VOCAB-LIGHT 'lab(96.2416 2.28849 -5.51657)|lab(35.2783 67.9912 -88.793)' 'lab(97.8462 -6.94966 1.85487)|lab(44.4871 -41.0396 11.0361)' 'lab(97.3623 -2.33802 -4.13098)|lab(41.6013 -9.10804 -42.5647)'
mobile_layout_lock VOCAB-LIGHT "12px" nowrap
qa_shot r439-mobile-vocab-light.png

echo "########## F) میزبانِ ۳ — dictionary (dict-vocab)" | tee -a "$OUT"
agent-browser eval "(()=>{location.reload();return 'R';})()" >/dev/null 2>&1
sleep 4
qa_wait_home || { agent-browser close >/dev/null 2>&1; exit 1; }
agent-browser eval "$(cat /tmp/r439-bases.js)" >/dev/null 2>&1
click_card "دیکشنری جستجو"; sleep 2.5
host_present DICT "شروع تمرین واژگان دیکشنری"
echo "--- شبِ واقعی ---" | tee -a "$OUT"
qa_to_dark
dialects_host DICT-DARK "پیشرفت این تمرین: ۲ جلسهٔ کامل، بهترین ۵۵٪" "۲ جلسه · بهترین ۵۵٪"
chip_identity DICT-DARK 'rgba(59, 40, 92, 0.35)|rgb(196, 181, 253)' 'rgba(6, 55, 40, 0.35)|rgb(110, 231, 183)' 'rgba(8, 47, 60, 0.45)|rgb(125, 211, 252)'
mobile_layout_lock DICT-DARK "8px" wrap
qa_shot r439-mobile-dict-dark.png
echo "--- روشن ---" | tee -a "$OUT"
qa_to_light
sleep 1
dialects_host DICT-LIGHT "پیشرفت این تمرین: ۲ جلسهٔ کامل، بهترین ۵۵٪" "۲ جلسه · بهترین ۵۵٪"
chip_identity DICT-LIGHT 'lab(96.2416 2.28849 -5.51657)|lab(35.2783 67.9912 -88.793)' 'lab(97.8462 -6.94966 1.85487)|lab(44.4871 -41.0396 11.0361)' 'lab(97.3623 -2.33802 -4.13098)|lab(41.6013 -9.10804 -42.5647)'
mobile_layout_lock DICT-LIGHT "8px" wrap
qa_shot r439-mobile-dict-light.png

echo "########## G) میزبانِ ۴ — booklet-grammar (bg-examples)" | tee -a "$OUT"
agent-browser eval "(()=>{location.reload();return 'R';})()" >/dev/null 2>&1
sleep 4
qa_wait_home || { agent-browser close >/dev/null 2>&1; exit 1; }
agent-browser eval "$(cat /tmp/r439-bases.js)" >/dev/null 2>&1
click_card "ضمیمهٔ کتاب"; sleep 2.5
click_by_label "درسنامهٔ جامع"; sleep 2
host_present BOOKLET "شروع تمرین مثال‌های درسنامه"
echo "--- شبِ واقعی ---" | tee -a "$OUT"
qa_to_dark
dialects_host BOOKLET-DARK "پیشرفت این تمرین: ۵ جلسهٔ کامل، بهترین ۹۰٪" "۵ جلسه · بهترین ۹۰٪"
chip_identity BOOKLET-DARK 'rgba(59, 40, 92, 0.35)|rgb(196, 181, 253)' 'rgba(6, 55, 40, 0.35)|rgb(110, 231, 183)' 'rgba(8, 47, 60, 0.45)|rgb(125, 211, 252)'
mobile_layout_lock BOOKLET-DARK "6px" wrap
qa_shot r439-mobile-booklet-dark.png
echo "--- روشن ---" | tee -a "$OUT"
qa_to_light
sleep 1
dialects_host BOOKLET-LIGHT "پیشرفت این تمرین: ۵ جلسهٔ کامل، بهترین ۹۰٪" "۵ جلسه · بهترین ۹۰٪"
chip_identity BOOKLET-LIGHT 'lab(96.2416 2.28849 -5.51657)|lab(35.2783 67.9912 -88.793)' 'lab(97.8462 -6.94966 1.85487)|lab(44.4871 -41.0396 11.0361)' 'lab(97.3623 -2.33802 -4.13098)|lab(41.6013 -9.10804 -42.5647)'
mobile_layout_lock BOOKLET-LIGHT "6px" wrap
qa_shot r439-mobile-booklet-light.png

echo "########## H) دفترِ DB — این شاهد پرشی ندارد؛ دفترِ صادق" | tee -a "$OUT"
node -e "const {PrismaClient}=require('@prisma/client');const db=new PrismaClient();db.eventDay.findFirst({where:{name:'drill_due_jump'}}).then((r)=>{console.log('LEDGER:',JSON.stringify(r?{name:r.name,count:r.count,day:r.day}:null));return db.\$disconnect();}).catch((e)=>{console.log('LEDGER-ERR:'+e.message);process.exit(0);})" 2>&1 | tee -a "$OUT"

agent-browser close >/dev/null 2>&1 || true
echo "########## WITNESS-DONE" | tee -a "$OUT"
