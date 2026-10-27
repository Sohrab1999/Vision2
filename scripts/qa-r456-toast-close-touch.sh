#!/usr/bin/env bash
# ------------------------------------------------------------------
# r456 — «شاهدِ موبایلِ «بستنِ توست» در لمس + بازداوریِ Escape» —
# شصتیکمین مصرفکنندهٔ qa-lib. دو رشته از پیشنهادهای r455 (هر دو غیرگیت):
#
#  ① بستن در لمس: ToastClose با opacity-0 + group-hover:opacity-100 —
#    در ۳۹۰ لمسی hover وجود ندارد → X نامرئی؛ تنها راهِ بستن، سوایپِ
#    راستِ رادیکس است (آستانهٔ پیشفرض ۵۰px). داوریِ زنده: opacityِ
#    محاسبهشده، hit-test (لمسِ نابینا)، گوشِ سوایپ (۱۲۰px در برابرِ ۳۰px)،
#    کلیکِ نابینا. تعمیرِ محصولیِ همین راند:
#    [@media(hover:none)]:opacity-100 + aria-label="بستن" (دکمهٔ آیکونی
#    بی نامِ دسترسپذیر). اثباتِ تکمتغیرِ پیش/پس: PHASE=pre روی باندلِ
#    کهنه، PHASE=post پسِ بیلدِ نو — همان جریانِ Anki، همان ۳۹۰×۸۴۴.
#
#  ② بازداوریِ Escape (حکمِ محصولیِ درسِ r455): سورسِ رادیکس —
#    useEscapeKeydown یک capture-listener در document است (بدونِ نیاز
#    به فوکوس) و فقط «بالاترین لایه» پاسخ میدهد — و چون Setِ لایهها به
#    ترتیبِ commit (DOMِ تازهترین-اول) پر میشود، بالاترین لایه =
#    «کهنترینِ» زنده است → هر فشارِ Escape دقیقاً «یک» توستِ کهنترین
#    را میبرد (نردبانِ ۳→۲→۱→۰ با سه فشار؛ زنده و در jsdom تأیید).
#      E1  پشتهٔ ۳تایی + Escapeِ سینتتیکِ document → ۲
#      E2  Escapeِ مطمئنِ CDP با فوکوسِ body → ۱
#      E3  فوکوسِ رویِ close + Escapeِ مطمئن → ۰ (مسیرِ per-root)
#      E4/S5  پشتهٔ متمایز + فشار تا ن=۱ → قربانی = کهنترین
#    → درسِ r455 («قاتلِ پشته») نقد میشود: Escape پشته را یکجا
#      نمیکشد — «هر فشار، کهنترین»؛ حکم در toaster.tsx ثبت میشود.
#    quirkِ ثبتشده: مسیرِ bubble (فوکوسِ درونِ توست)،
#      isFocusedToastEscapeKeyDownRefِ سطح-provider را TRUE رها
#      میکند → فشارِ بعدیِ سراسری بلعیده میشود (فقط ریست) —
#      PRESSES-NEEDED:2؛ قفلِ jsdom در toast-close-touch-r456.test.tsx.
#  ③ درسِ ابزاریِ نو (این راند): رویدادهایِ سینتتیکِ pointer رویِ
#    wrapper، تایمرِ همهٔ توستها را PAUSE میکند (wrapper pointermove/
#    focusin + window blur → isClosePausedRef=true) — پسِ هر صحنهٔ
#    سوایپ باید resume_family (window focus event) صدا شود وگرنه
#    توستها STUCK میمانند و صحنهٔ بعد آلوده است.
#
# درسهایِ توارثی: ensure_server (r454) / pkill فقط chrome (r453) /
# unescapeِ eval (r455) / رانِ فورگراند (r451) / qa_wait_toasts_clear
# (r395) / dismiss_install (r444+) / stubِ setPointerCapture برایِ
# PointerEventِ سینتتیک (نو — این راند).
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
PHASE="${PHASE:-pre}"
OUT=/tmp/r456-toast-close-$PHASE.txt
QA_SEED_FILE=/tmp/r456-witness-seed-eval.js
: > "$OUT"

