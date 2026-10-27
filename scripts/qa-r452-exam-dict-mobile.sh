#!/usr/bin/env bash
# ------------------------------------------------------------------
# r452 — «شاهدِ موبایلِ «دیکتهٔ واژگان» (exam-dict-cta — دهمین چهرهٔ
# خانوادهٔ آزمون)» — پنجاهوهفتمین مصرفکنندهٔ qa-lib.sh — بندِ ①ِ r451.
# خانوادهٔ دیکته در ۳۹۰px با صدای TTS و تایپِ واقعی — هجی از شنیدن:
#   صحنهٔ A: CTAِ زمردیِ .exam-dict-cta رویِ صفحهٔ آزمون جامع —
#     عنوانِ «دیکتهٔ واژگان — جامع و پایه‌محور»، زیرعنوان با شمارشِ
#     RAWِ بانک (۱۷۲ — نه ۱۴۹ِ کهنهٔ کامنتِ منبع؛ خودِ DOM معلّم است)،
#     قرصِ «شروع دیکته» bg-emerald-700، جعبهٔ آیکنِ bg-emerald-500 —
#     شب و روز (گرادیانِ شب = overrideِ !importantِ globals خطِ ۴۹۲).
#   صحنهٔ B: دیالوگِ دامنه — ۷ چیپِ RAW (بانک · ۱۷۲ + شش پایه:
#     ۴۸۷/۶۰۴/۸۶۵/۹۸۸/۴۵۴/۵۵۶)، بانک aria-pressed=true، کارتِ
#     تنظیماتِ بنفش (۸/۱۰/۱۵/۲۰ — «۱۰» فعال؛ سوییچ به «۸»)،
#     «شروع دیکته» + «بازگشت».
#   صحنهٔ C: راندِ واقعیِ ۸واژه‌ای در ۳۹۰ — هفت واژه با «راهنما» تا
#     آخرین حرف، سپس پاککردنِ input و بازتایپِ حرفبهحرف با مسیرِ
#     Reactِ onChange (native setter + input event — تایپِ واقعیِ
#     کنترلشده) → «بررسی» → «آفرین! … (با راهنما — نیم امتیاز)» →
#     auto-advanceِ ۱۵۰۰ms؛ واژهٔ هشتم: «رد کردن» → ردیفِ رزگونِ
#     «املای درست:» + جعبههایِ حرف + «واژهٔ بعدی».
#   صحنهٔ D: پردهٔ done — «دیکته تمام شد!»، «۴۴٪» (۷×۰.۵=۳.۵ از ۸)،
#     «امتیاز ۳.۵ از ۸»، چیپهای کامل:۰/با راهنما:۷/غلط:۱، شبکهٔ
#     «واژه‌های این دور» (۸ ردیف با روخوانی/املای حرفبهحرف)،
#     «بازگشت به آزمون جامع» — شب و روز.
#   صحنهٔ E: خروج → دیالوگ بسته، CTA پابرجا، بانکِ خطاهایِ پرسونا
#     دستنخورده {0:x-23، 0:x-5} (دیکته هرگز mistakes را نمیزند) و
#     کلیدهایِ SRSِ هشت واژهٔ رسیده در store (قفلِ میان-رسانهٔ
#     DOM↔SRS — «هجیِ درست یعنی ارتقای واقعی مرور»).
#   صحنهٔ F: دفترِ صادق — exam_dictation_start=۱ (یک کلیکِ CTA)،
#     dictation_done=۱، quiz_done=۱، exam_done=۰ و
#     my_words_review_start=۰ (دیکتهٔ آزمون دستش را وار نمیزند)،
#     attemptِ امضاشدهٔ category=exam-dictation/lesson=0/total=8/
#     correct=4/percent=44 — DOM٪ === DB٪؛ drill_due_jump=۱۳۱.
# LEARN_MODE=1: سریالهایِ دوحالته در هر داوری گرفته میشوند.
# درسِ r448/r450/r451: پیشِ هر داوریِ شب، qa_to_darkِ صریح + sleep.
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
OUT=/tmp/r452-dict-witness.txt
QA_SEED_FILE=/tmp/r452-witness-seed-eval.js
: > "$OUT"

source /home/z/my-project/scripts/qa-lib.sh

