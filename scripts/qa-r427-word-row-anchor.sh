#!/usr/bin/env bash
# ------------------------------------------------------------------
# r427 — «لنگرِ سطرِ واژه» — سیودومین مصرفکنندهٔ qa-lib.sh.
# بندِ ③ پیشنهادهایِ r426: پرشِ lesson-vocab حالا تا خودِ کارتِ واژه
# میرود (الگویِ سطرِ فعلِ r234). این شاهدِ زنده رویِ buildِ راند (تک سشن):
#   A) خانه + بذرِ persona + روشن
#   B) واژهٔ واقعیِ نخستین درس از خودِ داده (bun) + اسلاگِ id (r253)
#   C) روشن: بذرِ سررسیدِ lesson-vocab → کارنامه → کلیکِ خانهٔ امروز
#      («پرش به تمرینِ واژگان درس») → نظرسنجیِ پالسِ زمردیِ کارت
#      (shadow-emerald-300) + میزبانِ r407 زیرِ پا + دیالوگِ بسته + شات
#   D) پرشِ دوبارهٔ همان واژه — پالسِ دوم یعنی لنگرِ مصرفشده از view
#      پاک شده است (قراردادِ r427؛ بدونِ پاکسازی، propِ تکراری اثرِ
#      دوباره نمیکرد)
#   E) شب: reload → تاریک → کلیکِ دوباره → پالس با کرنلِ شبِ r234
#      (emerald-900/30 در کلاس + rgb(4, 120, 87) در سایهٔ درونی) + شات
#   F) دفترِ DB — drill_due_jump
# درسِ r426: پسِ هر reload نقشهٔ پایهها دوباره تزریق میشود.
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
OUT=/tmp/r427-word-row-witness.txt
QA_SEED_FILE=/tmp/r427-seed-eval.js
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

echo "########## B) واژهٔ واقعیِ نخستین درس از خودِ داده (bun)" | tee -a "$OUT"
bun -e '
const {lessons}=require("/home/z/my-project/src/data/index.ts");
const l=lessons.find((x)=>x.vocabulary.some((w)=>w.en&&w.fa));
const w=l.vocabulary.find((x)=>x.en&&x.fa);
console.log("window.__r427base="+JSON.stringify({en:w.en,slug:w.en.replace(/\s+/g,"-"),lessonId:l.id})+";\"BASE-OK:\"+window.__r427base.en");
' > /tmp/r427-base.js || { echo "BASE-FAIL" | tee -a "$OUT"; agent-browser close >/dev/null 2>&1; exit 1; }
agent-browser eval "$(cat /tmp/r427-base.js)" | tee -a "$OUT"
echo | tee -a "$OUT"

# نظرسنجیِ پالس — کلاسِ هستهٔ زمردیِ r234 روی کارتِ لنگر (پنجرهٔ ۶ثانیهای)
PULSE_POLL='(()=>{const slug=window.__r427base.slug;return new Promise((res)=>{const t0=Date.now();const tick=()=>{const el=document.getElementById("vocab-row-"+slug);if(el&&el.className.includes("shadow-emerald-300")){res("PULSE-OK:"+slug);return;}if(Date.now()-t0>6000){res("PULSE-MISS:"+(el?"no-pulse":"no-row"));return;}setTimeout(tick,250);};tick();});})()'

echo "########## C) روشن — بذرِ سررسید → پرشِ خانهٔ امروز → پالسِ کارتِ واژه" | tee -a "$OUT"
probe "(()=>{const KEY='vision2-study-v1';const raw=JSON.parse(localStorage.getItem(KEY)||'{\"state\":{}}');const iso=(d)=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');const ago=(n)=>iso(new Date(Date.now()-n*864e5));const en=window.__r427base.en;raw.state.drillMistakes={'lesson-vocab':{[en]:{wrong:2,ok:0,lastDay:ago(1),lastOkDay:''}}};localStorage.setItem(KEY,JSON.stringify(raw));location.reload();return 'SEEDED:'+en;})()" | tee -a "$OUT"
sleep 4
qa_wait_home || { agent-browser close >/dev/null 2>&1; exit 1; }
agent-browser eval "$(cat /tmp/r427-base.js)" >/dev/null 2>&1
sleep 1
probe "(()=>{window.dispatchEvent(new Event('open-report'));return 'REPORT-OPEN';})()" >/dev/null 2>&1
sleep 2.5
probe "(()=>{const btn=document.querySelector('.week-strip button[aria-label^=\"امروز\"]');if(!btn)return 'NO-JUMP-BTN';const a=btn.getAttribute('aria-label');if(!a.includes('پرش به تمرینِ واژگان درس'))return 'WRONG-TARGET:'+a;return 'READY:'+a;})()" | tee -a "$OUT"
probe "(()=>{const btn=document.querySelector('.week-strip button[aria-label^=\"امروز\"]');if(!btn)return 'NO-BTN';btn.click();return 'CLICKED';})()" >/dev/null 2>&1
probe "$PULSE_POLL" | tee -a "$OUT"
probe "(()=>{const dest=document.querySelector('[aria-label=\"شروع تمرین واژگان درس\"]');const dialogGone=!document.querySelector('.report-dialog');const row=document.getElementById('vocab-row-'+(window.__r427base||{}).slug);return JSON.stringify({landed:!!dest,reportDialogClosed:dialogGone,rowLanded:!!row});})()" | tee -a "$OUT"
qa_shot r427-row-pulse-light.png