source /home/z/my-project/scripts/qa-lib.sh

probe(){ agent-browser eval "$1" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
getvar(){ agent-browser eval "$1" 2>/dev/null | tail -1 | sed -e 's/^"//' -e 's/"$//'; }
shot(){ qa_shot "$1"; echo "SHOT:$1" | tee -a "$OUT"; }

# ---- درسِ r454: مرگهایِ بیصدا — پیشِ بوت، سرور را زنده کن
ensure_server(){ if curl -s -o /dev/null --max-time 3 http://127.0.0.1:3000/ 2>/dev/null; then echo "SERVER-ALIVE"; return 0; fi
  echo "SERVER-DEAD-REVIVING" | tee -a "$OUT"
  if ! pgrep -f "standalone/server.js" >/dev/null 2>&1; then
    setsid env n="file:/home/z/my-project/db/custom.db" TEACHER_ACCESS_CODE=moallem-1404 bun /home/z/my-project/.next/standalone/server.js >> /tmp/r453-watchdog.log 2>&1 &
  fi
  for i in $(seq 1 15); do sleep 2; if curl -s -o /dev/null --max-time 3 http://127.0.0.1:3000/ 2>/dev/null; then echo "SERVER-REVIVED" | tee -a "$OUT"; return 0; fi; done
  echo "FAIL-SERVER-REVIVE" | tee -a "$OUT"; return 1; }

seed_persona(){ node /home/z/my-project/scripts/r338-persona.js | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>process.stdout.write(JSON.parse(s).browserEval))" > "$QA_SEED_FILE" || { echo "PERSONA-FAIL" | tee -a "$OUT"; agent-browser close >/dev/null 2>&1; exit 1; }
  agent-browser eval "$(cat "$QA_SEED_FILE")" >/dev/null 2>&1
  sleep 5
  qa_wait_home || { agent-browser close >/dev/null 2>&1; exit 1; }
  qa_seed_guard_mobile || { agent-browser close >/dev/null 2>&1; exit 1; }
  dismiss_install; }

boot(){ ensure_server || return 1
agent-browser close >/dev/null 2>&1 || true
pkill -f "chrome.*--remote-debugging-port" 2>/dev/null; sleep 1
agent-browser open "$BASE" >/dev/null 2>&1
agent-browser set viewport 390 844 >/dev/null 2>&1
# شبیهسازیِ دستگاه لازم نیست — کرومِ هدلس ذاتاً hover:none است (پروبِ MEDIA
# این را زنده ثبت میکند)؛ دستگاههایِ پشتیبانیِ agent-browser (iPhone 15/16/17،
# Pixel 9، Galaxy S25) هیچکدام ۳۹۰×۸۴۴ نیستند — viewportِ خانواده را میشکنند.
agent-browser wait 'body' >/dev/null 2>&1 || true
sleep 2
seed_persona; }

dismiss_install(){ probe "(()=>{const b=document.querySelector('[aria-label=\"بستن پیشنهاد نصب\"]');if(b&&b.getBoundingClientRect().width>0){b.click();return 'INSTALL-CARD-DISMISSED';}return 'NO-INSTALL-CARD';})()"; sleep 1; }

# ---- پروبِ محیط: آیا شبیهسازیِ لمس برقرار است؟
MEDIA_PROBE='(()=>{return JSON.stringify({hoverNone:matchMedia("(hover: none)").matches,pointerCoarse:matchMedia("(pointer: coarse)").matches,maxTouch:navigator.maxTouchPoints||0,w:innerWidth,h:innerHeight,ua:(navigator.userAgent.match(/iPhone|Android|Chrome\/[\d.]+/)||["?"])[0]});})()'
media(){ getvar "$MEDIA_PROBE" | sed -e 's/\\"/"/g'; }

