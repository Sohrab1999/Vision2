#!/usr/bin/env bash
# ------------------------------------------------------------------
# r406 — «دریل مثالهای درسنامهٔ جامع» — یازدهمین مصرفکنندهٔ qa-lib.sh و
#   داوریِ زندهٔ بانکِ پنجم رویِ buildِ راند (تک سشن):
#   ① ورود: ضمیمه → زیرتابِ پیشفرضِ «درسنامهٔ جامع» → دکمهٔ «تمرین مثال‌ها»
#     در سرصفحه — آکاردئون پابرجا؛ معرفیِ صادقِ ۲۰۵ مثال/۳۲ درسنامه
#     (ترجمه/جملهٔ انگلیسی/تشخیصِ موضوع).
#   ② جلسهٔ کامل: چرخشِ سهگونه witnessed (fa/ex/topic)؛ چهار پاسخِ درستِ
#     بانکمحور با نقشهٔ تزریقشدهٔ یکجا (درسِ r401-⑤) — نقشه از خودِ TS
#     با bun ساخته میشود، نه regex (تکمنبعیِ مطلق)؛ بعدش کور → نتیجهٔ صادق.
#   ③ مرور: همان سؤالها؛ همهٔ پاسخها بانکمحور → «نتیجهٔ مرور» صادق با ۱۰۰٪.
#   ④ «تمرین دوباره» → تازه؛ «انصراف از تمرین مثال» → آکاردئون (drillGone).
#   درسِ revive: هر بخش ناوبریِ idempotent خودش را دارد.
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
OUT=/tmp/r406-witness.txt
QA_SEED_FILE=/tmp/r406-seed-eval.js
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

echo "########## B) ضمیمه → درسنامهٔ جامع → دکمهٔ «تمرین مثال‌ها» ##########" | tee -a "$OUT"
click_by_label "ضمیمه"; sleep 2.5
click_by_label "درسنامهٔ جامع"; sleep 1.5
probe "(()=>{const t=document.body.innerText||'';return JSON.stringify({accordion:t.includes('بازکردن همه')&&t.includes('فهرست پرش'),entry:!!document.querySelector('[aria-label=\"شروع تمرین مثال‌های درسنامه\"]'),topics:t.includes('۳۲ موضوع')});})()"
qa_shot r406-bg-entry-light.png
click_by_label "شروع تمرین مثال‌های درسنامه"; sleep 1.5
probe "(()=>{const t=document.body.innerText||'';return JSON.stringify({intro:t.includes('تمرین مثال‌های درسنامهٔ جامع'),intro205:t.includes('از ۲۰۵ مثال'),intro32:t.includes('۳۲ درسنامه'),introKinds:t.includes('ترجمه، یافتنِ جملهٔ انگلیسی و تشخیصِ موضوع'),startBtn:!!document.querySelector('[aria-label=\"شروع جلسهٔ تمرین مثال\"]'),accordionGone:!t.includes('بازکردن همه')});})()"
click_by_label "شروع جلسهٔ تمرین مثال"; sleep 1.5

echo "########## C) نقشهٔ بانک از خودِ TS (bun — تکمنبعی) + تزریقِ یکجا ##########" | tee -a "$OUT"
bun -e '
import { BOOKLET_GRAMMAR_TOPICS } from "/home/z/my-project/src/data/booklet-grammar";
import { writeFileSync } from "node:fs";
const bank = [];
for (const t of BOOKLET_GRAMMAR_TOPICS) for (const e of (t.examples ?? [])) bank.push({ en: e.en, fa: e.fa, title: t.title });
const faOf = {}, enOf = {}, titleOf = {};
const enFas = new Map(), faEns = new Map(), enCnt = new Map();
for (const it of bank) {
  if (!enFas.has(it.en)) enFas.set(it.en, new Set());
  enFas.get(it.en).add(it.fa);
  if (!faEns.has(it.fa)) faEns.set(it.fa, new Set());
  faEns.get(it.fa).add(it.en);
  enCnt.set(it.en, (enCnt.get(it.en) ?? 0) + 1);
}
for (const it of bank) {
  if (enFas.get(it.en).size === 1) faOf[it.en] = it.fa;      // گونهٔ ترجمه — enِ یکترجمه
  if (faEns.get(it.fa).size === 1) enOf[it.fa] = it.en;      // گونهٔ جمله — faِ یکEN
  if (enCnt.get(it.en) === 1) titleOf[it.en] = it.title;     // گونهٔ موضوع — enِ یکتا
}
writeFileSync("/tmp/r406-bg-map.json", JSON.stringify({ faOf, enOf, titleOf }));
console.log("MAP-BG:" + bank.length + " faOf:" + Object.keys(faOf).length + " enOf:" + Object.keys(enOf).length + " titleOf:" + Object.keys(titleOf).length);
' 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"
agent-browser eval "window.__bgMap=$(cat /tmp/r406-bg-map.json);'MAP-IN'" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"
ANSWER_EVAL='(()=>{const m=window.__bgMap;if(!m)return "NO-MAP";const h=[...document.querySelectorAll("h3")].find(x=>x.getBoundingClientRect().width>0);if(!h)return "NO-H3";const p=(h.textContent)||"";const chip=h.querySelector(".en-text");const c=(chip&&chip.textContent)||"";let want=null;if(p.includes("ترجمهٔ این جملهٔ"))want=m.faOf[c];else if(p.includes("کدام جمله معنیِ")){const f1=p.match(/«([^»]+)»/);if(f1)want=m.enOf[f1[1]];}else if(p.includes("از درسنامهٔ کدام موضوع"))want=m.titleOf[c];if(!want)return "NO-WANT:"+p.slice(0,24);const b=[...document.querySelectorAll("button")].find((x)=>{const l=(x.getAttribute("aria-label")||"").replace(/^گزینه [۱-۴]: /,"").replace(/ — پاسخ درست$/,"");return /^گزینه [۱-۴]: /.test(x.getAttribute("aria-label")||"")&&l===want&&x.getBoundingClientRect().width>0&&!x.disabled;});if(!b)return "OPT-MISS:"+want.slice(0,24);b.click();return "BG-ANSWERED["+want.slice(0,18)+"]";})()'

