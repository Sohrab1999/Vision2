#!/usr/bin/env bash
# ------------------------------------------------------------------
# r430 — «لنگرِ واژهٔ دیکشنری» — سیا و پنجممصرفکنندهٔ qa-lib.sh.
# هفتمین مسیرِ پرش عمیق میشود: dict-vocab دیگر فرودِ بی‌لنگر نیست —
#   عدسیِ جست‌وجو (سقفِ ۳۰۰تایی را دور میزند) + کارتِ واژه با پالسِ
#   هستهٔ r234 + مصرفِ لنگر (پرشِ دوباره پالسِ تازه میزند — r427).
# قراردادِ داوری — رنگفضا-بیطرف (درسِ oklabِ r427):
#   الفایِ «0.3» در bg (شب) + هندسهٔ «0px 0px 0px 2px» + inset در سایه +
#   کلاسِ پالس (shadow-emerald-300) + بیِ bg-white در رشتهٔ پالس.
#   فازِ روشن: bgِ جامد (بیِ الفای صفر) + کلاسِ bg-emerald-50.
# بندِ ②ِ پیشنهادهایِ r429 هم همینجاست: شاهدِ زندهٔ تاریکِ پالسِ
#   انتخابِ srs-panel (عضوِ ششمِ سرشماری که فقط ایستا داوری شده بود) —
#   از راهِ واقعیِ کاربر: چیپِ کارتِ خطرِ خانه (focusSrsDashboard).
# درسهایِ ابزاریِ راندهایِ پیش که اینجا اعمالاند:
#   r427: پالس ۱٫۶ثانیهای است — کلیک + نظرسنجی + خواندنِ پسِ ۶۰۰ms در
#         یک Promise (پروبِ جداگانه کارتِ خاموش میخواند).
#   r428: پروبِ Promiseدار کاملاً گاردشده (try/catch درون و بیرونِ tick)؛
#         پسِ هر reload نقشهٔ پایهها دوباره تزریق و تاریک دوباره روشن میشود.
#   r425: پروبهایِ نوار درونِ .week-strip دامنه دارند.
# پایههایِ واقعیِ داده هرگز به پوسته نشت نمیکنند — از window.__r430.
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
OUT=/tmp/r430-dict-word-anchor.txt
QA_SEED_FILE=/tmp/r430-seed-eval.js
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

echo "########## B) دادهٔ واقعی از خودِ بانکها (bun) — واژهٔ فراسقفِ درسِ سوم" | tee -a "$OUT"
bun -e '
const {lessons}=require("/home/z/my-project/src/data/index.ts");
const flat=lessons.flatMap((l)=>l.vocabulary.map((w)=>({lessonId:l.id,en:w.en})));
const deep=lessons[2].vocabulary.find((w)=>w.en&&w.fa).en;
const idx=flat.findIndex((w)=>w.lessonId===lessons[2].id);
if(idx<300){console.log("window.__r430="+JSON.stringify({dict:deep})+";\"DEEP-NOT-BEYOND-CAP:"+idx+"\"");process.exit(0);}
console.log("window.__r430="+JSON.stringify({dict:deep})+";\"BASES-OK:index:\"+"+idx);
' > /tmp/r430-bases.js || { echo "BASES-FAIL" | tee -a "$OUT"; agent-browser close >/dev/null 2>&1; exit 1; }
agent-browser eval "$(cat /tmp/r430-bases.js)" | tee -a "$OUT"
echo | tee -a "$OUT"

