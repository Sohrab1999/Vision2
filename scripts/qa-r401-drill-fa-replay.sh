#!/usr/bin/env bash
# ------------------------------------------------------------------
# r401 — «معنی + مرورِ اشتباهها» — ششمین مصرفکنندهٔ qa-lib.sh و داوریِ
#   زندهٔ دو رشدِ دریل رویِ buildِ راند (تک سشن):
#   ① گونهٔ چهارم (fa): معرفیِ نو («معنیِ فارسی» + وعدهٔ مرور)، یک
#     پرسشِ fa با پاسخِ درستِ بانکمحور (نقشهٔ fa از appendix.ts) —
#     گزینههایِ فارسی بدونِ en-text (رندرِ RTL witnessed).
#   ② مرورِ اشتباهها: دکمه با شمارندهٔ واقعی = ردیفهایِ «پاسخِ تو»؛
#     جلسهٔ مرور «سؤال ۱ از n»؛ پایانش «نتیجهٔ مرور» صادقانه؛
#     «تمرین دوباره» به جلسهٔ کاملِ ۱۰تایی برمیگردد.
#   درسِ revive (r395/r397/r400): هر بخش ناوبریِ idempotent خودش را
#   دارد — سرصفحه همیشه زنده است.
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
OUT=/tmp/r401-witness.txt
QA_SEED_FILE=/tmp/r401-seed-eval.js
QA_REC=__qarec
: > "$OUT"

source /home/z/my-project/scripts/qa-lib.sh

