#!/usr/bin/env bash
# ------------------------------------------------------------------
# r437 — «شاهدِ تاریکِ چیپهایِ میزبانِ r419»
# چهلودومین مصرفکنندهٔ qa-lib.sh.
# پیشنهادِ ③ِ r436 — خانوادهٔ شاهدِ تاریک (r428/r429/r435/r436) هنوز
#   میزبانِ r419 را ندیده بود: سه چیپِ فشردهٔ پیشِ ورود (بنفشِ «جلسه ·
#   بهترین»، زمردیِ «سررسید»، آسمانیِ «درنفس») تا امروز فقط در روشن
#   witnessed بودند (r419: چهار شاتِ روشن). این راند هر سه در شبِ
#   واقعی و با کرنلِ دقیق داوری میشوند — و روشن بهعنوانِ پایهٔ همان
#   داوری، همزمانِ همان سشن.
# درسِ r427/r433/r436 — دو مکانیزمِ سریال در یک صفحه (سریالها اول زنده
#   آموخته شدند — پروبِ آغازِ راند — بعد قفل شدند):
#   · شب: کرنلهایِ ۵۰/۷۰۰ که به rgba/rgbِ واقعی میرسند (توکنهایِ
#     --color-*-50ِ tarpit + قوانینِ scopedِ text-*-700) — سریالِ
#     rgba/rgb میمانند:
#     بنفش   bg=rgba(59, 40, 92, 0.35) · ink=rgb(196, 181, 253)
#     زمردی  bg=rgba(6, 55, 40, 0.35)  · ink=rgb(110, 231, 183)
#     آسمانی bg=rgba(8, 47, 60, 0.45)  · ink=rgb(125, 211, 252)
#   · روشن: سایههایِ سهامِ Tailwind که این موتور آنها را lab() سریال
#     میکند (همان درسِ oklabِ r427):
#     بنفش   bg=lab(96.2416 2.28849 -5.51657) · ink=lab(35.2783 67.9912 -88.793)
#     زمردی  bg=lab(97.8462 -6.94966 1.85487) · ink=lab(44.4871 -41.0396 11.0361)
#     آسمانی bg=lab(97.3623 -2.33802 -4.13098) · ink=lab(41.6013 -9.10804 -42.5647)
#   · وزنِ قلمِ هر سه = ۹۰۰ (font-black) — در هر دو حالت.
# گویشهایِ aria (r419) در شب هم همان رشتهها (بیتْمَند):
#   بنفش   «پیشرفت این تمرین: ۳ جلسهٔ کامل، بهترین ۷۰٪»
#   زمردی  «سررسیدهای مرور این تمرین: ۱ مورد»
#   آسمانی «دورهٔ نفس این تمرین: ۲ مورد در استراحت، نزدیکترین بازگشت ۱ روز دیگر»
#   (نردبانِ r419: go سررسید / come درنفسِ فردا / see درنفسِ +۲ /
#    have مسلط / eat تازهٔ امروزِ بیحق — مسلط و تازه صادقانه شمرده
#    نمیشوند: ۱ سررسید و ۲ درنفس، نه ۲ و ۴.)
# درسهایِ ابزاری که اینجا اعمالاند:
#   r414: هر پروبِ پسِ reload با qa_wait_home — بی آن اعتبار ندارد
#   r419: چیپها با پیشوندِ aria یافته میشوند — بدونِ بازکردنِ معرفی
# پایههایِ واقعیِ داده هرگز به پوسته نشت نمیکنند — از window.__r437.
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
OUT=/tmp/r437-host-chips-dark-witness.txt
QA_SEED_FILE=/tmp/r437-witness-seed-eval.js
: > "$OUT"

source /home/z/my-project/scripts/qa-lib.sh

