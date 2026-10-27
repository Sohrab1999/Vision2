#!/usr/bin/env bash
# ------------------------------------------------------------------
# r440 — «شاهدِ موبایلِ خانوادهٔ معرفی: زبانِ کاملِ SRS در بندِ ۳۹۰px»
# چهلوپنجمین مصرفکنندهٔ qa-lib.sh.
# داوریِ ارزش: پیشنهادِ ①ِ r439 (تبلتِ ۷۶۸) رد شد — تنها مرزِ واقعیِ نزدیک
#   (min-[420px]) زیرِ ۷۶۸ است و ۳۹۰ (بدترینِ بند) سرریزِ صفر را حکم کرده؛
#   رانِ تبلت تقریباً بیاطلاعِ نو میبود. بهجایش بدنهٔ گوشتدار: خانوادهٔ
#   معرفی (معرفیِ دریل — جایی که زبانِ کاملِ SRS زندگی میکند) هرگز زیرِ
#   ۱۲۸۰px دیده نشده. چیپهایِ تمام-جمله و ردیفِ دکمهها در ۳۹۰px میتوانند
#   سرریز کنند — این شاهد میسنجد و قفل میکند.
# صحنه: میزبانِ افعال → درِ تمرین → فازِ معرفی در شبِ واقعی و روشن:
#   ① چهار چیپِ معرفی با گویشِ بیتْمَند (بنفش/رزگون/زمردی/آسمانی):
#     بنفش   «پیشرفت این تمرین: ۳ جلسهٔ کامل، بهترین ۷۰٪»
#            متن: «۳ جلسهٔ کامل · بهترین ۷۰٪» (گویشِ معرفی — نه «جلسه ·»)
#     رزگون «بانک خطاهای این تمرین: ۵ مورد ثبتشده» — متن: «۵ موردِ خطای ثبتشده»
#     زمردی «سررسیدهای مرور این تمرین: ۱ مورد» — متن: «۱ موردِ سررسید — در جلسهٔ بعد پیشِ دست»
#     آسمانی «دورهٔ نفس این تمرین: ۲ مورد در استراحت، نزدیکترین بازگشت ۱ روز دیگر»
#            متن: «۲ مورد در دورهٔ نفس — نزدیکترین بازگشت: فردا» (فاصلهٔ ۱ = «فردا»)
#   ② سه دکمه با ariaِ دقیق: شروعِ کامل / تمرینِ سررسیدها (۱) (r415) /
#     تقویمِ مرور (CSV) (r418: «۱ سررسید و ۲ مورد در دورهٔ نفس»)
#   ③ چیدمان: سرریزِ صفرِ سند + هیچ چیپی بیرون از بندِ خودش + wrapِ ردیفِ دکمهها
#   ④ کرنلِ دقیقِ چهار چیپ — رزگونِ معرفی برایِ اولینبار سریال میگیرد
#     (رز هرگز در خانوادهٔ شاهدِ تاریک نیامده — درسِ r427: اول زنده، بعد قفل)
# ارتقای کتابخانه: گاردِ موبایلِ r439 از این راند در qa-lib است
#   (qa_seed_guard_mobile — بدونِ کپیِ موازی، ایدئومِ r381).
# درسهایِ ابزاری: r414 (qa_wait_home پسِ هر reload) · r439 (گاردِ موبایل +
#   درِ «ضمیمهٔ کتاب») · r419 (نکته: چیپهایِ معرفی و میزبان ariaِ همخانواده
#   دارند — یابنده باید درونِ sectionِ معرفی بجوید، نه در کلِ سند)
# پایههایِ واقعیِ داده هرگز به پوسته نشت نمیکنند — از window.__r440.
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
OUT=/tmp/r440-mobile-intro-witness.txt
QA_SEED_FILE=/tmp/r440-witness-seed-eval.js
: > "$OUT"

source /home/z/my-project/scripts/qa-lib.sh

