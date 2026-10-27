#!/usr/bin/env bash
# ------------------------------------------------------------------
# r438 — «شاهدِ در-بافت: چیپهایِ مشترکِ SRS در سه میزبانِ دیگر»
# چهلوسومین مصرفکنندهٔ qa-lib.sh — پیشنهادِ ①ِ r437.
# انگیزه: DrillStatChip مؤلفهٔ مشترکِ چهار میزبان است (ضمیمه/افعالِ r419 +
# vocab-tabِ r407 + dictionaryِ r408 + booklet-grammarِ r406). r437 کرنلهای
#   دقیقِ چیپ را فقط در میزبانِ ضمیمه داوری کرد. درسِ r435 (retargetِ
#   scopedِ `.dark .report-digest .c-veil-60`) ثابت کرد محیطِ میزبان
#   میتواند کرنلِ فرزند را تغییر دهد — پس «مؤلفهٔ مشترک = همین ظاهر در
#   همهجا» تا وقتی در-بافت witnessed نشده فقط فرض است.
# داوریِ ارزشِ این راند: هویتِ در-بافت یا اعلامِ زائد بودن — سه میزبانِ
#   دیگر، هر یک در شبِ واقعی و روشن، با:
#   ① نشانهٔ میزبان (دکمهٔ ورودِ خودِ هر میزبان با ariaِ یکتا)
#   ② گویشِ aria با اعدادِ خودِ میزبان (بنفشِ هر بانک جلسه/بهترینِ متفاوت)
#   ③ کرنلِ دقیقِ سه چیپ — فرضیه: عینِ سریالهایِ r437 (در-بافتِ بیتفاوت)
#   ④ کرنلِ سطرِ میزبان (پیشِ چشم آموخته میشود — درسِ r427/r433/r436)
#   ⑤ قراردادِ صفرِ r412 در-بافت: بیِ رکوردِ جلسه، حتی با بانکِ خطایِ زنده،
#     هیچ چیزی رندر نمیشود (صحنهٔ G — dictionary)
# گویشهایِ aria (r419) — بنفش با اعدادِ خودِ بانک:
#   lesson-vocab  «پیشرفت این تمرین: ۴ جلسهٔ کامل، بهترین ۸۰٪»
#   dict-vocab    «پیشرفت این تمرین: ۲ جلسهٔ کامل، بهترین ۵۵٪»
#   bg-examples   «پیشرفت این تمرین: ۵ جلسهٔ کامل، بهترین ۹۰٪»
#   زمردی ثابت «سررسیدهای مرور این تمرین: ۱ مورد» /
#   آسمانی ثابت «دورهٔ نفس این تمرین: ۲ مورد در استراحت، نزدیکترین بازگشت ۱ روز دیگر»
#   (نردبانِ صادقِ r419 در هر سه بانک: سررسید / درنفسِ فردا / درنفسِ +۲ /
#    مسلط / تازهٔ امروز — مسلط و تازه صادقانه شمرده نمیشوند: ۱ و ۲، نه ۲ و ۴)
# درسهایِ ابزاری که اینجا اعمالاند:
#   r414: هر پروبِ پسِ reload با qa_wait_home — بی آن اعتبار ندارد
#   r432: کلیدِ واژه فقط نشانهٔ شمارش است (zzz-unknown-base) — پسِ واقعی
#         از خودِ داده (lessons/flattenBgExamples) میآید؛ شیارهایِ نردبان
#         با پسوندِ -g1/-g2/-m/-n از همان پایه ساخته میشوند
#   r435: بوتِ دوفورکیِ سرور — پروسه با PPID=1؛ reaper نمیکشد
# پایههایِ واقعیِ داده هرگز به پوسته نشت نمیکنند — از window.__r438.
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
OUT=/tmp/r438-host-context-witness.txt
QA_SEED_FILE=/tmp/r438-witness-seed-eval.js
: > "$OUT"

source /home/z/my-project/scripts/qa-lib.sh