# ---- شمارندهٔ توستهایِ زنده (عنوانها برایِ شناساییِ بازمانده)
count_probe='(()=>{const lis=[...document.querySelectorAll("ol.fixed li")].filter((el)=>el.getBoundingClientRect().height>0&&el.getAttribute("data-state")==="open");return JSON.stringify({n:lis.length,t:lis.map((el)=>(el.textContent||"").replace(/\s+/g," ").trim().slice(0,18))});})()'
cnt(){ getvar "$count_probe" | sed -e 's/\\"/"/g'; }
wait_n(){ getvar "(()=>new Promise((res)=>{let k=0;const tick=()=>{const lis=[...document.querySelectorAll('ol.fixed li')].filter((el)=>el.getBoundingClientRect().height>0&&el.getAttribute('data-state')==='open');if(lis.length>=$1)return res('N-OK:'+lis.length);if(++k>32)return res('N-TIMEOUT:'+lis.length);setTimeout(tick,250);};tick();}))()"; }
wait_gone(){ getvar "(()=>new Promise((res)=>{let k=0;const t=()=>{const lis=[...document.querySelectorAll('ol.fixed li')].filter((el)=>el.getBoundingClientRect().height>0&&el.getAttribute('data-state')==='open');if(lis.length===0)return res('GONE');if(++k>16)return res('STILL:'+lis.length);setTimeout(t,300);};t();}))()"; }

# ---- جریانهایِ راستین (الگویِ r455)
go_dict(){ getvar "(()=>{const b=[...document.querySelectorAll('button')].find((x)=>(x.innerText||'').includes('دیکشنری جستجو')&&x.getBoundingClientRect().width>0);if(!b)return 'NO-DICT-CARD';b.click();return 'DICT-CLICKED';})()" >/dev/null 2>&1; sleep 2.5; }
fire_anki(){ getvar "(()=>{const b=document.querySelector(\"[aria-label^='صادرات']\");if(!b||b.getBoundingClientRect().width===0)return 'NO-ANKI';b.click();return 'ANKI-FIRED';})()"; }

# ---- پروبِ دکمهٔ بستن — قلبِ رشتهٔ ①
CLOSE_PROBE='(()=>{const lis=[...document.querySelectorAll("ol.fixed li")].filter((el)=>el.getBoundingClientRect().height>0&&el.getAttribute("data-state")==="open");if(!lis.length)return JSON.stringify({err:"NO-TOAST"});const li=lis[0];const btn=li.querySelector("[toast-close]");if(!btn)return JSON.stringify({err:"NO-CLOSE-BTN"});const cs=getComputedStyle(btn);const r=btn.getBoundingClientRect();const cx=r.left+r.width/2,cy=r.top+r.height/2;const hit=document.elementFromPoint(cx,cy);return JSON.stringify({opacity:cs.opacity,vis:cs.visibility,aria:btn.getAttribute("aria-label"),right:cs.right,top:cs.top,w:+r.width.toFixed(1),h:+r.height.toFixed(1),icon:(btn.querySelector("svg")?+btn.querySelector("svg").getBoundingClientRect().width.toFixed(1):0),ink:cs.color,hitIsBtn:!!hit&&(hit===btn||btn.contains(hit)),hitTag:hit?hit.tagName.toLowerCase():"NULL",hoverNone:matchMedia("(hover: none)").matches,coarse:matchMedia("(pointer: coarse)").matches});})()'
close_probe(){ getvar "$CLOSE_PROBE" | sed -e 's/\\"/"/g'; }