probe(){ agent-browser eval "$1" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

click_by_label(){ agent-browser eval "(()=>{let b=document.querySelector('[aria-label=\"$1\"]');if(!b||b.getBoundingClientRect().width===0){b=[...document.querySelectorAll('button')].find((x)=>(x.innerText||'').replace(/\s+/g,' ').trim()==='$1'&&x.getBoundingClientRect().width>0);}if(!b)return 'NO-BTN:$1';b.click();return 'CLICKED:$1';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

# ---- گویشِ aria + متنِ دیدنیِ هر سه چیپ (بیتْمَند در هر دو حالت) ----
dialects(){ # $1 = برچسبِ صحنه
  probe "(()=>{const v=document.querySelector('[aria-label^=\"پیشرفت این تمرین\"]');const d=document.querySelector('[aria-label^=\"سررسیدهای مرور این تمرین\"]');const g=document.querySelector('[aria-label^=\"دورهٔ نفس این تمرین\"]');if(!v||!d||!g)return 'MISSING-$1:'+JSON.stringify({v:!!v,d:!!d,g:!!g});const ev='پیشرفت این تمرین: ۳ جلسهٔ کامل، بهترین ۷۰٪';const ed='سررسیدهای مرور این تمرین: ۱ مورد';const eg='دورهٔ نفس این تمرین: ۲ مورد در استراحت، نزدیکترین بازگشت ۱ روز دیگر';const errs=[];if((v.getAttribute('aria-label')||'')!==ev)errs.push('V-ARIA:'+v.getAttribute('aria-label'));if((d.getAttribute('aria-label')||'')!==ed)errs.push('D-ARIA:'+d.getAttribute('aria-label'));if((g.getAttribute('aria-label')||'')!==eg)errs.push('G-ARIA:'+g.getAttribute('aria-label'));const tv=(v.textContent||'').trim();const td=(d.textContent||'').trim();const tg=(g.textContent||'').trim();if(tv!=='۳ جلسه · بهترین ۷۰٪')errs.push('V-TXT:'+tv);if(td!=='۱ سررسید')errs.push('D-TXT:'+td);if(tg!=='۲ درنفس')errs.push('G-TXT:'+tg);return errs.length?('FAIL-$1:'+errs.join('|')):'DIALECT-OK-$1';})()"
}

# ---- داورِ هویتِ کرنل: $1 = برچسبِ صحنه؛ $2/$3/$4 = «bg|ink»ِ سه چیپ ----
chip_identity(){ # $1 صحنه، $2 بنفش، $3 زمردی، $4 آسمانی — هر یک "bg|ink"
  probe "(()=>{const pick=(sel)=>{const el=document.querySelector(sel);if(!el)return null;const cs=getComputedStyle(el);return {bg:cs.backgroundColor,color:cs.color,font:cs.fontWeight};};const v=pick('[aria-label^=\"پیشرفت این تمرین\"]');const d=pick('[aria-label^=\"سررسیدهای مرور این تمرین\"]');const g=pick('[aria-label^=\"دورهٔ نفس این تمرین\"]');if(!v||!d||!g)return 'MISSING-$1';const errs=[];const want=[['V','$2'],['D','$3'],['G','$4']];const got={V:v,D:d,G:g};for(const [k,w] of want){const [bg,ink]=w.split('|');if(got[k].bg!==bg)errs.push(k+'-BG:'+got[k].bg);if(got[k].color!==ink)errs.push(k+'-INK:'+got[k].color);if(got[k].font!=='900')errs.push(k+'-FONT:'+got[k].font);}return errs.length?('FAIL-$1:'+errs.join('|')):'IDENTITY-OK-$1';})()"
}

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

echo "########## B) دادهٔ واقعی از خودِ بانکها (bun)" | tee -a "$OUT"
bun -e '
const {irregularVerbs} = require("/home/z/my-project/src/data/appendix.ts");
const verb = irregularVerbs.find(v=>v.base&&v.fa).base;
if (!verb) { console.log("window.__r437={};\"BASES-INCOMPLETE\""); process.exit(0); }
console.log("window.__r437="+JSON.stringify({verb})+";\"BASES-OK\"");
' > /tmp/r437-bases.js || { echo "BASES-FAIL" | tee -a "$OUT"; agent-browser close >/dev/null 2>&1; exit 1; }
agent-browser eval "$(cat /tmp/r437-bases.js)" | tee -a "$OUT"
echo | tee -a "$OUT"

echo "########## C) بذرِ نردبانِ r419 + رکوردِ میزبان → reload → میزبانِ افعال" | tee -a "$OUT"
probe "(()=>{const KEY='vision2-study-v1';const raw=JSON.parse(localStorage.getItem(KEY)||'{\"state\":{}}');const iso=(d)=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');const today=iso(new Date());const yesterday=iso(new Date(Date.now()-864e5));const R=window.__r437||{};if(!R.verb)return 'NO-BASES';raw.state.drillStats={verbs:{sessions:3,correct:15,total:30,bestPercent:70,lastDay:yesterday}};raw.state.drillMistakes={verbs:{go:{wrong:2,ok:0,lastDay:yesterday,lastOkDay:''},come:{wrong:2,ok:1,lastDay:yesterday,lastOkDay:today},see:{wrong:3,ok:2,lastDay:'2026-10-01',lastOkDay:today},have:{wrong:1,ok:1,lastDay:yesterday,lastOkDay:yesterday},eat:{wrong:1,ok:0,lastDay:today,lastOkDay:''}}};localStorage.setItem(KEY,JSON.stringify(raw));location.reload();return 'SEEDED:'+today;})()" | tee -a "$OUT"
sleep 4
qa_wait_home || { agent-browser close >/dev/null 2>&1; exit 1; }
agent-browser eval "$(cat /tmp/r437-bases.js)" >/dev/null 2>&1
click_by_label "ضمیمه"; sleep 2.5
click_by_label "افعال بی‌قاعده"; sleep 2

echo "########## D) شبِ واقعی — گویش + هویتِ کرنلِ سه چیپ" | tee -a "$OUT"
qa_to_dark
probe "(()=>{return document.documentElement.classList.contains('dark')?'DARK-ON':'DARK-OFF';})()"
dialects DARK
chip_identity DARK 'rgba(59, 40, 92, 0.35)|rgb(196, 181, 253)' 'rgba(6, 55, 40, 0.35)|rgb(110, 231, 183)' 'rgba(8, 47, 60, 0.45)|rgb(125, 211, 252)'
qa_shot r437-host-chips-dark.png

echo "########## E) روشن — پایهٔ همان داوری در روز (سریالِ lab)" | tee -a "$OUT"
qa_to_light
sleep 1
dialects LIGHT
chip_identity LIGHT 'lab(96.2416 2.28849 -5.51657)|lab(35.2783 67.9912 -88.793)' 'lab(97.8462 -6.94966 1.85487)|lab(44.4871 -41.0396 11.0361)' 'lab(97.3623 -2.33802 -4.13098)|lab(41.6013 -9.10804 -42.5647)'
qa_shot r437-host-chips-light.png

echo "########## F) دفترِ DB — این شاهد پرشی ندارد؛ دفترِ صادق" | tee -a "$OUT"
node -e "const {PrismaClient}=require('@prisma/client');const db=new PrismaClient();db.eventDay.findFirst({where:{name:'drill_due_jump'}}).then((r)=>{console.log('LEDGER:',JSON.stringify(r?{name:r.name,count:r.count,day:r.day}:null));return db.\$disconnect();}).catch((e)=>{console.log('LEDGER-ERR:'+e.message);process.exit(0);})" 2>&1 | tee -a "$OUT"

agent-browser close >/dev/null 2>&1 || true
echo "########## WITNESS-DONE" | tee -a "$OUT"