# ---- داورِ پرش — برایِ یک حالت: شب یا روشن ----
run_jump(){
  local mode="$1" shot="$2" tag="$3"
  echo "---------- پرشِ دیکشنری → ($mode / $tag)" | tee -a "$OUT"
  agent-browser eval "(()=>{location.reload();return 'R';})()" >/dev/null 2>&1
  sleep 4
  qa_wait_home || { agent-browser close >/dev/null 2>&1; exit 1; }
  agent-browser eval "$(cat /tmp/r430-bases.js)" >/dev/null 2>&1
  if [ "$mode" = "dark" ]; then qa_to_dark; else qa_to_light; fi
  probe "(()=>{const KEY='vision2-study-v1';const raw=JSON.parse(localStorage.getItem(KEY)||'{\"state\":{}}');const iso=(d)=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');const ago=(n)=>iso(new Date(Date.now()-n*864e5));const b=window.__r430['dict'];if(!b)return 'NO-BASE';raw.state.drillMistakes={'dict-vocab':{[b]:{wrong:2,ok:0,lastDay:ago(1),lastOkDay:''}}};localStorage.setItem(KEY,JSON.stringify(raw));location.reload();return 'SEEDED:'+b;})()" | tee -a "$OUT"
  sleep 4
  qa_wait_home || { agent-browser close >/dev/null 2>&1; exit 1; }
  agent-browser eval "$(cat /tmp/r430-bases.js)" >/dev/null 2>&1
  if [ "$mode" = "dark" ]; then qa_to_dark; else qa_to_light; fi
  probe "(()=>{window.dispatchEvent(new Event('open-report'));return 'REPORT-OPEN-$mode-$tag';})()" >/dev/null 2>&1
  sleep 2.5
  # تکپروبِ ترکیبی: گاردِ دکمه + کلیک + نظرسنجیِ عدسی/پالس/دیالوگ + خواندنِ پسِ ۶۰۰ms در یک Promise (درسِ r427)
  probe "(()=>{return new Promise((res)=>{try{const btn=document.querySelector('.week-strip button[aria-label^=\"امروز\"]');if(!btn){res('NO-BTN');return;}const a=btn.getAttribute('aria-label');if(!a.includes('پرش به تمرینِ واژگان دیکشنری')){res('WRONG-TARGET:'+a);return;}btn.click();const t0=Date.now();const find=()=>Array.from(document.querySelectorAll('[data-dict-word]')).find((n)=>n.getAttribute('data-dict-word')===(window.__r430&&window.__r430['dict']));const tick=()=>{try{const el=find();const inp=document.querySelector('input[placeholder^=\"مثلاً\"]');if(el&&el.className.includes('shadow-emerald-300')&&el.className.includes('bg-emerald-50')&&inp&&inp.value===(window.__r430&&window.__r430['dict'])){setTimeout(()=>{try{const cs=getComputedStyle(el);const bg=cs.backgroundColor;const shadow=cs.boxShadow;const ringGeom=shadow.includes('inset')&&shadow.includes('0px 0px 0px 2px');const cls=el.className;const noBgWhite=!cls.includes('bg-white');const dlgGone=!document.querySelector('[role=\"dialog\"]');if('$mode'==='dark'){const alpha30=/0\\.3\\)$/.test(bg);if(ringGeom&&alpha30&&noBgWhite&&dlgGone){res(JSON.stringify({mode:'dark',tag:'$tag',pulse:true,lens:true,dialogClosed:true,bg:bg.slice(0,46),ring:'2px-inset',noBgWhite:true}));return;}if(Date.now()-t0>9000){res('DARK-KERNEL-MISS:ring='+ringGeom+',alpha30='+alpha30+',noBgWhite='+noBgWhite+',dlg='+dlgGone+',bg='+bg.slice(0,42));return;}}else{const solid=!/0\\)$/.test(bg)&&bg!=='transparent'&&bg!=='rgba(0, 0, 0, 0)';if(ringGeom&&solid&&noBgWhite&&dlgGone){res(JSON.stringify({mode:'light',tag:'$tag',pulse:true,lens:true,dialogClosed:true,bg:bg.slice(0,46),ring:'2px-inset',noBgWhite:true}));return;}if(Date.now()-t0>9000){res('LIGHT-KERNEL-MISS:ring='+ringGeom+',solid='+solid+',noBgWhite='+noBgWhite+',dlg='+dlgGone+',bg='+bg.slice(0,42));return;}}}catch(e){res('READ-ERR:'+e.message);}},600);return;}if(Date.now()-t0>9000){const el2=find();res('PULSE-MISS:'+(el2?('class='+el2.className.slice(0,80)):'no-element')+',inp='+(inp?inp.value.slice(0,24):'none'));return;}setTimeout(tick,200);}catch(e){res('TICK-ERR:'+e.message);}};setTimeout(tick,300);}catch(e){res('OUTER-ERR:'+e.message);}});})()" | tee -a "$OUT"
  qa_shot "$shot"
}

echo "########## C) روشن — عدسی + پالسِ کارتِ واژهٔ دیکشنری (شاهدِ پایه)" | tee -a "$OUT"
run_jump light r430-dict-pulse-light.png first

echo "########## D) شب — کرنلِ تاریکِ همان لنگر (رنگفضا-بیطرف)" | tee -a "$OUT"
run_jump dark r430-dict-pulse-dark.png dark

echo "########## E) پرشِ دوباره — مصرفِ لنگر زنده میماند (ایدئومِ r427)" | tee -a "$OUT"
agent-browser eval "(()=>{location.reload();return 'R';})()" >/dev/null 2>&1
sleep 4
qa_wait_home || { agent-browser close >/dev/null 2>&1; exit 1; }
agent-browser eval "$(cat /tmp/r430-bases.js)" >/dev/null 2>&1
qa_to_dark
probe "(()=>{window.dispatchEvent(new Event('open-report'));return 'REPORT-REOPEN';})()" >/dev/null 2>&1
sleep 2.5
probe "(()=>{return new Promise((res)=>{try{const btn=document.querySelector('.week-strip button[aria-label^=\"امروز\"]');if(!btn){res('NO-BTN-RE');return;}btn.click();const t0=Date.now();const find=()=>Array.from(document.querySelectorAll('[data-dict-word]')).find((n)=>n.getAttribute('data-dict-word')===(window.__r430&&window.__r430['dict']));const tick=()=>{try{const el=find();if(el&&el.className.includes('shadow-emerald-300')){res('RE-PULSE-OK');return;}if(Date.now()-t0>8000){res('RE-PULSE-MISS:'+(el?('class='+el.className.slice(0,60)):'no-element'));return;}setTimeout(tick,200);}catch(e){res('TICK-ERR:'+e.message);}};setTimeout(tick,300);}catch(e){res('OUTER-ERR:'+e.message);}});})()" | tee -a "$OUT"

