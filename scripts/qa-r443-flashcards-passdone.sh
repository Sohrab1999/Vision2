#!/usr/bin/env bash
# ------------------------------------------------------------------
# r443 — «شاهدِ موبایلِ پردهٔ پایانِ فلش‌کارت‌ها» (بندِ ①ِ r442)
# چهلوهشتمین مصرفکنندهٔ qa-lib.sh.
# داوریِ ارزش: خانوادهٔ پردهٔ نتیجه تا امروز «نتیجهٔ تمرین» (r441) و
#   «نتیجهٔ مرور» (r442) را در موبایل دید — اما پردهٔ پایانِ فلش‌کارت‌ها
#   (گاردِ پاسِ تمامِ راندِ ۲۷۴) هرگز زیرِ ۱۲۸۰px دیده نشده.
# صحنه: سه واژهٔ واقعیِ درسِ ۱ ستاره میشوند (ability / absolutely / access)،
#   فلش‌کارت باز میشود، «مرور هوشمند» روشن و هر سه کارت با «بلدم» پاسخ
#   میشود — کارتِ پاسخداده از سررسید خارج میشود (راندِ ۲۷۴) و با پاسِ
#   آخرین، گاردِ «پاسِ مرورِ هوشمند تمام شد» ظاهر میشود.
# داوریها در شبِ واقعی و روشن:
#   ① عنوانِ دقیقِ گارد + دکمهٔ «ادامهٔ مرورِ دستی — همهٔ کارت‌ها» + «بازگشت»
#   ② پردهٔ اجرا واقعاً جایگزین شده: نه flip-card، نه لانچر، نه توگل
#   ③ ترتیبِ دِک == ترتیبِ لیستِ «واژه‌های من» (تازهترینِ پیشفرض: reverse insertion)
#      — آموختهٔ زنده از خودِ کارتها + تأییدِ منبع (sort=="new" → [...ok].reverse())
#   ④ نوارِ پیشرفتِ صادقِ ۲۷۴: ۰٪ → ۳۳٫۳٪ → ۶۶٫۷٪ و «کارتِ باقی‌مانده» ۳→۲→۱
#   ⑤ اثرِ انباشته: «۳ بلدم» در ورِ دوم + پاسِ فوری (dueCount=۰) در روشن
#   ⑥ سرریزِ صفرِ پنل/سند + سریالهایِ آموختهشده (آموختن سپس قفل — r427)
# دفترِ صادق: flashcard_done دقیقاً یکبار در پاسِ آخر (+۱ در eventDay)؛
#   فلش‌کارت هرگز POST نمیزند (attempts=۰)؛ drill_due_jump دستنخورده.
# درسهایِ ابزاری: r439/r440/r441/r442 (گاردِ موبایل کتابخانهای، کارتِ نصب،
#   پیشْپروازِ نحویِ داور، رقمِ یکپایه).
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
OUT=/tmp/r443-flashcards-passdone-witness.txt
QA_SEED_FILE=/tmp/r443-witness-seed-eval.js
: > "$OUT"

source /home/z/my-project/scripts/qa-lib.sh

