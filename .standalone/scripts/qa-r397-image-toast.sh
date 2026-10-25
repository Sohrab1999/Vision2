#!/usr/bin/env bash
# ------------------------------------------------------------------
# r397 — «توستِ شکستِ ساختِ تصویر مالکِ نامدار یافت» — دومین مصرفکنندهٔ
#   qa-lib.sh و داوریِ زندهٔ سه حکمِ راند:
#   ① مالکِ imageFailToast (result-image.ts): توستِ «خطا در ساخت تصویر»
#     زیرِ تزریقِ toBlob→null از دو وامگیرندهٔ مهاجرتشده زنده میسوزد
#     (هفته‌نامه + رسمی) — متنِ بایتمسانِ همان جفتِ r342.
#   ② درگاهِ رسمی درمان شد: رویدادِ official_image فقط با ساختِ واقعیِ
#     کارت — رکوردگرِ /api/event: کلیکِ سالم → official=۱، کلیکِ ناکام
#     (toBlob→null) → official همچنان ۱ (کدِ کهنه پیش از ساخت میآتشاند
#     و ۲ میشد — تفاوتِ رفتاریِ درمان).
#   ③ negctlِ سالمِ دو دروازه: بازگردانیِ toBlob → توستِ موفقیتِ گویشِ
#     خودِ هر دروازه + رکوردگرِ createObjectURL (دانلودِ واقعی).
#   الگوها: گاردِ seed (r338) · کلیک+کاوشِ اتمیک (r343) · SCENE-CLEAR
#   (r395) · تاریکِ درجا (r336) · تک سشن رویِ buildِ راند.
#   استابِ toBlob سمتِ میزبان است — سناریویِ راند به کتابخانه نمیرود
#   (حکمِ ②ِ qa-lib: سناریو سمتِ میزبان میماند).
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
OUT=/tmp/r397-image-toast.txt
QA_SEED_FILE=/tmp/r397-seed-eval.js
QA_REC=__qarec
: > "$OUT"

# کتابخانهٔ QA (r396) — دومین مصرفکننده (سرشماریِ مصرفکنندهِ r396 بهروز شد)
source /home/z/my-project/scripts/qa-lib.sh

echo "########## A) خانه — seed + روشنِ ۱۲۸۰ + رکوردگرِ /api/event" | tee -a "$OUT"
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

# رکوردگرها (میزبان-سایت — سناریویِ راند). درسِ همین اجرا: revive کلِ window را
# میشوید (r395) — پسِ هر ensure_alive باید دوباره نصب شوند.
install_recorders(){
# شمارشِ POSTهایِ /api/event با نامِ official_image
agent-browser eval "(()=>{if(window.__r397stats)return 'rec-already';window.__r397stats={official:0};const of=window.fetch;window.__r397of=of;window.fetch=function(...a){try{const u=(typeof a[0]==='string')?a[0]:(a[0]&&a[0].url)||'';const b=a[1]&&a[1].body;if(u.includes('/api/event')&&typeof b==='string'&&b.includes('official_image'))window.__r397stats.official++;}catch(e){}return of.apply(this,a);};return 'rec-on';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"
# شمارشِ createObjectURL (هر کارتِ موفق یکی)
agent-browser eval "(()=>{if(window.__r397dl!==undefined)return 'dl-already';window.__r397dl=0;const oc=URL.createObjectURL;window.__r397oc=oc;URL.createObjectURL=function(b){window.__r397dl++;return oc.call(URL,b);};return 'dl-on';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"
}
install_recorders

echo "########## B) گزارشِ هفته‌نامه — کلیکِ سالم → توستِ موفقیتِ گویشِ دروازه + dl" | tee -a "$OUT"
qa_ensure_alive || { agent-browser close >/dev/null 2>&1; exit 1; }
install_recorders
agent-browser eval "(()=>{const t=[...document.querySelectorAll('button')].find((x)=>(x.innerText||'').replace(/\s+/g,' ').trim().startsWith('کارنامهٔ من')&&x.getBoundingClientRect().width>0);if(!t)return 'NO-TOOL';t.click();return 'report-opening';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"
sleep 2.5
qa_click_toast_q "'[aria-label=\"گرفتن عکس هفته‌نامهٔ پیشرفت\"]'" 0 'عکسِ هفته‌نامه ذخیره شد'
sleep 1
agent-browser eval "(()=>JSON.stringify({dl:window.__r397dl,official:window.__r397stats.official}))()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"
qa_shot r397-weekly-success-light.png

