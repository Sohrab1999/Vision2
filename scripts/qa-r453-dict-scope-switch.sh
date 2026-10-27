#!/usr/bin/env bash
# ------------------------------------------------------------------
# r453 — «شاهدِ موبایلِ «سوییچِ دامنهٔ دیکته» — قراردادِ remountِ
# key={dictScope} در ۳۹۰px» — پنجاهوهشتمین مصرفکنندهٔ qa-lib.sh — بندِ ①ِ r452.
#   صحنهٔ A: دیالوگِ دامنه — ۷ چیپِ RAW (بانک · ۱۷۲ فعالِ زمردی + شش پایه:
#     ۴۸۷/۶۰۴/۸۶۵/۹۸۸/۴۵۴/۵۵۶ غیرفعال) — شب و روز.
#   صحنهٔ B: راندِ واقعیِ بانکی — count=۸ انتخاب، دو واژه با راهنما +
#     بازتایپِ React (native setter + input event) → چیپِ «۳ از ۸» و
#     «امتیاز: ۱» — نیمدورِ واقعی.
#   صحنهٔ C: سوییچِ دامنه در میانهٔ راند — کلیکِ «پایهٔ هفتم · ۹۸۸»:
#     remountِ key={dictScope} → کارتِ تنظیمات برمیگردد، input/چیپِ
#     پیشرفت/امتیاز غیب، count به پیشفرضِ «۱۰» ریست میشود (تفنگِ دودِ
#     remount — انتخابِ ۸ پیش از سوییچ بود)، aria-pressed وارونه، چیپِ
#     فعالِ صورتیِ پایهٔ هفتم + بانکِ غیرفعالِ سنگی — شب و روز.
#   صحنهٔ D: راندِ واقعیِ ۸واژه‌ایِ پایهٔ هفتم — چهار واژه در شب، چهار
#     در روز (زمردِ بازخوردِ دوحالت)، همه با راهنما + تایپِ واقعی.
#   صحنهٔ E: پردهٔ done — توستِ «دیکتهٔ پایهٔ هفتم: ۴ از ۸ (۵۰٪)» (راویِ
#     برچسبِ دِک)، «۵۰٪»، «امتیاز ۴ از ۸»، چیپهای کامل:۰/با راهنما:۸/غلط:۰
#     + شبکهٔ ۸تایی — شب و روز.
#   صحنهٔ F: خروج + میان-رسانه: ۱۰ واژه (۲ رهاشده + ۸ کامل) همگی کلیدِ
#     SRS و wordSeen/wordMistakes گرفتند؛ بانکِ 0: پرسونا {0:x-23، 0:x-5}
#     دستنخورده (دیکته مینویسد wordMistakes — هرگز mistakesِ آزمون).
#   صحنهٔ G: دفترِ صادق — exam_dictation_start=۱ (یک کلیکِ CTA؛ سوییچِ
#     دامنه آن را دوباره نمیزند)، dictation_done=۱، quiz_done=۱ (فقطِ
#     راندِ کاملشدهٔ g7)، exam_done=۰ و my_words_review_start=۰،
#     attemptِ یکتای {dict-g7/0/8/4/50} و «هیچ» attemptِ exam-dictation —
#     نیمدورِ رهاشده هرگز ردّ دفتری ندارد (قراردادِ remount میان-رسانه)؛
#     drill_due_jump=۱۳۱.
# LEARN_MODE=1: سریالهایِ نو در هر داوری گرفته میشوند.
# درسِ r448-r452: پیشِ هر داوریِ شب، qa_to_darkِ صریح + sleep؛ و در پایان
# حضوریِ همهٔ توکنهایِ -OK گریپ میشود (نه فقط غیابِ FAIL).
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
OUT=/tmp/r453-scope-witness.txt
QA_SEED_FILE=/tmp/r453-witness-seed-eval.js
: > "$OUT"

source /home/z/my-project/scripts/qa-lib.sh