probe(){ agent-browser eval "$1" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

click_by_label(){ agent-browser eval "(()=>{let b=document.querySelector('[aria-label=\"$1\"]');if(!b||b.getBoundingClientRect().width===0){b=[...document.querySelectorAll('button')].find((x)=>(x.innerText||'').replace(/\s+/g,' ').trim()==='$1'&&x.getBoundingClientRect().width>0);}if(!b)return 'NO-BTN:$1';b.click();return 'CLICKED:$1';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

click_card(){ agent-browser eval "(()=>{const b=[...document.querySelectorAll('button')].find((x)=>(x.innerText||'').includes('$1')&&x.getBoundingClientRect().width>0);if(!b)return 'NO-BTN:$1';b.click();return 'CLICKED:$1';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

dismiss_install(){ probe "(()=>{const b=document.querySelector('[aria-label=\"بستن پیشنهاد نصب\"]');if(b&&b.getBoundingClientRect().width>0){b.click();return 'INSTALL-CARD-DISMISSED';}return 'NO-INSTALL-CARD';})()"; sleep 1; }

# ---- سریالهایِ آموختهشده در رانِ LEARN (قفلشده — ایدئومِ r427/r433/r436/r438) ----
# شب: پنلِ سنگیِ بازنگاشته (stone-800/700)، تحویلِ بنفش با oklab() — و مرکِ بنفشِ
#   rgb(196,181,253) عینِ مرکِ نمرهٔ r441/r442.
# روز: تحویلِ بنفش lab(96.2416…) / lab(35.2783…) — عینِ سریالهایِ چیپِ بنفشِ r437/r438.
DARK_PANEL_BG="rgb(28, 25, 23)"; DARK_PANEL_BORDER="rgb(68, 64, 60)"; DARK_TITLE_INK="rgb(168, 162, 155)"; DARK_HANDOFF_BG="oklab(0.605991 0.096526 -0.230582 / 0.1)"; DARK_HANDOFF_INK="rgb(196, 181, 253)"; DARK_HANDOFF_BD="oklab(0.605991 0.096526 -0.230582 / 0.3)"; DARK_EXIT_INK="rgb(168, 162, 155)"; DARK_SVG="rgb(87, 83, 76)"
LIGHT_PANEL_BG="rgb(255, 255, 255)"; LIGHT_PANEL_BORDER="lab(84.7909 0.928015 1.59738)"; LIGHT_TITLE_INK="lab(35.5168 1.08604 4.07829)"; LIGHT_HANDOFF_BG="lab(96.2416 2.28849 -5.51657)"; LIGHT_HANDOFF_INK="lab(35.2783 67.9912 -88.793)"; LIGHT_HANDOFF_BD="lab(87.0888 8.53688 -19.4189)"; LIGHT_EXIT_INK="lab(35.5168 1.08604 4.07829)"; LIGHT_SVG="lab(84.7909 0.928015 1.59738)"

# ---- داورِ پردهٔ پایان (یکخطی — استخراجِ پیشْپرواز با check-r443-judges.sh) ----
judge(){ # $1 صحنه، $2 DARK|LIGHT
  local PANEL_BG PANEL_BORDER TITLE_INK HANDOFF_BG HANDOFF_INK HANDOFF_BD EXIT_INK SVG_INK L="${LEARN_MODE:-0}"
  if [ "$2" = DARK ]; then PANEL_BG="$DARK_PANEL_BG"; PANEL_BORDER="$DARK_PANEL_BORDER"; TITLE_INK="$DARK_TITLE_INK"; HANDOFF_BG="$DARK_HANDOFF_BG"; HANDOFF_INK="$DARK_HANDOFF_INK"; HANDOFF_BD="$DARK_HANDOFF_BD"; EXIT_INK="$DARK_EXIT_INK"; SVG_INK="$DARK_SVG"; else PANEL_BG="$LIGHT_PANEL_BG"; PANEL_BORDER="$LIGHT_PANEL_BORDER"; TITLE_INK="$LIGHT_TITLE_INK"; HANDOFF_BG="$LIGHT_HANDOFF_BG"; HANDOFF_INK="$LIGHT_HANDOFF_INK"; HANDOFF_BD="$LIGHT_HANDOFF_BD"; EXIT_INK="$LIGHT_EXIT_INK"; SVG_INK="$LIGHT_SVG"; fi
  probe "(()=>{const errs=[];const W=(t,a)=>{if(t!==a)errs.push(t+'!='+a);};const panel=[...document.querySelectorAll('div')].find(d=>String(d.className).includes('border-dashed')&&(d.textContent||'').includes('پاسِ مرورِ هوشمند تمام شد'));if(!panel)return 'FAIL-$1:NO-PANEL';const p=panel.querySelector('p');const title=(p?p.textContent:'').trim();if(title!=='پاسِ مرورِ هوشمند تمام شد — همهٔ کارت‌هایِ سررسید مرور شدند')errs.push('TITLE:'+(p?p.textContent:'NONE'));const btns=[...panel.querySelectorAll('button')];const hand=btns.find(b=>(b.innerText||'').trim()==='ادامهٔ مرورِ دستی — همهٔ کارت‌ها');const back=btns.find(b=>(b.innerText||'').trim()==='بازگشت');if(!hand)errs.push('NO-HANDOFF');if(!back)errs.push('NO-BACK');if(!panel.querySelector('svg'))errs.push('NO-SVG');if(document.querySelector('[aria-label=\"برگرداندن کارت\"]'))errs.push('RUN-SURFACE-HERE');if(document.querySelector('[aria-label=\"فلش‌کارت واژه‌های من\"]'))errs.push('LAUNCHER-HERE');const pO=panel.scrollWidth>Math.ceil(panel.getBoundingClientRect().width)+1;const dO=document.documentElement.scrollWidth>window.innerWidth+1;if(pO)errs.push('PANEL-OVERX');if(dO)errs.push('DOC-OVERX');const cs=getComputedStyle(panel);const pcs=p?getComputedStyle(p):null;const hcs=hand?getComputedStyle(hand):null;const bcs=back?getComputedStyle(back):null;const svg=panel.querySelector('svg');const scs=svg?getComputedStyle(svg):null;if('$L'==='1'){return 'LEARN-$1:'+JSON.stringify({panelBg:cs.backgroundColor,panelBd:cs.borderTopColor,titleInk:pcs?pcs.color:'',titleFs:pcs?pcs.fontSize:'',titleFw:pcs?pcs.fontWeight:'',handBg:hcs?hcs.backgroundColor:'',handInk:hcs?hcs.color:'',handBd:hcs?hcs.borderTopColor:'',backInk:bcs?bcs.color:'',svg:scs?scs.color:''});}W(cs.backgroundColor,'$PANEL_BG');W(cs.borderTopColor,'$PANEL_BORDER');if(pcs){W(pcs.color,'$TITLE_INK');W(pcs.fontSize,'14px');W(pcs.fontWeight,'700');}if(hcs){W(hcs.backgroundColor,'$HANDOFF_BG');W(hcs.color,'$HANDOFF_INK');W(hcs.borderTopColor,'$HANDOFF_BD');}if(bcs)W(bcs.color,'$EXIT_INK');if(scs)W(scs.color,'$SVG_INK');return errs.length?('FAIL-$1:'+errs.join('|')):('$1-OK');})()"
}

# ---- نوارِ پیشرفت: عرضِ رُندشده تا یک اعشار ----
prog(){ agent-browser eval "(()=>{const outer=[...document.querySelectorAll('div')].find(d=>String(d.className).includes('h-1.5')&&d.querySelector('div'));const inner=outer?outer.firstElementChild:null;if(!inner)return 'NO-BAR';return 'WIDTH:'+inner.style.width;})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

fa(){ case "$1" in 0) echo ۰;; 1) echo ۱;; 2) echo ۲;; 3) echo ۳;; esac; }