echo "########## F) شاهدِ زندهٔ پالسِ srs-panel (بندِ ②ِ r429 — عضوِ ششمِ سرشماری) — روشن و شب" | tee -a "$OUT"
agent-browser eval "(()=>{location.reload();return 'R';})()" >/dev/null 2>&1
sleep 4
qa_wait_home || { agent-browser close >/dev/null 2>&1; exit 1; }
# F-1 روشن: با قراردادِ «جایگزین، نه اضافه» (shadow-sm فقط در شاخهٔ بی‌پالس)
# حلقهٔ لایهای باید زنده باشد — و رنگش emerald-300 (تزریقِ --tw-shadow-color)
qa_to_light
probe "(()=>{const chip=document.querySelector('button[aria-label^=\"پرش به داشبوردِ مرور هوشمند\"]');if(!chip)return 'NO-DANGER-CHIP — کارتِ خطر در این شخصیت رندر نشده (سکوتِ صادق)';chip.click();return 'DANGER-CHIP-CLICKED-LIGHT';})()" | tee -a "$OUT"
sleep 1
probe "(()=>{const p=document.getElementById('srs-dashboard');if(!p)return 'NO-PANEL';const cs=getComputedStyle(p);const sh=cs.boxShadow;const ringSeg=(sh.split(',').find((s)=>s.includes('inset'))||'').trim();return JSON.stringify({mode:'light',spotlit:p.getAttribute('data-spotlit'),ring:sh.includes('inset')&&sh.includes('0px 0px 0px 2px'),ringSeg:ringSeg.slice(0,60)});})()" | tee -a "$OUT"
qa_shot r430-srs-panel-spot-light.png
sleep 2.2
probe "(()=>{const p=document.getElementById('srs-dashboard');if(!p)return 'NO-PANEL-AFTER';return JSON.stringify({mode:'light',spotlitAfter:p.getAttribute('data-spotlit')});})()" | tee -a "$OUT"
# F-2 شب: بدونِ shadow-sm در رشتهٔ پالس، ریمپِ سراسریِ .dark .shadow-sm قلاب ندارد —
# حلقهٔ شب از dark:shadow-emerald-600ِ لایهای میآید (رنگِ rgb(5,150,105) خانواده)
qa_to_dark
probe "(()=>{const chip=document.querySelector('button[aria-label^=\"پرش به داشبوردِ مرور هوشمند\"]');if(!chip)return 'NO-DANGER-CHIP';chip.click();return 'DANGER-CHIP-CLICKED-DARK';})()" | tee -a "$OUT"
sleep 1
probe "(()=>{const p=document.getElementById('srs-dashboard');if(!p)return 'NO-PANEL';const cs=getComputedStyle(p);const sh=cs.boxShadow;const ringSeg=(sh.split(',').find((s)=>s.includes('inset'))||'').trim();return JSON.stringify({mode:'dark',spotlit:p.getAttribute('data-spotlit'),ring:sh.includes('inset')&&sh.includes('0px 0px 0px 2px'),ringSeg:ringSeg.slice(0,60)});})()" | tee -a "$OUT"
qa_shot r430-srs-panel-spot-dark.png
sleep 2.2
probe "(()=>{const p=document.getElementById('srs-dashboard');if(!p)return 'NO-PANEL-AFTER';return JSON.stringify({mode:'dark',spotlitAfter:p.getAttribute('data-spotlit')});})()" | tee -a "$OUT"

echo "########## G) دفترِ DB — پرشهایِ این راند" | tee -a "$OUT"
node -e "const {PrismaClient}=require('@prisma/client');const db=new PrismaClient();db.eventDay.findFirst({where:{name:'drill_due_jump'}}).then((r)=>{console.log('LEDGER:',JSON.stringify(r?{name:r.name,count:r.count,day:r.day}:null));return db.\$disconnect();}).catch((e)=>{console.log('LEDGER-ERR:'+e.message);process.exit(0);})" 2>&1 | tee -a "$OUT"

agent-browser close >/dev/null 2>&1 || true
echo "########## WITNESS-DONE" | tee -a "$OUT"
