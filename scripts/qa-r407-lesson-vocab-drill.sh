#!/usr/bin/env bash
# ------------------------------------------------------------------
# r407 — «دریل واژگان درس» — دوازدهمین مصرفکنندهٔ qa-lib.sh و داوریِ
#   زندهٔ بانکِ ششم رویِ buildِ راند (تک سشن):
#   ① ورود: خانه → کارتِ درس ۱ («ورود به درس») → تبِ واژگان → دکمهٔ
#     «تمرین واژه‌ها» کنارِ فلش‌کارت — جست‌وجو و فیلترها پابرجا.
#   ② معرفیِ صادق از برنامهٔ قطعیِ موتور: ۱۰ پرسش از ۲۰۴ واژه، سه گونه.
#   ③ جلسهٔ کامل: چرخشِ سهگونه witnessed (fa/en/pos)؛ پاسخهایِ بانکمحور
#     با نقشهٔ تزریقشدهٔ یکجا (درسِ r401-⑤) — نقشه از خودِ TS با bun
#     ساخته میشود، نه regex (تکمنبعیِ مطلق — درسِ r406)؛ بعدش کور →
#     نتیجهٔ صادق + «مرور اشتباهها».
#   ④ مرور: همان سؤالها؛ همهٔ پاسخها بانکمحور → «نتیجهٔ مرور» صادق ۱۰۰٪.
#   ⑤ «تمرین دوباره» → تازه؛ «انصراف از تمرین واژگان» → جست‌وجو (drillGone).
#   ⑥ پرسشِ واژه در تمِ تاریک با چیپهای kbd.
#   درسِ revive: هر بخش ناوبریِ idempotent خودش را دارد.
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
OUT=/tmp/r407-witness.txt
QA_SEED_FILE=/tmp/r407-seed-eval.js
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

echo "########## B) درس ۱ → تب واژگان → دکمهٔ «تمرین واژه‌ها» ##########" | tee -a "$OUT"
click_by_label "ورود به درس"; sleep 2.5
probe "(()=>{const t=document.body.innerText||'';return JSON.stringify({lesson:t.includes('فهمیدن مردم')||t.includes('فهمیدن مردم'),vocabTab:!!document.querySelector('[aria-label=\"شروع تمرین واژگان درس\"]'),search:!!document.querySelector('input[placeholder*=\"جستجو\"],input')});})()"
qa_shot r407-vocab-entry-light.png
click_by_label "شروع تمرین واژگان درس"; sleep 1.5
probe "(()=>{const t=document.body.innerText||'';return JSON.stringify({intro:t.includes('تمرین واژگانِ «فهمیدن مردم»'),intro204:t.includes('از ۲۰۴ واژهٔ «فهمیدن مردم»'),introKinds:t.includes('معنی، واژه، نقش کلامی'),startBtn:!!document.querySelector('[aria-label=\"شروع جلسهٔ تمرین واژگان درس\"]'),searchGone:!document.querySelector('input[placeholder]')});})()"
click_by_label "شروع جلسهٔ تمرین واژگان درس"; sleep 1.5

echo "########## C) نقشهٔ بانک از خودِ TS (bun — تکمنبعی) + تزریقِ یکجا ##########" | tee -a "$OUT"
bun -e '
import { lessons } from "/home/z/my-project/src/data/index.ts";
import { posLabel } from "/home/z/my-project/src/lib/study-theme.ts";
import { writeFileSync } from "node:fs";
const vocab = lessons[0].vocabulary; // درس ۱ — همان درسی که شاهد واردش میشود
const enFas = new Map(), faEns = new Map();
for (const w of vocab) {
  if (!enFas.has(w.en)) enFas.set(w.en, new Set());
  enFas.get(w.en).add(w.fa);
  if (!faEns.has(w.fa)) faEns.set(w.fa, new Set());
  faEns.get(w.fa).add(w.en);
}
const faOf = {}, enOf = {}, posOf = {};
for (const w of vocab) {
  if (enFas.get(w.en).size === 1) faOf[w.en] = w.fa;   // گونهٔ معنی — enِ یکترجمه
  if (faEns.get(w.fa).size === 1) enOf[w.fa] = w.en;   // گونهٔ واژه — faِ یکEN
  if (w.pos) posOf[w.en] = posLabel[w.pos];            // گونهٔ نقش — از مالکِ برچسب
}
writeFileSync("/tmp/r407-lv-map.json", JSON.stringify({ faOf, enOf, posOf }));
console.log("MAP-LV:" + vocab.length + " faOf:" + Object.keys(faOf).length + " enOf:" + Object.keys(enOf).length + " posOf:" + Object.keys(posOf).length);
' 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"
agent-browser eval "window.__lvMap=$(cat /tmp/r407-lv-map.json);'MAP-IN'" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"
ANSWER_EVAL='(()=>{const m=window.__lvMap;if(!m)return "NO-MAP";const h=[...document.querySelectorAll("h3")].find(x=>x.getBoundingClientRect().width>0);if(!h)return "NO-H3";const p=(h.textContent)||"";const chip=h.querySelector(".en-text");const c=(chip&&chip.textContent)||"";let want=null;if(p.includes("کدام واژه معنیِ")){const f1=p.match(/«([^»]+)»/);if(f1)want=m.enOf[f1[1]];}else if(p.includes("نقشِ کلامیِ"))want=m.posOf[c];else if(p.includes("معنیِ"))want=m.faOf[c];if(!want)return "NO-WANT:"+p.slice(0,24);const b=[...document.querySelectorAll("button")].find((x)=>{const l=(x.getAttribute("aria-label")||"").replace(/^گزینه [۱-۴]: /,"").replace(/ — پاسخ درست$/,"");return /^گزینه [۱-۴]: /.test(x.getAttribute("aria-label")||"")&&l===want&&x.getBoundingClientRect().width>0&&!x.disabled;});if(!b)return "OPT-MISS:"+want.slice(0,24);b.click();return "LV-ANSWERED["+want.slice(0,18)+"]";})()'

