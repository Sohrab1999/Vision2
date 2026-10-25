#!/usr/bin/env bash
# ------------------------------------------------------------------
# r398 — «دامنهٔ دانلودِ فایل مالک یافت» — سومین مصرفکنندهٔ qa-lib.sh و
#   داوریِ زندهٔ مالکِ دو-لایهایِ file-download.ts:
#   ① fileFailToast: توستِ «خطا در ساخت فایل» زیرِ تزریقِ
#     URL.createObjectURL→throw (تکنیکِ r343) از دو دروازهٔ مهاجرتشده
#     زنده میسوزد (هفته‌نامه + رسمی) — متنِ بایتمسانِ همان جفت.
#   ② downloadCsvFile (نقاشِ مشترک): negctlِ سالم → توستِ موفقیتِ گویشِ
#     خودِ هر دروازه + رکوردگرِ createObjectURL (دانلودِ واقعی: dl
#     ۱→۲) — دُمِ دستیِ ششماژوله اکنون یک امضاست.
#   ③ شناسنامهٔ تاریکِ توستِ مالک — همان کرنلِ r345.
#   الگوها: گاردِ seed (r338) · کلیک+کاوشِ اتمیک (r343 — selector با
#   نقلقولِ JS، درسِ r397) · SCENE-CLEAR (r395) · نصبِ دوبارهٔ
#   رکوردگرها پسِ revive (r397) · تک سشن رویِ buildِ راند.
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
OUT=/tmp/r398-file-toast.txt
QA_SEED_FILE=/tmp/r398-seed-eval.js
QA_REC=__qarec
: > "$OUT"

source /home/z/my-project/scripts/qa-lib.sh

# رکوردگرِ دانلود (میزبان-سایت): شمارشِ createObjectURL — پسِ revive دوباره نصب میشود (درسِ r397)
install_dl_recorder(){
agent-browser eval "(()=>{if(window.__r398dl!==undefined)return 'dl-already';window.__r398dl=0;const oc=URL.createObjectURL;window.__r398oc=oc;URL.createObjectURL=function(b){window.__r398dl++;return oc.call(URL,b);};return 'dl-on';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"
}
cou_fail_on(){ agent-browser eval "(()=>{if(!window.__origCOU)window.__origCOU=URL.createObjectURL.bind(URL);URL.createObjectURL=function(){throw new TypeError('r398-cou-injected');};return 'cou-fail-on';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
cou_restore(){ agent-browser eval "(()=>{if(window.__origCOU)URL.createObjectURL=window.__origCOU;delete window.__origCOU;return 'cou-restored';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

echo "########## A) خانه — seed + روشنِ ۱۲۸۰ + رکوردگرِ dl" | tee -a "$OUT"
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

echo "########## B) گزارشِ هفته‌نامه — تزریقِ cou→throw → شکست از مالک + dl=0" | tee -a "$OUT"
qa_ensure_alive || { agent-browser close >/dev/null 2>&1; exit 1; }
install_dl_recorder
agent-browser eval "(()=>{const t=[...document.querySelectorAll('button')].find((x)=>(x.innerText||'').replace(/\s+/g,' ').trim().startsWith('کارنامهٔ من')&&x.getBoundingClientRect().width>0);if(!t)return 'NO-TOOL';t.click();return 'report-opening';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"
sleep 2.5
cou_fail_on
qa_click_toast_q "'[aria-label=\"دانلود جدول CSV پیشرفت\"]'" 0 'خطا در ساخت فایل'
agent-browser eval "(()=>JSON.stringify({dl:window.__r398dl}))()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"
qa_shot r398-weekly-csv-fail-light.png

echo "########## C) بازگردانی — همان دکمه → توستِ موفقیتِ گویشِ دروازه + dl=۱ (نقاشِ مشترک، دانلودِ واقعی)" | tee -a "$OUT"
qa_wait_toasts_clear
cou_restore
qa_click_toast_q "'[aria-label=\"دانلود جدول CSV پیشرفت\"]'" 0 'جدول CSV ذخیره شد'
agent-browser eval "(()=>JSON.stringify({dl:window.__r398dl}))()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"
qa_shot r398-weekly-csv-success-light.png

echo "########## D) کارنامهٔ رسمی — پوشش: ماتریسِ همان دو-سرنوشت" | tee -a "$OUT"
qa_wait_toasts_clear
agent-browser eval "(()=>{const b=document.querySelector('[aria-label=\"گزارش رسمی چاپی برای معلم\"]');if(!b)return 'NO-OFFICIAL-BTN';b.click();return 'official-opening';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"
sleep 2.5
cou_fail_on
qa_click_toast_q "'[aria-label=\"دانلود CSV پوشش مهارت‌ها\"]'" 0 'خطا در ساخت فایل'
qa_wait_toasts_clear
cou_restore
qa_click_toast_q "'[aria-label=\"دانلود CSV پوشش مهارت‌ها\"]'" 0 'CSV پوشش ذخیره شد'
agent-browser eval "(()=>JSON.stringify({dl:window.__r398dl}))()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"
qa_shot r398-official-csv-success-light.png

echo "########## E) تمِ تاریک — توستِ مالک در تاریکی + شناسنامهٔ رنگ" | tee -a "$OUT"
qa_wait_toasts_clear
cou_fail_on
qa_to_dark
qa_click_toast_q "'[aria-label=\"دانلود CSV پوشش مهارت‌ها\"]'" 0 'خطا در ساخت فایل'
qa_toast_identity
qa_shot r398-official-csv-fail-dark.png

echo "########## F) بازگردانی + بهداشت" | tee -a "$OUT"
cou_restore
qa_wait_toasts_clear
qa_to_light
agent-browser eval "(()=>{if(window.__r398oc){URL.createObjectURL=window.__r398oc;}try{localStorage.clear();sessionStorage.clear();return 'state-cleared';}catch(e){return 'clear-fail';}})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"
agent-browser close >/dev/null 2>&1
curl -s -o /dev/null -w "APP=%{http_code}\n" --max-time 10 "$BASE" | tee -a "$OUT"
curl -s -o /dev/null -w "JUDGE=%{http_code}\n" --max-time 10 http://127.0.0.1:3003 | tee -a "$OUT"
echo "R398-QA-DONE" | tee -a "$OUT"