echo "########## C) تزریقِ toBlob→null — شکستِ هفته‌نامه از مالک + dl بیافزایش" | tee -a "$OUT"
qa_wait_toasts_clear
agent-browser eval "(()=>{if(window.__r397blob)return 'blob-stub-already';window.__r397blob=HTMLCanvasElement.prototype.toBlob;HTMLCanvasElement.prototype.toBlob=function(cb){cb(null);};return 'blob-null-on';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"
qa_click_toast_q "'[aria-label=\"گرفتن عکس هفته‌نامهٔ پیشرفت\"]'" 0 'خطا در ساخت تصویر'
agent-browser eval "(()=>JSON.stringify({dl:window.__r397dl}))()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"
qa_shot r397-weekly-fail-light.png

echo "########## D) کارنامهٔ رسمی — کلیکِ سالم → توستِ گویشِ خود + رویدادِ gated (official=۱)" | tee -a "$OUT"
qa_wait_toasts_clear
agent-browser eval "(()=>{if(window.__r397blob){HTMLCanvasElement.prototype.toBlob=window.__r397blob;delete window.__r397blob;}return 'blob-restored';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"
agent-browser eval "(()=>{const b=document.querySelector('[aria-label=\"گزارش رسمی چاپی برای معلم\"]');if(!b)return 'NO-OFFICIAL-BTN';b.click();return 'official-opening';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"
sleep 2.5
qa_click_toast_q "'[aria-label=\"گرفتن عکس کارنامهٔ رسمی\"]'" 0 'عکسِ کارنامه ذخیره شد'
sleep 1
agent-browser eval "(()=>JSON.stringify({official:window.__r397stats.official,dl:window.__r397dl}))()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"
qa_shot r397-official-success-light.png

echo "########## E) کارنامهٔ رسمیِ ناکام — مالک میسوزد، رویداد هرگز نمیآید (official=۱ میماند)" | tee -a "$OUT"
qa_wait_toasts_clear
agent-browser eval "(()=>{if(!window.__r397blob){window.__r397blob=HTMLCanvasElement.prototype.toBlob;HTMLCanvasElement.prototype.toBlob=function(cb){cb(null);};}return 'blob-null-on';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"
qa_click_toast_q "'[aria-label=\"گرفتن عکس کارنامهٔ رسمی\"]'" 0 'خطا در ساخت تصویر'
agent-browser eval "(()=>JSON.stringify({official:window.__r397stats.official,dl:window.__r397dl}))()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"
qa_shot r397-official-fail-light.png

echo "########## F) تمِ تاریک — توستِ مالک در تاریکی + شناسنامهٔ رنگ" | tee -a "$OUT"
qa_wait_toasts_clear
qa_to_dark
qa_click_toast_q "'[aria-label=\"گرفتن عکس کارنامهٔ رسمی\"]'" 0 'خطا در ساخت تصویر'
qa_toast_identity
qa_shot r397-official-fail-dark.png

echo "########## G) بازگردانی + بهداشت" | tee -a "$OUT"
agent-browser eval "(()=>{if(window.__r397blob){HTMLCanvasElement.prototype.toBlob=window.__r397blob;delete window.__r397blob;}if(window.__r397of){window.fetch=window.__r397of;}if(window.__r397oc){URL.createObjectURL=window.__r397oc;}return 'restored';})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"
qa_wait_toasts_clear
qa_to_light
agent-browser eval "(()=>{try{localStorage.clear();sessionStorage.clear();return 'state-cleared';}catch(e){return 'clear-fail';}})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"
agent-browser close >/dev/null 2>&1
curl -s -o /dev/null -w "APP=%{http_code}\n" --max-time 10 "$BASE" | tee -a "$OUT"
curl -s -o /dev/null -w "JUDGE=%{http_code}\n" --max-time 10 http://127.0.0.1:3003 | tee -a "$OUT"
echo "R397-QA-DONE" | tee -a "$OUT"
