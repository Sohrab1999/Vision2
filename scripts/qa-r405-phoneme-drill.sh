#!/usr/bin/env bash
# ------------------------------------------------------------------
# r405 — «دریلِ جدول تلفظ» — دهمین مصرفکنندهٔ qa-lib.sh و داوریِ زندهٔ
#   بانکِ چهارم رویِ buildِ راند (تک سشن):
#   ① ورود: ضمیمه → «جدول تلفظ (IPA)» → دکمهٔ «تمرین» بالای کارت‌های واک —
#     جدول پابرجا؛ معرفیِ صادقِ ۴۴ واک (توصیف/واژه‌های نمونه/شنیدنِ واک).
#   ② جلسهٔ کامل: چرخشِ سهگونه witnessed؛ چهار پاسخِ درستِ بانکمحور با
#     نقشهٔ تزریقشده (fa و example و symOfExample)؛ بعدش کور → نتیجهٔ صادق.
#   ③ مرور: همان سؤالها؛ همهٔ پاسخها بانکمحور → «نتیجهٔ مرور» صادق.
#   ④ «تمرین دوباره» → تازه؛ «انصراف از تمرین تلفظ» → جدول (drillGone).
#   درسِ revive: هر بخش ناوبریِ idempotent خودش را دارد.
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
OUT=/tmp/r405-witness.txt
QA_SEED_FILE=/tmp/r405-seed-eval.js
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

echo "########## B) ضمیمه → جدول تلفظ → دکمهٔ «تمرین» ##########" | tee -a "$OUT"
click_by_label "ضمیمه"; sleep 2.5
click_by_label "جدول تلفظ (IPA)"; sleep 2.5
probe "(()=>{const t=document.body.innerText||'';return JSON.stringify({cards:t.includes('۴۴ واک')||t.includes('جدول تلفظ'),entry:!!document.querySelector('[aria-label=\"شروع تمرین جدول تلفظ\"]'),search:!!document.querySelector('[aria-label=\"جست‌وجو در جدول تلفظ\"]')});})()"
click_by_label "شروع تمرین جدول تلفظ"; sleep 1.5
probe "(()=>{const t=document.body.innerText||'';return JSON.stringify({intro:t.includes('تمرین جدول تلفظ'),intro44:t.includes('از ۴۴ واک'),introKinds:t.includes('توصیف، واژه‌های نمونه و شنیدنِ واک'),startBtn:!!document.querySelector('[aria-label=\"شروع جلسهٔ تمرین تلفظ\"]')});})()"
qa_shot r405-phoneme-intro-light.png
click_by_label "شروع جلسهٔ تمرین تلفظ"; sleep 1.5

echo "########## C) نقشهٔ بانک + تزریقِ یکجا (درسِ r401-⑤) ##########" | tee -a "$OUT"
node -e '
const fs=require("fs");
const src=fs.readFileSync("/home/z/my-project/src/data/appendix.ts","utf8");
const block=src.slice(src.indexOf("export interface Phoneme"), src.indexOf("export interface Abbreviation"));
const re=/\{\s*symbol:\s*"([^"]*)",\s*example:\s*"([^"]*)",\s*fa:\s*"([^"]*)"\s*\}/g;
const fa={},example={},symOfExample={},exCount={};let m,n=0;
let arr=[];while((m=re.exec(block))){arr.push([m[1],m[2],m[3]]);}
for(const [s,e,f] of arr){exCount[e]=(exCount[e]||0)+1;}
for(const [s,e,f] of arr){fa[s]=f;example[s]=e;if(exCount[e]===1)symOfExample[e]=s;}
fs.writeFileSync("/tmp/r405-phoneme-map.json",JSON.stringify({fa,example,symOfExample}));
console.log("MAP-PHONEMES:"+arr.length+" UNIQUE-EXAMPLES:"+Object.keys(symOfExample).length);
' 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"
agent-browser eval "window.__phMap=$(cat /tmp/r405-phoneme-map.json);'MAP-IN'" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"
ANSWER_EVAL='(()=>{const m=window.__phMap;if(!m)return "NO-MAP";const h=[...document.querySelectorAll("h3")].find(x=>x.getBoundingClientRect().width>0);const p=(h&&h.textContent)||"";const f1=p.match(/«([^»]+)»/);let want=null;if(p.includes("توصیفِ واکِ")&&f1)want=m.fa[f1[1]];else if(p.includes("نمونهٔ واکِ")&&f1)want=m.example[f1[1]];else if(p.includes("شنیده میشود")&&f1)want=m.symOfExample[f1[1]];if(!want)return "NO-WANT:"+p.slice(0,30);const b=[...document.querySelectorAll("button")].find((x)=>{const l=(x.getAttribute("aria-label")||"").replace(/^گزینه [۱-۴]: /,"").replace(/ — پاسخ درست$/,"");return /^گزینه [۱-۴]: /.test(x.getAttribute("aria-label")||"")&&l===want&&x.getBoundingClientRect().width>0&&!x.disabled;});if(!b)return "OPT-MISS:"+want;b.click();return "PH-ANSWERED["+want+"]";})()'