probe(){ agent-browser eval "$1" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

click_by_label(){ agent-browser eval "(()=>{let b=document.querySelector('[aria-label=\"$1\"]');if(!b||b.getBoundingClientRect().width===0){b=[...document.querySelectorAll('button')].find((x)=>(x.innerText||'').replace(/\s+/g,' ').trim()==='$1'&&x.getBoundingClientRect().width>0);}if(!b)return 'NO-BTN:$1';b.click();return 'CLICKED:$1';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

click_card(){ agent-browser eval "(()=>{const b=[...document.querySelectorAll('button')].find((x)=>(x.innerText||'').includes('$1')&&x.getBoundingClientRect().width>0);if(!b)return 'NO-BTN:$1';b.click();return 'CLICKED:$1';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

# ---- ① نشانهٔ میزبان: دکمهٔ ورودِ خودِ هر میزبان زنده و دیدنی ----
host_present(){ # $1 صحنه، $2 ariaِ دکمهٔ ورودِ میزبان
  probe "(()=>{const b=document.querySelector('[aria-label=\"$2\"]');if(!b||b.getBoundingClientRect().width===0)return 'NO-HOST-$1';return 'HOST-OK-$1:'+b.getAttribute('aria-label');})()"
}

# ---- ② گویشِ aria + متنِ دیدنی — بنفش با اعدادِ خودِ میزبان ----
dialects_host(){ # $1 صحنه، $2 ariaِ بنفش، $3 متنِ بنفش
  probe "(()=>{const v=document.querySelector('[aria-label^=\"پیشرفت این تمرین\"]');const d=document.querySelector('[aria-label^=\"سررسیدهای مرور این تمرین\"]');const g=document.querySelector('[aria-label^=\"دورهٔ نفس این تمرین\"]');if(!v||!d||!g)return 'MISSING-$1:'+JSON.stringify({v:!!v,d:!!d,g:!!g});const ev='$2';const ed='سررسیدهای مرور این تمرین: ۱ مورد';const eg='دورهٔ نفس این تمرین: ۲ مورد در استراحت، نزدیکترین بازگشت ۱ روز دیگر';const errs=[];if((v.getAttribute('aria-label')||'')!==ev)errs.push('V-ARIA:'+v.getAttribute('aria-label'));if((d.getAttribute('aria-label')||'')!==ed)errs.push('D-ARIA:'+d.getAttribute('aria-label'));if((g.getAttribute('aria-label')||'')!==eg)errs.push('G-ARIA:'+g.getAttribute('aria-label'));const tv=(v.textContent||'').trim();const td=(d.textContent||'').trim();const tg=(g.textContent||'').trim();if(tv!=='$3')errs.push('V-TXT:'+tv);if(td!=='۱ سررسید')errs.push('D-TXT:'+td);if(tg!=='۲ درنفس')errs.push('G-TXT:'+tg);return errs.length?('FAIL-$1:'+errs.join('|')):'DIALECT-OK-$1';})()"
}

# ---- ③ کرنلِ دقیقِ سه چیپ — فرضیه: عینِ سریالهایِ r437 در هر میزبان ----
chip_identity(){ # $1 صحنه، $2 بنفش، $3 زمردی، $4 آسمانی — هر یک "bg|ink"
  probe "(()=>{const pick=(sel)=>{const el=document.querySelector(sel);if(!el)return null;const cs=getComputedStyle(el);return {bg:cs.backgroundColor,color:cs.color,font:cs.fontWeight};};const v=pick('[aria-label^=\"پیشرفت این تمرین\"]');const d=pick('[aria-label^=\"سررسیدهای مرور این تمرین\"]');const g=pick('[aria-label^=\"دورهٔ نفس این تمرین\"]');if(!v||!d||!g)return 'MISSING-$1';const errs=[];const want=[['V','$2'],['D','$3'],['G','$4']];const got={V:v,D:d,G:g};for(const [k,w] of want){const [bg,ink]=w.split('|');if(got[k].bg!==bg)errs.push(k+'-BG:'+got[k].bg);if(got[k].color!==ink)errs.push(k+'-INK:'+got[k].color);if(got[k].font!=='900')errs.push(k+'-FONT:'+got[k].font);}return errs.length?('FAIL-$1:'+errs.join('|')):'IDENTITY-OK-$1';})()"
}

# ---- ④ قفلِ کرنلِ سطرِ میزبان — سریالها پیشِ چشم آموخته شدند (رانِ اول) و اینک قفلاند:
# هر سه سطر در شب و روز شفافاند (rgba(0, 0, 0, 0)) با display:flex — محیطِ
# واقعیِ هر میزبان چیزی جز فاصلهٔ سطر نیست: vocab=۱۲px / dict=۸px / booklet=۶px.
# هیچ retargetِ شبِ میزبانبهسطر چیپ را نمگیرد — در-بافتِ بیتفاوتیِ چیپ،
# از فرض به حکمِ witnessed رسید.
host_row_lock(){ # $1 صحنه، $2 گپِ موردِ انتظار
  probe "(()=>{const chip=document.querySelector('[aria-label^=\"پیشرفت این تمرین\"]');if(!chip)return 'NO-CHIP-$1';const wrap=chip.parentElement;const row=wrap.parentElement;const cs=getComputedStyle(row);const errs=[];if(cs.backgroundColor!=='rgba(0, 0, 0, 0)')errs.push('ROW-BG:'+cs.backgroundColor);if(cs.display!=='flex')errs.push('ROW-DISPLAY:'+cs.display);if(cs.gap!=='$2')errs.push('ROW-GAP:'+cs.gap);return errs.length?('FAIL-$1:'+errs.join('|')):'CONTEXT-OK-$1';})()"
}

# سریالهایِ قفلشدهٔ چیپها (r437) — فرضیهٔ در-بافتِ بیتفاوت:
#   شب: بنفش rgba(59, 40, 92, 0.35)|rgb(196, 181, 253) · زمردی rgba(6, 55, 40, 0.35)|rgb(110, 231, 183) · آسمانی rgba(8, 47, 60, 0.45)|rgb(125, 211, 252)
#   روز: بنفش lab(96.2416 2.28849 -5.51657)|lab(35.2783 67.9912 -88.793) · زمردی lab(97.8462 -6.94966 1.85487)|lab(44.4871 -41.0396 11.0361) · آسمانی lab(97.3623 -2.33802 -4.13098)|lab(41.6013 -9.10804 -42.5647)

echo "########## A) خانه — seed + پایهها" | tee -a "$OUT"
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

echo "########## B) دادهٔ واقعی از خودِ داده (bun)" | tee -a "$OUT"
bun -e '
const {lessons}=require("/home/z/my-project/src/data/index.ts");
const {BOOKLET_GRAMMAR_TOPICS}=require("/home/z/my-project/src/data/booklet-grammar.ts");
const {flattenBgExamples}=require("/home/z/my-project/src/lib/appendix-bg-example-drill.ts");
const lv=lessons[0].vocabulary.find((w)=>w.en&&w.fa).en;
const dv=lessons[1].vocabulary.find((w)=>w.en&&w.fa).en;
const bg=flattenBgExamples(BOOKLET_GRAMMAR_TOPICS).find((e)=>e.en&&e.fa).en;
if(!lv||!dv||!bg){console.log("window.__r438={};\"BASES-INCOMPLETE\"");process.exit(0);}
console.log("window.__r438="+JSON.stringify({lv,dv,bg})+";\"BASES-OK\"");
' > /tmp/r438-bases.js || { echo "BASES-FAIL" | tee -a "$OUT"; agent-browser close >/dev/null 2>&1; exit 1; }
agent-browser eval "$(cat /tmp/r438-bases.js)" | tee -a "$OUT"
echo | tee -a "$OUT"

echo "########## C) بذرِ سه بانک — نردبانِ صادقِ r419 + آمارِ متمایزِ هر میزبان" | tee -a "$OUT"
probe "(()=>{const KEY='vision2-study-v1';const raw=JSON.parse(localStorage.getItem(KEY)||'{\"state\":{}}');const iso=(d)=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');const today=iso(new Date());const yesterday=iso(new Date(Date.now()-864e5));const m=window.__r438;if(!m||!m.lv||!m.dv||!m.bg)return 'NO-BASES';const L=(base)=>({[base]:{wrong:2,ok:0,lastDay:yesterday,lastOkDay:''},[base+'-g1']:{wrong:2,ok:1,lastDay:yesterday,lastOkDay:today},[base+'-g2']:{wrong:3,ok:2,lastDay:'2026-10-01',lastOkDay:today},[base+'-m']:{wrong:1,ok:1,lastDay:yesterday,lastOkDay:yesterday},[base+'-n']:{wrong:1,ok:0,lastDay:today,lastOkDay:''}});raw.state.drillMistakes={'lesson-vocab':L(m.lv),'dict-vocab':L(m.dv),'bg-examples':L(m.bg)};raw.state.drillStats={'lesson-vocab':{sessions:4,correct:20,total:40,bestPercent:80,lastDay:yesterday},'dict-vocab':{sessions:2,correct:11,total:20,bestPercent:55,lastDay:yesterday},'bg-examples':{sessions:5,correct:35,total:50,bestPercent:90,lastDay:yesterday}};localStorage.setItem(KEY,JSON.stringify(raw));location.reload();return 'SEEDED-THREE:'+today;})()" | tee -a "$OUT"
sleep 4
qa_wait_home || { agent-browser close >/dev/null 2>&1; exit 1; }
agent-browser eval "$(cat /tmp/r438-bases.js)" >/dev/null 2>&1

echo "########## D) میزبانِ ۱ — vocab-tab (lesson-vocab)" | tee -a "$OUT"
click_by_label "ورود به درس"; sleep 2.5
host_present VOCAB "شروع تمرین واژگان درس"
echo "--- شبِ واقعی ---" | tee -a "$OUT"
qa_to_dark
probe "(()=>{return document.documentElement.classList.contains('dark')?'DARK-ON':'DARK-OFF';})()"
dialects_host VOCAB-DARK "پیشرفت این تمرین: ۴ جلسهٔ کامل، بهترین ۸۰٪" "۴ جلسه · بهترین ۸۰٪"
chip_identity VOCAB-DARK 'rgba(59, 40, 92, 0.35)|rgb(196, 181, 253)' 'rgba(6, 55, 40, 0.35)|rgb(110, 231, 183)' 'rgba(8, 47, 60, 0.45)|rgb(125, 211, 252)'
host_row_lock VOCAB-DARK "12px"
qa_shot r438-vocab-tab-dark.png
echo "--- روشن — پایهٔ همان داوری (سریالِ lab) ---" | tee -a "$OUT"
qa_to_light
sleep 1
dialects_host VOCAB-LIGHT "پیشرفت این تمرین: ۴ جلسهٔ کامل، بهترین ۸۰٪" "۴ جلسه · بهترین ۸۰٪"
chip_identity VOCAB-LIGHT 'lab(96.2416 2.28849 -5.51657)|lab(35.2783 67.9912 -88.793)' 'lab(97.8462 -6.94966 1.85487)|lab(44.4871 -41.0396 11.0361)' 'lab(97.3623 -2.33802 -4.13098)|lab(41.6013 -9.10804 -42.5647)'
host_row_lock VOCAB-LIGHT "12px"
qa_shot r438-vocab-tab-light.png

echo "########## E) میزبانِ ۲ — dictionary (dict-vocab)" | tee -a "$OUT"
agent-browser eval "(()=>{location.reload();return 'R';})()" >/dev/null 2>&1
sleep 4
qa_wait_home || { agent-browser close >/dev/null 2>&1; exit 1; }
agent-browser eval "$(cat /tmp/r438-bases.js)" >/dev/null 2>&1
click_card "دیکشنری جستجو"; sleep 2.5
host_present DICT "شروع تمرین واژگان دیکشنری"
echo "--- شبِ واقعی ---" | tee -a "$OUT"
qa_to_dark
probe "(()=>{return document.documentElement.classList.contains('dark')?'DARK-ON':'DARK-OFF';})()"
dialects_host DICT-DARK "پیشرفت این تمرین: ۲ جلسهٔ کامل، بهترین ۵۵٪" "۲ جلسه · بهترین ۵۵٪"
chip_identity DICT-DARK 'rgba(59, 40, 92, 0.35)|rgb(196, 181, 253)' 'rgba(6, 55, 40, 0.35)|rgb(110, 231, 183)' 'rgba(8, 47, 60, 0.45)|rgb(125, 211, 252)'
host_row_lock DICT-DARK "8px"
qa_shot r438-dict-dark.png
echo "--- روشن ---" | tee -a "$OUT"
qa_to_light
sleep 1
dialects_host DICT-LIGHT "پیشرفت این تمرین: ۲ جلسهٔ کامل، بهترین ۵۵٪" "۲ جلسه · بهترین ۵۵٪"
chip_identity DICT-LIGHT 'lab(96.2416 2.28849 -5.51657)|lab(35.2783 67.9912 -88.793)' 'lab(97.8462 -6.94966 1.85487)|lab(44.4871 -41.0396 11.0361)' 'lab(97.3623 -2.33802 -4.13098)|lab(41.6013 -9.10804 -42.5647)'
host_row_lock DICT-LIGHT "8px"
qa_shot r438-dict-light.png

echo "########## F) میزبانِ ۳ — booklet-grammar (bg-examples)" | tee -a "$OUT"
agent-browser eval "(()=>{location.reload();return 'R';})()" >/dev/null 2>&1
sleep 4
qa_wait_home || { agent-browser close >/dev/null 2>&1; exit 1; }
agent-browser eval "$(cat /tmp/r438-bases.js)" >/dev/null 2>&1
click_by_label "ضمیمه"; sleep 2.5
click_by_label "درسنامهٔ جامع"; sleep 2
host_present BOOKLET "شروع تمرین مثال‌های درسنامه"
echo "--- شبِ واقعی ---" | tee -a "$OUT"
qa_to_dark
probe "(()=>{return document.documentElement.classList.contains('dark')?'DARK-ON':'DARK-OFF';})()"
dialects_host BOOKLET-DARK "پیشرفت این تمرین: ۵ جلسهٔ کامل، بهترین ۹۰٪" "۵ جلسه · بهترین ۹۰٪"
chip_identity BOOKLET-DARK 'rgba(59, 40, 92, 0.35)|rgb(196, 181, 253)' 'rgba(6, 55, 40, 0.35)|rgb(110, 231, 183)' 'rgba(8, 47, 60, 0.45)|rgb(125, 211, 252)'
host_row_lock BOOKLET-DARK "6px"
qa_shot r438-booklet-dark.png
echo "--- روشن ---" | tee -a "$OUT"
qa_to_light
sleep 1
dialects_host BOOKLET-LIGHT "پیشرفت این تمرین: ۵ جلسهٔ کامل، بهترین ۹۰٪" "۵ جلسه · بهترین ۹۰٪"
chip_identity BOOKLET-LIGHT 'lab(96.2416 2.28849 -5.51657)|lab(35.2783 67.9912 -88.793)' 'lab(97.8462 -6.94966 1.85487)|lab(44.4871 -41.0396 11.0361)' 'lab(97.3623 -2.33802 -4.13098)|lab(41.6013 -9.10804 -42.5647)'
host_row_lock BOOKLET-LIGHT "6px"
qa_shot r438-booklet-light.png

echo "########## G) قراردادِ صفرِ r412 در-بافت — دیکشنری: آمارِ حذفشده، بانکِ خطا زنده" | tee -a "$OUT"
agent-browser eval "(()=>{location.reload();return 'R';})()" >/dev/null 2>&1
sleep 4
qa_wait_home || { agent-browser close >/dev/null 2>&1; exit 1; }
agent-browser eval "$(cat /tmp/r438-bases.js)" >/dev/null 2>&1
probe "(()=>{const KEY='vision2-study-v1';const raw=JSON.parse(localStorage.getItem(KEY)||'{\"state\":{}}');const n=Object.keys(raw.state.drillMistakes||{}).length;raw.state.drillStats={};localStorage.setItem(KEY,JSON.stringify(raw));return 'STATS-STRIPPED, mistakes banks kept:'+n;})()" | tee -a "$OUT"
sleep 2
agent-browser eval "(()=>{location.reload();return 'R';})()" >/dev/null 2>&1
sleep 4
qa_wait_home || { agent-browser close >/dev/null 2>&1; exit 1; }
agent-browser eval "$(cat /tmp/r438-bases.js)" >/dev/null 2>&1
click_card "دیکشنری جستجو"; sleep 2.5
host_present ZERO "شروع تمرین واژگان دیکشنری"
probe "(()=>{const v=document.querySelector('[aria-label^=\"پیشرفت این تمرین\"]');const d=document.querySelector('[aria-label^=\"سررسیدهای مرور این تمرین\"]');const g=document.querySelector('[aria-label^=\"دورهٔ نفس این تمرین\"]');const any=!!(v||d||g);return any?('ZERO-FAIL:'+JSON.stringify({v:!!v,d:!!d,g:!!g})):'ZERO-OK-NO-CHIPS';})()" | tee -a "$OUT"

echo "########## H) دفترِ DB — این شاهد پرشی ندارد؛ دفترِ صادق" | tee -a "$OUT"
node -e "const {PrismaClient}=require('@prisma/client');const db=new PrismaClient();db.eventDay.findFirst({where:{name:'drill_due_jump'}}).then((r)=>{console.log('LEDGER:',JSON.stringify(r?{name:r.name,count:r.count,day:r.day}:null));return db.\$disconnect();}).catch((e)=>{console.log('LEDGER-ERR:'+e.message);process.exit(0);})" 2>&1 | tee -a "$OUT"

agent-browser close >/dev/null 2>&1 || true
echo "########## WITNESS-DONE" | tee -a "$OUT"
