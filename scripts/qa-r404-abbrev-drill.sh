#!/usr/bin/env bash
# ------------------------------------------------------------------
# r404 — «دریلِ نشانه‌های اختصاری» — نهمین مصرفکنندهٔ qa-lib.sh و داوریِ
#   زندهٔ بانکِ سوم رویِ buildِ راند (تک سشن):
#   ① ورود: ضمیمه → «نشانه‌های اختصاری» → دکمهٔ «تمرین» بالای کارت‌ها —
#     جدول پابرجا؛ معرفیِ صادقِ ۱۳ نشانه (معنی/شکلِ کامل/نشانهٔ معکوس).
#   ② جلسهٔ کامل: چرخشِ سهگونه witnessed (fa/full/sym/fa/...)؛ چهار پاسخِ
#     درستِ بانکمحور با نقشهٔ تزریقشده (fa و full و symOfFull)؛ بعدش کور
#     → نتیجهٔ صادق + «مرور اشتباهها (n)».
#   ③ مرور: همان سؤالها؛ همهٔ پاسخها بانکمحور → «نتیجهٔ مرور» صادق.
#   ④ «تمرین دوباره» → تازه؛ «انصراف از تمرین نشانه» → کارت‌ها (drillGone).
#   درسِ revive: هر بخش ناوبریِ idempotent خودش را دارد.
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
OUT=/tmp/r404-witness.txt
QA_SEED_FILE=/tmp/r404-seed-eval.js
: > "$OUT"

source /home/z/my-project/scripts/qa-lib.sh

click_by_label(){ agent-browser eval "(()=>{let b=document.querySelector('[aria-label=\"$1\"]');if(!b||b.getBoundingClientRect().width===0){b=[...document.querySelectorAll('button')].find((x)=>(x.innerText||'').replace(/\s+/g,' ').trim()==='$1'&&x.getBoundingClientRect().width>0);}if(!b)return 'NO-BTN:$1';b.click();return 'CLICKED:$1';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
probe(){ agent-browser eval "$1" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
answer_first(){ agent-browser eval "(()=>{const b=[...document.querySelectorAll('button')].find((x)=>/^گزینه [۱-۴]: /.test(x.getAttribute('aria-label')||'')&&x.getBoundingClientRect().width>0&&!x.disabled);if(!b)return 'NO-OPT';b.click();return 'ANSWERED-BLIND';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
click_next(){ agent-browser eval "(()=>{const b=[...document.querySelectorAll('button')].find((x)=>['سؤال بعدی','دیدن نتیجهٔ تمرین'].includes(x.getAttribute('aria-label')||'')&&x.getBoundingClientRect().width>0&&!x.disabled);if(!b)return 'NO-NEXT';const lbl=b.getAttribute('aria-label');b.click();return 'NEXT:'+lbl;})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
prompt_now(){ agent-browser eval "(()=>{const h=[...document.querySelectorAll('h3')].find(x=>x.getBoundingClientRect().width>0);return JSON.stringify({p:(h&&h.innerText)||''});})()" 2>/dev/null | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{try{console.log(JSON.parse(JSON.parse(s)).p)}catch(e){console.log('')}})"; }

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

echo "########## B) ضمیمه → نشانه‌های اختصاری → دکمهٔ «تمرین» ##########" | tee -a "$OUT"
click_by_label "ضمیمه"; sleep 2.5
click_by_label "نشانه‌های اختصاری"; sleep 2.5
probe "(()=>{const t=document.body.innerText||'';return JSON.stringify({cards:t.includes('۱۳ نشانه'),entry:!!document.querySelector('[aria-label=\"شروع تمرین نشانه‌های اختصاری\"]'),search:!!document.querySelector('[aria-label=\"جست‌وجو در نشانه‌های اختصاری\"]')});})()"
click_by_label "شروع تمرین نشانه‌های اختصاری"; sleep 1.5
probe "(()=>{const t=document.body.innerText||'';return JSON.stringify({intro:t.includes('تمرین نشانه‌های اختصاری'),intro13:t.includes('از ۱۳ نشانه'),introKinds:t.includes('معنی، شکلِ کامل و نشانهٔ معکوس'),startBtn:!!document.querySelector('[aria-label=\"شروع جلسهٔ تمرین نشانه\"]')});})()"
qa_shot r404-abbrev-intro-light.png
click_by_label "شروع جلسهٔ تمرین نشانه"; sleep 1.5

echo "########## C) نقشهٔ بانک + تزریقِ یکجا (درسِ r401-⑤) ##########" | tee -a "$OUT"
node -e '
const fs=require("fs");
const src=fs.readFileSync("/home/z/my-project/src/data/appendix.ts","utf8");
const re=/\{\s*sym:\s*"([^"]*)",\s*full:\s*"([^"]*)",\s*fa:\s*"([^"]*)"\s*\}/g;
const fa={},full={},symOfFull={};let m,n=0;
while((m=re.exec(src))){fa[m[1]]=m[3];full[m[1]]=m[2];symOfFull[m[2]]=m[1];n++;}
fs.writeFileSync("/tmp/r404-abbrev-map.json",JSON.stringify({fa,full,symOfFull}));
console.log("MAP-SIGNS:"+n);
' 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"
agent-browser eval "window.__abbrMap=$(cat /tmp/r404-abbrev-map.json);'MAP-IN'" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"
ANSWER_EVAL='(()=>{const m=window.__abbrMap;if(!m)return "NO-MAP";const h=[...document.querySelectorAll("h3")].find(x=>x.getBoundingClientRect().width>0);const p=(h&&h.textContent)||"";const f1=p.match(/«([^»]+)»/);let want=null;if(p.includes("معنیِ نشانهٔ")&&f1)want=m.fa[f1[1]];else if(p.includes("شکلِ کاملِ")&&f1)want=m.full[f1[1]];else if(p.includes("کوتاه میشود")&&f1)want=m.symOfFull[f1[1]];if(!want)return "NO-WANT:"+p.slice(0,30);const b=[...document.querySelectorAll("button")].find((x)=>{const l=(x.getAttribute("aria-label")||"").replace(/^گزینه [۱-۴]: /,"").replace(/ — پاسخ درست$/,"");return /^گزینه [۱-۴]: /.test(x.getAttribute("aria-label")||"")&&l===want&&x.getBoundingClientRect().width>0&&!x.disabled;});if(!b)return "OPT-MISS:"+want;b.click();return "ABBR-ANSWERED["+want+"]";})()'

echo "########## D) جلسهٔ ۱۰تایی: چرخشِ سهگونه + ۴ پاسخِ بانکمحور ##########" | tee -a "$OUT"
for i in $(seq 1 10); do
  P=$(prompt_now)
  KIND="other"
  if echo "$P" | grep -q "^معنیِ نشانهٔ"; then KIND="fa"; elif echo "$P" | grep -q "^شکلِ کاملِ"; then KIND="full"; elif echo "$P" | grep -q "کوتاه میشود"; then KIND="sym"; fi
  echo "Q${i}:KIND=${KIND}" | tee -a "$OUT"
  if [ "$i" -le 4 ]; then
    RES=$(agent-browser eval "$ANSWER_EVAL" 2>&1)
    echo "$RES" | tee -a "$OUT"; echo | tee -a "$OUT"
    case "$RES" in *ABBR-ANSWERED*) ;; *) answer_first ;; esac
  else
    answer_first
  fi
  sleep 0.4
  click_next
  sleep 0.4
done
probe "(()=>{const t=document.body.innerText||'';const sc=(t.match(/[۰-۹]+٪/)||[])[0];const rows=[...document.querySelectorAll('[aria-label=\"بازخوانی سؤال‌های تمرین\"] li')];const rv=(t.match(/مرور اشتباهها \(([۰-۹]+)\)/)||[])[1]||'0';return JSON.stringify({result:t.includes('نتیجهٔ تمرین'),score:sc,rows:rows.length,replayN:rv,symRows:rows.filter((li)=>li.textContent.includes('کوتاه میشود')).length});})()"
qa_shot r404-abbrev-result-light.png

echo "########## E) مرورِ اشتباهها: همان سؤالها، همهٔ پاسخِ بانکمحور ##########" | tee -a "$OUT"
click_by_label "مرور اشتباههای تمرین"; sleep 1.5
probe "(()=>{const t=document.body.innerText||'';return JSON.stringify({replayStart:t.includes('سؤال ۱ از')});})()"
for i in $(seq 1 14); do
  if agent-browser eval "document.body.innerText.includes('نتیجهٔ مرور')" 2>/dev/null | grep -q true; then echo "REPLAY-RESULT-AT-Q${i}" | tee -a "$OUT"; echo | tee -a "$OUT"; break; fi
  RES=$(agent-browser eval "$ANSWER_EVAL" 2>&1)
  echo "R${i}:${RES}" | tee -a "$OUT"; echo | tee -a "$OUT"
  case "$RES" in *ABBR-ANSWERED*) ;; *) answer_first >/dev/null 2>&1 ;; esac
  sleep 0.3
  click_next
  sleep 0.3