ledger(){ node -e "const {PrismaClient}=require('@prisma/client');const db=new PrismaClient();const d=new Date();const key=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');db.eventDay.findFirst({where:{name:'flashcard_done',day:key}}).then((r)=>{console.log('FLASHCARD-DONE('+key+'):'+(r?r.count:0));return db.quizAttempt.count();}).then((a)=>{console.log('ATTEMPTS-NOW:'+a);return db.eventDay.findFirst({where:{name:'drill_due_jump'}});}).then((r)=>{console.log('LEDGER:',JSON.stringify(r?{name:r.name,count:r.count,day:r.day}:null));return db.\$disconnect();}).catch((e)=>{console.log('LEDGER-ERR:'+e.message);process.exit(0);})" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

echo "########## A) خانه — seed + پایهها (موبایل ۳۹۰×۸۴۴)" | tee -a "$OUT"
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
dismiss_install

echo "########## B) دادهٔ واقعی از خودِ بانک (bun — سه واژهٔ درسِ ۱)" | tee -a "$OUT"
bun -e '
const {lessons} = require("/home/z/my-project/src/data/index.ts");
const want = ["ability","absolutely","access"];
const keys = want.map((en)=>{const hit=lessons[0].vocabulary.find(w=>w.en===en);return hit?("1:"+hit.en):"";});
if (keys.some(k=>!k)) { console.log("window.__r443={keys:[]};\"BASES-INCOMPLETE\""); process.exit(0); }
console.log("window.__r443="+JSON.stringify({keys})+";\"BASES-OK\"");
' > /tmp/r443-bases.js || { echo "BASES-FAIL" | tee -a "$OUT"; agent-browser close >/dev/null 2>&1; exit 1; }
agent-browser eval "$(cat /tmp/r443-bases.js)" | tee -a "$OUT"
echo | tee -a "$OUT"

echo "########## C) بذرِ ستارهها (ترتیبِ کهنه→نو) + سررسیدِ گذشته + بلدمِ پاک" | tee -a "$OUT"
probe "(()=>{const KEY='vision2-study-v1';const raw=JSON.parse(localStorage.getItem(KEY)||'{\"state\":{}}');const ks=(window.__r443&&window.__r443.keys)||[];if(ks.length!==3)return 'NO-BASES';raw.state.starredWords=ks.slice();raw.state.srs=raw.state.srs||{};raw.state.known=raw.state.known||{};for(const k of ks){raw.state.srs[k]={level:1,dueAt:Date.now()-20*60000};delete raw.state.known[k];}localStorage.setItem(KEY,JSON.stringify(raw));location.reload();return 'SEEDED:'+ks.join(',');})()" | tee -a "$OUT"
sleep 4
qa_wait_home || { agent-browser close >/dev/null 2>&1; exit 1; }
agent-browser eval "$(cat /tmp/r443-bases.js)" >/dev/null 2>&1
dismiss_install
echo "---- دفترِ پیش از پاس ----" | tee -a "$OUT"
ledger

echo "########## D) درِ موبایلِ «واژههای من» → لانچرِ فلش‌کارت" | tee -a "$OUT"
click_card "واژه‌های من"; sleep 2.5
probe "(()=>{const sec=document.querySelector('[aria-label=\"فلش‌کارت واژه‌های من\"]');if(!sec)return 'NO-LAUNCHER';const btn=[...sec.querySelectorAll('button')].find(b=>(b.innerText||'').includes('شروع فلش‌کارت'));if(!btn)return 'NO-START';return 'LAUNCHER-OK:'+(btn.innerText||'').replace(/\s+/g,' ').trim();})()" | tee -a "$OUT"

echo "########## E) شبِ واقعی — ورود + ایدئومِ دستی + توگلِ هوشمند" | tee -a "$OUT"
qa_to_dark
probe "(()=>{return document.documentElement.classList.contains('dark')?'DARK-ON':'DARK-OFF';})()"
click_card "شروع فلش‌کارت"; sleep 1.5
probe "(()=>{const t=document.body.innerText||'';const manual=t.includes('کارت ۱ از ۳');const chip=t.includes('۰ بلدم');return (manual&&chip)?'INTRO-OK:manual+۰بلدم':'INTRO:'+JSON.stringify({manual,chip});})()" | tee -a "$OUT"
echo "---- نوارِ پیشرفتِ دستی (۱/۳) ----" | tee -a "$OUT"
prog
click_by_label "مرور هوشمند"; sleep 1
probe "(()=>{const t=document.body.innerText||'';const rem=t.includes('۳ کارتِ باقی‌مانده');const btn=[...document.querySelectorAll('button')].find(b=>(b.innerText||'').includes('مرور هوشمند'));const badge=btn?btn.textContent.replace(/\s+/g,'').includes('۳'):-1;return (rem&&badge===true)?'SMART-OK:۳باقیمانده+نشان۳':'SMART:'+JSON.stringify({rem,badge});})()" | tee -a "$OUT"
prog

echo "########## F) پاسِ سه کارت — ترتیبِ دِک از خودِ کارتهای جلو + نوارِ ۲۷۴" | tee -a "$OUT"
probe "(()=>{window.__r443w=[];return 'WORDS-CLEAR';})()"
for r in 3 2 1; do
  W=$(agent-browser eval "(()=>{const f=document.querySelector('.flip-face:not(.back) .en-text');if(!f)return 'NO-CARD';const w=(f.textContent||'').trim();window.__r443w.push(w);const t=document.body.innerText||'';const rem=t.includes('$(fa $r) کارتِ باقی‌مانده');return (rem?'IN-QUEUE':'QUEUE:'+t.slice(0,60))+':'+w;})()" 2>&1 | tr -d '"')
  echo "CARD:$W" | tee -a "$OUT"
  A=$(agent-browser eval "(()=>{const b=[...document.querySelectorAll('button')].find(x=>(x.innerText||'').trim()==='بلدم');if(!b)return 'NO-BTN';b.click();return 'KNOWN';})()" 2>&1)
  case "$A" in *KNOWN*) : ;; *) echo "ANSWER-FAIL:$A" | tee -a "$OUT"; agent-browser close >/dev/null 2>&1; exit 1;; esac
  sleep 0.6
  if [ "$r" != "1" ]; then prog; fi