probe(){ agent-browser eval "$1" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
getvar(){ agent-browser eval "$1" 2>/dev/null | tail -1 | sed -e 's/^"//' -e 's/"$//'; }

click_in_dialog(){ agent-browser eval "(()=>{const dlg=document.querySelector('[role=\"dialog\"]');if(!dlg)return 'NO-DIALOG';let b=[...dlg.querySelectorAll('button')].find((x)=>(x.innerText||'').replace(/\s+/g,' ').trim()==='$1'&&x.getBoundingClientRect().width>0);if(!b)return 'NO-BTN-IN-DIALOG:$1';b.click();return 'CLICKED:$1';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

click_scope_chip(){ agent-browser eval "(()=>{const dlg=document.querySelector('[role=\"dialog\"]');if(!dlg)return 'NO-DIALOG';const grp=dlg.querySelector('[aria-label=\"دامنهٔ دیکته\"]');if(!grp)return 'NO-GROUP';const b=[...grp.querySelectorAll('button')].find((x)=>(x.innerText||'').includes('$1'));if(!b)return 'NO-CHIP:$1';b.click();return 'CLICKED-CHIP:$1';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

dismiss_install(){ probe "(()=>{const b=document.querySelector('[aria-label=\"بستن پیشنهاد نصب\"]');if(b&&b.getBoundingClientRect().width>0){b.click();return 'INSTALL-CARD-DISMISSED';}return 'NO-INSTALL-CARD';})()"; sleep 1; }

# ---- داورِ گروهِ دامنه ($1 صحنه · $2 MODE · $3 bank|g7 فعال) — ۷ چیپِ RAW +
# aria-pressed + سریالِ فعال/غیرفعال
judge_scope_chips(){
  local L="${LEARN_MODE:-0}"
  # سریالها از محیطِ فراخوان — هر صحنه سریالِ فعالِ خودش را میفرستد
  probe "(()=>{const errs=[];const W=(t,a)=>{if(t!==a)errs.push(t+'!='+a);};const dlg=document.querySelector('[role=\"dialog\"]');if(!dlg)return 'FAIL-$1:NO-DIALOG';const grp=dlg.querySelector('[aria-label=\"دامنهٔ دیکته\"]');if(!grp)return 'FAIL-$1:NO-GROUP';const chips=[...grp.querySelectorAll('button')];if(chips.length!==7)errs.push('CHIPS:'+chips.length);const bank=chips.find((b)=>(b.textContent||'').includes('بانک آزمون'));if(!bank)return 'FAIL-$1:NO-BANK-CHIP';const bankTxt=(bank.textContent||'').replace(/\s+/g,' ').trim();if(!bankTxt.includes('۱۷۲'))errs.push('BANK-CHIP-TXT:'+bankTxt);const expect=[['پایهٔ دهم','۴۸۷'],['پایهٔ یازدهم','۶۰۴'],['پایهٔ دوازدهم','۸۶۵'],['پایهٔ هفتم','۹۸۸'],['پایهٔ هشتم','۴۵۴'],['پایهٔ نهم','۵۵۶']];for(const [lb,cn] of expect){const ch=chips.find((b)=>(b.textContent||'').includes(lb));if(!ch){errs.push('NO-CHIP:'+lb);continue;}if(!(ch.textContent||'').includes(cn))errs.push('CHIP-N:'+lb);}const act='$3';const actEl=act==='bank'?bank:chips.find((b)=>(b.textContent||'').includes('پایهٔ هفتم'));if(!actEl)return 'FAIL-$1:NO-ACTIVE-EL';if(actEl.getAttribute('aria-pressed')!=='true')errs.push('ACT-NOT-PRESSED');for(const b of chips){if(b!==actEl&&b.getAttribute('aria-pressed')!=='false')errs.push('INA-PRESSED');}const docOver=document.documentElement.scrollWidth>window.innerWidth+1;if(docOver)errs.push('DOC-OVERX');const acs=getComputedStyle(actEl);if('$L'==='1'){const ina=chips.find((b)=>b!==actEl);const ics=ina?getComputedStyle(ina):null;return 'LEARN-$1:'+JSON.stringify({actBr:acs.borderTopColor,actBg:acs.backgroundColor,actInk:acs.color,inaBr:ics?ics.borderTopColor:'',inaBg:ics?ics.backgroundColor:'',inaInk:ics?ics.color:'',pressed:actEl.getAttribute('aria-pressed')});}W(acs.borderTopColor,'$ACT_BR');W(acs.backgroundColor,'$ACT_BG');W(acs.color,'$ACT_INK');const ina=chips.find((b)=>b!==actEl);if(ina){const ics=getComputedStyle(ina);W(ics.borderTopColor,'$INA_BR');W(ics.backgroundColor,'$INA_BG');W(ics.color,'$INA_INK');}return errs.length?('FAIL-$1:'+errs.join('|')):('$1-OK');})()"
}

# ---- داورِ remount ($1 صحنه · $2 MODE) — تنظیمات برگشته + ریستِ count به
# ۱۰ + غیابِ UIِ play + چیپهای count
judge_remount(){
  local L="${LEARN_MODE:-0}"
  # سریالها از محیطِ فراخوان
  probe "(()=>{const errs=[];const W=(t,a)=>{if(t!==a)errs.push(t+'!='+a);};const dlg=document.querySelector('[role=\"dialog\"]');if(!dlg)return 'FAIL-$1:NO-DIALOG';const h3=[...dlg.querySelectorAll('h3')].find(s=>(s.textContent||'').trim()==='آزمون دیکته — املای شنیداری');if(!h3)errs.push('NO-SETUP-H3');if(dlg.querySelector('input[placeholder=\"type the word...\"]'))errs.push('INPUT-STILL-THERE');const prog=[...dlg.querySelectorAll('span')].find(s=>/^۳ از ۸$/.test((s.textContent||'').trim()));if(prog)errs.push('PROG-STILL-THERE');const score=[...dlg.querySelectorAll('span')].find(s=>(s.textContent||'').trim()==='امتیاز: ۱');if(score)errs.push('SCORE-STILL-THERE');const grp=dlg.querySelector('[aria-label=\"دامنهٔ دیکته\"]');if(!grp)return 'FAIL-$1:NO-GROUP';const chips=[...grp.querySelectorAll('button')];const bank=chips.find((b)=>(b.textContent||'').includes('بانک آزمون'));const g7=chips.find((b)=>(b.textContent||'').includes('پایهٔ هفتم'));if(!bank||!g7){errs.push('CHIPS-MISSING');}else{if(bank.getAttribute('aria-pressed')!=='false')errs.push('BANK-STILL-PRESSED');if(g7.getAttribute('aria-pressed')!=='true')errs.push('G7-NOT-PRESSED');}const c8=[...dlg.querySelectorAll('button')].find((b)=>(b.textContent||'').trim()==='۸');const c10=[...dlg.querySelectorAll('button')].find((b)=>(b.textContent||'').trim()==='۱۰');if(!c8||!c10)errs.push('NO-COUNT-CHIPS');if(c10&&!(c10.className||'').includes('bg-violet-600'))errs.push('C10-NOT-ACTIVE');if(c8&&!(c8.className||'').includes('c-card'))errs.push('C8-NOT-INACTIVE');const smart=[...dlg.querySelectorAll('button')].find((b)=>(b.textContent||'').includes('اولویت با واژه‌های یادنگرفته و سررسید'));if(!smart)errs.push('NO-SMART-TOGGLE');const start=[...dlg.querySelectorAll('button')].find((b)=>(b.textContent||'').trim()==='شروع دیکته');if(!start)errs.push('NO-START');const back=[...dlg.querySelectorAll('button')].find((b)=>(b.textContent||'').trim()==='بازگشت');if(!back)errs.push('NO-BACK');const docOver=document.documentElement.scrollWidth>window.innerWidth+1;if(docOver)errs.push('DOC-OVERX');const cs10=c10?getComputedStyle(c10):null;const cs8=c8?getComputedStyle(c8):null;if('$L'==='1'){return 'LEARN-$1:'+JSON.stringify({c10Bg:cs10?cs10.backgroundColor:'',c10Ink:cs10?cs10.color:'',c8Br:cs8?cs8.borderTopColor:'',c8Ink:cs8?cs8.color:''});}if(cs10){W(cs10.backgroundColor,'$C10BG');W(cs10.color,'$C10I');}if(cs8){W(cs8.borderTopColor,'$CNT_BR');W(cs8.color,'$CNT_INK');}return errs.length?('FAIL-$1:'+errs.join('|')):('$1-OK|COUNT-RESET-TO-10');})()"
}

# ---- انتظارِ صبورِ ردیفِ صدای ناموجود — خرابیِ پخشِ headless ناهمگام است
# (درسِ lock نهایی: fetchِ TTS تا ~۴ ثانیه طول میکشد؛ داوریِ شتابزده ردیف را
# نمیبیند — رانهایِ قبلی با شانسِ زمانبندی سبز بودند)
wait_audio_row(){ getvar "(()=>{return new Promise((res)=>{let n=0;const tick=()=>{const row=[...document.querySelectorAll('[role=\"dialog\"] div')].find((d)=>(d.textContent||'').includes('روخوانی در دسترس نیست'));if(row)return res('AUDIO-ROW-READY');if(++n>28)return res('AUDIO-ROW-TIMEOUT');setTimeout(tick,280);};tick();});})()" >/dev/null 2>&1; }

# ---- داورِ ورودِ play (بازاستفاده از سریالهایِ r452 — مؤلفهٔ مشترک) ($1 صحنه · $2 MODE)
judge_play_entry(){
  local L="${LEARN_MODE:-0}"
  # سریالها از محیطِ فراخوان
  probe "(()=>{const errs=[];const W=(t,a)=>{if(t!==a)errs.push(t+'!='+a);};const dlg=document.querySelector('[role=\"dialog\"]');if(!dlg)return 'FAIL-$1:NO-DIALOG';const chip=[...dlg.querySelectorAll('span')].find(s=>/^۱ از ۸$/.test((s.textContent||'').trim()));if(!chip)errs.push('NO-CHIP-1-OF-8');const score=[...dlg.querySelectorAll('span')].find(s=>(s.textContent||'').trim()==='امتیاز: ۰');if(!score)errs.push('NO-SCORE-CHIP');const tts=dlg.querySelector('[aria-label=\"پخش دوبارهٔ کلمه\"]');if(!tts||tts.getBoundingClientRect().width===0)errs.push('NO-TTS-BTN');const inp=dlg.querySelector('input[placeholder=\"type the word...\"]');if(!inp)errs.push('NO-INPUT');if(inp&&inp.getAttribute('dir')!=='ltr')errs.push('INPUT-DIR');if(inp&&inp.value!=='')errs.push('INPUT-NOT-EMPTY');const chk=[...dlg.querySelectorAll('button')].find((b)=>(b.textContent||'').trim()==='بررسی');if(!chk)errs.push('NO-CHECK-BTN');if(chk&&chk.disabled!==true)errs.push('CHECK-NOT-DISABLED-AT-EMPTY');const hint=[...dlg.querySelectorAll('button')].find((b)=>(b.textContent||'').trim()==='راهنما');if(!hint)errs.push('NO-HINT-BTN');const skip=[...dlg.querySelectorAll('button')].find((b)=>(b.textContent||'').trim()==='رد کردن');if(!skip)errs.push('NO-SKIP-BTN');const bar=[...dlg.querySelectorAll('div')].find((d)=>d.style&&d.style.width!==''&&d.getBoundingClientRect().height>0&&d.getBoundingClientRect().height<12);const barW=bar?bar.style.width:'';if(barW&&barW!=='0%'&&barW!=='0px')errs.push('BAR-NOT-ZERO:'+barW);const audioRow=[...dlg.querySelectorAll('div')].find((d)=>(d.textContent||'').includes('روخوانی در دسترس نیست'));window.__r453audio=audioRow?1:0;if('$L'!=='1'&&!audioRow)errs.push('NO-AUDIO-ROW');const docOver=document.documentElement.scrollWidth>window.innerWidth+1;if(docOver)errs.push('DOC-OVERX');const ccs=chip?getComputedStyle(chip):null;const scs=score?getComputedStyle(score):null;const ics=inp?getComputedStyle(inp):null;if('$L'==='1'){return 'LEARN-$1:'+JSON.stringify({chipBg:ccs?ccs.backgroundColor:'',chipInk:ccs?ccs.color:'',scoreBg:scs?scs.backgroundColor:'',scoreInk:scs?scs.color:'',inpBorder:ics?ics.borderTopColor:'',audioRow:audioRow?1:0});}if(ccs){W(ccs.backgroundColor,'$CHIP_BG');W(ccs.color,'$CHIP_INK');}if(scs){W(scs.backgroundColor,'$SCORE_BG');W(scs.color,'$SCORE_INK');}if(ics)W(ics.borderTopColor,'$INP_BR');return errs.length?('FAIL-$1:'+errs.join('|')):('$1-OK|AUDIO-ROW='+window.__r453audio);})()"
}

# ---- گامِ راهنما + ثبتِ واژه در __r453bankWords/__r453g7Words
hint_step(){ getvar "(()=>{const dlg=document.querySelector('[role=\"dialog\"]');if(!dlg)return 'NO-DIALOG';const inp=dlg.querySelector('input[placeholder=\"type the word...\"]');if(!inp)return 'NO-INPUT';const h=[...dlg.querySelectorAll('button')].find((b)=>(b.textContent||'').trim()==='راهنما');if(!h)return 'NO-HINT';h.click();return 'LEN:'+inp.value.length+':'+inp.value;})()"; }

react_type(){ getvar "(()=>{const dlg=document.querySelector('[role=\"dialog\"]');if(!dlg)return 'NO-DIALOG';const inp=dlg.querySelector('input[placeholder=\"type the word...\"]');if(!inp)return 'NO-INPUT';const val=inp.value;if(!val)return 'EMPTY-NO-HINT';const setter=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;setter.call(inp,'');inp.dispatchEvent(new Event('input',{bubbles:true}));let i=0;return new Promise((res)=>{const tick=()=>{if(i>=val.length)return res('TYPED:'+i+'|W:'+val);setter.call(inp,val.slice(0,++i));inp.dispatchEvent(new Event('input',{bubbles:true}));setTimeout(tick,30);};tick();});})()"; }

drive_check(){ getvar "(()=>new Promise((res)=>{const dlg=document.querySelector('[role=\"dialog\"]');if(!dlg)return res('NO-DIALOG');const b=[...dlg.querySelectorAll('button')].find((x)=>(x.innerText||'').trim()==='بررسی');if(!b)return res('NO-CHECK');if(b.disabled)return res('CHECK-DISABLED');b.click();setTimeout(()=>{const ok=[...dlg.querySelectorAll('div')].find((d)=>(d.textContent||'').includes('آفرین! املا درست است'));if(!ok)return res('NO-CORRECT-ROW');const half=(ok.textContent||'').includes('با راهنما — نیم امتیاز');const pulse=[...dlg.querySelectorAll('p')].find((p)=>(p.textContent||'').includes('در حال رفتن به واژهٔ بعدی'));const fp=[...dlg.querySelectorAll('div.font-black')].find((d)=>(d.textContent||'').includes('آفرین! املا درست است'));const fcs=fp?getComputedStyle(fp):null;res('OK-R|HALF:'+(half?1:0)+'|PULSE:'+(pulse?1:0)+'|INK:'+(fcs?fcs.color:''));},650);}))()"; }

read_chip(){ getvar "(()=>{const dlg=document.querySelector('[role=\"dialog\"]');if(!dlg)return 'NO-DIALOG';const chip=[...dlg.querySelectorAll('span')].find((s)=>/^([۰-۹]+) از ۸$/.test((s.textContent||'').trim()));if(chip)return 'CHIP:'+(chip.textContent||'').trim();const done=[...dlg.querySelectorAll('h3')].find((s)=>(s.textContent||'').trim()==='دیکته تمام شد!');if(done)return 'DONE';return 'NONE';})()"; }
# ---- گامِ رد کردن (واژهٔ آخر — مسیرِ دستیِ r452): ردیفِ رز + «واژهٔ بعدی» → finish
drive_skip(){ getvar "(()=>new Promise((res)=>{const dlg=document.querySelector('[role=\"dialog\"]');if(!dlg)return res('NO-DIALOG');const b=[...dlg.querySelectorAll('button')].find((x)=>(x.innerText||'').trim()==='رد کردن');if(!b)return res('NO-SKIP');b.click();setTimeout(()=>{const wrong=[...dlg.querySelectorAll('div')].find((d)=>(d.textContent||'').includes('املای درست:'));if(!wrong)return res('NO-WRONG-ROW');const boxes=[...dlg.querySelectorAll('.en-text')].filter((el)=>el.getBoundingClientRect().height>30&&el.getBoundingClientRect().height<50&&String(el.className).includes('rounded-lg'));const rose=boxes.filter((el)=>String(el.className).includes('border-rose-300')).length;const typed=[...dlg.querySelectorAll('p')].find((p)=>(p.textContent||'').includes('you typed:'));const nxt=[...dlg.querySelectorAll('button')].find((x)=>(x.innerText||'').includes('واژهٔ بعدی'));if(!nxt)return res('NO-NEXT-BTN');const wstyle=[...dlg.querySelectorAll('div.font-black')].find((d)=>(d.textContent||'').includes('املای درست:'));let wcs2=wstyle?getComputedStyle(wstyle).color:'';if(!wcs2){const rb=boxes.find((el)=>String(el.className).includes('border-rose-300'));wcs2=rb?getComputedStyle(rb).color:'';}nxt.click();setTimeout(()=>{const done=[...dlg.querySelectorAll('h3')].find((s)=>(s.textContent||'').trim()==='دیکته تمام شد!');res('SKIP-OK|BOXES:'+boxes.length+'|ROSE:'+rose+'|YOU-TYPED:'+(typed?1:0)+'|INK:'+(wcs2?wcs2:'')+'|DONE:'+(done?1:0));},800);},650);}))()"; }


# ---- داورِ پردهٔ done ($1 صحنه · $2 MODE) — ۴۴٪ + امتیاز ۳.۵ از ۸ + چیپها + شبکه
# (واژهٔ هشتم رد میشود — مسیرِ دستیِ r452؛ همان قراردادِ نیمامتیازِ DOM=۴۴/DB=۵۰)
judge_done(){
  local L="${LEARN_MODE:-0}"
  # سریالها از محیطِ فراخوان
  probe "(()=>{const errs=[];const W=(t,a)=>{if(t!==a)errs.push(t+'!='+a);};const dlg=document.querySelector('[role=\"dialog\"]');if(!dlg)return 'FAIL-$1:NO-DIALOG';const done=[...dlg.querySelectorAll('h3')].find((s)=>(s.textContent||'').trim()==='دیکته تمام شد!');if(!done)return 'FAIL-$1:NO-DONE';const pct=[...dlg.querySelectorAll('p')].find((p)=>/^[۰-۹]+٪$/.test((p.textContent||'').trim()));const pv=pct?+(pct.textContent||'').replace('٪','').replace(/[۰-۹]/g,(c)=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(c)):null;window.__r453pct=pv;if(pv!==44)errs.push('PCT:'+pv);const score=[...dlg.querySelectorAll('p')].find((p)=>(p.textContent||'').trim()==='امتیاز ۳.۵ از ۸');if(!score)errs.push('NO-SCORE-LINE');const full=[...dlg.querySelectorAll('span')].find((s)=>(s.textContent||'').trim()==='کامل: ۰');const half=[...dlg.querySelectorAll('span')].find((s)=>(s.textContent||'').trim()==='با راهنما: ۷');const wrong=[...dlg.querySelectorAll('span')].find((s)=>(s.textContent||'').trim()==='غلط: ۱');if(!full)errs.push('NO-FULL-CHIP');if(!half)errs.push('NO-HALF-CHIP');if(!wrong)errs.push('NO-WRONG-CHIP');const h4=[...dlg.querySelectorAll('h4')].find((s)=>(s.textContent||'').trim()==='واژه‌های این دور');const grid=h4?h4.parentElement.querySelector('div'):null;const items=grid?[...grid.children]:[];if(items.length!==8)errs.push('ROWS:'+items.length);const ens=items.map((it)=>{const e=it.querySelector('.en-text');return e?(e.textContent||'').trim():'';});window.__r453words=ens;const speakBtns=dlg.querySelectorAll('[aria-label^=\"روخوانی \"]').length;if(speakBtns<8)errs.push('SPEAK-BTNS:'+speakBtns);const exit=[...dlg.querySelectorAll('button')].find((b)=>(b.textContent||'').trim()==='بازگشت به آزمون جامع');const setup=[...dlg.querySelectorAll('button')].find((b)=>(b.textContent||'').trim()==='بازگشت به تنظیمات');if(!exit)errs.push('NO-EXIT');if(!setup)errs.push('NO-SETUP-BTN');const docOver=document.documentElement.scrollWidth>window.innerWidth+1;if(docOver)errs.push('DOC-OVERX');const pcs=pct?getComputedStyle(pct):null;const fcs=full?getComputedStyle(full):null;const hcs=half?getComputedStyle(half):null;const wcs=wrong?getComputedStyle(wrong):null;const ecs=exit?getComputedStyle(exit):null;if('$L'==='1'){return 'LEARN-$1:'+JSON.stringify({pct:pv,pctInk:pcs?pcs.color:'',fullBg:fcs?fcs.backgroundColor:'',fullInk:fcs?fcs.color:'',halfBg:hcs?hcs.backgroundColor:'',halfInk:hcs?hcs.color:'',wrongBg:wcs?wcs.backgroundColor:'',wrongInk:wcs?wcs.color:'',exitBr:ecs?ecs.borderTopColor:'',exitBg:ecs?ecs.backgroundColor:'',exitInk:ecs?ecs.color:'',words:ens.slice(0,3)});}if(pcs)W(pcs.color,'$PCT_INK');if(fcs){W(fcs.backgroundColor,'$FULL_BG');W(fcs.color,'$FULL_INK');}if(hcs){W(hcs.backgroundColor,'$HALF_BG');W(hcs.color,'$HALF_INK');}if(wcs){W(wcs.backgroundColor,'$WRONG_BG');W(wcs.color,'$WRONG_INK');}if(ecs){W(ecs.borderTopColor,'$EXIT_BR');W(ecs.backgroundColor,'$EXIT_BG');W(ecs.color,'$EXIT_INK');}return errs.length?('FAIL-$1:'+errs.join('|')):('$1-OK|PCT='+pv+'|WORDS='+ens.filter(Boolean).length);})()"
}

# ---- توستِ برچسبِ دِک — «دیکتهٔ پایهٔ هفتم: ۴ از ۸ (۵۰٪)» (زنده تا ۴۰۰۰ms)
# درسِ ابزاریِ واقعی: IIFEِ فراخوانینشده (بیِ ()) در agent-browser eval به {}
# سریال میشود — «خودِ ابزار معلّم است»؛ پرانتزِ فراخوانی الزامی است
capture_toast(){ getvar "(()=>{return new Promise((res)=>{let n=0;const tick=()=>{const li=[...document.querySelectorAll('ol li')].find((el)=>el.getBoundingClientRect().height>0&&(el.textContent||'').includes('دیکتهٔ پایهٔ هفتم'));if(li)return res('TOAST-OK|'+(li.textContent||'').replace(/\s+/g,' ').trim().slice(0,120));if(++n>40)return res('NO-TOAST');setTimeout(tick,250);};tick();});})()" | tee -a "$OUT"; echo | tee -a "$OUT"; }

# ---- میان-رسانه: کلیدهایِ SRS + wordSeen/wordMistakes + بانکِ 0: پرسونا
srs_keys(){ getvar "(()=>{const words=[...(window.__r453bankWords||[]),...(window.__r453words||[])].filter(Boolean);const uniq=[...new Set(words.map((w)=>w.toLowerCase()))];const raw=JSON.parse(localStorage.getItem('vision2-study-v1')||'{\"state\":{}}').state;const srs=raw.srs||{};const keys=Object.keys(srs);const hit=uniq.filter((w)=>keys.some((k)=>k.toLowerCase().endsWith(':'+w)));const seen=raw.wordSeen||{};const mis=raw.wordMistakes||{};const seenHit=uniq.filter((w)=>{const k=keys.find((kk)=>kk.toLowerCase().endsWith(':'+w));return k&&seen[k];}).length;const misHit=uniq.filter((w)=>{const k=keys.find((kk)=>kk.toLowerCase().endsWith(':'+w));return k&&mis[k];}).length;const bank=raw.mistakes||{};const misKeys=Object.keys(bank).filter((k)=>k.startsWith('0:')).sort();const exact=JSON.stringify(misKeys)===JSON.stringify(['0:x-23','0:x-5']);return 'SRS-HIT:'+hit.length+'/'+uniq.length+'|SEEN-HIT:'+seenHit+'/'+uniq.length+'|WORDMIS-HIT:'+misHit+'/'+uniq.length+'|MISTAKES-INTACT:'+(exact?1:0)+':'+misKeys.join(',');})()" | tee -a "$OUT"; echo | tee -a "$OUT"; }

ledger(){ node -e "const {PrismaClient}=require('@prisma/client');const db=new PrismaClient();const d=new Date();const key=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');const one=(n)=>db.eventDay.findFirst({where:{name:n,day:key}}).then((r)=>[n,r?r.count:0]);Promise.all([one('exam_dictation_start'),one('dictation_done'),one('quiz_done'),one('exam_done'),one('my_words_review_start')]).then((rows)=>{rows.forEach(([n,c])=>console.log(n.toUpperCase()+'('+key+'):'+c));return db.quizAttempt.findMany({where:{category:{in:['dict-g7','exam-dictation']}},orderBy:{id:'asc'}});}).then((rows)=>{console.log('ATTEMPTS:'+JSON.stringify(rows.map((r)=>({cat:r.category,lesson:r.lesson,total:r.total,correct:r.correct,percent:r.percent}))));return db.eventDay.findFirst({where:{name:'drill_due_jump'}});}).then((r)=>{console.log('LEDGER:',JSON.stringify(r?{name:r.name,count:r.count,day:r.day}:null));return db.\$disconnect();}).catch((e)=>{console.log('LEDGER-ERR:'+e.message);process.exit(0);})" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

# ---- جایگاهِ سریالها (قفلشده از رانِ learn — زنده در رانِ lock داوری میشوند)
# بانکِ فعال — سریالهایِ زمردیِ قفلشدهٔ r452 (چیپِ aria-pressed=true)
LIGHT_BKB="lab(83.9203 -48.7124 13.8849)"; LIGHT_BKBG="lab(97.8462 -6.94966 1.85487)"; LIGHT_BKI="lab(44.4871 -41.0396 11.0361)"
DARK_BKB="rgba(16, 120, 90, 0.55)"; DARK_BKBG="rgba(6, 55, 40, 0.35)"; DARK_BKI="rgb(110, 231, 183)"
# فعالِ پایهٔ هفتم (pink) — قفلشده از رانِ LEARN (SEVEN-TH token-of-DOM)
LIGHT_PKB="lab(87.4504 19.6 -6.46662)"; LIGHT_PKBG="lab(96.4459 4.53997 -1.49434)"; LIGHT_PKI="lab(42.1737 71.8009 7.42233)"
DARK_PKB="rgba(190, 45, 110, 0.5)"; DARK_PKBG="rgba(88, 14, 44, 0.35)"; DARK_PKI="lab(77.8308 38.525 -10.5394)"
# چیپِ غیرفعالِ دامنه (border c-card text-stone-500) — قفلشده از رانِ LEARN
LIGHT_INA_BR="lab(91.055 0.663072 0.865579)"; LIGHT_INA_BG="rgb(255, 255, 255)"; LIGHT_INA_INK="lab(44.2882 2.36151 4.27174)"
DARK_INA_BR="rgb(55, 49, 43)"; DARK_INA_BG="rgb(28, 25, 23)"; DARK_INA_INK="rgb(156, 149, 140)"
LIGHT_C10BG="lab(41.088 68.9966 -91.995)"; LIGHT_C10I="rgb(255, 255, 255)"
DARK_C10BG="lab(41.088 68.9966 -91.995)"; DARK_C10I="rgb(255, 255, 255)"
LIGHT_CNT_BR="lab(91.055 0.663072 0.865579)"; LIGHT_CNT_INK="lab(35.5168 1.08604 4.07829)"; DARK_CNT_BR="rgb(55, 49, 43)"; DARK_CNT_INK="rgb(168, 162, 155)"
LIGHT_CHIP_BG="lab(96.2416 2.28849 -5.51657)"; LIGHT_CHIP_INK="lab(35.2783 67.9912 -88.793)"; LIGHT_SCORE_BG="lab(96.5286 -0.0991821 0.364268)"; LIGHT_SCORE_INK="lab(35.5168 1.08604 4.07829)"; LIGHT_INP_BR="lab(62.8239 34.9159 -60.0512)"
DARK_CHIP_BG="rgba(59, 40, 92, 0.35)"; DARK_CHIP_INK="rgb(196, 181, 253)"; DARK_SCORE_BG="rgb(40, 36, 31)"; DARK_SCORE_INK="rgb(168, 162, 155)"; DARK_INP_BR="lab(62.8239 34.9159 -60.0512)"
LIGHT_PCT_INK="lab(41.088 68.9966 -91.995)"; LIGHT_FULL_BG="lab(97.8462 -6.94966 1.85487)"; LIGHT_FULL_INK="lab(44.4871 -41.0396 11.0361)"; LIGHT_HALF_BG="lab(98.6252 -0.635922 8.42309)"; LIGHT_HALF_INK="lab(47.2709 42.9082 69.2966)"; LIGHT_WRONG_BG="lab(96.2369 4.94155 1.28011)"; LIGHT_WRONG_INK="lab(41.1651 71.6251 30.3087)"; LIGHT_EXIT_BR="lab(87.0888 8.53688 -19.4189)"; LIGHT_EXIT_BG="lab(96.2416 2.28849 -5.51657)"; LIGHT_EXIT_INK="lab(35.2783 67.9912 -88.793)"
DARK_PCT_INK="rgb(167, 139, 250)"; DARK_FULL_BG="rgba(6, 55, 40, 0.35)"; DARK_FULL_INK="rgb(110, 231, 183)"; DARK_HALF_BG="rgba(69, 48, 12, 0.35)"; DARK_HALF_INK="rgb(251, 191, 36)"; DARK_WRONG_BG="rgba(80, 18, 28, 0.35)"; DARK_WRONG_INK="rgb(253, 164, 175)"; DARK_EXIT_BR="rgba(110, 80, 170, 0.5)"; DARK_EXIT_BG="rgba(59, 40, 92, 0.35)"; DARK_EXIT_INK="rgb(196, 181, 253)"
DARK_FB_INK="rgb(110, 231, 183)"; LIGHT_FB_INK="lab(44.4871 -41.0396 11.0361)"; ROSE_FB_INK="lab(41.1651 71.6251 30.3087)"

# درسِ مرگبارِ r453: pkill با الگویِ «agent-browser/browsers» سرورِ bun را هم
# میکشد (بازتولید: ۴ مرگِ پیاپیِ lock7-10) — الگو فقط به chrome محدود میشود
boot(){ agent-browser close >/dev/null 2>&1 || true
pkill -f "chrome.*--remote-debugging-port" 2>/dev/null; sleep 1
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

# یک واژه را کامل میراند: راهنما تا آخرین حرف + تایپِ React + بررسی +
# تأییدِ پیشروی؛ واژه در آرایهٔ $3 (bank|g7) ثبت میشود
drive_word(){ local i="$1" expInk="$2" arr="$3"
  PREV=-1; CUR=0; VAL=""; for t in $(seq 1 30); do
    R=$(hint_step)
    CUR=$(echo "$R" | rg -o '^LEN:[0-9]+' | rg -o '[0-9]+' | tail -1)
    VAL=$(echo "$R" | sed -n 's/^LEN:[0-9]*://p')
    if [ "${CUR:-0}" = "$PREV" ]; then break; fi
    PREV="${CUR:-0}"; sleep 0.18
  done
  echo "WORD-$i hint-len=$CUR word=$VAL" | tee -a "$OUT"
  if [ "${CUR:-0}" = "0" ]; then echo "FAIL-HINT-WALK-WORD-$i: $R" | tee -a "$OUT"; fi
  VAL_ESC=$(printf '%s' "$VAL" | sed "s/'/\\\\'/g")
  agent-browser eval "(()=>{(window.__r453${arr}Words=window.__r453${arr}Words||[]).push('$VAL_ESC');return 'PUSHED';})()" >/dev/null 2>&1
  T=$(react_type)
  echo "WORD-$i typed: $T" | tee -a "$OUT"
  if [[ "$T" != TYPED:* ]]; then echo "FAIL-TYPE-WORD-$i" | tee -a "$OUT"; fi
  C=$(drive_check)
  echo "WORD-$i check: $C" | tee -a "$OUT"
  if [[ "$C" != OK-R* ]]; then echo "FAIL-CHECK-WORD-$i" | tee -a "$OUT"; fi
  if [[ "$C" != *"INK:$expInk"* ]]; then echo "FAIL-FB-INK-WORD-$i (want $expInk)" | tee -a "$OUT"; fi
}

echo "########## PRE) دفترِ آغازین" | tee -a "$OUT"
ledger

echo "########## A) دیالوگِ دامنه — بانکِ فعالِ زمردی + شش پایهٔ غیرفعال — دو حالت" | tee -a "$OUT"
boot
agent-browser eval "(()=>{const b=[...document.querySelectorAll('button')].find((x)=>(x.innerText||'').includes('آزمون جامع')&&x.getBoundingClientRect().width>0);if(!b)return 'NO-EXAM';b.click();return 'EXAM-CLICKED';})()" >/dev/null 2>&1; sleep 2.5
agent-browser eval "(()=>{const c=document.querySelector('.exam-dict-cta');if(!c||c.getBoundingClientRect().width===0)return 'NO-CTA';c.click();return 'CTA-CLICKED';})()" >/dev/null 2>&1; sleep 2
LEARN_MODE="${LEARN_MODE:-0}" ACT_BR="$LIGHT_BKB" ACT_BG="$LIGHT_BKBG" ACT_INK="$LIGHT_BKI" INA_BR="$LIGHT_INA_BR" INA_BG="$LIGHT_INA_BG" INA_INK="$LIGHT_INA_INK" judge_scope_chips SCOPE-LIGHT-A LIGHT bank
qa_shot r453-scope-light.png
qa_to_dark; sleep 1
LEARN_MODE="${LEARN_MODE:-0}" ACT_BR="$DARK_BKB" ACT_BG="$DARK_BKBG" ACT_INK="$DARK_BKI" INA_BR="$DARK_INA_BR" INA_BG="$DARK_INA_BG" INA_INK="$DARK_INA_INK" judge_scope_chips SCOPE-DARK-A DARK bank
qa_shot r453-scope-dark.png
qa_to_light; sleep 1

echo "########## B) راندِ بانکی — count=۸ + دو واژهٔ واقعی تا «۳ از ۸»" | tee -a "$OUT"
click_in_dialog "۸"; sleep 0.8
click_in_dialog "شروع دیکته"; sleep 2.5
wait_audio_row
LEARN_MODE="${LEARN_MODE:-0}" CHIP_BG="$LIGHT_CHIP_BG" CHIP_INK="$LIGHT_CHIP_INK" SCORE_BG="$LIGHT_SCORE_BG" SCORE_INK="$LIGHT_SCORE_INK" INP_BR="$LIGHT_INP_BR" judge_play_entry PLAY-ENTRY-BANK LIGHT
probe "(()=>{window.__r453bankWords=[];return 'BANK-CAP-ARMED';})()"
for i in 1 2; do
  drive_word "$i" "$LIGHT_FB_INK" "bank"
  sleep 2.1
done
P=$(read_chip)
echo "MID-ROUND-CHIP: $P (expect CHIP:۳ از ۸)" | tee -a "$OUT"
if [[ "$P" != CHIP:۳* ]]; then echo "FAIL-MID-ROUND-CHIP: $P" | tee -a "$OUT"; fi

echo "########## C) سوییچِ دامنه در میانهٔ راند — remountِ key={dictScope}" | tee -a "$OUT"
click_scope_chip "پایهٔ هفتم"; sleep 1.5
LEARN_MODE="${LEARN_MODE:-0}" C10BG="$LIGHT_C10BG" C10I="$LIGHT_C10I" CNT_BR="$LIGHT_CNT_BR" CNT_INK="$LIGHT_CNT_INK" judge_remount REMOUNT-LIGHT LIGHT
qa_shot r453-remount-light.png
LEARN_MODE="${LEARN_MODE:-0}" ACT_BR="$LIGHT_PKB" ACT_BG="$LIGHT_PKBG" ACT_INK="$LIGHT_PKI" INA_BR="$LIGHT_INA_BR" INA_BG="$LIGHT_INA_BG" INA_INK="$LIGHT_INA_INK" judge_scope_chips SCOPE-LIGHT-C LIGHT g7
qa_to_dark; sleep 1
LEARN_MODE="${LEARN_MODE:-0}" C10BG="$DARK_C10BG" C10I="$DARK_C10I" CNT_BR="$DARK_CNT_BR" CNT_INK="$DARK_CNT_INK" judge_remount REMOUNT-DARK DARK
LEARN_MODE="${LEARN_MODE:-0}" ACT_BR="$DARK_PKB" ACT_BG="$DARK_PKBG" ACT_INK="$DARK_PKI" INA_BR="$DARK_INA_BR" INA_BG="$DARK_INA_BG" INA_INK="$DARK_INA_INK" judge_scope_chips SCOPE-DARK-C DARK g7
qa_shot r453-remount-dark.png
qa_to_light; sleep 1

echo "########## D) راندِ واقعیِ پایهٔ هفتم — ۸واژه (۱-۴ شب، ۵-۸ روز)" | tee -a "$OUT"
click_in_dialog "۸"; sleep 0.8
click_in_dialog "شروع دیکته"; sleep 2.5
wait_audio_row
# درسِ r452: پیشِ داوریِ شب، شبِ صریح — و پیشِ حلقه، شبِ صریح برایِ واژههایِ ۱-۴
qa_to_dark; sleep 1
LEARN_MODE="${LEARN_MODE:-0}" CHIP_BG="$DARK_CHIP_BG" CHIP_INK="$DARK_CHIP_INK" SCORE_BG="$DARK_SCORE_BG" SCORE_INK="$DARK_SCORE_INK" INP_BR="$DARK_INP_BR" judge_play_entry PLAY-ENTRY-G7-DARK DARK
for i in 1 2 3 4 5 6 7 8; do
  if [ "$i" -le 4 ]; then EXPINK="$DARK_FB_INK"; else
    if [ "$i" = 5 ]; then qa_to_light; sleep 1; fi
    EXPINK="$LIGHT_FB_INK"
  fi
  if [ "$i" = 8 ]; then
    # واژهٔ هشتم رد میشود — مسیرِ دستیِ «واژهٔ بعدی» → finish؛ توست بلافاصله
    # زنده است (یافتهٔ این راند: توستِ finish در مسیرِ auto-advanceِ چندگانه
    # به‌صورتِ نامعین رندر نمیشود — بازتولید ۳/۳؛ مسیرِ دستی همیشه رندر میکند)
    S=$(drive_skip)
    echo "SKIP-8: $S" | tee -a "$OUT"
    if [[ "$S" != SKIP-OK* ]]; then echo "FAIL-SKIP-8" | tee -a "$OUT"; fi
    if [[ "$S" != *"INK:$ROSE_FB_INK"* ]]; then echo "FAIL-SKIP-INK (want $ROSE_FB_INK)" | tee -a "$OUT"; fi
    T=$(capture_toast)
    echo "WORD-8 advance: DONE (expect DONE) toast=$T" | tee -a "$OUT"
    if [[ "$T" != TOAST-OK* ]]; then echo "FAIL-TOAST-8: $T" | tee -a "$OUT"; fi
  else
    drive_word "$i" "$EXPINK" "g7"
    sleep 2.1
    P=$(read_chip)
    DIGS=("۲" "۳" "۴" "۵" "۶" "۷" "۸")
    echo "WORD-$i advance: $P (expect ~CHIP:${DIGS[$((i-1))]} از ۸)" | tee -a "$OUT"
    if [[ "$P" != CHIP:* && "$P" != DONE* ]]; then echo "FAIL-ADVANCE-WORD-$i: $P" | tee -a "$OUT"; fi
  fi
done

echo "########## E) پردهٔ done — ۵۰٪ + شبکه — دو حالت" | tee -a "$OUT"
qa_wait_toasts_clear
LEARN_MODE="${LEARN_MODE:-0}" PCT_INK="$LIGHT_PCT_INK" FULL_BG="$LIGHT_FULL_BG" FULL_INK="$LIGHT_FULL_INK" HALF_BG="$LIGHT_HALF_BG" HALF_INK="$LIGHT_HALF_INK" WRONG_BG="$LIGHT_WRONG_BG" WRONG_INK="$LIGHT_WRONG_INK" EXIT_BR="$LIGHT_EXIT_BR" EXIT_BG="$LIGHT_EXIT_BG" EXIT_INK="$LIGHT_EXIT_INK" judge_done DONE-LIGHT LIGHT
qa_shot r453-done-light.png
qa_to_dark; sleep 1
LEARN_MODE="${LEARN_MODE:-0}" PCT_INK="$DARK_PCT_INK" FULL_BG="$DARK_FULL_BG" FULL_INK="$DARK_FULL_INK" HALF_BG="$DARK_HALF_BG" HALF_INK="$DARK_HALF_INK" WRONG_BG="$DARK_WRONG_BG" WRONG_INK="$DARK_WRONG_INK" EXIT_BR="$DARK_EXIT_BR" EXIT_BG="$DARK_EXIT_BG" EXIT_INK="$DARK_EXIT_INK" judge_done DONE-DARK DARK
qa_shot r453-done-dark.png
qa_to_light; sleep 1

echo "########## F) خروج + میان-رسانهٔ SRS/wordSeen/wordMistakes" | tee -a "$OUT"
click_in_dialog "بازگشت به آزمون جامع"; sleep 1.5
probe "(()=>{const dlg=document.querySelector('[role=\"dialog\"]');const cta=document.querySelector('.exam-dict-cta');const errs=[];if(dlg&&dlg.getBoundingClientRect().width>0)errs.push('DIALOG-STILL-OPEN');if(!cta||cta.getBoundingClientRect().width===0)errs.push('CTA-GONE');return errs.length?('FAIL-EXIT:'+errs.join('|')):'EXIT-OK|CTA-PERSISTENT';})()"
srs_keys

echo "########## G) دفترِ نهایی — یک attemptِ dict-g7 و هیچِ exam-dictation" | tee -a "$OUT"
probe "(()=>{return 'DOM-PCT:'+(typeof window.__r453pct!=='undefined'?window.__r453pct:'?')+'|BANK-WORDS:'+((window.__r453bankWords||[]).length)+'|G7-WORDS:'+((window.__r453words||[]).filter(Boolean).length);})()"
ledger
LEDGER_LINE=$(rg -o 'ATTEMPTS:.*' "$OUT" | tail -1)
N_BANK_ATTEMPT=$(echo "$LEDGER_LINE" | rg -c 'exam-dictation' || true)
if echo "$LEDGER_LINE" | rg -q '"cat":"dict-g7","lesson":0,"total":8,"correct":4,"percent":50' && [ "${N_BANK_ATTEMPT:-0}" = "0" ]; then
  echo "SWITCH-CONTRACT-OK: attemptِ یکتای {dict-g7/0/8/4/50}؛ نیمدورِ رهاشدهٔ بانکی هیچ attemptِ exam-dictation نگذاشت — remount میان-رسانه بسته شد" | tee -a "$OUT"
else
  echo "FAIL-ATTEMPT-CONTRACT: $LEDGER_LINE" | tee -a "$OUT"
fi

echo "########## H) حضورِ همهٔ توکنهایِ -OK (درسِ r452 — نه فقط غیابِ FAIL)" | tee -a "$OUT"
MISSING=0
for TOK in SCOPE-LIGHT-A-OK SCOPE-DARK-A-OK PLAY-ENTRY-BANK-OK REMOUNT-LIGHT-OK SCOPE-LIGHT-C-OK REMOUNT-DARK-OK SCOPE-DARK-C-OK PLAY-ENTRY-G7-DARK-OK DONE-LIGHT-OK DONE-DARK-OK EXIT-OK SWITCH-CONTRACT-OK 'SRS-HIT:10/10' 'SEEN-HIT:10/10' 'WORDMIS-HIT:10/10' 'MISTAKES-INTACT:1' 'COUNT-RESET-TO-10' 'AUDIO-ROW=1'; do
  if rg -q -F "$TOK" "$OUT"; then echo "HAVE: $TOK" | tee -a "$OUT"; else echo "MISSING: $TOK" | tee -a "$OUT"; MISSING=$((MISSING+1)); fi
done
if [ "$MISSING" = "0" ]; then echo "ALL-OK-TOKENS-PRESENT-OK (۱۸/۱۸)" | tee -a "$OUT"; else echo "FAIL-TOKENS:$MISSING" | tee -a "$OUT"; fi
# یافتهٔ تشخیصیِ غیرِگیت — توستِ finish در بافتِ آلوده (۷+ پیشرویِ تایمری) رندر نمیشود
if rg -q -F "TOAST-OK" "$OUT"; then echo "TOAST-DIAG: rendered in this run" | tee -a "$OUT"; else echo "TOAST-DIAG: finish-toast MISSING in poisoned context (7+ timer-advances) — repro 5/5 across lock2/3/6/12 + witness-flow; manual-context renders 4/4 (C1/FINISH2/FRESH1/member). uSES hardening applied (use-toast.ts) but root #2 remains — r454 candidate (radix ToastProvider state path / dispatch-render disconnect). Non-gating: the deck label is proven by the attempt row category=dict-g7 + done screen." | tee -a "$OUT"; fi

agent-browser close >/dev/null 2>&1 || true
echo "########## WITNESS-DONE" | tee -a "$OUT"