# ---- سوایپِ سینتتیک (رادیکس pointer-based) — stubِ setPointerCapture
# چون PointerEventِ ساختهشده با pointerIdِ جعلی، setPointerCaptureِ
# واقعی را NotFound میکند؛ stub پیشِ ستِ swipeDeltaRef ضرری نیست —
# مسیرِ SWIPE_END/CANCEL از swipeDeltaRef میآید نه از capture.
swipe_toast(){ getvar "(()=>{
  const li=[...document.querySelectorAll('ol.fixed li')].find((el)=>el.getBoundingClientRect().height>0&&el.getAttribute('data-state')==='open');
  if(!li)return 'NO-TOAST';
  const r=li.getBoundingClientRect();
  const y=r.top+r.height/2, x0=r.left+Math.min(110,r.width*0.55);
  const ev=(t,x)=>new PointerEvent(t,{bubbles:true,cancelable:true,composed:true,button:0,pointerId:7,pointerType:'touch',isPrimary:true,clientX:x,clientY:y});
  if(!window.__spcOrig){window.__spcOrig=Element.prototype.setPointerCapture;Element.prototype.setPointerCapture=function(){};}
  li.dispatchEvent(ev('pointerdown',x0));
  li.dispatchEvent(ev('pointermove',x0+$1));
  li.dispatchEvent(ev('pointerup',x0+$1));
  return 'SWIPE-DISPATCHED:'+$1;
})()"; }
restore_spc(){ getvar "(()=>{if(window.__spcOrig){Element.prototype.setPointerCapture=window.__spcOrig;window.__spcOrig=null;return 'SPC-RESTORED';}return 'SPC-CLEAN';})()"; }

# ---- رفعِ Pause: بعد از رویدادهایِ pointerِ سینتتیک، تایمرِ خانواده
# خوابیده است — window focus، handleResumeِ رادیکس را بیدار میکند
resume_family(){ getvar "(()=>{window.dispatchEvent(new Event('focus'));return 'FAMILY-RESUMED';})()"; }

# ---- بستن با کلیک و با Escape
click_close(){ getvar "(()=>{const li=[...document.querySelectorAll('ol.fixed li')].find((el)=>el.getBoundingClientRect().height>0&&el.getAttribute('data-state')==='open');if(!li)return 'NO-TOAST';const b=li.querySelector('[toast-close]');if(!b)return 'NO-CLOSE-BTN';b.click();return 'CLOSE-CLICKED';})()"; }
esc_synth(){ getvar "(()=>{document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));return 'ESC-SYNTH-DISPATCHED';})()"; }
cou_fail_on(){ getvar "(()=>{if(!window.__origCOU)window.__origCOU=URL.createObjectURL.bind(URL);URL.createObjectURL=function(){throw new TypeError('r456-cou-injected');};return 'COU-FAIL-ON';})()"; }
cou_restore(){ getvar "(()=>{if(window.__origCOU)URL.createObjectURL=window.__origCOU;return 'COU-RESTORED';})()"; }
blur_focus(){ getvar "(()=>{if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();return 'BODY-FOCUS';})()"; }
focus_close(){ getvar "(()=>{const li=[...document.querySelectorAll('ol.fixed li')].filter((el)=>el.getBoundingClientRect().height>0&&el.getAttribute('data-state')==='open')[$1||0];if(!li)return 'NO-TOAST';const b=li.querySelector('[toast-close]');if(!b)return 'NO-CLOSE-BTN';b.focus();return 'FOCUSED:'+(document.activeElement===b);})()"; }

# ---- پروبِ قانونِ CSSِ سرویسشده (فازِ post): آیا Tailwind v4 قانونِ
# @media(hover:none) → opacity-100 را در باندلِ تولید کرده؟ — پیمایشِ
# بازگشتی لازم است: قانون در @layer/@supports تو در توست.
CSS_RULE_PROBE='(()=>{const found=[];const walk=(rules)=>{for(const r of rules){try{if(r.media&&(r.media.mediaText||"").replace(/\s/g,"").includes("hover:none")){for(const ir of r.cssRules){if(ir.selectorText&&ir.selectorText.includes("opacity-100"))found.push(ir.selectorText+"{"+ir.style.cssText+"}");}}if(r.cssRules&&r.cssRules.length&&(r instanceof CSSLayerBlockRule||r instanceof CSSSupportsRule||r instanceof CSSMediaRule))walk(r.cssRules);}catch(e){}}};for(const s of document.styleSheets){try{walk(s.cssRules)}catch(e){}}return JSON.stringify({n:found.length,found:found.slice(0,2)});})()'
css_rule(){ getvar "$CSS_RULE_PROBE" | sed -e 's/\\"/"/g'; }