done
sleep 1
probe "(()=>{const t=document.body.innerText||'';const exp=['access','absolutely','ability'];const same=JSON.stringify(window.__r443w||[])===JSON.stringify(exp);return 'DECK-ORDER:'+(window.__r443w||[]).join('>')+' — '+(same?'LIST-ORDER-OK (newest-first default)':'ORDER-MISMATCH');})()" | tee -a "$OUT"
echo "---- دفترِ پس از پاس (flashcard_done باید +۱ شده باشد) ----" | tee -a "$OUT"
ledger

echo "########## G) حکمِ پردهٔ پایان در شب + سریالهایِ آموختهشده" | tee -a "$OUT"
LEARN_MODE="${LEARN_MODE:-0}" judge MOBILE-PASSDONE-DARK DARK
qa_wait_toasts_clear
qa_shot r443-mobile-passdone-dark.png

echo "########## H) قراردادِ تحویل — «ادامهٔ مرورِ دستی» به حالتِ دستیِ پر برمیگردد" | tee -a "$OUT"
click_by_label "ادامهٔ مرورِ دستی — همهٔ کارت‌ها"; sleep 1.2
probe "(()=>{const t=document.body.innerText||'';const manual=t.includes('کارت ۱ از ۳');const chip=t.includes('۳ بلدم');return (manual&&chip)?'HANDOFF-OK:manual+۳بلدم':'HANDOFF:'+JSON.stringify({manual,chip});})()" | tee -a "$OUT"
click_by_label "خروج"; sleep 1.2
probe "(()=>{const sec=document.querySelector('[aria-label=\"فلش‌کارت واژه‌های من\"]');return sec?'BACK-TO-LAUNCHER-OK':'NO-LAUNCHER';})()" | tee -a "$OUT"

