#!/usr/bin/env bash
# ------------------------------------------------------------------
# r403 — «دریلِ خانوادهٔ واژه‌ها» — هشتمین مصرفکنندهٔ qa-lib.sh و داوریِ
#   زندهٔ رشدِ واژه‌سازی رویِ buildِ راند (تک سشن):
#   ① ورود: ضمیمه → «اجزای کلام» → دکمهٔ «تمرین» کنارِ سربرگِ خانوادهها —
#     جدولها پابرجا؛ معرفیِ واژه (۲۴۶ خانوادهٔ صادق).
#   ② جلسهٔ کامل: ۱۰ پرسش × ۴ گزینه؛ پرسشِ اول گونهٔ fa (گزینههایِ فارسی)؛
#     چرخشِ ۵گونه witnessed؛ پاسخِ درستِ بانکمحور با نقشهٔ لنگر.
#   ③ نتیجهٔ صادق + بازخوانی؛ «تمرین دوباره» → پرسشِ تازه؛ خروجِ سالم.
#   درسِ revive: هر بخش ناوبریِ idempotent خودش را دارد.
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
OUT=/tmp/r403-witness.txt
QA_SEED_FILE=/tmp/r403-seed-eval.js
QA_REC=__qarec
: > "$OUT"

source /home/z/my-project/scripts/qa-lib.sh