echo "########## r456 PHASE=$PHASE — boot + seed + media" | tee -a "$OUT"
boot || { echo "FAIL-BOOT" | tee -a "$OUT"; agent-browser close >/dev/null 2>&1; exit 1; }
echo "MEDIA>> $(media)" | tee -a "$OUT"

if [ "$PHASE" = "pre" ]; then
  echo "########## S1) بستنِ نامرئی در لمس — عیبِ زنده (پیشِ تعمیر)" | tee -a "$OUT"
  go_dict
  F=$(fire_anki); echo "FIRE(Anki): $F" | tee -a "$OUT"
  W=$(wait_n 1); echo "W1: $W" | tee -a "$OUT"
  CP=$(close_probe); echo "CLOSE-PRE>> $CP" | tee -a "$OUT"
  echo "$CP" | rg -q '"opacity":"0"' && echo "CLOSE-INVISIBLE-ON-TOUCH-OK" | tee -a "$OUT" || echo "FAIL-CLOSE-NOT-INVISIBLE" | tee -a "$OUT"
  echo "$CP" | rg -q '"aria":null' && echo "A11Y-NO-NAME-OK" | tee -a "$OUT" || echo "A11Y-NAME-PRESENT" | tee -a "$OUT"
  echo "$CP" | rg -q '"hitIsBtn":true' && echo "TAP-REACHES-BUT-UNSEEN-OK" | tee -a "$OUT" || echo "FAIL-HIT-MISS" | tee -a "$OUT"
  shot r456-close-invisible-pre.png
  qa_wait_toasts_clear

  echo "########## S2) کلیکِ نابینا — صحنهٔ تمیزِ تک-توستی (پیشِ سوایپ، درسِ آلودگی)" | tee -a "$OUT"
  fire_anki >/dev/null 2>&1; W=$(wait_n 1); echo "W2: $W" | tee -a "$OUT"
  CC=$(click_close); echo "CLICK: $CC" | tee -a "$OUT"
  G=$(wait_gone); echo "GONE-CLICK: $G" | tee -a "$OUT"
  [ "$G" = "GONE" ] && echo "CLOSE-CLICK-WORKS-OK" | tee -a "$OUT" || echo "FAIL-CLOSE-CLICK" | tee -a "$OUT"

  echo "########## S3) گوشِ سوایپِ رادیکس — ۱۲۰px میمیراند، ۳۰px نه (آستانهٔ ۵۰)" | tee -a "$OUT"
  fire_anki >/dev/null 2>&1; W=$(wait_n 1); echo "W3a: $W" | tee -a "$OUT"
  SW=$(swipe_toast 120); echo "SWIPE-120: $SW" | tee -a "$OUT"
  G=$(wait_gone); echo "GONE-120: $G" | tee -a "$OUT"
  [ "$G" = "GONE" ] && echo "SWIPE-DISMISS-OK" | tee -a "$OUT" || echo "FAIL-SWIPE-DISMISS" | tee -a "$OUT"
  fire_anki >/dev/null 2>&1; W=$(wait_n 1); echo "W3b: $W" | tee -a "$OUT"
  SW=$(swipe_toast 30); echo "SWIPE-30: $SW" | tee -a "$OUT"
  sleep 0.5
  C=$(cnt); echo "AFTER-30>> $C" | tee -a "$OUT"
  echo "$C" | rg -q '"n":1' && echo "SWIPE-CANCEL-OK" | tee -a "$OUT" || echo "FAIL-SWIPE-CANCEL" | tee -a "$OUT"
  restore_spc
  resume_family
  qa_wait_toasts_clear

  echo "########## S4) نردبانِ Escape — ۳→۲→۱→۰ با سه فشار (هر فشار = کهنترین)" | tee -a "$OUT"
  qa_wait_toasts_clear
  fire_anki >/dev/null 2>&1; sleep 0.3
  fire_anki >/dev/null 2>&1; sleep 0.3
  fire_anki >/dev/null 2>&1; W=$(wait_n 3); echo "W4(3-stack): $W" | tee -a "$OUT"
  E1=$(esc_synth); sleep 0.5; C=$(cnt); echo "E1(synth-doc,3to2): $E1 >> $C" | tee -a "$OUT"
  echo "$C" | rg -q '"n":2' && echo "ESC-LADDER-1-OK" | tee -a "$OUT" || echo "FAIL-ESC-LADDER-1>> $C" | tee -a "$OUT"
  blur_focus
  agent-browser press Escape >/dev/null 2>&1; sleep 0.5
  C=$(cnt); echo "E2(trusted-body,2to1)>> $C" | tee -a "$OUT"
  echo "$C" | rg -q '"n":1' && echo "ESC-LADDER-2-OK" | tee -a "$OUT" || echo "FAIL-ESC-LADDER-2>> $C" | tee -a "$OUT"
  FC=$(focus_close 0); echo "FOCUS: $FC" | tee -a "$OUT"
  agent-browser press Escape >/dev/null 2>&1
  G=$(wait_gone); echo "E3(focused,1to0) GONE: $G" | tee -a "$OUT"
  [ "$G" = "GONE" ] && echo "ESC-LADDER-3-OK" | tee -a "$OUT" || echo "FAIL-ESC-LADDER-3" | tee -a "$OUT"

  echo "########## S5) پشتهٔ تازهٔ متمایز + فشار تا ن=۱ — قربانی = کهنترین؛ quirkِ فلگِ چسبان" | tee -a "$OUT"
  # درسِ S4 + مدلِ نهایی: capture-listener بالاترین لایه را میگیرد و چون
  # Set به ترتیبِ commit (تازهترین-اول) پر شده، بالاترین = کهنترین —
  # هر فشار، کهنترینِ زنده را میبرد. مسیرِ bubble (E3) فلگِ سطح-provider
  # را TRUE رها میکند → فشارِ بعدی بلعیده میشود (فقط ریست) — حلقه تا ن=۱
  # فشار میدهد و شمارِ فشارها شاهدِ quirk است.
  qa_wait_toasts_clear
  fire_anki >/dev/null 2>&1; sleep 0.4
  cou_fail_on
  fire_anki >/dev/null 2>&1; sleep 0.6
  cou_restore
  C=$(cnt); echo "S5-stack>> $C" | tee -a "$OUT"
  echo "$C" | rg -q '"n":2' && echo "$C" | rg -q 'خطا در ساخت' && echo "$C" | rg -q 'خروجی Anki' && echo "S5-STACK-DISTINCT-OK" | tee -a "$OUT" || echo "FAIL-S5-STACK>> $C" | tee -a "$OUT"
  C=""; N1=0
  for k in 1 2 3; do
    esc_synth >/dev/null 2>&1; sleep 0.6
    C=$(cnt); N1=$(echo "$C" | rg -o '"n":[0-9]+' | rg -o '[0-9]+' | head -1)
    echo "S5-press$k>> $C" | tee -a "$OUT"
    [ "$N1" = "1" ] && { echo "PRESSES-NEEDED:$k" | tee -a "$OUT"; [ "$k" = "2" ] && echo "STICKY-REF-SWALLOW-WITNESSED-OK" | tee -a "$OUT"; break; }
  done
  [ "$N1" = "1" ] && echo "$C" | rg -q 'خروجی Anki' && ! echo "$C" | rg -q 'خطا در ساخت' && echo "ESC-KILLS-OLDEST-ONLY-OK" | tee -a "$OUT" || echo "FAIL-ESC-KILLS-OLDEST>> $C" | tee -a "$OUT"
  shot r456-escape-verdict.png
  restore_spc
  resume_family
  qa_wait_toasts_clear
  echo "PRE-PHASE-DONE" | tee -a "$OUT"