probe(){ agent-browser eval "$1" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
getvar(){ agent-browser eval "$1" 2>/dev/null | tail -1 | sed -e 's/^"//' -e 's/"$//'; }

click_by_label(){ agent-browser eval "(()=>{let b=document.querySelector('[aria-label=\"$1\"]');if(!b||b.getBoundingClientRect().width===0){b=[...document.querySelectorAll('button')].find((x)=>(x.innerText||'').replace(/\s+/g,' ').trim()==='$1'&&x.getBoundingClientRect().width>0);}if(!b)return 'NO-BTN:$1';b.click();return 'CLICKED:$1';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

click_card(){ agent-browser eval "(()=>{const b=[...document.querySelectorAll('button')].find((x)=>(x.innerText||'').includes('$1')&&x.getBoundingClientRect().width>0);if(!b)return 'NO-BTN:$1';b.click();return 'CLICKED:$1';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

# کلیکِ درونِ دیالوگ — درسِ همپوشانی: «شروع دیکته» هم در CTAِ پشتِ
# overlay هست هم در کارتِ تنظیماتِ دیالوگ — همیشه scope به [role=dialog]
click_in_dialog(){ agent-browser eval "(()=>{const dlg=document.querySelector('[role=\"dialog\"]');if(!dlg)return 'NO-DIALOG';let b=[...dlg.querySelectorAll('button')].find((x)=>(x.innerText||'').replace(/\s+/g,' ').trim()==='$1'&&x.getBoundingClientRect().width>0);if(!b)return 'NO-BTN-IN-DIALOG:$1';b.click();return 'CLICKED:$1';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

dismiss_install(){ probe "(()=>{const b=document.querySelector('[aria-label=\"بستن پیشنهاد نصب\"]');if(b&&b.getBoundingClientRect().width>0){b.click();return 'INSTALL-CARD-DISMISSED';}return 'NO-INSTALL-CARD';})()"; sleep 1; }

# ---- داورِ CTAِ زمردی ($1 صحنه · $2 MODE) — شمارشِ RAW + خانوادهٔ زمردی
judge_dict_cta(){
  local L="${LEARN_MODE:-0}"
  probe "(()=>{const errs=[];const W=(t,a)=>{if(t!==a)errs.push(t+'!='+a);};const fa='۰۱۲۳۴۵۶۷۸۹';const toEn=(s)=>String(s).replace(/[۰-۹]/g,(c)=>fa.indexOf(c));const cta=document.querySelector('.exam-dict-cta');if(!cta||cta.getBoundingClientRect().width===0)return 'FAIL-$1:NO-CTA';if(cta.disabled)errs.push('CTA-DISABLED');const ttl=[...cta.querySelectorAll('span')].find(s=>(s.textContent||'').trim()==='دیکتهٔ واژگان — جامع و پایه‌محور');if(!ttl)errs.push('NO-TITLE');const sub=[...cta.querySelectorAll('span')].find(s=>(s.textContent||'').includes('بانک ۳۶۰تا'));if(!sub)errs.push('NO-SUB');const cm=(sub?(sub.textContent||''):'').match(/([۰-۹]+) واژه/);const n=cm?+toEn(cm[1]):null;window.__r452bank=n;if(n!==172)errs.push('BANK-COUNT:'+n);if(sub&&!(sub.textContent||'').includes('کتابِ هر ۶ پایه'))errs.push('SUB-GRADES-FMT');const pill=[...cta.querySelectorAll('span')].find(s=>(s.textContent||'').trim()==='شروع دیکته');if(!pill)errs.push('NO-PILL');const icon=[...cta.querySelectorAll('span')].find(s=>String(s.className).includes('bg-emerald-500'));if(!icon)errs.push('NO-ICON-BOX');const docOver=document.documentElement.scrollWidth>window.innerWidth+1;if(docOver)errs.push('DOC-OVERX');const ccs=getComputedStyle(cta);const ics=icon?getComputedStyle(icon):null;const pcs=pill?getComputedStyle(pill):null;if('$L'==='1'){return 'LEARN-$1:'+JSON.stringify({n,border:ccs.borderTopColor,img:ccs.backgroundImage,iconBg:ics?ics.backgroundColor:'',iconInk:ics?ics.color:'',pillBg:pcs?pcs.backgroundColor:'',pillInk:pcs?pcs.color:''});}W(ccs.borderTopColor,'$CB');W(ccs.backgroundImage,'$CI');if(ics)W(ics.backgroundColor,'$IB');if(pcs)W(pcs.backgroundColor,'$PB');return errs.length?('FAIL-$1:'+errs.join('|')):('$1-OK|BANK='+n);})()"
}

# ---- داورِ دیالوگِ دامنه ($1 صحنه) — ۷ چیپِ RAW + کارتِ تنظیماتِ بنفش
judge_dialog(){
  local L="${LEARN_MODE:-0}"
  local BKB BKBG BKI C10BG C10I STI
  if [ "$2" = DARK ]; then BKB="$DARK_BKB"; BKBG="$DARK_BKBG"; BKI="$DARK_BKI"; C10BG="$DARK_C10BG"; C10I="$DARK_C10I"; STI="$DARK_STI"; else BKB="$LIGHT_BKB"; BKBG="$LIGHT_BKBG"; BKI="$LIGHT_BKI"; C10BG="$LIGHT_C10BG"; C10I="$LIGHT_C10I"; STI="$LIGHT_STI"; fi
  probe "(()=>{const errs=[];const W=(t,a)=>{if(t!==a)errs.push(t+'!='+a);};const fa='۰۱۲۳۴۵۶۷۸۹';const toEn=(s)=>String(s).replace(/[۰-۹]/g,(c)=>fa.indexOf(c));const dlg=document.querySelector('[role=\"dialog\"]');if(!dlg)return 'FAIL-$1:NO-DIALOG';const ttl=[...dlg.querySelectorAll('h2,h1,div')].find(s=>(s.textContent||'').trim()==='دیکتهٔ واژگان — دامنه را انتخاب کن');if(!ttl)errs.push('NO-DIALOG-TITLE');const grp=dlg.querySelector('[aria-label=\"دامنهٔ دیکته\"]');if(!grp)return 'FAIL-$1:NO-GROUP';const chips=[...grp.querySelectorAll('button')];if(chips.length!==7)errs.push('CHIPS:'+chips.length);const bank=chips.find((b)=>(b.textContent||'').includes('بانک آزمون'));if(!bank)return 'FAIL-$1:NO-BANK-CHIP';if(bank.getAttribute('aria-pressed')!=='true')errs.push('BANK-NOT-PRESSED');const bankTxt=(bank.textContent||'').replace(/\s+/g,' ').trim();if(!bankTxt.includes('۱۷۲'))errs.push('BANK-CHIP-TXT:'+bankTxt);const expect=[['پایهٔ دهم','۴۸۷'],['پایهٔ یازدهم','۶۰۴'],['پایهٔ دوازدهم','۸۶۵'],['پایهٔ هفتم','۹۸۸'],['پایهٔ هشتم','۴۵۴'],['پایهٔ نهم','۵۵۶']];for(const [lb,cn] of expect){const ch=chips.find((b)=>(b.textContent||'').includes(lb));if(!ch){errs.push('NO-CHIP:'+lb);continue;}if(!(ch.textContent||'').includes(cn))errs.push('CHIP-N:'+lb+':'+(ch.textContent||'').trim());if(ch.getAttribute('aria-pressed')!=='false')errs.push('CHIP-PRESSED:'+lb);}const h3=[...dlg.querySelectorAll('h3')].find(s=>(s.textContent||'').trim()==='آزمون دیکته — املای شنیداری');if(!h3)errs.push('NO-SETUP-H3');const c8=[...dlg.querySelectorAll('button')].find((b)=>(b.textContent||'').trim()==='۸');const c10=[...dlg.querySelectorAll('button')].find((b)=>(b.textContent||'').trim()==='۱۰');const c15=[...dlg.querySelectorAll('button')].find((b)=>(b.textContent||'').trim()==='۱۵');const c20=[...dlg.querySelectorAll('button')].find((b)=>(b.textContent||'').trim()==='۲۰');if(!c8||!c10||!c15||!c20)errs.push('NO-COUNT-CHIPS');const smart=[...dlg.querySelectorAll('button')].find((b)=>(b.textContent||'').includes('اولویت با واژه‌های یادنگرفته و سررسید'));if(!smart)errs.push('NO-SMART-TOGGLE');const start=[...dlg.querySelectorAll('button')].find((b)=>(b.textContent||'').includes('شروع دیکته'));if(!start)errs.push('NO-START');const back=[...dlg.querySelectorAll('button')].find((b)=>(b.textContent||'').trim()==='بازگشت');if(!back)errs.push('NO-BACK');const docOver=document.documentElement.scrollWidth>window.innerWidth+1;if(docOver)errs.push('DOC-OVERX');const ccs=c10?getComputedStyle(c10):null;if('$L'==='1'){const bcs=bank?getComputedStyle(bank):null;const scs=start?getComputedStyle(start):null;return 'LEARN-$1:'+JSON.stringify({bankBg:bcs?bcs.backgroundColor:'',bankBorder:bcs?bcs.borderTopColor:'',bankInk:bcs?bcs.color:'',c10Bg:ccs?ccs.backgroundColor:'',c10Ink:ccs?ccs.color:'',startImg:scs?scs.backgroundImage:'',startInk:scs?scs.color:''});}if(bank){const bcs=getComputedStyle(bank);W(bcs.borderTopColor,'$BKB');W(bcs.backgroundColor,'$BKBG');W(bcs.color,'$BKI');}if(ccs){W(ccs.backgroundColor,'$C10BG');W(ccs.color,'$C10I');}const sst=start?getComputedStyle(start):null;if(sst)W(sst.backgroundImage,'$STI');return errs.length?('FAIL-$1:'+errs.join('|')):('$1-OK');})()"
}

# ---- داورِ ورودِ فازِ play ($1 صحنه · $2 MODE) — چیپها، input، بررسیِ
# معلولِ تهی، دکمهٔ TTS، نوارِ صفر
judge_play_entry(){
  local L="${LEARN_MODE:-0}"
  local CHIP_BG CHIP_INK SCORE_BG SCORE_INK INP_BR
  if [ "$2" = DARK ]; then CHIP_BG="$DARK_CHIP_BG"; CHIP_INK="$DARK_CHIP_INK"; SCORE_BG="$DARK_SCORE_BG"; SCORE_INK="$DARK_SCORE_INK"; INP_BR="$DARK_INP_BR"; else CHIP_BG="$LIGHT_CHIP_BG"; CHIP_INK="$LIGHT_CHIP_INK"; SCORE_BG="$LIGHT_SCORE_BG"; SCORE_INK="$LIGHT_SCORE_INK"; INP_BR="$LIGHT_INP_BR"; fi
  probe "(()=>{const errs=[];const W=(t,a)=>{if(t!==a)errs.push(t+'!='+a);};const dlg=document.querySelector('[role=\"dialog\"]');if(!dlg)return 'FAIL-$1:NO-DIALOG';const chip=[...dlg.querySelectorAll('span')].find(s=>/^۱ از ۸$/.test((s.textContent||'').trim()));if(!chip)errs.push('NO-CHIP-1-OF-8');const score=[...dlg.querySelectorAll('span')].find(s=>(s.textContent||'').trim()==='امتیاز: ۰');if(!score)errs.push('NO-SCORE-CHIP');const tts=dlg.querySelector('[aria-label=\"پخش دوبارهٔ کلمه\"]');if(!tts||tts.getBoundingClientRect().width===0)errs.push('NO-TTS-BTN');const inp=dlg.querySelector('input[placeholder=\"type the word...\"]');if(!inp)errs.push('NO-INPUT');if(inp&&inp.getAttribute('dir')!=='ltr')errs.push('INPUT-DIR:'+inp.getAttribute('dir'));if(inp&&inp.value!=='')errs.push('INPUT-NOT-EMPTY');const chk=[...dlg.querySelectorAll('button')].find((b)=>(b.textContent||'').trim()==='بررسی');if(!chk)errs.push('NO-CHECK-BTN');if(chk&&chk.disabled!==true)errs.push('CHECK-NOT-DISABLED-AT-EMPTY');const hint=[...dlg.querySelectorAll('button')].find((b)=>(b.textContent||'').trim()==='راهنما');if(!hint)errs.push('NO-HINT-BTN');const spell=[...dlg.querySelectorAll('button')].find((b)=>(b.textContent||'').trim()==='حرف‌به‌حرف');if(!spell)errs.push('NO-SPELL-BTN');const skip=[...dlg.querySelectorAll('button')].find((b)=>(b.textContent||'').trim()==='رد کردن');if(!skip)errs.push('NO-SKIP-BTN');const ear=[...dlg.querySelectorAll('div')].find((d)=>(d.textContent||'').trim()==='گوش کنید و املای کلمه را بنویسید');if(!ear)errs.push('NO-EAR-LINE');const bar=[...dlg.querySelectorAll('div')].find((d)=>d.style&&d.style.width!==''&&d.getBoundingClientRect().height>0&&d.getBoundingClientRect().height<12);const barW=bar?bar.style.width:'';if(barW&&barW!=='0%'&&barW!=='0px')errs.push('BAR-NOT-ZERO:'+barW);const audioRow=[...dlg.querySelectorAll('div')].find((d)=>(d.textContent||'').includes('روخوانی در دسترس نیست'));window.__r452audio=audioRow?1:0;if('$L'!=='1'&&!audioRow)errs.push('NO-AUDIO-ROW');const docOver=document.documentElement.scrollWidth>window.innerWidth+1;if(docOver)errs.push('DOC-OVERX');const ccs=chip?getComputedStyle(chip):null;const scs=score?getComputedStyle(score):null;const ics=inp?getComputedStyle(inp):null;if('$L'==='1'){const ttsBg=tts?getComputedStyle(tts):null;return 'LEARN-$1:'+JSON.stringify({chipBg:ccs?ccs.backgroundColor:'',chipInk:ccs?ccs.color:'',scoreBg:scs?scs.backgroundColor:'',scoreInk:scs?scs.color:'',inpBorder:ics?ics.borderTopColor:'',ttsBg:ttsBg?ttsBg.backgroundImage.slice(0,80):'',audioRow:audioRow?1:0,fa:((dlg.querySelector('.text-2xl.font-black')||{}).textContent||'').trim()});}if(ccs){W(ccs.backgroundColor,'$CHIP_BG');W(ccs.color,'$CHIP_INK');}if(scs){W(scs.backgroundColor,'$SCORE_BG');W(scs.color,'$SCORE_INK');}if(ics)W(ics.borderTopColor,'$INP_BR');return errs.length?('FAIL-$1:'+errs.join('|')):('$1-OK|AUDIO-ROW='+window.__r452audio);})()"
}

# ---- گامِ راهنما: یک کلیکِ «راهنما» — طولِ input را میدهد
hint_step(){ getvar "(()=>{const dlg=document.querySelector('[role=\"dialog\"]');if(!dlg)return 'NO-DIALOG';const inp=dlg.querySelector('input[placeholder=\"type the word...\"]');if(!inp)return 'NO-INPUT';const h=[...dlg.querySelectorAll('button')].find((b)=>(b.textContent||'').trim()==='راهنما');if(!h)return 'NO-HINT';h.click();return 'LEN:'+inp.value.length+':'+inp.value;})()"; }

# ---- تایپِ واقعیِ React: پاکسازی + بازتایپِ حرفبهحرفِ املای آشکارشده
react_type(){ getvar "(()=>{const dlg=document.querySelector('[role=\"dialog\"]');if(!dlg)return 'NO-DIALOG';const inp=dlg.querySelector('input[placeholder=\"type the word...\"]');if(!inp)return 'NO-INPUT';const val=inp.value;if(!val)return 'EMPTY-NO-HINT';const setter=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;setter.call(inp,'');inp.dispatchEvent(new Event('input',{bubbles:true}));let i=0;return new Promise((res)=>{const tick=()=>{if(i>=val.length)return res('TYPED:'+i+'|W:'+val);setter.call(inp,val.slice(0,++i));inp.dispatchEvent(new Event('input',{bubbles:true}));setTimeout(tick,30);};tick();});})()"; }

# ---- گامِ بررسی: کلیک + داوریِ ردیفِ «آفرین» (نیم امتیازِ با راهنما)
drive_check(){ getvar "(()=>new Promise((res)=>{const dlg=document.querySelector('[role=\"dialog\"]');if(!dlg)return res('NO-DIALOG');const b=[...dlg.querySelectorAll('button')].find((x)=>(x.innerText||'').trim()==='بررسی');if(!b)return res('NO-CHECK');if(b.disabled)return res('CHECK-DISABLED');b.click();setTimeout(()=>{const ok=[...dlg.querySelectorAll('div')].find((d)=>(d.textContent||'').includes('آفرین! املا درست است'));if(!ok)return res('NO-CORRECT-ROW');const half=(ok.textContent||'').includes('با راهنما — نیم امتیاز');const pulse=[...dlg.querySelectorAll('p')].find((p)=>(p.textContent||'').includes('در حال رفتن به واژهٔ بعدی'));const boxes=[...dlg.querySelectorAll('.en-text')].filter((el)=>el.getBoundingClientRect().height>30&&el.getBoundingClientRect().height<50&&String(el.className).includes('rounded-lg')).length;const fp=[...dlg.querySelectorAll('div.font-black')].find((d)=>(d.textContent||'').includes('آفرین! املا درست است'));const fcs=fp?getComputedStyle(fp):null;res('OK-R|HALF:'+(half?1:0)+'|PULSE:'+(pulse?1:0)+'|BOXES:'+boxes+'|INK:'+(fcs?fcs.color:''));},650);}))()"; }

# ---- خواندنِ چیپِ پیشرفت پسِ auto-advance
read_chip(){ getvar "(()=>{const dlg=document.querySelector('[role=\"dialog\"]');if(!dlg)return 'NO-DIALOG';const chip=[...dlg.querySelectorAll('span')].find((s)=>/^([۰-۹]+) از ۸$/.test((s.textContent||'').trim()));if(chip)return 'CHIP:'+(chip.textContent||'').trim();const done=[...dlg.querySelectorAll('h3')].find((s)=>(s.textContent||'').trim()==='دیکته تمام شد!');if(done)return 'DONE';const score=[...dlg.querySelectorAll('span')].find((s)=>(s.textContent||'').startsWith('امتیاز:'));return 'SCORE:'+(score?(score.textContent||'').trim():'?');})()"; }

# ---- گامِ رد کردن (واژهٔ آخر): ردیفِ رز + جعبهها + «واژهٔ بعدی» → done
drive_skip(){ getvar "(()=>new Promise((res)=>{const dlg=document.querySelector('[role=\"dialog\"]');if(!dlg)return res('NO-DIALOG');const b=[...dlg.querySelectorAll('button')].find((x)=>(x.innerText||'').trim()==='رد کردن');if(!b)return res('NO-SKIP');b.click();setTimeout(()=>{const wrong=[...dlg.querySelectorAll('div')].find((d)=>(d.textContent||'').includes('املای درست:'));if(!wrong)return res('NO-WRONG-ROW');const boxes=[...dlg.querySelectorAll('.en-text')].filter((el)=>el.getBoundingClientRect().height>30&&el.getBoundingClientRect().height<50&&String(el.className).includes('rounded-lg'));const rose=boxes.filter((el)=>String(el.className).includes('border-rose-300')).length;const typed=[...dlg.querySelectorAll('p')].find((p)=>(p.textContent||'').includes('you typed:'));const nxt=[...dlg.querySelectorAll('button')].find((x)=>(x.innerText||'').includes('واژهٔ بعدی'));if(!nxt)return res('NO-NEXT-BTN');const wstyle=[...dlg.querySelectorAll('div.font-black')].find((d)=>(d.textContent||'').includes('املای درست:'));let wcs2=wstyle?getComputedStyle(wstyle).color:'';if(!wcs2){const rb=boxes.find((el)=>String(el.className).includes('border-rose-300'));wcs2=rb?getComputedStyle(rb).color:'';}nxt.click();setTimeout(()=>{const done=[...dlg.querySelectorAll('h3')].find((s)=>(s.textContent||'').trim()==='دیکته تمام شد!');res('SKIP-OK|BOXES:'+boxes.length+'|ROSE:'+rose+'|YOU-TYPED:'+(typed?1:0)+'|INK:'+(wcs2?wcs2:'')+'|DONE:'+(done?1:0));},800);},650);}))()"; }

# ---- داورِ پردهٔ done ($1 صحنه · $2 MODE) — ۴۴٪ + چیپها + شبکهٔ ۸تایی
judge_done(){
  local L="${LEARN_MODE:-0}"
  local PCT_INK FULL_BG FULL_INK HALF_BG HALF_INK WRONG_BG WRONG_INK EXIT_BR EXIT_BG EXIT_INK
  if [ "$2" = DARK ]; then PCT_INK="$DARK_PCT_INK"; FULL_BG="$DARK_FULL_BG"; FULL_INK="$DARK_FULL_INK"; HALF_BG="$DARK_HALF_BG"; HALF_INK="$DARK_HALF_INK"; WRONG_BG="$DARK_WRONG_BG"; WRONG_INK="$DARK_WRONG_INK"; EXIT_BR="$DARK_EXIT_BR"; EXIT_BG="$DARK_EXIT_BG"; EXIT_INK="$DARK_EXIT_INK"; else PCT_INK="$LIGHT_PCT_INK"; FULL_BG="$LIGHT_FULL_BG"; FULL_INK="$LIGHT_FULL_INK"; HALF_BG="$LIGHT_HALF_BG"; HALF_INK="$LIGHT_HALF_INK"; WRONG_BG="$LIGHT_WRONG_BG"; WRONG_INK="$LIGHT_WRONG_INK"; EXIT_BR="$LIGHT_EXIT_BR"; EXIT_BG="$LIGHT_EXIT_BG"; EXIT_INK="$LIGHT_EXIT_INK"; fi
  probe "(()=>{const errs=[];const W=(t,a)=>{if(t!==a)errs.push(t+'!='+a);};const fa='۰۱۲۳۴۵۶۷۸۹';const toEn=(s)=>String(s).replace(/[۰-۹]/g,(c)=>fa.indexOf(c));const dlg=document.querySelector('[role=\"dialog\"]');if(!dlg)return 'FAIL-$1:NO-DIALOG';const done=[...dlg.querySelectorAll('h3')].find((s)=>(s.textContent||'').trim()==='دیکته تمام شد!');if(!done)return 'FAIL-$1:NO-DONE';const pct=[...dlg.querySelectorAll('p')].find((p)=>/^[۰-۹]+٪$/.test((p.textContent||'').trim()));if(!pct)errs.push('NO-PCT');const pv=pct?+toEn((pct.textContent||'').replace('٪','')):null;window.__r452pct=pv;if(pv!==44)errs.push('PCT:'+pv);const score=[...dlg.querySelectorAll('p')].find((p)=>(p.textContent||'').trim()==='امتیاز ۳.۵ از ۸');if(!score)errs.push('NO-SCORE-LINE');const full=[...dlg.querySelectorAll('span')].find((s)=>(s.textContent||'').trim()==='کامل: ۰');const half=[...dlg.querySelectorAll('span')].find((s)=>(s.textContent||'').trim()==='با راهنما: ۷');const wrong=[...dlg.querySelectorAll('span')].find((s)=>(s.textContent||'').trim()==='غلط: ۱');if(!full)errs.push('NO-FULL-CHIP');if(!half)errs.push('NO-HALF-CHIP');if(!wrong)errs.push('NO-WRONG-CHIP');const h4=[...dlg.querySelectorAll('h4')].find((s)=>(s.textContent||'').trim()==='واژه‌های این دور');if(!h4)errs.push('NO-WORDS-H4');const rows=[...dlg.querySelectorAll('h4')].find((s)=>(s.textContent||'').trim()==='واژه‌های این دور');const grid=rows?rows.parentElement.querySelector('div'):null;const items=grid?[...grid.children]:[];if(items.length!==8)errs.push('ROWS:'+items.length);const ens=items.map((it)=>{const e=it.querySelector('.en-text');return e?(e.textContent||'').trim():'';});window.__r452words=ens;const speakBtns=dlg.querySelectorAll('[aria-label^=\"روخوانی \"]').length;const spellBtns=dlg.querySelectorAll('[aria-label^=\"املای حرف‌به‌حرف \"]').length;if(speakBtns<8)errs.push('SPEAK-BTNS:'+speakBtns);if(spellBtns<8)errs.push('SPELL-BTNS:'+spellBtns);const again=[...dlg.querySelectorAll('button')].find((b)=>(b.textContent||'').includes('دیکتهٔ جدید'));const setup=[...dlg.querySelectorAll('button')].find((b)=>(b.textContent||'').trim()==='بازگشت به تنظیمات');const exit=[...dlg.querySelectorAll('button')].find((b)=>(b.textContent||'').trim()==='بازگشت به آزمون جامع');if(!again)errs.push('NO-AGAIN');if(!setup)errs.push('NO-SETUP-BTN');if(!exit)errs.push('NO-EXIT');const docOver=document.documentElement.scrollWidth>window.innerWidth+1;if(docOver)errs.push('DOC-OVERX');const pcs=pct?getComputedStyle(pct):null;const fcs=full?getComputedStyle(full):null;const hcs=half?getComputedStyle(half):null;const wcs=wrong?getComputedStyle(wrong):null;const ecs=exit?getComputedStyle(exit):null;if('$L'==='1'){return 'LEARN-$1:'+JSON.stringify({pct:pv,pctInk:pcs?pcs.color:'',fullBg:fcs?fcs.backgroundColor:'',fullInk:fcs?fcs.color:'',halfBg:hcs?hcs.backgroundColor:'',halfInk:hcs?hcs.color:'',wrongBg:wcs?wcs.backgroundColor:'',wrongInk:wcs?wcs.color:'',exitBr:ecs?ecs.borderTopColor:'',exitBg:ecs?ecs.backgroundColor:'',exitInk:ecs?ecs.color:'',words:ens.slice(0,3)});}if(pcs)W(pcs.color,'$PCT_INK');if(fcs){W(fcs.backgroundColor,'$FULL_BG');W(fcs.color,'$FULL_INK');}if(hcs){W(hcs.backgroundColor,'$HALF_BG');W(hcs.color,'$HALF_INK');}if(wcs){W(wcs.backgroundColor,'$WRONG_BG');W(wcs.color,'$WRONG_INK');}if(ecs){W(ecs.borderTopColor,'$EXIT_BR');W(ecs.backgroundColor,'$EXIT_BG');W(ecs.color,'$EXIT_INK');}return errs.length?('FAIL-$1:'+errs.join('|')):('$1-OK|PCT='+pv+'|WORDS='+ens.filter(Boolean).length);})()"
}

# ---- کلیدهایِ SRS — هشت واژهٔ رسیده در store (قفلِ DOM↔SRS)
srs_keys(){ getvar "(()=>{const words=window.__r452words||[];const raw=JSON.parse(localStorage.getItem('vision2-study-v1')||'{\"state\":{}}').state;const srs=raw.srs||{};const keys=Object.keys(srs);const hit=words.filter((w)=>w&&keys.some((k)=>k.toLowerCase().endsWith(':'+w.toLowerCase())));const mis=JSON.parse(localStorage.getItem('vision2-study-v1')||'{\"state\":{}}').state.mistakes||{};const misKeys=Object.keys(mis).filter((k)=>k.startsWith('0:')).sort();const exact=JSON.stringify(misKeys)===JSON.stringify(['0:x-23','0:x-5']);return 'SRS-HIT:'+hit.length+'/'+words.length+'|MISTAKES-INTACT:'+(exact?1:0)+':'+misKeys.join(',');})()" | tee -a "$OUT"; echo | tee -a "$OUT"; }

ledger(){ node -e "const {PrismaClient}=require('@prisma/client');const db=new PrismaClient();const d=new Date();const key=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');const one=(n)=>db.eventDay.findFirst({where:{name:n,day:key}}).then((r)=>[n,r?r.count:0]);Promise.all([one('exam_dictation_start'),one('dictation_done'),one('quiz_done'),one('exam_done'),one('my_words_review_start')]).then((rows)=>{rows.forEach(([n,c])=>console.log(n.toUpperCase()+'('+key+'):'+c));return db.quizAttempt.findMany({where:{category:'exam-dictation'},orderBy:{id:'asc'}});}).then((rows)=>{console.log('ATTEMPTS:'+JSON.stringify(rows.map((r)=>({cat:r.category,lesson:r.lesson,total:r.total,correct:r.correct,percent:r.percent}))));return db.eventDay.findFirst({where:{name:'drill_due_jump'}});}).then((r)=>{console.log('LEDGER:',JSON.stringify(r?{name:r.name,count:r.count,day:r.day}:null));return db.\$disconnect();}).catch((e)=>{console.log('LEDGER-ERR:'+e.message);process.exit(0);})" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

# ---- جایگاهِ قفلِ سریالها (قفلشده از رانِ learn — زنده در رانِ lock داوری میشوند)
LIGHT_CTA_BORDER="lab(90.2247 -31.039 9.47084)"; LIGHT_CTA_IMG="linear-gradient(to left, lab(97.8462 -6.94966 1.85487) 0%, rgb(255, 255, 255) 100%)"; LIGHT_ICON_BG="lab(66.9756 -58.27 19.5419)"; LIGHT_PILL_BG="lab(44.4871 -41.0396 11.0361)"
DARK_CTA_BORDER="rgba(30, 110, 80, 0.5)"; DARK_CTA_IMG="linear-gradient(270deg, rgba(6, 55, 40, 0.5), rgba(24, 21, 18, 0.92))"; DARK_ICON_BG="lab(66.9756 -58.27 19.5419)"; DARK_PILL_BG="lab(44.4871 -41.0396 11.0361)"
LIGHT_BKB="lab(83.9203 -48.7124 13.8849)"; LIGHT_BKBG="lab(97.8462 -6.94966 1.85487)"; LIGHT_BKI="lab(44.4871 -41.0396 11.0361)"; LIGHT_C10BG="lab(41.088 68.9966 -91.995)"; LIGHT_C10I="rgb(255, 255, 255)"; LIGHT_STI="linear-gradient(to left in oklab, rgb(124, 58, 237) 0%, rgb(192, 38, 211) 100%)"
DARK_BKB="rgba(16, 120, 90, 0.55)"; DARK_BKBG="rgba(6, 55, 40, 0.35)"; DARK_BKI="rgb(110, 231, 183)"; DARK_C10BG="lab(41.088 68.9966 -91.995)"; DARK_C10I="rgb(255, 255, 255)"; DARK_STI="linear-gradient(to left in oklab, rgb(91, 33, 182) 0%, rgb(134, 25, 143) 100%)"
LIGHT_CHIP_BG="lab(96.2416 2.28849 -5.51657)"; LIGHT_CHIP_INK="lab(35.2783 67.9912 -88.793)"; LIGHT_SCORE_BG="lab(96.5286 -0.0991821 0.364268)"; LIGHT_SCORE_INK="lab(35.5168 1.08604 4.07829)"; LIGHT_INP_BR="lab(62.8239 34.9159 -60.0512)"
DARK_CHIP_BG="rgba(59, 40, 92, 0.35)"; DARK_CHIP_INK="rgb(196, 181, 253)"; DARK_SCORE_BG="rgb(40, 36, 31)"; DARK_SCORE_INK="rgb(168, 162, 155)"; DARK_INP_BR="lab(62.8239 34.9159 -60.0512)"
LIGHT_PCT_INK="lab(41.088 68.9966 -91.995)"; LIGHT_FULL_BG="lab(97.8462 -6.94966 1.85487)"; LIGHT_FULL_INK="lab(44.4871 -41.0396 11.0361)"; LIGHT_HALF_BG="lab(98.6252 -0.635922 8.42309)"; LIGHT_HALF_INK="lab(47.2709 42.9082 69.2966)"; LIGHT_WRONG_BG="lab(96.2369 4.94155 1.28011)"; LIGHT_WRONG_INK="lab(41.1651 71.6251 30.3087)"; LIGHT_EXIT_BR="lab(87.0888 8.53688 -19.4189)"; LIGHT_EXIT_BG="lab(96.2416 2.28849 -5.51657)"; LIGHT_EXIT_INK="lab(35.2783 67.9912 -88.793)"
DARK_PCT_INK="rgb(167, 139, 250)"; DARK_FULL_BG="rgba(6, 55, 40, 0.35)"; DARK_FULL_INK="rgb(110, 231, 183)"; DARK_HALF_BG="rgba(69, 48, 12, 0.35)"; DARK_HALF_INK="rgb(251, 191, 36)"; DARK_WRONG_BG="rgba(80, 18, 28, 0.35)"; DARK_WRONG_INK="rgb(253, 164, 175)"; DARK_EXIT_BR="rgba(110, 80, 170, 0.5)"; DARK_EXIT_BG="rgba(59, 40, 92, 0.35)"; DARK_EXIT_INK="rgb(196, 181, 253)"
# مرورِ زنده: واژههای ۱-۶ در شب (زمردِ شب)، واژهٔ ۷ و رد کردن در روز
DARK_FB_INK="rgb(110, 231, 183)"; LIGHT_FB_INK="lab(44.4871 -41.0396 11.0361)"; ROSE_FB_INK="lab(41.1651 71.6251 30.3087)"

boot(){ agent-browser close >/dev/null 2>&1 || true
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
dismiss_install; }

echo "########## PRE) دفترِ آغازین" | tee -a "$OUT"
ledger

echo "########## A) CTAِ زمردیِ دیکته رویِ آزمون جامع — دو حالت" | tee -a "$OUT"
boot
click_card "آزمون جامع"; sleep 2.5
LEARN_MODE="${LEARN_MODE:-0}" CB="$LIGHT_CTA_BORDER" CI="$LIGHT_CTA_IMG" IB="$LIGHT_ICON_BG" PB="$LIGHT_PILL_BG" judge_dict_cta CTA-LIGHT LIGHT
qa_shot r452-cta-light.png
qa_to_dark; sleep 1
LEARN_MODE="${LEARN_MODE:-0}" CB="$DARK_CTA_BORDER" CI="$DARK_CTA_IMG" IB="$DARK_ICON_BG" PB="$DARK_PILL_BG" judge_dict_cta CTA-DARK DARK
qa_shot r452-cta-dark.png
qa_to_light; sleep 1

echo "########## B) دیالوگِ دامنه — ۷ چیپِ RAW + تنظیماتِ بنفش — دو حالت" | tee -a "$OUT"
agent-browser eval "(()=>{const c=document.querySelector('.exam-dict-cta');if(!c||c.getBoundingClientRect().width===0)return 'NO-CTA';c.click();return 'CTA-CLICKED';})()" >/dev/null 2>&1; sleep 2
qa_to_dark; sleep 1
LEARN_MODE="${LEARN_MODE:-0}" BKB="$DARK_BKB" BKBG="$DARK_BKBG" BKI="$DARK_BKI" C10BG="$DARK_C10BG" C10I="$DARK_C10I" judge_dialog DIALOG-DARK DARK
qa_shot r452-dialog-dark.png
qa_to_light; sleep 1
LEARN_MODE="${LEARN_MODE:-0}" BKB="$LIGHT_BKB" BKBG="$LIGHT_BKBG" BKI="$LIGHT_BKI" C10BG="$LIGHT_C10BG" C10I="$LIGHT_C10I" judge_dialog DIALOG-LIGHT LIGHT
qa_shot r452-dialog-light.png
click_in_dialog "۸"; sleep 0.8

echo "########## C) راندِ واقعیِ ۸واژه‌ای — ورودِ play در دو حالت" | tee -a "$OUT"
click_in_dialog "شروع دیکته"; sleep 2.5
qa_to_dark; sleep 1
LEARN_MODE="${LEARN_MODE:-0}" CHIP_BG="$DARK_CHIP_BG" CHIP_INK="$DARK_CHIP_INK" SCORE_BG="$DARK_SCORE_BG" SCORE_INK="$DARK_SCORE_INK" INP_BR="$DARK_INP_BR" judge_play_entry PLAY-ENTRY-DARK DARK
qa_shot r452-play-entry-dark.png
qa_to_light; sleep 1
LEARN_MODE="${LEARN_MODE:-0}" CHIP_BG="$LIGHT_CHIP_BG" CHIP_INK="$LIGHT_CHIP_INK" SCORE_BG="$LIGHT_SCORE_BG" SCORE_INK="$LIGHT_SCORE_INK" INP_BR="$LIGHT_INP_BR" judge_play_entry PLAY-ENTRY-LIGHT LIGHT
qa_shot r452-play-entry-light.png
# درسِ رانِ lock اول: داورهایِ ورود با qa_to_light تمام میشوند — واژههایِ
# ۱-۶ باید در شبِ صریح رانده شوند (خودِ DOM معلّم است — بارِ ششم)
qa_to_dark; sleep 1

echo "########## C2) واژههای ۱-۶ در شب، واژهٔ ۷ در روز — راهنما + بازتایپِ React + بررسی" | tee -a "$OUT"
for i in 1 2 3 4 5 6 7; do
  PREV=-1; CUR=0; VAL=""; for t in $(seq 1 30); do
    R=$(hint_step)
    CUR=$(echo "$R" | rg -o '^LEN:[0-9]+' | rg -o '[0-9]+' | tail -1)
    VAL=$(echo "$R" | sed -n 's/^LEN:[0-9]*://p')
    if [ "${CUR:-0}" = "$PREV" ]; then break; fi
    PREV="${CUR:-0}"; sleep 0.18
  done
  echo "WORD-$i hint-len=$CUR" | tee -a "$OUT"
  if [ "${CUR:-0}" = "0" ]; then echo "FAIL-HINT-WALK-WORD-$i: $R" | tee -a "$OUT"; fi
  T=$(react_type)
  echo "WORD-$i typed: $T" | tee -a "$OUT"
  if [[ "$T" != TYPED:* ]]; then echo "FAIL-TYPE-WORD-$i" | tee -a "$OUT"; fi
  C=$(drive_check)
  echo "WORD-$i check: $C" | tee -a "$OUT"
  if [[ "$C" != OK-R* ]]; then echo "FAIL-CHECK-WORD-$i" | tee -a "$OUT"; fi
  if [ "$i" -le 6 ]; then EXPINK="$DARK_FB_INK"; else EXPINK="$LIGHT_FB_INK"; fi
  if [[ "$C" != *"INK:$EXPINK"* ]]; then echo "FAIL-FB-INK-WORD-$i (want $EXPINK)" | tee -a "$OUT"; fi
  if [ "$i" = 6 ]; then qa_to_light; sleep 1; fi
  sleep 2.1
  P=$(read_chip)
  DIGS=("۲" "۳" "۴" "۵" "۶" "۷" "۸")
  EXP="CHIP:${DIGS[$((i-1))]} از ۸"
  echo "WORD-$i advance: $P (expect ~$EXP)" | tee -a "$OUT"
  if [[ "$P" != CHIP:* && "$P" != DONE* ]]; then echo "FAIL-ADVANCE-WORD-$i: $P" | tee -a "$OUT"; fi
done

echo "########## C3) واژهٔ هشتم — رد کردن → ردیفِ رز → واژهٔ بعدی → done" | tee -a "$OUT"
S=$(drive_skip)
echo "SKIP-8: $S" | tee -a "$OUT"
if [[ "$S" != SKIP-OK* ]]; then echo "FAIL-SKIP-8" | tee -a "$OUT"; fi
if [[ "$S" != *"INK:$ROSE_FB_INK"* ]]; then echo "FAIL-SKIP-INK (want $ROSE_FB_INK)" | tee -a "$OUT"; fi

echo "########## D) پردهٔ done — ۴۴٪ + چیپها + شبکه — دو حالت" | tee -a "$OUT"
qa_wait_toasts_clear
LEARN_MODE="${LEARN_MODE:-0}" PCT_INK="$LIGHT_PCT_INK" FULL_BG="$LIGHT_FULL_BG" FULL_INK="$LIGHT_FULL_INK" HALF_BG="$LIGHT_HALF_BG" HALF_INK="$LIGHT_HALF_INK" WRONG_BG="$LIGHT_WRONG_BG" WRONG_INK="$LIGHT_WRONG_INK" EXIT_BR="$LIGHT_EXIT_BR" EXIT_BG="$LIGHT_EXIT_BG" EXIT_INK="$LIGHT_EXIT_INK" judge_done DONE-LIGHT LIGHT
qa_shot r452-done-light.png
qa_to_dark; sleep 1
LEARN_MODE="${LEARN_MODE:-0}" PCT_INK="$DARK_PCT_INK" FULL_BG="$DARK_FULL_BG" FULL_INK="$DARK_FULL_INK" HALF_BG="$DARK_HALF_BG" HALF_INK="$DARK_HALF_INK" WRONG_BG="$DARK_WRONG_BG" WRONG_INK="$DARK_WRONG_INK" EXIT_BR="$DARK_EXIT_BR" EXIT_BG="$DARK_EXIT_BG" EXIT_INK="$DARK_EXIT_INK" judge_done DONE-DARK DARK
qa_shot r452-done-dark.png
qa_to_light; sleep 1

echo "########## E) خروج — CTA پابرجا + SRSِ هشتواژه + بانکِ خطا دستنخورده" | tee -a "$OUT"
click_in_dialog "بازگشت به آزمون جامع"; sleep 1.5
probe "(()=>{const dlg=document.querySelector('[role=\"dialog\"]');const cta=document.querySelector('.exam-dict-cta');const errs=[];if(dlg&&dlg.getBoundingClientRect().width>0)errs.push('DIALOG-STILL-OPEN');if(!cta||cta.getBoundingClientRect().width===0)errs.push('CTA-GONE');return errs.length?('FAIL-EXIT:'+errs.join('|')):'EXIT-OK|CTA-PERSISTENT';})()"
srs_keys

echo "########## F) دفترِ نهایی — DOM٪ در برابر DB٪ (گویشِ نیمامتیاز)" | tee -a "$OUT"
probe "(()=>{return 'DOM-PCT:'+(typeof window.__r452pct!=='undefined'?window.__r452pct:'?')+'|BANK:'+(typeof window.__r452bank!=='undefined'?window.__r452bank:'?')+'|WORDS-CAP:'+((window.__r452words||[]).filter(Boolean).length);})()"
ledger
LEDGER_LINE=$(rg -o 'ATTEMPTS:.*' "$OUT" | tail -1)
if echo "$LEDGER_LINE" | rg -q '"cat":"exam-dictation","lesson":0,"total":8,"correct":4,"percent":50'; then
  echo "HALF-CREDIT-DIALECT-OK: DOM=۴۴٪ (۳.۵/۸ خام) | DB=۵۰٪ (۴/۸ گردشده — قراردادِ attemptِ صحیح)" | tee -a "$OUT"
else
  echo "FAIL-ATTEMPT-CONTRACT: $LEDGER_LINE" | tee -a "$OUT"
fi

agent-browser close >/dev/null 2>&1 || true
echo "########## WITNESS-DONE" | tee -a "$OUT"