echo "########## D) جلسهٔ ۱۰تایی: چرخشِ سهگونه + ۴ پاسخِ بانکمحور ##########" | tee -a "$OUT"
for i in $(seq 1 10); do
  P=$(prompt_now)
  KIND="other"
  if echo "$P" | grep -q "ترجمهٔ این جملهٔ"; then KIND="fa"; elif echo "$P" | grep -q "کدام جمله معنیِ"; then KIND="ex"; elif echo "$P" | grep -q "از درسنامهٔ کدام موضوع"; then KIND="topic"; fi
  echo "Q${i}:KIND=${KIND}" | tee -a "$OUT"
  if [ "$i" -le 4 ]; then
    RES=$(agent-browser eval "$ANSWER_EVAL" 2>&1)
    echo "$RES" | tee -a "$OUT"; echo | tee -a "$OUT"
    case "$RES" in *BG-ANSWERED*) ;; *) answer_first ;; esac
  else
    answer_first
  fi
  sleep 0.4
  click_next
  sleep 0.4
done
probe "(()=>{const t=document.body.innerText||'';const sc=(t.match(/[۰-۹]+٪/)||[])[0];const rows=[...document.querySelectorAll('[aria-label=\"بازخوانی سؤال‌های تمرین\"] li')];const rv=(t.match(/مرور اشتباهها \(([۰-۹]+)\)/)||[])[1]||'0';return JSON.stringify({result:t.includes('نتیجهٔ تمرین'),score:sc,rows:rows.length,replayN:rv});})()"
qa_shot r406-bg-result-light.png

echo "########## E) مرورِ اشتباهها: همان سؤالها، همهٔ پاسخِ بانکمحور ##########" | tee -a "$OUT"
click_by_label "مرور اشتباههای تمرین"; sleep 1.5
probe "(()=>{const t=document.body.innerText||'';return JSON.stringify({replayStart:t.includes('سؤال ۱ از')});})()"
for i in $(seq 1 14); do
  if agent-browser eval "document.body.innerText.includes('نتیجهٔ مرور')" 2>/dev/null | grep -q true; then echo "REPLAY-RESULT-AT-Q${i}" | tee -a "$OUT"; echo | tee -a "$OUT"; break; fi
  RES=$(agent-browser eval "$ANSWER_EVAL" 2>&1)
  echo "R${i}:${RES}" | tee -a "$OUT"; echo | tee -a "$OUT"
  case "$RES" in *BG-ANSWERED*) ;; *) answer_first >/dev/null 2>&1 ;; esac
  sleep 0.3
  click_next
  sleep 0.3
done
probe "(()=>{const t=document.body.innerText||'';const sc=(t.match(/[۰-۹]+٪/)||[])[0];return JSON.stringify({replayHeader:t.includes('نتیجهٔ مرور'),score:sc,againBtn:!!document.querySelector('[aria-label=\"تمرین دوباره\"]')});})()"

echo "########## F) تمرین دوباره → تازه؛ خروجِ سالم ##########" | tee -a "$OUT"
click_by_label "تمرین دوباره"; sleep 1.5
probe "(()=>{const t=document.body.innerText||'';return JSON.stringify({fresh10:t.includes('سؤال ۱ از ۱۰')});})()"
click_by_label "انصراف از تمرین مثال"; sleep 1.5
probe "(()=>{const t=document.body.innerText||'';return JSON.stringify({accordionBack:t.includes('بازکردن همه'),entryBack:!!document.querySelector('[aria-label=\"شروع تمرین مثال‌های درسنامه\"]'),drillGone:!t.includes('سؤال')});})()"

echo "########## G) پرسشِ درسنامه در تمِ تاریک ##########" | tee -a "$OUT"
qa_to_dark
click_by_label "شروع تمرین مثال‌های درسنامه"; sleep 1.5
click_by_label "شروع جلسهٔ تمرین مثال"; sleep 1.5
probe "(()=>{const t=document.body.innerText||'';const chips=[...document.querySelectorAll('[role=\"group\"] span[aria-hidden]')].filter((el)=>el.className.includes('font-mono')).map((c)=>c.textContent);return JSON.stringify({q1:t.includes('سؤال ۱ از ۱۰'),dark:document.documentElement.classList.contains('dark'),chips});})()"
qa_shot r406-bg-question-dark.png

agent-browser close >/dev/null 2>&1 || true
echo "########## R406-WITNESS-DONE ##########" | tee -a "$OUT"