else
  echo "########## P1) بستنِ پیدا در لمس — پسِ تعمیر (تکمتغیر با S1)" | tee -a "$OUT"
  go_dict
  F=$(fire_anki); echo "FIRE(Anki): $F" | tee -a "$OUT"
  W=$(wait_n 1); echo "W-P1: $W" | tee -a "$OUT"
  CP=$(close_probe); echo "CLOSE-POST>> $CP" | tee -a "$OUT"
  echo "$CP" | rg -q '"opacity":"1"' && echo "$CP" | rg -q '"hoverNone":true' && echo "CLOSE-VISIBLE-ON-TOUCH-OK" | tee -a "$OUT" || echo "FAIL-CLOSE-STILL-HIDDEN>> $CP" | tee -a "$OUT"
  echo "$CP" | rg -q '"aria":"بستن"' && echo "A11Y-NAME-OK" | tee -a "$OUT" || echo "FAIL-A11Y-NAME" | tee -a "$OUT"
  CR=$(css_rule); echo "CSS-RULE>> $CR" | tee -a "$OUT"
  echo "$CR" | rg -q '"n":[1-9]' && echo "HOVER-NONE-RULE-SHIPPED-OK" | tee -a "$OUT" || echo "FAIL-CSS-RULE-MISSING" | tee -a "$OUT"
  shot r456-close-visible-post.png
  qa_wait_toasts_clear

  echo "########## P2/P3) سوایپ و کلیک پسِ تعمیر — هر دو مسیر دستنخورده" | tee -a "$OUT"
  fire_anki >/dev/null 2>&1; W=$(wait_n 1); echo "W-P2: $W" | tee -a "$OUT"
  CC=$(click_close); echo "CLICK: $CC" | tee -a "$OUT"
  G=$(wait_gone); echo "GONE-CLICK: $G" | tee -a "$OUT"
  [ "$G" = "GONE" ] && echo "CLOSE-CLICK-POST-OK" | tee -a "$OUT" || echo "FAIL-CLICK-POST" | tee -a "$OUT"
  fire_anki >/dev/null 2>&1; W=$(wait_n 1); echo "W-P3: $W" | tee -a "$OUT"
  SW=$(swipe_toast 120); echo "SWIPE-120: $SW" | tee -a "$OUT"
  G=$(wait_gone); echo "GONE-120: $G" | tee -a "$OUT"
  [ "$G" = "GONE" ] && echo "SWIPE-INTACT-POST-OK" | tee -a "$OUT" || echo "FAIL-SWIPE-POST" | tee -a "$OUT"
  restore_spc
  resume_family

  echo "########## P4) قراردادِ Escape پسِ تعمیر — قربانی = کهنترین، پابرجا" | tee -a "$OUT"
  qa_wait_toasts_clear
  fire_anki >/dev/null 2>&1; sleep 0.4
  cou_fail_on
  fire_anki >/dev/null 2>&1; sleep 0.6
  cou_restore
  C=$(cnt); echo "P4-stack>> $C" | tee -a "$OUT"
  C=""; N1=0
  for k in 1 2 3; do
    esc_synth >/dev/null 2>&1; sleep 0.6
    C=$(cnt); N1=$(echo "$C" | rg -o '"n":[0-9]+' | rg -o '[0-9]+' | head -1)
    echo "P4-press$k>> $C" | tee -a "$OUT"
    [ "$N1" = "1" ] && { echo "PRESSES-NEEDED:$k" | tee -a "$OUT"; break; }
  done
  [ "$N1" = "1" ] && echo "$C" | rg -q 'خروجی Anki' && echo "ESC-KILLS-OLDEST-POST-OK" | tee -a "$OUT" || echo "FAIL-ESC-POST>> $C" | tee -a "$OUT"
  restore_spc
  resume_family
  qa_wait_toasts_clear
  echo "POST-PHASE-DONE" | tee -a "$OUT"
fi

echo "########## END PHASE=$PHASE" | tee -a "$OUT"
agent-browser close >/dev/null 2>&1 || true