done
probe "(()=>{const t=document.body.innerText||'';const sc=(t.match(/[۰-۹]+٪/)||[])[0];return JSON.stringify({replayHeader:t.includes('نتیجهٔ مرور'),score:sc,againBtn:!!document.querySelector('[aria-label=\"تمرین دوباره\"]')});})()"

echo "########## F) تمرین دوباره → تازه؛ خروجِ سالم ##########" | tee -a "$OUT"
click_by_label "تمرین دوباره"; sleep 1.5
probe "(()=>{const t=document.body.innerText||'';return JSON.stringify({fresh10:t.includes('سؤال ۱ از ۱۰')});})()"
click_by_label "انصراف از تمرین نشانه"; sleep 1.5
probe "(()=>{const t=document.body.innerText||'';return JSON.stringify({cardsBack:t.includes('۱۳ نشانه'),searchBack:!!document.querySelector('[aria-label=\"جست‌وجو در نشانه‌های اختصاری\"]'),drillGone:!t.includes('سؤال')});})()"

echo "########## G) پرسشِ نشانه در تمِ تاریک ##########" | tee -a "$OUT"
qa_to_dark
click_by_label "شروع تمرین نشانه‌های اختصاری"; sleep 1.5
click_by_label "شروع جلسهٔ تمرین نشانه"; sleep 1.5
probe "(()=>{const t=document.body.innerText||'';const chips=[...document.querySelectorAll('[role=\"group\"] span[aria-hidden]')].filter((el)=>el.className.includes('font-mono')).map((c)=>c.textContent);return JSON.stringify({q1:t.includes('سؤال ۱ از ۱۰'),dark:document.documentElement.classList.contains('dark'),chips});})()"
qa_shot r404-abbrev-question-dark.png

agent-browser close >/dev/null 2>&1 || true
echo "########## R404-WITNESS-DONE ##########" | tee -a "$OUT"