echo "########## D) جلسهٔ ۱۰تایی: چرخشِ سهگونه + ۵ پاسخِ بانکمحور ##########" | tee -a "$OUT"
for i in $(seq 1 10); do
  P=$(prompt_now)
  KIND="other"
  if echo "$P" | grep -q "کدام واژه معنیِ"; then KIND="en"; elif echo "$P" | grep -q "نقشِ کلامیِ"; then KIND="pos"; elif echo "$P" | grep -q "معنیِ"; then KIND="fa"; fi
  echo "Q${i}:KIND=${KIND}" | tee -a "$OUT"
  if [ "$i" -le 5 ]; then
    RES=$(agent-browser eval "$ANSWER_EVAL" 2>&1)
    echo "$RES" | tee -a "$OUT"; echo | tee -a "$OUT"
    case "$RES" in *LV-ANSWERED*) ;; *) answer_first ;; esac
  else
    answer_first >/dev/null 2>&1
  fi
  sleep 0.4
  click_next >/dev/null 2>&1
  sleep 0.4
done
probe "(()=>{const sec=[...document.querySelectorAll('section')].find(s=>{const x=s.innerText||'';return x.includes('نتیجهٔ تمرین')||x.includes('نتیجهٔ مرور')});if(!sec)return 'NO-RESULT-SEC';const t=sec.innerText||'';const sc=(t.match(/[۰-۹]+٪/)||[])[0];const rows=[...sec.querySelectorAll('[aria-label=\"بازخوانی سؤال‌های تمرین\"] li')];const rv=(t.match(/مرور اشتباهها \(([۰-۹]+)\)/)||[])[1]||'0';return JSON.stringify({result:true,score:sc,rows:rows.length,replayN:rv});})()"
qa_shot r407-vocab-result-light.png

echo "########## E) مرورِ اشتباهها: همان سؤالها، همهٔ پاسخِ بانکمحور ##########" | tee -a "$OUT"
click_by_label "مرور اشتباههای تمرین"; sleep 1.5
probe "(()=>{const t=document.body.innerText||'';return JSON.stringify({replayStart:t.includes('سؤال ۱ از')});})()"
for i in $(seq 1 14); do
  if agent-browser eval "document.body.innerText.includes('نتیجهٔ مرور')" 2>/dev/null | grep -q true; then echo "REPLAY-RESULT-AT-Q${i}" | tee -a "$OUT"; echo | tee -a "$OUT"; break; fi
  RES=$(agent-browser eval "$ANSWER_EVAL" 2>&1)
  echo "R${i}:${RES}" | tee -a "$OUT"; echo | tee -a "$OUT"
  case "$RES" in *LV-ANSWERED*) ;; *) answer_first >/dev/null 2>&1 ;; esac
  sleep 0.3
  click_next >/dev/null 2>&1
  sleep 0.3
done
probe "(()=>{const sec=[...document.querySelectorAll('section')].find(s=>{const x=s.innerText||'';return x.includes('نتیجهٔ تمرین')||x.includes('نتیجهٔ مرور')});if(!sec)return 'NO-RESULT-SEC';const t=sec.innerText||'';const sc=(t.match(/[۰-۹]+٪/)||[])[0];return JSON.stringify({replayHeader:t.includes('نتیجهٔ مرور'),score:sc,againBtn:!!document.querySelector('[aria-label=\"تمرین دوباره\"]')});})()"

echo "########## F) تمرین دوباره → تازه؛ خروجِ سالم ##########" | tee -a "$OUT"
click_by_label "تمرین دوباره"; sleep 1.5
probe "(()=>{const t=document.body.innerText||'';return JSON.stringify({fresh10:t.includes('سؤال ۱ از ۱۰')});})()"
click_by_label "انصراف از تمرین واژگان"; sleep 1.5
probe "(()=>{const t=document.body.innerText||'';return JSON.stringify({searchBack:!!document.querySelector('input[placeholder]'),entryBack:!!document.querySelector('[aria-label=\"شروع تمرین واژگان درس\"]'),flashBack:t.includes('حالت فلش‌کارت'),drillGone:!t.includes('سؤال')});})()"

echo "########## G) پرسشِ واژه در تمِ تاریک ##########" | tee -a "$OUT"
qa_to_dark
click_by_label "شروع تمرین واژگان درس"; sleep 1.5
click_by_label "شروع جلسهٔ تمرین واژگان درس"; sleep 1.5
probe "(()=>{const t=document.body.innerText||'';const chips=[...document.querySelectorAll('[role=\"group\"] span[aria-hidden]')].filter((el)=>el.className.includes('font-mono')).map((c)=>c.textContent);return JSON.stringify({q1:t.includes('سؤال ۱ از ۱۰'),dark:document.documentElement.classList.contains('dark'),chips});})()"
qa_shot r407-vocab-question-dark.png

agent-browser close >/dev/null 2>&1 || true
echo "########## R407-WITNESS-DONE ##########" | tee -a "$OUT"