click_by_label(){ agent-browser eval "(()=>{let b=document.querySelector('[aria-label=\"$1\"]');if(!b||b.getBoundingClientRect().width===0){b=[...document.querySelectorAll('button')].find((x)=>(x.innerText||'').replace(/\s+/g,' ').trim()==='$1'&&x.getBoundingClientRect().width>0);}if(!b)return 'NO-BTN:$1';b.click();return 'CLICKED:$1';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
probe(){ agent-browser eval "$1" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
answer_first(){ agent-browser eval "(()=>{const b=[...document.querySelectorAll('button')].find((x)=>/^گزینه [۱-۴]: /.test(x.getAttribute('aria-label')||'')&&x.getBoundingClientRect().width>0&&!x.disabled);if(!b)return 'NO-OPT';b.click();return 'ANSWERED';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
click_next(){ agent-browser eval "(()=>{const b=[...document.querySelectorAll('button')].find((x)=>['سؤال بعدی','دیدن نتیجهٔ تمرین'].includes(x.getAttribute('aria-label')||'')&&x.getBoundingClientRect().width>0&&!x.disabled);if(!b)return 'NO-NEXT';const lbl=b.getAttribute('aria-label');b.click();return 'NEXT:'+lbl;})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

echo "########## ۰) نقشهٔ fa از بانکِ منجمد (بدونِ دستسازی) ##########" | tee -a "$OUT"
node -e '
const fs=require("fs");
const src=fs.readFileSync("/home/z/my-project/src/data/appendix.ts","utf8");
const re=/base:\s*"([^"]+)",\s*past:\s*"([^"]+)",\s*pp:\s*"([^"]+)",\s*fa:\s*"([^"]+)"/g;
const map={};let m,n=0;while((m=re.exec(src))){map[m[1]]=m[4];n++;}
if(n!==87){console.log("MAP-BAD:"+n);process.exit(1);}
fs.writeFileSync("/tmp/r401-fa-map.json",JSON.stringify(map));
console.log("MAP-OK:"+n);
' 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"

echo "########## A) خانه — seed + روشنِ ۱۲۸۰ ##########" | tee -a "$OUT"
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
# نقشهٔ fa یکجا تزریق میشود — جایگذاریِ تو در تو ممنوع (درسِ راند: نقلقولِ
# دوتاییِ تو در تو رشتهٔ JS را میشکند — SyntaxError بیصدا)
agent-browser eval "window.__faMap=$(cat /tmp/r401-fa-map.json);'MAP-IN'" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"
qa_to_light

echo "########## B) معرفیِ نو: «معنیِ فارسی» + وعدهٔ مرور ##########" | tee -a "$OUT"
click_by_label "ضمیمه"; sleep 2.5
click_by_label "افعال بی‌قاعده"; sleep 2
click_by_label "شروع تمرین افعال بی‌قاعده"; sleep 1.5
probe "(()=>{const t=document.body.innerText||'';return JSON.stringify({introFa:t.includes('معنیِ فارسی'),introReplay:t.includes('دوباره پرسیده میشوند'),startBtn:!!document.querySelector('[aria-label=\"شروع جلسهٔ تمرین فعل\"]')});})()"
click_by_label "شروع جلسهٔ تمرین فعل"; sleep 1.5

echo "########## C) جلسهٔ ۱۰تایی: چرخشِ ۴گونه + پاسخِ درستِ بانکمحورِ fa ##########" | tee -a "$OUT"
probe "(()=>{const t=document.body.innerText||'';return JSON.stringify({q1:t.includes('سؤال ۱ از ۱۰'),opts:document.querySelectorAll('[aria-label^=\"گزینه \"]').length});})()"
for i in $(seq 1 10); do
  P=$(agent-browser eval "(()=>{const h=document.querySelector('h3');return JSON.stringify({p:(h&&h.innerText)||''});})()" 2>/dev/null | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{try{const o=JSON.parse(JSON.parse(s));console.log(o.p)}catch(e){console.log('')}})")
  if echo "$P" | grep -q "معنی"; then
    V=$(echo "$P" | sed -n 's/.*«\([^»]\+\)».*/\1/p' | tail -1)
    agent-browser eval "(()=>{const V=$(node -e "console.log(JSON.stringify(process.argv[1]))" "$V" 2>/dev/null || echo '""');const want=(window.__faMap||{})[V]||'';if(!want)return 'FA-VERB-MISS:'+V;const b=[...document.querySelectorAll('button')].find((x)=>{const l=(x.getAttribute('aria-label')||'').replace(/^گزینه [۱-۴]: /,'').replace(/ — پاسخ درست$/,'');return /^گزینه [۱-۴]: /.test(x.getAttribute('aria-label')||'')&&l===want&&x.getBoundingClientRect().width>0&&!x.disabled;});if(!b)return 'FA-OPT-MISS:'+V;const span=b.querySelector('span');b.click();return 'FA-ANSWERED['+V+']:'+(span&&!span.className.includes('en-text')?'RTL-FA':'EN-LEAK');})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"
  else
    answer_first
  fi
  sleep 0.5
  click_next
  sleep 0.5
done
probe "(()=>{const t=document.body.innerText||'';const m=(t.match(/نمرهٔ؟ [^\\n]*/)||t.match(/[۰-۹]+٪/)||[])[0];const rows=[...document.querySelectorAll('[aria-label=\"بازخوانی سؤال‌های تمرین\"] li')];const wrong=rows.filter((li)=>li.textContent.includes('پاسخِ تو')).length;const faRows=rows.filter((li)=>li.textContent.includes('معنیِ')).length;const btn=document.querySelector('[aria-label=\"مرور اشتباههای تمرین\"]');return JSON.stringify({score:m,wrong,faRows,faRowsOK:faRows>0,replayBtn:btn?btn.innerText.replace(/\\s+/g,' '):null,replayCountMatch:btn?btn.textContent.includes(String(wrong).replace(/[0-9]/g,(d)=>'۰۱۲۳۴۵۶۷۸۹'[+d])):false});})()"
qa_shot r401-result-light.png

echo "########## D) مرورِ اشتباهها: از n تا «نتیجهٔ مرور» ##########" | tee -a "$OUT"
click_by_label "مرور اشتباههای تمرین"; sleep 1.2
probe "(()=>{const t=document.body.innerText||'';return JSON.stringify({replayRun:t.includes('سؤال ۱ از'),isTen:t.includes('از ۱۰')});})()"
for i in $(seq 1 10); do
  S=$(agent-browser eval "(()=>{const t=document.body.innerText||'';const m=t.match(/سؤال \\S+ از (\\S+)/);return m?m[1]:'DONE';})()" 2>/dev/null | tr -d '"')
  [ "$S" = "DONE" ] && break
  answer_first; sleep 0.4
  click_next; sleep 0.4
done
probe "(()=>{const t=document.body.innerText||'';return JSON.stringify({replayResult:t.includes('نتیجهٔ مرور'),notDrill:t.includes('نتیجهٔ تمرین')===false,replayAgain:!!document.querySelector('[aria-label=\"مرور اشتباههای تمرین\"]')});})()"
qa_shot r401-replay-result-light.png

echo "########## E) تمرین دوباره → ۱۰ تازه؛ خروج سالم ##########" | tee -a "$OUT"
click_by_label "تمرین دوباره"; sleep 1.2
probe "(()=>{const t=document.body.innerText||'';return JSON.stringify({fresh10:t.includes('سؤال ۱ از ۱۰')});})()"
click_by_label "انصراف از تمرین"; sleep 1.5
probe "(()=>{const t=document.body.innerText||'';return JSON.stringify({tableBack:!!document.querySelector('input[placeholder^=\"جست‌وجو\"]'),drillGone:!t.includes('سؤال')});})()"

echo "########## F) پرسشِ fa در تمِ تاریک ##########" | tee -a "$OUT"
qa_to_dark
click_by_label "شروع تمرین افعال بی‌قاعده"; sleep 1.5
click_by_label "شروع جلسهٔ تمرین فعل"; sleep 1.5
for i in 1 2 3; do answer_first >/dev/null 2>&1; click_next >/dev/null 2>&1; sleep 0.4; done
probe "(()=>{const t=document.body.innerText||'';return JSON.stringify({isFaQ:t.includes('معنیِ')});})()"
qa_shot r401-fa-question-dark.png

agent-browser close >/dev/null 2>&1 || true
echo "########## R401-WITNESS-DONE ##########" | tee -a "$OUT"
