#!/usr/bin/env bash
# ------------------------------------------------------------------
# r399 — «CSV_BOM تکخانه شد» — چهارمین مصرفکنندهٔ qa-lib.sh و داوریِ
#   زندهٔ مهاجرتِ BOM به مالک (file-download.ts):
#   ① شاهدِ بایتیِ نو: رکوردگرِ blob-گیر — URL.createObjectURL بلاب را
#     نگه میدارد و `blob.text()` نخستین نقطهکد را میدهد: 65279 (0xFEFF)
#     باید از هر دو دروازه (هفته‌نامه + رسمی) بیاید — اثباتِ «فقط خانهٔ
#     ثابت عوض شد، مسیرِ بایت دستنخورده» (r384) رویِ خروجیِ واقعی.
#   ② دانلودِ سالم: dl ۰→۱→۲ + توستِ موفقیتِ گویشِ هر دروازه (r398).
#   ③ مسیرِ شکست دستنخورده: تزریقِ cou→throw (r343) → «خطا در ساخت فایل»
#     + dl منجمد + شناسنامهٔ تاریکِ همان کرنلِ r345.
#   الگوها: گاردِ seed (r338) · کلیک+کاوشِ اتمیک (r343 — selector با
#   نقلقولِ JS، درسِ r397) · SCENE-CLEAR (r395) · نصبِ دوبارهٔ
#   رکوردگرها پسِ revive (r397) · تک سشن رویِ buildِ راند.
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
OUT=/tmp/r399-bom-witness.txt
QA_SEED_FILE=/tmp/r399-seed-eval.js
QA_REC=__qarec
: > "$OUT"

source /home/z/my-project/scripts/qa-lib.sh

# رکوردگرِ dl + گیرندهٔ بلاب (میزبان-سایت): پسِ revive دوباره نصب میشود (درسِ r397)
install_dl_recorder(){
agent-browser eval "(()=>{if(window.__r399dl!==undefined)return 'dl-already';window.__r399dl=0;const oc=URL.createObjectURL;window.__r399oc=oc;URL.createObjectURL=function(b){window.__r399dl++;window.__r399blob=b;window.__r399code=0;return oc.call(URL,b);};return 'dl-on';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"
}
bom_probe(){ # سطحِ بایت (درسِ پروبِ r399: blob.text() طبق استانداردِ Encoding، BOMِ ابتدایِ UTF-8 را میبَرد — decodeِ ignoreBOM=false؛ پس پروبِ اول «ت» داد نه BOM. سه بایتِ خام + decodeِ ignoreBOM:true)
agent-browser eval "(()=>{if(!window.__r399blob)return Promise.resolve('NO-BLOB');return window.__r399blob.arrayBuffer().then(buf=>{const u=new Uint8Array(buf);window.__r399bytes=[u[0],u[1],u[2]];window.__r399code=new TextDecoder('utf-8',{ignoreBOM:true}).decode(buf).charCodeAt(0);window.__r399len=u.length;return 'PROBED';});})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"
}
bom_read(){ agent-browser eval "(()=>JSON.stringify({bytes:window.__r399bytes,code:window.__r399code,len:window.__r399len,dl:window.__r399dl}))()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
cou_fail_on(){ agent-browser eval "(()=>{if(!window.__origCOU)window.__origCOU=URL.createObjectURL.bind(URL);URL.createObjectURL=function(){throw new TypeError('r399-cou-injected');};return 'cou-fail-on';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
cou_restore(){ agent-browser eval "(()=>{if(window.__origCOU)URL.createObjectURL=window.__origCOU;delete window.__origCOU;return 'cou-restored';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

echo "########## A) خانه — seed + روشنِ ۱۲۸۰ + رکوردگرِ dl/بلاب" | tee -a "$OUT"
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
install_dl_recorder

echo "########## B) هفته‌نامه — کلیکِ سالم → توستِ گویشِ دروازه + dl=۱ + شاهدِ BOM=65279" | tee -a "$OUT"
qa_ensure_alive || { agent-browser close >/dev/null 2>&1; exit 1; }
install_dl_recorder
agent-browser eval "(()=>{const t=[...document.querySelectorAll('button')].find((x)=>(x.innerText||'').replace(/\s+/g,' ').trim().startsWith('کارنامهٔ من')&&x.getBoundingClientRect().width>0);if(!t)return 'NO-TOOL';t.click();return 'report-opening';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"
sleep 2.5
qa_wait_toasts_clear
qa_click_toast_q "'[aria-label=\"دانلود جدول CSV پیشرفت\"]'" 0 'جدول CSV ذخیره شد'
bom_probe
sleep 1
bom_read
qa_shot r399-weekly-csv-success-light.png

echo "########## C) رسمی — پوشش: نقاشِ همان + BOM دوباره از دروازهٔ دوم" | tee -a "$OUT"
qa_wait_toasts_clear
agent-browser eval "(()=>{const b=document.querySelector('[aria-label=\"گزارش رسمی چاپی برای معلم\"]');if(!b)return 'NO-OFFICIAL-BTN';b.click();return 'official-opening';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"
sleep 2.5
qa_wait_toasts_clear
qa_click_toast_q "'[aria-label=\"دانلود CSV پوشش مهارت‌ها\"]'" 0 'CSV پوشش ذخیره شد'
bom_probe
sleep 1
bom_read
qa_shot r399-official-csv-success-light.png

echo "########## D) مسیرِ شکست دستنخورده — cou→throw → توستِ مالک + dl منجمد در ۲" | tee -a "$OUT"
qa_wait_toasts_clear
cou_fail_on
qa_click_toast_q "'[aria-label=\"دانلود جدول CSV پیشرفت\"]'" 0 'خطا در ساخت فایل'
bom_read
qa_toast_identity
qa_shot r399-weekly-csv-fail-light.png

echo "########## E) تمِ تاریک — توستِ مالک در تاریکی + شناسنامهٔ کرنل" | tee -a "$OUT"
qa_wait_toasts_clear
qa_click_toast_q "'[aria-label=\"دانلود جدول CSV پیشرفت\"]'" 0 'خطا در ساخت فایل'
qa_to_dark
qa_wait_toasts_clear
qa_click_toast_q "'[aria-label=\"دانلود جدول CSV پیشرفت\"]'" 0 'خطا در ساخت فایل'
qa_toast_identity
qa_shot r399-weekly-csv-fail-dark.png
qa_to_light
cou_restore
bom_read

echo "########## نتیجهٔ r399" | tee -a "$OUT"
agent-browser close >/dev/null 2>&1 || true
echo "DONE r399" | tee -a "$OUT"