echo "########## I) روشن — ورِ دوم: «۳ بلدم» + پاسِ فوریِ سررسیدِ خالی" | tee -a "$OUT"
qa_to_light
sleep 1
click_card "شروع فلش‌کارت"; sleep 1.5
probe "(()=>{const t=document.body.innerText||'';const manual=t.includes('کارت ۱ از ۳');const chip=t.includes('۳ بلدم');return (manual&&chip)?'REENTRY-OK:manual+۳بلدم':'REENTRY:'+JSON.stringify({manual,chip});})()" | tee -a "$OUT"
click_by_label "مرور هوشمند"; sleep 1
LEARN_MODE="${LEARN_MODE:-0}" judge MOBILE-PASSDONE-LIGHT LIGHT
qa_wait_toasts_clear
qa_shot r443-mobile-passdone-light.png
click_by_label "بازگشت"; sleep 1

echo "########## J) استورِ واقعی — بلدم ۳تایی + سررسیدِ آینده + reviews ۴→۷" | tee -a "$OUT"
probe "(()=>{const raw=JSON.parse(localStorage.getItem('vision2-study-v1')||'{}');const st=raw.state||{};const ks=['1:ability','1:absolutely','1:access'];const known3=ks.every(k=>st.known&&!!st.known[k]);const srsFuture=ks.every(k=>st.srs&&st.srs[k]&&st.srs[k].dueAt>Date.now());return 'STORE:known3='+known3+',srsFuture='+srsFuture+',reviews='+(st.dayStat?st.dayStat.reviews:'-');})()" | tee -a "$OUT"

agent-browser close >/dev/null 2>&1 || true
echo "########## WITNESS-DONE" | tee -a "$OUT"