probe(){ agent-browser eval "$1" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

click_by_label(){ agent-browser eval "(()=>{let b=document.querySelector('[aria-label=\"$1\"]');if(!b||b.getBoundingClientRect().width===0){b=[...document.querySelectorAll('button')].find((x)=>(x.innerText||'').replace(/\s+/g,' ').trim()==='$1'&&x.getBoundingClientRect().width>0);}if(!b)return 'NO-BTN:$1';b.click();return 'CLICKED:$1';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

click_card(){ agent-browser eval "(()=>{const b=[...document.querySelectorAll('button')].find((x)=>(x.innerText||'').includes('$1')&&x.getBoundingClientRect().width>0);if(!b)return 'NO-BTN:$1';b.click();return 'CLICKED:$1';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

# بخشِ معرفی: sectionِ حاویِ چیپِ زمردیِ سررسید — معرفی و میزبان ariaِ
# همخانواده دارند، پس یابنده همیشه درونِ خودِ معرفی میماند (درسِ r419).
intro_sec(){ agent-browser eval "(()=>{const sec=[...document.querySelectorAll('section')].find(s=>s.querySelector('[aria-label^=\"سررسیدهای مرور\"]')&&s.querySelector('[aria-label^=\"پیشرفت این تمرین\"]'));return sec?'INTRO-SEC-OK':'NO-INTRO-SEC';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

# ---- گویشِ چهار چیپ + سه دکمه — بیتْمَند ----
intro_dialects(){ # $1 صحنه
  probe "(()=>{const sec=[...document.querySelectorAll('section')].find(s=>s.querySelector('[aria-label^=\"سررسیدهای مرور\"]'));if(!sec)return 'NO-INTRO-$1';const q=(p)=>sec.querySelector('[aria-label^=\"'+p+'\"]');const v=q('پیشرفت این تمرین');const r=q('بانک خطاهای این تمرین');const d=q('سررسیدهای مرور');const g=q('دورهٔ نفس');if(!v||!r||!d||!g)return 'MISSING-$1:'+JSON.stringify({v:!!v,r:!!r,d:!!d,g:!!g});const errs=[];const ev='پیشرفت این تمرین: ۳ جلسهٔ کامل، بهترین ۷۰٪';const er='بانک خطاهای این تمرین: ۵ مورد ثبتشده';const ed='سررسیدهای مرور این تمرین: ۱ مورد';const eg='دورهٔ نفس این تمرین: ۲ مورد در استراحت، نزدیکترین بازگشت ۱ روز دیگر';if((v.getAttribute('aria-label')||'')!==ev)errs.push('V-ARIA:'+v.getAttribute('aria-label'));if((r.getAttribute('aria-label')||'')!==er)errs.push('R-ARIA:'+r.getAttribute('aria-label'));if((d.getAttribute('aria-label')||'')!==ed)errs.push('D-ARIA:'+d.getAttribute('aria-label'));if((g.getAttribute('aria-label')||'')!==eg)errs.push('G-ARIA:'+g.getAttribute('aria-label'));const tv=(v.textContent||'').trim();const tr=(r.textContent||'').trim();const td=(d.textContent||'').trim();const tg=(g.textContent||'').trim();if(tv!=='۳ جلسهٔ کامل · بهترین ۷۰٪')errs.push('V-TXT:'+tv);if(tr!=='۵ موردِ خطای ثبتشده')errs.push('R-TXT:'+tr);if(td!=='۱ موردِ سررسید — در جلسهٔ بعد پیشِ دست')errs.push('D-TXT:'+td);if(tg!=='۲ مورد در دورهٔ نفس — نزدیکترین بازگشت: فردا')errs.push('G-TXT:'+tg);const start=sec.querySelector('[aria-label=\"شروع جلسهٔ تمرین فعل\"]');const dues=sec.querySelector('[aria-label=\"شروع جلسهٔ تمرین فقط از سررسیدهای این تمرین: ۱ مورد\"]');const cal=sec.querySelector('[aria-label=\"دانلود تقویم مرور این تمرین: ۱ سررسید و ۲ مورد در دورهٔ نفس\"]');if(!start)errs.push('NO-START');if(!dues)errs.push('NO-DUEBTN');if(!cal)errs.push('NO-CALBTN');return errs.length?('FAIL-$1:'+errs.join('|')):'DIALECT-OK-$1';})()"
}

# ---- کرنلِ دقیقِ چهار چیپ: $1 صحنه، $2..$5 = «bg|ink»ِ بنفش/رزگون/زمردی/آسمانی ----
intro_identity(){ # $1 صحنه، $2 بنفش، $3 رزگون، $4 زمردی، $5 آسمانی
  probe "(()=>{const sec=[...document.querySelectorAll('section')].find(s=>s.querySelector('[aria-label^=\"سررسیدهای مرور\"]'));if(!sec)return 'NO-INTRO-$1';const pick=(p)=>{const el=sec.querySelector('[aria-label^=\"'+p+'\"]');if(!el)return null;const cs=getComputedStyle(el);return {bg:cs.backgroundColor,color:cs.color,font:cs.fontWeight};};const v=pick('پیشرفت این تمرین');const r=pick('بانک خطاهای این تمرین');const d=pick('سررسیدهای مرور');const g=pick('دورهٔ نفس');if(!v||!r||!d||!g)return 'MISSING-$1';const errs=[];const want=[['V','$2'],['R','$3'],['D','$4'],['G','$5']];const got={V:v,R:r,D:d,G:g};for(const [k,w] of want){const [bg,ink]=w.split('|');if(got[k].bg!==bg)errs.push(k+'-BG:'+got[k].bg);if(got[k].color!==ink)errs.push(k+'-INK:'+got[k].color);if(got[k].font!=='900')errs.push(k+'-FONT:'+got[k].font);}return errs.length?('FAIL-$1:'+errs.join('|')):'IDENTITY-OK-$1';})()"
}

# ---- چیدمانِ موبایل — قفل: $1 صحنه، $2 wrapِ موردِ انتظار ("LEARN" = هنوز حکم نیامده؛
# مقدارِ زنده در پیامِ OK میآید) — سرریزِ صفرِ سند و هیچ چیپی بیرون از بندِ خودش همیشه قفل است ----
intro_layout(){ # $1 صحنه، $2 wrap
  probe "(()=>{const sec=[...document.querySelectorAll('section')].find(s=>s.querySelector('[aria-label^=\"سررسیدهای مرور\"]'));if(!sec)return 'NO-INTRO-$1';const chips=[...sec.querySelectorAll('[aria-label^=\"پیشرفت این تمرین\"],[aria-label^=\"بانک خطاهای این تمرین\"],[aria-label^=\"سررسیدهای مرور\"],[aria-label^=\"دورهٔ نفس\"]')];const over=chips.filter((c)=>c.scrollWidth>Math.ceil(c.getBoundingClientRect().width)+1).length;const secOver=sec.scrollWidth>Math.ceil(sec.clientWidth)+1;const docOver=document.documentElement.scrollWidth>window.innerWidth+1;const row=[...sec.querySelectorAll('div')].find((x)=>getComputedStyle(x).display==='flex'&&(x.textContent||'').includes('شروع تمرین'));const wrap=row?getComputedStyle(row).flexWrap:'none';const errs=[];if(over!==0)errs.push('CHIP-OVER:'+over);if(secOver)errs.push('SEC-OVERX:'+sec.scrollWidth+'>'+sec.clientWidth);if(docOver)errs.push('DOC-OVERX:'+document.documentElement.scrollWidth+'>'+window.innerWidth);if('$2'!=='LEARN'&&wrap!=='$2')errs.push('WRAP:'+wrap);return errs.length?('FAIL-$1:'+errs.join('|')):('MOBILE-OK-$1:wrap='+wrap);})()"
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

echo "########## B) دادهٔ واقعی از خودِ بانک (bun)" | tee -a "$OUT"
bun -e '
const {irregularVerbs} = require("/home/z/my-project/src/data/appendix.ts");
const verb = irregularVerbs.find(v=>v.base&&v.fa).base;
if (!verb) { console.log("window.__r440={};\"BASES-INCOMPLETE\""); process.exit(0); }
console.log("window.__r440="+JSON.stringify({verb})+";\"BASES-OK\"");
' > /tmp/r440-bases.js || { echo "BASES-FAIL" | tee -a "$OUT"; agent-browser close >/dev/null 2>&1; exit 1; }
agent-browser eval "$(cat /tmp/r440-bases.js)" | tee -a "$OUT"
echo | tee -a "$OUT"

echo "########## C) بذرِ نردبانِ r419 + رکوردِ میزبان" | tee -a "$OUT"
probe "(()=>{const KEY='vision2-study-v1';const raw=JSON.parse(localStorage.getItem(KEY)||'{\"state\":{}}');const iso=(d)=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');const today=iso(new Date());const yesterday=iso(new Date(Date.now()-864e5));const m=window.__r440||{};if(!m.verb)return 'NO-BASES';raw.state.drillStats={verbs:{sessions:3,correct:15,total:30,bestPercent:70,lastDay:yesterday}};raw.state.drillMistakes={verbs:{[m.verb]:{wrong:2,ok:0,lastDay:yesterday,lastOkDay:''},[m.verb+'-g1']:{wrong:2,ok:1,lastDay:yesterday,lastOkDay:today},[m.verb+'-g2']:{wrong:3,ok:2,lastDay:'2026-10-01',lastOkDay:today},[m.verb+'-m']:{wrong:1,ok:1,lastDay:yesterday,lastOkDay:yesterday},[m.verb+'-n']:{wrong:1,ok:0,lastDay:today,lastOkDay:''}}};localStorage.setItem(KEY,JSON.stringify(raw));location.reload();return 'SEEDED:'+today;})()" | tee -a "$OUT"
sleep 4
qa_wait_home || { agent-browser close >/dev/null 2>&1; exit 1; }
agent-browser eval "$(cat /tmp/r440-bases.js)" >/dev/null 2>&1

echo "########## D) میزبان → درِ تمرین → فازِ معرفی" | tee -a "$OUT"
click_card "ضمیمهٔ کتاب"; sleep 2.5
click_by_label "افعال بی‌قاعده"; sleep 2
click_by_label "شروع تمرین افعال بی‌قاعده"; sleep 2
intro_sec

echo "########## E) شبِ واقعی — گویش + کرنل + چیدمان" | tee -a "$OUT"
qa_to_dark
probe "(()=>{return document.documentElement.classList.contains('dark')?'DARK-ON':'DARK-OFF';})()"
probe "(()=>{const n=[...document.querySelectorAll('[aria-label^=\"پیشرفت این تمرین\"]')].length;return 'VIOLET-COUNT:'+n;})()"
intro_dialects MOBILE-INTRO-DARK
intro_identity MOBILE-INTRO-DARK 'rgba(59, 40, 92, 0.35)|rgb(196, 181, 253)' 'rgba(80, 18, 28, 0.35)|rgb(253, 164, 175)' 'rgba(6, 55, 40, 0.35)|rgb(110, 231, 183)' 'rgba(8, 47, 60, 0.45)|rgb(125, 211, 252)'
intro_layout MOBILE-INTRO-DARK wrap
qa_shot r440-mobile-intro-dark.png

echo "########## F) روشن — پایهٔ همان داوری (سریالِ lab)" | tee -a "$OUT"
qa_to_light
sleep 1
intro_dialects MOBILE-INTRO-LIGHT
intro_identity MOBILE-INTRO-LIGHT 'lab(96.2416 2.28849 -5.51657)|lab(35.2783 67.9912 -88.793)' 'lab(96.2369 4.94155 1.28011)|lab(41.1651 71.6251 30.3087)' 'lab(97.8462 -6.94966 1.85487)|lab(44.4871 -41.0396 11.0361)' 'lab(97.3623 -2.33802 -4.13098)|lab(41.6013 -9.10804 -42.5647)'
intro_layout MOBILE-INTRO-LIGHT wrap
qa_shot r440-mobile-intro-light.png

echo "########## G) دفترِ DB — این شاهد پرشی ندارد؛ دفترِ صادق" | tee -a "$OUT"
node -e "const {PrismaClient}=require('@prisma/client');const db=new PrismaClient();db.eventDay.findFirst({where:{name:'drill_due_jump'}}).then((r)=>{console.log('LEDGER:',JSON.stringify(r?{name:r.name,count:r.count,day:r.day}:null));return db.\$disconnect();}).catch((e)=>{console.log('LEDGER-ERR:'+e.message);process.exit(0);})" 2>&1 | tee -a "$OUT"

agent-browser close >/dev/null 2>&1 || true
echo "########## WITNESS-DONE" | tee -a "$OUT"