echo "########## D) جلسهٔ ۱۰تایی: چرخشِ سهگونه + ۴ پاسخِ بانکمحور ##########" | tee -a "$OUT"
for i in $(seq 1 10); do
  P=$(prompt_now)
  KIND="other"
  if echo "$P" | grep -q "توصیفِ واکِ"; then KIND="fa"; elif echo "$P" | grep -q "نمونهٔ واکِ"; then KIND="example"; elif echo "$P" | grep -q "شنیده میشود"; then KIND="symbol"; fi
  echo "Q${i}:KIND=${KIND}" | tee -a "$OUT"
  if [ "$i" -le 4 ]; then
    RES=$(agent-browser eval "$ANSWER_EVAL" 2>&1)
    echo "$RES" | tee -a "$OUT"; echo | tee -a "$OUT"
    case "$RES" in *PH-ANSWERED*) ;; *) answer_first ;; esac
  else
    answer_first
  fi
  sleep 0.4
  click_next
  sleep 0.4
done
probe "(()=>{const t=document.body.innerText||'';const sc=(t.match(/[۰-۹]+٪/)||[])[0];const rows=[...document.querySelectorAll('[aria-label=\"بازخوانی سؤال‌های تمرین\"] li')];const rv=(t.match(/مرور اشتباهها \(([۰-۹]+)\)/)||[])[1]||'0';return JSON.stringify({result:t.includes('نتیجهٔ تمرین'),score:sc,rows:rows.length,replayN:rv});})()"
qa_shot r405-phoneme-result-light.png

echo "########## E) مرورِ اشتباهها: همان سؤالها، همهٔ پاسخِ بانکمحور ##########" | tee -a "$OUT"
click_by_label "مرور اشتباههای تمرین"; sleep 1.5
probe "(()=>{const t=document.body.innerText||'';return JSON.stringify({replayStart:t.includes('سؤال ۱ از')});})()"
for i in $(seq 1 14); do
  if agent-browser eval "document.body.innerText.includes('نتیجهٔ مرور')" 2>/dev/null | grep -q true; then echo "REPLAY-RESULT-AT-Q${i}" | tee -a "$OUT"; echo | tee -a "$OUT"; break; fi
  RES=$(agent-browser eval "$ANSWER_EVAL" 2>&1)
  echo "R${i}:${RES}" | tee -a "$OUT"; echo | tee -a "$OUT"
  case "$RES" in *PH-ANSWERED*) ;; *) answer_first >/dev/null 2>&1 ;; esac
  sleep 0.3
  click_next
  sleep 0.3
done
probe "(()=>{const t=document.body.innerText||'';const sc=(t.match(/[۰-۹]+٪/)||[])[0];return JSON.stringify({replayHeader:t.includes('نتیجهٔ مرور'),score:sc,againBtn:!!document.querySelector('[aria-label=\"تمرین دوباره\"]')});})()"

echo "########## F) تمرین دوباره → تازه؛ خروجِ سالم ##########" | tee -a "$OUT"
click_by_label "تمرین دوباره"; sleep 1.5
probe "(()=>{const t=document.body.innerText||'';return JSON.stringify({fresh10:t.includes('سؤال ۱ از ۱۰')});})()"
click_by_label "انصراف از تمرین تلفظ"; sleep 1.5
probe "(()=>{const t=document.body.innerText||'';return JSON.stringify({tableBack:t.includes('جدول تلفظ'),searchBack:!!document.querySelector('[aria-label=\"جست‌وجو در جدول تلفظ\"]'),drillGone:!t.includes('سؤال')});})()"

echo "########## G) پرسشِ تلفظ در تمِ تاریک ##########" | tee -a "$OUT"
qa_to_dark
click_by_label "شروع تمرین جدول تلفظ"; sleep 1.5
click_by_label "شروع جلسهٔ تمرین تلفظ"; sleep 1.5
probe "(()=>{const t=document.body.innerText||'';const chips=[...document.querySelectorAll('[role=\"group\"] span[aria-hidden]')].filter((el)=>el.className.includes('font-mono')).map((c)=>c.textContent);return JSON.stringify({q1:t.includes('سؤال ۱ از ۱۰'),dark:document.documentElement.classList.contains('dark'),chips});})()"
qa_shot r405-phoneme-question-dark.png

agent-browser close >/dev/null 2>&1 || true
echo "########## R405-WITNESS-DONE ##########" | tee -a "$OUT"