echo "########## D) پرشِ دوبارهٔ همان واژه — پالسِ دوم یعنی لنگر از view پاک شده" | tee -a "$OUT"
probe "(()=>{window.dispatchEvent(new Event('open-report'));return 'REPORT-REOPEN';})()" >/dev/null 2>&1
sleep 2.5
probe "(()=>{const btn=document.querySelector('.week-strip button[aria-label^=\"امروز\"]');if(!btn)return 'NO-BTN';btn.click();return 'RECLICKED';})()" >/dev/null 2>&1
probe "$PULSE_POLL" | tee -a "$OUT"

echo "########## E) شب — کرنلِ تاریکِ همان کارت (emerald-900/30)" | tee -a "$OUT"
probe "(()=>{location.reload();return 'R';})()" >/dev/null 2>&1
sleep 4
qa_wait_home || { agent-browser close >/dev/null 2>&1; exit 1; }
agent-browser eval "$(cat /tmp/r427-base.js)" >/dev/null 2>&1
qa_to_dark
probe "(()=>{window.dispatchEvent(new Event('open-report'));return 'REPORT-OPEN-DARK';})()" >/dev/null 2>&1
sleep 2.5
# تک‌پروبِ ترکیبیِ شب: کلیک + نظرسنجیِ پالس + خواندنِ کرنل در یک Promise —
# پالس ۱٫۶ثانیهای است و خواندنِ جداگانه پسِ آن آرتیفکتِ تایمینگ میدهد (درسِ این راند).
# درسِ رنگیِ همین راند: کرومِ نو با Tailwind v4 رنگها را در oklab برمیگرداند
# (color-mix) — داوریِ کرنل باید رنگفضا-بیطرف باشد: هندسهٔ حلقهٔ درونی
# («0px 0px 0px 2px inset») + الفای emerald-900/30 در bg («/ 0.3)»)؛
# و خواندن پسِ ۶۰۰ms تا ترنزیشن باکس-شیدو بنشیند (قابِ اولِ وسطِ ترنزیشن میآید).
probe "(()=>{return new Promise((res)=>{const btn=document.querySelector('.week-strip button[aria-label^=\"امروز\"]');if(!btn){res('NO-BTN');return;}btn.click();const t0=Date.now();const tick=()=>{const el=document.getElementById('vocab-row-'+(window.__r427base||{}).slug);if(el&&el.className.includes('shadow-emerald-300')){setTimeout(()=>{const cs=getComputedStyle(el);const hasClass=el.className.includes('dark:bg-emerald-900/30')&&el.className.includes('dark:shadow-emerald-700');const bg=cs.backgroundColor;const shadow=cs.boxShadow;const ring=shadow.indexOf('0px 0px 0px 2px inset')>=0;const alpha30=bg.indexOf('/ 0.3)')>=0;if(ring&&alpha30){res(JSON.stringify({darkClass:hasClass,bg:bg.slice(0,44),innerRing:'2px-inset-oklab'}));return;}if(Date.now()-t0>8000){res('DARK-KERNEL-MISS:ring='+ring+',alpha30='+alpha30+',bg='+bg.slice(0,40));return;}},600);return;}if(Date.now()-t0>8000){res('DARK-PULSE-MISS');return;}setTimeout(tick,200);};setTimeout(tick,300);});})()" | tee -a "$OUT"
qa_shot r427-row-pulse-dark.png

echo "########## F) دفترِ DB — پرشهایِ این راند" | tee -a "$OUT"
node -e "const {PrismaClient}=require('@prisma/client');const db=new PrismaClient();db.eventDay.findFirst({where:{name:'drill_due_jump'}}).then((r)=>{console.log('LEDGER:',JSON.stringify(r?{name:r.name,count:r.count,day:r.day}:null));return db.\$disconnect();}).catch((e)=>{console.log('LEDGER-ERR:'+e.message);process.exit(0);})" 2>&1 | tee -a "$OUT"

agent-browser close >/dev/null 2>&1 || true
echo "########## WITNESS-DONE" | tee -a "$OUT"