click_by_label(){ agent-browser eval "(()=>{let b=document.querySelector('[aria-label=\"$1\"]');if(!b||b.getBoundingClientRect().width===0){b=[...document.querySelectorAll('button')].find((x)=>(x.innerText||'').replace(/\s+/g,' ').trim()==='$1'&&x.getBoundingClientRect().width>0);}if(!b)return 'NO-BTN:$1';b.click();return 'CLICKED:$1';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
probe(){ agent-browser eval "$1" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
answer_first(){ agent-browser eval "(()=>{const b=[...document.querySelectorAll('button')].find((x)=>/^گزینه [۱-۴]: /.test(x.getAttribute('aria-label')||'')&&x.getBoundingClientRect().width>0&&!x.disabled);if(!b)return 'NO-OPT';b.click();return 'ANSWERED';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
click_next(){ agent-browser eval "(()=>{const b=[...document.querySelectorAll('button')].find((x)=>['سؤال بعدی','دیدن نتیجهٔ تمرین'].includes(x.getAttribute('aria-label')||'')&&x.getBoundingClientRect().width>0&&!x.disabled);if(!b)return 'NO-NEXT';const lbl=b.getAttribute('aria-label');b.click();return 'NEXT:'+lbl;})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

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
qa_to_light

echo "########## B) ضمیمه → اجزای کلام → دکمهٔ «تمرین» ##########" | tee -a "$OUT"
click_by_label "ضمیمه"; sleep 2.5
click_by_label "اجزای کلام"; sleep 2.5
probe "(()=>{const t=document.body.innerText||'';return JSON.stringify({tables:t.includes('خانوادهٔ واژه‌ها از خودِ جزوه‌ها'),entry:!!document.querySelector('[aria-label=\"شروع تمرین خانوادهٔ واژه‌ها\"]'),count:t.match(/۲۴۶ خانواده/)!==null});})()"
click_by_label "شروع تمرین خانوادهٔ واژه‌ها"; sleep 1.5
probe "(()=>{const t=document.body.innerText||'';return JSON.stringify({intro:t.includes('تمرین خانوادهٔ واژه‌ها'),intro246:t.includes('۲۴۶ خانواده'),introKinds:t.includes('صفت، قید، فعل و اسم'),startBtn:!!document.querySelector('[aria-label=\"شروع جلسهٔ تمرین واژه\"]')});})()"
qa_shot r403-word-intro-light.png
click_by_label "شروع جلسهٔ تمرین واژه"; sleep 1.5

echo "########## C) جلسهٔ ۱۰تایی: چرخشِ ۵گونه + پاسخِ بانکمحورِ fa ##########" | tee -a "$OUT"
node -e '
const fs=require("fs");
const src=fs.readFileSync("/home/z/my-project/src/data/word-families.ts","utf8");
const re=/F\("([^"]*)",\s*"([^"]*)",\s*"([^"]*)",\s*"([^"]*)",\s*"([^"]*)"\)/g;
const anchors=[];let m;
while((m=re.exec(src))){const [_,adverb,adjective,verb,fa,noun]=m;const en=[verb,noun,adjective,adverb].find(v=>v!=="");if(fa!==""&&en&&!(en in Object.fromEntries(anchors)))anchors.push([en,fa]);}
const uniq=Object.fromEntries(anchors);
fs.writeFileSync("/tmp/r403-anchor-map.json",JSON.stringify(uniq));
console.log("ANCHORS:"+Object.keys(uniq).length);
' 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"
# تزریقِ یکجا — درسِ r401-⑤: جایگذاریِ تو در تو ممنوع
agent-browser eval "window.__anchorMap=$(cat /tmp/r403-anchor-map.json);'MAP-IN'" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"
probe "(()=>{const t=document.body.innerText||'';const chips=[...document.querySelectorAll('[role=\"group\"] span[aria-hidden]')].filter((el)=>el.className.includes('font-mono')).map((c)=>c.textContent);return JSON.stringify({q1:t.includes('سؤال ۱ از ۱۰'),opts:document.querySelectorAll('[aria-label^=\"گزینه \"]').length,chips,firstFa:t.includes('معنیِ')});})()"
for i in $(seq 1 10); do
  P=$(agent-browser eval "(()=>{const h=document.querySelector('h3');return JSON.stringify({p:(h&&h.innerText)||''});})()" 2>/dev/null | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{try{console.log(JSON.parse(JSON.parse(s)).p)}catch(e){console.log('')}})")
  KIND="other"
  if echo "$P" | grep -q "^معنیِ"; then KIND="fa"; elif echo "$P" | grep -q "^صفتِ"; then KIND="adjective"; elif echo "$P" | grep -q "^قیدِ"; then KIND="adverb"; elif echo "$P" | grep -qE "^فعلِ خانواده"; then KIND="verb"; elif echo "$P" | grep -q "^اسمِ"; then KIND="noun"; fi
  echo "Q${i}:KIND=${KIND}" | tee -a "$OUT"
  if [ "$KIND" = "fa" ]; then
    V=$(echo "$P" | sed -n 's/.*«\([^»]\+\)».*/\1/p' | tail -1)
    WANT=$(node -e "const u=JSON.parse(require('fs').readFileSync('/tmp/r403-anchor-map.json','utf8'))[process.argv[1]]||'';console.log(JSON.stringify(u))" "$V" 2>/dev/null || echo '""')
    RES=$(agent-browser eval "(()=>{const want=${WANT};if(!want)return 'FA-VERB-MISS';const b=[...document.querySelectorAll('button')].find((x)=>{const l=(x.getAttribute('aria-label')||'').replace(/^گزینه [۱-۴]: /,'').replace(/ — پاسخ درست$/,'');return /^گزینه [۱-۴]: /.test(x.getAttribute('aria-label')||'')&&l===want&&x.getBoundingClientRect().width>0&&!x.disabled;});if(!b)return 'FA-OPT-MISS:'+want;b.click();return 'FA-ANSWERED['+want+']';})()" 2>&1)
    echo "$RES" | tee -a "$OUT"; echo | tee -a "$OUT"
    case "$RES" in *FA-ANSWERED*) ;; *) answer_first ;; esac
  else
    answer_first
  fi

  sleep 0.4
  click_next
  sleep 0.4
done
probe "(()=>{const t=document.body.innerText||'';const sc=(t.match(/[۰-۹]+٪/)||[])[0];const rows=[...document.querySelectorAll('[aria-label=\"بازخوانی سؤال‌های تمرین\"] li')];const faRows=rows.filter((li)=>li.textContent.includes('معنیِ')).length;return JSON.stringify({result:t.includes('نتیجهٔ تمرین'),score:sc,rows:rows.length,faRows,replayBtn:!!document.querySelector('[aria-label=\"مرور اشتباههای تمرین\"]')});})()"
qa_shot r403-word-result-light.png

echo "########## D) تمرین دوباره → تازه؛ خروجِ سالم ##########" | tee -a "$OUT"
click_by_label "تمرین دوباره"; sleep 1.5
probe "(()=>{const t=document.body.innerText||'';return JSON.stringify({fresh10:t.includes('سؤال ۱ از ۱۰')});})()"
click_by_label "انصراف از تمرین واژه"; sleep 1.5
probe "(()=>{const t=document.body.innerText||'';return JSON.stringify({tablesBack:t.includes('خانوادهٔ واژه‌ها از خودِ جزوه‌ها'),drillGone:!t.includes('سؤال')});})()"

echo "########## E) پرسشِ واژه در تمِ تاریک ##########" | tee -a "$OUT"
qa_to_dark
click_by_label "شروع تمرین خانوادهٔ واژه‌ها"; sleep 1.5
click_by_label "شروع جلسهٔ تمرین واژه"; sleep 1.5
probe "(()=>{const t=document.body.innerText||'';return JSON.stringify({q1:t.includes('سؤال ۱ از ۱۰'),dark:document.documentElement.classList.contains('dark')});})()"
qa_shot r403-word-question-dark.png

agent-browser close >/dev/null 2>&1 || true
echo "########## R403-WITNESS-DONE ##########" | tee -a "$OUT"
